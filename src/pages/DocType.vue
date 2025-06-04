<template>
  <div class="p-8">
    <!-- Portal Title -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
      <p v-if="isTaktecPortal" class="text-sm text-gray-500 mt-1">Viewing Taktec ERPNext Document Types</p>
    </div>
    
    <!-- Role Permissions Display -->
    <div class="mb-6 bg-white rounded-lg shadow p-4" >
      <button 
        @click="showPermissions = !showPermissions"
        class="flex items-center justify-between w-full"
      >
        <h2 class="text-lg font-semibold">DocTypes with Permissions:</h2>
        <span class="text-sm text-gray-500">
          {{ showPermissions ? 'Hide' : 'Show' }} Permissions
          <span class="ml-2 inline-block transition-transform" :class="{ 'rotate-180': showPermissions }">
            ▼
          </span>
        </span>
      </button>
      
      <div v-if="showPermissions" class="mt-4">
        <div v-if="docTypes.length > 0" class="overflow-auto max-h-60">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DocType</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Linked DocTypes</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="doctype in docTypes" :key="doctype.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ doctype.name }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <span v-for="(value, perm) in doctype.permissions" :key="perm" 
                        :class="value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                        class="px-2 py-1 rounded-full text-xs font-medium mr-2">
                    {{ perm }}: {{ value ? '✓' : '✗' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <span v-for="linked in doctype.linked_doctypes" :key="linked" 
                        class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                    {{ linked }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else-if="loading" class="text-center py-4">
          <LoaderIcon class="w-6 h-6 animate-spin text-green-600 mx-auto" />
        </div>
        <div v-else class="text-center py-4 text-gray-500">
          No permissions data available
        </div>
      </div>
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
          @click="viewMode = 'grid'"
          :class="[
            'p-2 rounded-lg',
            viewMode === 'grid' ? 'btn-primary text-black' : 'text-gray-600 hover:bg-gray-100'
          ]"
          title="Grid View"
        >
          <GridIcon class="w-5 h-5" />
        </button>
        <button
          @click="viewMode = 'list'"
          :class="[
            'p-2 rounded-lg',
            viewMode === 'list' ? 'btn-primary text-white' : 'text-gray-600 hover:bg-gray-100'
          ]"
          title="List View"
        >
          <ListIcon class="w-5 h-5" />
        </button>

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
      <!-- Grid View -->
      <div v-if="docTypes.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <div class="mt-4">
              <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {{ doctype.module }}
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
                <span>{{ doctype.documents_count || 0 }} Submissions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else-if="docTypes.length > 0 && viewMode === 'list'" class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submissions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="doctype in docTypes" :key="doctype.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <button
                    @click="router.push(`/doctypes/${doctype.id}/new`)"
                    v-if="doctype.permissions.create === 1"
                    class="text-white hover:text-black border border-primary hover:bg-white btn-primary p-1 rounded"
                    title="New Document"
                  >
                    <FilePlusIcon class="w-5 h-5" />
                  </button>
                  <button
                    @click="viewDocuments(doctype)"
                    class="text-white hover:text-black border  hover:bg-white btn-primary p-1 rounded"
                    title="View Documents"
                  >
                    <FileTextIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>            
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ doctype.name }}</div>
                    <div class="text-sm text-gray-500">{{ doctype.module }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ doctype.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {{ doctype.module }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(doctype.updated_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ doctype.documents_count || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <FileIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No document types</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new document type.</p>
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
import { getDocTypes, createDocType, updateDocType, getRolePermissions } from '../services/erpnext';
import {
  FileIcon,
  FilePlusIcon,
  LoaderIcon,
  ClockIcon,
  FileTextIcon,
  SearchIcon,
  GridIcon,
  ListIcon
} from 'lucide-vue-next';

interface DocTypeField {
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'file';
  required: boolean;
  options?: string;
}

interface DocTypePermissions {
  read: number;
  write: number;
  create: number;
  delete: number;
  submit: number;
  cancel: number;
  amend: number;
  report: number;
  export: number;
  import: number;
  share: number;
  print: number;
  email: number;
}

interface DocType {
  id: string;
  name: string;
  description: string;
  module: string;
  fields: DocTypeField[];
  updated_at: string;
  created_at: string;
  documents_count: number;
  permissions: DocTypePermissions;
  linked_doctypes: string[];
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
const rolePermissions = ref(null);
const showPermissions = ref(false);

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

const docTypeData = ref<Omit<DocType, 'updated_at' | 'created_at' | 'documents_count' | 'permissions' | 'linked_doctypes'>>({
  id: '',
  name: '',
  description: '',
  module: '',
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
    filtered = filtered.filter(doctype => doctype.module === selectedCategory.value);
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
    const response = await getDocTypes(
      page, 
      pageSize.value, 
      debouncedSearch.value, 
      selectedCategory.value,
      'modified',  // order_by field
      'desc'       // order direction
    );

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
        documents_count: docType.documents_count || 0,
        permissions: docType.permissions || {},
        linked_doctypes: docType.linked_doctypes || []
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
    module: doctype.module || '',
    fields: doctype.fields || []
  };
  showModal.value = true;
};

const viewDocuments = (doctype: DocType) => {
  router.push(`/doctypes/${doctype.id}`);
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
      module: docTypeData.value.module,
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

// Change default to list view
const viewMode = ref('list');

// Add function to fetch role permissions
const fetchRolePermissions = async () => {
  try {
    const permissions = await getRolePermissions('Taktec User');
    rolePermissions.value = permissions;
    console.log('Taktec User permissions:', permissions);
  } catch (err) {
    console.error('Error fetching role permissions:', err);
  }
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    // router.push('/auth');
    return;
  }
  await fetchDocTypes();
  await fetchRolePermissions();
});
</script> 