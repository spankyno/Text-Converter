import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Trash2,
  FileDown,
  Sparkles,
  ClipboardPaste,
  ShieldCheck,
  Wand2,
  FileText,
  FileCode2,
  Zap,
} from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StatsBar } from './components/StatsBar';
import { WysiwygEditor } from './components/WysiwygEditor';
import { AboutModal } from './components/AboutModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import {
  TextFormat,
  htmlToMarkdown,
  markdownToHtml,
  markdownToPlainText,
  htmlToPlainText,
  addInlineStylesToHtml,
  detectFormat,
  copyRichTextToClipboard,
} from './lib/converter';
import { cleanHtmlNoise } from './lib/cleaner';
import { SAMPLES } from './lib/samples';

export default function App() {
  // Theme state with rock-solid sync to <html>
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cleanmark-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('cleanmark-theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Format states
  const [inputFormat, setInputFormat] = useState<TextFormat>('html');
  const [outputFormat, setOutputFormat] = useState<TextFormat>('markdown');
  const [inputText, setInputText] = useState<string>(() => SAMPLES[0].content);
  const [autoDetect, setAutoDetect] = useState<boolean>(true);
  const [htmlStyleMode, setHtmlStyleMode] = useState<'clean' | 'styled'>('clean');
  const [outputViewMode, setOutputViewMode] = useState<'preview' | 'code'>('preview');

  // Modals & Feedback
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<'none' | 'text' | 'rich'>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2400);
  }, []);

  // Compute converted output
  const outputContent = useMemo(() => {
    if (!inputText) return '';

    try {
      if (inputFormat === 'markdown') {
        if (outputFormat === 'markdown') return inputText;
        if (outputFormat === 'html') return markdownToHtml(inputText, htmlStyleMode === 'styled');
        if (outputFormat === 'richtext') return markdownToHtml(inputText, false);
        if (outputFormat === 'plaintext') return markdownToPlainText(inputText);
      }

      if (inputFormat === 'html') {
        const cleaned = cleanHtmlNoise(inputText);
        if (outputFormat === 'markdown') return htmlToMarkdown(cleaned);
        if (outputFormat === 'html') return htmlStyleMode === 'styled' ? addInlineStylesToHtml(cleaned) : cleaned;
        if (outputFormat === 'richtext') return cleaned;
        if (outputFormat === 'plaintext') return htmlToPlainText(cleaned);
      }

      if (inputFormat === 'richtext') {
        const cleaned = cleanHtmlNoise(inputText);
        if (outputFormat === 'markdown') return htmlToMarkdown(cleaned);
        if (outputFormat === 'html') return htmlStyleMode === 'styled' ? addInlineStylesToHtml(cleaned) : cleaned;
        if (outputFormat === 'richtext') return cleaned;
        if (outputFormat === 'plaintext') return htmlToPlainText(cleaned);
      }

      if (inputFormat === 'plaintext') {
        if (outputFormat === 'plaintext' || outputFormat === 'markdown') return inputText;
        if (outputFormat === 'html') {
          return inputText
            .split(/\n\n+/)
            .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
            .join('\n');
        }
        if (outputFormat === 'richtext') {
          return inputText
            .split(/\n\n+/)
            .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
            .join('\n');
        }
      }
    } catch (e) {
      console.error('Conversion calculation error:', e);
    }
    return '';
  }, [inputText, inputFormat, outputFormat, htmlStyleMode]);

  // Handle Input change with auto-detection
  const handleInputChange = useCallback(
    (newText: string, forceFormat?: TextFormat) => {
      setInputText(newText);

      if (autoDetect && !forceFormat && newText.length > 10) {
        const detected = detectFormat(newText);
        if (detected !== inputFormat && detected !== 'plaintext') {
          setInputFormat(detected);
          if (detected === 'markdown' && outputFormat === 'markdown') {
            setOutputFormat('richtext');
          } else if (detected === 'html' && outputFormat === 'html') {
            setOutputFormat('markdown');
          }
        }
      }
    },
    [autoDetect, inputFormat, outputFormat]
  );

  // Clean Noise manually
  const handleCleanNoise = () => {
    if (inputFormat === 'html' || inputFormat === 'richtext') {
      const cleaned = cleanHtmlNoise(inputText);
      setInputText(cleaned);
      showToast('Ruido de Google Docs y Word eliminado con éxito');
    } else {
      setInputText((prev) => prev.trim());
      showToast('Espacios y formato normalizados');
    }
  };

  // Swap Panels (Bidirectional inversion)
  const handleSwap = () => {
    const prevInFormat = inputFormat;
    const prevOutFormat = outputFormat;
    const prevOutputContent = outputContent;

    setInputFormat(prevOutFormat);
    setOutputFormat(prevInFormat);
    setInputText(prevOutputContent);
    showToast('Paneles intercambiados (Entrada ↔ Salida)');
  };

  // Clear Panels
  const handleClear = () => {
    setInputText('');
    showToast('Editor limpio');
  };

  // Paste from clipboard with intelligent rich text / HTML detection
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          if (item.types.includes('text/html')) {
            const blob = await item.getType('text/html');
            const html = await blob.text();
            setInputFormat('html');
            if (outputFormat === 'html') setOutputFormat('markdown');
            setInputText(html);
            showToast('HTML / Rich Text pegado desde portapapeles');
            return;
          }
        }
      }

      // Plain text fallback
      const text = await navigator.clipboard.readText();
      if (text) {
        handleInputChange(text);
        showToast('Texto pegado desde portapapeles');
      }
    } catch {
      showToast('Usa Ctrl+V / ⌘+V directamente en el panel');
    }
  };

  // Native Copy as Rich Text
  const handleCopyRichText = async () => {
    if (!outputContent) return;

    let htmlToCopy = '';
    let plainFallback = '';

    if (outputFormat === 'markdown') {
      htmlToCopy = markdownToHtml(outputContent, false);
      plainFallback = outputContent;
    } else if (outputFormat === 'html' || outputFormat === 'richtext') {
      htmlToCopy = outputContent;
      plainFallback = htmlToPlainText(outputContent);
    } else {
      htmlToCopy = `<p>${outputContent.replace(/\n/g, '<br>')}</p>`;
      plainFallback = outputContent;
    }

    const ok = await copyRichTextToClipboard(htmlToCopy, plainFallback);
    if (ok) {
      setCopyFeedback('rich');
      showToast('¡Copiado con formato nativo para Word, Docs, Gmail y Notion!');
      setTimeout(() => setCopyFeedback('none'), 2000);
    }
  };

  // Standard Copy (Markdown / Code / Plain Text)
  const handleCopyText = async () => {
    if (!outputContent) return;
    try {
      await navigator.clipboard.writeText(outputContent);
      setCopyFeedback('text');
      showToast('Copiado al portapapeles');
      setTimeout(() => setCopyFeedback('none'), 2000);
    } catch {
      showToast('Error al copiar');
    }
  };

  // Download converted file
  const handleDownload = () => {
    if (!outputContent) return;
    const extension =
      outputFormat === 'markdown'
        ? 'md'
        : outputFormat === 'html' || outputFormat === 'richtext'
        ? 'html'
        : 'txt';
    const mime = outputFormat === 'markdown' ? 'text/markdown' : outputFormat === 'html' ? 'text/html' : 'text/plain';

    const blob = new Blob([outputContent], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Descargado como .${extension}`);
  };

  // Load sample preset
  const handleSelectSample = (sampleId: string) => {
    const s = SAMPLES.find((item) => item.id === sampleId);
    if (s) {
      setInputFormat(s.format);
      setOutputFormat(s.format === 'html' ? 'markdown' : 'richtext');
      setInputText(s.content);
      showToast(`Ejemplo cargado: ${s.name}`);
    }
  };

  // Keyboard shortcuts listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsShortcutsOpen((v) => !v);
        return;
      }
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyText();
        return;
      }
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleCopyRichText();
        return;
      }
      if (isCmdOrCtrl && e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSwap();
        return;
      }
      if (isCmdOrCtrl && e.altKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleClear();
        return;
      }
      if (e.key === 'Escape') {
        setIsAboutOpen(false);
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [outputContent, inputFormat, outputFormat, inputText]);

  const formatLabels: Record<TextFormat, string> = {
    markdown: 'Markdown',
    html: 'HTML',
    richtext: 'Rich Text',
    plaintext: 'Plain Text',
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors relative overflow-x-hidden">
      {/* Subtle colorful ambient glow in background (Indigo + Violet) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-r from-indigo-500/12 via-violet-500/10 to-cyan-500/10 blur-3xl opacity-75 dark:opacity-40"
      />

      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col gap-4 relative z-10">
        {/* Workspace Title & Toolbar Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-100 dark:to-slate-200 bg-clip-text text-transparent">
              Text Converter
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Conversor universal bidireccional</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">Markdown ↔ HTML ↔ Rich Text ↔ Plain</span>
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Auto-detect toggle with indigo checkbox */}
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-2xs">
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
                className="rounded accent-indigo-600 dark:accent-indigo-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-medium">Auto-detectar formato</span>
            </label>

            {/* Quick Samples Dropdown */}
            <select
              aria-label="Cargar ejemplo"
              onChange={(e) => {
                if (e.target.value) {
                  handleSelectSample(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer shadow-2xs focus:outline-hidden"
            >
              <option value="" disabled>
                Cargar plantilla de prueba...
              </option>
              {SAMPLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handlePasteClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer font-medium shadow-2xs"
              title="Pegar texto o HTML desde el portapapeles"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pegar</span>
            </button>

            <button
              onClick={handleCleanNoise}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 transition-all cursor-pointer font-medium shadow-2xs"
              title="Elimina spans vacíos, estilos inline y metadatos de Word o Google Docs"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Limpiar Ruido Docs/Word</span>
            </button>

            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-900/60 transition-all cursor-pointer font-medium shadow-2xs"
              title="Limpiar texto"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          </div>

          {/* Central Swap Button with subtle gradient accent */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSwap}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-sm shadow-indigo-600/30 cursor-pointer active:scale-95"
              title="Intercambiar Entrada ↔ Salida (Ctrl+Alt+S)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-200" />
              <span>Invertir (Swap)</span>
            </button>
          </div>
        </div>

        {/* Dual Panel Layout with Professional Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 items-stretch">
          {/* ================= LEFT CARD: ENTRADA ================= */}
          <div className="flex flex-col bg-white dark:bg-[#111728] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-xl dark:shadow-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all overflow-hidden">
            {/* Professional Card Header */}
            <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-900/50 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Entrada
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>

                {/* Segmented Format Selector Tabs */}
                <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-xs font-medium">
                  {(['markdown', 'html', 'richtext', 'plaintext'] as TextFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setInputFormat(fmt)}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap text-xs ${
                        inputFormat === fmt
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {formatLabels[fmt]}
                    </button>
                  ))}
                </div>
              </div>

              <StatsBar text={inputText} className="hidden sm:flex" />
            </div>

            {/* Input Body */}
            <div className="flex-1 flex flex-col p-0 min-h-[380px] bg-white dark:bg-[#0f1423]">
              {inputFormat === 'richtext' ? (
                <WysiwygEditor
                  html={inputText}
                  onChange={(newHtml) => handleInputChange(newHtml, 'richtext')}
                  placeholder="Escribe o pega texto enriquecido con formato visual..."
                />
              ) : (
                <textarea
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={
                    inputFormat === 'markdown'
                      ? 'Escribe o pega Markdown aquí (# Título, - [x] Tarea, | Tablas |...)'
                      : inputFormat === 'html'
                      ? 'Pega HTML o código con etiquetas (ej: de Google Docs, Word o emails)...'
                      : 'Escribe o pega texto plano...'
                  }
                  spellCheck={false}
                  className="w-full flex-1 min-h-[380px] p-4 sm:p-5 font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden resize-none"
                />
              )}
            </div>

            {/* Input Panel Footer */}
            <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="text-[11px] flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {inputFormat === 'markdown' && 'Sintaxis GitHub Flavored Markdown activa'}
                  {inputFormat === 'html' && 'Limpia automáticamente tags <o:p>, MsoNormal y docs-guid'}
                  {inputFormat === 'richtext' && 'Editor visual interactivo con sincronización instantánea'}
                  {inputFormat === 'plaintext' && 'Texto plano sin sintaxis'}
                </span>
              </span>
              <StatsBar text={inputText} className="sm:hidden" />
            </div>
          </div>

          {/* ================= RIGHT CARD: SALIDA ================= */}
          <div className="flex flex-col bg-white dark:bg-[#111728] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-xl dark:shadow-indigo-950/20 hover:border-violet-300 dark:hover:border-violet-500/40 transition-all overflow-hidden">
            {/* Professional Card Header */}
            <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-900/50 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-violet-500 ring-4 ring-violet-500/20" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Salida
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>

                {/* Segmented Format Selector Tabs */}
                <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-xs font-medium">
                  {(['markdown', 'html', 'richtext', 'plaintext'] as TextFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap text-xs ${
                        outputFormat === fmt
                          ? 'bg-violet-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {formatLabels[fmt]}
                    </button>
                  ))}
                </div>
              </div>

              {/* View options for HTML */}
              {outputFormat === 'html' && (
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => setHtmlStyleMode((m) => (m === 'clean' ? 'styled' : 'clean'))}
                    className={`px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                      htmlStyleMode === 'styled'
                        ? 'bg-violet-600 text-white border-violet-600 font-semibold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Alternar estilos inline para newsletters y correos"
                  >
                    {htmlStyleMode === 'styled' ? 'Estilos inline (Email)' : 'HTML limpio'}
                  </button>
                </div>
              )}

              {/* View mode toggle for RichText (Preview vs Code) */}
              {outputFormat === 'richtext' && (
                <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-[11px]">
                  <button
                    onClick={() => setOutputViewMode('preview')}
                    className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                      outputViewMode === 'preview'
                        ? 'bg-white dark:bg-slate-700 font-semibold text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setOutputViewMode('code')}
                    className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                      outputViewMode === 'code'
                        ? 'bg-white dark:bg-slate-700 font-semibold text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Código
                  </button>
                </div>
              )}
            </div>

            {/* Output Body */}
            <div className="flex-1 flex flex-col p-0 min-h-[380px] max-h-[640px] overflow-y-auto bg-white dark:bg-[#0f1423]">
              {outputFormat === 'richtext' && outputViewMode === 'preview' ? (
                <div
                  className="prose-clean p-4 sm:p-5 flex-1 min-h-[380px] focus:outline-hidden text-slate-900 dark:text-slate-100"
                  dangerouslySetInnerHTML={{
                    __html: outputContent || '<p class="text-slate-400 dark:text-slate-600">El resultado formateado aparecerá aquí...</p>',
                  }}
                />
              ) : (
                <textarea
                  readOnly
                  value={outputContent}
                  placeholder="El resultado de la conversión se mostrará aquí en tiempo real..."
                  spellCheck={false}
                  className="w-full flex-1 min-h-[380px] p-4 sm:p-5 font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden resize-none cursor-text selection:bg-indigo-500/20"
                />
              )}
            </div>

            {/* Output Panel Actions Toolbar */}
            <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <StatsBar text={outputContent} />

              <div className="flex items-center gap-2">
                {/* 1-Click Copy as Rich Text with vibrant gradient */}
                <button
                  onClick={handleCopyRichText}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                    copyFeedback === 'rich'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm shadow-indigo-600/30'
                  }`}
                  title="Copia como text/html para pegar con formato en Word, Docs, Gmail, Slack o Notion"
                >
                  {copyFeedback === 'rich' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado Formato!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                      <span>Copy as Rich Text</span>
                    </>
                  )}
                </button>

                {/* Copy Text / Markdown */}
                <button
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  title="Copiar texto o código al portapapeles"
                >
                  {copyFeedback === 'text' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
                  title="Descargar archivo convertido"
                >
                  <FileDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Section with Professional Tinted Cards */}
        <section className="mt-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/90 dark:bg-[#111728]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Portapapeles Nativo Rich Text
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              El botón <strong>Copy as Rich Text</strong> genera un objeto <code className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">ClipboardItem</code> nativo.
              Pega tablas, encabezados y listas formateadas en Google Docs, Word, Gmail o Notion sin perder estilos.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/90 dark:bg-[#111728]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-amber-300 dark:hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Wand2 className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Filtro Anti-Cruft Inteligente
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Limpia el código basura generado por Microsoft Word (<code className="text-[11px] text-amber-700 dark:text-amber-300 font-mono">MsoNormal</code>, <code className="text-[11px] text-amber-700 dark:text-amber-300 font-mono">&lt;o:p&gt;</code>),
              los wrappers anidados de Google Docs y los atributos propietarios de Notion.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/90 dark:bg-[#111728]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                100% In-Browser & Privado
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Todo el motor de conversión opera en la memoria de tu navegador. Ningún texto o documento se envía a servidores. Tus datos nunca abandonan tu máquina.
            </p>
          </div>
        </section>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-800 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* Footer */}
      <Footer onOpenAbout={() => setIsAboutOpen(true)} />
    </div>
  );
}
