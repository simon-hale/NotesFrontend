import { createRouter, createWebHistory } from 'vue-router'
import AccountManagement from '../views/user/AccountManagement.vue'
import RegisterView from '../views/user/RegisterView.vue'
import NotFound from '../views/NotFound.vue'
import FileDisk from '../views/file/FileDisk.vue'
import ReadingPage from '../views/reading/ReadingPage.vue'

const routes = [
  {
    path: '/',
    name: 'filedisk',
    component: FileDisk,
  },
  {
    path: '/account',
    name: 'accountmanagement',
    component: AccountManagement,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/read',
    name: 'readingpage',
    component: ReadingPage,
  },
  {
    path: '/:catchAll(.*)',
    name: 'notfound',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
