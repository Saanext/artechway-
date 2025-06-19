
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getArticles, deleteArticle } from '@/lib/articles'; // Updated import
import type { Article } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { FilePlus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchArticlesData = async () => {
    setLoading(true);
    try {
      const fetchedArticles = await getArticles(undefined, false); 
      setArticles(fetchedArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({ title: "Error", description: "Could not fetch articles.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticlesData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteArticle(id);
      toast({ title: "Success", description: "Article deleted successfully." });
      fetchArticlesData(); 
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({ title: "Error", description: "Could not delete article.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end mb-6">
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-12 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/new">
            <FilePlus className="mr-2 h-5 w-5" /> Add New Article
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Manage Articles</CardTitle>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No articles found. Get started by adding one!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      <Link href={`/article/${article.slug}`} target="_blank" className="hover:text-primary hover:underline" title={`View "${article.title}"`}>
                        {article.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.is_published ? "default" : "secondary"} className={article.is_published ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}>
                        {article.is_published ? <Eye className="mr-1 h-3 w-3"/> : <EyeOff className="mr-1 h-3 w-3" />}
                        {article.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.created_at ? format(new Date(article.created_at), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                    <TableCell>{article.updated_at ? format(new Date(article.updated_at), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild title="Edit Article">
                        <Link href={`/admin/edit/${article.id}`}>
                          <Edit3 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" title="Delete Article">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the article
                              "{article.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(article.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Minimal Card component if not globally available or for local structure
const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);
const CardTitle = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);
const CardContent = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);
