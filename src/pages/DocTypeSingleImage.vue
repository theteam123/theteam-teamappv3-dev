<template>
  <div class="p-8">
    <!-- Page Title -->
    <div class="mb-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Image View</h1>
          <p class="text-sm text-gray-500 mt-1">{{ field?.label || 'Image' }}</p>
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

    <!-- Image Display -->
    <div v-else-if="imageUrl" class="w-full max-w-4xl mx-auto">
      <div class="relative bg-white rounded-xl shadow-lg overflow-hidden">
        <img
          :src="imageUrl"
          :alt="field?.label || 'Image'"
          class="w-full h-auto object-contain"
          @click="toggleFullscreen"
        />
        <!-- Fullscreen View -->
        <div 
          v-if="isFullscreen" 
          class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          @click="toggleFullscreen"
        >
          <img
            :src="imageUrl"
            :alt="field?.label || 'Image'"
            class="max-w-full max-h-full object-contain"
          />
          <button 
            class="absolute top-4 right-4 text-white hover:text-gray-300"
            @click="toggleFullscreen"
          >
            <XIcon class="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <ImageIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No image found</h3>
      <p class="mt-1 text-sm text-gray-500">The image could not be loaded.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormData } from '../services/erpnext';
import { getErpNextApiUrl } from '../utils/api';
import {
  ArrowLeftIcon,
  LoaderIcon,
  ImageIcon,
  XIcon
} from 'lucide-vue-next';

interface Field {
  fieldname: string;
  label: string;
  fieldtype: string;
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref<string | null>(null);
const imageUrl = ref<string | null>(null);
const field = ref<Field | null>(null);
const isFullscreen = ref(false);

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const fetchImage = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // First get the DocType to find the field information
    const docTypeResponse = await getFormData('DocType', route.params.id as string);
    console.log('DocType Response:', docTypeResponse);

    if (!docTypeResponse?.data?.fields) {
      throw new Error('Invalid DocType response structure');
    }

    field.value = docTypeResponse.data.fields.find(
      (f: Field) => f.fieldname === route.params.fieldname
    );

    if (!field.value) {
      throw new Error(`Field ${route.params.fieldname} not found in DocType`);
    }

    // Then get the document data
    const response = await getFormData(route.params.id as string, route.params.documentId as string);
    console.log('Document Response:', response);

    if (!response?.data) {
      throw new Error('Invalid document response structure');
    }

    const rawImageUrl = response.data[route.params.fieldname as string];
    
    if (!rawImageUrl) {
      error.value = 'No image found in this field';
    } else {
      // Append the API URL if the image URL is relative
      const apiUrl = getErpNextApiUrl().replace(/\/$/, ''); // Remove trailing slash if present
      imageUrl.value = rawImageUrl.startsWith('http') ? rawImageUrl : `${apiUrl}${rawImageUrl}`;
    }
  } catch (err: any) {
    console.error('Error fetching image:', err);
    error.value = err.message || 'Failed to load image';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }
  
  await fetchImage();
});
</script> 