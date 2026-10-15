/**
 * HTML Noise Cleaner
 * Cleans cruft from Google Docs, Microsoft Word, Notion, Apple Notes, and Email HTML.
 */

export interface CleanOptions {
  removeComments?: boolean;
  removeSpanSoup?: boolean;
  removeInlineStyles?: boolean;
  cleanGoogleDocs?: boolean;
  cleanWordCruft?: boolean;
  normalizeWhitespace?: boolean;
}

const defaultOptions: CleanOptions = {
  removeComments: true,
  removeSpanSoup: true,
  removeInlineStyles: true,
  cleanGoogleDocs: true,
  cleanWordCruft: true,
  normalizeWhitespace: true,
};

export function cleanHtmlNoise(html: string, options: CleanOptions = defaultOptions): string {
  if (!html || typeof html !== 'string') return '';

  let cleaned = html;

  // 1. Remove Word conditional comments <!--[if ...]>...<![endif]--> and XML blocks
  if (options.cleanWordCruft) {
    cleaned = cleaned.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '');
    cleaned = cleaned.replace(/<\/?(w|o|m|v):[^>]*>/gi, '');
    cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
    cleaned = cleaned.replace(/<xml[\s\S]*?<\/xml>/gi, '');
    cleaned = cleaned.replace(/<meta[^>]*>/gi, '');
    cleaned = cleaned.replace(/<link[^>]*>/gi, '');
  }

  // 2. Remove standard HTML comments
  if (options.removeComments) {
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  }

  // 3. Clean Google Docs wrappers (e.g. b#docs-internal-guid-...)
  if (options.cleanGoogleDocs) {
    cleaned = cleaned.replace(/<b\s+id="docs-internal-guid-[^"]*"[^>]*>([\s\S]*?)<\/b>/gi, '$1');
    cleaned = cleaned.replace(/<span\s+id="docs-internal-guid-[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '$1');
  }

  // 4. Clean Apple webkit wrappers and Apple-converted-space
  cleaned = cleaned.replace(/<span class="Apple-converted-space">\s*<\/span>/gi, ' ');
  cleaned = cleaned.replace(/<span class="Apple-tab-span"[^>]*>([\s\S]*?)<\/span>/gi, '$1');

  // Parse in DOM to cleanly strip redundant attributes, empty wrappers, and span soups
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleaned, 'text/html');
    const body = doc.body;

    // Helper to sanitize nodes recursively
    function processNode(node: Node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();

        // Strip MS Word and tracking classes
        if (el.className) {
          const cleanClass = el.className
            .split(/\s+/)
            .filter(c => !c.startsWith('Mso') && !c.startsWith('docs-') && !c.startsWith('notion-'))
            .join(' ');
          if (cleanClass) {
            el.className = cleanClass;
          } else {
            el.removeAttribute('class');
          }
        }

        // Clean useless attributes
        const attrsToRemove = ['data-block-id', 'data-token-index', 'data-mce-style', 'aria-owns', 'data-pm-slice'];
        for (const attr of attrsToRemove) {
          el.removeAttribute(attr);
        }

        // Clean inline styles if requested, retaining only critical semantic intents
        if (options.removeInlineStyles && el.hasAttribute('style')) {
          const style = el.getAttribute('style') || '';
          
          // Check for bold in style
          const isBold = /font-weight\s*:\s*(bold|[7-9]00)/i.test(style);
          const isItalic = /font-style\s*:\s*italic/i.test(style);
          const isStrike = /text-decoration\s*:\s*line-through/i.test(style);
          
          el.removeAttribute('style');

          // If it was a styling span, convert to semantic tags if appropriate
          if (isBold && tagName === 'span') {
            const strong = doc.createElement('strong');
            strong.innerHTML = el.innerHTML;
            el.replaceWith(strong);
            processNode(strong);
            return;
          }
          if (isItalic && tagName === 'span') {
            const em = doc.createElement('em');
            em.innerHTML = el.innerHTML;
            el.replaceWith(em);
            processNode(em);
            return;
          }
          if (isStrike && tagName === 'span') {
            const del = doc.createElement('del');
            del.innerHTML = el.innerHTML;
            el.replaceWith(del);
            processNode(del);
            return;
          }
        }

        // Flatten unstyled, meaningless spans
        if (options.removeSpanSoup && tagName === 'span') {
          if (!el.hasAttributes()) {
            const fragment = doc.createDocumentFragment();
            while (el.firstChild) {
              fragment.appendChild(el.firstChild);
            }
            el.replaceWith(fragment);
            return;
          }
        }

        // Process children
        const children = Array.from(el.childNodes);
        for (const child of children) {
          processNode(child);
        }
      }
    }

    const initialChildren = Array.from(body.childNodes);
    for (const child of initialChildren) {
      processNode(child);
    }

    cleaned = body.innerHTML;
  } catch {
    // Fallback regex cleaning if DOMParser fails
  }

  // 5. Remove excessive empty paragraphs or linebreaks
  cleaned = cleaned.replace(/<p>\s*(&nbsp;|\s)*<\/p>/gi, '<p></p>');
  cleaned = cleaned.replace(/(<p><\/p>\s*){2,}/gi, '<p></p>');

  return cleaned.trim();
}
