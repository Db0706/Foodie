import { useState } from 'react';
import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Feed from '@/components/Feed';
import Profile from '@/components/Profile';
import Leaderboard from '@/components/Leaderboard';

type Tab = 'cook' | 'taste' | 'leaderboard' | 'profile';

export default function Home() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>('cook');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Foodie - Share Your Food Experiences & Earn Rewards</title>
        <meta name="description" content="Join the Web3 food community. Share your cooking and dining experiences, earn TASTE tokens." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-neutral-50">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center gap-2 sm:gap-3">
                {isConnected && (
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                      aria-label="Menu"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>

                    {isMenuOpen && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Dropdown Menu */}
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20">
                          <button
                            onClick={() => {
                              setActiveTab('profile');
                              setIsMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors flex items-center gap-3 ${
                              activeTab === 'profile' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-neutral-700'
                            }`}
                          >
                            <span>👤</span>
                            <span>Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab('leaderboard');
                              setIsMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors flex items-center gap-3 ${
                              activeTab === 'leaderboard' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-neutral-700'
                            }`}
                          >
                            <span>🏆</span>
                            <span>Leaderboard</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900">
                  Foodie
                </h1>
              </div>
              <div className="scale-90 sm:scale-100 origin-right">
                <ConnectButton />
              </div>
            </div>
          </div>
        </header>

        {!isConnected ? (
          <div className="bg-white">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 mb-4 sm:mb-6">
                  Share Your Food Experiences
                </h2>
                <p className="text-base sm:text-xl text-neutral-600 mb-6 sm:mb-8 leading-relaxed">
                  Join thousands of food lovers sharing their cooking and dining moments.
                  Earn TASTE tokens for every post and interaction.
                </p>
                <div className="flex justify-center gap-4 mb-8 sm:mb-12">
                  <ConnectButton />
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-16">
                  <div className="p-5 sm:p-6 bg-neutral-50 rounded-lg">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🍳</div>
                    <h3 className="font-bold text-base sm:text-lg mb-2">Cook-to-Earn</h3>
                    <p className="text-neutral-600 text-sm">Share your home cooking and earn 5 TASTE tokens per post</p>
                  </div>
                  <div className="p-5 sm:p-6 bg-neutral-50 rounded-lg">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🍜</div>
                    <h3 className="font-bold text-base sm:text-lg mb-2">Taste-to-Earn</h3>
                    <p className="text-neutral-600 text-sm">Review restaurants and earn 5 TASTE tokens per post</p>
                  </div>
                  <div className="p-5 sm:p-6 bg-neutral-50 rounded-lg">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🏆</div>
                    <h3 className="font-bold text-base sm:text-lg mb-2">Earn Rewards</h3>
                    <p className="text-neutral-600 text-sm">Get rewarded when others like your posts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="bg-white border-b border-neutral-200 overflow-x-auto">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <nav className="flex gap-2 sm:gap-3 py-2">
                  <button
                    onClick={() => setActiveTab('cook')}
                    className={`py-2 sm:py-2.5 px-4 sm:px-6 font-semibold text-xs sm:text-sm transition-all rounded-lg whitespace-nowrap ${
                      activeTab === 'cook'
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    🍳 Cook-to-Earn
                  </button>
                  <button
                    onClick={() => setActiveTab('taste')}
                    className={`py-2 sm:py-2.5 px-4 sm:px-6 font-semibold text-xs sm:text-sm transition-all rounded-lg whitespace-nowrap ${
                      activeTab === 'taste'
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    🍜 Taste-to-Earn
                  </button>
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
              {activeTab === 'cook' && <Feed mode="COOK" />}
              {activeTab === 'taste' && <Feed mode="TASTE" />}
              {activeTab === 'leaderboard' && <Leaderboard />}
              {activeTab === 'profile' && <Profile />}
            </div>
          </>
        )}
      </main>
    </>
  );
}
