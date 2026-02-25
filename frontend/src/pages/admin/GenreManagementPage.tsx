import { useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllGenres, useCreateGenre, useDeleteGenre } from '../../hooks/useQueries';
import { toast } from 'sonner';

export default function GenreManagementPage() {
  const [newGenreName, setNewGenreName] = useState('');

  const { data: genres, isLoading } = useGetAllGenres();
  const createGenre = useCreateGenre();
  const deleteGenre = useDeleteGenre();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newGenreName.trim();
    if (!name) {
      toast.error('Nama genre tidak boleh kosong');
      return;
    }
    // Check duplicate
    if (genres?.some(g => g.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Genre sudah ada');
      return;
    }
    try {
      await createGenre.mutateAsync(name);
      setNewGenreName('');
      toast.success(`Genre "${name}" berhasil ditambahkan!`);
    } catch {
      toast.error('Gagal menambahkan genre');
    }
  };

  const handleDelete = async (id: bigint, name: string) => {
    if (!confirm(`Hapus genre "${name}"?`)) return;
    try {
      await deleteGenre.mutateAsync(id);
      toast.success(`Genre "${name}" berhasil dihapus`);
    } catch {
      toast.error('Gagal menghapus genre');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Manajemen Genre</h1>
        <p className="text-muted-foreground text-sm">Kelola kategori dan genre komik</p>
      </div>

      {/* Add Genre Form */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-base font-extrabold text-foreground mb-4">Tambah Genre Baru</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <div className="flex-1">
            <Label className="sr-only">Nama Genre</Label>
            <Input
              value={newGenreName}
              onChange={(e) => setNewGenreName(e.target.value)}
              placeholder="Nama genre (contoh: Action, Romance, Comedy...)"
              className="bg-muted border-border"
            />
          </div>
          <Button
            type="submit"
            disabled={createGenre.isPending || !newGenreName.trim()}
            className="bg-primary text-primary-foreground font-bold shrink-0"
          >
            {createGenre.isPending ? (
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Genre List */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-base font-extrabold text-foreground mb-4">
          Daftar Genre
          {genres && (
            <span className="text-muted-foreground font-normal text-sm ml-2">
              ({genres.length} genre)
            </span>
          )}
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-muted rounded-lg" />
            ))}
          </div>
        ) : genres && genres.length > 0 ? (
          <div className="space-y-2">
            {genres.map((genre) => (
              <div
                key={genre.id.toString()}
                className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border/50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-bold text-sm text-foreground">{genre.name}</span>
                  <span className="text-xs text-muted-foreground">ID: {genre.id.toString()}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(genre.id, genre.name)}
                  disabled={deleteGenre.isPending}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <Tag className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold">Belum ada genre</p>
            <p className="text-sm mt-1">Tambahkan genre pertama di atas</p>
          </div>
        )}
      </div>
    </div>
  );
}
