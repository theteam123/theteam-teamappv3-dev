<template>

  <div v-if="errorStore.message" class="fixed top-20 right-4 z-[9999]">
    <div 
      class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-xl min-w-[300px]"
      role="alert"
    >
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <AlertCircleIcon class="h-5 w-5 text-red-500" />
        </div>
        <div class="ml-3 flex-grow">
          <p class="text-sm font-medium text-red-700">
            {{ errorStore.message }}
          </p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              @click="clearError"
              class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
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
import { useErrorStore } from '../stores/error';
import { AlertCircleIcon, XIcon } from 'lucide-vue-next';
import { onMounted, watch } from 'vue';

const errorStore = useErrorStore();

const clearError = () => {
  errorStore.$patch({
    message: '',
    type: ''
  });
};

// Watch for changes to the error message
watch(() => errorStore.message, (newMessage) => {
  if (newMessage) {
    // Auto-hide after 5 seconds
    setTimeout(() => {
      clearError();
    }, 5000);
  }
});
</script> 