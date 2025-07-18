<template>
  <div class="p-8">
    <div class="flex items-center gap-4 mb-6">
      <button
        @click="router.push('/forms')"
        class="text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon class="w-6 h-6" />
      </button>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900">{{ form?.name }} Submissions</h1>
        <p class="text-sm text-gray-500 mt-1">View and manage form responses</p>
      </div>
      <div class="flex gap-3">
        <button
          v-if="submissions.length > 0"
          @click="exportToCsv"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <DownloadIcon class="w-5 h-5 mr-2" />
          Export CSV
        </button>
        <button
          v-if="form"
          @click="form && router.push(`/forms/${form.id}/new`)"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          New Submission
        </button>
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

    <!-- Empty State -->
    <div v-else-if="!form" class="text-center py-12">
      <ClipboardIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">Form not found</h3>
      <p class="mt-1 text-sm text-gray-500">Share this form to start collecting responses.</p>
      <div class="mt-6">
        <button
          v-if="form"
          @click="router.push(`/forms/${(form as Form).id}`)"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          New Submission
        </button>
      </div>
    </div>

    <!-- Submissions Table -->
    <div v-else-if="submissions.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Search Bar -->
      <div class="p-4 border-b border-gray-200">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search submissions..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <SearchIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
              <th
                v-for="field in form.fields.filter(f => !f.label.toLowerCase().includes('[action]'))"
                :key="field.label"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="sortBy(field.fieldname)"
              >
                <div class="flex items-center gap-1">
                  {{ field.label }}
                  <span v-if="sortField === field.fieldname" class="text-gray-400">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="sortBy('creation')"
              >
                <div class="flex items-center gap-1">
                  Submitted At
                  <span v-if="sortField === 'creation'" class="text-gray-400">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="submission in paginatedSubmissions" 
              :key="submission.id"
              :class="[
                canEditSubmission(submission) ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default',
                submission.data.owner === authStore.user?.email ? 'bg-green-50' : ''
              ]"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center gap-2">
                  <button
                    v-if="canEditSubmission(submission)"
                    @click.stop="router.push(`/forms/${form.id}/submissions/${submission.data.name}/edit`)"
                    class="text-white hover:text-green-600 border border-green-600 hover:bg-white btn-primary p-1 rounded"
                    title="Edit Submission"
                  >
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <template v-for="field in actionFields" :key="field.fieldname">
                    <a
                      v-if="submission.data[field.fieldname]"
                      :href="submission.data[field.fieldname]"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-gray-600 hover:text-green-600 hover:bg-white border border-green-600 btn-primary p-1 rounded text-white"
                      :title="field.label.replace('[action]', '').trim()"
                    >
                      <component 
                        :is="field.label.toLowerCase().includes('pdf') ? FileTextIcon : 
                             field.label.toLowerCase().includes('folder') ? FolderIcon : 
                             LinkIcon" 
                        class="w-5 h-5"
                      />
                    </a>
                  </template>
                </div>
              </td>
              <td
                v-for="field in form.fields.filter(f => !f.label.toLowerCase().includes('[action]'))"
                :key="field.label"
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
              >
                <template v-if="field.fieldtype === 'Signature' && submission.data[field.fieldname]">
                  <img 
                    :src="submission.data[field.fieldname]" 
                    alt="Signature" 
                    class="max-h-12 object-contain"
                  />
                </template>
                <template v-else>
                  {{ submission.data[field.fieldname] || '-' }}
                </template>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(submission.data.creation) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{ paginationStart }}</span>
              to
              <span class="font-medium">{{ paginationEnd }}</span>
              of
              <span class="font-medium">{{ totalItems }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous</span>
                <ChevronLeftIcon class="h-5 w-5" />
              </button>
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  currentPage === page
                    ? 'z-10 bg-green-50 border-green-500 text-green-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Next</span>
                <ChevronRightIcon class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <ClipboardIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No submissions yet</h3>
      <p class="mt-1 text-sm text-gray-500">Share this form to start collecting responses.</p>
      <div class="mt-6">
        <button
          v-if="form"
          @click="form && router.push(`/forms/${form.id}/new`)"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          New Submission
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { format } from 'date-fns';
import { getFormData, getFormSubmissions, updateFormSubmission } from '../services/erpnext';
import {
  ArrowLeftIcon,
  LoaderIcon,
  ClipboardIcon,
  TrashIcon,
  LinkIcon,
  DownloadIcon,
  PlusIcon,
  PencilIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
} from 'lucide-vue-next';

interface FormField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
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
const submissions = ref<Submission[]>([]);
const loading = ref(false);
const error = ref('');
const sortField = ref<string>('creation');
const sortDirection = ref<'asc' | 'desc'>('desc');
const searchQuery = ref('');

const itemsPerPage = 20;
const currentPage = ref(1);

const totalItems = computed(() => sortedSubmissions.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const paginationStart = computed(() => {
  if (totalItems.value === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, totalItems.value);
});

const displayedPages = computed(() => {
  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    
    let start = Math.max(2, currentPage.value - 1);
    let end = Math.min(totalPages.value - 1, currentPage.value + 1);
    
    if (currentPage.value <= 2) {
      end = 4;
    }
    if (currentPage.value >= totalPages.value - 1) {
      start = totalPages.value - 3;
    }
    
    if (start > 2) {
      pages.push('...');
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages.value - 1) {
      pages.push('...');
    }
    
    pages.push(totalPages.value);
  }
  
  return pages;
});

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedSubmissions.value.slice(start, end);
});

watch([searchQuery, sortField, sortDirection], () => {
  currentPage.value = 1;
});

const sortedSubmissions = computed(() => {
  if (!submissions.value) return [];
  
  let filtered = submissions.value;
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = submissions.value.filter(submission => {
      const fieldMatches = form.value?.fields.some(field => {
        const value = submission.data[field.fieldname];
        return value && value.toString().toLowerCase().includes(query);
      });

      const ownerMatch = submission.data.owner?.toLowerCase().includes(query);

      const dateMatch = formatDate(submission.data.creation).toLowerCase().includes(query);

      return fieldMatches || ownerMatch || dateMatch;
    });
  }
  
  return filtered.sort((a, b) => {
    let valueA = a.data[sortField.value];
    let valueB = b.data[sortField.value];

    if (sortField.value === 'creation') {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) return sortDirection.value === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
});

const fetchFormAndSubmissions = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const formResponse = await getFormData('Web Form', route.params.id as string);
    
    if (!formResponse.data) {
      throw new Error('No form data received');
    }

    console.log('Form Response:', formResponse.data);
    console.log('Form Response:', formResponse.data.show_list);

    let fields: any[] = [];

    if (formResponse.data.show_list == 1) {
      fields = formResponse.data.list_columns || [];
    } else {
      console.log('Form Response:', formResponse.data.web_form_fields);
      fields = formResponse.data.web_form_fields || [];
      console.log('Fields == :', fields);
    }

    console.log('Fields:', fields);

    
    const formFields = fields.filter(field => 
      !['Section Break', 'Column Break'].includes(field.fieldtype) && 
      !field.hidden
    );

    form.value = {
      id: route.params.id as string,
      name: formResponse.data.title || 'Untitled Form',
      description: formResponse.data.description || '',
      fields: formFields.map(field => ({
        fieldname: field.fieldname,
        label: field.label,
        fieldtype: field.fieldtype,
        reqd: field.reqd || 0,
        options: field.options || ''
      })),
      created_at: formResponse.data.creation
    };

    const submissionsResponse = await getFormSubmissions(route.params.id as string);
    
    if (submissionsResponse.data) {
      submissions.value = submissionsResponse.data.map((submission: any) => ({
        id: submission.name,
        form_id: submission.web_form,
        data: submission.data || {},
        submitted_by: submission.owner,
        submitted_by_name: submission.owner_name || submission.owner,
        created_at: submission.creation
      }));
    }

    console.log('Form:', form.value);
    console.log('Submissions:', submissions.value);
  } catch (err: any) {
    console.error('Error fetching form data:', err);
    error.value = err.message || 'Failed to load form data';
  } finally {
    loading.value = false;
  }
};

const copyFormLink = () => {
  if (!form.value) return;
  const link = `${window.location.origin}/forms/${form.value.id}`;
  navigator.clipboard.writeText(link);
};

const exportToCsv = () => {
  if (!form.value || !submissions.value.length) return;

  const headers = [
    ...form.value.fields.map(field => field.label),
    'Submitted By',
    'Submitted At'
  ];

  const rows = submissions.value.map(submission => [
    ...form.value!.fields.map(field => submission.data[field.fieldname] || ''),
    submission.data.name1,
    formatDate(submission.data.creation)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${form.value.name} Submissions.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatDate = (date: string) => {
  try {
    if (!date) return 'N/A';
    
    const parsedDate = new Date(date);
    
    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date:', date);
      return 'Invalid Date';
    }
    
    return format(parsedDate, 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const openEditModal = (submission: Submission) => {
  if (!form.value) return;
  router.push(`/forms/${form.value.id}/submissions/${submission.data.name}/edit`);
};

const canEditSubmission = (submission: Submission) => {
  if (authStore.user?.roles?.includes('System Manager')) {
    return true;
  }
  return submission.data.owner === authStore.user?.email;
};

const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
};

const actionFields = computed(() => {
  if (!form.value) return [];
  const fields = form.value.fields.filter(field => field.label.toLowerCase().includes('[action]'));
  console.log('Action Fields:', fields.map(f => ({ fieldname: f.fieldname, label: f.label })));
  return fields;
});

watch([submissions, actionFields], ([newSubmissions, fields]) => {
  if (newSubmissions.length > 0 && fields.length > 0) {
    console.log('Debug submissions and action fields:', {
      submissions: newSubmissions.map(s => ({
        name: s.data.name,
        actions: fields.map(f => ({
          fieldname: f.fieldname,
          value: s.data[f.fieldname]
        }))
      }))
    });
  }
}, { immediate: true });

onMounted(fetchFormAndSubmissions);
</script>