import fs from 'node:fs';
import path from 'node:path';

const categories = [
  'sports','puzzle','arcade','action','racing','platformer','shooter','strategy','simulation','rhythm_music','word_trivia','party_social'
];

const templateByCategory = {
  sports: 'physics_2d',
  simulation: 'physics_2d',
  platformer: 'platformer_2d',
  puzzle: 'grid_2d',
  word_trivia: 'grid_2d',
  rhythm_music: 'rhythm_2d',
  arcade: 'topdown_2d',
  action: 'topdown_2d',
  racing: 'topdown_2d',
  shooter: 'topdown_2d',
  strategy: 'topdown_2d',
  party_social: 'topdown_2d',
};

const files = fs.readdirSync('app/gamespec/examples').filter((f) => f.endsWith('.json'));
const byCategory = new Map();
for (const file of files) {
  const json = JSON.parse(fs.readFileSync(path.join('app/gamespec/examples', file), 'utf8'));
  byCategory.set(json?.metadata?.category, json);
}

let ok = true;
for (const category of categories) {
  const spec = byCategory.get(category);
  if (!spec) {
    console.error(`Missing example for category: ${category}`);
    ok = false;
    continue;
  }
  const sections = ['metadata','world','entities','components','rules','assets','constraints'];
  for (const section of sections) {
    if (!(section in spec)) {
      console.error(`Example ${category} missing section ${section}`);
      ok = false;
    }
  }
  if (spec.metadata.template !== templateByCategory[category]) {
    console.error(`Example ${category} template mismatch: ${spec.metadata.template} !== ${templateByCategory[category]}`);
    ok = false;
  }
  if (!Array.isArray(spec.metadata.mechanics) || spec.metadata.mechanics.length === 0) {
    console.error(`Example ${category} mechanics missing`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}
console.log(`Smoke OK: ${categories.length} categories have valid examples with templates/mechanics.`);
