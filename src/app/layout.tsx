import type { Metadata } from 'next';
import { VotingProvider } from '@/context/VotingContext';
import { AdminProvider } from '@/context/AdminContext';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Toast } from '@/components/ui/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Submission Portal',
  description: 'Join buildathon events, pick a theme, and submit your project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <AdminProvider>
            <VotingProvider>
              <Navbar />

              <main className="container mx-auto px-4 py-8 max-w-5xl">
                {children}
              </main>
              <Toast />
            </VotingProvider>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
