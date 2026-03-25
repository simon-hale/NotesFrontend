import 'github-markdown-css/github-markdown.css';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import MarkdownIt from 'markdown-it';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(code, { language: lang }).value
        }</code></pre>`;
      } catch (__) {
        // Fall back to auto highlighting below.
      }
    }

    return `<pre class="hljs"><code>${
      hljs.highlightAuto(code).value
    }</code></pre>`;
  },
});

md.use(texmath, {
  engine: katex,
  delimiters: 'dollars',
});

export const renderMarkdown = (text) => DOMPurify.sanitize(md.render(text), {
  ADD_TAGS: ['math', 'annotation', 'semantics', 'mrow', 'mi', 'mo', 'mn'],
  ADD_ATTR: ['class', 'style'],
});
