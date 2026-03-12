"""
supabase_client.py
==================
Central Supabase client for MedIQ Symptom Chatbot (Phase 5).

Provides:
  - get_diseases_by_region(region)         → DB-filtered disease candidates
  - get_symptoms_for_diseases(disease_ids) → related symptoms for follow-up questions
  - get_symptom_weights(disease_id)        → weighted symptom scoring map
  - get_disease_description(disease_name)  → clinical description for report
"""

import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

# -------- Lazy client initialization --------
_client = None

def get_client():
    """Initialize and cache the Supabase client."""
    global _client
    if _client is None:
        try:
            from supabase import create_client
            _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            print(f"[supabase_client] WARNING: Could not connect to Supabase: {e}")
            _client = None
    return _client


# -------- Caching layer --------
_cache = {}

def _cached(key, fetcher):
    """Simple in-memory cache to avoid redundant DB calls per request."""
    if key not in _cache:
        _cache[key] = fetcher()
    return _cache[key]


# ============================================================
# 1. Get diseases filtered by target region
# ============================================================
def get_diseases_by_region(region: str) -> list[dict]:
    """
    Query `diseases` table for entries matching `target_region`.
    Returns a list of dicts: [{ id, name, body_system, target_region, description }, ...]
    
    Falls back to [] on error so caller can use Python fallback.
    
    Supports multi-region: "Leg/Foot" also pulls from "Systemic" candidates
    that have secondary limb symptoms (handled by caller).
    """
    client = get_client()
    if not client:
        return []
    
    try:
        # Normalize variations (e.g. "Leg/Foot" → accept both "Leg" and "Foot")
        regions_to_query = _expand_region(region)
        
        result = client.table("diseases") \
            .select("id, name, body_system, target_region, description") \
            .in_("target_region", regions_to_query) \
            .execute()
        
        return result.data or []
    except Exception as e:
        print(f"[supabase_client] get_diseases_by_region error: {e}")
        return []


def _expand_region(region: str) -> list[str]:
    """Expand a canonical region name to all matching DB `target_region` values."""
    mapping = {
        "Head":     ["Head", "head", "Brain", "brain", "Neurological"],
        "Neck":     ["Neck", "neck", "Cervical"],
        "Chest":    ["Chest", "chest", "Thorax", "Lungs", "Cardiovascular", "Respiratory"],
        "Abdomen":  ["Abdomen", "abdomen", "Stomach", "Digestive", "GI", "Hepatic"],
        "Pelvis":   ["Pelvis", "pelvis", "Urinary", "Reproductive", "Pelvic"],
        "Back":     ["Back", "back", "Spine", "Lumbar"],
        "Arm/Hand": ["Arm/Hand", "Arm", "arm", "Hand", "hand", "Upper Limb"],
        "Leg/Foot": ["Leg/Foot", "Leg", "leg", "Foot", "foot", "Lower Limb",
                     "Thigh", "thigh", "Calf", "calf", "Knee", "knee"],
        "Systemic": ["Systemic", "systemic", "Infection", "Generalized"],
    }
    return mapping.get(region, [region])


# ============================================================
# 2. Get symptoms for a set of candidate diseases
# ============================================================
def get_symptoms_for_diseases(disease_ids: list[int]) -> list[dict]:
    """
    Query `disease_symptom_map` joined with `symptoms` for a list of disease IDs.
    Returns: [{ disease_id, symptom_name, weight, is_primary, region }, ...]
    
    Used by question_selector to build the follow-up question pool.
    """
    client = get_client()
    if not client or not disease_ids:
        return []
    
    try:
        result = client.table("disease_symptom_map") \
            .select("disease_id, weight, is_primary, symptoms(name, region, severity)") \
            .in_("disease_id", disease_ids) \
            .execute()
        
        rows = []
        for row in (result.data or []):
            sym = row.get("symptoms")
            if sym:
                rows.append({
                    "disease_id":    row["disease_id"],
                    "symptom_name":  sym["name"],
                    "symptom_region": sym.get("region", "Systemic"),
                    "weight":        row["weight"],
                    "is_primary":    row["is_primary"],
                })
        return rows
    except Exception as e:
        print(f"[supabase_client] get_symptoms_for_diseases error: {e}")
        return []


# ============================================================
# 3. Get symptom weight map for scoring
# ============================================================
def get_symptom_weights(disease_id: int) -> dict:
    """
    Return a dict of {symptom_name: {weight, is_primary}} for one disease.
    Used by the weighted scoring engine.
    """
    client = get_client()
    if not client:
        return {}
    
    try:
        key = f"weights_{disease_id}"
        def fetch():
            r = client.table("disease_symptom_map") \
                .select("weight, is_primary, symptoms(name)") \
                .eq("disease_id", disease_id) \
                .execute()
            return {
                row["symptoms"]["name"]: {
                    "weight":     row["weight"],
                    "is_primary": row["is_primary"]
                }
                for row in (r.data or [])
                if row.get("symptoms")
            }
        return _cached(key, fetch)
    except Exception as e:
        print(f"[supabase_client] get_symptom_weights error: {e}")
        return {}


# ============================================================
# 4. Get disease description for clinical report
# ============================================================
def get_disease_description(disease_name: str) -> str | None:
    """
    Fetch the `description` field from `diseases` for a given disease name.
    Returns None if not found so caller can fall back to disease_guidance.py.
    """
    client = get_client()
    if not client:
        return None
    
    try:
        result = client.table("diseases") \
            .select("description") \
            .ilike("name", disease_name.strip()) \
            .limit(1) \
            .execute()
        
        data = result.data
        if data and data[0].get("description"):
            return data[0]["description"]
        return None
    except Exception as e:
        print(f"[supabase_client] get_disease_description error: {e}")
        return None


# ============================================================
# 5. Bulk fetch all diseases for a region (with cache)
# ============================================================
def get_all_regions() -> list[dict]:
    """
    Return all rows from the `regions` table.
    """
    client = get_client()
    if not client:
        return []
    
    def fetch():
        r = client.table("regions").select("*").execute()
        return r.data or []
    
    return _cached("all_regions", fetch)


def clear_cache():
    """Clear the in-memory cache (call at startup or testing)."""
    global _cache
    _cache = {}
