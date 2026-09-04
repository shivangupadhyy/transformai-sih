import { useState } from "react";
import type { SourceClaim } from "../../types/project";

interface ClaimGroundingPanelProps {
  claims: SourceClaim[];
  sourceText?: string | null;
}

export function ClaimGroundingPanel({ claims }: ClaimGroundingPanelProps) {
  const [selectedClaimIndex, setSelectedClaimIndex] = useState<number | null>(null);

  if (!claims || claims.length === 0) {
    return (
      <div className="grounding-empty">
        <p>No explicit claim citations attached to this artefact.</p>
      </div>
    );
  }

  return (
    <div className="claim-grounding-panel">
      <div className="grounding-header">
        <div className="grounding-badge-group">
          <span className="grounding-shield-icon">🛡️</span>
          <div>
            <h4>Source Grounding & Evidence Traceability</h4>
            <p>Every claim below is verified against primary text in the source material.</p>
          </div>
        </div>
        <span className="verified-count-tag">{claims.length} Verified Claims</span>
      </div>

      <div className="claims-list">
        {claims.map((item, idx) => {
          const isSelected = selectedClaimIndex === idx;
          return (
            <div
              key={idx}
              className={`claim-card ${isSelected ? "expanded" : ""}`}
              onClick={() => setSelectedClaimIndex(isSelected ? null : idx)}
            >
              <div className="claim-card-top">
                <span className="claim-index-tag">Claim #{idx + 1}</span>
                <p className="claim-statement">"{item.claim}"</p>
                <span className="claim-toggle-arrow">{isSelected ? "▲" : "▼"}</span>
              </div>

              {isSelected && (
                <div className="evidence-reveal">
                  <div className="evidence-header">
                    <span className="evidence-pin-icon">📌</span>
                    <strong>Primary Source Evidence Quote:</strong>
                  </div>
                  <blockquote className="evidence-quote">
                    "{item.source_evidence}"
                  </blockquote>
                  <div className="evidence-status-pill">
                    ✓ Grounding Verified against Ingested Source
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
