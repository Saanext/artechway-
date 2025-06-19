
import { getArticles } from '@/lib/articles'; // Updated import
import type { Article } from '@/lib/types';
import ArticleCard from '@/components/blog/ArticleCard';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const revalidate = 60; 

export default async function HomePage() {
  const articles = await getArticles(10); 

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const otherArticles = articles.length > 1 ? articles.slice(1, 5) : []; 

  return (
    <div className="space-y-16 py-8">
      <section className="text-center py-12 bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-xl shadow-sm">
        <h1 className="text-5xl md:text-6xl font-headline font-extrabold mb-6 text-primary">
          Welcome to Artechway
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto mb-8">
          Your daily dose of insights into Artificial Intelligence, cutting-edge Web Development, and impactful Social Media Marketing.
        </p>
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={featuredArticle ? `/article/${featuredArticle.slug}` : "#latest-articles"}>
            Explore Latest Insights <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>

      {featuredArticle && (
        <section id="featured-article" className="mb-16">
          <h2 className="text-3xl font-headline font-bold mb-8 text-center text-primary">Featured Article</h2>
          <Link href={`/article/${featuredArticle.slug}`} className="block group">
            <div className="bg-card rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:scale-[1.02]">
              {featuredArticle.cover_image_url && (
                 <div className="w-full h-64 md:h-96 relative overflow-hidden">
                    <Image
                      src={featuredArticle.cover_image_url || "https://placehold.co/1200x600.png"}
                      alt={featuredArticle.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                      data-ai-hint="technology abstract"
                      priority
                    />
                 </div>
              )}
              <div className="p-6 md:p-8">
                <h3 className="text-2xl md:text-3xl font-headline font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {featuredArticle.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">{featuredArticle.excerpt || featuredArticle.content.substring(0,150)}...</p>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Read more <ArrowRight className="inline-block ml-1 h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {otherArticles.length > 0 && (
        <section id="latest-articles">
          <h2 className="text-3xl font-headline font-bold mb-8 text-center">Latest Articles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {otherArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
      
      {articles.length === 0 && (
         <div className="text-center py-12">
            <h2 className="text-2xl font-headline font-semibold mb-4">No articles yet!</h2>
            <p className="text-muted-foreground">Stay tuned, content is coming soon to Artechway.</p>
         </div>
      )}
    </div>
  );
}
