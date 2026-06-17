"use client";

import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="h-8 w-8 rounded-full border border-accent/30 border-t-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-sm tracking-[0.2em] uppercase text-muted">Loading</p>
      </motion.div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="mb-4 break-inside-avoid overflow-hidden rounded-sm bg-surface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
        >
          <div
            className="skeleton-shimmer aspect-[3/4] w-full"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        </motion.div>
      ))}
    </div>
  );
}
