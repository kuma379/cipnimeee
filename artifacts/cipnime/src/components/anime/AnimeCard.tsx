import { Link } from "wouter"
import { motion } from "framer-motion"
import { PlayCircle, Star, Tv } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { AnimeItem } from "@workspace/api-client-react"

interface AnimeCardProps {
  anime: AnimeItem;
  index?: number;
}

export function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  // Pass the full URL and source via query params for the detail page
  const detailHref = `/anime/detail?url=${encodeURIComponent(anime.url)}&source=${anime.source}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="group"
    >
      <Link href={detailHref} className="block w-full h-full relative">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-card border-white/10 group-hover:border-primary/50 transition-all duration-500">
          
          {/* Image with smooth hover scale */}
          {anime.thumbnail ? (
            <img 
              src={anime.thumbnail} 
              alt={anime.title} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop&q=80`;
              }}
            />
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=600&fit=crop&q=80" 
              alt="Fallback"
              className="w-full h-full object-cover opacity-50"
            />
          )}

          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Overlay Play Icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[2px]">
            <div className="bg-primary/90 text-white p-4 rounded-full shadow-lg shadow-primary/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <PlayCircle className="w-8 h-8 fill-white/20" />
            </div>
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
            <Badge variant="accent" className="backdrop-blur-md bg-background/60">
              {anime.source}
            </Badge>
            {anime.rating && anime.rating !== "N/A" && anime.rating !== "?" && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-black/60 backdrop-blur-md">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>{anime.rating}</span>
              </Badge>
            )}
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {anime.episode && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-2 bg-primary/10 w-fit px-2 py-1 rounded-md border border-primary/20">
                <Tv className="w-3 h-3" />
                {anime.episode.replace(/Episode/i, 'Ep')}
              </div>
            )}
            <h3 className="font-display font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {anime.title}
            </h3>
            
            {/* Status or Type if available */}
            {(anime.status || anime.type) && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground line-clamp-1">
                {anime.type && <span>{anime.type}</span>}
                {anime.type && anime.status && <span>•</span>}
                {anime.status && <span>{anime.status}</span>}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
