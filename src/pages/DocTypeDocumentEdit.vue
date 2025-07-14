<template>
  <div class="container mx-auto px-4 py-8">
    <SuccessMessage />
    <!-- Page Title -->
    <div class="mb-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Edit {{ docType?.name }}</h1>
          <p class="text-sm text-gray-500 mt-1" v-if="!docType?.description?.includes('[redirect:')">{{ docType?.description }}</p>
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

    <!-- Edit Form -->
    <div v-else class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6 bg-white rounded-lg p-6">
        <div class="space-y-8">
          <!-- Tabs -->
          <div v-if="processedSections.hasTabs" class="border-b border-gray-200">
            <!-- Tab Progress Indicator -->
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Edit Progress</h3>
              <span class="text-sm text-gray-500">
                Step {{ currentTabIndex + 1 }} of {{ processedSections.tabs.length }}
              </span>
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
                  <div class="flex items-center justify-between">
                    <span class="text-lg font-semibold text-gray-700">{{ section.title }}</span>
                    <button
                      v-if="section.collapsible"
                      @click="toggleSectionCollapse(sectionIndex, tab.id)"
                      class="text-gray-500 hover:text-gray-700 transition-colors"
                      type="button"
                    >
                      <ChevronDownIcon 
                        :class="[
                          'w-5 h-5 transition-transform duration-200',
                          { 'rotate-180': !section.collapsed }
                        ]"
                      />
                    </button>
                  </div>
                </div>
                
                <!-- Fields Grid -->
                <div 
                  :class="[
                    'transition-all duration-300 ease-in-out',
                    section.collapsible ? 'overflow-hidden' : '',
                    section.collapsed && section.collapsible ? 'max-h-0 opacity-0' : section.collapsible ? ' opacity-100' : ''
                  ]"
                >
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
                      :disabled="!canEditDocument"
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
                <div class="flex items-center justify-between">
                  <span class="text-lg font-semibold text-gray-700">{{ section.title }}</span>
                  <button
                    v-if="section.collapsible"
                    @click="toggleSectionCollapse(sectionIndex)"
                    class="text-gray-500 hover:text-gray-700 transition-colors"
                    type="button"
                  >
                    <ChevronDownIcon 
                      :class="[
                        'w-5 h-5 transition-transform duration-200',
                        { 'rotate-180': !section.collapsed }
                      ]"
                    />
                  </button>
                </div>
              </div>
              
              <!-- Fields Grid -->
              <div 
                :class="[
                  'transition-all duration-300 ease-in-out',
                  section.collapsible ? 'overflow-hidden' : '',
                  section.collapsed && section.collapsible ? 'max-h-0 opacity-0' : section.collapsible ? 'max-h-96 opacity-100' : ''
                ]"
              >
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
                    :disabled="!canEditDocument"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="flex justify-between">
          <!-- Left side - Cancel button -->
          <button
            type="button"
            @click="router.back()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>

          <!-- Right side - Navigation and Submit buttons -->
          <div class="flex gap-3">
            <!-- Tab Navigation Buttons -->
            <template v-if="processedSections.hasTabs">
              <!-- Previous Button -->
              <button
                type="button"
                @click="goToPreviousTab"
                :disabled="!canGoPrevious"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeftIcon class="w-4 h-4" />
                Previous
              </button>
              
              <!-- Next Button -->
              <button
                v-if="canGoNext"
                type="button"
                @click="goToNextTab"
                class="px-4 py-2 text-sm font-medium text-white btn-primary rounded-md flex items-center gap-2"
              >
                Next
                <ChevronRightIcon class="w-4 h-4" />
              </button>
              
              <!-- Submit Button (only on last tab) -->
              <button
                v-if="isLastTab"
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 text-sm font-medium text-white btn-primary rounded-md disabled:opacity-50"
              >
                <span v-if="submitting">
                  <LoaderIcon class="w-4 h-4 animate-spin inline mr-2" />
                  Saving...
                </span>
                <span v-else>Save Changes</span>
              </button>
            </template>
            
            <!-- Submit Button (for non-tabbed forms) -->
            <button
              v-else
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 text-sm font-medium text-white btn-primary rounded-md disabled:opacity-50"
            >
              <span v-if="submitting">
                <LoaderIcon class="w-4 h-4 animate-spin inline mr-2" />
                Saving...
              </span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormData, updateDoctypeSubmission, uploadFile, getDocTypeData } from '../services/erpnext';
import FormField from '../components/FormField.vue';
import { useFormSections } from '../composables/useFormSections';
import { useSuccessStore } from '../stores/success';
import { isEqual } from 'lodash';
import {
  ArrowLeftIcon,
  LoaderIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from 'lucide-vue-next';
import SuccessMessage from '../components/SuccessMessage.vue';
import { addWatermark } from '../utils/imageUtils';
import { initializeGeolocationFields, GeolocationData, initializeWatermarkFields, WatermarkConfig, parseDurationToSeconds, formatSecondsToDuration } from '../utils/formUtils';
import { downloadWatermarkedFiles } from '../utils/imageUtils';
import { setupDoctypeReactiveScripts } from '../utils/doctypeReactiveScripts';

interface DocTypeField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  hidden?: number;
  depends_on?: string;
  parent?: string;
  description?: string;
}

interface DocType {
  name: string;
  description: string;
  fields: DocTypeField[];
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
const watermarkConfigs = ref<WatermarkConfig[]>([]);
const filesToDownload = ref<Array<{ file: File; fieldname: string }>>([]);
const currentTab = ref<string>('');
const docTypeTable = ref<DocTypeField[]>([]);

// Add refs to store FormField component references
const formFieldRefs = ref<Record<string, any>>({});

const { processedSections, toggleSectionCollapse } = useFormSections(
  computed(() => docType.value?.fields),
  computed(() => formData.value),
  computed(() => docTypeTable.value)
);

// Set initial tab when form loads
watch(() => processedSections.value, (newValue) => {
  if (newValue.hasTabs && newValue.tabs.length > 0 && !currentTab.value) {
    currentTab.value = newValue.tabs[0].id;
  }
}, { immediate: true });

const fetchDocTypeAndDocument = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Fetch DocType metadata
    const response = await getDocTypeData(route.params.id as string);
    // console.log('DocType response:', response);
    
    if (!response || !response.docs || !Array.isArray(response.docs) || response.docs.length === 0) {
      throw new Error('Invalid response format from DocType API');
    }
    // const docTypeResponse = await getFormData('DocType', route.params.id as string);
    
    // const fields = docTypeResponse.data.fields || [];
    const docTypeData = response.docs[0];
    docTypeTable.value = response.docs.filter(doc => doc.istable === 1);

    docType.value = {
      name: docTypeData.name || route.params.id,
      description: docTypeData.description || '',
      fields: docTypeData.fields || []
    };


    // Fetch document data
    const documentResponse = await getFormData(route.params.id as string, route.params.documentId as string);
    
    if (documentResponse.data) {
      console.log('Document response:', documentResponse.data);
      console.log('Document response:', documentResponse.data.test_geolocation_field);
      // Convert Duration fields from seconds to string for editing
      const docData = JSON.parse(JSON.stringify(documentResponse.data));
      if (docType.value?.fields) {
        docType.value.fields.forEach(field => {
          if (field.fieldtype === 'Duration') {
            const val = docData[field.fieldname];
            if (typeof val === 'number' && !isNaN(val)) {
              docData[field.fieldname] = formatSecondsToDuration(val);
            }
          }
        });
      }
      formData.value = docData;
      originalFormData.value = JSON.parse(JSON.stringify(docData));
      
      // Initialize geolocation fields with the current form data
      geoLocationFields.value = initializeGeolocationFields(docType.value.fields, formData.value);
      
      // Initialize watermark fields
      watermarkConfigs.value = initializeWatermarkFields(docType.value.fields, formData.value);
      
      // Setup reactive scripts for this doctype
      setupDoctypeReactiveScripts(docType.value.name, formData, docType);
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

const saveAllSignatures = () => {
  // Find all signature fields and save their current state using refs
  const signatureFields = docType.value?.fields.filter(field => field.fieldtype === 'Signature') || [];
  console.log('Found signature fields:', signatureFields);
  
  for (const field of signatureFields) {
    const fieldRef = formFieldRefs.value[field.fieldname];
    if (fieldRef && typeof fieldRef.saveCurrentSignature === 'function') {
      console.log(`Found signature component for ${field.fieldname}`);
      const signatureData = fieldRef.saveCurrentSignature();
      console.log(`Signature data for ${field.fieldname}:`, signatureData ? 'has data' : 'no data');
      if (signatureData) {
        formData.value[field.fieldname] = signatureData;
        console.log(`Updated formData[${field.fieldname}] with signature`);
      }
    } else {
      console.log(`No signature component found for ${field.fieldname}`);
    }
  }
};

const handleSubmit = async () => {
  // Save all signature fields before checking for changes
  saveAllSignatures();
  
  // Check if there are any changes
  console.log('formData.value', formData.value);
  console.log('originalFormData.value', originalFormData.value);
  
  // Debug: Check which fields are different
  const changedFields = Object.keys(formData.value).filter(key => {
    return formData.value[key] !== originalFormData.value[key];
  });
  console.log('Changed fields:', changedFields);
  
  if (isEqual(formData.value, originalFormData.value)) {
    // console.log('No changes detected');
    successStore.showSuccess('No changes to save');
    setTimeout(() => {
      // router.back();
    }, 1500);
    return;
  }

  submitting.value = true;
  error.value = '';
  filesToDownload.value = [];

  try {
    const formDataToSubmit = { ...formData.value };

    // Fix: Clean up phone fields and duration fields before submission
    docType.value?.fields.forEach(field => {
      if (field.fieldtype === 'Phone') {
        const val = formDataToSubmit[field.fieldname];
        // Ensure phone field is a string, not an event object
        if (val && typeof val === 'object') {
          console.warn(`Phone field "${field.fieldname}" contains object instead of string:`, val);
          // Try to extract phone number from common object patterns
          formDataToSubmit[field.fieldname] = val.number || val.phone || val.value || '';
        } else if (val === null || val === undefined) {
          formDataToSubmit[field.fieldname] = '';
        }
      } else if (field.fieldtype === 'Duration') {
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
        uploading.value = true;
        uploadProgress.value = 0;
        
        // Set progress to indicate upload is starting
        uploadProgress.value = 10;

        // Add watermark if needed
        let fileToUpload = imageData.file;
        if (imageData.needsWatermark) {
          uploadProgress.value = 30;
          
          // Find watermark config for this field
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
        await updateDoctypeSubmission(
          route.params.id as string,
          route.params.documentId as string,
          formDataToSubmit
        );

        // Show success message
        successStore.showSuccess('Document updated successfully');

        // Wait for 1.5 seconds before redirecting
        setTimeout(() => {
          router.push(`/documents/${route.params.id}`);
        }, 1500);
      }
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
      // Always try to download watermarked files, regardless of any previous errors
      if (filesToDownload.value.length > 0) {
        // console.log('Downloading watermarked files:', filesToDownload.value);
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

const canEditDocument = computed(() => {
  if (authStore.user?.roles?.includes('System Manager')) {
    return true;
  }
  return formData.value.owner === authStore.user?.email;
});

// Add computed properties for tab navigation
const currentTabIndex = computed(() => {
  if (!processedSections.value.hasTabs) return -1;
  return processedSections.value.tabs.findIndex(tab => tab.id === currentTab.value);
});

const isFirstTab = computed(() => {
  return currentTabIndex.value === 0;
});

const isLastTab = computed(() => {
  return currentTabIndex.value === processedSections.value.tabs.length - 1;
});

const canGoNext = computed(() => {
  return processedSections.value.hasTabs && !isLastTab.value;
});

const canGoPrevious = computed(() => {
  return processedSections.value.hasTabs && !isFirstTab.value;
});

// Add navigation methods
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

// Add watcher for formData to update watermark configs
watch(() => formData.value, (newFormData) => {
  // Update watermark configs when form data changes
  watermarkConfigs.value = initializeWatermarkFields(docType.value?.fields || [], newFormData);
}, { deep: true });

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }
  
  await fetchDocTypeAndDocument();
});
</script> 