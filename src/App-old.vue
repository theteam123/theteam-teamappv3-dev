<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="authStore.isAuthenticated" class="flex h-screen">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
        <!-- Logo -->
        <div class="flex items-center justify-start h-16 px-4 border-b border-gray-200">
			    <img src="/TeamLogo.png" alt="Team App Logo" class="" @error="handleImageError" />
        </div>
        
        <!-- Search Bar -->
        <div class="px-4 py-3 border-b border-gray-200">
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
        <nav class="flex-1 p-4 space-y-1">
          <router-link 
            to="/" 
            class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
            :class="{ 'bg-green-50 text-green-700': $route.path === '/' }"
          >
            <HomeIcon class="w-5 h-5 mr-3" />
            Home
          </router-link>

          <!-- Document Management Section -->
          <div class="pt-4">
            <router-link 
              v-for="item in documentItems" 
              :key="item.path"
              :to="item.path"
              class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              :class="{ 'bg-green-50 text-green-700': $route.path === item.path }"
            >
              <component :is="item.icon" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </router-link>
          </div>
        </nav>

        <!-- Admin Settings Section -->
        <div class="p-4 border-t border-gray-200">
          <details class="group">
            <summary class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg">
              <SettingsIcon class="w-5 h-5 mr-3" />
              Admin Settings
              <ChevronDownIcon class="w-4 h-4 ml-auto transition-transform group-open:rotate-180" />
            </summary>
            <div class="mt-1 space-y-1">
              <router-link 
                v-for="item in adminItems" 
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 pl-12"
                :class="{ 'bg-green-50 text-green-700': $route.path === item.path }"
              >
                <component :is="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
              </router-link>
            </div>
          </details>
        </div>

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
              <div class="ml-3">
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
        <!-- Header -->
        <header class="bg-white border-b border-gray-200">
          <div class="flex items-center justify-between h-16 px-8">
            <div>
              <h1 class="text-xl font-semibold text-gray-900">
                {{ currentPageTitle }}
              </h1>
              <p v-if="currentPageDescription" class="text-sm text-gray-500">
                {{ currentPageDescription }}
              </p>
            </div>
            <div class="w-64">
              <CompanySelectionDropdown />
            </div>
          </div>
        </header>

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
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
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
  SearchIcon
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const searchQuery = ref('');
const showSearchResults = ref(false);
const searchResults = ref([]);

const documentItems = [
  { name: 'Documents', path: '/documents', icon: FileTextIcon, description: 'Manage and organize your company documents' },
  { name: 'Forms', path: '/forms', icon: ClipboardIcon, description: 'Create and manage company forms' },
  { name: 'Policies', path: '/policies', icon: BookIcon, description: 'View and update company policies' },
  { name: 'Records', path: '/records', icon: FileIcon, description: 'Access and manage records' },
  { name: 'Templates', path: '/templates', icon: FileBoxIcon, description: 'Manage document templates' },
  { name: 'Videos', path: '/videos', icon: VideoIcon, description: 'Access training and company videos' },
];

const adminItems = [
  { name: 'Users', path: '/users', icon: UsersIcon, description: 'Manage users and their roles within your organization' },
  { name: 'Companies', path: '/companies', icon: BuildingIcon, description: "Manage your organization's companies and their settings" },
  { name: 'Roles', path: '/roles', icon: ShieldIcon, description: 'Configure and manage user roles and permissions' },
  { name: 'Content', path: '/content', icon: FileEditIcon, description: 'Organize and manage all content types' },
  { name: 'Tags', path: '/tags', icon: TagIcon, description: 'Manage and organize content tags' },
  { name: 'Categories', path: '/categories', icon: FolderIcon, description: 'Manage content categories and hierarchies' },
];

const allMenuItems = [...documentItems, ...adminItems];

const currentPageTitle = computed(() => {
  if (route.path === '/') return 'Welcome';
  const allItems = [...documentItems, ...adminItems];
  const currentItem = allItems.find(item => item.path === route.path);
  return currentItem?.name || 'TheTeam';
});

const currentPageDescription = computed(() => {
  if (route.path === '/') return 'Your one-stop location for managing forms, records, users, and companies';
  const allItems = [...documentItems, ...adminItems];
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
</script>

<style>
details > summary {
  list-style: none;
}
details > summary::-webkit-details-marker {
  display: none;
}
</style>