import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4"
      >
        <h1 className="text-6xl md:text-8xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          404
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
          Pagina non trovata. L'URL che hai inserito non esiste.
        </p>
      </motion.div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna alla Dashboard
      </Link>
    </div>
  );
}
