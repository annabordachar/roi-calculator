"""Service for managing product scraping from vendor websites"""
import os
import csv
import logging
from typing import List, Dict, Optional
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from scrapers import DellScraper, HPScraper

logger = logging.getLogger(__name__)


class ScraperService:
    """Service to manage automatic product scraping"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.scheduler = BackgroundScheduler()
        self.scrapers = {
            "dell": DellScraper(),
            "hp": HPScraper()
        }
        self._ensure_data_dir()
    
    def _ensure_data_dir(self):
        """Ensure data directory exists"""
        os.makedirs(self.data_dir, exist_ok=True)
    
    def scrape_vendor(self, vendor: str, product_type: str = "laptop") -> Dict:
        """
        Scrape products from a specific vendor
        
        Args:
            vendor: Vendor name (dell, hp, etc.)
            product_type: Type of product to scrape
        
        Returns:
            Dictionary with scraping results
        """
        if vendor.lower() not in self.scrapers:
            return {
                "success": False,
                "error": f"Vendor {vendor} not supported",
                "products_count": 0
            }
        
        scraper = self.scrapers[vendor.lower()]
        start_time = datetime.now()
        
        try:
            logger.info(f"Starting scrape for {vendor} ({product_type})")
            products = scraper.scrape_products(product_type=product_type, max_pages=10)
            
            if products:
                # Save to CSV
                csv_path = self._save_to_csv(vendor, products, product_type)
                
                duration = (datetime.now() - start_time).total_seconds()
                
                return {
                    "success": True,
                    "vendor": vendor,
                    "product_type": product_type,
                    "products_count": len(products),
                    "csv_path": csv_path,
                    "duration_seconds": duration,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "error": "No products found",
                    "products_count": 0
                }
        
        except Exception as e:
            logger.error(f"Error scraping {vendor}: {e}")
            return {
                "success": False,
                "error": str(e),
                "products_count": 0
            }
    
    def scrape_all_vendors(self, product_type: str = "laptop") -> Dict:
        """
        Scrape products from all supported vendors
        
        Args:
            product_type: Type of product to scrape
        
        Returns:
            Dictionary with results from all vendors
        """
        results = {}
        
        for vendor in self.scrapers.keys():
            logger.info(f"Scraping {vendor}...")
            results[vendor] = self.scrape_vendor(vendor, product_type)
        
        return {
            "success": True,
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
    
    def _save_to_csv(self, vendor: str, products: List[Dict], product_type: str) -> str:
        """Save scraped products to CSV file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{vendor}_{product_type}_{timestamp}.csv"
        csv_path = os.path.join(self.data_dir, filename)
        
        # Also create/update the main catalog file
        main_csv_path = os.path.join(self.data_dir, f"{vendor}_catalog.csv")
        
        # Define CSV columns based on product structure
        fieldnames = [
            "id", "name", "model", "screen_size", "rating", "reviews_count",
            "price", "link", "features", "vendor", "scraped_at"
        ]
        
        # Add all products to main catalog (append mode)
        file_exists = os.path.exists(main_csv_path)
        
        with open(main_csv_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            
            if not file_exists:
                writer.writeheader()
            
            for product in products:
                # Clean Dell URLs
                link = product.get("link", "")
                if vendor.lower() == "dell" and link and 'https://www.dell.com//www.dell.com/' in link:
                    link = link.replace('https://www.dell.com//www.dell.com/', 'https://www.dell.com/', 1)
                
                row = {
                    "id": product.get("id", ""),
                    "name": product.get("name", ""),
                    "model": product.get("model", ""),
                    "screen_size": product.get("screen_size", ""),
                    "rating": product.get("rating") or "",
                    "reviews_count": product.get("reviews_count") or "",
                    "price": product.get("price", ""),
                    "link": link,
                    "features": product.get("features", ""),
                    "vendor": product.get("vendor", vendor),
                    "scraped_at": datetime.now().isoformat()
                }
                writer.writerow(row)
        
        # Also save timestamped copy
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for product in products:
                # Clean Dell URLs
                link = product.get("link", "")
                if vendor.lower() == "dell" and link and 'https://www.dell.com//www.dell.com/' in link:
                    link = link.replace('https://www.dell.com//www.dell.com/', 'https://www.dell.com/', 1)
                
                row = {
                    "id": product.get("id", ""),
                    "name": product.get("name", ""),
                    "model": product.get("model", ""),
                    "screen_size": product.get("screen_size", ""),
                    "rating": product.get("rating") or "",
                    "reviews_count": product.get("reviews_count") or "",
                    "price": product.get("price", ""),
                    "link": link,
                    "features": product.get("features", ""),
                    "vendor": product.get("vendor", vendor),
                    "scraped_at": datetime.now().isoformat()
                }
                writer.writerow(row)
        
        logger.info(f"Saved {len(products)} products to {csv_path}")
        return csv_path
    
    def start_scheduler(self, schedule_hours: int = 24):
        """
        Start automatic scraping scheduler
        
        Args:
            schedule_hours: How often to scrape (in hours)
        """
        if self.scheduler.running:
            logger.warning("Scheduler is already running")
            return
        
        # Schedule scraping every N hours
        trigger = CronTrigger(hour=f"*/{schedule_hours}")
        self.scheduler.add_job(
            self.scrape_all_vendors,
            trigger=trigger,
            id='scrape_all_vendors',
            name='Scrape all vendors',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info(f"Scheduler started - will scrape every {schedule_hours} hours")
    
    def stop_scheduler(self):
        """Stop the automatic scraping scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Scheduler stopped")
    
    def get_scheduler_status(self) -> Dict:
        """Get scheduler status"""
        return {
            "running": self.scheduler.running,
            "jobs": [
                {
                    "id": job.id,
                    "name": job.name,
                    "next_run": job.next_run_time.isoformat() if job.next_run_time else None
                }
                for job in self.scheduler.get_jobs()
            ]
        }
