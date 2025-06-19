
export interface Article {
  id: string; // Supabase uses UUID
  title: string;
  slug: string; // unique
  content: string; // HTML or Markdown content
  category: "AI" | "Web Development" | "Social Media Marketing" | string;
  author_name?: string;
  excerpt?: string;
  is_published?: boolean;
  cover_image_url?: string;
  created_at: string; // ISO string from Supabase
  updated_at: string; // ISO string from Supabase
}

// Used for form data, can keep camelCase for easier handling in forms
export interface ArticleFormData {
  title: string;
  slug?: string;
  content: string;
  category: Article['category'];
  authorName?: string;
  excerpt?: string;
  isPublished?: boolean;
  coverImageUrl?: string; // Can be a URL string or a File object during upload
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  // Add any other user-specific fields you might need
}
