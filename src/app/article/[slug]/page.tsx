
import { getArticleBySlug, getArticles } from '@/lib/firestore';
import type { Article } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ArticleContent from '@/components/blog/ArticleContent';
import ShareButtons from '@/components/blog/ShareButtons';
import Summarizer from '@/components/blog/Summarizer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, FolderArchive } from 'lucide-react'; // Changed UserCircle to FolderArchive for category
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import ArticleCard from '@/components/blog/ArticleCard';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

// For SEO and metadata
export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: "Article Not Found",
      description: "The article you are looking for does not exist or has been moved."
    }
  }
  return {
    title: `${article.title} | Artechway`,
    description: article.excerpt || article.content.substring(0, 160),
    keywords: article.category ? [article.category, article.title] : [article.title],
    openGraph: {
        title: article.title,
        description: article.excerpt || article.content.substring(0, 160),
        url: `https://artechway.com/article/${article.slug}`, // Replace with actual domain
        type: 'article',
        images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : [],
        article: {
          publishedTime: article.createdAt.toDate().toISOString(),
          modifiedTime: article.updatedAt.toDate().toISOString(),
          authors: article.authorName ? [article.authorName] : [],
          section: article.category, // Added category here
        },
    },
    twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt || article.content.substring(0, 160),
        images: article.coverImageUrl ? [article.coverImageUrl] : [],
    },
  };
}

// For static site generation
export async function generateStaticParams() {
  const articles = await getArticles(50); 
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export const revalidate = 3600; 

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = (await getArticles(4, true)) // Ensure related articles are published
                            .filter(a => a.id !== article.id && a.category === article.category) // prefer same category
                            .slice(0,3); 

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "AA"; 
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const currentUrl = `https://artechway.com/article/${article.slug}`; 

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <article className="bg-card p-6 sm:p-8 md:p-12 rounded-lg shadow-xl space-y-8">
        <header className="space-y-4">
           {article.category && (
            <Badge variant="secondary" className="mb-2 inline-flex items-center">
              <FolderArchive className="h-3.5 w-3.5 mr-1.5" />
              {article.category}
            </Badge>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-primary leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={undefined} alt={article.authorName || "Artechway"} />
                <AvatarFallback>{getInitials(article.authorName)}</AvatarFallback>
              </Avatar>
              <span>{article.authorName || 'Artechway Team'}</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              <span>Published on {format(article.createdAt.toDate(), 'MMMM dd, yyyy')}</span>
            </div>
          </div>
          {article.coverImageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mt-6 shadow-md">
              <Image
                src={article.coverImageUrl || "https://placehold.co/1200x675.png"}
                alt={article.title}
                fill
                style={{ objectFit: 'cover' }}
                priority
                data-ai-hint="article cover"
              />
            </div>
          )}
        </header>

        <Summarizer articleContent={article.content} />

        <ArticleContent content={article.content} />

        <footer className="pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">Enjoyed this article? Share it!</p>
            <ShareButtons url={currentUrl} title={article.title} />
          </div>
        </footer>
      </article>

      {relatedArticles.length > 0 && (
        <section className="mt-16">
            <h2 className="text-2xl font-headline font-bold mb-6 text-center">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map(related => (
                    <ArticleCard key={related.id} article={related} />
                ))}
            </div>
        </section>
      )}
    </div>
  );
}

