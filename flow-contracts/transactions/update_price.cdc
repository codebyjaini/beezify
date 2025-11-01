// Transaction to update a single collectible price
import BeezifyPriceOracle from "../BeezifyPriceOracle.cdc"

transaction(
    tokenId: UInt64,
    name: String,
    category: String,
    beeziePrice: UFix64,
    altPrice: UFix64?,
    grader: String?,
    grade: String?
) {
    
    let admin: &BeezifyPriceOracle.Admin
    
    prepare(signer: auth(BorrowValue) &Account) {
        // Borrow the admin resource
        self.admin = signer.storage.borrow<&BeezifyPriceOracle.Admin>(
            from: /storage/BeezifyPriceOracleAdmin
        ) ?? panic("Could not borrow admin resource")
    }
    
    execute {
        self.admin.updatePrice(
            tokenId: tokenId,
            name: name,
            category: category,
            beeziePrice: beeziePrice,
            altPrice: altPrice,
            grader: grader,
            grade: grade
        )
        
        log("Price updated for token: ".concat(tokenId.toString()))
    }
}
