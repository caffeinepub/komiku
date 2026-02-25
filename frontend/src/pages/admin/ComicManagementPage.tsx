import { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useGetAllComics,
  useGetAllGenres,
  useCreateComic,
  useUpdateComic,
  useDeleteComic,
} from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { Comic } from '../../backend';

interface ComicFormData {
  title: string;
  description: string;
  coverImage: string;
  type: string;
  genreIds: bigint[];
  status: string;
  author: string;
  artist: string;
}

const defaultForm: ComicFormData = {
  title: '',
  description: '',
  coverImage: '',
  type: 'Manga',
  genreIds: [],
  status: 'Ongoing',
  author: '',
  artist: '',
};

export default function ComicManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingComic, setEditingComic] = useState<Comic | null>(null);
  const [form, setForm] = useState<ComicFormData>(defaultForm);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: comics, isLoading } = useGetAllComics();
  const { data: genres } = useGetAllGenres();
  const createComic = useCreateComic();
  const updateComic = useUpdateComic();
  const deleteComic = useDeleteComic();

  const filteredComics = comics?.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const openCreate = () => {
    setEditingComic(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (comic: Comic) => {
    setEditingComic(comic);
    setForm({
      title: comic.title,
      description: comic.description,
      coverImage: comic.coverImage,
      type: comic.type,
      genreIds: [...comic.genres],
      status: comic.status,
      author: comic.author,
      artist: comic.artist,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Judul komik wajib diisi');
      return;
    }
    try {
      if (editingComic) {
        await updateComic.mutateAsync({ id: editingComic.id, ...form });
        toast.success('Komik berhasil diperbarui!');
      } else {
        await createComic.mutateAsync(form);
        toast.success('Komik berhasil dibuat!');
      }
      setShowForm(false);
    } catch {
      toast.error('Gagal menyimpan komik');
    }
  };

  const handleDelete = async (comic: Comic) => {
    if (!confirm(`Hapus komik "${comic.title}"?`)) return;
    try {
      await deleteComic.mutateAsync(comic.id);
      toast.success('Komik berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus komik');
    }
  };

  const toggleGenre = (genreId: bigint) => {
    setForm(prev => ({
      ...prev,
      genreIds: prev.genreIds.some(id => id === genreId)
        ? prev.genreIds.filter(id => id !== genreId)
        : [...prev.genreIds, genreId],
    }));
  };

  const isPending = createComic.isPending || updateComic.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Manajemen Komik</h1>
          <p className="text-muted-foreground text-sm">Kelola semua komik di platform</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground font-bold">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Komik
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari komik..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-muted border-border"
        />
      </div>

      {/* Comics List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-muted rounded-lg" />
          ))}
        </div>
      ) : filteredComics.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Belum ada komik</p>
          <p className="text-sm mt-1">Klik "Tambah Komik" untuk memulai</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredComics.map((comic) => (
            <div
              key={comic.id.toString()}
              className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg hover:border-border/80 transition-all"
            >
              <div className="w-10 h-14 rounded overflow-hidden bg-muted shrink-0">
                {comic.coverImage ? (
                  <img
                    src={comic.coverImage}
                    alt={comic.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{comic.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs border-border">{comic.type}</Badge>
                  <span className={`text-xs font-semibold ${comic.status === 'Ongoing' ? 'text-primary' : 'text-muted-foreground'}`}>
                    {comic.status === 'Ongoing' ? 'Berlangsung' : 'Selesai'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{comic.author}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(comic)}
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(comic)}
                  disabled={deleteComic.isPending}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-extrabold text-foreground">
                {editingComic ? 'Edit Komik' : 'Tambah Komik Baru'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-sm font-bold text-foreground mb-1.5 block">Judul *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Judul komik"
                    className="bg-muted border-border"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm font-bold text-foreground mb-1.5 block">Deskripsi</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Sinopsis komik..."
                    className="bg-muted border-border resize-none"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm font-bold text-foreground mb-1.5 block">URL Cover Image</Label>
                  <Input
                    value={form.coverImage}
                    onChange={(e) => setForm(p => ({ ...p, coverImage: e.target.value }))}
                    placeholder="https://..."
                    className="bg-muted border-border"
                  />
                  {form.coverImage && (
                    <div className="mt-2 w-16 h-24 rounded overflow-hidden border border-border">
                      <img
                        src={form.coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground mb-1.5 block">Tipe</Label>
                  <Select value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Manga">Manga</SelectItem>
                      <SelectItem value="Manhwa">Manhwa</SelectItem>
                      <SelectItem value="Manhua">Manhua</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground mb-1.5 block">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Ongoing">Berlangsung</SelectItem>
                      <SelectItem value="Completed">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground mb-1.5 block">Penulis</Label>
                  <Input
                    value={form.author}
                    onChange={(e) => setForm(p => ({ ...p, author: e.target.value }))}
                    placeholder="Nama penulis"
                    className="bg-muted border-border"
                  />
                </div>

                <div>
                  <Label className="text-sm font-bold text-foreground mb-1.5 block">Ilustrator</Label>
                  <Input
                    value={form.artist}
                    onChange={(e) => setForm(p => ({ ...p, artist: e.target.value }))}
                    placeholder="Nama ilustrator"
                    className="bg-muted border-border"
                  />
                </div>

                {genres && genres.length > 0 && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-bold text-foreground mb-2 block">Genre</Label>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => {
                        const checked = form.genreIds.some(id => id === genre.id);
                        return (
                          <label
                            key={genre.id.toString()}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer text-sm font-semibold transition-all ${
                              checked
                                ? 'border-primary bg-primary/20 text-primary'
                                : 'border-border bg-muted text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleGenre(genre.id)}
                              className="hidden"
                            />
                            {genre.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                  ) : editingComic ? 'Simpan Perubahan' : 'Buat Komik'}
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
