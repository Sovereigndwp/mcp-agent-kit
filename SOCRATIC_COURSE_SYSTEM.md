# 🎓 Socratic Course System Guide

Complete system for creating unique, hands-on, Socratic courses using AI agent orchestration with Canva and Notion integration.

## 🚀 Quick Start

### Generate Your First Course

```bash
# Generate a sample Bitcoin Fundamentals course
npm run course:sample

# Create a custom course
npm run course:create --topic "Lightning Network" --audience intermediate --duration 4 --notion --canva

# View available agents
npm run course:agents
```

### Monitor Bitcoin Intelligence

```bash
# Gather latest intelligence from all sources
npm run intel:gather

# View current intelligence summary
npm run intel:summary

# Monitor educational sites specifically
npm run intel:education

# List all monitored sources
npm run intel:sources
```

## 🤖 System Architecture

### Agent Orchestration Workflow

```
📊 Content Intelligence
├── NotionContentAnalyzer → Extract workspace insights
├── CanvaContentAnalyzer → Analyze design patterns
└── ContentPhilosophyAnalyzer → Learning approach analysis

🤔 Socratic Framework
├── SocraticTutor → Generate questioning sequences
├── TutorialBuilder → Create structured modules
└── AssessmentGenerator → Design contextual evaluations

🎨 Visual Learning
├── CanvaDesignAnalyzer → Extract visual patterns
├── BrandIdentitySystem → Consistent design identity
└── CanvaDesignCoach → Generate course materials

⚡ Enhancement & Intelligence
├── ContentImprovementEngine → Optimize effectiveness
├── ProgressTracker → Learning analytics
└── BitcoinIntelligenceScout → Monitor threats/opportunities
```

## 🎯 Core Features

### 1. Socratic Course Generation

**What It Does:**
- Creates unique discovery-based learning experiences
- Integrates real-world scenarios and hands-on activities
- Generates progressive questioning sequences
- Produces visual learning materials

**Example Output:**
- 3-4 hour modular course with interactive elements
- Socratic questioning framework for each concept
- Hands-on activities with real Bitcoin tools
- Canva design templates and assets
- Notion workspace templates

### 2. Bitcoin Intelligence Monitoring

**What It Monitors:**
- **News Sources:** CoinDesk, Bitcoin Magazine, Decrypt
- **Security Threats:** Chainalysis, Bitcoin Security Research
- **Economic Factors:** Federal Reserve, SEC releases
- **Educational Resources:** Learn Me A Bitcoin, Bitcoin Optech, MIT DCI
- **Technical Updates:** Bitcoin Core development, GitHub releases

**Intelligence Categories:**
- 🛡️ **Cybersecurity threats** targeting Bitcoin users/educators
- 📊 **Economic factors** affecting Bitcoin adoption
- 🏛️ **Regulatory changes** impacting educational content
- 🎓 **Educational opportunities** and content improvements
- ⚡ **Technical developments** requiring curriculum updates

### 3. Content Integration & Synthesis

**Pulls Content From:**
- Your existing Notion workspace
- Canva design libraries
- Educational websites (learnmeabitcoin.com, etc.)
- Live Bitcoin network data (fees, prices, etc.)
- RSS feeds from trusted sources

**Synthesizes Into:**
- Cohesive learning narratives
- Interactive course modules
- Hands-on exercises
- Assessment frameworks
- Visual learning aids

## 📚 Available Agents

### Content Analysis Agents
- **NotionContentAnalyzer** - Extract insights from Notion workspace
- **CanvaContentAnalyzer** - Analyze design patterns from Canva
- **ContentPhilosophyAnalyzer** - Analyze learning philosophy
- **ChatGPTContentAnalyzer** - Analyze existing educational content
- **GPTInstructionsAnalyzer** - Extract pedagogical patterns

### Educational Agents
- **SocraticTutor** - Generate Socratic questioning sequences
- **TutorialBuilder** - Create structured learning modules
- **AssessmentGenerator** - Generate contextual assessments
- **ContentOrchestrator** - Manage multi-agent workflows

### Design & Visual Agents
- **CanvaDesignAnalyzer** - Analyze visual learning patterns
- **BrandIdentitySystem** - Create consistent visual identity
- **CanvaDesignCoach** - Generate design materials
- **UXDesignAgent** - User experience optimization

### Enhancement & Intelligence Agents
- **ContentImprovementEngine** - Optimize learning effectiveness
- **ProgressTracker** - Track and analyze learning progress
- **BitcoinIntelligenceScout** - Monitor threats and opportunities
- **BitcoinNewsAnalyzer** - Analyze Bitcoin news sentiment
- **MarketIntelligenceAgent** - Market trends and analysis

### Specialized Bitcoin Agents
- **SimulationBuilder** - Create Bitcoin transaction simulations
- **CustodyCoach** - Bitcoin security and self-custody education
- **DevRadar** - Bitcoin development updates
- **LawWatchColombia** - Colombian Bitcoin regulation updates

## 🛠️ Command Reference

### Course Generation Commands

```bash
# Basic course creation
npm run course:create
  --topic "Your Topic"
  --audience (beginner|intermediate|advanced)
  --duration <hours>
  --style (visual|analytical|hands-on|mixed)
  --notion (include Notion integration)
  --canva (include Canva materials)
  --objectives "Learning objective 1" "Learning objective 2"

# Quick sample generation
npm run course:sample

# View all available agents
npm run course:agents
```

### Intelligence Commands

```bash
# Comprehensive intelligence gathering
npm run intel:gather --timeframe (1h|6h|24h|7d)

# Current intelligence status
npm run intel:summary

# Educational site monitoring
npm run intel:education

# View all monitored sources
npm run intel:sources
```

### Development Commands

```bash
# Build system
npm run build
npm run typecheck
npm run lint

# Web interface (for API access)
npm run web

# Run specific agent demos
npm run tutorial:demo
npm run assessment:demo
npm run orchestrator:demo
```

## 🎨 Integration Features

### Canva Integration
- **Design Generation:** Automated creation of course visuals
- **Brand Consistency:** Unified design system across materials
- **Bulk CSV Export:** Import designs directly into Canva
- **Visual Learning:** Infographics, diagrams, comparison charts
- **Interactive Elements:** Visual progress trackers, concept maps

### Notion Integration
- **Workspace Setup:** Automated database and template creation
- **Progress Tracking:** Learning analytics and completion tracking
- **Question Banks:** Organized Socratic question repositories
- **Reflection Templates:** Guided self-assessment frameworks
- **Automation Ready:** Notion API integration for dynamic content

### Live Data Integration
- **Real-time Bitcoin Fees:** Current network fee estimates
- **Price Data:** Live Bitcoin pricing in multiple currencies
- **Network Stats:** Mining difficulty, hash rate, block data
- **News Sentiment:** Real-time sentiment analysis of Bitcoin news
- **Threat Intelligence:** Current cybersecurity alerts

## 📊 Output Examples

### Sample Course Structure
```
📚 Bitcoin Fundamentals Mastery Course (3 hours)
├── 🎯 Module 1: Understanding Transaction Fees (45 min)
│   ├── Socratic Questions: "What happens when many people want to send Bitcoin?"
│   ├── Hands-on Activity: Fee calculation with live network data
│   ├── Visual Aid: Interactive fee market diagram
│   └── Assessment: Scenario-based fee optimization
├── 🎯 Module 2: Wallet Security Mastery (45 min)
│   ├── Socratic Questions: "Why is your seed phrase so important?"
│   ├── Hands-on Activity: Generate and secure a test wallet
│   ├── Visual Aid: Security threat landscape infographic
│   └── Assessment: Security best practices evaluation
└── 🎯 Module 3: Economic Fundamentals (45 min)
    ├── Socratic Questions: "How does Bitcoin's scarcity affect its value?"
    ├── Hands-on Activity: Economic simulation with real data
    ├── Visual Aid: Monetary policy comparison chart
    └── Assessment: Economic reasoning scenarios
```

### Intelligence Report Structure
```json
{
  "report_id": "intel_1756992833235",
  "generated_at": "2025-01-04T09:33:53Z",
  "total_alerts": 47,
  "critical_alerts": [
    {
      "title": "New Bitcoin Wallet Vulnerability Discovered",
      "severity": "critical",
      "source": "Bitcoin Security Research",
      "educational_impact": "High - Update wallet security modules",
      "action_items": ["Review wallet tutorials", "Add security warnings"]
    }
  ],
  "educational_opportunities": [
    {
      "title": "Interactive Bitcoin Transaction Visualizer",
      "source": "Learn Me A Bitcoin",
      "relevance_score": 85,
      "action_items": ["Integrate visualization techniques", "Create similar tools"]
    }
  ],
  "recommendations": [
    "Integrate interactive transaction visualizations",
    "Develop security awareness modules",
    "Create regulatory compliance updates"
  ]
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Optional - Enhance functionality
CANVA_API_KEY=your_canva_api_key        # For direct Canva integration
NOTION_TOKEN=your_notion_token          # For Notion workspace automation
OPENAI_API_KEY=your_openai_key         # For enhanced content analysis
LOG_LEVEL=info                         # Logging verbosity
```

### Custom Sources
Add your own intelligence sources by modifying `BitcoinIntelligenceScout.ts`:

```typescript
{
  name: 'Your Custom Source',
  url: 'https://your-source.com/feed.xml',
  type: 'rss',
  category: 'education',
  priority: 'high',
  update_frequency: 'daily'
}
```

## 📈 Quality Metrics

### Course Quality Scoring
- **Content Depth:** Socratic question complexity and variety
- **Interactivity:** Hands-on activities and engagement elements
- **Visual Learning:** Design quality and educational effectiveness
- **Assessment Quality:** Scenario-based and practical evaluations
- **Real-world Relevance:** Live data integration and current examples

### Intelligence Relevance Scoring
- **Bitcoin Relevance:** Direct impact on Bitcoin ecosystem
- **Educational Impact:** Potential to improve learning outcomes
- **Threat Severity:** Security implications for Bitcoin users
- **Timeliness:** Recency and urgency of information
- **Source Credibility:** Authority and trustworthiness

## 🚀 Advanced Usage

### Custom Course Creation Workflow
```bash
# 1. Generate base course structure
npm run course:create --topic "Advanced Lightning" --audience advanced --duration 6

# 2. Gather related intelligence
npm run intel:gather --timeframe 7d

# 3. Monitor educational sites for improvements
npm run intel:education

# 4. Review and customize generated content
# 5. Import Canva CSV and set up Notion workspace
# 6. Deploy course and track learner progress
```

### Continuous Intelligence Monitoring
```bash
# Set up scheduled intelligence gathering
# Add to crontab for automatic monitoring:
# 0 */6 * * * cd /path/to/mcp-agent-kit && npm run intel:gather --timeframe 6h
# 0 9 * * 1 cd /path/to/mcp-agent-kit && npm run intel:education
```

## 📁 Output Locations

- **Generated Courses:** `exports/socratic_courses/`
- **Intelligence Reports:** `data/intelligence/reports/`
- **Course Websites:** `exports/socratic_courses/{course_id}/course_website.html`
- **Notion Templates:** `exports/socratic_courses/{course_id}/notion_workspace_setup.md`
- **Canva Designs:** `exports/socratic_courses/{course_id}/canva_designs.csv`

## 💡 Best Practices

### For Course Creation:
1. **Start with clear learning objectives** - Define what learners should achieve
2. **Choose appropriate complexity** - Match content difficulty to audience
3. **Integrate live data** - Keep examples current and relevant
4. **Review Socratic questions** - Ensure they guide discovery effectively
5. **Test hands-on activities** - Verify they work with real Bitcoin tools

### For Intelligence Monitoring:
1. **Regular monitoring** - Run intelligence gathering daily or weekly
2. **Review educational insights** - Continuously improve course content
3. **Act on security alerts** - Update content when threats are identified
4. **Track regulatory changes** - Ensure compliance with local regulations
5. **Monitor competitor content** - Learn from successful educational platforms

This system transforms your existing agents into a powerful, coordinated educational content creation and intelligence gathering platform, specifically designed for creating unique, engaging Bitcoin education experiences.