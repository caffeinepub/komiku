import { useState } from 'react';
import { Plus, Edit, Trash2, BookMarked, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import {
  useGetAllComics,
  useGetChaptersByComicId,
  useCreateChapter,
  useUpdateChapter,
  useDeleteChapter,
} from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { Chapter } from '../../backend';

interface ChapterFormData {
  number: string;
  title: string;
  pagesText: string;
}

const defaultForm: ChapterFormData = {
  number: '',
  title: '',
  pagesText: '',
};

export default function ChapterManagementPage() {
  const [selectedComicId, setSelectedComicId] = useState<bigint | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [form, setForm] = useState<ChapterFormData>(defaultForm);

  const { data: comics, isLoading: comicsLoading } = useGetAllComics();
  const { data: chapters, isLoading: chaptersLoading } = useGetChaptersByComicId(selectedComicId);
  const createChapter = useCreateChapter();
  const updateChapter = useUpdateChapter();
  const deleteChapter = useDeleteChapter();

  const sortedChapters = chapters
    ? [...chapters].sort((a, b) => Number(b.number) - Number(a.number))
    : [];

  const openCreate = () => {
    if (!selectedComicId) {
      toast.error('Pilih komik terlebih dahulu');
      return;
    }
    setEditingChapter(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setForm({
      number: Number(chapter.number).toString(),
      title: chapter.title,
      pagesText: chapter.pages.join('\n'),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComicId) return;
    const num = parseInt(form.number);
    if (isNaN(num) || num < 1) {
      toast.error('Nomor chapter tidak valid');
      return;
    }
    const pages = form.pagesText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    try {
      if (editingChapter) {
        await updateChapter.mutateAsync({
          id: editingChapter.id,
          comicId: selectedComicId,
          number: BigInt(num),
          title: form.title,
          pages,
        });
        toast.success('Chapter berhasil diperbarui!');
      } else {
        await createChapter.mutateAsync({
          comicId: selectedComicId,
          number: BigInt(num),
          title: form.title,
          pages,
        });
        toast.success('Chapter berhasil dibuat!');
      }
      setShowForm(false);
    } catch {
      toast.error('Gagal menyimpan chapter');
    }
  };

  const handleDelete = async (chapter: Chapter) => {
    if (!selectedComicId) return;
    if (!confirm(`Hapus Chapter ${Number(chapter.number)}?`)) return;
    try {
      await deleteChapter.mutateAsync({ id: chapter.id, comicId: selectedComicId });
      toast.success('Chapter berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus chapter');
    }
  };

  const isPending = createChapter.isPending || updateChapter.isPending;
  const selectedComic = comics?.find(c => c.id === selectedComicId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Manajemen Chapter</h1>
          <p className="text-muted-foreground text-sm">Kelola chapter untuk setiap komik</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/grab">
            <Button variant="outline" className="border-border font-bold text-sm">
              <Download className="h-4 w-4 mr-2" />
              Grab Halaman
            </Button>
          </Link>
          <Button onClick={openCreate} className="bg-primary text-primary-foreground font-bold">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Chapter
          </Button>
        </div>
      </div>

      {/* Comic Selector */}
      <div className="bg-card border border-border rounded-xl p-4">
        <Label className="text-sm font-bold text-foreground mb-2 block">Pilih Komik</Label>
        {comicsLoading ? (
          <Skeleton className="h-10 w-full bg-muted" />
        ) : (
          <Select
            value={selectedComicId?.toString() || ''}
            onValueChange={(v) => setSelectedComicId(v ? BigInt(v) : null)}
          >
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Pilih komik untuk melihat chapter..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {comics?.map((comic) => (
                <SelectItem key={comic.id.toString()} value={comic.id.toString()}>
                  {comic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Chapter List */}
      {selectedComicId ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-foreground">
              Chapter — {selectedComic?.title}
              <span className="text-muted-foreground font-normal text-sm ml-2">
                ({sortedChapters.length} chapter)
              </span>
            </h2>
          </div>

          {chaptersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full bg-muted rounded-lg" />
              ))}
            </div>
          ) : sortedChapters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
              <BookMarked className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-bold">Belum ada chapter</p>
              <p className="text-sm mt-1">Klik "Tambah Chapter" untuk memulai</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedChapters.map((chapter) => (
                <div
                  key={chapter.id.toString()}
                  className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-display text-primary text-lg">{Number(chapter.number)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground">
                      Chapter {Number(chapter.number)}{chapter.title ? `: ${chapter.title}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{chapter.pages.length} halaman</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(chapter)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(chapter)}
                      disabled={deleteChapter.isPending}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
          <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Pilih komik di atas</p>
          <p className="text-sm mt-1">untuk melihat dan mengelola chapter-nya</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-extrabold text-foreground">
                {editingChapter ? 'Edit Chapter' : 'Tambah Chapter Baru'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold text-foreground mb-1.5 block">Nomor Chapter *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.number}
                    onChange={(e) => setForm(p => ({ ...p, number: e.target.value }))}
                    placeholder="1"
                    className="bg-muted border-border"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-foreground mb-1.5 block">Judul Chapter</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Judul (opsional)"
                    className="bg-muted border-border"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-bold text-foreground mb-1.5 block">
                  URL Halaman (satu per baris)
                </Label>
                <Textarea
                  value={form.pagesText}
                  onChange={(e) => setForm(p => ({ ...p, pagesText: e.target.value }))}
                  placeholder={`https://example.com/page1.jpg\nhttps://example.com/page2.jpg\n...`}
                  className="bg-muted border-border resize-none font-mono text-xs"
                  rows={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {form.pagesText.split('\n').filter(l => l.trim()).length} halaman dimasukkan
                </p>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-primary text-primary-foreground font-bold"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Menyimpan...
                    </span>
                  ) : editingChapter ? 'Simpan Perubahan' : 'Buat Chapter'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-border"
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
