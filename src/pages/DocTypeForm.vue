<template>
  <div class="p-8">
    <!-- Page Title -->
    <div class="mb-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">New {{ docType?.name || 'Loading...' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ docType?.description }}</p>
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

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="max-w-3xl mx-auto">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="space-y-6">
          <div v-for="field in docType?.fields" :key="field.fieldname" class="space-y-2">
            <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="field.reqd" class="text-red-500">*</span>
            </label>
            
            <!-- Text Input -->
            <input
              v-if="field.fieldtype === 'Data'"
              :id="field.fieldname"
              v-model="formData[field.fieldname]"
              type="text"
              :required="field.reqd === 1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />

            <!-- Number Input -->
            <input
              v-else-if="field.fieldtype === 'Int' || field.fieldtype === 'Float'"
              :id="field.fieldname"
              v-model.number="formData[field.fieldname]"
              type="number"
              :required="field.reqd === 1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />

            <!-- Date Input -->
            <input
              v-else-if="field.fieldtype === 'Date'"
              :id="field.fieldname"
              v-model="formData[field.fieldname]"
              type="date"
              :required="field.reqd === 1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />

            <!-- Select Input -->
            <select
              v-else-if="field.fieldtype === 'Select'"
              :id="field.fieldname"
              v-model="formData[field.fieldname]"
              :required="field.reqd === 1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">Select {{ field.label }}</option>
              <option
                v-for="option in field.options?.split('\n')"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>

            <!-- Textarea Input -->
            <textarea
              v-else-if="field.fieldtype === 'Text'"
              :id="field.fieldname"
              v-model="formData[field.fieldname]"
              :required="field.reqd === 1"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            ></textarea>

            <!-- File Upload -->
            <div v-else-if="field.fieldtype === 'Attach' || field.fieldtype === 'Attach Image'">
              <input
                :id="field.fieldname"
                type="file"
                :accept="field.fieldtype === 'Attach Image' ? 'image/*' : undefined"
                @change="handleFileUpload($event, field.fieldname)"
                :required="field.reqd === 1"
                class="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
              />
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            @click="router.back()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {{ submitting ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormData, createForm } from '../services/erpnext';
import {
  FileIcon,
  LoaderIcon,
  ArrowLeftIcon
} from 'lucide-vue-next';

interface DocTypeField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
}

interface DocType {
  name: string;
  description: string;
  fields: DocTypeField[];
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);
const docType = ref<DocType | null>(null);
const formData = ref<Record<string, any>>({});

const fetchDocType = async () => {
  try {
    const response = await getFormData('DocType', route.params.id as string);
    docType.value = response.data;
    
    // Initialize form data with empty values
    formData.value = response.data.fields.reduce((acc: Record<string, any>, field: DocTypeField) => {
      acc[field.fieldname] = '';
      return acc;
    }, {});
  } catch (err: any) {
    console.error('Error fetching DocType:', err);
    error.value = err.message;
  }
};

const handleFileUpload = async (event: Event, fieldname: string) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // TODO: Implement file upload to ERPNext
    // For now, just store the file name
    formData.value[fieldname] = file.name;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  error.value = null;

  try {
    await createForm(route.params.id as string, formData.value);
    router.push(`/doctypes/${route.params.id}/documents`);
  } catch (err: any) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }
  
  loading.value = true;
  await fetchDocType();
  loading.value = false;
});
</script> 