# End-to-End Usage Flow

This document describes the complete user journey through the Foodie dApp, from connecting a wallet to earning TASTE tokens.

## Prerequisites

- User has Avalanche-compatible wallet (Core, MetaMask with Avalanche network)
- User has test AVAX for gas fees (get from https://faucet.avax.network/)
- Contracts are deployed to Avalanche Fuji testnet

---

## Flow 1: First-Time User - Create a Cook-to-Earn Post

### Step 1: Connect Wallet

**User Action:**
1. User visits the dApp homepage
2. Clicks "Connect Wallet" button in header
3. Selects their wallet (Core or MetaMask)
4. Approves connection in wallet popup

**Frontend:**
- RainbowKit modal opens
- User selects wallet provider
- wagmi connects to wallet and stores address

**Result:**
- User is connected with address shown in header
- Navigation tabs become visible: Cook, Taste, Leaderboard, Profile

---

### Step 2: Navigate to Cook-to-Earn Tab

**User Action:**
1. Clicks "🍳 Cook-to-Earn" tab

**Frontend:**
- Feed component loads with mode="COOK"
- Shows "Post & Earn 5 TASTE" button
- Fetches existing Cook posts from Firebase
- Displays posts in feed

**Result:**
- User sees Cook-to-Earn feed with existing posts

---

### Step 3: Start Creating Post

**User Action:**
1. Clicks "🍳 Post & Earn 5 TASTE" button

**Frontend:**
- PostCreator modal opens
- Shows file upload area and caption field

**Result:**
- Modal is open and ready for input

---

### Step 4: Upload Image

**User Action:**
1. Clicks upload area or drag-and-drops image
2. Selects food photo from device (e.g., "pasta.jpg")

**Frontend:**
- Validates file (type, size)
- Creates preview using FileReader
- Stores file in component state

**Result:**
- Image preview is displayed in modal
- File ready for upload

---

### Step 5: Write Caption

**User Action:**
1. Types caption in text area: "Homemade carbonara! Used guanciale and pecorino romano. Took 2 hours but perfect!"
2. Caption is 90 characters (within 200 limit)

**Frontend:**
- Character count updates in real-time
- Submit button becomes enabled

**Result:**
- Caption stored in state
- Form is complete and valid

---

### Step 6: Submit Post

**User Action:**
1. Clicks "🍳 Mint & Earn" button

**Frontend Process:**

**a) Upload Image to IPFS (2-5 seconds)**
```typescript
const imageCID = await uploadImageToIPFS(imageFile);
// Returns: "QmXyz..."
```
- Shows toast: "Uploading to IPFS..."
- File uploaded to Pinata
- Receives IPFS CID

**b) Create and Upload Metadata (1-2 seconds)**
```typescript
const tokenURI = await createPostMetadata(imageCID, caption, "COOK", userAddress);
// Returns: "ipfs://QmAbc..."
```
- Builds metadata JSON:
```json
{
  "name": "🍳 Homemade carbonara! Used guanciale...",
  "description": "Homemade carbonara! Used guanciale and pecorino romano. Took 2 hours but perfect!",
  "image": "ipfs://QmXyz...",
  "attributes": [
    { "trait_type": "mode", "value": "COOK" },
    { "trait_type": "creator", "value": "0xUser..." },
    { "trait_type": "timestamp", "value": 1704067200 }
  ]
}
```
- Uploads metadata to IPFS
- Shows toast: "Creating metadata..."

**c) Call Smart Contract (10-30 seconds)**
```typescript
await createPost(tokenURI, "COOK");
```
- Shows toast: "Minting NFT..."
- Wallet popup asks user to confirm transaction
- User approves and pays gas (~0.01 AVAX)
- Transaction submitted to blockchain
- Waits for confirmation

**On-Chain:**
1. TasteRewarder.createPost() executes
2. Calls TasteNFT.mintPostNFT() → mints NFT to user
3. Stores post data in contract storage
4. Calls TasteToken.mint() → mints 5 TASTE to user
5. Emits PostCreated event

**d) Save to Firebase (< 1 second)**
```typescript
await addPost({
  postId: "0xUser...-1704067200000",
  tokenId: 0,
  imageURL: "https://gateway.pinata.cloud/ipfs/QmXyz...",
  caption: "Homemade carbonara!...",
  mode: "COOK",
  creatorWallet: "0xuser...",
  timestamp: 1704067200000,
  likeCount: 0,
  metadataURI: "ipfs://QmAbc..."
});
```

**Result:**
- Success toast: "Post created! Earned 5 TASTE"
- Modal closes
- Feed refreshes and shows new post at top
- User balance increases by 5 TASTE
- User receives NFT in wallet

---

## Flow 2: Like Another User's Post

### Step 1: Browse Feed

**User Action:**
1. User scrolls through Cook or Taste feed
2. Sees a post by another user (0xOther...)

**Frontend:**
- PostCard component renders post
- Shows like button with count
- Checks if user already liked (hasUserLiked)

---

### Step 2: Like Post

**User Action:**
1. Clicks like button (🤍)

**Frontend Process:**

**a) Call Smart Contract (10-30 seconds)**
```typescript
await likePost(tokenId);
```
- Shows toast: "Liking post..."
- Wallet popup asks for confirmation
- User approves transaction
- Transaction submitted

**On-Chain:**
1. TasteRewarder.likePost(tokenId) executes
2. Checks user hasn't already liked
3. Checks user isn't the creator
4. Marks post as liked by user
5. Increments like count
6. Calls TasteToken.mint() → mints 1 TASTE to original creator
7. Emits PostLiked event

**b) Update Firebase**
```typescript
await addLike({
  postId: "post_abc",
  tokenId: 42,
  likerWallet: "0xUser...",
  creatorWallet: "0xOther...",
  timestamp: Date.now()
});
await incrementLikeCount("post_abc");
```

**Result:**
- Success toast: "Liked! Creator earned 1 TASTE"
- Like button turns red (❤️)
- Like count increases by 1
- Original creator's balance increases by 1 TASTE
- User cannot like the same post again

---

## Flow 3: View Profile

### Step 1: Navigate to Profile

**User Action:**
1. Clicks "👤 Profile" tab

**Frontend:**
- Loads Profile component
- Fetches user's TASTE balance from contract
- Fetches user's NFT count
- Queries Firebase for user's posts

**Result:**
- Shows user avatar, wallet address, stats
- Displays TASTE balance in colored card
- Shows grid of all user's posts (both Cook and Taste)

---

### Step 2: Refresh Balance

**User Action:**
1. Clicks "Refresh" button in balance card

**Frontend:**
```typescript
await refetchBalance();
```
- Queries TasteToken.balanceOf(userAddress)
- Updates displayed balance

**Result:**
- Balance updates to reflect latest earnings

---

## Flow 4: Check Leaderboard

### Step 1: Navigate to Leaderboard

**User Action:**
1. Clicks "🏆 Leaderboard" tab

**Frontend:**
- Loads Leaderboard component
- Queries Firebase for top 10 users by totalEarned
- Displays podium (top 3) and list (4-10)

**Result:**
- Shows top earners with their TASTE totals
- Highlights current user if in top 10
- Can toggle between "All Time" and "This Week"

---

## Flow 5: Create Taste-to-Earn Post

Same as Flow 1, but:
- User selects "🍜 Taste-to-Earn" tab
- Caption describes restaurant meal: "Amazing ramen at Tokyo Ramen Bar downtown!"
- Mode is set to "TASTE" instead of "COOK"
- NFT has Taste badge instead of Cook badge

---

## Technical Flow Summary

### Create Post Transaction Flow
```
User → Frontend → IPFS → Smart Contract → Blockchain → Event → Firebase
  |                                            ↓
  |                                    Mint NFT + Tokens
  |                                            ↓
  ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← Updated UI
```

### Like Post Transaction Flow
```
User → Frontend → Smart Contract → Blockchain → Event → Firebase
                        ↓
                  Mint Tokens to Creator
                        ↓
                  Updated UI ← ← ← ← ←
```

---

## Gas Costs (Approximate on Fuji)

- Create Post: ~0.01-0.03 AVAX
- Like Post: ~0.005-0.01 AVAX
- Update Rewards (owner only): ~0.005 AVAX

---

## Error Handling

### Common Errors:

1. **"User rejected transaction"**
   - User clicked reject in wallet
   - Action: Show toast, keep modal open

2. **"Insufficient funds"**
   - User doesn't have enough AVAX for gas
   - Action: Show toast with faucet link

3. **"Already liked this post"**
   - User trying to like same post twice
   - Action: Disable like button, show message

4. **"Cannot like own post"**
   - User trying to like their own post
   - Action: Disable like button on own posts

5. **"Failed to upload to IPFS"**
   - Network issue or Pinata error
   - Action: Show error toast, keep form data, allow retry

---

## Next Steps

After successful deployment and testing:
1. Get testnet AVAX from faucet
2. Deploy contracts to Fuji
3. Update `.env.local` with contract addresses
4. Set up Firebase/Supabase project
5. Configure Pinata for IPFS
6. Test full flow end-to-end
7. Share with community for testing
8. Prepare for mainnet deployment
