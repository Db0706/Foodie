import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useLikePost, useRewardAmounts } from '@/lib/hooks/useContracts';
import { shortenAddress, getRelativeTime } from '@/lib/utils';
import { addLike, incrementLikeCount } from '@/lib/firebase';
import type { Post } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: Post & { id: string };
  onLikeSuccess?: () => void;
}

export default function PostCard({ post, onLikeSuccess }: PostCardProps) {
  const { address } = useAccount();
  const { likePost, isPending } = useLikePost();
  const { likeReward: contractLikeReward } = useRewardAmounts();

  // Use contract value or fallback to 1 TASTE
  const likeReward = contractLikeReward && contractLikeReward !== '0' ? contractLikeReward : '1';

  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isOwnPost = address?.toLowerCase() === post.creatorWallet.toLowerCase();

  const handleLike = async () => {
    if (!address || isOwnPost || hasLiked || isPending) return;

    const likeToast = toast.loading('Liking post...');

    try {
      // Call smart contract
      await likePost(BigInt(post.tokenId));

      // Update Firebase
      await addLike({
        postId: post.id,
        tokenId: post.tokenId,
        likerWallet: address.toLowerCase(),
        creatorWallet: post.creatorWallet,
        timestamp: Date.now(),
      });

      await incrementLikeCount(post.id);

      // Update local state
      setHasLiked(true);
      setLikeCount(likeCount + 1);

      toast.success(`Liked! Creator earned ${likeReward} TASTE`, { id: likeToast });

      if (onLikeSuccess) onLikeSuccess();
    } catch (error: any) {
      console.error('Error liking post:', error);
      toast.error(error.message || 'Failed to like post', { id: likeToast });
    }
  };

  // Use actual rating from post, or fallback to calculating from likes
  const starRating = post.rating || Math.min(5, Math.max(1, Math.ceil((likeCount / 10) * 5) || 1));

  return (
    <div className="card group">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-64 md:w-72 h-48 sm:h-56 md:h-64 flex-shrink-0 bg-neutral-100">
          {!imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                  <div className="animate-pulse text-neutral-400 text-sm">Loading...</div>
                </div>
              )}
              <img
                src={post.imageURL}
                alt={post.caption}
                className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 text-neutral-400">
              <div className="text-4xl mb-2">🍽️</div>
              <div className="text-xs">Image unavailable</div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {/* Stars and Badge */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-base sm:text-lg ${
                        i < starRating ? 'text-primary-500' : 'text-neutral-300'
                      }`}
                    >
                      ●
                    </span>
                  ))}
                </div>
                <span className={`badge text-xs ${post.mode === 'COOK' ? 'badge-cook' : 'badge-taste'}`}>
                  {post.mode === 'COOK' ? '🍳 Home Cooking' : '🍜 Dining Out'}
                </span>
              </div>

              {/* Caption/Review */}
              <p className="text-neutral-800 text-sm sm:text-base leading-relaxed mb-3">
                &quot;{post.caption}&quot;
              </p>

              {/* User Info */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {post.creatorWallet[2].toUpperCase()}
                </div>
                <span className="font-medium text-neutral-700">
                  {shortenAddress(post.creatorWallet)}
                </span>
                <span className="text-neutral-400">•</span>
                <span className="truncate">{getRelativeTime(post.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-200 flex-wrap">
            <button
              onClick={handleLike}
              disabled={isOwnPost || hasLiked || isPending}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                hasLiked
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : isOwnPost
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-white text-neutral-700 hover:bg-primary-50 hover:text-primary-700 border border-neutral-300 hover:border-primary-300'
              }`}
            >
              <span>{hasLiked ? '❤️' : '🤍'}</span>
              <span>Helpful ({likeCount})</span>
            </button>

            {!isOwnPost && !hasLiked && (
              <span className="text-xs text-neutral-500">
                +{likeReward} TASTE
              </span>
            )}

            {isOwnPost && (
              <span className="text-xs text-neutral-500 italic">Your post</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
