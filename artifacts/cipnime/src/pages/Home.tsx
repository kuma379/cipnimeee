import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, TrendingUp, Filter } from "lucide-react"
import { 
  useGetLatestAnime, 
  useGetPopularAnime,
  GetLatestAnimeSource,
  GetPopularAnimeSource
} from "@workspace/api-client-react"
import { AnimeCard } from "@/components/anime/AnimeCard"
import { LoadingGrid } from "@/components/anime/LoadingGrid"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SOURCES = [
  { id: "all", label: "All Sources" },
  { id: "otakudesu", label: "Otakudesu" },
  { id: "samehadaku", label: "Samehadaku" },
  { id: "kusonime", label: "Kusonime" },
  { id: "anoboy", label: "Anoboy" },
] as const;

export default function Home() {
  const [activeSource, setActiveSource] = useState<GetLatestAnimeSource>("all")

  // Fetch queries
  const { 
    data: latestData, 
    isLoading: isLatestLoading,
    isError: isLatestError,
    error: latestError
  } = useGetLatestAnime({ source: activeSource, page: 1 })

  const { 
    data: popularData, 
    isLoading: isPopularLoading 
  } = useGetPopularAnime({ source: activeSource as GetPopularAnimeSource }, { 
    query: { 
      // Only fetch popular if supported by source (some sources might fail, but API handles 'all' gracefully)
      retry: 1
    }
  })

  // Get a featured anime from popular for the hero section
  const featuredAnime = popularData?.items?.[0] || latestData?.items?.[0]

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-end pb-12 pt-32 overflow-hidden mask-hero">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Hero background" 
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Streaming Unlimited Anime</span>
            </div>
            
            {featuredAnime ? (
              <>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-4 leading-tight">
                  {featuredAnime.title}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
                  Catch up on the latest episodes or explore popular series. Choose from multiple sources for the best streaming experience.
                </p>
                <Button size="lg" className="rounded-full px-8 gap-2" onClick={() => {
                  window.location.href = `/anime/detail?url=${encodeURIComponent(featuredAnime.url)}&source=${featuredAnime.source}`
                }}>
                  <PlayCircle className="w-5 h-5" />
                  Watch Now
                </Button>
              </>
            ) : (
              <div className="h-40 flex items-center">
                <div className="w-full max-w-md h-12 bg-white/5 animate-pulse rounded-lg" />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 mt-8 space-y-16">
        
        {/* Source Filter Tabs */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold">Select Source</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((source) => (
              <button
                key={source.id}
                onClick={() => setActiveSource(source.id as GetLatestAnimeSource)}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 border",
                  activeSource === source.id
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-secondary border-border text-muted-foreground hover:text-white hover:border-white/20"
                )}
              >
                {source.label}
              </button>
            ))}
          </div>
        </section>

        {/* Popular Anime Section */}
        {popularData && popularData.items.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-accent" />
                <h2 className="text-2xl md:text-3xl font-display font-bold">Popular Right Now</h2>
              </div>
            </div>
            
            {isPopularLoading ? (
              <LoadingGrid count={6} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {popularData.items.slice(0, 6).map((anime, idx) => (
                  <AnimeCard key={`${anime.source}-${anime.url}`} anime={anime} index={idx} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Latest Updates Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-display font-bold">Latest Episodes</h2>
            </div>
          </div>

          {isLatestLoading ? (
            <LoadingGrid count={12} />
          ) : isLatestError ? (
            <div className="p-12 text-center glass-card rounded-2xl border-destructive/20">
              <p className="text-destructive font-medium text-lg mb-2">Failed to load latest anime.</p>
              <p className="text-muted-foreground text-sm">{(latestError as any)?.message || "The scraper might be blocked or the source format changed."}</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : latestData?.items?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {latestData.items.map((anime, idx) => (
                <AnimeCard key={`${anime.source}-${anime.url}-${idx}`} anime={anime} index={idx} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center glass-card rounded-2xl">
              <p className="text-muted-foreground">No anime found for this source right now.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
