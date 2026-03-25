import { markRaw } from 'vue';

let pdfViewerPromise;
let docxViewerPromise;
let excelViewerPromise;
let pptxViewerPromise;
let markdownRendererPromise;

const resolveComponent = (module) => markRaw(module.default || module);

export const loadPdfViewer = () => {
  if (!pdfViewerPromise) {
    pdfViewerPromise = import(
      /* webpackChunkName: "reading-pdf-viewer" */
      './pdfViewer.async'
    ).then(resolveComponent);
  }

  return pdfViewerPromise;
};

export const loadDocxViewer = () => {
  if (!docxViewerPromise) {
    docxViewerPromise = import(
      /* webpackChunkName: "reading-docx-viewer" */
      './docxViewer.async'
    ).then(resolveComponent);
  }

  return docxViewerPromise;
};

export const loadExcelViewer = () => {
  if (!excelViewerPromise) {
    excelViewerPromise = import(
      /* webpackChunkName: "reading-excel-viewer" */
      './excelViewer.async'
    ).then(resolveComponent);
  }

  return excelViewerPromise;
};

export const loadPptxViewer = () => {
  if (!pptxViewerPromise) {
    pptxViewerPromise = import(
      /* webpackChunkName: "reading-pptx-viewer" */
      './pptxViewer.async'
    ).then(resolveComponent);
  }

  return pptxViewerPromise;
};

export const loadMarkdownRenderer = () => {
  if (!markdownRendererPromise) {
    markdownRendererPromise = import(
      /* webpackChunkName: "reading-markdown-viewer" */
      './markdownRenderer.async'
    );
  }

  return markdownRendererPromise;
};
