# 🚀 API Setup Guide - Interactive Instructions

Since the wizard needs interactive input, let's do this step-by-step with clear instructions:

## Step 1: Set Up Your API Keys

### 🎨 Canva API Setup (Recommended)

1. **Go to Canva Developers:**
   - Visit: https://developers.canva.com
   - Sign in with your Canva account
   - Click "Create an app"

2. **Create Your App:**
   - App name: `Content Analysis System`
   - App type: `Server-side integration`
   - Scopes needed: `design:read`, `design:content:read`

3. **Get Your Token:**
   - Copy your **API Token** from the app dashboard
   - Keep this safe - you'll need it in a moment

4. **Optional - Team ID:**
   - If you use Canva for Teams, get your team ID from Canva settings

### 📝 Notion API Setup (Recommended)

1. **Create Integration:**
   - Visit: https://www.notion.so/my-integrations
   - Click "New integration"
   - Name: `Content Philosophy Analyzer`
   - Select your workspace
   - Copy the **Internal Integration Token**

2. **Share Your Content:**
   - Go to your Notion pages/databases you want analyzed
   - Click "Share" → "Invite" → Add your integration
   - Give it "Read" access

3. **Get Page/Database IDs:**
   - Copy URLs of pages/databases you want analyzed
   - The ID is the string after the last `/` in the URL
   - Example: `https://notion.so/My-Page-abc123...` → ID is `abc123...`

### 🤖 OpenAI API (Optional)

1. **Get API Key:**
   - Visit: https://platform.openai.com/api-keys
   - Create new secret key
   - Copy the key

## Step 2: Configure Your System

Once you have your API keys, I'll help you configure them. Just let me know:

1. ✅ Which APIs you set up
2. 🔑 Whether you're ready to add the keys (I'll create a secure .env file)
3. 📋 Any page/database IDs you want to analyze

## Quick Start Option

If you want to start simple:
- ✅ **Just Notion**: Great for analyzing your educational content structure
- ✅ **Just Canva**: Perfect for analyzing your design effectiveness  
- ✅ **Both**: Full cross-platform analysis and insights

Let me know which option you chose and I'll guide you through the next steps!