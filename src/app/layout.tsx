import type { Metadata } from 'next';
import { VotingProvider } from '@/context/VotingContext';
import { Toast } from '@/components/ui/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crowd Judge - Hackathon Voting',
  description: 'Vote on hackathon projects and see the leaderboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <VotingProvider>
          <main className="container mx-auto px-4 py-6 max-w-5xl">
            {children}
          </main>
          <Toast />
        </VotingProvider>
      </body>
    </html>
  );
}
