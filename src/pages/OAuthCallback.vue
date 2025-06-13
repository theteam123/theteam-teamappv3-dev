<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Completing authentication...</p>
      </div>
      <div v-else-if="error" class="text-center">
        <div class="text-red-600 mb-4">
          <svg class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-red-600 mb-2">Authentication Error</h2>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <div class="bg-red-50 p-4 rounded-lg mb-4">
          <p class="text-sm text-red-800 font-mono break-all">{{ errorDetails }}</p>
        </div>
        <button
          @click="retry"
          class="mt-4 px-4 py-2 btn-primary text-white rounded hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref(null);
const errorDetails = ref(null);
const isProcessing = ref(false);

const handleCallback = async () => {
  // Prevent double processing
  if (isProcessing.value) {
    console.log('OAuth Callback - Already processing, skipping...');
    return;
  }
  
  isProcessing.value = true;
  
  try {
    // Check if we have a hash in the URL
    if (!window.location.hash) {
      throw new Error('No token received in URL hash');
    }

    // Parse the hash parameters
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    // Check for error parameters
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    if (error) {
      throw new Error(errorDescription || error);
    }

    // Get the token
    const token = params.get('access_token');
    if (!token) {
      throw new Error('No access token found in URL');
    }
    
    console.log('OAuth Callback - Token received:', token ? 'Present' : 'Missing');
    
    // Update auth store with token
    try {
      const success = await authStore.setToken(token);
      
      if (success) {
        console.log('OAuth Callback - Auth store updated successfully');
        // Clear the URL hash to prevent double processing
        window.history.replaceState(null, '', window.location.pathname);
        // Automatically redirect to home
        router.push('/');
      } else {
        throw new Error('Failed to update auth store - Token validation failed');
      }
    } catch (storeError) {
      console.error('OAuth Callback - Auth Store Error:', storeError);
      throw new Error(`Auth store update failed: ${storeError.message}`);
    }
  } catch (err) {
    console.error('OAuth Callback - Error:', err);
    error.value = err.message || 'Authentication failed';
    errorDetails.value = JSON.stringify({
      url: window.location.href,
      hash: window.location.hash,
      error: err.message,
      timestamp: new Date().toISOString(),
      domain: window.location.hostname
    }, null, 2);
    loading.value = false;
  } finally {
    isProcessing.value = false;
  }
};

const retry = () => {
  loading.value = true;
  error.value = null;
  errorDetails.value = null;
  handleCallback();
};

onMounted(() => {
  handleCallback();
});
</script> 