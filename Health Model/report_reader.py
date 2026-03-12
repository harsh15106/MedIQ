from matplotlib import text
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
from PIL import Image
import io
import re
from pdf2image import convert_from_bytes

def extract_text_from_image(file_bytes):
    image = Image.open(io.BytesIO(file_bytes))
    return pytesseract.image_to_string(image)

def extract_text_from_pdf(file_bytes):
    pages = convert_from_bytes(file_bytes)
    
    import pytesseract
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


