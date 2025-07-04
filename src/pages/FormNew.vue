<template>
  <div class="p-8">
    <!-- Page Title -->
    <div class="mb-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">New {{ form?.title || 'Loading...' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ form?.description }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <Loader2Icon class="w-8 h-8 animate-spin text-green-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="max-w-3xl mx-auto">

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
            class="px-4 py-2 text-sm font-medium text-white btn-primary rounded-md hover:bg-green-700"
            :disabled="submitting"
          >
            {{ submitting ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
      </div>
    </form>

    <!-- Submitted Modal -->
    <div v-if="showSubmittedModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full flex flex-col items-center">
        <CheckCircle2Icon class="w-16 h-16 text-green-500 mb-4" />
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Submitted</h2>
        <p class="text-gray-600 mb-6 text-center">Thank you for spending your valuable time to fill this form</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <button @click="router.push(`/forms/${route.params.id}/submissions`)" class="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">See previous responses</button>
          <button @click="resetFormForNewSubmission" class="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Submit another response</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormData, createForm, getDocTypeData } from '../services/erpnext';
import FormField from '../components/FormField.vue';
import { useFormSections } from '../composables/useFormSections';
import {
  ArrowLeftIcon,
  Loader2Icon,
  CheckCircle2Icon
} from 'lucide-vue-next';

interface FormField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  hidden?: number;
  depends_on?: string;
}

interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

interface RawFormField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  hidden?: number;
  depends_on?: string;
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);
const form = ref<Form | null>(null);
const formData = ref<Record<string, any>>({});
const showSubmittedModal = ref(false);
const currentTab = ref<string>('');

// Add refs to store FormField component references
const formFieldRefs = ref<Record<string, any>>({});

const { processedSections } = useFormSections(computed(() => form.value?.fields));

const fetchFormData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Get the form data which includes the fields
    const response = await getFormData('Web Form', route.params.id as string);
    
    if (!response.data) {
      throw new Error('No form data received');
    }

    console.log('Raw API response:', response.data);
    console.log('Raw API response doctype:', response.data.doc_type);
    console.log('Raw API response doctype_meta:', response.data.web_form_fields);

    const response2 = await getDocTypeData(response.data.doc_type as string);

    console.log('Raw API response:', response2.docs[0]);
    console.log('Raw API response doctype_meta:', response2.docs[0].fields);

    // Get the fields from the web form's web_form_fields property
    let fields: RawFormField[] = [];
    try {
      if (response2.docs[0].fields) {
        // fields = response.data.web_form_fields;
        fields = response2.docs[0].fields;
      }
    } catch (err) {
      console.error('Error parsing fields:', err);
      fields = [];
    }

    form.value = {
      id: route.params.id as string,
      title: response.data.title || 'Job Creation Form',
      description: response.data.description || '',
      fields: fields.map((field: RawFormField) => ({
        fieldname: field.fieldname,
        label: field.label,
        fieldtype: field.fieldtype,
        reqd: field.reqd || 0,
        options: field.options || '',
        depends_on: field.depends_on,
        hidden: field.hidden || 0
      }))
    };
    
    // Initialize form data with empty values
    formData.value = {};
    form.value.fields.forEach((field: FormField) => {
      if (!['Section Break', 'Column Break'].includes(field.fieldtype) && !field.hidden) {
        formData.value[field.fieldname] = '';
      }
    });

    console.log('Form data:', response.data);
    console.log('Form fields:', fields);
    console.log('Processed form:', form.value);
    console.log('Processed sections:', processedSections.value);
  } catch (err: any) {
    console.error('Error fetching form data:', err);
    error.value = err.message || 'Failed to load form data';
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  error.value = null;

  try {
    // Save all signature fields before submission using refs
    const signatureFields = form.value?.fields.filter(field => field.fieldtype === 'Signature') || [];
    for (const field of signatureFields) {
      const fieldRef = formFieldRefs.value[field.fieldname];
      if (fieldRef && typeof fieldRef.saveCurrentSignature === 'function') {
        fieldRef.saveCurrentSignature();
      }
    }

    await createForm(route.params.id as string, formData.value);
    showSubmittedModal.value = true;
    // router.push(`/forms/${route.params.id}/submissions`); // We'll navigate from the modal
  } catch (err: any) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
};

const resetFormForNewSubmission = () => {
  showSubmittedModal.value = false;
  formData.value = {};
  // Re-initialize form fields
  if (form.value) {
    form.value.fields.forEach((field: FormField) => {
      if (!['Section Break', 'Column Break'].includes(field.fieldtype) && !field.hidden) {
        formData.value[field.fieldname] = '';
      }
    });
  }
};

// Set initial tab when form loads
watch(() => processedSections.value, (newValue) => {
  if (newValue.hasTabs && newValue.tabs.length > 0 && !currentTab.value) {
    currentTab.value = newValue.tabs[0].id;
  }
}, { immediate: true });

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }
  
  loading.value = true;
  await fetchFormData();
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