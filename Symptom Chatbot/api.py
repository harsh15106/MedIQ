"""
api.py
======
FastAPI chatbot endpoint for MedIQ Symptom Chatbot.

Safety design:
  - Never outputs a definitive diagnosis
  - Never recommends specific medications
  - Uses triage_engine to classify risk level (emergency / urgent / non-urgent)
  - Returns structured JSON with safe advice and disclaimers
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib as jb
import numpy as np
import re

from all_symptoms import common_symptoms, disease_symptom_prob
from bayesian_engine import bayesian_update
from symptom_mapper import extract_symptoms_from_text
from clinical_response_engine import generate_clinical_response
from triage_engine import classify_triage, get_possible_conditions, ADVICE, DISCLAIMER
from drug_interactions import check_interactions
from drug_database import DRUG_DATABASE
from question_selector import select_best_question

# Deep Translator — optional, for multilingual support
try:
    from deep_translator import GoogleTranslator
    TRANSLATOR_AVAILABLE = True
except ImportError:
    TRANSLATOR_AVAILABLE = False

# ─── App Setup ───────────────────────────────────────────────────────────────

app = FastAPI(title="MedIQ Symptom Chatbot API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model once at startup
model = jb.load("disease_prediction_model.pkl")
labels = jb.load("label_encoder.pkl")

# ─── Drug Interaction API ─────────────────────────────────────────────────────

class InteractionRequest(BaseModel):
    drugs: list[str]

@app.get("/drugs")
def get_drugs():
    """Return all drugs in the database for the frontend selector."""
    return [{"name": d["name"], "class": d["class"], "group": d["group"]} for d in DRUG_DATABASE]

@app.post("/check-interactions")
def check_drug_interactions(data: InteractionRequest):
    """Check for interactions between a list of drugs."""
    results = check_interactions(data.drugs)
    return {
        "drug_count": len(data.drugs),
        "interactions_found": len(results),
        "interactions": results,
    }

# ─── Translation API ──────────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "auto"

@app.post("/translate")
def translate_text(data: TranslateRequest):
    """Translate text to English using Google Translate."""
    if not TRANSLATOR_AVAILABLE:
        return {"translated_text": data.text, "detected_lang": "en", "error": "Translator not available"}
    try:
        translator = GoogleTranslator(source=data.source_lang, target="en")
        translated = translator.translate(data.text)
        return {"translated_text": translated, "source_lang": data.source_lang}
    except Exception as e:
        return {"translated_text": data.text, "detected_lang": "en", "error": str(e)}

# ─── Chatbot API ──────────────────────────────────────────────────────────────

class PatientProfile(BaseModel):
    age: int
    gender: str
    height_cm: Optional[float] = None   # cm — optional; BMI defaults to 25.0 if absent
    weight_kg: Optional[float] = None   # kg — optional; BMI defaults to 25.0 if absent
    smoker: bool
    family_history: bool

class ChatRequest(BaseModel):
    patient_profile: PatientProfile
    new_text: str
    confirmed_symptoms: list[str]
    denied_symptoms: list[str]
    language: Optional[str] = "en"


@app.post("/chat")
def chat(data: ChatRequest):
    """
    Main chatbot endpoint.

    Flow:
      1. Extract symptoms from natural language input
      2. Run ML model + Bayesian updates for internal weighting
      3. Apply clinical heuristic boosts (age, BMI, smoking)
      4. Classify triage level via rule-based triage_engine
      5. Return safe, structured JSON (no diagnosis, no medication)
    """
    profile = data.patient_profile
    new_text = data.new_text
    confirmed = set(data.confirmed_symptoms)
    denied = set(data.denied_symptoms)

    # ── Auto-translate if needed ──────────────────────────────────────────────
    if data.language and data.language != "en" and TRANSLATOR_AVAILABLE:
        try:
            translator = GoogleTranslator(source=data.language, target="en")
            new_text = translator.translate(new_text)
        except Exception:
            pass

    # ── BMI calculation ───────────────────────────────────────────────────────
    # Extract to local variables first so the type-checker can narrow correctly.
    _h: Optional[float] = profile.height_cm
    _w: Optional[float] = profile.weight_kg
    if _h is not None and _w is not None and _h > 0:
        bmi: float = round(_w / (_h / 100) ** 2, 1)
    else:
        bmi = 25.0  # clinically neutral default when measurements are unavailable

    # ── Step 1: Symptom Extraction ────────────────────────────────────────────
    extraction = extract_symptoms_from_text(new_text)
    detected = extraction["detected_symptoms"]  # list[str]

    for sym in detected:
        if sym not in denied:
            confirmed.add(sym)

    # If still no symptoms, ask the user to elaborate
    if not confirmed:
        return {
            "type": "question",
            "question_text": (
                "I couldn't detect any specific symptoms from your message. "
                "Could you describe how you're feeling in more detail? "
                "For example: 'I have a fever, chest pain, and feel short of breath.'"
            ),
            "symptom_id": None,
            "confirmed_symptoms": list(confirmed),
            "denied_symptoms": list(denied),
            "detected_symptoms": detected,
        }

    # ── Step 2: ML Input Vector ───────────────────────────────────────────────
    input_vector = np.zeros(len(common_symptoms))
    for symptom in confirmed:
        if symptom in common_symptoms:
            idx = common_symptoms.index(symptom)
            input_vector[idx] = 1

    input_vector = input_vector.reshape(1, -1)

    # ── Step 3: ML Prediction + Bayesian Updates ──────────────────────────────
    current_probs = model.predict_proba(input_vector)[0]

    for symptom in confirmed:
        current_probs = bayesian_update(
            current_probs, symptom, disease_symptom_prob, labels, symptom_present=True
        )
    for symptom in denied:
        current_probs = bayesian_update(
            current_probs, symptom, disease_symptom_prob, labels, symptom_present=False
        )

    # Smoothing to prevent overconfidence
    current_probs = np.power(current_probs, 0.75)
    current_probs /= current_probs.sum()

    # ── Step 4: Clinical Heuristic Boosts ────────────────────────────────────
    # Duration
    duration_weeks = 0
    match = re.search(r'(\d+)\s*week', new_text.lower())
    if match:
        duration_weeks = int(match.group(1))

    if profile.age >= 60:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Heart attack", "Pneumonia", "Hypertension"]:
                current_probs[i] *= 1.3

    if bmi >= 30:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Heart attack", "Hypertension"]:
                current_probs[i] *= 1.3

    if profile.smoker:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Tuberculosis", "Pneumonia", "Bronchial Asthma"]:
                current_probs[i] *= 1.4

    if profile.family_history:
        for i, disease in enumerate(labels.classes_):
            if disease == "Heart attack":
                current_probs[i] *= 1.6

    if {"high_fever", "cough"} <= confirmed:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Pneumonia", "Common Cold", "Tuberculosis"]:
                current_probs[i] *= 2.0

    if duration_weeks >= 3 and "blood_in_sputum" in confirmed:
        for i, disease in enumerate(labels.classes_):
            if disease == "Tuberculosis":
                current_probs[i] *= 2.0

    if "weakness_of_one_body_side" in confirmed or "slurred_speech" in confirmed:
        for i, disease in enumerate(labels.classes_):
            if "Paralysis" in disease:
                current_probs[i] *= 4.0

    current_probs /= current_probs.sum()

    # ── Step 5: Top Probability (internal only — NEVER returned to client) ────
    sorted_probs = np.sort(current_probs)[::-1]
    top3_idx = np.argsort(current_probs)[-3:][::-1]

    # Disease names NEVER stored in response-bound variables
    _ml_top_prob = float(current_probs[top3_idx[0]])
    _ml_top_disease_internal = labels.inverse_transform([top3_idx[0]])[0]  # internal only

    # ── Step 6: Triage Classification (rule-based, safe) ─────────────────────
    triage_level, triage_reason = classify_triage(confirmed)

    # ── Step 7: Confidence-based uncertainty status ───────────────────────────
    if _ml_top_prob < 0.70 and triage_level == "non-urgent":
        status = "Uncertain — Mixed Clinical Signals"
    elif triage_level == "emergency":
        status = "Symptoms are concerning and may indicate a serious condition. This system cannot confirm a diagnosis."
    elif triage_level == "urgent":
        status = "Your symptoms warrant prompt medical evaluation. This system cannot confirm a diagnosis."
    else:
        status = "No high-priority pattern detected. Monitor symptoms and consult a doctor if they worsen."

    # ── Step 8: Decide — ask follow-up question OR return final report ────────
    is_confident = (sorted_probs[0] - sorted_probs[1] >= 0.15) and confirmed != {"altered_sensorium"}

    if (
        triage_level == "non-urgent"
        and not is_confident
        and len(confirmed) + len(denied) < 15
    ):
        already_asked = confirmed.union(denied)
        next_symptom = select_best_question(
            current_probs, disease_symptom_prob, labels, already_asked, profile.gender.lower()
        )
        if next_symptom:
            sym_readable = next_symptom.replace("_", " ")
            return {
                "type": "question",
                "question_text": f"Do you also have {sym_readable}?",
                "symptom_id": next_symptom,
                "symptoms": [s.replace("_", " ") for s in confirmed],
                "confirmed_symptoms": list(confirmed),
                "denied_symptoms": list(denied),
                "diagnosis": None,
                "medication": None,
            }

    # ── Step 9: Build strictly safe final response ────────────────────────────
    possible_causes = get_possible_conditions(confirmed)
    advice = ADVICE.get(triage_level, ADVICE["uncertain"])

    clinical_note = generate_clinical_response(
        _ml_top_disease_internal, list(confirmed), profile.age, profile.smoker, bmi
    )

    # STRICTLY SAFE — no diagnosis, no medication, no disease names exposed
    return {
        "type": "report",
        "symptoms": [s.replace("_", " ") for s in sorted(confirmed)],
        "triage_level": triage_level,
        "triage_reason": triage_reason,
        "status": status,
        "possible_causes": possible_causes,
        "advice": advice,
        "clinical_context": clinical_note,
        "disclaimer": DISCLAIMER,
        # Explicitly null — never populated
        "diagnosis": None,
        "medication": None,
        # Intentionally EXCLUDED from response:
        #   top_disease, predicted_disease, most_likely_condition
        #   ml_predictions, ml_predictions_note
        #   dose, treatment, protocol
    }