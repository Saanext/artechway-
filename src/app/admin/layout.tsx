
"use client";
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'; 
import Link from 'next/link';
import { Rocket, LogOut, LayoutDashboard, FilePlus, Lightbulb, Settings, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth(); // isAdmin might not be fully utilized here yet
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [user, loading, router, pathname]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="ml-4 text-lg font-semibold text-foreground">Loading Admin Panel...</p>
      </div>
    );
  }
  
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-lg font-semibold text-foreground">Redirecting to login...</p>
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "AD";
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const userDisplayName = user.displayName || user.email || "Admin";


  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 flex flex-col items-center">
          <Link href="/admin" className="flex items-center space-x-2 text-primary mb-4">
            <Rocket className="h-8 w-8" />
            <span className="text-xl font-headline font-bold group-data-[collapsible=icon]:hidden">Artechway</span>
          </Link>
          <div className="flex flex-col items-center space-y-2 w-full group-data-[collapsible=icon]:hidden">
            <Avatar className="h-16 w-16">
              {/* Supabase user objects don't have photoURL directly like Firebase. Needs to be handled if avatars are stored in Supabase Storage and linked in user_metadata. */}
              {/* <AvatarImage src={user.photoURL || undefined} alt={userDisplayName} /> */}
              <AvatarFallback>{getInitials(userDisplayName)}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium text-sidebar-foreground">{userDisplayName}</p>
            <p className="text-xs text-sidebar-foreground/70">Administrator</p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin">
                <SidebarMenuButton isActive={pathname === '/admin'} tooltip="Dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/new">
                <SidebarMenuButton isActive={pathname === '/admin/new'} tooltip="New Article">
                  <FilePlus />
                  <span>New Article</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/suggest-topics">
                <SidebarMenuButton isActive={pathname === '/admin/suggest-topics'} tooltip="Suggest Topics">
                  <Lightbulb />
                  <span>Suggest Topics</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="mr-2 h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6 bg-background min-h-screen">
          <div className="flex items-center justify-between mb-6">
             <h1 className="text-2xl font-headline font-semibold">
                {pathname.startsWith('/admin/new') ? 'Create New Article' :
                 pathname.startsWith('/admin/edit') ? 'Edit Article' :
                 pathname.startsWith('/admin/suggest-topics') ? 'Suggest Article Topics' :
                 'Admin Dashboard'}
             </h1>
             <SidebarTrigger className="md:hidden">
               <PanelLeft />
             </SidebarTrigger>
           </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
