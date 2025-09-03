console.log('🎯 TESTING YOUR NOTION SETUP');
console.log('='.repeat(40));

async function testNotionSetup(): Promise<void> {
  try {
    console.log('🔍 Checking your environment variables...\n');

    // Check if Notion token exists
    const notionToken = process.env.NOTION_TOKEN;
    if (notionToken) {
      console.log(`✅ Notion token configured: ${notionToken.substring(0, 10)}...`);
    } else {
      console.log('❌ Notion token not found');
      return;
    }

    // Your workspace IDs
    const educationDbId = process.env.NOTION_EDUCATION_DATABASE_ID || '9c3f15adfd97457db2cb48727a560074';
    const educationPageId = process.env.NOTION_EDUCATION_PAGE_ID || '22db1980d8ed80ddb747e89a2344ed9a';
    
    console.log(`📊 Your Education Database ID: ${educationDbId}`);
    console.log(`📄 Your Education Page ID: ${educationPageId}`);

    // Test basic Notion API connection
    console.log('\n🔗 Testing Notion API connection...');

    const testResponse = await fetch(`https://api.notion.com/v1/pages/${educationPageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      }
    });

    if (testResponse.ok) {
      const pageData = await testResponse.json();
      console.log(`✅ Successfully connected to Notion!`);
      console.log(`📄 Page title: ${pageData.properties?.title?.title?.[0]?.plain_text || 'Untitled'}`);
      console.log(`📅 Created: ${new Date(pageData.created_time).toLocaleDateString()}`);
      console.log(`🔗 URL: ${pageData.url}`);

      // Test getting page content
      console.log('\n📖 Testing page content retrieval...');
      const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${educationPageId}/children`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${notionToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        }
      });

      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json();
        console.log(`✅ Retrieved ${blocksData.results?.length || 0} content blocks`);
        
        // Show first few blocks
        if (blocksData.results && blocksData.results.length > 0) {
          console.log('\n📝 Content preview:');
          blocksData.results.slice(0, 3).forEach((block: any, index: number) => {
            const type = block.type;
            let content = '';
            
            if (block[type]?.rich_text) {
              content = block[type].rich_text.map((text: any) => text.plain_text).join('');
            }
            
            console.log(`   ${index + 1}. [${type}] ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
          });
        }

        // Test database query if we have database access
        console.log('\n📊 Testing database access...');
        const dbResponse = await fetch(`https://api.notion.com/v1/databases/${educationDbId}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${notionToken}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          },
          body: JSON.stringify({ page_size: 5 })
        });

        if (dbResponse.ok) {
          const dbData = await dbResponse.json();
          console.log(`✅ Database access successful! Found ${dbData.results?.length || 0} pages`);
          
          if (dbData.results && dbData.results.length > 0) {
            console.log('\n📚 Your content pages:');
            dbData.results.forEach((page: any, index: number) => {
              const title = page.properties?.title?.title?.[0]?.plain_text || 
                           page.properties?.Name?.title?.[0]?.plain_text || 'Untitled';
              console.log(`   ${index + 1}. ${title}`);
            });
          }

          // Analyze content for Bitcoin education
          console.log('\n🎓 QUICK CONTENT ANALYSIS:');
          let bitcoinPages = 0;
          let educationalPages = 0;
          
          if (dbData.results) {
            for (const page of dbData.results) {
              const title = (page.properties?.title?.title?.[0]?.plain_text || 
                           page.properties?.Name?.title?.[0]?.plain_text || '').toLowerCase();
              
              if (title.includes('bitcoin') || title.includes('btc')) {
                bitcoinPages++;
              }
              
              if (title.includes('learn') || title.includes('teach') || 
                  title.includes('understand') || title.includes('guide')) {
                educationalPages++;
              }
            }
          }

          console.log(`   ₿ Bitcoin-related pages: ${bitcoinPages}/${dbData.results?.length || 0}`);
          console.log(`   🎓 Educational pages: ${educationalPages}/${dbData.results?.length || 0}`);
          
        } else {
          console.log(`⚠️  Database access failed: ${dbResponse.status} ${dbResponse.statusText}`);
          console.log('   This might be normal if you haven\'t shared the database with the integration');
        }

      } else {
        console.log(`❌ Failed to get page content: ${blocksResponse.status} ${blocksResponse.statusText}`);
      }

    } else {
      console.log(`❌ Failed to connect to Notion: ${testResponse.status} ${testResponse.statusText}`);
      
      if (testResponse.status === 401) {
        console.log('\n🔧 AUTHENTICATION ISSUE:');
        console.log('1. Check that your NOTION_TOKEN is correct');
        console.log('2. Make sure the integration has access to your pages');
      } else if (testResponse.status === 404) {
        console.log('\n🔧 PAGE NOT FOUND:');
        console.log('1. Check that the page ID is correct');
        console.log('2. Make sure you\'ve shared the page with your integration');
      }
    }

    console.log('\n🚀 NEXT STEPS:');
    console.log('If everything looks good, you can now run full content analysis!');
    console.log('Your agents can learn from all your Notion content to:');
    console.log('  ✅ Extract your teaching methodology');
    console.log('  ✅ Identify Bitcoin education patterns');
    console.log('  ✅ Generate optimized content for Twitter/Substack');
    console.log('  ✅ Maintain your authentic discovery-based voice');
    console.log('  ✅ Cross-reference with your partnership opportunities');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testNotionSetup()
  .then(() => {
    console.log('\n👋 Notion setup test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup test failed:', error);
    process.exit(1);
  });