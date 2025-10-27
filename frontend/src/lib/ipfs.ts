import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

export interface PostMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

/**
 * Upload an image file to IPFS via Pinata
 * @param file Image file to upload
 * @returns IPFS CID of the uploaded file
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY || '',
          pinata_secret_api_key: PINATA_SECRET_KEY || '',
        },
        maxBodyLength: Infinity,
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw new Error('Failed to upload image to IPFS');
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param metadata Post metadata object
 * @returns IPFS CID of the uploaded metadata
 */
export async function uploadMetadataToIPFS(metadata: PostMetadata): Promise<string> {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY || '',
          pinata_secret_api_key: PINATA_SECRET_KEY || '',
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

/**
 * Get IPFS gateway URL from CID
 * @param cid IPFS CID
 * @returns Full gateway URL
 */
export function getIPFSGatewayURL(cid: string): string {
  // Use Pinata gateway for faster loading
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/**
 * Create and upload complete post metadata
 * @param imageCID CID of the uploaded image
 * @param caption Post caption/description
 * @param mode Post mode (COOK or TASTE)
 * @param creator Creator wallet address
 * @returns Token URI (ipfs://...)
 */
export async function createPostMetadata(
  imageCID: string,
  caption: string,
  mode: 'COOK' | 'TASTE',
  creator: string,
  rating: number = 5
): Promise<string> {
  const metadata: PostMetadata = {
    name: `${mode === 'COOK' ? '🍳' : '🍜'} ${caption.slice(0, 30)}...`,
    description: caption,
    image: `ipfs://${imageCID}`,
    attributes: [
      {
        trait_type: 'mode',
        value: mode,
      },
      {
        trait_type: 'creator',
        value: creator,
      },
      {
        trait_type: 'rating',
        value: rating,
      },
      {
        trait_type: 'timestamp',
        value: Math.floor(Date.now() / 1000),
      },
    ],
  };

  const metadataCID = await uploadMetadataToIPFS(metadata);
  return `ipfs://${metadataCID}`;
}
