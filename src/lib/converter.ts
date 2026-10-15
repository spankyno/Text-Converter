/**
 * Universal Text & Markdown Converter Engine
 */

import TurndownService from 'turndown';
// @ts-expect-error turndown-plugin-gfm doesn't provide full standard TS declarations
import * as turndownPluginGfm from 'turndown-plugin-gfm';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { cleanHtmlNoise } from './cleaner';

export type TextFormat = 'markdown' | 'html' | 'richtext' | 'plaintext';

// Configure marked with GFM options
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Configure Turndown with GFM extensions
function createTurndownService(): TurndownService {
  const td = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
  });

  // Apply GFM plugins safely
  try {
    const gfmPlugin = turndownPluginGfm.gfm || turndownPluginGfm.default?.gfm || (turndownPluginGfm as unknown as { gfm: TurndownService.Plugin }).gfm;
    if (typeof gfmPlugin === 'function') {
      td.use(gfmPlugin);
    } else {
      const tables = turndownPluginGfm.tables || turndownPluginGfm.default?.tables;
      const strikethrough = turndownPluginGfm.strikethrough || turndownPluginGfm.default?.strikethrough;
      const taskListItems = turndownPluginGfm.taskListItems || turndownPluginGfm.default?.taskListItems;
      if (tables) td.use(tables);
      if (strikethrough) td.use(strikethrough);
      if (taskListItems) td.use(taskListItems);
    }
  } catch {
    // Fallback if plugin fails
  }

  // Custom rule for underlined text to markdown or HTML preservation
  td.addRule('underline', {
    filter: ['u', 'ins'],
    replacement: (content) => `<u>${content}</u>`,
  });

  // Custom rule for highlights/mark
  td.addRule('mark', {
    filter: ['mark'],
    replacement: (content) => `==${content}==`,
  });

  // Custom rule for keyboard tags
  td.addRule('kbd', {
    filter: ['kbd'],
    replacement: (content) => `<kbd>${content}</kbd>`,
  });

  return td;
}

const turndown = createTurndownService();

/**
 * Converts HTML to Markdown, stripping noise first.
 */
export function htmlToMarkdown(html: string): string {
  if (!html || !html.trim()) return '';
  const cleaned = cleanHtmlNoise(html);
  try {
    const md = turndown.turndown(cleaned);
    return md.trim();
  } catch (err) {
    console.error('HTML to Markdown conversion error:', err);
    return cleaned;
  }
}

/**
 * Converts Markdown to sanitized HTML.
 * @param markdown The raw markdown string
 * @param styled If true, attaches clean modern inline styling for portable sharing
 */
export function markdownToHtml(markdown: string, styled = false): string {
  if (!markdown || !markdown.trim()) return '';
  try {
    const rawHtml = marked.parse(markdown) as string;
    const sanitized = DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['input'], // For task list checkboxes
      ADD_ATTR: ['checked', 'disabled', 'type', 'target', 'rel'],
    });

    if (!styled) {
      return sanitized.trim();
    }

    return addInlineStylesToHtml(sanitized);
  } catch (err) {
    console.error('Markdown to HTML conversion error:', err);
    return '';
  }
}

/**
 * Converts Markdown to clean Plain Text (stripping all syntax).
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return '';
  let text = markdown;

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/```.*\n?/, '').replace(/```$/, '');
  });
  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1');
  // Remove images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  // Remove links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove reference-style links [text][id]
  text = text.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1');
  // Remove headers # Header
  text = text.replace(/^#{1,6}\s+(.*)$/gm, '$1');
  // Remove blockquotes > Quote
  text = text.replace(/^\s*>\s+(.*)$/gm, '$1');
  // Remove horizontal rules
  text = text.replace(/^(\*{3,}|-{3,}|_{3,})$/gm, '');
  // Remove bold/italic: ***text***, **text**, *text*, ___text___, etc.
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');
  text = text.replace(/~~(.*?)~~/g, '$1');
  // Clean task lists
  text = text.replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, '');
  // Clean unordered list bullets
  text = text.replace(/^\s*[-*+]\s+/gm, '');
  // Clean numbered lists
  text = text.replace(/^\s*\d+\.\s+/gm, '');
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');

  return text.trim();
}

/**
 * Converts HTML to clean Plain Text.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Replace <br> and paragraph endings with newlines
    const brs = doc.querySelectorAll('br');
    brs.forEach(br => br.replaceWith('\n'));

    const blocks = doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, tr, blockquote');
    blocks.forEach(block => {
      block.after(doc.createTextNode('\n'));
    });

    const text = doc.body.textContent || '';
    // Normalize excessive blank lines
    return text.replace(/\n{3,}/g, '\n\n').trim();
  } catch {
    return html.replace(/<[^>]+>/g, '').trim();
  }
}

/**
 * Adds lightweight, clean inline CSS styles for email & doc compatibility when exporting HTML.
 */
export function addInlineStylesToHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Headings
  doc.querySelectorAll('h1').forEach(el => el.setAttribute('style', 'font-size: 1.875rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #111827; line-height: 1.25;'));
  doc.querySelectorAll('h2').forEach(el => el.setAttribute('style', 'font-size: 1.5rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #1f2937; line-height: 1.3;'));
  doc.querySelectorAll('h3').forEach(el => el.setAttribute('style', 'font-size: 1.25rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; color: #374151;'));
  
  // Paragraphs
  doc.querySelectorAll('p').forEach(el => el.setAttribute('style', 'margin-top: 0.5rem; margin-bottom: 0.75rem; line-height: 1.6; color: #374151;'));

  // Lists
  doc.querySelectorAll('ul').forEach(el => el.setAttribute('style', 'margin-top: 0.5rem; margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: disc;'));
  doc.querySelectorAll('ol').forEach(el => el.setAttribute('style', 'margin-top: 0.5rem; margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: decimal;'));
  doc.querySelectorAll('li').forEach(el => el.setAttribute('style', 'margin-bottom: 0.25rem; line-height: 1.5; color: #374151;'));

  // Blockquotes
  doc.querySelectorAll('blockquote').forEach(el => el.setAttribute('style', 'padding: 0.5rem 1rem; margin: 1rem 0; border-left: 3px solid #d1d5db; background-color: #f9fafb; color: #4b5563; font-style: italic;'));

  // Code
  doc.querySelectorAll('code').forEach(el => {
    if (el.parentElement?.tagName.toLowerCase() !== 'pre') {
      el.setAttribute('style', 'font-family: monospace; font-size: 0.875em; background-color: #f3f4f6; padding: 0.15rem 0.35rem; border-radius: 0.25rem; color: #111827;');
    }
  });
  doc.querySelectorAll('pre').forEach(el => el.setAttribute('style', 'background-color: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 0.375rem; overflow-x: auto; font-family: monospace; font-size: 0.875rem; margin: 1rem 0;'));

  // Tables
  doc.querySelectorAll('table').forEach(el => el.setAttribute('style', 'width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem;'));
  doc.querySelectorAll('th').forEach(el => el.setAttribute('style', 'border: 1px solid #e5e7eb; background-color: #f9fafb; padding: 0.5rem 0.75rem; text-align: left; font-weight: 600; color: #111827;'));
  doc.querySelectorAll('td').forEach(el => el.setAttribute('style', 'border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; color: #374151;'));

  // Links
  doc.querySelectorAll('a').forEach(el => el.setAttribute('style', 'color: #2563eb; text-decoration: underline;'));

  return doc.body.innerHTML;
}

/**
 * Intelligent detector of text format.
 */
export function detectFormat(content: string): TextFormat {
  if (!content || !content.trim()) return 'markdown';
  const trimmed = content.trim();

  // Distinct HTML indicators
  const hasHtmlTag = /<(p|div|span|h[1-6]|ul|ol|li|table|tr|td|th|blockquote|pre|code|a|strong|em|b|i|br)\b[^>]*>/i.test(trimmed);
  const isWrappedInHtml = trimmed.startsWith('<') && trimmed.endsWith('>') && hasHtmlTag;

  if (isWrappedInHtml || (hasHtmlTag && (trimmed.match(/<[^>]+>/g)?.length || 0) > 2)) {
    return 'html';
  }

  // Distinct Markdown indicators
  const hasMarkdownHeaders = /^#{1,6}\s+\S+/m.test(trimmed);
  const hasMarkdownLists = /^(\s*[-*+]\s+\[[ xX]\]|\s*[-*+]\s+|\s*\d+\.\s+)\S+/m.test(trimmed);
  const hasMarkdownLinks = /\[[^\]]+\]\([^)]+\)/.test(trimmed);
  const hasMarkdownTable = /\|.+\|\n\|[-:\s|]+\|/m.test(trimmed);
  const hasMarkdownCodeFence = /```[\s\S]*?```/.test(trimmed);
  const hasMarkdownQuotes = /^\s*>\s+\S+/m.test(trimmed);

  if (hasMarkdownHeaders || hasMarkdownLists || hasMarkdownLinks || hasMarkdownTable || hasMarkdownCodeFence || hasMarkdownQuotes) {
    return 'markdown';
  }

  return 'plaintext';
}

/**
 * Copies Rich Text to clipboard using native ClipboardItem (text/html + text/plain).
 * Perfectly formats when pasted into Word, Google Docs, Gmail, Outlook, Notion, Slack.
 */
export async function copyRichTextToClipboard(htmlContent: string, plainTextFallback: string): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && 'clipboard' in navigator && window.ClipboardItem) {
      // Ensure the HTML is complete with basic wrapper for maximum doc client compatibility
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlContent}</body></html>`;
      const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
      const textBlob = new Blob([plainTextFallback], { type: 'text/plain' });

      const item = new window.ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });

      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (err) {
    console.warn('Modern ClipboardItem write failed, trying fallback execCommand:', err);
  }

  // Fallback for browsers or environments where ClipboardItem fails
  try {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.opacity = '0';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(container);
    selection?.removeAllRanges();
    selection?.addRange(range);

    const success = document.execCommand('copy');
    selection?.removeAllRanges();
    document.body.removeChild(container);

    if (success) return true;
  } catch (fallbackErr) {
    console.error('Fallback copy failed:', fallbackErr);
  }

  // Final fallback: plain text copy
  try {
    await navigator.clipboard.writeText(plainTextFallback);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculates text statistics: words, characters, lines, reading time.
 */
export function calculateStats(text: string) {
  if (!text) {
    return { words: 0, chars: 0, charsNoSpaces: 0, lines: 0, readingTimeMinutes: 0 };
  }

  // Strip tags or markdown to calculate actual readable content stats
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean ? clean.split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return { words, chars, charsNoSpaces, lines, readingTimeMinutes };
}
