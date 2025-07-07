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
            <DialogPanel :class="[
              'w-full transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all',
              isSingleImage ? 'max-h-[90vh] max-w-5xl' : 'p-6 max-w-7xl'
            ]">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 mb-4 px-6 pt-6">
                Images
              </DialogTitle>

              <!-- Loading State -->
              <div v-if="loading" class="flex justify-center items-center py-8">
                <LoaderIcon class="w-8 h-8 animate-spin text-green-600" />
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6 mx-6">
                {{ error }}
              </div>

              <!-- Single Image View -->
              <div v-else-if="isSingleImage && images.length > 0" class="flex flex-col">
                <div class="flex-1 overflow-hidden">
                  <img
                    :src="images[0].image"
                    :alt="images[0].description || 'Image'"
                    class="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>
                <div v-if="images[0].description" class="p-4 bg-gray-50">
                  <p class="text-sm text-gray-600">{{ images[0].description }}</p>
                </div>
              </div>

              <!-- Multiple Images Grid -->
              <div v-else-if="!isSingleImage" class="px-6">
                <div class="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <div v-for="image in images" :key="image.name" class="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div class="aspect-w-4 aspect-h-3 w-full overflow-hidden rounded-t-xl">
                      <a :href="image.image" target="_blank" rel="noopener noreferrer" class="block h-full w-full">
                        <img
                          :src="image.image"
                          :alt="image.description || 'Image'"
                          class="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        />
                      </a>
                    </div>
                    <div class="p-4" v-if="image.description">
                      <p class="text-sm text-gray-600 line-clamp-2">{{ image.description }}</p>
                    </div>
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-xl"></div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="!loading && !error && images.length === 0" class="text-center py-12">
                <ImageIcon class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">No images found</h3>
                <p class="mt-1 text-sm text-gray-500">No images available for this document.</p>
              </div>

              <div class="mt-6 flex justify-end px-6 pb-6">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent btn-primary px-4 py-2 text-sm font-medium text-white  focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
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
import { ref, onMounted, watch } from 'vue';
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
  fieldname: string;
  isSingleImage?: boolean;
  singleImageUrl?: string;
  singleImageName?: string;
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
    if (props.isSingleImage && props.singleImageUrl) {
      images.value = [{
        name: props.singleImageName || 'Image',
        image: `${getErpNextApiUrl().replace(/\/$/, '')}/` + props.singleImageUrl.replace(/^\//, ''),
      }];
    } else {
      // Fetch the parent document with its child table data
      const response = await getChildTableData(props.docTypeId, props.documentId);
      
      // Extract the images from the child table using the provided fieldname
      images.value = response.data[props.fieldname].map((item: any) => ({
        name: item.name,
        image: `${getErpNextApiUrl().replace(/\/$/, '')}/` + item.image.replace(/^\//, ''),
        description: item.description
      }));
    }
  } catch (err: any) {
    console.error('Error fetching images:', err);
    error.value = err.message || 'Failed to load images';
  } finally {
    loading.value = false;
  }
};

// Fetch images when component is mounted if modal is open
onMounted(() => {
  if (props.isOpen) {
    fetchImages();
  }
});

// Watch for changes in documentId or isOpen
watch(
  [() => props.documentId, () => props.isOpen],
  ([newDocId, newIsOpen], [oldDocId, oldIsOpen]) => {
    if (newIsOpen && (!oldIsOpen || newDocId !== oldDocId)) {
      fetchImages();
    }
  },
  { immediate: true }
);
</script> 