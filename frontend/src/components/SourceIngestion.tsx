import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import type { SourceType } from "../types/project";

const SAMPLE_SOURCES = [
  {
    label: "🛡️ Cyber Infrastructure Threat Bulletin",
    type: "text" as SourceType,
    title: "Critical Infrastructure Threat Advisory: Active Zero-Day in Industrial Gateway Routers",
    text: `URGENT OPERATIONAL BULLETIN - CYBER DEFENSE DIRECTIVE

SUMMARY:
A state-sponsored advanced persistent threat (APT) actor has been observed exploiting an unpatched vulnerability in core industrial edge routers. The exploit allows unauthenticated remote code execution (RCE) on supervisory control and data acquisition (SCADA) network interfaces.

OBSERVED IMPACT:
Telemetry from critical utility networks across three regions indicates active lateral movement attempts following gateway compromise. In two water treatment facilities, anomalous firmware modifications were detected and isolated prior to operational disruption.

MANDATED MITIGATIONS:
1. Immediately isolate administrative management web ports (TCP 8443 and 9443) from public internet routing.
2. Apply emergency ingress access control list rules and enforce hardware MFA on all remote engineering portals.
3. Review firewall egress logs for outbound beacons connecting to IP ranges associated with command-and-control infrastructure.
4. Report any anomalous certificate installations or configuration revisions to the National Cybersecurity Operations Center within 4 hours.`,
  },
  {
    label: "⚡ Clean Fusion Energy Breakthrough",
    type: "text" as SourceType,
    title: "Global Clean Energy Consortium Announces Net Energy Gain in Commercial Stellarator",
    text: `FOR IMMEDIATE RELEASE - GLOBAL CLEAN ENERGY CONSORTIUM

Geneva — International energy researchers have achieved a sustained net energy gain of Q=1.45 in a continuous stellarator plasma chamber over a 30-minute operational window. The milestone demonstrates the viability of magnetic confinement fusion as a baseload zero-carbon power source.

KEY ADVANCEMENTS:
- High-temperature superconducting (HTS) magnet arrays sustained a 12-Tesla toroidal field with 40% lower refrigeration overhead than previous designs.
- Liquid metal divertor components successfully absorbed continuous thermal flux exceeding 15 MW/m² without surface degradation.
- Tritium breeding ratio in surrounding ceramic blankets reached 1.12, ensuring fuel cycle self-sufficiency.

NEXT STEPS FOR INDUSTRY:
The consortium is opening commercial licensing for private utility partners to construct modular 300 MW demonstration power plants by 2030. Regional grid operators are invited to participate in the upcoming Grid Integration Symposium.`,
  },
  {
    label: "📜 AI Governance & Compliance Framework",
    type: "text" as SourceType,
    title: "Executive Strategic Framework on Enterprise Generative AI Risk Management",
    text: `STRATEGIC POLICY MEMORANDUM: ENTERPRISE AI GOVERNANCE

To: Senior Leadership & Department Heads
Subject: Mandatory Compliance Controls for High-Risk Generative Models

1. EXECUTIVE DIRECTIVE:
All departmental implementations of autonomous generative systems that process sensitive proprietary data or generate public-facing communication must comply with the Tier-1 Governance Protocols effective immediately.

2. CORE RISK CONTROLS:
- Traceability & Source Grounding: Every AI-generated claim, executive summary, or public advisory must maintain bidirectional evidence links to verifiable primary source documents.
- Data Privacy Safeguards: Customer records and confidential intelligence documents must never be submitted to external unvetted model APIs.
- Human Oversight: Final sign-off from an authorized communications officer or domain analyst is strictly required before publication.

3. REPORTING REQUIREMENTS:
Department managers must conduct quarterly model risk audits and submit compliance attestations to the Risk & Compliance Committee.`,
  },
];

interface SourceIngestionProps {
  sourceType: SourceType;
  onSourceTypeChange: (type: SourceType) => void;
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  onFileUpload: (file: File) => Promise<void>;
  onUrlExtract: (url: string) => Promise<void>;
  onSampleSelect: (title: string, text: string, type: SourceType) => void;
  isProcessing: boolean;
  uploadedFileName?: string;
}

export function SourceIngestion({
  sourceType,
  onSourceTypeChange,
  sourceText,
  onSourceTextChange,
  onFileUpload,
  onUrlExtract,
  onSampleSelect,
  isProcessing,
  uploadedFileName,
}: SourceIngestionProps) {
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await onFileUpload(file);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await onFileUpload(file);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    await onUrlExtract(urlInput.trim());
  };

  return (
    <div className="source-ingestion-card">
      <div className="ingestion-header">
        <div className="title-with-pill">
          <span className="step-pill">Step 1</span>
          <h3>Source Material Ingestion</h3>
        </div>
        <div className="sample-picker-group">
          <span className="sample-label">⚡ Load Quick Sample:</span>
          <div className="sample-buttons">
            {SAMPLE_SOURCES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="sample-badge-btn"
                onClick={() => onSampleSelect(sample.title, sample.text, sample.type)}
                title="Populate with realistic verification source"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="source-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={sourceType === "text"}
          className={`source-tab ${sourceType === "text" ? "active" : ""}`}
          onClick={() => onSourceTypeChange("text")}
        >
          📝 Pasted Text
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sourceType === "pdf"}
          className={`source-tab ${sourceType === "pdf" ? "active" : ""}`}
          onClick={() => onSourceTypeChange("pdf")}
        >
          📄 PDF Doc
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sourceType === "docx"}
          className={`source-tab ${sourceType === "docx" ? "active" : ""}`}
          onClick={() => onSourceTypeChange("docx")}
        >
          📑 Word (DOCX)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sourceType === "image"}
          className={`source-tab ${sourceType === "image" ? "active" : ""}`}
          onClick={() => onSourceTypeChange("image")}
        >
          🖼️ Image / Vision
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sourceType === "url"}
          className={`source-tab ${sourceType === "url" ? "active" : ""}`}
          onClick={() => onSourceTypeChange("url")}
        >
          🌐 Public URL
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sourceType === "video"}
          className={`source-tab ${sourceType === "video" ? "active" : ""}`}
          onClick={() => onSourceTypeChange("video")}
        >
          🎬 MP4 Video
        </button>
      </div>

      {/* Main Input Area */}
      <div className="ingestion-body">
        {sourceType === "text" && (
          <div className="text-mode-container">
            <textarea
              className="source-textarea"
              placeholder="Paste raw briefings, intelligence reports, articles, or transcripts here..."
              rows={9}
              value={sourceText}
              onChange={(e) => onSourceTextChange(e.target.value)}
            />
            <div className="textarea-footer">
              <span className="char-counter">{sourceText.length} characters</span>
              <span className="grounding-note">🔒 Source is isolated and grounded for traceable citations</span>
            </div>
          </div>
        )}

        {(sourceType === "pdf" || sourceType === "docx" || sourceType === "image" || sourceType === "video") && (
          <div
            className={`file-dropzone ${isDragging ? "dragging" : ""} ${uploadedFileName ? "has-file" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              accept={
                sourceType === "pdf"
                  ? ".pdf,application/pdf"
                  : sourceType === "docx"
                  ? ".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  : sourceType === "image"
                  ? "image/*,.png,.jpg,.jpeg,.webp"
                  : "video/mp4,video/*,.mp4,.mov"
              }
              onChange={handleFileChange}
            />

            <div className="dropzone-inner">
              <div className="dropzone-icon">
                {sourceType === "pdf"
                  ? "📄"
                  : sourceType === "docx"
                  ? "📑"
                  : sourceType === "image"
                  ? "🖼️"
                  : "🎬"}
              </div>
              {uploadedFileName ? (
                <div className="uploaded-file-details">
                  <h4>Uploaded File: {uploadedFileName}</h4>
                  <p className="file-ready-text">✓ Extracted and ready for transformation</p>
                  <button type="button" className="secondary-btn small-btn">
                    Choose Another File
                  </button>
                </div>
              ) : (
                <div className="dropzone-prompt">
                  <h4>
                    Drag and drop your {sourceType.toUpperCase()} file here, or <span className="highlight-text">browse</span>
                  </h4>
                  <p className="dropzone-limits">
                    {sourceType === "video"
                      ? "MP4/MOV files up to 50 MB (extracts audio transcript & sampled keyframes)"
                      : "PDF, DOCX, PNG, JPG, or WEBP up to 25 MB"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {sourceType === "url" && (
          <div className="url-mode-container">
            <form onSubmit={handleUrlSubmit} className="url-input-form">
              <input
                type="url"
                className="url-input"
                placeholder="https://example.com/news/article-to-analyze"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
              />
              <button
                type="submit"
                className="primary-btn"
                disabled={isProcessing || !urlInput.trim()}
              >
                {isProcessing ? "Fetching Article..." : "Fetch & Extract"}
              </button>
            </form>
            <p className="url-security-note">
              🛡️ Safe Article Fetcher includes SSRF network protection against internal addresses.
            </p>
          </div>
        )}

        {/* Source Text Preview if extracted from file/url */}
        {sourceType !== "text" && sourceText && (
          <div className="extracted-preview-box">
            <div className="preview-box-header">
              <span className="preview-label">Extracted Source Text Preview</span>
              <span className="preview-count">{sourceText.length} characters</span>
            </div>
            <div className="preview-box-content">{sourceText}</div>
          </div>
        )}
      </div>
    </div>
  );
}
