import type { OperatorProfile } from "../types/project";

export const OPERATOR_PROFILES: OperatorProfile[] = [
  {
    id: "gov-analyst",
    name: "Government / Defence Analyst",
    badge: "Intelligence & Policy",
    description: "Prioritizes structured advisory directives, mission threats, and verified security claims.",
    defaultAudience: "Executive leadership and operational defense units",
    defaultTone: "Clear, authoritative, and objective",
    defaultObjective: "Deliver situational awareness and mandate rapid mitigations",
    defaultDetailLevel: "detailed",
    defaultOutputs: ["advisory", "executive_summary", "video_package"],
  },
  {
    id: "comms-officer",
    name: "Communications Officer",
    badge: "Strategic Comms",
    description: "Balances executive clarity with broad stakeholder engagement and media readiness.",
    defaultAudience: "Key industry partners, staff, and public stakeholders",
    defaultTone: "Strategic, transparent, and action-oriented",
    defaultObjective: "Align stakeholders and highlight strategic milestones",
    defaultDetailLevel: "standard",
    defaultOutputs: ["executive_summary", "linkedin_post", "video_package"],
  },
  {
    id: "corporate-pr",
    name: "Corporate PR & Brand Team",
    badge: "Reputation & Market",
    description: "Tailors high-impact executive summaries and viral professional posts.",
    defaultAudience: "Investors, enterprise clients, and industry press",
    defaultTone: "Engaging, visionary, and credible",
    defaultObjective: "Reinforce brand credibility and drive industry conversation",
    defaultDetailLevel: "standard",
    defaultOutputs: ["executive_summary", "linkedin_post", "advisory", "video_package"],
  },
  {
    id: "content-creator",
    name: "General Content Creator",
    badge: "Media & Production",
    description: "Transforms dense reports into multi-scene video packages and social hooks.",
    defaultAudience: "Tech enthusiasts, subscribers, and community members",
    defaultTone: "Conversational, captivating, and insightful",
    defaultObjective: "Educate viewers and spark dynamic audience discussions",
    defaultDetailLevel: "concise",
    defaultOutputs: ["video_package", "linkedin_post", "executive_summary"],
  },
];

interface OperatorProfilesProps {
  selectedProfileId: string;
  onSelectProfile: (profile: OperatorProfile) => void;
}

export function OperatorProfiles({ selectedProfileId, onSelectProfile }: OperatorProfilesProps) {
  return (
    <div className="operator-profiles-container">
      <div className="operator-header">
        <div className="operator-icon" aria-hidden="true">⚡</div>
        <div>
          <h3>Operator Persona Preset</h3>
          <p>Select your operational profile to automatically preconfigure tone, audience, and output formats.</p>
        </div>
      </div>
      <div className="operator-cards-grid">
        {OPERATOR_PROFILES.map((profile) => {
          const isSelected = profile.id === selectedProfileId;
          return (
            <button
              key={profile.id}
              type="button"
              className={`operator-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectProfile(profile)}
            >
              <div className="operator-card-top">
                <span className="operator-badge">{profile.badge}</span>
                {isSelected && <span className="active-dot" title="Active profile">● Active</span>}
              </div>
              <h4 className="operator-name">{profile.name}</h4>
              <p className="operator-desc">{profile.description}</p>
              <div className="operator-footer-meta">
                <span>{profile.defaultOutputs.length} Default Formats</span>
                <span>{profile.defaultDetailLevel.toUpperCase()}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
