import { useState, useEffect } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import {
  ChevronLeft, ChevronRight, AlignJustify, Grid3X3,
  ArrowLeft, ArrowRight, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import CommentSection from '../components/CommentSection';
import { useGetChapterById, useGetComicById, useGetChaptersByComicId } from '../hooks/useQueries';

type ReadMode = 'scroll' | 'page';

export default function ChapterReaderPage() {
  const { comicId, chapterId } = useParams({ strict: false }) as { comicId: string; chapterId: string };
  const chapterIdBig = BigInt(chapterId);
  const comicIdBig = BigInt(comicId);

  const [readMode, setReadMode] = useState<ReadMode>('scroll');
  const [currentPage, setCurrentPage] = useState(0);

  const { data: chapter, isLoading: chapterLoading } = useGetChapterById(chapterIdBig);
  const { data: comic } = useGetComicById(comicIdBig);
  const { data: allChapters } = useGetChaptersByComicId(comicIdBig);

  const sortedChapters = allChapters
    ? [...allChapters].sort((a, b) => Number(a.number) - Number(b.number))
    : [];

  const currentChapterIndex = sortedChapters.findIndex(c => c.id === chapterIdBig);
  const prevChapter = currentChapterIndex > 0 ? sortedChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < sortedChapters.length - 1 ? sortedChapters[currentChapterIndex + 1] : null;

  useEffect(() => {
    setCurrentPage(0);
    window.scrollTo(0, 0);
  }, [chapterId]);

  const pages = chapter?.pages || [];
  const totalPages = pages.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav Bar: Prev / Next + mode toggle */}
      <div className="max-w-3xl mx-auto px-2 md:px-4 pt-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          {/* Prev / Next chapter buttons */}
          <div className="flex items-center gap-2">
            {prevChapter ? (
              <Link
                to="/comic/$comicId/chapter/$chapterId"
                params={{ comicId, chapterId: prevChapter.id.toString() }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border font-bold px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="border-border font-bold px-3 opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            <span className="text-sm font-semibold text-muted-foreground">
              {chapter ? `Ch.${Number(chapter.number)}` : '...'}
            </span>

            {nextChapter ? (
              <Link
                to="/comic/$comicId/chapter/$chapterId"
                params={{ comicId, chapterId: nextChapter.id.toString() }}
              >
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground font-bold px-3"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                disabled
                className="bg-primary/40 text-primary-foreground font-bold px-3 opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Read mode toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
            <button
              onClick={() => setReadMode('scroll')}
              className={`p-1.5 rounded transition-all ${readMode === 'scroll' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Mode Scroll"
            >
              <AlignJustify className="h-4 w-4" />
            </button>
            <button
              onClick={() => setReadMode('page')}
              className={`p-1.5 rounded transition-all ${readMode === 'page' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Mode Halaman"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chapter Title */}
      {chapter && (
        <div className="max-w-3xl mx-auto px-2 md:px-4 py-2 text-center">
          <h1 className="text-lg font-extrabold text-foreground">
            {comic?.title} — Chapter {Number(chapter.number)}
            {chapter.title && `: ${chapter.title}`}
          </h1>
          {readMode === 'page' && totalPages > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Halaman {currentPage + 1} / {totalPages}
            </p>
          )}
        </div>
      )}

      {/* Reader Content */}
      <div className="max-w-3xl mx-auto px-2 md:px-4">
        {chapterLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-96 bg-muted rounded" />
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold">Halaman tidak tersedia</p>
          </div>
        ) : readMode === 'scroll' ? (
          /* Scroll Mode */
          <div className="space-y-1">
            {pages.map((pageUrl, index) => (
              <div key={index} className="w-full">
                <img
                  src={pageUrl}
                  alt={`Halaman ${index + 1}`}
                  className="w-full h-auto block"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/800x1200/0d0d0d/444?text=Halaman+${index + 1}`;
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Page-by-Page Mode */
          <div className="relative">
            <div className="w-full">
              <img
                src={pages[currentPage]}
                alt={`Halaman ${currentPage + 1}`}
                className="w-full h-auto block mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/800x1200/0d0d0d/444?text=Halaman+${currentPage + 1}`;
                }}
              />
            </div>

            {/* Page Navigation */}
            <div className="flex items-center justify-between mt-4 gap-4">
              <Button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                variant="outline"
                className="flex-1 border-border font-bold disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground font-semibold whitespace-nowrap">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="flex-1 bg-primary text-primary-foreground font-bold disabled:opacity-30"
              >
                Selanjutnya
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Chapter Navigation */}
      <div className="max-w-3xl mx-auto px-2 md:px-4 py-8">
        <div className="flex items-center justify-between gap-4 bg-card border border-border rounded-xl p-4">
          {prevChapter ? (
            <Link
              to="/comic/$comicId/chapter/$chapterId"
              params={{ comicId, chapterId: prevChapter.id.toString() }}
              className="flex-1"
            >
              <Button variant="outline" className="w-full border-border font-bold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Chapter {Number(prevChapter.number)}
              </Button>
            </Link>
          ) : <div className="flex-1" />}

          <Link to="/comic/$id" params={{ id: comicId }}>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary font-bold">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Daftar Chapter</span>
            </Button>
          </Link>

          {nextChapter ? (
            <Link
              to="/comic/$comicId/chapter/$chapterId"
              params={{ comicId, chapterId: nextChapter.id.toString() }}
              className="flex-1"
            >
              <Button className="w-full bg-primary text-primary-foreground font-bold">
                Chapter {Number(nextChapter.number)}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      </div>

      {/* Comment Section */}
      <div className="max-w-3xl mx-auto px-2 md:px-4 pb-12">
        <Separator className="bg-border mb-8" />
        <CommentSection chapterId={chapterIdBig} />
      </div>
    </div>
  );
}
