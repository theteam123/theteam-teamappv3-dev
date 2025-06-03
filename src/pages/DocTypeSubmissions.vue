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
        class="btn-primary text-white px-4 py-2 rounded-lg  flex items-center gap-2"
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
            :placeholder="`Search ${docType?.name || 'submissions'}...`"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
      <div class="flex gap-4">
        <button
          @click="viewMode = 'grid'"
          :class="[
            'p-2 rounded-lg',
            viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'
          ]"
          title="Grid View"
        >
          <GridIcon class="w-5 h-5" />
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



    <!-- DocType Count -->
    <div class="mb-4 text-sm text-gray-600">
      Showing {{ filteredDocuments.length }} of {{ totalItems }} submissions
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoaderIcon class="w-8 h-8 animate-spin text-green-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Submissions Content -->
    <div v-else-if="docType">
      <!-- Grid View -->
      <div v-if="documents.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="doc in filteredDocuments"
          :key="doc.name"
          :class="[
            'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow',
            doc.owner === authStore.user?.email ? 'border-l-4 border-green-500' : ''
          ]"
        >
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <div class="p-2 bg-green-50 rounded-lg">
                    <FileIcon class="w-6 h-6 text-green-600" />
                  </div>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 truncate">
                      {{ doc.name }}
                    </h3>
                    <p class="text-sm text-gray-500">
                      Created {{ formatDate(doc.creation) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  v-if="canEditDocument(doc)"
                  @click="router.push(`/doctypes/${route.params.id}/${doc.name}/edit`)"
                  class="text-white hover:text-green-600 border border-green-600 hover:bg-white btn-primary p-1 rounded"
                  title="Edit Document"
                >
                  <PencilIcon class="w-5 h-5" />
                </button>
                <template v-for="field in actionFields" :key="field.fieldname">
                  <a
                    v-if="doc[field.fieldname]"
                    :href="doc[field.fieldname]"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-gray-600 hover:text-green-600 hover:bg-white border border-green-600 btn-primary p-1 rounded text-white"
                    :title="field.label.replace('[action]', '').trim()"
                  >
                    <component 
                      :is="field.label.toLowerCase().includes('pdf') ? FileTextIcon : 
                           field.label.toLowerCase().includes('folder') ? FolderIcon : 
                           LinkIcon" 
                      class="w-5 h-5"
                    />
                  </a>
                </template>
              </div>
            </div>

            <!-- Document Fields -->
            <div class="mt-4 space-y-2">
              <template v-for="field in docType?.fields.filter(f => !f.label.toLowerCase().includes('[action]'))" :key="field.fieldname">
                <div v-if="doc[field.fieldname]" class="flex items-start gap-2">
                  <span class="text-sm font-medium text-gray-500">{{ field.label }}:</span>
                  <span class="text-sm text-gray-900">
                    <template v-if="field.fieldtype === 'Table' && field.label.includes('[multiple-upload]')">
                      <button 
                        @click="handleImageClick(doc, field.fieldname)"
                        class="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        title="View Images"
                      >
                        <ImageIcon class="w-4 h-4" />
                        <span>View Images</span>
                      </button>
                    </template>
                    <template v-else-if="field.fieldtype === 'Attach'">
                      <button 
                        @click="isImageFile(doc[field.fieldname]) ? 
                          handleSingleImageClick(doc, field.fieldname) : 
                          handleFileClick(doc[field.fieldname])"
                        class="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        :title="isImageFile(doc[field.fieldname]) ? 'View Image' : 'Open File'"
                      >
                        <component :is="getFileIcon(doc[field.fieldname])" class="w-4 h-4" />
                        <span>View File</span>
                      </button>
                    </template>
                    <template v-else-if="field.fieldtype === 'Attach Image'">
                      <button 
                        @click="handleSingleImageClick(doc, field.fieldname)"
                        class="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        title="View Image"
                      >
                        <ImageIcon class="w-4 h-4" />
                        <span>View Image</span>
                      </button>
                    </template>
                    <template v-else-if="field.fieldtype === 'Signature'">
                      <img 
                        v-if="doc[field.fieldname]"
                        :src="doc[field.fieldname]"
                        alt="Signature"
                        class="max-h-12 max-w-[200px] object-contain"
                        @click="handleSignatureClick(doc[field.fieldname])"
                        style="cursor: pointer;"
                      />
                      <span v-else class="text-gray-400 text-sm">No signature added</span>
                    </template>
                    <template v-else>
                      {{ doc[field.fieldname] }}
                    </template>
                  </span>
                </div>
              </template>
            </div>

            <div class="mt-4 text-sm text-gray-500">
              <div class="flex items-center gap-2">
                <ClockIcon class="w-4 h-4" />
                <span>Updated {{ formatDate(doc.modified) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else-if="documents.length > 0 && viewMode === 'list'" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <div class="inline-block min-w-full align-middle">
            <div class="overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    <th
                      v-for="field in docType?.fields.filter(f => !f.label.toLowerCase().includes('[action]'))"
                      :key="field.fieldname"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      @click="sortByColumn(field.fieldname)"
                    >
                      <div class="flex items-center gap-1">
                        {{ field.label }}
                        <div class="flex flex-col">
                          <ChevronUpIcon 
                            class="w-3 h-3" 
                            :class="{'text-green-600': sortBy === field.fieldname && sortDirection === 'asc'}"
                          />
                          <ChevronDownIcon 
                            class="w-3 h-3 -mt-1" 
                            :class="{'text-green-600': sortBy === field.fieldname && sortDirection === 'desc'}"
                          />
                        </div>
                      </div>
                      <div class="text-xs text-gray-400">
                        {{ field.fieldtype }}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr 
                    v-for="doc in filteredDocuments" 
                    :key="doc.name" 
                    :class="[
                      canEditDocument(doc) ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default',
                      doc.owner === authStore.user?.email ? 'bg-green-50' : ''
                    ]"
                  >
                    <td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <div class="flex gap-2">
                        <button
                          v-if="canEditDocument(doc)"
                          @click="router.push(`/doctypes/${route.params.id}/${doc.name}/edit`)"
                          class="text-white hover:text-green-600 border border-green-600 hover:bg-white btn-primary p-1 rounded"
                          title="Edit Document"
                        >
                          <PencilIcon class="w-5 h-5" />
                        </button>
                        <template v-for="field in actionFields" :key="field.fieldname">
                          <a
                            v-if="doc[field.fieldname]"
                            :href="doc[field.fieldname]"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-gray-600 hover:text-green-600 hover:bg-white border border-green-600 btn-primary p-1 rounded text-white"
                            :title="field.label.replace('[action]', '').trim()"
                          >
                            <component 
                              :is="field.label.toLowerCase().includes('pdf') ? FileTextIcon : 
                                   field.label.toLowerCase().includes('folder') ? FolderIcon : 
                                   LinkIcon" 
                              class="w-5 h-5"
                            />
                          </a>
                        </template>
                      </div>
                    </td>
                    <td
                      v-for="field in docType?.fields.filter(f => !f.label.toLowerCase().includes('[action]'))"
                      :key="field.fieldname"
                      class="px-6 py-4 text-sm text-gray-900"
                      :class="{'whitespace-nowrap': !field.fieldtype.includes('Text')}"
                    >
                      <template v-if="field.fieldtype === 'Table' && field.label.includes('[multiple-upload]')">
                        <button 
                          @click="handleImageClick(doc, field.fieldname)"
                          class="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          title="View Images"
                          v-if="doc[field.fieldname]?.length"
                        >
                          <ImageIcon class="w-5 h-5" />
                        </button>
                        <span v-else class="text-gray-400 text-sm">No images added</span>
                      </template>
                      <template v-else-if="field.fieldtype === 'Attach'">
                        <button 
                          v-if="doc[field.fieldname]"
                          @click="isImageFile(doc[field.fieldname]) ? 
                            handleSingleImageClick(doc, field.fieldname) : 
                            handleFileClick(doc[field.fieldname])"
                          class="text-gray-500 hover:text-gray-700"
                          :title="isImageFile(doc[field.fieldname]) ? 'View Image' : 'Open File'"
                        >
                          <component 
                            :is="getFileIcon(doc[field.fieldname])" 
                            class="w-5 h-5"
                          />
                        </button>
                        <span v-else class="text-gray-400 text-sm">No file added</span>
                      </template>
                      <template v-else-if="field.fieldtype === 'Attach Image'">
                        <button 
                          @click="handleSingleImageClick(doc, field.fieldname)"
                          class="text-gray-500 hover:text-gray-700"
                          title="View Image"
                          v-if="doc[field.fieldname]"
                        >
                          <ImageIcon class="w-5 h-5" />
                        </button>
                        <span v-else class="text-gray-400 text-sm">No image added</span>
                      </template>
                      <template v-else-if="field.fieldtype === 'Signature'">
                        <img 
                          v-if="doc[field.fieldname]"
                          :src="doc[field.fieldname]"
                          alt="Signature"
                          class="max-h-12 max-w-[200px] object-contain"
                          @click="handleSignatureClick(doc[field.fieldname])"
                          style="cursor: pointer;"
                        />
                        <span v-else class="text-gray-400 text-sm">No signature added</span>
                      </template>
                      <template v-else>
                        {{ doc[field.fieldname] }}
                      </template>

                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <FileIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
        <p class="mt-1 text-sm text-gray-500">No submissions available for this document type.</p>
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

    <!-- Image Modal -->
    <ImageModal
      v-if="selectedDocument"
      :is-open="showImageModal"
      :doc-type-id="route.params.id as string"
      :document-id="selectedDocument.name"
      :fieldname="selectedFieldname"
      :is-single-image="selectedDocument[selectedFieldname] && !Array.isArray(selectedDocument[selectedFieldname])"
      :single-image-url="selectedDocument[selectedFieldname]"
      :single-image-name="selectedFieldname"
      @close="showImageModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormList, getFormData } from '../services/erpnext';
import { getErpNextApiUrl } from '../utils/api';
import {
  FileIcon,
  FilePlusIcon,
  PencilIcon,
  TrashIcon,
  LoaderIcon,
  ArrowLeftIcon,
  SearchIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FileTextIcon,
  ImageIcon,
  FileImageIcon,
  FileTextIcon as FileDocIcon,
  FileArchiveIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileCodeIcon,
  FolderIcon,
  LinkIcon,
  GridIcon,
  ListIcon
} from 'lucide-vue-next';
import ImageModal from '../components/ImageModal.vue';

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
const sortDirection = ref<'asc' | 'desc'>('desc');

// Pagination state
const currentPage = ref(1);
const pageSize = ref(20);
const totalItems = ref(0);
const totalPages = ref(0);

const showImageModal = ref(false);
const selectedDocument = ref<Document | null>(null);
const selectedFieldname = ref<string>('');

// Add this with other refs
const mediaQueryMatches = ref(false);

// Add this computed property
const isMobile = computed(() => {
  return mediaQueryMatches.value;
});

// Add this computed property before onMounted
const actionFields = computed(() => {
  if (!docType.value) return [];
  return docType.value.fields.filter(field => field.label.toLowerCase().includes('[action]'));
});

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
    const aValue = a[sortBy.value];
    const bValue = b[sortBy.value];
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection.value === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection.value === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    // Default numeric comparison
    return sortDirection.value === 'asc'
      ? (aValue || 0) - (bValue || 0)
      : (bValue || 0) - (aValue || 0);
  });

  return filtered;
});

// Add viewMode ref with other refs
const viewMode = ref('list');

// Methods
const fetchDocType = async () => {
  try {
    console.log('Fetching DocType:', route.params.id);
    const response = await getFormData('DocType', route.params.id as string);
    console.log('DocType Response:', response);
    console.log('DocType Data:', response.data);
    console.log('DocType Fields:', response.data.fields);
    
    // Filter fields to only show those marked for list view
    docType.value = {
      ...response.data,
      fields: response.data.fields.filter((field: DocTypeField) => 
        field.fieldtype === 'Table' || 
        field.in_list_view === 1 || 
        field.fieldtype === 'Attach Image' ||
        field.fieldtype === 'Attach' ||
        field.fieldtype === 'Signature'
      )
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
    // Get total count first
    const countResponse = await getFormList(route.params.id as string, {
      fields: ['count(name) as total_count'],
      limit: 1
    });
    
    totalItems.value = countResponse.data[0]?.total_count || 0;
    totalPages.value = Math.ceil(totalItems.value / pageSize.value);

    // Then get paginated data with specific fields
    const response = await getFormList(route.params.id as string, {
      limit: pageSize.value,
      offset: (page - 1) * pageSize.value,
      order_by: `${sortBy.value} ${sortDirection.value}`,
      fields: ['name', 'owner', 'creation', 'modified', 'docstatus']
    });
    
    // Fetch full data for each document in the current page
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

const sortByColumn = (column: string) => {
  if (sortBy.value === column) {
    // Toggle direction if clicking the same column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new column and default to descending
    sortBy.value = column;
    sortDirection.value = 'desc';
  }
};

// Watch for search changes
watch(searchQuery, () => {
  currentPage.value = 1;
  fetchDocuments(1);
});

// Watch for page size changes
watch(pageSize, () => {
  currentPage.value = 1;
  fetchDocuments(1);
});

// Watch for sorting changes
watch([sortBy, sortDirection], () => {
  fetchDocuments(currentPage.value);
});

const canEditDocument = (doc: Document) => {
  if (authStore.user?.roles?.includes('System Manager')) {
    return true;
  }
  return doc.owner === authStore.user?.email;
};

const handleImageClick = (doc: Document, fieldname: string) => {
  if (isMobile.value) {
    router.push(`/doctypes/${route.params.id}/${doc.name}/images`);
  } else {
    selectedDocument.value = doc;
    selectedFieldname.value = fieldname;
    showImageModal.value = true;
  }
};

const handleSingleImageClick = (doc: Document, fieldname: string) => {
  if (isMobile.value) {
    // Route to the single image view page
    router.push(`/doctypes/${route.params.id}/${doc.name}/image/${fieldname}`);
  } else {
    selectedDocument.value = doc;
    selectedFieldname.value = fieldname;
    showImageModal.value = true;
  }
};

const getFileIcon = (filename: string) => {
  if (!filename) return FileIcon;
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return FileImageIcon;
    case 'pdf':
      return FileTextIcon;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return FileCodeIcon;
    case 'doc':
    case 'docx':
    case 'txt':
      return FileDocIcon;
    case 'zip':
    case 'rar':
    case '7z':
      return FileArchiveIcon;
    case 'mp4':
    case 'avi':
    case 'mov':
      return FileVideoIcon;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return FileAudioIcon;
    case 'js':
    case 'ts':
    case 'html':
    case 'css':
    case 'json':
      return FileCodeIcon;
    default:
      return FileIcon;
  }
};

// Add these helper functions after getFileIcon and before onMounted
const isImageFile = (filename: string): boolean => {
  if (!filename) return false;
  const extension = filename.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '');
};

const handleFileClick = (fileUrl: string) => {
  const fullUrl = fileUrl.startsWith('/files/') 
    ? `${getErpNextApiUrl()}${fileUrl}`
    : fileUrl;
  window.open(fullUrl, '_blank');
};

const handleSignatureClick = (signatureData: string) => {
  // Open signature in a new tab for better viewing
  const newTab = window.open();
  if (newTab) {
    newTab.document.write(`
      <html>
        <head>
          <title>Signature View</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f3f4f6;
            }
            img {
              max-width: 100%;
              background: white;
              padding: 20px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
          </style>
        </head>
        <body>
          <img src="${signatureData}" alt="Signature" />
        </body>
      </html>
    `);
  }
};

const formatDate = (date: string) => {
  if (!date) return 'N/A';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date:', date);
      return 'N/A';
    }
    
    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (err) {
    console.warn('Error formatting date:', err);
    return 'N/A';
  }
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }

  const mediaQuery = window.matchMedia('(max-width: 768px)');
  mediaQueryMatches.value = mediaQuery.matches;
  
  const handleResize = (e: MediaQueryListEvent) => {
    mediaQueryMatches.value = e.matches;
  };
  
  mediaQuery.addEventListener('change', handleResize);
  
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleResize);
  });
  
  await fetchDocType();
  await fetchDocuments();
});
</script> 