<template>
  <div class="p-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoaderIcon class="w-8 h-8 animate-spin text-green-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Roles List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="role in roles" :key="role.id" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ role.name }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ role.description }}</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="editRole(role)"
                class="text-gray-400 hover:text-gray-600"
              >
                <PencilIcon class="w-5 h-5" />
              </button>
              <button
                v-if="!role.is_system_role"
                @click="deleteRole(role)"
                class="text-gray-400 hover:text-red-600"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="permission in role.permissions"
                :key="permission"
                class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
              >
                {{ permission }}
              </span>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <UsersIcon class="w-4 h-4" />
            <span>{{ role.user_count }} Users</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Role Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Role' : 'Create New Role' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Role Name</label>
            <input
              type="text"
              v-model="formData.name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              v-model="formData.description"
              rows="2"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(group, category) in permissionGroups" :key="category" class="space-y-2">
                <h3 class="font-medium text-gray-900">{{ category }}</h3>
                <div class="space-y-2">
                  <label
                    v-for="permission in group"
                    :key="permission.key"
                    class="flex items-center space-x-3"
                  >
                    <input
                      type="checkbox"
                      :value="permission.key"
                      v-model="formData.permissions"
                      class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span class="text-sm text-gray-700">{{ permission.name }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              :disabled="loading"
            >
              {{ isEditing ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import {
  ShieldPlusIcon,
  PencilIcon,
  TrashIcon,
  LoaderIcon,
  UsersIcon,
} from 'lucide-vue-next';

const authStore = useAuthStore();
const loading = ref(false);
const error = ref(null);
const roles = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const formData = ref({
  id: '',
  name: '',
  description: '',
  permissions: [] as string[]
});

const permissionGroups = {
  'User Management': [
    { key: 'users.view', name: 'View Users' },
    { key: 'users.create', name: 'Create Users' },
    { key: 'users.edit', name: 'Edit Users' },
    { key: 'users.delete', name: 'Delete Users' }
  ],
  'Company Management': [
    { key: 'companies.view', name: 'View Companies' },
    { key: 'companies.create', name: 'Create Companies' },
    { key: 'companies.edit', name: 'Edit Companies' },
    { key: 'companies.delete', name: 'Delete Companies' }
  ],
  'Document Management': [
    { key: 'documents.view', name: 'View Documents' },
    { key: 'documents.create', name: 'Create Documents' },
    { key: 'documents.edit', name: 'Edit Documents' },
    { key: 'documents.delete', name: 'Delete Documents' }
  ],
  'Role Management': [
    { key: 'roles.view', name: 'View Roles' },
    { key: 'roles.create', name: 'Create Roles' },
    { key: 'roles.edit', name: 'Edit Roles' },
    { key: 'roles.delete', name: 'Delete Roles' }
  ]
};

const fetchRoles = async () => {
  loading.value = true;
  try {
    // TODO: Implement your data fetching logic here
    roles.value = [];
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const openCreateRoleModal = () => {
  isEditing.value = false;
  formData.value = {
    id: '',
    name: '',
    description: '',
    permissions: []
  };
  showModal.value = true;
};

const editRole = (role) => {
  isEditing.value = true;
  formData.value = {
    id: role.id,
    name: role.name,
    description: role.description || '',
    permissions: role.permissions
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const roleData = {
      name: formData.value.name,
      description: formData.value.description,
      is_system_role: false
    };

    if (isEditing.value) {
      // TODO: Implement your update logic here
    } else {
      // TODO: Implement your insert logic here
    }

    showModal.value = false;
    await fetchRoles();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const deleteRole = async (role) => {
  if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) return;

  loading.value = true;
  try {
    // TODO: Implement your delete logic here
    await fetchRoles();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRoles);
</script>