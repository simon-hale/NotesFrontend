<template>
    <div class="container content-field" v-show="is_logined" style="margin-top: 10px;">
      <vue-pdf-app v-show="is_pdf" :pdf="pdf_url" :style="{ height: content_height }"  @mouseup="handleSelect"/>
      <div class="markdown-body" v-if="is_markdown" v-html="html" :style="{ height: content_height, overflowY: 'auto' }" @mouseup="handleSelect"></div>
      <vue-office-docx
          :src="word_url"
          v-else-if="is_word"
          :style="{ height: content_height }"
      />
      <vue-office-excel
          :src="excel_url"
          v-else-if="is_excel"
          :style="{ height: content_height }"
      />
      <vue-office-pptx
          :src="ppt_url"
          v-else-if="is_ppt"
          :style="{ height: content_height }"
      />
      <div
        v-if="!is_pdf && !is_markdown && !is_word && !is_excel && !is_ppt"
        class="empty-state"
      >
        <div class="empty-icon">📄</div>
        <div class="empty-text">Select a file to start reading</div>
      </div>
      <div class="text-center title-card title-wrapper">
        <el-button round :icon="Picture" class="!ml-0 image-dialog" v-if="imageDialogVisible === false" @click="imageDialogVisible = true"/>
        <el-button round :icon="PictureFilled" class="!ml-0 image-dialog" v-else @click="imageDialogVisible = false"/>
        <el-button :icon="ArrowUp" v-if="show_navbar" @click="unshowNavbar" style="margin-right: 10px;" circle />
        <el-button :icon="ArrowDown" v-if="!show_navbar" @click="showNavbar" style="margin-right: 10px;" circle />
        {{ file_name }}
        <el-button :icon="RefreshRight" @click="getFileURL" circle />
        <span class="file-tip">PDF, Office and Markdown only.</span>
      </div>
      
      <el-dialog class="resizable-dialog" v-model="imageDialogVisible" 
        title="Image Box"
        draggable
        :top="dialogTop"
        :width="dialogWidth"
        :modal="false"
        :overflow="true"
        :close-on-click-modal="false" 
        :close-on-press-escape="true"
        :modal-penetrable="true" 
        :destroy-on-close="true" 
        @close="handleDialogClose"
        lock-scroll="false">
        <div class="paste-area">
          <el-empty v-if="!imgUrl" class="empty-holder" description="Paste Image Here." />
          <el-image
            v-else
            :src="imgUrl"
            fit="contain"
            style="max-width: 90vw; max-height: 80vh; display: block"
            :hide-on-click-modal="true"
            :close-on-press-escape="true"
            :zoom-rate="1.1"
            :scale="1"
            :min-scale="0.2"
            :max-scale="2"
            @load="onImageLoad"
            @wheel="changeZoom"
            lazy
          />
        </div>
      </el-dialog>
    </div>
    <ContentField v-show="!is_logined" class="text-center">
        Please login first.
        <div><el-button type="primary" round @click="go_to_login" style="margin-top: 10px;">Login</el-button></div>
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
import { ElMessage } from 'element-plus';
import { RefreshRight, Picture, PictureFilled, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { computed, ref, onActivated, onDeactivated } from 'vue';
import { useStore } from 'vuex';
import $ from 'jquery';
import router from '@/router';
import { BASE_URL } from "@/config"

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

    const SHOW_NAVBER_CONTENT_HEIGHT = '85vh';
    const UNSHOW_NAVBER_CONTENT_HEIGHT = '92vh';
    let content_height = ref(SHOW_NAVBER_CONTENT_HEIGHT);

    let imageDialogVisible = ref(false);
    
    onActivated(() => {
      document.addEventListener('paste', handlePaste);
    })

    onDeactivated(() => {
      showNavbar();
      document.removeEventListener('paste', handlePaste);
    })

    const showNavbar = () => {
      store.commit("showNavbar");
      content_height.value = SHOW_NAVBER_CONTENT_HEIGHT;
    }

    const unshowNavbar = () => {
      store.commit("unshowNavbar");
      content_height.value = UNSHOW_NAVBER_CONTENT_HEIGHT;
    }

    const go_to_login = () => {
      router.push({name: 'accountmanagement'});
    }

    const imgUrl = ref('');

    const handlePaste = (e) => {  
      if (imgUrl.value) URL.revokeObjectURL(imgUrl.value);  
      const items = e.clipboardData?.items;

      if (!items) return;

      if (items.length > 1) {
        ElMessage.error('Only One!');
        return;
      }

      const [item] = items;
      if (!item.type.startsWith('image/')) {
        ElMessage.error('Only Image!')
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
      imageRef.value = null
    }

    let imageRef = ref(null);
    const DEFAULT_DIALOG_WIDTH = 'fit-content';
    const DEFAULT_DIALOG_TOP = '35vh';
    const DEFAULT_ZOOM = 0.5;
    let dialogWidth = ref(DEFAULT_DIALOG_WIDTH);
    let dialogTop = ref(DEFAULT_DIALOG_TOP);
    let zoom = ref(DEFAULT_ZOOM);  

    function changeZoom (e) {
      if (!imageRef.value) return;

      const step = Math.sign(e.deltaY); // -1 上，+1 下
      const nextZoom = zoom.value - step * 0.1;
      if (nextZoom >= 0.2 && nextZoom <= 1) {
        zoom.value = nextZoom;
        reshapeImageBox();
      }
    }

    function onImageLoad(e) {
      imageRef.value = e.target;
      zoom.value = DEFAULT_ZOOM;
      reshapeImageBox();
    }

    const reshapeImageBox = () => {
      if (!imageRef.value) return;

      const maxW = window.innerWidth * zoom.value;
      const w = Math.min(imageRef.value.naturalWidth, maxW);
      dialogWidth.value = `${w}px`;
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
        },
        success(resp){
            if(resp.error_message !== 'success'){
              ElMessage({
                message: resp.error_message,
                type: 'error',
              })
            }else{
              file_type.value = resp.type;
              if (file_type.value === 'pdf') {
                pdf_url.value = resp.url;
                is_markdown.value = false;
                is_word.value = false;
                is_excel.value = false;
                is_ppt.value = false;
                is_pdf.value = true;
              }else if (file_type.value === 'md') {
                markdown_url.value = resp.url;
                is_pdf.value = false;
                is_word.value = false;
                is_excel.value = false;
                is_ppt.value = false;
                is_markdown.value = true;
                refreshMarkdown();
              }else if (file_type.value === 'docx') {
                word_url.value = resp.url;
                is_markdown.value = false;
                is_pdf.value = false;
                is_excel.value = false;
                is_ppt.value = false;
                is_word.value = true;
              }else if (file_type.value === 'xlsx' || file_type.value === 'xls') {
                excel_url.value = resp.url;
                is_markdown.value = false;
                is_pdf.value = false;
                is_word.value = false;
                is_ppt.value = false;
                is_excel.value = true;
              }else if (file_type.value === 'pptx') {
                ppt_url.value = resp.url;
                is_markdown.value = false;
                is_pdf.value = false;
                is_word.value = false;
                is_excel.value = false;
                is_ppt.value = true;
              }else{
                ElMessage({
                  message: 'File type doesn\'t be supported.',
                  type: 'error',
                })
              }
            }
        },
        error() {
          ElMessage({
            message: 'Network error...',
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
            // ignore highlight error, fallback to auto
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
        html.value = '❌ Markdown failed to load.'
      }
    }

    const selectedText = ref('')

    const handleSelect = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || sel.type !== 'Range') return

      const range = sel.getRangeAt(0)
      let node = range.commonAncestorContainer

      // text node → element
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode
      }

      // 只允许 PDF 或 markdown
      const inPdf = node.closest('.textLayer')   // pdf.js
      const inMarkdown = node.closest('.markdown-body')

      if (!inPdf && !inMarkdown) return

      const text = normalizeText(sel.toString())
      if (text.length > 0) {
        selectedText.value = text
      }
    }

    const normalizeText = (text) => {
      return text
        .replace(/\s+/g, ' ')
        .replace(/([a-zA-Z])\s+([a-zA-Z])/g, '$1$2')
        .trim()
    }

    // const selectedTextTranslate = ref('');

    return{
      RefreshRight,
      Picture,
      PictureFilled,
      ArrowUp,
      ArrowDown,
      is_logined,
      is_pdf,
      is_markdown,
      is_word,
      is_excel,
      is_ppt,
      pdf_url,
      markdown_url,
      word_url,
      excel_url,
      ppt_url,
      file_name,
      file_type,
      show_navbar,
      content_height,
      imageDialogVisible,
      showNavbar,
      unshowNavbar,
      go_to_login,
      handlePaste,
      handleDialogClose,
      dialogWidth,
      dialogTop,
      changeZoom,
      onImageLoad,
      imgUrl,
      getFileURL,
      html,
      refreshMarkdown,
      selectedText,
      handleSelect,
    }
  }
}
</script>

<style scoped>
.empty-state {
  margin: 15px 0;
  padding: 40px 24px;
  text-align: center;

  background: #ffffff;
  border-radius: 14px;

  /* box-shadow: 0 5px 3px rgba(0, 0, 0, 0.03); */
  transition: background-color 0.2s ease;
}

.empty-state:hover {
  background: #f9f9f9;
}

.empty-icon {
  font-size: 34px;
  margin-bottom: 14px;
  opacity: 0.75;                    /* 提亮一点 */
}

.empty-text {
  font-size: 15px;
  color: #495057;                   /* 从 muted 灰 → 可读灰 */
  letter-spacing: 0.2px;
}

div.title-card {
  margin-top: 10px;
}

.title-wrapper {
  position: relative;     /* 给右侧文字一个定位参照 */
}

.image-dialog {
  position: absolute;
  left: 0;               /* 固定在这一行最右 */
  top: 50%;
  transform: translateY(-50%); /* 垂直居中 */
}

.file-tip {
  position: absolute;
  right: 0;               /* 固定在这一行最右 */
  top: 50%;
  transform: translateY(-50%); /* 垂直居中 */
  
  font-size: 0.8em;
  color: #999;
  white-space: nowrap;
}

/* dialog 本体：允许随内容收缩 */
.resizable-dialog {
  width: fit-content !important;
  max-width: 90vw;
}

/* 干掉 body padding */
.resizable-dialog .el-dialog__body {
  padding: 0 !important;
}

/* 内容居中 */
.paste-area {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 空状态固定尺寸，防止撑满 */
.empty-holder {
  width: 320px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>