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
  
  // Basic check for slug uniqueness (can be improved with transactions or server-side checks for production)
  const q = query(collection(db, ARTICLES_COLLECTION), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    // Simple collision handling: append a timestamp. In a real app, might regenerate or error.
    // For now, let's throw an error or ask user to change slug/title.
    throw new Error(`Slug "${slug}" already exists. Please choose a different title or manually edit the slug.`);
  }

  const newArticleRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
    ...articleData,
    slug,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isPublished: articleData.isPublished === undefined ? true : articleData.isPublished, // Default to published
  });
  return newArticleRef.id;
}

export async function getArticles(count?: number, publishedOnly: boolean = true): Promise<Article[]> {
  let q = query(collection(db, ARTICLES_COLLECTION), orderBy('createdAt', 'desc'));
  
  if (publishedOnly) {
    q = query(q, where('isPublished', '==', true));
  }

  if (count) {
    q = query(q, firestoreLimit(count));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data(),
  } as Article));
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
  const q = query(collection(db, ARTICLES_COLLECTION), where('slug', '==', slug), where('isPublished', '==', true), firestoreLimit(1));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Article;
  }
  return null;
}

export async function updateArticle(id: string, articleData: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, id);
  
  const updateData: any = { ...articleData, updatedAt: serverTimestamp() };
  if (articleData.title && !articleData.slug) { // If title changes and slug is not manually set, regenerate slug
     updateData.slug = slugify(articleData.title);
     // Add slug uniqueness check here as well for updates if title/slug changes
  } else if (articleData.slug) {
    updateData.slug = slugify(articleData.slug);
  }

  await updateDoc(docRef, updateData);
}

export async function deleteArticle(id: string): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, id);
  await deleteDoc(docRef);
}
