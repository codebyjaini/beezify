const axios = require('axios');

const ALT_GRAPHQL_URL = 'https://alt-platform-server.production.internal.onlyalt.com/graphql';
const ALT_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjcyNGIxNDItNjVjOC00MzIzLTlkYzEtN2RlMmQ4NTc2YjI2IiwiZW1haWwiOiJ5YXNoc2hhaDE5MjAwMUBnbWFpbC5jb20iLCJleHAiOjE3NjI3NzEyNzIsImlhdCI6MTc2MTQ3NTI3MiwianRpIjoiZmNjOTExZWYtODg0Yy00NjRjLTkwZjgtYTU0Mzk1MDFiMzJlIn0.Maf62PNgmisIKSfLuKax2aJ7IW_XZN0w37U5pz04_vY';

/**
 * Fetch asset ID from ALT.xyz using certificate number
 * @param {string} certNumber - Certificate/serial number
 * @returns {Promise<Object|null>} Asset data or null if not found
 */
async function fetchAltAssetByCert(certNumber) {
  if (!certNumber) return null;

  try {
    console.log(`  🔍 Querying ALT for cert: ${certNumber}`);
    
    const query = `
      query Cert($certNumber: String!) {
        cert(certNumber: $certNumber) {
          certNumber
          gradeNumber
          gradingCompany
          asset {
            id
            name
            year
            subject
            category
            brand
          }
        }
      }
    `;

    const response = await axios.post(`${ALT_GRAPHQL_URL}/Cert`, {
      query,
      variables: { certNumber }
    }, {
      headers: {
        'accept': '*/*',
        'content-type': 'application/json',
        'authorization': `Bearer ${ALT_AUTH_TOKEN}`,
        'origin': 'https://app.alt.xyz',
        'referer': 'https://app.alt.xyz/',
      }
    });

    const cert = response.data?.data?.cert;
    if (cert && cert.asset) {
      console.log(`  ✅ Found ALT asset: ${cert.asset.id}`);
      return cert.asset;
    }

    console.log(`  ⚠️  No ALT asset found for cert: ${certNumber}`);
    return null;
  } catch (error) {
    console.error(`  ❌ Error fetching ALT asset for cert ${certNumber}:`, error.message);
    return null;
  }
}

/**
 * Fetch market value from ALT.xyz using asset ID
 * @param {string} assetId - ALT asset ID
 * @param {string} gradeNumber - Grade number (e.g., "10.0")
 * @param {string} gradingCompany - Grading company (PSA, CGC, BGS)
 * @returns {Promise<number|null>} Current ALT value or null if not found
 */
async function fetchAltMarketValue(assetId, gradeNumber, gradingCompany) {
  if (!assetId || !gradeNumber || !gradingCompany) return null;

  try {
    console.log(`  💰 Fetching ALT value for asset: ${assetId} (${gradingCompany} ${gradeNumber})`);
    
    const query = `
      query AssetDetails($id: ID!, $tsFilter: TimeSeriesFilter!) {
        asset(id: $id) {
          id
          name
          altValueInfo(tsFilter: $tsFilter) {
            currentAltValue
          }
        }
      }
    `;

    const response = await axios.post(`${ALT_GRAPHQL_URL}/AssetDetails`, {
      query,
      variables: {
        id: assetId,
        tsFilter: {
          gradeNumber,
          gradingCompany: gradingCompany.toUpperCase()
        }
      }
    }, {
      headers: {
        'accept': '*/*',
        'content-type': 'application/json',
        'authorization': `Bearer ${ALT_AUTH_TOKEN}`,
        'origin': 'https://app.alt.xyz',
        'referer': 'https://app.alt.xyz/',
      }
    });

    const altValue = response.data?.data?.asset?.altValueInfo?.currentAltValue;
    if (altValue) {
      console.log(`  ✅ ALT Market Value: $${altValue}`);
      return parseFloat(altValue);
    }

    console.log(`  ⚠️  No market value found`);
    return null;
  } catch (error) {
    console.error(`  ❌ Error fetching ALT value:`, error.message);
    return null;
  }
}

/**
 * Enrich collectible with ALT.xyz data
 * @param {Object} collectible - Collectible object with serial_number, grader, grade
 * @returns {Promise<Object>} Enriched data with alt_asset_id and alt_market_value
 */
async function enrichWithAltData(collectible) {
  const result = {
    alt_asset_id: null,
    alt_market_value: null
  };

  // Skip if no serial number
  if (!collectible.serial_number) {
    return result;
  }

  try {
    // Step 1: Get asset ID from certificate number
    const asset = await fetchAltAssetByCert(collectible.serial_number);
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!asset) {
      return result;
    }

    result.alt_asset_id = asset.id;

    // Step 2: Get market value
    if (collectible.grader && collectible.grade) {
      const marketValue = await fetchAltMarketValue(
        asset.id,
        collectible.grade,
        collectible.grader
      );
      
      result.alt_market_value = marketValue;

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return result;
  } catch (error) {
    console.error(`  ❌ Error enriching with ALT data:`, error.message);
    return result;
  }
}

module.exports = {
  fetchAltAssetByCert,
  fetchAltMarketValue,
  enrichWithAltData
};
