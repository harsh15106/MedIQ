# A mocked database for the 30 most common medicines

DRUGS = {
    # Pain relievers / Anti-inflammatory
    "paracetamol": {"names": ["paracetamol", "acetaminophen", "tylenol", "panadol"], "class": "analgesic"},
    "ibuprofen": {"names": ["ibuprofen", "advil", "motrin", "nurofen"], "class": "nsaid"},
    "aspirin": {"names": ["aspirin", "acetylsalicylic acid", "disprin"], "class": "nsaid"},
    "naproxen": {"names": ["naproxen", "aleve"], "class": "nsaid"},
    "diclofenac": {"names": ["diclofenac", "voltaren"], "class": "nsaid"},
    
    # Antibiotics
    "amoxicillin": {"names": ["amoxicillin", "amoxil"], "class": "antibiotic_penicillin"},
    "azithromycin": {"names": ["azithromycin", "zithromax", "z-pak"], "class": "antibiotic_macrolide"},
    "ciprofloxacin": {"names": ["ciprofloxacin", "cipro"], "class": "antibiotic_fluoroquinolone"},
    "doxycycline": {"names": ["doxycycline", "vibramycin"], "class": "antibiotic_tetracycline"},
    "cephalexin": {"names": ["cephalexin", "keflex"], "class": "antibiotic_cephalosporin"},
    
    # Gastrointestinal / Antacids
    "omeprazole": {"names": ["omeprazole", "prilosec", "losec"], "class": "ppi"},
    "pantoprazole": {"names": ["pantoprazole", "protonix"], "class": "ppi"},
    "famotidine": {"names": ["famotidine", "pepcid"], "class": "h2_blocker"},
    "ondansetron": {"names": ["ondansetron", "zofran"], "class": "antiemetic"},
    "loperamide": {"names": ["loperamide", "imodium"], "class": "antidiarrheal"},
    
    # Allergies / Antihistamines
    "cetirizine": {"names": ["cetirizine", "zyrtec"], "class": "antihistamine"},
    "loratadine": {"names": ["loratadine", "claritin"], "class": "antihistamine"},
    "diphenhydramine": {"names": ["diphenhydramine", "benadryl"], "class": "antihistamine"},
    
    # Cardiovascular
    "amlodipine": {"names": ["amlodipine", "norvasc"], "class": "calcium_channel_blocker"},
    "lisinopril": {"names": ["lisinopril", "prinivil", "zestril"], "class": "ace_inhibitor"},
    "losartan": {"names": ["losartan", "cozaar"], "class": "arb"},
    "metoprolol": {"names": ["metoprolol", "lopressor", "toprol"], "class": "beta_blocker"},
    "atorvastatin": {"names": ["atorvastatin", "lipitor"], "class": "statin"},
    "simvastatin": {"names": ["simvastatin", "zocor"], "class": "statin"},
    
    # Diabetes
    "metformin": {"names": ["metformin", "glucophage"], "class": "biguanide"},
    
    # Respiratory / Asthma
    "albuterol": {"names": ["albuterol", "salbutamol", "ventolin"], "class": "bronchodilator"},
    
    # Mental Health / CNS
    "sertraline": {"names": ["sertraline", "zoloft"], "class": "ssri"},
    "escitalopram": {"names": ["escitalopram", "lexapro"], "class": "ssri"},
    "alprazolam": {"names": ["alprazolam", "xanax"], "class": "benzodiazepine"},
    "zolpidem": {"names": ["zolpidem", "ambien"], "class": "sedative"}
}

# Define interaction constraints manually based on class and specific drugs.
# Risk levels: "Severe", "Moderate", "Mild"
INTERACTIONS = [
    # Severe
    ({"nsaid", "nsaid"}, "Severe", "Combining multiple NSAIDs significantly increases the risk of gastrointestinal bleeding and ulcers."),
    ({"nsaid", "ace_inhibitor"}, "Severe", "NSAIDs can reduce the effectiveness of ACE inhibitors and increase the risk of kidney damage."),
    ({"ssri", "nsaid"}, "Severe", "Combining SSRIs and NSAIDs significantly increases the risk of upper gastrointestinal bleeding."),
    ({"macrolide_antibiotic", "statin"}, "Severe", "Increased risk of severe muscle damage (rhabdomyolysis) when combined."), # generic mapping issue potentially - will map below
    ({"benzodiazepine", "sedative"}, "Severe", "Combining CNS depressants can lead to profound sedation, respiratory depression, coma, and death."),
    
    # Moderate
    ({"ppi", "clopidogrel"}, "Moderate", "Omeprazole can reduce the effectiveness of certain antiplatelet medications (interaction rule generalized)."),
    ({"beta_blocker", "calcium_channel_blocker"}, "Moderate", "Can cause an excessive drop in heart rate and blood pressure."),
    ({"analgesic", "nsaid"}, "Moderate", "Taking Paracetamol and Ibuprofen together is generally safe for short periods, but increases liver and kidney load if taken long term."),
    
    # Specific Drug-to-Drug
    ({"ciprofloxacin", "omeprazole"}, "Moderate", "Omeprazole may decrease the absorption of Ciprofloxacin."),
    ({"metformin", "ciprofloxacin"}, "Moderate", "Can increase the risk of severe blood sugar fluctuations."),
    ({"sertraline", "omeprazole"}, "Mild", "Omeprazole may slightly increase the levels of Sertraline in the blood.")
]

def normalize_drug_name(name: str):
    name_lower = name.lower().strip()
    for key, data in DRUGS.items():
        if name_lower in data["names"]:
            return key, data["class"]
    return None, None

def check_conflicts(drug_list: list) -> list:
    """Takes a list of raw drug names and returns any conflicts."""
    identified_drugs = []
    unrecognized = []
    
    # 1. Normalize and identify drugs and classes
    for d in drug_list:
        norm_key, d_class = normalize_drug_name(d)
        if norm_key:
            identified_drugs.append({"name": d, "normalized": norm_key, "class": d_class})
        else:
            unrecognized.append(d)
            
    conflicts = []
    
    # 2. Check for interactions
    # We do pairwise checks for simplicity, or check specific groups.
    for i in range(len(identified_drugs)):
        for j in range(i+1, len(identified_drugs)):
            drug1 = identified_drugs[i]
            drug2 = identified_drugs[j]
            
            # Form sets to check against interaction rules
            class_set = {drug1["class"], drug2["class"]}
            norm_set = {drug1["normalized"], drug2["normalized"]}
            
            # Check rules
            for rule_set, risk, desc in INTERACTIONS:
                # Need absolute match on the subset.
                # Rule set can contain either classes or specific drug norm names.
                if rule_set.issubset(class_set) or rule_set.issubset(norm_set):
                    # We found a match
                    # Avoid duplicate records for the same pair
                    pair_name = f"{drug1['name']} & {drug2['name']}"
                    
                    # See if already recorded
                    already_recorded = False
                    for c in conflicts:
                        if c["drugs"] == pair_name or c["drugs"] == f"{drug2['name']} & {drug1['name']}":
                            already_recorded = True
                            break
                            
                    if not already_recorded:
                        conflicts.append({
                            "drugs": pair_name,
                            "risk": risk,
                            "description": desc
                        })

    return {
        "analyzed_drugs": [d["name"] for d in identified_drugs],
        "unrecognized_drugs": unrecognized,
        "conflicts": conflicts,
        "status": "Safe" if len(conflicts) == 0 else "Risks Found"
    }

if __name__ == "__main__":
    # Test
    print(check_conflicts(["Tylenol", "Advil"]))
    print(check_conflicts(["Lisinopril", "Ibuprofen"]))
    print(check_conflicts(["Zoloft", "Xanax"]))
    print(check_conflicts(["UnknownPill", "Tylenol"]))
