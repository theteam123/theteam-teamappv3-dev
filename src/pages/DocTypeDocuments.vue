<template>
  <div class="p-8">
    <!-- Page Title -->
    <div class="mb-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ docType?.name || 'Loading...' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ docType?.description }}</p>
        </div>
      </div>
    </div>

    <!-- New Document Button -->
    <div class="flex justify-end mb-6">
      <button
        @click="router.push(`/doctypes/${route.params.id}/new`)"
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
      >
        <FilePlusIcon class="w-5 h-5" />
        New {{ docType?.name }}
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="`Search ${docType?.name || 'documents'}...`"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
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

    <!-- Documents List -->
    <div v-else>
      <!-- Documents Table -->
      <div v-if="documents.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="field in docType?.fields"
                :key="field.fieldname"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ field.label }}
                <div class="text-xs text-gray-400">
                  {{ field.fieldtype }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="doc in filteredDocuments" :key="doc.name" class="hover:bg-gray-50">
              <td
                v-for="field in docType?.fields"
                :key="field.fieldname"
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
              >
                {{ doc[field.fieldname] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <FileIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
        <p class="mt-1 text-sm text-gray-500">No documents available for this document type.</p>
      </div>

      <!-- Pagination -->
      <div v-if="documents.length > 0" class="mt-6 flex items-center justify-between">
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
            @change="fetchDocuments(1)"
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
import { getFormList, getFormData } from '../services/erpnext';
import {
  FileIcon,
  FilePlusIcon,
  PencilIcon,
  TrashIcon,
  LoaderIcon,
  ArrowLeftIcon,
  SearchIcon
} from 'lucide-vue-next';

interface DocTypeField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  in_list_view: number;
  options?: string;
}

interface DocType {
  name: string;
  description: string;
  fields: DocTypeField[];
}

interface Document {
  name: string;
  [key: string]: any;
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref<string | null>(null);
const documents = ref<Document[]>([]);
const docType = ref<DocType | null>(null);
const searchQuery = ref('');
const sortBy = ref('modified');

// Pagination state
const currentPage = ref(1);
const pageSize = ref(20);
const totalItems = ref(0);
const totalPages = ref(0);

// Computed
const filteredDocuments = computed(() => {
  let filtered = [...documents.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(doc => {
      return Object.values(doc).some(value => 
        String(value).toLowerCase().includes(query)
      );
    });
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

// Methods
const fetchDocType = async () => {
  try {
    const response = await getFormData('DocType', route.params.id as string);
    console.log('DocType Response:', response);
    console.log('DocType Data:', response.data);
    console.log('DocType Fields:', response.data.fields);
    
    // Filter fields to only show those marked for list view
    docType.value = {
      ...response.data,
      fields: response.data.fields.filter((field: DocTypeField) => field.in_list_view === 1)
    };
  } catch (err: any) {
    console.error('Error fetching DocType:', err);
    error.value = err.message;
  }
};

const fetchDocuments = async (page = 1) => {
  if (!route.params.id) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await getFormList(route.params.id as string);
    
    // Then fetch full data for each document
    const fullDocuments = await Promise.all(
      response.data.map(async (doc: { name: string }) => {
        try {
          const docResponse = await getFormData(route.params.id as string, doc.name);
          return docResponse.data;
        } catch (err) {
          return { name: doc.name, error: 'Failed to load document data' };
        }
      })
    );
    
    documents.value = fullDocuments;
    totalItems.value = fullDocuments.length;
    totalPages.value = Math.ceil(totalItems.value / pageSize.value);
    currentPage.value = page;
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchDocuments(page);
  }
};

// Watch for search changes
watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }
  
  await fetchDocType();
  await fetchDocuments();
});
</script> 