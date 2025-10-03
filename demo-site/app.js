// Theme toggle (persists in localStorage)
(function theme() {
  const btn = document.getElementById('themeToggle');
  const key = 'btc-mcp-theme';
  const saved = localStorage.getItem(key);
  if (saved === 'light') document.documentElement.classList.add('light');

  btn.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    localStorage.setItem(key, document.documentElement.classList.contains('light') ? 'light' : 'dark');
  });
})();

// Light theme overrides
const lightCss = `
  .light body { background: #f7f9fc; color: #101218; }
  .light .panel { background: #ffffff; border-color: #e6e9ee; }
  .light pre { background: #f4f6fa; border-color: #e6e9ee; }
  .light .subtitle, .light .site-footer, .light .card p { color: #4a5568; }
  .light .tab.active, .light .chip.active { background: #fff1e0; }
`;
const style = document.createElement('style');
style.innerText = lightCss;
document.head.appendChild(style);

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Tabs
(function tabs() {
  const tabs = [...document.querySelectorAll('.tab')];
  const panes = [...document.querySelectorAll('.tabpane')];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const id = tab.dataset.tab;
    tabs.forEach(t => t.classList.toggle('active', t === tab));
    panes.forEach(p => p.classList.toggle('active', p.dataset.pane === id));
  }));
})();

// Command search (filters visible code lines)
(function commandSearch() {
  const input = document.getElementById('commandSearch');
  const panes = [...document.querySelectorAll('.tabpane')];
  const originals = new Map();
  panes.forEach(p => originals.set(p, p.querySelector('pre').innerText));

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    panes.forEach(p => {
      const full = originals.get(p);
      if (!q) { p.querySelector('pre').innerText = full; return; }
      const filtered = full.split('\n').filter(line => line.toLowerCase().includes(q)).join('\n');
      p.querySelector('pre').innerText = filtered || '# No matches in this category';
    });
  });
})();

// Agents grid
(function agents() {
  const agents = [
    // Educational
    { name: 'SocraticTutor', cat: 'education', desc: 'Question-driven discovery learning sequences.' },
    { name: 'TutorialBuilder', cat: 'education', desc: 'Structured learning modules for Bitcoin topics.' },
    { name: 'AssessmentGenerator', cat: 'education', desc: 'Contextual evaluations & quizzes.' },
    { name: 'ContentOrchestrator', cat: 'education', desc: 'Coordinates multi-agent educational workflows.' },

    // Content Intelligence
    { name: 'ContentPhilosophyAnalyzer', cat: 'content', desc: 'Analyzes learning approaches & pedagogy.' },
    { name: 'NotionContentAnalyzer', cat: 'content', desc: 'Insights from Notion workspaces.' },
    { name: 'CanvaContentAnalyzer', cat: 'content', desc: 'Design pattern extraction from Canva.' },
    { name: 'ChatGPTContentAnalyzer', cat: 'content', desc: 'Processes existing educational content.' },

    // Bitcoin-Specific
    { name: 'BitcoinIntelligenceScout', cat: 'bitcoin', desc: 'Monitors Bitcoin ecosystem threats/opportunities.' },
    { name: 'BitcoinNewsAnalyzer', cat: 'bitcoin', desc: 'News sentiment for educational opportunities.' },
    { name: 'SimulationBuilder', cat: 'bitcoin', desc: 'Creates Bitcoin transaction simulations.' },
    { name: 'CustodyCoach', cat: 'bitcoin', desc: 'Security & self-custody education.' },

    // Visual & Design
    { name: 'BrandIdentitySystem', cat: 'design', desc: 'Maintains consistent visual identity.' },
    { name: 'CanvaDesignCoach', cat: 'design', desc: 'Generates visual learning materials.' },
    { name: 'UXDesignAgent', cat: 'design', desc: 'Optimizes learner experience & flows.' },
  ];

  const grid = document.getElementById('agentGrid');
  const filters = [...document.querySelectorAll('#agentFilters .chip')];

  function render(filter = 'all') {
    grid.innerHTML = '';
    agents.filter(a => filter === 'all' || a.cat === filter).forEach(a => {
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `
        <h5>${a.name}</h5>
        <p>${a.desc}</p>
        <p><small>Category: ${a.cat}</small></p>
      `;
      grid.appendChild(el);
    });
  }
  render();

  filters.forEach(f => f.addEventListener('click', () => {
    filters.forEach(x => x.classList.toggle('active', x === f));
    render(f.dataset.filter);
  }));
})();