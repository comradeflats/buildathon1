import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import { TeamProvider } from '@/context/TeamContext';
import { VotingProvider } from '@/context/VotingContext';
import { AdminProvider } from '@/context/AdminContext';
import { AuthProvider } from '@/context/AuthContext';
import { OrgProvider } from '@/context/OrgContext';
import { Navbar } from '@/components/layout/Navbar';
import { Toast } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Buildathon',
    template: '%s | buildathon.live',
  },
  description: 'Join live building arenas, ship projects, and grow your builder legacy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <html lang="en">
      <head>
        {recaptchaSiteKey && (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
            async
            defer
          />
        )}
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <OrgProvider>
                <AdminProvider>
                  <TeamProvider>
                    <VotingProvider>
                      <Navbar />

                      <main className="container mx-auto px-4 py-8 max-w-5xl">
                        {children}
                      </main>
                      <Toast />
                    </VotingProvider>
                  </TeamProvider>
                </AdminProvider>
              </OrgProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
