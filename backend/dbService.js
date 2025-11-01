const { query, pool } = require('./db');

/**
 * Insert or update collectibles in the database using batch operations
 * @param {Array} collectibles - Array of collectible objects
 * @returns {Promise<Object>} Result with counts of inserted and updated records
 */
async function upsertCollectibles(collectibles) {
  if (!collectibles || collectibles.length === 0) {
    console.log('⚠️  No collectibles to insert');
    return { inserted: 0, updated: 0, failed: 0 };
  }

  let inserted = 0;
  let updated = 0;
  let failed = 0;

  console.log(`💾 Starting to upsert ${collectibles.length} collectibles using batch operations...`);

  // Use PostgreSQL's ON CONFLICT for efficient upserts
  const batchSize = 50; // Process 50 records at a time
  
  for (let i = 0; i < collectibles.length; i += batchSize) {
    const batch = collectibles.slice(i, i + batchSize);
    
    try {
      // Build multi-row insert with ON CONFLICT
      const values = [];
      const placeholders = [];
      let paramIndex = 1;
      
      batch.forEach((collectible, idx) => {
        const rowPlaceholders = [];
        for (let j = 0; j < 17; j++) {
          rowPlaceholders.push(`$${paramIndex++}`);
        }
        placeholders.push(`(${rowPlaceholders.join(', ')})`);
        
        values.push(
          collectible.beezie_token_id,
          collectible.name,
          collectible.image_url,
          collectible.beezie_price,
          collectible.serial_number,
          collectible.year,
          collectible.grader,
          collectible.grade,
          collectible.player_name,
          collectible.set_name,
          collectible.card_number,
          collectible.category,
          collectible.language,
          collectible.alt_asset_id,
          collectible.alt_market_value,
          collectible.last_updated || new Date(),
          new Date() // created_at
        );
      });
      
      const upsertQuery = `
        INSERT INTO collectible_details (
          beezie_token_id,
          name,
          image_url,
          beezie_price,
          serial_number,
          year,
          grader,
          grade,
          player_name,
          set_name,
          card_number,
          category,
          language,
          alt_asset_id,
          alt_market_value,
          last_updated,
          created_at
        ) VALUES ${placeholders.join(', ')}
        ON CONFLICT (beezie_token_id) 
        DO UPDATE SET
          name = COALESCE(EXCLUDED.name, collectible_details.name),
          image_url = COALESCE(EXCLUDED.image_url, collectible_details.image_url),
          beezie_price = EXCLUDED.beezie_price,
          serial_number = COALESCE(EXCLUDED.serial_number, collectible_details.serial_number),
          year = COALESCE(EXCLUDED.year, collectible_details.year),
          grader = COALESCE(EXCLUDED.grader, collectible_details.grader),
          grade = COALESCE(EXCLUDED.grade, collectible_details.grade),
          player_name = COALESCE(EXCLUDED.player_name, collectible_details.player_name),
          set_name = COALESCE(EXCLUDED.set_name, collectible_details.set_name),
          card_number = COALESCE(EXCLUDED.card_number, collectible_details.card_number),
          category = COALESCE(EXCLUDED.category, collectible_details.category),
          language = COALESCE(EXCLUDED.language, collectible_details.language),
          alt_asset_id = COALESCE(EXCLUDED.alt_asset_id, collectible_details.alt_asset_id),
          alt_market_value = COALESCE(EXCLUDED.alt_market_value, collectible_details.alt_market_value),
          last_updated = EXCLUDED.last_updated
        RETURNING (xmax = 0) AS inserted
      `;
      
      const result = await query(upsertQuery, values);
      
      // Count inserts vs updates
      result.rows.forEach(row => {
        if (row.inserted) {
          inserted++;
        } else {
          updated++;
        }
      });
      
      console.log(`   Processed ${Math.min(i + batchSize, collectibles.length)}/${collectibles.length} records...`);
      
    } catch (err) {
      console.error(`❌ Error processing batch starting at index ${i}:`, err.message);
      failed += batch.length;
    }
  }

  console.log(`✅ Upsert complete - Inserted: ${inserted}, Updated: ${updated}, Failed: ${failed}`);
  
  return { inserted, updated, failed };
}

/**
 * Get all collectibles from database
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} Array of collectibles
 */
async function getCollectibles(limit = 100) {
  const selectQuery = `
    SELECT * FROM collectible_details 
    ORDER BY last_updated DESC 
    LIMIT $1
  `;
  
  const result = await query(selectQuery, [limit]);
  return result.rows;
}

/**
 * Get collectibles by token IDs
 * @param {Array} tokenIds - Array of Beezie token IDs
 * @returns {Promise<Array>} Array of collectibles
 */
async function getCollectiblesByTokenIds(tokenIds) {
  if (!tokenIds || tokenIds.length === 0) {
    return [];
  }

  const selectQuery = `
    SELECT * FROM collectible_details 
    WHERE beezie_token_id = ANY($1)
  `;
  
  const result = await query(selectQuery, [tokenIds]);
  return result.rows;
}

/**
 * Get count of collectibles in database
 * @returns {Promise<number>} Count of collectibles
 */
async function getCollectiblesCount() {
  const countQuery = 'SELECT COUNT(*) as count FROM collectible_details';
  const result = await query(countQuery);
  return parseInt(result.rows[0].count);
}

module.exports = {
  upsertCollectibles,
  getCollectibles,
  getCollectiblesByTokenIds,
  getCollectiblesCount
};
