import { useState, useEffect } from "react"
import { Link } from "wouter"
import { motion } from "framer-motion"
import { PlayCircle, Star, Tv, Info, Calendar, Monitor, ChevronLeft, Building2 } from "lucide-react"
import { useGetAnimeDetail, GetAnimeDetailSource } from "@workspace/api-client-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AnimeDetail() {
  const [url, setUrl] = useState<string>("")
  const [source, setSource] = useState<GetAnimeDetailSource | "">("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setUrl(params.get('url') || "")
    setSource(params.get('source') as GetAnimeDetailSource || "")
  }, [])

  const { data: anime, isLoading, isError } = useGetAnimeDetail(
    { url, source: source as GetAnimeDetailSource },
    { query: { enabled: !!url && !!source } }
  )

  if (isLoading) {
    return (
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="h-8 w-24 bg-secondary animate-pulse rounded-md mb-8" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
              <div className="aspect-[3/4] rounded-2xl bg-secondary animate-pulse" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-12 bg-secondary animate-pulse rounded-xl w-3/4" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-secondary animate-pulse rounded-full" />
                <div className="h-6 w-20 bg-secondary animate-pulse rounded-full" />
              </div>
              <div className="h-32 bg-secondary animate-pulse rounded-xl w-full mt-6" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (isError || !anime) {
    return (
      <main className="min-h-screen pt-32 flex flex-col items-center justify-center container mx-auto px-4 text-center">
        <h1 className="text-3xl font-display font-bold text-destructive mb-4">Error Loading Detail</h1>
        <p className="text-muted-foreground mb-8">Could not fetch data for this anime. The source might be down.</p>
        <Button onClick={() => window.history.back()} variant="outline">
          <ChevronLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Blurred Background Header */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden mask-hero">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110"
          style={{ backgroundImage: `url(${anime.thumbnail || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative -mt-32">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-4 text-muted-foreground hover:text-white"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </Button>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Left Column: Poster */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-[300px] shrink-0"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-card">
              <img 
                src={anime.thumbnail || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80'} 
                alt={anime.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="accent" className="bg-background/80 backdrop-blur-md font-bold px-3 py-1">
                  {anime.source}
                </Badge>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="glass-card p-4 rounded-xl text-center">
                <Star className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-bold">{anime.rating || 'N/A'}</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <Tv className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-sm text-muted-foreground">Episodes</p>
                <p className="font-bold">{anime.episodes || '?'}</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Info & Episodes */}
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 leading-tight">
                {anime.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {anime.status && (
                  <span className="flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full text-white/90">
                    <Info className="w-4 h-4 text-primary" /> {anime.status}
                  </span>
                )}
                {anime.type && (
                  <span className="flex items-center gap-1.5">
                    <Monitor className="w-4 h-4" /> {anime.type}
                  </span>
                )}
                {anime.studio && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> {anime.studio}
                  </span>
                )}
              </div>

              {anime.genre && anime.genre.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {anime.genre.map(g => (
                    <Badge key={g} variant="outline" className="bg-background/50 border-white/10 hover:bg-white/10">
                      {g}
                    </Badge>
                  ))}
                </div>
              )}

              {anime.synopsis && (
                <div className="mb-12">
                  <h3 className="text-xl font-display font-semibold mb-3 flex items-center gap-2">
                    Synopsis
                  </h3>
                  <div className="glass-card p-6 rounded-2xl text-white/80 leading-relaxed space-y-4">
                    {/* Handle potential HTML in synopsis loosely */}
                    <div dangerouslySetInnerHTML={{ __html: anime.synopsis }} />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Episode List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                  <PlayCircle className="w-6 h-6 text-primary" />
                  Episodes
                </h3>
                <span className="text-sm text-muted-foreground font-medium">
                  {anime.episodeList?.length || 0} Available
                </span>
              </div>

              {anime.episodeList && anime.episodeList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {anime.episodeList.map((ep, idx) => {
                    const epHref = `/anime/episode?url=${encodeURIComponent(ep.url)}&source=${source}`;
                    return (
                      <Link key={idx} href={epHref}>
                        <div className="group flex items-center justify-between p-4 rounded-xl glass hover:border-primary/50 transition-all cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary transition-colors">
                              <PlayCircle className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-white group-hover:text-primary transition-colors">
                                {ep.episode}
                              </p>
                              {ep.date && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Calendar className="w-3 h-3" /> {ep.date}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="glass-card p-8 text-center rounded-2xl border-white/5">
                  <p className="text-muted-foreground">No episodes found for this series.</p>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </div>
    </main>
  )
}
