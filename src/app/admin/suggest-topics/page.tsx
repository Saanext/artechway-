"use client";
import { useState } from 'react';
import { suggestArticleTopics, SuggestArticleTopicsInput } from '@/ai/flows/suggest-article-topics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Copy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SuggestTopicsPage() {
  const [theme, setTheme] = useState('AI, web development, and social media marketing');
  const [count, setCount] = useState(5);
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestTopics = async () => {
    setIsLoading(true);
    setTopics([]);
    try {
      const input: SuggestArticleTopicsInput = { theme, count };
      const result = await suggestArticleTopics(input);
      setTopics(result.topics);
      toast({ title: "Topics Suggested", description: `${result.topics.length} new ideas for your next article!` });
    } catch (error) {
      console.error("Error suggesting topics:", error);
      toast({
        title: "Suggestion Error",
        description: "Could not generate topic suggestions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied!", description: `"${text}" copied to clipboard.` });
    }).catch(err => {
      console.error("Failed to copy: ", err);
      toast({ title: "Error", description: "Failed to copy topic.", variant: "destructive" });
    });
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          {/* <CardTitle className="text-2xl font-headline">AI Topic Suggester</CardTitle> */}
          <CardDescription>
            Let AI help you brainstorm engaging article topics based on current trends.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="theme">Theme/Keywords</Label>
            <Input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., Future of AI, Next.js trends, Content marketing strategies"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma-separated keywords or a general theme.
            </p>
          </div>
          <div>
            <Label htmlFor="count">Number of Topics</Label>
            <Input
              id="count"
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10)))}
              min="1"
              max="20"
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleSuggestTopics} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Suggest Topics
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isLoading && topics.length === 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Suggested Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(count || 5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      )}

      {!isLoading && topics.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Suggested Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topics.map((topic, index) => (
                <li key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors">
                  <span className="text-foreground">{index + 1}. {topic}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(topic)} title="Copy topic">
                    <Copy className="h-4 w-4 text-primary" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
