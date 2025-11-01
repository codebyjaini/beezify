const express = require("express");
const cors = require("cors");
const { testConnection } = require('./db');
const { 
  fetchAllBeezieCollectibles,
  fetchBeezieCollectibles,
  fetchTokenDetails,
  fetchMultipleTokenDetails,
  transformDetailedTokenData 
} = require('./beezieService');
const { enrichWithAltData } = require('./altService');
const { upsertCollectibles } = require('./dbService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Test database connection on startup
testConnection();

// Simple health check endpoint
app.get("/", (req, res) => {
  console.log("Hello world request received!");
  res.send("Hello from Beezify! 🐝");
});

// API endpoint to get all collectibles
app.get("/api/collectibles", async (req, res) => {
  try {
    const { getCollectibles } = require('./dbService');
    
    // Get query parameters for filtering and pagination
    const limit = parseInt(req.query.limit) || 1000;
    const category = req.query.category;
    const grader = req.query.grader;
    const search = req.query.search;
    
    // Build query
    let query = 'SELECT * FROM collectible_details WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (category && category !== 'all') {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (grader && grader !== 'all') {
      query += ` AND grader = $${paramIndex}`;
      params.push(grader);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (
        LOWER(name) LIKE $${paramIndex} OR 
        LOWER(player_name) LIKE $${paramIndex} OR 
        LOWER(set_name) LIKE $${paramIndex} OR 
        LOWER(serial_number) LIKE $${paramIndex}
      )`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY last_updated DESC LIMIT $${paramIndex}`;
    params.push(limit);
    
    const { query: dbQuery } = require('./db');
    const result = await dbQuery(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching collectibles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collectibles',
      message: error.message
    });
  }
});

// API endpoint to get statistics
app.get("/api/stats", async (req, res) => {
  try {
    const { query: dbQuery } = require('./db');
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_items,
        SUM(beezie_price) as total_beezie_value,
        SUM(alt_market_value) as total_alt_value,
        AVG(beezie_price) as avg_price,
        COUNT(DISTINCT category) as total_categories,
        COUNT(DISTINCT grader) as total_graders
      FROM collectible_details
    `;
    
    const categoryQuery = `
      SELECT category, COUNT(*) as count 
      FROM collectible_details 
      WHERE category IS NOT NULL 
      GROUP BY category
    `;
    
    const graderQuery = `
      SELECT grader, COUNT(*) as count 
      FROM collectible_details 
      WHERE grader IS NOT NULL 
      GROUP BY grader
    `;
    
    const [statsResult, categoryResult, graderResult] = await Promise.all([
      dbQuery(statsQuery),
      dbQuery(categoryQuery),
      dbQuery(graderQuery)
    ]);
    
    res.json({
      success: true,
      stats: statsResult.rows[0],
      categories: categoryResult.rows,
      graders: graderResult.rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// API endpoint to trigger sync manually or via Cloud Scheduler
app.post("/api/sync", async (req, res) => {
  try {
    // Verify request is from Cloud Scheduler or authorized source
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.SYNC_TOKEN || 'your-secret-token-here';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Start sync in background - don't wait for it to complete
    console.log('🔄 Sync triggered via API endpoint');
    
    // Respond immediately so Cloud Run doesn't timeout
    res.json({
      success: true,
      message: 'Sync started in background',
      timestamp: new Date().toISOString()
    });

    // Run sync in background
    syncBeezieData().catch(err => {
      console.error('❌ Background sync error:', err);
    });

  } catch (error) {
    console.error('Error triggering sync:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger sync',
      message: error.message
    });
  }
});

// Categories configuration
const CATEGORIES = [
  { id: "1", name: "Pokemon", expectedCount: 9439 },
  { id: "2", name: "One Piece", expectedCount: 603 },
  { id: "3", name: "Basketball", expectedCount: 180 },
  { id: "4", name: "Football", expectedCount: 65 }
];

// Sync function - Processes categories in batches
async function syncBeezieData() {
  try {
    const startTime = new Date();
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔄 [${startTime.toISOString()}] Starting scheduled Beezie sync...`);
    console.log(`   Processing ALL categories in BATCHES`);
    console.log(`${'='.repeat(70)}\n`);
    
    let totalStats = { inserted: 0, updated: 0, failed: 0 };
    
    // Process each category sequentially
    for (const category of CATEGORIES) {
      console.log(`\n${'▸'.repeat(70)}`);
      console.log(`📂 Category: ${category.name} (ID: ${category.id})`);
      console.log(`   Expected: ~${category.expectedCount} items`);
      console.log(`${'▸'.repeat(70)}`);
      
      try {
        await processCategoryInBatches(category, totalStats);
      } catch (categoryError) {
        console.error(`❌ Error processing ${category.name}:`, categoryError.message);
        totalStats.failed += 1;
      }
    }
    
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2); // minutes
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ FULL SYNC COMPLETED in ${duration} minutes`);
    console.log(`   Total Inserted: ${totalStats.inserted} | Updated: ${totalStats.updated} | Failed: ${totalStats.failed}`);
    console.log(`${'='.repeat(70)}\n`);
  } catch (err) {
    console.error('❌ Error in scheduled sync:', err.message);
  }
}

/**
 * Process a single category - update database immediately as we fetch each item
 * @param {Object} category - Category configuration
 * @param {Object} totalStats - Running statistics object
 */
async function processCategoryInBatches(category, totalStats) {
  let page = 0;
  let processedCount = 0;
  let hasMore = true;
  
  while (hasMore) {
    // Fetch one page at a time
    console.log(`\n📦 Fetching page ${page}...`);
    const pageCollectibles = await fetchBeezieCollectibles(category.id, page, 40);
    
    if (!pageCollectibles || pageCollectibles.length === 0) {
      console.log(`📄 No more items at page ${page}`);
      hasMore = false;
      break;
    }
    
    console.log(`📋 Processing ${pageCollectibles.length} items from page ${page}...`);
    
    // Process each item immediately
    for (let i = 0; i < pageCollectibles.length; i++) {
      const item = pageCollectibles[i];
      processedCount++;
      
      try {
        // Fetch detailed information for this specific token
        console.log(`\n  [${processedCount}/${category.expectedCount}] Processing token ${item.tokenId}...`);
        const detailedToken = await fetchTokenDetails(item.tokenId);
        
        // Transform the detailed data
        const collectible = transformDetailedTokenData(detailedToken);
        
        // Enrich with ALT.xyz data (with rate limiting built in)
        console.log(`  🔗 Enriching with ALT.xyz data...`);
        try {
          const altData = await enrichWithAltData(collectible);
          collectible.alt_asset_id = altData.alt_asset_id;
          collectible.alt_market_value = altData.alt_market_value;
        } catch (altError) {
          console.log(`  ⚠️  ALT enrichment failed, continuing...`);
        }
        
        // Save immediately to database
        console.log(`  💾 Saving to database...`);
        const stats = await upsertCollectibles([collectible]);
        
        // Update running stats
        totalStats.inserted += stats.inserted;
        totalStats.updated += stats.updated;
        totalStats.failed += stats.failed;
        
        if (stats.inserted > 0) {
          console.log(`  ✅ Inserted new record`);
        } else if (stats.updated > 0) {
          console.log(`  ✅ Updated existing record`);
        }
        
        // Rate limiting - 1 second delay between items
        if (i < pageCollectibles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`  ❌ Error processing token ${item.tokenId}:`, error.message);
        totalStats.failed += 1;
      }
    }
    
    console.log(`\n📊 ${category.name} Progress: ${processedCount}/${category.expectedCount} items processed`);
    console.log(`   Stats so far - Inserted: ${totalStats.inserted} | Updated: ${totalStats.updated} | Failed: ${totalStats.failed}`);
    
    // If we got less than 40, this is the last page
    if (pageCollectibles.length < 40) {
      hasMore = false;
    }
    
    // Move to next page
    page++;
    
    // Small delay between pages
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ ${category.name} COMPLETE: ${processedCount} items processed`);
}

// Note: For Cloud Run deployment, use Google Cloud Scheduler to call /api/sync endpoint
// Cloud Run instances are request-based and will shut down without active requests
// Local development: uncomment the lines below to run sync on startup
// setTimeout(() => {
//   console.log('🚀 Running initial sync...');
//   syncBeezieData();
// }, 5000);

// Note: node-cron doesn't work well on Cloud Run (instances get shut down)
// Use Google Cloud Scheduler instead to POST to /api/sync endpoint every 6 hours
if (process.env.NODE_ENV === 'development') {
  console.log('⏰ Running in development mode - sync can be triggered via /api/sync endpoint');
} else {
  console.log('☁️  Running in production mode - configure Google Cloud Scheduler to POST to /api/sync');
}

app.listen(PORT, () => {
  console.log(`🐝 Beezify server listening on port ${PORT}`);
  console.log(`📅 Scheduled sync: Every 6 hours (processing ~10,287 total items)`);
  console.log(`   - Pokemon: ~9,439 items`);
  console.log(`   - One Piece: ~603 items`);
  console.log(`   - Basketball: ~180 items`);
  console.log(`   - Football: ~65 items`);
});

syncBeezieData().catch(err => {
  console.error('❌ Initial sync error:', err);
});