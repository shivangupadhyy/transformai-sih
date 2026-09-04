import io
from pypdf import PdfReader


def extract_pdf(pdf_bytes: bytes) -> str:
    """Extract text from a PDF file using pypdf."""
    if not pdf_bytes:
        raise ValueError("Uploaded PDF file is empty.")

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages_text: list[str] = []
        for index, page in enumerate(reader.pages):
            page_content = page.extract_text() or ""
            if page_content.strip():
                pages_text.append(f"--- [Page {index + 1}] ---\n{page_content.strip()}")

        extracted = "\n\n".join(pages_text).strip()
        if not extracted:
            raise ValueError("No readable text found in PDF (may be scanned or empty).")
        return extracted
    except Exception as exc:
        if isinstance(exc, ValueError):
            raise
        raise ValueError(f"Failed to extract PDF content: {str(exc)}") from exc
