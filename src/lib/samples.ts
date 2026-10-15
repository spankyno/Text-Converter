/**
 * Sample datasets for instant conversion and demonstration
 */

export interface SampleItem {
  id: string;
  name: string;
  description: string;
  format: 'markdown' | 'html';
  content: string;
}

export const SAMPLES: SampleItem[] = [
  {
    id: 'google-docs-mess',
    name: 'Google Docs / Word con Cruft',
    description: 'HTML sucio con span soups, estilos inline y metadatos de Google Docs',
    format: 'html',
    content: `<b id="docs-internal-guid-458f918e-7fff-30a2-28e4-1845bb08104f" style="font-weight:normal;">
  <h1 style="margin-top:0pt;margin-bottom:0pt;font-size:24pt;font-family:Arial;font-weight:700;color:#000000;">
    <span style="font-size:24pt;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:700;">Informe de Lanzamiento Q3</span>
  </h1>
  <p style="margin-top:12pt;margin-bottom:0pt;line-height:1.5;">
    <span style="font-size:11pt;font-family:Arial;color:#222222;background-color:transparent;font-weight:400;">Este documento contiene texto exportado desde </span>
    <span style="font-size:11pt;font-family:Arial;color:#222222;background-color:transparent;font-weight:700;">Google Docs</span>
    <span style="font-size:11pt;font-family:Arial;color:#222222;background-color:transparent;font-weight:400;"> con toneladas de etiquetas span y estilos repetitivos innecesarios.</span>
  </p>
  <ul style="margin-top:0pt;margin-bottom:0pt;padding-left:36pt;">
    <li style="font-size:11pt;font-family:Arial;color:#222222;margin-top:4pt;">
      <span style="font-weight:700;">Rendimiento del motor:</span><span> Reducción de latencia a 12ms.</span>
    </li>
    <li style="font-size:11pt;font-family:Arial;color:#222222;margin-top:4pt;">
      <span style="font-weight:700;">Seguridad y Privacidad:</span><span> 100% en el navegador (Zero-cloud data).</span>
    </li>
    <li style="font-size:11pt;font-family:Arial;color:#222222;margin-top:4pt;">
      <span style="font-weight:700;">Compatibilidad:</span><span> Word, Google Docs, Notion, Slack y Gmail.</span>
    </li>
  </ul>
  <blockquote style="margin-top:10pt;border-left:3px solid #ccc;padding-left:10px;">
    <span style="font-style:italic;">"La simplicidad es el requisito previo para la fiabilidad."</span> — Edsger W. Dijkstra
  </blockquote>
</b>`,
  },
  {
    id: 'gfm-tables-tasks',
    name: 'Markdown GFM (Tablas & Tareas)',
    description: 'GitHub Flavored Markdown completo con tablas, task lists y código',
    format: 'markdown',
    content: `# Roadmap de Producto 2026

Convertidor de texto bidireccional de alto rendimiento optimizado para la web moderna.

### Tareas del Sprint
- [x] Soporte para conversión HTML bidireccional
- [x] Editor WYSIWYG con sincronización reactiva
- [x] Copiado en portapapeles nativo con formato Rich Text
- [ ] Soporte para exportación a PDF estilizado
- [ ] Atajos de teclado avanzados y paleta de comandos

### Comparativa de Formatos

| Característica | CleanMark | Herramientas Típicas |
| :--- | :--- | :--- |
| **Bidireccional** | Sí (Markdown ↔ HTML ↔ Rich) | No (Solo unidireccional) |
| **Limpieza de Cruft** | Docs, Word, Notion, Mail | Ninguna o básica |
| **Portapapeles Nativo** | Rich Text (\`text/html\`) | Solo texto plano |
| **Privacidad** | 100% Navegador (Client-side) | Envían a servidor |

> **Nota:** Puedes editar directamente este texto o cambiar al modo Rich Text para formatear visualmente con la barra de herramientas.`,
  },
  {
    id: 'rich-article',
    name: 'Artículo con Código y Citas',
    description: 'Formato ideal para publicaciones en blogs y newsletters',
    format: 'markdown',
    content: `## Guía de Buenas Prácticas en TypeScript Moderno

El tipado estricto combinado con inferencia inteligente proporciona la mejor experiencia de desarrollo.

\`\`\`typescript
interface FormatConverter {
  name: string;
  convert(input: string): Promise<string>;
  supportedFormats: readonly ['markdown', 'html', 'richtext'];
}

export function createPipeline(): FormatConverter {
  return {
    name: 'CleanPipeline',
    convert: async (text) => text.trim(),
    supportedFormats: ['markdown', 'html', 'richtext'],
  };
}
\`\`\`

### Beneficios Clave
1. **Detección temprana de errores** en tiempo de compilación.
2. **Refactorización sin fricción** con soporte de herramientas IDE.
3. **Autodocumentación** que no queda desactualizada.

Visita [Aitor Hub](https://aitorhub.vercel.app) para explorar más utilidades de productividad web.`,
  },
];
