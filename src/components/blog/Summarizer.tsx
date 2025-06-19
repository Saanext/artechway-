"use client";
import { useState } from 'react';
import { summarizeArticle } from '@/ai/flows/summarize-article';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wand2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummarizerProps {
  articleContent: string; // The full content of the article
}

export default function Summarizer({ articleContent }: SummarizerProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsLoading(true);
    setSummary(null);
    try {
      const result = await summarizeArticle({ article: articleContent });
      setSummary(result.summary);
      toast({ title: "Summary Generated", description: "AI has summarized the article for you." });
    } catch (error) {
      console.error("Error summarizing article:", error);
      toast({
        title: "Summarization Error",
        description: "Could not generate summary. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full my-6">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-lg font-semibold text-primary hover:text-accent transition-colors">
          <div className="flex items-center">
            <Wand2 className="mr-2 h-5 w-5" />
            <span>AI Article Summary</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 pt-4 space-y-4">
              {!summary && !isLoading && (
                <p className="text-sm text-muted-foreground">
                  Want a quick overview? Click the button below to generate an AI-powered summary of this article.
                </p>
              )}
              <Button onClick={handleSummarize} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {summary ? 'Regenerate Summary' : 'Generate Summary'}
                  </>
                )}
              </Button>
              {summary && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-md">Summary:</h4>
                  <Textarea value={summary} readOnly rows={5} className="bg-muted/50 border-border" />
                </div>
              )}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
