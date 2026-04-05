"""
triage_engine.py
================
Safe, modular triage classification engine for the MedIQ symptom chatbot.

Responsibilities:
  - classify_triage()       : Classify symptoms into emergency / urgent / non-urgent
  - get_possible_conditions(): Map symptom clusters to safe, broad condition labels
  - assess_confidence()     : Determine if ML probability is sufficient
  - build_safe_response()   : Assemble a structured, disclaimer-aware JSON response
"""

# ---------------------------------------------------------------------------
# 1. Emergency Triage Rules
#    Each rule is a dict with:
#      "symptoms"  : set of symptom IDs that must ALL be present
#      "reason"    : short human-readable reason for the alert
# ---------------------------------------------------------------------------
EMERGENCY_RULES = [
    {
        "symptoms": {"chest_pain", "shortness_of_breath"},
        "reason": "Chest pain with difficulty breathing may indicate a cardiac or pulmonary emergency.",
    },
    {
        "symptoms": {"chest_pain", "nausea", "sweating"},
        "reason": "Chest pain with nausea and sweating is a classic cardiac warning combination.",
    },
    {
        "symptoms": {"weakness_of_one_body_side", "slurred_speech"},
        "reason": "One-sided weakness combined with speech difficulty may indicate a stroke.",
    },
    {
        "symptoms": {"weakness_of_one_body_side"},
        "reason": "Sudden one-sided weakness is a potential stroke warning sign.",
    },
    {
        "symptoms": {"slurred_speech"},
        "reason": "Sudden slurred speech is a potential stroke warning sign.",
    },
    {
        "symptoms": {"blood_in_sputum"},
        "reason": "Coughing up blood requires urgent respiratory evaluation.",
    },
    {
        "symptoms": {"high_fever", "chills", "fast_heart_rate", "altered_sensorium"},
        "reason": "This combination may indicate severe sepsis or a systemic infection.",
    },
    {
        "symptoms": {"high_fever", "altered_sensorium"},
        "reason": "High fever with confusion may indicate a serious neurological infection.",
    },
]

# Urgent (non-life-threatening but needs prompt attention)
URGENT_RULES = [
    {
        "symptoms": {"chest_pain", "high_fever"},
        "reason": "Fever with chest pain may indicate a pulmonary or cardiac infection.",
    },
    {
        "symptoms": {"chest_pain", "mild_fever"},
        "reason": "Fever with chest pain may indicate a pulmonary or cardiac infection.",
    },
    {
        "symptoms": {"chest_pain", "nausea"},
        "reason": "Chest pain combined with nausea may indicate a cardiac or gastrointestinal issue requiring evaluation.",
    },
    {
        "symptoms": {"chest_pain", "high_fever", "nausea"},
        "reason": "Chest pain with fever and nausea may indicate a cardiac, pulmonary, or systemic infection.",
    },
    {
        "symptoms": {"chest_pain"},
        "reason": "Chest pain without additional context still warrants prompt evaluation.",
    },
    {
        "symptoms": {"high_fever", "cough"},
        "reason": "Fever with cough may indicate a lower respiratory tract infection.",
    },
    {
        "symptoms": {"shortness_of_breath"},
        "reason": "Difficulty breathing warrants prompt medical assessment.",
    },
]

# ---------------------------------------------------------------------------
# 2. Possible Condition Clusters
#    Maps sets of symptom keys → broad, non-diagnostic categories
# ---------------------------------------------------------------------------
CONDITION_CLUSTERS = [
    ({"chest_pain", "shortness_of_breath"}, ["cardiac issue", "pulmonary embolism", "severe respiratory condition"]),
    ({"chest_pain", "nausea"}, ["cardiac issue", "gastrointestinal condition", "anxiety-related"]),
    ({"chest_pain"}, ["cardiac issue", "musculoskeletal pain", "gastrointestinal reflux", "anxiety-related"]),
    ({"weakness_of_one_body_side"}, ["stroke or TIA", "neurological condition"]),
    ({"slurred_speech"}, ["stroke or TIA", "neurological condition"]),
    ({"high_fever", "cough"}, ["lower respiratory infection", "pneumonia", "influenza"]),
    ({"high_fever", "nausea"}, ["systemic infection", "gastrointestinal infection"]),
    ({"nausea", "high_fever"}, ["systemic infection", "gastrointestinal infection"]),
    ({"nausea"}, ["gastrointestinal condition", "inner ear issue", "medication side-effect"]),
    ({"high_fever"}, ["viral or bacterial infection", "flu-like illness"]),
    ({"cough"}, ["upper respiratory infection", "allergic reaction", "bronchitis"]),
    ({"headache", "nausea"}, ["migraine", "tension headache", "hypertension", "dehydration"]),
    ({"skin_rash"}, ["allergic reaction", "viral rash", "contact dermatitis"]),
    ({"burning_micturition"}, ["urinary tract infection", "kidney infection"]),
]

# ---------------------------------------------------------------------------
# 3. Safe Advice Strings
# ---------------------------------------------------------------------------
ADVICE = {
    "emergency": (
        "⚠️ Please seek IMMEDIATE emergency medical care (call emergency services or go to an ER now). "
        "This system cannot confirm a diagnosis. Do not wait."
    ),
    "urgent": (
        "Please see a doctor or visit an urgent care centre as soon as possible. "
        "Your symptoms warrant prompt evaluation. This system cannot confirm a diagnosis."
    ),
    "non-urgent": (
        "Your symptoms do not currently match an emergency pattern. "
        "However, if they worsen or you feel concerned, please consult a healthcare professional. "
        "This system cannot confirm a diagnosis."
    ),
    "uncertain": (
        "Your symptoms alone are insufficient to determine a triage level with confidence. "
        "Please consult a healthcare professional for an accurate evaluation. "
        "This system cannot confirm a diagnosis."
    ),
}

DISCLAIMER = (
    "⚕️ IMPORTANT DISCLAIMER: This tool is for informational purposes only. "
    "It is NOT a substitute for professional medical advice, diagnosis, or treatment. "
    "Always seek the guidance of a qualified health provider for any medical condition."
)

# ---------------------------------------------------------------------------
# 4. Core Functions
# ---------------------------------------------------------------------------

def classify_triage(confirmed_symptoms: set) -> tuple[str, str]:
    """
    Returns (triage_level, reason) where triage_level is one of:
      "emergency" | "urgent" | "non-urgent"
    Checks emergency rules first, then urgent rules.
    """
    # Check emergency rules
    for rule in EMERGENCY_RULES:
        if rule["symptoms"].issubset(confirmed_symptoms):
            return "emergency", rule["reason"]

    # Check urgent rules
    for rule in URGENT_RULES:
        if rule["symptoms"].issubset(confirmed_symptoms):
            return "urgent", rule["reason"]

    return "non-urgent", "No high-priority pattern detected in the provided symptoms."


def get_possible_conditions(confirmed_symptoms: set) -> list[str]:
    """
    Returns a deduplicated list of broad, non-diagnostic possible condition labels
    for the given symptom set. Does NOT claim diagnosis.
    """
    found = []
    for cluster_symptoms, conditions in CONDITION_CLUSTERS:
        if cluster_symptoms.issubset(confirmed_symptoms):
            for c in conditions:
                if c not in found:
                    found.append(c)

    if not found:
        found = ["condition unclear — insufficient symptom data"]

    return found


def assess_confidence(top_probability: float, num_confirmed: int) -> bool:
    """
    Returns True if the ML model confidence is sufficient to be worth showing.
    Thresholds:
      - At least 4 confirmed symptoms
      - Top disease probability >= 40%
    """
    return num_confirmed >= 4 and top_probability >= 0.40


def build_safe_response(
    detected_symptoms: list,
    confirmed_symptoms: set,
    denied_symptoms: set,
    ml_top_disease: str,
    ml_top_prob: float,
    ml_predictions: list,
    triage_level: str,
    triage_reason: str,
) -> dict:
    """
    Assembles the final safe, structured chatbot response.
    Never outputs a definitive diagnosis or specific medication.
    """
    possible_conditions = get_possible_conditions(confirmed_symptoms)

    # Confidence check: only surface ML condition hint if truly confident
    is_confident = assess_confidence(ml_top_prob, len(confirmed_symptoms))
    confident_hint = None
    if is_confident:
        # Rephrase as a 'possible condition category' not a definitive diagnosis
        confident_hint = f"Statistical indicators suggest a possible {ml_top_disease.lower()}-type presentation, but this is NOT a diagnosis."

    # Status label
    if triage_level == "emergency":
        status = "⚠️ Urgent Safety Alert — Seek Immediate Care"
    elif triage_level == "urgent":
        status = "⚠️ Prompt Medical Attention Recommended"
    elif not is_confident and len(confirmed_symptoms) > 3:
        status = "Uncertain — Mixed Clinical Signals"
    else:
        status = "Non-Urgent — Monitor and Consult a Doctor if Needed"

    advice = ADVICE.get(triage_level, ADVICE["uncertain"])

    response = {
        "detected_symptoms": detected_symptoms,
        "triage_level": triage_level,
        "triage_reason": triage_reason,
        "status": status,
        "possible_conditions": possible_conditions,
        "advice": advice,
        "disclaimer": DISCLAIMER,
    }

    if confident_hint:
        response["statistical_note"] = confident_hint

    return response
