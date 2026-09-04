import pytest
from app.services.extractors import (
    extract_text,
    extract_docx,
    extract_pdf,
    extract_url,
    extract_image,
    extract_video,
)


def test_extract_text_normalizes():
    sample = "  Line 1\r\n\r\n\r\nLine 2\r\n  "
    extracted = extract_text(sample)
    assert extracted == "Line 1\n\nLine 2"


def test_extract_text_empty_raises():
    with pytest.raises(ValueError):
        extract_text("   ")


def test_extract_url_blocks_private_ip():
    with pytest.raises(ValueError, match="prohibited"):
        extract_url("http://127.0.0.1:8000/secret")


def test_extract_image_fallback():
    dummy_bytes = b"fake_png_binary_data"
    result = extract_image(dummy_bytes, "image/png", "chart.png")
    assert "chart.png" in result
    assert "Visual Artifact" in result


def test_extract_video_size_limit():
    large_video = b"0" * (51 * 1024 * 1024)
    with pytest.raises(ValueError, match="exceeds maximum"):
        extract_video(large_video, "large.mp4")
