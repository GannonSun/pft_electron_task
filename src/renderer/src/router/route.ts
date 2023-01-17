import { RouteRecordRaw } from 'vue-router'

export const routers: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/task'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/task',
    name: 'task',
    component: () => import('../views/task/index.vue')
  }
]
