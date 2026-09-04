import { useState } from "react";
import type { Generation, VideoPackage } from "../../types/project";

import { ClaimGroundingPanel } from "./ClaimGroundingPanel";

interface VideoPackageCardProps {
  generation: Generation;
  sourceText?: string | null;
  onSaveContent: (generationId: string, updatedContent: VideoPackage) => Promise<void>;
  onRegenerate: (generationId: string) => Promise<void>;
  isRegenerating: boolean;
}

export function VideoPackageCard({
  generation,
  sourceText,
  onSaveContent,
  onRegenerate,
  isRegenerating,
}: VideoPackageCardProps) {
  const content = generation.content as VideoPackage;
  const [isEditing, setIsEditing] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSceneTab, setActiveSceneTab] = useState(0);

  // Edit fields
  const [editTitle, setEditTitle] = useState(content.title || "");
  const [editConcept, setEditConcept] = useState(content.creative_concept || "");
  const [editDuration, setEditDuration] = useState(content.duration_seconds || 60);
  const [editNarration, setEditNarration] = useState(content.narration || "");
  const [editSubtitles, setEditSubtitles] = useState((content.subtitles || []).join("\n"));
  const [editVisualRecs, setEditVisualRecs] = useState((content.visual_recommendations || []).join("\n"));

  const handleCopy = () => {
    const scenesText = (content.scenes || [])
      .map(
        (s) =>
          `### Scene ${s.scene_number} (${s.duration_seconds}s)\n**Visual:** ${s.visual}\n**Voiceover / Narration:** ${s.narration}`
      )
      .join("\n\n");

    const md = `# Video Production Package: ${content.title}\n\n**Duration:** ${content.duration_seconds}s\n**Creative Concept:** ${content.creative_concept}\n\n## Storyboard\n${scenesText}\n\n## Visual Guidelines\n${(content.visual_recommendations || []).map((r) => `- ${r}`).join("\n")}`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    const updated: VideoPackage = {
      ...content,
      title: editTitle,
      creative_concept: editConcept,
      duration_seconds: Number(editDuration),
      narration: editNarration,
      subtitles: editSubtitles.split("\n").filter((s) => s.trim().length > 0),
      visual_recommendations: editVisualRecs.split("\n").filter((r) => r.trim().length > 0),
    };
    await onSaveContent(generation.id, updated);
    setIsEditing(false);
  };

  const scenes = content.scenes || [];
  const currentScene = scenes[activeSceneTab] || scenes[0];

  return (
    <div className="artefact-card video-package-card">
      <div className="card-top-bar">
        <div className="card-badge-group">
          <span className="artefact-type-badge video-badge">🎬 Video Production Package</span>
          <span className="duration-pill">⏱️ {content.duration_seconds || 50}s Total Duration</span>
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
            {copied ? "✓ Copied Storyboard!" : "📋 Copy Storyboard"}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="inline-editor-form">
          <div className="editor-row">
            <div className="editor-field" style={{ flex: 3 }}>
              <label>Package Title</label>
              <input
                type="text"
                className="text-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="editor-field" style={{ flex: 1 }}>
              <label>Duration (Seconds)</label>
              <input
                type="number"
                className="text-input"
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="editor-field">
            <label>Creative Concept & Style Direction</label>
            <textarea
              className="textarea-input"
              rows={3}
              value={editConcept}
              onChange={(e) => setEditConcept(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>Master Narration Script</label>
            <textarea
              className="textarea-input"
              rows={4}
              value={editNarration}
              onChange={(e) => setEditNarration(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>On-Screen Subtitles (one line per title)</label>
            <textarea
              className="textarea-input"
              rows={3}
              value={editSubtitles}
              onChange={(e) => setEditSubtitles(e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label>Visual & Motion Recommendations (one per line)</label>
            <textarea
              className="textarea-input"
              rows={3}
              value={editVisualRecs}
              onChange={(e) => setEditVisualRecs(e.target.value)}
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
          <h2 className="artefact-title">{content.title}</h2>
          <div className="concept-callout">
            <strong>🎨 Creative Concept:</strong> {content.creative_concept}
          </div>

          {/* Interactive Storyboard Scene Navigator */}
          <div className="storyboard-timeline-section">
            <div className="timeline-header">
              <h4>🎬 Scene-by-Scene Storyboard ({scenes.length} Scenes)</h4>
              <span className="timeline-hint">Click a scene to inspect visual directions & narration</span>
            </div>

            <div className="scene-tabs-bar">
              {scenes.map((scene, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`scene-tab-btn ${activeSceneTab === idx ? "active" : ""}`}
                  onClick={() => setActiveSceneTab(idx)}
                >
                  <span className="scene-tab-num">Scene {scene.scene_number}</span>
                  <span className="scene-tab-sec">{scene.duration_seconds}s</span>
                </button>
              ))}
            </div>

            {currentScene && (
              <div className="active-scene-card">
                <div className="scene-banner">
                  <span className="scene-number-tag">SCENE {currentScene.scene_number} OF {scenes.length}</span>
                  <span className="scene-duration-tag">⏱️ {currentScene.duration_seconds} Seconds</span>
                </div>
                <div className="scene-content-split">
                  <div className="scene-visual-pane">
                    <h5>🎥 Visual Recommendation & Animation</h5>
                    <p>{currentScene.visual}</p>
                  </div>
                  <div className="scene-narration-pane">
                    <h5>🎙️ Voiceover / Narration Script</h5>
                    <p className="voiceover-text">"{currentScene.narration}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subtitles & Visual Directives */}
          <div className="production-directives-grid">
            <div className="directive-column">
              <h4>💬 On-Screen Closed Captions</h4>
              <ul className="subtitles-list">
                {content.subtitles?.map((sub, idx) => (
                  <li key={idx} className="subtitle-pill">
                    <span className="sub-idx">{idx + 1}</span> {sub}
                  </li>
                ))}
              </ul>
            </div>

            <div className="directive-column">
              <h4>✨ Production Guidelines</h4>
              <ul className="visual-recs-list">
                {content.visual_recommendations?.map((rec, idx) => (
                  <li key={idx}>
                    <span className="rec-bullet">◆</span> {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {showGrounding && (
        <ClaimGroundingPanel claims={content.source_claims || []} sourceText={sourceText} />
      )}
    </div>
  );
}
