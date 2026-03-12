from disease_guidance import DISEASE_GUIDANCE

def generate_clinical_response(diseases, symptoms, age, smoker, bmi,
                                active_systems=[], matched_primary=[], absent_primary=[],
                                db_disease_data=None):
    """
    diseases:       list of disease names (str) or list of tuples (name, probability)
    db_disease_data: dict of { disease_name: { id, body_system, description, ... } }
                    from Supabase — used for richer clinical explanations.
    """
    """
    diseases: list of tuples (name, probability) or just a list of names
    """
    output = "## AI Clinical Report\n\n"
    
    # 1. Identified Body System
    output += f"**Identified Body System:** {', '.join(active_systems) if active_systems else 'General/Systemic'}\n\n"
    
    # Handle single vs multiple diseases
    if isinstance(diseases, str):
        diseases = [diseases]
        
    # 2. Most Likely Condition(s)
    if not diseases:
        output += "**Most Likely Condition:** Unable to determine.\n\n"
    elif len(diseases) == 1:
        output += f"**Most Likely Condition:** {diseases[0]}\n\n"
    else:
        output += "**Most Likely Conditions:**\n"
        limit = min(3, len(diseases))
        for i in range(limit):
            output += f"{i+1}. {diseases[i]}\n"
        output += "\n"
    
    # 3. Brief Medical Explanation
    output += "**Brief Medical Explanation:**\n"
    e_limit = min(2, len(diseases))
    for i in range(e_limit):
        d = diseases[i]
        explanation = "This condition requires medical evaluation to determine the most effective management approach."
        if d == "Heart attack": explanation = "A Heart attack occurs when blood flow to the heart is blocked, requiring immediate emergency intervention."
        elif "Paralysis" in d: explanation = "Paralysis related to a brain hemorrhage is a critical neurological emergency requiring hospital care."
        
        if len(diseases) > 1:
            output += f"- **{d}:** {explanation}\n"
        else:
            output += f"{explanation}\n"
    output += "\n"

    # 4. Possible Care and Medication Guidance
    output += "**Possible Care and Medication Guidance:**\n"
    seen_guidance = set()
    g_limit = min(2, len(diseases))
    for i in range(g_limit):
        d = diseases[i]
        g = DISEASE_GUIDANCE.get(d, "Please consult a healthcare professional for a tailored care and treatment plan.")
        if g not in seen_guidance:
            if len(diseases) > 1:
                output += f"- **For {d}:** {g}\n"
            else:
                output += f"{g}\n"
            seen_guidance.add(g)
    output += "\n"

    # 5. Patient Risk Factors
    risk_factors = []
    if bmi is not None:
        if bmi < 18.5: bmi_category = "Underweight"
        elif bmi < 25: bmi_category = "Normal weight"
        elif bmi < 30: bmi_category = "Overweight"
        else: bmi_category = "Obese"
        
        risk_factors.append(f"BMI: {bmi} ({bmi_category})")
        if bmi >= 30:
            risk_factors.append("Higher body weight can increase stress on muscles, joints, and internal systems.")

    if age >= 65:
        risk_factors.append("Age (65+) increases general risk of health complications.")

    if smoker:
        risk_factors.append("Smoking increases long-term cardiopulmonary risk.")

    if risk_factors:
        output += "**Patient Risk Factors:**\n"
        for rf in risk_factors:
            output += f"- {rf}\n"
        output += "\n"

    # 6. Medical Disclaimer
    output += "**Medical Disclaimer:**\nThis is an AI-based symptom assessment and not a confirmed medical diagnosis. Please consult a healthcare professional for proper medical advice.\n"
    
    return output