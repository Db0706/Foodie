# Database Schema

This document outlines the off-chain database schema for the Foodie dApp. We use Firebase Firestore (or Supabase) to index blockchain data for fast querying and display in the UI.

## Overview

The on-chain smart contracts are the source of truth, but we mirror essential data off-chain to:
- Enable fast feed queries without scanning the entire blockchain
- Support complex queries (filtering by mode, sorting by timestamp)
- Build leaderboards efficiently
- Provide instant UI updates

## Collections

### 1. `posts` Collection

Stores all food posts (both Cook and Taste modes).

**Schema:**
```typescript
{
  postId: string;           // Unique post ID: "{wallet}-{timestamp}"
  tokenId: number;          // NFT token ID from blockchain
  imageURL: string;         // IPFS gateway URL to image
  caption: string;          // User's post caption (max 200 chars)
  mode: "COOK" | "TASTE";   // Post mode
  creatorWallet: string;    // Creator's wallet address (lowercase)
  timestamp: number;        // Unix timestamp (milliseconds)
  likeCount: number;        // Total number of likes
  metadataURI: string;      // IPFS URI to full metadata (ipfs://...)
}
```

**Indexes:**
- `mode` + `timestamp` (descending) - for mode-specific feeds
- `creatorWallet` + `timestamp` (descending) - for user profiles
- `timestamp` (descending) - for global feed

**Example Document:**
```json
{
  "postId": "0xabc...123-1234567890",
  "tokenId": 42,
  "imageURL": "https://gateway.pinata.cloud/ipfs/Qm...",
  "caption": "Homemade pasta carbonara! Took 2 hours but worth it 🍝",
  "mode": "COOK",
  "creatorWallet": "0xabc...123",
  "timestamp": 1704067200000,
  "likeCount": 15,
  "metadataURI": "ipfs://Qm..."
}
```

---

### 2. `users` Collection

Tracks user stats and earnings for leaderboards.

**Schema:**
```typescript
{
  wallet: string;           // User's wallet address (lowercase)
  totalEarned: number;      // Total TASTE tokens earned (in token units)
  postsCount: number;       // Total number of posts created
  lastActive: number;       // Last activity timestamp (milliseconds)
}
```

**Indexes:**
- `totalEarned` (descending) - for all-time leaderboard
- `lastActive` (descending) + `totalEarned` (descending) - for weekly leaderboard
- `wallet` - for user lookups

**Example Document:**
```json
{
  "wallet": "0xabc...123",
  "totalEarned": 127.5,
  "postsCount": 23,
  "lastActive": 1704067200000
}
```

---

### 3. `likes` Collection

Records all likes to prevent duplicate likes and track engagement.

**Schema:**
```typescript
{
  postId: string;           // Reference to post document ID
  tokenId: number;          // NFT token ID
  likerWallet: string;      // Wallet address of user who liked (lowercase)
  creatorWallet: string;    // Original post creator's wallet (lowercase)
  timestamp: number;        // When the like occurred (milliseconds)
}
```

**Indexes:**
- `postId` + `likerWallet` - to check if user already liked a post
- `postId` - to count total likes for a post
- `creatorWallet` + `timestamp` - to track likes received by user

**Example Document:**
```json
{
  "postId": "post_abc123",
  "tokenId": 42,
  "likerWallet": "0xdef...456",
  "creatorWallet": "0xabc...123",
  "timestamp": 1704067200000
}
```

---

## Data Sync Strategy

### On PostCreated Event:
1. Listen to `PostCreated` event from TasteRewarder contract
2. Extract: `tokenId`, `creator`, `mode`, `tokenURI`, `timestamp`, `rewardAmount`
3. Fetch metadata from IPFS using `tokenURI`
4. Create document in `posts` collection
5. Update or create user document in `users` collection:
   - Increment `totalEarned` by `rewardAmount`
   - Increment `postsCount`
   - Update `lastActive`

### On PostLiked Event:
1. Listen to `PostLiked` event from TasteRewarder contract
2. Extract: `tokenId`, `liker`, `creator`, `rewardAmount`
3. Create document in `likes` collection
4. Increment `likeCount` in corresponding `posts` document
5. Update creator's document in `users` collection:
   - Increment `totalEarned` by `rewardAmount`
   - Update `lastActive`

### Alternative: Manual Sync via Frontend
For MVP, the frontend can update Firestore directly after successful transactions. In production, use a backend service or Cloud Functions to listen to events and sync automatically.

---

## Firestore Security Rules (Example)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Posts - read by all, write only by authenticated users
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }

    // Users - read by all, write only by authenticated users
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Likes - read by all, write only by authenticated users
    match /likes/{likeId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

---

## Supabase Alternative Schema

If using Supabase (PostgreSQL), here are the equivalent table schemas:

### `posts` Table
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  post_id VARCHAR(255) UNIQUE NOT NULL,
  token_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  mode VARCHAR(10) NOT NULL CHECK (mode IN ('COOK', 'TASTE')),
  creator_wallet VARCHAR(42) NOT NULL,
  timestamp BIGINT NOT NULL,
  like_count INTEGER DEFAULT 0,
  metadata_uri TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_mode_timestamp ON posts(mode, timestamp DESC);
CREATE INDEX idx_posts_creator ON posts(creator_wallet, timestamp DESC);
CREATE INDEX idx_posts_timestamp ON posts(timestamp DESC);
```

### `users` Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  wallet VARCHAR(42) UNIQUE NOT NULL,
  total_earned DECIMAL(18, 2) DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  last_active BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_total_earned ON users(total_earned DESC);
CREATE INDEX idx_users_last_active ON users(last_active DESC, total_earned DESC);
```

### `likes` Table
```sql
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  post_id VARCHAR(255) NOT NULL,
  token_id INTEGER NOT NULL,
  liker_wallet VARCHAR(42) NOT NULL,
  creator_wallet VARCHAR(42) NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, liker_wallet)
);

CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_likes_creator ON likes(creator_wallet, timestamp DESC);
```

---

## Notes

- All wallet addresses are stored in lowercase for consistent querying
- Timestamps are stored in milliseconds (JavaScript `Date.now()`)
- Token amounts can be stored as decimal numbers (formatted from wei)
- In production, implement proper authentication and validation
- Consider rate limiting and spam prevention
- Regularly backup your database
