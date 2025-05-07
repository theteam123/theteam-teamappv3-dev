<template>
  <div v-if="!authStore.isAuthenticated" class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="flex justify-center">
          <div class=" rounded-lg flex items-center justify-center">
            <img src="/theteamlogo with tag line.png" alt="Team App Logo" class="" />
          </div>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <!-- Debug Info -->
      <div v-if="showDebug" class="bg-gray-100 p-4 rounded-lg text-xs font-mono">
        <div class="font-semibold mb-2">Debug Info:</div>
        <div>Form State:</div>
        <pre>{{ {
          loading: authStore.loading,
          validationErrors: {
            email: emailError,
            password: passwordError,
            fullName: fullNameError
          }
        } }}</pre>
        <div class="mt-2">Auth Store State:</div>
        <pre>{{ {
          isAuthenticated: authStore.isAuthenticated,
          error: authStore.error,
          loading: authStore.loading
        } }}</pre>
        <button 
          @click="showDebug = false"
          class="mt-2 text-xs text-gray-500 hover:text-gray-700"
        >
          Hide Debug Info
        </button>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div v-if="authStore.error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <AlertCircleIcon class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Authentication Error</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ authStore.error }}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <LockIcon v-if="!authStore.loading" class="h-5 w-5 text-green-500 group-hover:text-green-400" />
              <LoaderIcon v-else class="h-5 w-5 text-green-500 group-hover:text-green-400 animate-spin" />
            </span>
            Login with ERPNext
          </button>
        </div>

        <div class="flex justify-end text-sm">
          <button
            type="button"
            @click="showDebug = true"
            class="font-medium text-gray-500 hover:text-gray-700"
          >
            Show Debug Info
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { LockIcon, LoaderIcon, AlertCircleIcon } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const showDebug = ref(false);

const emailError = ref('');
const passwordError = ref('');
const fullNameError = ref('');

const clearErrors = () => {
  emailError.value = '';
  passwordError.value = '';
  fullNameError.value = '';
  authStore.clearError();
};

const handleSubmit = async () => {
  try {
    await authStore.signIn();
  } catch (error) {
    console.error('Auth error:', error);
  }
};

// Add mounted hook to check authentication
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'home' });
  }
});
</script>