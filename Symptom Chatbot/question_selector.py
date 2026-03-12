"""
question_selector.py
====================
Two-stage clinical question selector for the MedIQ triage engine.

Stage 1 — DB Priority:
  Select from Supabase disease_symptom_map symptoms, sorted by
  is_primary (descending) then weight (descending). A DB symptom is
  only chosen if it:
    a) has NOT been asked already
    b) passes gender filter
    c) matches the active body region (or is Systemic when allowed)
    d) meaningfully differentiates the top candidate diseases
       (variance across candidate probabilities >= DIFFERENTIATION_THRESHOLD)

Stage 2 — Variance Fallback:
  If no DB symptom qualifies, iterate over the ML disease-symptom
  probability matrix and pick the unasked, region-valid symptom whose
  probability variance across the top candidate diseases is highest.
  Returns None if best variance is below USEFULNESS_THRESHOLD, signalling
  the engine to generate the final report instead of asking more questions.
"""

import numpy as np
from body_systems import SYMPTOM_TO_REGION, SYSTEMIC_DISEASE_INDICATORS

# ── Tuning Constants ──────────────────────────────────────────
# Minimum symptom probability in at least one candidate disease to be "relevant"
RELEVANCE_THRESHOLD     = 0.15

# Minimum cross-disease probability variance for a DB symptom to be "differentiating"
DIFFERENTIATION_THRESHOLD = 0.02

# Minimum variance for the fallback Stage 2 symptom to be "useful"
USEFULNESS_THRESHOLD    = 0.04

# Symptoms that are only allowed when systemic diseases are in play
SYSTEMIC_SYMPTOMS = set(SYSTEMIC_DISEASE_INDICATORS) | {
    "high_fever", "mild_fever", "chills", "fatigue", "night_sweats",
    "weight_loss", "skin_rash", "itching", "malaise", "shivering",
    "swollen_lymph_nodes"
}

# Gender-exclusion list
MALE_EXCLUDED   = {"abnormal_menstruation", "vaginal_discharge", "vulvar_pain"}
FEMALE_EXCLUDED = {"prostate_pain", "testicular_pain"}


# ── Helpers ───────────────────────────────────────────────────

def _passes_gender(symptom: str, gender: str) -> bool:
    g = gender.lower()
    if g == "male" and symptom in MALE_EXCLUDED:
        return False
    if g == "female" and symptom in FEMALE_EXCLUDED:
        return False
    return True


def _passes_region(symptom: str, active_region: str,
                   fallback_region: str = "Systemic",
                   systemic_active: bool = False) -> bool:
    """
    Returns True if this symptom is geographically appropriate to ask.

    Rules:
      - If active_region is 'Systemic', allow everything.
      - Systemic symptoms (fever, chills, etc.) are only allowed when
        systemic_active=True (i.e. SYSTEMIC_MIN_THRESHOLD is met).
      - Otherwise, the symptom's region must match active_region.
    """
    if active_region == "Systemic":
        return True

    # Check if this is a known systemic symptom
    if symptom in SYSTEMIC_SYMPTOMS:
        return systemic_active  # Only ask systemic symptoms if threshold met

    symptom_region = SYMPTOM_TO_REGION.get(symptom, fallback_region)
    if symptom_region == "Systemic":
        return systemic_active  # Same rule for Systemic-mapped symptoms

    return symptom_region == active_region


def _compute_variance(symptom: str, top_diseases: list,
                      disease_symptom_prob: dict) -> float:
    """Variance of symptom probability across the top candidate diseases."""
    values = [
        disease_symptom_prob[d][symptom]
        for d in top_diseases
        if d in disease_symptom_prob and symptom in disease_symptom_prob[d].index
    ]
    return float(np.var(values)) if len(values) >= 2 else 0.0


def _is_relevant(symptom: str, top_diseases: list,
                 disease_symptom_prob: dict) -> bool:
    """True if the symptom appears with probability > RELEVANCE_THRESHOLD in at least one candidate."""
    for d in top_diseases:
        if d in disease_symptom_prob:
            try:
                if disease_symptom_prob[d][symptom] > RELEVANCE_THRESHOLD:
                    return True
            except (KeyError, IndexError):
                pass
    return False


# ── Main Selection Function ───────────────────────────────────

def select_best_question(
    current_probs,
    disease_symptom_prob: dict,
    labels,
    asked_symptoms: set,
    gender: str,
    target_diseases=None,
    active_region: str = "Systemic",
    db_symptoms=None,
    systemic_active: bool = False,
) -> str | None:
    """
    Select the most clinically informative next question to ask.

    Parameters
    ----------
    current_probs       : numpy array of disease probabilities
    disease_symptom_prob: { disease_name -> pd.Series(symptom -> prob) }
    labels              : sklearn LabelEncoder with .classes_
    asked_symptoms      : set of symptom names already asked or confirmed
    gender              : 'male' | 'female'
    target_diseases     : optional list of disease names to focus on
    active_region       : the detected anatomical region (e.g. 'Leg/Foot')
    db_symptoms         : list of dicts from get_symptoms_for_diseases()
    systemic_active     : True when systemic disease threshold has been met

    Returns
    -------
    str  : symptom name to ask about next
    None : no suitable question found — proceed to diagnosis
    """

    # Determine the top candidate diseases
    if target_diseases and len(target_diseases) > 0:
        top_diseases = list(target_diseases)
    else:
        top_indices = np.argsort(current_probs)[-5:][::-1]
        top_diseases = list(labels.classes_[top_indices])

    # ═══════════════════════════════════════════════════════════
    # STAGE 1: DB-Priority Question Selection
    # ═══════════════════════════════════════════════════════════
    if db_symptoms:
        # Sort: primary symptoms first, then highest weight
        sorted_db = sorted(
            db_symptoms,
            key=lambda r: (not r.get("is_primary", False), -r.get("weight", 1))
        )

        for row in sorted_db:
            symptom = row.get("symptom_name", "").lower().replace(" ", "_")
            if not symptom:
                continue

            # ── Already asked? ────────────────────────────────
            if symptom in asked_symptoms:
                continue

            # ── Gender filter ─────────────────────────────────
            if not _passes_gender(symptom, gender):
                continue

            # ── Region filter (strict) ────────────────────────
            fallback_region = row.get("symptom_region", "Systemic")
            if not _passes_region(symptom, active_region, fallback_region, systemic_active):
                continue

            # ── Relevance check ───────────────────────────────
            # Skip if the symptom never meaningfully appears in candidate diseases
            if not _is_relevant(symptom, top_diseases, disease_symptom_prob):
                continue

            # ── Differentiation check ─────────────────────────
            # Skip if this symptom has nearly identical probability across
            # all candidates — it won't help narrow the diagnosis
            variance = _compute_variance(symptom, top_diseases, disease_symptom_prob)
            if len(top_diseases) > 1 and variance < DIFFERENTIATION_THRESHOLD:
                continue

            return symptom  # ✅ Best DB symptom found

    # ═══════════════════════════════════════════════════════════
    # STAGE 2: Variance-Based Fallback from ML Symptom Matrix
    # ═══════════════════════════════════════════════════════════
    best_symptom = None
    max_variance  = -1.0

    try:
        all_symptoms = disease_symptom_prob[top_diseases[0]].index
    except (KeyError, IndexError):
        return None

    for symptom in all_symptoms:
        # ── Already asked? ─────────────────────────────────────
        if symptom in asked_symptoms:
            continue

        # ── Gender filter ───────────────────────────────────────
        if not _passes_gender(symptom, gender):
            continue

        # ── Region filter (strict) ──────────────────────────────
        if not _passes_region(symptom, active_region, "Systemic", systemic_active):
            continue

        # ── Relevance filter ────────────────────────────────────
        if not _is_relevant(symptom, top_diseases, disease_symptom_prob):
            continue

        # ── Compute differentiation variance ────────────────────
        variance = _compute_variance(symptom, top_diseases, disease_symptom_prob)
        if variance > max_variance:
            max_variance = variance
            best_symptom = symptom

    # Only return if the best candidate is genuinely useful
    if max_variance < USEFULNESS_THRESHOLD:
        return None

    return best_symptom