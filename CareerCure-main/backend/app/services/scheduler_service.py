"""
Scheduler service for automatic data updates (every 6 hours)
"""
import asyncio
import logging
from datetime import datetime, timedelta
from app.services.external_data_service import external_data_service
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)


class SchedulerService:
    """Service to handle scheduled tasks like data updates"""
    
    def __init__(self):
        self.is_running = False
        self.last_update = None
        self.update_interval = timedelta(hours=6)
        
    async def start_scheduler(self):
        """Start the background scheduler"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("Starting data update scheduler (every 6 hours)...")
        
        # Run first update immediately
        await self._perform_update()
        
        await self._scheduler_loop()
    
    def stop_scheduler(self):
        """Stop the background scheduler"""
        self.is_running = False
        logger.info("Scheduler stopped")
    
    async def _scheduler_loop(self):
        """Main scheduler loop"""
        while self.is_running:
            try:
                await asyncio.sleep(3600)  # Check every hour
                
                current_time = datetime.now()
                
                if (self.last_update is None or 
                    current_time - self.last_update >= self.update_interval):
                    
                    logger.info("Starting scheduled data update...")
                    await self._perform_update()
                    self.last_update = current_time
                    
            except asyncio.CancelledError:
                logger.info("Scheduler cancelled")
                break
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                await asyncio.sleep(3600)
    
    async def _perform_update(self):
        """Perform the actual data update + ChromaDB reindexing"""
        try:
            db = SessionLocal()
            try:
                results = await external_data_service.update_all_data(db)
                
                # Reindex new items into ChromaDB
                reindexed_jobs = 0
                reindexed_courses = 0
                
                new_jobs = results.get('new_jobs', [])
                if new_jobs:
                    try:
                        from app.vector.chroma_client import upsert_internship
                        from app.vector.embedding_service import embed_texts
                        
                        descriptions = [j.description or f"{j.title} at {j.company}" for j in new_jobs]
                        embeddings = embed_texts(descriptions)
                        for job, emb in zip(new_jobs, embeddings):
                            upsert_internship(job.id, job.description or job.title, emb)
                            reindexed_jobs += 1
                        logger.info(f"Scheduler: reindexed {reindexed_jobs} jobs into ChromaDB")
                    except Exception as e:
                        logger.error(f"Scheduler ChromaDB job reindex error: {e}")
                
                new_courses = results.get('new_courses', [])
                if new_courses:
                    try:
                        from app.vector.chroma_client import upsert_course
                        from app.vector.embedding_service import embed_texts
                        
                        descriptions = [c.description or c.title for c in new_courses]
                        embeddings = embed_texts(descriptions)
                        for course, emb in zip(new_courses, embeddings):
                            upsert_course(course.id, course.description or course.title, emb, course.skills_gained)
                            reindexed_courses += 1
                        logger.info(f"Scheduler: reindexed {reindexed_courses} courses into ChromaDB")
                    except Exception as e:
                        logger.error(f"Scheduler ChromaDB course reindex error: {e}")
                
                logger.info(
                    f"Scheduled update completed: {results['jobs_added']} jobs, "
                    f"{results['courses_added']} courses added, "
                    f"{reindexed_jobs} jobs + {reindexed_courses} courses reindexed"
                )
                self.last_update = datetime.now()
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error in scheduled update: {e}")


# Global scheduler instance
scheduler = SchedulerService()
