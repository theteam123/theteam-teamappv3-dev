<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 mb-4">
                Images
              </DialogTitle>

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

              <div class="mt-6 flex justify-end">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  @click="closeModal"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { LoaderIcon, ImageIcon } from 'lucide-vue-next';
import { getFormData, getChildTableData } from '../services/erpnext';
import { getErpNextApiUrl } from '../utils/api';

interface Image {
  name: string;
  image: string;
  description?: string;
}

const props = defineProps<{
  isOpen: boolean;
  docTypeId: string;
  documentId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const loading = ref(false);
const error = ref<string | null>(null);
const images = ref<Image[]>([]);

const closeModal = () => {
  emit('close');
};

const fetchImages = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Fetch DocType metadata
    const docTypeResponse = await getFormData('DocType', props.docTypeId);
    
    // Find the multiple_images field to get its options (child table name)
    const multipleImagesField = docTypeResponse.data.fields.find(
      (field: any) => field.fieldname === 'multiple_images' && field.fieldtype === 'Table'
    );

    if (!multipleImagesField?.options) {
      throw new Error('Multiple Images table configuration not found');
    }

    // Fetch the parent document with its child table data
    const response = await getChildTableData(props.docTypeId, props.documentId);
    
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

onMounted(() => {
  if (props.isOpen) {
    fetchImages();
  }
});
</script> 