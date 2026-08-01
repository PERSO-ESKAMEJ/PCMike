import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export function AdminHeader({ title }: { title: string }) {
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    void navigate("/admin", { replace: true });
  }

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Espace administrateur</p>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">
        <button type="button" className="ghost-button" onClick={() => void handleSignOut()}>
          Se déconnecter
        </button>
      </div>
    </header>
  );
}
