import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Calculator,
  Scale,
  PiggyBank,
  Target,
  Calendar,
  Info,
  Menu,
  X,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { getThemeRevealRadius } from '@/lib/theme';
import { useThemeStore } from '@/store/useThemeStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Globe },
  { name: 'Calcolatore Forfettario', href: '/calcolatore', icon: Calculator },
  { name: 'Confronto Regimi', href: '/confronto', icon: Scale },
  { name: 'Contributi INPS', href: '/contributi', icon: PiggyBank },
  { name: 'Quanto Fatturare', href: '/quanto-fatturare', icon: Target },
  { name: 'Pianificazione', href: '/pianificazione', icon: Calendar },
  { name: 'Informativa', href: '/informativa', icon: Info },
];

function Logo({ className = 'text-xl' }: { className?: string }) {
  return (
    <div
      className={`flex items-baseline tracking-tight text-zinc-900 dark:text-zinc-50 ${className}`}
    >
      <span className="font-serif italic font-medium">Easy</span>
      <span className="font-sans font-bold tracking-tighter ml-[1px]">PIVA</span>
      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 ml-0.5 mb-0.5" />
    </div>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { mode, toggleThemeMode } = useThemeStore();
  const isDark = mode === 'dark';

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    // Fallback for browsers that don't support View Transitions
    if (!document.startViewTransition) {
      toggleThemeMode();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const radius = getThemeRevealRadius(x, y, window.innerWidth, window.innerHeight);

    // Set custom properties for CSS to use
    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);
    document.documentElement.style.setProperty('--theme-reveal-radius', `${radius}px`);

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        toggleThemeMode();
      });
    });

    transition.finished.finally(() => {
      document.documentElement.style.removeProperty('--theme-reveal-radius');
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-50 flex font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#111111] border-r border-zinc-200 dark:border-zinc-800/50 p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8 px-2">
                <Logo className="text-2xl truncate mr-2" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive
                          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-100 font-medium'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 fixed inset-y-0 bg-[#FAFAFA] dark:bg-[#111111] border-r border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center h-14 px-6">
          <Logo className="text-xl" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'bg-zinc-200/50 text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-100 font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <button
            className="flex w-full items-center gap-3 px-3 py-2 text-sm rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="h-14 flex items-center justify-between px-4 lg:hidden border-b border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-8 w-8 -ml-2"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Logo className="text-xl" />
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 -mr-2">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="px-6 py-8 md:px-10 border-t border-zinc-200/50 dark:border-zinc-800/50 text-xs text-zinc-500 dark:text-zinc-500 mt-auto max-w-5xl mx-auto w-full">
          <div className="flex flex-col gap-4">
            <div>
              <Logo className="text-base mb-2" />
              <p className="max-w-2xl text-balance text-zinc-500 dark:text-zinc-400">
                Progetto portfolio open-source mantenuto internamente da Michael Gasperini /
                Mikesoft. I calcoli sono basati sulle norme vigenti (Agenzia delle Entrate 2026) ma
                NON sostituiscono la consulenza di un commercialista. Consulta sempre un
                professionista abilitato.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Realizzato con 💙 da{' '}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  Michael Gasperini
                </span>{' '}
                ·{' '}
                <a
                  href="https://mikesoft.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                  Mikesoft
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
