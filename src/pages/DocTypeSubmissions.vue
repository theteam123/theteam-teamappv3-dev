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
    <div class="flex justify-start  mb-6" v-if="docTypePermissions?.create === 1">
      <button
        @click="router.push(`/documents/${route.params.id}/new`)"
        class="btn-primary text-white px-4 py-2 rounded-lg  flex items-center gap-2"
      >
        <FilePlusIcon class="w-5 h-5" />
        New {{ docType?.name }}
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col gap-4">
      <!-- Global Search -->
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
    <!-- Saved Filters -->
    <div class="mb-4">
      <button
        @click="showSavedFilters = !showSavedFilters"
        class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border mb-2"
        :class="[
          showSavedFilters 
            ? 'bg-green-50 text-green-600 border-green-200' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
        ]"
      >
        <component :is="showSavedFilters ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4" />
        Saved Filters
      </button>

      <!-- Save Current Filter -->
      <div v-if="showSavedFilters" class="mb-4">
        <button
          v-if="!showSaveFilter"
          @click="showSaveFilter = true"
          class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700"
        >
          <PlusIcon class="w-4 h-4" />
          Save Current Filter
        </button>
        <div v-else class="flex items-center gap-2">
          <input
            v-model="newFilterName"
            type="text"
            placeholder="Enter filter name"
            class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            @keyup.enter="handleSaveFilter"
          />
          <button
            @click="handleSaveFilter"
            class="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            :disabled="!newFilterName.trim()"
          >
            Save
          </button>
          <button
            @click="showSaveFilter = false; newFilterName = ''"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>

      <div 
        v-if="showSavedFilters" 
        class="border-2 border-dashed border-gray-300 rounded-lg p-4"
        :class="{ 'min-h-[60px]': savedFilters.length === 0 }"
      >
        <div v-if="savedFilters.length === 0" class="flex items-center justify-center h-full text-gray-500 text-sm">
          No saved filters
        </div>
        <div v-else class="flex flex-wrap gap-2">
          <button
            v-for="filter in savedFilters"
            :key="filter.name"
            @click="handleFilterSelect(filter)"
            class="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-colors border"
            :class="[
              selectedFilter?.name === filter.name
                ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
            ]"
          >
            <span>{{ filter.filter_name }}</span>
            <div class="flex gap-2 items-center">
              <XIcon 
                v-if="selectedFilter?.name === filter.name"
                class="w-4 h-4 cursor-pointer text-green-600"
                @click.stop="clearSelectedFilter"
              />
              <TrashIcon 
                class="w-4 h-4 cursor-pointer text-gray-400 hover:text-red-500"
                @click.stop="openDeleteModal(filter)"
                title="Delete filter"
              />
            </div>
          </button>
        </div>
      </div>
    </div>

      <!-- Field-specific Searches -->
      <div v-if="filteredFields?.length" class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <div v-for="field in filteredFields" :key="field.fieldname">
          <label :for="field.fieldname" class="block text-sm font-medium text-gray-700 mb-1">
            {{ field.label }}
          </label>
          <input
            :id="field.fieldname"
            type="text"
            v-model="fieldSearches[field.fieldname]"
            :placeholder="`Search by ${field.label.toLowerCase()}`"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </div>
      </div>

      <!-- View Mode Buttons -->
      <div class="flex justify-end gap-4">
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
                  @click="router.push(`/documents/${route.params.id}/${doc.name}/edit`)"
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
                    @mouseenter="hoveredPdfIcon = doc.name + field.fieldname"
                    @mouseleave="hoveredPdfIcon = null"
                  >
                    <component 
                      :is="field.label.toLowerCase().includes('pdf') ? 
                           (hoveredPdfIcon === (doc.name + field.fieldname) ? PdfIconBlack : PdfIcon) : 
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
                    <template v-if="field.fieldtype === 'Table' && (field.label.includes('[multiple-upload]') || field.label.includes('[multiple-upload-view]') )">
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
                        {{ field.label.replace(/\[.*?\]/g, '').trim() }}
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
                          @click="router.push(`/documents/${route.params.id}/${doc.name}/edit`)"
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
                            @mouseenter="hoveredPdfIcon = doc.name + field.fieldname"
                            @mouseleave="hoveredPdfIcon = null"
                          >
                            <component 
                              :is="field.label.toLowerCase().includes('pdf') ? 
                                   (hoveredPdfIcon === (doc.name + field.fieldname) ? PdfIconBlack : PdfIcon) : 
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
                      <template v-if="field.fieldtype === 'Table' && (field.label.includes('[multiple-upload]') || field.label.includes('[multiple-upload-view]') )">
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
        <p class="mt-1 text-sm text-gray-500">No submissions available for this document.</p>
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

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Delete Filter</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to remove the "{{ filterToDelete?.filter_name }}" filter?
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="handleDeleteFilter"
            class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormList, getFormData, getDoctypePermissions } from '../services/erpnext';
import { getErpNextApiUrl } from '../utils/api';
import { getReportView, deleteItem, insertItem } from '../services/deskApi';
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
  ListIcon,
  XIcon,
  PlusIcon
} from 'lucide-vue-next';
import ImageModal from '../components/ImageModal.vue';
import PdfIcon from '../components/icons/PdfIcon.vue';
import PdfIconBlack from '../components/icons/PdfIconBlack.vue';
import { initializeFormFilter } from '../utils/formUtils';

interface DocTypeField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd?: number;
  in_list_view?: number;
  in_preview?: number;
  options?: string;
  in_standard_filter?: number;
  [key: string]: any; // for other properties that might be present
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

interface DocTypePermission {
  create: number;
  read: number;
  write: number;
  delete: number;
  submit: number;
  cancel: number;
  amend: number;
  if_owner: number;
}

interface SavedFilter {
  name: string;
  filter_name: string;
  for_user: string;
  filters: string;
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
const ifOwnerPermission = ref(false);
const docTypePermissions = ref<DocTypePermission | null>(null);
const hoveredPdfIcon = ref<string | null>(null);
const fieldSearches = ref<Record<string, string>>({});
const filteredFields = ref<DocTypeField[]>([]);

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

  // Global search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(doc => {
      return Object.values(doc).some(value => 
        String(value).toLowerCase().includes(query)
      );
    });
  }

  // Field-specific searches
  Object.entries(fieldSearches.value).forEach(([fieldname, searchValue]) => {
    if (searchValue) {
      filtered = filtered.filter(doc => {
        const fieldValue = doc[fieldname];
        return fieldValue && String(fieldValue).toLowerCase().includes(searchValue.toLowerCase());
      });
    }
  });

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

// Add these refs with other refs
const showSavedFilters = ref(false);
const savedFilters = ref<SavedFilter[]>([]);
const selectedFilter = ref<SavedFilter | null>(null);
const showDeleteModal = ref(false);
const filterToDelete = ref<SavedFilter | null>(null);

// Add new refs for save filter functionality
const showSaveFilter = ref(false);
const newFilterName = ref('');

// Methods
const fetchDocType = async () => {
  try {
    console.log('Fetching DocType:', route.params.id);
    const response = await getFormData('DocType', route.params.id as string);
    console.log('DocType Response:', response);
    console.log('DocType Data:', response.data);
    console.log('DocType Fields:', response.data.fields);

    const fields = initializeFormFilter(response.data.fields);
    console.log('Filtered Fields (in_standard_filter=1):', fields);
    filteredFields.value = fields;

    // Initialize fieldSearches with empty strings for each filtered field
    fieldSearches.value = Object.fromEntries(
      fields.map(field => [field.fieldname, ''])
    );

    // Check if user has System Manager role
    const isSystemManager = authStore.user?.roles?.includes('System Manager');
    console.log('Is System Manager:', isSystemManager);

    let permissions;
    if (isSystemManager) {
      // If System Manager, only get permissions for that role
      permissions = await getDoctypePermissions(route.params.id as string, 'System Manager');
      docTypePermissions.value = permissions[0];
      ifOwnerPermission.value = false; // System Managers bypass owner permission check
    } else {
      // For non-System Managers, check all non-system roles
      const systemRoles = ['Administrator', 'Desk User', 'Guest', 'All'];
      const userRoles = authStore.user?.roles?.filter(role => !systemRoles.includes(role)) || [];
      console.log('Filtered user roles:', userRoles);

      // Get permissions for each role
      const rolePermissionsPromises = userRoles.map(role => 
        getDoctypePermissions(route.params.id as string, role)
      );

      const rolePermissionsResponses = await Promise.all(rolePermissionsPromises);
      
      // Combine permissions from all roles
      const allPermissions = rolePermissionsResponses.flatMap(response => response[0] || []);
      console.log('Combined permissions from all roles:', allPermissions);

      // Get the highest permission level for each permission type
      docTypePermissions.value = {
        create: Math.max(...allPermissions.map(p => p?.create || 0)),
        read: Math.max(...allPermissions.map(p => p?.read || 0)),
        write: Math.max(...allPermissions.map(p => p?.write || 0)),
        delete: Math.max(...allPermissions.map(p => p?.delete || 0)),
        submit: Math.max(...allPermissions.map(p => p?.submit || 0)),
        cancel: Math.max(...allPermissions.map(p => p?.cancel || 0)),
        amend: Math.max(...allPermissions.map(p => p?.amend || 0)),
        if_owner: Math.max(...allPermissions.map(p => p?.if_owner || 0))
      };

      // Set if_owner permission if any role has it
      ifOwnerPermission.value = docTypePermissions.value.if_owner === 1;
    }
    
    console.log('DocType Permissions:', docTypePermissions.value);
    
    // Only proceed if user has read permission or is System Manager
    if (isSystemManager || docTypePermissions.value?.read === 1) {
      // Filter fields to only show those marked for list view
      console.log('Response Data:', response.data.fields);
      docType.value = {
        ...response.data,
        fields: response.data.fields.filter((field: DocTypeField) => 
          field.label.toLowerCase().includes('[multiple-upload-view]') || 
          field.in_preview === 1 ||
          field.in_list_view === 1
        )
      };
    } else {
      error.value = "You don't have permission to read this document";
      docType.value = null;
    }
    
    console.log('DocType Value:', docType.value);
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
    
    // Filter documents based on owner permission
    const filteredDocuments = ifOwnerPermission.value ?
      fullDocuments.filter(doc => doc.owner === authStore.user?.email) :
      fullDocuments;
    
    documents.value = filteredDocuments;
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

// Add watch for field searches
watch(fieldSearches, () => {
  currentPage.value = 1;
  fetchDocuments(1);
}, { deep: true });

const canEditDocument = (doc: Document) => {
  if (authStore.user?.roles?.includes('System Manager')) {
    return true;
  }
  if (ifOwnerPermission.value) {
    return doc.owner === authStore.user?.email;
  }
  return true;
};

const handleImageClick = (doc: Document, fieldname: string) => {
  if (isMobile.value) {
    router.push(`/documents/${route.params.id}/${doc.name}/images`);
  } else {
    selectedDocument.value = doc;
    selectedFieldname.value = fieldname;
    showImageModal.value = true;
  }
};

const handleSingleImageClick = (doc: Document, fieldname: string) => {
  if (isMobile.value) {
    // Route to the single image view page
    router.push(`/documents/${route.params.id}/${doc.name}/image/${fieldname}`);
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
      return PdfIcon;
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

const handleFilterSelect = (filter: SavedFilter) => {
  if (!filter) return;
  
  try {
    console.log('Selected Filter:', filter);
    selectedFilter.value = filter;
    const filterConditions = JSON.parse(filter.filters || '[]') as string[][];
    console.log('Raw filter conditions:', filterConditions);

    // Reset all existing field searches
    fieldSearches.value = Object.fromEntries(
      filteredFields.value.map(field => [field.fieldname, ''])
    );

    // Process each filter condition
    filterConditions.forEach(condition => {
      if (condition.length >= 4) {
        const fieldname = condition[1];
        const value = condition[3];
        
        console.log('Processing condition:', { fieldname, value });
        
        // Find the matching field and apply the value
        if (fieldSearches.value.hasOwnProperty(fieldname)) {
          // Remove any '%' characters and trim the value
          const cleanValue = value.replace(/%/g, '').trim();
          fieldSearches.value[fieldname] = cleanValue;
        }
      }
    });

    console.log('Applied field searches:', fieldSearches.value);
    
    // Trigger a new search
    fetchDocuments(1);
  } catch (error) {
    console.error('Error applying filter:', error);
  }
};

const clearSelectedFilter = () => {
  selectedFilter.value = null;
  fieldSearches.value = {};
  fetchDocuments(1);
};

const handleDeleteFilter = async () => {
  if (!filterToDelete.value) return;
  
  try {
    await deleteItem('List Filter', filterToDelete.value.name);
    
    // Remove the filter from the list
    savedFilters.value = savedFilters.value.filter(f => f.name !== filterToDelete.value?.name);
    
    // If the deleted filter was selected, clear the selection
    if (selectedFilter.value?.name === filterToDelete.value.name) {
      clearSelectedFilter();
    }
    
    // Close the modal
    showDeleteModal.value = false;
    filterToDelete.value = null;
  } catch (error) {
    console.error('Error deleting filter:', error);
  }
};

const openDeleteModal = (filter: SavedFilter) => {
  filterToDelete.value = filter;
  showDeleteModal.value = true;
};

const handleSaveFilter = async () => {
  if (!newFilterName.value.trim()) return;

  try {
    // Create filter conditions array from current field searches
    const filterConditions = Object.entries(fieldSearches.value)
      .filter(([_, value]) => value) // Only include non-empty searches
      .map(([fieldname, value]) => [
        route.params.id as string,
        fieldname,
        'like',
        `%${value}%`
      ]);

    if (filterConditions.length === 0) {
      console.warn('No filter conditions to save');
      return;
    }

    const newFilter = {
      doctype: "List Filter",
      reference_doctype: route.params.id as string,
      filter_name: newFilterName.value.trim(),
      for_user: authStore.user?.email || '',
      filters: JSON.stringify(filterConditions)
    };

    const response = await insertItem(newFilter);
    console.log('Filter saved:', response);

    // Add the new filter to the list
    if (response.message) {
      savedFilters.value.push({
        name: response.message.name,
        filter_name: newFilterName.value.trim(),
        for_user: authStore.user?.email || '',
        filters: JSON.stringify(filterConditions)
      });
    }

    // Clear the input and hide the save section
    newFilterName.value = '';
    showSaveFilter.value = false;
  } catch (error) {
    console.error('Error saving filter:', error);
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
  
  // Get saved filters for this doctype
  try {
    const filtersResponse = await getReportView({
      reference_doctype: route.params.id as string,
      for_user: authStore.user?.email
    });
    savedFilters.value = filtersResponse.message || [];
    console.log('Saved Filters:', savedFilters.value);
  } catch (error) {
    console.error('Error fetching saved filters:', error);
  }
  
  await fetchDocType();
  await fetchDocuments();
});
</script> 