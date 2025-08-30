// src/cases/run_canva_design.ts
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { basename } from 'path';
import { run_CanvaDesignCoach } from '../agents/CanvaDesignCoach.js';

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: tsx src/cases/run_canva_design.ts <path-to-text>');
    process.exit(1);
  }
  const raw = readFileSync(inputPath, 'utf8');
  const moduleTitle = basename(inputPath).replace(/\.[^.]+$/, '');
  const out = await run_CanvaDesignCoach(moduleTitle, raw);

  mkdirSync('exports', { recursive: true });
  writeFileSync(`exports/${moduleTitle}-design-brief.md`, out.briefMd);
  writeFileSync(`exports/${moduleTitle}-bulk.csv`, out.bulkCsv);
  console.log(`Saved exports/${moduleTitle}-design-brief.md`);
  console.log(`Saved exports/${moduleTitle}-bulk.csv`);
}

main().catch(e => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});