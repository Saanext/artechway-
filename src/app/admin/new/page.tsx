"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArticleForm, type ArticleFormData } from '@/components/forms/ArticleForm';
import { addArticle } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewArticlePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: ArticleFormData) => {
    setIsLoading(true);
    try {
      await addArticle(data);
      toast({ title: "Success", description: "Article created successfully." });
      router.push('/admin');
    } catch (error: any) {
      console.error("Error creating article:", error);
      toast({
        title: "Error Creating Article",
        description: error.message || "Could not create article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        {/* Title is already in AdminLayout */}
        {/* <CardTitle className="text-2xl font-headline">Create New Article</CardTitle> */}
        <CardDescription>Fill in the details below to publish a new article to Artechway.</CardDescription>
      </CardHeader>
      <CardContent>
        <ArticleForm onSubmit={handleSubmit} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
