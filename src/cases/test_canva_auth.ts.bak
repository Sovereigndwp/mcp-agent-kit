#!/usr/bin/env tsx

// Test Canva API Authentication  
import 'dotenv/config';
import { canvaTools } from '../tools/canva_api.js';
import { logger } from '../utils/logger.js';
import { writeFileSync } from 'fs';

async function testAuthentication() {
  console.log('🔐 Testing Canva API Authentication');
  console.log('═'.repeat(50));

  try {
    // Test basic connection
    console.log('1️⃣ Testing API connection...');
    const connectionTest = await canvaTools.testConnection();
    
    console.log(`   Status: ${connectionTest.success ? '✅ Connected' : '❌ Failed'}`);
    console.log(`   Message: ${connectionTest.message}`);
    
    if (connectionTest.data) {
      console.log('\n📊 Connection Details:');
      if (connectionTest.data.api) {
        console.log(`   API Connected: ${connectionTest.data.api.connected ? '✅' : '❌'}`);
        console.log(`   API Key Configured: ${connectionTest.data.api.api_key_configured ? '✅' : '❌'}`);
        console.log(`   Capabilities: ${connectionTest.data.api.capabilities.join(', ')}`);
      }
      if (connectionTest.data.mcp) {
        console.log(`   MCP Connected: ${connectionTest.data.mcp.connected ? '✅' : '❌'}`);
        console.log(`   MCP Server: ${connectionTest.data.mcp.server_name}`);
      }
      console.log(`   Preferred Method: ${connectionTest.data.preferred_method}`);
    }

    if (!connectionTest.success) {
      console.log('\n❌ Authentication Failed');
      console.log('\n📋 Setup Checklist:');
      console.log('   □ Create Canva Developer account');
      console.log('   □ Create a new app in Canva Developers dashboard');
      console.log('   □ Get your App Secret (API Key)');
      console.log('   □ Add CANVA_API_KEY to .env file');
      console.log('   □ Ensure app has required scopes: design:read, design:write');
      
      console.log('\n📖 See CANVA_API_SETUP.md for detailed instructions');
      return;
    }

    // Test user profile access
    console.log('\n2️⃣ Testing user profile access...');
    const profileResult = await canvaTools.getUserProfile();
    
    if (profileResult.success) {
      console.log('   ✅ Profile accessed successfully');
      if (profileResult.data) {
        console.log(`   User: ${profileResult.data.display_name || 'N/A'}`);
        console.log(`   Account Type: ${profileResult.data.account?.type || 'N/A'}`);
        console.log(`   Team: ${profileResult.data.team?.name || 'Personal'}`);
      }
    } else {
      console.log('   ❌ Profile access failed');
      console.log(`   Error: ${profileResult.error}`);
    }

    // Test folder access for your course
    console.log('\n3️⃣ Testing course folder access...');
    const courseFolder = 'FAFxTnM3zZU';
    const folderResult = await canvaTools.listDesigns({ folder_id: courseFolder, limit: 5 });
    
    if (folderResult.success && folderResult.data.designs) {
      console.log(`   ✅ Course folder accessed: ${folderResult.data.designs.length} designs found`);
      
      if (folderResult.data.designs.length > 0) {
        console.log('\n📋 Sample designs in your course:');
        folderResult.data.designs.slice(0, 3).forEach((design: any, index: number) => {
          console.log(`   ${index + 1}. ${design.title || 'Untitled'} (${design.design_type || 'unknown'})`);
          if (design.urls?.edit_url) {
            console.log(`      Edit: ${design.urls.edit_url}`);
          }
        });
      }
    } else {
      console.log('   ⚠️ Course folder not accessible via API');
      console.log(`   This may be normal - folder might be private or need special permissions`);
    }

    // Test design creation capability
    console.log('\n4️⃣ Testing design creation...');
    const testDesign = await canvaTools.createDesign('instagram-post', 'Bitcoin API Test Design');
    
    if (testDesign.success) {
      console.log('   ✅ Design creation successful!');
      console.log(`   Created: ${testDesign.data.title || 'Test Design'}`);
      console.log(`   ID: ${testDesign.data.id}`);
      if (testDesign.data.urls?.edit_url) {
        console.log(`   Edit URL: ${testDesign.data.urls.edit_url}`);
      }
    } else {
      console.log('   ❌ Design creation failed');
      console.log(`   Error: ${testDesign.error}`);
      console.log('   This might require additional permissions or paid Canva account');
    }

    // Generate authentication report
    const authReport = {
      timestamp: new Date().toISOString(),
      authentication_status: connectionTest.success ? 'success' : 'failed',
      connection_details: connectionTest.data,
      user_profile: profileResult.data,
      folder_access: {
        course_folder_id: courseFolder,
        accessible: folderResult.success,
        designs_found: folderResult.success ? folderResult.data?.designs?.length : 0
      },
      design_creation: {
        capable: testDesign.success,
        test_design_id: testDesign.success ? testDesign.data?.id : null
      },
      next_steps: connectionTest.success ? [
        'Authentication successful - ready for programmatic editing',
        'Can proceed with course content updates',
        'Ready to implement automated Bitcoin data integration'
      ] : [
        'Complete Canva Developer setup',
        'Add API credentials to environment variables',
        'Verify app permissions and scopes'
      ]
    };

    writeFileSync('exports/canva_auth_test.json', JSON.stringify(authReport, null, 2));
    
    console.log('\n📄 Authentication report saved: exports/canva_auth_test.json');
    
    if (connectionTest.success) {
      console.log('\n🎉 Authentication Setup Complete!');
      console.log('   You can now proceed with programmatic course editing');
      console.log('   Next: Run npm run canva:edit-course to start updating your designs');
    } else {
      console.log('\n📋 Setup Required');
      console.log('   Follow the instructions in CANVA_API_SETUP.md');
      console.log('   Then re-run this test: npm run canva:test-auth');
    }

    logger.info('Canva authentication test completed', { success: connectionTest.success });

  } catch (error) {
    logger.error('Authentication test failed:', error);
    console.error('\n❌ Test failed with error:', error);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your .env file has CANVA_API_KEY');
    console.log('   2. Verify API key is correct (no extra spaces)');
    console.log('   3. Ensure Canva app has proper scopes');
    console.log('   4. Check Canva API status: https://status.canva.com/');
  }
}

testAuthentication().catch(console.error);