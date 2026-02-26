import joblib
import pandas as pd

# Load model artifacts once at startup
model = joblib.load("health_model.pkl")
scaler = joblib.load("scaler.pkl")
le = joblib.load("label_encoder.pkl")


# ---------- Risk Logic ----------
def calculate_risk(row):
    score = 0
    if row["Blood_glucose"] > 140: 
        score += 2
    if row["Systolic_BP"] > 140: 
        score += 2
    if row["LDL"] > 160: 
        score += 2
    if row["Haemoglobin"] < 10: 
        score += 2

    if score >= 4: 
        return "High Risk"
    if score >= 2: 
        return "Moderate Risk"
    return "Low Risk"


def calculate_risk_percentage(row):
    score = 0
    if row["Blood_glucose"] > 140: 
        score += 2
    if row["Systolic_BP"] > 140: 
        score += 2
    if row["LDL"] > 160: 
        score += 2
    if row["Haemoglobin"] < 10: 
        score += 2
    return int((score / 8) * 100)


# ---------- Prediction ----------
def predict_health_status(input_data: dict):

    df = pd.DataFrame([input_data])
    scaled = scaler.transform(df)

    probs = model.predict_proba(scaled)[0]
    pred_class = probs.argmax()
    confidence = float(probs.max())

    condition = le.inverse_transform([pred_class])[0]

    # ---- Clinical override rules ----
    if input_data["HbA1C"] >= 6.5:
        condition = "Diabetes"
        confidence = max(confidence, 0.90)

    elif input_data["Haemoglobin"] < 10:
        condition = "Anemia"
        confidence = max(confidence, 0.90)

    elif input_data["Systolic_BP"] >= 140 or input_data["Diastolic_BP"] >= 90:
        condition = "Hypertension"
        confidence = max(confidence, 0.85)

    elif input_data["LDL"] >= 160 or input_data["Triglycerides"] >= 200:
        condition = "High Cholesterol"
        confidence = max(confidence, 0.85)

    # ---- Risk ----
    risk = calculate_risk(input_data)
    risk_percent = calculate_risk_percentage(input_data)

    # ---- Clinical indicators ----
    indicators = []

    if input_data["Blood_glucose"] > 140:
        indicators.append("High Blood Glucose")
    if input_data["HbA1C"] > 6.5:
        indicators.append("Elevated HbA1C")
    if input_data["Systolic_BP"] > 140:
        indicators.append("High Systolic BP")
    if input_data["Diastolic_BP"] > 90:
        indicators.append("High Diastolic BP")
    if input_data["LDL"] > 160:
        indicators.append("High LDL")
    if input_data["Triglycerides"] > 200:
        indicators.append("High Triglycerides")
    if input_data["Haemoglobin"] < 10:
        indicators.append("Low Haemoglobin")
    if input_data["HDL"] < 40:
        indicators.append("Low HDL")
    if input_data["MCV"] < 80 or input_data["MCV"] > 100:
        indicators.append("Abnormal MCV")

    if not indicators:
        indicators.append("All biomarkers within normal range")

    return {
        "predicted_condition": condition,
        "confidence": confidence,
        "risk_category": risk,
        "risk_percentage": risk_percent,
        "clinical_indicators": indicators
    }