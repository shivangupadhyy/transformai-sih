from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.generation import GenerationRead


class SourceAssetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    filename: str
    mime_type: str
    storage_path: str | None = None
    extracted_text: str | None = None
    extraction_status: str
    created_at: datetime


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=140)
    source_type: str = Field(default="text", max_length=32)
    source_text: str | None = None
    settings: dict[str, Any] = Field(default_factory=dict)


class ProjectUpdate(BaseModel):
    title: str | None = None
    source_text: str | None = None
    settings: dict[str, Any] | None = None
    status: str | None = None


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    source_type: str
    source_text: str | None = None
    settings: dict[str, Any] = Field(default_factory=dict)
    status: str
    created_at: datetime
    updated_at: datetime | None = None
    assets: list[SourceAssetRead] = []
    generations: list[GenerationRead] = []
