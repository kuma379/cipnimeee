import { useState, useEffect } from "react"
import { useGetEpisodeStreaming, GetEpisodeStreamingSource } from "@workspace/api-client-react"
import { ChevronLeft, PlayCircle, Download, ExternalLink, AlertCircle, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function EpisodePlayer() {
  const [url, setUrl] = useState<string>("")
  const [source, setSource] = useState<GetEpisodeStreamingSource | "">("")
  const [activeStreamIndex, setActiveStreamIndex] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setUrl(params.get('url') || "")
    setSource(params.get('source') as GetEpisodeStreamingSource || "")
  }, [])

  const { data: episode, isLoading, isError } = useGetEpisodeStreaming(
    { url, source: source as GetEpisodeStreamingSource },
    { query: { enabled: !!url && !!source } }
  )

  if (isLoading) {
    return (
      <main className="min-h-screen pt-24 pb-20 container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 w-32 bg-secondary animate-pulse rounded-md" />
          <div className="aspect-video w-full bg-secondary animate-pulse rounded-2xl border border-white/5" />
          <div className="h-12 w-full bg-secondary animate-pulse rounded-xl" />
        </div>
      </main>
    )
  }

  if (isError || !episode) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center container mx-auto px-4 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-3xl font-display font-bold mb-4">Stream Unavailable</h1>
        <p className="text-muted-foreground mb-8">We couldn't extract the streaming links for this episode.</p>
        <Button onClick={() => window.history.back()} variant="outline">
          <ChevronLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </main>
    )
  }

  const activeStream = episode.streamingLinks?.[activeStreamIndex]
  // Simple check if URL might be an iframe source
  const isIframe = activeStream?.url.includes('http') && !activeStream.url.includes('.mp4')

  return (
    <main className="min-h-screen pt-24 pb-20 container mx-auto px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Button 
              variant="ghost" 
              className="mb-2 -ml-4 text-muted-foreground"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Back to Episodes
            </Button>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              {episode.title}
            </h1>
            {episode.animeTitle && (
              <p className="text-primary font-medium">{episode.animeTitle}</p>
            )}
          </div>
          <Badge variant="accent" className="w-fit text-sm px-4 py-1.5 rounded-lg">
            Source: {episode.source}
          </Badge>
        </div>

        {/* Video Player Area */}
        <div className="glass rounded-2xl p-2 md:p-4 mb-8">
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative shadow-2xl">
            {activeStream ? (
              isIframe ? (
                <iframe 
                  src={activeStream.url} 
                  allowFullScreen 
                  className="w-full h-full border-0"
                  title="Video Player"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Video className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-lg mb-4">Direct video links might not play in browser natively due to CORS.</p>
                  <Button asChild>
                    <a href={activeStream.url} target="_blank" rel="noopener noreferrer">
                      Open Stream Externally <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <PlayCircle className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg">No streaming links available</p>
              </div>
            )}
          </div>
          
          {/* Server Selection */}
          {episode.streamingLinks && episode.streamingLinks.length > 0 && (
            <div className="mt-4 p-4 bg-secondary/30 rounded-xl">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Select Server</h3>
              <div className="flex flex-wrap gap-2">
                {episode.streamingLinks.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStreamIndex(idx)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeStreamIndex === idx 
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                        : 'bg-card border border-white/10 hover:border-primary/50 text-muted-foreground hover:text-white'
                    }`}
                  >
                    {link.label || `Server ${idx + 1}`}
                    {link.quality && <span className="ml-2 opacity-70 text-xs">{link.quality}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Download Links Section */}
        {episode.downloadLinks && episode.downloadLinks.length > 0 && (
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Download className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl font-display font-bold">Download Options</h2>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {episode.downloadLinks.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col p-4 rounded-xl bg-secondary/50 border border-white/5 hover:border-accent/50 hover:bg-secondary transition-all group"
                >
                  <span className="font-semibold text-white group-hover:text-accent transition-colors">
                    {link.label}
                  </span>
                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span>{link.quality || 'Unknown Quality'}</span>
                    <span>{link.server || 'Direct'}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
