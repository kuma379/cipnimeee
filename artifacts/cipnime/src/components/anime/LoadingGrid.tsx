import { motion } from "framer-motion"

export function LoadingGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary/50 animate-pulse border border-white/5"
        >
          <div className="absolute top-3 left-3 w-16 h-5 bg-white/10 rounded-full" />
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <div className="w-12 h-5 bg-primary/20 rounded-md" />
            <div className="w-full h-5 bg-white/10 rounded-md" />
            <div className="w-2/3 h-5 bg-white/10 rounded-md" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
