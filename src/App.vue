<template>
  <div class="min-h-screen bg-gray-50">
    <ErrorMessage />
    <div v-if="authStore.isAuthenticated" class="flex h-screen">
      <!-- Sidebar -->
      <aside 
        ref="sidebarRef"
        class="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-lg" style="z-index: 100;"
        :class="isSidebarCollapsed ? '-translate-x-full' : 'w-64'"
      >
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-4" :class="{ 'border-b border-gray-200': !isSidebarCollapsed }">
          <div class="flex items-center">
            <img 
              v-if="!isSidebarCollapsed" 
              :src="logo" 
              alt="Team App Logo" 
              class="h-8" 
            />
          </div>
          <button 
            v-if="!isSidebarCollapsed"
            @click="toggleSidebar" 
            class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <!-- Search Bar -->
        <div v-if="!isSidebarCollapsed" class="px-4 py-3 border-b border-gray-200">
          <DocTypeSearch 
            placeholder="Search..."
            :inputClass="'w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500'"
            @resultClick="handleSearchResultClick"
          />
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
              v-for="item in filteredDocumentItems" 
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
              :href="`${getErpNextApiUrl()}/app/build`"
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
                  <div class="flex justify-between items-center mb-4">
                    <h5 class="text-sm font-medium text-gray-500">Basic Information</h5>
                    <button
                      @click="isEditing = !isEditing"
                      class="text-sm font-medium text-green-600 hover:text-green-700"
                    >
                      {{ isEditing ? 'Cancel' : 'Edit' }}
                    </button>
                  </div>
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
                      <select
                        v-if="isEditing"
                        v-model="editForm.language"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                      </select>
                      <p v-else class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.language || 'Not specified' }}</p>
                    </div>
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">First Name</h6>
                      <input
                        v-if="isEditing"
                        v-model="editForm.first_name"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                      <p v-else class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.first_name || 'Not specified' }}</p>
                    </div>
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">Middle Name</h6>
                      <input
                        v-if="isEditing"
                        v-model="editForm.middle_name"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                      <p v-else class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.middle_name || 'Not specified' }}</p>
                    </div>
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">Last Name</h6>
                      <input
                        v-if="isEditing"
                        v-model="editForm.last_name"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                      <p v-else class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.last_name || 'Not specified' }}</p>
                    </div>
                    <div>
                      <h6 class="text-xs font-medium text-gray-400">Timezone</h6>
                      <select
                        v-if="isEditing"
                        v-model="editForm.time_zone"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Australia/Sydney">Sydney</option>
                        <option value="Australia/Melbourne">Melbourne</option>
                        <option value="Australia/Perth">Perth</option>
                      </select>
                      <p v-else class="mt-1 text-sm text-gray-900">{{ authStore.user?.profile?.time_zone || 'Not specified' }}</p>
                    </div>
                  </div>
                  <!-- Additional User Data -->
                  <div v-if="userData" class="mt-6">
                    <h5 class="text-sm font-medium text-gray-500 mb-2">Additional Information</h5>
                    <pre class="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-48">{{ JSON.stringify(userData, null, 2) }}</pre>
                  </div>
                </div>

                <!-- Save Button -->
                <div v-if="isEditing" class="flex justify-end space-x-3">
                  <button
                    @click="isEditing = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    @click="handleSaveProfile"
                    :disabled="isSaving"
                    class="px-4 py-2 text-sm font-medium text-white btn-primary border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <LoaderIcon v-if="isSaving" class="w-4 h-4 animate-spin inline-block mr-2" />
                    Save Changes
                  </button>
                </div>
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
        <!-- Top Navigation Bar -->
        <div class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40">
          <!-- Toggle Button -->
          <button 
            @click="toggleSidebar"
            class="p-2 rounded-lg hover:bg-gray-100 border border-gray-200"
          >
            <MenuIcon class="w-5 h-5 text-gray-600" />
          </button>

          <!-- Center Logo -->
          <div 
            v-if="route.path !== '/'" 
            class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <img 
              :src="logo" 
              alt="Team App Logo" 
              class="h-8" 
            />
          </div>

          <!-- Support Button -->
          <button
            @click="handleSupportClick"
            class="flex items-center gap-2 px-4 py-2 btn-primary text-white rounded-lg shadow-sm transition-colors"
          >
            <HelpCircleIcon class="w-5 h-5" />
            <span class="hidden sm:inline">Support</span>
          </button>
        </div>

        <!-- Main Content with adjusted padding for fixed header -->
        <main class="flex-1 overflow-auto pt-16">
          <router-view></router-view>
        </main>

        <!-- Footer -->
        <footer class="py-4 px-8 border-t border-gray-200 bg-white">
          <div class="text-center text-sm text-gray-500">
            Powered by <a href="https://frappe.io" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:text-green-700">Frappe</a> and <a href="https://theteam.net.au" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:text-green-700">theteam.net.au</a>
          </div>
        </footer>
      </div>
    </div>
    <router-view v-else></router-view>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { getErpNextApiUrl } from './utils/api';
import { getLogo, getDocumentItems } from './config/domains';
import axios from 'axios';
import CompanySelectionDropdown from './components/CompanySelectionDropdown.vue';
import ErrorMessage from './components/ErrorMessage.vue';
import DocTypeSearch from './components/DocTypeSearch.vue';
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
  XIcon,
  LoaderIcon,
  MicIcon,
  UserIcon,
  Building2Icon as BuildingOfficeIcon // Alias for BuildingOfficeIcon
} from 'lucide-vue-next';

interface SearchResult {
  id: string;
  type: string;
  name: string;
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const logo = computed(() => getLogo());

const isSidebarCollapsed = ref(true);
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');
const showSearchResults = ref(false);
const searchResults = ref<SearchResult[]>([]);
const showUserModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const userData = ref(null);
const sidebarRef = ref<HTMLElement | null>(null);

const documentItems = computed(() => {
  const items = getDocumentItems();
  // Map string icon names to actual icon components
  return items.map(item => ({
    ...item,
    icon: iconMap[item.icon] || FileTextIcon // Default to FileTextIcon if icon not found
  }));
});

// Add icon mapping object with all required icons
const iconMap = {
  'FileTextIcon': FileTextIcon,
  'MicIcon': MicIcon,
  'ClipboardIcon': ClipboardIcon,
  'BuildingOfficeIcon': BuildingOfficeIcon,
  'UserIcon': UserIcon,
  'HomeIcon': HomeIcon,
  'BookIcon': BookIcon,
  'FileIcon': FileIcon,
  'FileBoxIcon': FileBoxIcon,
  'VideoIcon': VideoIcon,
  'SettingsIcon': SettingsIcon,
  'UsersIcon': UsersIcon,
  'BuildingIcon': BuildingIcon,
  'ShieldIcon': ShieldIcon,
  'FileEditIcon': FileEditIcon,
  'TagIcon': TagIcon,
  'FolderIcon': FolderIcon
};

const filteredDocumentItems = computed(() => {
  return documentItems.value.filter(item => {
    // If no requiredRoles is specified, show the item
    if (!item.requiredRoles) return true;
    
    // Check if user has any of the required roles
    return item.requiredRoles.some(role => authStore.user?.roles?.includes(role));
  });
});

const allMenuItems = computed(() => [...filteredDocumentItems.value]);

const currentPageTitle = computed(() => {
  if (route.path === '/') return 'Welcome';
  const allItems = [...documentItems.value];
  const currentItem = allItems.find(item => item.path === route.path);
  return currentItem?.name || 'TheTeam';
});

const currentPageDescription = computed(() => {
  if (route.path === '/') return 'Your one-stop location for managing forms, records, users, and companies';
  const allItems = [...documentItems.value];
  const currentItem = allItems.find(item => item.path === route.path);
  return currentItem?.description || '';
});

const filteredMenuItems = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  return allMenuItems.value.filter(item => 
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
  router.push(`/doctypes/${result.id}`);
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

const handleDocumentClick = (item) => {
  console.log('Navigating to:', item.path);
  router.push(item.path);
};

const handleSupportClick = () => {
  // TODO: Implement support functionality
  window.open('https://support.theteam.net.au', '_blank');
};

// Add new refs and methods
const editForm = ref({
  language: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  time_zone: ''
});

// Watch for modal opening
watch(showUserModal, (newValue) => {
  if (newValue) {
    // Initialize edit form with current values
    editForm.value = {
      language: authStore.user?.profile?.language || '',
      first_name: authStore.user?.profile?.first_name || '',
      middle_name: authStore.user?.profile?.middle_name || '',
      last_name: authStore.user?.profile?.last_name || '',
      time_zone: authStore.user?.profile?.time_zone || ''
    };

    // Get user data from auth store
    userData.value = authStore.user?.details || null;
  } else {
    isEditing.value = false;
    userData.value = null;
  }
});

const handleSaveProfile = async () => {
  isSaving.value = true;
  try {
    await authStore.updateUserDetails(editForm.value);
    isEditing.value = false;
  } catch (error) {
    console.error('Error saving profile:', error);
    // You might want to show an error message to the user here
  } finally {
    isSaving.value = false;
  }
};

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  if (
    !isSidebarCollapsed.value && 
    sidebarRef.value && 
    !sidebarRef.value.contains(event.target as Node) &&
    !(event.target as Element).closest('button')
  ) {
    isSidebarCollapsed.value = true;
  }
};

// Add and remove event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
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