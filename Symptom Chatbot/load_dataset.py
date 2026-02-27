import pandas as pd

df = pd.read_csv("DiseaseAndSymptoms.csv")

print(df.shape)
print(df.head())
print(df.columns)