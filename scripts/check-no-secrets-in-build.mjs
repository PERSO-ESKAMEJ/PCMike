// Verifie qu'aucun secret ne s'est glisse dans le build de production. Execute apres
// `npm run build` (dist/ doit exister) -- voir .github/workflows/deploy.yml et
// docs/PRIVACY_AND_SECURITY.md.
//
// Usage : npm run check:no-secrets

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(here, "..", "dist");

// Ces motifs ne doivent JAMAIS apparaitre dans le bundle livre au navigateur : le nom de
// variable d'environnement du secret lui-meme (jamais bundle par construction, puisque Vite
// n'inline que les variables prefixees VITE_*), et le prefixe standard des JWT Supabase
// service_role (les clés anon/publishable ont aussi ce prefixe "eyJ..." -- on ne peut donc pas
// interdire "eyJ" globalement sans faux positif sur la clé publique legitime).
const FORBIDDEN_PATTERNS = [/SUPABASE_SERVICE_ROLE_KEY/i, /service_role_key\s*[:=]\s*["']ey/i];

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else if (/\.(js|css|html|map)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

try {
  await stat(distDir);
} catch {
  console.error("dist/ introuvable -- lancer `npm run build` avant ce contrôle.");
  process.exit(1);
}

const files = await collectFiles(distDir);
let found = false;

for (const file of files) {
  const content = await readFile(file, "utf8");
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      console.error(`Motif interdit "${pattern}" trouvé dans ${path.relative(distDir, file)}`);
      found = true;
    }
  }
}

if (found) {
  console.error("\nÉCHEC : un secret potentiel a été détecté dans le build.");
  process.exit(1);
}

console.log(`OK : aucun secret détecté dans ${files.length} fichiers de dist/.`);
