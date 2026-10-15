import React, { useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  RemoveFormatting,
} from 'lucide-react';
import { cleanHtmlNoise } from '../lib/cleaner';

interface WysiwygEditorProps {
  html: string;
  onChange: (newHtml: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  html,
  onChange,
  placeholder = 'Escribe o pega texto enriquecido aquí...',
  readOnly = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChangeRef = useRef(false);

  // Sync incoming HTML if external change occurred
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== html && !isInternalChangeRef.current) {
        editorRef.current.innerHTML = html;
      }
      isInternalChangeRef.current = false;
    }
  }, [html]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      const currentHtml = editorRef.current.innerHTML;
      onChange(currentHtml);
    }
  }, [onChange]);

  // Clean pasted HTML directly in WYSIWYG
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const pastedHtml = e.clipboardData.getData('text/html');
      if (pastedHtml) {
        e.preventDefault();
        const cleaned = cleanHtmlNoise(pastedHtml);
        document.execCommand('insertHTML', false, cleaned);
        handleInput();
      }
    },
    [handleInput]
  );

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (readOnly) return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleAddLink = () => {
    const url = prompt('Introduce la URL del enlace: (ej: https://ejemplo.com)');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table class="w-full border-collapse my-3">
        <thead>
          <tr>
            <th class="border border-slate-300 dark:border-slate-700 p-2 text-left font-semibold">Columna 1</th>
            <th class="border border-slate-300 dark:border-slate-700 p-2 text-left font-semibold">Columna 2</th>
            <th class="border border-slate-300 dark:border-slate-700 p-2 text-left font-semibold">Columna 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-300 dark:border-slate-700 p-2">Dato A1</td>
            <td class="border border-slate-300 dark:border-slate-700 p-2">Dato A2</td>
            <td class="border border-slate-300 dark:border-slate-700 p-2">Dato A3</td>
          </tr>
          <tr>
            <td class="border border-slate-300 dark:border-slate-700 p-2">Dato B1</td>
            <td class="border border-slate-300 dark:border-slate-700 p-2">Dato B2</td>
            <td class="border border-slate-300 dark:border-slate-700 p-2">Dato B3</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    executeCommand('insertHTML', tableHtml);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f1423] overflow-hidden">
      {!readOnly && (
        <div className="flex items-center flex-wrap gap-0.5 p-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/90 select-none">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Negrita (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Cursiva (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Tachado"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h1>')}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Título 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Título 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h3>')}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Título 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Lista con viñetas"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Lista numerada"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Cita"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<pre>')}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Bloque de código"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

          <button
            type="button"
            onClick={handleAddLink}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Insertar enlace"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleInsertTable}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Insertar tabla"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-500 transition-colors"
            title="Limpiar formato"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="prose-clean p-4 sm:p-5 flex-1 min-h-[380px] max-h-[640px] overflow-y-auto focus:outline-hidden text-slate-900 dark:text-slate-100 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-600 empty:before:pointer-events-none"
      />
    </div>
  );
};
