import io
from docx import Document


def extract_docx(docx_bytes: bytes) -> str:
    """Extract text from a DOCX file, preserving headings, paragraphs, and tables."""
    if not docx_bytes:
        raise ValueError("Uploaded DOCX file is empty.")

    try:
        doc = Document(io.BytesIO(docx_bytes))
        sections: list[str] = []

        # Extract paragraphs
        for p in doc.paragraphs:
            text = p.text.strip()
            if text:
                sections.append(text)

        # Extract tables
        for table in doc.tables:
            table_rows: list[str] = []
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if cells:
                    table_rows.append(" | ".join(cells))
            if table_rows:
                sections.append("\n".join(table_rows))

        extracted = "\n\n".join(sections).strip()
        if not extracted:
            raise ValueError("No text content found in DOCX document.")
        return extracted
    except Exception as exc:
        if isinstance(exc, ValueError):
            raise
        raise ValueError(f"Failed to extract DOCX content: {str(exc)}") from exc
