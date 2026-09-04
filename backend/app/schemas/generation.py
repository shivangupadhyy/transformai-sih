from datetime import datetime
from typing import Any, Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class SourceClaim(BaseModel):
    claim: str = Field(..., max_length=300)
    source_evidence: str = Field(..., max_length=500)


class ExecutiveSummaryContent(BaseModel):
    title: str = Field(..., max_length=120)
    summary: str = Field(..., max_length=1600)
    key_points: list[str] = Field(..., min_length=3, max_length=6)
    recommended_actions: list[str] = Field(..., min_length=2, max_length=5)
    source_claims: list[SourceClaim] = Field(..., min_length=1, max_length=8)


class AdvisoryContent(BaseModel):
    title: str = Field(..., max_length=140)
    issued_date: str = Field(..., max_length=80)
    audience: str = Field(..., max_length=160)
    situation: str = Field(..., max_length=1400)
    impact: str = Field(..., max_length=900)
    actions: list[str] = Field(..., min_length=3, max_length=8)
    reporting_guidance: str = Field(..., max_length=700)
    source_claims: list[SourceClaim] = Field(..., min_length=1, max_length=8)


class LinkedInPostContent(BaseModel):
    headline: str = Field(..., max_length=180)
    body: str = Field(..., min_length=100, max_length=2800)
    hashtags: list[str] = Field(..., min_length=3, max_length=6)
    call_to_action: str = Field(..., max_length=220)
    source_claims: list[SourceClaim] = Field(..., min_length=1, max_length=8)


class VideoScene(BaseModel):
    scene_number: int = Field(..., ge=1, le=8)
    duration_seconds: int = Field(..., ge=3, le=30)
    visual: str = Field(..., max_length=350)
    narration: str = Field(..., max_length=350)


class VideoPackageContent(BaseModel):
    title: str = Field(..., max_length=120)
    duration_seconds: int = Field(..., ge=30, le=120)
    creative_concept: str = Field(..., max_length=500)
    scenes: list[VideoScene] = Field(..., min_length=4, max_length=8)
    narration: str = Field(..., max_length=2800)
    subtitles: list[str] = Field(..., min_length=4, max_length=16)
    visual_recommendations: list[str] = Field(..., min_length=3, max_length=8)
    source_claims: list[SourceClaim] = Field(..., min_length=1, max_length=8)


class GenerationRequest(BaseModel):
    output_types: list[Literal["executive_summary", "advisory", "linkedin_post", "video_package"]] = Field(
        default=["executive_summary", "advisory", "linkedin_post", "video_package"],
        min_length=1,
    )
    audience: str = Field(default="Government and security stakeholders", min_length=2, max_length=120)
    tone: str = Field(default="Clear and authoritative", min_length=2, max_length=80)
    objective: str = Field(default="Inform and prompt action", min_length=2, max_length=120)
    detail_level: Literal["concise", "standard", "detailed"] = "standard"
    language: str = Field(default="English", min_length=2, max_length=50)


class GenerationVersionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    generation_id: str
    content: dict[str, Any]
    version_number: int
    created_at: datetime


class GenerationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    output_type: str
    content: dict[str, Any]
    model: str
    status: str
    created_at: datetime
    updated_at: datetime | None = None
    versions: list[GenerationVersionRead] = []


class GenerationUpdate(BaseModel):
    content: dict[str, Any]
