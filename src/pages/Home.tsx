import { Calculator, Scale, PiggyBank, Target, Calendar, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const tools = [
  {
    title: 'Calcolatore Forfettario',
    description: 'Calcola tasse, contributi e netto in tasca per il 2026.',
    icon: Calculator,
    href: '/calcolatore',
  },
  {
    title: 'Confronto Regimi',
    description: 'Forfettario vs Ordinario: scopri quale conviene.',
    icon: Scale,
    href: '/confronto',
  },
  {
    title: 'Contributi INPS',
    description: 'Simula i costi per Artigiani, Commercianti e Gestione Separata.',
    icon: PiggyBank,
    href: '/contributi',
  },
  {
    title: 'Quanto Fatturare',
    description: 'Trova il fatturato necessario per il tuo netto desiderato.',
    icon: Target,
    href: '/quanto-fatturare',
  },
  {
    title: 'Pianificazione',
    description: 'Prevedi entrate, uscite e scadenze fiscali.',
    icon: Calendar,
    href: '/pianificazione',
  },
  {
    title: 'Preventivo',
    description: 'Genera un preventivo professionale con anteprima A4 e export PDF.',
    icon: FileText,
    href: '/preventivo',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="flex flex-col gap-6 pt-8 md:pt-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-4xl md:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-3xl text-balance"
        >
          Simulazioni fiscali precise e aggiornate, <br className="hidden md:block" />
          <span className="text-zinc-400 dark:text-zinc-500">
            gratuito, senza registrazione, open source.
          </span>
        </motion.h1>
      </section>

      <section>
        <div className="mb-8">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
            Strumenti disponibili
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3"
        >
          {tools.map((tool) => (
            <motion.div key={tool.title} variants={item}>
              <Link
                to={tool.href}
                className="group flex flex-col gap-4 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 rounded-lg -m-3 p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors">
                  <tool.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 group-hover:underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 flex items-center gap-2">
                    {tool.title}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          <div className="md:w-1/3">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Novità 2026</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Ultimi aggiornamenti normativi integrati nei calcolatori.
            </p>
          </div>
          <div className="md:w-2/3">
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-3">
                <span className="text-zinc-300 dark:text-zinc-700">—</span>
                <span>Aggiornamento scaglioni IRPEF per il confronto regimi.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-zinc-300 dark:text-zinc-700">—</span>
                <span>
                  Nuove aliquote INPS stimate per Artigiani, Commercianti e Gestione Separata.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-zinc-300 dark:text-zinc-700">—</span>
                <span>
                  Limiti confermati: 85.000€ per il forfettario, 100.000€ uscita immediata.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
