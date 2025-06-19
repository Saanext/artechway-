
-- Create the 'articles' table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('AI', 'Web Development', 'Social Media Marketing')),
  author_name TEXT,
  excerpt TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add comments to the table and columns
COMMENT ON TABLE public.articles IS 'Stores blog articles for the Artechway platform.';
COMMENT ON COLUMN public.articles.id IS 'Unique identifier for each article (UUID).';
COMMENT ON COLUMN public.articles.title IS 'The title of the article.';
COMMENT ON COLUMN public.articles.slug IS 'URL-friendly unique identifier for the article.';
COMMENT ON COLUMN public.articles.content IS 'The main content of the article, can be HTML or Markdown.';
COMMENT ON COLUMN public.articles.category IS 'The category of the article (AI, Web Development, Social Media Marketing).';
COMMENT ON COLUMN public.articles.author_name IS 'The name of the article''s author.';
COMMENT ON COLUMN public.articles.excerpt IS 'A short summary or teaser for the article.';
COMMENT ON COLUMN public.articles.is_published IS 'Indicates if the article is visible to the public (TRUE) or a draft (FALSE).';
COMMENT ON COLUMN public.articles.cover_image_url IS 'URL of the article''s cover image.';
COMMENT ON COLUMN public.articles.created_at IS 'Timestamp of when the article was created.';
COMMENT ON COLUMN public.articles.updated_at IS 'Timestamp of when the article was last updated.';

-- Create a function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before update
CREATE TRIGGER on_articles_update_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS) for the 'articles' table
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'articles' table

-- 1. Allow public read access to published articles
CREATE POLICY "Allow public read access to published articles"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (is_published = TRUE);

-- 2. Allow authenticated users (admins) to insert new articles
CREATE POLICY "Allow authenticated users to insert articles"
ON public.articles
FOR INSERT
TO authenticated
WITH CHECK (TRUE); -- Or add specific checks, e.g., user role

-- 3. Allow authenticated users (admins) to update their own or all articles
-- For simplicity, this allows updates on any article by an authenticated user.
-- You might want to restrict this further based on user ID or roles.
CREATE POLICY "Allow authenticated users to update articles"
ON public.articles
FOR UPDATE
TO authenticated
USING (TRUE) -- Or check user ID if articles had an owner: auth.uid() = user_id
WITH CHECK (TRUE);

-- 4. Allow authenticated users (admins) to delete articles
-- For simplicity, this allows deletion of any article by an authenticated user.
CREATE POLICY "Allow authenticated users to delete articles"
ON public.articles
FOR DELETE
TO authenticated
USING (TRUE); -- Or check user ID: auth.uid() = user_id


-- Supabase Storage: 'article_covers' bucket
-- Bucket creation is usually done via the Supabase Dashboard or Management API.
-- The following are SQL commands to set up policies for an existing bucket.
-- Ensure you have created a bucket named 'article_covers'.

-- Example: Create storage bucket (if it doesn't exist - often done via UI)
-- Note: `storage.create_bucket` is a Supabase specific function if available in SQL context, otherwise use dashboard.
-- This is illustrative. Direct SQL for bucket creation might not be standard.
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('article_covers', 'article_covers', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for 'article_covers' bucket

-- 1. Allow public read access to files in 'article_covers'
CREATE POLICY "Allow public read access to article_covers"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'article_covers');

-- 2. Allow authenticated users to upload to 'article_covers' (insert)
CREATE POLICY "Allow authenticated users to upload to article_covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'article_covers' AND
  auth.role() = 'authenticated' -- Ensures the user is logged in
  -- You can add more checks here, e.g., file size, mime types if supported by RLS on storage.objects
  -- For file size/type, it's often better handled in client-side validation and bucket settings.
);

-- 3. Allow authenticated users to update files they own in 'article_covers'
-- (Supabase Storage objects have an 'owner' field which is the user's UID)
CREATE POLICY "Allow authenticated users to update their own files in article_covers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'article_covers' AND
  auth.uid() = owner
);

-- 4. Allow authenticated users to delete files they own in 'article_covers'
CREATE POLICY "Allow authenticated users to delete their own files in article_covers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'article_covers' AND
  auth.uid() = owner
);

-- Create an index on the slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);

-- Create an index on is_published and created_at for common frontend queries
CREATE INDEX IF NOT EXISTS idx_articles_published_created ON public.articles(is_published, created_at DESC);

-- Create an index on category for filtering
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);

