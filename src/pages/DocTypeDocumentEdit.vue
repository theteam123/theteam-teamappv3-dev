<template>
  <div class="p-8">
    <!-- Page Title -->
    <div class="mb-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Edit {{ docType?.name }}</h1>
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

    <!-- Edit Form -->
    <div v-else class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6 bg-white rounded-lg p-6">
        <div class="space-y-8">
          <div v-for="section in processedSections" :key="section.title" class="space-y-4">
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
                :disabled="!canEditDocument"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4">
          <button
            type="button"
            @click="router.back()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <span v-if="submitting">
              <LoaderIcon class="w-4 h-4 animate-spin inline mr-2" />
              Saving...
            </span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormData, updateFormSubmission } from '../services/erpnext';
import FormField from '../components/FormField.vue';
import { useFormSections } from '../composables/useFormSections';
import {
  ArrowLeftIcon,
  LoaderIcon,
} from 'lucide-vue-next';

interface DocTypeField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  hidden?: number;
  depends_on?: string;
}

interface DocType {
  name: string;
  description: string;
  fields: DocTypeField[];
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const docType = ref<DocType | null>(null);
const formData = ref<Record<string, any>>({});
const loading = ref(false);
const submitting = ref(false);
const error = ref('');

const { processedSections } = useFormSections(computed(() => docType.value?.fields));

const fetchDocTypeAndDocument = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Fetch DocType metadata
    const docTypeResponse = await getFormData('DocType', route.params.id as string);
    
    if (!docTypeResponse.data) {
      throw new Error('No DocType data received');
    }

    const fields = docTypeResponse.data.fields || [];
    
    docType.value = {
      name: docTypeResponse.data.name || 'Untitled Document Type',
      description: docTypeResponse.data.description || '',
      fields: fields.map(field => ({
        fieldname: field.fieldname,
        label: field.label,
        fieldtype: field.fieldtype,
        reqd: field.reqd || 0,
        options: field.options || '',
        depends_on: field.depends_on,
        hidden: field.hidden || 0
      }))
    };

    // Fetch document data
    const documentResponse = await getFormData(route.params.id as string, route.params.documentId as string);
    
    if (documentResponse.data) {
      formData.value = JSON.parse(JSON.stringify(documentResponse.data));
    } else {
      throw new Error('Document not found');
    }
  } catch (err: any) {
    console.error('Error fetching document data:', err);
    error.value = err.message || 'Failed to load document data';
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  error.value = '';

  try {
    await updateFormSubmission(
      route.params.id as string,
      route.params.documentId as string,
      formData.value
    );
    router.push(`/doctypes/${route.params.id}`);
  } catch (err: any) {
    error.value = err.message || 'Failed to update document';
  } finally {
    submitting.value = false;
  }
};

const canEditDocument = computed(() => {
  if (authStore.user?.roles?.includes('System Manager')) {
    return true;
  }
  return formData.value.owner === authStore.user?.email;
});

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }
  
  await fetchDocTypeAndDocument();
});
</script> 