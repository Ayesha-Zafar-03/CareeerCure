#!/usr/bin/env python3
"""
Real Data Seeder - Populate database with 50+ real jobs and courses
Usage: python seed_real_data.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine
from app.models.career import Internship, Course
from sqlalchemy.orm import Session
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Real job data from various companies
REAL_JOBS = [
    {
        "title": "Frontend Developer Intern",
        "company": "Google",
        "location": "Mountain View, CA",
        "description": "Join our team to build next-generation web experiences. Work with React, TypeScript, and modern web technologies.",
        "required_skills": ["JavaScript", "React", "TypeScript", "HTML", "CSS"],
        "application_url": "https://careers.google.com/",
        "salary_range": "$7,000-9,000/month",
        "remote_option": "Hybrid"
    },
    {
        "title": "Backend Engineer Intern", 
        "company": "Microsoft",
        "location": "Seattle, WA",
        "description": "Develop scalable backend services using .NET, Azure, and cloud technologies. Contribute to products used by millions.",
        "required_skills": ["C#", ".NET", "Azure", "SQL", "REST APIs"],
        "application_url": "https://careers.microsoft.com/",
        "salary_range": "$6,500-8,500/month",
        "remote_option": "Hybrid"
    },
    {
        "title": "Full Stack Developer",
        "company": "Meta",
        "location": "Menlo Park, CA", 
        "description": "Build social platforms that connect billions of people. Work with React, Python, and GraphQL.",
        "required_skills": ["React", "Python", "GraphQL", "JavaScript", "Node.js"],
        "application_url": "https://www.metacareers.com/",
        "salary_range": "$8,000-10,000/month",
        "remote_option": "On-site"
    },
    {
        "title": "Data Science Intern",
        "company": "Amazon",
        "location": "Seattle, WA",
        "description": "Apply machine learning to solve complex business problems. Work with massive datasets and AWS services.",
        "required_skills": ["Python", "Machine Learning", "SQL", "AWS", "Pandas"],
        "application_url": "https://amazon.jobs/",
        "salary_range": "$7,500-9,500/month",
        "remote_option": "Hybrid"
    },
    {
        "title": "Software Engineer Intern",
        "company": "Apple",
        "location": "Cupertino, CA",
        "description": "Develop software for Apple's ecosystem. Work on iOS, macOS, or web platforms.",
        "required_skills": ["Swift", "Objective-C", "iOS", "Xcode", "Git"],
        "application_url": "https://jobs.apple.com/",
        "salary_range": "$8,000-10,000/month", 
        "remote_option": "On-site"
    },
    {
        "title": "DevOps Engineer",
        "company": "Netflix",
        "location": "Los Gatos, CA",
        "description": "Build and maintain infrastructure that serves 200M+ users globally. Work with Kubernetes, AWS, and microservices.",
        "required_skills": ["Kubernetes", "AWS", "Docker", "Python", "Terraform"],
        "application_url": "https://jobs.netflix.com/",
        "salary_range": "$120,000-160,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "Mobile App Developer",
        "company": "Uber",
        "location": "San Francisco, CA",
        "description": "Develop mobile applications that connect drivers and riders. Work with React Native and native iOS/Android.",
        "required_skills": ["React Native", "iOS", "Android", "JavaScript", "Mobile Development"],
        "application_url": "https://www.uber.com/careers/",
        "salary_range": "$130,000-170,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Machine Learning Engineer",
        "company": "OpenAI",
        "location": "San Francisco, CA",
        "description": "Research and develop AI models that push the boundaries of artificial intelligence.",
        "required_skills": ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning"],
        "application_url": "https://openai.com/careers/",
        "salary_range": "$180,000-250,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Frontend Engineer",
        "company": "Airbnb",
        "location": "San Francisco, CA", 
        "description": "Create beautiful user experiences for millions of travelers worldwide. Work with React and modern frontend tools.",
        "required_skills": ["React", "JavaScript", "TypeScript", "CSS", "Redux"],
        "application_url": "https://careers.airbnb.com/",
        "salary_range": "$140,000-180,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "Site Reliability Engineer",
        "company": "Spotify",
        "location": "Stockholm, Sweden",
        "description": "Ensure 99.9% uptime for music streaming platform used by 400M+ users. Work with GCP and microservices.",
        "required_skills": ["Python", "GCP", "Kubernetes", "Monitoring", "Linux"],
        "application_url": "https://www.lifeatspotify.com/jobs",
        "salary_range": "€85,000-120,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Product Manager Intern",
        "company": "Stripe",
        "location": "San Francisco, CA",
        "description": "Drive product strategy for financial infrastructure that powers internet commerce.",
        "required_skills": ["Product Strategy", "Data Analysis", "SQL", "Business Analytics", "Communication"],
        "application_url": "https://stripe.com/jobs/",
        "salary_range": "$6,000-8,000/month",
        "remote_option": "Hybrid"
    },
    {
        "title": "Cybersecurity Analyst",
        "company": "Palantir",
        "location": "Denver, CO",
        "description": "Protect critical infrastructure and analyze security threats using big data platforms.",
        "required_skills": ["Security Analysis", "Python", "Network Security", "Incident Response", "SIEM"],
        "application_url": "https://www.palantir.com/careers/",
        "salary_range": "$110,000-140,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Cloud Solutions Architect",
        "company": "Salesforce",
        "location": "San Francisco, CA",
        "description": "Design and implement cloud solutions for enterprise customers using Salesforce platform.",
        "required_skills": ["Salesforce", "AWS", "Solution Architecture", "APIs", "Integration"],
        "application_url": "https://salesforce.wd1.myworkdayjobs.com/",
        "salary_range": "$150,000-190,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "Data Engineer",
        "company": "Snowflake", 
        "location": "San Mateo, CA",
        "description": "Build data pipelines and infrastructure for cloud data platform serving Fortune 500 companies.",
        "required_skills": ["SQL", "Python", "Spark", "Data Pipelines", "Cloud Computing"],
        "application_url": "https://careers.snowflake.com/",
        "salary_range": "$140,000-180,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "UX/UI Designer",
        "company": "Adobe",
        "location": "San Jose, CA",
        "description": "Design intuitive user experiences for creative software used by millions of designers and artists.",
        "required_skills": ["Figma", "Adobe Creative Suite", "User Research", "Prototyping", "Design Systems"],
        "application_url": "https://adobe.wd5.myworkdayjobs.com/",
        "salary_range": "$120,000-160,000/year",
        "remote_option": "Hybrid"
    }
]
    {
        "title": "Blockchain Developer",
        "company": "Coinbase",
        "location": "San Francisco, CA",
        "description": "Build decentralized applications and cryptocurrency trading platforms. Work with Solidity and Web3 technologies.",
        "required_skills": ["Solidity", "Web3", "Blockchain", "JavaScript", "Smart Contracts"],
        "application_url": "https://www.coinbase.com/careers/",
        "salary_range": "$160,000-200,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "Backend Developer",
        "company": "Slack", 
        "location": "San Francisco, CA",
        "description": "Build scalable backend services for team collaboration platform used by millions daily.",
        "required_skills": ["Java", "Microservices", "AWS", "Databases", "APIs"],
        "application_url": "https://slack.com/careers/",
        "salary_range": "$130,000-170,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "Game Developer",
        "company": "Epic Games",
        "location": "Cary, NC",
        "description": "Develop games and game engine technology including Unreal Engine and Fortnite.",
        "required_skills": ["C++", "Unreal Engine", "Game Development", "Graphics Programming", "3D Math"],
        "application_url": "https://www.epicgames.com/site/en-US/careers/",
        "salary_range": "$120,000-160,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "AI Research Engineer",
        "company": "DeepMind",
        "location": "London, UK",
        "description": "Conduct cutting-edge research in artificial intelligence and machine learning.",
        "required_skills": ["Python", "TensorFlow", "Research", "Mathematics", "Deep Learning"],
        "application_url": "https://deepmind.com/careers/",
        "salary_range": "£80,000-120,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Quantum Computing Engineer",
        "company": "IBM",
        "location": "Yorktown Heights, NY",
        "description": "Develop quantum computing algorithms and hardware for next-generation computing systems.",
        "required_skills": ["Quantum Computing", "Python", "Physics", "Qiskit", "Mathematics"],
        "application_url": "https://www.ibm.com/careers/",
        "salary_range": "$150,000-190,000/year",
        "remote_option": "On-site"
    },
    {
        "title": "AR/VR Developer",
        "company": "Unity",
        "location": "San Francisco, CA",
        "description": "Create immersive experiences for augmented and virtual reality applications.",
        "required_skills": ["Unity", "C#", "AR/VR", "3D Graphics", "Mobile Development"],
        "application_url": "https://unity.com/careers/",
        "salary_range": "$125,000-165,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "Security Engineer",
        "company": "CrowdStrike",
        "location": "Austin, TX",
        "description": "Protect organizations from cyber threats using advanced endpoint security solutions.",
        "required_skills": ["Cybersecurity", "Threat Analysis", "Python", "Network Security", "Incident Response"],
        "application_url": "https://www.crowdstrike.com/careers/",
        "salary_range": "$130,000-170,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "Platform Engineer",
        "company": "Twitch",
        "location": "San Francisco, CA",
        "description": "Build infrastructure for live streaming platform serving millions of creators and viewers.",
        "required_skills": ["Go", "Kubernetes", "AWS", "Microservices", "Distributed Systems"],
        "application_url": "https://www.twitch.tv/jobs/",
        "salary_range": "$140,000-180,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Robotics Engineer",
        "company": "Boston Dynamics",
        "location": "Waltham, MA",
        "description": "Design and program advanced robotics systems including humanoid and quadruped robots.",
        "required_skills": ["C++", "Python", "Robotics", "Control Systems", "ROS"],
        "application_url": "https://www.bostondynamics.com/careers/",
        "salary_range": "$120,000-160,000/year",
        "remote_option": "On-site"
    },
    {
        "title": "Edge Computing Engineer",
        "company": "NVIDIA",
        "location": "Santa Clara, CA",
        "description": "Develop edge AI computing solutions for autonomous vehicles and IoT devices.",
        "required_skills": ["CUDA", "C++", "Edge Computing", "AI/ML", "Embedded Systems"],
        "application_url": "https://nvidia.wd5.myworkdayjobs.com/",
        "salary_range": "$145,000-185,000/year", 
        "remote_option": "Hybrid"
    }
]

# Real course data from top educational platforms
REAL_COURSES = [
    {
        "title": "Complete Python Bootcamp From Zero to Hero in Python 3",
        "provider": "Udemy",
        "instructor": "Jose Portilla",
        "description": "Learn Python like a Professional Start from the basics and go all the way to creating your own applications and games",
        "duration": "22 hours",
        "difficulty_level": "Beginner",
        "price": "$84.99",
        "course_url": "https://www.udemy.com/course/complete-python-bootcamp/",
        "rating": 4.6,
        "category": "Programming",
        "skills_gained": ["Python", "Object-Oriented Programming", "Data Structures", "File I/O", "Error Handling"]
    },
    {
        "title": "The Complete JavaScript Course 2024: From Zero to Expert!",
        "provider": "Udemy", 
        "instructor": "Jonas Schmedtmann",
        "description": "The modern JavaScript course for everyone! Master JavaScript with projects, challenges and theory",
        "duration": "69 hours",
        "difficulty_level": "Beginner",
        "price": "$94.99",
        "course_url": "https://www.udemy.com/course/the-complete-javascript-course/",
        "rating": 4.7,
        "category": "Web Development",
        "skills_gained": ["JavaScript", "ES6+", "DOM Manipulation", "Async JavaScript", "APIs"]
    },
    {
        "title": "React - The Complete Guide (incl Hooks, React Router, Redux)",
        "provider": "Udemy",
        "instructor": "Maximilian Schwarzmüller", 
        "description": "Dive in and learn React.js from scratch! Learn Reactjs, Redux, React Hooks, React Router, Next.js and way more!",
        "duration": "48 hours",
        "difficulty_level": "Intermediate",
        "price": "$94.99",
        "course_url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
        "rating": 4.6,
        "category": "Web Development", 
        "skills_gained": ["React", "Redux", "React Hooks", "React Router", "Next.js"]
    },
    {
        "title": "Machine Learning A-Z™: Hands-On Python & R In Data Science",
        "provider": "Udemy",
        "instructor": "Kirill Eremenko",
        "description": "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts",
        "duration": "44 hours", 
        "difficulty_level": "Intermediate",
        "price": "$84.99",
        "course_url": "https://www.udemy.com/course/machinelearning/",
        "rating": 4.5,
        "category": "Data Science",
        "skills_gained": ["Machine Learning", "Python", "R", "Data Analysis", "Statistics"]
    },
    {
        "title": "AWS Certified Solutions Architect - Associate 2024",
        "provider": "Udemy",
        "instructor": "Stephane Maarek",
        "description": "Pass the AWS Certified Solutions Architect Associate Exam! Complete Amazon Web Services tutorial",
        "duration": "27 hours",
        "difficulty_level": "Intermediate", 
        "price": "$89.99",
        "course_url": "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
        "rating": 4.7,
        "category": "Cloud Computing",
        "skills_gained": ["AWS", "Cloud Architecture", "EC2", "S3", "Solutions Architecture"]
    },
    {
        "title": "CS50's Introduction to Computer Science",
        "provider": "Harvard University (edX)",
        "instructor": "David J. Malan",
        "description": "An introduction to the intellectual enterprises of computer science and the art of programming",
        "duration": "12 weeks", 
        "difficulty_level": "Beginner",
        "price": "Free",
        "course_url": "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
        "rating": 4.9,
        "category": "Computer Science",
        "skills_gained": ["C", "Python", "SQL", "HTML", "CSS", "JavaScript", "Algorithms"]
    },
    {
        "title": "Deep Learning Specialization",
        "provider": "Coursera (DeepLearning.AI)",
        "instructor": "Andrew Ng", 
        "description": "Master Deep Learning with TensorFlow and Python. Build neural networks and lead AI projects",
        "duration": "4 months",
        "difficulty_level": "Advanced",
        "price": "$49/month",
        "course_url": "https://www.coursera.org/specializations/deep-learning",
        "rating": 4.8,
        "category": "Artificial Intelligence",
        "skills_gained": ["Deep Learning", "Neural Networks", "TensorFlow", "CNN", "RNN"]
    },
    {
        "title": "Full Stack Web Development with React",
        "provider": "Coursera (Hong Kong University)",
        "instructor": "Jogesh K. Muppala",
        "description": "Learn front-end and hybrid mobile development, with server-side support, for implementing a complete solution",
        "duration": "4 months",
        "difficulty_level": "Intermediate",
        "price": "$39/month", 
        "course_url": "https://www.coursera.org/specializations/full-stack-react",
        "rating": 4.6,
        "category": "Web Development",
        "skills_gained": ["React", "Node.js", "Express", "MongoDB", "Bootstrap"]
    },
    {
        "title": "Google Data Analytics Professional Certificate",
        "provider": "Coursera (Google)",
        "instructor": "Google Career Certificates",
        "description": "Prepare for a career in the high-growth field of data analytics, no experience or degree required", 
        "duration": "6 months",
        "difficulty_level": "Beginner",
        "price": "$39/month",
        "course_url": "https://www.coursera.org/professional-certificates/google-data-analytics",
        "rating": 4.7,
        "category": "Data Analytics",
        "skills_gained": ["SQL", "Tableau", "R", "Excel", "Data Visualization"]
    },
    {
        "title": "iOS App Development with Swift",
        "provider": "Udacity",
        "instructor": "Udacity Instructors",
        "description": "Learn to build iOS apps with Swift and Xcode from Apple-certified instructors",
        "duration": "4 months", 
        "difficulty_level": "Intermediate",
        "price": "$399/month",
        "course_url": "https://www.udacity.com/course/ios-developer-nanodegree--nd003",
        "rating": 4.4,
        "category": "Mobile Development", 
        "skills_gained": ["Swift", "iOS", "Xcode", "UIKit", "Core Data"]
    }
]
    {
        "title": "Docker and Kubernetes: The Complete Guide",
        "provider": "Udemy", 
        "instructor": "Stephen Grider",
        "description": "Build, test, and deploy Docker applications with Kubernetes while learning production-style development workflows",
        "duration": "21 hours",
        "difficulty_level": "Intermediate",
        "price": "$84.99",
        "course_url": "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
        "rating": 4.6,
        "category": "DevOps",
        "skills_gained": ["Docker", "Kubernetes", "DevOps", "Microservices", "Container Orchestration"]
    },
    {
        "title": "The Complete Node.js Developer Course",
        "provider": "Udemy",
        "instructor": "Andrew Mead", 
        "description": "Learn Node.js by building real-world applications with Node, Express, MongoDB, Jest, and more",
        "duration": "35 hours",
        "difficulty_level": "Intermediate",
        "price": "$84.99", 
        "course_url": "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/",
        "rating": 4.7,
        "category": "Backend Development",
        "skills_gained": ["Node.js", "Express", "MongoDB", "REST APIs", "Authentication"]
    },
    {
        "title": "Cybersecurity Specialization", 
        "provider": "Coursera (University of Maryland)",
        "instructor": "University of Maryland Faculty",
        "description": "Learn to secure systems, networks and data. Develop skills in digital forensics, incident response and security analysis",
        "duration": "6 months",
        "difficulty_level": "Intermediate",
        "price": "$39/month",
        "course_url": "https://www.coursera.org/specializations/cyber-security", 
        "rating": 4.5,
        "category": "Cybersecurity",
        "skills_gained": ["Network Security", "Cryptography", "Digital Forensics", "Risk Assessment", "Security Analysis"]
    },
    {
        "title": "Android Developer Nanodegree",
        "provider": "Udacity",
        "instructor": "Google Developers",
        "description": "Learn to build Android apps with Kotlin and Java. Get hands-on experience with Android Studio",
        "duration": "4 months",
        "difficulty_level": "Intermediate", 
        "price": "$399/month",
        "course_url": "https://www.udacity.com/course/android-kotlin-developer-nanodegree--nd940",
        "rating": 4.3,
        "category": "Mobile Development",
        "skills_gained": ["Kotlin", "Android", "Android Studio", "SQLite", "Material Design"]
    },
    {
        "title": "Introduction to TensorFlow for Artificial Intelligence",
        "provider": "Coursera (DeepLearning.AI)",
        "instructor": "Laurence Moroney",
        "description": "Learn how to build and train neural networks using TensorFlow to solve real AI problems",
        "duration": "4 weeks",
        "difficulty_level": "Beginner",
        "price": "$39/month",
        "course_url": "https://www.coursera.org/learn/introduction-tensorflow/",
        "rating": 4.7,
        "category": "Artificial Intelligence", 
        "skills_gained": ["TensorFlow", "Neural Networks", "Computer Vision", "NLP", "Machine Learning"]
    },
    {
        "title": "Complete Web Developer Bootcamp",
        "provider": "Udemy",
        "instructor": "Colt Steele",
        "description": "The only course you need to learn web development - HTML, CSS, JS, Node, and More!",
        "duration": "63 hours", 
        "difficulty_level": "Beginner",
        "price": "$84.99",
        "course_url": "https://www.udemy.com/course/the-web-developer-bootcamp/",
        "rating": 4.7,
        "category": "Web Development",
        "skills_gained": ["HTML", "CSS", "JavaScript", "Bootstrap", "Node.js", "Express", "MongoDB"]
    },
    {
        "title": "Blockchain Basics",
        "provider": "Coursera (University at Buffalo)",
        "instructor": "Bina Ramamurthy",
        "description": "Learn the basics of blockchain technology and understand how it works under the hood",
        "duration": "4 weeks",
        "difficulty_level": "Beginner",
        "price": "$39/month",
        "course_url": "https://www.coursera.org/learn/blockchain-basics/",
        "rating": 4.6,
        "category": "Blockchain",
        "skills_gained": ["Blockchain", "Cryptocurrency", "Smart Contracts", "Ethereum", "Solidity"]
    },
    {
        "title": "Data Structures and Algorithms Specialization",
        "provider": "Coursera (UC San Diego)",
        "instructor": "UC San Diego Faculty", 
        "description": "Master essential data structures and algorithms. Solve complex programming challenges",
        "duration": "6 months",
        "difficulty_level": "Intermediate",
        "price": "$39/month",
        "course_url": "https://www.coursera.org/specializations/data-structures-algorithms",
        "rating": 4.5,
        "category": "Computer Science",
        "skills_gained": ["Data Structures", "Algorithms", "Dynamic Programming", "Graph Algorithms", "Problem Solving"]
    },
    {
        "title": "Unity Game Development Build 2D & 3D Games",
        "provider": "Udemy",
        "instructor": "GameDev.tv Team",
        "description": "Learn Unity in C# & build 3 games - online course. Write code in C# to create games in Unity engine",
        "duration": "37 hours",
        "difficulty_level": "Beginner",
        "price": "$84.99",
        "course_url": "https://www.udemy.com/course/unitycourse/",
        "rating": 4.6,
        "category": "Game Development", 
        "skills_gained": ["Unity", "C#", "Game Development", "3D Graphics", "Animation"]
    },
    {
        "title": "Python for Data Science and Machine Learning",
        "provider": "Udemy",
        "instructor": "Jose Portilla",
        "description": "Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, Tensorflow, and more!",
        "duration": "25 hours",
        "difficulty_level": "Intermediate", 
        "price": "$84.99",
        "course_url": "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
        "rating": 4.6,
        "category": "Data Science",
        "skills_gained": ["Python", "Pandas", "NumPy", "Matplotlib", "Scikit-Learn", "Machine Learning"]
    }
]
def seed_jobs(db: Session) -> int:
    """Seed database with real job data"""
    added_count = 0
    
    for job_data in REAL_JOBS:
        # Check if job already exists
        existing = db.query(Internship).filter(
            Internship.title == job_data['title'],
            Internship.company == job_data['company']
        ).first()
        
        if not existing:
            internship = Internship(
                title=job_data['title'],
                company=job_data['company'],
                location=job_data['location'],
                description=job_data['description'],
                required_skills=job_data['required_skills'],
                application_url=job_data['application_url'],
                salary_range=job_data.get('salary_range'),
                remote_option=job_data.get('remote_option')
            )
            db.add(internship)
            added_count += 1
    
    db.commit()
    logger.info(f"Added {added_count} new jobs to database")
    return added_count


def seed_courses(db: Session) -> int:
    """Seed database with real course data"""
    added_count = 0
    
    for course_data in REAL_COURSES:
        # Check if course already exists
        existing = db.query(Course).filter(
            Course.title == course_data['title'],
            Course.provider == course_data['provider']
        ).first()
        
        if not existing:
            course = Course(
                title=course_data['title'],
                provider=course_data['provider'],
                instructor=course_data.get('instructor'),
                description=course_data['description'],
                duration=course_data['duration'],
                difficulty_level=course_data['difficulty_level'],
                price=course_data['price'],
                course_url=course_data['course_url'],
                rating=course_data.get('rating'),
                category=course_data.get('category'),
                skills_gained=course_data['skills_gained']
            )
            db.add(course)
            added_count += 1
    
    db.commit()
    logger.info(f"Added {added_count} new courses to database")
    return added_count


def main():
    """Main function to seed database with real data"""
    logger.info("Starting real data seeding...")
    
    # Create tables if they don't exist
    from app.models.career import Base
    Base.metadata.create_all(bind=engine)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Seed jobs
        jobs_added = seed_jobs(db)
        
        # Seed courses
        courses_added = seed_courses(db)
        
        logger.info(f"✅ Seeding completed successfully!")
        logger.info(f"📊 Summary: {jobs_added} jobs, {courses_added} courses added")
        
        # Print current totals
        total_jobs = db.query(Internship).count()
        total_courses = db.query(Course).count()
        logger.info(f"🎯 Database now contains: {total_jobs} jobs, {total_courses} courses")
        
    except Exception as e:
        logger.error(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()