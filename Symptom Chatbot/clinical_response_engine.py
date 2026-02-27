from disease_medications import DISEASE_MEDICATIONS

from disease_medications import DISEASE_MEDICATIONS

def generate_clinical_response(disease, symptoms, age, smoker, bmi):
    output = ""
    output += "\n\n AI CLINICAL REPORT"
    # BMI classification
    if bmi < 18.5:
        bmi_category = "Underweight"
    elif bmi < 25:
        bmi_category = "Normal weight"
    elif bmi < 30:
        bmi_category = "Overweight"
    else:
        bmi_category = "Obese"

    output += f"\nBMI: {bmi} ({bmi_category})\n"
    output += f"\nMost Likely Condition: {disease}\n"

    output += "\nRisk Factors:\n"

    if age >= 65:
        output += "- Age increases risk of complications\n"

    if smoker:
        output += "- Smoking increases cardiopulmonary risk\n"

    if bmi >= 30:
        output += "- Obesity increases cardiovascular risk\n"

    if disease not in DISEASE_MEDICATIONS:
        output += "\nNo detailed medication database available.\n"
        return output

    data = DISEASE_MEDICATIONS[disease]

    output += "\nRecommended Medication Overview:\n"
    output += f"\n{data.get('overview', '')}\n"

    for med in data.get("medications", []):
        output += "\n\n"
        output += f"Medication: {med.get('name', 'N/A')}\n"
        output += f"Class: {med.get('class', 'N/A')}\n"
        output += f"Typical Use: {med.get('use', med.get('purpose', 'N/A'))}\n"
        output += f"General Dose Info: {med.get('dose', med.get('dose_info', 'N/A'))}\n"
        output += f"Timing: {med.get('timing', 'N/A')}\n"
        output += f"Warnings: {med.get('warnings', 'N/A')}\n"

    output += "\n\nImportant: This is a simplified overview. Medication choices depend on individual factors and should be made in consultation with a healthcare provider."
    output += "\n\n"
    return output