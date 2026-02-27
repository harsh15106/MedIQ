from fastapi import FastAPI
from pydantic import BaseModel
import joblib as jb
import numpy as np
from all_symptoms import common_symptoms, disease_symptom_prob
from bayesian_engine import bayesian_update
from symptom_mapper import extract_symptoms_from_text
from clinical_response_engine import generate_clinical_response

# FastAPI app
app = FastAPI()

# Loading ML model when server starts
model = jb.load("disease_prediction_model.pkl")
labels = jb.load("label_encoder.pkl")


# Request Models

class PatientProfile(BaseModel):
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    smoker: bool
    family_history: bool


class PredictionRequest(BaseModel):
    patient_profile: PatientProfile
    symptoms_text: str


# Prediction Logic
@app.post("/predict")
def predict(data: PredictionRequest):

    profile = data.patient_profile
    symptoms_text = data.symptoms_text

    # BMI calculation
    height_m = profile.height_cm / 100
    bmi = round(profile.weight_kg / (height_m ** 2), 1)

    # Extract symptoms
    detected = extract_symptoms_from_text(symptoms_text)

    # Build input vector
    input_vector = np.zeros(len(common_symptoms))
    asked_symptoms = set()

    for symptom in detected:
        if symptom in common_symptoms:
            idx = common_symptoms.index(symptom)
            input_vector[idx] = 1
            asked_symptoms.add(symptom)

    input_vector = input_vector.reshape(1, -1)

    # Initial prediction
    current_probs = model.predict_proba(input_vector)[0]

    # Bayesian updates
    for symptom in detected:
        current_probs = bayesian_update(
            current_probs,
            symptom,
            disease_symptom_prob,
            labels,
            symptom_present=True
        )

    current_probs = np.clip(current_probs, 1e-8, None)
    current_probs /= current_probs.sum()

    # Top 3 diseases
    top3 = np.argsort(current_probs)[-3:][::-1]

    predictions = []
    for idx in top3:
        predictions.append({
            "disease": labels.inverse_transform([idx])[0],
            "probability": float(current_probs[idx])
        })

    top_disease = predictions[0]["disease"]

    # Generate clinical report
    report = generate_clinical_response(
        top_disease,
        list(asked_symptoms),
        profile.age,
        profile.smoker,
        bmi
    )

    return {
        "detected_symptoms": list(asked_symptoms),
        "predictions": predictions,
        "top_disease": top_disease,
        "bmi": bmi,
        "report": report
    }