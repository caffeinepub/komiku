import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/komiku-logo.dim_200x60.png"
                alt="KOMIKU"
                className="h-8 object-contain"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>Platform komik Indonesia terlengkap — Manga, Manhwa, Manhua</p>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              <p>
                © {new Date().getFullYear()} KOMIKU. Built with{' '}
                <span className="text-primary">♥</span> using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'komiku')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
