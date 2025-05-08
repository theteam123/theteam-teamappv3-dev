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
        <div class="space-y-6">
          <div v-for="field in form?.fields" :key="field.fieldname" class="space-y-2">
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
              v-model="formData[field.fieldname]"
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
              <option value="">Select an option</option>
              <option v-for="option in field.options?.split('\n').filter(Boolean)" :key="option" :value="option">
                {{ option }}
              </option>
            </select>

            <!-- Link Input -->
            <input
              v-else-if="field.fieldtype === 'Link'"
              :id="field.fieldname"
              v-model="formData[field.fieldname]"
              type="text"
              :required="field.reqd === 1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />

            <!-- Check Input -->
            <div v-else-if="field.fieldtype === 'Check'" class="flex items-center">
              <input
                :id="field.fieldname"
                v-model="formData[field.fieldname]"
                type="checkbox"
                :required="field.reqd === 1"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label :for="field.fieldname" class="ml-2 block text-sm text-gray-900">
                {{ field.label }}
              </label>
            </div>

            <!-- Text Area -->
            <textarea
              v-else-if="field.fieldtype === 'Small Text'"
              :id="field.fieldname"
              v-model="formData[field.fieldname]"
              rows="3"
              :required="field.reqd === 1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            ></textarea>

            <!-- File Upload -->
            <input
              v-else-if="field.fieldtype === 'Attach'"
              :id="field.fieldname"
              type="file"
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
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormData, createForm } from '../services/erpnext';
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

    // Get the fields from the web form's web_form_fields property
    let fields: RawFormField[] = [];
    try {
      if (response.data.web_form_fields) {
        fields = response.data.web_form_fields;
      }
    } catch (err) {
      console.error('Error parsing fields:', err);
      fields = [];
    }
    
    // Filter out layout fields and hidden fields
    const formFields = fields.filter(field => 
      !['Section Break', 'Column Break'].includes(field.fieldtype) && 
      !field.hidden
    );

    form.value = {
      id: route.params.id as string,
      title: response.data.title || 'Job Creation Form',
      description: response.data.description || '',
      fields: formFields.map((field: RawFormField) => ({
        fieldname: field.fieldname,
        label: field.label,
        fieldtype: field.fieldtype,
        reqd: field.reqd || 0,
        options: field.options || '',
        depends_on: field.depends_on
      }))
    };
    
    // Initialize form data with empty values
    formData.value = {};
    form.value.fields.forEach((field: FormField) => {
      formData.value[field.fieldname] = '';
    });

    console.log('Form data:', response.data);
    console.log('Form fields:', fields);
    console.log('Processed form:', form.value);
  } catch (err: any) {
    console.error('Error fetching form data:', err);
    error.value = err.message || 'Failed to load form data';
  } finally {
    loading.value = false;
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
      formData.value[field.fieldname] = '';
    });
  }
};

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