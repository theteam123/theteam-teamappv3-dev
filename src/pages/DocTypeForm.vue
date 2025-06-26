<template>
  <div class="container mx-auto px-4 py-8">
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
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6 bg-white rounded-lg sm:p-6">

      <div class="bg-white shadow rounded-lg p-6">
        <div class="space-y-8">
          <!-- Tabs -->
          <div v-if="processedSections.hasTabs" class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                v-for="tab in processedSections.tabs"
                :key="tab.id"
                type="button"
                @click="currentTab = tab.id"
                :class="[
                  currentTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                ]"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <template v-if="processedSections.hasTabs">
            <div
              v-for="tab in processedSections.tabs"
              :key="tab.id"
              v-show="currentTab === tab.id"
              class="space-y-8"
            >
              <div 
                v-for="(section, sectionIndex) in tab.sections" 
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
                <div>
                  <!-- Column Labels -->
                  <div v-if="section.columnLabels.length > 0" :class="{
                    'grid gap-6 mb-4': true,
                    'grid-cols-2': section.columnCount === 2,
                    'grid-cols-1': section.columnCount <= 1
                  }">
                    <div v-for="(label, idx) in section.columnLabels" :key="idx" class="text-sm font-medium text-gray-700">
                      {{ label }}
                    </div>
                  </div>
                  
                  <!-- Fields -->
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
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Non-tabbed content -->
          <template v-else>
            <div 
              v-for="(section, sectionIndex) in processedSections.sections" 
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
              <div>
                <!-- Column Labels -->
                <div v-if="section.columnLabels.length > 0" :class="{
                  'grid gap-6 mb-4': true,
                  'grid-cols-2': section.columnCount === 2,
                  'grid-cols-1': section.columnCount <= 1
                }">
                  <div v-for="(label, idx) in section.columnLabels" :key="idx" class="text-sm font-medium text-gray-700">
                    {{ label }}
                  </div>
                </div>
                
                <!-- Fields -->
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
                  />
                </div>
              </div>
            </div>
          </template>
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
            class="px-4 py-2 text-sm font-medium text-white btn-primary rounded-md disabled:opacity-50"
          >
            {{ submitting ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useSuccessStore } from '../stores/success';
import { getFormData, createDoctypeSubmission, getDocTypeData, uploadFile } from '../services/erpnext';
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
import { addWatermark } from '../utils/imageUtils';
import { initializeGeolocationFields, GeolocationData } from '../utils/formUtils';
import { initializeWatermarkFields, WatermarkConfig } from '../utils/formUtils';
import { downloadWatermarkedFiles } from '../utils/imageUtils';

interface DocTypeField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  parent?: string;
}

interface DocType {
  name: string;
  description: string;
  fields: DocTypeField[];
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const successStore = useSuccessStore();
const loading = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);
const docType = ref<DocType | null>(null);
const docTypeTable = ref<DocTypeField[]>([]);
const formData = ref<Record<string, any>>({});
const geoLocationFields = ref<GeolocationData[]>([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const watermarkConfigs = ref<WatermarkConfig[]>([]);
const filesToDownload = ref<Array<{ file: File; fieldname: string }>>([]);
const currentTab = ref<string>('');

const { processedSections } = useFormSections(
  computed(() => docType.value?.fields),
  computed(() => formData.value),
  computed(() => docTypeTable.value)
);

// Add computed property to check if fields are prefilled
const hasPrefilledFields = computed(() => {
  const url = new URL(window.location.href);
  const urlParams = new URLSearchParams(url.search);
  
  return Array.from(urlParams.keys()).some(key => 
    docType.value?.fields.some(field => field.fieldname === key)
  );
});

const fetchDocType = async () => {
  try {
    const response = await getDocTypeData(route.params.id as string);
    console.log('DocType response:', response);
    
    if (!response || !response.docs || !Array.isArray(response.docs) || response.docs.length === 0) {
      throw new Error('Invalid response format from DocType API');
    }
    

    const docTypeData = response.docs[0];
    docTypeTable.value = response.docs.filter(doc => doc.istable === 1);

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
      // console.log('docTypeData.fields:', docTypeData.fields);
      geoLocationFields.value = initializeGeolocationFields(docTypeData.fields, formData.value);
      
      // Initialize watermark fields
      watermarkConfigs.value = initializeWatermarkFields(docTypeData.fields, formData.value);
      // console.log('watermarkConfigs:', watermarkConfigs.value);
      
      // Load form data from URL parameters after initialization
      loadFormDataFromURL();
    } else {
      // console.warn('No fields found in DocType response');
      formData.value = {};
    }
  } catch (err: any) {
    // console.error('Error fetching DocType:', err);
    error.value = err.message;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  error.value = null;
  filesToDownload.value = [];

  try {
    // Save all signature fields before submission
    const formFieldRefs = document.querySelectorAll('[data-form-field]');
    for (const fieldRef of formFieldRefs) {
      const vueComponent = (fieldRef as any).__vueParentComponent?.exposed;
      if (vueComponent && typeof vueComponent.saveCurrentSignature === 'function') {
        vueComponent.saveCurrentSignature();
      }
    }

    const formDataToSubmit = { ...formData.value };
    
    // Find all image fields that need to be uploaded
    const imageFields = docType.value?.fields.filter(
      field => (field.fieldtype === 'Attach Image' || field.fieldtype === 'Attach') && 
      formDataToSubmit[field.fieldname] && 
      typeof formDataToSubmit[field.fieldname] === 'object'
    ) || [];

    // Process all images first
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
        console.log('imageData:', imageData);
        if (imageData.needsWatermark) {
          uploadProgress.value = 30;
          
          // Find watermark config for this field
          const watermarkConfig = watermarkConfigs.value.find(config => 
            config.imageFieldName === field.fieldname
          );

          console.log('watermarkConfig:', watermarkConfig);

          try {
            fileToUpload = await addWatermark(imageData.file, {
              geoLocationFields: geoLocationFields.value,
              watermarkFields: watermarkConfig?.fields
            });

            // Store file for later download if autoDownload is true
            if (imageData.autoDownload) {
              filesToDownload.value.push({
                file: fileToUpload,
                fieldname: field.fieldname
              });
            }
          } catch (watermarkErr) {
            console.error('Error adding watermark:', watermarkErr);
            error.value = `Failed to add watermark for ${field.label}: ${watermarkErr.message}`;
            continue; // Skip upload but continue with next image
          }
        }
        
        uploadProgress.value = 50;
        
        try {
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
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
          error.value = `Failed to upload image for ${field.label}: ${uploadErr.message}`;
          // Don't return or break here, continue processing other images
        }
      } catch (err) {
        console.error('Error processing image:', err);
        error.value = `Failed to process image for ${field.label}: ${err.message}`;
        // Don't return or break here, continue processing other images
      }
    }

    try {
      // Only proceed with form submission if there were no upload errors
      if (!error.value) {
        const response = await createDoctypeSubmission(route.params.id as string, formDataToSubmit);
        // Show success message
        successStore.showSuccess('Form submitted successfully!');
        
        // Clear URL parameters after successful submission
        clearURLParameters();
        
        // Wait a brief moment for the success message to be visible
        setTimeout(() => {
          router.push(`/documents/${route.params.id}`);
        }, 1000);
      }
    } catch (err: any) {
      error.value = err.message;
    } finally {
      // Always try to download watermarked files, regardless of any previous errors
      if (filesToDownload.value.length > 0) {
        console.log('Downloading watermarked files:', filesToDownload.value);
        downloadWatermarkedFiles(filesToDownload.value.map(fileData => ({
          file: fileData.file,
          fieldname: fileData.fieldname,
          docTypeId: route.params.id as string
        })));
      }
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    submitting.value = false;
    uploading.value = false;
    uploadProgress.value = 0;
    filesToDownload.value = [];
  }
};

// Add watcher for formData to update geolocation field values
watch(() => formData.value, (newFormData) => {
  geoLocationFields.value = geoLocationFields.value.map(field => ({
    ...field,
    value: newFormData[field.fieldname]?.toString() || ''
  }));

  // Update watermark configs when form data changes
  watermarkConfigs.value = initializeWatermarkFields(docType.value?.fields || [], newFormData);
}, { deep: true });

// Set initial tab when form loads
watch(() => processedSections.value, (newValue) => {
  if (newValue.hasTabs && newValue.tabs.length > 0 && !currentTab.value) {
    currentTab.value = newValue.tabs[0].id;
  }
}, { immediate: true });

// Add URL parameter handling for form prefilling
// URL Parameters supported:
// - Any fieldname from the DocType can be used as a URL parameter
// - Example: ?swms_no=SWMS-TELCO-001&swms_version_no=6.0&project_name=Telco Project
// - The form will automatically prefill fields that match the URL parameters on page load
const loadFormDataFromURL = () => {
  const url = new URL(window.location.href);
  
  // Get all URL parameters
  const urlParams = new URLSearchParams(url.search);
  
  // Check if there are any parameters that match form fields
  let hasPrefilledData = false;
  
  urlParams.forEach((value, key) => {
    // Check if this parameter corresponds to a form field
    if (docType.value?.fields.some(field => field.fieldname === key)) {
      formData.value[key] = value;
      hasPrefilledData = true;
    }
  });
  
};

const clearURLParameters = () => {
  const url = new URL(window.location.href);
  
  // Remove all form-related parameters
  Object.keys(formData.value).forEach(fieldname => {
    url.searchParams.delete(fieldname);
  });
  
  // Update browser history without reloading the page
  window.history.replaceState({}, '', url.toString());
};

// Add browser navigation handling
const handleBrowserNavigation = () => {
  loadFormDataFromURL();
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }
  
  // Add browser navigation event listener
  window.addEventListener('popstate', handleBrowserNavigation);
  
  loading.value = true;
  await fetchDocType();
  loading.value = false;
});

// Add cleanup for timeouts
onUnmounted(() => {
  // Remove browser navigation event listener
  window.removeEventListener('popstate', handleBrowserNavigation);
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