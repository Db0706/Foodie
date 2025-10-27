# 🍽️ Foodie dApp - Cook-to-Earn & Taste-to-Earn

A Web3 social foodie app on Avalanche where users share food moments and earn TASTE tokens. Every post is an NFT, and engagement is rewarded on-chain.

![Avalanche](https://img.shields.io/badge/Avalanche-E84142?style=for-the-badge&logo=avalanche&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Tokenomics](#tokenomics)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

Foodie dApp is a decentralized social platform that rewards users for sharing their food experiences. Whether you're cooking at home or dining out, you can mint your moments as NFTs and earn TASTE tokens.

### Two Core Modes:

**🍳 Cook-to-Earn**
- Share dishes you cooked at home
- Describe your recipe and process
- Earn 5 TASTE per post

**🍜 Taste-to-Earn**
- Share meals from restaurants and cafes
- Review your dining experiences
- Earn 5 TASTE per post

### Social Features:
- Like posts to reward creators (+1 TASTE)
- Leaderboards for top earners
- On-chain NFT collection of food moments
- Community-driven content curation

---

## ✨ Features

### For Users:
- 🔗 **Web3 Wallet Integration** - Connect with Core, MetaMask, or any Avalanche wallet
- 📸 **Upload & Mint** - Post food photos as NFTs stored on IPFS
- 💰 **Earn TASTE Tokens** - Get rewarded for posting and receiving likes
- 🏆 **Leaderboards** - Compete for top earner status
- 👤 **Profile Dashboard** - Track your earnings and NFT collection
- ❤️ **Engagement Rewards** - Likes reward both liker and creator

### Technical:
- ⛓️ **Fully On-Chain** - All minting and rewards via smart contracts
- 🗄️ **Decentralized Storage** - Images and metadata on IPFS
- 🚀 **Fast Indexing** - Firebase/Supabase for rapid feed queries
- 🎨 **Responsive UI** - Beautiful design with Tailwind CSS
- 🔐 **Secure** - OpenZeppelin audited contracts

---

## 🛠️ Tech Stack

### Blockchain:
- **Avalanche C-Chain** (Fuji Testnet → Mainnet)
- **Solidity ^0.8.20** with OpenZeppelin libraries
- **Hardhat** for development and deployment

### Smart Contracts:
- **TasteToken** - ERC-20 reward token
- **TasteNFT** - ERC-721 post NFTs
- **TasteRewarder** - Core app logic and rewards distribution

### Frontend:
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **wagmi + RainbowKit** - Wallet connection
- **ethers.js** - Blockchain interactions
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications

### Storage & Indexing:
- **IPFS (Pinata)** - Decentralized file storage
- **Firebase/Supabase** - Off-chain indexing for fast queries

---

## 📁 Project Structure

```
FoodieApp/
├── contracts/                  # Smart contracts
│   ├── TasteToken.sol         # ERC-20 token
│   ├── TasteNFT.sol          # ERC-721 NFT
│   └── TasteRewarder.sol     # Main app logic
│
├── scripts/                   # Deployment scripts
│   └── deploy.js             # Deploy all contracts
│
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Feed.tsx
│   │   │   ├── PostCreator.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Leaderboard.tsx
│   │   ├── lib/              # Utilities and hooks
│   │   │   ├── contracts.ts   # Contract addresses & ABIs
│   │   │   ├── ipfs.ts        # IPFS upload functions
│   │   │   ├── firebase.ts    # Firestore functions
│   │   │   ├── utils.ts       # Helper functions
│   │   │   └── hooks/
│   │   │       └── useContracts.ts  # Contract interaction hooks
│   │   ├── pages/            # Next.js pages
│   │   │   ├── _app.tsx
│   │   │   └── index.tsx
│   │   └── styles/           # CSS
│   │       └── globals.css
│   └── package.json
│
├── docs/                      # Documentation
│   ├── DATABASE_SCHEMA.md    # Off-chain data structure
│   └── USAGE_FLOW.md         # User journey documentation
│
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Node dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

---

## 📜 Smart Contracts

### TasteToken.sol
- **Type:** ERC-20 Token
- **Symbol:** TASTE
- **Decimals:** 18
- **Initial Supply:** 1 billion TASTE
- **Mintable:** Only by TasteRewarder contract

### TasteNFT.sol
- **Type:** ERC-721 NFT
- **Name:** Taste Post NFT
- **Symbol:** TASTENFT
- **Features:** Token URI storage, enumerable
- **Mintable:** Only by TasteRewarder contract

### TasteRewarder.sol
- **Purpose:** Core app logic
- **Functions:**
  - `createPost()` - Mint NFT and reward creator
  - `likePost()` - Reward original creator when liked
  - `updateRewards()` - Adjust reward amounts (owner)
- **Rewards:**
  - Post: 5 TASTE
  - Like: 1 TASTE (to creator)

**Contract Interactions:**
```
User → TasteRewarder → TasteNFT.mint()
                     → TasteToken.mint()
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ and npm
- Avalanche-compatible wallet (Core or MetaMask)
- Test AVAX from [Avalanche Faucet](https://faucet.avax.network/)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/foodie-dapp.git
cd foodie-dapp
```

### 2. Install Dependencies

**Root (Hardhat):**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 3. Configure Environment

**Root `.env`:**
```bash
cp .env.example .env
```

Edit `.env`:
```env
PRIVATE_KEY=your_wallet_private_key
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
SNOWTRACE_API_KEY=your_snowtrace_api_key
```

**Frontend `.env.local`:**
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_CHAIN_ID=43113
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_project_id
# Contract addresses (fill after deployment)
NEXT_PUBLIC_TASTE_TOKEN_ADDRESS=
NEXT_PUBLIC_TASTE_NFT_ADDRESS=
NEXT_PUBLIC_TASTE_REWARDER_ADDRESS=
```

### 4. Compile Contracts

```bash
npx hardhat compile
```

---

## 🌐 Deployment

### Deploy to Avalanche Fuji Testnet

```bash
npx hardhat run scripts/deploy.js --network fuji
```

**Output:**
```
TasteToken deployed to: 0xABC...
TasteNFT deployed to: 0xDEF...
TasteRewarder deployed to: 0xGHI...
```

### Verify Contracts on Snowtrace

```bash
npx hardhat verify --network fuji <TOKEN_ADDRESS> "<DEPLOYER_ADDRESS>"
npx hardhat verify --network fuji <NFT_ADDRESS> "<DEPLOYER_ADDRESS>"
npx hardhat verify --network fuji <REWARDER_ADDRESS> "<TOKEN_ADDRESS>" "<NFT_ADDRESS>" "<DEPLOYER_ADDRESS>"
```

### Update Frontend Config

Copy deployed addresses to `frontend/.env.local`:
```env
NEXT_PUBLIC_TASTE_TOKEN_ADDRESS=0xABC...
NEXT_PUBLIC_TASTE_NFT_ADDRESS=0xDEF...
NEXT_PUBLIC_TASTE_REWARDER_ADDRESS=0xGHI...
```

### Copy ABIs to Frontend

After compilation, copy ABIs from `artifacts/contracts/` to `frontend/src/lib/contracts.ts` (optional, minimal ABIs already included).

---

## 💻 Usage

### Run Frontend Locally

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

### User Flow:

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve connection in wallet

2. **Create Post**
   - Choose Cook or Taste tab
   - Click "Post & Earn"
   - Upload food photo
   - Write caption
   - Click "Mint & Earn"
   - Approve transaction in wallet
   - Earn 5 TASTE + receive NFT

3. **Like Posts**
   - Browse feed
   - Click like button on posts
   - Creator earns 1 TASTE

4. **View Profile**
   - Check TASTE balance
   - See your NFT collection
   - View post history

5. **Check Leaderboard**
   - See top earners
   - Compare rankings

---

## 💎 Tokenomics

### TASTE Token ($TASTE)

**Total Supply:** 1,000,000,000 TASTE

**Distribution (MVP):**
- Initial mint to deployer/treasury for rewards pool
- Minted on-demand as users earn

**Earning Mechanisms:**
- Create post: **+5 TASTE**
- Receive like: **+1 TASTE** (to post creator)

**Adjustable by Owner:**
- Reward amounts can be updated via `updateRewards()`

**Future Utility:**
- Governance voting
- Premium features
- Staking rewards
- Marketplace currency

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- ✅ Cook-to-Earn & Taste-to-Earn modes
- ✅ NFT minting for posts
- ✅ TASTE token rewards
- ✅ Like system
- ✅ Leaderboards
- ✅ Profile dashboard

### Phase 2: Enhanced Features
- 🔄 Comments on posts
- 🔄 Follow/unfollow users
- 🔄 Enhanced metadata (location tagging)
- 🔄 Recipe sharing with ingredients
- 🔄 AVAX tipping for exceptional posts

### Phase 3: Monetization
- 🔜 Marketplace for trading post NFTs
- 🔜 Restaurant partnerships and verification
- 🔜 Sponsored challenges
- 🔜 Premium subscription with TASTE

### Phase 4: Governance
- 🔜 DAO for platform decisions
- 🔜 Community-curated featured posts
- 🔜 Voting on new features

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Avalanche** for the fast and low-cost blockchain
- **OpenZeppelin** for secure smart contract libraries
- **Pinata** for IPFS infrastructure
- **RainbowKit** for beautiful wallet connection UI

---

## 📞 Contact

- **Twitter:** [@FoodieDapp](https://twitter.com/foodiedapp)
- **Discord:** [Join our community](https://discord.gg/foodiedapp)
- **Website:** [foodiedapp.xyz](https://foodiedapp.xyz)

---

## ⚠️ Disclaimer

This is an MVP/prototype for demonstration purposes. Smart contracts have not been audited. Use at your own risk. Do not deploy to mainnet without proper security audits.

---

**Built with ❤️ by the Foodie dApp team**

🍳 **Cook** • 🍜 **Taste** • 💰 **Earn**
