"""Base scraper class for vendor websites"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup
import time
import logging

logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """Base class for all vendor scrapers"""
    
    def __init__(self, vendor_name: str, base_url: str):
        self.vendor_name = vendor_name
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
    
    def fetch_page(self, url: str, retries: int = 3, delay: float = 1.0) -> Optional[BeautifulSoup]:
        """Fetch a page and return BeautifulSoup object"""
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                return BeautifulSoup(response.content, 'lxml')
            except requests.RequestException as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < retries - 1:
                    time.sleep(delay * (attempt + 1))
                else:
                    logger.error(f"Failed to fetch {url} after {retries} attempts")
                    return None
    
    def parse_price(self, price_str: str) -> Optional[float]:
        """Parse price string to float"""
        if not price_str:
            return None
        
        # Remove currency symbols and whitespace
        price_str = price_str.replace('€', '').replace('$', '').replace('£', '')
        price_str = price_str.replace(' ', '').replace('\u00a0', '').replace('\u202f', '')
        price_str = price_str.strip()
        
        # Handle comma as decimal separator (European format)
        if ',' in price_str and '.' in price_str:
            # Both present: assume comma is thousands separator
            price_str = price_str.replace(',', '')
        elif ',' in price_str:
            # Only comma: assume decimal separator
            price_str = price_str.replace(',', '.')
        
        try:
            return float(price_str)
        except ValueError:
            logger.warning(f"Could not parse price: {price_str}")
            return None
    
    @abstractmethod
    def scrape_products(self, product_type: str = "laptop", max_pages: int = 10) -> List[Dict]:
        """
        Scrape products from vendor website
        
        Args:
            product_type: Type of product to scrape (laptop, desktop, etc.)
            max_pages: Maximum number of pages to scrape
        
        Returns:
            List of product dictionaries
        """
        pass
    
    @abstractmethod
    def get_product_details(self, product_url: str) -> Optional[Dict]:
        """
        Get detailed information for a specific product
        
        Args:
            product_url: URL of the product page
        
        Returns:
            Product dictionary with detailed information
        """
        pass
