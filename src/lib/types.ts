import type { Timestamp } from 'firebase/firestore';

export interface Article {
  id: string; // Firestore document ID
  title: string;
  slug: string; // URL-friendly, unique identifier
  content: string; // HTML or Markdown content
  createdAt: Timestamp;
  updatedAt: Timestamp;
  authorName?: string;
  excerpt?: string; 
  isPublished?: boolean;
  coverImageUrl?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  // Add any other user-specific fields you might need
}
