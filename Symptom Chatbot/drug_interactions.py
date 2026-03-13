# drug_interactions.py
# Drug-Drug Interaction Database for MedIQ
# Each key is a frozenset of two drug names (lowercased), mapped to interaction details.

DRUG_INTERACTIONS = {
    # ---- NSAID Interactions ----
    frozenset(["ibuprofen", "naproxen"]): {
        "severity": "Moderate",
        "description": "Taking two NSAIDs together significantly increases the risk of gastrointestinal bleeding, ulcers, and kidney damage.",
        "recommendation": "Use only one NSAID at a time. Consult your doctor for alternatives."
    },
    frozenset(["ibuprofen", "metformin"]): {
        "severity": "Moderate",
        "description": "NSAIDs may reduce kidney function, impairing metformin clearance and increasing lactic acidosis risk.",
        "recommendation": "Monitor kidney function closely. Use acetaminophen for pain if possible."
    },
    frozenset(["ibuprofen", "lisinopril"]): {
        "severity": "Moderate",
        "description": "NSAIDs can reduce the blood-pressure-lowering effect of ACE inhibitors and may worsen kidney function.",
        "recommendation": "Avoid chronic NSAID use with ACE inhibitors. Monitor blood pressure and kidney function."
    },
    frozenset(["ibuprofen", "losartan"]): {
        "severity": "Moderate",
        "description": "NSAIDs diminish the antihypertensive effect of ARBs and increase risk of acute kidney injury.",
        "recommendation": "Use the lowest NSAID dose for the shortest duration. Monitor renal function."
    },
    frozenset(["ibuprofen", "hydrochlorothiazide"]): {
        "severity": "Moderate",
        "description": "NSAIDs can reduce the diuretic and antihypertensive effects of thiazides.",
        "recommendation": "Monitor blood pressure. Consider acetaminophen as an alternative analgesic."
    },
    frozenset(["ibuprofen", "amlodipine"]): {
        "severity": "Mild",
        "description": "NSAIDs may slightly reduce the blood-pressure-lowering effect of calcium channel blockers.",
        "recommendation": "Monitor blood pressure if using both regularly."
    },
    frozenset(["naproxen", "lisinopril"]): {
        "severity": "Moderate",
        "description": "NSAIDs can reduce ACE inhibitor efficacy and increase nephrotoxicity risk.",
        "recommendation": "Use lowest effective NSAID dose. Monitor kidney function and blood pressure."
    },
    frozenset(["naproxen", "metformin"]): {
        "severity": "Moderate",
        "description": "NSAIDs may impair renal clearance of metformin, raising lactic acidosis risk.",
        "recommendation": "Prefer acetaminophen. Monitor kidney function if co-administered."
    },

    # ---- Antibiotic Interactions ----
    frozenset(["ciprofloxacin", "metformin"]): {
        "severity": "Severe",
        "description": "Fluoroquinolones can cause dangerous blood sugar fluctuations (both hypo- and hyperglycemia) in diabetic patients on metformin.",
        "recommendation": "Monitor blood glucose very closely. Consider alternative antibiotic if possible."
    },
    frozenset(["azithromycin", "amlodipine"]): {
        "severity": "Moderate",
        "description": "Azithromycin may increase cardiovascular risk (QT prolongation) when combined with certain heart medications.",
        "recommendation": "Monitor for irregular heartbeat. Inform your doctor of all medications."
    },
    frozenset(["ciprofloxacin", "sumatriptan"]): {
        "severity": "Moderate",
        "description": "Ciprofloxacin may increase sumatriptan levels by inhibiting its metabolism, raising side-effect risk.",
        "recommendation": "Use with caution. Consider dose reduction of sumatriptan."
    },
    frozenset(["doxycycline", "omeprazole"]): {
        "severity": "Mild",
        "description": "Proton pump inhibitors may reduce doxycycline absorption slightly due to altered stomach pH.",
        "recommendation": "Take doxycycline with a full glass of water, separated from omeprazole by 2 hours."
    },
    frozenset(["trimethoprim-sulfamethoxazole", "metformin"]): {
        "severity": "Severe",
        "description": "This combination increases the risk of hypoglycemia and hyperkalemia (dangerously high potassium).",
        "recommendation": "Monitor blood glucose and potassium levels closely. Seek medical supervision."
    },

    # ---- Diabetes Drug Interactions ----
    frozenset(["metformin", "insulin"]): {
        "severity": "Moderate",
        "description": "Combined use amplifies blood-sugar-lowering effect, increasing hypoglycemia risk.",
        "recommendation": "Monitor blood glucose frequently. Adjust dosing under medical guidance."
    },
    frozenset(["metformin", "glipizide"]): {
        "severity": "Moderate",
        "description": "Both drugs lower blood sugar. Combined use significantly raises hypoglycemia risk.",
        "recommendation": "Close blood glucose monitoring required. Follow physician dosing guidance."
    },
    frozenset(["glipizide", "ibuprofen"]): {
        "severity": "Moderate",
        "description": "NSAIDs may enhance the hypoglycemic effect of sulfonylureas.",
        "recommendation": "Monitor blood sugar carefully when using together."
    },

    # ---- Cardiovascular Interactions ----
    frozenset(["lisinopril", "losartan"]): {
        "severity": "Severe",
        "description": "Dual RAAS blockade (ACE inhibitor + ARB) significantly increases risk of hyperkalemia, hypotension, and renal failure.",
        "recommendation": "Do NOT use these two drugs together. Consult your doctor immediately."
    },
    frozenset(["lisinopril", "hydrochlorothiazide"]): {
        "severity": "Mild",
        "description": "This is a common therapeutic combination, but may cause excessive blood pressure reduction.",
        "recommendation": "Monitor blood pressure regularly, especially when starting treatment."
    },
    frozenset(["amlodipine", "propranolol"]): {
        "severity": "Moderate",
        "description": "Both drugs lower heart rate and blood pressure. Combined use may cause excessive bradycardia or hypotension.",
        "recommendation": "Monitor heart rate and blood pressure closely. Use under medical supervision."
    },
    frozenset(["propranolol", "albuterol"]): {
        "severity": "Severe",
        "description": "Beta blockers directly oppose bronchodilator effects, potentially causing severe bronchospasm in asthma patients.",
        "recommendation": "Avoid this combination in asthma patients. Use cardioselective beta blockers if necessary."
    },

    # ---- Respiratory Drug Interactions ----
    frozenset(["fluticasone", "ketoconazole"]): {
        "severity": "Severe",
        "description": "Ketoconazole strongly inhibits fluticasone metabolism, leading to dangerously high corticosteroid levels and adrenal suppression.",
        "recommendation": "Avoid this combination. Use alternative antifungal."
    },
    frozenset(["montelukast", "fluconazole"]): {
        "severity": "Mild",
        "description": "Fluconazole may slightly increase montelukast levels. Clinical significance is generally low.",
        "recommendation": "No major action needed. Monitor for increased montelukast side effects."
    },

    # ---- GI Drug Interactions ----
    frozenset(["omeprazole", "pantoprazole"]): {
        "severity": "Moderate",
        "description": "Using two proton pump inhibitors together provides no additional benefit and increases side effect risk.",
        "recommendation": "Use only one PPI at a time."
    },
    frozenset(["omeprazole", "methotrexate"]): {
        "severity": "Severe",
        "description": "PPIs can significantly increase methotrexate blood levels, raising toxicity risk.",
        "recommendation": "Consider temporarily stopping PPI during high-dose methotrexate therapy."
    },

    # ---- Thyroid Interactions ----
    frozenset(["levothyroxine", "omeprazole"]): {
        "severity": "Moderate",
        "description": "PPIs reduce stomach acid needed for levothyroxine absorption, potentially reducing thyroid drug effectiveness.",
        "recommendation": "Take levothyroxine on an empty stomach, at least 4 hours before PPI."
    },
    frozenset(["levothyroxine", "metformin"]): {
        "severity": "Mild",
        "description": "Metformin may slightly reduce TSH levels in hypothyroid patients on levothyroxine.",
        "recommendation": "Monitor thyroid function tests periodically."
    },

    # ---- Migraine Interactions ----
    frozenset(["sumatriptan", "propranolol"]): {
        "severity": "Mild",
        "description": "Propranolol may increase sumatriptan levels. This combination is sometimes used therapeutically but requires monitoring.",
        "recommendation": "Monitor for increased sumatriptan side effects (chest tightness, tingling)."
    },

    # ---- Steroid Interactions ----
    frozenset(["prednisolone", "ibuprofen"]): {
        "severity": "Severe",
        "description": "Corticosteroids combined with NSAIDs dramatically increase the risk of GI bleeding and ulceration.",
        "recommendation": "Avoid this combination. If necessary, use gastroprotective agents."
    },
    frozenset(["prednisolone", "metformin"]): {
        "severity": "Moderate",
        "description": "Corticosteroids raise blood glucose levels, counteracting metformin's glucose-lowering effect.",
        "recommendation": "Monitor blood glucose closely. Dose adjustments may be needed."
    },
}


def check_interactions(drug_list):
    """
    Given a list of drug names, return all detected interactions.
    Returns a list of dicts with drug_a, drug_b, severity, description, recommendation.
    """
    results = []
    normalized = [d.strip() for d in drug_list]

    for i in range(len(normalized)):
        for j in range(i + 1, len(normalized)):
            key = frozenset([normalized[i].lower(), normalized[j].lower()])
            if key in DRUG_INTERACTIONS:
                info = DRUG_INTERACTIONS[key]
                results.append({
                    "drug_a": normalized[i],
                    "drug_b": normalized[j],
                    "severity": info["severity"],
                    "description": info["description"],
                    "recommendation": info["recommendation"]
                })

    return results
