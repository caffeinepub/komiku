import { useState } from 'react';
import { MessageSquare, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllChapters, useGetAllComics, useGetCommentsByChapterId, useDeleteComment } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { Comment, Chapter, Comic } from '../../backend';

// Sub-component to load and display comments for a single chapter
function ChapterComments({
  chapter,
  comic,
  searchQuery,
}: {
  chapter: Chapter;
  comic: Comic | undefined;
  searchQuery: string;
}) {
  const { data: comments, isLoading } = useGetCommentsByChapterId(chapter.id);
  const deleteComment = useDeleteComment();

  const filtered = comments?.filter(c =>
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.text.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-2 mt-2">
        <Skeleton className="h-16 w-full bg-muted rounded-lg" />
      </div>
    );
  }

  if (filtered.length === 0) return null;

  const handleDelete = async (comment: Comment) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      await deleteComment.mutateAsync({ commentId: comment.id, chapterId: chapter.id });
      toast.success('Komentar berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus komentar');
    }
  };

  function formatDate(timestamp: bigint): string {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-2">
      {filtered.map((comment) => (
        <div
          key={comment.id.toString()}
          className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border/50 group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-bold text-sm text-foreground">{comment.username}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-primary font-semibold">
                {comic?.title || 'Unknown'} — Ch.{Number(chapter.number)}
              </span>
              <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{comment.text}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(comment)}
            disabled={deleteComment.isPending}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function CommentModerationPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: chapters, isLoading: chaptersLoading } = useGetAllChapters();
  const { data: comics } = useGetAllComics();

  const getComic = (comicId: bigint): Comic | undefined =>
    comics?.find(c => c.id === comicId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Moderasi Komentar</h1>
        <p className="text-muted-foreground text-sm">Kelola dan hapus komentar dari semua chapter</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari komentar atau username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-muted border-border"
        />
      </div>

      {/* Comments by Chapter */}
      {chaptersLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-48 bg-muted" />
              <Skeleton className="h-16 w-full bg-muted rounded-lg" />
              <Skeleton className="h-16 w-full bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      ) : chapters && chapters.length > 0 ? (
        <div className="space-y-6">
          {chapters.map((chapter) => {
            const comic = getComic(chapter.comicId);
            return (
              <div key={chapter.id.toString()}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">
                    {comic?.title || 'Unknown'} — Chapter {Number(chapter.number)}
                    {chapter.title ? `: ${chapter.title}` : ''}
                  </span>
                </div>
                <ChapterComments
                  chapter={chapter}
                  comic={comic}
                  searchQuery={searchQuery}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Belum ada chapter</p>
          <p className="text-sm mt-1">Komentar akan muncul setelah ada chapter dan pembaca berkomentar</p>
        </div>
      )}
    </div>
  );
}
