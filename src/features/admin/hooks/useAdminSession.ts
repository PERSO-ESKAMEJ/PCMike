import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type AdminSessionStatus = "loading" | "anonymous" | "authenticated_non_admin" | "admin";

export interface AdminSessionState {
  status: AdminSessionStatus;
  session: Session | null;
}

/**
 * La simple connexion Supabase Auth ne suffit pas : l'utilisateur doit aussi etre present dans
 * `admin_users` (voir docs/PRIVACY_AND_SECURITY.md). Cette verification est refaite cote serveur
 * par chaque politique RLS -- ce hook ne sert qu'a l'experience UI (afficher/masquer, rediriger),
 * jamais comme seule barriere de securite.
 */
export function useAdminSession(): AdminSessionState {
  const [state, setState] = useState<AdminSessionState>({ status: "loading", session: null });

  useEffect(() => {
    let cancelled = false;

    async function evaluate(session: Session | null) {
      if (!session) {
        if (!cancelled) setState({ status: "anonymous", session: null });
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setState({ status: "authenticated_non_admin", session });
        return;
      }

      setState({ status: "admin", session });
    }

    void supabase.auth.getSession().then(({ data }) => evaluate(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void evaluate(session);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return state;
}
