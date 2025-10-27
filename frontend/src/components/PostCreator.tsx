import { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useCreatePost, useRewardAmounts } from '@/lib/hooks/useContracts';
import { uploadImageToIPFS, createPostMetadata } from '@/lib/ipfs';
import { validateImageFile, compressImage } from '@/lib/utils';
import { addPost } from '@/lib/firebase';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface PostCreatorProps {
  mode: 'COOK' | 'TASTE';
  onSuccess?: () => void;
}

export default function PostCreator({ mode, onSuccess }: PostCreatorProps) {
  const { address } = useAccount();
  const { createPost, isPending } = useCreatePost();
  const { postReward: contractPostReward } = useRewardAmounts();

  // Use contract value or fallback to 5 TASTE
  const postReward = contractPostReward && contractPostReward !== '0' ? contractPostReward : '5';

  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [rating, setRating] = useState(5); // Default to 5 stars
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image || !caption.trim() || !address) {
      toast.error('Please fill all fields');
      return;
    }

    setIsUploading(true);
    const uploadToast = toast.loading('Optimizing image...');

    try {
      // Step 1: Compress image for faster upload
      const compressedImage = await compressImage(image);
      const sizeSaved = ((image.size - compressedImage.size) / image.size * 100).toFixed(0);
      console.log(`Image compressed: ${(image.size / 1024 / 1024).toFixed(2)}MB → ${(compressedImage.size / 1024 / 1024).toFixed(2)}MB (${sizeSaved}% smaller)`);

      // Step 2: Upload image to IPFS
      toast.loading('Uploading to IPFS...', { id: uploadToast });
      const imageCID = await uploadImageToIPFS(compressedImage);
      toast.loading('Creating metadata...', { id: uploadToast });

      // Step 3: Create and upload metadata
      const tokenURI = await createPostMetadata(imageCID, caption, mode, address, rating);
      toast.loading('Minting NFT...', { id: uploadToast });

      // Step 4: Call smart contract to mint NFT
      console.log('🔵 Calling smart contract with:', { tokenURI, mode, address });
      try {
        await createPost(tokenURI, mode);
        console.log('🟢 Smart contract call successful!');
      } catch (contractError: any) {
        console.error('🔴 Smart contract error:', contractError);
        console.error('Error details:', {
          message: contractError.message,
          code: contractError.code,
          data: contractError.data,
        });
        throw new Error(`Contract call failed: ${contractError.message || 'Unknown error'}`);
      }
      toast.loading('Waiting for confirmation...', { id: uploadToast });

      // Step 5: Save to Firebase for fast querying
      const imageURL = `https://gateway.pinata.cloud/ipfs/${imageCID}`;
      await addPost({
        postId: `${address}-${Date.now()}`,
        tokenId: 0, // Will be updated by event listener in production
        imageURL,
        caption,
        mode,
        creatorWallet: address.toLowerCase(),
        timestamp: Date.now(),
        likeCount: 0,
        metadataURI: tokenURI,
        rating,
      });

      toast.success(`Post created! Earned ${postReward} TASTE`, { id: uploadToast });

      // Reset form
      setImage(null);
      setImagePreview('');
      setCaption('');
      setRating(5);
      setIsOpen(false);

      // Callback
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to create post', { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  };

  const modeConfig = {
    COOK: {
      emoji: '🍳',
      color: 'purple',
      title: 'Share Your Dish',
      placeholder: 'Describe what you cooked and how you made it...',
    },
    TASTE: {
      emoji: '🍜',
      color: 'orange',
      title: 'Share Your Meal',
      placeholder: 'Describe what you ate and where...',
    },
  };

  const config = modeConfig[mode];

  return (
    <>
      {/* Create Post Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full btn-primary"
      >
        {config.emoji} Write a Review & Earn {postReward} TASTE
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">{config.emoji} {config.title}</h2>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isUploading || isPending}
                className="text-neutral-400 hover:text-neutral-600 text-3xl leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Food Photo</label>
                {imagePreview ? (
                  <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-red-600 shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all active:bg-primary-100"
                  >
                    <div className="text-3xl sm:text-4xl mb-2">📸</div>
                    <p className="text-neutral-700 font-medium text-sm sm:text-base">Tap to upload image</p>
                    <p className="text-xs text-neutral-500 mt-1">Any phone photo works • Auto-optimized for fast upload</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Star Rating */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-3xl transition-all hover:scale-110 active:scale-95"
                      disabled={isUploading || isPending}
                    >
                      <span className={star <= rating ? 'text-primary-500' : 'text-neutral-300'}>
                        ●
                      </span>
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-neutral-600">
                    {rating} {rating === 1 ? 'star' : 'stars'}
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Review / Description</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={config.placeholder}
                  maxLength={500}
                  rows={6}
                  className="input-field resize-none text-sm sm:text-base"
                  disabled={isUploading || isPending}
                />
                <p className="text-xs text-neutral-400 mt-1 text-right">
                  {caption.length}/500
                </p>
              </div>

              {/* Reward Info */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-xs sm:text-sm text-center text-primary-800">
                  <span className="font-semibold">Earn {postReward} TASTE tokens</span> when you post!
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!image || !caption.trim() || isUploading || isPending}
                className="w-full btn-primary text-sm sm:text-base py-3"
              >
                {isUploading || isPending ? 'Creating...' : `${config.emoji} Mint & Earn`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
