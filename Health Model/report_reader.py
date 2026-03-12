import os
import pytesseract
from PIL import Image
import io
import re
from pdf2image import convert_from_bytes
from dotenv import load_dotenv

load_dotenv()

# Use environment variable if provided, otherwise rely on system PATH
tesseract_cmd = os.getenv("TESSERACT_CMD")
if tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

def extract_text_from_image(file_bytes):
    image = Image.open(io.BytesIO(file_bytes))
    return pytesseract.image_to_string(image)

def extract_text_from_pdf(file_bytes):
    poppler_path = os.getenv("POPPLER_PATH")
    
    # Use Poppler path from env if it exists, otherwise rely on system PATH
    kwargs = {}
    if poppler_path:
        kwargs["poppler_path"] = poppler_path

    pages = convert_from_bytes(file_bytes, **kwargs)
    
    text = ""
    for page in pages:
        text += pytesseract.image_to_string(page)
        
    return text



async def extract_values_from_report(upload_file):
    file_bytes = await upload_file.read()

    if upload_file.filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
    else:
        text = extract_text_from_image(file_bytes)
    
    numbers = re.findall(r"\d+\.?\d*", text)
    print("Extracted Numbers:", numbers)

    if len(numbers) < 9:
        raise ValueError("Not enough numeric values found in report.")
    values = {
        "Blood_glucose": float(numbers[0]),
        "HbA1C": float(numbers[1]),
        "Systolic_BP": float(numbers[2]),
        "Diastolic_BP": float(numbers[3]),
        "LDL": float(numbers[4]),
        "HDL": float(numbers[5]),
        "Triglycerides": float(numbers[6]),
        "Haemoglobin": float(numbers[7]),
        "MCV": float(numbers[8])
    }
    print(text)
    missing = [k for k, v in values.items() if v is None]
    if missing:
     print("Missing fields:", missing)

    if len(missing) > 4:
     raise ValueError("Too many lab values missing from report.")
    
    if any(v is None for v in values.values()):
     raise ValueError("Incomplete lab report.")

    return values
def find_value(pattern, text):
    match = re.search(pattern, text, re.IGNORECASE)
    return float(match.group(1)) if match else None


