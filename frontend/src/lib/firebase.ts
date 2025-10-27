import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);

// Collections
export const COLLECTIONS = {
  POSTS: 'posts',
  USERS: 'users',
  LIKES: 'likes',
};

// Types
export interface Post {
  postId: string;
  tokenId: number;
  imageURL: string;
  caption: string;
  mode: 'COOK' | 'TASTE';
  creatorWallet: string;
  timestamp: number;
  likeCount: number;
  metadataURI: string;
  rating: number; // 1-5 star rating
}

export interface User {
  wallet: string;
  totalEarned: number;
  postsCount: number;
  lastActive: number;
  displayName?: string;
  profilePicture?: string;
}

export interface Like {
  postId: string;
  tokenId: number;
  likerWallet: string;
  creatorWallet: string;
  timestamp: number;
}

/**
 * Add a new post to Firestore
 */
export async function addPost(post: Post) {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.POSTS), {
      ...post,
      timestamp: Timestamp.fromMillis(post.timestamp),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding post:', error);
    throw error;
  }
}

/**
 * Get posts by mode with pagination
 */
export async function getPostsByMode(mode: 'COOK' | 'TASTE', limitCount = 20) {
  try {
    // Fetch all posts sorted by timestamp, then filter by mode in JavaScript
    // This avoids needing a composite index
    const q = query(
      collection(db, COLLECTIONS.POSTS),
      orderBy('timestamp', 'desc'),
      limit(limitCount * 2) // Fetch extra to ensure we have enough after filtering
    );

    const querySnapshot = await getDocs(q);
    const allPosts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Post & { id: string })[];

    // Filter by mode and limit
    return allPosts
      .filter(post => post.mode === mode)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Get all posts (for mixed feed)
 */
export async function getAllPosts(limitCount = 50) {
  try {
    const q = query(
      collection(db, COLLECTIONS.POSTS),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Post & { id: string })[];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Get posts by creator wallet
 */
export async function getPostsByCreator(wallet: string) {
  try {
    // Fetch all posts sorted by timestamp, then filter by creator in JavaScript
    // This avoids needing a composite index
    const q = query(
      collection(db, COLLECTIONS.POSTS),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const allPosts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Post & { id: string })[];

    // Filter by creator wallet
    return allPosts.filter(post => post.creatorWallet === wallet.toLowerCase());
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
}

/**
 * Update like count for a post
 */
export async function incrementLikeCount(postId: string) {
  try {
    const postRef = doc(db, COLLECTIONS.POSTS, postId);
    // Note: In production, use Firestore increment
    // For now, this is a placeholder
    await updateDoc(postRef, {
      likeCount: (await getDocs(query(collection(db, COLLECTIONS.LIKES), where('postId', '==', postId)))).size,
    });
  } catch (error) {
    console.error('Error updating like count:', error);
  }
}

/**
 * Add a like record
 */
export async function addLike(like: Like) {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.LIKES), {
      ...like,
      timestamp: Timestamp.fromMillis(like.timestamp),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding like:', error);
    throw error;
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(wallet: string): Promise<User | null> {
  try {
    const userQuery = query(
      collection(db, COLLECTIONS.USERS),
      where('wallet', '==', wallet.toLowerCase()),
      limit(1)
    );

    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return null;
    }

    const userDoc = userSnapshot.docs[0];
    const data = userDoc.data();
    return {
      ...data,
      wallet: data.wallet || wallet.toLowerCase(),
      totalEarned: data.totalEarned || 0,
      postsCount: data.postsCount || 0,
      lastActive: data.lastActive || Date.now(),
    } as User;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user profile (name, picture, etc.)
 */
export async function updateUserProfile(wallet: string, updates: Partial<User>) {
  try {
    const userQuery = query(
      collection(db, COLLECTIONS.USERS),
      where('wallet', '==', wallet.toLowerCase()),
      limit(1)
    );

    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      // Create new user profile
      await addDoc(collection(db, COLLECTIONS.USERS), {
        wallet: wallet.toLowerCase(),
        totalEarned: 0,
        postsCount: 0,
        lastActive: Date.now(),
        ...updates,
      });
    } else {
      // Update existing user profile
      const userDoc = userSnapshot.docs[0];
      await updateDoc(doc(db, COLLECTIONS.USERS, userDoc.id), {
        ...updates,
        lastActive: Date.now(),
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Update or create user record
 */
export async function updateUser(wallet: string, updates: Partial<User>) {
  try {
    const userQuery = query(
      collection(db, COLLECTIONS.USERS),
      where('wallet', '==', wallet.toLowerCase()),
      limit(1)
    );

    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      // Create new user
      await addDoc(collection(db, COLLECTIONS.USERS), {
        wallet: wallet.toLowerCase(),
        totalEarned: 0,
        postsCount: 0,
        lastActive: Date.now(),
        ...updates,
      });
    } else {
      // Update existing user
      const userDoc = userSnapshot.docs[0];
      await updateDoc(doc(db, COLLECTIONS.USERS, userDoc.id), {
        ...updates,
        lastActive: Date.now(),
      });
    }
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

/**
 * Get leaderboard (top earners)
 */
export async function getLeaderboard(limitCount = 10, period: 'all' | 'week' = 'all') {
  try {
    // Fetch all users and sort in JavaScript to avoid composite index
    const q = query(
      collection(db, COLLECTIONS.USERS),
      orderBy('totalEarned', 'desc')
    );

    const querySnapshot = await getDocs(q);
    let users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (User & { id: string })[];

    // Filter by week if needed
    if (period === 'week') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      users = users.filter(user => user.lastActive >= weekAgo);
    }

    // Return limited results
    return users.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
