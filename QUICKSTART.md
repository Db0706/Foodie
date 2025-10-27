# 🚀 Quick Start Guide

Get your Foodie dApp running in 10 minutes!

---

## Step 1: Install Dependencies

```bash
# Install root dependencies (Hardhat)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## Step 2: Set Up Environment Variables

### Root Environment (.env)

```bash
cp .env.example .env
```

Edit `.env` and add:
```env
PRIVATE_KEY=your_private_key_here
SNOWTRACE_API_KEY=your_snowtrace_api_key_here  # Optional for verification
```

**Get Test AVAX:** https://faucet.avax.network/

### Frontend Environment (frontend/.env.local)

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local` and add:
```env
NEXT_PUBLIC_CHAIN_ID=43113
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# Get from https://pinata.cloud (free account)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here

# Get from https://cloud.walletconnect.com (free)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Leave these empty for now - will fill after deployment
NEXT_PUBLIC_TASTE_TOKEN_ADDRESS=
NEXT_PUBLIC_TASTE_NFT_ADDRESS=
NEXT_PUBLIC_TASTE_REWARDER_ADDRESS=
```

---

## Step 3: Compile Contracts

```bash
npx hardhat compile
```

Expected output: `Compiled 3 Solidity files successfully`

---

## Step 4: Deploy to Avalanche Fuji Testnet

```bash
npx hardhat run scripts/deploy.js --network fuji
```

**Save the contract addresses from the output!** Example:
```
TasteToken deployed to: 0x123...
TasteNFT deployed to: 0x456...
TasteRewarder deployed to: 0x789...
```

---

## Step 5: Update Frontend Config

Edit `frontend/.env.local` and paste the deployed addresses:
```env
NEXT_PUBLIC_TASTE_TOKEN_ADDRESS=0x123...
NEXT_PUBLIC_TASTE_NFT_ADDRESS=0x456...
NEXT_PUBLIC_TASTE_REWARDER_ADDRESS=0x789...
```

---

## Step 6: Set Up Firebase (Optional but Recommended)

1. Go to https://firebase.google.com/
2. Create a new project
3. Enable Firestore Database
4. Get your config from Project Settings
5. Add to `frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

6. Create collections: `posts`, `users`, `likes`

**Skip Firebase?** The app will work but without feed persistence (posts only visible during session).

---

## Step 7: Run Frontend

```bash
cd frontend
npm run dev
```

Visit: http://localhost:3000

---

## Step 8: Test the App!

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Select Core or MetaMask
   - Make sure you're on Avalanche Fuji (Chain ID: 43113)

2. **Create a Post**
   - Go to Cook-to-Earn tab
   - Click "Post & Earn 5 TASTE"
   - Upload a food photo
   - Write a caption
   - Click "Mint & Earn"
   - Approve transaction in wallet
   - Wait ~30 seconds
   - You earned 5 TASTE!

3. **Like a Post**
   - Scroll through feed
   - Click like button on any post
   - Creator earns 1 TASTE

4. **Check Profile**
   - Go to Profile tab
   - See your TASTE balance
   - View your posts

5. **Check Leaderboard**
   - Go to Leaderboard tab
   - See top earners

---

## 🎉 You're Done!

Your Foodie dApp is now live on Avalanche Fuji testnet!

---

## 📝 Next Steps

- Read [README.md](README.md) for full documentation
- Check [docs/USAGE_FLOW.md](docs/USAGE_FLOW.md) for detailed user flows
- Review [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md) for limitations
- Share with friends for testing!

---

## 🐛 Troubleshooting

### "User rejected transaction"
- Normal - you clicked reject in wallet
- Try again

### "Insufficient funds"
- Get test AVAX from faucet: https://faucet.avax.network/

### "Network error"
- Check you're on Avalanche Fuji (Chain ID: 43113)
- Check RPC URL is correct

### "IPFS upload failed"
- Verify Pinata JWT is correct
- Check image size (<10MB)
- Try again

### Frontend won't start
- Make sure you ran `npm install` in frontend folder
- Check all env vars are set in `.env.local`

### Contracts won't deploy
- Make sure you have test AVAX
- Check private key is correct in `.env`
- Verify RPC URL is accessible

---

## 💬 Need Help?

- Open an issue on GitHub
- Check the [README.md](README.md)
- Review the [docs/](docs/) folder

---

**Happy building! 🍽️**
