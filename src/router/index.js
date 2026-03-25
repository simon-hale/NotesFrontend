import { createRouter, createWebHistory } from 'vue-router'
import FileDisk from '../views/file/FileDisk.vue'
import ReadingPage from '../views/reading/ReadingPage.vue'

const AccountManagement = () => import(
  /* webpackChunkName: "user-routes" */
  '../views/user/AccountManagement.vue'
)
const RegisterView = () => import(
  /* webpackChunkName: "user-routes" */
  '../views/user/RegisterView.vue'
)
const NotFound = () => import(
  /* webpackChunkName: "not-found" */
  '../views/NotFound.vue'
)

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
