import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../pages/Auth.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/doctypes',
    name: 'doctypes',
    component: () => import('../pages/DocType.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/doctypes/taktec-portal',
    name: 'taktec-doctypes',
    component: () => import('../pages/DocType.vue'),
    meta: { 
      requiresAuth: true,
      portal: 'taktec'
    }
  },
  {
    path: '/doctypes/:id/documents',
    name: 'documents',
    component: () => import('../pages/Documents.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/doctypes/:id/analytics',
    name: 'analytics',
    component: () => import('../pages/Analytics.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth');
  } else {
    next();
  }
});

export default router; 