import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getLeaderboard } from '@/lib/firebase';
import { shortenAddress, formatTaste } from '@/lib/utils';
import type { User } from '@/lib/firebase';

type Period = 'all' | 'week';

export default function Leaderboard() {
  const { address, isConnected } = useAccount();
  const [period, setPeriod] = useState<Period>('all');
  const [leaders, setLeaders] = useState<(User & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboard(10, period);
      setLeaders(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Connect your wallet to view the leaderboard</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-4">🏆 Leaderboard</h2>
        <p className="text-gray-600 mb-6">Top earners in the Foodie community</p>

        {/* Period Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              period === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              period === 'week'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      {isLoading ? (
        <div className="card p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-gray-600">No data yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Start posting to appear on the leaderboard!
          </p>
        </div>
      ) : (
        <div className="card">
          {/* Top 3 Podium */}
          {leaders.length >= 3 && (
            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 p-8">
              <div className="flex items-end justify-center space-x-4">
                {/* 2nd Place */}
                {leaders[1] && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                      {leaders[1].wallet[2]}
                    </div>
                    <div className="text-3xl mb-2">🥈</div>
                    <p className="font-semibold text-sm">
                      {shortenAddress(leaders[1].wallet)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatTaste(leaders[1].totalEarned)}
                    </p>
                  </div>
                )}

                {/* 1st Place */}
                {leaders[0] && (
                  <div className="text-center transform scale-110">
                    <div className="w-24 h-24 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-2 shadow-lg">
                      {leaders[0].wallet[2]}
                    </div>
                    <div className="text-4xl mb-2">🥇</div>
                    <p className="font-bold">
                      {shortenAddress(leaders[0].wallet)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatTaste(leaders[0].totalEarned)}
                    </p>
                  </div>
                )}

                {/* 3rd Place */}
                {leaders[2] && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-300 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                      {leaders[2].wallet[2]}
                    </div>
                    <div className="text-3xl mb-2">🥉</div>
                    <p className="font-semibold text-sm">
                      {shortenAddress(leaders[2].wallet)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatTaste(leaders[2].totalEarned)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rest of Leaderboard */}
          <div className="p-6 space-y-3">
            {leaders.slice(3).map((leader, index) => {
              const rank = index + 4;
              const isCurrentUser =
                address?.toLowerCase() === leader.wallet.toLowerCase();

              return (
                <div
                  key={leader.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-12 text-center">
                    <span className="text-lg font-bold text-gray-600">
                      #{rank}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {leader.wallet[2]}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {shortenAddress(leader.wallet)}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-purple-600 font-normal">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {leader.postsCount} posts
                    </p>
                  </div>

                  {/* Earnings */}
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatTaste(leader.totalEarned)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current User Stats (if not in top 10) */}
          {address && !leaders.some((l) => l.wallet.toLowerCase() === address.toLowerCase()) && (
            <div className="border-t p-6">
              <p className="text-sm text-gray-500 text-center">
                Keep posting to climb the leaderboard! 🚀
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
