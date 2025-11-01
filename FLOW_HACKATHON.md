# Beezify - Flow Blockchain Price Oracle

> **Built on Flow Blockchain** for Flow Forte Hackathon

## 🌊 Flow Integration (Standalone for Hackathon)

This project demonstrates Flow blockchain integration through a **standalone price oracle smart contract**. The contract is deployed on Flow Testnet and serves as a proof-of-concept for on-chain collectible price tracking.

### Smart Contract Details

**Contract Name:** BeezifyPriceOracle  
**Network:** Flow Testnet  
**Contract Address:** `0x3e0801de3e47e32d`  
**Transaction Hash:** `af4b19225d282ec38d6797291f803bab58feae9c425139f63d9a03e31b708750`  
**Block Explorer:** [View on Flowscan](https://testnet.flowscan.io/contract/A.3e0801de3e47e32d.BeezifyPriceOracle)

### Why This Contract Matters

1. **On-Chain Price Oracle**: Creates a decentralized source of collectible prices
2. **Flow Ecosystem**: Built specifically for Flow blockchain (where Beezie operates)
3. **Public Access**: Anyone can query prices without authentication
4. **Transparency**: All price updates are recorded on-chain with events
5. **Future Integration**: Ready for backend/frontend integration when needed

### Contract Features

- ✅ Store collectible prices on-chain
- ✅ Track both Beezie and ALT.xyz valuations
- ✅ Public price query interface
- ✅ Category-based filtering
- ✅ Event emissions for price updates
- ✅ Admin-controlled updates

### Demo: Query the Contract

You can interact with the deployed contract using Flow CLI:

```bash
# Query a specific price
flow scripts execute ./scripts/get_price.cdc 10596 --network testnet

# Get all prices
flow scripts execute ./scripts/get_all_prices.cdc --network testnet

# Get total collectibles
flow scripts execute ./scripts/get_total.cdc --network testnet
```

### Contract Structure

```cadence
// Main contract features:
- CollectiblePrice struct (stores price data)
- Admin resource (for price updates)
- Public query functions
- Event emissions
```

### Potential Use Cases

1. **dApp Integration**: Other Flow dApps can query our price oracle
2. **DeFi Applications**: Use prices for collateral valuation
3. **NFT Marketplaces**: Display real-time market values
4. **Analytics Platforms**: Track price trends over time

### Project Components

**Backend (Node.js + Express):**
- Fetches data from Beezie API
- Enriches with ALT.xyz valuations
- Stores in Supabase database
- Deployed on Google Cloud Run

**Frontend (Next.js):**
- Beautiful UI for browsing collectibles
- Advanced search and filtering
- Price comparison views
- Responsive design

**Smart Contract (Cadence):**
- Deployed on Flow Testnet
- On-chain price storage
- Public query interface
- *Note: Currently standalone, ready for future integration*

### Architecture Overview

```
Beezie API → Backend → Supabase Database → Frontend Display
                ↓
         (Future Integration)
                ↓
         Flow Smart Contract (Deployed & Ready)
```

### Why Standalone for Now?

- **Proof of Concept**: Demonstrates Flow blockchain capability
- **Hackathon Focus**: Shows understanding of Cadence and Flow
- **Modular Design**: Easy to integrate when needed
- **Cost Effective**: No transaction fees during development
- **Clear Separation**: Backend and blockchain can evolve independently

### Future Integration Path

When ready to fully integrate:

1. Install `@onflow/fcl` in backend
2. Add Flow service module
3. Update prices on-chain after database save
4. Add "Verified on Flow" badges in frontend
5. Display on-chain data alongside database data

### Hackathon Submission Compliance

✅ **Deployed on testnet**: Contract at `0x3e0801de3e47e32d`  
✅ **README states "Built on Flow"**: See main README.md  
✅ **Contract address listed**: Multiple documentation files  
✅ **Smart contract viewable**: On Flow block explorer  
✅ **Uses Cadence**: All contract code in Cadence  
✅ **Public repository**: Available on GitHub  

### Learn More

- **Contract Code**: `./BeezifyPriceOracle.cdc`
- **Transactions**: `./transactions/`
- **Query Scripts**: `./scripts/`
- **Flow Documentation**: [developers.flow.com](https://developers.flow.com)

---

**This contract demonstrates Beezify's readiness for full Flow blockchain integration** 🌊🐝
