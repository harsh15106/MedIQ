from fastapi import FastAPI
from pydantic import BaseModel
import joblib as jb
import numpy as np
from all_symptoms import common_symptoms, disease_symptom_prob
from bayesian_engine import bayesian_update
from symptom_mapper import extract_symptoms_from_text, extract_body_region_from_text
from clinical_response_engine import generate_clinical_response
from body_systems import (DISEASE_TO_SYSTEM, get_symptom_systems, DISEASE_WEIGHTS, 
                          CORE_SYMPTOM_GATEWAYS, SYMPTOM_TO_REGION, DISEASE_TO_REGION,
                          REGION_SYMPTOM_TREE, SYSTEMIC_DISEASE_INDICATORS, SYSTEMIC_MIN_THRESHOLD)
from supabase_client import get_diseases_by_region, get_symptoms_for_diseases, get_symptom_weights, get_disease_description
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
    height_cm: float | None = None
    weight_kg: float | None = None
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
    bmi = None
    if profile.height_cm and profile.weight_kg and profile.height_cm > 0:
        height_m = float(profile.height_cm) / 100
        bmi = round(float(profile.weight_kg) / (height_m ** 2), 1)

    # 1. Extract new symptoms from free text
    detected = extract_symptoms_from_text(new_text)
    for sym in detected:
        if sym not in denied:
            confirmed.add(sym)

    # 1b. Extract body location KEYWORDS directly from user text (highest priority)
    # e.g. "calf pain" → Leg/Foot, "stomach ache" → Abdomen
    text_detected_regions = extract_body_region_from_text(new_text)

    if not confirmed:
        # No symptoms detected yet
        return {
            "type": "question",
            "question_text": "I couldn't detect any specific symptoms. Could you describe how you're feeling in more detail?",
            "symptom_id": None,
            "confirmed_symptoms": list(confirmed),
            "denied_symptoms": list(denied)
        }

    # ════════════════════════════════════════════════════════════
    # STEP 2: Build initial ML probability vector
    # ════════════════════════════════════════════════════════════
    input_vector = np.zeros(len(common_symptoms))
    for symptom in confirmed:
        if symptom in common_symptoms:
            idx = common_symptoms.index(symptom)
            input_vector[idx] = 1

    input_vector = input_vector.reshape(1, -1)
    current_probs = model.predict_proba(input_vector)[0]

    # ════════════════════════════════════════════════════════════
    # STEP 3: Region Detection & Body Region Gatekeeper
    # (Runs BEFORE Bayesian updates so ML cannot override region)
    # ════════════════════════════════════════════════════════════
    active_systems = set()
    active_regions = set()

    # Priority 1: Body location keywords from RAW TEXT (highest authority)
    # e.g. "right thigh pain" → Leg/Foot is locked immediately
    active_regions.update(text_detected_regions)

    # Priority 2: Symptom-to-region lookup from confirmed symptom list
    for sys_symptom in confirmed:
        active_systems.update(get_symptom_systems(sys_symptom))
        if sys_symptom in SYMPTOM_TO_REGION:
            region = SYMPTOM_TO_REGION[sys_symptom]
            # Only add 'Systemic' if no specific region has been detected yet
            if region != "Systemic" or not active_regions:
                active_regions.add(region)

    # Fallback: no region detected → default to Systemic
    if not active_regions:
        active_regions.add("Systemic")

    # ── Systemic Disease Threshold ──────────────────────────────
    # Systemic diseases (Malaria, Dengue, Hepatitis, etc.) are LOCKED OUT
    # unless the user has confirmed at least SYSTEMIC_MIN_THRESHOLD systemic indicators.
    confirmed_systemic_indicators = SYSTEMIC_DISEASE_INDICATORS.intersection(confirmed)
    systemic_disease_active = len(confirmed_systemic_indicators) >= SYSTEMIC_MIN_THRESHOLD

    # ── Build Allowed Disease Pool (Supabase Primary, Tree Fallback) ─────────
    allowed_diseases = set()
    db_disease_data = {}   # { disease_name: { id, body_system, description, ... } }

    # Primary: query Supabase for each detected region
    for region in active_regions:
        if region == "Systemic":
            continue  # Systemic handled separately below
        db_results = get_diseases_by_region(region)
        for row in db_results:
            allowed_diseases.add(row["name"])
            db_disease_data[row["name"]] = row

    # Systemic diseases only enter the pool if threshold is met
    if systemic_disease_active:
        for row in get_diseases_by_region("Systemic"):
            allowed_diseases.add(row["name"])
            db_disease_data[row["name"]] = row

    # Fallback to in-memory REGION_SYMPTOM_TREE if DB returned nothing
    if not allowed_diseases:
        print("[api] Supabase returned no results — using in-memory REGION_SYMPTOM_TREE.")
        for region in active_regions:
            if region != "Systemic" and region in REGION_SYMPTOM_TREE:
                allowed_diseases.update(REGION_SYMPTOM_TREE[region]["diseases"])
        if systemic_disease_active:
            allowed_diseases.update(
                REGION_SYMPTOM_TREE.get("Systemic", {}).get("diseases", [])
            )

    # DISEASE_TO_REGION fallback: covers all 41 ML labels exactly.
    # Used when both Supabase AND REGION_SYMPTOM_TREE return nothing.
    # This is strictly region-filtered — NOT a free-for-all.
    if not allowed_diseases:
        target_regions = set(active_regions)
        for disease_name, disease_region in DISEASE_TO_REGION.items():
            if disease_region in target_regions:
                allowed_diseases.add(disease_name)
            elif disease_region == "Systemic" and systemic_disease_active:
                allowed_diseases.add(disease_name)
        # If still empty (e.g. no matching regions in DISEASE_TO_REGION),
        # allow all non-systemic diseases as a last resort
        if not allowed_diseases:
            for disease_name, disease_region in DISEASE_TO_REGION.items():
                if disease_region != "Systemic":
                    allowed_diseases.add(disease_name)

    # ── STRICT GATEKEEPER: Zero all non-candidates BEFORE Bayesian ──────────
    # Build the allowed mask — this is passed to bayesian_update() so that
    # Laplace epsilon cannot leak probability back to zeroed diseases.
    allowed_mask = np.array(
        [disease in allowed_diseases for disease in labels.classes_],
        dtype=bool
    )
    for i in range(len(labels.classes_)):
        if not allowed_mask[i]:
            current_probs[i] = 0.0

    # Renormalize so surviving candidates sum to 1 before Bayesian
    prob_sum = current_probs.sum()
    if prob_sum > 0:
        current_probs /= prob_sum

    # ════════════════════════════════════════════════════════════
    # STEP 4: Bayesian Updates — ONLY on region-allowed candidates
    # ════════════════════════════════════════════════════════════
    for symptom in confirmed:
        try:
            current_probs = bayesian_update(
                current_probs, symptom, disease_symptom_prob, labels,
                symptom_present=True, allowed_mask=allowed_mask
            )
        except Exception:
            pass

    for symptom in denied:
        try:
            current_probs = bayesian_update(
                current_probs, symptom, disease_symptom_prob, labels,
                symptom_present=False, allowed_mask=allowed_mask
            )
        except Exception:
            pass

    # Re-enforce the mask after Bayesian (belt-and-suspenders against float drift)
    current_probs = current_probs * allowed_mask

    # Smoothing & normalise
    current_probs = np.power(np.clip(current_probs, 0, None), 0.75)
    prob_sum = current_probs.sum()
    if prob_sum > 0:
        current_probs /= prob_sum

    # Fetch patient history from DB if user_id is provided
    patient_history = get_patient_history_from_backend(profile.user_id) if profile.user_id else {}
    previous_diseases = patient_history.get("previous_diseases", [])

    # ════════════════════════════════════════════════════════════
    # STEP 5: Retrieve DB symptoms for smart question selection
    # ════════════════════════════════════════════════════════════
    db_disease_ids = [row["id"] for row in db_disease_data.values() if "id" in row]
    db_candidate_symptoms = get_symptoms_for_diseases(db_disease_ids)



    # ════════════════════════════════════════════════════════════
    # STEP 6: Heuristic Boosts — region-valid candidates only
    # ════════════════════════════════════════════════════════════
    # Apply region and system boosts (only candidates survive to this point)
    valid_filtering_systems = {s for s in active_systems if s != "Unknown"}
    for i, disease in enumerate(labels.classes_):
        if current_probs[i] == 0.0:
            continue  # Skip zeroed-out diseases entirely

        # System match boost
        if valid_filtering_systems:
            disease_sys = DISEASE_TO_SYSTEM.get(disease)
            if disease_sys and disease_sys in valid_filtering_systems:
                current_probs[i] *= 1.5


        # 4b. Structured Weighted Scoring (Primary, Secondary, Optional)
        if disease in DISEASE_WEIGHTS:
            data = DISEASE_WEIGHTS[disease]
            primary = set(data.get("primary", []))
            secondary = set(data.get("secondary", []))
            optional = set(data.get("optional", []))
            
            # Primary hits (Essential Indicators)
            p_hits = primary.intersection(confirmed)
            if p_hits:
                current_probs[i] *= (3.0 ** len(p_hits))
            
            # Secondary hits (Supporting Evidence)
            s_hits = secondary.intersection(confirmed)
            if s_hits:
                current_probs[i] *= (1.5 ** len(s_hits))
                
            # Optional hits (Optional correlations)
            o_hits = optional.intersection(confirmed)
            if o_hits:
                current_probs[i] *= (1.1 ** len(o_hits))

            # Rule-Out Logic: If core primary symptoms are denied, penalize heavily
            p_denied = primary.intersection(denied)
            if p_denied:
                # If ALL primary symptoms are denied, absolute rule-out
                if len(p_denied) == len(primary):
                    current_probs[i] *= 0.0
                else:
                    current_probs[i] *= (0.1 ** len(p_denied))
            
            # Phase 3: Pattern Verification Gate
            # If a disease has primary symptoms defined, it MUST have at least one confirmed to be a top candidate
            if primary and not p_hits:
                current_probs[i] *= 0.05 # Massive penalty for missing core indicators

        # 4c. General Demographic Adjustments
        if profile.age and profile.age >= 60 and disease in ["Heart attack", "Pneumonia", "Hypertension"]:
            current_probs[i] *= 1.3
        
        if bmi is not None and bmi >= 30 and disease in ["Heart attack", "Hypertension"]:
            current_probs[i] *= 1.3
        
        if profile.smoker and disease in ["Tuberculosis", "Pneumonia", "Bronchial Asthma"]:
            current_probs[i] *= 1.4
            
        if profile.family_history and disease == "Heart attack":
            current_probs[i] *= 1.6

        if previous_diseases and disease in previous_diseases:
            current_probs[i] *= 1.5

    # Specific strict overrides
    if {"high_fever", "cough"} <= confirmed:
        for i, disease in enumerate(labels.classes_):
            if disease in ["Pneumonia", "Common Cold", "Tuberculosis"]: current_probs[i] *= 2.0
    
    if "weakness_of_one_body_side" in confirmed or "slurred_speech" in confirmed:
        for i, disease in enumerate(labels.classes_):
            if "Paralysis" in disease: current_probs[i] *= 4.0

    # Severity Filtering: Prevent alarming diagnoses without strong evidence
    for i, disease in enumerate(labels.classes_):
        if disease == "Heart attack":
            if not {"chest_pain", "shortness_of_breath", "sweating", "pain_in_chest"}.intersection(confirmed):
                current_probs[i] *= 0.01
        elif "Paralysis" in disease:
            if not {"weakness_of_one_body_side", "slurred_speech", "altered_sensorium", "loss_of_balance"}.intersection(confirmed):
                current_probs[i] *= 0.01

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
    # Require sufficient information (at least 4 symptoms evaluated)
    has_sufficient_info = (len(confirmed) + len(denied)) >= 4
    
    # Require at least one primary symptom match if defined
    has_primary_match = False
    if top_disease in DISEASE_WEIGHTS:
        has_primary_match = any(sym in confirmed for sym in DISEASE_WEIGHTS[top_disease]["primary"])
    else:
        has_primary_match = True
        
    is_confident = (sorted_probs[0] - sorted_probs[1] >= 0.20) and has_sufficient_info and has_primary_match
    
    # Cap maximum questions by length of denied + confirmed (to prevent infinite loops)
    if not emergency_flag and not is_confident and len(confirmed) + len(denied) < 12:
        # Exclude already asked symptoms
        already_asked = confirmed.union(denied)
        
        # Determine the top 3 most likely diseases remaining to focus questions specifically on them
        active_target_diseases = [labels.inverse_transform([idx])[0] for idx in np.argsort(current_probs)[-3:][::-1]]
        
        # Fallback to general question selector if targeted fails
        # Pass the identified active region to constrain symptoms
        primary_region = list(active_regions)[0] if active_regions else "Systemic"
        next_symptom = select_best_question(
            current_probs,
            disease_symptom_prob,
            labels, already_asked,
            profile.gender.lower(),
            target_diseases=active_target_diseases,
            active_region=primary_region,
            db_symptoms=db_candidate_symptoms,
            systemic_active=systemic_disease_active  # Controls whether fever/chills questions are allowed
        )
        
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
    matched_primary = []
    absent_primary = []
    
    if top_disease in DISEASE_WEIGHTS:
        for sym in DISEASE_WEIGHTS[top_disease]["primary"]:
            if sym in confirmed:
                matched_primary.append(sym)
            else:
                absent_primary.append(sym)

    # If not confident, provide up to 3 candidate diseases
    disease_list = []
    if is_confident:
        disease_list = [top_disease]
    else:
        # Sort current probs and take top 3
        top_indices = np.argsort(current_probs)[-3:][::-1]
        for idx in top_indices:
            if current_probs[idx] > 0.1: # Only include if it has at least 10% prob
                disease_list.append(labels.inverse_transform([idx])[0])
                
    if not disease_list:
        disease_list = [top_disease]

    report = generate_clinical_response(
        diseases=disease_list, 
        symptoms=list(confirmed), 
        age=profile.age, 
        smoker=profile.smoker, 
        bmi=bmi,
        active_systems=list(active_systems),
        matched_primary=matched_primary,
        absent_primary=absent_primary,
        db_disease_data=db_disease_data  # Phase 5: DB disease descriptions
    )
    
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