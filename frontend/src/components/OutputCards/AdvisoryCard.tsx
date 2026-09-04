import { useState } from "react";
import type { Advisory, Generation } from "../../types/project";
import { ClaimGroundingPanel } from "./ClaimGroundingPanel";

interface AdvisoryCardProps {
  generation: Generation;
  sourceText?: string | null;
  onSaveContent: (generationId: string, updatedContent: Advisory) => Promise<void>;
  onRegenerate: (generationId: string) => Promise<void>;
  isRegenerating: boolean;
}

export function AdvisoryCard({
  generation,
  sourceText,
  onSaveContent,
  onRegenerate,
  isRegenerating,
}: AdvisoryCardProps) {
  const content = generation.content as Advisory;
  const [isEditing, setIsEditing] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editable fields
  const [editTitle, setEditTitle] = useState(content.title || "");
  const [editIssuedDate, setEditIssuedDate] = useState(content.issued_date || "");
  const [editAudience, setEditAudience] = useState(content.audience || "");
  const [editSituation, setEditSituation] = useState(content.situation || "");
  const [editImpact, setEditImpact] = useState(content.impact || "");
  const [editActions, setEditActions] = useState((content.actions || []).join("\n"));
  const [editReporting, setEditReporting] = useState(content.reporting_guidance || "");

  const handleCopy = () => {
    const md = `# ${content.title}\n\n**Issued Date:** ${content.issued_date} | **Audience:** ${content.audience}\n\n### Situation\n${content.situation}\n\n### Impact Assessment\n${content.impact}\n\n### Mandated Actions\n${content.actions
      .map((a) => `1. ${a}`)
      .join("\n")}\n\n### Reporting Guidance\n${content.reporting_guidance}`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    const updated: Advisory = {
      ...content,
      title: editTitle,
      issued_date: editIssuedDate,
      audience: editAudience,
      situation: editSituation,
      impact: editImpact,
      actions: editActions.split("\n").filter((a) => a.trim().length > 0),
      reporting_guidance: editReporting,
    };
    await onSaveContent(generation.id, updated);
    setIsEditing(false);
  };

  return (
    <div className="artefact-card advisory-card">
      <div className="card-top-bar">
        <div className="card-badge-group">
          <span className="artefact-type-badge advisory-badge">🚨 Structured Advisory</span>
          {generation.versions && generation.versions.length > 0 && (
            <span className="version-badge">v{generation.versions.length + 1}</span>
          )}
        </div>

        <div className="card-actions-group">
          <button
            type="button"
            className="action-btn"
            onClick={() => setShowGrounding(!showGrounding)}
          >
            🛡️ {showGrounding ? "Hide Grounding" : "View Claims"}
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            ✏️ {isEditing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={() => onRegenerate(generation.id)}
            disabled={isRegenerating}
          >
            🔄 {isRegenerating ? "Regenerating..." : "Regenerate"}
          </button>
          <button
            type="button"
            className={`action-btn copy-btn ${copied ? "copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? "✓ Copied!" : "📋 Copy Markdown"}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="inline-editor-form">
          <div className="editor-field">
            <label>Advisory Title</label>
            <input
              type="text"
              className="text-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
          <div className="editor-row">
            <div className="editor-field">
              <label>Issued Date</label>
              <input
                type="text"
                className="text-input"
                value={editIssuedDate}
                onChange={(e) => setEditIssuedDate(e.target.value)}
              />
            </div>
            <div className="editor-field">
              <label>Audience</label>
              <input
                type="text"
                className="text-input"
                value={editAudience}
                onChange={(e) => setEditAudience(e.target.value)}
              />
            </div>
          </div>
          <div className="editor-field">
            <label>Situation Assessment</label>
            <textarea
              className="textarea-input"
              rows={4}
              value={editSituation}
              onChange={(e) => setEditSituation(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>Impact Analysis</label>
            <textarea
              className="textarea-input"
              rows={3}
              value={editImpact}
              onChange={(e) => setEditImpact(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>Mandated Actions (one per line)</label>
            <textarea
              className="textarea-input"
              rows={4}
              value={editActions}
              onChange={(e) => setEditActions(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>Reporting Guidance</label>
            <textarea
              className="textarea-input"
              rows={3}
              value={editReporting}
              onChange={(e) => setEditReporting(e.target.value)}
            />
          </div>
          <div className="editor-actions">
            <button type="button" className="secondary-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="button" className="primary-btn" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="card-main-content">
          <div className="advisory-meta-banner">
            <div>
              <span className="meta-label">ISSUED:</span>
              <span className="meta-val">{content.issued_date || "Operational Cycle"}</span>
            </div>
            <div>
              <span className="meta-label">TARGET AUDIENCE:</span>
              <span className="meta-val">{content.audience}</span>
            </div>
          </div>

          <h2 className="artefact-title advisory-title">{content.title}</h2>

          <div className="advisory-block situation-block">
            <h4>⚠️ 1. Situation Analysis</h4>
            <p>{content.situation}</p>
          </div>

          <div className="advisory-block impact-block">
            <h4>💥 2. Operational Impact</h4>
            <p>{content.impact}</p>
          </div>

          <div className="advisory-block actions-block">
            <h4>🛡️ 3. Mandated Mitigation Actions</h4>
            <ol className="mandated-actions-list">
              {content.actions?.map((action, idx) => (
                <li key={idx}>
                  <strong>Action 0{idx + 1}:</strong> {action}
                </li>
              ))}
            </ol>
          </div>

          <div className="advisory-block reporting-block">
            <h4>📡 4. Incident Reporting & Escalation</h4>
            <p>{content.reporting_guidance}</p>
          </div>
        </div>
      )}

      {showGrounding && (
        <ClaimGroundingPanel claims={content.source_claims || []} sourceText={sourceText} />
      )}
    </div>
  );
}
