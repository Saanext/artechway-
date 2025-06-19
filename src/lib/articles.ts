
import { supabase } from './supabase';
import type { Article, ArticleFormData } from './types';
import { slugify } from '@/utils/slugify';

const ARTICLES_TABLE = 'articles';

// Helper to map form data (camelCase) to DB data (snake_case)
// and ensure created_at/updated_at are handled
function mapFormDataToDb(formData: ArticleFormData | Partial<ArticleFormData>, isUpdate: boolean = false): any {
  const dbData: any = {};
  if (formData.title) dbData.title = formData.title;
  if (formData.slug) dbData.slug = slugify(formData.slug);
  else if (formData.title && !isUpdate) dbData.slug = slugify(formData.title); // Auto-generate slug on create if not provided
  
  if (formData.content) dbData.content = formData.content;
  if (formData.category) dbData.category = formData.category;
  if (formData.authorName) dbData.author_name = formData.authorName;
  if (formData.excerpt) dbData.excerpt = formData.excerpt;
  if (formData.isPublished !== undefined) dbData.is_published = formData.isPublished;
  if (formData.coverImageUrl) dbData.cover_image_url = formData.coverImageUrl;

  if (!isUpdate) {
    dbData.created_at = new Date().toISOString();
  }
  dbData.updated_at = new Date().toISOString();
  
  return dbData;
}


export async function addArticle(articleData: ArticleFormData): Promise<string> {
  const slugToSave = articleData.slug ? slugify(articleData.slug) : slugify(articleData.title);

  const { data: existingSlug, error: slugCheckError } = await supabase
    .from(ARTICLES_TABLE)
    .select('slug')
    .eq('slug', slugToSave)
    .maybeSingle();

  if (slugCheckError && slugCheckError.code !== 'PGRST116') { // PGRST116: " esattamente una riga attesa da single" (single row not found is OK)
    console.error('Slug check error:', slugCheckError);
    throw new Error(`Error checking slug: ${slugCheckError.message}`);
  }
  if (existingSlug) {
    throw new Error(`Slug "${slugToSave}" already exists. Please choose a different title or manually edit the slug.`);
  }
  
  const dbArticleData = mapFormDataToDb(articleData, false);
  dbArticleData.slug = slugToSave; // Ensure slug is set correctly

  const { data, error } = await supabase
    .from(ARTICLES_TABLE)
    .insert([dbArticleData])
    .select('id')
    .single();

  if (error) {
    console.error('Error adding article:', error);
    throw new Error(`Could not add article: ${error.message}`);
  }
  if (!data || !data.id) {
    throw new Error('Failed to add article, no ID returned.');
  }
  return data.id;
}

export async function getArticles(count?: number, publishedOnly: boolean = true): Promise<Article[]> {
  let query = supabase
    .from(ARTICLES_TABLE)
    .select('*');

  if (publishedOnly) {
    query = query.eq('is_published', true);
  }
  
  query = query.order('created_at', { ascending: false });

  if (count) {
    query = query.limit(count);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching articles:', error);
    throw new Error(`Could not fetch articles: ${error.message}`);
  }
  return data || [];
}

export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from(ARTICLES_TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching article by ID:', error);
    throw new Error(`Could not fetch article: ${error.message}`);
  }
  return data;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from(ARTICLES_TABLE)
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true) // Only fetch published articles by slug for public view
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found is fine for slugs
    console.error('Error fetching article by slug:', error);
    // Don't throw for public pages if slug not found, let Next.js handle with notFound()
  }
  return data || null;
}


export async function updateArticle(id: string, articleData: Partial<ArticleFormData>): Promise<void> {
  const dbUpdateData = mapFormDataToDb(articleData, true);
  if (articleData.title && !articleData.slug) { 
     dbUpdateData.slug = slugify(articleData.title);
  } else if (articleData.slug) {
    dbUpdateData.slug = slugify(articleData.slug);
  }


  const { error } = await supabase
    .from(ARTICLES_TABLE)
    .update(dbUpdateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating article:', error);
    throw new Error(`Could not update article: ${error.message}`);
  }
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase
    .from(ARTICLES_TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting article:', error);
    throw new Error(`Could not delete article: ${error.message}`);
  }
}
