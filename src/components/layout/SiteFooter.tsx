import Link from 'next/link';
import { Rocket } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="bg-muted py-8 text-muted-foreground">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center mb-4">
          <Rocket className="h-6 w-6 mr-2 text-primary" />
          <span className="text-lg font-headline font-semibold">Artechway</span>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Artechway. All rights reserved.
        </p>
        <p className="text-xs mt-2">
          Exploring the frontiers of AI, Web Development, and Social Media Marketing.
        </p>
        <div className="mt-4 space-x-4">
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
