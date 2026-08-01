import { useEffect } from "react";

/**
 * Ajoute dynamiquement une balise <meta name="robots" content="noindex"> tant que le composant
 * appelant est monte. Necessaire car l'app est une SPA a page HTML unique (HashRouter) : il n'y
 * a pas d'index.html distinct par route pour porter une balise noindex statique sur /admin
 * (mission §10, docs/PRIVACY_AND_SECURITY.md).
 */
export function useNoIndex(): void {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);
}
