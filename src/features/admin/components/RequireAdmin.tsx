import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminSession } from "../hooks/useAdminSession";
import { useNoIndex } from "../hooks/useNoIndex";
import { supabase } from "@/lib/supabase";

export function RequireAdmin({ children }: { children: ReactNode }) {
  useNoIndex();
  const { status } = useAdminSession();

  if (status === "loading") {
    return (
      <div className="app admin-loading" role="status">
        Vérification de la session...
      </div>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/admin" replace />;
  }

  if (status === "authenticated_non_admin") {
    void supabase.auth.signOut();
    return <Navigate to="/admin" replace state={{ error: "compte_non_autorise" }} />;
  }

  return <>{children}</>;
}
