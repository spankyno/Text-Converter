import React from 'react';
import { ExternalLink, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0c101c] text-slate-600 dark:text-slate-400 text-xs transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Brand & Privacy Statement */}
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-bold text-slate-900 dark:text-white">Text Converter</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Client-Side Only</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              Everything runs in your browser. Nothing is uploaded to any server.
            </p>
          </div>

          {/* User Requested Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-slate-600 dark:text-slate-300">
            <a
              href="https://aitorsanchez.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1 font-medium"
            >
              <span>Blog</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <span className="text-slate-300 dark:text-slate-700">·</span>

            <a
              href="https://aitorhub.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white"
            >
              <span>Aitor Hub</span>
              <ExternalLink className="w-3 h-3 text-indigo-500" />
            </a>

            <span className="text-slate-300 dark:text-slate-700">·</span>

            <a
              href="https://aitorsanchez.pages.dev/contacto"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1 font-medium"
            >
              <span>Contacto</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <span className="text-slate-300 dark:text-slate-700">·</span>

            <button
              onClick={onOpenAbout}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer font-medium"
            >
              Acerca de & Privacidad
            </button>
          </div>
        </div>

        {/* Copyright notice required */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
          <p>
            Autor: <span className="text-slate-800 dark:text-slate-200 font-medium">Aitor Sánchez Gutiérrez</span> © 2026 Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            Conversor universal de texto y Markdown optimizado para máxima productividad.
          </p>
        </div>
      </div>
    </footer>
  );
};
