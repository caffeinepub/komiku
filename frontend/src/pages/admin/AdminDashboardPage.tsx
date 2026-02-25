import { BookOpen, BookMarked, MessageSquare, TrendingUp, Download, Tag } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllComics, useGetAllChapters, useGetAllGenres } from '../../hooks/useQueries';

export default function AdminDashboardPage() {
  const { data: comics, isLoading: comicsLoading } = useGetAllComics();
  const { data: chapters, isLoading: chaptersLoading } = useGetAllChapters();
  const { data: genres, isLoading: genresLoading } = useGetAllGenres();

  const totalComics = comics?.length || 0;
  const totalChapters = chapters?.length || 0;
  const totalGenres = genres?.length || 0;
  const totalPages = chapters?.reduce((sum, ch) => sum + ch.pages.length, 0) || 0;

  const stats = [
    { label: 'Total Komik', value: totalComics, icon: BookOpen, color: 'text-primary', link: '/admin/comics' },
    { label: 'Total Chapter', value: totalChapters, icon: BookMarked, color: 'text-accent', link: '/admin/chapters' },
    { label: 'Total Halaman', value: totalPages, icon: TrendingUp, color: 'text-green-400', link: '/admin/chapters' },
    { label: 'Total Genre', value: totalGenres, icon: Tag, color: 'text-purple-400', link: '/admin/genres' },
  ];

  const recentComics = comics ? [...comics].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt)).slice(0, 5) : [];
  const isLoading = comicsLoading || chaptersLoading || genresLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di panel admin KOMIKU</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.link as never}>
              <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                    <span className={`text-3xl font-display ${stat.color}`}>
                      {isLoading ? (
                        <Skeleton className="h-8 w-12 bg-muted inline-block" />
                      ) : stat.value.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-extrabold text-foreground mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link to="/admin/comics">
            <Button variant="outline" className="w-full h-16 flex-col gap-1 border-border hover:border-primary hover:bg-primary/10 font-bold">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-xs">Tambah Komik</span>
            </Button>
          </Link>
          <Link to="/admin/chapters">
            <Button variant="outline" className="w-full h-16 flex-col gap-1 border-border hover:border-accent hover:bg-accent/10 font-bold">
              <BookMarked className="h-5 w-5 text-accent" />
              <span className="text-xs">Tambah Chapter</span>
            </Button>
          </Link>
          <Link to="/admin/grab">
            <Button variant="outline" className="w-full h-16 flex-col gap-1 border-border hover:border-green-500 hover:bg-green-500/10 font-bold">
              <Download className="h-5 w-5 text-green-400" />
              <span className="text-xs">Grab Halaman</span>
            </Button>
          </Link>
          <Link to="/admin/genres">
            <Button variant="outline" className="w-full h-16 flex-col gap-1 border-border hover:border-purple-500 hover:bg-purple-500/10 font-bold">
              <Tag className="h-5 w-5 text-purple-400" />
              <span className="text-xs">Kelola Genre</span>
            </Button>
          </Link>
          <Link to="/admin/comments">
            <Button variant="outline" className="w-full h-16 flex-col gap-1 border-border hover:border-yellow-500 hover:bg-yellow-500/10 font-bold">
              <MessageSquare className="h-5 w-5 text-yellow-400" />
              <span className="text-xs">Moderasi Komentar</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Comics */}
      {recentComics.length > 0 && (
        <div>
          <h2 className="text-lg font-extrabold text-foreground mb-4">Komik Terbaru Diperbarui</h2>
          <div className="space-y-2">
            {recentComics.map((comic) => (
              <div key={comic.id.toString()} className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg">
                <div className="w-10 h-14 rounded overflow-hidden bg-muted shrink-0">
                  {comic.coverImage ? (
                    <img src={comic.coverImage} alt={comic.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{comic.title}</p>
                  <p className="text-xs text-muted-foreground">{comic.type} · {comic.status}</p>
                </div>
                <Link to="/admin/comics">
                  <Button variant="ghost" size="sm" className="text-primary text-xs font-bold">
                    Edit
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
