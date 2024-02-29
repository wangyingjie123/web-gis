import { createRouter, createWebHashHistory } from 'vue-router';

export const routes = [
  {
    path: '/',
    name: 'home',
    title: '首页',
    component: () => import('@/pages/home-index.vue'),
  },
];

// 3. 创建路由实例并传递 `routes` 配置
export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
