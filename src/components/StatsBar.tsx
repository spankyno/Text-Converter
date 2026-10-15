import React from 'react';
import { Clock, FileText, AlignLeft, Hash } from 'lucide-react';
import { calculateStats } from '../lib/converter';

interface StatsBarProps {
  text: string;
  className?: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ text, className = '' }) => {
  const stats = calculateStats(text);

  return (
    <div
      className={`flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400 font-mono ${className}`}
    >
      <div className="flex items-center gap-1.5" title="Palabras">
        <FileText className="w-3.5 h-3.5 text-neutral-400" />
        <span className="tabular-nums font-medium text-neutral-700 dark:text-neutral-300">
          {stats.words.toLocaleString()}
        </span>
        <span className="text-[11px] text-neutral-400 font-sans">palabras</span>
      </div>

      <span className="text-neutral-300 dark:text-neutral-700 font-sans">·</span>

      <div className="flex items-center gap-1.5" title="Caracteres totales">
        <Hash className="w-3.5 h-3.5 text-neutral-400" />
        <span className="tabular-nums font-medium text-neutral-700 dark:text-neutral-300">
          {stats.chars.toLocaleString()}
        </span>
        <span className="text-[11px] text-neutral-400 font-sans">caracteres</span>
      </div>

      <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700 font-sans">·</span>

      <div className="hidden sm:flex items-center gap-1.5" title="Líneas">
        <AlignLeft className="w-3.5 h-3.5 text-neutral-400" />
        <span className="tabular-nums font-medium text-neutral-700 dark:text-neutral-300">
          {stats.lines.toLocaleString()}
        </span>
        <span className="text-[11px] text-neutral-400 font-sans">líneas</span>
      </div>

      <span className="hidden md:inline text-neutral-300 dark:text-neutral-700 font-sans">·</span>

      <div className="hidden md:flex items-center gap-1.5" title="Tiempo de lectura estimado">
        <Clock className="w-3.5 h-3.5 text-neutral-400" />
        <span className="tabular-nums font-medium text-neutral-700 dark:text-neutral-300">
          ~{stats.readingTimeMinutes}
        </span>
        <span className="text-[11px] text-neutral-400 font-sans">min lectura</span>
      </div>
    </div>
  );
};
