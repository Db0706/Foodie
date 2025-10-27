// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./TasteToken.sol";
import "./TasteNFT.sol";

/**
 * @title TasteRewarder
 * @dev Main app logic contract for the Foodie dApp
 * Handles post creation, NFT minting, token rewards, and likes
 */
contract TasteRewarder is Ownable, ReentrancyGuard {
    TasteToken public tasteToken;
    TasteNFT public tasteNFT;

    // Reward amounts (in wei, 18 decimals)
    uint256 public postReward = 5 * 10**18; // 5 TASTE per post
    uint256 public likeReward = 1 * 10**18; // 1 TASTE per like

    // Post tracking
    struct Post {
        uint256 tokenId;
        address creator;
        string mode; // "COOK" or "TASTE"
        uint256 timestamp;
        uint256 likeCount;
    }

    mapping(uint256 => Post) public posts; // tokenId => Post
    mapping(uint256 => address) public postCreator; // tokenId => creator address
    mapping(uint256 => mapping(address => bool)) public hasLiked; // tokenId => liker => has liked

    uint256 public totalPosts;

    // Events
    event PostCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string mode,
        string tokenURI,
        uint256 timestamp,
        uint256 rewardAmount
    );

    event PostLiked(
        uint256 indexed tokenId,
        address indexed liker,
        address indexed creator,
        uint256 rewardAmount
    );

    event RewardsUpdated(uint256 newPostReward, uint256 newLikeReward);

    constructor(
        address _tasteToken,
        address _tasteNFT,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_tasteToken != address(0), "TasteRewarder: token address cannot be zero");
        require(_tasteNFT != address(0), "TasteRewarder: NFT address cannot be zero");

        tasteToken = TasteToken(_tasteToken);
        tasteNFT = TasteNFT(_tasteNFT);
    }

    /**
     * @dev Create a new post - mints NFT and rewards creator
     * @param creator Address of the post creator
     * @param tokenURI IPFS URI containing post metadata
     * @param mode Post mode: "COOK" or "TASTE"
     * @return tokenId The ID of the newly minted NFT
     */
    function createPost(
        address creator,
        string memory tokenURI,
        string memory mode
    ) external nonReentrant returns (uint256) {
        require(creator != address(0), "TasteRewarder: creator cannot be zero address");
        require(bytes(tokenURI).length > 0, "TasteRewarder: tokenURI cannot be empty");
        require(
            keccak256(bytes(mode)) == keccak256(bytes("COOK")) ||
            keccak256(bytes(mode)) == keccak256(bytes("TASTE")),
            "TasteRewarder: mode must be COOK or TASTE"
        );

        // Mint NFT to creator
        uint256 tokenId = tasteNFT.mintPostNFT(creator, tokenURI);

        // Store post data
        posts[tokenId] = Post({
            tokenId: tokenId,
            creator: creator,
            mode: mode,
            timestamp: block.timestamp,
            likeCount: 0
        });

        postCreator[tokenId] = creator;
        totalPosts++;

        // Reward creator with TASTE tokens
        tasteToken.mint(creator, postReward);

        emit PostCreated(tokenId, creator, mode, tokenURI, block.timestamp, postReward);

        return tokenId;
    }

    /**
     * @dev Like a post - rewards the original creator
     * @param tokenId ID of the post to like
     */
    function likePost(uint256 tokenId) external nonReentrant {
        require(postCreator[tokenId] != address(0), "TasteRewarder: post does not exist");
        require(!hasLiked[tokenId][msg.sender], "TasteRewarder: already liked this post");
        require(postCreator[tokenId] != msg.sender, "TasteRewarder: cannot like own post");

        // Mark as liked
        hasLiked[tokenId][msg.sender] = true;

        // Increment like count
        posts[tokenId].likeCount++;

        // Reward original post creator
        address creator = postCreator[tokenId];
        tasteToken.mint(creator, likeReward);

        emit PostLiked(tokenId, msg.sender, creator, likeReward);
    }

    /**
     * @dev Check if an address has liked a post
     * @param tokenId ID of the post
     * @param user Address to check
     * @return Whether the user has liked the post
     */
    function hasUserLiked(uint256 tokenId, address user) external view returns (bool) {
        return hasLiked[tokenId][user];
    }

    /**
     * @dev Get post details
     * @param tokenId ID of the post
     * @return Post struct with all post data
     */
    function getPost(uint256 tokenId) external view returns (Post memory) {
        require(postCreator[tokenId] != address(0), "TasteRewarder: post does not exist");
        return posts[tokenId];
    }

    /**
     * @dev Update reward amounts - only owner
     * @param newPostReward New reward amount for creating posts
     * @param newLikeReward New reward amount for likes
     */
    function updateRewards(uint256 newPostReward, uint256 newLikeReward) external onlyOwner {
        require(newPostReward > 0, "TasteRewarder: post reward must be positive");
        require(newLikeReward > 0, "TasteRewarder: like reward must be positive");

        postReward = newPostReward;
        likeReward = newLikeReward;

        emit RewardsUpdated(newPostReward, newLikeReward);
    }

    /**
     * @dev Get current reward configuration
     * @return Current post and like reward amounts
     */
    function getRewardAmounts() external view returns (uint256, uint256) {
        return (postReward, likeReward);
    }
}
