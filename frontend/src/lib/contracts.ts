// Contract addresses (update after deployment)
export const CONTRACTS = {
  TasteToken: process.env.NEXT_PUBLIC_TASTE_TOKEN_ADDRESS || '',
  TasteNFT: process.env.NEXT_PUBLIC_TASTE_NFT_ADDRESS || '',
  TasteRewarder: process.env.NEXT_PUBLIC_TASTE_REWARDER_ADDRESS || '',
};

// ABIs - Minimal ABIs for required functions
// After deployment, copy full ABIs from artifacts/contracts/

export const TASTE_TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export const TASTE_NFT_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' }
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'tokenURI', type: 'string' }
    ],
    name: 'PostNFTMinted',
    type: 'event'
  }
] as const;

export const TASTE_REWARDER_ABI = [
  {
    inputs: [
      { name: 'creator', type: 'address' },
      { name: 'tokenURI', type: 'string' },
      { name: 'mode', type: 'string' }
    ],
    name: 'createPost',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'likePost',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getPost',
    outputs: [
      {
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'creator', type: 'address' },
          { name: 'mode', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'likeCount', type: 'uint256' }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'user', type: 'address' }
    ],
    name: 'hasUserLiked',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'postReward',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'likeReward',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalPosts',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'mode', type: 'string' },
      { indexed: false, name: 'tokenURI', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
      { indexed: false, name: 'rewardAmount', type: 'uint256' }
    ],
    name: 'PostCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'liker', type: 'address' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'rewardAmount', type: 'uint256' }
    ],
    name: 'PostLiked',
    type: 'event'
  }
] as const;
