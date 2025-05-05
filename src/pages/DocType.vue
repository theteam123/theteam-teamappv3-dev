<template>
  <div class="p-8">
    <!-- Portal Title -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
      <p v-if="isTaktecPortal" class="text-sm text-gray-500 mt-1">Viewing Taktec ERPNext Document Types</p>
    </div>

    <!-- Create DocType Button -->
    <div class="flex justify-end mb-6">
      <button
        @click="openCreateDocTypeModal"
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
      >
        <FilePlusIcon class="w-5 h-5" />
        Create DocType
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            id="doctype-search"
            v-model="searchQuery"
            placeholder="Search document types..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
      <div class="flex gap-4">
        <select
          id="doctype-category"
          v-model="selectedCategory"
          class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <select
          id="doctype-sort"
          v-model="sortBy"
          class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="name">Name</option>
          <option value="updated_at">Last Updated</option>
          <option value="created_at">Date Created</option>
        </select>
      </div>
    </div>

    <!-- DocType Count -->
    <div class="mb-4 text-sm text-gray-600">
      Showing {{ docTypes.length }} of {{ totalItems }} document types
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoaderIcon class="w-8 h-8 animate-spin text-green-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Content Area -->
    <div v-else>
      <!-- DocTypes Grid -->
      <div v-if="docTypes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="doctype in docTypes"
          :key="doctype.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div class="flex items-start gap-3">
                <div class="p-2 bg-green-50 rounded-lg">
                  <FileIcon class="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ doctype.name }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ doctype.description }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="viewAnalytics(doctype)"
                  class="text-gray-400 hover:text-gray-600"
                  title="View Analytics"
                >
                  <BarChartIcon class="w-5 h-5" />
                </button>
                <button
                  @click="viewDocuments(doctype)"
                  class="text-gray-400 hover:text-gray-600"
                  title="View Documents"
                >
                  <FileTextIcon class="w-5 h-5" />
                </button>

              </div>
            </div>

            <div class="mt-4">
              <div class="flex flex-wrap gap-2">
                <span
                  v-if="doctype.category"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                >
                  {{ doctype.category }}
                </span>
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {{ doctype.fields.length }} Fields
                </span>
              </div>
            </div>

            <div class="mt-4 text-sm text-gray-500">
              <div class="flex items-center gap-2">
                <ClockIcon class="w-4 h-4" />
                <span>Updated {{ formatDate(doctype.updated_at) }}</span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <FileTextIcon class="w-4 h-4" />
                <span>{{ doctype.documents_count }} Documents</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <FileIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No document types</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new document type.</p>
        <div class="mt-6">
          <button
            @click="openCreateDocTypeModal"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FilePlusIcon class="w-5 h-5 mr-2" />
            Create DocType
          </button>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="docTypes.length > 0" class="mt-6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span class="text-sm text-gray-600">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Items per page:</span>
          <select
            v-model="pageSize"
            @change="fetchDocTypes(1)"
            class="rounded border-gray-300 text-sm"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Create/Edit DocType Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit DocType' : 'Create New DocType' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="doctype-name" class="block text-sm font-medium text-gray-700">DocType Name</label>
            <input
              id="doctype-name"
              type="text"
              v-model="docTypeData.name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label for="doctype-description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="doctype-description"
              v-model="docTypeData.description"
              rows="2"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            ></textarea>
          </div>
          <div>
            <label for="doctype-category" class="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="doctype-category"
              v-model="docTypeData.category"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">Select Category</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <!-- DocType Fields -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-gray-700">DocType Fields</label>
              <button
                type="button"
                @click="addField"
                class="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <PlusIcon class="w-4 h-4" />
                Add Field
              </button>
            </div>
            <div class="space-y-4">
              <div
                v-for="(field, index) in docTypeData.fields"
                :key="index"
                class="flex gap-4 items-start p-4 bg-gray-50 rounded-lg"
              >
                <div class="flex-1">
                  <input
                    :id="'field-label-' + index"
                    type="text"
                    v-model="field.label"
                    placeholder="Field Label"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                  />
                  <div class="mt-2 flex gap-4">
                    <select
                      :id="'field-type-' + index"
                      v-model="field.type"
                      class="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="date">Date</option>
                      <option value="select">Select</option>
                      <option value="textarea">Text Area</option>
                      <option value="file">File</option>
                    </select>
                    <label :for="'field-required-' + index" class="flex items-center">
                      <input
                        :id="'field-required-' + index"
                        type="checkbox"
                        v-model="field.required"
                        class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span class="ml-2 text-sm text-gray-600">Required</span>
                    </label>
                  </div>
                  <div v-if="field.type === 'select'" class="mt-2">
                    <input
                      :id="'field-options-' + index"
                      type="text"
                      v-model="field.options"
                      placeholder="Options (comma-separated)"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeField(index)"
                  class="text-gray-400 hover:text-red-600"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              :disabled="loading"
            >
              {{ isEditing ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getDocTypes, createDocType, updateDocType, deleteDocType as deleteDocTypeAPI } from '../services/erpnext';
import {
  FileIcon,
  FilePlusIcon,
  PencilIcon,
  TrashIcon,
  LoaderIcon,
  ClockIcon,
  FileTextIcon,
  BarChartIcon,
  SearchIcon,
  PlusIcon
} from 'lucide-vue-next';

interface DocTypeField {
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'file';
  required: boolean;
  options?: string;
}

interface DocType {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: DocTypeField[];
  updated_at: string;
  created_at: string;
  documents_count: number;
}

const router = useRouter();
const authStore = useAuthStore();
const route = useRoute();
const loading = ref(false);
const error = ref<string | null>(null);
const docTypes = ref<DocType[]>([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const sortBy = ref('updated_at');
const showModal = ref(false);
const isEditing = ref(false);

// Add pagination state
const currentPage = ref(1);
const pageSize = ref(20);
const totalItems = ref(0);
const totalPages = ref(0);

// Add debounced search
const debouncedSearch = ref('');
let searchTimeout: number | null = null;

// Watch for search changes
watch(searchQuery, (newValue) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newValue;
    currentPage.value = 1; // Reset to first page on search
    fetchDocTypes();
  }, 300);
});

// Watch for category changes
watch(selectedCategory, () => {
  currentPage.value = 1; // Reset to first page on category change
  fetchDocTypes();
});

const categories = [
  'HR',
  'Operations',
  'Finance',
  'IT',
  'Sales',
  'Other'
];

const docTypeData = ref<Omit<DocType, 'updated_at' | 'created_at' | 'documents_count'>>({
  id: '',
  name: '',
  description: '',
  category: '',
  fields: []
});

const isTaktecPortal = computed(() => route.meta.portal === 'taktec');

// Update the page title based on portal
const pageTitle = computed(() => isTaktecPortal.value ? 'Taktec Document Types' : 'Document Types');

const filteredDocTypes = computed(() => {
  let filtered = [...docTypes.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(doctype => 
      doctype.name.toLowerCase().includes(query) ||
      doctype.description.toLowerCase().includes(query)
    );
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(doctype => doctype.category === selectedCategory.value);
  }

  filtered.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return new Date(b[sortBy.value]).getTime() - new Date(a[sortBy.value]).getTime();
    }
  });

  return filtered;
});

const fetchDocTypes = async (page = 1) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getDocTypes(page, pageSize.value, debouncedSearch.value, selectedCategory.value);
    docTypes.value = response.data.map(docType => ({
      id: docType.name,
      name: docType.name,
      description: docType.description || '',
      category: docType.module || 'Other',
      fields: docType.fields ? JSON.parse(docType.fields) : [],
      updated_at: docType.modified,
      created_at: docType.creation,
      documents_count: 0
    }));
    totalItems.value = response.total;
    totalPages.value = response.totalPages;
    currentPage.value = response.page;
  } catch (err) {
    console.error('Error fetching document types:', err);
    error.value = err.response?.data?.message || err.message || 'Failed to fetch document types';
    
    if (err.response?.status === 403 || err.response?.data?.exc_type === 'PermissionError') {
      router.push('/auth');
    }
  } finally {
    loading.value = false;
  }
};

const openCreateDocTypeModal = () => {
  isEditing.value = false;
  docTypeData.value = {
    id: '',
    name: '',
    description: '',
    category: '',
    fields: []
  };
  showModal.value = true;
};

const editDocType = (doctype: DocType) => {
  isEditing.value = true;
  docTypeData.value = {
    id: doctype.id,
    name: doctype.name,
    description: doctype.description || '',
    category: doctype.category || '',
    fields: doctype.fields || []
  };
  showModal.value = true;
};

const viewDocuments = (doctype: DocType) => {
  router.push(`/doctypes/${doctype.id}/documents`);
};

const viewAnalytics = (doctype: DocType) => {
  router.push(`/doctypes/${doctype.id}/analytics`);
};

const addField = () => {
  docTypeData.value.fields.push({
    label: '',
    type: 'text',
    required: false,
    options: ''
  });
};

const removeField = (index: number) => {
  docTypeData.value.fields.splice(index, 1);
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    const data = {
      name: docTypeData.value.name,
      description: docTypeData.value.description,
      module: docTypeData.value.category,
      fields: JSON.stringify(docTypeData.value.fields.map(field => ({
        label: field.label,
        fieldname: field.label.toLowerCase().replace(/\s+/g, '_'),
        fieldtype: field.type.toUpperCase(),
        reqd: field.required ? 1 : 0,
        options: field.options
      })))
    };

    if (isEditing.value) {
      await updateDocType(docTypeData.value.id, data);
    } else {
      await createDocType(data);
    }

    showModal.value = false;
    await fetchDocTypes();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const deleteDocType = async (doctype: DocType) => {
  if (!confirm('Are you sure you want to delete this document type? This action cannot be undone.')) return;

  loading.value = true;
  error.value = null;

  try {
    await deleteDocTypeAPI(doctype.id);
    await fetchDocTypes();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Add pagination controls
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchDocTypes(page);
  }
};

onMounted(() => {
  // Check authentication before fetching data
  if (!authStore.isAuthenticated) {
    // router.push('/auth');
    return;
  }
  fetchDocTypes();
});
</script> 