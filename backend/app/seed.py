"""
Seed script — run once to populate:
  - 20+ career paths
  - 50+ internships
  - Career FAQ embeddings in ChromaDB
"""
import logging
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, create_tables
from app.models.career import CareerPath, Internship
from app.vector.embedding_service import embed_text, embed_texts
from app.vector.chroma_client import upsert_internship, upsert_faq

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
    {"title": "Data Science Intern", "company": "TechCorp", "description": "Work on real-world ML projects using Python and scikit-learn. Analyse large datasets and build predictive models.", "required_skills": ["Python", "Machine Learning", "Pandas", "SQL"], "location": "Karachi, Pakistan", "duration": "3 months"},
    {"title": "Backend Developer Intern", "company": "StartupHub", "description": "Build REST APIs using FastAPI and PostgreSQL. Work in an agile team on a SaaS product.", "required_skills": ["Python", "FastAPI", "PostgreSQL", "Git"], "location": "Lahore, Pakistan", "duration": "3 months"},
    {"title": "Frontend Developer Intern", "company": "DigitalAgency", "description": "Develop responsive web interfaces using React and Tailwind CSS. Collaborate with designers.", "required_skills": ["React", "JavaScript", "Tailwind CSS", "HTML/CSS"], "location": "Islamabad, Pakistan", "duration": "2 months"},
    {"title": "Machine Learning Intern", "company": "AI Solutions Ltd", "description": "Implement and fine-tune deep learning models for computer vision tasks using PyTorch.", "required_skills": ["Python", "PyTorch", "Computer Vision", "NumPy"], "location": "Remote", "duration": "4 months"},
    {"title": "DevOps Intern", "company": "CloudBase", "description": "Set up CI/CD pipelines, manage Docker containers, and assist with AWS infrastructure.", "required_skills": ["Docker", "AWS", "CI/CD", "Linux", "Git"], "location": "Karachi, Pakistan", "duration": "3 months"},
    {"title": "Full Stack Intern", "company": "WebWorks", "description": "Build features across the full stack using Next.js and Node.js. Work on a live e-commerce platform.", "required_skills": ["Next.js", "Node.js", "PostgreSQL", "TypeScript"], "location": "Lahore, Pakistan", "duration": "3 months"},
    {"title": "Cybersecurity Intern", "company": "SecureNet", "description": "Assist with vulnerability assessments, penetration testing, and security audits.", "required_skills": ["Network Security", "Linux", "Python", "Penetration Testing"], "location": "Islamabad, Pakistan", "duration": "3 months"},
    {"title": "Mobile App Intern (Android)", "company": "AppFactory", "description": "Develop Android features using Kotlin and Jetpack Compose for a fintech application.", "required_skills": ["Kotlin", "Android SDK", "Jetpack Compose", "REST APIs"], "location": "Karachi, Pakistan", "duration": "3 months"},
    {"title": "UI/UX Design Intern", "company": "CreativeStudio", "description": "Design user flows, wireframes, and high-fidelity prototypes in Figma for mobile and web apps.", "required_skills": ["Figma", "Wireframing", "Prototyping", "User Research"], "location": "Remote", "duration": "2 months"},
    {"title": "Data Engineering Intern", "company": "DataFlow Inc", "description": "Build ETL pipelines using Apache Airflow and process large datasets on AWS.", "required_skills": ["Python", "SQL", "Apache Airflow", "AWS", "ETL"], "location": "Remote", "duration": "4 months"},
    {"title": "NLP Research Intern", "company": "LinguaTech", "description": "Research and implement NLP models for Arabic and Urdu text classification using HuggingFace.", "required_skills": ["Python", "NLP", "HuggingFace", "Transformers", "PyTorch"], "location": "Remote", "duration": "3 months"},
    {"title": "Cloud Infrastructure Intern", "company": "CloudFirst", "description": "Provision and manage cloud resources on AWS using Terraform and CloudFormation.", "required_skills": ["AWS", "Terraform", "Linux", "Networking", "Docker"], "location": "Lahore, Pakistan", "duration": "3 months"},
    {"title": "QA Automation Intern", "company": "QualityFirst", "description": "Write automated test suites using Selenium and Pytest for a web application.", "required_skills": ["Selenium", "Pytest", "Python", "Test Automation", "JIRA"], "location": "Karachi, Pakistan", "duration": "2 months"},
    {"title": "Business Intelligence Intern", "company": "InsightCo", "description": "Build Power BI dashboards and write SQL queries to support business decision-making.", "required_skills": ["SQL", "Power BI", "Excel", "Data Visualisation"], "location": "Islamabad, Pakistan", "duration": "3 months"},
    {"title": "Blockchain Developer Intern", "company": "ChainLabs", "description": "Develop and test Ethereum smart contracts using Solidity for a DeFi platform.", "required_skills": ["Solidity", "Ethereum", "Web3.js", "JavaScript"], "location": "Remote", "duration": "3 months"},
    {"title": "Game Development Intern", "company": "PixelForge", "description": "Build game mechanics and UI in Unity using C# for a mobile puzzle game.", "required_skills": ["Unity", "C#", "Game Design", "3D Modelling"], "location": "Lahore, Pakistan", "duration": "3 months"},
    {"title": "Embedded Systems Intern", "company": "HardwareTech", "description": "Program microcontrollers in C/C++ for IoT sensor devices.", "required_skills": ["C", "C++", "Arduino", "RTOS", "Electronics"], "location": "Karachi, Pakistan", "duration": "4 months"},
    {"title": "Product Management Intern", "company": "ProductLab", "description": "Assist with product roadmap planning, user research, and sprint management.", "required_skills": ["Agile", "JIRA", "User Research", "Communication", "Data Analysis"], "location": "Remote", "duration": "3 months"},
    {"title": "SRE Intern", "company": "ReliableOps", "description": "Monitor production systems, respond to incidents, and improve observability using Prometheus and Grafana.", "required_skills": ["Linux", "Python", "Kubernetes", "Monitoring", "Cloud"], "location": "Remote", "duration": "3 months"},
    {"title": "Python Developer Intern", "company": "CodeCraft", "description": "Build automation scripts and internal tools using Python and Django.", "required_skills": ["Python", "Django", "REST APIs", "PostgreSQL", "Git"], "location": "Lahore, Pakistan", "duration": "2 months"},
    {"title": "React Developer Intern", "company": "UIBuilders", "description": "Develop reusable React components and integrate with backend APIs.", "required_skills": ["React", "TypeScript", "REST APIs", "CSS", "Git"], "location": "Karachi, Pakistan", "duration": "3 months"},
    {"title": "Data Analyst Intern", "company": "AnalyticsPro", "description": "Analyse customer data using Python and SQL, create visualisations with Matplotlib and Seaborn.", "required_skills": ["Python", "SQL", "Pandas", "Data Visualisation", "Excel"], "location": "Islamabad, Pakistan", "duration": "3 months"},
    {"title": "iOS Developer Intern", "company": "AppleDevs", "description": "Build iOS features using Swift and SwiftUI for a health tracking application.", "required_skills": ["Swift", "SwiftUI", "Xcode", "REST APIs", "Core Data"], "location": "Remote", "duration": "3 months"},
    {"title": "AI Research Intern", "company": "ResearchAI", "description": "Assist researchers in implementing and evaluating state-of-the-art AI models.", "required_skills": ["Python", "PyTorch", "Machine Learning", "Research", "LaTeX"], "location": "Remote", "duration": "6 months"},
    {"title": "Network Security Intern", "company": "NetGuard", "description": "Monitor network traffic, analyse security logs, and assist with firewall configuration.", "required_skills": ["Network Security", "SIEM", "Linux", "Wireshark", "Python"], "location": "Karachi, Pakistan", "duration": "3 months"},
    {"title": "Django Backend Intern", "company": "WebSolutions", "description": "Develop Django REST APIs and integrate with React frontend.", "required_skills": ["Python", "Django", "REST APIs", "PostgreSQL", "Docker"], "location": "Lahore, Pakistan", "duration": "3 months"},
    {"title": "Kubernetes Intern", "company": "ContainerOps", "description": "Manage Kubernetes clusters, write Helm charts, and optimise container deployments.", "required_skills": ["Kubernetes", "Docker", "Helm", "Linux", "CI/CD"], "location": "Remote", "duration": "3 months"},
    {"title": "Computer Vision Intern", "company": "VisionTech", "description": "Build object detection and image segmentation models using OpenCV and PyTorch.", "required_skills": ["Python", "OpenCV", "PyTorch", "Computer Vision", "NumPy"], "location": "Remote", "duration": "4 months"},
    {"title": "Tableau Analyst Intern", "company": "DataViz Co", "description": "Create interactive Tableau dashboards for sales and marketing teams.", "required_skills": ["Tableau", "SQL", "Excel", "Data Visualisation", "Business Analysis"], "location": "Islamabad, Pakistan", "duration": "2 months"},
    {"title": "Technical Writing Intern", "company": "DocuTech", "description": "Write API documentation, user guides, and technical tutorials for developer tools.", "required_skills": ["Technical Writing", "Markdown", "REST APIs", "Git", "Communication"], "location": "Remote", "duration": "2 months"},
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

    # Embed internships into ChromaDB
    logger.info("Embedding internships into ChromaDB...")
    all_internships = db.query(Internship).all()
    descriptions = [i.description for i in all_internships]
    from app.vector.embedding_service import embed_texts
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
