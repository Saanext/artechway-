import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/components/auth/AuthProvider';
import SiteNavbar from '@/components/layout/SiteNavbar';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'Artechway - AI, Web Dev & Social Media Insights',
  description: 'Your gateway to the latest in AI, web development, and social media marketing trends and strategies.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <SiteNavbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <SiteFooter />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
