import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Auth from './pages/Auth.vue'
import Users from './pages/Users.vue'
import Companies from './pages/Companies.vue'
import Roles from './pages/Roles.vue'
import Forms from './pages/Forms.vue'
import PublicFormSubmit from './pages/PublicFormSubmit.vue'
import Tags from './pages/Tags.vue'
import Categories from './pages/Categories.vue'
import Content from './pages/Content.vue'
import Documents from './pages/Documents.vue'
import EmployeeFeedbackRecords from './pages/EmployeeFeedbackRecords.vue'
import Policies from './pages/Policies.vue'
import Records from './pages/Records.vue'
import Templates from './pages/Templates.vue'
import Videos from './pages/Videos.vue'
import DocType from './pages/DocType.vue'
import DocTypeSubmissions from './pages/DocTypeSubmissions.vue'
import DocTypeForm from './pages/DocTypeForm.vue'
import DocTypeDocumentEdit from './pages/DocTypeDocumentEdit.vue'
import DocTypeImages from './pages/DocTypeImages.vue'
import VoiceAssistant from './views/VoiceAssistant.vue'
import ApiTester from './pages/ApiTester.vue'
import { useAuthStore } from './stores/auth'
import { useErrorStore } from './stores/error'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'auth',
    component: Auth,
    meta: { requiresAuth: false }
  },
  {
    path: '/oauth-callback',
    name: 'oauth-callback',
    component: () => import('./pages/OAuthCallback.vue'),
    meta: { 
      requiresAuth: false,
      isOAuthCallback: true
    }
  },
  {
    path: '/users',
    name: 'users',
    component: Users,
    meta: { requiresAuth: true }
  },
  {
    path: '/companies',
    name: 'companies',
    component: Companies,
    meta: { requiresAuth: true }
  },
  {
    path: '/roles',
    name: 'roles',
    component: Roles,
    meta: { requiresAuth: true }
  },
  {
    path: '/documents',
    name: 'documents',
    component: Documents,
    meta: { requiresAuth: true }
  },
  {
    path: '/forms',
    name: 'forms',
    component: Forms,
    meta: { requiresAuth: true }
  },
  {
    path: '/voice-assistant',
    name: 'voice-assistant',
    component: VoiceAssistant,
    meta: { 
      requiresAuth: true,
      requiredRoles: ['Dizza', 'Admin', 'Manager']
    }
  },
  {
    path: '/policies',
    name: 'policies',
    component: Policies,
    meta: { requiresAuth: true }
  },
  {
    path: '/records',
    name: 'records',
    component: Records,
    meta: { requiresAuth: true }
  },
  {
    path: '/templates',
    name: 'templates',
    component: Templates,
    meta: { requiresAuth: true }
  },
  {
    path: '/videos',
    name: 'videos',
    component: Videos,
    meta: { requiresAuth: true }
  },
  {
    path: '/documents',
    name: 'documents',
    component: DocType,
    meta: { 
      requiresAuth: true,
      // requiredRoles: ['Taktec User', 'Taktec Admin', 'System Manager', 'Technician']
    }
  },
  {
    path: '/documents/taktec-portal',
    name: 'taktec-documents',
    component: DocType,
    meta: { 
      requiresAuth: true,
      // requiredRoles: ['Taktec User', 'Taktec Admin', 'System Manager', 'Technician'],
      portal: 'taktec'
    }
  },
  {
    path: '/documents/:id',
    name: 'document-submissions',
    component: DocTypeSubmissions,
    meta: { 
      requiresAuth: true,
      // requiredRoles: ['Taktec User', 'Taktec Admin', 'System Manager', 'Technician']
    }
  },
  {
    path: '/documents/:id/new',
    name: 'document-form',
    component: DocTypeForm,
    meta: { 
      requiresAuth: true,
      // requiredRoles: ['Taktec User', 'Taktec Admin', 'System Manager', 'Technician']
    }
  },
  {
    path: '/documents/:id/:documentId/edit',
    name: 'document-document-edit',
    component: DocTypeDocumentEdit,
    meta: { 
      requiresAuth: true,
      // requiredRoles: ['Taktec User', 'Taktec Admin', 'System Manager', 'Technician']
    }
  },
  {
    path: '/documents/:id/:documentId/images',
    name: 'document-images',
    component: DocTypeImages,
    meta: { 
      requiresAuth: true,
      // requiredRoles: ['Taktec User', 'Taktec Admin', 'System Manager', 'Technician']
    }
  },
  {
    path: '/documents/:id/:documentId/image/:fieldname',
    name: 'document-single-image',
    component: () => import('./pages/DocTypeSingleImage.vue'),
    meta: { 
      requiresAuth: true,
      // requiredRoles: ['Taktec User', 'Taktec Admin', 'System Manager', 'Technician' ]
    }
  },
  {
    path: '/forms/:id/submissions',
    name: 'form-submissions',
    component: () => import('./pages/FormSubmissions.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forms/:formId/submissions/:submissionId/edit',
    name: 'form-submission-edit',
    component: () => import('./pages/FormSubmissionEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forms/:id/submit',
    name: 'form-submit',
    component: () => import('./pages/FormSubmit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forms/:id/new',
    name: 'form-new',
    component: () => import('./pages/FormNew.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/public/forms/:id',
    name: 'public-form-submit',
    component: PublicFormSubmit,
    meta: { requiresAuth: false }
  },
  {
    path: '/tags',
    name: 'tags',
    component: Tags,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'categories',
    component: Categories,
    meta: { requiresAuth: true }
  },
  {
    path: '/content',
    name: 'content',
    component: Content,
    meta: { requiresAuth: true }
  },
  {
    path: '/feedback-records',
    name: 'feedback-records',
    component: EmployeeFeedbackRecords,
    meta: { requiresAuth: true }
  },
  {
    path: '/api-tester',
    name: 'api-tester',
    component: ApiTester,
    meta: { 
      requiresAuth: true,
      requiredRoles: ['Admin', 'Developer','System Manager', 'Taktec User', 'Taktec Admin']
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
})

// Add debug logging
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const errorStore = useErrorStore()

  // Always allow OAuth callback
  if (to.path === '/oauth-callback') {
    next();
    return;
  }

  // Initialize auth state if not already initialized
  if (!authStore.isInitialized) {
    await authStore.initialize();
  }

  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      const message = 'Please log in to access this page';
      console.log(message);
      errorStore.$patch({ message, type: 'error' });
      next({ name: 'auth' });
      return;
    }

    // Check for required roles
    if (to.meta.requiredRoles) {
      const hasRequiredRole = to.meta.requiredRoles.some(role => 
        authStore.user?.roles?.includes(role)
      );
      
      if (!hasRequiredRole) {
        const message = 'Access denied: You do not have the required permissions to view this page';
        console.log(message);
        errorStore.$patch({ message, type: 'error' });
        next({ name: 'home' });
        return;
      }
    }
  }

  next()
})

export default router 