export type SourceType = "text" | "pdf" | "docx" | "document" | "image" | "url" | "video";


export type OutputType = "executive_summary" | "advisory" | "linkedin_post" | "video_package";

export interface SourceClaim {
  claim: string;
  source_evidence: string;
}

export interface ExecutiveSummary {
  title: string;
  summary: string;
  key_points: string[];
  recommended_actions: string[];
  source_claims: SourceClaim[];
}

export interface Advisory {
  title: string;
  issued_date: string;
  audience: string;
  situation: string;
  impact: string;
  actions: string[];
  reporting_guidance: string;
  source_claims: SourceClaim[];
}

export interface LinkedInPost {
  headline: string;
  body: string;
  hashtags: string[];
  call_to_action: string;
  source_claims: SourceClaim[];
}

export interface VideoScene {
  scene_number: number;
  duration_seconds: number;
  visual: string;
  narration: string;
}

export interface VideoPackage {
  title: string;
  duration_seconds: number;
  creative_concept: string;
  scenes: VideoScene[];
  narration: string;
  subtitles: string[];
  visual_recommendations: string[];
  source_claims: SourceClaim[];
}

export interface GenerationVersion {
  id: string;
  generation_id: string;
  content: any;
  version_number: number;
  created_at: string;
}

export interface Generation {
  id: string;
  project_id: string;
  output_type: OutputType;
  content: any;
  model: string;
  status: "ready" | "generating" | "failed";
  created_at: string;
  updated_at?: string;
  versions?: GenerationVersion[];
}

export interface SourceAsset {
  id: string;
  project_id: string;
  filename: string;
  mime_type: string;
  storage_path?: string;
  extracted_text?: string;
  extraction_status: "pending" | "completed" | "failed";
  created_at: string;
}

export interface GenerationRequest {
  output_types: OutputType[];
  audience: string;
  tone: string;
  objective: string;
  detail_level: "concise" | "standard" | "detailed";
  language: string;
}

export interface Project {
  id: string;
  title: string;
  source_type: SourceType;
  source_text?: string | null;
  settings: Record<string, any>;
  status: "draft" | "extracting" | "ready" | "generating" | "completed" | "failed";
  created_at: string;
  updated_at: string | null;
  assets?: SourceAsset[];
  generations?: Generation[];
}

export interface OperatorProfile {
  id: string;
  name: string;
  badge: string;
  description: string;
  defaultAudience: string;
  defaultTone: string;
  defaultObjective: string;
  defaultDetailLevel: "concise" | "standard" | "detailed";
  defaultOutputs: OutputType[];
}
