// src/cases/canva_snippet.ts
import { mempool_fee_estimates } from '../tools/mempool_fee_estimates.js';
import { btc_price } from '../tools/btc_price.js';
import { rss_fetch } from '../tools/rss_fetch.js';
import { run_SocraticTutor } from '../agents/SocraticTutor.js';
import { writeFileSync, mkdirSync } from 'fs';

function round(n: number, d = 2) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

async function main() {
  // Pull live data
  const [fees, price, news] = await Promise.all([
    mempool_fee_estimates(),
    btc_price(),
    rss_fetch('https://bitcoinops.org/feed.xml', 3)
  ]);

  // Fee tiers
  const fast = fees['2'] ?? fees['3'] ?? fees['1'];
  const medium = fees['6'] ?? fees['10'];
  const slow = fees['12'] ?? fees['30'];

  // Socratic prompts
  const soc = await run_SocraticTutor('fees');
  const prompts: string[] = (soc as any).prompts ?? [];

  // Markdown block (for copy/paste into a slide)
  const md = `# Bitcoin Snapshot (for Canva)

**Price**
- BTC ≈ $${round(price.usd)} USD  |  ≈ ${Math.round(price.cop).toLocaleString('en-US')} COP

**Fees (sat/vB)**
- Fast: ${Math.round(fast || 0)}
- Medium: ${Math.round(medium || 0)}
- Slow: ${Math.round(slow || 0)}

**Latest Headlines**
${news.items.map((i: any) => `- ${i.title} — ${i.link}`).join('\n')}

**Socratic Prompts**
${prompts.map((q: string, idx: number) => `${idx + 1}. ${q}`).join('\n')}
`;

  // CSV for Canva Bulk Create (single row)
  const newsTexts = news.items.map((i: any) => i.title || '').slice(0, 3);
  while (newsTexts.length < 3) newsTexts.push('');
  const qs = prompts.slice(0, 5);
  while (qs.length < 5) qs.push('');

  const csvHeader = [
    'price_usd','price_cop','fee_fast','fee_medium','fee_slow',
    'news1','news2','news3','q1','q2','q3','q4','q5'
  ].join(',');

  const csvRow = [
    round(price.usd),
    Math.round(price.cop),
    Math.round(fast || 0),
    Math.round(medium || 0),
    Math.round(slow || 0),
    ...newsTexts.map(s => `"${s.replace(/"/g, '""')}"`),
    ...qs.map(s => `"${s.replace(/"/g, '""')}"`)
  ].join(',');

  // Write files
  mkdirSync('exports', { recursive: true });
  writeFileSync('exports/canva-snippet.md', md);
  writeFileSync('exports/canva-snippet.csv', `${csvHeader}\n${csvRow}\n`);

  console.log('✅ Saved: exports/canva-snippet.md');
  console.log('✅ Saved: exports/canva-snippet.csv');
}

main().catch(err => {
  console.error('Failed to generate Canva snippet:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});