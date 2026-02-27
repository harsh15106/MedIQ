import random

EMPATHY_RESPONSES = [
    "I'm really sorry you're going through this.",
    "That sounds uncomfortable.",
    "Thanks for explaining that to me.",
    "I understand this must be worrying."
]

FOLLOWUP_TEMPLATES = [
    "Can you tell me more about that?",
    "How long have you been experiencing this?",
    "Has it been getting worse over time?",
    "Did it start suddenly or gradually?"
]

SERIOUS_ALERT = """
Based on what you've described, this could be something serious.
I strongly recommend seeking medical evaluation as soon as possible.
"""

def generate_empathy():
    return random.choice(EMPATHY_RESPONSES)

def generate_followup():
    return random.choice(FOLLOWUP_TEMPLATES)

def format_symptoms(symptoms):
    readable = [s.replace("_", " ") for s in symptoms]
    return ", ".join(readable)

def explain_diagnosis(disease_list):
    response = "Based on what you've shared so far, here are some possible conditions:\n\n"
    for disease, prob in disease_list:
        response += f"- {disease} ({prob:.1f}%)\n"
    response += "\nThis is not a confirmed diagnosis, but these are possibilities."
    return response