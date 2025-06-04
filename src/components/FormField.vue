<template>
  <div :class="[
    'transition-all duration-200 ease-in-out',
    shouldShowField ? 'space-y-2' : 'hidden'
  ]">
    <!-- Section Break -->
    <template v-if="field.fieldtype === 'Section Break'">
      <div class="mt-8 mb-4 border-b border-gray-200 pb-2">
        <span v-if="field.label" class="text-lg font-semibold text-gray-700">{{ formattedLabel }}</span>
      </div>
    </template>

    <!-- Text Input -->
    <template v-else-if="field.fieldtype === 'Data'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="relative mt-1">
        <input
          :id="field.fieldname"
          :value="modelValue"
          @input="!isGeolocationField && $emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="text"
          :required="field.reqd === 1"
          :disabled="isGettingLocation || isGeolocationField || field.read_only === 1 || shouldAutoFillUserData"
          :readonly="isGeolocationField || field.read_only === 1 || shouldAutoFillUserData"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{ 
            'pr-10': isGeolocationField,
            'bg-gray-50': isGeolocationField || field.read_only === 1 || shouldAutoFillUserData,
            'cursor-not-allowed': isGeolocationField || field.read_only === 1 || shouldAutoFillUserData
          }"
          :placeholder="isGeolocationField ? 'Click the location icon to get current location' : ''"
        />
        <div v-if="isGeolocationField" class="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            v-if="!isGettingLocation"
            @click="getCurrentLocation"
            type="button"
            class="text-gray-400 hover:text-gray-500"
            title="Get current location"
          >
            <MapPinIcon class="h-5 w-5" />
          </button>
          <LoaderIcon v-else class="h-5 w-5 animate-spin text-gray-400" />
        </div>
      </div>
      <p v-if="locationError" class="mt-1 text-sm text-red-600">{{ locationError }}</p>
      <p v-else-if="isGeolocationField" class="mt-1 text-xs text-gray-500">
        {{ geolocationFieldType === 'lat' ? 'Latitude' : 
           geolocationFieldType === 'lng' ? 'Longitude' : 
           'Address' }} will be automatically populated. Click the location icon to update the current location.
      </p>
      <p v-else-if="shouldAutoFillUserData" class="mt-1 text-xs text-gray-500">
        This field will be automatically populated with your {{ field.label?.includes('[login-user]') ? 'full name' : 'email' }}.
      </p>
    </template>

    <!-- Number Input -->
    <template v-else-if="field.fieldtype === 'Int' || field.fieldtype === 'Float'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <input
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="number"
        :required="field.reqd === 1"
        :disabled="field.read_only === 1"
        :readonly="field.read_only === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        :class="{
          'bg-gray-50': field.read_only === 1,
          'cursor-not-allowed': field.read_only === 1
        }"
      />
    </template>

    <!-- Date Input -->
    <template v-else-if="field.fieldtype === 'Date'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <input
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="date"
        :required="field.reqd === 1"
        :disabled="field.read_only === 1"
        :readonly="field.read_only === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        :class="{
          'bg-gray-50': field.read_only === 1,
          'cursor-not-allowed': field.read_only === 1
        }"
      />
    </template>

    <!-- Datetime Input -->
    <template v-else-if="field.fieldtype === 'Datetime'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <input
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="datetime-local"
        :required="field.reqd === 1"
        :disabled="field.read_only === 1"
        :readonly="field.read_only === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        :class="{
          'bg-gray-50': field.read_only === 1,
          'cursor-not-allowed': field.read_only === 1
        }"
      />
    </template>

    <!-- Time Input -->
    <template v-else-if="field.fieldtype === 'Time'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <input
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="time"
        :required="field.reqd === 1"
        :disabled="field.read_only === 1"
        :readonly="field.read_only === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        :class="{
          'bg-gray-50': field.read_only === 1,
          'cursor-not-allowed': field.read_only === 1
        }"
      />
    </template>

    <!-- Duration Input -->
    <template v-else-if="field.fieldtype === 'Duration'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="relative mt-1" ref="durationWrapperRef">
        <input
          :id="field.fieldname"
          :value="durationString"
          @focus="handleDurationFocus"
          @input="onDurationInput($event)"
          type="text"
          :required="field.reqd === 1"
          :disabled="field.read_only === 1"
          :readonly="field.read_only === 1"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': field.read_only === 1,
            'cursor-not-allowed': field.read_only === 1
          }"
          autocomplete="off"
        />
        <div
          v-if="showDurationPopup && !field.read_only"
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
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <select
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        :required="field.reqd === 1"
        :disabled="field.read_only === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        :class="{
          'bg-gray-50': field.read_only === 1,
          'cursor-not-allowed': field.read_only === 1
        }"
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
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <select
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        :required="field.reqd === 1"
        :disabled="field.read_only === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        :class="{
          'bg-gray-50': field.read_only === 1,
          'cursor-not-allowed': field.read_only === 1
        }"
      >
        <option value="">Select {{ formattedLabel }}</option>
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
          :checked="modelValue == 1"
          @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
          type="checkbox"
          :required="field.reqd === 1"
          :disabled="field.read_only === 1"
          class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          :class="{
            'cursor-not-allowed': field.read_only === 1
          }"
        />
        <label :for="field.fieldname" class="ml-2 block text-sm text-gray-900">
          {{ formattedLabel }}
        </label>
      </div>
    </template>

    <!-- Text Area -->
    <template v-else-if="field.fieldtype === 'Small Text'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <textarea
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        rows="3"
        :required="field.reqd === 1"
        :disabled="field.read_only === 1"
        :readonly="field.read_only === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        :class="{
          'bg-gray-50': field.read_only === 1,
          'cursor-not-allowed': field.read_only === 1
        }"
      ></textarea>
    </template>

    <!-- Text Editor -->
    <template v-else-if="field.fieldtype === 'Text Editor'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
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
            :disabled="field.read_only === 1"
            :readonly="field.read_only === 1"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            :class="{
              'bg-gray-50': field.read_only === 1,
              'cursor-not-allowed': field.read_only === 1
            }"
          ></textarea>
        </div>
      </div>
    </template>

    <!-- File Upload -->
    <template v-else-if="field.fieldtype === 'Attach'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1 flex items-center space-x-4">
        <div class="flex-grow">
          <input
            :id="field.fieldname"
            type="file"
            @change="handleFileUpload"
            :required="field.reqd === 1 && !hasExistingFile"
            :disabled="field.read_only === 1"
            class="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100"
            :class="{
              'cursor-not-allowed opacity-60': field.read_only === 1
            }"
          />
          <!-- Upload Progress -->
          <div v-if="uploading" class="mt-2">
            <div class="flex items-center justify-between text-sm text-gray-600">
              <span>Uploading file...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div class="btn-primary h-2 rounded-full" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
          </div>
        </div>
        <!-- File Preview -->
        <div v-if="filePreview || hasExistingFile" class="relative h-20 w-20 flex-shrink-0">
          <!-- Image Preview -->
          <img 
            v-if="isPreviewableImage" 
            :src="filePreview === 'document' ? existingFileUrl : filePreview" 
            alt="Preview" 
            class="h-full w-full rounded-md object-cover" 
          />
          <!-- Document Icon for non-image files -->
          <div v-else class="h-full w-full rounded-md bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
            </svg>
            <span class="absolute bottom-0 left-0 right-0 text-center text-xs bg-gray-800 text-white rounded-b-md py-1">
              {{ fileExtension }}
            </span>
          </div>
          <button
            v-if="(filePreview || hasExistingFile) && !field.read_only"
            @click.stop="clearFile"
            type="button"
            class="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </template>

    <!-- Image Upload -->
    <template v-else-if="field.fieldtype === 'Attach Image'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1 flex items-center space-x-4">
        <div class="flex-grow">
          <!-- Show camera button on mobile when [camera] is present -->
          <template v-if="shouldUseCameraInput">
            <button
              type="button"
              @click="openCamera"
              :disabled="field.read_only === 1"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              :class="{
                'opacity-60 cursor-not-allowed': field.read_only === 1
              }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
              {{ hasExistingFile ? 'Replace Photo' : 'Take a Photo' }}
            </button>
            <input
              ref="cameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              class="hidden"
              @change="handleImageUpload"
              :required="field.reqd === 1 && !hasExistingFile"
              :disabled="field.read_only === 1"
            />
          </template>
          <!-- Show regular file input when not using camera -->
          <template v-else>
            <input
              :id="field.fieldname"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              :required="field.reqd === 1 && !hasExistingFile"
              :disabled="field.read_only === 1"
              class="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100"
              :class="{
                'cursor-not-allowed opacity-60': field.read_only === 1
              }"
            />
          </template>
          <!-- Upload Progress -->
          <div v-if="uploading" class="mt-2">
            <div class="flex items-center justify-between text-sm text-gray-600">
              <span>Uploading image...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div class="btn-primary h-2 rounded-full" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
          </div>
        </div>
        <div v-if="imagePreview || hasExistingFile" class="relative h-20 w-20 flex-shrink-0">
          <img 
            :src="imagePreview || existingFileUrl" 
            alt="Preview" 
            class="h-full w-full rounded-md object-cover" 
          />
          <button
            v-if="(imagePreview || hasExistingFile) && !field.read_only"
            @click.stop="clearImage"
            type="button"
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
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1 flex items-center space-x-2">
        <input
          :id="field.fieldname"
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="color"
          :required="field.reqd === 1"
          :disabled="field.read_only === 1"
          class="h-8 w-8 rounded-md border-gray-300 p-1"
          :class="{
            'cursor-not-allowed opacity-60': field.read_only === 1
          }"
        />
        <input
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="text"
          :required="field.reqd === 1"
          :disabled="field.read_only === 1"
          :readonly="field.read_only === 1"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': field.read_only === 1,
            'cursor-not-allowed': field.read_only === 1
          }"
        />
      </div>
    </template>

    <!-- Currency Input -->
    <template v-else-if="field.fieldtype === 'Currency'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
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
          :disabled="field.read_only === 1"
          :readonly="field.read_only === 1"
          class="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': field.read_only === 1,
            'cursor-not-allowed': field.read_only === 1
          }"
        />
      </div>
    </template>

    <!-- Phone Input -->
    <template v-else-if="field.fieldtype === 'Phone'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <vue-tel-input
        v-model="phoneValue"
        :id="field.fieldname"
        :required="field.reqd === 1"
        :disabled="field.read_only === 1"
        @input="onPhoneInput"
        class="mt-1"
        :class="{
          'opacity-60': field.read_only === 1
        }"
        :placeholder="'Enter phone number'"
        :mode="'international'"
        :dropdownOptions="{
          showDialCodeInList: true,
          showFlags: true,
          showSearchBox: true
        }"
        :inputOptions="{
          showDialCode: true,
          showFlags: true,
          disabled: field.read_only === 1
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
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <input
        :id="field.fieldname"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="password"
        :required="field.reqd === 1"
        :disabled="field.read_only === 1"
        :readonly="field.read_only === 1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        :class="{
          'bg-gray-50': field.read_only === 1,
          'cursor-not-allowed': field.read_only === 1
        }"
      />
    </template>

    <!-- Rating Input -->
    <template v-else-if="field.fieldtype === 'Rating'">
      <label class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1 flex items-center space-x-1">
        <button
          v-for="rating in 5"
          :key="rating"
          @click="!field.read_only && $emit('update:modelValue', rating)"
          :disabled="field.read_only === 1"
          class="text-gray-300 hover:text-yellow-400 focus:outline-none"
          :class="{ 
            'text-yellow-400': modelValue >= rating,
            'cursor-not-allowed': field.read_only === 1,
            'hover:text-gray-300': field.read_only === 1
          }"
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
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1">
        <div class="border-2 border-gray-300 rounded-md p-4">
          <!-- Signature Area -->
          <div class="relative bg-white" ref="signaturePadContainer">
            <!-- Canvas for drawing -->
            <canvas 
              v-show="!modelValue && !field.read_only"
              ref="signatureCanvas"
              class="border border-gray-200 rounded touch-none"
              :class="{
                'cursor-not-allowed': field.read_only === 1
              }"
              :style="{ width: '100%', height: '200px' }"
            ></canvas>
            
            <!-- Signature Preview -->
            <div v-if="modelValue" class="border border-gray-200 rounded mb-2" style="height: 200px;">
              <img 
                :src="modelValue"
                alt="Signature"
                class="w-full h-full object-contain"
              />
            </div>

            <!-- Controls -->
            <div v-if="!field.read_only" class="mt-2 flex justify-between items-center">
              <button
                type="button"
                @click="clearSignature"
                class="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50"
              >
                Clear Signature
              </button>
              <button
                v-if="!modelValue"
                type="button"
                @click="saveSignature"
                class="px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-600 rounded hover:bg-green-50"
              >
                Save Signature
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Multiple Upload Table -->
    <template v-else-if="field.fieldtype === 'Table' && field.label.toLowerCase().includes('[multiple-upload]')">
      <label class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="field.reqd" class="text-red-500">*</span>
      </label>
      <div class="mt-1">
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="mt-4  text-center text-sm text-gray-600">
              <label class="relative cursor-pointer rounded-md bg-white font-medium text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 hover:text-green-500">
                <span>Upload files</span>
                <input 
                  type="file" 
                  multiple 
                  class="sr-only" 
                  @change="handleMultipleFileUpload"
                  accept="image/*"
                />
              </label>
              <p v-if="!isMobile" class="pl-1">or drag and drop</p>
            </div>
            <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>

          <!-- Preview Grid -->
          <div v-if="uploadedFiles.length > 0" class="mt-6 grid grid-cols-4 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <div v-for="(file, index) in uploadedFiles" :key="index" class="relative group">
              <img :src="file.preview" class="h-48 w-full rounded-lg object-cover" />
              <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg">
                <button
                  @click="removeFile(index)"
                  class="hidden group-hover:block p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploading" class="mt-4">
            <div class="flex items-center justify-between text-sm text-gray-600">
              <span>Uploading files...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div class="btn-primary h-2 rounded-full" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </template>

  <!-- Table Input -->
  <template v-else-if="field.fieldtype === 'Table'">
    <label class="block text-sm font-medium text-gray-700">
      {{ formattedLabel }}
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

  <!-- Delete Confirmation Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isModalOpen" class="fixed inset-0 flex items-center justify-center z-50">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
        
        <!-- Modal -->
        <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative z-10">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Delete Confirmation</h3>
          <p class="text-sm text-gray-500 mb-6">Are you sure you want to delete the attachment?</p>
          
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click.stop="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              @click.stop="handleConfirmDelete"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch, onMounted, nextTick, computed } from 'vue';
import { VueTelInput } from 'vue-tel-input';
import 'vue-tel-input/dist/vue-tel-input.css';
import { getFormList, uploadFile } from '../services/erpnext';
import { evaluateFieldDependency } from '../utils/fieldDependency';
import { useErrorStore } from '../stores/error';
import { MapPinIcon, LoaderIcon } from 'lucide-vue-next';
import { getErpNextApiUrl } from '../utils/api';
import { optimizeImage } from '../utils/imageUtils';
import SignaturePad from 'signature_pad';
import { useAuthStore } from '../stores/auth';

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
  parent?: string;
  read_only?: number;
}

interface UploadedFile {
  file: File;
  preview: string;
  uploaded?: boolean;
  fileUrl?: string;
}

interface GeolocationData {
  fieldname: string;
  label: string;
  value: string;
  type: 'lat' | 'lng' | 'address';
}

const props = defineProps<{
  field: FormField;
  modelValue: any;
  formData?: Record<string, any>;
  parentDocName?: string;
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
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadedFiles = ref<UploadedFile[]>([]);

const errorStore = useErrorStore();
const authStore = useAuthStore();

const mediaQueryMatches = ref(false);

const shouldShowField = computed(() => {
  console.log('shouldShowField', props.field);
  console.log('formData', props.formData);
  return evaluateFieldDependency(props.field, props.formData);
});

const formattedLabel = computed(() => {
  if (!props.field.label) return '';
  // Only remove text within square brackets
  return props.field.label.replace(/\[.*?\]/g, '').trim();
});

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return mediaQueryMatches.value;
});

const shouldUseCameraInput = computed(() => {
  return isMobile.value && props.field.label?.includes('[camera]');
});

const shouldAutoFillUserData = computed(() => {
  if (props.field.fieldtype !== 'Data') return false;
  return props.field.label?.includes('[login-user]') || props.field.label?.includes('[login-email]') || props.field.label?.includes('[login-role]');
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

const filePreview = ref<string | null>(null);
const fileExtension = ref<string>('');
const isPreviewableImage = ref(false);

const isModalOpen = ref(false);

const deleteType = ref<'file' | 'image'>('file');

const isDeleting = ref(false);

const showDeleteConfirmation = (type: 'file' | 'image') => {
  console.log('showDeleteConfirmation', type);
  deleteType.value = type;
  isModalOpen.value = true;
};

const closeModal = () => {
  console.log('closeModal');
  isModalOpen.value = false;
};

const handleConfirmDelete = () => {
  console.log('handleConfirmDelete');
  // Set modal state to false first
  isModalOpen.value = false;
  
  // Set deleting flag
  isDeleting.value = true;
  
  // Wait for the next tick before proceeding with deletion
  nextTick().then(() => {
    if (deleteType.value === 'file') {
      // Clear all file-related states
      if (filePreview.value && filePreview.value !== 'document') {
        URL.revokeObjectURL(filePreview.value);
      }
      filePreview.value = null;  // Clear preview regardless of type
      fileExtension.value = '';
      isPreviewableImage.value = false;
      emit('update:modelValue', '');
      uploadProgress.value = 0;
    } else {
      // Clear all image-related states
      if (imagePreview.value) {
        if (imagePreview.value.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview.value);
        }
        imagePreview.value = null;
      }
      emit('update:modelValue', '');
      uploadProgress.value = 0;
    }
    
    // Reset all states
    deleteType.value = 'file';
    
    // Reset deleting flag after a short delay to ensure all watchers have processed
    setTimeout(() => {
      isDeleting.value = false;
    }, 100);
  });
};

const clearFile = () => {
  console.log('clearFile');
  showDeleteConfirmation('file');
};

const clearImage = () => {
  console.log('clearImage');
  showDeleteConfirmation('image');
};

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Clear existing preview if any
    if (filePreview.value && filePreview.value !== 'document') {
      URL.revokeObjectURL(filePreview.value);
    }
    
    // Get file extension
    fileExtension.value = file.name.split('.').pop()?.toUpperCase() || '';
    
    // Check if file is an image
    isPreviewableImage.value = file.type.startsWith('image/');
    
    // Create preview if it's an image
    if (isPreviewableImage.value) {
      filePreview.value = URL.createObjectURL(file);
    } else {
      filePreview.value = 'document';  // Just a flag to show document icon
    }
    
    // Start upload process
    uploading.value = true;
    uploadProgress.value = 0;
    
    try {
      // Store the original value in case upload fails
      const originalValue = props.modelValue;
      
      // Set progress to 10% to indicate upload is starting
      uploadProgress.value = 10;
      
      const response = await uploadFile(
        file,
        props.field.parent || '', // doctype
        props.parentDocName || '', // docname
        false // isPrivate
      );
      
      uploadProgress.value = 90;
      
      // Update the model value with the file URL
      emit('update:modelValue', response.message.file_url);
      
      uploadProgress.value = 100;
      
      setTimeout(() => {
        uploading.value = false;
        uploadProgress.value = 0;
      }, 1000);
    } catch (error) {
      console.error('Error uploading file:', error);
      errorStore.setError(error.message || 'Failed to upload file');
      uploading.value = false;
      uploadProgress.value = 0;
      clearFile();
    }
  }
};

onUnmounted(() => {
  if (filePreview.value && filePreview.value !== 'document') {
    URL.revokeObjectURL(filePreview.value);
  }
});

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Clear existing preview if any
    if (imagePreview.value) {
      // Only revoke if it's a blob URL (not an existing file URL)
      if (imagePreview.value.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview.value);
      }
    }
    
    // Show original preview immediately
    imagePreview.value = URL.createObjectURL(file);
    
    // Optimize the image first
    const optimizedFile = await optimizeImage(file);
    
    // Emit the optimized file with metadata
    emit('update:modelValue', {
      file: optimizedFile,
      preview: imagePreview.value,
      fieldname: props.field.fieldname,
      needsWatermark: props.field.label?.includes('[camera]')
    });
  }
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

  const mediaQuery = window.matchMedia('(max-width: 768px)');
  mediaQueryMatches.value = mediaQuery.matches;
  
  const handleResize = (e: MediaQueryListEvent) => {
    mediaQueryMatches.value = e.matches;
  };
  
  mediaQuery.addEventListener('change', handleResize);
  
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleResize);
  });

  console.log('Component mounted, initializing geolocation fields');
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const handleMultipleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const newFiles = Array.from(input.files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploaded: false
    }));
    uploadedFiles.value = [...uploadedFiles.value, ...newFiles];
    
    // Start upload process
    await uploadFiles();
  }
};

const uploadFiles = async () => {
  if (uploadedFiles.value.length === 0) return;

  uploading.value = true;
  uploadProgress.value = 0;
  const totalFiles = uploadedFiles.value.length;
  let completedFiles = 0;

  try {
    // Upload each file as temporary (unattached)
    for (let i = 0; i < uploadedFiles.value.length; i++) {
      const file = uploadedFiles.value[i];
      if (file.uploaded) continue;

      try {
        // Upload without doctype and docname for temporary storage
        const response = await uploadFile(
          file.file,
          '', // No doctype for temporary upload
          '', // No docname for temporary upload
          false // isPrivate
        );

        // Update the file with upload status and URL
        uploadedFiles.value[i] = {
          ...file,
          uploaded: true,
          fileUrl: response.message.file_url
        };

        completedFiles++;
        uploadProgress.value = Math.round((completedFiles / totalFiles) * 100);
      } catch (error) {
        console.error(`Error uploading file ${i + 1}:`, error);
      }
    }

    // Emit the updated value with just the file URLs for the form submission
    emit('update:modelValue', uploadedFiles.value
      .filter(f => f.uploaded && f.fileUrl)
      .map(f => ({ image: f.fileUrl }))
    );
  } catch (error) {
    console.error('Error in upload process:', error);
  } finally {
    uploading.value = false;
  }
};

const removeFile = (index: number) => {
  // Revoke the object URL to prevent memory leaks
  URL.revokeObjectURL(uploadedFiles.value[index].preview);
  uploadedFiles.value.splice(index, 1);
  
  // Emit the updated value
  emit('update:modelValue', uploadedFiles.value
    .filter(f => f.uploaded && f.fileUrl)
    .map(f => ({ image: f.fileUrl }))
  );
};

// Clean up object URLs when component is unmounted
onUnmounted(() => {
  uploadedFiles.value.forEach(file => {
    URL.revokeObjectURL(file.preview);
  });
});

// Add the camera input ref and openCamera method in the script section
const cameraInput = ref<HTMLInputElement | null>(null);

const openCamera = () => {
  if (cameraInput.value) {
    cameraInput.value.click();
  }
};

// Add geolocation state
const isGettingLocation = ref(false);
const locationError = ref<string | null>(null);

// Helper to check if field is a geolocation field
const isGeolocationField = computed(() => {
  return props.field.label.includes('[geolocation-');
});

const geolocationFieldType = computed(() => {
  if (!isGeolocationField.value) return null;
  const match = props.field.label.match(/\[geolocation-(.*?)\]/);
  return match ? match[1] : null;
});

// Function to get current location
const getCurrentLocation = async () => {
  if (!isGeolocationField.value || !navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by your browser';
    return;
  }
  
  isGettingLocation.value = true;
  locationError.value = null;

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });

    switch (geolocationFieldType.value) {
      case 'lat':
        emit('update:modelValue', position.coords.latitude.toString());
        break;
      case 'lng':
        emit('update:modelValue', position.coords.longitude.toString());
        break;
      case 'address':
        // Get address using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'TheTeam App (https://theteam.net.au)'
              }
            }
          );
          const data = await response.json();
          emit('update:modelValue', data.display_name);
        } catch (error) {
          console.error('Error getting address:', error);
          locationError.value = 'Failed to get address from coordinates';
        }
        break;
    }
  } catch (error: any) {
    console.error('Geolocation error:', error);
    if (error.code === 1) {
      // Permission denied error
      locationError.value = 'Location permission was denied. Please enable location access in your device settings and try again.';
    } else if (error.code === 2) {
      // Position unavailable error
      locationError.value = 'Unable to determine your location. Please check your device\'s GPS settings and try again.';
    } else if (error.code === 3) {
      // Timeout error
      locationError.value = 'Location request timed out. Please try again.';
    } else {
      locationError.value = error.message || 'Failed to get location';
    }
  } finally {
    isGettingLocation.value = false;
  }
};

// Get location on mount if field is a geolocation field and value is empty
onMounted(() => {
  if (isGeolocationField.value && !props.modelValue) {
    getCurrentLocation();
  }
});

// Add these computed properties after the existing computed properties
const hasExistingFile = computed(() => {
  return typeof props.modelValue === 'string' && props.modelValue.length > 0;
});

const existingFileUrl = computed(() => {
  if (!hasExistingFile.value) return null;
  
  const baseUrl = getErpNextApiUrl();
  const fileUrl = props.modelValue;

  // If it's already an absolute URL (starts with http:// or https://)
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }

  // If it's a relative URL (starts with /)
  if (fileUrl.startsWith('/')) {
    return `${baseUrl}${fileUrl}`;
  }

  // If it's a relative URL without leading slash
  return `${baseUrl}/${fileUrl}`;
});

const isExistingFileImage = computed(() => {
  if (!hasExistingFile.value) return false;
  const url = props.modelValue.toLowerCase();
  return url.endsWith('.jpg') || url.endsWith('.jpeg') || 
         url.endsWith('.png') || url.endsWith('.gif') || 
         url.endsWith('.webp');
});

// Update the watch to check the flag
watch(() => props.modelValue, async (newValue) => {
  // Skip if we're in the middle of a delete operation
  if (isDeleting.value) return;

  if (props.field.fieldtype === 'Attach' || props.field.fieldtype === 'Attach Image') {
    if (newValue && typeof newValue === 'string') {
      // Clear any existing previews first
      if (filePreview.value && filePreview.value !== 'document') {
        URL.revokeObjectURL(filePreview.value);
      }
      if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
      }
      
      // For Attach Image, set the preview directly
      if (props.field.fieldtype === 'Attach Image') {
        imagePreview.value = existingFileUrl.value;
      } else {
        // For Attach, set preview based on file type
        if (isExistingFileImage.value) {
          filePreview.value = existingFileUrl.value;
          isPreviewableImage.value = true;
        } else {
          filePreview.value = 'document';
          isPreviewableImage.value = false;
        }
        // Set file extension from URL
        const urlParts = newValue.split('.');
        if (urlParts.length > 1) {
          fileExtension.value = urlParts.pop()?.toUpperCase() || '';
        }
      }
    }
  }
});

// Add initialization in onMounted
onMounted(() => {
  // Initialize file preview if there's an initial value
  if (props.modelValue && typeof props.modelValue === 'string') {
    if (props.field.fieldtype === 'Attach Image') {
      imagePreview.value = existingFileUrl.value;
    } else if (props.field.fieldtype === 'Attach') {
      if (isExistingFileImage.value) {
        filePreview.value = existingFileUrl.value;
        isPreviewableImage.value = true;
      } else {
        filePreview.value = 'document';
        isPreviewableImage.value = false;
        const urlParts = props.modelValue.split('.');
        if (urlParts.length > 1) {
          fileExtension.value = urlParts.pop()?.toUpperCase() || '';
        }
      }
    }
  }
});

// Add these refs after the existing refs
const signatureCanvas = ref<HTMLCanvasElement | null>(null);
const signaturePad = ref<SignaturePad | null>(null);
const signaturePadContainer = ref<HTMLElement | null>(null);

// Add these methods after the existing methods
const initSignaturePad = () => {
  if (!signatureCanvas.value) return;

  // Set canvas dimensions
  const container = signaturePadContainer.value;
  if (!container) return;

  const canvas = signatureCanvas.value;
  const rect = container.getBoundingClientRect();
  
  // Set the canvas dimensions to match the container size
  canvas.width = rect.width;
  canvas.height = 200; // Fixed height

  // Initialize SignaturePad
  signaturePad.value = new SignaturePad(canvas, {
    backgroundColor: 'rgb(255, 255, 255)',
    penColor: 'rgb(0, 0, 0)'
  });
};

const clearSignature = () => {
  console.log('clearing signature');
  if (signaturePad.value) {
    signaturePad.value.clear();
  }
  emit('update:modelValue', '');
};

const saveSignature = () => {
  if (!signaturePad.value || signaturePad.value.isEmpty()) {
    alert('Please provide a signature first.');
    return;
  }

  const dataURL = signaturePad.value.toDataURL();
  emit('update:modelValue', dataURL);
};

// Add this to the onMounted section
onMounted(() => {
  if (props.field.fieldtype === 'Signature') {
    nextTick(() => {
      initSignaturePad();
    });
  }
  // ... existing onMounted code ...
});

// Add window resize handler
const handleResize = () => {
  if (props.field.fieldtype === 'Signature') {
    initSignaturePad();
  }
};

// Add to onMounted
onMounted(() => {
  // ... existing onMounted code ...
  window.addEventListener('resize', handleResize);
});

// Add to onUnmounted
onUnmounted(() => {
  // ... existing onUnmounted code ...
  window.removeEventListener('resize', handleResize);
});

// Add this to the script section with other functions
function handleDurationFocus() {
  if (!props.field.read_only) {
    showDurationPopup.value = true;
  }
  parseDurationString();
}

watch(() => authStore.user, (user) => {
  console.log('user ====', user.roles[0]);
  if (shouldAutoFillUserData.value && !props.modelValue) {
    console.log('shouldAutoFillUserData', user);
    if (props.field.label?.includes('[login-user]') && user?.profile.full_name) {
      emit('update:modelValue', user.profile.full_name);
    } else if (props.field.label?.includes('[login-email]') && user?.email) {
      emit('update:modelValue', user.email);
    } else if (props.field.label?.includes('[login-role]') && user?.roles[0]) {
      emit('update:modelValue', user.roles[0]);
    }
  }
}, { immediate: true });

defineExpose({ VueTelInput });
</script>

<style>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style> 