# 📚 Content Integration Guide

This guide will help you integrate your real Canva designs, Notion content, and GPT configurations with the Content Philosophy Learning System.

## 🚀 Quick Start

### Step 1: Prepare Your Content Sources

Before integrating, gather the following information:

#### For Canva Designs:
- **Canva API Access Token** (if using API)
- **Design IDs** or export your designs as JSON
- **Design Categories** (educational slides, infographics, etc.)

#### For Notion Content:
- **Notion Integration Token**
- **Database/Page IDs** you want to analyze
- **Content Types** (pages, databases, templates)

#### For Custom GPTs:
- **GPT Names and IDs**
- **System Instructions/Prompts**
- **Configuration Files** (if available)

### Step 2: Set Up Environment Variables

Create a `.env` file in your project root:

```bash
# Canva Integration
CANVA_API_TOKEN=your_canva_api_token_here
CANVA_TEAM_ID=your_team_id

# Notion Integration  
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_main_content_database_id

# OpenAI/GPT Integration
OPENAI_API_KEY=your_openai_api_key
GPT_WORKSPACE_ID=your_workspace_id

# Analysis Settings
CONTENT_ANALYSIS_OUTPUT_DIR=./content-analysis-results
ENABLE_AUTO_BACKUP=true
```

### Step 3: Configure Content Sources

Run the setup wizard:

```bash
npm run setup:content-sources
```

This will:
- Test your API connections
- Scan available content
- Set up content mapping
- Configure analysis preferences

## 📋 Detailed Integration Steps

### 🎨 Canva Integration

#### Option 1: Using Canva API (Recommended)
1. **Get API Access**:
   - Go to [Canva Developers](https://developers.canva.com)
   - Create an app and get your API token
   - Add token to `.env` file

2. **Test Connection**:
   ```bash
   npm run test:canva-connection
   ```

3. **Import Designs**:
   ```bash
   npm run import:canva-designs
   ```

#### Option 2: Manual Export
1. **Export Design Data**:
   - Go to each Canva design
   - Export as JSON (if available) or take screenshots
   - Save design metadata (title, description, tags)

2. **Use Import Tool**:
   ```bash
   npm run import:manual-designs
   ```

### 📝 Notion Integration

1. **Create Notion Integration**:
   - Go to [Notion Integrations](https://www.notion.so/my-integrations)
   - Create new integration
   - Get internal integration token
   - Share your pages/databases with the integration

2. **Test Connection**:
   ```bash
   npm run test:notion-connection
   ```

3. **Import Content**:
   ```bash
   npm run import:notion-content
   ```

### 🤖 GPT Integration

#### For ChatGPT Plus Custom GPTs:
1. **Export GPT Configurations**:
   - Go to each Custom GPT
   - Copy the system instructions
   - Note conversation starters, knowledge files, actions

2. **Create GPT Config Files**:
   Save as `./content-sources/gpts/[gpt-name].json`:
   ```json
   {
     "id": "gpt_bitcoin_tutor",
     "name": "Bitcoin Learning Companion",
     "description": "Helps students learn Bitcoin concepts",
     "instructions": "You are a Bitcoin educator...",
     "conversation_starters": [...],
     "knowledge_files": [...],
     "capabilities": {...}
   }
   ```

#### For OpenAI API GPTs:
1. **Use API Import**:
   ```bash
   npm run import:openai-gpts
   ```

## 🔧 Content Source Configuration

### Create Content Mapping File

Save as `./content-sources/content-mapping.json`:

```json
{
  "canva_designs": [
    {
      "id": "design_bitcoin_basics",
      "name": "Bitcoin Fundamentals - Visual Guide", 
      "type": "educational_slide",
      "source": "canva_api",
      "priority": "high",
      "tags": ["bitcoin", "fundamentals", "beginner"]
    }
  ],
  "notion_pages": [
    {
      "id": "page_bitcoin_lesson",
      "name": "Understanding Bitcoin: Step by Step",
      "type": "lesson_plan", 
      "source": "notion_api",
      "priority": "high",
      "database_id": "your_database_id"
    }
  ],
  "custom_gpts": [
    {
      "id": "gpt_bitcoin_tutor",
      "name": "Bitcoin Learning Companion",
      "type": "educational_assistant",
      "source": "manual_export",
      "priority": "high",
      "config_file": "./content-sources/gpts/bitcoin-tutor.json"
    }
  ]
}
```

## 📊 Running Analysis on Real Content

### Full Analysis
```bash
npm run analyze:all-content
```

### Platform-Specific Analysis
```bash
npm run analyze:canva-only
npm run analyze:notion-only  
npm run analyze:gpts-only
```

### Continuous Analysis
```bash
npm run analyze:watch
```

## 📈 Understanding Your Results

### Analysis Output Structure
```
content-analysis-results/
├── comprehensive-analysis-report.json
├── platform-specific/
│   ├── canva-analysis.json
│   ├── notion-analysis.json
│   └── gpts-analysis.json
├── improvement-plans/
│   ├── quick-wins.json
│   ├── medium-effort.json
│   └── major-improvements.json
└── reports/
    ├── executive-summary.md
    └── detailed-analysis.md
```

### Key Metrics to Watch
- **Philosophy Consistency Score**: How well your content aligns across platforms
- **Educational Effectiveness**: How well each piece achieves learning goals
- **Engagement Score**: How interactive and engaging your content is
- **Jargon Score**: How accessible your language is to beginners

### Acting on Recommendations
1. **Quick Wins** (1-2 hours): Simple text changes, adding questions
2. **Medium Effort** (4-8 hours): Restructuring content, adding interactivity
3. **Major Improvements** (1-2 days): Redesigning content, adding gamification

## 🔄 Continuous Improvement Workflow

### Weekly Routine
1. **Monday**: Import new content created over the weekend
2. **Wednesday**: Run full analysis and review recommendations  
3. **Friday**: Implement quick wins and plan medium effort improvements

### Monthly Deep Dive
1. Review philosophy consistency trends
2. Implement major improvements
3. Update content mapping based on new insights
4. Refine analysis parameters

## 🚨 Troubleshooting

### Common Issues

**"Cannot connect to Canva API"**
- Check your API token in `.env`
- Verify your app has proper permissions
- Test with a simple API call

**"Notion pages not found"**
- Ensure integration has access to pages
- Check page/database IDs are correct
- Verify integration token permissions

**"GPT analysis incomplete"**
- Check if config files are properly formatted
- Ensure all required fields are present
- Validate JSON syntax

### Getting Help
- Check logs in `./logs/content-analysis.log`
- Run diagnostic: `npm run diagnose:content-sources`
- Review sample files in `./examples/`

## 🎯 Next Steps

Once integrated:
1. Run your first full analysis
2. Review the comprehensive report
3. Start with quick wins to see immediate improvements
4. Set up automated weekly analysis
5. Track your philosophy consistency over time

Ready to get started? Run:
```bash
npm run setup:content-sources
```