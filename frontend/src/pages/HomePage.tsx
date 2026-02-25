import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Flame, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ComicCard from '../components/ComicCard';
import { useGetLatestUpdatedComics, useGetAllComics, useGetAllGenres } from '../hooks/useQueries';

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState<bigint | null>(null);
  const { data: latestComics, isLoading: latestLoading } = useGetLatestUpdatedComics(12);
  const { data: allComics, isLoading: allLoading } = useGetAllComics();
  const { data: genres } = useGetAllGenres();

  const popularComics = allComics
    ? [...allComics].sort((a, b) => Number(b.viewCount) - Number(a.viewCount)).slice(0, 12)
    : [];

  const filteredLatest = selectedGenre
    ? latestComics?.filter(c => c.genres.includes(selectedGenre))
    : latestComics;

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/generated/komiku-hero-banner.dim_1200x300.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '280px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative container mx-auto px-4 py-16 flex flex-col justify-center" style={{ minHeight: '280px' }}>
          <h1 className="font-display text-5xl md:text-7xl text-white mb-3 drop-shadow-lg">
            KOMIKU
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-semibold mb-6 max-w-md">
            Platform komik Indonesia terlengkap — Manga, Manhwa, Manhua
          </p>
          <div className="flex gap-3">
            <Link to="/browse">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6">
                <BookOpen className="h-4 w-4 mr-2" />
                Jelajahi Komik
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Genre Filter */}
      {genres && genres.length > 0 && (
        <section className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
              <button
                onClick={() => setSelectedGenre(null)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                  selectedGenre === null
                    ? 'bg-primary text-primary-foreground shadow-glow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                Semua
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id.toString()}
                  onClick={() => setSelectedGenre(selectedGenre === genre.id ? null : genre.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                    selectedGenre === genre.id
                      ? 'bg-primary text-primary-foreground shadow-glow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Latest Updated */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Terbaru Diperbarui
              </h2>
            </div>
            <Link to="/browse">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-bold">
                Lihat Semua <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {latestLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] rounded-lg bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-3 w-1/2 bg-muted" />
                </div>
              ))}
            </div>
          ) : filteredLatest && filteredLatest.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredLatest.map((comic) => (
                <ComicCard key={comic.id.toString()} comic={comic} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Belum ada komik tersedia</p>
              <p className="text-sm mt-1">Admin dapat menambahkan komik melalui panel admin</p>
            </div>
          )}
        </section>

        {/* Popular Comics */}
        {popularComics.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-accent rounded-full" />
                <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                  <Flame className="h-6 w-6 text-accent" />
                  Komik Populer
                </h2>
              </div>
              <Link to="/browse">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-bold">
                  Lihat Semua <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {allLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[2/3] rounded-lg bg-muted" />
                    <Skeleton className="h-4 w-3/4 bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {popularComics.map((comic) => (
                  <ComicCard key={comic.id.toString()} comic={comic} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
