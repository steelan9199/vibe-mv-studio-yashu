import { createRouter, createWebHistory } from 'vue-router';

const ROUTES = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/song/:slug', name: 'song', component: () => import('@/views/SongView.vue') },
  { path: '/assets', name: 'assets', component: () => import('@/views/AssetsView.vue') },
  { path: '/skills', name: 'skills', component: () => import('@/views/SkillsView.vue') },
  { path: '/costs', name: 'costs', component: () => import('@/views/CostsView.vue') },
];

export const router = createRouter({
  history: createWebHistory(),
  routes: ROUTES,
});
