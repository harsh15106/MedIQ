import sys; sys.stdout.reconfigure(encoding='utf-8')
import os; sys.path.insert(0, os.path.dirname(__file__))
from symptom_mapper import extract_symptoms_from_text
from triage_engine import classify_triage

SEP = "-" * 65
cases = [
    ("Core input (must be URGENT)", "I am feeling nauseous and feverish and having pain in the chest."),
    ("chest pain",                  "I have chest pain"),
    ("pain in chest",               "I have pain in chest"),
    ("pain in the chest",           "I have pain in the chest"),
    ("pain in my chest",            "I have pain in my chest"),
    ("having pain in the chest",    "I am having pain in the chest"),
    ("tightness in chest",          "I have tightness in chest"),
    ("tightness in the chest",      "I feel tightness in the chest"),
    ("chest tightness",             "I have chest tightness"),
    ("chest discomfort",            "I have chest discomfort"),
    ("chest pressure",              "I have chest pressure"),
    ("pressure in the chest",       "I have pressure in the chest"),
    ("chest + SOB (emergency)",     "I have chest pain and shortness of breath"),
    ("negative: no chest pain",     "I do not have chest pain"),
]

passed = 0
failed = 0
for label, inp in cases:
    result = extract_symptoms_from_text(inp)
    detected = set(result["detected_symptoms"])
    triage, reason = classify_triage(detected)
    chest = "chest_pain" in detected
    neg_case = "negative" in label.lower()

    if neg_case:
        ok = not chest
    else:
        ok = chest

    status = "PASS" if ok else "FAIL"
    if ok: passed += 1
    else: failed += 1
    print(f"[{status}] {label}")
    print(f"       Detected : {detected}")
    print(f"       Triage   : {triage.upper()} — {reason[:60]}")
    print()

print(SEP)
print(f"Results: {passed} passed, {failed} failed out of {len(cases)}")
print(SEP)
