import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_ANON_KEY", "")
supabase: Client = create_client(url, key)

def get_patient_history_from_backend(user_id: str):
    if not user_id:
        return {}

    try:
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if not response.data:
            return {}

        profile = response.data[0]

        # Extract features from db
        known_symptoms = []
        # If there are any specific condition to symptom mappings we want to do
        
        previous_diseases = []
        chronic = profile.get("chronic_conditions")
        if chronic:
            previous_diseases = [c.strip() for c in chronic.split(",")]

        return {
            "age": profile.get("dob"), # this would need age calc but we get age from frontend anyway
            "gender": profile.get("gender"),
            "height_cm": profile.get("height"),
            "weight_kg": profile.get("weight"),
            "smoker": False, # Placeholder as smoker not typically in this profile schema yet
            "family_history": False, # Placeholder
            "known_symptoms": known_symptoms,
            "previous_diseases": previous_diseases,
            "chronic_conditions": chronic,
            "past_surgeries": profile.get("past_surgeries")
        }
    except Exception as e:
        print(f"Error fetching patient history: {e}")
        return {}
