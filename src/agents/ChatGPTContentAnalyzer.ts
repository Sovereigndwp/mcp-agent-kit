import { securityManager } from '../core/SecurityManager.js';
import { MCPError, ErrorCode, RetryHandler } from '../core/ErrorHandler.js';

export interface ChatGPTConversation {
  id: string;
  title: string;
  messages: ChatGPTMessage[];
  created_at: string;
  updated_at: string;
  model: string;
  total_tokens?: number;
}

export interface ChatGPTMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  token_count?: number;
}

export interface CustomGPTInstruction {
  name: string;
  description: string;
  instructions: string;
  conversation_starters: string[];
  knowledge_files: string[];
  capabilities: string[];
  created_at: string;
}

export interface ChatGPTContentAnalysis {
  total_conversations: number;
  total_messages: number;
  user_messages: number;
  assistant_messages: number;
  educational_conversations: ChatGPTConversation[];
  bitcoin_conversations: ChatGPTConversation[];
  teaching_patterns: string[];
  question_patterns: string[];
  custom_gpts: CustomGPTInstruction[];
  improvement_suggestions: string[];
  content_opportunities: string[];
}

export class ChatGPTContentAnalyzer {
  private openaiApiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    if (!this.openaiApiKey) {
      console.warn('⚠️  OpenAI API key not configured. Set OPENAI_API_KEY environment variable.');
    }
  }

  // Method 1: Analyze exported ChatGPT data (JSON file)
  async analyzeExportedData(exportData: any): Promise<ChatGPTContentAnalysis> {
    try {
      // ChatGPT export format varies, handle different structures
      const conversations = this.parseConversations(exportData);
      const customGPTs = this.parseCustomGPTs(exportData);

      return await this.analyzeConversations(conversations, customGPTs);
    } catch (error) {
      throw MCPError.fromError(error as Error, 'chatgpt-analyzer');
    }
  }

  // Method 2: Direct API integration (for real-time analysis)
  async connectToOpenAI(): Promise<{
    models: string[];
    usage_stats: any;
    available_features: string[];
  }> {
    if (!this.openaiApiKey) {
      throw new MCPError(
        ErrorCode.UNAUTHORIZED,
        'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.',
        { setup_instructions: this.getOpenAISetupInstructions() }
      );
    }

    return RetryHandler.withRetry(async () => {
      // Get available models
      const modelsResponse = await fetch(`${this.baseUrl}/models`, {
        headers: this.getOpenAIHeaders()
      });

      if (!modelsResponse.ok) {
        throw new MCPError(
          ErrorCode.EXTERNAL_API_ERROR,
          `OpenAI API error: ${modelsResponse.status} ${modelsResponse.statusText}`
        );
      }

      const modelsData = await modelsResponse.json();

      return {
        models: modelsData.data.map((m: any) => m.id),
        usage_stats: { note: 'Usage stats require additional API access' },
        available_features: [
          'Chat Completions',
          'Content Analysis',
          'Educational Assistant Creation',
          'Bitcoin Content Generation'
        ]
      };
    });
  }

  // Method 3: Custom GPT instruction analysis
  async analyzeCustomGPTInstructions(instructions: CustomGPTInstruction[]): Promise<{
    educational_alignment: number;
    bitcoin_focus: number;
    discovery_approach: number;
    improvement_suggestions: string[];
    brand_consistency: number;
  }> {
    let educationalScore = 0;
    let bitcoinScore = 0;
    let discoveryScore = 0;
    let brandScore = 0;
    const improvements: string[] = [];

    for (const gpt of instructions) {
      const text = (gpt.instructions + ' ' + gpt.description).toLowerCase();
      
      // Educational alignment
      const educationalKeywords = ['teach', 'learn', 'explain', 'understand', 'discover', 'guide'];
      const eduMatches = educationalKeywords.filter(k => text.includes(k)).length;
      educationalScore += (eduMatches / educationalKeywords.length) * 100;

      // Bitcoin focus
      const bitcoinKeywords = ['bitcoin', 'btc', 'cryptocurrency', 'blockchain', 'satoshi'];
      const btcMatches = bitcoinKeywords.filter(k => text.includes(k)).length;
      bitcoinScore += (btcMatches / bitcoinKeywords.length) * 100;

      // Discovery approach
      const discoveryKeywords = ['question', 'ask', 'think', 'explore', 'discover', 'what if'];
      const discMatches = discoveryKeywords.filter(k => text.includes(k)).length;
      discoveryScore += (discMatches / discoveryKeywords.length) * 100;

      // Brand consistency (orange-yellow, discovery-based)
      if (text.includes('question') || text.includes('socratic')) brandScore += 25;
      if (text.includes('discover') || text.includes('explore')) brandScore += 25;
      if (text.includes('first principles')) brandScore += 25;
      if (text.includes('authentic') || text.includes('personal')) brandScore += 25;

      // Generate improvements
      if (!text.includes('question')) {
        improvements.push(`Add question-first approach to "${gpt.name}"`);
      }
      if (!text.includes('bitcoin') && !text.includes('btc')) {
        improvements.push(`Make "${gpt.name}" more Bitcoin-specific`);
      }
      if (text.includes('here are') || text.includes('let me list')) {
        improvements.push(`Replace list-first language in "${gpt.name}" with discovery approach`);
      }
    }

    return {
      educational_alignment: educationalScore / instructions.length,
      bitcoin_focus: bitcoinScore / instructions.length,
      discovery_approach: discoveryScore / instructions.length,
      brand_consistency: brandScore / instructions.length,
      improvement_suggestions: improvements
    };
  }

  private parseConversations(exportData: any): ChatGPTConversation[] {
    const conversations: ChatGPTConversation[] = [];

    try {
      // Handle different ChatGPT export formats
      let conversationData: any[] = [];

      if (Array.isArray(exportData)) {
        conversationData = exportData;
      } else if (exportData.conversations) {
        conversationData = exportData.conversations;
      } else if (exportData.data) {
        conversationData = exportData.data;
      }

      for (const conv of conversationData) {
        const messages: ChatGPTMessage[] = [];
        
        // Parse messages from conversation
        if (conv.mapping) {
          // ChatGPT export format with mapping
          Object.values(conv.mapping).forEach((node: any) => {
            if (node.message && node.message.content && node.message.content.parts) {
              messages.push({
                id: node.message.id || Math.random().toString(36),
                role: node.message.author?.role || 'user',
                content: node.message.content.parts.join(' '),
                timestamp: node.message.create_time ? new Date(node.message.create_time * 1000).toISOString() : new Date().toISOString(),
                model: node.message.metadata?.model_slug
              });
            }
          });
        } else if (conv.messages) {
          // Direct messages format
          messages.push(...conv.messages.map((msg: any) => ({
            id: msg.id || Math.random().toString(36),
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp || new Date().toISOString(),
            model: msg.model
          })));
        }

        if (messages.length > 0) {
          conversations.push({
            id: conv.id || Math.random().toString(36),
            title: conv.title || 'Untitled Conversation',
            messages: messages.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            ),
            created_at: conv.create_time ? new Date(conv.create_time * 1000).toISOString() : new Date().toISOString(),
            updated_at: conv.update_time ? new Date(conv.update_time * 1000).toISOString() : new Date().toISOString(),
            model: messages.find(m => m.model)?.model || 'unknown'
          });
        }
      }
    } catch (error) {
      console.warn('⚠️  Error parsing conversations:', error.message);
    }

    return conversations;
  }

  private parseCustomGPTs(exportData: any): CustomGPTInstruction[] {
    // Custom GPTs are typically stored separately
    // This would need to be provided separately or extracted from ChatGPT interface
    return [];
  }

  private async analyzeConversations(
    conversations: ChatGPTConversation[],
    customGPTs: CustomGPTInstruction[]
  ): Promise<ChatGPTContentAnalysis> {
    const allMessages = conversations.flatMap(c => c.messages);
    const userMessages = allMessages.filter(m => m.role === 'user');
    const assistantMessages = allMessages.filter(m => m.role === 'assistant');

    // Filter educational conversations
    const educationalConversations = conversations.filter(conv =>
      this.isEducationalContent(conv.title, conv.messages.map(m => m.content).join(' '))
    );

    // Filter Bitcoin conversations
    const bitcoinConversations = conversations.filter(conv =>
      this.isBitcoinContent(conv.title, conv.messages.map(m => m.content).join(' '))
    );

    // Extract teaching patterns
    const teachingPatterns = this.extractTeachingPatterns(assistantMessages);

    // Extract question patterns
    const questionPatterns = this.extractQuestionPatterns(userMessages);

    // Generate improvement suggestions
    const improvementSuggestions = this.generateChatGPTImprovements(conversations);

    // Find content opportunities
    const contentOpportunities = this.findContentOpportunities(conversations);

    return {
      total_conversations: conversations.length,
      total_messages: allMessages.length,
      user_messages: userMessages.length,
      assistant_messages: assistantMessages.length,
      educational_conversations: educationalConversations,
      bitcoin_conversations: bitcoinConversations,
      teaching_patterns: teachingPatterns,
      question_patterns: questionPatterns,
      custom_gpts: customGPTs,
      improvement_suggestions: improvementSuggestions,
      content_opportunities: contentOpportunities
    };
  }

  private isEducationalContent(title: string, content: string): boolean {
    const educationalKeywords = [
      'teach', 'learn', 'education', 'tutorial', 'guide', 'course',
      'lesson', 'explain', 'understand', 'concept', 'principle',
      'how to', 'what is', 'why does', 'discover', 'explore'
    ];

    const text = (title + ' ' + content).toLowerCase();
    return educationalKeywords.some(keyword => text.includes(keyword));
  }

  private isBitcoinContent(title: string, content: string): boolean {
    const bitcoinKeywords = [
      'bitcoin', 'btc', 'cryptocurrency', 'blockchain', 'satoshi',
      'mining', 'wallet', 'transaction', 'block', 'hash', 'node',
      'lightning', 'multisig', 'utxo', 'mempool', 'difficulty',
      'halving', 'proof of work', 'private key', 'public key'
    ];

    const text = (title + ' ' + content).toLowerCase();
    return bitcoinKeywords.some(keyword => text.includes(keyword));
  }

  private extractTeachingPatterns(messages: ChatGPTMessage[]): string[] {
    const patterns = new Set<string>();

    for (const message of messages) {
      const content = message.content.toLowerCase();
      
      if (content.includes('let me explain') || content.includes('here\'s how')) {
        patterns.add('Direct explanation approach');
      }
      if (content.includes('think about') || content.includes('consider')) {
        patterns.add('Reflective questioning');
      }
      if (content.includes('for example') || content.includes('imagine')) {
        patterns.add('Example-based teaching');
      }
      if (content.includes('step by step') || content.includes('first,')) {
        patterns.add('Sequential instruction');
      }
      if (content.includes('why do you think') || content.includes('what might happen')) {
        patterns.add('Socratic questioning');
      }
    }

    return Array.from(patterns);
  }

  private extractQuestionPatterns(messages: ChatGPTMessage[]): string[] {
    const patterns = new Set<string>();

    for (const message of messages) {
      const content = message.content.toLowerCase();
      
      if (content.includes('what is') || content.includes('what are')) {
        patterns.add('Definitional questions');
      }
      if (content.includes('how do') || content.includes('how can')) {
        patterns.add('Process questions');
      }
      if (content.includes('why does') || content.includes('why is')) {
        patterns.add('Causal questions');
      }
      if (content.includes('help me understand') || content.includes('explain')) {
        patterns.add('Clarification requests');
      }
      if (content.includes('bitcoin') && content.includes('?')) {
        patterns.add('Bitcoin-specific inquiries');
      }
    }

    return Array.from(patterns);
  }

  private generateChatGPTImprovements(conversations: ChatGPTConversation[]): string[] {
    const suggestions: string[] = [];
    
    const allContent = conversations.flatMap(c => c.messages.map(m => m.content)).join(' ').toLowerCase();

    // Check for generic AI responses
    if (allContent.includes('as an ai') || allContent.includes('i\'m an ai')) {
      suggestions.push('Create custom GPTs that avoid generic AI disclaimers');
    }

    // Check for list-heavy responses
    const listCount = (allContent.match(/here are \d+|1\.|2\.|3\./g) || []).length;
    if (listCount > 10) {
      suggestions.push('Transform list-based responses to question-first discovery approach');
    }

    // Check for Bitcoin education opportunities
    if (allContent.includes('cryptocurrency') && !allContent.includes('bitcoin-specific')) {
      suggestions.push('Focus ChatGPT conversations specifically on Bitcoin rather than general crypto');
    }

    // Check for authentic voice
    if (!allContent.includes('what do you think') && !allContent.includes('what if')) {
      suggestions.push('Add more question-first prompts to encourage discovery learning');
    }

    return suggestions;
  }

  private findContentOpportunities(conversations: ChatGPTConversation[]): string[] {
    const opportunities: string[] = [];

    for (const conv of conversations) {
      if (this.isEducationalContent(conv.title, conv.messages.map(m => m.content).join(' '))) {
        opportunities.push(`Convert conversation "${conv.title}" into educational content`);
      }

      if (conv.messages.length > 10) {
        opportunities.push(`Long conversation "${conv.title}" could become a comprehensive guide`);
      }

      const userQuestions = conv.messages.filter(m => 
        m.role === 'user' && m.content.includes('?')
      );
      if (userQuestions.length > 3) {
        opportunities.push(`Q&A pattern in "${conv.title}" could become FAQ content`);
      }
    }

    return opportunities;
  }

  private getOpenAIHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.openaiApiKey}`,
      'Content-Type': 'application/json'
    };
  }

  private getOpenAISetupInstructions(): {
    steps: string[];
    api_url: string;
    permissions_needed: string[];
  } {
    return {
      steps: [
        '1. Go to https://platform.openai.com/api-keys',
        '2. Click "Create new secret key"',
        '3. Name it "MCP Bitcoin Education Agent"',
        '4. Copy the API key',
        '5. Add it to your .env file as OPENAI_API_KEY=your_key_here',
        '6. For ChatGPT data analysis:',
        '   - Go to https://chatgpt.com/settings',
        '   - Click "Data controls" → "Export data"',
        '   - Download your conversations.json file',
        '   - Use the analyzeExportedData method with this file'
      ],
      api_url: 'https://platform.openai.com/api-keys',
      permissions_needed: [
        'API access to OpenAI',
        'ChatGPT conversation export (manual)',
        'Custom GPT instruction access (manual)'
      ]
    };
  }

  // Generate setup instructions for the user
  generateIntegrationInstructions(): string {
    return `
# 🤖 CHATGPT CONTENT INTEGRATION INSTRUCTIONS

## 📊 Method 1: Export & Analyze Your ChatGPT Data

### Step 1: Export Your ChatGPT Conversations
1. Go to https://chatgpt.com/settings
2. Click "Data controls" → "Export data"  
3. Wait for the export email (up to 24 hours)
4. Download the \`conversations.json\` file

### Step 2: Analyze Your Conversations
\`\`\`typescript
// Load your exported data
const exportData = JSON.parse(fs.readFileSync('conversations.json', 'utf8'));

// Analyze with the agent
const analysis = await chatGPTContentAnalyzer.analyzeExportedData(exportData);
\`\`\`

## 🔑 Method 2: OpenAI API Integration

### Step 1: Get OpenAI API Key
${this.getOpenAISetupInstructions().steps.map(step => `${step}`).join('\n')}

### Step 2: Real-time Content Analysis
\`\`\`typescript
// Connect to OpenAI API
const connection = await chatGPTContentAnalyzer.connectToOpenAI();

// Use for real-time content generation and analysis
\`\`\`

## 📝 Method 3: Custom GPT Instructions

### Export Your Custom GPT Instructions:
1. Go to each of your Custom GPTs
2. Copy the "Instructions" section
3. Create a JSON file with this format:

\`\`\`json
[
  {
    "name": "Bitcoin Education Assistant",
    "description": "Helps teach Bitcoin through discovery",
    "instructions": "Your full instruction text here...",
    "conversation_starters": ["What is Bitcoin?", "How does mining work?"],
    "knowledge_files": ["bitcoin_basics.pdf"],
    "capabilities": ["web_browsing", "code_interpreter"],
    "created_at": "2024-01-01T00:00:00Z"
  }
]
\`\`\`

## 🎯 What The Agent Will Analyze:

### From Your ChatGPT Conversations:
✅ Educational vs casual conversations
✅ Bitcoin-specific discussion patterns  
✅ Your teaching methodology preferences
✅ Question patterns you use most
✅ Content that could become educational material

### From Your Custom GPTs:
✅ Educational alignment with your brand
✅ Bitcoin focus vs generic crypto
✅ Discovery-based approach usage
✅ Brand consistency with your voice

### Analysis Results:
📊 Total conversations and educational content ratio
🎓 Teaching patterns you naturally use
₿ Bitcoin education opportunities
🔍 Authenticity vs AI-like language patterns
💡 Content opportunities for your platform
🎯 Improvements for brand alignment

## 🚀 Integration Benefits:

1. **Learn Your Teaching Style**: Understand how you naturally explain Bitcoin
2. **Content Mining**: Find existing conversations that could become educational content
3. **Brand Consistency**: Ensure your ChatGPT interactions match your discovery-based approach
4. **Question Patterns**: Identify the types of questions that lead to best educational outcomes
5. **Custom GPT Optimization**: Improve your custom GPTs to match your authentic voice

Run the analysis and the agent will provide specific recommendations for:
- Converting ChatGPT conversations into Twitter threads
- Optimizing Custom GPT instructions for discovery learning
- Finding content gaps in your existing material
- Aligning your ChatGPT usage with your brand voice
`;
  }
}

export const chatGPTContentAnalyzer = new ChatGPTContentAnalyzer();