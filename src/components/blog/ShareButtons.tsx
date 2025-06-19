"use client";
import { Twitter, Facebook, Linkedin, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const { toast } = useToast();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Copied!", description: "Article URL copied to clipboard." });
    }).catch(err => {
      console.error("Failed to copy: ", err);
      toast({ title: "Error", description: "Failed to copy URL.", variant: "destructive" });
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" asChild title="Share on Twitter">
        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-5 w-5 text-[#1DA1F2]" />
        </a>
      </Button>
      <Button variant="outline" size="icon" asChild title="Share on Facebook">
        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-5 w-5 text-[#1877F2]" />
        </a>
      </Button>
      <Button variant="outline" size="icon" asChild title="Share on LinkedIn">
        <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-5 w-5 text-[#0A66C2]" />
        </a>
      </Button>
      <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy link">
        <Copy className="h-5 w-5" />
      </Button>
    </div>
  );
}
