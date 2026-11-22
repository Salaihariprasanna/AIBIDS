import os
import csv
import random
from datetime import datetime, timedelta

def generate_ecommerce_data():
    random.seed(42)
    n_rows = 1200
    start_date = datetime(2024, 1, 1)
    
    segments = ['Consumer', 'Corporate', 'Small Business', 'Enterprise']
    regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East']
    
    categories = {
        'Technology': ['Laptops', 'Smartphones', 'Accessories', 'Cloud Servers', 'Monitors'],
        'Furniture': ['Chairs', 'Tables', 'Bookcases', 'Ergonomic Desks', 'Lighting'],
        'Office Supplies': ['Paper', 'Binders', 'Storage', 'Appliances', 'Fasteners']
    }
    
    cat_keys = list(categories.keys())
    
    rows = []
    for i in range(n_rows):
        days_offset = int(random.uniform(0, 580))
        order_date = (start_date + timedelta(days=days_offset)).strftime('%Y-%m-%d')
        order_id = f"ORD-2024-{10000 + i}"
        cust_id = f"CUST-{random.randint(100, 999)}"
        segment = random.choice(segments)
        region = random.choice(regions)
        
        category = random.choice(cat_keys)
        sub_cat = random.choice(categories[category])
        product_name = f"{sub_cat} Pro Series {random.randint(1, 9)}"
        
        quantity = random.randint(1, 12)
        unit_price = random.uniform(50.0, 850.0) if category == 'Technology' else random.uniform(15.0, 350.0)
        discount = random.choice([0.0, 0.05, 0.10, 0.15, 0.20, 0.25])
        
        sales = round(quantity * unit_price * (1 - discount), 2)
        cost_margin = random.uniform(0.55, 0.85)
        cost = round(sales * cost_margin, 2)
        profit = round(sales - cost, 2)
        shipping_cost = round(random.uniform(5.0, 45.0), 2)
        
        rows.append({
            'order_id': order_id,
            'order_date': order_date,
            'customer_id': cust_id,
            'customer_segment': segment,
            'region': region,
            'category': category,
            'sub_category': sub_cat,
            'product_name': product_name,
            'sales': sales,
            'quantity': quantity,
            'discount': discount,
            'profit': profit,
            'shipping_cost': shipping_cost
        })
        
    rows.sort(key=lambda x: x['order_date'])
    os.makedirs('backend/data/sample_datasets', exist_ok=True)
    out_path = 'backend/data/sample_datasets/ecommerce_sales.csv'
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Created {out_path} ({len(rows)} rows)")

def generate_saas_metrics():
    random.seed(42)
    start_date = datetime(2023, 1, 1)
    months = 24
    
    rows = []
    current_mrr = 25000.0
    active_users = 1200
    
    for i in range(months):
        month_date = (start_date + timedelta(days=int(i*30.5))).strftime('%Y-%m')
        growth_rate = random.uniform(0.04, 0.10)
        mrr_growth = current_mrr * growth_rate
        churn_loss = current_mrr * random.uniform(0.015, 0.035)
        current_mrr = round(current_mrr + mrr_growth - churn_loss, 2)
        arr = round(current_mrr * 12, 2)
        
        new_cust = int(random.randint(30, 90) * (1 + (i * 0.04)))
        churned_cust = int(new_cust * random.uniform(0.08, 0.20))
        active_users = int(active_users + (new_cust * 12) - (churned_cust * 8))
        
        marketing_spend = round(random.uniform(5000, 16000) * (1 + (i * 0.04)), 2)
        cac = round(marketing_spend / max(new_cust, 1), 2)
        arpu = round(current_mrr / max(active_users, 1), 2)
        ltv = round(arpu * 36, 2)
        churn_rate = round((churned_cust / max(active_users, 1)) * 100, 2)
        support_tickets = int(active_users * random.uniform(0.02, 0.05))
        
        rows.append({
            'month': month_date,
            'mrr': current_mrr,
            'arr': arr,
            'new_customers': new_cust,
            'churned_customers': churned_cust,
            'churn_rate_pct': churn_rate,
            'active_users': active_users,
            'marketing_spend': marketing_spend,
            'cac': cac,
            'ltv': ltv,
            'support_tickets': support_tickets
        })
        
    out_path = 'backend/data/sample_datasets/saas_subscription_metrics.csv'
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Created {out_path} ({len(rows)} rows)")

def generate_financial_data():
    random.seed(42)
    start_date = datetime(2023, 1, 1)
    months = 24
    
    rows = []
    cash_reserve = 500000.0
    
    for i in range(months):
        month_date = (start_date + timedelta(days=int(i*30.5))).strftime('%Y-%m')
        revenue = round(random.uniform(90000, 150000) * (1 + (i * 0.035)), 2)
        payroll_expense = round(random.uniform(42000, 72000) * (1 + (i * 0.02)), 2)
        operations_expense = round(revenue * random.uniform(0.18, 0.26), 2)
        marketing_expense = round(revenue * random.uniform(0.10, 0.16), 2)
        r_and_d_expense = round(revenue * random.uniform(0.08, 0.14), 2)
        
        total_expenses = round(payroll_expense + operations_expense + marketing_expense + r_and_d_expense, 2)
        gross_profit = round(revenue - operations_expense, 2)
        net_income = round(revenue - total_expenses, 2)
        tax = round(max(0.0, net_income * 0.21), 2)
        net_cashflow = round(net_income - tax, 2)
        cash_reserve = round(cash_reserve + net_cashflow, 2)
        
        rows.append({
            'period': month_date,
            'revenue': revenue,
            'gross_profit': gross_profit,
            'payroll_expense': payroll_expense,
            'operations_expense': operations_expense,
            'marketing_expense': marketing_expense,
            'r_and_d_expense': r_and_d_expense,
            'total_expenses': total_expenses,
            'net_income': net_income,
            'tax': tax,
            'net_cashflow': net_cashflow,
            'cash_reserve': cash_reserve
        })
        
    out_path = 'backend/data/sample_datasets/financial_cashflow.csv'
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Created {out_path} ({len(rows)} rows)")

def generate_healthcare_data():
    random.seed(42)
    n_rows = 1000
    start_date = datetime(2024, 1, 1)
    
    departments = ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Emergency']
    insurance_providers = ['BlueCross', 'Medicare', 'Aetna', 'UnitedHealth', 'Private']
    genders = ['Male', 'Female', 'Other']
    
    rows = []
    for i in range(n_rows):
        admission_date = (start_date + timedelta(days=int(random.uniform(0, 580)))).strftime('%Y-%m-%d')
        patient_id = f"PAT-{random.randint(1000, 9999)}"
        dept = random.choice(departments)
        age = random.randint(18, 88)
        gender = random.choice(genders)
        ins = random.choice(insurance_providers)
        
        los_days = random.randint(1, 18) if dept != 'Emergency' else random.randint(1, 4)
        base_cost = random.uniform(1200, 8500)
        treatment_cost = round(base_cost * los_days * random.uniform(0.8, 1.4), 2)
        satisfaction_score = round(random.uniform(2.5, 5.0), 1)
        readmission_risk = round(random.uniform(0.05, 0.45), 2)
        
        rows.append({
            'admission_date': admission_date,
            'patient_id': patient_id,
            'department': dept,
            'age': age,
            'gender': gender,
            'insurance': ins,
            'length_of_stay_days': los_days,
            'treatment_cost': treatment_cost,
            'patient_satisfaction': satisfaction_score,
            'readmission_risk_score': readmission_risk
        })
        
    rows.sort(key=lambda x: x['admission_date'])
    out_path = 'backend/data/sample_datasets/healthcare_patient_analytics.csv'
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Created {out_path} ({len(rows)} rows)")

def generate_supply_chain_data():
    random.seed(42)
    n_rows = 1000
    start_date = datetime(2024, 1, 1)
    
    origins = ['Shanghai', 'Singapore', 'Rotterdam', 'Los Angeles', 'Hamburg', 'Dubai']
    destinations = ['New York', 'London', 'Tokyo', 'Sydney', 'Chicago', 'Frankfurt']
    carriers = ['DHL Freight', 'FedEx Logistics', 'Maersk Ocean', 'UPS Global', 'Kuehne+Nagel']
    shipping_modes = ['Air Freight', 'Ocean Cargo', 'Ground Express', 'Rail Intermodal']
    
    rows = []
    for i in range(n_rows):
        shipment_date = (start_date + timedelta(days=int(random.uniform(0, 580)))).strftime('%Y-%m-%d')
        shipment_id = f"SHP-{20000 + i}"
        origin = random.choice(origins)
        dest = random.choice(destinations)
        carrier = random.choice(carriers)
        mode = random.choice(shipping_modes)
        
        transit_days = random.randint(2, 28)
        fuel_cost = round(random.uniform(150.0, 3200.0), 2)
        cargo_value = round(random.uniform(5000.0, 180000.0), 2)
        on_time = random.choice([1, 1, 1, 1, 0]) # 80% on-time
        delay_risk = round(random.uniform(0.02, 0.40), 2) if on_time == 1 else round(random.uniform(0.50, 0.95), 2)
        co2_emissions_kg = round(transit_days * random.uniform(80.0, 450.0), 1)
        
        rows.append({
            'shipment_date': shipment_date,
            'shipment_id': shipment_id,
            'origin': origin,
            'destination': dest,
            'carrier': carrier,
            'shipping_mode': mode,
            'transit_time_days': transit_days,
            'cargo_value': cargo_value,
            'fuel_cost': fuel_cost,
            'is_on_time': on_time,
            'delay_risk_score': delay_risk,
            'co2_emissions_kg': co2_emissions_kg
        })
        
    rows.sort(key=lambda x: x['shipment_date'])
    out_path = 'backend/data/sample_datasets/supply_chain_logistics.csv'
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Created {out_path} ({len(rows)} rows)")

if __name__ == '__main__':
    generate_ecommerce_data()
    generate_saas_metrics()
    generate_financial_data()
    generate_healthcare_data()
    generate_supply_chain_data()
