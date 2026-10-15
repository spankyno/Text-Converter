import React from 'react';
import { Sun, Moon, ShieldCheck, Keyboard, HelpCircle, ArrowLeftRight, Sparkles } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenAbout: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenAbout,
  onOpenShortcuts,
}) => {
  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#0e1322]/85 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark with subtle color accent */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            className="flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap group"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 text-white flex items-center justify-center font-mono text-sm font-semibold shadow-xs shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              TC
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Text Converter
              </span>
            </div>
          </a>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-indigo-200/60 dark:border-indigo-800/60">
              Universal & Bidireccional
            </span>
          </span>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={onOpenAbout}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            Conversiones
          </button>
          <button
            onClick={onOpenAbout}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            Filtro Anti-Cruft
          </button>
          <button
            onClick={onOpenShortcuts}
            className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Atajos</span>
            <kbd className="hidden lg:inline text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={onOpenAbout}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            Acerca de
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1 rounded-md bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">100% Client-Side</span>
          </div>

          <button
            onClick={onOpenShortcuts}
            aria-label="Ver atajos de teclado"
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAbout}
            aria-label="Información y ayuda"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Explicit Dark/Light Mode button with clear active state */}
          <button
            onClick={onToggleTheme}
            aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            title={`Modo actual: ${theme === 'dark' ? 'Oscuro' : 'Claro'}. Clic para cambiar.`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
                <span className="text-xs font-semibold hidden sm:inline text-amber-400">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-180 duration-300" />
                <span className="text-xs font-semibold hidden sm:inline text-indigo-600">Oscuro</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
