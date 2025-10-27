import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, TASTE_TOKEN_ABI, TASTE_NFT_ABI, TASTE_REWARDER_ABI } from '../contracts';
import { formatEther, parseEther } from 'viem';

/**
 * Hook to get user's TASTE token balance
 */
export function useTasteBalance() {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.TasteToken as `0x${string}`,
    abi: TASTE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  return {
    balance: data ? formatEther(data) : '0',
    isLoading,
    refetch,
  };
}

/**
 * Hook to create a new post
 */
export function useCreatePost() {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const createPost = async (tokenURI: string, mode: 'COOK' | 'TASTE') => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    console.log('📝 Preparing transaction...');
    console.log('Contract address:', CONTRACTS.TasteRewarder);
    console.log('Arguments:', { creator: address, tokenURI, mode });

    // This will open MetaMask and wait for user to sign
    const hash = await writeContractAsync({
      address: CONTRACTS.TasteRewarder as `0x${string}`,
      abi: TASTE_REWARDER_ABI,
      functionName: 'createPost',
      args: [address, tokenURI, mode],
    });

    console.log('✅ Transaction sent! Hash:', hash);
    return hash;
  };

  return {
    createPost,
    isPending,
  };
}

/**
 * Hook to like a post
 */
export function useLikePost() {
  const { writeContractAsync, isPending } = useWriteContract();

  const likePost = async (tokenId: bigint) => {
    console.log('❤️ Liking post:', tokenId);

    const hash = await writeContractAsync({
      address: CONTRACTS.TasteRewarder as `0x${string}`,
      abi: TASTE_REWARDER_ABI,
      functionName: 'likePost',
      args: [tokenId],
    });

    console.log('✅ Like transaction sent! Hash:', hash);
    return hash;
  };

  return {
    likePost,
    isPending,
  };
}

/**
 * Hook to check if user has liked a post
 */
export function useHasLiked(tokenId: bigint) {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.TasteRewarder as `0x${string}`,
    abi: TASTE_REWARDER_ABI,
    functionName: 'hasUserLiked',
    args: [tokenId, address || '0x0'],
  });

  return {
    hasLiked: data || false,
    isLoading,
    refetch,
  };
}

/**
 * Hook to get post details
 */
export function usePost(tokenId: bigint) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.TasteRewarder as `0x${string}`,
    abi: TASTE_REWARDER_ABI,
    functionName: 'getPost',
    args: [tokenId],
  });

  return {
    post: data,
    isLoading,
    refetch,
  };
}

/**
 * Hook to get user's NFTs
 */
export function useUserNFTs() {
  const { address } = useAccount();

  const { data: balance } = useReadContract({
    address: CONTRACTS.TasteNFT as `0x${string}`,
    abi: TASTE_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  return {
    nftCount: balance ? Number(balance) : 0,
  };
}

/**
 * Hook to get reward amounts
 */
export function useRewardAmounts() {
  const { data: postReward } = useReadContract({
    address: CONTRACTS.TasteRewarder as `0x${string}`,
    abi: TASTE_REWARDER_ABI,
    functionName: 'postReward',
  });

  const { data: likeReward } = useReadContract({
    address: CONTRACTS.TasteRewarder as `0x${string}`,
    abi: TASTE_REWARDER_ABI,
    functionName: 'likeReward',
  });

  return {
    postReward: postReward ? formatEther(postReward) : '0',
    likeReward: likeReward ? formatEther(likeReward) : '0',
  };
}

/**
 * Hook to get total posts count
 */
export function useTotalPosts() {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.TasteRewarder as `0x${string}`,
    abi: TASTE_REWARDER_ABI,
    functionName: 'totalPosts',
  });

  return {
    totalPosts: data ? Number(data) : 0,
    isLoading,
    refetch,
  };
}
