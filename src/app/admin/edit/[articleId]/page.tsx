"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArticleForm, type ArticleFormData } from '@/components/forms/ArticleForm';
import { getArticleById, updateArticle } from '@/lib/firestore';
import type { Article } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditArticlePage() {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const articleId = params.articleId as string;

  useEffect(() => {
    if (articleId) {
      setIsFetching(true);
      getArticleById(articleId)
        .then((data) => {
          if (data) {
            setArticle(data);
          } else {
            toast({ title: "Error", description: "Article not found.", variant: "destructive" });
            router.push('/admin');
          }
        })
        .catch(error => {
          console.error("Error fetching article:", error);
          toast({ title: "Error", description: "Could not fetch article data.", variant: "destructive" });
        })
        .finally(() => setIsFetching(false));
    }
  }, [articleId, router, toast]);

  const handleSubmit = async (data: ArticleFormData) => {
    setIsLoading(true);
    try {
      await updateArticle(articleId, data);
      toast({ title: "Success", description: "Article updated successfully." });
      router.push('/admin');
    } catch (error: any) {
      console.error("Error updating article:", error);
      toast({
        title: "Error Updating Article",
        description: error.message || "Could not update article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (!article) {
    return <p>Article not found or error loading data.</p>; 
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        {/* Title is already in AdminLayout */}
        {/* <CardTitle className="text-2xl font-headline">Edit Article</CardTitle> */}
        <CardDescription>Update the details for your article "{article.title}".</CardDescription>
      </CardHeader>
      <CardContent>
        <ArticleForm onSubmit={handleSubmit} initialData={article} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
