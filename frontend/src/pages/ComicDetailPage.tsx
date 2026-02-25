import { useParams, Link } from '@tanstack/react-router';
import { BookOpen, User, Palette, Eye, Clock, ChevronRight, BookMarked, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useGetComicById, useGetChaptersByComicId, useGetAllGenres } from '../hooks/useQueries';

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ComicDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const comicId = BigInt(id);

  const { data: comic, isLoading: comicLoading } = useGetComicById(comicId);
  const { data: chapters, isLoading: chaptersLoading } = useGetChaptersByComicId(comicId);
  const { data: genres } = useGetAllGenres();

  const sortedChapters = chapters
    ? [...chapters].sort((a, b) => Number(b.number) - Number(a.number))
    : [];

  const firstChapter = chapters && chapters.length > 0
    ? [...chapters].sort((a, b) => Number(a.number) - Number(b.number))[0]
    : null;

  const getGenreName = (genreId: bigint) => {
    return genres?.find(g => g.id === genreId)?.name || genreId.toString();
  };

  if (comicLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-48 h-72 rounded-xl bg-muted shrink-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4 bg-muted" />
            <Skeleton className="h-4 w-1/2 bg-muted" />
            <Skeleton className="h-24 w-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl font-bold text-muted-foreground">Komik tidak ditemukan</p>
        <Link to="/browse">
          <Button className="mt-4 bg-primary text-primary-foreground">Kembali ke Jelajahi</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/browse" className="hover:text-primary transition-colors">Jelajahi</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold truncate max-w-xs">{comic.title}</span>
      </nav>

      {/* Comic Info */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        {/* Cover */}
        <div className="shrink-0">
          <div className="w-48 md:w-56 rounded-xl overflow-hidden border border-border shadow-lg">
            {comic.coverImage ? (
              <img
                src={comic.coverImage}
                alt={comic.title}
                className="w-full aspect-[2/3] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/200x300/1a1a2e/e94560?text=${encodeURIComponent(comic.title.slice(0, 10))}`;
                }}
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                <span className="font-display text-3xl text-primary text-center px-4">{comic.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <Badge className={`shrink-0 font-bold ${
              comic.type === 'Manga' ? 'bg-blue-600 text-white' :
              comic.type === 'Manhwa' ? 'bg-green-600 text-white' :
              'bg-purple-600 text-white'
            }`}>
              {comic.type}
            </Badge>
            <Badge variant={comic.status === 'Ongoing' ? 'default' : 'secondary'} className={
              comic.status === 'Ongoing' ? 'bg-primary text-primary-foreground' : ''
            }>
              {comic.status === 'Ongoing' ? 'Berlangsung' : 'Selesai'}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
            {comic.title}
          </h1>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold text-foreground">Penulis:</span>
              <span>{comic.author || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Palette className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold text-foreground">Ilustrator:</span>
              <span>{comic.artist || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold text-foreground">Dilihat:</span>
              <span>{Number(comic.viewCount).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold text-foreground">Update:</span>
              <span>{formatDate(comic.updatedAt)}</span>
            </div>
          </div>

          {/* Genres */}
          {comic.genres.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
              {comic.genres.map((genreId) => (
                <Badge key={genreId.toString()} variant="outline" className="border-border text-muted-foreground text-xs">
                  {getGenreName(genreId)}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed text-sm mb-6">
            {comic.description || 'Tidak ada deskripsi tersedia.'}
          </p>

          {/* Action Buttons */}
          {firstChapter && (
            <div className="flex gap-3">
              <Link to="/comic/$comicId/chapter/$chapterId" params={{ comicId: comic.id.toString(), chapterId: firstChapter.id.toString() }}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Mulai Baca
                </Button>
              </Link>
              {sortedChapters.length > 0 && sortedChapters[0].id !== firstChapter.id && (
                <Link to="/comic/$comicId/chapter/$chapterId" params={{ comicId: comic.id.toString(), chapterId: sortedChapters[0].id.toString() }}>
                  <Button variant="outline" className="border-border font-bold">
                    <BookMarked className="h-4 w-4 mr-2" />
                    Chapter Terbaru
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-border mb-8" />

      {/* Chapter List */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 bg-primary rounded-full" />
          <h2 className="text-xl font-extrabold text-foreground">
            Daftar Chapter ({sortedChapters.length})
          </h2>
        </div>

        {chaptersLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-muted rounded-lg" />
            ))}
          </div>
        ) : sortedChapters.length > 0 ? (
          <div className="space-y-2">
            {sortedChapters.map((chapter) => (
              <Link
                key={chapter.id.toString()}
                to="/comic/$comicId/chapter/$chapterId"
                params={{ comicId: comic.id.toString(), chapterId: chapter.id.toString() }}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/60 hover:bg-secondary transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary font-display text-lg">Ch.{Number(chapter.number)}</span>
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {chapter.title || `Chapter ${Number(chapter.number)}`}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm shrink-0">
                  <span>{chapter.pages.length} halaman</span>
                  <span className="hidden sm:inline">{formatDate(chapter.createdAt)}</span>
                  <ChevronRight className="h-4 w-4 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Belum ada chapter tersedia</p>
          </div>
        )}
      </section>
    </div>
  );
}
