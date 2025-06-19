// For now, this will render HTML directly.
// For Markdown support, you would use a library like 'react-markdown' or 'marked'.
// Ensure content is sanitized if it's user-generated. Here, it's admin-generated.

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  // Basic styling for HTML content that might be generated from a Markdown editor.
  // This can be expanded significantly.
  return (
    <div
      className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none 
                 prose-headings:font-headline prose-headings:text-primary 
                 prose-p:text-foreground/90 prose-li:text-foreground/90
                 prose-a:text-accent hover:prose-a:text-primary prose-a:transition-colors
                 prose-strong:text-foreground prose-blockquote:border-accent prose-blockquote:text-muted-foreground
                 prose-code:bg-muted prose-code:text-accent-foreground prose-code:p-1 prose-code:rounded-sm prose-code:font-code
                 prose-img:rounded-md prose-img:shadow-md"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
