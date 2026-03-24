<template>
    <div
      ref="readingPageRef"
      :class="['container content-field reading-page', { 'reading-page--navbar-hidden': !show_navbar }]"
      v-show="is_logined"
    >
      <div class="viewer-shell" :style="{ minHeight: content_height }">
        <vue-pdf-app v-show="is_pdf" class="reading-viewer" :pdf="pdf_url" :style="{ height: content_height }" />
        <div class="markdown-body reading-viewer reading-viewer--markdown" v-if="is_markdown" v-html="html" :style="{ height: content_height, overflowY: 'auto' }"></div>
        <vue-office-docx
            class="reading-viewer"
            :src="word_url"
            v-else-if="is_word"
            :style="{ height: content_height }"
        />
        <vue-office-excel
            class="reading-viewer"
            :src="excel_url"
            v-else-if="is_excel"
            :style="{ height: content_height }"
        />
        <vue-office-pptx
            class="reading-viewer"
            :src="ppt_url"
            v-else-if="is_ppt"
            :style="{ height: content_height }"
        />
        <div
          v-if="!has_preview"
          class="empty-state"
          :style="{ minHeight: content_height }"
        >
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-book" viewBox="0 0 16 16">
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.124.606.667-.543 1.795-.74 3.124-.606C11.87 2.06 13.14 2.458 14 2.828V14.5a.5.5 0 0 1-.74.439c-.706-.353-1.789-.73-2.94-.845-1.17-.118-2.232.097-2.706.665a.5.5 0 0 1-.768 0c-.474-.568-1.535-.783-2.706-.665-1.151.116-2.234.492-2.94.845A.5.5 0 0 1 1 14.5z"/>
              <path d="M14 3.101c-.827-.363-2.06-.75-3.291-.874-1.087-.11-2.143.015-2.709.568V14.1c.63-.39 1.524-.523 2.41-.434 1.008.101 2.054.423 2.878.76zm-7 11V2.795c-.566-.553-1.622-.678-2.709-.568C3.06 2.351 1.827 2.738 1 3.1v11.325c.824-.337 1.87-.659 2.878-.76.886-.089 1.78.044 2.41.434"/>
            </svg>
          </div>
          <div class="empty-text">{{ t('reading.emptyState') }}</div>
        </div>
      </div>

      <div ref="toolbarRef" class="reading-toolbar reading-toolbar--footer">
        <div class="reading-title-wrap">
          <div class="reading-title" :title="display_file_name">{{ display_file_name }}</div>
          <span class="file-tip">{{ t('reading.fileTip') }}</span>
        </div>
        <div class="toolbar-actions">
          <el-button
            size="small"
            round
            :icon="Picture"
            :class="['toolbar-button', '!ml-0', { 'toolbar-button--active': imageDialogVisible }]"
            @click="imageDialogVisible = !imageDialogVisible"
          />
          <el-button
            size="small"
            :class="['toolbar-button', { 'toolbar-button--active': isFullscreen }]"
            circle
            :icon="FullScreen"
            :title="fullscreenLabel"
            :aria-label="fullscreenLabel"
            :aria-pressed="isFullscreen"
            @click="toggleFullscreen"
          />
          <el-button size="small" :icon="show_navbar ? ArrowUp : ArrowDown" class="toolbar-button" @click="show_navbar ? unshowNavbar() : showNavbar()" circle />
          <el-button size="small" :icon="RefreshRight" class="toolbar-button" @click="getFileURL" circle />
        </div>
      </div>

      <el-dialog
        v-if="isPageActive"
        class="resizable-dialog"
        v-model="imageDialogVisible"
        :title="t('reading.imageBox')"
        draggable
        :top="dialogTop"
        :width="dialogWidth"
        append-to-body
        :modal="false"
        :overflow="true"
        :close-on-click-modal="false" 
        :close-on-press-escape="true"
        :modal-penetrable="true" 
        :destroy-on-close="true" 
        :z-index="IMAGE_BOX_Z_INDEX"
        @close="handleDialogClose"
        lock-scroll="false"
      >
        <div
          :class="imgUrl ? 'paste-area paste-area--image' : 'paste-area paste-area--empty'"
          :style="imgUrl ? null : emptyBoxStyle"
        >
          <el-empty
            v-if="!imgUrl"
            class="empty-holder"
            :style="emptyBoxStyle"
            :image-size="emptyImageSize"
          >
            <template #description>
              <p class="empty-holder__description" :style="emptyDescriptionStyle">
                {{ t('reading.pasteImageHere') }}
              </p>
            </template>
          </el-empty>
          <div
            v-else
            class="image-stage"
            :style="imageStageStyle"
            @wheel.prevent.stop="changeZoom"
          >
            <img
              :src="imgUrl"
              class="image-box-image"
              :style="imageStageStyle"
              alt=""
              draggable="false"
              @load="onImageLoad"
            >
          </div>
        </div>
      </el-dialog>
    </div>
    <ContentField v-show="!is_logined" class="text-center login-reminder-field">
        <div class="login-reminder-content">
          <div>{{ t('auth.loginFirst') }}</div>
          <el-button class="login-reminder-button" size="large" round @click="go_to_login">{{ t('common.login') }}</el-button>
        </div>
    </ContentField>
</template>

<script>
import ContentField from '@/components/ContentField.vue';
import VuePdfApp from 'vue3-pdf-app';
import MarkdownIt from 'markdown-it';
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import VueOfficeExcel from '@vue-office/excel'
import '@vue-office/excel/lib/index.css'
import VueOfficePptx from '@vue-office/pptx'
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import DOMPurify from 'dompurify';
import { RefreshRight, Picture, ArrowUp, ArrowDown, FullScreen } from '@element-plus/icons-vue'
import { computed, ref, onActivated, onDeactivated, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import $ from 'jquery';
import router from '@/router';
import ElMessage from '@/utils/message';
import { BASE_URL } from "@/config"
import { getCurrentLanguage, getHttpErrorMessage } from '@/utils/http';

export default {
  name: "ReadingPage",
  components: {
    ContentField,
    VuePdfApp,
    VueOfficeDocx,
    VueOfficeExcel,
    VueOfficePptx,
  },
  setup(){
    const store = useStore();
    const { t } = useI18n();
    let is_logined = computed(() => store.state.user.is_logined);
    let file_name = computed(() => store.state.reading.file_name);
    let show_navbar = computed(() => store.state.navbar.show_navbar);
    let is_pdf = ref(false);
    let is_markdown = ref(false);
    let is_word = ref(false);
    let is_excel = ref(false);
    let is_ppt = ref(false);
    let pdf_url = ref('');
    let markdown_url = ref('');
    let word_url = ref('');
    let excel_url = ref('');
    let ppt_url = ref('');
    let file_type = ref('');

    let content_height = ref('60vh');
    let imageDialogVisible = ref(false);
    let readingPageRef = ref(null);
    let toolbarRef = ref(null);
    let isPageActive = ref(false);
    let isFullscreen = ref(false);

    const IMAGE_BOX_Z_INDEX = 3000;

    const has_preview = computed(() => is_pdf.value || is_markdown.value || is_word.value || is_excel.value || is_ppt.value);
    const display_file_name = computed(() => file_name.value || t('reading.emptyState'));
    const fullscreenLabel = computed(() => t(isFullscreen.value ? 'reading.exitFullscreen' : 'reading.enterFullscreen'));

    let toolbarResizeObserver = null;

    const updateContentHeight = () => {
      const pageStyles = readingPageRef.value ? window.getComputedStyle(readingPageRef.value) : null;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const pageTop = readingPageRef.value?.getBoundingClientRect().top ?? 0;
      const toolbarHeight = toolbarRef.value?.offsetHeight ?? 0;
      const paddingTop = pageStyles ? Number.parseFloat(pageStyles.paddingTop) || 0 : 0;
      const paddingBottom = pageStyles ? Number.parseFloat(pageStyles.paddingBottom) || 0 : 0;
      const gap = pageStyles ? Number.parseFloat(pageStyles.rowGap || pageStyles.gap) || 0 : 0;
      const availableHeight = viewportHeight - pageTop - paddingTop - paddingBottom - toolbarHeight - gap - 4;
      const minimumHeight = window.innerWidth <= 480 ? 200 : window.innerWidth <= 768 ? 220 : 300;
      content_height.value = `${Math.max(minimumHeight, Math.floor(availableHeight))}px`;
    }

    const scheduleContentHeightUpdate = () => {
      nextTick(() => {
        window.requestAnimationFrame(() => {
          updateContentHeight();
        });
      });
    }

    const bindToolbarResize = () => {
      if (typeof ResizeObserver === 'undefined' || !toolbarRef.value) return;
      toolbarResizeObserver?.disconnect();
      toolbarResizeObserver = new ResizeObserver(() => updateContentHeight());
      toolbarResizeObserver.observe(toolbarRef.value);
    }

    const unbindToolbarResize = () => {
      if (!toolbarResizeObserver) return;
      toolbarResizeObserver.disconnect();
      toolbarResizeObserver = null;
    }

    const scheduleImageBoxUpdate = () => {
      nextTick(() => {
        window.requestAnimationFrame(() => {
          reshapeImageBox();
        });
      });
    }

    const getInitialImageBoxSide = () => {
      if (typeof window === 'undefined') return 240;

      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      return Math.max(1, Math.floor(Math.min(viewportWidth, viewportHeight) / 4));
    }

    const updateInitialImageBoxSize = () => {
      initialImageBoxSide.value = getInitialImageBoxSide();
    }

    const handleViewportChange = () => {
      updateInitialImageBoxSize();
      scheduleContentHeightUpdate();
      if (imageDialogVisible.value && imgUrl.value) {
        scheduleImageBoxUpdate();
      }
    }

    const getFullscreenElement = () => {
      if (typeof document === 'undefined') return null;
      return document.fullscreenElement || document.webkitFullscreenElement || null;
    }

    const syncFullscreenState = () => {
      isFullscreen.value = Boolean(getFullscreenElement());
      scheduleContentHeightUpdate();
    }

    const requestDocumentFullscreen = async () => {
      if (typeof document === 'undefined') return false;

      const root = document.documentElement;
      if (root.requestFullscreen) {
        await root.requestFullscreen();
        return true;
      }

      if (root.webkitRequestFullscreen) {
        await root.webkitRequestFullscreen();
        return true;
      }

      return false;
    }

    const exitDocumentFullscreen = async () => {
      if (typeof document === 'undefined') return false;

      if (document.exitFullscreen) {
        await document.exitFullscreen();
        return true;
      }

      if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
        return true;
      }

      return false;
    }

    const toggleFullscreen = async () => {
      try {
        const success = getFullscreenElement()
          ? await exitDocumentFullscreen()
          : await requestDocumentFullscreen();

        if (!success) {
          ElMessage.error(t('reading.fullscreenFailed'));
          return;
        }

        syncFullscreenState();
      } catch {
        ElMessage.error(t('reading.fullscreenFailed'));
      }
    }

    const exitFullscreenIfActive = async () => {
      if (!getFullscreenElement()) {
        isFullscreen.value = false;
        return;
      }

      try {
        await exitDocumentFullscreen();
      } finally {
        isFullscreen.value = false;
        scheduleContentHeightUpdate();
      }
    }

    onActivated(() => {
      isPageActive.value = true;
      updateInitialImageBoxSize();
      document.addEventListener('paste', handlePaste);
      document.addEventListener('fullscreenchange', syncFullscreenState);
      document.addEventListener('webkitfullscreenchange', syncFullscreenState);
      window.addEventListener('resize', handleViewportChange);
      window.addEventListener('orientationchange', handleViewportChange);
      bindToolbarResize();
      syncFullscreenState();
      scheduleContentHeightUpdate();
    })

    onDeactivated(() => {
      isPageActive.value = false;
      imageDialogVisible.value = false;
      handleDialogClose();
      showNavbar();
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('fullscreenchange', syncFullscreenState);
      document.removeEventListener('webkitfullscreenchange', syncFullscreenState);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      unbindToolbarResize();
      exitFullscreenIfActive();
    })

    onBeforeUnmount(() => {
      isPageActive.value = false;
      imageDialogVisible.value = false;
      handleDialogClose();
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('fullscreenchange', syncFullscreenState);
      document.removeEventListener('webkitfullscreenchange', syncFullscreenState);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      unbindToolbarResize();
      exitFullscreenIfActive();
    })

    const showNavbar = () => {
      store.commit("showNavbar");
      scheduleContentHeightUpdate();
    }

    const unshowNavbar = () => {
      store.commit("unshowNavbar");
      scheduleContentHeightUpdate();
    }

    const go_to_login = () => {
      router.push({name: 'accountmanagement'});
    }

    const resetPreviewFlags = () => {
      is_pdf.value = false;
      is_markdown.value = false;
      is_word.value = false;
      is_excel.value = false;
      is_ppt.value = false;
    }

    const imgUrl = ref('');

    const handlePaste = (e) => {  
      if (imgUrl.value) URL.revokeObjectURL(imgUrl.value);  
      imageBoxWidth.value = 0;
      imageBoxHeight.value = 0;
      imageRef.value = null;
      const items = e.clipboardData?.items;

      if (!items) return;

      if (items.length > 1) {
        ElMessage.error(t('reading.onlyOne'));
        return;
      }

      const [item] = items;
      if (!item.type.startsWith('image/')) {
        ElMessage.error(t('reading.onlyImage'))
        return
      }

      const blob = item.getAsFile();
      imgUrl.value = URL.createObjectURL(blob);
      e.preventDefault();

    }

    const handleDialogClose = () => {
      if (imgUrl.value) URL.revokeObjectURL(imgUrl.value);  
      imgUrl.value = '';
      zoom.value = DEFAULT_ZOOM;
      dialogWidth.value = DEFAULT_DIALOG_WIDTH;
      dialogTop.value = DEFAULT_DIALOG_TOP;
      imageBoxWidth.value = 0;
      imageBoxHeight.value = 0;
      imageRef.value = null
    }

    let imageRef = ref(null);
    const DEFAULT_DIALOG_WIDTH = 'fit-content';
    const DEFAULT_DIALOG_TOP = '35vh';
    const DEFAULT_ZOOM = 0.5;
    const MIN_ZOOM = 0.2;
    const MAX_ZOOM = 1;
    const ZOOM_STEP = 0.1;
    const IMAGE_STAGE_MAX_WIDTH_RATIO = 0.9;
    const IMAGE_STAGE_MAX_HEIGHT_RATIO = 0.8;
    let dialogWidth = ref(DEFAULT_DIALOG_WIDTH);
    let dialogTop = ref(DEFAULT_DIALOG_TOP);
    let zoom = ref(DEFAULT_ZOOM);
    let initialImageBoxSide = ref(getInitialImageBoxSide());
    let imageBoxWidth = ref(0);
    let imageBoxHeight = ref(0);
    const emptyImageSize = computed(() => Math.max(28, Math.round(initialImageBoxSide.value * 0.38)));

    const emptyBoxStyle = computed(() => {
      const side = initialImageBoxSide.value;
      return {
        width: `${side}px`,
        height: `${side}px`,
        '--empty-holder-padding': `${Math.max(8, Math.round(side * 0.08))}px`,
      };
    });

    const emptyDescriptionStyle = computed(() => {
      const side = initialImageBoxSide.value;
      return {
        fontSize: `${Math.max(10, Math.round(side * 0.08))}px`,
        lineHeight: side <= 120 ? '1.25' : '1.35',
      };
    });

    const imageStageStyle = computed(() => {
      if (!imageBoxWidth.value || !imageBoxHeight.value) return {};

      return {
        width: `${imageBoxWidth.value}px`,
        height: `${imageBoxHeight.value}px`,
      };
    });

    function changeZoom (e) {
      if (!imageRef.value) return;

      e.preventDefault();
      e.stopPropagation();

      const step = Math.sign(e.deltaY);
      if (!step) return;

      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((zoom.value - step * ZOOM_STEP).toFixed(2))));
      if (nextZoom === zoom.value) return;

      zoom.value = nextZoom;
      reshapeImageBox();
    }

    function onImageLoad(e) {
      imageRef.value = e.target;
      zoom.value = DEFAULT_ZOOM;
      reshapeImageBox();
    }

    const reshapeImageBox = () => {
      if (!imageRef.value) return;

      const naturalWidth = imageRef.value.naturalWidth;
      const naturalHeight = imageRef.value.naturalHeight;
      if (!naturalWidth || !naturalHeight) return;

      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || naturalWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || naturalHeight;
      const maxWidth = viewportWidth * IMAGE_STAGE_MAX_WIDTH_RATIO * zoom.value;
      const maxHeight = viewportHeight * IMAGE_STAGE_MAX_HEIGHT_RATIO * zoom.value;
      const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);

      imageBoxWidth.value = Math.max(1, Math.round(naturalWidth * scale));
      imageBoxHeight.value = Math.max(1, Math.round(naturalHeight * scale));
      dialogWidth.value = `${imageBoxWidth.value}px`;
    }
    
    const getFileURL = () => {
      $.ajax({
        url: `${BASE_URL}/api/file/url/`,
        type: "POST",
        headers: {
            Authorization:"Bearer " + store.state.user.access,
        },
        data: {
          id: store.state.reading.file_id,
          username: store.state.user.username,
          language: getCurrentLanguage(),
        },
        success(resp){
            if(resp.error_message !== 'success'){
              ElMessage({
                message: resp.error_message,
                type: 'error',
              })
            }else{
              file_type.value = resp.type;
              resetPreviewFlags();
              if (file_type.value === 'pdf') {
                pdf_url.value = resp.url;
                is_pdf.value = true;
              }else if (file_type.value === 'md') {
                markdown_url.value = resp.url;
                is_markdown.value = true;
                refreshMarkdown();
              }else if (file_type.value === 'docx') {
                word_url.value = resp.url;
                is_word.value = true;
              }else if (file_type.value === 'xlsx' || file_type.value === 'xls') {
                excel_url.value = resp.url;
                is_excel.value = true;
              }else if (file_type.value === 'pptx') {
                ppt_url.value = resp.url;
                is_ppt.value = true;
              }else{
                ElMessage({
                  message: t('reading.unsupportedFileType'),
                  type: 'error',
                })
              }
              scheduleContentHeightUpdate();
            }
        },
        error(resp) {
          ElMessage({
            message: getHttpErrorMessage(t, resp.status),
            type: 'error',
          })
        }
     })
    }

    const md = new MarkdownIt({
      html: true,
      linkify: true,
      breaks: true,
      highlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return `<pre class="hljs"><code>${
              hljs.highlight(code, { language: lang }).value
            }</code></pre>`
          } catch (__) {
            // Fall back to auto highlighting below.
          }
        }
        return `<pre class="hljs"><code>${
          hljs.highlightAuto(code).value
        }</code></pre>`
      }
    })

    md.use(texmath, {
      engine: katex,
      delimiters: 'dollars',
    })

    let html = ref('loading...');

    const refreshMarkdown = async () => {
      try {
        const resp = await fetch(markdown_url.value)
        const text = await resp.text()

        html.value = DOMPurify.sanitize(md.render(text), {
          ADD_TAGS: ['math', 'annotation', 'semantics', 'mrow', 'mi', 'mo', 'mn'],
          ADD_ATTR: ['class', 'style']
        })
      } catch (e) {
        html.value = t('reading.markdownLoadFailed')
      }
    }

    return{
      t,
      RefreshRight,
      Picture,
      ArrowUp,
      ArrowDown,
      FullScreen,
      is_logined,
      is_pdf,
      is_markdown,
      is_word,
      is_excel,
      is_ppt,
      pdf_url,
      word_url,
      excel_url,
      ppt_url,
      show_navbar,
      content_height,
      imageDialogVisible,
      readingPageRef,
      toolbarRef,
      isPageActive,
      isFullscreen,
      IMAGE_BOX_Z_INDEX,
      has_preview,
      display_file_name,
      fullscreenLabel,
      showNavbar,
      unshowNavbar,
      toggleFullscreen,
      go_to_login,
      handleDialogClose,
      dialogWidth,
      dialogTop,
      changeZoom,
      onImageLoad,
      emptyBoxStyle,
      emptyImageSize,
      emptyDescriptionStyle,
      imageStageStyle,
      imgUrl,
      getFileURL,
      html,
    }
  }
}
</script>

<style scoped>
div.content-field.reading-page {
  margin-top: 4px;
  padding: 6px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--border-soft);
  border-radius: 18px;
  background: var(--content-panel-bg);
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
}

div.content-field.reading-page.reading-page--navbar-hidden {
  margin-top: 0;
}

div.content-field.login-reminder-field {
  margin-top: 20px;
}

.login-reminder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

div.content-field.login-reminder-field :deep(.card) {
  width: min(100%, 28rem);
  margin: 0 auto;
}

:deep(.login-reminder-button.el-button) {
  min-width: 7.5rem;
  max-width: 100%;
  min-height: 2.45rem;
  padding: 0 1.05rem;
  border-width: 1px;
  border-color: color-mix(in srgb, var(--border-accent) 72%, var(--border-soft));
  border-radius: 999px;
  background: linear-gradient(180deg, var(--surface-card-strong) 0%, var(--surface-accent-strong) 100%);
  color: var(--accent-strong);
  font-size: 0.94rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--accent-soft) 60%, transparent);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

:deep(.login-reminder-button.el-button:focus),
:deep(.login-reminder-button.el-button:focus-visible) {
  border-color: var(--border-accent);
  background: linear-gradient(180deg, var(--surface-card-strong) 0%, var(--surface-accent-strong) 100%);
  color: var(--accent-strong);
}

:deep(.login-reminder-button.el-button:focus:active),
:deep(.login-reminder-button.el-button:focus-visible:active) {
  transform: translateY(1px);
  background: linear-gradient(180deg, var(--surface-soft-hover) 0%, var(--surface-accent-strong) 100%);
  box-shadow: 0 6px 14px color-mix(in srgb, var(--accent-soft) 55%, transparent);
}

.reading-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  background: var(--reading-toolbar-bg);
}

.reading-toolbar--footer {
  margin-top: -2px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.toolbar-button {
  margin-left: 0 !important;
  --el-button-bg-color: color-mix(in srgb, var(--reading-toolbar-bg) 92%, transparent);
  --el-button-border-color: var(--border-soft);
  --el-button-text-color: var(--text-secondary);
  --el-button-hover-bg-color: var(--surface-soft-hover);
  --el-button-hover-border-color: var(--border-accent);
  --el-button-hover-text-color: var(--text-accent);
  --el-button-active-bg-color: var(--surface-accent-strong);
  --el-button-active-border-color: var(--border-accent);
  --el-button-active-text-color: var(--accent-strong);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 72%, transparent);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease,
    background-color 0.16s ease,
    color 0.16s ease;
}

.toolbar-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-accent);
}

.toolbar-button:focus-visible {
  box-shadow:
    0 0 0 3px var(--accent-soft),
    var(--shadow-accent);
}

.toolbar-button--active {
  --el-button-bg-color: var(--surface-accent-strong);
  --el-button-border-color: var(--border-accent);
  --el-button-text-color: var(--accent-strong);
  --el-button-hover-bg-color: var(--surface-accent-strong);
  --el-button-hover-border-color: var(--border-accent);
  --el-button-hover-text-color: var(--accent-strong);
  --el-button-active-bg-color: var(--surface-accent-strong);
  --el-button-active-border-color: var(--border-accent);
  --el-button-active-text-color: var(--accent-strong);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--surface-card-strong) 70%, transparent),
    var(--shadow-accent);
}

.toolbar-button--active:hover,
.toolbar-button--active:focus-visible {
  transform: translateY(-1px);
}

.reading-title-wrap {
  min-width: 0;
  flex: 1 1 18rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.reading-title {
  min-width: 0;
  flex: 1 1 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.file-tip {
  flex-shrink: 0;
  padding: 0.15rem 0.55rem;
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  background: var(--surface-card-muted);
  color: var(--text-muted);
  font-size: 0.76rem;
  white-space: nowrap;
}

.viewer-shell {
  overflow: hidden;
  border: 1px solid var(--border-muted);
  border-radius: 16px;
  background: var(--reading-viewer-bg);
}

.reading-viewer {
  display: block;
  width: 100%;
}

.reading-viewer--markdown {
  padding: 14px clamp(14px, 4vw, 28px);
  background: var(--reading-markdown-bg);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 24px;
  text-align: center;
  background: var(--reading-empty-bg);
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--surface-soft);
  color: var(--text-muted);
}

.empty-text {
  font-size: 15px;
  color: var(--text-secondary);
  letter-spacing: 0.2px;
}

.resizable-dialog {
  max-width: 90vw;
}

.resizable-dialog .el-dialog__body {
  padding: 0 !important;
}

.paste-area {
  display: flex;
  justify-content: center;
  align-items: center;
}

.paste-area--empty {
  min-height: 0;
}

.paste-area--image {
  line-height: 0;
}

.image-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  overscroll-behavior: contain;
}

.image-box-image {
  display: block;
  max-width: none;
  max-height: none;
  object-fit: contain;
  user-select: none;
}

.empty-holder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.empty-holder .el-empty) {
  width: 100%;
  height: 100%;
  padding: var(--empty-holder-padding);
  box-sizing: border-box;
}

:deep(.empty-holder .el-empty__image) {
  margin-bottom: clamp(6px, 3%, 12px);
}

:deep(.empty-holder .el-empty__description) {
  margin-top: 0;
}

.empty-holder__description {
  margin: 0;
  color: var(--text-muted);
  text-align: center;
  overflow-wrap: anywhere;
  word-break: break-word;
}

@media (max-width: 768px) {
  div.content-field.login-reminder-field :deep(.card) {
    width: min(100%, 32rem);
  }

  div.content-field.reading-page {
    padding: 6px;
  }

  .reading-toolbar {
    padding: 7px 8px;
    flex-wrap: nowrap;
  }

  .toolbar-actions {
    flex-wrap: nowrap;
    gap: 4px;
  }

  .reading-title-wrap {
    flex: 1 1 auto;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0;
  }

  .reading-title {
    flex: 1 1 auto;
    font-size: 0.9rem;
  }

  .file-tip {
    font-size: 0.74rem;
    display: none;
  }
}

@media (max-width: 480px) {
  :deep(.login-reminder-button.el-button) {
    width: 100%;
  }

  .toolbar-actions {
    justify-content: flex-end;
  }

  .reading-toolbar {
    padding: 6px 7px;
    gap: 6px;
  }

  .toolbar-button {
    transform: scale(0.94);
    transform-origin: center;
  }

  .paste-area {
    min-height: min(50vh, 24rem);
  }
}
</style>
