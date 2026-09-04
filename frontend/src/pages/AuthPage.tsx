import { useState, type FormEvent } from "react";
import { Logo } from "../components/Logo";
import { supabase } from "../lib/supabase";

interface AuthPageProps {
  onEnterDemo: () => void;
}

export function AuthPage({ onEnterDemo }: AuthPageProps) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const action =
        mode === "sign-in"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({ email, password });
      const { error } = await action;
      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          mode === "sign-up"
            ? "Account created. Check your email to confirm your account."
            : "Signed in successfully."
        );
      }
    } catch {
      setMessage("Supabase authentication is offline. You can use Demo Access below.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      {/* Left Hero Showcase */}
      <section className="auth-intro">
        <div className="auth-intro-top">
          <Logo />
        </div>

        <div className="auth-hero-content">
          <span className="auth-eyebrow">Intelligence to Impact</span>
          <h1 className="auth-title">
            One source.<br />
            <span className="auth-title-gradient">Every message.</span>
          </h1>
          <p className="auth-description">
            Transform trusted information into publication-ready executive briefings, structured advisories, LinkedIn posts, and video production packages with traceable source grounding.
          </p>

          <div className="auth-feature-pills">
            <span className="pill">📑 Executive Summaries</span>
            <span className="pill">🚨 Structured Advisories</span>
            <span className="pill">💼 LinkedIn Posts</span>
            <span className="pill">🎬 Video Packages</span>
          </div>
        </div>

        <div className="auth-intro-footer">
          <div className="security-badge">
            <span className="shield-icon">🔒</span>
            <span>Enterprise-grade Grounding & Zero-Retention Security</span>
          </div>
        </div>
      </section>

      {/* Right Login / Demo Card */}
      <section className="auth-panel">
        <div className="auth-card-wrapper">
          {/* 1-Click Instant Demo Button */}
          <div className="demo-access-banner">
            <div className="demo-banner-top">
              <span className="demo-bolt">⚡</span>
              <div>
                <h4>Evaluator Quick Access</h4>
                <p>Explore the full dashboard and AI transformation pipeline instantly.</p>
              </div>
            </div>
            <button
              type="button"
              className="demo-enter-btn"
              onClick={onEnterDemo}
            >
              Enter Demo Workspace →
            </button>
          </div>

          <div className="auth-divider">
            <span>or sign in with email</span>
          </div>

          <form className="auth-card" onSubmit={submit}>
            <div className="auth-card-header">
              <h2>{mode === "sign-in" ? "Sign in to TransformAI" : "Create your account"}</h2>
              <p className="auth-card-subtitle">
                {mode === "sign-in"
                  ? "Access your saved transformations and project history."
                  : "Start creating traceable publications from source material."}
              </p>
            </div>

            <div className="auth-field">
              <label htmlFor="auth-email">Work Email Address</label>
              <input
                id="auth-email"
                type="email"
                className="auth-input"
                autoComplete="email"
                placeholder="name@organization.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                className="auth-input"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                placeholder="••••••••"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {message && <p className="auth-message" role="status">{message}</p>}

            <button className="auth-submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait…"
                : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
            </button>

            <button
              className="auth-toggle-mode-btn"
              type="button"
              onClick={() => {
                setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                setMessage("");
              }}
            >
              {mode === "sign-in"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
