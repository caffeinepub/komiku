import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Search, Menu, X, Shield, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export default function Navigation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: '/browse', search: { q: searchQuery.trim() } as never });
      setSearchQuery('');
    }
  };

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img
              src="/assets/generated/komiku-logo.dim_200x60.png"
              alt="KOMIKU"
              className="h-10 object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-bold text-foreground/80 hover:text-primary transition-colors uppercase tracking-wide"
            >
              Beranda
            </Link>
            <Link
              to="/browse"
              className="text-sm font-bold text-foreground/80 hover:text-primary transition-colors uppercase tracking-wide"
            >
              Jelajahi
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari komik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-bold">Admin</span>
                </Button>
              </Link>
            )}
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              size="sm"
              variant={isAuthenticated ? 'outline' : 'default'}
              className={isAuthenticated
                ? 'border-border text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-1">
                  <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                  <span className="hidden sm:inline text-xs">Masuk...</span>
                </span>
              ) : isAuthenticated ? (
                <span className="flex items-center gap-1">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs font-bold">Keluar</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs font-bold">Masuk</span>
                </span>
              )}
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3 animate-fade-in">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari komik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted border-border"
                />
              </div>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-foreground/80 hover:text-primary py-2 uppercase tracking-wide"
              >
                Beranda
              </Link>
              <Link
                to="/browse"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-foreground/80 hover:text-primary py-2 uppercase tracking-wide"
              >
                Jelajahi
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-primary py-2 flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
