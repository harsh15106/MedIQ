import re
import difflib
from all_symptoms import common_symptoms

# Negation words
NEGATIONS = {"no", "not", "dont", "without", "never", "none", "neither"}

# Synonym map maps phrases to canonical symptom keys
SYNONYM_MAP = {
    # Nausea
    "nauseous": "nausea",
    "feeling sick": "nausea",
    "feel like vomiting": "nausea",
    "queasy": "nausea",
    
    # Fever
    "feverish": "high_fever",
    "high temperature": "high_fever",
    "fever": "high_fever",
    "mild fever": "mild_fever",
    
    # Chest Pain — all natural language variants
    "chest pain":              "chest_pain",
    "pain in chest":           "chest_pain",
    "pain in the chest":       "chest_pain",
    "pain in my chest":        "chest_pain",
    "having pain in the chest":"chest_pain",
    "having chest pain":       "chest_pain",
    "tight chest":             "chest_pain",
    "tightness in chest":      "chest_pain",
    "tightness in the chest":  "chest_pain",
    "chest tightness":         "chest_pain",
    "heavy chest":             "chest_pain",
    "chest discomfort":        "chest_pain",
    "discomfort in chest":     "chest_pain",
    "discomfort in the chest": "chest_pain",
    "pressure in chest":       "chest_pain",
    "pressure in the chest":   "chest_pain",
    "chest pressure":          "chest_pain",
    "chest feels tight":       "chest_pain",
    "chest feels heavy":       "chest_pain",
    "burning in chest":        "chest_pain",
    "burning in the chest":    "chest_pain",
    "ache in chest":           "chest_pain",
    "ache in the chest":       "chest_pain",
    
    # Vertigo / Dizziness
    "room is spinning": "vertigo",
    "room spinning": "vertigo",
    "spinning sensation": "vertigo",
    "lightheaded": "dizziness",
    "feel faint": "dizziness",
    "might faint": "dizziness",
    "woozy": "dizziness",
    
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
    "exhausted": "fatigue",

    # Shortness of breath
    "shortness of breath": "shortness_of_breath",
    "difficulty breathing": "shortness_of_breath",
    "having difficulty breathing": "shortness_of_breath",
    "hard to breathe": "shortness_of_breath",
    "cannot breathe properly": "shortness_of_breath",
    "trouble breathing": "shortness_of_breath",
    "struggling to breathe": "shortness_of_breath",
    "out of breath": "shortness_of_breath",

    # Slurred speech
    "cannot speak properly": "slurred_speech",
    "can't speak properly": "slurred_speech",
    "trouble speaking": "slurred_speech",
    "hard to speak": "slurred_speech",
    "speech is unclear": "slurred_speech",
    "slurring words": "slurred_speech",
}

# Core Pattern Regexes
SYMPTOM_PATTERNS = {
    "weakness_of_one_body_side": [r"(right|left).*(arm|leg).*weak", r"one side.*weak", r"face droop", r"cant.*lift.*(arm|leg)"],
    "slurred_speech": [
        r"slurred speech", r"speech.*unclear", r"cant speak properly",
        r"cannot speak properly", r"trouble speaking", r"hard to speak",
        r"slurring words", r"slurring.*speech", r"speech.*slurred"
    ],
    "chest_pain": [
        # Exact phrase matches
        r"\bchest pain\b",
        r"\bchest discomfort\b",
        r"\bchest tightness\b",
        r"\bchest pressure\b",
        # pain/ache/tightness/pressure near 'chest'
        r"pain\b.{0,25}\bchest\b",
        r"\bchest\b.{0,25}\bpain\b",
        r"ache.{0,20}chest",
        r"chest.{0,20}ache",
        r"tight.{0,15}chest",
        r"chest.{0,15}tight",
        r"pressure.{0,15}chest",
        r"chest.{0,15}pressure",
        r"heavy.{0,10}chest",
        r"chest.{0,10}heavy",
        r"burning.{0,15}chest",
        r"chest.{0,15}burn",
        r"discomfort.{0,15}chest",
        r"chest.{0,15}discomfort",
    ],
    "shortness_of_breath": [
        r"\bshort of breath\b", r"\bbreathless\b",
        r"\bdifficulty breathing\b", r"\btroubling breathing\b",
        r"\btrouble breathing\b", r"\bhard to breathe\b",
        r"cant.*catch.*breath", r"struggling.*breath",
        r"out of breath", r"cannot breathe"
    ],
    "cough": [r"\bcough\b", r"coughing", r"persistent cough"],
    "blood_in_sputum": [r"coughing.*blood", r"blood.*cough", r"spitting blood"],
    "high_fever": [r"\bfever\b", r"high temperature", r"fever.*high"],
    "chills": [r"\bchills\b", r"shivering"],
    "altered_sensorium": [r"\bconfused\b", r"\bconfusion\b", r"\bdisoriented\b", r"\bmental fog\b", r"\bbrain fog\b"],
    "fast_heart_rate": [r"fast heartbeat", r"heart racing", r"heart beating fast"],
    "burning_micturition": [r"(burn|sting|hurt).*?(pee|urinate)", r"painful urination"],
    "continuous_feel_of_urine": [r"need to urinate constantly", r"frequent urination"],
    "bladder_discomfort": [r"lower abdomen discomfort", r"bladder pain"],
    "acidity": [r"burning.*after eating", r"acid reflux", r"acidity"],
    "headache": [r"headache", r"throbbing head", r"head pounding"],
    "nausea": [r"nausea", r"feel like vomiting", r"queasy", r"sick to stomach"],
    "skin_rash": [r"skin rash", r"itchy rash", r"small rash", r"red rash"]
}

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text) # Replace punct with space to preserve multi-word structures
    text = " ".join(text.split())
    return text

def normalize_synonyms(text, detected):
    for phrase, canonical_symptom in SYNONYM_MAP.items():
        if phrase in text and not is_negated(text, text.find(phrase)):
            detected.add(canonical_symptom)
    return text

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
            
    if word_index is None: return False
    window_start = max(0, word_index - 4)
    context_words = words[window_start:word_index]
    return any(w in NEGATIONS for w in context_words)

def fuzzy_phrase_match(text, phrase, threshold=0.90):
    similarity = difflib.SequenceMatcher(None, text, phrase).ratio()
    return similarity >= threshold

def extract_symptoms_from_text(user_input):
    # Step 1: Synonym matching runs on RAW lowercased text BEFORE clean_text
    # This is critical — clean_text strips words like "the", "my", "in" that
    # are part of multi-word synonyms like "pain in the chest".
    raw = user_input.lower().strip()
    detected = set()
    normalize_synonyms(raw, detected)

    # Step 2: Regex semantic matching runs on cleaned text
    text = clean_text(user_input)
    normalize_synonyms(text, detected)  # also run on cleaned text as a second pass

    # 2. Regex Semantic Matching
    for symptom, patterns in SYMPTOM_PATTERNS.items():
        if symptom not in common_symptoms:
            continue
        for pattern in patterns:
            match = re.search(pattern, text)
            if match and not is_negated(text, match.start()):
                detected.add(symptom)
                break

    # 3. Dynamic dataset phrase fallback (e.g. "muscle pain" => "muscle_pain")
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

    return {
        "detected_symptoms": list(detected)
    }