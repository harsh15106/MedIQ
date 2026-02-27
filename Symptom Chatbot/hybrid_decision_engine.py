# hybrid_decision_engine.py

def apply_cluster_rules(scores, symptoms):

    s = set(symptoms)

    # Infectious cluster
    if {"high_fever", "cough"} <= s:
        for d in scores:
            if d in ["Pneumonia", "Common Cold", "Tuberculosis"]:
                scores[d] += 5

    # Stroke cluster
    if "weakness_of_one_body_side" in s:
        if "Paralysis (brain hemorrhage)" in scores:
            scores["Paralysis (brain hemorrhage)"] += 10

    # Cardiac cluster
    if {"chest pain", "shortness of breath"} <= s:
        if "Heart attack" in scores:
            scores["Heart attack"] += 10

    return scores


def apply_risk_weighting(scores, age, smoker, family_history):

    for disease in scores:

        # Age boosts
        if age >= 60:
            if disease in ["Heart attack", "Pneumonia", "Hypertension"]:
                scores[disease] += 3

        # Smoking boosts
        if smoker:
            if disease in ["Pneumonia", "Tuberculosis", "Bronchial Asthma"]:
                scores[disease] += 3

        # Family cardiac risk
        if family_history:
            if disease == "Heart attack":
                scores[disease] += 5

    return scores


def apply_red_flags(symptoms):

    s = set(symptoms)

    if "weakness_of_one_body_side" in s:
        return "Paralysis (brain hemorrhage)"

    if {"chest pain", "shortness of breath"} <= s:
        return "Heart attack"

    return None