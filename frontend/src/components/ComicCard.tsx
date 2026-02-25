import { Link } from '@tanstack/react-router';
import { Eye } from 'lucide-react';
import type { Comic } from '../backend';

interface ComicCardProps {
  comic: Comic;
}

const TYPE_COLORS: Record<string, string> = {
  Manga: 'bg-blue-600/80 text-white',
  Manhwa: 'bg-green-600/80 text-white',
  Manhua: 'bg-purple-600/80 text-white',
};

const STATUS_COLORS: Record<string, string> = {
  Ongoing: 'bg-primary/80 text-primary-foreground',
  Completed: 'bg-muted text-muted-foreground',
};

export default function ComicCard({ comic }: ComicCardProps) {
  return (
    <Link to="/comic/$id" params={{ id: comic.id.toString() }} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-card border border-border transition-all duration-300 group-hover:border-primary/60 group-hover:shadow-glow-sm group-hover:-translate-y-1">
        {/* Cover Image */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {comic.coverImage ? (
            <img
              src={comic.coverImage}
              alt={comic.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/200x300/1a1a2e/e94560?text=${encodeURIComponent(comic.title.slice(0, 10))}`;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
              <span className="font-display text-2xl text-primary text-center px-2 leading-tight">
                {comic.title}
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <p className="text-white text-xs font-semibold line-clamp-3 leading-relaxed">
              {comic.description || 'Baca komik ini sekarang!'}
            </p>
          </div>

          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${TYPE_COLORS[comic.type] || 'bg-muted text-foreground'}`}>
              {comic.type}
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[comic.status] || 'bg-muted text-foreground'}`}>
              {comic.status === 'Ongoing' ? 'Berlangsung' : 'Selesai'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {comic.title}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-muted-foreground truncate">{comic.author}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Eye className="h-3 w-3" />
              {Number(comic.viewCount).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
