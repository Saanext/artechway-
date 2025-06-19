
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
} from 'firebase/firestore';
import type { Article } from './types';
import { slugify } from '@/utils/slugify';

const ARTICLES_COLLECTION = 'articles';

export async function addArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & { slug?: string }): Promise<string> {
  const slug = articleData.slug ? slugify(articleData.slug) : slugify(articleData.title);
  
  const q = query(collection(db, ARTICLES_COLLECTION), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    throw new Error(`Slug "${slug}" already exists. Please choose a different title or manually edit the slug.`);
  }

  const newArticleRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
    ...articleData,
    slug,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isPublished: articleData.isPublished === undefined ? true : articleData.isPublished,
  });
  return newArticleRef.id;
}

export async function getArticles(count?: number, publishedOnly: boolean = true): Promise<Article[]> {
  let articlesQuery;

  if (publishedOnly) {
    // Query for published articles. Sorting by createdAt will be done in code.
    // This relies on a single-field index on 'isPublished' or automatic indexing.
    articlesQuery = query(collection(db, ARTICLES_COLLECTION), where('isPublished', '==', true));
  } else {
    // Query for all articles, sorted by createdAt by Firestore.
    // This relies on a single-field index on 'createdAt' or automatic indexing.
    articlesQuery = query(collection(db, ARTICLES_COLLECTION), orderBy('createdAt', 'desc'));
  }
  
  const querySnapshot = await getDocs(articlesQuery);
  let articles = querySnapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data(),
  } as Article));

  if (publishedOnly) {
    // Sort published articles by createdAt descending in application code
    articles.sort((a, b) => {
      const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
  }
  // If !publishedOnly, Firestore already handled sorting by createdAt

  if (count) {
    articles = articles.slice(0, count);
  }
  
  return articles;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const docRef = doc(db, ARTICLES_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Article;
  }
  return null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  // Query by slug first. This requires a single-field index on 'slug'.
  const q = query(collection(db, ARTICLES_COLLECTION), where('slug', '==', slug), firestoreLimit(1));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    const article = { id: docSnap.id, ...docSnap.data() } as Article;
    
    // Check if the article is published in application code.
    if (article.isPublished) {
      return article;
    }
  }
  return null;
}

export async function updateArticle(id: string, articleData: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, id);
  
  const updateData: any = { ...articleData, updatedAt: serverTimestamp() };
  if (articleData.title && !articleData.slug) { 
     updateData.slug = slugify(articleData.title);
  } else if (articleData.slug) {
    updateData.slug = slugify(articleData.slug);
  }

  await updateDoc(docRef, updateData);
}

export async function deleteArticle(id: string): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, id);
  await deleteDoc(docRef);
}
