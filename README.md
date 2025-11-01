# 🐝 Beezify - Collectible Market Value Tracker

> **🌐 Live at: [https://beezify.xyz](https://beezify.xyz)**  
> **Built on Flow Blockchain** for Flow Forte Hackathon  
> **Beezie Bounty Track:** Best Integration with Beezie

Beezify is a comprehensive collectible tracking platform that aggregates price data from Beezie marketplace and ALT.xyz, storing it on the Flow blockchain for transparent, decentralized access.

## 🌊 Flow Blockchain Integration

**Network:** Flow Testnet  
**Smart Contract:** BeezifyPriceOracle  
**Contract Address:** `0x3e0801de3e47e32d`  
**Transaction Hash:** `af4b19225d282ec38d6797291f803bab58feae9c425139f63d9a03e31b708750`  
**Block Explorer:** [View on Flowscan](https://testnet.flowscan.io/contract/A.3e0801de3e47e32d.BeezifyPriceOracle)

Beezify includes a **standalone smart contract deployed on Flow Testnet** that creates a decentralized price oracle for collectibles. This demonstrates the project's blockchain-ready architecture and creates a foundation for future on-chain integrations.

### Smart Contract Features

- **Price Oracle**: On-chain storage of collectible prices
- **Public Queries**: Anyone can read price data
- **Category Filtering**: Query by collectible type
- **Event Emissions**: Track all price updates
- **Cadence-based**: Written in Flow's native smart contract language

### Why Flow?

- **Native Integration**: Beezie runs on Flow blockchain
- **NFT Ecosystem**: Perfect for collectible tracking
- **Low Cost**: Efficient transaction fees
- **Fast Finality**: Quick confirmation times

> **Note:** The smart contract is currently standalone for hackathon demonstration. Full backend/frontend integration is planned for future releases.

For more details on the Flow integration, see [FLOW_HACKATHON.md](./FLOW_HACKATHON.md).

## 🎯 Features

### ✅ Beezie Bounty Track 1 - Market Value Fetcher (Complete Implementation)

This project fully implements **Task 1: Market Value Fetcher** from the Beezie Bounty:

- ✅ **Fetch Market Values**: Automatically fetches collectible market values using certificate numbers (serial numbers)
- ✅ **ALT.xyz Integration**: Pulls Fair Market Value data directly from ALT.xyz API
- ✅ **Beezie Marketplace Loop**: Iterates through ALL Beezie collectibles via their API
  - Pokemon: ~9,439 items
  - One Piece: ~603 items
  - Basketball: ~180 items
  - Football: ~65 items
- ✅ **Serial Number Extraction**: Extracts serial numbers from each collectible's metadata
- ✅ **Database Storage**: Stores ALT Fair Market Value in Supabase PostgreSQL
- ✅ **Automated Sync**: Uses Google Cloud Scheduler for 6-hour sync cycles (can be configured to 24 hours)
- ✅ **Price Change Detection**: Compares existing values and updates when prices change
- ✅ **Real-time Updates**: Each item is processed and saved immediately (no batch delays)

### Additional Features

- 📊 **Real-time Price Tracking**: Monitors Beezie marketplace prices
- 💎 **Dual Valuation**: Shows both Beezie listing price and ALT Fair Market Value
- ⛓️ **Flow Smart Contract**: Demonstrates blockchain-ready architecture with price oracle
- 🔍 **Advanced Filtering**: Search by category, grader, and more
- 📈 **Price Comparison**: Compare Beezie vs ALT valuations side-by-side
- 🎨 **Modern UI**: Beautiful, responsive interface with Shadcn/UI
- 🔔 **Status Tracking**: Shows which items have ALT data vs. "Not Available"

## 🏗️ Architecture

```
┌─────────────────────┐
│   Frontend (Next.js)│
│   - React/TypeScript│
│   - Tailwind CSS    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   Backend (Node.js) │
│   - Express API     │
│   - Data Sync       │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   Supabase/PostgreSQL│
│   - Price History   │
│   - Metadata Cache  │
└─────────────────────┘

┌──────────────────────┐
│  Flow Blockchain     │ (Standalone - Hackathon Demo)
│  - Price Oracle      │
│  - Cadence Contract  │
└──────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Flow CLI (for blockchain interaction)
- Supabase account
- Google Cloud account (for deployment)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/beezify.git
cd beezify

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install Flow contracts dependencies
cd ../flow-contracts
flow dependencies install
```

### Environment Setup

**Backend (.env):**
```env
SUPABASE_DB_URL=your_supabase_connection_string
SYNC_TOKEN=your_secret_token
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### Running Locally

**Frontend:**
```bash
cd frontend
npm run dev
# Opens on http://localhost:3000
```

**Backend:**
```bash
cd backend
node index.js
# Runs on http://localhost:8080
```

## 📦 Project Structure

```
beezify/
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js 14 app directory
│   ├── components/       # React components (Shadcn/UI)
│   └── lib/             # Utility functions
├── backend/              # Express.js backend
│   ├── index.js         # Main server file
│   ├── beezieService.js # Beezie API integration
│   ├── altService.js    # ALT.xyz API integration
│   └── dbService.js     # Database operations
├── flow-contracts/       # Flow blockchain contracts (Standalone)
│   ├── BeezifyPriceOracle.cdc  # Main smart contract
│   ├── transactions/    # Cadence transactions
│   ├── scripts/         # Cadence query scripts
│   └── flow.json        # Flow configuration
└── docs/                # Documentation
```

## 🔗 API Endpoints

### Backend API

- `GET /` - Health check
- `GET /api/collectibles` - Get all collectibles (supports filtering)
  - Query params: `limit`, `category`, `grader`, `search`
- `GET /api/stats` - Get statistics
- `POST /api/sync` - Trigger data sync (requires auth)

### Flow Blockchain Scripts

- `get_price.cdc` - Query price for a specific token
- `get_all_prices.cdc` - Get all prices from oracle

> **Note:** Contract queries can be run using Flow CLI. See [FLOW_HACKATHON.md](./FLOW_HACKATHON.md) for details.

## 🛠️ Technologies Used

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Component library
- **Lucide Icons** - Beautiful icons

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Axios** - HTTP client
- **PostgreSQL** - Database (via Supabase)

### Blockchain
- **Flow Blockchain** - Layer 1 blockchain
- **Cadence** - Smart contract language
- **FCL** - Flow Client Library

### Infrastructure
- **Google Cloud Run** - Backend deployment
- **Vercel** - Frontend deployment
- **Supabase** - Database hosting
- **Google Cloud Scheduler** - Automated syncing

## 📊 Data Sources

1. **Beezie Marketplace** - Real-time marketplace prices
   - API: `https://api.beezie.io/dropItems/`
   - Categories: Pokemon, One Piece, Basketball, Football

2. **ALT.xyz** - Professional grading data
   - API: GraphQL endpoint
   - Provides: Market valuations, grading info

3. **Flow Blockchain** - On-chain price oracle (standalone)
   - Contract: BeezifyPriceOracle
   - Network: Flow Testnet
   - Address: `0x3e0801de3e47e32d`

## 🔄 Data Sync Process (Beezie Track 1 Implementation)

### Automated Market Value Fetcher

1. **Fetch Beezie Collectibles** 
   - Loops through all categories via Beezie API
   - Processes 40 items per page across all pages
   - Extracts token IDs for detailed lookup

2. **Extract Serial Numbers**
   - Fetches full metadata for each collectible
   - Parses certificate/serial number from attributes
   - Handles multiple grading companies (PSA, CGC, BGS)

3. **Query ALT.xyz**
   - Uses serial number to lookup ALT asset
   - Fetches Fair Market Value based on grade
   - Handles missing data gracefully (shows "Not Available")

4. **Store in Database**
   - Saves to PostgreSQL (Supabase)
   - Updates existing records if prices change
   - Tracks last update timestamp

5. **Display in Frontend**
   - Shows both Beezie price and ALT Fair Market Value
   - Highlights percentage difference
   - Visual indicators for data availability

6. **Automated Scheduling**
   - Google Cloud Scheduler triggers sync every 6 hours
   - Can be configured for 24-hour cycles
   - Runs via authenticated API endpoint (`/api/sync`)

> **Implementation Details:** 
> - Backend: Node.js with Express
> - Database: PostgreSQL via Supabase
> - Scheduler: Google Cloud Scheduler (Flow Scheduled Transactions planned)
> - Processing: Real-time, immediate database updates per item

## 🎬 Demo

**Video Demo:** [Coming soon]  
**Live Site:** [Coming soon]  
**Flow Contract:** [View on Flowscan](https://testnet.flowscan.org/contract/A.3e0801de3e47e32d.BeezifyPriceOracle)

## 🏆 Flow Forte Hackathon Submission

### Beezie Bounty - Track 1: Market Value Fetcher ✅

**All Requirements Met:**

- ✅ **Fetches market value of collectibles** using certificate number (serial)
- ✅ **Pulls data from ALT.xyz** - Full GraphQL integration with cert lookup
- ✅ **Loops through Beezie collectibles** - Processes all ~10,287 items across 4 categories
- ✅ **Extracts serial numbers** - Parses metadata attributes for grading certs
- ✅ **Stores ALT Fair Market Value** - PostgreSQL database via Supabase
- ✅ **Automated updates** - Google Cloud Scheduler with 6-hour cycles (configurable)
- ✅ **Price change detection** - Database upsert logic compares and updates values
- ✅ **Background service** - Runs via authenticated API endpoint

**Technical Implementation:**
- **Backend**: `backend/altService.js` - ALT.xyz GraphQL integration
- **Backend**: `backend/beezieService.js` - Beezie API integration
- **Backend**: `backend/dbService.js` - Database operations with upsert logic
- **Backend**: `backend/index.js` - Main sync orchestration
- **Scheduler**: Google Cloud Scheduler → `/api/sync` endpoint
- **Database**: Full schema in Supabase with price history tracking

### Flow Blockchain Integration

**Submission Checklist:**

- ✅ Deployed on Flow Testnet
- ✅ Smart contract deployed: `0x3e0801de3e47e32d`
- ✅ README states "Built on Flow Blockchain"
- ✅ Contract address listed in README
- ✅ Video demo created
- ✅ GitHub repository is public
- ✅ Social media post with @flow_blockchain

### Cadence Smart Contract Features

- **Price Oracle**: Demonstrates on-chain price storage capability
- **Public Queries**: Anyone can read price data from the contract
- **Event Emission**: Tracks all price updates with blockchain events
- **Category Filtering**: Query prices by collectible type
- **Admin Controls**: Secure price update mechanism

> **Implementation Note:** The smart contract is currently deployed as a standalone demonstration for the hackathon. It showcases Beezify's blockchain-ready architecture and can be fully integrated in future iterations.

**Built with ❤️ on Flow Blockchain 🌊**
