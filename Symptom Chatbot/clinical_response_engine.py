"""
clinical_response_engine.py
============================
Generates safe, non-diagnostic clinical summaries.
Does NOT output medication names or treatment protocols.
Surfaces only general risk context and a strong disclaimer.
"""

def generate_clinical_response(disease, symptoms, age, smoker, bmi):
    """
    Produces a safe, text-based clinical context note.
    'disease' is used only as an internal label — it is NOT presented as a diagnosis.
    """
    # BMI classification
    if bmi < 18.5:
        bmi_category = "Underweight"
    elif bmi < 25:
        bmi_category = "Normal weight"
    elif bmi < 30:
        bmi_category = "Overweight"
    else:
        bmi_category = "Obese"

    output = "\n\n📋 CLINICAL CONTEXT NOTE\n"
    output += "━" * 40 + "\n"
    output += "⚕️ This is NOT a diagnosis. This system cannot confirm any medical condition.\n\n"

    # Symptom summary
    if symptoms:
        readable = [s.replace("_", " ").title() for s in symptoms]
        output += f"Reported symptoms: {', '.join(readable)}\n\n"

    # Personal risk factors only — no condition-specific advice
    output += "Relevant personal risk factors:\n"
    has_risk = False

    if age >= 65:
        output += "  - Age ≥ 65: higher baseline risk for many conditions\n"
        has_risk = True

    if smoker:
        output += "  - Smoking history: increases cardiopulmonary and oncological risk\n"
        has_risk = True

    if bmi >= 30:
        output += f"  - BMI {bmi} ({bmi_category}): associated with increased cardiovascular risk\n"
        has_risk = True
    elif bmi < 18.5:
        output += f"  - BMI {bmi} ({bmi_category}): may indicate nutritional deficiency\n"
        has_risk = True

    if not has_risk:
        output += "  - No significant personal risk factors identified from the information provided\n"

    output += "\n"
    output += "━" * 40 + "\n"
    output += "⚠️ IMPORTANT: Do not use this information to self-diagnose or self-medicate.\n"
    output += "Please consult a qualified healthcare professional for accurate diagnosis and treatment.\n"

    return output