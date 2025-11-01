const axios = require('axios');

const BEEZIE_API_URL = 'https://api.beezie.io/dropItems/byCategory';
const BEEZIE_TOKEN_DETAIL_URL = 'https://api.beezie.io/dropItems/getByTokenId';

/**
 * Fetch detailed information for a specific token
 * @param {number} tokenId - Token ID to fetch details for
 * @returns {Promise<Object>} Detailed token information
 */
async function fetchTokenDetails(tokenId) {
  try {
    console.log(`📄 Fetching details for token ${tokenId}...`);
    
    const response = await axios.get(`${BEEZIE_TOKEN_DETAIL_URL}/${tokenId}`, {
      headers: {
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'origin': 'https://beezie.io',
        'referer': 'https://beezie.io/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
      }
    });

    return response.data.dropItem;
  } catch (error) {
    console.error(`❌ Error fetching token ${tokenId} details:`, error.message);
    throw error;
  }
}

/**
 * Extract attribute value from metadata attributes array
 * @param {Array} attributes - Array of attribute objects
 * @param {string} traitType - Trait type to search for
 * @returns {string|null} Trait value or null if not found
 */
function getAttributeValue(attributes, traitType) {
  if (!attributes || !Array.isArray(attributes)) return null;
  
  const attribute = attributes.find(attr => 
    attr.trait_type && attr.trait_type.toLowerCase() === traitType.toLowerCase()
  );
  
  return attribute ? attribute.trait_value : null;
}

/**
 * Fetch collectibles from Beezie API
 * @param {string} categoryId - Category ID to fetch (default: "1" for Pokemon)
 * @param {number} page - Page number (default: 0)
 * @param {number} pageSize - Number of items per page (default: 40)
 * @returns {Promise<Array>} Array of collectible items
 */
async function fetchBeezieCollectibles(categoryId = "1", page = 0, pageSize = 40) {
  try {
    console.log(`📡 Fetching Beezie collectibles - Category: ${categoryId}, Page: ${page}, PageSize: ${pageSize}`);
    
    const response = await axios.post(BEEZIE_API_URL, {
      categoryId: categoryId,
      page: page.toString(),
      pageSize: pageSize.toString(),
      filters: [],
      saleStatus: "all",
      sellOrderDateOrder: "DESC"
    }, {
      headers: {
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/json',
        'origin': 'https://beezie.io',
        'referer': 'https://beezie.io/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site'
      }
    });

    console.log(`✅ Successfully fetched ${response.data.length} collectibles from Beezie`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching Beezie collectibles:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Transform Beezie API response to database format
 * @param {Object} beezieItem - Raw item from Beezie API
 * @returns {Object} Transformed data ready for database insertion
 */
function transformBeezieData(beezieItem) {
  return {
    beezie_token_id: beezieItem.tokenId,
    name: beezieItem.metadata?.name || null,
    image_url: beezieItem.metadata?.image || null,
    beezie_price: beezieItem.SellOrder?.amountUSDC ? parseFloat(beezieItem.SellOrder.amountUSDC) : null,
    last_updated: new Date()
  };
}

/**
 * Transform detailed token data to database format with all attributes
 * @param {Object} tokenDetails - Detailed token data from getByTokenId endpoint
 * @returns {Object} Transformed data ready for database insertion
 */
function transformDetailedTokenData(tokenDetails) {
  const attributes = tokenDetails.metadata?.attributes || [];
  
  return {
    beezie_token_id: tokenDetails.tokenId,
    name: tokenDetails.metadata?.name || null,
    image_url: tokenDetails.metadata?.image || null,
    beezie_price: tokenDetails.sellOrder?.amountUSDC ? parseFloat(tokenDetails.sellOrder.amountUSDC) : null,
    serial_number: getAttributeValue(attributes, 'serial'),
    year: getAttributeValue(attributes, 'year'),
    grader: getAttributeValue(attributes, 'grader'),
    grade: getAttributeValue(attributes, 'grade'),
    player_name: getAttributeValue(attributes, 'pokemon name'),
    set_name: getAttributeValue(attributes, 'set name'),
    card_number: getAttributeValue(attributes, 'card number'),
    category: getAttributeValue(attributes, 'Category'),
    language: getAttributeValue(attributes, 'language'),
    last_updated: new Date()
  };
}

/**
 * Fetch all collectibles across multiple pages
 * @param {string} categoryId - Category ID to fetch
 * @param {number} maxPages - Maximum number of pages to fetch (default: null for all)
 * @returns {Promise<Array>} All collectibles from all pages
 */
async function fetchAllBeezieCollectibles(categoryId = "1", maxPages = null) {
  const allCollectibles = [];
  let page = 0;
  const pageSize = 40;
  
  while (true) {
    if (maxPages !== null && page >= maxPages) {
      console.log(`📄 Reached max pages limit: ${maxPages}`);
      break;
    }

    const collectibles = await fetchBeezieCollectibles(categoryId, page, pageSize);
    
    if (!collectibles || collectibles.length === 0) {
      console.log(`📄 No more collectibles found at page ${page}`);
      break;
    }

    allCollectibles.push(...collectibles);
    console.log(`📊 Total collected so far: ${allCollectibles.length}`);
    
    if (collectibles.length < pageSize) {
      console.log(`📄 Reached last page (received ${collectibles.length} items, expected ${pageSize})`);
      break;
    }

    page++;
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return allCollectibles;
}

/**
 * Fetch detailed information for multiple tokens
 * @param {Array} tokenIds - Array of token IDs
 * @param {number} delayMs - Delay between requests in milliseconds (default: 500)
 * @returns {Promise<Array>} Array of detailed token information
 */
async function fetchMultipleTokenDetails(tokenIds, delayMs = 500) {
  const detailedTokens = [];
  
  console.log(`📦 Fetching details for ${tokenIds.length} tokens...`);
  
  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];
    
    try {
      const details = await fetchTokenDetails(tokenId);
      detailedTokens.push(details);
      
      if ((i + 1) % 10 === 0) {
        console.log(`   Processed ${i + 1}/${tokenIds.length} tokens...`);
      }
      
      // Add delay to avoid rate limiting
      if (i < tokenIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`   ⚠️  Failed to fetch details for token ${tokenId}, skipping...`);
    }
  }
  
  console.log(`✅ Successfully fetched details for ${detailedTokens.length}/${tokenIds.length} tokens`);
  return detailedTokens;
}

module.exports = {
  fetchBeezieCollectibles,
  fetchAllBeezieCollectibles,
  fetchTokenDetails,
  fetchMultipleTokenDetails,
  transformBeezieData,
  transformDetailedTokenData,
  getAttributeValue
};
