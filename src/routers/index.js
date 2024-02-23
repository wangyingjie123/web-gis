import { createRouter, createWebHashHistory } from 'vue-router';

export const routes = [
  {
    path: '/',
    component: () => import('@/pages/openlayers/index.vue'),
  },
  {
    path: '/maplibre',
    component: () => import('@/pages/maplibre/index.vue'),
  },
];

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
