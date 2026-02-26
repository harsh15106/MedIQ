import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:/Program Files/Tesseract-OCR/tesseract.exe"
from PIL import Image
import io
import re
from pdf2image import convert_from_bytes

def extract_text_from_image(file_bytes):
    image = Image.open(io.BytesIO(file_bytes))
    return pytesseract.image_to_string(image)

def extract_text_from_pdf(file_bytes):
    pages = convert_from_bytes(
        file_bytes,
        poppler_path=r"C:/Users/senan/Downloads/Release-25.12.0-0/poppler-25.12.0/Library/bin"
    )
    
    import pytesseract
    text = ""
    for page in pages:
        text += pytesseract.image_to_string(page)
        
    return text

def find_value(pattern, text):
    match = re.search(pattern, text, re.IGNORECASE)
    return float(match.group(1)) if match else 0

def extract_values_from_report(upload_file):
    file_bytes = upload_file.file.read()

    if upload_file.filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
    else:
        text = extract_text_from_image(file_bytes)

    values = {
        "Blood_glucose": find_value(r"glucose.*?(\d+\.?\d*)", text),
        "HbA1C": find_value(r"hba1c.*?(\d+\.?\d*)", text),
        "Systolic_BP": find_value(r"systolic.*?(\d+\.?\d*)", text),
        "Diastolic_BP": find_value(r"diastolic.*?(\d+\.?\d*)", text),
        "LDL": find_value(r"ldl.*?(\d+\.?\d*)", text),
        "HDL": find_value(r"hdl.*?(\d+\.?\d*)", text),
        "Triglycerides": find_value(r"triglycerides.*?(\d+\.?\d*)", text),
        "Haemoglobin": find_value(r"haemoglobin.*?(\d+\.?\d*)", text),
        "MCV": find_value(r"mcv.*?(\d+\.?\d*)", text)
    }

    return values