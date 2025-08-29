// src/cases/canva_snippet.ts
import { getFeeEstimates } from '../tools/mempool_fee_estimates.js';
import { btc_price } from '../tools/btc_price.js';
// import { rssFetchTool } from '../tools/rss_fetch.js'; // Not implemented yet
// import { SocraticTutor } from '../agents/SocraticTutor.js'; // Not implemented yet
import { writeFileSync, mkdirSync } from 'fs';

function round(n: number, d = 2) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

async function main() {
  // Pull live data
  const [fees, price] = await Promise.all([
    getFeeEstimates(),
    btc_price()
  ]);
  
  // Mock news data since RSS tool is not implemented
  const news = {
    items: [
      { title: "Bitcoin Network Update", link: "https://example.com/1" },
      { title: "Lightning Network Growth", link: "https://example.com/2" },
      { title: "Mining Difficulty Adjustment", link: "https://example.com/3" }
    ]
  };

  // Fee tiers (use FeeEstimate structure)
  const fast = fees.fastestFee;
  const medium = fees.hourFee;
  const slow = fees.economyFee;

  // Socratic prompts (simplified since SocraticTutor not implemented)
  const prompts: string[] = [
    "What factors influence Bitcoin transaction fees?",
    "Why do fees change throughout the day?",
    "How can you reduce your transaction fees?"
  ];

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
    ...newsTexts.map((s: string) => `"${s.replace(/"/g, '""')}"`),
    ...qs.map((s: string) => `"${s.replace(/"/g, '""')}"`)
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