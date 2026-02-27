import joblib as jb
import numpy as np
import re

from all_symptoms import common_symptoms, disease_symptom_prob
from bayesian_engine import bayesian_update
from symptom_mapper import extract_symptoms_from_text
from clinical_response_engine import generate_clinical_response
from question_selector import select_best_question
from all_symptoms import common_symptoms, disease_symptom_prob

# Safe input functions
def get_int(prompt):
    while True:
        try:
            return int(input(prompt))
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


def get_yes_no_or_stop(prompt):
    while True:
        val = input(prompt).strip().lower()

        if val in ["yes", "y"]:
            return "yes"

        if val in ["no", "n"]:
            return "no"

        if val in ["stop", "s"]:
            return "stop"

        print("Please enter yes, no, or stop.")

# Load Model
model = jb.load("disease_prediction_model.pkl")
labels = jb.load("label_encoder.pkl")

print("\nHi. I’m here to help understand what might be going on.\n")

age = get_int("Age: ")

# Gender validation
while True:
    gender = input("Gender (male/female): ").strip().lower()
    if gender in ["male", "female"]:
        break
    print("Please enter 'male' or 'female'.")

height_cm = get_int("Height (cm): ")
weight_kg = get_int("Weight (kg): ")

# BMI calculation
height_m = height_cm / 100
bmi = round(weight_kg / (height_m ** 2), 1)

print(f"Calculated BMI: {bmi}")

smoker = get_yes_no("Do you smoke? (yes/no): ")
family_history = get_yes_no("Family history of heart disease? (yes/no): ")

print("\nDescribe your symptoms:\n")

asked_symptoms = set()
current_probs = None

# Main loop
while True:

    user_input = input("You: ").strip()

    if user_input.lower() in ["exit", "quit"]:
        exit()

    # Duration detection
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

    confirm = get_yes_no("Is this correct? (yes/no): ")
    if confirm != "yes":
        continue

    asked_symptoms.update(detected)

    # Emergency heuristics
    emergency_flag = False
    emergency_message = ""

    severe_cluster = {
        "high_fever",
        "chills",
        "fast_heart_rate",
        "altered_sensorium"
    }

    if "weakness_of_one_body_side" in asked_symptoms or "slurred_speech" in asked_symptoms:
        emergency_flag = True
        emergency_message = "Possible stroke. Seek immediate care."

    elif {"chest_pain", "shortness_of_breath"} <= asked_symptoms:
        emergency_flag = True
        emergency_message = "Possible cardiac event. Seek immediate care."

    elif "blood_in_sputum" in asked_symptoms:
        emergency_flag = True
        emergency_message = "Coughing blood requires urgent evaluation."

    elif severe_cluster.issubset(asked_symptoms):
        emergency_flag = True
        emergency_message = "Possible severe infection."
    # Fever + confusion override
    elif "high_fever" in asked_symptoms and "altered_sensorium" in asked_symptoms:
        emergency_flag = True
        emergency_message = "Fever with confusion may indicate severe infection."

    # Input vector build
    input_vector = np.zeros(len(common_symptoms))

    for symptom in asked_symptoms:
        if symptom in common_symptoms:
            idx = common_symptoms.index(symptom)
            input_vector[idx] = 1

    input_vector = input_vector.reshape(1, -1)

    # Initial prediction  and Bayesian update
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

    # Calibration smoothing (stable)
    current_probs = np.power(current_probs, 0.75)
    current_probs /= current_probs.sum()

    # Clinical heuristics adjustments (boosting)
    # Age boost
    if age >= 60:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Heart attack", "Pneumonia", "Hypertension"]:
                current_probs[i] *= 1.3

    # Obesity boost
    if bmi >= 30:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Heart attack", "Hypertension"]:
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

    # Chronic hemoptysis boost
    if duration_weeks >= 3 and "blood_in_sputum" in asked_symptoms:
        for i, disease in enumerate(labels.classes_):
            if disease == "Tuberculosis":
                current_probs[i] *= 2.0

    # Stroke boost
    if "weakness_of_one_body_side" in asked_symptoms or "slurred_speech" in asked_symptoms:
        for i, disease in enumerate(labels.classes_):
            if "Paralysis" in disease:
                current_probs[i] *= 4.0

    current_probs /= current_probs.sum()

    # Follow up loop
    while True:

        sorted_probs = np.sort(current_probs)[::-1]

        if emergency_flag:
            break

        # Allow follow-up even if confident when only confusion is present
        if (sorted_probs[0] - sorted_probs[1] >= 0.15) and asked_symptoms != {"altered_sensorium"}:
            break

        question = select_best_question(
            current_probs,
            disease_symptom_prob,
            labels,
            asked_symptoms,
            gender
        )

        if not question:
            break

        print(f"\nFollow-up question: Do you have {question.replace('_', ' ')}?")
        answer = get_yes_no_or_stop("(yes/no/stop): ")
        if answer == "stop":
            print("\nStopping follow-up questions.")
            break

        current_probs = bayesian_update(
            current_probs,
            question,
            disease_symptom_prob,
            labels,
            symptom_present=(answer == "yes")
        )

        if answer == "yes":
            asked_symptoms.add(question)

        current_probs = np.power(current_probs, 0.75)
        fever_present = any(sym in asked_symptoms for sym in ["high_fever", "mild_fever", "fever"])
        if "cough" in asked_symptoms and fever_present:
            for i, disease in enumerate(labels.classes_):
                if disease == "Common Cold":
                    current_probs[i] *= 1.15
        current_probs /= current_probs.sum()

    # Final ranking
    top3 = np.argsort(current_probs)[-3:][::-1]

    # Heart attack probability override
    top_index = top3[0]
    top_disease_name = labels.inverse_transform([top_index])[0]
    top_conf = current_probs[top_index]

    if top_disease_name == "Heart attack" and top_conf > 0.40:
        emergency_flag = True
        emergency_message = "High probability of cardiac event."

    print("\nPossible Conditions:\n")
    for idx in top3:
        disease = labels.inverse_transform([idx])[0]
        print(f"- {disease} ({current_probs[idx]*100:.1f}%)")

    if emergency_flag:
        print("\n🔴 EMERGENCY ALERT")
        print(f"Reason: {emergency_message}")
    else:
        print("\n🟡 Monitor symptoms and consult a doctor if they worsen.")

    break

# Clinical response generation
top_disease = labels.inverse_transform([top3[0]])[0]

report = generate_clinical_response(
    top_disease,
    list(asked_symptoms),
    age,
    smoker == "yes",
    bmi
)

print(report)