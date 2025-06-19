
-- Create the articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('AI', 'Web Development', 'Social Media Marketing')),
  author_name TEXT,
  excerpt TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security for the articles table
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policies for articles table
CREATE POLICY "Public read access to published articles" ON articles
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Allow authenticated users to manage articles" ON articles
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Storage:
-- 1. Create a bucket "dbarticles" for storing article cover images.
--    (This is usually done via the Supabase Dashboard: Storage -> Create new bucket)
--    Set the bucket to be public if you want direct public URLs.

-- Policies for storage.objects in "dbarticles" bucket (run after bucket creation)
CREATE POLICY "Public read access for dbarticles" ON storage.objects
  FOR SELECT USING (bucket_id = 'dbarticles');

CREATE POLICY "Allow authenticated uploads to dbarticles" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'dbarticles' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates to own files in dbarticles" ON storage.objects
  FOR UPDATE USING (bucket_id = 'dbarticles' AND auth.uid() = owner) WITH CHECK (bucket_id = 'dbarticles' AND auth.uid() = owner);

CREATE POLICY "Allow authenticated deletes of own files in dbarticles" ON storage.objects
  FOR DELETE USING (bucket_id = 'dbarticles' AND auth.uid() = owner);


-- Indexes for performance
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published_created ON articles(is_published, created_at DESC);
CREATE INDEX idx_articles_category ON articles(category);

-- Note: For admin user authentication, use Supabase's built-in Auth.
-- Go to your Supabase Dashboard -> Authentication -> Users -> Add user.
-- Use the email and password set there to log in to the /admin/login page.
-- No custom admin table for credentials is needed or recommended.

    