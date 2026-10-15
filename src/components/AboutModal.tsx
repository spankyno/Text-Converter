import React from 'react';
import { X, ShieldCheck, Cpu, ExternalLink, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#111728] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col text-slate-800 dark:text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Acerca de Text Converter</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conversor universal de texto y Markdown para la web moderna
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Social Share Card Preview (og-image.png) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tarjeta Social Open Graph (og-image.png)</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">1200 × 630 px</span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-950 group">
              <img
                src="/og-image.png"
                alt="Vista previa de Text Converter (OG Image 1200x630)"
                className="w-full h-auto object-cover max-h-56 sm:max-h-64 transition-transform duration-300 group-hover:scale-[1.01]"
                width="1200"
                height="630"
                loading="lazy"
              />
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-slate-900/85 backdrop-blur-xs rounded-md text-[10px] text-slate-300 font-mono border border-slate-700/60 shadow-xs">
                og-image.png
              </div>
            </div>
          </div>

          {/* Section 1: Propósito y Funcionalidades */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
              Funcionalidades Principales
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3 text-xs sm:text-sm">
              Text Converter está diseñado para ser la herramienta más rápida, privada y limpia para convertir
              entre formatos de texto, inspirada en <em>copyasmarkdown</em> pero con un enfoque
              100% bidireccional y sin fricción.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100 block">HTML ↔ Markdown</strong>
                  <span>Soporte GFM completo con tablas, listas de tareas, bloques de código y tachado.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100 block">Markdown ↔ Rich Text</strong>
                  <span>Editor WYSIWYG en tiempo real y copiado con formato nativo para Word y Docs.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100 block">Limpieza Anti-Cruft</strong>
                  <span>Elimina el ruido sucio de Google Docs, Word MsoNormal, Notion y correos electrónicos.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100 block">Texto Plano & HTML Limpio</strong>
                  <span>Extracción impecable a plain text o HTML estilizado para email newsletters.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Stack Tecnológico */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>Stack Tecnológico</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span><strong>Core:</strong> React 19 + TypeScript + Vite</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span><strong>Conversión HTML → Markdown:</strong> Turndown con plugins GitHub Flavored Markdown (GFM)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span><strong>Renderizado Markdown → HTML:</strong> Marked con especificación GFM</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span><strong>Sanitización XSS:</strong> DOMPurify</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span><strong>Portapapeles Enriquecido:</strong> ClipboardItem API nativa (text/html y text/plain)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span><strong>Estilo & Tipografía:</strong> Tailwind CSS + Plus Jakarta Sans + JetBrains Mono</span>
              </li>
            </ul>
          </div>

          {/* Section 3: Política de Privacidad */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Política de Privacidad y Seguridad</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
              <strong>Everything runs in your browser. Nothing is uploaded.</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Text Converter opera en un entorno 100% del lado del cliente. Ningún texto, archivo, portapapeles
              o dato de usuario se transmite a través de internet ni se almacena en bases de datos externas.
              Tus documentos confidenciales permanecen estrictamente en la memoria RAM de tu propio navegador.
            </p>
          </div>

          {/* Section 4: Autor */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Aitor Sánchez Gutiérrez</p>
              <p className="text-slate-500">Desarrollador de software & Creador</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://aitorsanchez.pages.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1 font-medium underline"
              >
                <span>Blog Personal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://aitorhub.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1 font-medium underline"
              >
                <span>Aitor Hub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://aitorsanchez.pages.dev/contacto"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1 font-medium underline"
              >
                <span>Contacto</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
