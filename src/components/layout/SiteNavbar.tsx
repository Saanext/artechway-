"use client";
import Link from 'next/link';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Removed: useAuth, auth, signOut, useRouter, LogIn, UserCircle, LayoutDashboard

export default function SiteNavbar() {
  // Removed: user, router, handleLogout logic

  return (
    <header className="bg-background shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:text-accent transition-colors">
          <Rocket className="h-8 w-8" />
          <span className="text-2xl font-headline font-bold">Artechway</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          {/* Add other public links like About, Contact if needed */}
          {/* Admin-related links and buttons have been removed from here */}
        </div>
      </nav>
    </header>
  );
}
