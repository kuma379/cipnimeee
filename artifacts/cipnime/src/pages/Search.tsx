import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search as SearchIcon, AlertCircle } from "lucide-react"
import { useSearchAnime, SearchAnimeSource } from "@workspace/api-client-react"
import { AnimeCard } from "@/components/anime/AnimeCard"
import { LoadingGrid } from "@/components/anime/LoadingGrid"

export default function Search() {
  const [query, setQuery] = useState("")
  
  // Read query from URL on mount
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q')
    if (q) setQuery(q)
  }, [])

  // Only run query if we have a search term
  const { data, isLoading, isError } = useSearchAnime(
    { q: query, source: "all" as SearchAnimeSource },
    { query: { enabled: query.length > 2 } }
  )

  return (
    <main className="min-h-screen pt-28 pb-20 container mx-auto px-4 md:px-6">
      <div className="max-w-2xl mx-auto mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
          Search Anime
        </h1>
        <p className="text-muted-foreground">
          Find your favorite shows across all our sources.
        </p>
      </div>

      {!query ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
          <SearchIcon className="w-16 h-16 mb-4 text-muted-foreground" />
          <p className="text-xl font-medium">Type something in the navbar to start searching</p>
        </div>
      ) : isLoading ? (
        <div>
          <h2 className="text-xl mb-6 font-medium">Searching for "{query}"...</h2>
          <LoadingGrid count={10} />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-16 h-16 mb-4 text-destructive" />
          <p className="text-xl font-medium text-destructive">Error performing search</p>
          <p className="text-muted-foreground mt-2">The scraper API encountered an error.</p>
        </div>
      ) : data?.items?.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-medium">
              Found <span className="text-primary font-bold">{data.total || data.items.length}</span> results for "{query}"
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {data.items.map((anime, idx) => (
              <AnimeCard key={`${anime.source}-${anime.url}-${idx}`} anime={anime} index={idx} />
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchIcon className="w-16 h-16 mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl font-medium">No results found for "{query}"</p>
          <p className="text-muted-foreground mt-2">Try different keywords or check spelling.</p>
        </div>
      )}
    </main>
  )
}
