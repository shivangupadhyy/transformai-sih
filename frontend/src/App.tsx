import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    return localStorage.getItem("transformai_demo_session") === "true";
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleEnterDemo = () => {
    localStorage.setItem("transformai_demo_session", "true");
    setIsDemo(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem("transformai_demo_session");
    setIsDemo(false);
    void supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <main className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading TransformAI…</p>
      </main>
    );
  }

  return session || isDemo ? (
    <DashboardPage onSignOut={handleSignOut} />
  ) : (
    <AuthPage onEnterDemo={handleEnterDemo} />
  );
}
