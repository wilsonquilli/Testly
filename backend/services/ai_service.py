import os
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_quiz(text: str, is_premium: bool = False) -> str:
    model_name = "gemini-2.5-pro" if is_premium else "gemini-2.5-flash"

    prompt = f"""Convert the following study notes into exactly 5 multiple-choice questions.

Return ONLY a valid JSON array like this (no markdown, no extra text):
[{{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A"}}]

Notes:
{text[:6000]}"""

    response = client.models.generate_content(model=model_name, contents=prompt)
    return response.text

def generate_flashcards(text: str, is_premium: bool = False) -> str:
    model_name = "gemini-2.5-pro" if is_premium else "gemini-2.5-flash"

    prompt = f"""Convert the following study notes into flashcard pairs.

Return ONLY a valid JSON array like this (no markdown, no extra text):
[{{"front": "Term or question", "back": "Definition or answer"}}]

Generate between 5 and 15 cards.

Notes:
{text[:6000]}"""

    response = client.models.generate_content(model=model_name, contents=prompt)
    return response.text