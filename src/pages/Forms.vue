<template>
  <div class="p-8">

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            id="form-search"
            v-model="searchQuery"
            placeholder="Search forms..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="viewMode = 'grid'"
          :class="[
            'p-2 rounded-lg',
            viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'
          ]"
          title="Grid View"
        >
          <LayoutGridIcon class="w-5 h-5" />
        </button>
        <button
          @click="viewMode = 'list'"
          :class="[
            'p-2 rounded-lg',
            viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'
          ]"
          title="List View"
        >
          <ListIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Form Count -->
    <div class="mb-4 text-sm text-gray-600">
      Showing {{ forms.length }} of {{ totalItems }} forms
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoaderIcon class="w-8 h-8 animate-spin text-green-600" />
    </div>

    <!-- Permission Check Loading State -->
    <div v-if="permissionCheckLoading" class="text-sm text-gray-500">
      Checking form permissions...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Grid View -->
    <div v-else-if="filteredForms.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="form in filteredForms"
        :key="form.id"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div class="p-6">
          <div class="flex justify-between items-start">
            <div class="flex items-start gap-3">
              <div class="p-2 bg-green-50 rounded-lg">
                <ClipboardIcon class="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ form.title }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ form.description }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="router.push(`/forms/${form.id}/new`)"
                class="text-gray-700 hover:text-gray-600"
                title="New Submission"
              >
              <FilePlusIcon class="w-6 h-6" />
              </button>
              <button
                @click="viewSubmissions(form)"
                class="text-gray-700 hover:text-gray-600"
                title="View Submissions"
              >
                <FileTextIcon class="w-6 h-6" />
              </button>
            </div>
          </div>

          <div class="mt-4">
            <div class="flex flex-wrap gap-2">
              <span
                v-if="form.module"
                class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
              >
                {{ form.module }}
              </span>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {{ form.doc_type }}
              </span>
              <span
                v-if="form.is_standard"
                class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800"
              >
                Standard
              </span>
              <span
                v-if="form.login_required"
                class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
              >
                Login Required
              </span>
              <span
                v-if="form.allow_edit"
                class="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800"
              >
                Editable
              </span>
              <span
                v-if="form.allow_multiple"
                class="px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-800"
              >
                Multiple Submissions
              </span>
              <span
                v-if="form.apply_document_permissions"
                class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800"
              >
                Permission Required
              </span>
            </div>
          </div>

          <div class="mt-4 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <ClockIcon class="w-4 h-4" />
              <span>Updated {{ formatDate(form.updated_at) }}</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <FileTextIcon class="w-4 h-4" />
              <span>Route: {{ form.route }}</span>
            </div>
            <div v-if="form.success_message" class="flex items-center gap-2 mt-1">
              <MessageSquareIcon class="w-4 h-4" />
              <span class="truncate">{{ form.success_message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else-if="filteredForms.length > 0 && viewMode === 'list'" class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Form Name
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
              Status
            </th>

          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="form in filteredForms" :key="form.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end gap-2">
                <button
                  @click="router.push(`/forms/${form.id}/new`)"
                  class="text-gray-700 hover:text-gray-600"
                  title="New Submission"
                >
                  <FilePlusIcon class="w-5 h-5" />
                </button>
                <button
                  @click="viewSubmissions(form)"
                  class="text-gray-700 hover:text-gray-600"
                  title="View Submissions"
                >
                  <FileTextIcon class="w-5 h-5" />
                </button>
              </div>
            </td>            
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <ClipboardIcon class="h-6 w-6 text-green-600" />
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ form.title }}</div>
                  <div class="text-sm text-gray-500">{{ form.doc_type }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ form.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {{ form.module }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(form.updated_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex flex-wrap gap-1">
                <span
                  v-if="form.is_standard"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800"
                >
                  Standard
                </span>
                <span
                  v-if="form.login_required"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                >
                  Login Required
                </span>
                <span
                  v-if="form.allow_edit"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800"
                >
                  Editable
                </span>
                <span
                  v-if="form.apply_document_permissions"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800"
                >
                  Permission Required
                </span>
              </div>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <ClipboardIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No forms found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new form.</p>
    </div>

    <!-- Pagination Controls -->
    <div v-if="forms.length > 0" class="mt-6 flex items-center justify-between">
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
          @change="fetchForms(1)"
          class="rounded border-gray-300 text-sm"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Form' : 'Create New Form' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="form-name" class="block text-sm font-medium text-gray-700">Form Name</label>
            <input
              id="form-name"
              type="text"
              v-model="formData.name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label for="form-description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="form-description"
              v-model="formData.description"
              rows="2"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            ></textarea>
          </div>
          <div>
            <label for="form-category" class="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="form-category"
              v-model="formData.module"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">Select Category</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <!-- Form Fields -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-gray-700">Form Fields</label>
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
                v-for="(field, index) in formData.fields"
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
              class="px-4 py-2 text-sm font-medium text-white btn-primary rounded-md hover:bg-green-700"
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getWebforms } from '../services/erpnext';
import Cookies from 'js-cookie';
import {
  ClipboardIcon,
  ClipboardPlusIcon,
  PencilIcon,
  TrashIcon,
  LoaderIcon,
  ClockIcon,
  FileTextIcon,
  SearchIcon,
  PlusIcon,
  MessageSquareIcon,
  FilePlusIcon,
  LayoutGridIcon,
  ListIcon
} from 'lucide-vue-next';

interface WebForm {
  id: string;
  name: string;
  title: string;
  description: string;
  module: string;
  route: string;
  doc_type: string;
  is_standard: boolean;
  success_url: string;
  success_message: string;
  login_required: boolean;
  allow_edit: boolean;
  allow_multiple: boolean;
  updated_at: string;
  created_at: string;
  apply_document_permissions: boolean;
  has_permission?: boolean;
}

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const permissionCheckLoading = ref(false);
const error = ref<string | null>(null);
const forms = ref<WebForm[]>([]);
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
    fetchForms();
  }, 300);
});

// Watch for category changes
watch(selectedCategory, () => {
  currentPage.value = 1; // Reset to first page on category change
  fetchForms();
});

const categories = [
  'HR',
  'Operations',
  'Finance',
  'IT',
  'Sales',
  'Other'
];

const formData = ref({
  id: '',
  name: '',
  description: '',
  module: '',
  fields: [] as any[]
});

const filteredForms = computed(() => {
  let filtered = [...forms.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(form => 
      form.title.toLowerCase().includes(query) ||
      form.description.toLowerCase().includes(query)
    );
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(form => form.module === selectedCategory.value);
  }

  filtered.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.title.localeCompare(b.title);
    } else {
      return new Date(b[sortBy.value]).getTime() - new Date(a[sortBy.value]).getTime();
    }
  });

  return filtered;
});

const fetchForms = async (page = 1) => {
  loading.value = true;
  permissionCheckLoading.value = true;
  error.value = null;
  console.log('Fetching forms');
  try {
    const response = await getWebforms(page, pageSize.value, debouncedSearch.value, selectedCategory.value);
    forms.value = response.data.map(form => ({
      id: form.name,
      name: form.name,
      title: form.title,
      description: form.description || '',
      module: form.module || 'Other',
      route: form.route,
      doc_type: form.doc_type,
      is_standard: form.is_standard,
      success_url: form.success_url,
      success_message: form.success_message,
      login_required: form.login_required,
      allow_edit: form.allow_edit,
      allow_multiple: form.allow_multiple,
      updated_at: form.modified,
      created_at: form.creation,
      apply_document_permissions: form.apply_document_permissions,
      has_permission: form.has_permission
    }));
    console.log(forms.value);
    totalItems.value = response.total;
    totalPages.value = response.totalPages;
    currentPage.value = response.page;
  } catch (err) {
    console.error('Error fetching webformsssss:', err);
    error.value = err.response?.data?.message || err.message || 'Failed to fetch webforms';
  } finally {
    loading.value = false;
    permissionCheckLoading.value = false;
  }
};

const editForm = (form) => {
  isEditing.value = true;
  formData.value = {
    id: form.id,
    name: form.name,
    description: form.description || '',
    module: form.module || '',
    fields: form.fields || []
  };
  showModal.value = true;
};

const viewSubmissions = (form: WebForm) => {
  router.push(`/forms/${form.id}/submissions`);
};

const addField = () => {
  formData.value.fields.push({
    label: '',
    type: 'text',
    required: false,
    options: ''
  });
};

const removeField = (index: number) => {
  formData.value.fields.splice(index, 1);
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    // TODO: Replace with your new backend implementation
    showModal.value = false;
    await fetchForms();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const deleteForm = async (form: WebForm) => {
  if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) return;

  loading.value = true;
  error.value = null;

  try {
    // TODO: Replace with your new backend implementation
    await fetchForms();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Add pagination controls
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchForms(page);
  }
};

// Add view mode state
const viewMode = ref(Cookies.get('formViewMode') || 'list');

// Watch for view mode changes and save to cookie
watch(viewMode, (newMode) => {
  Cookies.set('formViewMode', newMode, { expires: 365 }); // Cookie expires in 1 year
});

onMounted(() => {
  // Check authentication before fetching data
  if (!authStore.isAuthenticated) {
    return;
  }
  fetchForms();
});
</script>