import { useState, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Search, Filter, X, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import ComicCard from '../components/ComicCard';
import { useGetComics, useGetAllGenres } from '../hooks/useQueries';

export default function BrowsePage() {
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [searchInput, setSearchInput] = useState(searchParams?.q || '');
  const [search, setSearch] = useState(searchParams?.q || '');
  const [selectedGenre, setSelectedGenre] = useState<bigint | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { data: genres } = useGetAllGenres();
  const { data: comics, isLoading } = useGetComics({
    genre: selectedGenre,
    type: selectedType,
    status: selectedStatus,
    search: search || null,
  });

  useEffect(() => {
    if (searchParams?.q) {
      setSearchInput(searchParams.q);
      setSearch(searchParams.q);
    }
  }, [searchParams?.q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setSelectedGenre(null);
    setSelectedType(null);
    setSelectedStatus(null);
  };

  const hasFilters = search || selectedGenre || selectedType || selectedStatus;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-primary rounded-full" />
          <h1 className="text-3xl font-extrabold text-foreground">Jelajahi Komik</h1>
        </div>
        <p className="text-muted-foreground ml-4">Temukan komik favorit kamu dari ribuan judul</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari judul komik..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-muted border-border"
            />
          </div>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
            Cari
          </Button>
        </form>

        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />

          {/* Genre Filter */}
          <Select
            value={selectedGenre?.toString() || 'all'}
            onValueChange={(v) => setSelectedGenre(v === 'all' ? null : BigInt(v))}
          >
            <SelectTrigger className="w-40 bg-muted border-border text-sm">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">Semua Genre</SelectItem>
              {genres?.map((g) => (
                <SelectItem key={g.id.toString()} value={g.id.toString()}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select
            value={selectedType || 'all'}
            onValueChange={(v) => setSelectedType(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-36 bg-muted border-border text-sm">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="Manga">Manga</SelectItem>
              <SelectItem value="Manhwa">Manhwa</SelectItem>
              <SelectItem value="Manhua">Manhua</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={selectedStatus || 'all'}
            onValueChange={(v) => setSelectedStatus(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-36 bg-muted border-border text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Ongoing">Berlangsung</SelectItem>
              <SelectItem value="Completed">Selesai</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && comics && (
        <p className="text-sm text-muted-foreground mb-4">
          Menampilkan <span className="text-foreground font-bold">{comics.length}</span> komik
          {search && <span> untuk "<span className="text-primary">{search}</span>"</span>}
        </p>
      )}

      {/* Comics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] rounded-lg bg-muted" />
              <Skeleton className="h-4 w-3/4 bg-muted" />
              <Skeleton className="h-3 w-1/2 bg-muted" />
            </div>
          ))}
        </div>
      ) : comics && comics.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {comics.map((comic) => (
            <ComicCard key={comic.id.toString()} comic={comic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl font-bold mb-2">Tidak ada komik ditemukan</p>
          <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
          {hasFilters && (
            <Button onClick={clearFilters} variant="outline" className="mt-4 border-primary text-primary">
              Reset Filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
