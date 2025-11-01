# Beezify Flow Smart Contracts

## Overview

Beezify uses the Flow blockchain to create an on-chain price oracle for collectibles from the Beezie marketplace. This provides transparent, immutable price tracking that can be used by other dApps in the Flow ecosystem.

## Contract: BeezifyPriceOracle

**Network:** Flow Testnet  
**Contract Address:** `0x3e0801de3e47e32d`  
**Transaction Hash:** `af4b19225d282ec38d6797291f803bab58feae9c425139f63d9a03e31b708750`  
**Block Explorer:** [View on Flowscan](https://testnet.flowscan.org/contract/A.3e0801de3e47e32d.BeezifyPriceOracle)

### Features

- ✅ Store collectible prices on-chain
- ✅ Track both Beezie and ALT.xyz valuations
- ✅ Public price query interface
- ✅ Category-based filtering
- ✅ Timestamp tracking for price history
- ✅ Event emissions for price updates

## Deployment Instructions

### Prerequisites

1. Install Flow CLI:
```bash
brew install flow-cli
```

2. Create a Flow testnet account:
```bash
flow keys generate
```

3. Configure `flow.json`:
```bash
flow init
```

### Deploy to Testnet

1. **Configure flow.json** with your account:
```json
{
  "contracts": {
    "BeezifyPriceOracle": "./BeezifyPriceOracle.cdc"
  },
  "deployments": {
    "testnet": {
      "beezify-admin": ["BeezifyPriceOracle"]
    }
  },
  "accounts": {
    "beezify-admin": {
      "address": "YOUR_TESTNET_ADDRESS",
      "key": "YOUR_PRIVATE_KEY"
    }
  },
  "networks": {
    "testnet": "access.devnet.nodes.onflow.org:9000"
  }
}
```

2. **Deploy the contract:**
```bash
flow project deploy --network=testnet
```

3. **Verify deployment:**
```bash
flow accounts get YOUR_ADDRESS --network=testnet
```

### Usage Examples

#### Update a Price (Backend Integration)

```javascript
// In your backend sync function
const fcl = require("@onflow/fcl");

async function updatePriceOnChain(collectible) {
  const transactionId = await fcl.mutate({
    cadence: updatePriceTransaction,
    args: (arg, t) => [
      arg(collectible.beezie_token_id, t.UInt64),
      arg(collectible.name, t.String),
      arg(collectible.category, t.String),
      arg(collectible.beezie_price.toFixed(2), t.UFix64),
      arg(collectible.alt_market_value?.toFixed(2) || null, t.Optional(t.UFix64)),
      arg(collectible.grader, t.Optional(t.String)),
      arg(collectible.grade, t.Optional(t.String))
    ],
    authorizations: [fcl.authz],
    payer: fcl.authz,
    proposer: fcl.authz,
    limit: 999
  });
  
  return transactionId;
}
```

#### Query Price (Frontend Integration)

```javascript
// In your frontend
const fcl = require("@onflow/fcl");

async function getPriceFromChain(tokenId) {
  const result = await fcl.query({
    cadence: getPriceScript,
    args: (arg, t) => [arg(tokenId, t.UInt64)]
  });
  
  return result;
}
```

## Integration with Backend

Add Flow blockchain updates to your sync process:

```javascript
// In backend/index.js after database upsert
const { updatePriceOnChain } = require('./flowService');

// After saving to database
console.log(`  💾 Saving to database...`);
const stats = await upsertCollectibles([collectible]);

// Update on Flow blockchain
console.log(`  ⛓️  Updating Flow blockchain...`);
try {
  await updatePriceOnChain(collectible);
  console.log(`  ✅ Price updated on Flow`);
} catch (flowError) {
  console.log(`  ⚠️  Flow update failed, continuing...`);
}
```

## Contract Events

The contract emits the following events:

- `PriceUpdated`: When a collectible price is updated
- `CollectibleRegistered`: When a new collectible is added

Monitor events:
```bash
flow events get A.CONTRACT_ADDRESS.BeezifyPriceOracle.PriceUpdated --network=testnet
```

## Testing

Run contract tests:
```bash
flow test ./tests/BeezifyPriceOracle_test.cdc
```

## Resources

- [Flow Documentation](https://developers.flow.com/)
- [Cadence Language](https://cadence-lang.org/)
- [Flow Testnet Faucet](https://testnet-faucet.onflow.org/)
- [Flow Block Explorer](https://testnet.flowscan.org/)

## License

MIT
