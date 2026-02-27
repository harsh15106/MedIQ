def get_therapy_groups(disease):

    d = disease.lower()

    if "heart attack" in d or "paralysis" in d:
        return ["emergency"]

    if any(x in d for x in ["pneumonia", "uti", "impetigo", "typhoid"]):
        return ["antibiotic"]

    if any(x in d for x in ["tuberculosis"]):
        return ["antibiotic"]

    if any(x in d for x in ["diabetes"]):
        return ["diabetes"]

    if any(x in d for x in ["hypertension"]):
        return ["hypertension"]

    if any(x in d for x in ["asthma"]):
        return ["asthma"]

    if any(x in d for x in ["gerd", "ulcer"]):
        return ["gi"]

    if any(x in d for x in ["migraine"]):
        return ["migraine"]

    return ["pain"]