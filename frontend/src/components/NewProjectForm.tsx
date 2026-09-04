import { useState, type FormEvent } from "react";
import type { SourceType } from "../types/project";

interface NewProjectFormProps { isSaving: boolean; onCreate: (title: string, sourceType: SourceType) => Promise<void>; }
const sourceTypes: { value: SourceType; label: string }[] = [
  { value: "text", label: "Pasted text" }, { value: "document", label: "PDF or DOCX" }, { value: "image", label: "Image" }, { value: "url", label: "Article URL" }, { value: "video", label: "Short video" }
];

export function NewProjectForm({ isSaving, onCreate }: NewProjectFormProps) {
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("text");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!title.trim()) return; await onCreate(title.trim(), sourceType); setTitle(""); setSourceType("text"); }
  return (
    <form className="new-project" onSubmit={submit}>
      <div><p className="eyebrow">Start here</p><h2>New transformation</h2><p className="muted">Create a project now. Source upload and AI generation arrive in the next phase.</p></div>
      <label>Project title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Phishing Defence Advisory" maxLength={140} /></label>
      <label>Planned source<select value={sourceType} onChange={(event) => setSourceType(event.target.value as SourceType)}>{sourceTypes.map((source) => <option key={source.value} value={source.value}>{source.label}</option>)}</select></label>
      <button className="primary-button" type="submit" disabled={isSaving || !title.trim()}>{isSaving ? "Creating project…" : "Create project"}</button>
    </form>
  );
}
