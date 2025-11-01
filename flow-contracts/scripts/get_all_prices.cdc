// Script to get all collectible prices
import BeezifyPriceOracle from "../BeezifyPriceOracle.cdc"

access(all) fun main(): {UInt64: BeezifyPriceOracle.CollectiblePrice} {
    return BeezifyPriceOracle.getAllPrices()
}
