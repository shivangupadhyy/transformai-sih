import { useEffect, useState } from "react";
import { Logo } from "../components/Logo";
import { OperatorProfiles, OPERATOR_PROFILES } from "../components/OperatorProfiles";
import { SourceIngestion } from "../components/SourceIngestion";
import { GenerationSettings } from "../components/GenerationSettings";
import { ExecutiveSummaryCard } from "../components/OutputCards/ExecutiveSummaryCard";
import { AdvisoryCard } from "../components/OutputCards/AdvisoryCard";
import { LinkedInPostCard } from "../components/OutputCards/LinkedInPostCard";
import { VideoPackageCard } from "../components/OutputCards/VideoPackageCard";
import { ExportModal } from "../components/ExportModal";
import {
  createProject,
  extractSource,
  generateProject,
  getProject,
  listProjects,
  regenerateOutput,
  updateGenerationContent,
  uploadAsset,
} from "../lib/api";
import { supabase } from "../lib/supabase";
import type {
  GenerationRequest,
  OperatorProfile,
  OutputType,
  Project,
  SourceType,
} from "../types/project";


interface DashboardPageProps {
  onSignOut?: () => void;
}

export function DashboardPage({ onSignOut }: DashboardPageProps) {

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<OperatorProfile>(OPERATOR_PROFILES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Project state
  const [projectTitle, setProjectTitle] = useState("Critical Infrastructure Threat Advisory");
  const [sourceType, setSourceType] = useState<SourceType>("text");
  const [sourceText, setSourceText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Generation settings
  const [settings, setSettings] = useState<GenerationRequest>({
    output_types: ["executive_summary", "advisory", "linkedin_post", "video_package"],
    audience: OPERATOR_PROFILES[0].defaultAudience,
    tone: OPERATOR_PROFILES[0].defaultTone,
    objective: OPERATOR_PROFILES[0].defaultObjective,
    detail_level: OPERATOR_PROFILES[0].defaultDetailLevel,
    language: "English",
  });

  // UI state
  const [activeTab, setActiveTab] = useState<OutputType>("executive_summary");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingSource, setIsProcessingSource] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Initial load
  useEffect(() => {
    loadProjects();
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await listProjects();
      setProjects(data);
      if (data.length > 0 && !activeProject) {
        // Load latest project
        const full = await getProject(data[0].id);
        setActiveProject(full);
        if (full.source_text) setSourceText(full.source_text);
        if (full.title) setProjectTitle(full.title);
        if (full.source_type) setSourceType(full.source_type);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load project history.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSelect = (profile: OperatorProfile) => {
    setSelectedProfile(profile);
    setSettings((prev) => ({
      ...prev,
      audience: profile.defaultAudience,
      tone: profile.defaultTone,
      objective: profile.defaultObjective,
      detail_level: profile.defaultDetailLevel,
      output_types: profile.defaultOutputs,
    }));
    setStatusMessage(`Applied ${profile.name} preset.`);
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleSampleSelect = (sampleTitle: string, sampleText: string, sampleType: SourceType) => {
    setProjectTitle(sampleTitle);
    setSourceText(sampleText);
    setSourceType(sampleType);
    setUploadedFileName("");
    setStatusMessage("Loaded verification sample source.");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessingSource(true);
    setErrorMessage("");
    setUploadedFileName(file.name);
    try {
      // Create project if none active
      let projId = activeProject?.id;
      if (!projId) {
        const created = await createProject(
          file.name.replace(/\.[^/.]+$/, ""),
          sourceType,
          "",
          settings
        );
        projId = created.id;
        setActiveProject(created);
        setProjects((prev) => [created, ...prev]);
      }

      const asset = await uploadAsset(projId, file);
      if (asset.extracted_text) {
        setSourceText(asset.extracted_text);
        setStatusMessage(`Successfully extracted content from ${file.name}`);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "File extraction failed.");
    } finally {
      setIsProcessingSource(false);
    }
  };

  const handleUrlExtract = async (url: string) => {
    setIsProcessingSource(true);
    setErrorMessage("");
    try {
      let projId = activeProject?.id;
      if (!projId) {
        const created = await createProject(`URL Source: ${url}`, "url", "", settings);
        projId = created.id;
        setActiveProject(created);
        setProjects((prev) => [created, ...prev]);
      }

      const res = await extractSource(projId, "url", url);
      setSourceText(res.extracted_text);
      setStatusMessage("Article fetched and extracted successfully.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to extract from URL.");
    } finally {
      setIsProcessingSource(false);
    }
  };

  const handleStartNewProject = () => {
    setActiveProject(null);
    setProjectTitle("Untitled Intelligence Transformation");
    setSourceText("");
    setUploadedFileName("");
    setStatusMessage("New project canvas initialized.");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleSelectProject = async (proj: Project) => {
    try {
      setIsLoading(true);
      const full = await getProject(proj.id);
      setActiveProject(full);
      setProjectTitle(full.title);
      setSourceType(full.source_type);
      setSourceText(full.source_text || "");
      if (full.generations && full.generations.length > 0) {
        setActiveTab(full.generations[0].output_type);
      }
    } catch (err) {
      setErrorMessage("Could not load project details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!sourceText.trim()) {
      setErrorMessage("Please ingest or paste source material first.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setStatusMessage("Transforming source via OpenAI Responses API into structured formats…");

    try {
      let currentProj = activeProject;
      if (!currentProj) {
        currentProj = await createProject(
          projectTitle.trim() || "Intelligence Transformation",
          sourceType,
          sourceText,
          settings
        );
        setActiveProject(currentProj);
        setProjects((prev) => [currentProj!, ...prev]);
      } else {
        // Ensure latest text is saved
        await createProject(projectTitle, sourceType, sourceText, settings);
      }

      const generations = await generateProject(currentProj.id, settings);
      const updatedProj: Project = {
        ...currentProj,
        source_text: sourceText,
        title: projectTitle,
        generations,
        status: "completed",
      };
      setActiveProject(updatedProj);
      if (generations.length > 0) {
        setActiveTab(generations[0].output_type);
      }
      setStatusMessage(`✨ Generated ${generations.length} grounded artefacts!`);
      await loadProjects();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = async (generationId: string, updatedContent: any) => {
    try {
      const updatedGen = await updateGenerationContent(generationId, updatedContent);
      if (activeProject && activeProject.generations) {
        const updatedGenerations = activeProject.generations.map((g) =>
          g.id === generationId ? updatedGen : g
        );
        setActiveProject({ ...activeProject, generations: updatedGenerations });
      }
      setStatusMessage("Saved updated version.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      setErrorMessage("Failed to save edited content.");
    }
  };

  const handleRegenerate = async (generationId: string) => {
    setRegeneratingId(generationId);
    setErrorMessage("");
    try {
      const updatedGen = await regenerateOutput(generationId, settings);
      if (activeProject && activeProject.generations) {
        const updatedGenerations = activeProject.generations.map((g) =>
          g.id === generationId ? updatedGen : g
        );
        setActiveProject({ ...activeProject, generations: updatedGenerations });
      }
      setStatusMessage("Artefact regenerated successfully.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      setErrorMessage("Regeneration failed.");
    } finally {
      setRegeneratingId(null);
    }
  };

  // Filter projects for search
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentGeneration = activeProject?.generations?.find((g) => g.output_type === activeTab);

  return (
    <div className={`app-root ${theme}`}>
      {/* Top Navigation Bar */}
      <header className="app-topbar">
        <div className="topbar-left">
          <Logo />
          <div className="active-persona-pill">
            <span className="persona-dot">●</span>
            <span>Profile: <strong>{selectedProfile.name}</strong></span>
          </div>
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
            type="button"
            className="new-project-top-btn"
            onClick={handleStartNewProject}
          >
            + New Project
          </button>

          <button
            type="button"
            className="sign-out-btn"
            onClick={() => {
              if (onSignOut) {
                onSignOut();
              } else {
                void supabase.auth.signOut();
              }
            }}
          >
            Sign Out
          </button>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="workspace-layout">
        {/* Left Sidebar: Project History & Search */}
        <aside className="projects-sidebar">
          <div className="sidebar-header">
            <h3>Saved Projects</h3>
            <span className="count-pill">{projects.length}</span>
          </div>

          <div className="search-box">
            <input
              type="search"
              placeholder="Search projects…"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="projects-history-list">
            {isLoading && projects.length === 0 ? (
              <p className="loading-state-text">Loading projects…</p>
            ) : filteredProjects.length === 0 ? (
              <div className="empty-history">
                <p>No matching projects found.</p>
              </div>
            ) : (
              filteredProjects.map((p) => {
                const isActive = activeProject?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`history-item ${isActive ? "active" : ""}`}
                    onClick={() => handleSelectProject(p)}
                  >
                    <div className="history-item-top">
                      <span className="history-source-badge">{p.source_type.toUpperCase()}</span>
                      <span className="history-date">
                        {new Date(p.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h4 className="history-title">{p.title}</h4>
                    <div className="history-item-footer">
                      <span className="artefacts-count">
                        {p.generations?.length || 0} Artefacts
                      </span>
                      <span className="history-status">{p.status}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Center Canvas: Transformation Engine & Output Dashboard */}
        <main className="main-canvas">
          {/* Status & Error Alerts */}
          {statusMessage && <div className="toast-status-banner">{statusMessage}</div>}
          {errorMessage && <div className="toast-error-banner" role="alert">{errorMessage}</div>}

          {/* Project Title Field */}
          <section className="project-title-section">
            <div className="title-row">
              <input
                type="text"
                className="main-project-title-input"
                placeholder="Enter Project Title…"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
              />
              {activeProject && activeProject.generations && activeProject.generations.length > 0 && (
                <button
                  type="button"
                  className="export-package-btn"
                  onClick={() => setShowExportModal(true)}
                >
                  📦 Export Package
                </button>
              )}
            </div>
          </section>

          {/* Operator Persona Configuration */}
          <OperatorProfiles
            selectedProfileId={selectedProfile.id}
            onSelectProfile={handleProfileSelect}
          />

          {/* Step 1: Source Ingestion */}
          <SourceIngestion
            sourceType={sourceType}
            onSourceTypeChange={setSourceType}
            sourceText={sourceText}
            onSourceTextChange={setSourceText}
            onFileUpload={handleFileUpload}
            onUrlExtract={handleUrlExtract}
            onSampleSelect={handleSampleSelect}
            isProcessing={isProcessingSource}
            uploadedFileName={uploadedFileName}
          />

          {/* Step 2: Generation Settings */}
          <GenerationSettings
            settings={settings}
            onSettingsChange={setSettings}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            canGenerate={sourceText.trim().length > 0}
          />

          {/* Step 3: Generated Artefacts Inspection */}
          {activeProject?.generations && activeProject.generations.length > 0 && (
            <section className="generated-outputs-section">
              <div className="outputs-header">
                <div className="outputs-title-group">
                  <span className="step-pill">Step 3</span>
                  <h3>Publication-Ready Artefacts</h3>
                </div>
                <div className="artefact-tabs-nav" role="tablist">
                  {activeProject.generations.map((gen) => {
                    const label =
                      gen.output_type === "executive_summary"
                        ? "Executive Summary"
                        : gen.output_type === "advisory"
                        ? "Structured Advisory"
                        : gen.output_type === "linkedin_post"
                        ? "LinkedIn Post"
                        : "Video Package";
                    const icon =
                      gen.output_type === "executive_summary"
                        ? "📑"
                        : gen.output_type === "advisory"
                        ? "🚨"
                        : gen.output_type === "linkedin_post"
                        ? "💼"
                        : "🎬";
                    return (
                      <button
                        key={gen.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === gen.output_type}
                        className={`artefact-nav-tab ${activeTab === gen.output_type ? "active" : ""}`}
                        onClick={() => setActiveTab(gen.output_type)}
                      >
                        <span>{icon}</span> {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Output Card */}
              <div className="output-display-canvas">
                {currentGeneration && activeTab === "executive_summary" && (
                  <ExecutiveSummaryCard
                    generation={currentGeneration}
                    sourceText={sourceText}
                    onSaveContent={handleSaveContent}
                    onRegenerate={handleRegenerate}
                    isRegenerating={regeneratingId === currentGeneration.id}
                  />
                )}

                {currentGeneration && activeTab === "advisory" && (
                  <AdvisoryCard
                    generation={currentGeneration}
                    sourceText={sourceText}
                    onSaveContent={handleSaveContent}
                    onRegenerate={handleRegenerate}
                    isRegenerating={regeneratingId === currentGeneration.id}
                  />
                )}

                {currentGeneration && activeTab === "linkedin_post" && (
                  <LinkedInPostCard
                    generation={currentGeneration}
                    sourceText={sourceText}
                    onSaveContent={handleSaveContent}
                    onRegenerate={handleRegenerate}
                    isRegenerating={regeneratingId === currentGeneration.id}
                  />
                )}

                {currentGeneration && activeTab === "video_package" && (
                  <VideoPackageCard
                    generation={currentGeneration}
                    sourceText={sourceText}
                    onSaveContent={handleSaveContent}
                    onRegenerate={handleRegenerate}
                    isRegenerating={regeneratingId === currentGeneration.id}
                  />
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Export Modal */}
      {showExportModal && activeProject && (
        <ExportModal project={activeProject} onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
}
