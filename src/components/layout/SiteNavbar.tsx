"use client";
import Link from 'next/link';
import { Rocket, LogIn, UserCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SiteNavbar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to home after logout
    } catch (error) {
      console.error("Error signing out: ", error);
      // Handle error (e.g., show a toast message)
    }
  };

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
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Admin
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogIn className="mr-2 h-4 w-4 transform rotate-180" /> Logout
              </Button>
            </>
          ) : (
            <Button variant="default" asChild>
              <Link href="/admin/login">
                <UserCircle className="mr-2 h-4 w-4" /> Admin Login
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
