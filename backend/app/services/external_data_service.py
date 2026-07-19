"""
External data service for fetching real jobs and courses from APIs
"""
import logging
import httpx
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.career import Internship, Course
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class ExternalDataService:
    """Service to fetch and sync external job and course data"""
    
    def __init__(self):
        self.jsearch_api_key = getattr(settings, 'JSEARCH_API_KEY', '')
        self.adzuna_api_id = getattr(settings, 'ADZUNA_API_ID', '')
        self.adzuna_api_key = getattr(settings, 'ADZUNA_API_KEY', '')
        self.rapidapi_key = getattr(settings, 'RAPIDAPI_KEY', '')
        self.linkedin_api_key = getattr(settings, 'LINKEDIN_JOBS_API_KEY', '')
        self.indeed_api_key = getattr(settings, 'INDEED_JOBS_API_KEY', '')
        
    async def fetch_jobs_from_jsearch(self, query: str = "software developer", limit: int = 25) -> List[Dict]:
        """
        Fetch jobs from JSearch API (RapidAPI)
        Free tier: 100 requests/month
        """
        if not self.jsearch_api_key:
            logger.warning("JSearch API key not configured")
            return []
            
        url = "https://jsearch.p.rapidapi.com/search"
        querystring = {
            "query": query,
            "page": "1",
            "num_pages": "1",
            "date_posted": "month",
            "remote_jobs_only": "false"
        }
        
        headers = {
            "X-RapidAPI-Key": self.jsearch_api_key,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }
        
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, headers=headers, params=querystring)
            response.raise_for_status()
            data = response.json()
            
            jobs = []
            for job_data in data.get('data', [])[:limit]:
                min_sal = job_data.get('job_min_salary')
                max_sal = job_data.get('job_max_salary')
                currency = job_data.get('job_salary_currency', '') or ''
                if min_sal and max_sal:
                    salary_range = f"{currency} {min_sal}-{max_sal}".strip()
                elif min_sal or max_sal:
                    salary_range = f"{currency} {min_sal or max_sal}".strip()
                else:
                    salary_range = ''
                job = {
                    'title': job_data.get('job_title', ''),
                    'company': job_data.get('employer_name', ''),
                    'location': job_data.get('job_city', '') + ', ' + job_data.get('job_country', ''),
                    'description': job_data.get('job_description', '')[:500],
                    'application_url': job_data.get('job_apply_link', ''),
                    'salary_range': salary_range,
                    'remote_option': 'Remote' if job_data.get('job_is_remote') else 'On-site',
                    'required_skills': job_data.get('job_required_skills', []) or [],
                    'source': 'jsearch'
                }
                jobs.append(job)
                
            logger.info(f"Fetched {len(jobs)} jobs from JSearch API")
            return jobs
            
        except Exception as e:
            logger.error(f"Error fetching jobs from JSearch: {e}")
            return []
    
    async def fetch_jobs_from_adzuna(self, query: str = "developer", limit: int = 25) -> List[Dict]:
        """
        Fetch jobs from Adzuna API
        Free tier available
        """
        if not self.adzuna_api_id or not self.adzuna_api_key:
            logger.warning("Adzuna API credentials not configured")
            return []
            
        url = f"https://api.adzuna.com/v1/api/jobs/us/search/1"
        params = {
            'app_id': self.adzuna_api_id,
            'app_key': self.adzuna_api_key,
            'what': query,
            'results_per_page': limit,
            'sort_by': 'date'
        }
        
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            jobs = []
            for job_data in data.get('results', []):
                job = {
                    'title': job_data.get('title', ''),
                    'company': job_data.get('company', {}).get('display_name', ''),
                    'location': job_data.get('location', {}).get('display_name', ''),
                    'description': job_data.get('description', '')[:500],
                    'application_url': job_data.get('redirect_url', ''),
                    'salary_range': f"${job_data.get('salary_min', '')}-{job_data.get('salary_max', '')}" if job_data.get('salary_min') else '',
                    'remote_option': 'Remote' if 'remote' in job_data.get('description', '').lower() else 'On-site',
                    'required_skills': [],
                    'source': 'adzuna'
                }
                jobs.append(job)
                
            logger.info(f"Fetched {len(jobs)} jobs from Adzuna API")
            return jobs
            
        except Exception as e:
            logger.error(f"Error fetching jobs from Adzuna: {e}")
            return []
    
    async def fetch_jobs_from_linkedin(self, title: str = "Software Developer", location: str = "Pakistan", limit: int = 25) -> List[Dict]:
        """
        Fetch jobs from LinkedIn Jobs API (RapidAPI)
        Uses linkedin-job-search-api.p.rapidapi.com
        """
        api_key = self.rapidapi_key or self.linkedin_api_key
        if not api_key:
            logger.warning("LinkedIn Jobs API key not configured")
            return []

        url = "https://linkedin-job-search-api.p.rapidapi.com/active-jb-24h"
        querystring = {
            "title_filter": title,
            "location_filter": location,
        }

        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "linkedin-job-search-api.p.rapidapi.com",
        }

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get(url, headers=headers, params=querystring)
            response.raise_for_status()
            data = response.json()

            records = data if isinstance(data, list) else data.get("data", [])
            jobs = []
            for job_data in records[:limit]:
                jobs.append({
                    'title': job_data.get('title', ''),
                    'company': job_data.get('organization', '') or job_data.get('company', ''),
                    'location': job_data.get('locations_derived', [''])[0] if job_data.get('locations_derived') else job_data.get('location', ''),
                    'description': (job_data.get('description', '') or '')[:500],
                    'application_url': job_data.get('url', '') or job_data.get('apply_url', ''),
                    'salary_range': '',
                    'remote_option': 'Remote' if job_data.get('remote_derived') else 'On-site',
                    'required_skills': [],
                    'source': 'linkedin',
                })

            logger.info(f"Fetched {len(jobs)} jobs from LinkedIn API")
            return jobs

        except Exception as e:
            logger.error(f"Error fetching jobs from LinkedIn: {e}")
            return []
    
    async def fetch_jobs_from_indeed(self, company: str = None, location: str = "us", limit: int = 25) -> List[Dict]:
        """
        Fetch jobs from Indeed API (RapidAPI)  
        Uses indeed12.p.rapidapi.com
        """
        api_key = self.rapidapi_key or self.indeed_api_key
        if not api_key:
            logger.warning("Indeed API key not configured")
            return []
        
        # If company specified, get jobs from that company
        if company:
            url = f"https://indeed12.p.rapidapi.com/company/{company}/jobs"
            querystring = {
                "locality": location,
                "start": "1"
            }
        else:
            # General job search
            url = "https://indeed12.p.rapidapi.com/jobs"  
            querystring = {
                "query": "software developer",
                "locality": location,
                "start": "1"
            }
        
        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "indeed12.p.rapidapi.com",
            "Content-Type": "application/json"
        }
        
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get(url, headers=headers, params=querystring)
            response.raise_for_status()
            data = response.json()
            
            jobs = []
            job_list = data.get('hits', []) or data.get('jobs', []) or data
            if isinstance(job_list, dict):
                job_list = job_list.get('data', [])
            
            for job_data in job_list[:limit]:
                # Extract salary
                salary_info = job_data.get('salary', {})
                salary_range = ""
                if salary_info:
                    if isinstance(salary_info, str):
                        salary_range = salary_info
                    elif isinstance(salary_info, dict):
                        min_sal = salary_info.get('min')
                        max_sal = salary_info.get('max')
                        if min_sal and max_sal:
                            salary_range = f"${min_sal}-{max_sal}"
                
                job = {
                    'title': job_data.get('title', ''),
                    'company': job_data.get('company', ''),
                    'location': job_data.get('location', ''),
                    'description': job_data.get('description', '')[:500] if job_data.get('description') else '',
                    'application_url': job_data.get('job_url', '') or job_data.get('link', ''),
                    'salary_range': salary_range,
                    'remote_option': 'Remote' if 'remote' in job_data.get('title', '').lower() else 'On-site',
                    'required_skills': [],
                    'source': 'indeed'
                }
                jobs.append(job)
                
            logger.info(f"Fetched {len(jobs)} jobs from Indeed API")
            return jobs
            
        except Exception as e:
            logger.error(f"Error fetching jobs from Indeed: {e}")
            return []
    
    async def fetch_courses_from_udemy(self, query: str = "programming", limit: int = 25) -> List[Dict]:
        """
        Return a curated set of popular courses.

        Udemy's public API requires partner approval, so this returns a hand-picked
        list rather than live API data. Swap in a real API call when credentials exist.
        """
        courses = [
            {
                'title': 'Complete Python Bootcamp From Zero to Hero',
                'provider': 'Udemy',
                'instructor': 'Jose Portilla',
                'description': 'Learn Python like a Professional Start from the basics and go all the way to creating your own applications and games',
                'duration': '22 hours',
                'difficulty_level': 'Beginner',
                'price': '$84.99',
                'course_url': 'https://www.udemy.com/course/complete-python-bootcamp/',
                'rating': 4.6,
                'category': 'Programming',
                'skills_gained': ['Python', 'Object-Oriented Programming', 'Data Structures'],
                'source': 'udemy'
            },
            {
                'title': 'The Complete JavaScript Course 2024',
                'provider': 'Udemy',
                'instructor': 'Jonas Schmedtmann',
                'description': 'The modern JavaScript course for everyone! Master JavaScript with projects, challenges and theory.',
                'duration': '69 hours',
                'difficulty_level': 'Beginner',
                'price': '$94.99',
                'course_url': 'https://www.udemy.com/course/the-complete-javascript-course/',
                'rating': 4.7,
                'category': 'Web Development',
                'skills_gained': ['JavaScript', 'ES6+', 'DOM Manipulation', 'Async JavaScript'],
                'source': 'udemy'
            },
            {
                'title': 'React - The Complete Guide',
                'provider': 'Udemy',
                'instructor': 'Maximilian Schwarzmüller',
                'description': 'Dive in and learn React.js from scratch! Learn Reactjs, Redux, React Hooks, React Router, Next.js, Best Practices and way more!',
                'duration': '48 hours',
                'difficulty_level': 'Intermediate',
                'price': '$94.99',
                'course_url': 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
                'rating': 4.6,
                'category': 'Web Development',
                'skills_gained': ['React', 'Redux', 'React Hooks', 'Next.js'],
                'source': 'udemy'
            },
            {
                'title': 'Machine Learning A-Z™: Hands-On Python & R',
                'provider': 'Udemy',
                'instructor': 'Kirill Eremenko',
                'description': 'Learn to create Machine Learning Algorithms in Python and R from two Data Science experts.',
                'duration': '44 hours',
                'difficulty_level': 'Intermediate',
                'price': '$84.99',
                'course_url': 'https://www.udemy.com/course/machinelearning/',
                'rating': 4.5,
                'category': 'Data Science',
                'skills_gained': ['Machine Learning', 'Python', 'R', 'Data Analysis'],
                'source': 'udemy'
            },
            {
                'title': 'AWS Certified Solutions Architect',
                'provider': 'Udemy',
                'instructor': 'Stephane Maarek',
                'description': 'Pass the AWS Certified Solutions Architect Associate Exam! Complete Amazon Web Services (AWS) Tutorial',
                'duration': '27 hours',
                'difficulty_level': 'Intermediate',
                'price': '$89.99',
                'course_url': 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/',
                'rating': 4.7,
                'category': 'Cloud Computing',
                'skills_gained': ['AWS', 'Cloud Architecture', 'Solutions Architecture'],
                'source': 'udemy'
            }
        ]
        
        logger.info(f"Returning {len(courses[:limit])} curated courses")
        return courses[:limit]
    
    def sync_jobs_to_database(self, jobs: List[Dict], db: Session) -> List[Internship]:
        """Sync fetched jobs to database. Returns list of newly added Internship objects."""
        added = []
        
        for job_data in jobs:
            existing = db.query(Internship).filter(
                Internship.title == job_data['title'],
                Internship.company == job_data['company']
            ).first()
            
            if not existing:
                internship = Internship(
                    title=job_data['title'],
                    company=job_data['company'],
                    location=job_data.get('location', ''),
                    description=job_data.get('description', ''),
                    application_url=job_data.get('application_url', ''),
                    salary_range=job_data.get('salary_range', ''),
                    remote_option=job_data.get('remote_option', 'On-site'),
                    required_skills=job_data.get('required_skills', []),
                    duration=job_data.get('duration', ''),
                )
                db.add(internship)
                added.append(internship)
        
        db.commit()
        # Refresh to get IDs
        for item in added:
            db.refresh(item)
        
        logger.info(f"Added {len(added)} new jobs to database")
        return added
    
    def sync_courses_to_database(self, courses: List[Dict], db: Session) -> List[Course]:
        """Sync fetched courses to database. Returns list of newly added Course objects."""
        added = []
        
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
                    description=course_data.get('description', ''),
                    duration=course_data.get('duration', ''),
                    difficulty_level=course_data.get('difficulty_level', ''),
                    price=course_data.get('price', ''),
                    course_url=course_data.get('course_url', ''),
                    rating=course_data.get('rating'),
                    category=course_data.get('category', ''),
                    skills_gained=course_data.get('skills_gained', []),
                )
                db.add(course)
                added.append(course)
        
        db.commit()
        for item in added:
            db.refresh(item)
        
        logger.info(f"Added {len(added)} new courses to database")
        return added
    
    async def update_all_data(self, db: Session) -> Dict:
        """Update both jobs and courses from all sources.
        
        Returns dict with keys: jobs_added (count), courses_added (count),
        new_jobs (list[Internship]), new_courses (list[Course]), errors.
        """
        results = {
            'jobs_added': 0,
            'courses_added': 0,
            'new_jobs': [],
            'new_courses': [],
            'errors': []
        }
        
        try:
            # Fetch jobs from multiple sources
            all_jobs = []
            
            linkedin_jobs = await self.fetch_jobs_from_linkedin("Software Developer", "Pakistan", 15)
            all_jobs.extend(linkedin_jobs)
            
            indeed_jobs = await self.fetch_jobs_from_indeed(None, "us", 15)
            all_jobs.extend(indeed_jobs)
            
            if self.jsearch_api_key:
                jsearch_jobs = await self.fetch_jobs_from_jsearch("software developer", 10)
                all_jobs.extend(jsearch_jobs)
            
            if self.adzuna_api_id and self.adzuna_api_key:
                adzuna_jobs = await self.fetch_jobs_from_adzuna("developer", 10)
                all_jobs.extend(adzuna_jobs)
            
            new_jobs = self.sync_jobs_to_database(all_jobs, db)
            results['jobs_added'] = len(new_jobs)
            results['new_jobs'] = new_jobs
            
            courses = await self.fetch_courses_from_udemy("programming", 25)
            new_courses = self.sync_courses_to_database(courses, db)
            results['courses_added'] = len(new_courses)
            results['new_courses'] = new_courses
            
        except Exception as e:
            logger.error(f"Error updating data: {e}")
            results['errors'].append(str(e))
        
        return results


# Global instance
external_data_service = ExternalDataService()