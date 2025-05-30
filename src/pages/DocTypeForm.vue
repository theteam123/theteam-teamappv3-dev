<template>
  <div class="p-8">
    <ErrorMessage />
    <SuccessMessage />
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
    <form v-else @submit.prevent="handleSubmit" class="space-y-6 bg-white rounded-lg sm:p-6">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="space-y-8">
          <div 
            v-for="(section, sectionIndex) in processedSections" 
            :key="sectionIndex" 
            :class="[
              'transition-all duration-200 ease-in-out',
              { 'opacity-0 h-0 overflow-hidden': section.hidden }
            ]"
          >
            <!-- Section Title -->
            <div v-if="section.title" class="mb-4 border-b border-gray-200 pb-2">
              <span class="text-lg font-semibold text-gray-700">{{ section.title }}</span>
            </div>
            
            <!-- Fields Grid -->
            <div :class="{
              'grid gap-6': true,
              'grid-cols-2': section.columnCount === 2,
              'grid-cols-1': section.columnCount <= 1
            }">
              <FormField
                v-for="field in section.fields"
                :key="field.fieldname"
                :field="field"
                v-model="formData[field.fieldname]"
                :formData="formData"
                :parentDocName="route.params.id as string"
                :geoLocationFields="field.label?.includes('[camera]') ? geoLocationFields : []"
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useSuccessStore } from '../stores/success';
import { getFormData, createDoctypeSubmission, getDocTypeData } from '../services/erpnext';
import { getErpNextApiUrl } from '../utils/api';
import { getCurrentToken } from '../services/oauth';
import {
  FileIcon,
  LoaderIcon,
  ArrowLeftIcon
} from 'lucide-vue-next';
import FormField from '../components/FormField.vue';
import { useFormSections } from '../composables/useFormSections';
import ErrorMessage from '../components/ErrorMessage.vue';
import SuccessMessage from '../components/SuccessMessage.vue';

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

interface GeolocationData {
  fieldname: string;
  label: string;
  value: string;
  type: 'lat' | 'lng' | 'address';
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const successStore = useSuccessStore();
const loading = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);
const docType = ref<DocType | null>(null);
const formData = ref<Record<string, any>>({});
const geoLocationFields = ref<GeolocationData[]>([]);

const { processedSections } = useFormSections(
  computed(() => docType.value?.fields),
  computed(() => formData.value)
);

const initializeGeolocationFields = (fields: DocTypeField[]) => {
  const geoFields: GeolocationData[] = [];
  
  fields.forEach(field => {
    if (field.fieldtype === 'Data') {
      const match = field.label.match(/\[geolocation-(.*?)\]/);
      if (match) {
        const type = match[1] as 'lat' | 'lng' | 'address';
        geoFields.push({
          fieldname: field.fieldname,
          label: field.label.replace(/\[.*?\]/g, '').trim(),
          value: formData.value[field.fieldname] || '',
          type
        });
      }
    }
  });
  
  geoLocationFields.value = geoFields;
};

const fetchDocType = async () => {
  try {
    const response = await getDocTypeData(route.params.id as string);
    console.log('DocType response:', response); // Debug log
    
    // Check if we have the expected data structure
    if (!response || !response.docs || !Array.isArray(response.docs) || response.docs.length === 0) {
      throw new Error('Invalid response format from DocType API');
    }

    const docTypeData = response.docs[0];
    
    docType.value = {
      name: docTypeData.name || route.params.id,
      description: docTypeData.description || '',
      fields: docTypeData.fields || []
    };
    
    // Initialize form data with empty values
    if (Array.isArray(docTypeData.fields)) {
      formData.value = docTypeData.fields.reduce((acc: Record<string, any>, field: DocTypeField) => {
        acc[field.fieldname] = '';
        return acc;
      }, {});
      
      // Initialize geolocation fields
      initializeGeolocationFields(docTypeData.fields);
    } else {
      console.warn('No fields found in DocType response');
      formData.value = {};
    }
  } catch (err: any) {
    console.error('Error fetching DocType:', err);
    error.value = err.message;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  error.value = null;

  try {
    const formDataToSubmit = { ...formData.value };
    
    const multipleUploadFields = docType.value?.fields.filter(
      field => field.fieldtype === 'Table' && field.label.toLowerCase().includes('[multiple-upload]')
    ) || [];

    const response = await createDoctypeSubmission(route.params.id as string, formDataToSubmit);
    
    // Show success message
    successStore.showSuccess('Form submitted successfully!');
    
    // Wait a brief moment for the success message to be visible
    setTimeout(() => {
      router.push(`/doctypes/${route.params.id}`);
    }, 1000);
  } catch (err: any) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
};

// Add watcher for formData to update geolocation field values
watch(() => formData.value, (newFormData) => {
  geoLocationFields.value = geoLocationFields.value.map(field => ({
    ...field,
    value: newFormData[field.fieldname]?.toString() || ''
  }));
}, { deep: true });

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

<style>
.grid-cols-1 {
  grid-template-columns: 1fr;
}

.grid-cols-2 {
  grid-template-columns: 1fr 1fr;
}
</style> 