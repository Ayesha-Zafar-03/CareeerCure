"""
Scheduler service for automatic data updates
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional
from app.services.external_data_service import external_data_service
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)


class SchedulerService:
    """Service to handle scheduled tasks like data updates"""
    
    def __init__(self):
        self.is_running = False
        self.last_update = None
        self.update_interval = timedelta(hours=6)  # Update every 6 hours
        
    async def start_scheduler(self):
        """Start the background scheduler"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("Starting data update scheduler...")
        
        # Run the scheduler loop
        await self._scheduler_loop()
    
    def stop_scheduler(self):
        """Stop the background scheduler"""
        self.is_running = False
        logger.info("Scheduler stopped")
    
    async def _scheduler_loop(self):
        """Main scheduler loop"""
        while self.is_running:
            try:
                current_time = datetime.now()
                
                # Check if it's time for an update
                if (self.last_update is None or 
                    current_time - self.last_update >= self.update_interval):
                    
                    logger.info("Starting scheduled data update...")
                    await self._perform_update()
                    self.last_update = current_time
                    
                # Sleep for 1 hour before checking again
                await asyncio.sleep(3600)  # 1 hour
                
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                await asyncio.sleep(3600)  # Wait 1 hour before retrying
    
    async def _perform_update(self):
        """Perform the actual data update"""
        try:
            db = SessionLocal()
            try:
                results = await external_data_service.update_all_data(db)
                logger.info(f"Scheduled update completed: {results['jobs_added']} jobs, {results['courses_added']} courses added")
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error in scheduled update: {e}")


# Global scheduler instance
scheduler = SchedulerService()