#!/usr/bin/env python3
"""
Seed 50+ Real Jobs and Courses
Combines API data with curated high-quality listings
Usage: python seed_50_real_jobs.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import asyncio
from app.core.database import SessionLocal, engine
from app.models.career import Internship, Course
from app.services.external_data_service import external_data_service
from sqlalchemy.orm import Session
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Additional high-quality job listings
PREMIUM_JOBS = [
    {
        "title": "Senior Software Engineer",
        "company": "Stripe",
        "location": "San Francisco, CA",
        "description": "Build the financial infrastructure for the internet. Work on payment processing systems that handle billions of dollars.",
        "required_skills": ["Ruby", "Go", "JavaScript", "PostgreSQL", "Distributed Systems"],
        "application_url": "https://stripe.com/jobs/",
        "salary_range": "$180,000-220,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Machine Learning Engineer", 
        "company": "OpenAI",
        "location": "San Francisco, CA",
        "description": "Research and develop cutting-edge AI models. Work on large language models and generative AI systems.",
        "required_skills": ["Python", "PyTorch", "TensorFlow", "CUDA", "Distributed Computing"],
        "application_url": "https://openai.com/careers/",
        "salary_range": "$200,000-300,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Cloud Architect",
        "company": "Databricks",
        "location": "San Francisco, CA",
        "description": "Design and implement cloud data platforms for enterprise customers. Work with Spark, Delta Lake, and MLflow.",
        "required_skills": ["Apache Spark", "AWS", "Kubernetes", "Scala", "Python"],
        "application_url": "https://databricks.com/company/careers/",
        "salary_range": "$170,000-210,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "DevOps Engineer",
        "company": "GitLab",
        "location": "Remote",
        "description": "Build and maintain CI/CD infrastructure for one of the world's largest DevOps platforms.",
        "required_skills": ["Kubernetes", "GitLab CI", "Terraform", "GCP", "Ruby"],
        "application_url": "https://about.gitlab.com/jobs/",
        "salary_range": "$130,000-170,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "Security Engineer",
        "company": "Cloudflare",
        "location": "Austin, TX",
        "description": "Protect millions of websites from cyber threats. Work on edge security and DDoS protection systems.",
        "required_skills": ["Network Security", "Go", "Rust", "Distributed Systems", "Cryptography"],
        "application_url": "https://www.cloudflare.com/careers/",
        "salary_range": "$140,000-180,000/year",
        "remote_option": "Hybrid"
    }
]
    {
        "title": "Product Manager",
        "company": "Notion",
        "location": "San Francisco, CA", 
        "description": "Drive product strategy for productivity tools used by millions of teams worldwide.",
        "required_skills": ["Product Strategy", "Data Analysis", "User Research", "SQL", "A/B Testing"],
        "application_url": "https://www.notion.so/careers/",
        "salary_range": "$150,000-190,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "Frontend Engineer",
        "company": "Figma",
        "location": "San Francisco, CA",
        "description": "Build collaborative design tools that empower creative teams. Work with React and WebGL.",
        "required_skills": ["React", "TypeScript", "WebGL", "CSS", "Performance Optimization"],
        "application_url": "https://www.figma.com/careers/",
        "salary_range": "$160,000-200,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Data Engineer",
        "company": "Snowflake",
        "location": "San Mateo, CA",
        "description": "Build data infrastructure for the cloud data platform. Work with massive scale data processing.",
        "required_skills": ["Python", "Scala", "Apache Spark", "SQL", "Data Warehousing"],
        "application_url": "https://careers.snowflake.com/",
        "salary_range": "$150,000-190,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Mobile Engineer",
        "company": "Discord",
        "location": "San Francisco, CA",
        "description": "Build mobile experiences for gaming and community platform with 150M+ monthly users.",
        "required_skills": ["React Native", "Swift", "Kotlin", "JavaScript", "Mobile Performance"],
        "application_url": "https://discord.com/careers/",
        "salary_range": "$140,000-180,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "Site Reliability Engineer",
        "company": "Datadog",
        "location": "New York, NY",
        "description": "Ensure reliability and performance of monitoring platform serving thousands of customers.",
        "required_skills": ["Go", "Python", "Kubernetes", "Observability", "Distributed Systems"],
        "application_url": "https://www.datadoghq.com/careers/",
        "salary_range": "$140,000-180,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Backend Engineer",
        "company": "Coinbase",
        "location": "San Francisco, CA",
        "description": "Build cryptocurrency trading and wallet infrastructure. Handle high-frequency financial transactions.",
        "required_skills": ["Go", "Python", "PostgreSQL", "Microservices", "Financial Systems"],
        "application_url": "https://www.coinbase.com/careers/",
        "salary_range": "$160,000-200,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "AI Research Scientist",
        "company": "Anthropic",
        "location": "San Francisco, CA",
        "description": "Conduct research in AI safety and develop large language models with human feedback.",
        "required_skills": ["Python", "PyTorch", "Transformers", "RLHF", "Research"],
        "application_url": "https://www.anthropic.com/careers/",
        "salary_range": "$220,000-280,000/year",
        "remote_option": "Hybrid"
    },
    {
        "title": "Platform Engineer",
        "company": "Vercel",
        "location": "Remote",
        "description": "Build developer infrastructure for the modern web. Work on edge computing and serverless platforms.",
        "required_skills": ["Node.js", "Next.js", "Edge Computing", "Serverless", "CDN"],
        "application_url": "https://vercel.com/careers/",
        "salary_range": "$130,000-170,000/year",
        "remote_option": "Remote"
    },
    {
        "title": "Quantum Software Engineer",
        "company": "Rigetti Computing",
        "location": "Berkeley, CA",
        "description": "Develop quantum computing software and algorithms for quantum advantage applications.",
        "required_skills": ["Python", "Quantum Computing", "Physics", "Linear Algebra", "Qiskit"],
        "application_url": "https://www.rigetti.com/careers/",
        "salary_range": "$140,000-180,000/year",
        "remote_option": "On-site"
    },
    {
        "title": "Growth Engineer", 
        "company": "Plaid",
        "location": "San Francisco, CA",
        "description": "Build products that drive user acquisition and engagement for fintech infrastructure platform.",
        "required_skills": ["React", "Python", "A/B Testing", "Data Analysis", "Growth Hacking"],
        "application_url": "https://plaid.com/careers/",
        "salary_range": "$140,000-180,000/year",
        "remote_option": "Hybrid"
    }
]

ADDITIONAL_COURSES = [
    {
        "title": "Advanced React Development",
        "provider": "Frontend Masters",
        "instructor": "Brian Holt",
        "description": "Master advanced React patterns, hooks, performance optimization, and state management.",
        "duration": "8 hours",
        "difficulty_level": "Advanced",
        "price": "$39/month",
        "course_url": "https://frontendmasters.com/courses/complete-react-v8/",
        "rating": 4.8,
        "category": "Web Development",
        "skills_gained": ["React", "Redux", "Performance", "Hooks", "State Management"]
    },
    {
        "title": "System Design Interview Course",
        "provider": "Educative",
        "instructor": "Fahim ul Haq",
        "description": "Learn to design large-scale distributed systems. Prepare for system design interviews at top tech companies.",
        "duration": "20 hours",
        "difficulty_level": "Advanced", 
        "price": "$59/month",
        "course_url": "https://www.educative.io/courses/grokking-the-system-design-interview",
        "rating": 4.7,
        "category": "System Design",
        "skills_gained": ["System Design", "Scalability", "Distributed Systems", "Load Balancing", "Microservices"]
    },
    {
        "title": "Kubernetes for Developers",
        "provider": "Pluralsight",
        "instructor": "Dan Wahlin",
        "description": "Learn Kubernetes fundamentals and how to deploy, manage, and scale applications in K8s clusters.",
        "duration": "6 hours",
        "difficulty_level": "Intermediate",
        "price": "$29/month",
        "course_url": "https://www.pluralsight.com/courses/kubernetes-developers-core-concepts",
        "rating": 4.6,
        "category": "DevOps",
        "skills_gained": ["Kubernetes", "Docker", "Container Orchestration", "DevOps", "Cloud Native"]
    },
    {
        "title": "Complete Ethical Hacking Course",
        "provider": "Udemy",
        "instructor": "Zaid Sabih",
        "description": "Learn ethical hacking from scratch. Become a penetration tester and secure networks and systems.",
        "duration": "15 hours",
        "difficulty_level": "Intermediate",
        "price": "$89.99",
        "course_url": "https://www.udemy.com/course/learn-ethical-hacking-from-scratch/",
        "rating": 4.5,
        "category": "Cybersecurity",
        "skills_gained": ["Ethical Hacking", "Penetration Testing", "Network Security", "Kali Linux", "Web Security"]
    },
    {
        "title": "Advanced Python Programming",
        "provider": "Real Python",
        "instructor": "Real Python Team",
        "description": "Master advanced Python concepts including decorators, context managers, metaclasses, and async programming.",
        "duration": "Self-paced",
        "difficulty_level": "Advanced",
        "price": "$60/month",
        "course_url": "https://realpython.com/courses/",
        "rating": 4.8,
        "category": "Programming",
        "skills_gained": ["Python", "Advanced Programming", "Decorators", "Async Programming", "Design Patterns"]
    }
]

async def seed_comprehensive_data():
    """Seed database with 50+ jobs and courses from multiple sources"""
    logger.info("🚀 Starting comprehensive data seeding...")
    
    db = SessionLocal()
    
    try:
        # Create tables
        from app.models.career import Base
        Base.metadata.create_all(bind=engine)
        
        # 1. Fetch from APIs
        logger.info("📡 Fetching from external APIs...")
        api_jobs = []
        
        # Get LinkedIn-style jobs
        linkedin_jobs = await external_data_service.fetch_jobs_from_linkedin("Software Engineer", "United States", 10)
        api_jobs.extend(linkedin_jobs)
        
        # Get Indeed company jobs
        companies = ["Ubisoft", "Adobe", "Spotify", "Tesla", "Slack"]
        for company in companies:
            company_jobs = await external_data_service.fetch_jobs_from_indeed(company, "us", 3)
            api_jobs.extend(company_jobs)
        
        logger.info(f"📊 Fetched {len(api_jobs)} jobs from APIs")
        
        # 2. Add premium curated jobs
        logger.info("💎 Adding premium job listings...")
        all_jobs = api_jobs + PREMIUM_JOBS
        
        # 3. Sync jobs to database
        jobs_added = external_data_service.sync_jobs_to_database(all_jobs, db)
        
        # 4. Add comprehensive courses
        logger.info("📚 Adding courses...")
        existing_courses = await external_data_service.fetch_courses_from_udemy("programming", 15)
        all_courses = existing_courses + ADDITIONAL_COURSES
        
        courses_added = external_data_service.sync_courses_to_database(all_courses, db)
        
        # 5. Final counts
        total_jobs = db.query(Internship).count()
        total_courses = db.query(Course).count()
        
        logger.info("✅ Comprehensive seeding completed!")
        logger.info(f"📊 Added: {jobs_added} jobs, {courses_added} courses")
        logger.info(f"🎯 Database totals: {total_jobs} jobs, {total_courses} courses")
        
        # Show sample data
        if total_jobs > 0:
            logger.info("🔍 Sample jobs added:")
            sample_jobs = db.query(Internship).order_by(Internship.id.desc()).limit(5).all()
            for job in sample_jobs:
                logger.info(f"   • {job.title} at {job.company} - {job.location}")
        
        if total_courses > 0:
            logger.info("🔍 Sample courses added:")
            sample_courses = db.query(Course).order_by(Course.id.desc()).limit(3).all()
            for course in sample_courses:
                logger.info(f"   • {course.title} by {course.provider}")
        
        return {
            'success': True,
            'jobs_added': jobs_added,
            'courses_added': courses_added,
            'total_jobs': total_jobs,
            'total_courses': total_courses
        }
        
    except Exception as e:
        logger.error(f"❌ Error during seeding: {e}")
        db.rollback()
        return {'success': False, 'error': str(e)}
    finally:
        db.close()

if __name__ == "__main__":
    result = asyncio.run(seed_comprehensive_data())
    if result['success']:
        logger.info(f"🎉 SUCCESS: {result['total_jobs']} jobs, {result['total_courses']} courses in database")
    else:
        logger.error(f"💥 FAILED: {result['error']}")