import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAdminSession } from "../hooks/useAdminSession";
import { useNoIndex } from "../hooks/useNoIndex";

const MAX_ATTEMPTS = 5;

export function AdminLoginPage() {
  useNoIndex();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useAdminSession();
  const [code, setCode] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(
    (location.state as { error?: string } | null)?.error
      ? "Ce compte n'est pas autorisé à accéder à l'espace administrateur."
      : null
  );
  const [submitting, setSubmitting] = useState(false);

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const locked = attempts >= MAX_ATTEMPTS;

  useEffect(() => {
    if (status === "admin") {
      void navigate("/admin/dashboard", { replace: true });
    }
  }, [status, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (locked || !adminEmail) return;

    setSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: code
    });

    setSubmitting(false);

    if (signInError) {
      setAttempts((current) => current + 1);
      // Message volontairement non révélateur (ne distingue pas "compte inconnu" de "code faux").
      setError("Code d'accès incorrect.");
      return;
    }

    void navigate("/admin/dashboard", { replace: true });
  }

  return (
    <div className="app admin-login">
      <main className="intro-layout">
        <div className="intro-copy">
          <p className="eyebrow">Espace administrateur</p>
          <h1>Accès protégé</h1>
          {!adminEmail && (
            <p className="notice notice--error">
              VITE_ADMIN_EMAIL n'est pas configuré. Voir docs/SUPABASE_SETUP.md.
            </p>
          )}
          <form onSubmit={(event) => void handleSubmit(event)} className="admin-login__form">
            <label>
              Code d'accès
              <input
                type="password"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="current-password"
                disabled={locked}
                required
              />
            </label>
            {error && <p className="notice notice--error">{error}</p>}
            {locked && (
              <p className="notice notice--error">
                Trop de tentatives. Recharge la page pour réessayer.
              </p>
            )}
            <button
              type="submit"
              className="primary-button"
              disabled={submitting || locked || !adminEmail}
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
