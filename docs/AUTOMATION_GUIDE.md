



# 🤖 Bitcoin Course Automation Guide

## Overview

Your Bitcoin education course now has **fully automated daily updates** that keep content fresh with live market data, network conditions, and educational prompts.

## 🚀 Quick Start

### Start Automation
```bash
# Start continuous automation (runs in background)
npm run automation start

# Check current status
npm run automation status

# Force immediate update
npm run automation force-update
```

## ⚙️ How It Works

### 🕐 **Daily Schedule**
- **Default**: Every day at 8:00 AM EST
- **Smart Updates**: Only updates when significant changes occur
- **Configurable**: Change schedule via configuration

### 📊 **Update Triggers**

The system automatically updates your course when:

1. **Price Changes**: Bitcoin price moves by 5% or more
2. **Fee Changes**: Network fees double or halve  
3. **Daily Schedule**: Forced update every 24 hours
4. **Manual**: When you trigger `force-update`

### 🎨 **What Gets Updated**

Each automation run updates your course designs with:

✅ **Current Bitcoin Price**: $124K (live data)  
✅ **Network Status**: 🟢 Low congestion (2 sat/vB)  
✅ **Educational Prompts**: Fresh Socratic questions  
✅ **Color Psychology**: Green for low fees, red for high fees  
✅ **Timestamp**: Always shows when last updated  

## 📋 **Management Commands**

### Status Check
```bash
npm run automation status
```
Shows:
- ✅ Enabled/Disabled status
- ⏰ Schedule and timezone  
- 📊 Update history (successful/failed)
- ⚙️ Current configuration

### Configuration
```bash
# Change schedule (twice daily: 6 AM & 6 PM)
npm run automation configure schedule "0 6,18 * * *"

# More sensitive to price changes (3% threshold)
npm run automation configure price_change_percent 3

# Less sensitive to fee changes (3x threshold)
npm run automation configure fee_change_multiplier 3

# Enable/disable automation
npm run automation configure enabled true
```

### Force Update
```bash
# Trigger immediate update regardless of conditions
npm run automation force-update
```

## 📈 **Current Configuration**

```json
{
  "enabled": true,
  "schedule": "0 8 * * *",
  "timezone": "America/New_York",
  "update_threshold": {
    "price_change_percent": 5,
    "fee_change_multiplier": 2
  },
  "notifications": {
    "success": true,
    "errors": true
  },
  "backup_retention_days": 30
}
```

## 📁 **File Structure**

```
exports/course_updates/
├── latest_update.json          # Most recent update details
├── automation_history.json     # Complete update history
└── auto_update_[timestamp].json # Individual update reports

config/
└── automation_config.json      # Automation settings

logs/
└── [automated logs]            # System logs
```

## 🔄 **Automation Flow**

1. **Scheduled Check**: System wakes up at scheduled time
2. **Data Fetch**: Gets current Bitcoin price & network fees  
3. **Change Analysis**: Compares with last update
4. **Decision**: Updates only if significant changes detected
5. **Course Update**: Creates new designs with current data
6. **History**: Saves update report and cleans old backups

## 🎯 **Latest Update Results**

**Last Run**: August 31, 2025 at 9:22 AM  
**Bitcoin Context**: $124,394.00, Low congestion (2 sat/vB)  
**Updates Applied**: 2 designs successfully updated  
**Next Check**: September 1, 2025 at 9:22 AM  

**Created Designs**:
- Bitcoin Introduction - Updated 2025-08-31
- Understanding Transaction Fees - Updated 2025-08-31

## 🔧 **System Service Installation** 

For 24/7 operation on a server:

```bash
# Show installation instructions
npm run automation install-service
```

This creates a systemd service that:
- ✅ Starts automatically on boot
- ✅ Restarts if it crashes  
- ✅ Runs continuously in background
- ✅ Logs all activity

## 🚨 **Monitoring & Alerts**

### Success Notifications
- ✅ Displays when course updated successfully
- 📊 Shows number of designs updated
- 🔗 Provides edit URLs for new designs

### Error Handling
- ❌ Reports failed updates with details
- 🔄 Automatic retry logic
- 📝 Comprehensive error logging

### History Tracking
- 📈 Complete update history
- 📊 Success/failure statistics  
- 🧹 Automatic cleanup of old records (30 days)

## 🎓 **Educational Content Integration**

Each update includes fresh educational prompts:

**Fee Questions**:
- "How is a Bitcoin transaction fee similar to postage on a letter?"
- "If Bitcoin blocks have limited space, how should we decide which transactions go first?"

**Wallet Questions**:
- "What happens if you lose your private keys?"
- "How is a Bitcoin wallet different from a bank account?"

**Security Questions**:
- "How does cryptography protect your Bitcoin?"
- "What would happen if someone controlled 51% of mining power?"

## 🔮 **Next Steps**

With automation running, your course will:

1. **Stay Current**: Always reflects live market conditions
2. **Engage Students**: Fresh questions keep learning active
3. **Build Trust**: Professional, up-to-date content
4. **Scale Efficiently**: No manual intervention needed

---

## 📞 **Support**

- **Logs**: Check `logs/` directory for detailed information
- **Status**: Run `npm run automation status` for health check
- **History**: Review `exports/course_updates/automation_history.json`

**🎉 Your Bitcoin course is now fully automated and will stay current with live market data!**