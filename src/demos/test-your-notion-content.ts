import { NotionContentAnalyzer } from '../agents/NotionContentAnalyzer.js';
import { contentMentorOrchestrator } from '../agents/ContentMentorOrchestrator.js';

console.log('🎯 TESTING YOUR NOTION CONTENT INTEGRATION');
console.log('='.repeat(50));

async function testYourNotionContent(): Promise<void> {
  try {
    console.log('🔍 Connecting to your Notion workspace...\n');

    // Your specific Notion IDs from the URL you shared
    const yourDatabaseId = process.env.NOTION_EDUCATION_DATABASE_ID || '9c3f15adfd97457db2cb48727a560074';
    const yourPageId = process.env.NOTION_EDUCATION_PAGE_ID || '22db1980d8ed80ddb747e89a2344ed9a';
    
    console.log(`📊 Database ID: ${yourDatabaseId}`);
    console.log(`📄 Page ID: ${yourPageId}`);

    // Create analyzer instance and test connection
    const analyzer = new NotionContentAnalyzer();
    const databases = await analyzer.connectToWorkspace({
      databaseIds: [yourDatabaseId],
      pageIds: [yourPageId]
    });

    console.log(`\n✅ Successfully connected! Found ${databases.length} database(s)`);

    for (const database of databases) {
      console.log(`\n📚 Database: "${database.title}"`);
      console.log(`   📄 Pages: ${database.pages.length}`);
      
      let bitcoinCount = 0;
      let educationalCount = 0;
      let totalWords = 0;
      
      for (const page of database.pages.slice(0, 5)) { // Show first 5 pages
        console.log(`\n   📝 Page: "${page.title}"`);
        console.log(`      📅 Created: ${new Date(page.created_time).toLocaleDateString()}`);
        console.log(`      📝 Content: ${page.content.length} characters`);
        console.log(`      🔗 URL: ${page.url}`);
        
        // Count words
        const words = page.content.split(/\s+/).length;
        totalWords += words;
        console.log(`      📊 Words: ${words}`);
        
        // Check for Bitcoin content
        if (page.content.toLowerCase().includes('bitcoin') || page.title.toLowerCase().includes('bitcoin')) {
          bitcoinCount++;
          console.log(`      ₿ Bitcoin Content: ✅`);
        }
        
        // Check for educational content
        const educationalKeywords = ['learn', 'teach', 'understand', 'discover', 'explain'];
        if (educationalKeywords.some(keyword => 
          page.content.toLowerCase().includes(keyword) || page.title.toLowerCase().includes(keyword)
        )) {
          educationalCount++;
          console.log(`      🎓 Educational Content: ✅`);
        }

        // Show content preview
        const preview = page.content.substring(0, 200) + (page.content.length > 200 ? '...' : '');
        console.log(`      📖 Preview: "${preview}"`);

        // Test content analysis on first page
        if (database.pages.indexOf(page) === 0 && page.content.length > 0) {
          console.log(`\n   🔬 ANALYZING "${page.title}" WITH YOUR CONTENT MENTOR:`);
          
          try {
            const analysis = await contentMentorOrchestrator.analyzeContentForPublishing(page.content, 'tweet');
            
            console.log(`      📊 Overall Score: ${Math.round(analysis.overall_score)}/100`);
            console.log(`      🎯 Authenticity: ${Math.round(analysis.authenticity.authenticity_score)}/100`);
            console.log(`      🎨 Brand Alignment: ${Math.round(analysis.brand_alignment)}/100`);
            console.log(`      ⚠️  AI Flags: ${analysis.authenticity.ai_flags.length}`);
            console.log(`      ✅ Human Elements: ${analysis.authenticity.human_elements.length}`);
            
            if (analysis.action_items.length > 0) {
              console.log(`      📝 Action Items:`);
              analysis.action_items.slice(0, 3).forEach(item => {
                console.log(`         ${item}`);
              });
            }

            if (analysis.optimized_content && analysis.optimized_content !== page.content) {
              console.log(`\n      ✨ OPTIMIZED VERSION (preview):`);
              const optimizedPreview = analysis.optimized_content.substring(0, 300) + '...';
              console.log(`      "${optimizedPreview}"`);
            }

          } catch (analysisError) {
            console.log(`      ❌ Analysis failed: ${analysisError.message}`);
          }
        }
      }

      console.log(`\n📊 CONTENT SUMMARY:`);
      console.log(`   📚 Total Pages: ${database.pages.length}`);
      console.log(`   ₿ Bitcoin Pages: ${bitcoinCount}/${database.pages.length} (${Math.round((bitcoinCount/database.pages.length)*100)}%)`);
      console.log(`   🎓 Educational Pages: ${educationalCount}/${database.pages.length} (${Math.round((educationalCount/database.pages.length)*100)}%)`);
      console.log(`   📝 Total Words: ${totalWords.toLocaleString()}`);

      // Generate content opportunities
      console.log(`\n💡 CONTENT OPPORTUNITIES:`);
      const opportunities = [
        `Convert ${Math.min(bitcoinCount, 10)} Bitcoin pages into Twitter thread series`,
        `Transform ${Math.min(educationalCount, 5)} educational pages into Substack articles`,
        `Create interactive exercises from ${Math.min(3, database.pages.length)} technical pages`,
        `Develop certification modules from advanced content`,
        `Extract key questions for discovery-based learning sequences`
      ];
      
      opportunities.forEach(opp => console.log(`   🚀 ${opp}`));
    }

    console.log('\n🎉 NOTION INTEGRATION SUCCESS!');
    console.log('Your content is ready for optimization and cross-platform publishing!');

  } catch (error) {
    console.error('💥 Notion integration test failed:', error.message);
    
    if (error.message.includes('Unauthorized')) {
      console.log('\n🔧 SETUP REQUIRED:');
      console.log('1. Go to https://www.notion.so/my-integrations');
      console.log('2. Create integration: "MCP Bitcoin Education Agent"');
      console.log('3. Copy token to .env file');
      console.log('4. Share your Notion pages with the integration');
    }
    
    if (error.message.includes('Not found')) {
      console.log('\n📋 CHECK PAGE ACCESS:');
      console.log('1. Make sure the integration has access to your pages');
      console.log('2. Verify the page/database IDs are correct');
      console.log('3. Check that the pages are not archived or deleted');
    }
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testYourNotionContent()
    .then(() => {
      console.log('\n👋 Your Notion content test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

export { testYourNotionContent };