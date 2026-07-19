#!/usr/bin/env python3
"""
Test LinkedIn and Indeed APIs to fetch live job data
Usage: python test_live_apis.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import asyncio
from app.services.external_data_service import external_data_service
from app.core.database import SessionLocal
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_apis():
    """Test all job APIs and fetch live data"""
    logger.info("🚀 Testing LinkedIn and Indeed APIs...")
    
    # Test LinkedIn Jobs API
    logger.info("📊 Fetching from LinkedIn Jobs API...")
    linkedin_jobs = await external_data_service.fetch_jobs_from_linkedin(
        title="Software Developer", 
        location="United States", 
        limit=10
    )
    
    logger.info(f"✅ LinkedIn: Found {len(linkedin_jobs)} jobs")
    for i, job in enumerate(linkedin_jobs[:3]):
        logger.info(f"  {i+1}. {job['title']} at {job['company']} - {job['location']}")
    
    # Test Indeed Jobs API
    logger.info("📊 Fetching from Indeed Jobs API...")
    indeed_jobs = await external_data_service.fetch_jobs_from_indeed(
        location="us", 
        limit=10
    )
    
    logger.info(f"✅ Indeed: Found {len(indeed_jobs)} jobs")
    for i, job in enumerate(indeed_jobs[:3]):
        logger.info(f"  {i+1}. {job['title']} at {job['company']} - {job['location']}")
    
    # Test specific company jobs
    logger.info("📊 Fetching Ubisoft jobs from Indeed...")
    ubisoft_jobs = await external_data_service.fetch_jobs_from_indeed(
        company="Ubisoft",
        location="us",
        limit=5
    )
    
    logger.info(f"✅ Ubisoft: Found {len(ubisoft_jobs)} jobs")
    for i, job in enumerate(ubisoft_jobs):
        logger.info(f"  {i+1}. {job['title']} - {job['location']}")
    
    # Save to database
    logger.info("💾 Saving jobs to database...")
    db = SessionLocal()
    try:
        all_jobs = linkedin_jobs + indeed_jobs + ubisoft_jobs
        jobs_added = external_data_service.sync_jobs_to_database(all_jobs, db)
        logger.info(f"✅ Added {jobs_added} new jobs to database")
        
        # Get total count
        from app.models.career import Internship
        total_jobs = db.query(Internship).count()
        logger.info(f"🎯 Database now contains {total_jobs} total jobs")
        
    except Exception as e:
        logger.error(f"❌ Database error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_apis())