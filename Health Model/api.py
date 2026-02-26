from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from service import predict_health_status
from report_reader import extract_values_from_report

app = FastAPI(title="Health AI API")


class PatientData(BaseModel):
    Blood_glucose: float
    HbA1C: float
    Systolic_BP: float
    Diastolic_BP: float
    LDL: float
    HDL: float
    Triglycerides: float
    Haemoglobin: float
    MCV: float


@app.get("/")
def root():
    return {"message": "Health AI API is running"}


# ---------- Manual input ----------
@app.post("/predict")
def predict(data: PatientData):
    return predict_health_status(data.dict())


# ---------- Report upload ----------
@app.post("/predict-from-report")
async def predict_from_report(file: UploadFile = File(...)):
    values = extract_values_from_report(file)
    return predict_health_status(values)