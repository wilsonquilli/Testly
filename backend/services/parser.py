import fitz  

def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text from a PDF file at the given path."""
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()