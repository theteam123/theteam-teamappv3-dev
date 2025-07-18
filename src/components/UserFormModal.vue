<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit User' : 'Create New User' }}</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="user-full-name" class="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            id="user-full-name"
            type="text"
            v-model="formData.full_name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label for="user-email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="user-email"
            type="email"
            v-model="formData.email"
            :disabled="isEditing"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label for="user-role" class="block text-sm font-medium text-gray-700">Role</label>
          <select
            id="user-role"
            v-model="formData.role_id"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          >
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white btn-primary rounded-md "
            :disabled="loading"
          >
            {{ isEditing ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  isEditing: Boolean,
  userData: Object
});

const emit = defineEmits(['close', 'submit']);

const authStore = useAuthStore();
const loading = ref(false);
const roles = ref([]);
const formData = ref({
  full_name: props.userData?.full_name || '',
  email: props.userData?.email || '',
  role_id: props.userData?.role_id || ''
});

const fetchRoles = async () => {
  try {
    // TODO: Replace with your new backend implementation
    roles.value = [];
  } catch (err) {
    console.error('Error fetching roles:', err);
  }
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    // TODO: Replace with your new backend implementation
    emit('submit');
  } catch (err) {
    console.error('Error submitting form:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRoles);
</script>