from pathlib import Path
import xml.etree.ElementTree as ET
import zipfile
import fitz

WORD_NAMESPACE = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()

def extract_text_from_docx(file_path: str) -> str:
    paragraphs = []

    with zipfile.ZipFile(file_path) as archive:
        with archive.open("word/document.xml") as document_xml:
            root = ET.parse(document_xml).getroot()

    for paragraph in root.findall(".//w:p", WORD_NAMESPACE):
        runs = [
            node.text
            for node in paragraph.findall(".//w:t", WORD_NAMESPACE)
            if node.text
        ]
        if runs:
            paragraphs.append("".join(runs).strip())

    return "\n".join(part for part in paragraphs if part).strip()

def extract_text_from_file(file_path: str, filename: str | None = None, content_type: str | None = None) -> str:
    extension = Path(filename or file_path).suffix.lower()

    if content_type == "application/pdf" or extension == ".pdf":
        return extract_text_from_pdf(file_path)

    if (
        content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        or extension == ".docx"
    ):
        return extract_text_from_docx(file_path)

    raise ValueError("Unsupported file type. Please upload a PDF or DOCX file.")