// Genere src/data/assessment.items.v0.2.ts (public, sans code de type) a partir de
// supabase/seed/items.v0.2.ts (prive, source de verite -- voir docs/SOURCE_MAPPING.md §1.3).
//
// Usage : npm run generate:public-items
// (execute avec `node --experimental-strip-types` car le seed source est ecrit en TypeScript.)

import { writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(here, "..", "supabase", "seed", "items.v0.2.ts");
const outPath = path.join(here, "..", "src", "data", "assessment.items.v0.2.ts");

const seedUrl = pathToFileURL(seedPath);
seedUrl.search = `t=${Date.now()}`;
const { RAW_ITEMS, BLOCKS } = await import(seedUrl.href);

const publicItems = RAW_ITEMS.map((item) => ({
  id: item.id,
  blockId: item.blockId,
  prompt: item.prompt,
  options: item.options.map((option) => ({
    // Opaque id: never reveals the internal type code or the source letter ordering.
    id: `item-${item.id}-${option.letter}`,
    text: option.text
  }))
}));

const totalOptions = publicItems.reduce((sum, item) => sum + item.options.length, 0);

const header = `/**
 * Donnees PUBLIQUES du questionnaire (texte des 45 items, blocs, ids d'options opaques).
 *
 * GENERE AUTOMATIQUEMENT par \`npm run generate:public-items\` a partir de
 * \`supabase/seed/items.v0.2.ts\` (source de verite privee). NE PAS EDITER A LA MAIN --
 * toute correction de texte doit se faire dans le fichier source, puis regenerer ce fichier.
 *
 * Ce fichier ne contient AUCUN code de type (AN/PE/EM/IM/EN/PR) : voir docs/SOURCE_MAPPING.md
 * §1.3 et §4.4 pour la raison de cette separation stricte.
 */

export interface PublicAssessmentOption {
  id: string;
  text: string;
}

export interface PublicAssessmentItem {
  id: number;
  blockId: ${BLOCKS.map((b) => `"${b.id}"`).join(" | ")};
  prompt: string;
  options: PublicAssessmentOption[];
}

export interface AssessmentBlockMeta {
  id: ${BLOCKS.map((b) => `"${b.id}"`).join(" | ")};
  label: string;
  itemRange: [number, number];
}

export const ASSESSMENT_BLOCKS: AssessmentBlockMeta[] = ${JSON.stringify(BLOCKS, null, 2)};

export const ASSESSMENT_ITEMS: PublicAssessmentItem[] = ${JSON.stringify(publicItems, null, 2)};

export const ASSESSMENT_VERSION = "v0.2" as const;
export const TOTAL_ITEMS = ${publicItems.length};
export const TOTAL_OPTIONS = ${totalOptions};
`;

await writeFile(outPath, header, "utf8");

console.log(`Genere : ${path.relative(process.cwd(), outPath)}`);
console.log(`  ${publicItems.length} items, ${totalOptions} options.`);
