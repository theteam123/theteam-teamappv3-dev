<template>
  <div v-if="successStore.message" class="fixed top-20 right-4 z-[9999]">
    <div 
      class="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-xl min-w-[300px]"
      role="alert"
    >
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <CheckCircleIcon class="h-5 w-5 text-green-500" />
        </div>
        <div class="ml-3 flex-grow">
          <p class="text-sm font-medium text-green-700">
            {{ successStore.message }}
          </p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              @click="clearSuccess"
              class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            >
              <XIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSuccessStore } from '../stores/success';
import { CheckCircleIcon, XIcon } from 'lucide-vue-next';
import { watch } from 'vue';

const successStore = useSuccessStore();

const clearSuccess = () => {
  successStore.$patch({
    message: '',
  });
};

// Watch for changes to the success message
watch(() => successStore.message, (newMessage) => {
  if (newMessage) {
    // Auto-hide after 5 seconds
    setTimeout(() => {
      clearSuccess();
    }, 5000);
  }
});
</script> 