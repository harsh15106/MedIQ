from fastapi import FastAPI
from pydantic import BaseModel
import joblib as jb
import numpy as np
from all_symptoms import common_symptoms, disease_symptom_prob
from bayesian_engine import bayesian_update
from symptom_mapper import extract_symptoms_from_text
from clinical_response_engine import generate_clinical_response

from fastapi.middleware.cors import CORSMiddleware

# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Loading ML model when server starts
model = jb.load("disease_prediction_model.pkl")
labels = jb.load("label_encoder.pkl")


from question_selector import select_best_question
from patient_history_service import get_patient_history_from_backend
import re

class PatientProfile(BaseModel):
    user_id: str | None = None
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    smoker: bool
    family_history: bool

class ChatRequest(BaseModel):
    patient_profile: PatientProfile
    new_text: str
    confirmed_symptoms: list[str]
    denied_symptoms: list[str]

@app.post("/chat")
def chat(data: ChatRequest):
    profile = data.patient_profile
    new_text = data.new_text
    confirmed = set(data.confirmed_symptoms)
    denied = set(data.denied_symptoms)

    # BMI calculation
    height_m = profile.height_cm / 100
    bmi = round(profile.weight_kg / (height_m ** 2), 1) if profile.height_cm else 25.0

    # 1. Extract new symptoms from free text
    detected = extract_symptoms_from_text(new_text)
    for sym in detected:
        if sym not in denied:
            confirmed.add(sym)

    if not confirmed:
        # No symptoms detected yet
        return {
            "type": "question",
            "question_text": "I couldn't detect any specific symptoms. Could you describe how you're feeling in more detail?",
            "symptom_id": None,
            "confirmed_symptoms": list(confirmed),
            "denied_symptoms": list(denied)
        }

    # 2. Build initial input vector
    input_vector = np.zeros(len(common_symptoms))
    for symptom in confirmed:
        if symptom in common_symptoms:
            idx = common_symptoms.index(symptom)
            input_vector[idx] = 1

    input_vector = input_vector.reshape(1, -1)

    # 3. Predict & Bayesian Updates
    current_probs = model.predict_proba(input_vector)[0]

    for symptom in confirmed:
        current_probs = bayesian_update(current_probs, symptom, disease_symptom_prob, labels, symptom_present=True)
    for symptom in denied:
        current_probs = bayesian_update(current_probs, symptom, disease_symptom_prob, labels, symptom_present=False)

    # Smoothing
    current_probs = np.power(current_probs, 0.75)
    current_probs /= current_probs.sum()

    # Fetch patient history from DB if user_id is provided
    patient_history = get_patient_history_from_backend(profile.user_id) if profile.user_id else {}
    previous_diseases = patient_history.get("previous_diseases", [])

    # 4. Clinical Heuristic Boosts
    duration_weeks = 0 # Assume 0 for stateless
    match = re.search(r'(\d+)\s*week', new_text.lower())
    if match: duration_weeks = int(match.group(1))

    if profile.age >= 60:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Heart attack", "Pneumonia", "Hypertension"]: current_probs[i] *= 1.3
    if bmi >= 30:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Heart attack", "Hypertension"]: current_probs[i] *= 1.3
    if profile.smoker:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Tuberculosis", "Pneumonia", "Bronchial Asthma"]: current_probs[i] *= 1.4
    if profile.family_history:
        for i, disease in enumerate(labels.classes_):
            if disease == "Heart attack": current_probs[i] *= 1.6

    # Boost probability for previously diagnosed conditions
    if previous_diseases:
        for i, disease in enumerate(labels.classes_):
            if disease in previous_diseases:
                current_probs[i] *= 1.5

    if {"high_fever", "cough"} <= confirmed:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Pneumonia", "Common Cold", "Tuberculosis"]: current_probs[i] *= 2.0
    if duration_weeks >= 3 and "blood_in_sputum" in confirmed:
        for i, disease in enumerate(labels.classes_):
            if disease == "Tuberculosis": current_probs[i] *= 2.0
    if "weakness_of_one_body_side" in confirmed or "slurred_speech" in confirmed:
        for i, disease in enumerate(labels.classes_):
            if "Paralysis" in disease: current_probs[i] *= 4.0

    current_probs /= current_probs.sum()

    # 5. Check Emergency Flags
    emergency_flag = False
    severe_cluster = {"high_fever", "chills", "fast_heart_rate", "altered_sensorium"}

    if "weakness_of_one_body_side" in confirmed or "slurred_speech" in confirmed: emergency_flag = True
    elif {"chest_pain", "shortness_of_breath"} <= confirmed: emergency_flag = True
    elif "blood_in_sputum" in confirmed: emergency_flag = True
    elif severe_cluster.issubset(confirmed): emergency_flag = True
    elif "high_fever" in confirmed and "altered_sensorium" in confirmed: emergency_flag = True

    sorted_probs = np.sort(current_probs)[::-1]
    top3 = np.argsort(current_probs)[-3:][::-1]
    top_disease = labels.inverse_transform([top3[0]])[0]
    
    if top_disease == "Heart attack" and current_probs[top3[0]] > 0.40:
        emergency_flag = True

    # 6. Decide to ask question or return report
    # We ask a question if NOT emergency AND NOT highly confident
    is_confident = (sorted_probs[0] - sorted_probs[1] >= 0.15) and confirmed != {"altered_sensorium"}
    
    # Cap maximum questions by length of denied + confirmed (to prevent infinite loops)
    if not emergency_flag and not is_confident and len(confirmed) + len(denied) < 15:
        # Exclude already asked symptoms
        already_asked = confirmed.union(denied)
        next_symptom = select_best_question(current_probs, disease_symptom_prob, labels, already_asked, profile.gender.lower())
        
        if next_symptom:
            sym_readable = next_symptom.replace("_", " ")
            return {
                "type": "question",
                "question_text": f"Do you have {sym_readable}?",
                "symptom_id": next_symptom,
                "confirmed_symptoms": list(confirmed),
                "denied_symptoms": list(denied)
            }

    # 7. Generate Final Report
    report = generate_clinical_response(top_disease, list(confirmed), profile.age, profile.smoker, bmi)
    
    if emergency_flag:
        report = "🔴 **EMERGENCY ALERT:** Based on your symptoms, please seek immediate medical care.\n\n" + report

    return {
        "type": "report",
        "top_disease": top_disease,
        "report": report,
        "confirmed_symptoms": list(confirmed),
        "denied_symptoms": list(denied),
        "predictions": [{"disease": labels.inverse_transform([idx])[0], "probability": float(current_probs[idx])} for idx in top3]
    }