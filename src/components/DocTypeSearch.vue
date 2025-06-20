<template>
  <div class="relative">
    <div class="relative">
      <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        v-model="searchQuery"
        :placeholder="placeholder"
        :class="inputClass"
        @focus="showDropdown = true"
        @blur="handleBlur"
      />
    </div>

    <!-- Search Results Dropdown -->
    <div 
      v-if="showDropdown && searchResults.length > 0" 
      class="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto"
    >
      <div 
        v-for="result in searchResults" 
        :key="result.id"
        class="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
        @mousedown="handleResultClick(result)"
      >
        <div class="flex items-start gap-3">
          <div class="p-2 bg-green-50 rounded-lg">
            <FileIcon class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900">{{ result.name }}</h4>
            <p class="text-xs text-gray-500 mt-1">{{ result.description }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                {{ result.module }}
              </span>
              <span class="text-xs text-gray-500">
                {{ result.documents_count || 0 }} submissions
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results Message -->
    <div 
      v-if="showDropdown && searchQuery && !searchResults.length && !loading" 
      class="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-500"
    >
      No document found
    </div>

    <!-- Loading State -->
    <div 
      v-if="showDropdown && loading" 
      class="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center"
    >
      <LoaderIcon class="w-6 h-6 animate-spin text-blue-500 mx-auto" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { SearchIcon, FileIcon, LoaderIcon } from 'lucide-vue-next';
import { getDocTypes } from '../services/erpnext';

interface DocTypeResult {
  id: string;
  name: string;
  description: string;
  module: string;
  documents_count: number;
}

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search documents...'
  },
  inputClass: {
    type: String,
    default: 'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
  }
});

const emit = defineEmits(['resultClick']);

const router = useRouter();
const searchQuery = ref('');
const searchResults = ref<DocTypeResult[]>([]);
const loading = ref(false);
const showDropdown = ref(false);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchQuery, (newValue) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  if (!newValue.trim()) {
    searchResults.value = [];
    return;
  }

  searchTimeout = setTimeout(async () => {
    loading.value = true;
    try {
      const response = await getDocTypes(
        1, // page
        10, // pageSize
        newValue, // search query
        '', // category
        'modified',
        'desc'
      );
      searchResults.value = response.data.map(docType => ({
        id: docType.name,
        name: docType.name,
        description: docType.description || '',
        module: docType.module || 'Other',
        documents_count: docType.documents_count || 0
      }));
    } catch (error) {
      console.error('Error searching doctypes:', error);
      searchResults.value = [];
    } finally {
      loading.value = false;
    }
  }, 300);
});

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

const handleResultClick = (result: DocTypeResult) => {
  emit('resultClick', result);
  router.push(`/documents/${result.id}`);
  searchQuery.value = '';
  showDropdown.value = false;
};
</script> 