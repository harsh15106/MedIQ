import streamlit as st
import joblib
import pandas as pd

# Load saved objects
model = joblib.load("health_model.pkl")
scaler = joblib.load("scaler.pkl")
le = joblib.load("label_encoder.pkl") 

# Risk calculation function
def calculate_risk(row):
    risk_score = 0

    if row["Blood_glucose"] > 140:
        risk_score += 2
    if row["Systolic_BP"] > 140:
        risk_score += 2
    if row["LDL"] > 160:
        risk_score += 2
    if row["Haemoglobin"] < 10:
        risk_score += 2

    if risk_score >= 4:
        return "High Risk"
    elif risk_score >= 2:
        return "Moderate Risk"
    else:
        return "Low Risk"

def calculate_risk_percentage(row):
    score = 0
    max_score = 8   # total possible points

    if row["Blood_glucose"] > 140:
        score += 2
    if row["Systolic_BP"] > 140:
        score += 2
    if row["LDL"] > 160:
        score += 2
    if row["Haemoglobin"] < 10:
        score += 2

    return int((score / max_score) * 100)


# Prediction function
def predict_health_status(input_data):

    sample_df = pd.DataFrame([input_data])
    sample_scaled = scaler.transform(sample_df)

    probs = model.predict_proba(sample_scaled)[0]
    predicted_class = probs.argmax()
    confidence = probs.max()

    predicted_condition = le.inverse_transform([predicted_class])[0]

    # Uncertainty handling
    if confidence < 0.60:
        predicted_condition = "Uncertain — Mixed Clinical Signals"
    
    # Predict numeric class
    predicted_class = model.predict(sample_scaled)[0]

    # Convert number → disease name
    predicted_condition = le.inverse_transform([predicted_class])[0]

    # ---------------- CLINICAL OVERRIDE RULES ---------------- #

    # Strong diagnostic indicators override ML prediction

    if input_data["HbA1C"] >= 6.5:
        predicted_condition = "Diabetes"
        confidence = max(confidence, 0.90)

    elif input_data["Haemoglobin"] < 10:
        predicted_condition = "Anemia"
        confidence = max(confidence, 0.90)

    elif input_data["Systolic_BP"] >= 140 or input_data["Diastolic_BP"] >= 90:
        predicted_condition = "Hypertension"
        confidence = max(confidence, 0.85)
    
    elif 130 <= input_data["Systolic_BP"] < 140 or 80 <= input_data["Diastolic_BP"] < 90:
        if predicted_condition == "Hypertension":
            predicted_condition = "Elevated Cardiometabolic Risk"
            confidence = min(confidence, 0.65)

    elif input_data["LDL"] >= 160 or input_data["Triglycerides"] >= 200:
        predicted_condition = "High Cholesterol"
        confidence = max(confidence, 0.85)
    
    risk_flags = 0

    if input_data["Blood_glucose"] >= 110: risk_flags += 1
    if input_data["Systolic_BP"] >= 130: risk_flags += 1
    if input_data["LDL"] >= 140 or input_data["Triglycerides"] >= 150: risk_flags += 1

    if risk_flags >= 2:
        predicted_condition = "Metabolic Risk Pattern"
        confidence = max(confidence, 0.70)
    
    # Risk
    risk_category = calculate_risk(input_data)

    # Contributing biomarkers
    contributors = []

    if input_data["Blood_glucose"] > 140:
        contributors.append("High Blood Glucose")
    if input_data["HbA1C"] > 6.5:
        contributors.append("Elevated HbA1C")
    if input_data["Systolic_BP"] > 140:
        contributors.append("High Systolic BP")
    if input_data["Diastolic_BP"] > 90:
        contributors.append("High Diastolic BP")
    if input_data["LDL"] > 160:
        contributors.append("High LDL")
    if input_data["Triglycerides"] > 200:
        contributors.append("High Triglycerides")
    if input_data["Haemoglobin"] < 10:
        contributors.append("Low Haemoglobin")
    if input_data["HDL"] < 40:
        contributors.append("Low HDL")
    if input_data["MCV"] < 80 or input_data["MCV"] > 100:
        contributors.append("Abnormal MCV")

    if len(contributors) == 0:
        contributors.append("All biomarkers within normal range")

    return predicted_condition, risk_category, contributors, confidence


# ---------------- UI ---------------- #

st.title("AI Health Risk Analyzer")

bg = st.number_input("Blood Glucose")
hba1c = st.number_input("HbA1C")
sbp = st.number_input("Systolic BP")
dbp = st.number_input("Diastolic BP")
ldl = st.number_input("LDL")
hdl = st.number_input("HDL")
tg = st.number_input("Triglycerides")
hb = st.number_input("Haemoglobin")
mcv = st.number_input("MCV")

if st.button("Analyze Health Risk"):

    patient = {
        "Blood_glucose": bg,
        "HbA1C": hba1c,
        "Systolic_BP": sbp,
        "Diastolic_BP": dbp,
        "LDL": ldl,
        "HDL": hdl,
        "Triglycerides": tg,
        "Haemoglobin": hb,
        "MCV": mcv
    }

    sample_df = pd.DataFrame([patient])
    sample_scaled = scaler.transform(sample_df)

    condition, risk, contributors, confidence = predict_health_status(patient)

    st.subheader("Results")
    st.success(f"Predicted Condition: {condition}")
    st.info(f"Model Confidence: {confidence*100:.1f}%")
    st.warning(f"Risk Category: {risk}")
    st.write("Contributing Biomarkers:")
    for item in contributors:
        st.markdown(f"- {item}")


    import plotly.graph_objects as go

    risk_percent = calculate_risk_percentage(patient)

    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=risk_percent,
        title={"text": "Health Risk %"},
        gauge={
            "axis": {"range": [0, 100]},
            "steps": [
                {"range": [0, 40], "color": "green"},
                {"range": [40, 70], "color": "orange"},
                {"range": [70, 100], "color": "red"},
            ]
        }
    ))

    st.plotly_chart(fig)