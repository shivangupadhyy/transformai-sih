from app.schemas.generation import GenerationRequest
from app.services.ai_generator import generate_artefact


def test_generator_all_formats():
    source_sample = (
        "Project Vanguard is an enterprise cybersecurity modernization program. "
        "The primary vulnerability stems from legacy perimeter controls that lack zero-trust verification. "
        "Immediate recommendations include deploying mandatory multi-factor authentication and isolating mission assets."
    )
    req = GenerationRequest(
        output_types=["executive_summary", "advisory", "linkedin_post", "video_package"],
        audience="Government and Security Officers",
        tone="Clear and Authoritative",
        objective="Inform and prompt urgent mitigation",
        detail_level="standard",
        language="English",
    )

    # Executive summary
    exec_summary = generate_artefact("executive_summary", source_sample, req, "Cybersecurity Overhaul")
    assert "title" in exec_summary
    assert "summary" in exec_summary
    assert len(exec_summary["key_points"]) >= 3
    assert len(exec_summary["source_claims"]) >= 1

    # Advisory
    advisory = generate_artefact("advisory", source_sample, req, "Cybersecurity Overhaul")
    assert "title" in advisory
    assert "situation" in advisory
    assert len(advisory["actions"]) >= 3

    # LinkedIn post
    linkedin = generate_artefact("linkedin_post", source_sample, req, "Cybersecurity Overhaul")
    assert "headline" in linkedin
    assert "body" in linkedin
    assert len(linkedin["hashtags"]) >= 3

    # Video package
    video = generate_artefact("video_package", source_sample, req, "Cybersecurity Overhaul")
    assert "creative_concept" in video
    assert len(video["scenes"]) >= 4
    assert video["scenes"][0]["scene_number"] == 1
