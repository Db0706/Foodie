/**
 * Shorten wallet address for display
 * @param address Full wallet address
 * @param chars Number of chars to show at start and end
 * @returns Shortened address (e.g., 0xabc...1234)
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format number with commas
 * @param num Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Format TASTE token amount
 * @param amount Amount in TASTE
 * @returns Formatted string with symbol
 */
export function formatTaste(amount: number | string): string {
  return `${formatNumber(amount)} TASTE`;
}

/**
 * Get relative time string
 * @param timestamp Unix timestamp in milliseconds
 * @returns Relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Convert IPFS URI to HTTP gateway URL
 * @param uri IPFS URI (ipfs://...)
 * @returns HTTP gateway URL
 */
export function ipfsToHTTP(uri: string): string {
  if (!uri) return '';
  if (uri.startsWith('http')) return uri;

  const hash = uri.replace('ipfs://', '');
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

/**
 * Validate image file
 * @param file File to validate
 * @returns Error message or null if valid
 */
export function validateImageFile(file: File): string | null {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
  }

  // Check file size (max 50MB - plenty for any phone camera)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    return 'Image size must be less than 50MB';
  }

  return null;
}

/**
 * Compress image for upload
 * @param file Original image file
 * @param maxWidth Maximum width (default 1920px)
 * @param quality JPEG quality 0-1 (default 0.85)
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if image is too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Promise that resolves when copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}
