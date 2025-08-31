// src/agents/CanvaDesignCoach.ts
import { btc_price } from '../tools/btc_price.js';
import { getFeeEstimates } from '../tools/mempool_fee_estimates.js';
import { SocraticTutor } from './SocraticTutor.js';
import { canvaTools } from '../tools/canva_api.js';

type Out = { 
  briefMd: string; 
  bulkCsv: string; 
  designs?: any[];
  folderId?: string;
};

function fkEase(text: string) {
  // super simple estimate; good enough for a check
  const sentences = Math.max(1, (text.match(/[.!?]/g) || []).length);
  const words = Math.max(1, (text.trim().split(/\s+/g) || []).length);
  const syllables = Math.max(
    words,
    (text.toLowerCase().match(/[aeiouy]{1,2}/g) || []).length
  );
  const wps = words / sentences;
  const spw = syllables / words;
  // Flesch Reading Ease
  return Math.round((206.835 - 1.015 * wps - 84.6 * spw) * 10) / 10;
}

function chunkSlides(raw: string) {
  // split on headings or blank lines; keep it simple
  const blocks = raw
    .split(/\n{2,}/g)
    .map(s => s.trim())
    .filter(Boolean);
  return blocks;
}

function makeCsv(headers: string[], row: (string | number)[]) {
  const esc = (s: any) =>
    `"${String(s ?? '').replace(/"/g, '""')}"`;
  return `${headers.join(',')}\n${row.map(esc).join(',')}\n`;
}

export async function run_CanvaDesignCoach(
  moduleTitle: string, 
  rawText: string, 
  options: { createDesigns?: boolean; folderName?: string } = {}
): Promise<Out> {
  // live data
  const [price, fees] = await Promise.all([
    btc_price(),
    getFeeEstimates()
  ]);

  // Get real Socratic prompts
  const socraticTutor = new SocraticTutor();
  const socraticQuestions = await socraticTutor.generateQuestions('fees', 'beginner', 5);
  const prompts = socraticQuestions.questions;

  const fast = Math.round(fees.fastestFee ?? 0);
  const medium = Math.round(fees.hourFee ?? 0);
  const slow = Math.round(fees.economyFee ?? 0);

  const slides = chunkSlides(rawText);
  const overallEase = fkEase(rawText);

  // Suggest a simple structure
  const sectionPlan = [
    'Title & Promise',
    'Why this matters (1–2 bullets)',
    'Analogy (bus with limited seats)',
    'How fees work (Fast/Med/Slow)',
    'Try it (Socratic prompt)',
    'Key takeaways',
  ];

  const briefLines: string[] = [];
  briefLines.push(`# Design Brief — ${moduleTitle}`);
  briefLines.push(`Reading Ease (Flesch): **${overallEase}** (aim 60–75).`);
  briefLines.push(`BTC price ~ **${Math.round(price.usd)} USD** | **${Math.round(price.cop).toLocaleString('en-US')} COP**.`);
  briefLines.push(`Fees (sat/vB): Fast **${fast}**, Medium **${medium}**, Slow **${slow}**.`);
  briefLines.push('');
  briefLines.push(`## Slide Plan`);
  sectionPlan.forEach((sec, i) => briefLines.push(`${i + 1}. ${sec}`));
  briefLines.push('');
  briefLines.push(`## Slide-by-slide suggestions`);
  slides.forEach((s, i) => {
    const ease = fkEase(s);
    briefLines.push(`### Slide ${i + 1}`);
    briefLines.push(`- Current ease: **${ease}** (keep 60–75).`);
    briefLines.push(`- Trim to 3 bullets max.`);
    briefLines.push(`- Use short sentences (under 16 words).`);
    briefLines.push(`- Add one image or icon to anchor the idea.`);
    briefLines.push(`- Replace jargon. Prefer "fee", "space", "line", "speed".`);
    briefLines.push('');
  });
  briefLines.push(`## Ready-to-paste copy (edit as needed)`);
  briefLines.push(`**Fees today**`);
  briefLines.push(`Fast: ${fast} sat/vB · Medium: ${medium} · Slow: ${slow}`);
  briefLines.push(`**Price**: ~${Math.round(price.usd)} USD`);
  briefLines.push('');
  briefLines.push(`**Socratic prompts (pick 1 per slide):**`);
  prompts.slice(0, 5).forEach((q, i) => briefLines.push(`${i + 1}. ${q}`));
  briefLines.push('');
  briefLines.push(`**Design checklist**`);
  briefLines.push(`- Clear title. Big. 6–10 words.`);
  briefLines.push(`- Max 3 bullets, 7–9 words each.`);
  briefLines.push(`- Contrast: dark text on light bg (or inverse).`);
  briefLines.push(`- Align to a grid. Use consistent spacing.`);
  briefLines.push(`- One highlight color only.`);

  // CSV for Bulk Create (single slide template, you can duplicate in Canva)
  const csvHeaders = [
    'module',
    'price_usd',
    'fee_fast',
    'fee_medium',
    'fee_slow',
    'prompt1',
    'prompt2',
    'prompt3',
  ];
  const row = [
    moduleTitle,
    Math.round(price.usd),
    fast,
    medium,
    slow,
    prompts[0] ?? '',
    prompts[1] ?? '',
    prompts[2] ?? '',
  ];

  const result: Out = {
    briefMd: briefLines.join('\n'),
    bulkCsv: makeCsv(csvHeaders, row),
  };

  // Create actual Canva designs if requested
  if (options.createDesigns) {
    try {
      // Create or find folder for Bitcoin education
      let folderId: string | undefined;
      if (options.folderName) {
        const folderResult = await canvaTools.createFolder(options.folderName);
        if (folderResult.success) {
          folderId = folderResult.data.id;
          result.folderId = folderId;
        }
      }

      // Create designs based on the educational content
      const designTypes = [
        { type: 'instagram-post', title: `${moduleTitle} - Price Alert`, template: 'social-media' },
        { type: 'presentation', title: `${moduleTitle} - Educational Slides`, template: 'educational' },
        { type: 'infographic', title: `${moduleTitle} - Fee Guide`, template: 'infographic' }
      ];

      const createdDesigns = [];
      for (const designSpec of designTypes) {
        try {
          const designResult = await canvaTools.createDesign(designSpec.type, designSpec.title);
          if (designResult.success) {
            createdDesigns.push({
              id: designResult.data.id,
              title: designResult.data.title,
              edit_url: designResult.data.urls?.edit_url,
              view_url: designResult.data.urls?.view_url,
              type: designSpec.type,
              template: designSpec.template
            });
          }
        } catch (error) {
          console.warn(`Failed to create ${designSpec.type} design:`, error);
        }
      }

      result.designs = createdDesigns;
      
    } catch (error) {
      console.warn('Failed to create Canva designs:', error);
    }
  }

  return result;
}