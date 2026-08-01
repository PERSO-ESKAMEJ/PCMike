// Utilitaires HTTP partages entre les Edge Functions. Deno pur, aucune dependance npm.

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...init.headers
    }
  });
}

export function errorResponse(status: number, error: string): Response {
  return jsonResponse({ ok: false, error }, { status });
}
