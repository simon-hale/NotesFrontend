import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'vue3-pdf-app/dist/icons/main.css'
import 'github-markdown-css/github-markdown.css'

createApp(App).use(store).use(router).use(i18n).use(ElementPlus).mount('#app')
