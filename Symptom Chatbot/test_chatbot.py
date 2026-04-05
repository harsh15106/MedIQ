"""
test_chatbot.py
===============
Test cases for symptom extraction and triage classification.
Run with: python test_chatbot.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from symptom_mapper import extract_symptoms_from_text
from triage_engine import classify_triage, get_possible_conditions, build_safe_response

SEPARATOR = "─" * 60

TEST_INPUTS = [
    {
        "label": "Test 1 — Nausea + Fever + Chest Pain",
        "input": "I am feeling very nauseous and feverish with a pain in my chest",
        "expect_symptoms": {"nausea", "high_fever", "chest_pain"},
        "expect_triage": "urgent",
    },
    {
        "label": "Test 2 — Chest Pain + Shortness of Breath",
        "input": "I have chest pain and shortness of breath",
        "expect_symptoms": {"chest_pain", "shortness_of_breath"},
        "expect_triage": "emergency",
    },
    {
        "label": "Test 3 — Fever + Cough",
        "input": "I have fever and cough",
        "expect_symptoms": {"high_fever", "cough"},
        "expect_triage": "urgent",
    },
    {
        "label": "Test 4 — Stroke Symptoms",
        "input": "My left arm is weak and I cannot speak properly",
        "expect_symptoms": {"weakness_of_one_body_side", "slurred_speech"},
        "expect_triage": "emergency",
    },
]


def run_tests():
    all_passed = True
    for test in TEST_INPUTS:
        print(f"\n{SEPARATOR}")
        print(f"🧪 {test['label']}")
        print(f"   Input: \"{test['input']}\"")

        # Symptom extraction
        result = extract_symptoms_from_text(test["input"])
        detected = set(result["detected_symptoms"])
        print(f"   Detected: {detected}")

        # Triage
        triage_level, triage_reason = classify_triage(detected)
        print(f"   Triage Level: {triage_level.upper()}")
        print(f"   Triage Reason: {triage_reason}")

        # Possible conditions
        conditions = get_possible_conditions(detected)
        print(f"   Possible Conditions: {conditions}")

        # Assertions
        sym_ok = test["expect_symptoms"].issubset(detected)
        tri_ok = triage_level == test["expect_triage"]

        if sym_ok and tri_ok:
            print("   ✅ PASSED")
        else:
            all_passed = False
            if not sym_ok:
                missing = test["expect_symptoms"] - detected
                print(f"   ❌ FAILED — Missing expected symptoms: {missing}")
            if not tri_ok:
                print(f"   ❌ FAILED — Expected triage '{test['expect_triage']}', got '{triage_level}'")

    print(f"\n{SEPARATOR}")
    if all_passed:
        print("✅ All tests passed!")
    else:
        print("❌ Some tests failed. Review above output.")
    print(SEPARATOR)


if __name__ == "__main__":
    run_tests()
