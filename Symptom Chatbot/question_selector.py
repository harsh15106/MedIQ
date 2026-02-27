import numpy as np

def select_best_question(current_probs, disease_symptom_prob, labels, asked_symptoms, gender):

    top_indices = np.argsort(current_probs)[-3:]
    top_diseases = labels.classes_[top_indices]

    best_symptom = None
    max_variance = -1

    # Get all symptoms from first top disease (structure reference)
    all_symptoms = disease_symptom_prob[top_diseases[0]].index

    for symptom in all_symptoms:

        # Skip already asked
        if symptom in asked_symptoms:
            continue

    # Gender filter
        if gender == "male" and symptom in ["abnormal_menstruation"]:
            continue

        if gender == "female" and symptom in ["prostate_pain"]:
            continue

        # Relevance filter
        # Only consider symptom if it meaningfully appears in at least one top disease
        relevant = False
        for disease in top_diseases:
            if disease_symptom_prob[disease][symptom] > 0.2:
                relevant = True
                break

        if not relevant:
            continue

        # Compute variance across top diseases
        values = [
            disease_symptom_prob[disease][symptom]
            for disease in top_diseases
        ]

        variance = np.var(values)

        if variance > max_variance:
            max_variance = variance
            best_symptom = symptom

    # Minimum usefulness threshold
    if max_variance < 0.05:
        return None

    return best_symptom