<template>
  <div class="p-8">
    <!-- Create Content Button -->
    <div class="flex justify-end mb-6">
      <button
        @click="openCreateContentModal"
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
      >
        <FileEditIcon class="w-5 h-5" />
        Add Content
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white rounded-lg shadow p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="content-type" class="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
          <select
            id="content-type"
            v-model="filters.contentType"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">All Types</option>
            <option value="document">Documents</option>
            <option value="form">Forms</option>
            <option value="record">Records</option>
          </select>
        </div>

        <div>
          <label for="content-category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="content-category"
            v-model="filters.category"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">All Categories</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div>
          <label for="content-tag" class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <select
            id="content-tag"
            v-model="filters.tag"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">All Tags</option>
            <option
              v-for="tag in tags"
              :key="tag.id"
              :value="tag.id"
            >
              {{ tag.name }}
            </option>
          </select>
        </div>

        <div>
          <label for="content-sort" class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            id="content-sort"
            v-model="filters.sortBy"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="updated_at">Last Updated</option>
            <option value="created_at">Date Created</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div class="mt-4">
        <div class="relative">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            id="content-search"
            v-model="filters.search"
            placeholder="Search content..."
            class="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoaderIcon class="w-8 h-8 animate-spin text-green-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Content Grid -->
    <div v-else-if="filteredContent.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in filteredContent"
        :key="item.id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div class="p-6">
          <div class="flex justify-between items-start">
            <div class="flex items-start gap-3">
              <div
                class="p-2 rounded-lg"
                :class="getContentTypeClass(item.type)"
              >
                <component
                  :is="getContentTypeIcon(item.type)"
                  class="w-8 h-8"
                  :class="getContentTypeIconClass(item.type)"
                />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ item.name }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ item.description }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="editContent(item)"
                class="text-gray-400 hover:text-gray-600"
              >
                <PencilIcon class="w-5 h-5" />
              </button>
              <button
                @click="deleteContent(item)"
                class="text-gray-400 hover:text-red-600"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="mt-4">
            <div class="flex flex-wrap gap-2">
              <span
                v-if="item.category"
                class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
              >
                {{ getCategoryName(item.category) }}
              </span>
              <span
                v-for="tag in item.tags"
                :key="tag.id"
                class="px-2 py-1 text-xs font-medium rounded-full"
                :style="{
                  backgroundColor: tag.color + '20',
                  color: tag.color
                }"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>

          <div class="mt-4 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <ClockIcon class="w-4 h-4" />
              <span>Updated {{ formatDate(item.updated_at) }}</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <UserIcon class="w-4 h-4" />
              <span>{{ item.updated_by_name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <FileIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No content found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by adding new content.</p>
      <div class="mt-6">
        <button
          @click="openCreateContentModal"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FileEditIcon class="w-5 h-5 mr-2" />
          Add Content
        </button>
      </div>
    </div>

    <!-- Create/Edit Content Modal -->
    <ContentFormModal
      v-if="showModal"
      :isEditing="isEditing"
      :contentData="selectedContent"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import ContentFormModal from '../components/ContentFormModal.vue';
import {
  FileEditIcon,
  FileIcon,
  FileTextIcon,
  ClipboardIcon,
  BookIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
  LoaderIcon,
  ClockIcon,
  UserIcon,
} from 'lucide-vue-next';

const authStore = useAuthStore();
const loading = ref(false);
const error = ref(null);
const content = ref([]);
const categories = ref([]);
const tags = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const selectedContent = ref(null);

const filters = ref({
  contentType: '',
  category: '',
  tag: '',
  search: '',
  sortBy: 'updated_at'
});

const filteredContent = computed(() => {
  let filtered = [...content.value];

  if (filters.value.contentType) {
    filtered = filtered.filter(item => item.type === filters.value.contentType);
  }

  if (filters.value.category) {
    filtered = filtered.filter(item => item.category === filters.value.category);
  }

  if (filters.value.tag) {
    filtered = filtered.filter(item => 
      item.tags.some(tag => tag.id === filters.value.tag)
    );
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search)
    );
  }

  filtered.sort((a, b) => {
    if (filters.value.sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return new Date(b[filters.value.sortBy]).getTime() - new Date(a[filters.value.sortBy]).getTime();
    }
  });

  return filtered;
});

const fetchContent = async () => {
  loading.value = true;
  error.value = null;

  try {
    // TODO: Replace with your new backend implementation
    content.value = [];
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    // TODO: Replace with your new backend implementation
    categories.value = [];
  } catch (err: any) {
    error.value = err.message;
  }
};

const fetchTags = async () => {
  try {
    // TODO: Replace with your new backend implementation
    tags.value = [];
  } catch (err: any) {
    error.value = err.message;
  }
};

const getCategoryName = (categoryId: string) => {
  return categories.value.find(c => c.id === categoryId)?.name || '';
};

const getContentTypeClass = (type: string) => {
  switch (type) {
    case 'document':
      return 'bg-blue-50';
    case 'form':
      return 'bg-green-50';
    default:
      return 'bg-purple-50';
  }
};

const getContentTypeIcon = (type: string) => {
  switch (type) {
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

const getContentTypeIconClass = (type: string) => {
  switch (type) {
    case 'document':
      return 'text-blue-600';
    case 'form':
      return 'text-green-600';
    case 'policy':
      return 'text-yellow-600';
    default:
      return 'text-purple-600';
  }
};

const openCreateContentModal = () => {
  isEditing.value = false;
  selectedContent.value = null;
  showModal.value = true;
};

const editContent = (item) => {
  isEditing.value = true;
  selectedContent.value = item;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedContent.value = null;
};

const handleSubmit = async (formData) => {
  loading.value = true;
  error.value = null;
  
  try {
    const contentData = {
      name: formData.name,
      url: formData.url,
      description: formData.description,
      content_type: formData.contentType,
      tags: formData.tags,
      role_permissions: formData.rolePermissions,
      company_id: authStore.currentCompanyId,
      updated_by: authStore.user?.id
    };

    if (isEditing.value && selectedContent.value) {
      // TODO: Replace with your new backend implementation
    } else {
      // TODO: Replace with your new backend implementation
    }

    closeModal();
    await fetchContent();
  } catch (err: any) {
    console.error('Error saving content:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const deleteContent = async (item: any) => {
  if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) return;

  loading.value = true;
  error.value = null;

  try {
    // TODO: Replace with your new backend implementation
    await fetchContent();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy');
};

onMounted(async () => {
  await Promise.all([fetchContent(), fetchCategories(), fetchTags()]);
});
</script>