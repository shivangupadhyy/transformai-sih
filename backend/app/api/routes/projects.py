from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user_id
from app.core.database import get_db
from app.models.project import Generation, Project, SourceAsset
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate, SourceAssetRead
from app.services.extractors import (
    extract_docx,
    extract_image,
    extract_pdf,
    extract_text,
    extract_url,
    extract_video,
)

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
def list_projects(
    current_user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> list[Project]:
    statement = (
        select(Project)
        .where(Project.owner_id == str(current_user_id))
        .options(
            selectinload(Project.assets),
            selectinload(Project.generations).selectinload(Generation.versions),
        )
        .order_by(desc(Project.updated_at))
    )
    return list(db.scalars(statement).all())


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    current_user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> Project:
    project = Project(
        owner_id=str(current_user_id),
        title=payload.title,
        source_type=payload.source_type,
        source_text=payload.source_text,
        settings=payload.settings,
        status="draft",
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: str,
    current_user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> Project:
    statement = (
        select(Project)
        .where(Project.id == project_id, Project.owner_id == str(current_user_id))
        .options(
            selectinload(Project.assets),
            selectinload(Project.generations).selectinload(Generation.versions),
        )
    )
    project = db.scalar(statement)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    current_user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> Project:
    project = db.scalar(
        select(Project).where(Project.id == project_id, Project.owner_id == str(current_user_id))
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if payload.title is not None:
        project.title = payload.title
    if payload.source_text is not None:
        project.source_text = payload.source_text
    if payload.settings is not None:
        project.settings = payload.settings
    if payload.status is not None:
        project.status = payload.status

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    current_user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    project = db.scalar(
        select(Project).where(Project.id == project_id, Project.owner_id == str(current_user_id))
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db.delete(project)
    db.commit()


@router.post("/{project_id}/assets", response_model=SourceAssetRead)
async def upload_asset(
    project_id: str,
    current_user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...),
) -> SourceAsset:
    project = db.scalar(
        select(Project).where(Project.id == project_id, Project.owner_id == str(current_user_id))
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    content_bytes = await file.read()
    filename = file.filename or "uploaded_file"
    mime_type = file.content_type or "application/octet-stream"

    extracted_text = ""
    try:
        if filename.lower().endswith(".pdf") or "pdf" in mime_type:
            extracted_text = extract_pdf(content_bytes)
        elif filename.lower().endswith((".docx", ".doc")) or "wordprocessing" in mime_type:
            extracted_text = extract_docx(content_bytes)
        elif filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp")) or "image" in mime_type:
            extracted_text = extract_image(content_bytes, mime_type, filename)
        elif filename.lower().endswith((".mp4", ".mov", ".m4a", ".mp3")) or "video" in mime_type:
            extracted_text = extract_video(content_bytes, filename)
        else:
            extracted_text = extract_text(content_bytes.decode("utf-8", errors="replace"))

        extraction_status = "completed"
    except Exception as exc:
        extracted_text = f"Extraction error: {str(exc)}"
        extraction_status = "failed"

    asset = SourceAsset(
        project_id=project.id,
        filename=filename,
        mime_type=mime_type,
        extracted_text=extracted_text,
        extraction_status=extraction_status,
    )
    db.add(asset)

    # If project source_text is empty, populate it with the extracted text
    if extracted_text and extraction_status == "completed":
        project.source_text = extracted_text
        project.source_type = (
            "pdf" if filename.lower().endswith(".pdf")
            else "docx" if filename.lower().endswith(".docx")
            else "image" if "image" in mime_type
            else "video" if "video" in mime_type
            else "text"
        )

    db.commit()
    db.refresh(asset)
    return asset


@router.post("/{project_id}/extract")
def extract_source(
    project_id: str,
    payload: dict,
    current_user_id: Annotated[UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    project = db.scalar(
        select(Project).where(Project.id == project_id, Project.owner_id == str(current_user_id))
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    source_type = payload.get("source_type", "text")
    raw_input = payload.get("content", "")

    try:
        if source_type == "url":
            extracted = extract_url(raw_input)
        elif source_type == "text":
            extracted = extract_text(raw_input)
        else:
            extracted = raw_input.strip()

        project.source_text = extracted
        project.source_type = source_type
        db.commit()

        return {"status": "success", "extracted_text": extracted}
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
