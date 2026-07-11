#!/usr/bin/env python3
"""
Real Data Seeder - Simple version to populate database with jobs and courses
Usage: python seed_real_jobs_courses.py
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

def seed_sample_data():
    """Seed database with sample real jobs and courses"""
    db = SessionLocal()
    
    try:
        # Sample real jobs
        jobs = [
            {
                "title": "Frontend Developer Intern",
                "company": "Google", 
                "location": "Mountain View, CA",
                "description": "Join our team to build next-generation web experiences using React, TypeScript, and modern web technologies.",
                "required_skills": ["JavaScript", "React", "TypeScript", "HTML", "CSS"],
                "application_url": "https://careers.google.com/",
                "salary_range": "$7,000-9,000/month",
                "remote_option": "Hybrid"
            },
            {
                "title": "Backend Engineer",
                "company": "Microsoft",
                "location": "Seattle, WA", 
                "description": "Develop scalable backend services using .NET, Azure, and cloud technologies.",
                "required_skills": ["C#", ".NET", "Azure", "SQL", "REST APIs"],
                "application_url": "https://careers.microsoft.com/",
                "salary_range": "$130,000-170,000/year",
                "remote_option": "Hybrid"
            },
            {
                "title": "Full Stack Developer",
                "company": "Meta",
                "location": "Menlo Park, CA",
                "description": "Build social platforms that connect billions of people worldwide.",
                "required_skills": ["React", "Python", "GraphQL", "JavaScript", "Node.js"],
                "application_url": "https://www.metacareers.com/",
                "salary_range": "$140,000-180,000/year", 
                "remote_option": "Hybrid"
            },
            {
                "title": "Data Scientist",
                "company": "Amazon",
                "location": "Seattle, WA",
                "description": "Apply machine learning to solve complex business problems using AWS services.",
                "required_skills": ["Python", "Machine Learning", "SQL", "AWS", "Statistics"],
                "application_url": "https://amazon.jobs/",
                "salary_range": "$120,000-160,000/year",
                "remote_option": "Remote"
            },
            {
                "title": "iOS Developer",
                "company": "Apple",
                "location": "Cupertino, CA",
                "description": "Develop software for Apple's ecosystem including iOS and macOS platforms.",
                "required_skills": ["Swift", "Objective-C", "iOS", "Xcode", "UIKit"],
                "application_url": "https://jobs.apple.com/",
                "salary_range": "$140,000-180,000/year",
                "remote_option": "On-site"
            }
        ]
        
        # Sample real courses
        courses = [
            {
                "title": "Complete Python Bootcamp From Zero to Hero",
                "provider": "Udemy",
                "instructor": "Jose Portilla",
                "description": "Learn Python programming from basics to advanced concepts with hands-on projects.",
                "duration": "22 hours",
                "difficulty_level": "Beginner",
                "price": "$84.99",
                "course_url": "https://www.udemy.com/course/complete-python-bootcamp/",
                "rating": 4.6,
                "category": "Programming",
                "skills_gained": ["Python", "Object-Oriented Programming", "Data Structures", "File I/O"]
            },
            {
                "title": "The Complete JavaScript Course 2024",
                "provider": "Udemy",
                "instructor": "Jonas Schmedtmann",
                "description": "Master modern JavaScript with projects, challenges and real-world applications.",
                "duration": "69 hours", 
                "difficulty_level": "Beginner",
                "price": "$94.99",
                "course_url": "https://www.udemy.com/course/the-complete-javascript-course/",
                "rating": 4.7,
                "category": "Web Development", 
                "skills_gained": ["JavaScript", "ES6+", "DOM Manipulation", "Async JavaScript", "APIs"]
            },
            {
                "title": "React - The Complete Guide",
                "provider": "Udemy",
                "instructor": "Maximilian Schwarzmüller",
                "description": "Learn React.js from scratch including Hooks, Router, Redux and Next.js.",
                "duration": "48 hours",
                "difficulty_level": "Intermediate",
                "price": "$94.99",
                "course_url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
                "rating": 4.6,
                "category": "Web Development",
                "skills_gained": ["React", "Redux", "React Hooks", "React Router", "Next.js"]
            },
            {
                "title": "Machine Learning A-Z",
                "provider": "Udemy",
                "instructor": "Kirill Eremenko",
                "description": "Learn to create Machine Learning algorithms in Python and R with real projects.",
                "duration": "44 hours",
                "difficulty_level": "Intermediate", 
                "price": "$84.99",
                "course_url": "https://www.udemy.com/course/machinelearning/",
                "rating": 4.5,
                "category": "Data Science",
                "skills_gained": ["Machine Learning", "Python", "R", "Data Analysis", "Statistics"]
            },
            {
                "title": "AWS Certified Solutions Architect",
                "provider": "Udemy",
                "instructor": "Stephane Maarek", 
                "description": "Complete guide to pass AWS Solutions Architect certification with hands-on labs.",
                "duration": "27 hours",
                "difficulty_level": "Intermediate",
                "price": "$89.99",
                "course_url": "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
                "rating": 4.7,
                "category": "Cloud Computing",
                "skills_gained": ["AWS", "Cloud Architecture", "EC2", "S3", "Solutions Architecture"]
            }
        ]
        
        # Create tables if they don't exist
        from app.models.career import Base
        Base.metadata.create_all(bind=engine)
        
        # Add jobs
        jobs_added = 0
        for job_data in jobs:
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
                jobs_added += 1
        
        # Add courses
        courses_added = 0
        for course_data in courses:
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
                courses_added += 1
        
        db.commit()
        
        # Print results
        total_jobs = db.query(Internship).count()
        total_courses = db.query(Course).count()
        
        logger.info(f"✅ Seeding completed successfully!")
        logger.info(f"📊 Added: {jobs_added} jobs, {courses_added} courses")
        logger.info(f"🎯 Database totals: {total_jobs} jobs, {total_courses} courses")
        
    except Exception as e:
        logger.error(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_sample_data()