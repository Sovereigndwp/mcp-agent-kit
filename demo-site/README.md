# Bitcoin MCP Agent Kit Demo Website

A beautiful, responsive demo website showcasing the MCP Agent Kit with interactive features, command search, agent filtering, and dark/light mode toggle.

## 🚀 Quick Start

### Option 1: Direct Browser
Open `index.html` directly in your browser

### Option 2: Local Server
```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx http-server . -p 8080

# PHP
php -S localhost:8080
```

Then visit: `http://localhost:8080`

### Option 3: From main project
```bash
# From the mcp-agent-kit root directory
npm run demo:site
```

## ✨ Features

- **🌓 Dark/Light Mode Toggle** - Persistent theme switching
- **🔍 Command Search** - Real-time filtering across all command categories  
- **📑 Tabbed Interface** - Organized commands by category (Core, Course Generation, Bitcoin Intelligence, etc.)
- **🤖 Agent Gallery** - Interactive filtering of 30+ specialized agents
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **₿ Bitcoin Themed** - Uses Bitcoin orange (#f7931a) accent color
- **⚡ Fast & Lightweight** - Pure HTML/CSS/JS with no dependencies

## 📁 Structure

```
demo-site/
├── index.html      # Main HTML structure
├── styles.css      # Bitcoin-themed styling with CSS variables
├── app.js          # Interactive functionality (tabs, search, filters)
└── README.md       # This file
```

## 🎨 Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
  --bg: #0b0d10;        /* Dark background */
  --accent: #f7931a;    /* Bitcoin orange */
  --text: #e8eaf0;      /* Light text */
  --card: #141821;      /* Card background */
}
```

### Content
- Update agent list in `app.js` → `agents` array
- Modify command examples in `index.html` → `.tabpane` sections
- Edit architecture details in the HTML

### Adding Commands
1. Find the relevant tab section in `index.html`
2. Add your command to the `<pre><code>` block
3. The search functionality will automatically include it

## 🔧 Integration

This demo can be easily integrated into:
- **Documentation sites** (GitBook, Docusaurus, VuePress)
- **GitHub Pages** - Just push to a `gh-pages` branch
- **Static hosting** (Netlify, Vercel, Surge)
- **No-code platforms** - Copy/paste the HTML into website builders

## 📊 Analytics

The demo is designed to be analytics-friendly:
- Semantic HTML structure
- Proper heading hierarchy (h1 → h6)
- ARIA labels for accessibility
- Search-engine optimized meta tags

## 🌐 Hosting Options

### Free Static Hosting
- [GitHub Pages](https://pages.github.com/)
- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)
- [Surge.sh](https://surge.sh/)

### Deploy to GitHub Pages
```bash
# From the demo-site directory
git add .
git commit -m "Add demo website"
git subtree push --prefix demo-site origin gh-pages
```

---

**Built for the Bitcoin MCP Agent Kit** - A Model Context Protocol server for Bitcoin education with 30+ specialized agents, Canva/Notion integrations, and REST API endpoints.