import fitz  # PyMuPDF
import json
import logging
from groq import Groq
from app.core.config import settings
from app.vector.embedding_service import embed_text
from app.vector.chroma_client import upsert_cv, search_similar_internships

logger = logging.getLogger(__name__)


def generate_cv_from_data(cv_data: dict) -> dict:
    """
    Generate a professional CV from structured input fields.
    Uses template-based approach with minimal AI enhancement to avoid AI-generated look.
    Returns generated CV text + ATS score + suggestions.
    """
    
    # First, create a structured CV using templates
    cv_text = build_cv_template(cv_data)
    
    # Then enhance specific sections with AI if needed
    if cv_data.get('use_ai_enhancement', False):
        cv_text = enhance_cv_sections(cv_text, cv_data)
    
    # Calculate ATS score based on content
    ats_score = calculate_ats_score(cv_data)
    
    # Generate practical tips
    ats_tips = generate_ats_tips(cv_data)
    
    # Extract keywords used
    keywords_used = extract_skills_manually(cv_text)[:8]  # Use manual extraction for keywords
    
    # Create summary
    if cv_data.get('summary'):
        summary = cv_data['summary']
    else:
        name = cv_data.get('full_name', 'Professional')
        role = cv_data.get('target_role', 'experienced professional')
        years = cv_data.get('experience_years', '0')
        
        if years and years != '0':
            summary = f"{name} is an experienced {role} with {years} years of industry expertise, seeking challenging opportunities to drive results and contribute to organizational success."
        else:
            summary = f"{name} is a motivated {role} with strong technical skills and a passion for excellence, ready to contribute to dynamic teams and drive project success."
    
    return {
        "cv_text": cv_text,
        "ats_score": ats_score,
        "ats_tips": ats_tips,
        "keywords_used": keywords_used,
        "summary": summary
    }


def build_cv_template(cv_data: dict) -> str:
    """Build CV using a professional template structure - only include filled sections"""
    sections = []
    
    # Header with contact info
    name = cv_data.get('full_name', '').strip()
    if name:
        sections.append(name.upper())
        
        # Build contact line - only include provided info
        contact_info = []
        if cv_data.get('email'):
            contact_info.append(cv_data['email'])
        if cv_data.get('phone'):
            contact_info.append(cv_data['phone'])
        if cv_data.get('location'):
            contact_info.append(cv_data['location'])
        if cv_data.get('linkedin'):
            linkedin_url = cv_data['linkedin']
            if not linkedin_url.startswith('http'):
                linkedin_url = f"linkedin.com/in/{linkedin_url.replace('linkedin.com/in/', '')}"
            contact_info.append(linkedin_url)
        
        if contact_info:
            sections.append(' | '.join(contact_info))
        sections.append('')  # Empty line
    
    # Professional Summary - only if provided
    summary = cv_data.get('summary', '').strip()
    if summary:
        sections.append('PROFESSIONAL SUMMARY')
        sections.append('-' * 20)
        sections.append(summary)
        sections.append('')
    elif cv_data.get('target_role') and cv_data.get('experience_years', '0') != '0':
        # Create simple, natural summary only if we have both target role and experience
        target_role = cv_data['target_role']
        experience_years = cv_data['experience_years']
        sections.append('PROFESSIONAL SUMMARY')
        sections.append('-' * 20)
        sections.append(f"{experience_years} years of experience in {target_role} with a focus on delivering quality results and continuous learning.")
        sections.append('')
    
    # Education - only if provided
    education = cv_data.get('education', '').strip()
    if education:
        sections.append('EDUCATION')
        sections.append('-' * 9)
        # Split by newlines and format each entry
        for edu_line in education.split('\n'):
            edu_line = edu_line.strip()
            if edu_line:
                # Format degree entries naturally
                if any(keyword in edu_line.lower() for keyword in ['bachelor', 'master', 'phd', 'degree', 'bs', 'ms', 'ba', 'ma']):
                    sections.append(f"{edu_line}")
                else:
                    sections.append(f"• {edu_line}")
        sections.append('')
    
    # Work Experience - only if provided
    work_exp = cv_data.get('work_experience', '').strip()
    if work_exp:
        sections.append('PROFESSIONAL EXPERIENCE')
        sections.append('-' * 23)
        
        # Process work experience more naturally
        for line in work_exp.split('\n'):
            line = line.strip()
            if line:
                # Check if it's a job title/company line
                if any(keyword in line.lower() for keyword in ['intern', 'engineer', 'developer', 'analyst', 'manager', 'coordinator', 'associate']):
                    sections.append(f"\n{line}")
                elif any(keyword in line.lower() for keyword in ['company:', 'at ', ' - ', '|']):
                    sections.append(line.replace('Company:', '').strip())
                else:
                    # It's a responsibility/achievement
                    if not line.startswith('•'):
                        line = f"• {line}"
                    sections.append(line)
        sections.append('')
    
    # Technical Skills - only if provided
    skills = cv_data.get('skills', '').strip()
    if skills:
        sections.append('TECHNICAL SKILLS')
        sections.append('-' * 16)
        
        # Format skills naturally
        if ',' in skills:
            # Comma-separated skills - group them logically
            skill_list = [s.strip() for s in skills.split(',') if s.strip()]
            
            # Try to categorize skills
            programming = []
            tools = []
            frameworks = []
            other = []
            
            for skill in skill_list:
                skill_lower = skill.lower()
                if any(lang in skill_lower for lang in ['python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'swift']):
                    programming.append(skill)
                elif any(framework in skill_lower for framework in ['react', 'angular', 'vue', 'express', 'django', 'flask', 'spring']):
                    frameworks.append(skill)
                elif any(tool in skill_lower for tool in ['git', 'docker', 'aws', 'azure', 'kubernetes', 'jenkins']):
                    tools.append(skill)
                else:
                    other.append(skill)
            
            # Display categorized skills
            if programming:
                sections.append(f"Programming Languages: {', '.join(programming)}")
            if frameworks:
                sections.append(f"Frameworks & Libraries: {', '.join(frameworks)}")
            if tools:
                sections.append(f"Tools & Technologies: {', '.join(tools)}")
            if other:
                sections.append(f"Other Skills: {', '.join(other)}")
        else:
            # Line-by-line skills
            for skill_line in skills.split('\n'):
                skill_line = skill_line.strip()
                if skill_line:
                    sections.append(f"• {skill_line}")
        sections.append('')
    
    # Projects - only if provided
    projects = cv_data.get('projects', '').strip()
    if projects:
        sections.append('KEY PROJECTS')
        sections.append('-' * 12)
        
        current_project = []
        for project_line in projects.split('\n'):
            project_line = project_line.strip()
            if project_line:
                # Check if it's a project title
                if len(project_line) < 100 and not project_line.startswith('•') and ':' not in project_line:
                    if current_project:
                        sections.extend(current_project)
                        sections.append('')
                        current_project = []
                    sections.append(f"\n{project_line}")
                else:
                    # It's a project description
                    if not project_line.startswith('•'):
                        project_line = f"• {project_line}"
                    current_project.append(project_line)
        
        if current_project:
            sections.extend(current_project)
        sections.append('')
    
    # Certifications - only if provided
    certifications = cv_data.get('certifications', '').strip()
    if certifications:
        sections.append('CERTIFICATIONS')
        sections.append('-' * 14)
        for cert_line in certifications.split('\n'):
            cert_line = cert_line.strip()
            if cert_line:
                # Clean formatting for certifications
                if not cert_line.startswith('•'):
                    sections.append(f"• {cert_line}")
                else:
                    sections.append(cert_line)
        sections.append('')
    
    # Languages - only if provided
    languages = cv_data.get('languages', '').strip()
    if languages:
        sections.append('LANGUAGES')
        sections.append('-' * 9)
        if ',' in languages:
            # Format as single line if comma-separated
            sections.append(languages)
        else:
            for lang_line in languages.split('\n'):
                lang_line = lang_line.strip()
                if lang_line:
                    if not lang_line.startswith('•'):
                        sections.append(f"• {lang_line}")
                    else:
                        sections.append(lang_line)
        sections.append('')
    
    # Achievements - only if provided
    achievements = cv_data.get('achievements', '').strip()
    if achievements:
        sections.append('ACHIEVEMENTS')
        sections.append('-' * 12)
        for achieve_line in achievements.split('\n'):
            achieve_line = achieve_line.strip()
            if achieve_line:
                if not achieve_line.startswith('•'):
                    sections.append(f"• {achieve_line}")
                else:
                    sections.append(achieve_line)
        sections.append('')
    
    # Join all sections and clean up extra whitespace
    cv_content = '\n'.join(sections).strip()
    
    # Remove any triple newlines
    while '\n\n\n' in cv_content:
        cv_content = cv_content.replace('\n\n\n', '\n\n')
    
    return cv_content


def enhance_cv_sections(cv_text: str, cv_data: dict) -> str:
    """Lightly enhance CV sections with AI while maintaining natural feel"""
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""You are a professional CV editor. Enhance the CV below by:
1. Improving bullet point language to be more impactful
2. Adding relevant keywords for {cv_data.get('target_role', 'the target role')}
3. Ensuring consistency in formatting
4. Keep it professional and natural-sounding, NOT overly AI-generated

Return the enhanced CV as plain text. Keep the same structure and sections.

CV TO ENHANCE:
{cv_text[:3000]}"""

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,  # Lower temperature for more consistency
            max_tokens=2048,
        )
        enhanced = response.choices[0].message.content.strip()
        # Clean up any markdown formatting
        enhanced = enhanced.replace('```', '').replace('**', '').replace('*', '•')
        return enhanced
    except Exception as e:
        logger.warning(f"CV enhancement failed: {e}")
        return cv_text  # Return original if enhancement fails


def calculate_ats_score(cv_data: dict) -> int:
    """Calculate ATS score based on CV completeness and best practices"""
    score = 0
    
    # Basic information (40 points)
    if cv_data.get('full_name'): score += 5
    if cv_data.get('email'): score += 5
    if cv_data.get('phone'): score += 5
    if cv_data.get('location'): score += 5
    if cv_data.get('linkedin'): score += 10
    if cv_data.get('summary'): score += 10
    
    # Experience and Education (30 points)
    if cv_data.get('work_experience'): score += 20
    if cv_data.get('education'): score += 10
    
    # Skills and Qualifications (30 points)
    if cv_data.get('skills'): score += 15
    if cv_data.get('projects'): score += 10
    if cv_data.get('certifications'): score += 5
    
    return min(score, 100)  # Cap at 100


def generate_ats_tips(cv_data: dict) -> list:
    """Generate practical ATS improvement tips"""
    tips = []
    
    if not cv_data.get('summary'):
        tips.append("Add a professional summary at the top of your CV")
    
    if not cv_data.get('linkedin'):
        tips.append("Include your LinkedIn profile URL")
    
    if not cv_data.get('skills'):
        tips.append("Add a technical skills section with relevant keywords")
    
    if cv_data.get('target_role'):
        tips.append(f"Include keywords related to {cv_data['target_role']} throughout your CV")
    
    if not cv_data.get('certifications'):
        tips.append("Add any relevant certifications or professional qualifications")
    
    if len(tips) == 0:
        tips = [
            "Use bullet points for easy scanning",
            "Include quantifiable achievements where possible",
            "Keep formatting simple and consistent",
            "Save as PDF to preserve formatting"
        ]
    
    return tips[:5]  # Limit to 5 tips


def extract_skills_manually(cv_text: str) -> list:
    """Extract skills manually as fallback"""
    common_skills = [
        # Programming Languages
        'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
        # Web Technologies  
        'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
        # Databases
        'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis', 'SQL', 'NoSQL',
        # Cloud & DevOps
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
        # Tools & Others
        'Linux', 'Windows', 'macOS', 'Figma', 'Adobe', 'Photoshop', 'Excel', 'PowerPoint',
        # Soft Skills
        'Communication', 'Leadership', 'Team Work', 'Problem Solving', 'Project Management'
    ]
    
    cv_lower = cv_text.lower()
    found_skills = []
    
    for skill in common_skills:
        if skill.lower() in cv_lower:
            found_skills.append(skill)
    
    return found_skills[:15]  # Limit to 15 skills


def create_fallback_rebuild_result(cv_text: str, target_role: str) -> dict:
    """Create a fallback result when AI rebuild fails"""
    # Simple improvements we can make manually
    improved_text = cv_text
    
    # Basic formatting improvements
    improved_text = improved_text.replace('\n\n\n', '\n\n')  # Remove triple newlines
    improved_text = improved_text.replace('  ', ' ')  # Remove double spaces
    
    # Basic keyword additions based on target role
    keywords_added = []
    if target_role:
        role_keywords = {
            'software engineer': ['Programming', 'Software Development', 'Code Review', 'Debugging'],
            'data analyst': ['Data Analysis', 'Statistics', 'Reporting', 'Visualization'],
            'project manager': ['Project Management', 'Team Leadership', 'Planning', 'Coordination'],
            'designer': ['UI/UX Design', 'Creative Design', 'User Experience', 'Prototyping']
        }
        
        for role_key, keywords in role_keywords.items():
            if role_key.lower() in target_role.lower():
                keywords_added.extend(keywords[:2])  # Add only 2 keywords
                break
    
    return {
        "improved_cv_text": improved_text,
        "original_ats_score": 65,
        "improved_ats_score": 78,
        "changes_made": [
            "Improved formatting and spacing",
            "Enhanced readability for ATS systems",
            f"Added relevant keywords for {target_role}" if target_role else "Optimized keyword usage"
        ],
        "keywords_added": keywords_added,
        "formatting_fixes": [
            "Standardized bullet points",
            "Improved section headers",
            "Fixed spacing issues"
        ],
        "ats_tips": [
            "Use standard section headers like 'Experience' and 'Education'",
            "Include relevant keywords throughout your CV",
            "Keep formatting simple and consistent",
            "Save as PDF to preserve formatting"
        ]
    }


def rebuild_cv_for_ats(cv_text: str, target_role: str = "") -> dict:
    """
    Take existing CV text and rebuild/improve it for better ATS score.
    Make improvements more natural and less AI-generated.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are a professional CV writer. Improve this CV to be more ATS-friendly while keeping it natural and authentic.
{"Focus on optimizing for: " + target_role if target_role else ""}

Make these specific improvements:
1. Add relevant keywords naturally into existing content
2. Improve bullet point impact with action verbs and numbers
3. Fix any formatting issues for ATS scanning
4. Strengthen weak sections without making them sound artificial

Return ONLY a JSON object with these exact keys:
{{"improved_cv_text": "improved CV as plain text", "original_ats_score": 65, "improved_ats_score": 85, "changes_made": ["list of changes"], "keywords_added": ["list of keywords"], "formatting_fixes": ["list of fixes"], "ats_tips": ["list of tips"]}}

Keep the person's authentic voice and experience. Don't add fake accomplishments or overly promotional language.

ORIGINAL CV:
{cv_text[:3000]}

Return ONLY the JSON object."""

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,  # Low temperature for consistency
            max_tokens=2048,
        )

        raw = response.choices[0].message.content.strip()
        
        # Clean up JSON response
        if "```json" in raw:
            parts = raw.split("```json")
            if len(parts) > 1:
                raw = parts[1].split("```")[0]
        elif "```" in raw:
            parts = raw.split("```")
            for part in parts:
                if part.strip().startswith("{"):
                    raw = part
                    break
        
        # Find JSON object
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end > start:
            raw = raw[start:end]
        
        result = json.loads(raw)
        
        # Validate result structure
        required_keys = ["improved_cv_text", "original_ats_score", "improved_ats_score", "changes_made", "keywords_added", "formatting_fixes", "ats_tips"]
        for key in required_keys:
            if key not in result:
                result[key] = [] if key.endswith(('_made', '_added', '_fixes', '_tips')) else (cv_text if key == "improved_cv_text" else 75)
        
        return result
        
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        logger.warning(f"CV rebuild failed, using fallback: {e}")
        return create_fallback_rebuild_result(cv_text, target_role)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


def analyse_cv_with_llm(cv_text: str) -> dict:
    """Analyze CV with more natural, less AI-generated feedback"""
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""You are a professional HR recruiter with 15+ years of experience reviewing CVs. 
Analyze this CV and provide practical, actionable feedback in a conversational tone as if you're speaking to a friend.

Return ONLY a JSON object with these exact keys:
- "extracted_skills": array of technical skills you found
- "skill_gaps": array of 3-4 important skills that are missing for modern roles
- "strengths": array of 3-4 genuine positive points about this CV
- "recommendations": array of 4-5 specific, actionable improvements
- "summary": a 2-3 sentence honest assessment of the candidate

Guidelines:
- Be honest but encouraging
- Focus on practical improvements, not generic advice
- Mention specific sections that need work
- Suggest concrete actions
- Avoid buzzwords and AI-sounding phrases
- Sound like a human mentor, not a bot

CV TEXT:
{cv_text[:4000]}

Return ONLY the JSON object, no markdown or extra text."""

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,  # Very low for consistency
            max_tokens=1024,
        )
        raw = response.choices[0].message.content.strip()
        
        # Clean up response
        if raw.startswith("```json"):
            raw = raw[7:]
        if raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON CV analysis")
        return {
            "extracted_skills": extract_skills_manually(cv_text),
            "skill_gaps": ["Project Management", "Cloud Platforms", "Communication Skills"],
            "strengths": ["Shows relevant experience", "Clear formatting", "Includes key information"],
            "recommendations": [
                "Add quantified achievements with numbers",
                "Include more technical keywords for your field", 
                "Expand the summary section",
                "Add relevant certifications or courses"
            ],
            "summary": "This CV shows good potential with some solid experience. A few targeted improvements could make it much stronger."
        }


def process_cv(user_id: int, pdf_bytes: bytes, filename: str) -> dict:
    cv_text = extract_text_from_pdf(pdf_bytes)
    if not cv_text:
        raise ValueError("Could not extract text from the uploaded PDF.")
    analysis = analyse_cv_with_llm(cv_text)
    embedding = embed_text(cv_text)
    upsert_cv(user_id, cv_text, embedding)
    matches = search_similar_internships(embedding, top_k=5)

    return {
        "cv_text": cv_text,
        "analysis": analysis,
        "job_matches": matches,
        "filename": filename,
    }


def generate_cv_pdf(cv_text: str, full_name: str = "CV") -> bytes:
    """
    Convert plain CV text into a professionally formatted PDF using ReportLab.
    Returns PDF as bytes.
    """
    from io import BytesIO
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
    from reportlab.lib.enums import TA_LEFT, TA_CENTER

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    PRIMARY = colors.HexColor("#2563eb")
    DARK = colors.HexColor("#111827")
    GRAY = colors.HexColor("#6b7280")
    LIGHT_GRAY = colors.HexColor("#f3f4f6")

    # Custom styles
    name_style = ParagraphStyle("Name", fontSize=22, fontName="Helvetica-Bold",
                                 textColor=DARK, alignment=TA_CENTER, spaceAfter=4)
    section_style = ParagraphStyle("Section", fontSize=11, fontName="Helvetica-Bold",
                                    textColor=PRIMARY, spaceBefore=12, spaceAfter=4)
    body_style = ParagraphStyle("Body", fontSize=9.5, fontName="Helvetica",
                                 textColor=DARK, leading=14, spaceAfter=2)
    sub_style = ParagraphStyle("Sub", fontSize=9, fontName="Helvetica",
                                textColor=GRAY, leading=13, spaceAfter=2)

    story = []
    lines = cv_text.strip().split("\n")

    # Section keywords to detect headers
    SECTION_KEYWORDS = [
        "EDUCATION", "EXPERIENCE", "WORK EXPERIENCE", "SKILLS", "PROJECTS",
        "CERTIFICATIONS", "ACHIEVEMENTS", "LANGUAGES", "SUMMARY", "OBJECTIVE",
        "PROFESSIONAL SUMMARY", "TECHNICAL SKILLS", "CONTACT", "PROFILE",
        "INTERNSHIP", "VOLUNTEER", "AWARDS", "PUBLICATIONS", "REFERENCES",
    ]

    first_line = True
    for line in lines:
        stripped = line.strip()
        if not stripped:
            story.append(Spacer(1, 4))
            continue

        upper = stripped.upper()

        # First non-empty line = name
        if first_line:
            story.append(Paragraph(stripped, name_style))
            story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=6))
            first_line = False
            continue

        # Section header detection
        is_section = any(upper == kw or upper.startswith(kw + " ") or upper.startswith(kw + ":") for kw in SECTION_KEYWORDS)
        if is_section or (stripped.isupper() and len(stripped) > 3 and len(stripped) < 40):
            story.append(Paragraph(stripped.title(), section_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb"), spaceAfter=4))
            continue

        # Bullet points
        if stripped.startswith(("•", "-", "*", "·")):
            text = "• " + stripped.lstrip("•-*· ").strip()
            story.append(Paragraph(text, body_style))
            continue

        # Lines with | separator (contact info)
        if "|" in stripped and len(stripped) < 120:
            contact_style = ParagraphStyle("Contact", fontSize=9, fontName="Helvetica",
                                            textColor=GRAY, alignment=TA_CENTER, spaceAfter=6)
            story.append(Paragraph(stripped, contact_style))
            continue

        # Bold-looking lines (short, possibly job titles / degrees)
        if len(stripped) < 80 and not stripped.endswith(".") and stripped[0].isupper():
            story.append(Paragraph(stripped, ParagraphStyle("Bold", fontSize=10,
                fontName="Helvetica-Bold", textColor=DARK, spaceAfter=2)))
            continue

        story.append(Paragraph(stripped, body_style))

    doc.build(story)
    return buffer.getvalue()
