// Script to get price for a specific collectible
import BeezifyPriceOracle from "../BeezifyPriceOracle.cdc"

access(all) fun main(tokenId: UInt64): BeezifyPriceOracle.CollectiblePrice? {
    return BeezifyPriceOracle.getPrice(tokenId: tokenId)
}
