<template>
  <div class="p-8">
    <!-- Portal Title -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
      <p v-if="isTaktecPortal" class="text-sm text-gray-500 mt-1">Viewing Taktec ERPNext Document Types</p>
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
        <button
          @click="isGridView = !isGridView"
          class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          :title="isGridView ? 'Switch to List View' : 'Switch to Grid View'"
        >
          <GridIcon v-if="!isGridView" class="w-5 h-5" />
          <ListIcon v-else class="w-5 h-5" />
        </button>
        <!-- <select
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
        </select> -->
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
      <div v-if="docTypes.length > 0" :class="[
        isGridView 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      ]">
        <div
          v-for="doctype in docTypes"
          :key="doctype.id"
          :class="[
            'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow',
            !isGridView && 'flex items-center'
          ]"
        >
          <div :class="[isGridView ? 'p-6' : 'p-4 flex-1 flex items-center']">
            <div :class="[isGridView ? 'flex justify-between items-start' : 'flex-1 flex items-center gap-4']">
              <div :class="[isGridView ? 'flex items-start gap-3' : 'flex items-center gap-3']">
                <div class="p-2 bg-green-50 rounded-lg">
                  <FileIcon class="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ doctype.name }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ doctype.description }}</p>
                </div>
              </div>
              <div class="flex gap-1">
                <button
                  @click="router.push(`/doctypes/${doctype.id}/new`)"
                  class="text-gray-700 hover:text-gray-600"
                  :title="`New ${doctype.name}`"
                >
                  <FilePlusIcon class="w-6 h-6" />
                </button>
                <button
                  @click="viewDocuments(doctype)"
                  class="text-gray-700 hover:text-gray-600"
                  :title="`View ${doctype.name} submissions`"
                >
                  <FileTextIcon class="w-6 h-6" />
                </button>
              </div>
            </div>

            <div :class="[isGridView ? 'mt-4' : 'ml-4']">
              <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {{ doctype.module }}
                </span>
              </div>
            </div>

            <div :class="[isGridView ? 'mt-4 text-sm text-gray-500' : 'ml-4 text-sm text-gray-500']">
              <div class="flex items-center gap-2">
                <ClockIcon class="w-4 h-4" />
                <span>Updated {{ formatDate(doctype.updated_at) }}</span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <FileTextIcon class="w-4 h-4" />
                <span>{{ doctype.documents_count || 0 }} Submissions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <FileIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No document types</h3>
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
  PlusIcon,
  GridIcon,
  ListIcon
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
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

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
  'Taktec',
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
    docTypes.value = response.data.map(docType => {
      // Safely parse fields
      let fields = [];
      try {
        if (docType.fields) {
          if (typeof docType.fields === 'string') {
            try {
              fields = JSON.parse(docType.fields);
            } catch (parseErr) {
              console.warn(`Failed to parse fields for ${docType.name}:`, parseErr);
              fields = [];
            }
          } else if (Array.isArray(docType.fields)) {
            fields = docType.fields;
          }
        }
      } catch (err) {
        console.warn(`Error processing fields for ${docType.name}:`, err);
        fields = [];
      }

      return {
        id: docType.name,
        name: docType.name,
        description: docType.description || '',
        module: docType.module || 'Other',
        fields: fields,
        updated_at: docType.modified,
        created_at: docType.creation,
        documents_count: docType.documents_count || 0
      };
    });
    totalItems.value = response.total;
    totalPages.value = response.totalPages;
    currentPage.value = response.page;
  } catch (err) {
    console.error('Error fetching document types:', err);
    error.value = err.response?.data?.message || err.message || 'Failed to fetch document types';
    
    if (err.response?.status === 403 || err.response?.data?.exc_type === 'PermissionError') {
      // router.push('/auth');
    }
  } finally {
    loading.value = false;
  }
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
  if (!date) return 'N/A';
  try {
    // Handle ERPNext date format (YYYY-MM-DD HH:mm:ss.SSSSSS)
    const [datePart, timePart] = date.split(' ');
    if (!datePart) {
      console.warn('Invalid date format:', date);
      return 'N/A';
    }

    // Parse the date part (YYYY-MM-DD)
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Parse the time part (HH:mm:ss.SSSSSS)
    let hours = 0, minutes = 0, seconds = 0;
    if (timePart) {
      const [time, microseconds] = timePart.split('.');
      const [h, m, s] = time.split(':').map(Number);
      hours = h || 0;
      minutes = m || 0;
      seconds = s || 0;
    }

    // Create date in UTC to avoid timezone issues
    const parsedDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date:', date);
      return 'N/A';
    }

    // Format in local timezone
    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC' // Keep in UTC to match server time
    });
  } catch (err) {
    console.warn('Error formatting date:', err);
    return 'N/A';
  }
};

// Add pagination controls
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchDocTypes(page);
  }
};

const isGridView = ref(false);

onMounted(() => {
  // Check authentication before fetching data
  if (!authStore.isAuthenticated) {
    // router.push('/auth');
    return;
  }
  fetchDocTypes();
});
</script> 