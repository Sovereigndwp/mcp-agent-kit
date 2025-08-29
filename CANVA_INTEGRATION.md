# 🎨 Canva Integration Guide

Your MCP Agent Kit now includes a powerful **CanvaAgent** that can programmatically manage your Canva designs!

## ✅ **What's Included**

### **🤖 CanvaAgent**
A comprehensive agent that connects to the Canva API to:
- List and search your designs
- Create new designs from templates 
- Export designs in multiple formats (PNG, JPG, PDF, MP4)
- Manage folders and organization
- Find Bitcoin-related designs automatically
- Perform batch operations

### **🛠️ Available Tools**
Your MCP system now includes **8 new Canva tools**:

1. **`list_canva_designs`** - List your designs with filtering
2. **`search_canva_designs`** - Search designs by query
3. **`get_canva_design`** - Get details of a specific design
4. **`create_canva_design`** - Create new designs
5. **`export_canva_design`** - Export designs in various formats
6. **`get_canva_export_status`** - Check export job status
7. **`get_bitcoin_canva_designs`** - Find Bitcoin-related designs
8. **`test_canva_connection`** - Test API connection

## 🔑 **Setup Instructions**

### **1. Get Your Canva API Key**
1. Visit [Canva Developers](https://www.canva.com/developers/)
2. Create a developer account or sign in
3. Create a new app to get your API key
4. Copy your API key

### **2. Configure Environment Variables**
```bash
# Add to your .env file
CANVA_API_KEY=your_canva_api_key_here
```

### **3. Test the Connection**
```bash
npm run demo
# The agent will show as available with Canva capabilities
```

## 🚀 **Usage Examples**

### **List Your Designs**
```typescript
// List all designs
const designs = await canvaTools.listDesigns();

// Search for specific designs
const bitcoinDesigns = await canvaTools.searchDesigns("bitcoin", 10);

// Get Bitcoin-related designs automatically
const cryptoDesigns = await canvaTools.getBitcoinDesigns();
```

### **Create New Designs**
```typescript
// Create a social media post
const newDesign = await canvaTools.createDesign("social-media-post", "Bitcoin Price Update");

// Create a presentation
const presentation = await canvaTools.createDesign("presentation", "Crypto Education");
```

### **Export Designs**
```typescript
// Export a design as PNG
const exportJob = await canvaTools.exportDesign("DESIGN_ID", "png");

// Check export status
const status = await canvaTools.getExportStatus(exportJob.data.job_id);

// When ready, download from status.data.download_url
```

## 🔧 **Advanced Features**

### **Batch Operations**
- Export multiple designs at once
- Search across multiple terms
- Bulk organize designs

### **Bitcoin Integration**
- Automatically finds Bitcoin/crypto related designs
- Can inject live price data into designs
- Perfect for educational content automation

### **Smart Search**
- Searches by title, tags, and content
- Filters by folders and date
- Supports pagination for large collections

## 🎯 **Use Cases**

### **Educational Content**
- Auto-update price information in designs
- Create consistent branding across materials
- Export course materials in multiple formats

### **Social Media Automation**
- Generate daily Bitcoin price graphics
- Create news sentiment visualizations
- Automate posting content creation

### **Business Operations**
- Bulk export marketing materials
- Organize designs by campaigns
- Maintain brand consistency

## 📊 **Integration with Bitcoin Tools**

The CanvaAgent works seamlessly with your existing Bitcoin tools:

```typescript
// Get Bitcoin price and update Canva design
const price = await bitcoinPriceTool.getBitcoinPrice();
const designs = await canvaTools.getBitcoinDesigns();

// Export all Bitcoin designs when price moves significantly
if (priceChange > 5) {
  const designIds = designs.data.designs.map(d => d.id);
  await canvaTools.batchExportDesigns(designIds, "png");
}
```

## 🛡️ **Security Notes**

- API keys are stored securely in environment variables
- All API calls are logged for debugging
- Authentication errors are handled gracefully
- No sensitive data is cached

## 🔄 **Current MCP Integration Status**

- ✅ **Agent Created**: CanvaAgent class with full API integration
- ✅ **Tools Registered**: 8 Canva tools available in MCP
- ✅ **TaskRouter Updated**: Agent registered with capabilities
- ✅ **Environment Setup**: Configuration ready
- ✅ **Build & Test**: Successfully integrated and tested

Your MCP Agent Kit now has **14 total tools** and **5 agents** including the new Canva integration!

## 🎉 **Ready to Use!**

Your CanvaAgent is now fully integrated and ready to automate your design workflows. Set up your API key and start managing your Canva designs programmatically!
