import { useState } from "react";
import type { ExecutiveSummary, Generation } from "../../types/project";
import { ClaimGroundingPanel } from "./ClaimGroundingPanel";

interface ExecutiveSummaryCardProps {
  generation: Generation;
  sourceText?: string | null;
  onSaveContent: (generationId: string, updatedContent: ExecutiveSummary) => Promise<void>;
  onRegenerate: (generationId: string) => Promise<void>;
  isRegenerating: boolean;
}

export function ExecutiveSummaryCard({
  generation,
  sourceText,
  onSaveContent,
  onRegenerate,
  isRegenerating,
}: ExecutiveSummaryCardProps) {
  const content = generation.content as ExecutiveSummary;
  const [isEditing, setIsEditing] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editable local state
  const [editTitle, setEditTitle] = useState(content.title || "");
  const [editSummary, setEditSummary] = useState(content.summary || "");
  const [editKeyPoints, setEditKeyPoints] = useState((content.key_points || []).join("\n"));
  const [editActions, setEditActions] = useState((content.recommended_actions || []).join("\n"));

  const handleCopy = () => {
    const md = `# ${content.title}\n\n${content.summary}\n\n### Key Findings\n${content.key_points
      .map((k) => `- ${k}`)
      .join("\n")}\n\n### Recommended Actions\n${content.recommended_actions
      .map((a) => `- ${a}`)
      .join("\n")}`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    const updated: ExecutiveSummary = {
      ...content,
      title: editTitle,
      summary: editSummary,
      key_points: editKeyPoints.split("\n").filter((k) => k.trim().length > 0),
      recommended_actions: editActions.split("\n").filter((a) => a.trim().length > 0),
    };
    await onSaveContent(generation.id, updated);
    setIsEditing(false);
  };

  return (
    <div className="artefact-card executive-summary-card">
      {/* Top action bar */}
      <div className="card-top-bar">
        <div className="card-badge-group">
          <span className="artefact-type-badge">📑 Executive Summary</span>
          {generation.versions && generation.versions.length > 0 && (
            <span className="version-badge">v{generation.versions.length + 1}</span>
          )}
        </div>

        <div className="card-actions-group">
          <button
            type="button"
            className="action-btn"
            onClick={() => setShowGrounding(!showGrounding)}
            title="Inspect claim citations"
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

      {/* Editing Mode */}
      {isEditing ? (
        <div className="inline-editor-form">
          <div className="editor-field">
            <label>Title</label>
            <input
              type="text"
              className="text-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>Executive Synthesis / Summary</label>
            <textarea
              className="textarea-input"
              rows={5}
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>Key Points (one per line)</label>
            <textarea
              className="textarea-input"
              rows={4}
              value={editKeyPoints}
              onChange={(e) => setEditKeyPoints(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>Recommended Actions (one per line)</label>
            <textarea
              className="textarea-input"
              rows={4}
              value={editActions}
              onChange={(e) => setEditActions(e.target.value)}
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
        /* Display Mode */
        <div className="card-main-content">
          <h2 className="artefact-title">{content.title}</h2>
          <p className="summary-paragraph">{content.summary}</p>

          <div className="points-section">
            <h4 className="section-subtitle">🎯 Key Strategic Findings</h4>
            <div className="key-points-grid">
              {content.key_points?.map((point, index) => (
                <div key={index} className="key-point-item">
                  <span className="point-bullet">0{index + 1}</span>
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="actions-section">
            <h4 className="section-subtitle">⚡ Recommended Actions</h4>
            <ul className="actions-checklist">
              {content.recommended_actions?.map((action, index) => (
                <li key={index} className="checklist-item">
                  <span className="check-icon">✓</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Claim Grounding Drawer */}
      {showGrounding && (
        <ClaimGroundingPanel claims={content.source_claims || []} sourceText={sourceText} />
      )}
    </div>
  );
}
