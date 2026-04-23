import json
import random
import re
from collections import Counter

PREMIUM_MODEL = "local-study-quiz-engine"
STANDARD_MODEL = "local-study-quiz-engine"
MAX_QUESTIONS = 5
MAX_FLASHCARDS = 15

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "also", "am", "an",
    "and", "any", "are", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "could", "did", "do", "does",
    "doing", "down", "during", "each", "few", "for", "from", "further", "had",
    "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
    "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself",
    "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of",
    "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out",
    "over", "own", "same", "she", "should", "so", "some", "such", "than", "that",
    "the", "their", "theirs", "them", "themselves", "then", "there", "these",
    "they", "this", "those", "through", "to", "too", "under", "until", "up", "very",
    "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom",
    "why", "will", "with", "you", "your", "yours", "yourself", "yourselves",
}

GENERIC_DISTRACTORS = {
    "term": ["Compilation", "Diffusion", "Industrialization", "Encryption", "Mutation", "Democracy"],
    "definition": [
        "A process that changes data from one form to another",
        "A rule used to organize information into categories",
        "A system for storing and retrieving information",
        "A condition that occurs only in rare situations",
    ],
    "location": ["main memory", "the nucleus", "the atmosphere", "the capital city"],
}


class AIServiceError(Exception):
    pass


class AIServiceUnavailableError(AIServiceError):
    pass


def _normalize_text(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _clean_phrase(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip(" .,:;-\t")


def _title_if_short(value: str) -> str:
    value = _clean_phrase(value)
    if not value:
        return value
    if len(value.split()) <= 4 and not any(char.isdigit() for char in value):
        return value.title()
    return value[0].upper() + value[1:]


def _safe_lower(value: str) -> str:
    return _clean_phrase(value).lower()


def _split_sentences(text: str) -> list[str]:
    chunks = re.split(r"(?<=[.!?])\s+|\n+", text)
    return [
        cleaned
        for chunk in chunks
        if 25 <= len(cleaned := _clean_phrase(chunk)) <= 260 and len(cleaned.split()) >= 5
    ]


def _extract_keywords(text: str) -> list[str]:
    tokens = re.findall(r"\b[A-Za-z][A-Za-z0-9+#/\-]{2,}\b", text)
    counts = Counter(token.lower() for token in tokens if token.lower() not in STOPWORDS)
    return sorted(counts, key=lambda token: (-counts[token], -len(token), token))


def _looks_like_term(value: str) -> bool:
    words = value.split()
    return 1 <= len(words) <= 6 and all(len(word) >= 2 for word in words)


def _is_heading_line(line: str) -> bool:
    cleaned = _clean_phrase(line)
    if not cleaned:
        return False
    if len(cleaned) > 80 or len(cleaned.split()) > 8:
        return False
    if cleaned.endswith((".", "?", "!")):
        return False
    if ":" in cleaned and len(cleaned.split(":")[1].split()) > 2:
        return False

    alpha_words = re.findall(r"[A-Za-z][A-Za-z0-9+#/\-]*", cleaned)
    if not alpha_words:
        return False

    title_like = sum(1 for word in alpha_words if word[:1].isupper() or word.isupper())
    if title_like >= max(1, len(alpha_words) - 1):
        return True

    return cleaned.isupper()


def _build_sections(text: str) -> list[dict]:
    lines = [line.strip() for line in text.splitlines()]
    sections = []
    current = {"heading": "General", "lines": []}

    for raw_line in lines:
        line = _clean_phrase(raw_line)
        if not line:
            continue

        if _is_heading_line(line):
            if current["lines"]:
                sections.append(current)
            current = {"heading": line, "lines": []}
            continue

        current["lines"].append(line)

    if current["lines"]:
        sections.append(current)

    if not sections:
        sections.append({"heading": "General", "lines": [_normalize_text(text)]})

    for section in sections:
        section["text"] = "\n".join(section["lines"])
        section["keywords"] = _extract_keywords(f"{section['heading']} {section['text']}")[:12]
        section["terms"] = _extract_candidate_terms(section["text"])
        section["locations"] = _extract_location_candidates(section["text"])
        section["definitions"] = _extract_definition_candidates(section["text"])

    return sections


def _extract_candidate_terms(text: str) -> list[str]:
    candidates = []
    for match in re.findall(r"\b[A-Z][A-Za-z0-9+#/\-]*(?: [A-Z][A-Za-z0-9+#/\-]*){0,3}\b", text):
        candidate = _clean_phrase(match)
        if _is_usable_term_candidate(candidate) and candidate not in candidates:
            candidates.append(candidate)

    for match in re.findall(r"\b[A-Za-z][A-Za-z0-9+#/\-]{2,}\b", text):
        candidate = _clean_phrase(match)
        if _is_usable_term_candidate(candidate) and candidate not in candidates:
            candidates.append(candidate)

    return candidates[:30]


def _is_usable_term_candidate(candidate: str) -> bool:
    lowered = candidate.lower()
    if lowered in STOPWORDS:
        return False
    if len(candidate) <= 2:
        return False
    if candidate in {"The", "A", "An"}:
        return False
    if len(candidate.split()) == 1 and lowered.endswith("s") and len(candidate) <= 5:
        return False
    return _looks_like_term(candidate)


def _extract_location_candidates(text: str) -> list[str]:
    candidates = []
    pattern = re.compile(r"\b(?:in|on|at|inside|within)\s+([A-Za-z][A-Za-z0-9' -]{2,50})", re.IGNORECASE)
    for match in pattern.findall(text):
        candidate = _clean_phrase(match)
        if 1 <= len(candidate.split()) <= 5 and candidate not in candidates:
            candidates.append(candidate)
    return candidates[:20]


def _extract_definition_candidates(text: str) -> list[str]:
    candidates = []
    for sentence in _split_sentences(text):
        if 4 <= len(sentence.split()) <= 18 and sentence not in candidates:
            candidates.append(sentence)
    return candidates[:20]


def _add_fact(
    facts: list[dict],
    *,
    question: str,
    answer: str,
    fact_type: str,
    source: str,
    section: str,
    subject: str = "",
    priority: int = 0,
) -> None:
    question = _clean_phrase(question)
    answer = _clean_phrase(answer)
    subject = _clean_phrase(subject)
    if not question or not answer or len(answer) < 2:
        return

    facts.append(
        {
            "question": question,
            "answer": answer,
            "type": fact_type,
            "source": source,
            "section": section,
            "subject": subject,
            "priority": priority,
        }
    )


def _extract_definition_pairs(section: dict) -> list[tuple[str, str]]:
    pairs = []
    for line in section["lines"]:
        if ":" in line:
            left, right = line.split(":", 1)
        elif " - " in line:
            left, right = line.split(" - ", 1)
        else:
            continue

        term = _clean_phrase(left)
        definition = _clean_phrase(right)
        if _looks_like_term(term) and 4 <= len(definition.split()) <= 35:
            pairs.append((term, definition))
    return pairs


def _singular_or_plural_do(subject: str) -> str:
    subject_lower = _safe_lower(subject)
    return "do" if subject_lower.endswith("s") and not subject_lower.endswith("ss") else "does"


def _singular_or_plural_be(subject: str) -> str:
    subject_lower = _safe_lower(subject)
    return "are" if subject_lower.endswith("s") and not subject_lower.endswith("ss") else "is"


def _extract_facts_from_sections(sections: list[dict]) -> list[dict]:
    facts = []

    for section in sections:
        heading = section["heading"]
        heading_lower = heading.lower()

        for term, definition in _extract_definition_pairs(section):
            _add_fact(
                facts,
                question=f"What {_singular_or_plural_be(term)} {term.lower()}?",
                answer=definition,
                fact_type="definition",
                source=definition,
                section=heading,
                subject=term,
                priority=5,
            )

        for sentence in _split_sentences(section["text"]):
            store_match = re.match(
                r"^(?P<subject>[A-Z][A-Za-z0-9()' /#\-]{1,70}?)\s+(?:store|stores|hold|holds|contain|contains)\s+(?P<answer>[^.!?]{2,70})[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if store_match:
                subject = _clean_phrase(store_match.group("subject"))
                answer = _clean_phrase(store_match.group("answer"))
                _add_fact(
                    facts,
                    question=f"What {_singular_or_plural_do(subject)} {subject.lower()} store?",
                    answer=answer,
                    fact_type="definition",
                    source=sentence,
                    section=heading,
                    subject=subject,
                    priority=4,
                )
                continue

            translate_match = re.match(
                r"^(?P<subject>[A-Z][A-Za-z0-9()' /#\-]{1,70}?)\s+(?:translate|translates|convert|converts|turn|turns)\s+(?P<object>[^.!?]{2,70}?)\s+into\s+(?P<answer>[^.!?]{2,70})[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if translate_match:
                subject = _clean_phrase(translate_match.group("subject"))
                obj = _clean_phrase(translate_match.group("object"))
                answer = _clean_phrase(translate_match.group("answer"))
                _add_fact(
                    facts,
                    question=f"What {_singular_or_plural_do(subject)} {subject.lower()} translate {obj.lower()} into?",
                    answer=answer,
                    fact_type="term",
                    source=sentence,
                    section=heading,
                    subject=subject,
                    priority=4,
                )
                continue

            use_match = re.match(
                r"^(?P<subject>[A-Z][A-Za-z0-9()' /#\-]{1,70}?)\s+(?:use|uses)\s+(?P<answer>[^.!?]{2,50}?)\s+to\s+(?P<purpose>[^.!?]{4,100})[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if use_match:
                subject = _clean_phrase(use_match.group("subject"))
                answer = _clean_phrase(use_match.group("answer"))
                purpose = _clean_phrase(use_match.group("purpose"))
                _add_fact(
                    facts,
                    question=f"What {_singular_or_plural_do(subject)} {subject.lower()} use to {purpose}?",
                    answer=answer,
                    fact_type="term",
                    source=sentence,
                    section=heading,
                    subject=subject,
                    priority=4,
                )
                continue

            compare_match = re.match(
                r"^(?P<subject>[A-Z][A-Za-z0-9()' /#\-]{1,70}?)\s+(?:is|are)\s+often\s+compared\s+to\s+(?P<answer>[^.!?]{2,70})[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if compare_match:
                subject = _clean_phrase(compare_match.group("subject"))
                answer = _clean_phrase(compare_match.group("answer"))
                _add_fact(
                    facts,
                    question=f"What {_singular_or_plural_be(subject)} {subject.lower()} often compared to?",
                    answer=answer,
                    fact_type="term",
                    source=sentence,
                    section=heading,
                    subject=subject,
                    priority=4,
                )
                continue

            location_match = re.match(
                r"^(?P<subject>[A-Z][A-Za-z0-9()' /#\-]{1,70}?)\s+(?:occur|occurs|run|runs|happen|happens|take place|takes place|store|stores)\s+(?:in|on|at|inside|within)\s+(?P<answer>[^.!?]{2,70})[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if location_match:
                subject = _clean_phrase(location_match.group("subject"))
                answer = _clean_phrase(location_match.group("answer"))
                _add_fact(
                    facts,
                    question=f"Where {_singular_or_plural_do(subject)} {subject.lower()} occur?",
                    answer=answer,
                    fact_type="location",
                    source=sentence,
                    section=heading,
                    subject=subject,
                    priority=3,
                )
                continue

            quantity_match = re.match(
                r"^(?P<subject>(?:The\s+)?[A-Z][A-Za-z0-9()' /#\-]{1,70}?)\s+(?P<verb>beat|beats|occur|occurs|happen|happens|run|runs)\s+(?:about|around|approximately|nearly)?\s*(?P<answer>\d[\d,]*)\s*(?:times)?\s+(?:in|per|a|an)\s+(?P<period>day|week|month|year|hour|minute)[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if quantity_match:
                subject = _clean_phrase(quantity_match.group("subject"))
                verb = _clean_phrase(quantity_match.group("verb")).lower()
                answer = _clean_phrase(quantity_match.group("answer"))
                period = _clean_phrase(quantity_match.group("period"))
                normalized_verb = {
                    "beat": "beat",
                    "beats": "beat",
                    "occur": "occur",
                    "occurs": "occur",
                    "happen": "happen",
                    "happens": "happen",
                    "run": "run",
                    "runs": "run",
                }.get(verb, "occur")
                _add_fact(
                    facts,
                    question=f"About how many times does {subject.lower()} {normalized_verb} in one {period}?",
                    answer=answer,
                    fact_type="number",
                    source=sentence,
                    section=heading,
                    subject=subject,
                    priority=3,
                )
                continue

            begin_match = re.match(
                r"^(?P<subject>[A-Z][A-Za-z0-9()' /#\-]{1,90}?)\s+(?:began|begin|started|start)\s+in\s+(?P<answer>[^.!?]{2,70})[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if begin_match:
                subject = _clean_phrase(begin_match.group("subject"))
                answer = _clean_phrase(begin_match.group("answer"))
                _add_fact(
                    facts,
                    question=f"Where did {subject.lower()} begin?",
                    answer=answer,
                    fact_type="location",
                    source=sentence,
                    section=heading,
                    subject=subject,
                    priority=4,
                )
                continue

            year_match = re.match(
                r"^(?P<subject>[A-Z][A-Za-z0-9()' /#\-]{1,90}?)\s+(?:was|were)?\s*(?P<event>adopted|signed|founded|established|created|began|fell)\s+in\s+(?P<answer>\d{3,4})[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if year_match:
                subject = _clean_phrase(year_match.group("subject"))
                event = _clean_phrase(year_match.group("event")).lower()
                answer = _clean_phrase(year_match.group("answer"))
                question = f"In what year was {subject.lower()} {event}?"
                if event in {"began", "fell"}:
                    event_base = {"began": "begin", "fell": "fall"}[event]
                    question = f"In what year did {subject.lower()} {event_base}?"
                _add_fact(
                    facts,
                    question=question,
                    answer=answer,
                    fact_type="number",
                    source=sentence,
                    section=heading,
                    subject=subject,
                    priority=4,
                )
                continue

            inventor_match = re.match(
                r"^(?P<subject>[A-Z][A-Za-z0-9()' /#\-]{1,90}?)\s+(?:was|were)?\s*(?:invented|developed|created|written)\s+by\s+(?P<answer>[^.!?]{2,70})[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if inventor_match:
                subject = _clean_phrase(inventor_match.group("subject"))
                answer = _clean_phrase(inventor_match.group("answer"))
                _add_fact(
                    facts,
                    question=f"Who invented {subject.lower()}?",
                    answer=answer,
                    fact_type="term",
                    source=sentence,
                    section=heading,
                    subject=subject,
                    priority=4,
                )
                continue

            cause_match = re.match(
                r"^(?P<subject>[A-Z][A-Za-z0-9()' /#\-]{1,70}?)\s+(?:cause|causes|lead to|leads to|result in|results in)\s+(?P<answer>[^.!?]{4,100})[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if cause_match:
                subject = _clean_phrase(cause_match.group("subject"))
                answer = _clean_phrase(cause_match.group("answer"))
                _add_fact(
                    facts,
                    question=f"What does {subject.lower()} lead to?",
                    answer=answer,
                    fact_type="definition",
                    source=sentence,
                    section=heading,
                    subject=subject,
                    priority=3,
                )
                continue

            definition_match = re.match(
                r"^(?P<subject>[A-Z][A-Za-z0-9()' /#\-]{1,70}?)\s+(?:is|are|was|were|means|refers to|can be defined as)\s+(?P<answer>[^.!?]{5,120})[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if definition_match:
                subject = _clean_phrase(definition_match.group("subject"))
                answer = _clean_phrase(definition_match.group("answer"))
                if _looks_like_term(subject) and 4 <= len(answer.split()) <= 24:
                    _add_fact(
                        facts,
                        question=f"What {_singular_or_plural_be(subject)} {subject.lower()}?",
                        answer=answer,
                        fact_type="definition",
                        source=sentence,
                        section=heading,
                        subject=subject,
                        priority=2,
                    )
                    continue

            role_match = re.match(
                r"^(?P<subject>[A-Z][A-Za-z0-9()' /#\-]{1,70}?)\s+(?P<verb>break down|breaks down|help|helps|support|supports|protect|protects)\s+(?P<answer>[^.!?]{4,100})[.!?]?$",
                sentence,
                re.IGNORECASE,
            )
            if role_match:
                subject = _clean_phrase(role_match.group("subject"))
                verb = _clean_phrase(role_match.group("verb"))
                answer = _clean_phrase(role_match.group("answer"))
                _add_fact(
                    facts,
                    question=f"What is the role of {subject.lower()}?",
                    answer=f"They {verb} {answer}",
                    fact_type="definition",
                    source=sentence,
                    section=heading,
                    subject=subject,
                    priority=2,
                )

        if heading != "General" and section["keywords"]:
            for keyword in section["keywords"][:2]:
                if keyword == heading_lower:
                    continue
                _add_fact(
                    facts,
                    question=f"Which topic is most closely associated with {keyword}?",
                    answer=heading,
                    fact_type="heading",
                    source=section["text"],
                    section=heading,
                    subject=keyword,
                    priority=1,
                )

    return facts


def _dedupe_facts(facts: list[dict]) -> list[dict]:
    seen = set()
    unique = []
    for fact in facts:
        key = (_safe_lower(fact["question"]), _safe_lower(fact["answer"]))
        if key in seen:
            continue
        seen.add(key)
        unique.append(fact)
    return unique


def _number_distractors(answer: str) -> list[str]:
    try:
        value = int(answer.replace(",", ""))
    except ValueError:
        return []

    if value <= 20:
        candidates = [max(1, value - 2), max(1, value - 1), value + 1, value + 2]
    elif value < 1000:
        candidates = [max(1, value // 2), int(value * 1.5), value * 2, max(1, value // 5)]
    else:
        candidates = [max(1, value // 10), max(1, value // 2), value * 2, value * 10]

    return [f"{candidate:,}" for candidate in candidates if candidate != value]


def _answer_shape(answer: str) -> str:
    answer = _clean_phrase(answer)
    if re.fullmatch(r"\d[\d,]*", answer):
        return "number"
    if answer.lower().startswith(("they ", "it ", "he ", "she ")) or len(answer.split()) >= 6:
        return "definition"
    if any(token in answer.lower() for token in (" britain", " city", " memory", " atmosphere", " nucleus", "function")):
        return "location"
    if answer[:1].isupper() and len(answer.split()) <= 4:
        return "proper_term"
    return "term"


def _shape_matches(candidate: str, shape: str) -> bool:
    candidate_shape = _answer_shape(candidate)
    if shape == "location":
        return candidate_shape in {"location", "definition"}
    if shape == "proper_term":
        return candidate_shape in {"proper_term", "term"}
    if shape == "term":
        return candidate_shape in {"term", "proper_term"}
    return candidate_shape == shape


def _definition_overlap(candidate: str, answer: str) -> bool:
    candidate_words = {word for word in re.findall(r"[a-zA-Z]{3,}", candidate.lower()) if word not in STOPWORDS}
    answer_words = {word for word in re.findall(r"[a-zA-Z]{3,}", answer.lower()) if word not in STOPWORDS}
    if not candidate_words or not answer_words:
        return False
    return len(candidate_words & answer_words) >= max(1, min(len(answer_words), 2))


def _section_lookup(sections: list[dict]) -> dict[str, dict]:
    return {section["heading"]: section for section in sections}


def _is_fragment_of_longer_term(candidate: str, sections: list[dict]) -> bool:
    lowered = _safe_lower(candidate)
    if len(lowered.split()) != 1:
        return False

    for section in sections:
        for term in section.get("terms", []):
            term_lower = _safe_lower(term)
            if term_lower != lowered and re.search(rf"\b{re.escape(lowered)}\b", term_lower):
                return True
    return False


def _is_fragment_of_longer_answer(candidate: str, facts: list[dict]) -> bool:
    lowered = _safe_lower(candidate)
    if len(lowered.split()) != 1:
        return False

    for fact in facts:
        answer_lower = _safe_lower(fact["answer"])
        if answer_lower != lowered and re.search(rf"\b{re.escape(lowered)}\b", answer_lower):
            return True
    return False


def _question_family(question: str) -> str:
    lowered = _safe_lower(question)
    if lowered.startswith("what is the role of"):
        return "role"
    if lowered.startswith("what is ") or lowered.startswith("what are "):
        return "definition"
    if lowered.startswith("where "):
        return "location"
    if lowered.startswith("who "):
        return "person"
    if lowered.startswith("in what year"):
        return "year"
    if lowered.startswith("about how many times"):
        return "quantity"
    if lowered.startswith("what does ") or lowered.startswith("what do "):
        return "function"
    return "general"


def _parallel_fact_answers(facts: list[dict], fact: dict) -> list[str]:
    family = _question_family(fact["question"])
    parallel = []

    for other in facts:
        if other["section"] != fact["section"]:
            continue
        if _safe_lower(other["answer"]) == _safe_lower(fact["answer"]):
            continue
        if fact["subject"] and _safe_lower(other["subject"]) == _safe_lower(fact["subject"]):
            continue

        other_family = _question_family(other["question"])
        if other["type"] == fact["type"] and other_family == family:
            parallel.append(other["answer"])

    if parallel:
        return parallel

    for other in facts:
        if other["section"] != fact["section"]:
            continue
        if other["type"] != fact["type"]:
            continue
        if _safe_lower(other["answer"]) == _safe_lower(fact["answer"]):
            continue
        if fact["subject"] and _safe_lower(other["subject"]) == _safe_lower(fact["subject"]):
            continue
        parallel.append(other["answer"])

    return parallel


def _answer_pool(facts: list[dict], fact: dict, sections: list[dict]) -> list[str]:
    if fact["type"] == "number":
        return _number_distractors(fact["answer"])

    section_map = _section_lookup(sections)
    section = section_map.get(fact["section"], {})
    answer_shape = _answer_shape(fact["answer"])

    section_matches = _parallel_fact_answers(facts, fact)
    global_matches = [
        other["answer"]
        for other in facts
        if other["type"] == fact["type"] and _safe_lower(other["answer"]) != _safe_lower(fact["answer"])
    ]

    pool = section_matches + global_matches

    if fact["type"] == "term":
        pool.extend(section.get("terms", []))
        pool.extend(section.get("keywords", []))
        for other_section in sections:
            if other_section["heading"] == fact["section"]:
                continue
            pool.extend(other_section.get("terms", [])[:4])
        pool.extend(GENERIC_DISTRACTORS["term"])
    elif fact["type"] == "location":
        pool.extend(section.get("locations", []))
        for other_section in sections:
            if other_section["heading"] == fact["section"]:
                continue
            pool.extend(other_section.get("locations", [])[:3])
        pool.extend(GENERIC_DISTRACTORS["location"])
    else:
        if not section_matches:
            pool.extend(section.get("definitions", []))
        pool.extend(GENERIC_DISTRACTORS["definition"])

    cleaned = []
    for item in pool:
        candidate = _clean_phrase(item)
        if not candidate or _safe_lower(candidate) == _safe_lower(fact["answer"]):
            continue
        if fact["subject"] and _safe_lower(candidate) == _safe_lower(fact["subject"]):
            continue
        if _safe_lower(candidate) in _safe_lower(fact["answer"]) or _safe_lower(fact["answer"]) in _safe_lower(candidate):
            continue
        if _is_fragment_of_longer_term(candidate, sections):
            continue
        if _is_fragment_of_longer_answer(candidate, facts):
            continue
        if not _shape_matches(candidate, answer_shape):
            continue
        if answer_shape == "definition" and _definition_overlap(candidate, fact["answer"]):
            continue
        if candidate not in cleaned:
            cleaned.append(candidate)
    return cleaned


def _format_options(answer: str, distractors: list[str], seed: str) -> tuple[list[str], int] | None:
    options = [_title_if_short(answer)]
    for distractor in distractors:
        formatted = _title_if_short(distractor)
        if formatted and formatted not in options:
            options.append(formatted)
        if len(options) == 4:
            break

    if len(options) < 4:
        return None

    rng = random.Random(seed.lower())
    correct = options[0]
    rng.shuffle(options)
    return options, options.index(correct)


def _score_fact(fact: dict, section_order: dict[str, int], used_sections: set[str]) -> tuple[int, int, int, int]:
    return (
        1 if fact["section"] not in used_sections else 0,
        fact["priority"],
        -section_order.get(fact["section"], 999),
        len(fact["source"]),
    )


def _build_quiz_items(text: str) -> list[dict]:
    normalized = _normalize_text(text)
    if len(normalized) < 80:
        raise AIServiceError("Please provide more study material so a useful quiz can be generated.")

    sections = _build_sections(normalized)
    facts = _dedupe_facts(_extract_facts_from_sections(sections))
    if not facts:
        raise AIServiceError("The notes could be read, but they did not contain enough clear facts to generate quiz questions.")

    section_order = {section["heading"]: index for index, section in enumerate(sections)}
    questions = []
    used_sections = set()
    used_questions = set()

    for _ in range(MAX_QUESTIONS):
        remaining = [fact for fact in facts if fact["question"] not in used_questions]
        if not remaining:
            break

        fact = max(remaining, key=lambda item: _score_fact(item, section_order, used_sections))
        distractors = _answer_pool(facts, fact, sections)
        built = _format_options(fact["answer"], distractors, fact["question"])
        used_questions.add(fact["question"])
        if not built:
            continue

        options, answer_index = built
        questions.append(
            {
                "question": fact["question"],
                "options": options,
                "answer": answer_index,
            }
        )
        used_sections.add(fact["section"])

    if len(questions) < 3:
        keywords = _extract_keywords(normalized)
        sentences = _split_sentences(normalized)
        for keyword in keywords[:12]:
            sentence = next(
                (item for item in sentences if re.search(rf"\b{re.escape(keyword)}\b", item, re.IGNORECASE)),
                None,
            )
            if not sentence:
                continue
            prompt = re.sub(rf"\b{re.escape(keyword)}\b", "____", sentence, count=1, flags=re.IGNORECASE)
            built = _format_options(keyword, [item for item in keywords if item != keyword], prompt)
            if not built:
                continue
            options, answer_index = built
            questions.append(
                {
                    "question": f"Which term best completes this study fact?\n\n{prompt}",
                    "options": options,
                    "answer": answer_index,
                }
            )
            if len(questions) >= MAX_QUESTIONS:
                break

    if not questions:
        raise AIServiceError("The notes could be read, but the generator could not build enough strong multiple-choice questions.")

    return questions[:MAX_QUESTIONS]


def generate_quiz(text: str, is_premium: bool = False) -> str:
    del is_premium
    return json.dumps(_build_quiz_items(text))


def generate_flashcards(text: str, is_premium: bool = False) -> str:
    del is_premium

    normalized = _normalize_text(text)
    sections = _build_sections(normalized)
    facts = _dedupe_facts(_extract_facts_from_sections(sections))

    cards = []
    for fact in facts:
        cards.append({"front": fact["question"], "back": fact["answer"]})
        if len(cards) >= MAX_FLASHCARDS:
            break

    if not cards:
        for section in sections:
            for term, definition in _extract_definition_pairs(section):
                cards.append({"front": term, "back": definition})
                if len(cards) >= MAX_FLASHCARDS:
                    break
            if len(cards) >= MAX_FLASHCARDS:
                break

    if not cards:
        raise AIServiceError("The notes could be read, but they did not contain enough content to generate flashcards.")

    return json.dumps(cards)
