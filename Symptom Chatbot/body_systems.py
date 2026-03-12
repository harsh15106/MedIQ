# Clinical Knowledge Base for MedIQ AI

# 1. Map Diseases to Body Systems
DISEASE_TO_SYSTEM = {
    "(vertigo) Paroymsal  Positional Vertigo": "Neurological",
    "AIDS": "Systemic/Infection",
    "Acne": "Dermatological",
    "Alcoholic hepatitis": "Digestive",
    "Allergy": "Systemic/Infection",
    "Arthritis": "Musculoskeletal",
    "Bronchial Asthma": "Respiratory",
    "Cervical spondylosis": "Musculoskeletal",
    "Chicken pox": "Systemic/Infection",
    "Chronic cholestasis": "Digestive",
    "Common Cold": "Respiratory",
    "Dengue": "Systemic/Infection",
    "Diabetes ": "Endocrine",
    "Dimorphic hemmorhoids(piles)": "Digestive",
    "Drug Reaction": "Dermatological",
    "Fungal infection": "Dermatological",
    "GERD": "Digestive",
    "Gastroenteritis": "Digestive",
    "Heart attack": "Cardiovascular",
    "Hepatitis B": "Digestive",
    "Hepatitis C": "Digestive",
    "Hepatitis D": "Digestive",
    "Hepatitis E": "Digestive",
    "Hypertension ": "Cardiovascular",
    "Hyperthyroidism": "Endocrine",
    "Hypoglycemia": "Endocrine",
    "Hypothyroidism": "Endocrine",
    "Impetigo": "Dermatological",
    "Jaundice": "Digestive",
    "Malaria": "Systemic/Infection",
    "Migraine": "Neurological",
    "Osteoarthristis": "Musculoskeletal",
    "Paralysis (brain hemorrhage)": "Neurological",
    "Peptic ulcer diseae": "Digestive",
    "Pneumonia": "Respiratory",
    "Psoriasis": "Dermatological",
    "Tuberculosis": "Respiratory",
    "Typhoid": "Systemic/Infection",
    "Urinary tract infection": "Urinary/Reproductive",
    "Varicose veins": "Cardiovascular",
    "hepatitis A": "Digestive"
}

# 1b. Map Diseases to Anatomical Regions
DISEASE_TO_REGION = {
    "(vertigo) Paroymsal  Positional Vertigo": "Head",
    "AIDS": "Systemic",
    "Acne": "Systemic",
    "Alcoholic hepatitis": "Abdomen",
    "Allergy": "Systemic",
    "Arthritis": "Systemic", # Multi-joint
    "Bronchial Asthma": "Chest",
    "Cervical spondylosis": "Neck",
    "Chicken pox": "Systemic",
    "Chronic cholestasis": "Abdomen",
    "Common Cold": "Head",
    "Dengue": "Systemic",
    "Diabetes ": "Systemic",
    "Dimorphic hemmorhoids(piles)": "Pelvis",
    "Drug Reaction": "Systemic",
    "Fungal infection": "Systemic",
    "GERD": "Chest",
    "Gastroenteritis": "Abdomen",
    "Heart attack": "Chest",
    "Hepatitis B": "Abdomen",
    "Hepatitis C": "Abdomen",
    "Hepatitis D": "Abdomen",
    "Hepatitis E": "Abdomen",
    "Hypertension ": "Head", # Headache/Dizzy
    "Hyperthyroidism": "Systemic",
    "Hypoglycemia": "Head",
    "Hypothyroidism": "Systemic",
    "Impetigo": "Systemic",
    "Jaundice": "Abdomen",
    "Malaria": "Systemic",
    "Migraine": "Head",
    "Osteoarthristis": "Leg/Foot", # Often Knee
    "Paralysis (brain hemorrhage)": "Head",
    "Peptic ulcer diseae": "Abdomen",
    "Pneumonia": "Chest",
    "Psoriasis": "Systemic",
    "Tuberculosis": "Chest",
    "Typhoid": "Abdomen",
    "Urinary tract infection": "Pelvis",
    "Varicose veins": "Leg/Foot",
    "hepatitis A": "Abdomen"
}

# 1c. Map Symptoms to Anatomical Regions
SYMPTOM_TO_REGION = {
    # Head
    "headache": "Head", "dizziness": "Head", "spinning_movements": "Head", "loss_of_balance": "Head",
    "unsteadiness": "Head", "visual_disturbances": "Head", "blurred_and_distorted_vision": "Head",
    "slurred_speech": "Head", "altered_sensorium": "Head", "patches_in_throat": "Head", "throat_irritation": "Head",
    "runny_nose": "Head", "congestion": "Head", "red_sore_around_nose": "Head",
    
    # Neck
    "neck_pain": "Neck", "stiff_neck": "Neck", "enlarged_thyroid": "Neck",
    
    # Chest
    "chest_pain": "Chest", "shortness_of_breath": "Chest", "cough": "Chest", "breathlessness": "Chest",
    "phlegm": "Chest", "blood_in_sputum": "Chest", "chest_tightness": "Chest", "wheezing": "Chest",
    "palpitations": "Chest", "fast_heart_rate": "Chest",
    
    # Abdomen
    "stomach_pain": "Abdomen", "abdominal_pain": "Abdomen", "belly_pain": "Abdomen", "nausea": "Abdomen",
    "vomiting": "Abdomen", "diarrhoea": "Abdomen", "constipation": "Abdomen", "indigestion": "Abdomen",
    "acidity": "Abdomen", "stomach_bleeding": "Abdomen", "distention_of_abdomen": "Abdomen",
    "swelling_of_stomach": "Abdomen", "yellowish_skin": "Abdomen", "yellowing_of_eyes": "Abdomen",
    
    # Pelvis
    "pelvic_pain": "Pelvis", "burning_micturition": "Pelvis", "spotting__urination": "Pelvis",
    "continuous_feel_of_urine": "Pelvis", "bladder_discomfort": "Pelvis", "pain_in_anal_region": "Pelvis",
    "pain_during_bowel_movements": "Pelvis", "irritation_in_anus": "Pelvis", "bloody_stool": "Pelvis",
    "abnormal_menstruation": "Pelvis",
    
    # Back
    "back_pain": "Back",
    
    # Arm/Hand
    "arm_pain": "Arm/Hand", "hand_pain": "Arm/Hand", "tingling_in_fingers": "Arm/Hand", 
    "muscle_weakness": "Arm/Hand", "bruising": "Arm/Hand",
    
    # Leg/Foot
    "leg_pain": "Leg/Foot", "foot_pain": "Leg/Foot", "knee_pain": "Leg/Foot", "hip_joint_pain": "Leg/Foot",
    "swollen_legs": "Leg/Foot", "prominent_veins_on_calf": "Leg/Foot", "painful_walking": "Leg/Foot",
    
    # Systemic
    "high_fever": "Systemic", "mild_fever": "Systemic", "chills": "Systemic", "fatigue": "Systemic",
    "lethargy": "Systemic", "malaise": "Systemic", "weight_loss": "Systemic", "weight_gain": "Systemic",
    "sweating": "Systemic", "itching": "Systemic", "skin_rash": "Systemic", "skin_peeling": "Systemic",
    "restlessness": "Systemic", "irritability": "Systemic", "excessive_hunger": "Systemic",
    "increased_appetite": "Systemic", "polyuria": "Systemic", "shivering": "Systemic"
}

# 2. Map Symptoms to Body Systems (Keywords for dynamic matching)
SYMPTOM_SYSTEM_KEYWORDS = {
    "Respiratory": ["breath", "cough", "phlegm", "chest", "sputum", "sneezing", "throat", "bronchitis"],
    "Cardiovascular": ["chest", "heart", "palpitation", "blood_pressure", "vein", "arrhythmia"],
    "Digestive": ["stomach", "vomit", "nausea", "abdomen", "belly", "bowel", "stool", "yellow", "jaundice", "liver", "indigestion", "acidity", "reflux", "constipation", "diarrhoea", "appetite"],
    "Neurological": ["headache", "dizzi", "vertigo", "paralysis", "weakness", "sensorium", "slurred", "balance", "numbness", "tingling", "seizure", "vision"],
    "Musculoskeletal": ["joint", "muscle", "back", "neck", "knee", "hip", "stiff", "movement", "cramp", "painful_walking"],
    "Dermatological": ["rash", "skin", "itch", "blister", "pimple", "red_spot", "peeling", "eczema", "fungal"],
    "Endocrine": ["weight", "thyroid", "sugar", "sweating", "hunger", "thirst", "polyuria", "diabetes"],
    "Urinary/Reproductive": ["urine", "micturition", "bladder", "pelvis", "menstruation"],
    "Systemic/Infection": ["fever", "chill", "fatigue", "letharg", "malaise", "lymph", "sweating", "weight_loss", "malaria", "dengue", "typhoid"]
}

# 2b. Head-to-Toe Region Symptom Tree
# Each region defines: symptoms (typical for that area), diseases (candidate conditions), 
# and systemic_min (minimum systemic flags needed before allowing systemic diseases).
REGION_SYMPTOM_TREE = {
    "Head": {
        "symptoms": [
            "headache", "dizziness", "spinning_movements", "loss_of_balance", "unsteadiness",
            "visual_disturbances", "blurred_and_distorted_vision", "slurred_speech",
            "altered_sensorium", "runny_nose", "congestion", "throat_irritation",
            "continuous_sneezing", "watering_from_eyes", "patches_in_throat"
        ],
        "diseases": [
            "Migraine", "(vertigo) Paroymsal  Positional Vertigo", "Hypertension ",
            "Paralysis (brain hemorrhage)", "Common Cold", "Hypoglycemia"
        ],
        "question_hints": [
            "spinning_movements", "visual_disturbances", "loss_of_balance",
            "continuous_sneezing", "altered_sensorium"
        ]
    },
    "Neck": {
        "symptoms": [
            "neck_pain", "stiff_neck", "back_pain", "dizziness", "weakness_in_limbs",
            "enlarged_thyroid", "loss_of_balance"
        ],
        "diseases": [
            "Cervical spondylosis", "Hypothyroidism", "Hyperthyroidism"
        ],
        "question_hints": [
            "stiff_neck", "back_pain", "neck_pain", "weakness_in_limbs", "dizziness"
        ]
    },
    "Chest": {
        "symptoms": [
            "chest_pain", "shortness_of_breath", "cough", "phlegm", "rusty_sputum",
            "blood_in_sputum", "chest_tightness", "wheezing", "palpitations",
            "fast_heart_rate", "mucoid_sputum", "acidity"
        ],
        "diseases": [
            "Heart attack", "GERD", "Pneumonia", "Bronchial Asthma", "Tuberculosis",
            "Hypertension "
        ],
        "question_hints": [
            "chest_pain", "shortness_of_breath", "cough", "palpitations", "acidity"
        ]
    },
    "Abdomen": {
        "symptoms": [
            "stomach_pain", "abdominal_pain", "nausea", "vomiting", "diarrhoea",
            "constipation", "indigestion", "acidity", "distention_of_abdomen",
            "loss_of_appetite", "yellowish_skin", "yellowing_of_eyes", "dark_urine",
            "bloody_stool", "pain_during_bowel_movements"
        ],
        "diseases": [
            "GERD", "Peptic ulcer diseae", "Gastroenteritis", "Alcoholic hepatitis",
            "Chronic cholestasis", "Hepatitis A", "Hepatitis B", "Hepatitis C",
            "Hepatitis D", "Hepatitis E", "Jaundice", "Typhoid", "Dimorphic hemmorhoids(piles)"
        ],
        "question_hints": [
            "nausea", "vomiting", "diarrhoea", "constipation", "yellowing_of_eyes", "indigestion"
        ]
    },
    "Pelvis": {
        "symptoms": [
            "burning_micturition", "continuous_feel_of_urine", "bladder_discomfort",
            "foul_smell_of_urine", "pain_in_anal_region", "irritation_in_anus",
            "bloody_stool", "abnormal_menstruation"
        ],
        "diseases": [
            "Urinary tract infection", "Dimorphic hemmorhoids(piles)"
        ],
        "question_hints": [
            "burning_micturition", "continuous_feel_of_urine", "bladder_discomfort",
            "pain_in_anal_region"
        ]
    },
    "Back": {
        "symptoms": [
            "back_pain", "neck_pain", "stiff_neck", "weakness_in_limbs",
            "loss_of_balance", "dizziness"
        ],
        "diseases": [
            "Cervical spondylosis", "Arthritis"
        ],
        "question_hints": [
            "back_pain", "neck_pain", "stiff_neck", "weakness_in_limbs"
        ]
    },
    "Arm/Hand": {
        "symptoms": [
            "joint_pain", "muscle_pain", "stiff_neck", "swelling_joints",
            "painful_walking", "weakness_in_limbs", "muscle_weakness", "bruising",
            "tingling_in_fingers", "arm_pain", "hand_pain"
        ],
        "diseases": [
            "Arthritis", "Osteoarthristis", "Cervical spondylosis"
        ],
        "question_hints": [
            "joint_pain", "swelling_joints", "muscle_weakness", "stiff_neck",
            "tingling_in_fingers", "painful_walking"
        ]
    },
    "Leg/Foot": {
        "symptoms": [
            "knee_pain", "joint_pain", "swelling_joints", "painful_walking",
            "cramps", "swollen_legs", "swollen_blood_vessels", "prominent_veins_on_calf",
            "hip_joint_pain", "leg_pain", "foot_pain"
        ],
        "diseases": [
            "Osteoarthristis", "Arthritis", "Varicose veins"
        ],
        "question_hints": [
            "knee_pain", "swelling_joints", "painful_walking", "cramps",
            "swollen_legs", "prominent_veins_on_calf"
        ]
    },
    "Systemic": {
        "symptoms": [
            "high_fever", "mild_fever", "chills", "fatigue", "lethargy", "malaise",
            "weight_loss", "weight_gain", "sweating", "itching", "skin_rash",
            "restlessness", "night_sweats", "shivering", "swelled_lymph_nodes",
            "muscle_wasting", "patches_in_throat", "extra_marital_contacts",
            "yellowish_skin", "red_spots_over_body"
        ],
        "diseases": [
            "Malaria", "Dengue", "Typhoid", "Chicken pox", "AIDS",
            "Allergy", "Diabetes ", "Hyperthyroidism", "Hypothyroidism",
            "Fungal infection", "Drug Reaction", "Psoriasis", "Impetigo", "Acne",
            "Hypoglycemia", "Varicose veins"
        ],
        "question_hints": [
            "high_fever", "chills", "skin_rash", "fatigue", "sweating",
            "itching", "weight_loss"
        ],
        # Minimum number of systemic indicators required before systemic diseases enter the pool
        "min_indicators": 2
    }
}

# The set of "Systemic" disease flags — must have at least 2 confirmed to route to systemic diseases
SYSTEMIC_DISEASE_INDICATORS = {
    "high_fever", "mild_fever", "chills", "fatigue", "lethargy",
    "malaise", "sweating", "night_sweats", "weight_loss", "shivering"
}

# Minimum systemic indicators required before including purely systemic diseases in candidate pool
SYSTEMIC_MIN_THRESHOLD = 2

# 3. Core Symptom Gateways (Mapping high-level symptoms to disease candidates)
# This allows the AI to "Gateway" into a specific subset of diseases immediately.
CORE_SYMPTOM_GATEWAYS = {
    "chest_pain": ["Heart attack", "GERD", "Pneumonia", "Hypertension ", "Bronchial Asthma"],
    "abdominal_pain": ["Peptic ulcer diseae", "GERD", "Gastroenteritis", "Typhoid", "Alcoholic hepatitis", "Chronic cholestasis"],
    "back_pain": ["Cervical spondylosis", "Arthritis", "Osteoarthristis"],
    "neck_pain": ["Cervical spondylosis", "Hypertension "],
    "headache": ["Migraine", "Hypertension ", "Paralysis (brain hemorrhage)", "Chicken pox", "Dengue", "Typhoid"],
    "joint_pain": ["Arthritis", "Osteoarthristis", "Psoriasis", "Dengue", "Hepatitis A", "Hepatitis D"],
    "muscle_pain": ["Dengue", "Malaria", "AIDS", "Varicose veins"],
    "dizziness": ["(vertigo) Paroymsal  Positional Vertigo", "Hypertension ", "Hypothyroidism", "Hypoglycemia", "Cervical spondylosis"],
    "shortness_of_breath": ["Heart attack", "Pneumonia", "Bronchial Asthma"],
    "cough": ["Pneumonia", "Common Cold", "Tuberculosis", "Bronchial Asthma", "GERD"],
    "vomiting": ["Gastroenteritis", "Alcoholic hepatitis", "Typhoid", "Malaria", "Peptic ulcer diseae", "Hypoglycemia"],
    "skin_rash": ["Fungal infection", "Allergy", "Drug Reaction", "Acne", "Chicken pox", "Psoriasis", "Impetigo"],
    "high_fever": ["Malaria", "Dengue", "Typhoid", "Pneumonia", "Common Cold", "Chicken pox", "AIDS"],
    "fatigue": ["Diabetes ", "Hypothyroidism", "Hyperthyroidism", "Jaundice", "Hepatitis B", "Hepatitis C", "Chronic cholestasis", "Varicose veins"]
}

# 4. Disease Symptom Weights (Primary, Secondary, Optional)
DISEASE_WEIGHTS = {
    "Dengue": {
        "primary": ["high_fever", "joint_pain", "muscle_pain", "pain_behind_the_eyes", "skin_rash"],
        "secondary": ["vomiting", "headache", "nausea", "back_pain", "chills"],
        "optional": ["fatigue", "appetite_loss"]
    },
    "Malaria": {
        "primary": ["high_fever", "chills", "sweating"],
        "secondary": ["vomiting", "headache", "nausea", "muscle_pain", "diarrhoea"],
        "optional": []
    },
    "Typhoid": {
        "primary": ["high_fever", "abdominal_pain", "nausea", "vomiting", "diarrhoea", "constipation"],
        "secondary": ["headache", "chills", "fatigue", "belly_pain"],
        "optional": ["toxic_look"]
    },
    "Heart attack": {
        "primary": ["chest_pain", "shortness_of_breath", "sweating"],
        "secondary": ["nausea", "vomiting", "anxiety", "palpitations"],
        "optional": ["indigestion"]
    },
    "Pneumonia": {
        "primary": ["high_fever", "cough", "shortness_of_breath", "phlegm", "rusty_sputum"],
        "secondary": ["chills", "chest_pain", "fast_heart_rate", "malaise"],
        "optional": []
    },
    "Tuberculosis": {
        "primary": ["mild_fever", "cough", "blood_in_sputum", "weight_loss", "sweating"],
        "secondary": ["chills", "chest_pain", "fatigue", "loss_of_appetite"],
        "optional": []
    },
    "Bronchial Asthma": {
        "primary": ["shortness_of_breath", "cough", "mucoid_sputum"],
        "secondary": ["chest_tightness", "wheezing", "fatigue", "high_fever"],
        "optional": ["family_history"]
    },
    "Urinary tract infection": {
        "primary": ["burning_micturition", "continuous_feel_of_urine", "bladder_discomfort"],
        "secondary": ["foul_smell_of_urine", "back_pain", "nausea"],
        "optional": []
    },
    "Arthritis": {
        "primary": ["joint_pain", "stiff_neck", "swelling_joints", "painful_walking"],
        "secondary": ["muscle_weakness", "stiffness", "movement_restriction"],
        "optional": []
    },
    "Osteoarthristis": {
        "primary": ["joint_pain", "knee_pain", "painful_walking", "swelling_joints"],
        "secondary": ["neck_pain", "hip_joint_pain", "stiff_joints"],
        "optional": []
    },
    "Cervical spondylosis": {
        "primary": ["back_pain", "neck_pain", "weakness_in_limbs", "dizziness"],
        "secondary": ["loss_of_balance", "numbness", "stiffness"],
        "optional": []
    },
    "Migraine": {
        "primary": ["headache", "visual_disturbances", "nausea"],
        "secondary": ["stiff_neck", "depression", "irritability", "blurred_and_distorted_vision", "excessive_hunger"],
        "optional": []
    },
    "(vertigo) Paroymsal  Positional Vertigo": {
        "primary": ["spinning_movements", "loss_of_balance", "unsteadiness"],
        "secondary": ["nausea", "vomiting", "headache"],
        "optional": []
    },
    "GERD": {
        "primary": ["stomach_pain", "acidity", "chest_pain", "cough"],
        "secondary": ["vomiting", "ulcers_on_tongue", "bitter_after_taste"],
        "optional": []
    },
    "Peptic ulcer diseae": {
        "primary": ["stomach_pain", "vomiting", "indigestion", "loss_of_appetite", "abdominal_pain"],
        "secondary": ["internal_itching", "passage_of_gases"],
        "optional": []
    },
    "Gastroenteritis": {
        "primary": ["vomiting", "sunken_eyes", "dehydration", "diarrhoea", "abdominal_pain"],
        "secondary": [],
        "optional": []
    },
    "Hepatitis B": {
        "primary": ["yellowing_of_eyes", "yellowish_skin", "dark_urine", "lethargy", "fatigue"],
        "secondary": ["itching", "abdominal_pain", "loss_of_appetite", "receiving_blood_transfusion", "receiving_unsterile_injections"],
        "optional": []
    },
    "Hepatitis A": {
        "primary": ["yellowing_of_eyes", "yellowish_skin", "dark_urine", "joint_pain"],
        "secondary": ["vomiting", "mild_fever", "muscle_pain", "loss_of_appetite", "abdominal_pain", "diarrhoea"],
        "optional": []
    },
    "Hepatitis C": {
        "primary": ["yellowing_of_eyes", "nausea", "fatigue"],
        "secondary": ["yellowish_skin", "loss_of_appetite", "family_history"],
        "optional": []
    },
    "Hepatitis D": {
        "primary": ["yellowing_of_eyes", "joint_pain", "fatigue"],
        "secondary": ["vomiting", "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "abdominal_pain"],
        "optional": []
    },
    "Hepatitis E": {
        "primary": ["yellowing_of_eyes", "nausea", "fatigue"],
        "secondary": ["joint_pain", "vomiting", "yellowish_skin", "dark_urine", "loss_of_appetite", "abdominal_pain", "coma", "stomach_bleeding"],
        "optional": []
    },
    "Jaundice": {
        "primary": ["yellowish_skin", "yellowing_of_eyes", "dark_urine", "weight_loss"],
        "secondary": ["itching", "vomiting", "fatigue", "high_fever", "abdominal_pain"],
        "optional": []
    },
    "Alcoholic hepatitis": {
        "primary": ["vomiting", "yellowish_skin", "distention_of_abdomen"],
        "secondary": ["abdominal_pain", "swelling_of_stomach", "history_of_alcohol_consumption", "fluid_overload"],
        "optional": []
    },
    "Chronic cholestasis": {
        "primary": ["itching", "vomiting", "yellowish_skin", "nausea", "abdominal_pain"],
        "secondary": ["loss_of_appetite", "yellowing_of_eyes"],
        "optional": []
    },
    "Paralysis (brain hemorrhage)": {
        "primary": ["weakness_of_one_body_side", "altered_sensorium", "vomiting", "headache"],
        "secondary": ["slurred_speech", "loss_of_balance"],
        "optional": []
    },
    "Allergy": {
        "primary": ["continuous_sneezing", "shivering", "chills", "watering_from_eyes"],
        "secondary": [],
        "optional": []
    },
    "Common Cold": {
        "primary": ["continuous_sneezing", "chills", "fatigue", "cough", "high_fever", "runny_nose", "congestion"],
        "secondary": ["headache", "throat_irritation", "muscle_pain", "loss_of_smell", "swelled_lymph_nodes"],
        "optional": []
    },
    "Acne": {
        "primary": ["skin_rash", "pus_filled_pimples", "blackheads", "scurring"],
        "secondary": [],
        "optional": []
    },
    "Impetigo": {
        "primary": ["skin_rash", "high_fever", "blister", "red_sore_around_nose", "yellow_crust_ooze"],
        "secondary": [],
        "optional": []
    },
    "Psoriasis": {
        "primary": ["skin_rash", "joint_pain", "skin_peeling", "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails"],
        "secondary": [],
        "optional": []
    },
    "Fungal infection": {
        "primary": ["itching", "skin_rash", "nodal_skin_eruptions", "dischromic _patches"],
        "secondary": [],
        "optional": []
    },
    "Drug Reaction": {
        "primary": ["itching", "skin_rash", "stomach_pain", "burning_micturition", "spotting_ urination"],
        "secondary": [],
        "optional": []
    },
    "Chicken pox": {
        "primary": ["itching", "skin_rash", "fatigue", "lethargy", "high_fever", "headache", "loss_of_appetite", "red_spots_over_body", "mild_fever"],
        "secondary": ["malaise", "swelled_lymph_nodes"],
        "optional": []
    },
    "Diabetes ": {
        "primary": ["fatigue", "weight_loss", "restlessness", "lethargy", "irregular_sugar_level", "blurred_and_distorted_vision", "obesity", "excessive_hunger", "increased_appetite", "polyuria"],
        "secondary": [],
        "optional": []
    },
    "Hyperthyroidism": {
        "primary": ["fatigue", "mood_swings", "weight_loss", "restlessness", "sweating", "diarrhoea", "fast_heart_rate", "excessive_hunger", "muscle_weakness", "irritability", "abnormal_menstruation"],
        "secondary": [],
        "optional": []
    },
    "Hypothyroidism": {
        "primary": ["fatigue", "weight_gain", "cold_hands_and_feets", "mood_swings", "lethargy", "dizziness", "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails", "swollen_extremeties", "depression", "irritability", "abnormal_menstruation"],
        "secondary": [],
        "optional": []
    },
    "Hypoglycemia": {
        "primary": ["vomiting", "fatigue", "anxiety", "sweating", "headache", "nausea", "blurred_and_distorted_vision", "excessive_hunger", "drying_and_tingling_lips", "slurred_speech", "irritability", "palpitations"],
        "secondary": [],
        "optional": []
    },
    "Hypertension ": {
        "primary": ["headache", "chest_pain", "dizziness", "loss_of_balance", "lack_of_concentration"],
        "secondary": [],
        "optional": []
    },
    "Dimorphic hemmorhoids(piles)": {
        "primary": ["constipation", "pain_during_bowel_movements", "pain_in_anal_region", "bloody_stool", "irritation_in_anus"],
        "secondary": [],
        "optional": []
    },
    "Varicose veins": {
        "primary": ["fatigue", "cramps", "bruising", "obesity", "swollen_legs", "swollen_blood_vessels", "prominent_veins_on_calf"],
        "secondary": [],
        "optional": []
    },
    "AIDS": {
        "primary": ["muscle_wasting", "patches_in_throat", "high_fever", "extra_marital_contacts"],
        "secondary": [],
        "optional": []
    }
}

# Assign a system strictly to any symptom string based on keywords
def get_symptom_systems(symptom_str):
    matched_systems = set()
    s = symptom_str.lower().replace(" ", "_")
    
    # Check Gateways first
    for gateway, candidate_diseases in CORE_SYMPTOM_GATEWAYS.items():
        if gateway in s:
            # Match the gateway to its systems via the candidate diseases
            for disease in candidate_diseases:
                if disease in DISEASE_TO_SYSTEM:
                    matched_systems.add(DISEASE_TO_SYSTEM[disease])
    
    # Keyword fallback
    if not matched_systems:
        for system, keywords in SYMPTOM_SYSTEM_KEYWORDS.items():
            if any(kw in s for kw in keywords):
                matched_systems.add(system)
    
    # Generic symptoms that apply everywhere
    if not matched_systems or any(g in s for g in ["pain", "ache", "weak", "fatigue"]):
        if not matched_systems:
            matched_systems.add("Unknown") 
            
    return list(matched_systems)
