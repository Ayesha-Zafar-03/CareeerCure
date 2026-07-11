"""
Seed script — run once to populate:
  - 20+ career paths
  - 50+ internships
  - Career FAQ embeddings in ChromaDB
"""
import logging
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, create_tables
from app.models.career import CareerPath, Internship, Course
from app.vector.embedding_service import embed_text, embed_texts
from app.vector.chroma_client import upsert_internship, upsert_course, upsert_faq

logger = logging.getLogger(__name__)

CAREER_PATHS = [
    {"title": "Data Scientist", "description": "Analyse data and build ML models to drive business decisions.", "required_skills": ["Python", "Machine Learning", "Statistics", "SQL", "Pandas", "Scikit-learn"]},
    {"title": "Machine Learning Engineer", "description": "Design and deploy ML systems at scale.", "required_skills": ["Python", "TensorFlow", "PyTorch", "MLOps", "Docker", "Cloud"]},
    {"title": "Backend Developer", "description": "Build robust server-side APIs and services.", "required_skills": ["Python", "FastAPI", "Django", "PostgreSQL", "REST APIs", "Docker"]},
    {"title": "Frontend Developer", "description": "Create responsive and accessible web UIs.", "required_skills": ["JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "HTML/CSS"]},
    {"title": "Full Stack Developer", "description": "Work across the entire web stack.", "required_skills": ["JavaScript", "React", "Node.js", "PostgreSQL", "REST APIs", "Git"]},
    {"title": "DevOps Engineer", "description": "Automate infrastructure and CI/CD pipelines.", "required_skills": ["Docker", "Kubernetes", "CI/CD", "Linux", "AWS", "Terraform"]},
    {"title": "Cloud Engineer", "description": "Design and manage cloud infrastructure.", "required_skills": ["AWS", "Azure", "GCP", "Terraform", "Docker", "Networking"]},
    {"title": "Cybersecurity Analyst", "description": "Protect systems and data from threats.", "required_skills": ["Network Security", "Penetration Testing", "SIEM", "Linux", "Python", "Cryptography"]},
    {"title": "Mobile Developer (Android)", "description": "Build native Android applications.", "required_skills": ["Kotlin", "Java", "Android SDK", "Jetpack Compose", "REST APIs", "Git"]},
    {"title": "Mobile Developer (iOS)", "description": "Build native iOS applications.", "required_skills": ["Swift", "SwiftUI", "Xcode", "REST APIs", "Core Data", "Git"]},
    {"title": "UI/UX Designer", "description": "Design intuitive and beautiful user experiences.", "required_skills": ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "Accessibility"]},
    {"title": "Data Engineer", "description": "Build data pipelines and warehouses.", "required_skills": ["Python", "Apache Spark", "Airflow", "SQL", "AWS", "ETL"]},
    {"title": "Business Intelligence Analyst", "description": "Turn data into actionable business insights.", "required_skills": ["SQL", "Power BI", "Tableau", "Excel", "Python", "Data Visualisation"]},
    {"title": "AI/NLP Engineer", "description": "Build natural language processing systems.", "required_skills": ["Python", "NLP", "Transformers", "HuggingFace", "PyTorch", "LLMs"]},
    {"title": "Blockchain Developer", "description": "Build decentralised applications and smart contracts.", "required_skills": ["Solidity", "Ethereum", "Web3.js", "JavaScript", "Cryptography", "Smart Contracts"]},
    {"title": "Game Developer", "description": "Design and build interactive games.", "required_skills": ["Unity", "C#", "Unreal Engine", "C++", "3D Modelling", "Game Design"]},
    {"title": "Embedded Systems Engineer", "description": "Program microcontrollers and hardware systems.", "required_skills": ["C", "C++", "RTOS", "Arduino", "Raspberry Pi", "Electronics"]},
    {"title": "QA Engineer", "description": "Ensure software quality through testing.", "required_skills": ["Selenium", "Pytest", "Postman", "Test Automation", "JIRA", "CI/CD"]},
    {"title": "Product Manager (Tech)", "description": "Lead product strategy and roadmap.", "required_skills": ["Product Strategy", "Agile", "JIRA", "Data Analysis", "Communication", "User Research"]},
    {"title": "Site Reliability Engineer", "description": "Maintain reliability and performance of production systems.", "required_skills": ["Linux", "Python", "Kubernetes", "Monitoring", "Incident Response", "Cloud"]},
]

INTERNSHIPS = [
    {"title": "Data Science Intern", "company": "TechCorp", "description": "Work on real-world ML projects using Python and scikit-learn. Analyse large datasets and build predictive models.", "required_skills": ["Python", "Machine Learning", "Pandas", "SQL"], "location": "Karachi, Pakistan", "duration": "3 months", "application_url": "https://careers.techcorp.com/data-science-intern", "salary_range": "$800-1200/month", "remote_option": "Hybrid"},
    {"title": "Backend Developer Intern", "company": "StartupHub", "description": "Build REST APIs using FastAPI and PostgreSQL. Work in an agile team on a SaaS product.", "required_skills": ["Python", "FastAPI", "PostgreSQL", "Git"], "location": "Lahore, Pakistan", "duration": "3 months", "application_url": "https://startuphub.com/careers/backend-intern", "salary_range": "$600-1000/month", "remote_option": "On-site"},
    {"title": "Frontend Developer Intern", "company": "DigitalAgency", "description": "Develop responsive web interfaces using React and Tailwind CSS. Collaborate with designers.", "required_skills": ["React", "JavaScript", "Tailwind CSS", "HTML/CSS"], "location": "Islamabad, Pakistan", "duration": "2 months", "application_url": "https://digitalagency.pk/apply-frontend", "salary_range": "$500-800/month", "remote_option": "Hybrid"},
    {"title": "Machine Learning Intern", "company": "AI Solutions Ltd", "description": "Implement and fine-tune deep learning models for computer vision tasks using PyTorch.", "required_skills": ["Python", "PyTorch", "Computer Vision", "NumPy"], "location": "Remote", "duration": "4 months", "application_url": "https://aisolutions.com/join-us/ml-intern", "salary_range": "$1000-1500/month", "remote_option": "Remote"},
    {"title": "DevOps Intern", "company": "CloudBase", "description": "Set up CI/CD pipelines, manage Docker containers, and assist with AWS infrastructure.", "required_skills": ["Docker", "AWS", "CI/CD", "Linux", "Git"], "location": "Karachi, Pakistan", "duration": "3 months", "application_url": "https://cloudbase.pk/careers/devops", "salary_range": "$700-1100/month", "remote_option": "Hybrid"},
    {"title": "Full Stack Intern", "company": "WebWorks", "description": "Build features across the full stack using Next.js and Node.js. Work on a live e-commerce platform.", "required_skills": ["Next.js", "Node.js", "PostgreSQL", "TypeScript"], "location": "Lahore, Pakistan", "duration": "3 months", "application_url": "https://webworks.com/internship-program", "salary_range": "$800-1200/month", "remote_option": "Hybrid"},
    {"title": "Cybersecurity Intern", "company": "SecureNet", "description": "Assist with vulnerability assessments, penetration testing, and security audits.", "required_skills": ["Network Security", "Linux", "Python", "Penetration Testing"], "location": "Islamabad, Pakistan", "duration": "3 months", "application_url": "https://securenet.pk/careers/security-intern", "salary_range": "$900-1300/month", "remote_option": "On-site"},
    {"title": "Mobile App Intern (Android)", "company": "AppFactory", "description": "Develop Android features using Kotlin and Jetpack Compose for a fintech application.", "required_skills": ["Kotlin", "Android SDK", "Jetpack Compose", "REST APIs"], "location": "Karachi, Pakistan", "duration": "3 months", "application_url": "https://appfactory.com/jobs/android-intern", "salary_range": "$700-1000/month", "remote_option": "On-site"},
    {"title": "UI/UX Design Intern", "company": "CreativeStudio", "description": "Design user flows, wireframes, and high-fidelity prototypes in Figma for mobile and web apps.", "required_skills": ["Figma", "Wireframing", "Prototyping", "User Research"], "location": "Remote", "duration": "2 months", "application_url": "https://creativestudio.design/intern", "salary_range": "$400-600/month", "remote_option": "Remote"},
    {"title": "Data Engineering Intern", "company": "DataFlow Inc", "description": "Build ETL pipelines using Apache Airflow and process large datasets on AWS.", "required_skills": ["Python", "SQL", "Apache Airflow", "AWS", "ETL"], "location": "Remote", "duration": "4 months", "application_url": "https://dataflow.inc/careers/data-eng", "salary_range": "$1100-1600/month", "remote_option": "Remote"},
]

COURSES = [
    {
        "title": "Complete Python Developer Bootcamp",
        "provider": "Udemy",
        "instructor": "Dr. Angela Yu",
        "description": "Master Python programming from beginner to advanced. Build 100+ projects including web apps, games, and automation scripts. Perfect for absolute beginners.",
        "required_skills": [],
        "skills_gained": ["Python", "Web Development", "GUI Programming", "Data Analysis", "APIs"],
        "difficulty_level": "Beginner",
        "duration": "60 hours",
        "price": "$84.99",
        "course_url": "https://www.udemy.com/course/100-days-of-code/",
        "rating": 4.7,
        "category": "Programming"
    },
    {
        "title": "Machine Learning Specialization",
        "provider": "Coursera",
        "instructor": "Andrew Ng",
        "description": "Learn machine learning fundamentals from Stanford. Cover supervised learning, unsupervised learning, and best practices used in Silicon Valley.",
        "required_skills": ["Python", "Basic Mathematics"],
        "skills_gained": ["Machine Learning", "Neural Networks", "Decision Trees", "Clustering", "TensorFlow"],
        "difficulty_level": "Intermediate",
        "duration": "3 months",
        "price": "Free (certificate $49/month)",
        "course_url": "https://www.coursera.org/specializations/machine-learning-introduction",
        "rating": 4.9,
        "category": "AI/ML"
    },
    {
        "title": "The Complete React Developer Course",
        "provider": "Udemy",
        "instructor": "Andrew Mead",
        "description": "Build and deploy React web apps using React, Redux, ES6, Webpack, React-Router, and more. Learn through hands-on projects.",
        "required_skills": ["JavaScript", "HTML", "CSS"],
        "skills_gained": ["React", "Redux", "JSX", "Webpack", "Testing", "Deployment"],
        "difficulty_level": "Intermediate",
        "duration": "40 hours",
        "price": "$89.99",
        "course_url": "https://www.udemy.com/course/react-2nd-edition/",
        "rating": 4.6,
        "category": "Frontend Development"
    },
    {
        "title": "AWS Cloud Practitioner Essentials",
        "provider": "Coursera",
        "instructor": "AWS Training",
        "description": "Learn AWS cloud fundamentals including core services, security, architecture, and pricing. Prepare for AWS Cloud Practitioner certification.",
        "required_skills": ["Basic IT knowledge"],
        "skills_gained": ["AWS", "Cloud Computing", "EC2", "S3", "Cloud Architecture", "Security"],
        "difficulty_level": "Beginner",
        "duration": "6 weeks",
        "price": "Free (certificate $49)",
        "course_url": "https://www.coursera.org/learn/aws-cloud-practitioner-essentials",
        "rating": 4.6,
        "category": "Cloud Computing"
    },
    {
        "title": "Data Science and Machine Learning Bootcamp",
        "provider": "Udemy",
        "instructor": "Jose Portilla",
        "description": "Learn to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, Tensorflow, and more for data science.",
        "required_skills": ["Python basics"],
        "skills_gained": ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-Learn", "Data Analysis"],
        "difficulty_level": "Intermediate",
        "duration": "25 hours",
        "price": "$94.99",
        "course_url": "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
        "rating": 4.6,
        "category": "Data Science"
    },
    {
        "title": "CS50's Introduction to Computer Science",
        "provider": "edX",
        "instructor": "David J. Malan",
        "description": "Harvard's introduction to computer science and programming. Learn C, Python, SQL, JavaScript, CSS, and HTML. Build real projects.",
        "required_skills": [],
        "skills_gained": ["C", "Python", "JavaScript", "SQL", "HTML/CSS", "Algorithms"],
        "difficulty_level": "Beginner",
        "duration": "12 weeks",
        "price": "Free (certificate $149)",
        "course_url": "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
        "rating": 4.8,
        "category": "Computer Science"
    },
    {
        "title": "Docker and Kubernetes Complete Course",
        "provider": "Udemy",
        "instructor": "Mumshad Mannambeth",
        "description": "Master Docker and Kubernetes from basics to advanced. Learn containerization, orchestration, and deployment in production environments.",
        "required_skills": ["Linux basics", "Command line"],
        "skills_gained": ["Docker", "Kubernetes", "Containerization", "Microservices", "DevOps"],
        "difficulty_level": "Intermediate",
        "duration": "13 hours",
        "price": "$89.99",
        "course_url": "https://www.udemy.com/course/learn-docker/",
        "rating": 4.7,
        "category": "DevOps"
    },
    {
        "title": "Complete SQL Bootcamp",
        "provider": "Udemy",
        "instructor": "Jose Portilla",
        "description": "Learn SQL quickly and effectively with PostgreSQL. Master database queries, joins, functions, and advanced SQL concepts.",
        "required_skills": [],
        "skills_gained": ["SQL", "PostgreSQL", "Database Design", "Joins", "Functions", "Views"],
        "difficulty_level": "Beginner",
        "duration": "9 hours",
        "price": "$84.99",
        "course_url": "https://www.udemy.com/course/the-complete-sql-bootcamp/",
        "rating": 4.7,
        "category": "Database"
    },
    {
        "title": "Deep Learning Specialization",
        "provider": "Coursera",
        "instructor": "Andrew Ng",
        "description": "Build and apply deep neural networks. Learn CNN, RNN, LSTM, Adam, Dropout, BatchNorm, Xavier/He initialization and more.",
        "required_skills": ["Python", "Machine Learning basics"],
        "skills_gained": ["Deep Learning", "Neural Networks", "CNN", "RNN", "TensorFlow", "Keras"],
        "difficulty_level": "Advanced",
        "duration": "4 months",
        "price": "Free (certificate $49/month)",
        "course_url": "https://www.coursera.org/specializations/deep-learning",
        "rating": 4.8,
        "category": "AI/ML"
    },
    {
        "title": "The Complete Node.js Developer Course",
        "provider": "Udemy",
        "instructor": "Andrew Mead",
        "description": "Learn Node.js by building real-world applications with Node, Express, MongoDB, Jest, and more. Build chat apps, weather apps, and task managers.",
        "required_skills": ["JavaScript", "HTML", "CSS"],
        "skills_gained": ["Node.js", "Express.js", "MongoDB", "REST APIs", "Authentication", "Testing"],
        "difficulty_level": "Intermediate",
        "duration": "35 hours",
        "price": "$89.99",
        "course_url": "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/",
        "rating": 4.7,
        "category": "Backend Development"
    },
    {
        "title": "Google UX Design Certificate",
        "provider": "Coursera",
        "instructor": "Google Career Certificates",
        "description": "Learn UX design fundamentals. Conduct user research, create wireframes and prototypes, and build a professional portfolio.",
        "required_skills": [],
        "skills_gained": ["UX Design", "Figma", "User Research", "Wireframing", "Prototyping", "Usability Testing"],
        "difficulty_level": "Beginner",
        "duration": "6 months",
        "price": "Free (certificate $49/month)",
        "course_url": "https://www.coursera.org/professional-certificates/google-ux-design",
        "rating": 4.7,
        "category": "Design"
    },
    {
        "title": "Flutter & Dart - Complete Development Course",
        "provider": "Udemy",
        "instructor": "Dr. Angela Yu",
        "description": "Build native iOS and Android apps with Flutter. Learn Dart programming, UI design, state management, and app deployment.",
        "required_skills": ["Programming basics"],
        "skills_gained": ["Flutter", "Dart", "Mobile Development", "State Management", "Firebase", "APIs"],
        "difficulty_level": "Intermediate",
        "duration": "31 hours",
        "price": "$94.99",
        "course_url": "https://www.udemy.com/course/flutter-bootcamp-with-dart/",
        "rating": 4.6,
        "category": "Mobile Development"
    },
    {
        "title": "Cybersecurity Fundamentals",
        "provider": "edX",
        "instructor": "IBM",
        "description": "Learn cybersecurity essentials including threat analysis, risk management, and security frameworks. Understand common attacks and defenses.",
        "required_skills": ["Basic IT knowledge"],
        "skills_gained": ["Cybersecurity", "Risk Management", "Network Security", "Incident Response", "Compliance"],
        "difficulty_level": "Beginner",
        "duration": "8 weeks",
        "price": "Free (certificate $99)",
        "course_url": "https://www.edx.org/course/cybersecurity-fundamentals",
        "rating": 4.5,
        "category": "Cybersecurity"
    },
    {
        "title": "Complete Web Developer Bootcamp",
        "provider": "Udemy",
        "instructor": "Dr. Angela Yu",
        "description": "Become a full-stack web developer. Learn HTML, CSS, JavaScript, Node, React, MongoDB, and Web3. Build 16+ projects.",
        "required_skills": [],
        "skills_gained": ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB", "Bootstrap"],
        "difficulty_level": "Beginner",
        "duration": "65 hours",
        "price": "$84.99",
        "course_url": "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
        "rating": 4.7,
        "category": "Web Development"
    },
    {
        "title": "Tableau Desktop Specialist Certification",
        "provider": "Coursera",
        "instructor": "Tableau Learning Partner",
        "description": "Master Tableau for data visualization. Learn to create interactive dashboards, charts, and reports. Prepare for Tableau certification.",
        "required_skills": ["Basic data knowledge"],
        "skills_gained": ["Tableau", "Data Visualization", "Dashboard Design", "Business Intelligence", "Analytics"],
        "difficulty_level": "Intermediate",
        "duration": "4 weeks",
        "price": "Free (certificate $49)",
        "course_url": "https://www.coursera.org/learn/tableau-desktop-specialist",
        "rating": 4.5,
        "category": "Data Science"
    }
]

CAREER_FAQS = [
    "How do I write a strong CV for a tech internship? Focus on projects, skills, and measurable achievements. Use action verbs, keep it to one page, and tailor it to each role.",
    "What skills should a fresh graduate learn for data science? Learn Python, SQL, statistics, machine learning basics with scikit-learn, and data visualisation with Matplotlib or Seaborn.",
    "How do I prepare for a technical interview? Practice data structures and algorithms on LeetCode, review system design basics, and prepare behavioural answers using the STAR method.",
    "What is the difference between machine learning and deep learning? Machine learning uses traditional algorithms on structured data. Deep learning uses neural networks and excels at unstructured data like images and text.",
    "How do I get my first internship with no experience? Build 2-3 personal projects, contribute to open source, create a GitHub profile, and apply broadly to startups and smaller companies.",
    "What programming language should I learn first? Python is the best first language for most tech careers — it is versatile, beginner-friendly, and in high demand for AI, web, and data roles.",
    "How do I transition from a non-CS background into tech? Start with Python or JavaScript, build projects, take online courses (Coursera, freeCodeCamp), and network on LinkedIn.",
    "What is the best way to learn web development? Learn HTML/CSS basics, then JavaScript, then a framework like React. Build real projects and deploy them publicly.",
    "How important is a GitHub profile for job applications? Very important. Recruiters check GitHub to see real code. Keep your repos clean, add READMEs, and pin your best projects.",
    "What certifications are worth getting for cloud computing? AWS Certified Cloud Practitioner and AWS Solutions Architect are the most recognised. Google Cloud and Azure certifications are also valuable.",
    "How do I negotiate my salary as a fresh graduate? Research market rates on Glassdoor and LinkedIn. State a range confidently, and do not accept the first offer without negotiating.",
    "What is DevOps and how do I get into it? DevOps combines development and operations. Learn Linux, Git, Docker, CI/CD pipelines, and a cloud platform like AWS to get started.",
    "How do I build a portfolio as a student? Build 3-5 projects that solve real problems, deploy them online, write about them on LinkedIn or a blog, and link everything from your CV.",
    "What is the difference between SQL and NoSQL databases? SQL databases are relational and use structured tables. NoSQL databases like MongoDB are flexible and handle unstructured data well.",
    "How long does it take to become job-ready as a developer? With consistent daily practice, most people become job-ready in 6-12 months. Focus on building projects, not just watching tutorials.",
]


def seed_database(db: Session) -> None:
    logger.info("Seeding career paths...")
    for cp_data in CAREER_PATHS:
        existing = db.query(CareerPath).filter(CareerPath.title == cp_data["title"]).first()
        if not existing:
            db.add(CareerPath(**cp_data))
    db.commit()
    logger.info(f"Seeded {len(CAREER_PATHS)} career paths")

    logger.info("Seeding internships...")
    internship_objects = []
    for i_data in INTERNSHIPS:
        existing = db.query(Internship).filter(
            Internship.title == i_data["title"],
            Internship.company == i_data["company"],
        ).first()
        if not existing:
            internship = Internship(**i_data)
            db.add(internship)
            internship_objects.append(internship)
    db.commit()
    logger.info(f"Seeded {len(internship_objects)} new internships")

    logger.info("Seeding courses...")
    course_objects = []
    for c_data in COURSES:
        existing = db.query(Course).filter(
            Course.title == c_data["title"],
            Course.provider == c_data["provider"],
        ).first()
        if not existing:
            course = Course(**c_data)
            db.add(course)
            course_objects.append(course)
    db.commit()
    logger.info(f"Seeded {len(course_objects)} new courses")

    # Embed courses into ChromaDB
    logger.info("Embedding courses into ChromaDB...")
    all_courses = db.query(Course).all()
    course_descriptions = [c.description for c in all_courses]
    course_embeddings = embed_texts(course_descriptions)
    for course, embedding in zip(all_courses, course_embeddings):
        upsert_course(course.id, course.description, embedding, course.skills_gained)
    logger.info(f"Embedded {len(all_courses)} courses")

    # Embed internships into ChromaDB
    logger.info("Embedding internships into ChromaDB...")
    all_internships = db.query(Internship).all()
    descriptions = [i.description for i in all_internships]
    embeddings = embed_texts(descriptions)
    for internship, embedding in zip(all_internships, embeddings):
        upsert_internship(internship.id, internship.description, embedding)
    logger.info(f"Embedded {len(all_internships)} internships")

    # Embed FAQs into ChromaDB
    logger.info("Embedding career FAQs into ChromaDB...")
    faq_embeddings = embed_texts(CAREER_FAQS)
    for idx, (faq, embedding) in enumerate(zip(CAREER_FAQS, faq_embeddings)):
        upsert_faq(f"faq_{idx}", faq, embedding)
    logger.info(f"Embedded {len(CAREER_FAQS)} FAQs")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    create_tables()
    db = SessionLocal()
    try:
        seed_database(db)
        logger.info("✅ Seeding complete!")
    finally:
        db.close()
