
import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, UserCircle, ArrowRight, FolderArchive } from 'lucide-react';
import { format } from 'date-fns';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const displayExcerpt = article.excerpt || article.content.substring(0, 100) + (article.content.length > 100 ? '...' : '');

  return (
    <Link href={`/article/${article.slug}`} className="block group">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary/50">
        <div className="relative"> 
          {article.coverImageUrl && (
            <div className="relative w-full h-48 overflow-hidden">
              <Image
                src={article.coverImageUrl || "https://placehold.co/600x400.png"}
                alt={article.title}
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                data-ai-hint="technology blog"
              />
            </div>
          )}
          {article.category && (
             <Badge variant="secondary" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs py-1 px-2 shadow">
                <FolderArchive className="h-3 w-3 mr-1"/>
                {article.category}
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-headline leading-tight group-hover:text-primary transition-colors">
            {article.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pb-3">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {displayExcerpt}
          </p>
          <div className="flex items-center text-xs text-muted-foreground space-x-3">
            {article.authorName && (
              <span className="flex items-center">
                <UserCircle className="h-3.5 w-3.5 mr-1" /> {article.authorName}
              </span>
            )}
            {article.createdAt && (
              <span className="flex items-center">
                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                {format(article.createdAt.toDate(), 'MMM dd, yyyy')}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter>
           <span className="text-sm font-medium text-primary group-hover:underline">
            Read Article <ArrowRight className="inline-block ml-1 h-4 w-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

