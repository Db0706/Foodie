import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import PostCreator from './PostCreator';
import PostCard from './PostCard';
import { getPostsByMode } from '@/lib/firebase';
import type { Post } from '@/lib/firebase';

interface FeedProps {
  mode: 'COOK' | 'TASTE';
}

export default function Feed({ mode }: FeedProps) {
  const { isConnected } = useAccount();
  const [posts, setPosts] = useState<(Post & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const fetchedPosts = await getPostsByMode(mode);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [mode]);

  const handlePostSuccess = () => {
    loadPosts(); // Refresh feed after new post
  };

  const modeConfig = {
    COOK: {
      emoji: '🍳',
      title: 'Home Cooking',
      description: 'Discover and share amazing home-cooked meals',
      emptyMessage: 'No cooking posts yet. Be the first to share your creation!',
    },
    TASTE: {
      emoji: '🍜',
      title: 'Dining Experiences',
      description: 'Explore and review restaurants around the world',
      emptyMessage: 'No dining reviews yet. Be the first to share your experience!',
    },
  };

  const config = modeConfig[mode];

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Connect your wallet to view the feed</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-neutral-900">
          {config.emoji} {config.title}
        </h2>
        <p className="text-sm sm:text-base text-neutral-600">{config.description}</p>
      </div>

      {/* Create Post */}
      <div className="mb-4 sm:mb-6">
        <PostCreator mode={mode} onSuccess={handlePostSuccess} />
      </div>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-72 h-56 md:h-64 bg-neutral-200" />
                <div className="flex-1 p-5 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded w-full" />
                  <div className="h-4 bg-neutral-200 rounded w-5/6" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">{config.emoji}</div>
          <p className="text-neutral-600 text-lg mb-2">{config.emptyMessage}</p>
          <p className="text-neutral-500 text-sm">Share your experience and earn 5 TASTE tokens</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLikeSuccess={loadPosts} />
          ))}
        </div>
      )}
    </div>
  );
}
