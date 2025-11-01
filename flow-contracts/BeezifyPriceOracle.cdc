// BeezifyPriceOracle.cdc
// A smart contract to store and track collectible prices from Beezie marketplace
// This creates an on-chain price oracle that can be used by other dApps

access(all) contract BeezifyPriceOracle {

    // Events
    access(all) event PriceUpdated(
        tokenId: UInt64,
        beeziePrice: UFix64,
        altPrice: UFix64?,
        timestamp: UFix64
    )
    
    access(all) event CollectibleRegistered(
        tokenId: UInt64,
        name: String,
        category: String
    )

    // Struct to store collectible price data
    access(all) struct CollectiblePrice {
        access(all) let tokenId: UInt64
        access(all) let name: String
        access(all) let category: String
        access(all) let beeziePrice: UFix64
        access(all) let altPrice: UFix64?
        access(all) let lastUpdated: UFix64
        access(all) let grader: String?
        access(all) let grade: String?

        init(
            tokenId: UInt64,
            name: String,
            category: String,
            beeziePrice: UFix64,
            altPrice: UFix64?,
            grader: String?,
            grade: String?
        ) {
            self.tokenId = tokenId
            self.name = name
            self.category = category
            self.beeziePrice = beeziePrice
            self.altPrice = altPrice
            self.lastUpdated = getCurrentBlock().timestamp
            self.grader = grader
            self.grade = grade
        }
    }

    // Storage for collectible prices
    access(self) let prices: {UInt64: CollectiblePrice}
    
    // Admin capability
    access(all) resource Admin {
        
        // Update price for a collectible
        access(all) fun updatePrice(
            tokenId: UInt64,
            name: String,
            category: String,
            beeziePrice: UFix64,
            altPrice: UFix64?,
            grader: String?,
            grade: String?
        ) {
            let priceData = CollectiblePrice(
                tokenId: tokenId,
                name: name,
                category: category,
                beeziePrice: beeziePrice,
                altPrice: altPrice,
                grader: grader,
                grade: grade
            )
            
            BeezifyPriceOracle.prices[tokenId] = priceData
            
            emit PriceUpdated(
                tokenId: tokenId,
                beeziePrice: beeziePrice,
                altPrice: altPrice,
                timestamp: getCurrentBlock().timestamp
            )
        }

        // Batch update prices (for efficient syncing)
        access(all) fun batchUpdatePrices(priceUpdates: [CollectiblePrice]) {
            for priceData in priceUpdates {
                BeezifyPriceOracle.prices[priceData.tokenId] = priceData
                
                emit PriceUpdated(
                    tokenId: priceData.tokenId,
                    beeziePrice: priceData.beeziePrice,
                    altPrice: priceData.altPrice,
                    timestamp: priceData.lastUpdated
                )
            }
        }
    }

    // Public functions to query prices
    access(all) fun getPrice(tokenId: UInt64): CollectiblePrice? {
        return self.prices[tokenId]
    }

    access(all) fun getAllPrices(): {UInt64: CollectiblePrice} {
        return self.prices
    }

    access(all) fun getPricesByCategory(category: String): [CollectiblePrice] {
        let result: [CollectiblePrice] = []
        for price in self.prices.values {
            if price.category == category {
                result.append(price)
            }
        }
        return result
    }

    access(all) fun getTotalCollectibles(): Int {
        return self.prices.length
    }

    init() {
        self.prices = {}
        
        // Save admin resource to account storage
        self.account.storage.save(
            <-create Admin(),
            to: /storage/BeezifyPriceOracleAdmin
        )
        
        // Create public capability for the admin
        let cap = self.account.capabilities.storage.issue<&Admin>(
            /storage/BeezifyPriceOracleAdmin
        )
        self.account.capabilities.publish(cap, at: /public/BeezifyPriceOracleAdmin)
    }
}
