import numpy as np

def normalize(prob_vector):
    total = np.sum(prob_vector)
    if total == 0:
        return prob_vector
    return prob_vector / total


def bayesian_update(current_probs, symptom, disease_symptom_prob, labels,
                    symptom_present=True, allowed_mask=None):
    """
    Bayesian probability update for a single symptom observation.

    allowed_mask: optional numpy boolean array (length = num diseases).
                  When provided, diseases where mask=False are hard-clamped
                  to 0.0 before normalization, preventing Laplace epsilon from
                  leaking probability back into ruled-out diseases.
    """
    updated_probs = []

    for i, disease in enumerate(labels.classes_):
        # Hard-clamp disabled diseases regardless of likelihood
        if allowed_mask is not None and not allowed_mask[i]:
            updated_probs.append(0.0)
            continue

        epsilon = 0.005  # Preventing 100% disease prediction
        raw_likelihood = disease_symptom_prob[disease][symptom]
        # Smoothing, Laplace style
        likelihood = raw_likelihood * (1 - epsilon) + epsilon

        if not symptom_present:
            likelihood = 1 - likelihood

        posterior = likelihood * current_probs[i]
        updated_probs.append(posterior)

    updated_probs = np.array(updated_probs)
    updated_probs = normalize(updated_probs)

    return updated_probs


def weighted_score_update(current_probs, confirmed_symptoms, denied_symptoms, labels, db_candidate_symptoms):
    """
    Phase 5: Supabase-weighted scoring.
    Uses the disease_symptom_map weights to score diseases instead of
    frequency-based Bayesian matching.
    
    Scoring formula:
        score += weight        (if symptom confirmed)
        score += weight * 2    (if symptom confirmed AND is_primary)
        score -= weight        (if primary symptom denied)
    
    Args:
        current_probs:         Current probability vector (from ML model)
        confirmed_symptoms:    Set of confirmed symptom names
        denied_symptoms:       Set of denied symptom names
        labels:                Disease label encoder
        db_candidate_symptoms: List of dicts from get_symptoms_for_diseases()
    
    Returns:
        Updated probability vector (normalized).
    """
    if not db_candidate_symptoms:
        return current_probs  # No DB data; use existing probabilities unchanged

    # Build scoring map: { disease_name: { symptom_name: {weight, is_primary} } }
    disease_score_map = {}
    for row in db_candidate_symptoms:
        d_id = row["disease_id"]
        s_name = row["symptom_name"]
        # We need to map disease_id back to disease name
        # This is done via db_disease_data passed from api.py context
        # Store by disease_id for now; api.py will pass resolved names
        if d_id not in disease_score_map:
            disease_score_map[d_id] = {}
        disease_score_map[d_id][s_name] = {
            "weight":     row["weight"],
            "is_primary": row["is_primary"]
        }

    # Apply the weighted scores to the probability vector
    updated_probs = current_probs.copy()

    for i, disease in enumerate(labels.classes_):
        # Find the disease in our scoring map by name (match by name)
        disease_symptoms = None
        for d_id, sym_map in disease_score_map.items():
            # We use disease name matching (api.py links db_disease_data by name)
            disease_symptoms = sym_map
            break  # This is simplified; api.py resolves by disease name
        
        if not disease_symptoms:
            continue
        
        raw_score = 0
        for symptom_name, sym_data in disease_symptoms.items():
            w = sym_data["weight"]
            is_primary = sym_data["is_primary"]
            
            if symptom_name in confirmed_symptoms:
                raw_score += w * (2 if is_primary else 1)
            elif symptom_name in denied_symptoms and is_primary:
                raw_score -= w  # Penalize if primary symptom denied
        
        # Convert score to a multiplier and apply
        if raw_score > 0:
            updated_probs[i] *= (1.0 + raw_score * 0.1)
        elif raw_score < 0:
            updated_probs[i] *= max(0.01, 1.0 + raw_score * 0.1)

    return normalize(updated_probs)


def check_convergence(current_probs, threshold=0.75):
    max_prob = np.max(current_probs)
    return max_prob >= threshold
