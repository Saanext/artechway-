

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
    ...articleData, // category will be included here if present in articleData
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
    articlesQuery = query(collection(db, ARTICLES_COLLECTION), where('isPublished', '==', true));
  } else {
    articlesQuery = query(collection(db, ARTICLES_COLLECTION), orderBy('createdAt', 'desc'));
  }
  
  const querySnapshot = await getDocs(articlesQuery);
  let articles = querySnapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data(),
  } as Article));

  if (publishedOnly) {
    articles.sort((a, b) => {
      const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : Date.parse(a.createdAt as unknown as string);
      const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : Date.parse(b.createdAt as unknown as string);
      return timeB - timeA;
    });
  }

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
  const q = query(collection(db, ARTICLES_COLLECTION), where('slug', '==', slug), firestoreLimit(1));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    const article = { id: docSnap.id, ...docSnap.data() } as Article;
    
    if (article.isPublished) {
      return article;
    }
  }
  return null;
}

export async function updateArticle(id: string, articleData: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, id);
  
  const updateData: any = { ...articleData, updatedAt: serverTimestamp() }; // category will be included here if present in articleData
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

