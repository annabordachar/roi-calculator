"""Simple test script for the scraper"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from scraper_service import ScraperService

def test_scraper():
    """Test the scraper service"""
    print("Initializing scraper service...")
    service = ScraperService(data_dir="data")
    
    print("\nTesting Dell scraper...")
    result = service.scrape_vendor("dell", "laptop")
    print(f"Result: {result}")
    
    if result.get("success"):
        print(f"✓ Successfully scraped {result.get('products_count', 0)} products")
        print(f"  CSV saved to: {result.get('csv_path', 'N/A')}")
    else:
        print(f"✗ Scraping failed: {result.get('error', 'Unknown error')}")
    
    print("\nTest completed!")

if __name__ == "__main__":
    test_scraper()
