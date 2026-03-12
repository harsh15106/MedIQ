import re
import difflib
from all_symptoms import common_symptoms

# Negation words
NEGATIONS = {"no", "not", "dont", "without", "never", "none"}

# Synonym map for common phrases to standardized symptoms
SYNONYM_MAP = {
    # Vertigo / Dizziness
    "room is spinning": "vertigo",
    "room spinning": "vertigo",
    "spinning sensation": "vertigo",
    "lightheaded": "dizziness",
    "feel faint": "dizziness",
    "might faint": "dizziness",
    "woozy": "dizziness",
    "lightheaded": "dizzy",
    "feel faint": "dizzy",
    "might faint": "dizzy",
    "woozy": "dizzy",

    # Throat
    "scratchy throat": "sore_throat",
    "throat irritated": "sore_throat",
    "throat feels irritated": "sore_throat",

    # Heart
    "heart pounding": "palpitations",
    "heart beating hard": "palpitations",
    "heart racing": "fast_heart_rate",

    # Fatigue
    "very tired": "fatigue",
    "extremely tired": "fatigue",
}

# Body Location Keywords → Anatomical Region
# These are extracted FIRST from user text to set the active region BEFORE symptom scoring.
BODY_LOCATION_KEYWORDS = {
    # Head & Brain
    "Head": [
        "head", "headache", "skull", "brain", "scalp", "temple", "forehead",
        "face", "eye", "ear", "nose", "mouth", "jaw", "tooth", "teeth",
        "vision", "sight", "hearing", "dizzy", "dizziness", "vertigo"
    ],
    # Neck
    "Neck": [
        "neck", "nape", "cervical", "throat", "larynx", "trachea"
    ],
    # Chest
    "Chest": [
        "chest", "breast", "rib", "sternum", "lung", "heart", "cardiac",
        "thorax", "pectoral", "upper back", "shoulder blade"
    ],
    # Abdomen
    "Abdomen": [
        "stomach", "abdomen", "abdominal", "belly", "gut", "navel", "belly button",
        "liver", "gallbladder", "pancreas", "intestine", "bowel", "colon",
        "appendix", "upper right", "upper left", "lower right", "lower left",
        "epigastric", "umbilical"
    ],
    # Pelvis
    "Pelvis": [
        "pelvis", "pelvic", "groin", "bladder", "urethra", "uterus", "ovary",
        "prostate", "rectum", "anus", "anal", "genitals", "genital", "vaginal",
        "vulva", "perineum", "crotch"
    ],
    # Back
    "Back": [
        "back", "spine", "spinal", "lumbar", "sacral", "tailbone", "coccyx",
        "vertebra", "disc", "lower back", "mid back", "upper back"
    ],
    # Arm/Hand
    "Arm/Hand": [
        "arm", "forearm", "elbow", "wrist", "hand", "finger", "thumb",
        "palm", "knuckle", "wrist", "bicep", "tricep", "shoulder",
        "upper arm", "lower arm"
    ],
    # Leg/Foot
    "Leg/Foot": [
        "leg", "thigh", "calf", "shin", "knee", "ankle", "foot", "feet",
        "toe", "heel", "hamstring", "quadricep", "groin", "hip",
        "lower leg", "upper leg", "fibula", "tibia", "femur"
    ],
}

def extract_body_region_from_text(user_input):
    """
    Parse user free-text for body location keywords.
    Returns a set of matched anatomical regions (e.g. {'Leg/Foot'}).
    This runs BEFORE symptom extraction and acts as the primary region filter.
    """
    text = user_input.lower()
    matched_regions = set()
    
    for region, keywords in BODY_LOCATION_KEYWORDS.items():
        for kw in keywords:
            # Use word boundary matching for precision
            if re.search(r'\b' + re.escape(kw) + r'\b', text):
                matched_regions.add(region)
                break # one match per region is enough
    
    return matched_regions

# Clean Input
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    return text

# Synonym Normalization
def normalize_synonyms(text):
    for phrase, replacement in SYNONYM_MAP.items():
        if phrase in text:
            text = text.replace(phrase, replacement.replace("_", " "))
    return text

# Negation Detection
def is_negated(text, match_start):
    words = text.split()
    char_positions = []
    pos = 0

    for word in words:
        char_positions.append((word, pos))
        pos += len(word) + 1

    word_index = None
    for i, (word, position) in enumerate(char_positions):
        if position <= match_start < position + len(word):
            word_index = i
            break

    if word_index is None:
        return False

    window_start = max(0, word_index - 4)
    context_words = words[window_start:word_index]

    return any(w in NEGATIONS for w in context_words)

# Controlled Fuzzy Matching for Phrases
def fuzzy_phrase_match(text, phrase, threshold=0.90):
    similarity = difflib.SequenceMatcher(None, text, phrase).ratio()
    return similarity >= threshold

# Semantic Patterns for Common Symptoms
SYMPTOM_PATTERNS = {

    # Stroke
    "weakness_of_one_body_side": [
        r"(right|left).*(arm|leg).*weak",
        r"one side.*weak",
        r"face droop",
        r"drooping face"
        r"cant.*lift.*(arm|leg)",
        r"can't.*lift.*(arm|leg)",
        r"cannot.*lift.*(arm|leg)",
        r"weakness.*(right|left).*(arm|leg)",
        r"(arm|leg).*weak.*(right|left)",
        r"one side.*(arm|leg).*weak"
    ],

    "slurred_speech": [
        r"slurred speech",
        r"speech.*unclear",
        r"cant speak properly",
        r"trouble speaking",
        r"speech.*slurred",
        r"slurring words",
        r"slurred words",
        r"cant.*speak clearly",
        r"can't.*speak clearly",
        r"cannot.*speak clearly",
        r"speech.*trouble\b",
        r"trouble.*speech\b",
        r"unclear.*speech\b",
        r"speech.*unclear\b",
        r"cant.*speak\b"
    ],

    # Cardiac
    "chest_pain": [
        r"chest pain",
        r"burning.*chest",
        r"pressure.*chest",
        r"heavy.*chest",
        r"tight.*chest",
        r"chest.*discomfort",
        r"pain.*chest",
        r"chest.*pain",
        r"chest.*tightness",
        r"chest.*pressure"
    ],

    "shortness_of_breath": [
        r"\bshort of breath\b",
        r"\bbreathless\b",
        r"\bdifficulty breathing\b",
        r"\btrouble breathing\b",
        r"cant.*catch.*breath",
        r"can't.*catch.*breath",
        r"cannot.*catch.*breath",
        r"\bcatch.*breath\b"
        r"trouble.*breathing\b"
        r"breathing.*trouble\b",
        r"breath.*trouble\b",
        r"breathing.*difficulty\b",
        r"difficulty.*breathing\b",
        r"breath.*difficulty\b",
        r"breathing.*shortness\b",
    ],

    # Infection
    "cough": [
        r"\bcough\b",
        r"coughing",
        r"persistent cough"
    ],

    "blood_in_sputum": [
        r"coughing.*blood",
        r"blood.*cough",
        r"spitting blood"
    ],

    "high_fever": [
        r"\bfever\b",
        r"high temperature"
        r"fever.*(high|spike|rising|persistent)"
    ],

    "chills": [
        r"\bchills\b",
        r"shivering"
    ],

    "altered_sensorium": [
        r"\bconfused\b",
        r"\bconfusion\b",
        r"\bdisoriented\b",
        r"\bnot thinking clearly\b",
        r"\bmental fog\b",
        r"\bbrain fog\b",
        r"\baltered mental state\b",
        r"\bnot fully alert\b"
    ],

    "fast_heart_rate": [
        r"fast heartbeat",
        r"heart racing",
        r"heart beating fast",
    ],

    # UTI
    "burning_micturition": [
        r"(burn|sting|hurt).*?(pee|urinate)",
        r"painful urination"
    ],

    "continuous_feel_of_urine": [
        r"need to urinate constantly",
        r"feel like.*urinate",
        r"frequent urination"
    ],

    "bladder_discomfort": [
        r"lower abdomen discomfort",
        r"bladder pain"
    ],

    # GERD
    "acidity": [
        r"burning.*after eating",
        r"spicy food.*burn",
        r"worse when lying",
        r"acid reflux"
    ],

    "nausea": [
        r"nausea",
        r"feel like vomiting",
        r"queasy"
    ],

    # Skin
    "skin_rash": [
        r"skin rash",
        r"itchy rash",
        r"small rash",
        r"red rash"
    ],

    # Body Mapping (3D Interactive Model Extractor)
    "headache": [
        r"headache",
        r"throbbing head",
        r"pain.*head"
    ],
    
    "neck_pain": [
        r"pain.*neck",
        r"neck.*pain"
    ],
    
    "stomach_pain": [
        r"pain.*stomach",
        r"stomach.*pain"
    ],

    "abdominal_pain": [
        r"pain.*pelvis",
        r"pelvis.*pain",
        r"pain.*abdomen"
    ],

    "joint_pain": [
        r"pain.*shoulder",
        r"shoulder.*pain",
        r"pain.*hand",
        r"hand.*pain",
        r"pain.*foot",
        r"foot.*pain",
        r"pain.*joint"
    ],

    "muscle_pain": [
        r"pain.*arm",
        r"arm.*pain",
        r"pain.*thigh",
        r"thigh.*pain",
        r"pain.*calf",
        r"calf.*pain",
        r"pain.*muscle",
        r"muscle.*pain"
    ],

    "knee_pain": [
        r"pain.*knee",
        r"knee.*pain"
    ],
}

# Main Extraction Function
def extract_symptoms_from_text(user_input):

    text = clean_text(user_input)

    # Synonym normalization layer
    text = normalize_synonyms(text)

    detected = set()

    # Regex Semantic Matching
    for symptom, patterns in SYMPTOM_PATTERNS.items():

        if symptom not in common_symptoms:
            continue

        for pattern in patterns:
            match = re.search(pattern, text)
            if match and not is_negated(text, match.start()):
                detected.add(symptom)
                break

    # Dataset Phrase Fallback
    for symptom in common_symptoms:

        if symptom in detected:
            continue

        phrase = symptom.replace("_", " ")

        match = re.search(r"\b" + re.escape(phrase) + r"\b", text)
        if match and not is_negated(text, match.start()):
            detected.add(symptom)
            continue

        if len(phrase) >= 8:
            if fuzzy_phrase_match(text, phrase):
                detected.add(symptom)

    return detected