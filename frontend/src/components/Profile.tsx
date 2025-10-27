import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { useTasteBalance, useUserNFTs } from '@/lib/hooks/useContracts';
import { getPostsByCreator, getUserProfile, updateUserProfile } from '@/lib/firebase';
import { shortenAddress, formatTaste, copyToClipboard, validateImageFile, compressImage } from '@/lib/utils';
import { uploadImageToIPFS } from '@/lib/ipfs';
import type { Post } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { balance, refetch: refetchBalance } = useTasteBalance();
  const { nftCount } = useUserNFTs();

  const [userPosts, setUserPosts] = useState<(Post & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (address) {
      loadUserProfile();
      loadUserPosts();
    }
  }, [address]);

  const loadUserProfile = async () => {
    if (!address) return;
    try {
      const profile = await getUserProfile(address);
      setDisplayName(profile?.displayName || '');
      setProfilePicture(profile?.profilePicture || '');
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUserPosts = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const posts = await getPostsByCreator(address);
      setUserPosts(posts);
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      await copyToClipboard(address);
      toast.success('Address copied!');
    }
  };

  const handleProfilePictureSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setIsUploadingPfp(true);
    const uploadToast = toast.loading('Uploading profile picture...');

    try {
      const compressedImage = await compressImage(file, 512, 0.9); // Smaller size for PFP
      const imageCID = await uploadImageToIPFS(compressedImage);
      const imageURL = `https://gateway.pinata.cloud/ipfs/${imageCID}`;

      setProfilePicture(imageURL);

      if (address) {
        await updateUserProfile(address, { profilePicture: imageURL });
      }

      toast.success('Profile picture updated!', { id: uploadToast });
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload image', { id: uploadToast });
    } finally {
      setIsUploadingPfp(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!address) return;

    const saveToast = toast.loading('Saving profile...');
    try {
      await updateUserProfile(address, { displayName: tempDisplayName });
      setDisplayName(tempDisplayName);
      setIsEditingProfile(false);
      toast.success('Profile updated!', { id: saveToast });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile', { id: saveToast });
    }
  };

  const startEditing = () => {
    setTempDisplayName(displayName);
    setIsEditingProfile(true);
  };

  if (!isConnected || !address) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Connect your wallet to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative group">
              {profilePicture ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                  <Image
                    src={profilePicture}
                    alt="Profile"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {address[2].toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPfp}
                className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center text-sm transition-colors shadow-lg"
                title="Change profile picture"
              >
                📷
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureSelect}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {isEditingProfile ? (
                <div className="mb-3">
                  <input
                    type="text"
                    value={tempDisplayName}
                    onChange={(e) => setTempDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={30}
                    className="input-field text-lg sm:text-xl font-bold mb-2"
                  />
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-1.5 bg-neutral-200 text-neutral-700 text-sm rounded-lg hover:bg-neutral-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {displayName || shortenAddress(address, 6)}
                  </h2>
                  <button
                    onClick={startEditing}
                    className="text-neutral-400 hover:text-neutral-600 text-sm"
                    title="Edit profile"
                  >
                    ✏️
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3 sm:mb-4">
                <p className="text-neutral-600 text-xs sm:text-sm font-mono">
                  {shortenAddress(address, 4)}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="text-neutral-400 hover:text-neutral-600 text-sm"
                  title="Copy address"
                >
                  📋
                </button>
              </div>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-6 sm:gap-8">
                <div>
                  <p className="text-xs sm:text-sm text-neutral-500">Posts</p>
                  <p className="text-xl sm:text-2xl font-bold text-neutral-900">{userPosts.length}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-neutral-500">NFTs</p>
                  <p className="text-xl sm:text-2xl font-bold text-neutral-900">{nftCount}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-neutral-500">Likes</p>
                  <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                    {userPosts.reduce((sum, post) => sum + (post.likeCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-4 sm:p-6 w-full lg:w-auto lg:min-w-[200px]">
            <p className="text-xs sm:text-sm opacity-90 mb-1">Total Earned</p>
            <p className="text-2xl sm:text-3xl font-bold">{parseFloat(balance).toFixed(2)}</p>
            <p className="text-xs sm:text-sm opacity-90">TASTE</p>
            <button
              onClick={() => refetchBalance()}
              className="mt-3 text-xs bg-white bg-opacity-20 px-3 py-1.5 rounded hover:bg-opacity-30 transition-colors w-full lg:w-auto"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="mb-4">
        <h3 className="text-xl sm:text-2xl font-bold mb-4">My Posts</h3>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-neutral-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-4 bg-neutral-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : userPosts.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center">
          <div className="text-5xl sm:text-6xl mb-4">🍽️</div>
          <p className="text-neutral-600 mb-4 text-sm sm:text-base">You haven&apos;t posted anything yet</p>
          <p className="text-xs sm:text-sm text-neutral-500">
            Share your food moments to start earning TASTE tokens!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {userPosts.map((post) => (
            <div key={post.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative h-48">
                <Image
                  src={post.imageURL}
                  alt={post.caption}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`badge text-xs ${
                      post.mode === 'COOK' ? 'badge-cook' : 'badge-taste'
                    }`}
                  >
                    {post.mode === 'COOK' ? '🍳' : '🍜'}
                  </span>
                </div>
                {/* Star rating */}
                {post.rating && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-white bg-opacity-90 px-2 py-1 rounded">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < post.rating ? 'text-primary-500' : 'text-neutral-300'
                        }`}
                      >
                        ●
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-neutral-800 line-clamp-2 mb-2">
                  {post.caption}
                </p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>❤️ {post.likeCount}</span>
                  <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
