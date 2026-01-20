"""Script to fix double domain URLs in Dell CSV files"""
import csv
import os
import shutil
from datetime import datetime

def clean_dell_url(url: str) -> str:
    """Clean Dell URL to remove double domain"""
    if not url:
        return url
    # Fix double domain pattern: https://www.dell.com//www.dell.com/...
    # Look for the pattern where we have //www.dell.com/ after https://www.dell.com
    if 'https://www.dell.com//www.dell.com/' in url:
        # Replace the double domain with single domain
        url = url.replace('https://www.dell.com//www.dell.com/', 'https://www.dell.com/', 1)
    return url

def fix_csv_file(csv_path: str):
    """Fix URLs in a CSV file"""
    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        return
    
    # Create backup
    backup_path = f"{csv_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copy2(csv_path, backup_path)
    print(f"Created backup: {backup_path}")
    
    # Read and fix
    rows = []
    fixed_count = 0
    
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        
        for row in reader:
            # Fix link/lien field
            if 'link' in row:
                old_url = row['link']
                new_url = clean_dell_url(old_url)
                if old_url != new_url:
                    row['link'] = new_url
                    fixed_count += 1
            if 'lien' in row:  # Changed from elif to if to check both
                old_url = row['lien']
                new_url = clean_dell_url(old_url)
                if old_url != new_url:
                    row['lien'] = new_url
                    fixed_count += 1
            
            rows.append(row)
    
    # Write back
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"Fixed {fixed_count} URLs in {csv_path}")

if __name__ == "__main__":
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    
    # Fix dell_laptops.csv
    dell_csv = os.path.join(data_dir, "dell_laptops.csv")
    if os.path.exists(dell_csv):
        print(f"Fixing {dell_csv}...")
        fix_csv_file(dell_csv)
    
    # Fix dell_catalog.csv if it exists
    dell_catalog = os.path.join(data_dir, "dell_catalog.csv")
    if os.path.exists(dell_catalog):
        print(f"Fixing {dell_catalog}...")
        fix_csv_file(dell_catalog)
    
    print("Done!")
