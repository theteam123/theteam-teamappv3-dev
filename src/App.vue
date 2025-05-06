<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="authStore.isAuthenticated" class="flex h-screen">
      <!-- Sidebar -->
      <aside 
        class="bg-white border-r border-gray-200 flex flex-col transition-all duration-300"
        :class="isSidebarCollapsed ? 'w-16' : 'w-64'"
      >
        <!-- Logo and Toggle Button -->
        <div class="flex items-center h-16 border-b border-gray-200"
          :class="isSidebarCollapsed ? '' : 'justify-between px-4'"
        >
          <div class="flex items-center">
            <img 
              v-if="!isSidebarCollapsed" 
              src="/team-app-logo.webp" 
              alt="Team App Logo" 
              class="h-8" 
              @error="handleImageError" 
            />
          </div>
          <button 
            @click="toggleSidebar"
            class="p-2 rounded-lg hover:bg-gray-100 bg-gray-50 border border-gray-200 shadow-sm z-10"
            :class="isSidebarCollapsed ? 'ml-2' : 'ml-auto'"
          >
            <MenuIcon class="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <!-- Search Bar -->
        <div v-if="!isSidebarCollapsed" class="px-4 py-3 border-b border-gray-200">
          <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search..."
              class="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
              @focus="showSearchResults = true"
              @blur="handleSearchBlur"
            />
          </div>
          <!-- Search Results -->
          <div
            v-if="showSearchResults && searchQuery"
            class="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
          >
            <!-- Menu Items Results -->
            <div v-if="filteredMenuItems.length > 0" class="py-1">
              <div class="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                Menu Items
              </div>
              <a
                v-for="item in filteredMenuItems"
                :key="item.path"
                :href="item.path"
                class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @mousedown.prevent="handleMenuItemClick(item)"
              >
                <component :is="item.icon" class="w-4 h-4 inline-block mr-2 text-gray-400" />
                {{ item.name }}
              </a>
            </div>

            <!-- Content Results -->
            <div v-if="searchResults.length > 0" class="py-1 border-t border-gray-200">
              <div class="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                Content
              </div>
              <a
                v-for="result in searchResults"
                :key="result.id"
                href="#"
                class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @mousedown.prevent="handleSearchResultClick(result)"
              >
                <component :is="getContentIcon(result.type)" class="w-4 h-4 inline-block mr-2 text-gray-400" />
                {{ result.name }}
              </a>
            </div>

            <!-- No Results -->
            <div
              v-if="filteredMenuItems.length === 0 && searchResults.length === 0"
              class="px-3 py-2 text-sm text-gray-500"
            >
              No results found
            </div>
          </div>
        </div>
        
        <!-- Navigation -->
        <nav v-if="!isSidebarCollapsed" class="flex-1 p-4 space-y-1">
          <router-link 
            to="/" 
            class="flex items-center py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
            :class="{ 'bg-green-50 text-green-700': $route.path === '/' }"
          >
            <HomeIcon class="w-5 h-5" :class="isSidebarCollapsed ? '' : 'mr-3'" />
            <span v-if="!isSidebarCollapsed">Home</span>
          </router-link>

          <!-- Document Management Section -->
          <div class="pt-4">
            <router-link 
              v-for="item in documentItems" 
              :key="item.path"
              :to="item.path"
              class="flex items-center py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              :class="{ 
                'bg-green-50 text-green-700': $route.path === item.path,
                'justify-center px-2': isSidebarCollapsed,
                'justify-start px-4': !isSidebarCollapsed
              }"
              @click="handleDocumentClick(item)"
              :title="isSidebarCollapsed ? item.name : ''"
            >
              <component 
                :is="item.icon" 
                class="w-5 h-5 transition-colors duration-200" 
                :class="[
                  isSidebarCollapsed ? 'text-gray-600' : 'mr-3 text-gray-500',
                  $route.path === item.path ? 'text-green-600' : ''
                ]"
              />
              <span v-if="!isSidebarCollapsed">{{ item.name }}</span>
            </router-link>
          </div>

          <!-- Admin Settings -->
          <div v-if="authStore.isSystemManager" class="border-gray-200">
            <a 
              :href="`${getErpNextUrl()}/app/build`"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg"
            >
              <SettingsIcon class="w-5 h-5 mr-3" />
              Admin Settings
            </a>
          </div>
        </nav>

        <!-- User Menu -->
        <div class="border-t border-gray-200">
          <div class="p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <img
                  :src="authStore.user?.profile?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'"
                  class="h-8 w-8 rounded-full"
                  alt=""
                />
              </div>
              <div v-if="!isSidebarCollapsed" class="ml-3">
                <p class="text-sm font-medium text-gray-900">
                  {{ authStore.user?.profile?.full_name }}
                </p>
                <button
                  @click="handleSignOut"
                  class="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div class="flex-1 flex flex-col">

        <!-- Main Content -->
        <main class="flex-1 overflow-auto">
          <router-view></router-view>
        </main>
      </div>
    </div>
    <router-view v-else></router-view>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { erp } from './services/erpnext';
import axios from 'axios';
import CompanySelectionDropdown from './components/CompanySelectionDropdown.vue';
import { 
  HomeIcon, 
  FileTextIcon, 
  ClipboardIcon,
  BookIcon,
  FileIcon,
  FileBoxIcon,
  VideoIcon,
  SettingsIcon,
  UsersIcon,
  BuildingIcon,
  ShieldIcon,
  FileEditIcon,
  TagIcon,
  FolderIcon,
  ChevronDownIcon,
  SearchIcon,
  MenuIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Determine which ERPNext instance to use based on domain and environment
const getErpNextUrl = () => {
  const currentDomain = window.location.hostname;
  const isProduction = import.meta.env.PROD;

  // Production environment
  if (isProduction) {
    if (currentDomain.includes('teamsite-taktec')) {
      return import.meta.env.VITE_TAKTEC_ERPNEXT_API_URL;
    }
    return import.meta.env.VITE_ERPNEXT_API_URL;
  }
  
  // Development environment
  if (currentDomain.includes('teamsite-taktec')) {
    return import.meta.env.VITE_TAKTEC_ERPNEXT_API_URL || 'http://taktec.theteam.net.au';
  }
  return import.meta.env.VITE_ERPNEXT_API_URL || 'https://erp.theteam.net.au';
};

const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const searchQuery = ref('');
const showSearchResults = ref(false);
const searchResults = ref([]);

const documentItems = [
  { name: 'Documents', path: '/documents', icon: FileTextIcon, description: 'Manage and organize your company documents' },
  { name: 'Doc Types', path: '/doctypes', icon: FileTextIcon, description: 'Manage and organize your company documents' },
  { name: 'Forms', path: '/forms', icon: ClipboardIcon, description: 'Create and manage company forms' },
  { name: 'Policies', path: '/policies', icon: BookIcon, description: 'View and update company policies' },
  { name: 'Records', path: '/records', icon: FileIcon, description: 'Access and manage records' },
  { name: 'Templates', path: '/templates', icon: FileBoxIcon, description: 'Manage document templates' },
  { name: 'Videos', path: '/videos', icon: VideoIcon, description: 'Access training and company videos' },
];


const allMenuItems = [...documentItems];

const currentPageTitle = computed(() => {
  if (route.path === '/') return 'Welcome';
  const allItems = [...documentItems];
  const currentItem = allItems.find(item => item.path === route.path);
  return currentItem?.name || 'TheTeam';
});

const currentPageDescription = computed(() => {
  if (route.path === '/') return 'Your one-stop location for managing forms, records, users, and companies';
  const allItems = [...documentItems];
  const currentItem = allItems.find(item => item.path === route.path);
  return currentItem?.description || '';
});

const filteredMenuItems = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  return allMenuItems.filter(item => 
    item.name.toLowerCase().includes(query)
  );
});

const handleSearchBlur = () => {
  // Delay hiding results to allow clicking them
  setTimeout(() => {
    showSearchResults.value = false;
  }, 200);
};

const handleMenuItemClick = (item) => {
  router.push(item.path);
  searchQuery.value = '';
  showSearchResults.value = false;
};

const handleSearchResultClick = (result) => {
  // Navigate to the appropriate page based on content type
  const path = `/${result.type.toLowerCase()}s/${result.id}`;
  router.push(path);
  searchQuery.value = '';
  showSearchResults.value = false;
};

const getContentIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'document':
      return FileTextIcon;
    case 'form':
      return ClipboardIcon;
    case 'policy':
      return BookIcon;
    default:
      return FileIcon;
  }
};

const handleSignOut = async () => {
  try {
    // TODO: Replace with your new backend implementation
    await authStore.signOut();
    router.push('/login');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.error('Failed to load logo:', img.src);
  // Fallback to text if image fails to load
  img.style.display = 'none';
  const container = img.parentElement;
  if (container) {
    const fallback = document.createElement('span');
    fallback.textContent = 'TheTeam';
    fallback.className = 'text-xl font-semibold text-gray-900';
    container.appendChild(fallback);
  }
};

const handleDocumentClick = (item) => {
  console.log('Navigating to:', item.path);
  router.push(item.path);
};
</script>

<style>
details > summary {
  list-style: none;
}
details > summary::-webkit-details-marker {
  display: none;
}

/* Add smooth transition for sidebar */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>