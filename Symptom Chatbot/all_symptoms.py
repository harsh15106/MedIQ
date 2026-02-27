import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# Load dataset
df = pd.read_csv("DiseaseAndSymptoms.csv")

# Build binary symptom matrix
symptoms = set()
for col in df.columns[1:]:
    symptoms.update([s.strip() for s in df[col].dropna().unique()])

symptoms = sorted(symptoms)

binary_df = pd.DataFrame(0, index=np.arange(len(df)), columns=symptoms)

for i, row in df.iterrows():
    for col in df.columns[1:]:
        symptom = row[col]
        if pd.notna(symptom):
            symptom = symptom.strip()
            binary_df.at[i, symptom] = 1

binary_df["Disease"] = df["Disease"]

# Conditional probabilities
disease_groups = binary_df.groupby("Disease")
disease_symptom_prob = {}

for disease, group in disease_groups:
    symptom_means = group.drop("Disease", axis=1).mean()
    disease_symptom_prob[disease] = symptom_means

# Generate synthetic patients (low noise)
synthetic_rows = []
samples_per_disease = 400
noise_rate = 0.03

for disease, symptom_probs in disease_symptom_prob.items():
    for _ in range(samples_per_disease):

        patient = []

        for symptom in symptoms:
            prob = symptom_probs[symptom]
            value = np.random.rand() < prob

            if np.random.rand() < noise_rate:
                value = not value

            patient.append(int(value))

        patient.append(disease)
        synthetic_rows.append(patient)

synthetic_df = pd.DataFrame(synthetic_rows, columns=symptoms + ["Disease"])

# Remove rare symptoms
symptom_counts = synthetic_df.drop("Disease", axis=1).sum()
common_symptoms = symptom_counts[symptom_counts > 500].index.tolist()

synthetic_df = synthetic_df[common_symptoms + ["Disease"]]

# Encode labels
labels = LabelEncoder()
synthetic_df["label"] = labels.fit_transform(synthetic_df["Disease"])

x = synthetic_df.drop(["Disease", "label"], axis=1)
y = synthetic_df["label"]

x_train, x_test, y_train, y_test = train_test_split(
    x, y, test_size=0.2, random_state=42, stratify=y
)