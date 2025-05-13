<template>
  <div class="space-y-2">
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
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
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
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
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
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
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
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
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
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
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
          :checked="modelValue"
          @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
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
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
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
        @change="handleFileUpload"
        :required="field.reqd === 1"
        class="mt-1 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-green-50 file:text-green-700
          hover:file:bg-green-100"
      />
    </template>

    <!-- Image Upload -->
    <template v-else-if="field.fieldtype === 'Attach Image'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1 flex items-center space-x-4">
        <input
          :id="field.fieldname"
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          :required="field.reqd === 1"
          class="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100"
        />
        <div v-if="imagePreview" class="relative h-20 w-20">
          <img :src="imagePreview" alt="Preview" class="h-full w-full rounded-md object-cover" />
          <button
            @click="clearImage"
            class="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

interface FormField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  hidden?: number;
  depends_on?: string;
}

const props = defineProps<{
  field: FormField;
  modelValue: any;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

const imagePreview = ref<string | null>(null);

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // TODO: Implement file upload to ERPNext
    // For now, just store the file name
    emit('update:modelValue', file.name);
  }
};

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // Create preview URL
    imagePreview.value = URL.createObjectURL(file);
    // TODO: Implement image upload to ERPNext
    // For now, just store the file name
    emit('update:modelValue', file.name);
  }
};

const clearImage = () => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
    imagePreview.value = null;
  }
  emit('update:modelValue', '');
};

// Cleanup preview URL when component is unmounted
onUnmounted(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
});
</script> 