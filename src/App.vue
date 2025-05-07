<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="authStore.isAuthenticated" class="flex h-screen">
      <!-- Sidebar -->
      <aside 
        class="bg-white border-r border-gray-200 flex flex-col transition-all duration-300"
        :class="isSidebarCollapsed ? 'w-0 -translate-x-full' : 'w-64'"
      >
        <!-- Logo -->
        <div class="flex items-center h-16 px-4" :class="{ 'border-b border-gray-200': !isSidebarCollapsed }">
          <div class="flex items-center">
            <img 
              v-if="!isSidebarCollapsed" 
              src="/theteamlogo with tag line.png" 
              alt="Team App Logo" 
              class="h-8" 
              @error="handleImageError" 
            />
          </div>

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
        <div v-if="!isSidebarCollapsed" class="border-t border-gray-200">
          <div class="p-4">
            <div class="flex items-center cursor-pointer" @click="showUserModal = true">
              <div class="flex-shrink-0">
                <img
                  :src="authStore.user?.profile?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'"
                  class="h-8 w-8 rounded-full"
                  alt=""
                />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">
                  {{ authStore.user?.profile?.full_name }}
                </p>
                <button
                  @click.stop="handleSignOut"
                  class="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- User Profile Modal -->
      <div v-if="showUserModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">User Profile</h3>
            <button @click="showUserModal = false" class="text-gray-400 hover:text-gray-500">
              <XIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Modal Content -->
          <div class="px-6 py-4">
            <div v-if="loading" class="flex justify-center py-8">
              <LoaderIcon class="w-8 h-8 animate-spin text-green-600" />
            </div>
            <div v-else-if="error" class="text-red-600 p-4 bg-red-50 rounded-lg">
              {{ error }}
            </div>
            <div v-else class="space-y-6">
              <!-- Profile Header -->
              <div class="flex items-center space-x-4">
                <img
                  :src="authStore.user?.profile?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'"
                  class="h-16 w-16 rounded-full"
                  alt=""
                />
                <div>
                  <h4 class="text-xl font-semibold text-gray-900">{{ authStore.user?.profile?.full_name }}</h4>
                  <p class="text-sm text-gray-500">{{ authStore.user?.profile?.email }}</p>
                </div>
              </div>

              <!-- User Details -->
              <div class="space-y-6">
                <!-- Basic Information -->
                <div>
                  <h5 class="text-sm font-medium text-gray-500 mb-4">Basic Information</h5>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">Email</h6>
                      <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.email || 'Not specified' }}</p>
                    </div>
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">Full Name</h6>
                      <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.full_name || 'Not specified' }}</p>
                    </div>
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">Username</h6>
                      <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.name || 'Not specified' }}</p>
                    </div>
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">Language</h6>
                      <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.language || 'Not specified' }}</p>
                    </div>
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">First Name</h6>
                      <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.first_name || 'Not specified' }}</p>
                    </div>
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">Middle Name</h6>
                      <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.middle_name || 'Not specified' }}</p>
                    </div>
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">Last Name</h6>
                      <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.last_name || 'Not specified' }}</p>
                    </div>
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">Timezone</h6>
                      <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.time_zone || 'Not specified' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Additional Information -->
                <!-- <div v-if="authStore.user?.details" class="mt-6">
                  <h5 class="text-sm font-medium text-gray-500 mb-2">Additional Information</h5>
                  <pre class="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-48">{{ JSON.stringify(authStore.user.details, null, 2) }}</pre>
                </div> -->
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              @click="showUserModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col">
        <!-- Toggle Button -->        
        <div class="flex items-center p-4">
          <button 
            @click="toggleSidebar"
            class="p-2 rounded-lg hover:bg-gray-100 bg-gray-50 border border-gray-200 shadow-sm z-10"
          >
            <MenuIcon class="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <!-- Support Button -->
        <div class="fixed top-4 right-4 z-50">
          <button
            @click="handleSupportClick"
            class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors"
          >
            <HelpCircleIcon class="w-5 h-5" />
            <span>Support</span>
          </button>
        </div>

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
  ChevronRightIcon,
  HelpCircleIcon,
  XIcon
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Determine which ERPNext instance to use based on domain and environment
const getErpNextUrl = () => {
  const currentDomain = window.location.hostname;
  const isProduction = import.meta.env.PROD;
  const isDevelopment = import.meta.env.DEV;

  // Production environment
  if (isProduction) {
    if (currentDomain.includes('teamsite-taktec')) {
      return import.meta.env.VITE_ERPNEXT_TAKTEC_API_URL;
    }
    return import.meta.env.VITE_ERPNEXT_API_URL;
  }
  
  // Development environment
  if (isDevelopment) {
    return import.meta.env.VITE_ERPNEXT_API_URL || 'https://erp.theteam.net.au';
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

const handleSupportClick = () => {
  // TODO: Implement support functionality
  window.open('https://support.theteam.net.au', '_blank');
};

// Add new refs and methods
const showUserModal = ref(false);

// Watch for modal opening
watch(showUserModal, (newValue) => {
  if (newValue) {
    // No need to fetch data anymore as it's already in the store
  }
});
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