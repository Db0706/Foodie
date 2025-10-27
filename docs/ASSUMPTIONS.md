# Assumptions & Considerations for MVP

This document outlines the assumptions, simplifications, and known limitations in this MVP implementation of the Foodie dApp.

---

## ✅ What's Included (MVP Scope)

### Smart Contracts:
- ✅ TasteToken (ERC-20) with minting capability
- ✅ TasteNFT (ERC-721) for post NFTs
- ✅ TasteRewarder for core logic (create posts, likes, rewards)
- ✅ OpenZeppelin security patterns
- ✅ Access control (only TasteRewarder can mint)
- ✅ Event emissions for off-chain indexing
- ✅ Owner-adjustable reward amounts

### Frontend:
- ✅ Wallet connection (RainbowKit + wagmi)
- ✅ Cook-to-Earn and Taste-to-Earn modes
- ✅ Image upload with preview
- ✅ IPFS upload via Pinata
- ✅ NFT minting flow
- ✅ Like functionality
- ✅ Profile with balance and NFT count
- ✅ Leaderboard (all-time and weekly)
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Loading states and error handling

### Infrastructure:
- ✅ IPFS storage for images and metadata
- ✅ Firebase/Firestore schema for off-chain indexing
- ✅ Hardhat deployment scripts
- ✅ Environment variable configuration
- ✅ Comprehensive documentation

---

## 🚧 Simplifications for MVP

### 1. No AVAX Tipping
**Original Spec:** Users can tip AVAX to post creators

**MVP:** Only TASTE token rewards (no AVAX tipping)

**Reason:** Simplifies MVP, reduces gas costs, faster to implement

**Future:** Add optional AVAX tipping button in Phase 2

---

### 2. No Content Moderation
**Limitation:** No on-chain or off-chain content moderation

**MVP Approach:** Assume all posts are legitimate user content

**Risk:** Potential for spam or inappropriate content

**Future Solutions:**
- Community reporting system
- Stake-based posting (require TASTE deposit)
- DAO-based content moderation
- AI content filtering before minting

---

### 3. Simplified Like Prevention
**Current:** Each address can only like a post once (tracked on-chain)

**Limitation:** No prevention of:
- Multiple wallets from same user
- Bot-generated likes

**Future Solutions:**
- Require minimum TASTE balance to like
- Reputation system
- Rate limiting via smart contract
- Cooldown periods between likes

---

### 4. Manual Firebase Sync
**MVP Approach:** Frontend updates Firebase directly after transactions

**Limitation:**
- Race conditions possible
- No automatic sync if user closes browser
- Inconsistency if Firebase fails

**Production Solution:**
- Backend service listening to blockchain events
- Automatic sync via Cloud Functions
- Retry logic for failed syncs
- Event replay capability

---

### 5. No NFT Marketplace
**MVP:** NFTs are minted but not tradeable in-app

**Limitation:** Users cannot buy/sell post NFTs

**Future:**
- Marketplace for trading post NFTs
- Royalties for original creators
- TASTE as marketplace currency

---

### 6. No Recipe Structured Data
**MVP:** Recipes are free-form text in caption

**Limitation:** No structured data for ingredients, steps, cooking time, etc.

**Future:**
- Structured recipe schema
- Searchable by ingredients
- Difficulty ratings
- Nutritional information

---

### 7. No Location Verification
**Taste-to-Earn Spec:** User adds location text

**MVP:** Location is free text, not verified

**Limitation:** Users can claim any location

**Future:**
- GPS verification
- Restaurant partnerships with QR codes
- Check-in system with proof

---

### 8. Basic Token Distribution
**MVP:** All tokens minted from treasury as users earn

**Limitation:** No vesting, no ICO, no tokenomics modeling

**Future:**
- Vesting schedule for team/advisors
- Liquidity pools on DEXs
- Token burns for deflation
- Staking mechanisms

---

### 9. No Private/Draft Posts
**MVP:** All posts are public immediately

**Limitation:** Cannot save drafts or make private posts

**Future:**
- Draft system
- Private posts visible only to followers
- Scheduled posting

---

### 10. No Mobile App
**MVP:** Web-only responsive design

**Limitation:** Not optimized for mobile camera workflow

**Future:**
- React Native mobile app
- Direct camera integration
- Push notifications
- Offline drafting

---

## 🔐 Security Considerations

### Audited:
- ✅ OpenZeppelin contracts (industry standard)
- ✅ Basic access control patterns

### Not Audited:
- ⚠️ Custom TasteRewarder logic
- ⚠️ Frontend contract interactions
- ⚠️ IPFS upload security

**Recommendation:**
- Get professional audit before mainnet
- Bug bounty program
- Gradual rollout with limits

---

## ⚡ Performance Considerations

### Blockchain:
- **Gas costs:** ~0.01-0.03 AVAX per post on Fuji
- **Confirmation time:** ~2 seconds on Avalanche
- **Scalability:** Avalanche can handle high throughput

### IPFS:
- **Upload speed:** 2-5 seconds per image
- **Availability:** Pinata ensures files stay pinned
- **Gateway speed:** Can be slow, consider CDN in future

### Firebase:
- **Query speed:** <100ms for most queries
- **Scalability:** Good for MVP, may need indexing optimization at scale
- **Cost:** Free tier sufficient for MVP

---

## 🛣️ Known Limitations

### 1. Token ID Tracking
**Issue:** Frontend uses placeholder tokenId (0) when saving to Firebase

**Why:** Token ID only available after transaction confirmation

**Solution:** Use event listener to update tokenId after mint

---

### 2. Balance Refresh
**Issue:** TASTE balance doesn't auto-update after earning

**Why:** wagmi caches contract reads

**Solution:** Manual refresh button (included), or polling

---

### 3. Image Size
**Issue:** Large images (>10MB) rejected

**Why:** Pinata limits, UX considerations

**Solution:** Client-side compression (future enhancement)

---

### 4. Concurrent Likes
**Issue:** If many users like at same time, likeCount may be slightly off in Firebase

**Why:** Race condition in increment operation

**Solution:** Use Firestore FieldValue.increment() (planned)

---

### 5. No Search
**Issue:** Cannot search posts by caption, creator, or mode

**Why:** Basic Firebase queries only

**Solution:** Add Algolia or Elasticsearch for full-text search

---

### 6. Limited NFT Metadata
**Issue:** Cannot update NFT metadata after minting

**Why:** Standard ERC-721 with fixed tokenURI

**Solution:** Use dynamic metadata endpoints (future)

---

## 🌐 Browser Compatibility

### Tested:
- ✅ Chrome/Brave (Desktop & Mobile)
- ✅ Firefox (Desktop)
- ✅ Safari (Desktop)

### Known Issues:
- ⚠️ Safari may have Web3 wallet issues (use MetaMask mobile)
- ⚠️ Old browsers without Web3 support won't work

---

## 📱 Wallet Compatibility

### Supported:
- ✅ Core Wallet
- ✅ MetaMask (with Avalanche network added)
- ✅ Any WalletConnect-compatible wallet

### Not Tested:
- ⚠️ Hardware wallets (Ledger, Trezor)
- ⚠️ Coinbase Wallet

---

## 🔄 Data Consistency

### Eventual Consistency:
- Firebase updates are async
- Blockchain confirmations take ~2 seconds
- Feed may show slight delays

### Source of Truth:
- **Blockchain:** NFT ownership, token balances, like status
- **Firebase:** Display data for performance (should sync with blockchain)

**Conflict Resolution:** Blockchain data always wins in disputes

---

## 💰 Economic Considerations

### MVP Token Economics:
- **Inflation:** Unlimited minting (by design for MVP)
- **No token sink:** No burning or staking
- **Value:** Speculative only in MVP

### Risks:
- Token value dilution with unlimited minting
- No incentive to hold tokens
- Potential for farming/gaming

### Future Solutions:
- Token burning on certain actions
- Staking for boosted rewards
- Utility beyond rewards (governance, premium features)
- Supply caps or emission schedules

---

## 🎯 Target Audience (MVP)

**Primary:**
- Crypto-native users comfortable with wallets
- Food enthusiasts in Web3 communities
- Early adopters and testers

**Not Target (Yet):**
- Mainstream non-crypto users (onboarding too complex)
- Professional chefs/restaurants (no verification)
- Food critics (no structured reviews)

---

## 🚀 Deployment Recommendations

### Testnet First:
- ✅ Deploy to Avalanche Fuji
- ✅ Test all flows thoroughly
- ✅ Gather user feedback
- ✅ Fix bugs and optimize

### Before Mainnet:
- ⚠️ Professional security audit
- ⚠️ Load testing
- ⚠️ Legal review (token securities laws)
- ⚠️ Community building
- ⚠️ Marketing strategy
- ⚠️ Backend event syncing service
- ⚠️ Multi-sig for contract ownership

---

## 📊 Success Metrics (MVP)

### Technical:
- Contract deployment successful
- All transactions confirm without errors
- Frontend loads in <2 seconds

### User:
- 100+ test users on Fuji
- 500+ posts created
- 1000+ likes given
- Average session time >5 minutes

### Quality:
- <5% transaction failure rate
- <1% UI bugs reported
- Positive user feedback

---

## 🎓 Learning Resources

If you're new to any tech in this stack:

- **Avalanche:** https://docs.avax.network/
- **Solidity:** https://docs.soliditylang.org/
- **OpenZeppelin:** https://docs.openzeppelin.com/
- **Hardhat:** https://hardhat.org/getting-started/
- **wagmi:** https://wagmi.sh/
- **Next.js:** https://nextjs.org/docs
- **IPFS:** https://docs.ipfs.tech/

---

## ❓ FAQ

**Q: Why Avalanche?**
A: Fast, cheap, EVM-compatible, growing ecosystem

**Q: Why IPFS instead of centralized storage?**
A: Decentralization, censorship resistance, permanent storage

**Q: Why Firebase if it's centralized?**
A: Performance trade-off for MVP. Blockchain is source of truth, Firebase is just cache.

**Q: Can I use this in production?**
A: Not recommended without security audit and additional features. This is an MVP/demo.

**Q: How do I get support?**
A: Open an issue on GitHub or join the Discord community.

---

## ✍️ Final Notes

This MVP is designed to:
1. **Prove the concept** - Show that Cook/Taste-to-Earn works
2. **Validate demand** - See if users want this product
3. **Learn & iterate** - Gather feedback for improvements

It is **NOT**:
- Production-ready without audits
- Feature-complete
- A finished product

**Next Steps:** Deploy, test, gather feedback, iterate, audit, launch! 🚀

---

**Built for learning and experimentation. Use responsibly.** 🍽️
