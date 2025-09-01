import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { btc_price } from '../tools/btc_price.js';
import { mempoolFeeEstimatesTool } from '../tools/mempool_fee_estimates.js';
import { fxRateTool } from '../tools/fx_rate.js';
import { NewsScout } from '../agents/NewsScout.js';
import { SimulationBuilder } from '../agents/SimulationBuilder.js';
// Note: canva_snippet and bitcoin_learning_demo are scripts, not modules
import { bitcoinCurriculum } from '../cases/bitcoin_curriculum.js';
import { logger } from '../utils/logger.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('src/web/public'));

// Initialize agents
const newsScout = new NewsScout();
const simulationBuilder = new SimulationBuilder();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Bitcoin Price API
app.get('/api/bitcoin/price', async (req, res) => {
  try {
    const priceData = await btc_price();
    
    res.json({
      success: true,
      data: {
        price_usd: priceData.usd,
        price_cop: priceData.cop,
        currency: 'usd',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Bitcoin price API error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch Bitcoin price' });
  }
});

// Fee Estimates API
app.get('/api/bitcoin/fees', async (req, res) => {
  try {
    const estimates = await mempoolFeeEstimatesTool.getFeeEstimates();
    const congestion = await mempoolFeeEstimatesTool.getMempoolCongestion();
    
    res.json({
      success: true,
      data: {
        estimates,
        congestion,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Fee estimates API error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch fee estimates' });
  }
});

// News API
app.get('/api/news', async (req, res) => {
  try {
    const query = req.query.query as string;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const headlines = await newsScout.getLatestHeadlines(query, limit);
    const sentiment = await newsScout.analyzeSentiment(headlines);
    
    res.json({
      success: true,
      data: {
        headlines,
        sentiment,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('News API error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch news' });
  }
});

// Fee Simulation API
app.post('/api/simulation/create', async (req, res) => {
  try {
    const { transactionSize, targetConfirmations, urgency, btcAmount, currency } = req.body;
    
    const scenario = await simulationBuilder.createScenario({
      transactionSize: transactionSize || 250,
      targetConfirmations: targetConfirmations || 6,
      urgency: urgency || 'medium',
      btcAmount: btcAmount || 0.001,
      currency: currency || 'usd',
      name: 'Web Interface Simulation',
      description: 'Simulation created via web interface'
    });
    
    res.json({
      success: true,
      data: scenario
    });
  } catch (error) {
    logger.error('Simulation API error:', error);
    res.status(500).json({ success: false, error: 'Failed to create simulation' });
  }
});

// Cost Analysis API
app.post('/api/simulation/analyze', async (req, res) => {
  try {
    const { transactionSize, btcAmount } = req.body;
    
    const analysis = await simulationBuilder.analyzeCosts(
      transactionSize || 250,
      btcAmount || 0.001
    );
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Cost analysis API error:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze costs' });
  }
});

// Canva Snippets API
app.get('/api/canva/snippets', async (req, res) => {
  try {
    // TODO: Implement snippet generation API
    const snippets = { message: 'Canva snippets endpoint - not yet implemented' };
    
    res.json({
      success: true,
      data: snippets
    });
  } catch (error) {
    logger.error('Canva snippets API error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate snippets' });
  }
});

// Learning Demo API
app.get('/api/learning/demo', async (req, res) => {
  try {
    // Return learning demo structure without executing it
    res.json({
      success: true,
      data: {
        modules: [
          'learnAboutFees',
          'learnAboutBitcoinEconomics',
          'learnAboutMarketSentiment',
          'learnTransactionPlanning'
        ],
        description: 'Interactive Bitcoin learning modules'
      }
    });
  } catch (error) {
    logger.error('Learning demo API error:', error);
    res.status(500).json({ success: false, error: 'Failed to get learning demo' });
  }
});

// Curriculum API
app.get('/api/curriculum', async (req, res) => {
  try {
    const curriculum = bitcoinCurriculum.getCurriculum();
    
    res.json({
      success: true,
      data: curriculum
    });
  } catch (error) {
    logger.error('Curriculum API error:', error);
    res.status(500).json({ success: false, error: 'Failed to get curriculum' });
  }
});

// FX Rate API
app.get('/api/fx/rate', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        success: false, 
        error: 'Both "from" and "to" parameters are required' 
      });
    }
    
    const rate = await fxRateTool.getExchangeRate(from as string, to as string);
    
    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    logger.error('FX rate API error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch exchange rate' });
  }
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile('src/web/public/index.html');
});

// Start server
app.listen(PORT, () => {
  logger.info(`Web interface server running on http://localhost:${PORT}`);
  console.log(`🚀 MCP Agent Kit Web Interface`);
  console.log(`   📍 URL: http://localhost:${PORT}`);
  console.log(`   📊 API: http://localhost:${PORT}/api/health`);
  console.log(`   🎨 Canva: http://localhost:${PORT}/api/canva/snippets`);
  console.log(`   📚 Learning: http://localhost:${PORT}/api/curriculum`);
});

export { app };
