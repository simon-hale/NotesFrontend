import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap";
// import ElementPlus from 'element-plus'
import {
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  ElCheckbox,
  ElDialog,
  ElDrawer,
  ElEmpty,
  ElIcon,
  ElInput,
  ElProgress,
  ElUpload,
} from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/theme.css'
import { applyThemeToDocument, getStoredTheme } from './utils/theme'

applyThemeToDocument(getStoredTheme())

// createApp(App).use(store).use(router).use(i18n).use(ElementPlus).mount('#app')

const app = createApp(App)

app.use(store)
app.use(router)
app.use(i18n)

app.component(ElBreadcrumb.name, ElBreadcrumb)
app.component(ElBreadcrumbItem.name, ElBreadcrumbItem)
app.component(ElButton.name, ElButton)
app.component(ElCheckbox.name, ElCheckbox)
app.component(ElDialog.name, ElDialog)
app.component(ElDrawer.name, ElDrawer)
app.component(ElEmpty.name, ElEmpty)
app.component(ElIcon.name, ElIcon)
app.component(ElInput.name, ElInput)
app.component(ElProgress.name, ElProgress)
app.component(ElUpload.name, ElUpload)

app.mount('#app')
