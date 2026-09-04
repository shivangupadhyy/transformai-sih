from fastapi.testclient import TestClient
from app.core.database import Base, engine
from app.main import app


def test_project_workflow():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as client:
        # 1. Create project
        create_res = client.post(
            "/api/projects",
            json={
                "title": "Quantum Communications Initiative",
                "source_type": "text",
                "source_text": "Quantum key distribution guarantees unbreakable communication channels for national security networks.",
                "settings": {"audience": "Defence Leadership"},
            },
            headers={"Authorization": "Bearer demo-session-token"},
        )
        assert create_res.status_code == 201
        project_data = create_res.json()
        project_id = project_data["id"]

        # 2. List projects
        list_res = client.get("/api/projects", headers={"Authorization": "Bearer demo-session-token"})
        assert list_res.status_code == 200
        assert any(p["id"] == project_id for p in list_res.json())

        # 3. Generate artefacts
        gen_res = client.post(
            f"/api/projects/{project_id}/generate",
            json={
                "output_types": ["executive_summary", "linkedin_post"],
                "audience": "Security Leaders",
                "tone": "Authoritative",
                "objective": "Brief leadership",
                "detail_level": "standard",
                "language": "English",
            },
            headers={"Authorization": "Bearer demo-session-token"},
        )
        assert gen_res.status_code == 200
        generations = gen_res.json()
        assert len(generations) == 2

        # 4. Export project to markdown
        export_res = client.get(
            f"/api/projects/{project_id}/export?format=markdown",
            headers={"Authorization": "Bearer demo-session-token"},
        )
        assert export_res.status_code == 200
        assert "TransformAI Publication Package" in export_res.text
