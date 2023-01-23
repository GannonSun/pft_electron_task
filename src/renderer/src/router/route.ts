import { RouteRecordRaw } from 'vue-router'

export const routers: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/signup/index.vue')
  },
  {
    path: '/task',
    component: () => import('../components/Layout.vue'),
    children: [
      {
        path: 'home',
        name: 'task',
        component: () => import('../views/task/index.vue')
      }
    ]
  }
]
