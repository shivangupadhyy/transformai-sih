import type { GenerationRequest, OutputType } from "../types/project";

interface GenerationSettingsProps {
  settings: GenerationRequest;
  onSettingsChange: (settings: GenerationRequest) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

const ALL_OUTPUT_TYPES: { id: OutputType; label: string; icon: string; desc: string }[] = [
  {
    id: "executive_summary",
    label: "Executive Summary",
    icon: "📑",
    desc: "Key findings, strategic synthesis, and recommended leadership actions.",
  },
  {
    id: "advisory",
    label: "Structured Advisory",
    icon: "🚨",
    desc: "Formal situation, impact analysis, urgent mitigation directives, and reporting.",
  },
  {
    id: "linkedin_post",
    label: "LinkedIn Post",
    icon: "💼",
    desc: "Engaging headline, formatted insights, hashtags, and call-to-action.",
  },
  {
    id: "video_package",
    label: "Video Package",
    icon: "🎬",
    desc: "Scene-by-scene storyboard, narration script, subtitles, and visual cues.",
  },
];

export function GenerationSettings({
  settings,
  onSettingsChange,
  onGenerate,
  isGenerating,
  canGenerate,
}: GenerationSettingsProps) {
  const toggleOutputType = (type: OutputType) => {
    const current = settings.output_types;
    if (current.includes(type)) {
      if (current.length === 1) return; // Keep at least one
      onSettingsChange({
        ...settings,
        output_types: current.filter((t) => t !== type),
      });
    } else {
      onSettingsChange({
        ...settings,
        output_types: [...current, type],
      });
    }
  };

  return (
    <div className="generation-settings-card">
      <div className="settings-header">
        <div className="title-with-pill">
          <span className="step-pill">Step 2</span>
          <h3>Transformation Parameters</h3>
        </div>
        <span className="ai-model-tag">⚡ OpenAI Responses API + Structured Contracts</span>
      </div>

      <div className="settings-grid">
        {/* Output Types Selection */}
        <div className="settings-section full-width">
          <label className="section-label">Select Output Artefacts to Produce</label>
          <div className="output-types-selection-grid">
            {ALL_OUTPUT_TYPES.map((item) => {
              const isChecked = settings.output_types.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`output-type-option ${isChecked ? "active" : ""}`}
                  onClick={() => toggleOutputType(item.id)}
                >
                  <div className="option-top">
                    <span className="option-icon">{item.icon}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOutputType(item.id)}
                      className="option-checkbox"
                    />
                  </div>
                  <strong className="option-title">{item.label}</strong>
                  <p className="option-desc">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audience */}
        <div className="setting-field">
          <label htmlFor="setting-audience">Target Audience</label>
          <input
            id="setting-audience"
            type="text"
            className="text-input"
            value={settings.audience}
            onChange={(e) => onSettingsChange({ ...settings, audience: e.target.value })}
            placeholder="e.g. Government leaders, C-suite executives, Public stakeholders"
          />
        </div>

        {/* Tone */}
        <div className="setting-field">
          <label htmlFor="setting-tone">Tone & Register</label>
          <input
            id="setting-tone"
            type="text"
            className="text-input"
            value={settings.tone}
            onChange={(e) => onSettingsChange({ ...settings, tone: e.target.value })}
            placeholder="e.g. Clear and authoritative, Visionary, Urgent"
          />
        </div>

        {/* Objective */}
        <div className="setting-field">
          <label htmlFor="setting-objective">Communication Objective</label>
          <input
            id="setting-objective"
            type="text"
            className="text-input"
            value={settings.objective}
            onChange={(e) => onSettingsChange({ ...settings, objective: e.target.value })}
            placeholder="e.g. Inform and prompt action, Strategic briefing"
          />
        </div>

        {/* Detail Level */}
        <div className="setting-field">
          <label htmlFor="setting-detail">Detail Level</label>
          <select
            id="setting-detail"
            className="select-input"
            value={settings.detail_level}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                detail_level: e.target.value as "concise" | "standard" | "detailed",
              })
            }
          >
            <option value="concise">Concise (High-level bulleted summary)</option>
            <option value="standard">Standard (Comprehensive briefing)</option>
            <option value="detailed">Detailed (Deep analytical breakdown)</option>
          </select>
        </div>
      </div>

      {/* Generation CTA Button */}
      <div className="generate-cta-bar">
        <div className="cta-meta">
          <span>{settings.output_types.length} artefact(s) selected</span>
          <span className="traceability-tag">✓ Strict Grounding Enforcement</span>
        </div>
        <button
          type="button"
          className="generate-large-btn"
          disabled={!canGenerate || isGenerating}
          onClick={onGenerate}
        >
          {isGenerating ? (
            <>
              <span className="spinner-icon" aria-hidden="true">⏳</span>
              Transforming Source Artefacts…
            </>
          ) : (
            <>
              <span>✨ Transform & Generate {settings.output_types.length} Artefacts</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
