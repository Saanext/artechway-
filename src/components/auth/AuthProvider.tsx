
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean; // Simple check, could be more robust with roles
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile: UserProfile = {
          uid: session.user.id,
          email: session.user.email || null,
          displayName: session.user.user_metadata?.full_name || session.user.email || null,
        };
        setUser(profile);
        // Basic admin check, customize as needed (e.g. check a custom claim or a 'roles' table)
        setIsAdmin(!!session.user.email); // Example: any logged in user is admin
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };
    
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile: UserProfile = {
          uid: session.user.id,
          email: session.user.email || null,
          displayName: session.user.user_metadata?.full_name || session.user.email || null,
        };
        setUser(profile);
        setIsAdmin(!!session.user.email); 
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false); // Ensure loading is set to false after initial check or change
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
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
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
