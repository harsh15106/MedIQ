import joblib as jb
import numpy as np
import re

from all_symptoms import common_symptoms, disease_symptom_prob
from bayesian_engine import bayesian_update
from symptom_mapper import extract_symptoms_from_text
from clinical_response_engine import generate_clinical_response
from clinical_response_engine import medication_interaction_loop

# ==========================
# SAFE INPUT FUNCTIONS
# ==========================

def get_int(prompt):
    while True:
        try:
            return int(input(prompt))
        except:
            print("Please enter a valid number.")


def get_float(prompt):
    while True:
        try:
            return float(input(prompt))
        except:
            print("Please enter a valid number.")


def get_yes_no(prompt):
    while True:
        val = input(prompt).strip().lower()
        if val in ["yes", "y"]:
            return "yes"
        if val in ["no", "n"]:
            return "no"
        print("Please enter yes or no.")


# ==========================
# LOAD MODEL
# ==========================

model = jb.load("disease_prediction_model.pkl")
labels = jb.load("label_encoder.pkl")

print("\nHi. I’m here to help understand what might be going on.\n")

age = get_int("Age: ")
gender = input("Gender: ").lower()
height_cm = get_float("Height (cm): ")
weight_kg = get_float("Weight (kg): ")
smoker = get_yes_no("Do you smoke? (yes/no): ")
family_history = get_yes_no("Family history of heart disease? (yes/no): ")

print("\nDescribe your symptoms:\n")

asked_symptoms = set()
current_probs = None


# ==========================
# MAIN INPUT LOOP
# ==========================

while True:

    user_input = input("You: ").strip()

    if user_input.lower() in ["exit", "quit"]:
        exit()

    # Detect duration (weeks)
    duration_weeks = 0
    match = re.search(r'(\d+)\s*week', user_input.lower())
    if match:
        duration_weeks = int(match.group(1))

    detected = extract_symptoms_from_text(user_input)

    if not detected:
        print("No significant symptoms detected.")
        continue

    print("\nDetected symptoms:")
    for s in detected:
        print("-", s.replace("_", " "))

    input_vector = np.zeros(len(common_symptoms))

    for symptom in detected:
        if symptom in common_symptoms:
            idx = common_symptoms.index(symptom)
            input_vector[idx] = 1
            asked_symptoms.add(symptom)

    input_vector = input_vector.reshape(1, -1)

    # ==========================
    # ML + BAYESIAN UPDATE
    # ==========================

    if current_probs is None:
        current_probs = model.predict_proba(input_vector)[0]
    else:
        for symptom in detected:
            current_probs = bayesian_update(
                current_probs,
                symptom,
                disease_symptom_prob,
                labels,
                symptom_present=True
            )

    # Calibration smoothing
    current_probs = np.power(current_probs, 0.75)
    current_probs /= current_probs.sum()

    # ==========================
    # HYBRID CLINICAL BOOSTING
    # ==========================

    # Age boost
    if age >= 60:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Heart attack", "Pneumonia", "Hypertension"]:
                current_probs[i] *= 1.3

    # Smoking boost
    if smoker == "yes":
        for i, disease in enumerate(labels.classes_):
            if disease in ["Tuberculosis", "Pneumonia", "Bronchial Asthma"]:
                current_probs[i] *= 1.4

    # Family cardiac boost
    if family_history == "yes":
        for i, disease in enumerate(labels.classes_):
            if disease == "Heart attack":
                current_probs[i] *= 1.6

    # Infectious cluster boost
    if {"high_fever", "cough"} <= asked_symptoms:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Pneumonia", "Common Cold", "Tuberculosis"]:
                current_probs[i] *= 2.0

    # Severe infection cluster
    severe_cluster = {
        "high_fever",
        "chills",
        "fast_heart_rate",
        "altered_sensorium"
    }

    if severe_cluster.issubset(asked_symptoms):
        for i, disease in enumerate(labels.classes_):
            if disease in ["Pneumonia", "Malaria", "Dengue"]:
                current_probs[i] *= 3.0

    # Chronic hemoptysis boost
    if duration_weeks >= 3 and "blood_in_sputum" in asked_symptoms:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Tuberculosis"]:
                current_probs[i] *= 2.0

    # Stroke boost
    if "weakness_of_one_body_side" in asked_symptoms or "slurred_speech" in asked_symptoms:
        for i, disease in enumerate(labels.classes_):
            if "Paralysis" in disease:
                current_probs[i] *= 4.0

    # Normalize again
    current_probs /= current_probs.sum()

    # ==========================
    # FINAL RANKING
    # ==========================

    top3 = np.argsort(current_probs)[-3:][::-1]

    print("\nPossible conditions:\n")
    for idx in top3:
        disease = labels.inverse_transform([idx])[0]
        print(f"- {disease} ({current_probs[idx]*100:.1f}%)")

    # ==========================
    # TRIAGE DECISION
    # ==========================

    if "weakness_of_one_body_side" in asked_symptoms or "slurred_speech" in asked_symptoms:
        print("\n🔴 EMERGENCY: Possible stroke.")
    elif {"chest_pain", "shortness_of_breath"} <= asked_symptoms:
        print("\n🔴 EMERGENCY: Possible cardiac event.")
    elif "blood_in_sputum" in asked_symptoms:
        print("\n🔴 URGENT: Coughing blood requires evaluation.")
    elif severe_cluster.issubset(asked_symptoms):
        print("\n🔴 EMERGENCY: Possible severe infection.")
    else:
        print("\n🟡 Monitor symptoms and consult a doctor if they worsen.")

    break


# ==========================
# GENERATE CLINICAL REPORT
# ==========================

top_disease = labels.inverse_transform([top3[0]])[0]

report = generate_clinical_response(
    top_disease,
    list(asked_symptoms),
    age,
    smoker == "yes"
)

print(report)
medication_interaction_loop(top_disease)