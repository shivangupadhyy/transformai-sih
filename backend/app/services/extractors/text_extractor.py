import re


def extract_text(raw_text: str) -> str:
    """Normalize and clean plain text input."""
    if not raw_text or not raw_text.strip():
        raise ValueError("Provided text is empty.")

    # Normalize line breaks and tabs
    cleaned = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse 3+ consecutive newlines into 2
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()
