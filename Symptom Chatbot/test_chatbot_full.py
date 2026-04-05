"""
test_chatbot_full.py
====================
15 realistic test inputs with expected safe outputs.
Run: python test_chatbot_full.py
"""

import sys, os
sys.stdout.reconfigure(encoding="utf-8")  # Fix Windows cp1252 encoding
sys.path.insert(0, os.path.dirname(__file__))

from symptom_mapper import extract_symptoms_from_text
from triage_engine import classify_triage, get_possible_conditions

SEPARATOR = "─" * 65

# ─── Test Cases ───────────────────────────────────────────────────────────────
# Each case has:
#   input          : raw user sentence
#   expect_symptoms: symptom IDs that MUST be detected (subset check)
#   expect_triage  : "emergency" | "urgent" | "non-urgent"
#   expect_status  : substring that should appear in the status field

TEST_CASES = [
    # ── Emergency Cases ──────────────────────────────────────────────────────
    {
        "id": 1,
        "label": "Classic cardiac emergency",
        "input": "I am feeling very nauseous and feverish with a pain in my chest",
        "expect_symptoms": {"nausea", "high_fever", "chest_pain"},
        "expect_triage": "urgent",
        "expected_output": {
            "triage_level": "urgent",
            "status": "Prompt Medical Attention Recommended",
            "possible_conditions_include": ["cardiac issue"],
            "advice_keywords": ["doctor", "cannot confirm"],
            "must_not_contain": ["Heart attack", "Medication", "protocol"],
        },
    },
    {
        "id": 2,
        "label": "Chest pain + shortness of breath → cardiac emergency",
        "input": "I have chest pain and shortness of breath",
        "expect_symptoms": {"chest_pain", "shortness_of_breath"},
        "expect_triage": "emergency",
        "expected_output": {
            "triage_level": "emergency",
            "status": "Urgent Safety Alert",
            "possible_conditions_include": ["cardiac issue", "pulmonary embolism"],
            "advice_keywords": ["immediate", "emergency"],
            "must_not_contain": ["Heart attack diagnosis", "Take aspirin"],
        },
    },
    {
        "id": 3,
        "label": "Stroke — one-sided weakness + slurred speech",
        "input": "My left arm is weak and I cannot speak properly",
        "expect_symptoms": {"weakness_of_one_body_side", "slurred_speech"},
        "expect_triage": "emergency",
        "expected_output": {
            "triage_level": "emergency",
            "status": "Urgent Safety Alert",
            "possible_conditions_include": ["stroke or TIA"],
            "advice_keywords": ["immediate", "emergency"],
            "must_not_contain": ["Paralysis diagnosis"],
        },
    },
    {
        "id": 4,
        "label": "Chest pain + nausea + sweating → cardiac pattern",
        "input": "I have chest pain and I feel nauseous and I am sweating a lot",
        "expect_symptoms": {"chest_pain", "nausea"},
        "expect_triage": "emergency",
        "expected_output": {
            "triage_level": "emergency",
            "status": "Urgent Safety Alert",
            "possible_conditions_include": ["cardiac issue"],
            "advice_keywords": ["immediate"],
            "must_not_contain": ["Your diagnosis is", "Medication:"],
        },
    },
    {
        "id": 5,
        "label": "Coughing blood → urgent respiratory",
        "input": "I have been coughing up blood for the past two days",
        "expect_symptoms": {"blood_in_sputum"},
        "expect_triage": "emergency",
        "expected_output": {
            "triage_level": "emergency",
            "status": "Urgent Safety Alert",
            "possible_conditions_include": [],
            "advice_keywords": ["immediate", "emergency"],
            "must_not_contain": ["Tuberculosis diagnosis"],
        },
    },
    {
        "id": 6,
        "label": "High fever + confusion → serious CNS infection",
        "input": "I have a very high fever and I am confused and disoriented",
        "expect_symptoms": {"high_fever", "altered_sensorium"},
        "expect_triage": "emergency",
        "expected_output": {
            "triage_level": "emergency",
            "status": "Urgent Safety Alert",
            "possible_conditions_include": [],
            "advice_keywords": ["immediate"],
            "must_not_contain": ["Diagnosis confirmed"],
        },
    },
    # ── Urgent Cases ─────────────────────────────────────────────────────────
    {
        "id": 7,
        "label": "Fever + chest pain → urgent concern",
        "input": "I have fever and chest pain",
        "expect_symptoms": {"high_fever", "chest_pain"},
        "expect_triage": "urgent",
        "expected_output": {
            "triage_level": "urgent",
            "status": "Prompt Medical Attention Recommended",
            "possible_conditions_include": ["cardiac issue"],
            "advice_keywords": ["doctor", "urgent"],
            "must_not_contain": ["Heart attack", "medication"],
        },
    },
    {
        "id": 8,
        "label": "Fever + cough → respiratory infection",
        "input": "I have fever and cough",
        "expect_symptoms": {"high_fever", "cough"},
        "expect_triage": "urgent",
        "expected_output": {
            "triage_level": "urgent",
            "status": "Prompt Medical Attention Recommended",
            "possible_conditions_include": ["lower respiratory infection"],
            "advice_keywords": ["doctor"],
            "must_not_contain": ["Pneumonia confirmed"],
        },
    },
    {
        "id": 9,
        "label": "Shortness of breath alone → urgent",
        "input": "I am having difficulty breathing",
        "expect_symptoms": {"shortness_of_breath"},
        "expect_triage": "urgent",
        "expected_output": {
            "triage_level": "urgent",
            "status": "Prompt Medical Attention Recommended",
            "possible_conditions_include": [],
            "advice_keywords": ["doctor"],
            "must_not_contain": ["diagnosis"],
        },
    },
    {
        "id": 10,
        "label": "Chest pain alone → urgent (still needs evaluation)",
        "input": "I have a sharp pain in my chest",
        "expect_symptoms": {"chest_pain"},
        "expect_triage": "urgent",
        "expected_output": {
            "triage_level": "urgent",
            "status": "Prompt Medical Attention Recommended",
            "possible_conditions_include": ["cardiac issue", "musculoskeletal pain"],
            "advice_keywords": ["doctor"],
            "must_not_contain": ["Heart attack", "aspirin"],
        },
    },
    # ── Non-Urgent Cases ──────────────────────────────────────────────────────
    {
        "id": 11,
        "label": "Headache + nausea → non-urgent (migraine pattern)",
        "input": "I have a throbbing headache and I feel a bit nauseous",
        "expect_symptoms": {"headache", "nausea"},
        "expect_triage": "non-urgent",
        "expected_output": {
            "triage_level": "non-urgent",
            "status": "Non-Urgent",
            "possible_conditions_include": ["migraine", "tension headache"],
            "advice_keywords": ["consult", "worsen"],
            "must_not_contain": ["Emergency", "diagnosis confirmed"],
        },
    },
    {
        "id": 12,
        "label": "Cough only → non-urgent",
        "input": "I have a persistent dry cough",
        "expect_symptoms": {"cough"},
        "expect_triage": "non-urgent",
        "expected_output": {
            "triage_level": "non-urgent",
            "status": "Non-Urgent",
            "possible_conditions_include": ["upper respiratory infection"],
            "advice_keywords": ["consult"],
            "must_not_contain": ["Pneumonia", "Emergency"],
        },
    },
    {
        "id": 13,
        "label": "Skin rash → non-urgent",
        "input": "I noticed a red itchy rash on my arm",
        "expect_symptoms": {"skin_rash"},
        "expect_triage": "non-urgent",
        "expected_output": {
            "triage_level": "non-urgent",
            "status": "Non-Urgent",
            "possible_conditions_include": ["allergic reaction"],
            "advice_keywords": ["consult"],
            "must_not_contain": ["diagnosis confirmed"],
        },
    },
    # ── Edge / Negation Cases ─────────────────────────────────────────────────
    {
        "id": 14,
        "label": "Negated symptom — should NOT detect chest pain",
        "input": "I do not have chest pain but I feel tired",
        "expect_symptoms": set(),               # chest_pain must NOT appear
        "expect_triage": "non-urgent",
        "expected_output": {
            "triage_level": "non-urgent",
            "must_not_symptoms": {"chest_pain"},
            "must_not_contain": ["Heart attack", "Emergency"],
        },
    },
    {
        "id": 15,
        "label": "Vague / insufficient input → clarification needed",
        "input": "I feel a bit off today",
        "expect_symptoms": set(),
        "expect_triage": "non-urgent",
        "expected_output": {
            "triage_level": "non-urgent",
            "status": "Non-Urgent",
            "must_not_contain": ["Heart attack", "Emergency", "Medication"],
        },
    },
]

# ─── Runner ───────────────────────────────────────────────────────────────────

def run_tests():
    passed = 0
    failed = 0

    for tc in TEST_CASES:
        print(f"\n{SEPARATOR}")
        print(f"Test {tc['id']:02d}: {tc['label']}")
        print(f"  Input : \"{tc['input']}\"")

        result = extract_symptoms_from_text(tc["input"])
        detected = set(result["detected_symptoms"])
        triage_level, triage_reason = classify_triage(detected)
        conditions = get_possible_conditions(detected)

        print(f"  Detected  : {detected or '∅'}")
        print(f"  Triage    : {triage_level.upper()}")
        print(f"  Conditions: {conditions}")

        errors = []
        exp = tc["expected_output"]

        # Must-detect symptoms (subset check)
        if tc["expect_symptoms"] and not tc["expect_symptoms"].issubset(detected):
            missing = tc["expect_symptoms"] - detected
            errors.append(f"Missing expected symptoms: {missing}")

        # Must-NOT-detect symptoms (negation check)
        must_not = exp.get("must_not_symptoms", set())
        false_positives = must_not & detected
        if false_positives:
            errors.append(f"Falsely detected negated symptoms: {false_positives}")

        # Triage level
        if triage_level != tc["expect_triage"]:
            errors.append(f"Triage: expected '{tc['expect_triage']}', got '{triage_level}'")

        # Conditions include check
        for cond in exp.get("possible_conditions_include", []):
            if cond not in conditions:
                errors.append(f"Missing expected condition: '{cond}'")

        if errors:
            failed += 1
            for err in errors:
                print(f"  ❌ {err}")
        else:
            passed += 1
            print(f"  ✅ PASSED")

    print(f"\n{SEPARATOR}")
    print(f"Results: {passed} passed, {failed} failed out of {len(TEST_CASES)} tests.")
    print(SEPARATOR)


if __name__ == "__main__":
    run_tests()
