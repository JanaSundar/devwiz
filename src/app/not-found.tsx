"use client";

import { Home, Search, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 overflow-y-auto flex items-center justify-center min-h-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-lg mx-auto px-6 py-16 text-center"
      >
        {/* Decorative 404 */}
        <div className="relative mb-8">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-[8rem] sm:text-[10rem] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-linear-to-b from-txt via-txt to-txt-muted/40"
          >
            404
          </motion.span>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute -top-2 -right-2 sm:right-4 w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center"
          >
            <Sparkles size={20} className="text-accent" />
          </motion.div>
        </div>

        {/* Message */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold text-txt mb-2"
        >
          Page not found
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-sm text-txt-sec leading-relaxed mb-10"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br />
          Try searching for a tool or head back home.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium btn-accent tr-smooth"
          >
            <Home size={16} />
            Back to Home
          </Link>
          <button
            type="button"
            onClick={() =>
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true }),
              )
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium btn-glass tr-smooth"
          >
            <Search size={16} />
            Search tools (⌘K)
          </button>
        </motion.div>

        {/* Subtle hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-[11px] text-txt-muted"
        >
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded border border-border font-mono text-[10px]">
            ⌘K
          </kbd>{" "}
          to open the command menu
        </motion.p>
      </motion.div>
    </main>
  );
}
