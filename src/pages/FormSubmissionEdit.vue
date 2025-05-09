<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <button
              @click="router.back()"
              class="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon class="w-6 h-6" />
            </button>
            <h1 class="ml-4 text-xl font-semibold text-gray-900">Edit Submission</h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <LoaderIcon class="w-8 h-8 animate-spin text-green-600" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
        {{ error }}
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="saveEdit" class="space-y-6 bg-white shadow rounded-lg p-6">
        <div v-for="field in form?.fields" :key="field.fieldname" class="space-y-2">
          <!-- Section Break -->
          <template v-if="field.fieldtype === 'Section Break'">
            <div class="mt-8 mb-4 border-b border-gray-200 pb-2">
              <span v-if="field.label" class="text-lg font-semibold text-gray-700">{{ field.label }}</span>
            </div>
          </template>

          <!-- Text Input -->
          <template v-else-if="field.fieldtype === 'Data'">
            <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="field.reqd" class="text-red-500">*</span>
            </label>
            <input
              :id="field.fieldname"
              v-model="formData[field.fieldname]"
              type="text"
              :required="field.reqd === 1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </template>

          <!-- Number Input -->
          <template v-else-if="field.fieldtype === 'Int' || field.fieldtype === 'Float'">
            <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="field.reqd" class="text-red-500">*</span>
            </label>
            <input
              :id="field.fieldname"
              v-model="formData[field.fieldname]"
              type="number"
              :required="field.reqd === 1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </template>

          <!-- Date Input -->
          <template v-else-if="field.fieldtype === 'Date'">
            <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="field.reqd" class="text-red-500">*</span>
            </label>
            <input
              :id="field.fieldname"
              v-model="formData[field.fieldname]"
              type="date"
              :required="field.reqd === 1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </template>

          <!-- Select Input -->
          <template v-else-if="field.fieldtype === 'Select'">
            <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="field.reqd" class="text-red-500">*</span>
            </label>
            <select
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
          </template>

          <!-- Link Input -->
          <template v-else-if="field.fieldtype === 'Link'">
            <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="field.reqd" class="text-red-500">*</span>
            </label>
            <input
              :id="field.fieldname"
              v-model="formData[field.fieldname]"
              type="text"
              :required="field.reqd === 1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </template>

          <!-- Check Input -->
          <template v-else-if="field.fieldtype === 'Check'">
            <div class="flex items-center">
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
          </template>

          <!-- Text Area -->
          <template v-else-if="field.fieldtype === 'Small Text'">
            <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="field.reqd" class="text-red-500">*</span>
            </label>
            <textarea
              :id="field.fieldname"
              v-model="formData[field.fieldname]"
              rows="3"
              :required="field.reqd === 1"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            ></textarea>
          </template>

          <!-- File Upload -->
          <template v-else-if="field.fieldtype === 'Attach'">
            <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="field.reqd" class="text-red-500">*</span>
            </label>
            <input
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
          </template>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
          <button
            type="button"
            @click="router.back()"
            class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormData, getFormSubmissions, updateFormSubmission } from '../services/erpnext';
import {
  ArrowLeftIcon,
  LoaderIcon,
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
  name: string;
  description: string;
  fields: FormField[];
  created_at: string;
}

interface Submission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  submitted_by: string;
  submitted_by_name: string;
  created_at: string;
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const form = ref<Form | null>(null);
const formData = ref<Record<string, any>>({});
const loading = ref(false);
const error = ref('');

const handleFileUpload = async (event: Event, fieldname: string) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // TODO: Implement file upload to ERPNext
    // For now, just store the file name
    formData.value[fieldname] = file.name;
  }
};

const fetchFormAndSubmission = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const formResponse = await getFormData('Web Form', route.params.formId as string);
    
    if (!formResponse.data) {
      throw new Error('No form data received');
    }

    const fields = formResponse.data.web_form_fields || [];
    
    const formFields = fields.filter(field => 
      !['Column Break'].includes(field.fieldtype) && 
      !field.hidden
    );

    form.value = {
      id: route.params.formId as string,
      name: formResponse.data.title || 'Untitled Form',
      description: formResponse.data.description || '',
      fields: formFields.map(field => ({
        fieldname: field.fieldname,
        label: field.label,
        fieldtype: field.fieldtype,
        reqd: field.reqd || 0,
        options: field.options || '',
        depends_on: field.depends_on
      })),
      created_at: formResponse.data.creation
    };

    const submissionsResponse = await getFormSubmissions(route.params.formId as string);
    
    if (submissionsResponse.data) {
      const submission = submissionsResponse.data.find(
        (s: any) => s.name === route.params.submissionId || s.id === route.params.submissionId
      );
      
      if (submission) {
        formData.value = JSON.parse(JSON.stringify(submission.data || {}));
      } else {
        throw new Error('Submission not found');
      }
    }
  } catch (err: any) {
    console.error('Error fetching form data:', err);
    error.value = err.message || 'Failed to load form data';
  } finally {
    loading.value = false;
  }
};

const saveEdit = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await updateFormSubmission(
      route.params.formId as string,
      route.params.submissionId as string,
      formData.value
    );
    router.back();
  } catch (err: any) {
    let errorMsg = err.message || 'Failed to update submission';

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
      await fetchFormAndSubmission();
    } else {
      error.value = errorMsg;
    }

    console.error('Update error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchFormAndSubmission);
</script> 