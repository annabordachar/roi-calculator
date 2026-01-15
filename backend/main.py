from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime
import uuid
import csv
import os
import re

app = FastAPI(
    title="Green IT ROI Platform",
    description="LVMH Green IT ROI Calculator & Marketplace",
    version="1.0.0"
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# DATA (Hardcoded for MVP)
# ============================================

EQUIPMENT_DATA = {
    "laptop": {
        "name": "Laptop",
        "price_new": 1000,
        "price_refurb": 500,
        "lifespan_new": 60,  # LVMH: 60 months
        "lifespan_refurb": 48,
        "co2_new": 193,  # kg CO2e - ADEME
        "co2_refurb": 19.3,  # 10% of new (reuse)
        "power_on": 0.05,  # kW
        "power_standby": 0.003,
        "fleet_count": 1000  # LVMH fleet
    },
    "smartphone": {
        "name": "Smartphone",
        "price_new": 800,
        "price_refurb": 400,
        "lifespan_new": 48,  # LVMH: 48 months
        "lifespan_refurb": 36,
        "co2_new": 80,
        "co2_refurb": 8,
        "power_on": 0.005,
        "power_standby": 0.001,
        "fleet_count": 1000
    },
    "screen": {
        "name": "Screen",
        "price_new": 500,
        "price_refurb": 250,
        "lifespan_new": 72,  # LVMH: 72 months
        "lifespan_refurb": 60,
        "co2_new": 350,
        "co2_refurb": 35,
        "power_on": 0.16,  # LVMH: 0.16 kW
        "power_standby": 0.005,  # LVMH: 0.005 kW
        "fleet_count": 600
    },
    "tablet": {
        "name": "Tablet",
        "price_new": 600,
        "price_refurb": 300,
        "lifespan_new": 60,  # LVMH: 60 months
        "lifespan_refurb": 48,
        "co2_new": 63,
        "co2_refurb": 6.3,
        "power_on": 0.01,
        "power_standby": 0.002,
        "fleet_count": 100
    },
    "switch_router": {
        "name": "Switch/Router",
        "price_new": 800,
        "price_refurb": 350,
        "lifespan_new": 72,  # LVMH: 72 months
        "lifespan_refurb": 60,
        "co2_new": 60,
        "co2_refurb": 6,
        "power_on": 0.03,
        "power_standby": 0.015,
        "fleet_count": 100
    },
    "landline_phone": {
        "name": "Landline Phone",
        "price_new": 200,
        "price_refurb": 100,
        "lifespan_new": 72,
        "lifespan_refurb": 60,
        "co2_new": 20,
        "co2_refurb": 2,
        "power_on": 0.005,
        "power_standby": 0.002,
        "fleet_count": 500
    },
    "refurbished_smartphone": {
        "name": "Refurbished Smartphone",
        "price_new": 400,  # Already refurbished price
        "price_refurb": None,  # N/A - already refurbished
        "lifespan_new": 36,  # LVMH: 36 months for refurb
        "lifespan_refurb": None,
        "co2_new": 8,  # Already low CO2 (reuse)
        "co2_refurb": None,
        "power_on": 0.005,
        "power_standby": 0.001,
        "fleet_count": 100
    },
    "refurbished_screen": {
        "name": "Refurbished Screen",
        "price_new": 250,
        "price_refurb": None,
        "lifespan_new": 72,  # LVMH: 72 months
        "lifespan_refurb": None,
        "co2_new": 35,
        "co2_refurb": None,
        "power_on": 0.16,
        "power_standby": 0.005,
        "fleet_count": 250
    },
    "refurbished_switch_router": {
        "name": "Refurbished Switch/Router",
        "price_new": 350,
        "price_refurb": None,
        "lifespan_new": 84,  # LVMH: 84 months
        "lifespan_refurb": None,
        "co2_new": 6,
        "co2_refurb": None,
        "power_on": 0.03,
        "power_standby": 0.015,
        "fleet_count": 300
    },
    "meeting_room_screen": {
        "name": "Meeting Room Screen",
        "price_new": 2000,
        "price_refurb": 1000,
        "lifespan_new": 72,
        "lifespan_refurb": 60,
        "co2_new": 500,  # Larger screen = more CO2
        "co2_refurb": 50,
        "power_on": 0.25,  # Higher power for large display
        "power_standby": 0.01,
        "fleet_count": 200
    }
}

# Energy parameters
ENERGY_PARAMS = {
    "price_kwh": 0.2016,
    "working_days_year": 220,
    "hours_on_day": 8,
    "hours_standby_day": 16
}

# Maintenance & Residual value estimates (% of purchase price)
MAINTENANCE_RATE = 0.05  # 5% per year
RESIDUAL_RATE_NEW = 0.10  # 10% residual value for new
RESIDUAL_RATE_REFURB = 0.05  # 5% residual value for refurbished

# Leasing rates (monthly % of equipment price)
LEASING_RATES = {
    "laptop": 0.025,        # 2.5% per month (~30% per year)
    "smartphone": 0.03,     # 3% per month
    "screen": 0.02,         # 2% per month
    "tablet": 0.028,        # 2.8% per month
    "switch_router": 0.018, # 1.8% per month
    "landline_phone": 0.02, # 2% per month
    "refurbished_smartphone": 0.035,  # 3.5% (higher for refurb)
    "refurbished_screen": 0.025,
    "refurbished_switch_router": 0.02,
    "meeting_room_screen": 0.015  # 1.5% (expensive equipment)
}


# ============================================
# DELL CATALOG
# ============================================

def load_dell_catalog():
    """Load Dell laptops from CSV file"""
    dell_laptops = []
    csv_path = os.path.join(os.path.dirname(__file__), "data", "dell_laptops.csv")
    
    if not os.path.exists(csv_path):
        return dell_laptops
    
    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse price (format: "941,40 €" or "1 495,78 €" -> 941.40 or 1495.78)
                price_str = row.get('prix', '0')
                # Remove € symbol and all spaces (including non-breaking spaces)
                price_str = price_str.replace('€', '').replace(' ', '').replace('\u00a0', '').replace('\u202f', '').strip()
                # Replace comma with dot for decimal
                price_str = price_str.replace(',', '.')
                # Remove any remaining dots except the last one (thousands separator)
                if price_str.count('.') > 1:
                    parts = price_str.rsplit('.', 1)
                    price_str = parts[0].replace('.', '') + '.' + parts[1]
                
                try:
                    price = float(price_str) if price_str else 0
                except:
                    price = 0
                
                # Skip items with no valid price
                if price <= 0:
                    continue
                
                # Parse rating
                rating_str = row.get('note', 'N/A')
                try:
                    rating = float(rating_str) if rating_str and rating_str != 'N/A' else None
                except:
                    rating = None
                
                # Parse reviews count
                reviews_str = row.get('nombre_avis', 'N/A')
                try:
                    reviews = int(reviews_str) if reviews_str and reviews_str != 'N/A' else None
                except:
                    reviews = None
                
                dell_laptops.append({
                    "id": f"dell-{row.get('modele', '')}",
                    "name": row.get('nom', ''),
                    "model": row.get('modele', ''),
                    "screen_size": row.get('taille_ecran', ''),
                    "rating": rating,
                    "reviews_count": reviews,
                    "price": price,
                    "link": row.get('lien', ''),
                    "features": row.get('caracteristiques', '')
                })
    except Exception as e:
        print(f"Error loading Dell catalog: {e}")
    
    return dell_laptops

# Load Dell catalog on startup
DELL_CATALOG = load_dell_catalog()


# ============================================
# EQUIPMENT CATALOG (All types)
# ============================================

def load_equipment_catalog():
    """Load all equipment from CSV file"""
    catalog = []
    csv_path = os.path.join(os.path.dirname(__file__), "data", "equipment_catalog.csv")
    
    if not os.path.exists(csv_path):
        return catalog
    
    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse price_refurb (may be empty for refurbished items)
                price_refurb = None
                if row.get('price_refurb') and row.get('price_refurb').strip():
                    try:
                        price_refurb = float(row.get('price_refurb'))
                    except:
                        price_refurb = None
                
                # Parse lifespan_refurb (may be empty)
                lifespan_refurb = None
                if row.get('lifespan_refurb') and row.get('lifespan_refurb').strip():
                    try:
                        lifespan_refurb = int(row.get('lifespan_refurb'))
                    except:
                        lifespan_refurb = None
                
                catalog.append({
                    "id": f"{row.get('type', '')}-{row.get('brand', '')}-{row.get('model', '')}".lower().replace(' ', '-'),
                    "type": row.get('type', ''),
                    "brand": row.get('brand', ''),
                    "model": row.get('model', ''),
                    "name": row.get('name', ''),
                    "price_new": float(row.get('price_new', 0)),
                    "price_refurb": price_refurb,
                    "co2_new": float(row.get('co2_new', 0)),
                    "co2_refurb": float(row.get('co2_refurb', 0)) if row.get('co2_refurb') else None,
                    "lifespan_new": int(row.get('lifespan_new', 60)),
                    "lifespan_refurb": lifespan_refurb,
                    "power_on": float(row.get('power_on', 0.05)),
                    "power_standby": float(row.get('power_standby', 0.005)),
                    "source_co2": row.get('source_co2', 'ADEME')
                })
    except Exception as e:
        print(f"Error loading equipment catalog: {e}")
    
    return catalog

# Load equipment catalog on startup
EQUIPMENT_CATALOG = load_equipment_catalog()


# ============================================
# MODELS
# ============================================

class EquipmentType(str, Enum):
    laptop = "laptop"
    smartphone = "smartphone"
    screen = "screen"
    tablet = "tablet"
    switch_router = "switch_router"
    landline_phone = "landline_phone"
    refurbished_smartphone = "refurbished_smartphone"
    refurbished_screen = "refurbished_screen"
    refurbished_switch_router = "refurbished_switch_router"
    meeting_room_screen = "meeting_room_screen"


class ROIRequest(BaseModel):
    equipment_type: EquipmentType
    quantity: int = 1
    duration_months: int = 60
    alpha: float = 0.5  # Financial weight
    beta: float = 0.5   # Carbon weight
    dell_model_id: Optional[str] = None  # Optional Dell specific model (for laptops)
    dell_partnership: bool = False  # LVMH Dell partnership (1€ price)
    catalog_item_id: Optional[str] = None  # Optional specific item from catalog


class ROIResponse(BaseModel):
    equipment_name: str
    quantity: int
    duration_months: int
    
    # Dell specific info
    dell_model: Optional[str] = None
    dell_model_name: Optional[str] = None
    dell_partnership: bool = False
    dell_original_price: Optional[float] = None  # Price before partnership discount
    
    # Catalog item info
    catalog_item_id: Optional[str] = None
    catalog_brand: Optional[str] = None
    catalog_model: Optional[str] = None
    co2_source: Optional[str] = None
    
    # Prices
    price_new: float
    price_refurb: Optional[float]
    
    # Leasing
    lease_monthly: float
    lease_total: float
    lease_vs_buy_savings: float
    
    # Base Metrics
    financial_savings_percent: Optional[float]
    carbon_avoided_kg: float
    energy_cost_annual: float
    
    # TCO
    tco_new: float
    tco_refurb: Optional[float]
    tco_savings: Optional[float]
    
    # ROI Scores (normalized 0-1)
    financial_roi: Optional[float]
    carbon_roi: float
    
    # Final Score
    alpha: float
    beta: float
    score: Optional[float]
    
    # Recommendation
    recommendation: str
    recommendation_reason: str


# ============================================
# ROI CALCULATION FUNCTIONS
# ============================================

def calculate_energy_cost_annual(power_on: float, power_standby: float) -> float:
    """
    E_annual = (P_on × H_on + P_standby × H_standby) × Days × Price_kWh
    """
    hours_on = ENERGY_PARAMS["hours_on_day"]
    hours_standby = ENERGY_PARAMS["hours_standby_day"]
    days = ENERGY_PARAMS["working_days_year"]
    price_kwh = ENERGY_PARAMS["price_kwh"]
    
    kwh_annual = (power_on * hours_on + power_standby * hours_standby) * days
    return round(kwh_annual * price_kwh, 2)


def calculate_tco(purchase_price: float, energy_annual: float, 
                  duration_years: float, is_refurb: bool) -> float:
    """
    TCO_5y = P_purchase + (E_annual × years) + M_maintenance - V_residual
    """
    maintenance = purchase_price * MAINTENANCE_RATE * duration_years
    residual_rate = RESIDUAL_RATE_REFURB if is_refurb else RESIDUAL_RATE_NEW
    residual = purchase_price * residual_rate
    
    tco = purchase_price + (energy_annual * duration_years) + maintenance - residual
    return round(tco, 2)


def calculate_financial_savings(price_new: float, price_refurb: float) -> float:
    """
    Financial_Savings = (Price_New - Price_Refurb) / Price_New × 100%
    """
    if price_refurb is None:
        return None
    return round(((price_new - price_refurb) / price_new) * 100, 1)


def calculate_carbon_avoided(co2_new: float, co2_refurb: float) -> float:
    """
    Carbon_Avoided = CO2_New - CO2_Refurb (kg CO₂e)
    """
    return round(co2_new - co2_refurb, 1)


def calculate_financial_roi(cost_avoided: float, investment: float) -> float:
    """
    Financial_ROI = min(Cost_Avoided / Investment, 1)
    """
    if investment == 0:
        return 1.0
    roi = cost_avoided / investment
    return round(min(roi, 1.0), 2)


def calculate_carbon_roi(co2_avoided: float, co2_new: float) -> float:
    """
    Carbon_ROI = CO2_avoided / CO2_new
    """
    if co2_new == 0:
        return 0
    return round(co2_avoided / co2_new, 2)


def calculate_score(financial_roi: float, carbon_roi: float, 
                    alpha: float, beta: float) -> float:
    """
    Score = α × Financial_ROI + β × Carbon_ROI
    """
    if financial_roi is None:
        # If no refurbished option, use only carbon ROI
        return round(carbon_roi, 2)
    return round(alpha * financial_roi + beta * carbon_roi, 2)


def get_recommendation(score: Optional[float], has_refurb: bool, 
                       tco_new: float, tco_refurb: Optional[float], 
                       lease_total: float, dell_partnership: bool = False) -> tuple:
    """
    Decision based on TCO comparison (most practical approach)
    """
    if dell_partnership:
        return "Buy New", "Dell Partnership at 1€ — Best financial option"
    
    if not has_refurb:
        # Compare only New vs Lease
        if lease_total < tco_new:
            return "Lease", f"Lower TCO than buying new (€{lease_total:,.0f} vs €{tco_new:,.0f})"
        return "Buy New", "No refurbished option available"
    
    # Compare all three options
    options = {
        "Buy New": tco_new,
        "Lease": lease_total,
        "Buy Refurbished": tco_refurb
    }
    
    best_option = min(options, key=options.get)
    best_tco = options[best_option]
    
    if best_option == "Buy Refurbished":
        savings = tco_new - tco_refurb
        return "Buy Refurbished", f"Best TCO (€{best_tco:,.0f}) — Save €{savings:,.0f} vs new"
    elif best_option == "Lease":
        return "Lease", f"Best TCO (€{best_tco:,.0f}) — Consider for flexibility"
    else:
        return "Buy New", f"Best TCO (€{best_tco:,.0f})"


# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
def root():
    return {"message": "Green IT ROI Platform API", "version": "1.0.0"}


@app.get("/api/equipment")
def get_equipment_list():
    """Get list of all available equipment types"""
    return {
        "equipment": [
            {"id": k, "name": v["name"], "has_refurb": v["price_refurb"] is not None}
            for k, v in EQUIPMENT_DATA.items()
        ]
    }


@app.get("/api/equipment/{equipment_type}")
def get_equipment_details(equipment_type: EquipmentType):
    """Get details for a specific equipment type"""
    if equipment_type.value not in EQUIPMENT_DATA:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return EQUIPMENT_DATA[equipment_type.value]


@app.get("/api/dell/laptops")
def get_dell_laptops(min_price: Optional[float] = None, max_price: Optional[float] = None):
    """Get Dell laptop catalog with optional price filter"""
    laptops = DELL_CATALOG.copy()
    
    if min_price is not None:
        laptops = [l for l in laptops if l["price"] >= min_price]
    if max_price is not None:
        laptops = [l for l in laptops if l["price"] <= max_price]
    
    # Sort by price
    laptops.sort(key=lambda x: x["price"])
    
    return {"laptops": laptops, "total": len(laptops)}


@app.get("/api/dell/laptops/{model_id}")
def get_dell_laptop(model_id: str):
    """Get a specific Dell laptop by model ID"""
    laptop = next((l for l in DELL_CATALOG if l["id"] == model_id), None)
    if not laptop:
        raise HTTPException(status_code=404, detail="Dell laptop not found")
    return laptop


@app.get("/api/catalog/{equipment_type}")
def get_equipment_catalog(equipment_type: str):
    """Get equipment catalog by type (screen, smartphone, tablet, switch_router, phone, refurbished_*, meeting_room_screen)"""
    # Map equipment type to catalog type
    type_mapping = {
        "screen": "screen",
        "smartphone": "smartphone",
        "tablet": "tablet",
        "switch_router": "switch_router",
        "landline_phone": "phone",
        "refurbished_smartphone": "refurbished_smartphone",
        "refurbished_screen": "refurbished_screen",
        "refurbished_switch_router": "refurbished_switch_router",
        "meeting_room_screen": "meeting_room_screen"
    }
    
    catalog_type = type_mapping.get(equipment_type, equipment_type)
    items = [item for item in EQUIPMENT_CATALOG if item["type"] == catalog_type]
    
    if not items:
        return {"items": [], "total": 0}
    
    # Sort by price
    items.sort(key=lambda x: x["price_new"])
    
    return {"items": items, "total": len(items)}


@app.get("/api/catalog/item/{item_id}")
def get_catalog_item(item_id: str):
    """Get a specific item from the catalog"""
    item = next((i for i in EQUIPMENT_CATALOG if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.post("/api/calculate", response_model=ROIResponse)
def calculate_roi(request: ROIRequest):
    """
    Calculate ROI for equipment purchase decision
    """
    # Validate weights
    if abs((request.alpha + request.beta) - 1.0) > 0.01:
        raise HTTPException(status_code=400, detail="Alpha + Beta must equal 1")
    
    # Get base equipment data
    equipment = EQUIPMENT_DATA.get(request.equipment_type.value)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Extract base data
    price_new = equipment["price_new"]
    price_refurb = equipment["price_refurb"]
    co2_new = equipment["co2_new"]
    co2_refurb = equipment["co2_refurb"]
    power_on = equipment["power_on"]
    power_standby = equipment["power_standby"]
    
    # Variables for response
    dell_laptop = None
    dell_partnership_price = None
    catalog_item = None
    co2_source = "ADEME Base Empreinte"
    
    # Check for catalog item selection (for non-laptop equipment)
    if request.catalog_item_id:
        catalog_item = next((i for i in EQUIPMENT_CATALOG if i["id"] == request.catalog_item_id), None)
        if catalog_item:
            price_new = catalog_item["price_new"]
            price_refurb = catalog_item["price_refurb"]
            co2_new = catalog_item["co2_new"]
            co2_refurb = catalog_item["co2_refurb"]
            power_on = catalog_item["power_on"]
            power_standby = catalog_item["power_standby"]
            co2_source = catalog_item.get("source_co2", "ADEME")
    
    # Override price if Dell model specified (for laptops)
    if request.equipment_type == EquipmentType.laptop:
        if request.dell_model_id:
            dell_laptop = next((l for l in DELL_CATALOG if l["id"] == request.dell_model_id), None)
            if dell_laptop:
                price_new = dell_laptop["price"]
                # Calculate refurbished price as 50% of Dell price
                price_refurb = round(dell_laptop["price"] * 0.5, 2)
        
        # Apply Dell partnership pricing (1€ per laptop)
        if request.dell_partnership:
            dell_partnership_price = price_new  # Store original price for display
            price_new = 1.0  # Partnership price
    
    has_refurb = price_refurb is not None
    duration_years = request.duration_months / 12
    
    # Calculate leasing costs (based on original price, not partnership price)
    leasing_rate = LEASING_RATES.get(request.equipment_type.value, 0.025)
    lease_base_price = dell_partnership_price if dell_partnership_price else price_new
    lease_monthly = lease_base_price * leasing_rate
    lease_total = lease_monthly * request.duration_months
    
    # Calculate metrics
    energy_annual = calculate_energy_cost_annual(power_on, power_standby)
    
    # For calculations, use original price if partnership is active
    price_for_comparison = dell_partnership_price if dell_partnership_price else price_new
    
    # TCO calculations
    tco_new = calculate_tco(price_new, energy_annual, duration_years, False)
    tco_refurb = calculate_tco(price_refurb, energy_annual, duration_years, True) if has_refurb else None
    tco_savings = round(tco_new - tco_refurb, 2) if tco_refurb else None
    
    # Base metrics - use original price for fair comparison
    financial_savings = calculate_financial_savings(price_for_comparison, price_refurb)
    carbon_avoided = calculate_carbon_avoided(co2_new, co2_refurb)
    
    # ROI scores - use original price for fair comparison
    financial_roi = None
    if has_refurb:
        cost_avoided = price_for_comparison - price_refurb
        financial_roi = calculate_financial_roi(cost_avoided, price_refurb)
    
    carbon_roi = calculate_carbon_roi(carbon_avoided, co2_new)
    
    # Final score
    score = calculate_score(financial_roi, carbon_roi, request.alpha, request.beta) if has_refurb else None
    
    # Recommendation - special case for Dell partnership
    if request.dell_partnership:
        recommendation = "Buy New"
        reason = "Dell Partnership at 1€ — Best financial option"
        # Override score display for partnership
        score = 1.0  # Max score since it's the best deal
        # Calculate partnership savings (vs original price)
        if dell_partnership_price:
            partnership_savings = ((dell_partnership_price - 1) / dell_partnership_price) * 100
            financial_savings = round(partnership_savings, 0)
        financial_roi = 1.0  # Max ROI
    else:
        recommendation, reason = get_recommendation(
            score, has_refurb, tco_new, tco_refurb, lease_total, request.dell_partnership
        )
    
    # Multiply by quantity for totals
    quantity = request.quantity
    
    # Calculate lease vs buy savings
    lease_vs_buy_savings = (price_new * quantity) - (lease_total * quantity)
    
    # Determine equipment name
    if dell_laptop:
        equip_name = dell_laptop["name"]
    elif catalog_item:
        equip_name = catalog_item["name"]
    else:
        equip_name = equipment["name"]
    
    return ROIResponse(
        equipment_name=equip_name,
        quantity=quantity,
        duration_months=request.duration_months,
        
        dell_model=dell_laptop["model"] if dell_laptop else None,
        dell_model_name=dell_laptop["name"] if dell_laptop else None,
        dell_partnership=request.dell_partnership,
        dell_original_price=dell_partnership_price * quantity if dell_partnership_price else None,
        
        catalog_item_id=catalog_item["id"] if catalog_item else None,
        catalog_brand=catalog_item["brand"] if catalog_item else None,
        catalog_model=catalog_item["model"] if catalog_item else None,
        co2_source=co2_source,
        
        price_new=price_new * quantity,
        price_refurb=price_refurb * quantity if price_refurb else None,
        
        lease_monthly=round(lease_monthly * quantity, 2),
        lease_total=round(lease_total * quantity, 2),
        lease_vs_buy_savings=round(lease_vs_buy_savings, 2),
        
        financial_savings_percent=financial_savings,
        carbon_avoided_kg=carbon_avoided * quantity,
        energy_cost_annual=energy_annual * quantity,
        
        tco_new=tco_new * quantity,
        tco_refurb=tco_refurb * quantity if tco_refurb else None,
        tco_savings=tco_savings * quantity if tco_savings else None,
        
        financial_roi=financial_roi,
        carbon_roi=carbon_roi,
        
        alpha=request.alpha,
        beta=request.beta,
        score=score,
        
        recommendation=recommendation,
        recommendation_reason=reason
    )


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


# ============================================
# MARKETPLACE - DATABASE (In-Memory for MVP)
# ============================================

# Simulated database
USERS_DB = {
    "admin@lvmh.com": {
        "id": "user-001",
        "email": "admin@lvmh.com",
        "name": "IT Admin",
        "role": "admin",
        "department": "IT"
    },
    "marie.dupont@lvmh.com": {
        "id": "user-002",
        "email": "marie.dupont@lvmh.com",
        "name": "Marie Dupont",
        "role": "collaborateur",
        "department": "Marketing"
    },
    "jean.martin@lvmh.com": {
        "id": "user-003",
        "email": "jean.martin@lvmh.com",
        "name": "Jean Martin",
        "role": "collaborateur",
        "department": "Finance"
    }
}

MARKETPLACE_DB = [
    {
        "id": "equip-001",
        "type": "laptop",
        "brand": "Dell",
        "model": "Latitude 5540",
        "condition": "excellent",
        "age_months": 18,
        "price_suggested": 650,
        "price_manual": None,
        "photo_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
        "status": "available",
        "description": "Très bon état, batterie neuve",
        "created_at": "2024-01-15T10:00:00",
        "created_by": "user-001"
    },
    {
        "id": "equip-002",
        "type": "screen",
        "brand": "Dell",
        "model": "UltraSharp U2722D",
        "condition": "good",
        "age_months": 24,
        "price_suggested": 450,
        "price_manual": 400,
        "photo_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
        "status": "available",
        "description": "Écran 27 pouces 4K, quelques traces d'usure",
        "created_at": "2024-01-10T14:30:00",
        "created_by": "user-001"
    },
    {
        "id": "equip-003",
        "type": "smartphone",
        "brand": "Apple",
        "model": "iPhone 13 Pro",
        "condition": "excellent",
        "age_months": 12,
        "price_suggested": 650,
        "price_manual": None,
        "photo_url": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-13-pro-family-hero?wid=400&fmt=jpeg&qlt=95",
        "status": "available",
        "description": "État impeccable, avec coque et chargeur",
        "created_at": "2024-01-20T09:15:00",
        "created_by": "user-001"
    },
    {
        "id": "equip-004",
        "type": "laptop",
        "brand": "Apple",
        "model": "MacBook Pro 14",
        "condition": "good",
        "age_months": 20,
        "price_suggested": 1200,
        "price_manual": 1100,
        "photo_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        "status": "reserved",
        "description": "M1 Pro, 16GB RAM, 512GB SSD",
        "created_at": "2024-01-08T11:00:00",
        "created_by": "user-001"
    },
    {
        "id": "equip-005",
        "type": "tablet",
        "brand": "Apple",
        "model": "iPad Pro 12.9",
        "condition": "fair",
        "age_months": 30,
        "price_suggested": 400,
        "price_manual": None,
        "photo_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
        "status": "available",
        "description": "Quelques rayures sur l'écran, fonctionne parfaitement",
        "created_at": "2024-01-05T16:45:00",
        "created_by": "user-001"
    }
]

RESERVATIONS_DB = [
    {
        "id": "res-001",
        "equipment_id": "equip-004",
        "user_id": "user-002",
        "user_name": "Marie Dupont",
        "user_email": "marie.dupont@lvmh.com",
        "user_department": "Marketing",
        "message": "J'en aurais besoin pour un projet client",
        "status": "pending",
        "created_at": "2024-01-22T10:30:00"
    }
]


# ============================================
# MARKETPLACE - MODELS
# ============================================

class UserRole(str, Enum):
    admin = "admin"
    collaborateur = "collaborateur"


class EquipmentCondition(str, Enum):
    excellent = "excellent"
    good = "good"
    fair = "fair"


class EquipmentStatus(str, Enum):
    available = "available"
    reserved = "reserved"
    sold = "sold"


class ReservationStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class LoginRequest(BaseModel):
    email: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    department: str


class MarketplaceItem(BaseModel):
    id: str
    type: str
    brand: str
    model: str
    condition: str
    age_months: int
    price_suggested: float
    price_manual: Optional[float]
    photo_url: Optional[str]
    status: str
    description: Optional[str]
    created_at: str
    created_by: str


class CreateEquipmentRequest(BaseModel):
    type: str
    brand: str
    model: str
    condition: EquipmentCondition
    age_months: int
    price_manual: Optional[float] = None
    photo_url: Optional[str] = None
    description: Optional[str] = None


class UpdateEquipmentRequest(BaseModel):
    type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    condition: Optional[EquipmentCondition] = None
    age_months: Optional[int] = None
    price_manual: Optional[float] = None
    photo_url: Optional[str] = None
    description: Optional[str] = None
    status: Optional[EquipmentStatus] = None


class ReservationRequest(BaseModel):
    equipment_id: str
    user_email: str
    message: Optional[str] = None


class ReservationResponse(BaseModel):
    id: str
    equipment_id: str
    user_id: str
    user_name: str
    user_email: str
    user_department: str
    message: Optional[str]
    status: str
    created_at: str


class UpdateReservationRequest(BaseModel):
    status: ReservationStatus


# ============================================
# MARKETPLACE - HELPER FUNCTIONS
# ============================================

def calculate_suggested_price(equipment_type: str, age_months: int, condition: str) -> float:
    """
    Suggested_Price = Price_New × (1 - (Age_months / Lifespan_months)) × Condition_Factor
    """
    equipment = EQUIPMENT_DATA.get(equipment_type)
    if not equipment:
        return 0
    
    price_new = equipment["price_new"]
    lifespan = equipment["lifespan_new"]
    
    condition_factors = {
        "excellent": 0.9,
        "good": 0.7,
        "fair": 0.5
    }
    condition_factor = condition_factors.get(condition, 0.7)
    
    depreciation = min(age_months / lifespan, 0.8)  # Max 80% depreciation
    suggested = price_new * (1 - depreciation) * condition_factor
    
    return round(suggested, 2)


def get_equipment_display_name(equipment_type: str) -> str:
    equipment = EQUIPMENT_DATA.get(equipment_type)
    return equipment["name"] if equipment else equipment_type.title()


# ============================================
# MARKETPLACE - AUTH ENDPOINTS
# ============================================

@app.post("/api/auth/login", response_model=UserResponse)
def login(request: LoginRequest):
    """Simple login by email (MVP - no password)"""
    user = USERS_DB.get(request.email.lower())
    if not user:
        # Auto-create collaborateur for any @lvmh.com email
        if request.email.lower().endswith("@lvmh.com"):
            new_user = {
                "id": f"user-{str(uuid.uuid4())[:8]}",
                "email": request.email.lower(),
                "name": request.email.split("@")[0].replace(".", " ").title(),
                "role": "collaborateur",
                "department": "Unknown"
            }
            USERS_DB[request.email.lower()] = new_user
            return UserResponse(**new_user)
        raise HTTPException(status_code=401, detail="Email must be @lvmh.com")
    return UserResponse(**user)


@app.get("/api/auth/users", response_model=List[UserResponse])
def get_all_users():
    """Get all users (admin only in real app)"""
    return [UserResponse(**user) for user in USERS_DB.values()]


# ============================================
# MARKETPLACE - EQUIPMENT ENDPOINTS
# ============================================

@app.get("/api/marketplace", response_model=List[MarketplaceItem])
def get_marketplace_items(
    type: Optional[str] = None,
    condition: Optional[str] = None,
    status: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    """Get all marketplace items with optional filters"""
    items = MARKETPLACE_DB.copy()
    
    if type:
        items = [i for i in items if i["type"] == type]
    if condition:
        items = [i for i in items if i["condition"] == condition]
    if status:
        items = [i for i in items if i["status"] == status]
    else:
        # By default, show only available items to collaborateurs
        items = [i for i in items if i["status"] in ["available", "reserved"]]
    
    if min_price is not None:
        items = [i for i in items if (i["price_manual"] or i["price_suggested"]) >= min_price]
    if max_price is not None:
        items = [i for i in items if (i["price_manual"] or i["price_suggested"]) <= max_price]
    
    return [MarketplaceItem(**item) for item in items]


@app.get("/api/marketplace/{item_id}", response_model=MarketplaceItem)
def get_marketplace_item(item_id: str):
    """Get a single marketplace item"""
    item = next((i for i in MARKETPLACE_DB if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return MarketplaceItem(**item)


@app.post("/api/marketplace", response_model=MarketplaceItem)
def create_marketplace_item(request: CreateEquipmentRequest, admin_email: str = "admin@lvmh.com"):
    """Create a new marketplace item (IT Admin only)"""
    # Check admin
    user = USERS_DB.get(admin_email)
    if not user or user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Calculate suggested price
    suggested_price = calculate_suggested_price(
        request.type,
        request.age_months,
        request.condition.value
    )
    
    new_item = {
        "id": f"equip-{str(uuid.uuid4())[:8]}",
        "type": request.type,
        "brand": request.brand,
        "model": request.model,
        "condition": request.condition.value,
        "age_months": request.age_months,
        "price_suggested": suggested_price,
        "price_manual": request.price_manual,
        "photo_url": request.photo_url or "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
        "status": "available",
        "description": request.description,
        "created_at": datetime.now().isoformat(),
        "created_by": user["id"]
    }
    
    MARKETPLACE_DB.append(new_item)
    return MarketplaceItem(**new_item)


@app.put("/api/marketplace/{item_id}", response_model=MarketplaceItem)
def update_marketplace_item(item_id: str, request: UpdateEquipmentRequest, admin_email: str = "admin@lvmh.com"):
    """Update a marketplace item (IT Admin only)"""
    # Check admin
    user = USERS_DB.get(admin_email)
    if not user or user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    item_index = next((i for i, item in enumerate(MARKETPLACE_DB) if item["id"] == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    item = MARKETPLACE_DB[item_index]
    
    # Update fields
    if request.type is not None:
        item["type"] = request.type
    if request.brand is not None:
        item["brand"] = request.brand
    if request.model is not None:
        item["model"] = request.model
    if request.condition is not None:
        item["condition"] = request.condition.value
        # Recalculate suggested price
        item["price_suggested"] = calculate_suggested_price(
            item["type"],
            item["age_months"],
            request.condition.value
        )
    if request.age_months is not None:
        item["age_months"] = request.age_months
        # Recalculate suggested price
        item["price_suggested"] = calculate_suggested_price(
            item["type"],
            request.age_months,
            item["condition"]
        )
    if request.price_manual is not None:
        item["price_manual"] = request.price_manual
    if request.photo_url is not None:
        item["photo_url"] = request.photo_url
    if request.description is not None:
        item["description"] = request.description
    if request.status is not None:
        item["status"] = request.status.value
    
    MARKETPLACE_DB[item_index] = item
    return MarketplaceItem(**item)


@app.delete("/api/marketplace/{item_id}")
def delete_marketplace_item(item_id: str, admin_email: str = "admin@lvmh.com"):
    """Delete a marketplace item (IT Admin only)"""
    # Check admin
    user = USERS_DB.get(admin_email)
    if not user or user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    item_index = next((i for i, item in enumerate(MARKETPLACE_DB) if item["id"] == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    MARKETPLACE_DB.pop(item_index)
    return {"message": "Equipment deleted successfully"}


# ============================================
# MARKETPLACE - RESERVATION ENDPOINTS
# ============================================

@app.get("/api/reservations", response_model=List[ReservationResponse])
def get_reservations(user_email: Optional[str] = None, status: Optional[str] = None):
    """Get reservations (filtered by user or status)"""
    reservations = RESERVATIONS_DB.copy()
    
    if user_email:
        reservations = [r for r in reservations if r["user_email"] == user_email]
    if status:
        reservations = [r for r in reservations if r["status"] == status]
    
    return [ReservationResponse(**r) for r in reservations]


@app.post("/api/reservations", response_model=ReservationResponse)
def create_reservation(request: ReservationRequest):
    """Create a reservation request (Collaborateur)"""
    # Check user exists
    user = USERS_DB.get(request.user_email.lower())
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check equipment exists and is available
    item = next((i for i in MARKETPLACE_DB if i["id"] == request.equipment_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if item["status"] != "available":
        raise HTTPException(status_code=400, detail="Equipment is not available")
    
    # Check for existing pending reservation
    existing = next((r for r in RESERVATIONS_DB 
                     if r["equipment_id"] == request.equipment_id 
                     and r["user_email"] == request.user_email
                     and r["status"] == "pending"), None)
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending reservation for this item")
    
    new_reservation = {
        "id": f"res-{str(uuid.uuid4())[:8]}",
        "equipment_id": request.equipment_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "user_email": user["email"],
        "user_department": user["department"],
        "message": request.message,
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    
    RESERVATIONS_DB.append(new_reservation)
    
    # Update equipment status to reserved
    item_index = next(i for i, x in enumerate(MARKETPLACE_DB) if x["id"] == request.equipment_id)
    MARKETPLACE_DB[item_index]["status"] = "reserved"
    
    return ReservationResponse(**new_reservation)


@app.put("/api/reservations/{reservation_id}", response_model=ReservationResponse)
def update_reservation(reservation_id: str, request: UpdateReservationRequest, admin_email: str = "admin@lvmh.com"):
    """Update reservation status (IT Admin only)"""
    # Check admin
    user = USERS_DB.get(admin_email)
    if not user or user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    res_index = next((i for i, r in enumerate(RESERVATIONS_DB) if r["id"] == reservation_id), None)
    if res_index is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    reservation = RESERVATIONS_DB[res_index]
    reservation["status"] = request.status.value
    
    # Update equipment status based on reservation
    item_index = next((i for i, x in enumerate(MARKETPLACE_DB) if x["id"] == reservation["equipment_id"]), None)
    if item_index is not None:
        if request.status == ReservationStatus.approved:
            MARKETPLACE_DB[item_index]["status"] = "sold"
        elif request.status == ReservationStatus.rejected:
            MARKETPLACE_DB[item_index]["status"] = "available"
    
    RESERVATIONS_DB[res_index] = reservation
    return ReservationResponse(**reservation)


@app.delete("/api/reservations/{reservation_id}")
def cancel_reservation(reservation_id: str, user_email: str):
    """Cancel a reservation (by the user who made it)"""
    res_index = next((i for i, r in enumerate(RESERVATIONS_DB) if r["id"] == reservation_id), None)
    if res_index is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    reservation = RESERVATIONS_DB[res_index]
    
    # Check if user owns this reservation
    if reservation["user_email"] != user_email:
        raise HTTPException(status_code=403, detail="You can only cancel your own reservations")
    
    # Check if still pending
    if reservation["status"] != "pending":
        raise HTTPException(status_code=400, detail="Can only cancel pending reservations")
    
    # Update equipment status back to available
    item_index = next((i for i, x in enumerate(MARKETPLACE_DB) if x["id"] == reservation["equipment_id"]), None)
    if item_index is not None:
        MARKETPLACE_DB[item_index]["status"] = "available"
    
    RESERVATIONS_DB.pop(res_index)
    return {"message": "Reservation cancelled successfully"}


# ============================================
# MARKETPLACE - STATS ENDPOINT
# ============================================

@app.get("/api/marketplace/stats")
def get_marketplace_stats():
    """Get marketplace statistics"""
    total = len(MARKETPLACE_DB)
    available = len([i for i in MARKETPLACE_DB if i["status"] == "available"])
    reserved = len([i for i in MARKETPLACE_DB if i["status"] == "reserved"])
    sold = len([i for i in MARKETPLACE_DB if i["status"] == "sold"])
    pending_reservations = len([r for r in RESERVATIONS_DB if r["status"] == "pending"])
    
    # Value of available equipment
    total_value = sum(
        (i["price_manual"] or i["price_suggested"]) 
        for i in MARKETPLACE_DB if i["status"] == "available"
    )
    
    return {
        "total_items": total,
        "available": available,
        "reserved": reserved,
        "sold": sold,
        "pending_reservations": pending_reservations,
        "total_available_value": round(total_value, 2)
    }


# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
