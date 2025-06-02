<template>
  <div class="p-8">
    <SuccessMessage />
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormData, updateDoctypeSubmission, uploadFile } from '../services/erpnext';
import FormField from '../components/FormField.vue';
import { useFormSections } from '../composables/useFormSections';
import { useSuccessStore } from '../stores/success';
import { isEqual } from 'lodash';
import {
  ArrowLeftIcon,
  LoaderIcon,
} from 'lucide-vue-next';
import SuccessMessage from '../components/SuccessMessage.vue';
import { addWatermark } from '../utils/imageUtils';

interface DocTypeField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  hidden?: number;
  depends_on?: string;
  parent?: string;
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

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const successStore = useSuccessStore();
const docType = ref<DocType | null>(null);
const formData = ref<Record<string, any>>({});
const originalFormData = ref<Record<string, any>>({});
const loading = ref(false);
const submitting = ref(false);
const error = ref('');
const uploading = ref(false);
const uploadProgress = ref(0);
const geoLocationFields = ref<GeolocationData[]>([]);

const { processedSections } = useFormSections(computed(() => docType.value?.fields));

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

watch(() => formData.value, (newFormData) => {
  geoLocationFields.value = geoLocationFields.value.map(field => ({
    ...field,
    value: newFormData[field.fieldname]?.toString() || ''
  }));
}, { deep: true });

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
        hidden: field.hidden || 0,
        parent: field.parent
      }))
    };

    // Initialize geolocation fields
    initializeGeolocationFields(docType.value.fields);

    // Fetch document data
    const documentResponse = await getFormData(route.params.id as string, route.params.documentId as string);
    
    if (documentResponse.data) {
      formData.value = JSON.parse(JSON.stringify(documentResponse.data));
      originalFormData.value = JSON.parse(JSON.stringify(documentResponse.data));
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
  // Check if there are any changes
  if (isEqual(formData.value, originalFormData.value)) {
    console.log('No changes detected');
    successStore.showSuccess('No changes to save');
    setTimeout(() => {
      router.back();
    }, 1500);
    return;
  }

  submitting.value = true;
  error.value = '';

  try {
    const formDataToSubmit = { ...formData.value };

    // Find all image fields that need to be uploaded
    const imageFields = docType.value?.fields.filter(
      field => (field.fieldtype === 'Attach Image' || field.fieldtype === 'Attach') && 
      formDataToSubmit[field.fieldname] && 
      typeof formDataToSubmit[field.fieldname] === 'object'
    ) || [];

    // Upload all images first
    for (const field of imageFields) {
      const imageData = formDataToSubmit[field.fieldname];
      if (!imageData.file) continue;

      try {
        uploading.value = true;
        uploadProgress.value = 0;
        
        // Set progress to indicate upload is starting
        uploadProgress.value = 10;

        // Add watermark if needed
        let fileToUpload = imageData.file;
        if (imageData.needsWatermark) {
          uploadProgress.value = 30;
          fileToUpload = await addWatermark(imageData.file, geoLocationFields.value);
        }
        
        uploadProgress.value = 50;
        
        const response = await uploadFile(
          fileToUpload,
          field.parent || '', // doctype
          route.params.id as string, // docname
          false // isPrivate
        );
        
        uploadProgress.value = 90;
        
        // Update the form data with the file URL
        formDataToSubmit[field.fieldname] = response.message.file_url;
        
        uploadProgress.value = 100;
      } catch (err) {
        console.error('Error uploading image:', err);
        error.value = `Failed to upload image for ${field.label}: ${err.message}`;
        submitting.value = false;
        return;
      }
    }

    console.log('Calling updateDoctypeSubmission');
    await updateDoctypeSubmission(
      route.params.id as string,
      route.params.documentId as string,
      formDataToSubmit
    );

    console.log('Update successful');
    // Show success message
    successStore.showSuccess('Document updated successfully');

    // Wait for 1.5 seconds before redirecting
    setTimeout(() => {
      router.push(`/doctypes/${route.params.id}`);
    }, 1500);
  } catch (err: any) {
    console.error('Update error:', err);
    let errorMsg = err.message || 'Failed to update document';

    if (err._server_messages) {
      try {
        const serverMessages = JSON.parse(err._server_messages);
        if (Array.isArray(serverMessages) && serverMessages.length > 0) {
          const msgObj = JSON.parse(serverMessages[0]);
          if (msgObj && msgObj.message) {
            errorMsg = msgObj.message;
          }
        }
      } catch (parseErr) {
        // Ignore parse errors, fallback to default errorMsg
      }
    }

    if (errorMsg.includes('TimestampMismatchError') || errorMsg.includes('Please refresh to get the latest document')) {
      error.value = 'This record was updated elsewhere. Please reload and try again.';
      await fetchDocTypeAndDocument();
    } else {
      error.value = errorMsg;
    }
  } finally {
    submitting.value = false;
    uploading.value = false;
    uploadProgress.value = 0;
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