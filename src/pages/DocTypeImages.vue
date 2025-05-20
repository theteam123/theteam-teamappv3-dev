<template>
  <div class="p-8">
    <!-- Page Title -->
    <div class="mb-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Images</h1>
          <p class="text-sm text-gray-500 mt-1">Viewing images for {{ docType?.name }}</p>
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

    <!-- Images Grid -->
    <div v-else class="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="image in images" :key="image.name" class="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="aspect-w-4 aspect-h-3 w-full overflow-hidden rounded-t-xl">
          <img
            :src="image.image"
            :alt="image.description || 'Image'"
            class="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div class="p-4">
          <p class="text-sm text-gray-600 line-clamp-2">{{ image.description || 'No description' }}</p>
        </div>
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-xl"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && images.length === 0" class="text-center py-12">
      <ImageIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No images found</h3>
      <p class="mt-1 text-sm text-gray-500">No images available for this document.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormData, getChildTableData } from '../services/erpnext';
import { getErpNextApiUrl } from '../utils/api';
import {
  ArrowLeftIcon,
  LoaderIcon,
  ImageIcon
} from 'lucide-vue-next';

interface Image {
  name: string;
  image: string;
  description?: string;
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref<string | null>(null);
const images = ref<Image[]>([]);
const docType = ref<any>(null);

const fetchImages = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Fetch DocType metadata
    const docTypeResponse = await getFormData('DocType', route.params.id as string);
    docType.value = docTypeResponse.data;

    // Find the multiple_images field to get its options (child table name)
    const multipleImagesField = docTypeResponse.data.fields.find(
      (field: any) => field.fieldname === 'multiple_images' && field.fieldtype === 'Table'
    );

    if (!multipleImagesField?.options) {
      throw new Error('Multiple Images table configuration not found');
    }

    // Fetch the parent document with its child table data
    const response = await getChildTableData(route.params.id as string, route.params.documentId as string);
    
    // Extract the images from the child table and construct proper URLs
    images.value = response.data.multiple_images.map((item: any) => ({
      name: item.name,
      image: `${getErpNextApiUrl().replace(/\/$/, '')}${item.image}`,
      description: item.description
    }));
  } catch (err: any) {
    console.error('Error fetching images:', err);
    error.value = err.message || 'Failed to load images';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }
  
  await fetchImages();
});
</script> 