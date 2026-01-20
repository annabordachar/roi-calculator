"""HP website scraper"""
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
import re
import logging
import time
from .base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class HPScraper(BaseScraper):
    """Scraper for HP France website"""
    
    def __init__(self):
        super().__init__(
            vendor_name="HP",
            base_url="https://www.hp.com"
        )
        self.locale = "fr-fr"
    
    def scrape_products(self, product_type: str = "laptop", max_pages: int = 10) -> List[Dict]:
        """Scrape HP laptops from the French website"""
        products = []
        
        # HP France laptops URL
        if product_type == "laptop":
            base_search_url = f"{self.base_url}/{self.locale}/shop/portables"
        else:
            logger.warning(f"Product type {product_type} not yet supported for HP")
            return products
        
        try:
            # Try to scrape the main laptops page
            url = f"{base_search_url}"
            soup = self.fetch_page(url)
            
            if not soup:
                logger.error("Failed to fetch HP products page")
                return products
            
            # Find product cards/links
            product_links = []
            
            # Try multiple selectors for product links
            selectors = [
                'a[href*="/shop/portables/"]',
                'a[href*="/product/"]',
                '.product-tile a',
                '.product-card a',
                '[data-testid="product-link"]',
                '.product-item a'
            ]
            
            for selector in selectors:
                links = soup.select(selector)
                if links:
                    product_links = links
                    break
            
            # Extract product information
            for link in product_links[:50]:  # Limit to 50 products per run
                href = link.get('href', '')
                if not href:
                    continue
                
                # Make absolute URL
                if href.startswith('/'):
                    product_url = f"{self.base_url}{href}"
                elif href.startswith('http'):
                    product_url = href
                else:
                    continue
                
                # Get product details
                product = self.get_product_details(product_url)
                if product:
                    products.append(product)
                
                # Add delay to avoid rate limiting
                time.sleep(0.5)
        
        except Exception as e:
            logger.error(f"Error scraping HP products: {e}")
        
        return products
    
    def get_product_details(self, product_url: str) -> Optional[Dict]:
        """Get detailed information for an HP product"""
        try:
            soup = self.fetch_page(product_url)
            if not soup:
                return None
            
            # Extract product name
            name = None
            name_selectors = [
                'h1[data-testid="product-name"]',
                'h1.product-title',
                'h1.product-name',
                'h1',
                '[data-testid="product-title"]'
            ]
            for selector in name_selectors:
                elem = soup.select_one(selector)
                if elem:
                    name = elem.get_text(strip=True)
                    break
            
            # Extract price
            price = None
            price_selectors = [
                '[data-testid="product-price"]',
                '.product-price',
                '.price',
                '[class*="price"]',
                '[data-price]'
            ]
            for selector in price_selectors:
                elem = soup.select_one(selector)
                if elem:
                    price_str = elem.get_text(strip=True)
                    price = self.parse_price(price_str)
                    if price:
                        break
                
                # Also try data attribute
                if not price:
                    price_attr = elem.get('data-price') if elem else None
                    if price_attr:
                        price = self.parse_price(price_attr)
                        if price:
                            break
            
            # Extract model/sku
            model = None
            model_selectors = [
                '[data-testid="product-model"]',
                '.product-model',
                '.sku',
                '[data-sku]'
            ]
            for selector in model_selectors:
                elem = soup.select_one(selector)
                if elem:
                    model = elem.get_text(strip=True)
                    break
            
            # Extract specifications
            specs = {}
            spec_sections = soup.select('.specification, .product-specs, [class*="spec"], .tech-specs')
            for section in spec_sections:
                spec_items = section.select('dt, .spec-label, .spec-name, .spec-row')
                for item in spec_items:
                    key = item.get_text(strip=True)
                    value_elem = item.find_next_sibling(['dd', 'div', 'span', 'td'])
                    if value_elem:
                        value = value_elem.get_text(strip=True)
                        specs[key] = value
            
            # Extract screen size from specs or name
            screen_size = None
            if specs:
                for key, value in specs.items():
                    if 'écran' in key.lower() or 'screen' in key.lower() or 'display' in key.lower():
                        # Extract size (e.g., "16 pouces" or "16"")
                        match = re.search(r'(\d+(?:\.\d+)?)\s*(?:pouces|"|inch)', value, re.IGNORECASE)
                        if match:
                            screen_size = f"{match.group(1)}\""
                            break
            
            if not screen_size and name:
                # Try to extract from product name
                match = re.search(r'(\d+(?:\.\d+)?)\s*(?:pouces|"|inch)', name, re.IGNORECASE)
                if match:
                    screen_size = f"{match.group(1)}\""
            
            # Extract rating and reviews (if available)
            rating = None
            reviews_count = None
            rating_elem = soup.select_one('[data-testid="rating"], .rating, [class*="rating"]')
            if rating_elem:
                rating_text = rating_elem.get_text(strip=True)
                rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                if rating_match:
                    try:
                        rating = float(rating_match.group(1))
                    except:
                        pass
            
            reviews_elem = soup.select_one('[data-testid="reviews"], .reviews-count, [class*="review"]')
            if reviews_elem:
                reviews_text = reviews_elem.get_text(strip=True)
                reviews_match = re.search(r'(\d+)', reviews_text)
                if reviews_match:
                    try:
                        reviews_count = int(reviews_match.group(1))
                    except:
                        pass
            
            # Extract features/description
            features = []
            feature_selectors = [
                '.product-features li',
                '.features li',
                '[class*="feature"] li',
                '.key-features li'
            ]
            for selector in feature_selectors:
                feature_elems = soup.select(selector)
                if feature_elems:
                    features = [elem.get_text(strip=True) for elem in feature_elems]
                    break
            
            if not features:
                # Try to get from description
                desc_elem = soup.select_one('.product-description, .description, [class*="description"]')
                if desc_elem:
                    features = [desc_elem.get_text(strip=True)]
            
            # Only return if we have at least name and price
            if name and price:
                return {
                    "id": f"hp-{model or name.lower().replace(' ', '-')}",
                    "name": name,
                    "model": model or "",
                    "screen_size": screen_size or "",
                    "rating": rating,
                    "reviews_count": reviews_count,
                    "price": price,
                    "link": product_url,
                    "features": " | ".join(features) if features else "",
                    "vendor": "HP",
                    "specs": specs
                }
        
        except Exception as e:
            logger.error(f"Error getting HP product details from {product_url}: {e}")
        
        return None
