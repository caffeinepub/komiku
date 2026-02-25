import { useState, useCallback } from 'react';
import { Download, X, Save, GripVertical, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetAllComics, useCreateChapter } from '../../hooks/useQueries';
import { fetchViaProxy, type ProxyName } from '../../utils/proxyFetch';
import { extractImageUrls } from '../../utils/htmlParser';
import { toast } from 'sonner';

interface GrabbedPage {
  url: string;
  id: string;
}

type GrabStatus = 'idle' | 'fetching-allorigins' | 'fetching-corsproxy' | 'parsing' | 'done' | 'error';

function getStatusLabel(status: GrabStatus): string {
  switch (status) {
    case 'fetching-allorigins':
      return 'Mengambil via allorigins.win...';
    case 'fetching-corsproxy':
      return 'allorigins.win gagal, mencoba corsproxy.io...';
    case 'parsing':
      return 'Mengekstrak URL gambar...';
    default:
      return 'Mengambil...';
  }
}

export default function ChapterGrabbingPage() {
  const [url, setUrl] = useState('');
  const [grabbedPages, setGrabbedPages] = useState<GrabbedPage[]>([]);
  const [selectedComicId, setSelectedComicId] = useState<bigint | null>(null);
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [grabError, setGrabError] = useState<string | null>(null);
  const [grabStatus, setGrabStatus] = useState<GrabStatus>('idle');

  const { data: comics } = useGetAllComics();
  const createChapter = useCreateChapter();

  const isGrabbing = grabStatus !== 'idle' && grabStatus !== 'done' && grabStatus !== 'error';

  const handleGrab = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setGrabError(null);
    setGrabbedPages([]);
    setGrabStatus('fetching-allorigins');

    try {
      const { html } = await fetchViaProxy(
        url.trim(),
        (proxy: ProxyName) => {
          if (proxy === 'allorigins') setGrabStatus('fetching-allorigins');
          else if (proxy === 'corsproxy') setGrabStatus('fetching-corsproxy');
        }
      );

      setGrabStatus('parsing');

      // Small delay to show parsing state
      await new Promise((resolve) => setTimeout(resolve, 100));

      const imageUrls = extractImageUrls(html);

      if (imageUrls.length === 0) {
        setGrabStatus('error');
        setGrabError(
          'Tidak ada gambar ditemukan di halaman tersebut. ' +
          'Situs mungkin menggunakan JavaScript rendering atau proteksi anti-scraping. ' +
          'Coba URL yang berbeda atau masukkan URL gambar secara manual.'
        );
        return;
      }

      setGrabbedPages(imageUrls.map((u, i) => ({ url: u, id: `page-${i}-${Date.now()}` })));
      setGrabStatus('done');
      toast.success(`Berhasil menemukan ${imageUrls.length} gambar!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengambil halaman';
      setGrabStatus('error');
      setGrabError(msg);
      toast.error('Gagal grab halaman');
    }
  }, [url]);

  const removePage = (id: string) => {
    setGrabbedPages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newPages = [...grabbedPages];
    const [dragged] = newPages.splice(dragIndex, 1);
    newPages.splice(index, 0, dragged);
    setGrabbedPages(newPages);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleSave = async () => {
    if (!selectedComicId) {
      toast.error('Pilih komik terlebih dahulu');
      return;
    }
    const num = parseInt(chapterNumber);
    if (isNaN(num) || num < 1) {
      toast.error('Nomor chapter tidak valid');
      return;
    }
    if (grabbedPages.length === 0) {
      toast.error('Tidak ada halaman untuk disimpan');
      return;
    }

    try {
      await createChapter.mutateAsync({
        comicId: selectedComicId,
        number: BigInt(num),
        title: chapterTitle,
        pages: grabbedPages.map((p) => p.url),
      });
      toast.success(`Chapter ${num} berhasil disimpan dengan ${grabbedPages.length} halaman!`);
      setGrabbedPages([]);
      setChapterNumber('');
      setChapterTitle('');
      setUrl('');
      setGrabStatus('idle');
    } catch {
      toast.error('Gagal menyimpan chapter');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Grab Halaman Komik</h1>
        <p className="text-muted-foreground text-sm">
          Ambil gambar halaman komik dari URL web lain secara otomatis menggunakan proxy frontend
        </p>
      </div>

      {/* URL Input */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-base font-extrabold text-foreground mb-4">1. Masukkan URL Sumber</h2>
        <form onSubmit={handleGrab} className="flex gap-3">
          <div className="flex-1">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/manga/chapter-1"
              className="bg-muted border-border font-mono text-sm"
              disabled={isGrabbing}
            />
          </div>
          <Button
            type="submit"
            disabled={isGrabbing || !url.trim()}
            className="bg-primary text-primary-foreground font-bold shrink-0"
          >
            {isGrabbing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {getStatusLabel(grabStatus)}
              </span>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Grab
              </>
            )}
          </Button>
        </form>

        {/* Proxy status indicator */}
        {isGrabbing && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{getStatusLabel(grabStatus)}</span>
            {grabStatus === 'fetching-corsproxy' && (
              <span className="text-warning font-medium">(fallback proxy)</span>
            )}
          </div>
        )}

        {grabError && (
          <Alert variant="destructive" className="mt-3 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{grabError}</AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Menggunakan allorigins.win sebagai proxy utama, corsproxy.io sebagai fallback
        </p>
      </div>

      {/* Preview Grid */}
      {grabbedPages.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-foreground">
              2. Preview &amp; Susun Halaman
              <span className="text-muted-foreground font-normal text-sm ml-2">
                ({grabbedPages.length} halaman — drag untuk mengubah urutan)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {grabbedPages.map((page, index) => (
              <div
                key={page.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group cursor-grab active:cursor-grabbing rounded-lg overflow-hidden border-2 transition-all ${
                  dragIndex === index
                    ? 'border-primary opacity-50 scale-95'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="aspect-[2/3] bg-muted">
                  <img
                    src={page.url}
                    alt={`Halaman ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/100x150/1a1a2e/666?text=${index + 1}`;
                    }}
                  />
                </div>
                {/* Page number */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-0.5 font-bold">
                  {index + 1}
                </div>
                {/* Drag handle */}
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4 text-white drop-shadow" />
                </div>
                {/* Remove button */}
                <button
                  onClick={() => removePage(page.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Chapter */}
      {grabbedPages.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-base font-extrabold text-foreground mb-4">3. Simpan sebagai Chapter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-sm font-bold text-foreground mb-1.5 block">Pilih Komik *</Label>
              <Select
                value={selectedComicId?.toString() || ''}
                onValueChange={(v) => setSelectedComicId(v ? BigInt(v) : null)}
              >
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Pilih komik..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {comics?.map((comic) => (
                    <SelectItem key={comic.id.toString()} value={comic.id.toString()}>
                      {comic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-bold text-foreground mb-1.5 block">Nomor Chapter *</Label>
              <Input
                type="number"
                min="1"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                placeholder="1"
                className="bg-muted border-border"
              />
            </div>
            <div>
              <Label className="text-sm font-bold text-foreground mb-1.5 block">Judul Chapter</Label>
              <Input
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Judul (opsional)"
                className="bg-muted border-border"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={createChapter.isPending || !selectedComicId || !chapterNumber}
            className="bg-primary text-primary-foreground font-bold px-8"
          >
            {createChapter.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Chapter ({grabbedPages.length} halaman)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
