import logging
from groq import Groq
from app.core.config import settings
from typing import Dict, Any
import re
from sqlalchemy.orm import Session
from app.core.database import get_db

logger = logging.getLogger(__name__)

# Try to import vector services, but handle gracefully if they fail
try:
    # Temporarily disabled to fix startup issues
    # from app.vector.embedding_service import embed_text
    # from app.vector.chroma_client import search_faqs
    embed_text = lambda x: []
    search_faqs = lambda x, top_k=3: []
    VECTOR_SERVICES_AVAILABLE = False
    logger.info("Vector services temporarily disabled for faster startup")
except ImportError as e:
    logging.warning(f"Vector services not available: {e}")
    VECTOR_SERVICES_AVAILABLE = False

SYSTEM_PROMPT = """You are CareerCure AI, a friendly and knowledgeable career counselor assistant.
You help students and fresh graduates with:
- Career path guidance and planning  
- CV and resume advice
- Interview preparation tips
- Skill development recommendations
- Internship and job search strategies

IMPORTANT: You are a RAG (Retrieval-Augmented Generation) chatbot that shows actual jobs and courses from the platform.

When users ask about jobs, internships, work, positions, or career opportunities:
- Provide helpful career advice
- The system will automatically show relevant job opportunities below your response

When users ask about courses, learning, skills, training, or education:
- Provide helpful learning guidance  
- The system will automatically show relevant course recommendations below your response

For general help queries, both jobs AND courses will be shown to give users the full picture of available opportunities.

Be concise, practical, and encouraging. Use the provided context when relevant.
If you don't know something specific, say so honestly and suggest where to find the answer."""


def detect_intent(message: str) -> Dict[str, bool]:
    """Detect user intent from message to determine what data to show."""
    message_lower = message.lower()
    
    # Job-related keywords - comprehensive
    job_keywords = ['job', 'jobs', 'internship', 'internships', 'position', 'positions', 
                   'work', 'career opportunities', 'employment', 'hiring', 'software development',
                   'developer', 'engineer', 'role', 'roles', 'opportunity', 'opportunities',
                   'vacancy', 'vacancies', 'opening', 'openings', 'apply', 'application',
                   'interview', 'workplace', 'company', 'companies', 'employer', 'job search']
    
    # Course-related keywords - comprehensive  
    course_keywords = ['course', 'courses', 'learn', 'learning', 'skill', 'skills',
                      'training', 'education', 'study', 'tutorial', 'class', 'classes',
                      'bootcamp', 'certification', 'certifications', 'programming',
                      'python', 'javascript', 'react', 'development', 'data science',
                      'teach', 'instruction', 'workshop', 'certification', 'degree',
                      'online course', 'mooc', 'udemy', 'coursera', 'edx']
    
    show_jobs = any(keyword in message_lower for keyword in job_keywords)
    show_courses = any(keyword in message_lower for keyword in course_keywords)
    
    # Special patterns and phrases
    job_phrases = ['show me job', 'find me work', 'job match', 'career opportunity', 
                   'what jobs', 'job opening', 'internship opportunity', 'where can i work',
                   'job recommendation', 'suitable job', 'job for me']
    
    course_phrases = ['recommend course', 'what should i learn', 'course for', 'learn about',
                     'skill development', 'how to learn', 'course recommendation',
                     'what course', 'training for', 'study material']
    
    for phrase in job_phrases:
        if phrase in message_lower:
            show_jobs = True
            break
            
    for phrase in course_phrases:
        if phrase in message_lower:
            show_courses = True
            break
    
    # Command-like patterns
    if 'show' in message_lower:
        if any(word in message_lower for word in ['job', 'work', 'internship', 'position']):
            show_jobs = True
        if any(word in message_lower for word in ['course', 'learn', 'skill', 'training']):
            show_courses = True
    
    if 'recommend' in message_lower or 'suggest' in message_lower:
        if any(word in message_lower for word in ['job', 'work', 'internship', 'position']):
            show_jobs = True
        if any(word in message_lower for word in ['course', 'learn', 'skill', 'training']):
            show_courses = True
    
    if 'find' in message_lower:
        if any(word in message_lower for word in ['job', 'work', 'internship', 'position']):
            show_jobs = True
        if any(word in message_lower for word in ['course', 'learn', 'skill', 'training']):
            show_courses = True
    
    # Help queries - show both
    help_patterns = ['what can you do', 'help me', 'what do you offer', 'show me everything',
                     'what\'s available', 'options', 'possibilities']
    if any(pattern in message_lower for pattern in help_patterns):
        show_jobs = True
        show_courses = True
    
    return {
        'show_jobs': show_jobs,
        'show_courses': show_courses
    }


def get_recommended_jobs(user_profile=None, limit: int = 6, db: Session = None) -> list:
    """Get recommended jobs based on user profile or return mock data."""
    if db is None:
        # Fallback to mock data if no db session
        mock_jobs = [
            {
                "id": 1,
                "title": "Backend Developer Intern",
                "company": "TechStart Inc",
                "location": "Remote",
                "description": "Join our team to build scalable web applications using Python and FastAPI.",
                "skills_required": ["Python", "FastAPI", "SQL", "Git"],
                "match_score": 0.92,
                "remote_option": "Full Remote",
                "application_url": "https://techstart.com/apply"
            },
            {
                "id": 2,
                "title": "Frontend Developer",  
                "company": "WebFlow Co",
                "location": "New York, NY",
                "description": "Create beautiful user interfaces using React and modern web technologies.",
                "skills_required": ["React", "JavaScript", "HTML/CSS", "TypeScript"],
                "match_score": 0.85,
                "remote_option": "Hybrid",
                "application_url": "https://webflow.com/careers"
            },
            {
                "id": 3,
                "title": "Data Science Intern",
                "company": "DataTech Solutions", 
                "location": "San Francisco, CA",
                "description": "Analyze data and build machine learning models to drive business insights.",
                "skills_required": ["Python", "Pandas", "Machine Learning", "SQL"],
                "match_score": 0.78,
                "remote_option": "On-site",
                "application_url": "https://datatech.com/internships"
            }
        ]
        return mock_jobs[:limit]
    
    try:
        # Try to get actual internship/job data from database
        from app.models.career import Internship
        jobs = db.query(Internship).limit(limit).all()
        
        job_data = []
        for job in jobs:
            job_data.append({
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "description": job.description[:200] + "..." if len(job.description or "") > 200 else job.description,
                "skills_required": job.required_skills or [],
                "remote_option": job.remote_option or "Not specified",
                "application_url": job.application_url or "#",
                "salary_range": getattr(job, 'salary_range', None),
                "match_score": 0.85  # Default score, would be calculated based on profile
            })
        
        return job_data if job_data else get_recommended_jobs(user_profile, limit, None)  # Fallback to mock
        
    except Exception as e:
        logger.warning(f"Could not fetch real job data: {e}, falling back to mock data")
        return get_recommended_jobs(user_profile, limit, None)  # Fallback to mock


def get_recommended_courses(user_profile=None, limit: int = 4, db: Session = None) -> list:
    """Get recommended courses based on user profile or return mock data."""
    if db is None:
        # Fallback to mock data if no db session
        mock_courses = [
            {
                "id": 1,
                "title": "Complete Python Bootcamp",
                "provider": "TechEd",
                "description": "Master Python programming from basics to advanced concepts.",
                "duration": "8 weeks",
                "difficulty_level": "Beginner",
                "rating": 4.8,
                "is_free": False,
                "price": "$99",
                "skills_gained": ["Python", "Programming", "Problem Solving"],
                "course_url": "https://teched.com/python-bootcamp"
            },
            {
                "id": 2,
                "title": "React for Beginners",
                "provider": "CodeAcademy",
                "description": "Learn React.js and build interactive web applications.",
                "duration": "6 weeks", 
                "difficulty_level": "Beginner",
                "rating": 4.6,
                "is_free": True,
                "price": "Free",
                "skills_gained": ["React", "JavaScript", "Frontend"],
                "course_url": "https://codecademy.com/react"
            },
            {
                "id": 3,
                "title": "Data Science Fundamentals",
                "provider": "DataLearn",
                "description": "Introduction to data analysis and machine learning concepts.",
                "duration": "10 weeks",
                "difficulty_level": "Intermediate", 
                "rating": 4.9,
                "is_free": False,
                "price": "$149",
                "skills_gained": ["Data Analysis", "Python", "Statistics"],
                "course_url": "https://datalearn.com/fundamentals"
            }
        ]
        return mock_courses[:limit]
    
    try:
        # Try to get actual course data from database
        from app.models.career import Course
        courses = db.query(Course).limit(limit).all()
        
        course_data = []
        for course in courses:
            course_data.append({
                "id": course.id,
                "title": course.title,
                "provider": course.provider,
                "description": course.description[:200] + "..." if len(course.description or "") > 200 else course.description,
                "duration": course.duration,
                "difficulty_level": course.difficulty_level,
                "rating": course.rating,
                "is_free": "free" in (course.price or "").lower(),
                "price": course.price,
                "skills_gained": course.skills_gained or [],
                "course_url": course.course_url or "#",
                "category": getattr(course, 'category', 'General')
            })
        
        return course_data if course_data else get_recommended_courses(user_profile, limit, None)  # Fallback to mock
        
    except Exception as e:
        logger.warning(f"Could not fetch real course data: {e}, falling back to mock data")
        return get_recommended_courses(user_profile, limit, None)  # Fallback to mock




def build_user_context(user=None, profile=None) -> str:
    """Build a short context string from the authenticated user's profile so the
    coach can personalise its advice. Returns an empty string when unavailable."""
    if not user and not profile:
        return ""

    parts = []
    name = getattr(user, "full_name", None)
    if name:
        parts.append(f"User's name: {name}")

    if profile:
        if getattr(profile, "career_goal", None):
            parts.append(f"Stated career goal: {profile.career_goal}")
        skills = getattr(profile, "skills", None) or []
        if isinstance(skills, list) and skills:
            parts.append(f"Current skills: {', '.join(str(s) for s in skills)}")
        if getattr(profile, "education", None):
            parts.append(f"Education: {profile.education}")
        exp = getattr(profile, "experience_years", None)
        if exp is not None:
            parts.append(f"Years of experience: {exp}")
        if getattr(profile, "bio", None):
            parts.append(f"About them: {profile.bio}")

    return "\n".join(parts)


def _retrieve_context(user_message: str) -> str:
    """Safely retrieve RAG context from ChromaDB. Never raises — RAG is a bonus."""
    if not VECTOR_SERVICES_AVAILABLE:
        logger.info("Vector services not available, skipping RAG context retrieval")
        return ""
        
    try:
        query_embedding = embed_text(user_message)
        context_docs = search_faqs(query_embedding, top_k=3)
        if context_docs:
            return "\n\n".join(context_docs)
    except Exception as e:
        logger.warning("RAG context retrieval failed, continuing without it: %s", e)
    return ""


def chat(user_message: str, conversation_history: list, user_context: str = "", user_profile=None, db: Session = None) -> dict:
    """
    Enhanced RAG-powered chatbot that can show jobs and courses:
    1. Detect if user is asking for jobs/courses
    2. Embed user message and retrieve relevant FAQ context
    3. Send to Groq LLM with system prompt, profile context, history and RAG context
    4. Return response with reply and any recommended data
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    # Detect what the user wants to see
    intent = detect_intent(user_message)

    # Build messages
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    context_blocks = []
    if user_context:
        context_blocks.append(f"The user's profile (use this to personalise your advice):\n{user_context}")
    rag_context = _retrieve_context(user_message)
    if rag_context:
        context_blocks.append(f"Relevant career knowledge base context:\n{rag_context}")

    if context_blocks:
        messages.append({"role": "system", "content": "\n\n".join(context_blocks)})

    # Add conversation history (last 10 turns to stay within token limits)
    messages.extend(conversation_history[-10:])
    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
    )

    reply = response.choices[0].message.content
    # Groq may return null content (e.g. filtered responses) — guard against it
    if not reply:
        reply = (
            "I'm sorry, I couldn't generate a response just now. "
            "Could you rephrase your question?"
        )
    
    # Check if we should show jobs/courses based on intent or LLM markers
    show_jobs = intent['show_jobs'] or '[SHOW_JOBS]' in reply
    show_courses = intent['show_courses'] or '[SHOW_COURSES]' in reply
    
    # Clean up any markers from the response
    reply = reply.replace('[SHOW_JOBS]', '').replace('[SHOW_COURSES]', '').strip()
    
    # Fetch actual data if needed and prepare response
    response_data = {
        "reply": reply,
        "show_jobs": show_jobs,
        "show_courses": show_courses,
        "jobs": [],
        "courses": []
    }
    
    # Fetch actual data if needed
    if show_jobs:
        response_data["jobs"] = get_recommended_jobs(user_profile, limit=6, db=db)
        # Only append message if the reply doesn't already mention jobs/opportunities
        if not any(word in reply.lower() for word in ['job', 'position', 'work', 'internship', 'opportunity']):
            response_data["reply"] += f"\n\nHere are some job opportunities that might interest you:"
    
    if show_courses:
        response_data["courses"] = get_recommended_courses(user_profile, limit=4, db=db)  
        # Only append message if the reply doesn't already mention courses/learning
        if not any(word in reply.lower() for word in ['course', 'learn', 'training', 'skill', 'education']):
            response_data["reply"] += f"\n\nI've found some relevant courses for you:"
    
    return response_data
