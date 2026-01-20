"""Scrapers module for vendor websites"""
from .base_scraper import BaseScraper
from .dell_scraper import DellScraper
from .hp_scraper import HPScraper

__all__ = ['BaseScraper', 'DellScraper', 'HPScraper']
