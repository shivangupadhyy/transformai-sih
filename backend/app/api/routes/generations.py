from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user_id
from app.core.database import get_db
from app.models.project import Generation, GenerationVersion, Project
from app.schemas.generation import (
    GenerationRead,
    GenerationRequest,
    GenerationUpdate,
    GenerationVersionRead,
)
from app.services.ai_generator import generate_artefact

router = APIRouter(tags=["generations"])


@router.post("/api/projects/{project_id}/generate", response_model=list[GenerationRead])
def generate_project_outputs(
    project_id: str,
    payload: GenerationRequest,
    current_user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> list[Generation]:
    project = db.scalar(
        select(Project).where(Project.id == project_id, Project.owner_id == str(current_user_id))
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if not project.source_text or not project.source_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project source text is empty. Please provide source material before generating.",
        )

    # Save generation settings into project
    project.settings = payload.model_dump()
    project.status = "generating"
    db.commit()

    generated_records: list[Generation] = []

    for output_type in payload.output_types:
        # Check if generation for this output_type already exists
        existing_gen = db.scalar(
            select(Generation).where(
                Generation.project_id == project.id, Generation.output_type == output_type
            )
        )

        content = generate_artefact(
            output_type=output_type,
            source_text=project.source_text,
            request=payload,
            project_title=project.title,
        )

        if existing_gen:
            # Update existing generation and add a new version
            version_num = len(existing_gen.versions) + 1
            version = GenerationVersion(
                generation_id=existing_gen.id,
                content=existing_gen.content,
                version_number=version_num,
            )
            db.add(version)

            existing_gen.content = content
            existing_gen.status = "ready"
            generated_records.append(existing_gen)
        else:
            new_gen = Generation(
                project_id=project.id,
                output_type=output_type,
                content=content,
                status="ready",
            )
            db.add(new_gen)
            generated_records.append(new_gen)

    project.status = "completed"
    db.commit()

    for gen in generated_records:
        db.refresh(gen)

    return generated_records


@router.post("/api/generations/{generation_id}/regenerate", response_model=GenerationRead)
def regenerate_single_output(
    generation_id: str,
    payload: GenerationRequest,
    current_user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> Generation:
    statement = (
        select(Generation)
        .join(Project)
        .where(Generation.id == generation_id, Project.owner_id == str(current_user_id))
        .options(selectinload(Generation.versions))
    )
    generation = db.scalar(statement)
    if not generation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")

    project = generation.project
    if not project.source_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project has no source text")

    # Archive previous version
    version_num = len(generation.versions) + 1
    version = GenerationVersion(
        generation_id=generation.id,
        content=generation.content,
        version_number=version_num,
    )
    db.add(version)

    # Generate fresh content
    fresh_content = generate_artefact(
        output_type=generation.output_type,
        source_text=project.source_text,
        request=payload,
        project_title=project.title,
    )
    generation.content = fresh_content
    generation.status = "ready"

    db.commit()
    db.refresh(generation)
    return generation


@router.patch("/api/generations/{generation_id}", response_model=GenerationRead)
def update_generation_content(
    generation_id: str,
    payload: GenerationUpdate,
    current_user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> Generation:
    statement = (
        select(Generation)
        .join(Project)
        .where(Generation.id == generation_id, Project.owner_id == str(current_user_id))
        .options(selectinload(Generation.versions))
    )
    generation = db.scalar(statement)
    if not generation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")

    # Save previous version
    version_num = len(generation.versions) + 1
    version = GenerationVersion(
        generation_id=generation.id,
        content=generation.content,
        version_number=version_num,
    )
    db.add(version)

    generation.content = payload.content
    db.commit()
    db.refresh(generation)
    return generation


@router.get("/api/projects/{project_id}/export")
def export_project(
    project_id: str,
    current_user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    export_format: str = Query("markdown", alias="format"),
) -> Response:

    statement = (
        select(Project)
        .where(Project.id == project_id, Project.owner_id == str(current_user_id))
        .options(selectinload(Project.generations))
    )
    project = db.scalar(statement)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if export_format == "json":
        import json

        data = {
            "project_id": str(project.id),
            "title": project.title,
            "source_type": project.source_type,
            "source_text": project.source_text,
            "settings": project.settings,
            "created_at": project.created_at.isoformat() if project.created_at else None,
            "generations": [
                {
                    "output_type": g.output_type,
                    "content": g.content,
                    "updated_at": g.updated_at.isoformat() if g.updated_at else None,
                }
                for g in project.generations
            ],
        }
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{project.title}_export.json"'},
        )

    # Markdown export default
    lines = [
        f"# TransformAI Publication Package: {project.title}",
        f"\n**Source Type:** {project.source_type.upper()}",
        f"**Export Date:** {project.updated_at or project.created_at}",
        "\n---\n",
    ]

    for gen in project.generations:
        c = gen.content
        lines.append(f"## {gen.output_type.replace('_', ' ').title()}\n")
        if gen.output_type == "executive_summary":
            lines.append(f"### {c.get('title', '')}\n")
            lines.append(f"{c.get('summary', '')}\n")
            lines.append("#### Key Points:")
            for kp in c.get("key_points", []):
                lines.append(f"- {kp}")
            lines.append("\n#### Recommended Actions:")
            for ra in c.get("recommended_actions", []):
                lines.append(f"- {ra}")
        elif gen.output_type == "advisory":
            lines.append(f"### {c.get('title', '')}")
            lines.append(f"**Issued Date:** {c.get('issued_date', '')} | **Audience:** {c.get('audience', '')}\n")
            lines.append(f"**Situation:**\n{c.get('situation', '')}\n")
            lines.append(f"**Impact:**\n{c.get('impact', '')}\n")
            lines.append("#### Urgent Actions:")
            for act in c.get("actions", []):
                lines.append(f"- {act}")
            lines.append(f"\n**Reporting Guidance:**\n{c.get('reporting_guidance', '')}")
        elif gen.output_type == "linkedin_post":
            lines.append(f"**Headline:** {c.get('headline', '')}\n")
            lines.append(f"{c.get('body', '')}\n")
            lines.append(f"**Hashtags:** {' '.join(c.get('hashtags', []))}\n")
            lines.append(f"**Call to Action:** {c.get('call_to_action', '')}")
        elif gen.output_type == "video_package":
            lines.append(f"### {c.get('title', '')} ({c.get('duration_seconds', 0)}s)")
            lines.append(f"**Creative Concept:** {c.get('creative_concept', '')}\n")
            lines.append("#### Storyboard Scenes:")
            for sc in c.get("scenes", []):
                lines.append(f"- **Scene {sc.get('scene_number')}** ({sc.get('duration_seconds')}s):")
                lines.append(f"  - *Visual:* {sc.get('visual')}")
                lines.append(f"  - *Narration:* {sc.get('narration')}")
            lines.append("\n#### Visual Recommendations:")
            for vr in c.get("visual_recommendations", []):
                lines.append(f"- {vr}")

        lines.append("\n#### Traceable Source Claims:")
        for sc in c.get("source_claims", []):
            lines.append(f"- **Claim:** {sc.get('claim')}")
            lines.append(f"  - *Evidence Quote:* \"{sc.get('source_evidence')}\"")
        lines.append("\n---\n")

    return Response(
        content="\n".join(lines),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{project.title}_package.md"'},
    )
