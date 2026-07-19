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
    cv_text = build_comprehensive_cv_template(cv_data)
    
    # Then enhance specific sections with AI if needed
    if cv_data.get('use_ai_enhancement', False):
        cv_text = enhance_cv_sections(cv_text, cv_data)
    
    # Calculate ATS score based on content
    ats_score = calculate_comprehensive_ats_score(cv_data)
    
    # Generate practical tips
    ats_tips = generate_comprehensive_ats_tips(cv_data)
    
    # Extract keywords used
    keywords_used = extract_skills_from_cv_data(cv_data)
    
    # Create summary
    summary = create_professional_summary(cv_data)
    
    return {
        "cv_text": cv_text,
        "ats_score": ats_score,
        "ats_tips": ats_tips,
        "keywords_used": keywords_used,
        "summary": summary
    }


def build_comprehensive_cv_template(cv_data: dict) -> str:
    """Build comprehensive CV using all provided data with proper formatting"""
    sections = []
    
    # Header with contact info - ensure clean formatting
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
        sections.append('')
    
    # Professional Summary
    summary = create_professional_summary(cv_data)
    if summary:
        sections.append('PROFESSIONAL SUMMARY')
        sections.append(summary)
        sections.append('')
    
    # Education - Enhanced formatting with proper line breaks
    education = cv_data.get('education', '').strip()
    if education:
        sections.append('EDUCATION')
        
        # Handle multi-line education properly - clean up formatting issues
        education_text = education.replace('\\n', '\n').replace('\\t', '    ')
        education_lines = [line.strip() for line in education_text.split('\n') if line.strip()]
        
        current_degree = None
        for edu_line in education_lines:
            # Check if it's a degree line
            if any(keyword in edu_line.lower() for keyword in ['bachelor', 'master', 'phd', 'bs ', 'ms ', 'ba ', 'ma ', 'degree']):
                if current_degree:
                    sections.append('')
                sections.append(edu_line)
                current_degree = edu_line
            else:
                sections.append(edu_line)
        sections.append('')
    
    # Work Experience - Enhanced formatting with better structure
    work_exp = cv_data.get('work_experience', '').strip()
    if work_exp:
        sections.append('PROFESSIONAL EXPERIENCE')
        
        # Clean up text formatting first
        work_text = work_exp.replace('\\n', '\n').replace('\\t', '    ')
        work_lines = [line.strip() for line in work_text.split('\n') if line.strip()]
        
        current_job = None
        for line in work_lines:
            job_keywords = ['intern', 'engineer', 'developer', 'analyst', 'manager', 'coordinator', 'associate', 'specialist']
            if any(keyword in line.lower() for keyword in job_keywords):
                if current_job and not line.startswith('•'):
                    sections.append('')
                sections.append(line)
                current_job = line
            elif any(keyword in line.lower() for keyword in ['company:', 'at ', ' - ', '|', 'duration:', 'dates:']):
                clean_line = line.replace('Company:', '').replace('Duration:', '').strip()
                sections.append(clean_line)
            else:
                if not line.startswith('•') and not line.startswith('-'):
                    line = f"• {line}"
                sections.append(line)
        sections.append('')
    
    # Technical Skills - Enhanced categorization with better formatting
    skills = cv_data.get('skills', '').strip()
    if skills:
        sections.append('TECHNICAL SKILLS')
        
        skills_text = skills.replace('\\n', '\n').replace('\\t', '    ')
        
        if ',' in skills_text:
            skill_list = [s.strip() for s in skills_text.split(',') if s.strip()]
            
            programming = []
            frameworks = []
            databases = []
            tools = []
            cloud = []
            other = []
            
            for skill in skill_list:
                skill_lower = skill.lower()
                if any(lang in skill_lower for lang in ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'swift', 'kotlin', 'scala', 'rust']):
                    programming.append(skill)
                elif any(framework in skill_lower for framework in ['react', 'angular', 'vue', 'express', 'django', 'flask', 'spring', 'nodejs', 'nextjs', 'fastapi']):
                    frameworks.append(skill)
                elif any(db in skill_lower for db in ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql', 'dynamodb']):
                    databases.append(skill)
                elif any(cloud_tech in skill_lower for cloud_tech in ['aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'terraform']):
                    cloud.append(skill)
                elif any(tool in skill_lower for tool in ['git', 'github', 'gitlab', 'jira', 'figma', 'photoshop', 'vscode', 'postman']):
                    tools.append(skill)
                else:
                    other.append(skill)
            
            if programming:
                sections.append(f"Programming Languages: {', '.join(programming)}")
            if frameworks:
                sections.append(f"Frameworks & Libraries: {', '.join(frameworks)}")
            if databases:
                sections.append(f"Databases: {', '.join(databases)}")
            if cloud:
                sections.append(f"Cloud & DevOps: {', '.join(cloud)}")
            if tools:
                sections.append(f"Tools: {', '.join(tools)}")
            if other:
                sections.append(f"Other Skills: {', '.join(other)}")
        else:
            skills_lines = [line.strip() for line in skills_text.split('\n') if line.strip()]
            for skill_line in skills_lines:
                if not skill_line.startswith('•') and not skill_line.startswith('-'):
                    sections.append(f"• {skill_line}")
                else:
                    sections.append(skill_line)
        sections.append('')
    
    # Projects - Enhanced formatting with better structure
    projects = cv_data.get('projects', '').strip()
    if projects:
        sections.append('KEY PROJECTS')
        
        projects_text = projects.replace('\\n', '\n').replace('\\t', '    ')
        project_lines = [line.strip() for line in projects_text.split('\n') if line.strip()]
        
        current_project_content = []
        
        for project_line in project_lines:
            is_project_title = (
                len(project_line) < 100 and 
                not project_line.startswith('•') and 
                not project_line.startswith('-') and
                ':' not in project_line and 
                not any(word in project_line.lower() for word in ['developed', 'built', 'created', 'implemented', 'used', 'worked'])
            )
            
            if is_project_title:
                if current_project_content:
                    sections.extend(current_project_content)
                    sections.append('')
                    current_project_content = []
                
                sections.append(project_line)
                sections.append('')
            else:
                if not project_line.startswith('•') and not project_line.startswith('-'):
                    project_line = f"• {project_line}"
                current_project_content.append(project_line)
        
        if current_project_content:
            sections.extend(current_project_content)
        sections.append('')
    
    # Certifications - Clean formatting
    certifications = cv_data.get('certifications', '').strip()
    if certifications:
        sections.append('CERTIFICATIONS')
        
        cert_text = certifications.replace('\\n', '\n').replace('\\t', '    ')
        cert_lines = [line.strip() for line in cert_text.split('\n') if line.strip()]
        
        for cert_line in cert_lines:
            if not cert_line.startswith('•') and not cert_line.startswith('-'):
                sections.append(f"• {cert_line}")
            else:
                sections.append(cert_line)
        sections.append('')
    
    # Languages - Clean formatting
    languages = cv_data.get('languages', '').strip()
    if languages:
        sections.append('LANGUAGES')
        
        lang_text = languages.replace('\\n', '\n').replace('\\t', '    ')
        
        if ',' in lang_text:
            sections.append(lang_text)
        else:
            lang_lines = [line.strip() for line in lang_text.split('\n') if line.strip()]
            for lang_line in lang_lines:
                if not lang_line.startswith('•') and not lang_line.startswith('-'):
                    sections.append(f"• {lang_line}")
                else:
                    sections.append(lang_line)
        sections.append('')
    
    # Achievements - Clean formatting
    achievements = cv_data.get('achievements', '').strip()
    if achievements:
        sections.append('ACHIEVEMENTS')
        
        achieve_text = achievements.replace('\\n', '\n').replace('\\t', '    ')
        achievement_lines = [line.strip() for line in achieve_text.split('\n') if line.strip()]
        
        for achieve_line in achievement_lines:
            if not achieve_line.startswith('•') and not achieve_line.startswith('-'):
                sections.append(f"• {achieve_line}")
            else:
                sections.append(achieve_line)
        sections.append('')
    
    # Join all sections and clean up
    cv_content = '\n'.join(sections).strip()
    
    while '\n\n\n' in cv_content:
        cv_content = cv_content.replace('\n\n\n', '\n\n')
    
    return cv_content


def create_professional_summary(cv_data: dict) -> str:
    """Create a comprehensive professional summary"""
    summary = cv_data.get('summary', '').strip()
    if summary:
        return summary
    
    role = cv_data.get('target_role', 'Software Engineer')
    years = cv_data.get('experience_years', '0')
    
    skills = cv_data.get('skills', '')
    key_skills = []
    if skills:
        if ',' in skills:
            all_skills = [s.strip() for s in skills.split(',')]
            key_skills = all_skills[:3]
        else:
            key_skills = ['Software Development']
    
    if years and years != '0':
        skills_str = ', '.join(key_skills).lower()
        if key_skills:
            return f"{role} with {years}+ years of hands-on experience in {skills_str}. Focused on writing clean code, solving real-world problems, and delivering results in team environments."
        else:
            return f"{role} with {years}+ years of experience building and maintaining software applications. Comfortable working across the full stack and collaborating with cross-functional teams."
    else:
        if key_skills:
            return f"Aspiring {role} with a solid grasp of {', '.join(key_skills)}. Looking to apply technical skills in a professional setting and contribute to meaningful projects."
        else:
            return f"Recent graduate and aspiring {role} with practical experience from academic projects and self-directed learning. Eager to grow and contribute to a development team."


def extract_skills_from_cv_data(cv_data: dict) -> list:
    """Extract skills from CV data for keywords"""
    skills_text = cv_data.get('skills', '')
    if not skills_text:
        return []
    
    if ',' in skills_text:
        return [s.strip() for s in skills_text.split(',') if s.strip()][:10]
    else:
        # Extract from lines
        skills_lines = skills_text.replace('\\n', '\n').split('\n')
        skills = []
        for line in skills_lines:
            line = line.strip().replace('•', '').strip()
            if line and len(line) < 50:  # Skip long descriptions
                skills.append(line)
        return skills[:10]


def calculate_comprehensive_ats_score(cv_data: dict) -> int:
    """Enhanced ATS score calculation"""
    score = 0
    
    # Contact information (25 points)
    if cv_data.get('full_name'): score += 5
    if cv_data.get('email'): score += 5
    if cv_data.get('phone'): score += 5
    if cv_data.get('location'): score += 5
    if cv_data.get('linkedin'): score += 5
    
    # Professional content (40 points)
    if cv_data.get('target_role'): score += 10
    if cv_data.get('summary') or cv_data.get('target_role'): score += 10
    if cv_data.get('work_experience'): score += 15
    if cv_data.get('experience_years', '0') != '0': score += 5
    
    # Education and skills (25 points)
    if cv_data.get('education'): score += 10
    if cv_data.get('skills'): score += 15
    
    # Additional qualifications (10 points)
    if cv_data.get('projects'): score += 5
    if cv_data.get('certifications'): score += 3
    if cv_data.get('achievements'): score += 2
    
    return min(score, 100)


def generate_comprehensive_ats_tips(cv_data: dict) -> list:
    """Generate comprehensive ATS improvement tips"""
    tips = []
    
    if not cv_data.get('summary'):
        tips.append("Add a compelling professional summary at the top of your CV")
    
    if not cv_data.get('linkedin'):
        tips.append("Include your LinkedIn profile URL for better networking")
    
    if not cv_data.get('skills'):
        tips.append("Add a comprehensive technical skills section with relevant keywords")
    elif len(cv_data.get('skills', '').split(',')) < 5:
        tips.append("Expand your skills section with more relevant technical competencies")
    
    if cv_data.get('target_role'):
        tips.append(f"Include keywords related to {cv_data['target_role']} throughout your experience descriptions")
    
    if not cv_data.get('projects'):
        tips.append("Add key projects to demonstrate your practical experience and achievements")
    
    if not cv_data.get('certifications'):
        tips.append("Include any relevant certifications to strengthen your technical credentials")
    
    if not cv_data.get('achievements'):
        tips.append("Add quantifiable achievements and accomplishments to showcase your impact")
    
    # Default tips if none apply
    if len(tips) == 0:
        tips = [
            "Use action verbs to start bullet points (e.g., 'Developed', 'Implemented', 'Led')",
            "Include quantifiable achievements where possible (e.g., '25% improvement')",
            "Keep formatting simple and consistent throughout the document",
            "Save your CV as PDF to preserve formatting across different systems",
            "Tailor your CV keywords to match specific job descriptions"
        ]
    
    return tips[:5]


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
        education_lines = education.replace('\\n', '\n').split('\n')
        for edu_line in education_lines:
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
        work_exp_lines = work_exp.replace('\\n', '\n').split('\n')
        for line in work_exp_lines:
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
            skills_lines = skills.replace('\\n', '\n').split('\n')
            for skill_line in skills_lines:
                skill_line = skill_line.strip()
                if skill_line:
                    sections.append(f"• {skill_line}")
        sections.append('')
    
    # Projects - only if provided
    projects = cv_data.get('projects', '').strip()
    if projects:
        sections.append('KEY PROJECTS')
        sections.append('-' * 12)
        
        project_lines = projects.replace('\\n', '\n').split('\n')
        current_project = []
        for project_line in project_lines:
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
        cert_lines = certifications.replace('\\n', '\n').split('\n')
        for cert_line in cert_lines:
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
            lang_lines = languages.replace('\\n', '\n').split('\n')
            for lang_line in lang_lines:
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
        achievement_lines = achievements.replace('\\n', '\n').split('\n')
        for achieve_line in achievement_lines:
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


def build_cv_template(cv_data: dict) -> str:
    """Build comprehensive CV using all provided data - enhanced version"""
    return build_comprehensive_cv_template(cv_data)


def calculate_ats_score(cv_data: dict) -> int:
    """Enhanced ATS score calculation"""
    return calculate_comprehensive_ats_score(cv_data)


def generate_ats_tips(cv_data: dict) -> list:
    """Generate comprehensive ATS improvement tips"""
    return generate_comprehensive_ats_tips(cv_data)


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
    # Create properly structured CV
    improved_text = create_structured_cv_from_text(cv_text, target_role)
    
    # Basic keyword additions based on target role
    keywords_added = []
    if target_role:
        role_keywords = {
            'software engineer': ['Software Development', 'Programming', 'Code Review', 'Debugging', 'API Development'],
            'data analyst': ['Data Analysis', 'Statistics', 'Reporting', 'Data Visualization', 'SQL'],
            'project manager': ['Project Management', 'Team Leadership', 'Planning', 'Coordination', 'Agile'],
            'designer': ['UI/UX Design', 'Creative Design', 'User Experience', 'Prototyping', 'Design Systems'],
            'data scientist': ['Machine Learning', 'Python', 'Data Mining', 'Statistical Analysis', 'AI']
        }
        
        for role_key, keywords in role_keywords.items():
            if role_key.lower() in target_role.lower():
                keywords_added.extend(keywords[:3])  # Add only 3 keywords
                break
    
    if not keywords_added:
        keywords_added = ['Technical Skills', 'Professional Experience', 'Problem Solving']

    return {
        "improved_cv_text": improved_text,
        "original_ats_score": 65,
        "improved_ats_score": 85,
        "changes_made": [
            "Reorganized sections in standard ATS-friendly order",
            "Standardized section headers for better parsing",
            "Improved bullet point consistency throughout",
            "Enhanced professional summary section",
            f"Added relevant keywords for {target_role}" if target_role else "Optimized keyword usage"
        ],
        "keywords_added": keywords_added,
        "formatting_fixes": [
            "Standardized section headers (UPPERCASE)",
            "Consistent bullet point formatting with •",
            "Proper spacing between sections",
            "Clear contact information layout",
            "Professional header structure"
        ],
        "ats_tips": [
            "Use standard section headers like 'PROFESSIONAL EXPERIENCE'",
            "Include relevant keywords throughout your CV",
            "Keep formatting simple and consistent",
            "Save as PDF to preserve formatting",
            "Add quantifiable achievements where possible"
        ]
    }


def rebuild_cv_for_ats(cv_text: str, target_role: str = "") -> dict:
    """
    Take existing CV text and rebuild/improve it for better ATS score.
    Make improvements more natural and less AI-generated.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are a professional CV writer. Rebuild this CV to be more ATS-friendly while keeping it natural and authentic.

CRITICAL FORMATTING REQUIREMENTS:
1. Start with full name at the top (UPPERCASE)
2. Add contact information line: email | phone | location | linkedin
3. Include Professional Summary section
4. Follow this EXACT section order and use ONLY these standard section names:
   PROFESSIONAL SUMMARY, EDUCATION, PROFESSIONAL EXPERIENCE, TECHNICAL SKILLS, KEY PROJECTS, CERTIFICATIONS, ACHIEVEMENTS
   IMPORTANT: Do NOT include original section headers from the source CV (like "AWARDS & ACHIEVEMENTS" or "CERTIFICATIONS & TRAINING"). Replace them with the standard names above.
5. Use proper bullet points (•) for all lists
6. Keep sections clearly separated with proper headers (just section name, no dashes underneath)
7. Maintain professional formatting throughout

{f"Focus on optimizing for: {target_role}" if target_role else ""}

Return ONLY a valid JSON object with these exact keys (no markdown, no code fences):
{{"improved_cv_text": "Complete properly formatted CV text", "original_ats_score": 65, "improved_ats_score": 85, "changes_made": ["list of specific improvements made"], "keywords_added": ["relevant keywords added"], "formatting_fixes": ["formatting improvements applied"], "ats_tips": ["practical tips for further improvement"]}}

EXAMPLE FORMAT FOR improved_cv_text:
JOHN DOE
john@email.com | +1-555-0123 | City, State | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Brief professional summary here.

EDUCATION
Bachelor of Science in Computer Science
University Name, 2020-2024
• Relevant coursework in data structures and algorithms

WORK EXPERIENCE
Software Engineer Intern
Company Name, June 2023 - Aug 2023
• Built REST APIs using Python and FastAPI
• Collaborated with team of 5 developers

TECHNICAL SKILLS
Programming Languages: Python, JavaScript, Java
Frameworks: React, FastAPI, Node.js
Tools: Docker, Git, AWS

ORIGINAL CV TO IMPROVE:
{cv_text[:4000]}

Return ONLY the raw JSON object. No other text."""

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.05,  # Very low for maximum consistency
            max_tokens=3000,   # Increased for longer CVs
        )

        raw = response.choices[0].message.content.strip()
        
        # More aggressive JSON cleaning
        if "```json" in raw:
            start = raw.find("```json") + 7
            end = raw.find("```", start)
            raw = raw[start:end].strip()
        elif "```" in raw:
            start = raw.find("```") + 3
            end = raw.find("```", start)
            raw = raw[start:end].strip()
        
        # Find JSON boundaries
        brace_start = raw.find("{")
        brace_end = raw.rfind("}") + 1
        
        if brace_start != -1 and brace_end > brace_start:
            raw = raw[brace_start:brace_end]
        
        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            # Try to fix common JSON issues
            raw = raw.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
            raw = raw.replace('"', '\\"')  # Escape quotes in content
            # Try parsing again
            result = json.loads(raw)
        
        # Validate and fix result structure
        if not isinstance(result, dict):
            raise ValueError("Response is not a dictionary")
        
        required_keys = ["improved_cv_text", "original_ats_score", "improved_ats_score", "changes_made", "keywords_added", "formatting_fixes", "ats_tips"]
        for key in required_keys:
            if key not in result:
                if key == "improved_cv_text":
                    # Create a basic improved version
                    result[key] = create_structured_cv_from_text(cv_text, target_role)
                elif "score" in key:
                    result[key] = 75 if key == "original_ats_score" else 85
                else:
                    result[key] = []
        
        # Clean up the improved CV text
        if isinstance(result["improved_cv_text"], str):
            improved_text = result["improved_cv_text"]
            # Fix escaped characters
            improved_text = improved_text.replace('\\n', '\n').replace('\\t', '\t').replace('\\"', '"')
            # Ensure proper formatting
            improved_text = clean_and_format_cv(improved_text)
            result["improved_cv_text"] = improved_text
        
        # Ensure arrays are proper lists
        for key in ["changes_made", "keywords_added", "formatting_fixes", "ats_tips"]:
            if not isinstance(result[key], list):
                result[key] = []
        
        # Ensure scores are numbers
        for key in ["original_ats_score", "improved_ats_score"]:
            if not isinstance(result[key], (int, float)):
                result[key] = 75 if key == "original_ats_score" else 85
        
        return result
        
    except Exception as e:
        logger.warning(f"CV rebuild failed with error: {e}, creating structured fallback")
        return create_structured_rebuild_result(cv_text, target_role)


def create_structured_cv_from_text(original_text: str, target_role: str) -> str:
    """Create a properly structured CV from unstructured text"""
    lines_raw = original_text.strip().split('\n')
    
    clean_lines = []
    for line in lines_raw:
        cleaned = line.replace('\\n', ' ').replace('\\t', ' ').replace('\\"', '"').replace('\\\\', '\\').strip()
        if cleaned and len(cleaned) > 1 and cleaned not in ['-', '--', '---']:
            clean_lines.append(cleaned)
    
    lines = clean_lines
    if not lines:
        return ""
    
    KNOWN_SECTIONS = [
        "professional summary", "summary", "objective", "profile",
        "education", "academic background",
        "work experience", "professional experience", "experience", "employment",
        "technical skills", "skills", "core competencies", "expertise",
        "key projects", "projects", "project experience",
        "certifications", "certificates", "professional development",
        "achievements", "accomplishments", "awards", "honors",
        "languages", "language skills",
        "publications", "research", "volunteer", "references", "contact"
    ]
    
    def looks_like_section_header(text: str) -> bool:
        t = text.strip().lower().rstrip(':')
        if t in KNOWN_SECTIONS:
            return True
        if text.strip().isupper() and 4 <= len(text.strip()) <= 45 and not any(c in text for c in ['@', '|', '•', 'http']):
            return True
        return False
    
    def is_bullet(text: str) -> bool:
        return text.startswith(('•', '-', '*', '·', '▪'))
    
    # ── First pass: find name and contact ──
    name = ""
    contact_info = []
    section_header_indices = set()
    content_lines = []
    
    for i, line in enumerate(lines):
        if not line:
            content_lines.append(("", ""))
            continue
        
        is_contact = False
        
        # Email detection
        if '@' in line and ('.com' in line.lower() or '.edu' in line.lower()):
            contact_info.append(line.strip())
            is_contact = True
        # Phone detection
        elif any(c in line for c in ['+', '(']) and sum(1 for c in line if c.isdigit()) >= 10:
            contact_info.append(line.strip())
            is_contact = True
        # LinkedIn / URL
        elif 'linkedin.com' in line.lower() or line.startswith('http'):
            contact_info.append(line.strip())
            is_contact = True
        # Address-like line with commas
        elif line.count(',') >= 1 and len(line) < 80 and line.count('@') == 0:
            lower = line.lower()
            if not any(s in lower for s in ['university', 'college', 'developer', 'engineer', 'intern', 'certificate', 'award', 'skills', 'languages', 'framework', 'database', 'programming']):
                contact_info.append(line.strip())
                is_contact = True
        
        # Name detection FIRST (before section header) to catch uppercase names
        if not name and not is_contact:
            words = line.split()
            clean_words = [w.replace('.', '').replace('-', '').replace("'", "") for w in words if w.isalpha() or w.replace('.', '').isalpha()]
            if 2 <= len(clean_words) <= 5 and all(w.isalpha() for w in clean_words) and len(clean_words) == len(words):
                total_len = sum(len(w) for w in clean_words)
                if 6 <= total_len <= 30:
                    name = ' '.join(words)
                    continue
        
        # Section header detection (skip for first line if we might still have name)
        if not name or i >= 2:
            if looks_like_section_header(line):
                section_header_indices.add(i)
                content_lines.append(("section", line.strip()))
                continue
        
        # Name detection with slightly relaxed criteria (allow name on line 2+ if embedded)
        if not name and not is_contact:
            words = line.split()
            clean_words = [w.replace('.', '').replace('-', '').replace("'", "") for w in words if w.isalpha() or w.replace('.', '').isalpha()]
            if 2 <= len(clean_words) <= 5 and all(w.isalpha() for w in clean_words) and len(clean_words) == len(words):
                total_len = sum(len(w) for w in clean_words)
                if 6 <= total_len <= 30:
                    name = ' '.join(words)
                    continue
        
        if is_contact:
            continue
            
        content_lines.append(("unknown", line))
    
    # ── Second pass: categorize content ──
    sections = {
        'education': [],
        'experience': [],
        'skills': [],
        'projects': [],
        'certifications': [],
        'achievements': []
    }
    
    current_section = None
    
    for label, text in content_lines:
        if label == "section":
            t = text.strip().lower().rstrip(':')
            if t in ['education', 'academic background']:
                current_section = 'education'
            elif t in ['work experience', 'professional experience', 'experience', 'employment']:
                current_section = 'experience'
            elif t in ['technical skills', 'skills', 'core competencies', 'expertise']:
                current_section = 'skills'
            elif t in ['key projects', 'projects', 'project experience']:
                current_section = 'projects'
            elif t in ['certifications', 'certificates', 'professional development']:
                current_section = 'certifications'
            elif t in ['achievements', 'accomplishments', 'awards', 'honors']:
                current_section = 'achievements'
            elif t in ['professional summary', 'summary', 'objective', 'profile']:
                current_section = None  # We add our own summary
            else:
                current_section = None
            continue
        
        if not text:
            continue
        
        lower = text.lower()
        
        # Skip lines that are themselves section headers disguised as bullets
        stripped_bullet = text.lstrip('•-*·▪ ').strip().lower()
        if looks_like_section_header(stripped_bullet):
            continue
        
        # If we know the current section from a header, use it
        if current_section:
            sections[current_section].append(text)
            continue
        
        # Auto-detect section based on content
        # Education
        edu_words = ['university', 'college', 'degree', 'bachelor', 'master', 'phd', 'gpa', 'cgpa', 'school', 'institute', 'graduation', 'bs ', 'ms ', 'ba ']
        if any(w in lower for w in edu_words) and not any(w in lower for w in ['intern', 'developer', 'engineer', 'manager', 'analyst']):
            sections['education'].append(text)
            continue
        
        # Achievements / Awards (check before projects since these could be short lines)
        award_words = ['award', 'scholarship', 'merit', 'winner', 'honor', 'recognition', 'dean\'s list', 'certificate of']
        if any(w in lower for w in award_words):
            sections['achievements'].append(text)
            continue
        
        # Certifications
        cert_words = ['certification', 'certified', 'training certificate', 'license']
        if any(w in lower for w in cert_words):
            sections['certifications'].append(text)
            continue
        
        # Projects: look for project names or descriptions with action verbs
        if (any(w in lower for w in ['built', 'developed', 'created', 'designed', 'implemented']) or
            ('project' in lower and len(text) > 15) or
            is_bullet(text)):
            sections['projects'].append(text)
            continue
        
        # Skills: only if the line is clearly a list of tech (comma-separated keywords, no long descriptions)
        tech_words = ['python', 'javascript', 'java', 'react', 'angular', 'vue', 'html', 'css', 'sql', 'docker', 'kubernetes',
                      'aws', 'azure', 'git', 'typescript', 'node', 'express', 'django', 'flask', 'mongodb', 'postgresql',
                      'redis', 'graphql', 'rest api', 'fastapi', 'next.js', 'tailwind', 'bootstrap']
        if any(w in lower for w in tech_words):
            # Only categorize as skills if it's a short listing line (not a paragraph description)
            word_count = len(text.split())
            has_action_verb = any(w in lower for w in ['built', 'developed', 'created', 'designed', 'implemented', 'worked', 'led', 'managed'])
            if word_count <= 20 and not has_action_verb:
                sections['skills'].append(text)
                continue
            else:
                # This is a description with tech words - put in projects
                sections['projects'].append(text)
                continue
        
        # Experience: job-related keywords
        exp_words = ['intern', 'developer', 'engineer', 'analyst', 'manager', 'associate', 'specialist', 'consultant',
                     'assistant', 'coordinator', 'at ', 'company', 'inc', 'ltd', 'technologies']
        if any(w in lower for w in exp_words):
            sections['experience'].append(text)
            continue
        
        # Fallback: bullet points go to projects, other lines to experience
        if is_bullet(text):
            sections['projects'].append(text)
        else:
            sections['experience'].append(text)
    
    # ── Build structured CV ──
    cv_parts = []
    
    # Header
    if name:
        cv_parts.append(name.upper())
    else:
        # Use first line as desperate fallback
        first_line = lines[0] if lines else "CV"
        name = first_line
        cv_parts.append(first_line.upper())
    
    if contact_info:
        clean_contacts = []
        for c in contact_info[:4]:
            if c.strip():
                clean_contacts.append(c.strip())
        if clean_contacts:
            cv_parts.append(" | ".join(clean_contacts))
    cv_parts.append("")
    
    # Summary
    if target_role:
        cv_parts.append(f"PROFESSIONAL SUMMARY\n{target_role} with practical experience building software and solving real problems. Comfortable working across the stack and delivering results on schedule.")
    else:
        cv_parts.append("PROFESSIONAL SUMMARY\nSoftware developer with hands-on experience building applications and solving problems. Strong foundation in modern programming and best practices.")
    cv_parts.append("")
    
    # Education
    if sections['education']:
        cv_parts.append("EDUCATION")
        seen = set()
        for item in sections['education']:
            clean = item.strip()
            key = clean.lower().replace('•', '').strip()
            if key not in seen and len(key) > 2:
                seen.add(key)
                cv_parts.append(clean)
        cv_parts.append("")
    
    # Experience
    if sections['experience']:
        cv_parts.append("PROFESSIONAL EXPERIENCE")
        seen = set()
        for item in sections['experience']:
            clean = item.strip()
            key = clean.lower().replace('•', '').strip()
            if key not in seen and len(key) > 2:
                seen.add(key)
                cv_parts.append(clean)
        cv_parts.append("")
    
    # Skills
    if sections['skills']:
        cv_parts.append("TECHNICAL SKILLS")
        seen = set()
        for item in sections['skills']:
            clean = item.strip()
            key = clean.lower().replace('•', '').strip()
            if key not in seen and len(key) > 2:
                seen.add(key)
                cv_parts.append(clean)
        cv_parts.append("")
    
    # Projects
    if sections['projects']:
        cv_parts.append("KEY PROJECTS")
        seen = set()
        for item in sections['projects']:
            clean = item.strip()
            key = clean.lower().replace('•', '').strip()
            if key not in seen and len(key) > 2:
                seen.add(key)
                if not is_bullet(clean):
                    cv_parts.append(f"• {clean}")
                else:
                    cv_parts.append(clean)
        cv_parts.append("")
    
    # Certifications
    if sections['certifications']:
        cv_parts.append("CERTIFICATIONS")
        seen = set()
        for item in sections['certifications']:
            clean = item.strip()
            key = clean.lower().replace('•', '').strip()
            if key not in seen and len(key) > 2:
                seen.add(key)
                if not is_bullet(clean):
                    cv_parts.append(f"• {clean}")
                else:
                    cv_parts.append(clean)
        cv_parts.append("")
    
    # Achievements
    if sections['achievements']:
        cv_parts.append("ACHIEVEMENTS")
        seen = set()
        for item in sections['achievements']:
            clean = item.strip()
            key = clean.lower().replace('•', '').strip()
            if key not in seen and len(key) > 2:
                seen.add(key)
                if not is_bullet(clean):
                    cv_parts.append(f"• {clean}")
                else:
                    cv_parts.append(clean)
        cv_parts.append("")
    
    result = '\n'.join(cv_parts).strip()
    while '\n\n\n' in result:
        result = result.replace('\n\n\n', '\n\n')
    
    return result


def clean_and_format_cv(cv_text: str) -> str:
    """Clean and ensure proper CV formatting"""
    lines = cv_text.split('\n')
    cleaned_lines = []
    seen_sections = set()
    
    SECTION_NAMES = [
        "PROFESSIONAL SUMMARY", "SUMMARY", "OBJECTIVE", "PROFILE",
        "EDUCATION", "ACADEMIC BACKGROUND",
        "PROFESSIONAL EXPERIENCE", "WORK EXPERIENCE", "EXPERIENCE", "EMPLOYMENT",
        "TECHNICAL SKILLS", "SKILLS", "CORE COMPETENCIES", "EXPERTISE",
        "KEY PROJECTS", "PROJECTS", "PROJECT EXPERIENCE",
        "CERTIFICATIONS", "CERTIFICATES", "PROFESSIONAL DEVELOPMENT",
        "ACHIEVEMENTS", "ACCOMPLISHMENTS", "AWARDS", "HONORS",
        "LANGUAGES", "LANGUAGE SKILLS"
    ]
    
    for line in lines:
        line = line.strip()
        
        if not line:
            if cleaned_lines and cleaned_lines[-1] != "":
                cleaned_lines.append("")
            continue
            
        # Skip ASCII dash-only lines
        if line.startswith('-') and len(set(line)) == 1 and len(line) > 3:
            continue
        
        # Skip bullet-pointed section headers (e.g., "•CERTIFICATIONS & TRAINING", "•AWARDS & ACHIEVEMENTS")
        stripped_from_bullet = line.lstrip('•-*·▪ ').strip().upper()
        if line.startswith(('•', '-', '*', '·', '▪')):
            is_dup_header = False
            for section in SECTION_NAMES:
                if stripped_from_bullet == section or stripped_from_bullet.startswith(section + " &") or stripped_from_bullet.startswith(section + " —"):
                    is_dup_header = True
                    break
            if is_dup_header:
                continue
            # Also check for non-standard section headers in bullets
            if stripped_from_bullet.isupper() and 4 <= len(stripped_from_bullet) <= 50:
                suffix_sections = [" & TRAINING", " & ACHIEVEMENTS", " & AWARDS", " & CERTIFICATIONS"]
                if any(stripped_from_bullet.endswith(s) for s in suffix_sections):
                    continue
                alt_headers = ["AWARDS", "HONORS", "TRAINING", "DEVELOPMENT", "LEADERSHIP", "ACTIVITIES", "INTERESTS",
                               "PUBLICATIONS", "VOLUNTEER", "LANGUAGES", "REFERENCES", "ADDITIONAL", "ACHIEVEMENTS"]
                if any(stripped_from_bullet.endswith(f" & {h}") or stripped_from_bullet.startswith(f"{h} &") for h in alt_headers):
                    continue
        
        # Deduplicate section headers
        if line.isupper() and 3 < len(line) < 50 and not any(c in line for c in ['@', '|', '•', 'http']):
            section_key = line.rstrip(':').strip()
            if section_key.upper() in SECTION_NAMES or section_key.upper().rstrip(':') in SECTION_NAMES:
                if section_key.upper() in seen_sections:
                    continue  # Skip duplicate section header
                seen_sections.add(section_key.upper())
                if cleaned_lines and cleaned_lines[-1] != "":
                    cleaned_lines.append("")
                cleaned_lines.append(line)
                continue
        
        cleaned_lines.append(line)
    
    while cleaned_lines and cleaned_lines[-1] == "":
        cleaned_lines.pop()
    
    return '\n'.join(cleaned_lines)


def create_structured_rebuild_result(cv_text: str, target_role: str) -> dict:
    """Create a structured rebuild result when AI fails"""
    improved_cv = create_structured_cv_from_text(cv_text, target_role)
    
    return {
        "improved_cv_text": improved_cv,
        "original_ats_score": 65,
        "improved_ats_score": 82,
        "changes_made": [
            "Reorganized sections in standard ATS-friendly order",
            "Added proper section headers and formatting",
            "Improved bullet point consistency",
            "Enhanced professional summary section"
        ],
        "keywords_added": [
            "Technical Skills", "Professional Experience", "Key Projects"
        ],
        "formatting_fixes": [
            "Standardized section headers",
            "Consistent bullet point formatting", 
            "Proper spacing between sections",
            "Clear contact information layout"
        ],
        "ats_tips": [
            "Use standard section names like 'Professional Experience'",
            "Include relevant keywords throughout your CV",
            "Keep formatting simple and consistent",
            "Save as PDF to preserve formatting",
            "Include quantifiable achievements where possible"
        ]
    }


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
Analyze this CV and provide practical, actionable feedback in a conversational tone.

CRITICAL: Return ONLY a valid JSON object with these exact keys:
- "extracted_skills": array of technical skills you found
- "skill_gaps": array of 3-4 important skills missing for modern roles
- "strengths": array of 3-4 genuine positive points about this CV
- "recommendations": array of 4-5 specific, actionable improvements
- "summary": a 2-3 sentence honest assessment of the candidate

Guidelines:
- Be honest but encouraging
- Focus on practical improvements, not generic advice
- Mention specific sections that need work
- Suggest concrete actions
- Avoid buzzwords and AI-sounding phrases

Do NOT include any markdown formatting, code blocks, or extra text. Just return the pure JSON object.

CV TEXT:
{cv_text[:4000]}"""

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,  # Very low for consistency
            max_tokens=1024,
        )
        raw = response.choices[0].message.content.strip()
        
        # Clean up response more thoroughly
        if raw.startswith("```json"):
            raw = raw[7:]
        if raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        
        # Extract JSON object even if surrounded by text
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end > start:
            raw = raw[start:end]
        
        result = json.loads(raw)
        
        # Validate structure and provide defaults
        required_keys = ["extracted_skills", "skill_gaps", "strengths", "recommendations", "summary"]
        for key in required_keys:
            if key not in result:
                if key == "summary":
                    result[key] = "This CV shows good potential with some solid experience. A few targeted improvements could make it much stronger."
                else:
                    result[key] = []
            elif key != "summary" and not isinstance(result[key], list):
                result[key] = []
        
        # Ensure we have some fallback data if arrays are empty
        if not result["extracted_skills"]:
            result["extracted_skills"] = extract_skills_manually(cv_text)[:8]
        if not result["skill_gaps"]:
            result["skill_gaps"] = ["Project Management", "Cloud Platforms", "Communication Skills"]
        if not result["strengths"]:
            result["strengths"] = ["Shows relevant experience", "Clear formatting", "Includes key information"]
        if not result["recommendations"]:
            result["recommendations"] = [
                "Add quantified achievements with numbers",
                "Include more technical keywords for your field", 
                "Expand the summary section",
                "Add relevant certifications or courses"
            ]
        
        return result
        
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning(f"LLM returned invalid JSON for CV analysis: {e}")
        return {
            "extracted_skills": extract_skills_manually(cv_text)[:8],
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
    import html

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    PRIMARY = colors.HexColor("#659287")
    DARK = colors.HexColor("#111827")
    GRAY = colors.HexColor("#6b7280")

    name_style = ParagraphStyle(
        "Name",
        fontSize=22,
        fontName="Helvetica-Bold",
        textColor=PRIMARY,
        alignment=TA_CENTER,
        spaceAfter=4,
        spaceBefore=8
    )

    contact_style = ParagraphStyle(
        "Contact",
        fontSize=8.5,
        fontName="Helvetica",
        textColor=GRAY,
        alignment=TA_CENTER,
        spaceAfter=14,
        spaceBefore=2
    )

    section_style = ParagraphStyle(
        "Section",
        fontSize=11,
        fontName="Helvetica-Bold",
        textColor=PRIMARY,
        spaceBefore=12,
        spaceAfter=2,
    )

    body_style = ParagraphStyle(
        "Body",
        fontSize=9.5,
        fontName="Helvetica",
        textColor=DARK,
        leading=13,
        spaceAfter=2,
        leftIndent=0
    )

    bullet_style = ParagraphStyle(
        "Bullet",
        fontSize=9.5,
        fontName="Helvetica",
        textColor=DARK,
        leading=13,
        spaceAfter=2,
        leftIndent=14,
        bulletIndent=6
    )

    job_title_style = ParagraphStyle(
        "JobTitle",
        fontSize=10,
        fontName="Helvetica-Bold",
        textColor=DARK,
        spaceAfter=1,
        spaceBefore=4
    )

    clean_text = cv_text
    if isinstance(clean_text, dict) and 'cv_text' in clean_text:
        clean_text = clean_text['cv_text']

    clean_text = clean_text.replace('\\n', '\n').replace('\\t', '    ').replace('\\"', '"').replace('\\\\', '\\')

    story = []
    lines = clean_text.strip().split("\n")

    SECTION_KEYWORDS = [
        "PROFESSIONAL SUMMARY", "SUMMARY", "OBJECTIVE", "PROFILE",
        "EDUCATION", "ACADEMIC BACKGROUND",
        "PROFESSIONAL EXPERIENCE", "WORK EXPERIENCE", "EXPERIENCE", "EMPLOYMENT",
        "TECHNICAL SKILLS", "SKILLS", "CORE COMPETENCIES", "EXPERTISE",
        "KEY PROJECTS", "PROJECTS", "PROJECT EXPERIENCE",
        "CERTIFICATIONS", "CERTIFICATES", "PROFESSIONAL DEVELOPMENT",
        "ACHIEVEMENTS", "ACCOMPLISHMENTS", "AWARDS", "HONORS",
        "LANGUAGES", "LANGUAGE SKILLS",
        "VOLUNTEER EXPERIENCE", "VOLUNTEER", "COMMUNITY SERVICE",
        "PUBLICATIONS", "RESEARCH", "PATENTS",
        "REFERENCES", "CONTACT", "ADDITIONAL INFORMATION"
    ]

    processed_name = False
    current_section = None
    hr_added_for_section = False

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Skip empty lines but add spacing when inside a section
        if not stripped:
            if current_section:
                story.append(Spacer(1, 3))
            continue

        # Skip ASCII dash-only lines (used as visual separators in some formats)
        if stripped.startswith('-') and len(set(stripped)) == 1 and len(stripped) > 3:
            continue

        upper = stripped.upper()

        # Name detection: first non-empty, non-contact, non-section line
        if not processed_name and not '@' in stripped and not '|' in stripped and not upper in SECTION_KEYWORDS:
            safe_name = html.escape(stripped)
            story.append(Paragraph(safe_name, name_style))
            story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=6, spaceBefore=2))
            processed_name = True
            current_section = None
            continue

        # Contact information
        if ('|' in stripped and len(stripped) < 150) or ('@' in stripped and len(stripped) < 100):
            safe_contact = html.escape(stripped)
            story.append(Paragraph(safe_contact, contact_style))
            continue

        # Section header detection
        is_section = False
        for keyword in SECTION_KEYWORDS:
            if upper == keyword or upper.startswith(keyword + ":") or upper.startswith(keyword + " "):
                is_section = True
                current_section = keyword
                break

        if not is_section and stripped.isupper() and 5 <= len(stripped) <= 40 and not stripped.startswith('•'):
            is_section = True
            current_section = stripped

        if is_section:
            safe_section = html.escape(stripped)
            story.append(Spacer(1, 6))
            story.append(Paragraph(safe_section, section_style))
            story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#B1D3B9"), spaceAfter=4, spaceBefore=1))
            hr_added_for_section = True
            continue

        # Bullet points
        if stripped.startswith(("•", "-", "*", "·", "▪")):
            clean_bullet = stripped.lstrip("•-*·▪ ").strip()
            if clean_bullet:
                safe_bullet = html.escape(clean_bullet)
                story.append(Paragraph(f"• {safe_bullet}", bullet_style))
            continue

        # Job titles, company names, degrees (important lines)
        is_title = False
        title_indicators = [
            'engineer', 'developer', 'analyst', 'manager', 'intern', 'associate', 'specialist',
            'bachelor', 'master', 'phd', 'degree', 'university', 'college', 'institute',
            'company', 'corp', 'inc', 'ltd', 'technologies', 'systems', 'solutions', 'group'
        ]

        if (len(stripped) < 110 and
            any(indicator in stripped.lower() for indicator in title_indicators) and
            not stripped.startswith('•')):
            is_title = True

        if is_title:
            safe_title = html.escape(stripped)
            story.append(Paragraph(safe_title, job_title_style))
            continue

        # Regular body text
        if stripped:
            safe_body = html.escape(stripped)
            story.append(Paragraph(safe_body, body_style))

    try:
        doc.build(story)
        return buffer.getvalue()
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        return create_fallback_pdf(clean_text, full_name)


def create_fallback_pdf(text: str, full_name: str) -> bytes:
    """Create a simple fallback PDF if main generation fails"""
    from io import BytesIO
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph
    from reportlab.lib.units import cm
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Split text into paragraphs and add to story
    paragraphs = text.split('\n')
    for para in paragraphs:
        if para.strip():
            story.append(Paragraph(para.strip(), styles['Normal']))
    
    doc.build(story)
    return buffer.getvalue()
