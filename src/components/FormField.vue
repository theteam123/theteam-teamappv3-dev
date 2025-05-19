<template>
  <div v-if="shouldShowField" class="space-y-2">
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

    <!-- Datetime Input -->
    <template v-else-if="field.fieldtype === 'Datetime'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <input
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="datetime-local"
        :required="field.reqd === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
      />
    </template>

    <!-- Time Input -->
    <template v-else-if="field.fieldtype === 'Time'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <input
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="time"
        :required="field.reqd === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
      />
    </template>

    <!-- Duration Input -->
    <template v-else-if="field.fieldtype === 'Duration'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="relative mt-1" ref="durationWrapperRef">
        <input
          :id="field.fieldname"
          :value="durationString"
          @focus="showDurationPopup = true; parseDurationString()"
          @input="onDurationInput($event)"
          type="text"
          :required="field.reqd === 1"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          autocomplete="off"
        />
        <div
          v-if="showDurationPopup"
          class="absolute z-10 mt-2 w-max bg-white border border-gray-200 rounded-md shadow-lg p-4 flex space-x-4"
        >
          <div class="flex flex-col items-center">
            <input type="number" min="0" v-model.number="durationParts.days" @input="onDurationPartChange" class="w-14 text-center border rounded p-1" />
            <span class="text-xs mt-1">days</span>
          </div>
          <div class="flex flex-col items-center">
            <input type="number" min="0" max="23" v-model.number="durationParts.hours" @input="onDurationPartChange" class="w-14 text-center border rounded p-1" />
            <span class="text-xs mt-1">hours</span>
          </div>
          <div class="flex flex-col items-center">
            <input type="number" min="0" max="59" v-model.number="durationParts.minutes" @input="onDurationPartChange" class="w-14 text-center border rounded p-1" />
            <span class="text-xs mt-1">minutes</span>
          </div>
          <div class="flex flex-col items-center">
            <input type="number" min="0" max="59" v-model.number="durationParts.seconds" @input="onDurationPartChange" class="w-14 text-center border rounded p-1" />
            <span class="text-xs mt-1">seconds</span>
          </div>
        </div>
      </div>
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
      <select
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        :required="field.reqd === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
      >
        <option value="">Select {{ field.label }}</option>
        <option v-for="option in linkOptions" :key="option.name" :value="option.name">
          {{ option.name }}
        </option>
      </select>
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

    <!-- Text Editor -->
    <template v-else-if="field.fieldtype === 'Text Editor'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1">
        <div class="prose prose-sm max-w-none">
          <textarea
            :id="field.fieldname"
            :value="modelValue"
            @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
            rows="6"
            :required="field.reqd === 1"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          ></textarea>
        </div>
      </div>
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

    <!-- Color Input -->
    <template v-else-if="field.fieldtype === 'Color'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1 flex items-center space-x-2">
        <input
          :id="field.fieldname"
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="color"
          :required="field.reqd === 1"
          class="h-8 w-8 rounded-md border-gray-300 p-1"
        />
        <input
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="text"
          :required="field.reqd === 1"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
      </div>
    </template>

    <!-- Currency Input -->
    <template v-else-if="field.fieldtype === 'Currency'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1 relative rounded-md shadow-sm">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-500 sm:text-sm">$</span>
        </div>
        <input
          :id="field.fieldname"
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="number"
          step="0.01"
          :required="field.reqd === 1"
          class="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
      </div>
    </template>

    <!-- Phone Input -->
    <template v-else-if="field.fieldtype === 'Phone'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <vue-tel-input
        v-model="phoneValue"
        :id="field.fieldname"
        :required="field.reqd === 1"
        @input="onPhoneInput"
        class="mt-1"
        :placeholder="'Enter phone number'"
        :mode="'international'"
        :dropdownOptions="{
          showDialCodeInList: true,
          showFlags: true,
          showSearchBox: true
        }"
        :inputOptions="{
          showDialCode: true,
          showFlags: true
        }"
        :showCountryFlag="true"
        :useEmoji="false"
        :enabledFlags="true"
        :preferredCountries="['US', 'GB', 'CA']"
      />
    </template>

    <!-- Password Input -->
    <template v-else-if="field.fieldtype === 'Password'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <input
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="password"
        :required="field.reqd === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
      />
    </template>

    <!-- Rating Input -->
    <template v-else-if="field.fieldtype === 'Rating'">
      <label class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1 flex items-center space-x-1">
        <button
          v-for="rating in 5"
          :key="rating"
          @click="$emit('update:modelValue', rating)"
          class="text-gray-300 hover:text-yellow-400 focus:outline-none"
          :class="{ 'text-yellow-400': modelValue >= rating }"
        >
          <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      </div>
    </template>

    <!-- Signature Input -->
    <template v-else-if="field.fieldtype === 'Signature'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1">
        <div class="border-2 border-dashed border-gray-300 rounded-md p-4">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <p class="mt-1 text-sm text-gray-600">
              Click to draw your signature
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Table Input -->
    <template v-else-if="field.fieldtype === 'Table'">
      <label class="block text-sm font-medium text-gray-700">
        {{ field.label }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1">
        <div class="border border-gray-300 rounded-md">
          <div class="px-4 py-3 bg-gray-50 border-b border-gray-300">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-700">{{ field.options }}</h3>
              <button
                type="button"
                class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Add Row
              </button>
            </div>
          </div>
          <div class="px-4 py-3">
            <p class="text-sm text-gray-500">No rows added yet</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch, onMounted, nextTick, computed } from 'vue';
import { VueTelInput } from 'vue-tel-input';
import 'vue-tel-input/dist/vue-tel-input.css';
import { getFormList } from '../services/erpnext';

interface FormField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  hidden?: number;
  depends_on?: string;
  max_length?: number;
  max_value?: number;
  precision?: string;
}

const props = defineProps<{
  field: FormField;
  modelValue: any;
  formData?: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

const imagePreview = ref<string | null>(null);
const showDurationPopup = ref(false);
const durationParts = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
const durationString = ref('');
const durationPopupRef = ref<HTMLElement | null>(null);
const durationWrapperRef = ref<HTMLElement | null>(null);
const phoneValue = ref(typeof props.modelValue === 'string' ? props.modelValue : '');
const linkOptions = ref<any[]>([]);

const shouldShowField = computed(() => {
  if (!props.field.depends_on) return true;
  
  const dependsOn = props.field.depends_on;
  if (!dependsOn.startsWith('eval:doc.')) return true;

  try {
    const condition = dependsOn.replace('eval:doc.', '');
    
    if (!condition.includes('!=') && !condition.includes('==')) {
      return !!props.formData?.[condition];
    }

    const [fieldName, operator, value] = condition.split(/(!=|==)/);
    const fieldValue = props.formData?.[fieldName.trim()];

    if (operator === '!=') {
      return fieldValue !== value.replace(/['"]/g, '');
    } else if (operator === '==') {
      return fieldValue === value.replace(/['"]/g, '');
    }

    return true;
  } catch (error) {
    console.error('Error evaluating field dependency:', error);
    return true;
  }
});

watch(() => props.modelValue, (val) => {
  durationString.value = typeof val === 'string' ? val : formatDurationString();
  if (typeof val === 'string' && val !== phoneValue.value) {
    phoneValue.value = val;
  }
});

durationString.value = typeof props.modelValue === 'string' ? props.modelValue : '';

function parseDurationString() {
  durationParts.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const str = durationString.value || '';
  const regex = /(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/;
  const match = str.match(regex);
  if (match) {
    durationParts.value.days = parseInt(match[1] || '0', 10);
    durationParts.value.hours = parseInt(match[2] || '0', 10);
    durationParts.value.minutes = parseInt(match[3] || '0', 10);
    durationParts.value.seconds = parseInt(match[4] || '0', 10);
  }
}

function formatDurationString() {
  const { days, hours, minutes, seconds } = durationParts.value;
  let str = '';
  if (days) str += `${days}d `;
  if (hours) str += `${hours}h `;
  if (minutes) str += `${minutes}m `;
  if (seconds) str += `${seconds}s`;
  return str.trim();
}

function onDurationInput(event: Event) {
  durationString.value = (event.target as HTMLInputElement).value;
  parseDurationString();
  emit('update:modelValue', durationString.value);
}

function onDurationPartChange() {
  durationString.value = formatDurationString();
  emit('update:modelValue', durationString.value);
}

function onPhoneInput(val: string) {
  emit('update:modelValue', val);
}

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    emit('update:modelValue', file.name);
  }
};

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    imagePreview.value = URL.createObjectURL(file);
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

function handleClickOutside(event: MouseEvent) {
  const wrapper = durationWrapperRef.value;
  if (wrapper && !wrapper.contains(event.target as Node)) {
    showDurationPopup.value = false;
  }
}

const fetchLinkOptions = async () => {
  if (props.field.fieldtype === 'Link' && props.field.options) {
    try {
      const response = await getFormList(props.field.options);
      linkOptions.value = response.data || [];
    } catch (error) {
      console.error('Error fetching link options:', error);
      linkOptions.value = [];
    }
  }
};

onMounted(() => {
  fetchLinkOptions();
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

defineExpose({ VueTelInput });
</script> 