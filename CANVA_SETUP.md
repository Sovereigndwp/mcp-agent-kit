# 🔑 Canva API Setup Guide

## Quick Setup Options

### Option 1: Canva Connect API (Recommended for Personal Use)
1. Go to [Canva Connect](https://www.canva.com/developers/)
2. Create a new app or use existing
3. Get your API key
4. Add to your environment:

```bash
export CANVA_API_KEY="your_api_key_here"
```

### Option 2: Use Environment File
Create a `.env` file in your project root:

```bash
# Add this to /Users/dalia/projects/mcp-agent-kit/.env
CANVA_API_KEY=your_api_key_here
```

### Option 3: MCP Server Integration (Already Configured!)
You mentioned having a `canva-dev` MCP server configured. This might work through the MCP protocol instead of direct API calls.

## Test Your Connection

Once you have the API key set up, run:

```bash
npm run improve:folder
```

## What You'll Get Once Connected:

✅ **Direct folder access** to https://www.canva.com/folder/FAFxTnM3zZU  
✅ **Live Bitcoin data integration** with your existing designs  
✅ **Automated design creation** based on current market conditions  
✅ **Bulk import CSV** for Canva Bulk Create feature  
✅ **Design improvement suggestions** specific to your portfolio  

## Current Bitcoin Context for Your Designs:
- **Price:** $108,714 (Above $100K milestone!)
- **Fees:** 1 sat/vB (Extremely low - perfect for educational content)
- **Opportunity:** High market attention + low transaction costs = ideal teaching moment

## Alternative: Manual Import
Even without API access, you can still use the generated designs:

1. **Run the workflow:**
   ```bash
   npm run workflow
   ```

2. **Import to Canva:** Use the generated CSV files in Canva Bulk Create

3. **Manual enhancement:** Follow the design instructions provided

Your MCP agent system is ready - just need that API connection! 🚀
