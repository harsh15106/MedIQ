from unittest import result

from fastapi import FastAPI, UploadFile, File, HTTPException
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
    return {"status": "healthy", "message": "Health AI API is operational"}

# ---------- Manual input ----------
@app.post("/predict")
def predict(data: PatientData):
    # Get prediction from your model
    result = predict_health_status(data.model_dump())
    return result

# ---------- Report upload ----------
@app.post("/predict-from-report")
async def predict_from_report(file: UploadFile = File(...)):
    # 1. Validate file type
    if file.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF or Image.")

    try:
        # 2. Extract values
        # Make sure your extract function can handle the UploadFile object
        values = extract_values_from_report(file) 
        
        # 3. Predict
        result = predict_health_status(values)
        return {"extracted_values": values, "prediction": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing report: {str(e)}")