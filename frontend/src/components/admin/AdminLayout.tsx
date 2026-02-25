import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboard, BookOpen, BookMarked, Tag, MessageSquare,
  Download, LogOut, Menu, X, Shield, Home, Crown, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin, useClaimAdmin } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/comics', label: 'Komik', icon: BookOpen },
  { path: '/admin/chapters', label: 'Chapter', icon: BookMarked },
  { path: '/admin/genres', label: 'Genre', icon: Tag },
  { path: '/admin/comments', label: 'Komentar', icon: MessageSquare },
  { path: '/admin/grab', label: 'Grab Halaman', icon: Download },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { identity, clear } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, refetch: refetchAdmin } = useIsCallerAdmin();
  const claimAdminMutation = useClaimAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const principalId = identity?.getPrincipal().toString() ?? null;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleClaimAdmin = async () => {
    if (!identity) return;
    try {
      await claimAdminMutation.mutateAsync(identity.getPrincipal());
      await refetchAdmin();
    } catch (err) {
      // Error is shown via mutation state
    }
  };

  // Loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground font-semibold">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive opacity-60" />
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Login Diperlukan</h1>
          <p className="text-muted-foreground mb-6">
            Silakan login terlebih dahulu untuk mengakses panel admin.
          </p>
          <Link to="/">
            <Button className="bg-primary text-primary-foreground font-bold">
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Logged in but not admin — show Claim Admin or Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Crown className="h-16 w-16 mx-auto mb-4 text-primary opacity-80" />
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Setup Admin</h1>
          <p className="text-muted-foreground mb-2">
            Belum ada admin yang terdaftar, atau kamu bukan admin.
          </p>
          {principalId && (
            <div className="mb-4 p-3 rounded-lg bg-muted border border-border">
              <p className="text-xs text-muted-foreground mb-1">Principal ID kamu:</p>
              <p className="text-xs font-mono text-foreground break-all">{principalId}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-6">
            Jika kamu adalah pemilik aplikasi ini, klik tombol di bawah untuk mendaftarkan diri sebagai admin.
            Tindakan ini hanya bisa dilakukan sekali.
          </p>

          {claimAdminMutation.isError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2 text-left">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                {claimAdminMutation.error instanceof Error
                  ? claimAdminMutation.error.message
                  : 'Admin sudah terdaftar. Kamu tidak memiliki izin untuk mengakses panel ini.'}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleClaimAdmin}
              disabled={claimAdminMutation.isPending}
              className="bg-primary text-primary-foreground font-bold w-full"
            >
              {claimAdminMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Mendaftarkan...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Klaim sebagai Admin
                </span>
              )}
            </Button>
            <Link to="/">
              <Button variant="outline" className="w-full font-bold">
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-display text-xl text-primary tracking-wide">ADMIN</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Panel Manajemen KOMIKU</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = typeof window !== 'undefined' &&
              (item.exact
                ? window.location.pathname === item.path
                : window.location.pathname.startsWith(item.path) && item.path !== '/admin'
                  ? true
                  : window.location.pathname === item.path);

            return (
              <Link
                key={item.path}
                to={item.path as never}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-glow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-sidebar-foreground hover:bg-sidebar-accent transition-all">
            <Home className="h-4 w-4" />
            Ke Beranda
          </Link>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-sm font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border h-14 flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground">Admin Panel</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
