# 🔑 How to Get Your Canva API Key - Step by Step

## 🚀 Quick Navigation
The Canva API is part of their "Canva Connect" platform. Here are the exact steps:

## Step 1: Access Canva Developers Portal
I just opened: https://www.canva.com/developers/ in your browser

**What you'll see:**
- Canva Connect platform page
- "Get started" or "Sign up" buttons

## Step 2: Create Developer Account
1. **Sign in** with your existing Canva account
2. **OR** create a new developer account if needed
3. Go to the **"Create an app"** section

## Step 3: Create Your App
1. Click **"Create an App"**
2. Fill out the form:
   - **App Name:** "Bitcoin Education MCP Agent" (or similar)
   - **App Description:** "Educational Bitcoin content with live data integration"
   - **Use Case:** Select "Education" or "Content Management"
   - **App Type:** Choose "Public" or "Private" (Private is fine for personal use)

## Step 4: Get Your API Credentials
After creating the app, you'll get:
- **Client ID** 
- **Client Secret**
- **API Base URL:** `https://api.canva.com/rest/v1`

## Step 5: Set Up Authentication
For your MCP agent, you need to set up OAuth2 flow. Here's a quick setup:

```bash
# Add these to your .env file
CANVA_CLIENT_ID=your_client_id_here
CANVA_CLIENT_SECRET=your_client_secret_here
CANVA_REDIRECT_URI=http://localhost:3000/callback
```

## Alternative: Quick Test with Personal Access Token

Some Canva developer accounts provide personal access tokens for testing:

1. Look for **"Personal Access Tokens"** in your developer dashboard
2. Generate a token for testing
3. Use it like this:

```bash
export CANVA_API_KEY="your_personal_token_here"
```

## 📋 If You're Having Trouble Finding It:

### Option A: Try the Direct Links
```bash
# I'll try opening more specific pages
```

Let me open some direct links for you:

