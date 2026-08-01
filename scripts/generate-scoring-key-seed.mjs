// Genere supabase/seed/scoring_key.seed.sql (INSERT statements) a partir de
// supabase/seed/items.v0.2.ts -- voir docs/SOURCE_MAPPING.md §4.4 et docs/SUPABASE_SETUP.md.
//
// Usage : npm run generate:scoring-key

import { writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(here, "..", "supabase", "seed", "items.v0.2.ts");
const outPath = path.join(here, "..", "supabase", "seed", "scoring_key.seed.sql");

const seedUrl = pathToFileURL(seedPath);
seedUrl.search = `t=${Date.now()}`;
const { RAW_ITEMS } = await import(seedUrl.href);

function sqlQuote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const rows = [];
for (const item of RAW_ITEMS) {
  for (const option of item.options) {
    const optionId = `item-${item.id}-${option.letter}`;
    rows.push(`  (${item.id}, ${sqlQuote(optionId)}, ${sqlQuote(option.typeCode)})`);
  }
}

const sql = `-- GENERE AUTOMATIQUEMENT par \`npm run generate:scoring-key\` depuis supabase/seed/items.v0.2.ts.
-- NE PAS EDITER A LA MAIN. Ce fichier est PRIVE : ne jamais l'exposer au bundle front-end.
--
-- Application (voir docs/SUPABASE_SETUP.md) :
--   supabase db execute -f supabase/seed/scoring_key.seed.sql
-- ou via psql/le SQL editor Supabase, apres avoir applique les migrations.

truncate table public.scoring_key;

insert into public.scoring_key (item_id, option_id, type_code) values
${rows.join(",\n")}
on conflict (item_id, option_id) do update set type_code = excluded.type_code;
`;

await writeFile(outPath, sql, "utf8");
console.log(`Genere : ${path.relative(process.cwd(), outPath)} (${rows.length} lignes)`);
