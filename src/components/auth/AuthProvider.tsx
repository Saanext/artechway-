"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // Basic full-page skeleton loader
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-background shadow-md sticky top-0 z-50">
          <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </nav>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        </main>
        <footer className="bg-muted py-8 text-muted-foreground">
          <div className="container mx-auto px-4 text-center">
             <Skeleton className="h-6 w-1/4 mx-auto" />
             <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
          </div>
        </footer>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
