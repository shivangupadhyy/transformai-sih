import { useState } from "react";
import type { Project } from "../types/project";
import { exportProject } from "../lib/api";

interface ExportModalProps {
  project: Project;
  onClose: () => void;
}

export function ExportModal({ project, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<"markdown" | "json">("markdown");
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState<string>("");

  const loadPreview = async (selectedFormat: "markdown" | "json") => {
    setIsExporting(true);
    setFormat(selectedFormat);
    try {
      const data = await exportProject(project.id, selectedFormat);
      setExportData(typeof data === "string" ? data : JSON.stringify(data, null, 2));
    } catch {
      setExportData("Failed to generate export preview.");
    } finally {
      setIsExporting(false);
    }
  };

  // Load preview on mount
  useState(() => {
    loadPreview("markdown");
  });

  const handleDownload = () => {
    const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.${
      format === "json" ? "json" : "md"
    }`;
    const mimeType = format === "json" ? "application/json" : "text/markdown";
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h3>📦 Export Publication Package</h3>
            <p>Export all generated artefacts, source claims, and metadata for "{project.title}"</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="export-format-selector">
          <button
            type="button"
            className={`format-tab-btn ${format === "markdown" ? "active" : ""}`}
            onClick={() => loadPreview("markdown")}
          >
            📝 Markdown Document (.md)
          </button>
          <button
            type="button"
            className={`format-tab-btn ${format === "json" ? "active" : ""}`}
            onClick={() => loadPreview("json")}
          >
            🏷️ Structured JSON (.json)
          </button>
        </div>

        <div className="export-preview-area">
          {isExporting ? (
            <div className="export-loading">Generating publication bundle…</div>
          ) : (
            <pre className="export-code-block">{exportData}</pre>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-btn" onClick={handlePrint}>
            🖨️ Print / Save as PDF
          </button>
          <div className="modal-footer-right">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Close
            </button>
            <button type="button" className="primary-btn" onClick={handleDownload}>
              ⬇️ Download {format.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
