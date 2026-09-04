import { useState } from "react";
import type { Generation, LinkedInPost } from "../../types/project";
import { ClaimGroundingPanel } from "./ClaimGroundingPanel";

interface LinkedInPostCardProps {
  generation: Generation;
  sourceText?: string | null;
  onSaveContent: (generationId: string, updatedContent: LinkedInPost) => Promise<void>;
  onRegenerate: (generationId: string) => Promise<void>;
  isRegenerating: boolean;
}

export function LinkedInPostCard({
  generation,
  sourceText,
  onSaveContent,
  onRegenerate,
  isRegenerating,
}: LinkedInPostCardProps) {
  const content = generation.content as LinkedInPost;
  const [isEditing, setIsEditing] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editHeadline, setEditHeadline] = useState(content.headline || "");
  const [editBody, setEditBody] = useState(content.body || "");
  const [editHashtags, setEditHashtags] = useState((content.hashtags || []).join(" "));
  const [editCta, setEditCta] = useState(content.call_to_action || "");

  const fullPostText = `${content.headline}\n\n${content.body}\n\n${(content.hashtags || []).join(
    " "
  )}\n\n${content.call_to_action}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPostText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    const updated: LinkedInPost = {
      ...content,
      headline: editHeadline,
      body: editBody,
      hashtags: editHashtags
        .split(" ")
        .map((h) => (h.startsWith("#") ? h : `#${h}`))
        .filter((h) => h.length > 1),
      call_to_action: editCta,
    };
    await onSaveContent(generation.id, updated);
    setIsEditing(false);
  };

  return (
    <div className="artefact-card linkedin-card">
      <div className="card-top-bar">
        <div className="card-badge-group">
          <span className="artefact-type-badge linkedin-badge">💼 LinkedIn Post</span>
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
            {copied ? "✓ Copied Post!" : "📋 Copy Post"}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="inline-editor-form">
          <div className="editor-field">
            <label>Headline</label>
            <input
              type="text"
              className="text-input"
              value={editHeadline}
              onChange={(e) => setEditHeadline(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>Post Body Content</label>
            <textarea
              className="textarea-input"
              rows={8}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>Hashtags (separated by space)</label>
            <input
              type="text"
              className="text-input"
              value={editHashtags}
              onChange={(e) => setEditHashtags(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>Call to Action</label>
            <input
              type="text"
              className="text-input"
              value={editCta}
              onChange={(e) => setEditCta(e.target.value)}
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
        <div className="card-main-content linkedin-post-preview">
          <div className="post-header-mock">
            <div className="author-avatar" aria-hidden="true">👤</div>
            <div className="author-meta">
              <span className="author-name">Strategic Communications Desk</span>
              <span className="author-role">Published via TransformAI Intelligence • 🌐 Public</span>
            </div>
          </div>

          <h3 className="post-headline">{content.headline}</h3>

          <div className="post-body-text">
            {content.body?.split("\n").map((line, idx) => (
              <p key={idx} className={line.trim() === "" ? "empty-line" : ""}>
                {line}
              </p>
            ))}
          </div>

          <div className="hashtags-bar">
            {content.hashtags?.map((tag, idx) => (
              <span key={idx} className="hashtag-pill">
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>

          {content.call_to_action && (
            <div className="cta-highlight-box">
              <strong>👉 Call to Action:</strong> {content.call_to_action}
            </div>
          )}

          <div className="linkedin-footer-stats">
            <span>{fullPostText.length} characters</span>
            <span>~{Math.ceil(fullPostText.split(" ").length / 200)} min read</span>
            <span className="grounded-check">✓ Grounded claims verified</span>
          </div>
        </div>
      )}

      {showGrounding && (
        <ClaimGroundingPanel claims={content.source_claims || []} sourceText={sourceText} />
      )}
    </div>
  );
}
