<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation Bar -->
    <div class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40">
      <!-- Toggle Button -->
      <button >
      </button>

      <!-- Center Logo -->
      <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <img 
        :src="logo" 
        alt="Team App Logo" 
        class="h-8"
        @error="console.error('Logo failed to load:', logo)"
        @load="console.log('Logo loaded:', logo)"
        />
      </div>

    </div>

    <!-- Main Content with adjusted padding for fixed header -->
    <div class="pt-20 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error Loading Form</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="submitted" class="bg-white shadow rounded-lg">
        <div class="text-center py-12">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="mt-2 text-lg font-medium text-gray-900">Form Submitted Successfully!</h3>
          <p class="mt-1 text-sm text-gray-500">Thank you for your submission. Your form has been processed.</p>
          
        </div>
      </div>

      <!-- Form -->
      <div v-else class="bg-white shadow rounded-lg">
        <!-- Form Header -->
        <div class="px-6 py-5 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">{{ docType?.name || 'Loading...' }}</h3>
          <p v-if="docType?.description && !docType.description.includes('[public-form]')" class="mt-1 text-sm text-gray-500">
            {{ docType.description }}
          </p>
        </div>

        <!-- Form Content -->
        <div class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Tabs -->
            <div v-if="processedSections.hasTabs" class="border-b border-gray-200">
              <!-- Tab Progress Indicator -->
              <div class="flex justify-between items-center mb-4">
                <h4 class="text-md font-medium text-gray-900">Progress</h4>
                <span class="text-sm text-gray-500">
                  Step {{ currentTabIndex + 1 }} of {{ processedSections.tabs.length }}
                </span>
              </div>
              
              <!-- Tab Progress Bar -->
              <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  class="bg-green-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${((currentTabIndex + 1) / processedSections.tabs.length) * 100}%` }"
                ></div>
              </div>
              
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
                class="space-y-6"
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
                  <div v-if="section.title" class="mb-4 pb-2 border-b border-gray-100">
                    <h5 class="text-md font-medium text-gray-800">{{ section.title }}</h5>
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
                        :ref="(el) => { if (el) formFieldRefs[field.fieldname] = el }"
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
                  'transition-all duration-200 ease-in-out space-y-6',
                  { 'opacity-0 h-0 overflow-hidden': section.hidden }
                ]"
              >
                <!-- Section Title -->
                <div v-if="section.title" class="mb-4 pb-2 border-b border-gray-100">
                  <h5 class="text-md font-medium text-gray-800">{{ section.title }}</h5>
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
                      :ref="(el) => { if (el) formFieldRefs[field.fieldname] = el }"
                      :field="field"
                      v-model="formData[field.fieldname]"
                      :formData="formData"
                      :parentDocName="route.params.id as string"
                    />
                  </div>
                </div>
              </div>
            </template>

            <!-- Form Actions -->
            <div class="flex justify-between items-center pt-6 border-t border-gray-200">
              <!-- Left side - Back to website or info -->
              <div class="text-sm text-gray-500">
              </div>

              <!-- Right side - Navigation and Submit buttons -->
              <div class="flex gap-3">
                <!-- Tab Navigation Buttons -->
                <template v-if="processedSections.hasTabs">
                  <!-- Previous Button -->
                  <button
                    type="button"
                    @click="goToPreviousTab"
                    :disabled="!canGoPrevious"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeftIcon class="w-4 h-4" />
                    Previous
                  </button>
                  
                  <!-- Next Button -->
                  <button
                    v-if="canGoNext"
                    type="button"
                    @click="goToNextTab"
                    class="px-4 py-2 text-sm font-medium text-white btn-primary rounded-md hover:bg-green-700 flex items-center gap-2"
                  >
                    Next
                    <ChevronRightIcon class="w-4 h-4" />
                  </button>
                  
                  <!-- Submit Button (only on last tab) -->
                  <button
                    v-if="isLastTab"
                    type="submit"
                    :disabled="submitting"
                    class="px-6 py-2 text-sm font-medium text-white btn-primary rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ submitting ? 'Submitting...' : 'Submit Form' }}
                  </button>
                </template>
                
                <!-- Submit Button (for non-tabbed forms) -->
                <button
                  v-else
                  type="submit"
                  :disabled="submitting"
                  class="px-6 py-2 text-sm font-medium text-white btn-primary rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ submitting ? 'Submitting...' : 'Submit Form' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-12 py-4 px-8 border-t border-gray-200 bg-white">
      <div class="text-center text-sm text-gray-500 flex items-center justify-center gap-1">
        Powered by <a href="https://theteam.net.au" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:text-green-700 inline-flex items-center">
          <img 
            src="/TeamLogo.png" 
            alt="Team App Logo" 
            class="h-3" 
          />
        </a>
      </div>
    </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getDocTypeData, createDoctypeSubmission, uploadFile } from '../services/erpnext';
import { getLogo } from '../config/domains';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  HelpCircleIcon
} from 'lucide-vue-next';
import FormField from '../components/FormField.vue';
import { useFormSections } from '../composables/useFormSections';
import { addWatermark } from '../utils/imageUtils';
import { initializeGeolocationFields, GeolocationData } from '../utils/formUtils';
import { initializeWatermarkFields, WatermarkConfig } from '../utils/formUtils';
import { downloadWatermarkedFiles } from '../utils/imageUtils';
import { parseDurationToSeconds } from '../utils/formUtils';

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
const loading = ref(false);
const submitting = ref(false);
const submitted = ref(false);
const error = ref<string | null>(null);
const docType = ref<DocType | null>(null);
const docTypeTable = ref<DocTypeField[]>([]);
const formData = ref<Record<string, any>>({});
const geoLocationFields = ref<GeolocationData[]>([]);
const watermarkConfigs = ref<WatermarkConfig[]>([]);
const filesToDownload = ref<Array<{ file: File; fieldname: string }>>([]);
const currentTab = ref<string>('');

// Add refs to store FormField component references
const formFieldRefs = ref<Record<string, any>>({});

// Logo computed property
const logo = computed(() => {
  const logoPath = getLogo();
  console.log('Logo path:', logoPath);
  return logoPath;
});

// Navigation functions
const toggleSidebar = () => {
  // For public forms, we might want to redirect to home or show a menu
  router.push('/');
};

// Debug mounted to check if components are loaded
onMounted(() => {
  console.log('Component mounted');
  console.log('Logo:', logo.value);
  console.log('MenuIcon:', MenuIcon);
  console.log('HelpCircleIcon:', HelpCircleIcon);
});

const { processedSections } = useFormSections(
  computed(() => docType.value?.fields),
  computed(() => formData.value),
  computed(() => docTypeTable.value)
);

// Add computed properties for tab navigation
const currentTabIndex = computed(() => {
  if (!processedSections.value.hasTabs) return -1;
  return processedSections.value.tabs.findIndex(tab => tab.id === currentTab.value);
});

const isLastTab = computed(() => {
  return currentTabIndex.value === processedSections.value.tabs.length - 1;
});

const canGoNext = computed(() => {
  return processedSections.value.hasTabs && !isLastTab.value;
});

const canGoPrevious = computed(() => {
  return processedSections.value.hasTabs && currentTabIndex.value > 0;
});

const fetchDocType = async () => {
  try {
    // Check for required form_token parameter
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.search);
    const formToken = urlParams.get('form_token');
    const expectedToken = (import.meta as any).env.VITE_PUBLIC_FORM_TOKEN;
    
    if (!formToken) {
      throw new Error('Access denied: form_token parameter is required');
    }
    
    if (formToken !== expectedToken) {
      throw new Error('Access denied: Invalid form token');
    }
    
    const response = await getDocTypeData(route.params.id as string, 'public');
    
    if (!response || !response.docs || !Array.isArray(response.docs) || response.docs.length === 0) {
      throw new Error('Form not found or is not available for public access');
    }
    
    const docTypeData = response.docs[0];
    docTypeTable.value = response.docs.filter(doc => doc.istable === 1);

    // Check if the form is marked as public
    const description = docTypeData.description || '';
    if (!description.includes('[public-form]')) {
      throw new Error('This form requires login to access. Please login to view this form.');
    }

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
      geoLocationFields.value = initializeGeolocationFields(docTypeData.fields, formData.value);
      
      // Initialize watermark fields
      watermarkConfigs.value = initializeWatermarkFields(docTypeData.fields, formData.value);
      
      // Load form data from URL parameters after initialization
      loadFormDataFromURL();
    } else {
      formData.value = {};
    }
  } catch (err: any) {
    console.error('Error fetching DocType:', err);
    error.value = err.message || 'Unable to load form. Please try again later.';
  }
};

const resetForm = () => {
  submitted.value = false;
  error.value = null;
  
  // Reset form data
  if (docType.value?.fields) {
    formData.value = docType.value.fields.reduce((acc: Record<string, any>, field: DocTypeField) => {
      acc[field.fieldname] = '';
      return acc;
    }, {});
  }
  
  // Reset to first tab
  if (processedSections.value.hasTabs && processedSections.value.tabs.length > 0) {
    currentTab.value = processedSections.value.tabs[0].id;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  error.value = null;
  filesToDownload.value = [];

  try {
    // Save all signature fields before submission using refs
    const signatureFields = docType.value?.fields.filter(field => field.fieldtype === 'Signature') || [];
    for (const field of signatureFields) {
      const fieldRef = formFieldRefs.value[field.fieldname];
      if (fieldRef && typeof fieldRef.saveCurrentSignature === 'function') {
        fieldRef.saveCurrentSignature();
      }
    }

    const formDataToSubmit = { ...formData.value };

    // Convert duration strings to seconds
    docType.value?.fields.forEach(field => {
      if (field.fieldtype === 'Duration') {
        const val = formDataToSubmit[field.fieldname];
        if (val === '') {
          formDataToSubmit[field.fieldname] = null;
        } else if (typeof val === 'string') {
          formDataToSubmit[field.fieldname] = parseDurationToSeconds(val);
        }
      }
    });

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
        // Add watermark if needed
        let fileToUpload = imageData.file;
        if (imageData.needsWatermark) {
          const watermarkConfig = watermarkConfigs.value.find(config => 
            config.imageFieldName === field.fieldname
          );

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
            return;
          }
        }
        
        try {
          const response = await uploadFile(
            fileToUpload,
            field.parent || '',
            route.params.id as string,
            false
          );
          
          formDataToSubmit[field.fieldname] = response.message.file_url;
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
          error.value = `Failed to upload image for ${field.label}: ${uploadErr.message}`;
          return;
        }
      } catch (err) {
        console.error('Error processing image:', err);
        error.value = `Failed to process image for ${field.label}: ${err.message}`;
        return;
      }
    }

    // Submit form
    await createDoctypeSubmission(route.params.id as string, formDataToSubmit, 'public');
    
    // Show success state
    submitted.value = true;
    
    // Download watermarked files if any
    if (filesToDownload.value.length > 0) {
      downloadWatermarkedFiles(filesToDownload.value.map(fileData => ({
        file: fileData.file,
        fieldname: fileData.fieldname,
        docTypeId: route.params.id as string
      })));
    }

  } catch (err: any) {
    console.error('Form submission error:', err);
    error.value = err.message || 'Failed to submit form. Please try again.';
  } finally {
    submitting.value = false;
    filesToDownload.value = [];
  }
};

// Watch for form data changes
watch(() => formData.value, (newFormData) => {
  geoLocationFields.value = geoLocationFields.value.map(field => ({
    ...field,
    value: newFormData[field.fieldname]?.toString() || ''
  }));

  watermarkConfigs.value = initializeWatermarkFields(docType.value?.fields || [], newFormData);
}, { deep: true });

// Set initial tab when form loads
watch(() => processedSections.value, (newValue) => {
  if (newValue.hasTabs && newValue.tabs.length > 0 && !currentTab.value) {
    currentTab.value = newValue.tabs[0].id;
  }
}, { immediate: true });

// URL parameter handling
const loadFormDataFromURL = () => {
  const url = new URL(window.location.href);
  const urlParams = new URLSearchParams(url.search);
  
  urlParams.forEach((value, key) => {
    if (docType.value?.fields.some(field => field.fieldname === key)) {
      formData.value[key] = value;
    }
  });
};

// Navigation methods
const goToNextTab = () => {
  if (canGoNext.value) {
    const nextIndex = currentTabIndex.value + 1;
    currentTab.value = processedSections.value.tabs[nextIndex].id;
  }
};

const goToPreviousTab = () => {
  if (canGoPrevious.value) {
    const prevIndex = currentTabIndex.value - 1;
    currentTab.value = processedSections.value.tabs[prevIndex].id;
  }
};

onMounted(async () => {
  // No authentication required for public form
  loading.value = true;
  
  await fetchDocType();
  loading.value = false;
});
</script>