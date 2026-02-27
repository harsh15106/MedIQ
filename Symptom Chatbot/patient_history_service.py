def get_patient_history_from_backend():

    # Simulated backend response
    # Later this will come from database / API

    return {
        "age": 52,
        "gender": "male",
        "height_cm": 170,
        "weight_kg": 68,
        "smoker": "yes",
        "family_history": "no",

        # Known symptoms from previous visits
        "known_symptoms": [
            "chronic_cough",
            "weight_loss"
        ],

        # Diagnosed diseases in past
        "previous_diseases": [
            "Tuberculosis"
        ]
    }