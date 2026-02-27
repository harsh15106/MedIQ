# drug_database.py

DRUG_DATABASE = [

    # ANALGESICS / ANTIPYRETICS
    {"name": "Acetaminophen", "class": "Analgesic", "group": "pain", "otc": True},
    {"name": "Ibuprofen", "class": "NSAID", "group": "pain", "otc": True},
    {"name": "Naproxen", "class": "NSAID", "group": "pain", "otc": True},

    # ANTIBIOTICS
    {"name": "Amoxicillin", "class": "Penicillin antibiotic", "group": "antibiotic", "otc": False},
    {"name": "Amoxicillin-Clavulanate", "class": "Beta-lactam antibiotic", "group": "antibiotic", "otc": False},
    {"name": "Azithromycin", "class": "Macrolide antibiotic", "group": "antibiotic", "otc": False},
    {"name": "Doxycycline", "class": "Tetracycline antibiotic", "group": "antibiotic", "otc": False},
    {"name": "Ciprofloxacin", "class": "Fluoroquinolone antibiotic", "group": "antibiotic", "otc": False},
    {"name": "Nitrofurantoin", "class": "Urinary antibiotic", "group": "antibiotic", "otc": False},
    {"name": "Trimethoprim-Sulfamethoxazole", "class": "Sulfa antibiotic", "group": "antibiotic", "otc": False},

    # ANTIVIRALS
    {"name": "Acyclovir", "class": "Antiviral", "group": "antiviral", "otc": False},
    {"name": "Valacyclovir", "class": "Antiviral", "group": "antiviral", "otc": False},
    {"name": "Oseltamivir", "class": "Influenza antiviral", "group": "antiviral", "otc": False},

    # ANTIFUNGALS
    {"name": "Fluconazole", "class": "Systemic antifungal", "group": "antifungal", "otc": False},
    {"name": "Clotrimazole", "class": "Topical antifungal", "group": "antifungal", "otc": True},
    {"name": "Ketoconazole", "class": "Topical antifungal", "group": "antifungal", "otc": True},

    # ANTIDIABETICS
    {"name": "Metformin", "class": "Biguanide", "group": "diabetes", "otc": False},
    {"name": "Insulin", "class": "Hormone therapy", "group": "diabetes", "otc": False},
    {"name": "Glipizide", "class": "Sulfonylurea", "group": "diabetes", "otc": False},

    # ANTIHYPERTENSIVES
    {"name": "Lisinopril", "class": "ACE inhibitor", "group": "hypertension", "otc": False},
    {"name": "Amlodipine", "class": "Calcium channel blocker", "group": "hypertension", "otc": False},
    {"name": "Losartan", "class": "ARB", "group": "hypertension", "otc": False},
    {"name": "Hydrochlorothiazide", "class": "Thiazide diuretic", "group": "hypertension", "otc": False},

    # ASTHMA / RESPIRATORY
    {"name": "Albuterol", "class": "Bronchodilator", "group": "asthma", "otc": False},
    {"name": "Fluticasone", "class": "Inhaled corticosteroid", "group": "asthma", "otc": False},
    {"name": "Montelukast", "class": "Leukotriene modifier", "group": "asthma", "otc": False},

    # GI / GERD
    {"name": "Omeprazole", "class": "Proton pump inhibitor", "group": "gi", "otc": True},
    {"name": "Pantoprazole", "class": "Proton pump inhibitor", "group": "gi", "otc": False},
    {"name": "Famotidine", "class": "H2 blocker", "group": "gi", "otc": True},
    {"name": "Loperamide", "class": "Antidiarrheal", "group": "gi", "otc": True},

    # NEURO / MIGRAINE
    {"name": "Sumatriptan", "class": "Triptan", "group": "migraine", "otc": False},
    {"name": "Propranolol", "class": "Beta blocker", "group": "migraine", "otc": False},

]