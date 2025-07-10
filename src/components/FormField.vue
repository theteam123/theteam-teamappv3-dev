<template>
  <div :class="[
    'transition-all duration-200 ease-in-out',
    field.hidden === 1 ? 'hidden' : (shouldShowField ? 'space-y-2' : 'hidden')
  ]" data-form-field>
    <!-- Section Break -->
    <template v-if="field.fieldtype === 'Section Break'">
      <div class="mt-8 mb-4 border-b border-gray-200 pb-2">
        <span v-if="field.label" class="text-lg font-semibold text-gray-700">{{ formattedLabel }}</span>
      </div>
    </template>

    <!-- Text Input -->
    <template v-else-if="field.fieldtype === 'Data'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <div class="relative mt-1">
          <input
            :id="field.fieldname"
            :value="modelValue"
            @input="!isGeolocationField && handleValueUpdate(($event.target as HTMLInputElement).value)"
            type="text"
            :required="isFieldRequired"
            :disabled="isGettingLocation || isGeolocationField || isFieldReadOnly || shouldAutoFillUserData"
            :readonly="isGeolocationField || isFieldReadOnly || shouldAutoFillUserData"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            :class="{ 
              'pr-10': isGeolocationField,
              'bg-gray-50': isGeolocationField || isFieldReadOnly || shouldAutoFillUserData,
              'cursor-not-allowed': isGeolocationField || isFieldReadOnly || shouldAutoFillUserData
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
          This field will be automatically populated with your {{ getLoginTypeDescription() }}.
        </p>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Number Input -->
    <template v-else-if="field.fieldtype === 'Int' || field.fieldtype === 'Float'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <input
          :id="field.fieldname"
          :value="modelValue"
          @input="handleValueUpdate(($event.target as HTMLInputElement).value)"
          type="number"
          :required="isFieldRequired"
          :disabled="isFieldReadOnly"
          :readonly="isFieldReadOnly"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': isFieldReadOnly,
            'cursor-not-allowed': isFieldReadOnly
          }"
        />
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Date Input -->
    <template v-else-if="field.fieldtype === 'Date'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            :id="field.fieldname"
            :value="modelValue"
            @input="handleValueUpdate(($event.target as HTMLInputElement).value)"
            type="date"
            :required="isFieldRequired"
            :disabled="isFieldReadOnly"
            :readonly="isFieldReadOnly"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            :class="{
              'bg-gray-50': isFieldReadOnly,
              'cursor-not-allowed': isFieldReadOnly
            }"
          />
        </div>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Datetime Input -->
    <template v-else-if="field.fieldtype === 'Datetime'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            :id="field.fieldname"
            :value="modelValue"
            @input="handleValueUpdate(($event.target as HTMLInputElement).value)"
            type="datetime-local"
            :required="isFieldRequired"
            :disabled="isFieldReadOnly"
            :readonly="isFieldReadOnly"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            :class="{
              'bg-gray-50': isFieldReadOnly,
              'cursor-not-allowed': isFieldReadOnly
            }"
          />
        </div>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Time Input -->
    <template v-else-if="field.fieldtype === 'Time'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <input
          :id="field.fieldname"
          :value="modelValue"
          @input="handleValueUpdate(($event.target as HTMLInputElement).value)"
          type="time"
          :required="isFieldRequired"
          :disabled="isFieldReadOnly"
          :readonly="isFieldReadOnly"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': isFieldReadOnly,
            'cursor-not-allowed': isFieldReadOnly
          }"
        />
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Duration Input -->
    <template v-else-if="field.fieldtype === 'Duration'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <div class="relative mt-1" ref="durationWrapperRef">
          <input
            :id="field.fieldname"
            :value="durationString"
            @focus="handleDurationFocus"
            @input="onDurationInput($event)"
            type="text"
            :required="isFieldRequired"
            :disabled="isFieldReadOnly"
            :readonly="isFieldReadOnly"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            :class="{
              'bg-gray-50': isFieldReadOnly,
              'cursor-not-allowed': isFieldReadOnly
            }"
            autocomplete="off"
          />
          <div
            v-if="showDurationPopup && !isFieldReadOnly"
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
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Select Input -->
    <template v-else-if="field.fieldtype === 'Select' && field.fieldname !== 'naming_series'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <!-- Radio Button Group -->
        <template v-if="field.label?.includes('[radio]')">
          <div class="mt-2 flex flex-wrap gap-4">
            <div v-for="option in field.options?.split('\n').filter(Boolean)" :key="option" class="flex items-center">
              <input
                :id="`${field.fieldname}-${option}`"
                :name="field.fieldname"
                :value="option"
                :checked="modelValue === option"
                @change="handleValueUpdate(option)"
                type="radio"
                :required="isFieldRequired"
                :disabled="isFieldReadOnly"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                :class="{
                  'cursor-not-allowed': isFieldReadOnly
                }"
              />
              <label :for="`${field.fieldname}-${option}`" class="ml-2 block text-sm text-gray-700">
                {{ option }}
              </label>
            </div>
          </div>
        </template>
        <!-- Regular Select Dropdown -->
        <template v-else>
          <select
            :id="field.fieldname"
            :value="modelValue"
            @input="handleValueUpdate(($event.target as HTMLSelectElement).value)"
            :required="isFieldRequired"
            :disabled="isFieldReadOnly"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            :class="{
              'bg-gray-50': isFieldReadOnly,
              'cursor-not-allowed': isFieldReadOnly
            }"
          >
            <option value="">Select an option</option>
            <option v-for="option in field.options?.split('\n').filter(Boolean)" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </template>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Link Input -->
    <template v-else-if="field.fieldtype === 'Link'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <select
          :id="field.fieldname"
          :value="modelValue"
          @input="handleValueUpdate(($event.target as HTMLSelectElement).value)"
          :required="isFieldRequired"
          :disabled="isFieldReadOnly"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': isFieldReadOnly,
            'cursor-not-allowed': isFieldReadOnly
          }"
        >
          <option value="">Select {{ formattedLabel }}</option>
          <option v-for="option in linkOptions" :key="option.name" :value="option.name">
            {{ option.name }}
          </option>
        </select>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Dynamic Link Input -->
    <template v-else-if="field.fieldtype === 'Dynamic Link'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <div class="mt-1 relative">
          <input
            :id="field.fieldname"
            v-model="dynamicLinkSearchQuery"
            @input="searchDynamicLinkDocuments"
            @focus="handleDynamicLinkFocus"
            @blur="handleDynamicLinkBlur"
            @keydown="handleDynamicLinkKeydown"
            type="text"
            :placeholder="getDynamicLinkPlaceholder()"
            :required="isFieldRequired"
            :disabled="isFieldReadOnly || !getDynamicLinkDoctype()"
            :readonly="isFieldReadOnly"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 pr-10"
            :class="{
              'bg-gray-50': isFieldReadOnly || !getDynamicLinkDoctype(),
              'cursor-not-allowed': isFieldReadOnly || !getDynamicLinkDoctype()
            }"
          />
          <!-- Clear search button -->
          <button
            v-if="dynamicLinkSearchQuery && !isFieldReadOnly"
            @click="clearDynamicLinkSearch"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        
          <!-- Dropdown with search results -->
          <div 
            v-if="showDynamicLinkDropdown && !isFieldReadOnly && getDynamicLinkDoctype()"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            <!-- Loading state in dropdown -->
            <div v-if="loadingDynamicLinkDocuments" class="px-4 py-3 text-sm text-gray-500 text-center">
              <div class="flex items-center justify-center">
                <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </div>
            </div>
            
            <!-- No doctype selected state -->
            <div v-else-if="!getDynamicLinkDoctype()" class="px-4 py-3 text-sm text-gray-500 text-center">
              Please select a document type first
            </div>
            
            <!-- No results state -->
            <div v-else-if="!loadingDynamicLinkDocuments && filteredDynamicLinkDocuments.length === 0 && dynamicLinkSearchQuery.trim() !== ''" class="px-4 py-3 text-sm text-gray-500 text-center">
              No results found for "{{ dynamicLinkSearchQuery }}"
            </div>
            
            <!-- Search results -->
            <div v-else-if="filteredDynamicLinkDocuments.length > 0">
              <div 
                v-for="doc in filteredDynamicLinkDocuments" 
                :key="doc.name"
                @click="selectDynamicLinkDocument(doc)"
                class="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ doc.name }}</div>
                    <div v-if="doc.description" class="text-sm text-gray-500 mt-1">{{ doc.description }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Initial state when no search query and no items loaded -->
            <div v-else-if="dynamicLinkSearchQuery.trim() === '' && !loadingDynamicLinkDocuments" class="px-4 py-3 text-sm text-gray-500 text-center">
              Start typing to search {{ getDynamicLinkDoctype() }} documents
            </div>
          </div>
        
      </div>
        <!-- Help text -->
        <p v-if="!getDynamicLinkDoctype()" class="mt-1 text-xs text-gray-500">
          Select a document type in the "{{ getDynamicLinkFieldLabel() }}" field first
        </p>
        <p v-if="dynamicLinkError || errorStore.message" class="mt-1 text-sm text-red-600">
          {{ dynamicLinkError || errorStore.message }}
        </p>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Check Input -->
    <template v-else-if="field.fieldtype === 'Check'">
      <div class="flex items-center">
        <input
          :id="field.fieldname"
          :checked="modelValue == 1"
          @change="handleValueUpdate(($event.target as HTMLInputElement).checked)"
          type="checkbox"
          :required="isFieldRequired"
          :disabled="isFieldReadOnly"
          class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          :class="{
            'cursor-not-allowed': isFieldReadOnly
          }"
        />
        <label :for="field.fieldname" class="ml-2 block text-sm text-gray-900">
          {{ formattedLabel }}
        </label>
      </div>
      <p v-if="field.description" class="mt-1 text-xs text-gray-500">
        {{ field.description }}
      </p>
    </template>

    <!-- Small Text Input -->
    <template v-else-if="field.fieldtype === 'Small Text'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <textarea
          :id="field.fieldname"
          :value="modelValue"
          @input="handleValueUpdate(($event.target as HTMLTextAreaElement).value)"
          rows="5"
          :required="isFieldRequired"
          :disabled="isFieldReadOnly"
          :readonly="isFieldReadOnly"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': isFieldReadOnly,
            'cursor-not-allowed': isFieldReadOnly
          }"
        ></textarea>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Text Input -->
    <template v-else-if="field.fieldtype === 'Text'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <textarea
          :id="field.fieldname"
          :value="modelValue"
          @input="handleValueUpdate(($event.target as HTMLTextAreaElement).value)"
          rows="4"
          :required="isFieldRequired"
          :disabled="isFieldReadOnly || shouldAutoFillUserData"
          :readonly="isFieldReadOnly || shouldAutoFillUserData"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': isFieldReadOnly || shouldAutoFillUserData,
            'cursor-not-allowed': isFieldReadOnly || shouldAutoFillUserData
          }"
        ></textarea>
        <p v-if="shouldAutoFillUserData" class="mt-1 text-xs text-gray-500">
          This field will be automatically populated with your {{ getLoginTypeDescription() }}.
        </p>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Long Text Input -->
    <template v-else-if="field.fieldtype === 'Long Text'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <div class="mention-container relative">
        <textarea
          :id="field.fieldname"
          ref="longTextRef"
          :value="modelValue"
          @input="handleLongTextInput"
          @keydown="handleMentionKeydown"
          rows="8"
          :required="isFieldRequired"
          :disabled="isFieldReadOnly"
          :readonly="isFieldReadOnly"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': isFieldReadOnly,
            'cursor-not-allowed': isFieldReadOnly
          }"
        ></textarea>
        
        <!-- Mention Dropdown -->
        <div 
          v-if="showMentionDropdown && !isFieldReadOnly"
          class="absolute z-10 w-full max-w-sm mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <!-- Loading state -->
          <div v-if="loadingMentions" class="px-4 py-3 text-sm text-gray-500 text-center">
            <div class="flex items-center justify-center">
              <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
              Searching for mentions...
            </div>
          </div>
          
          <!-- No results state -->
          <div v-else-if="!loadingMentions && mentionResults.length === 0 && mentionQuery.trim() !== ''" class="px-4 py-3 text-sm text-gray-500 text-center">
            No users found for "@{{ mentionQuery }}"
          </div>
          
          <!-- Mention results -->
          <div v-else-if="mentionResults.length > 0">
            <div 
              v-for="mention in mentionResults" 
              :key="mention.value || mention.name || mention"
              @click="selectMention(mention)"
              class="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ (mention.label || mention.value || mention.name || mention).charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <div class="font-medium text-gray-900">{{ mention.label || mention.value || mention.name || mention }}</div>
                  <div v-if="mention.description" class="text-sm text-gray-500">{{ mention.description }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Initial state when just typed @ -->
          <div v-else-if="mentionQuery.trim() === '' && !loadingMentions" class="px-4 py-3 text-sm text-gray-500 text-center">
            Type to search for users to mention
          </div>
        </div>
      </div>
      <p v-if="field.description" class="mt-1 text-xs text-gray-500">
        {{ field.description }}
      </p>
    </template>

    <!-- JSON Input -->
    <template v-else-if="field.fieldtype === 'JSON'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <div class="mt-1">
        <textarea
          :id="field.fieldname"
          :value="formattedJsonValue"
          @input="handleJsonInput"
          rows="8"
          :required="isFieldRequired"
          :disabled="isFieldReadOnly"
          :readonly="isFieldReadOnly"
          class="mt-1 block w-full font-mono text-sm rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': isFieldReadOnly,
            'cursor-not-allowed': isFieldReadOnly,
            'border-red-500': jsonError
          }"
        ></textarea>
        <p v-if="jsonError" class="mt-1 text-sm text-red-600">{{ jsonError }}</p>
        <div class="mt-2 flex justify-end space-x-2">
          <button
            v-if="!isFieldReadOnly"
            type="button"
            @click="formatJson"
            class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Format JSON
          </button>
        </div>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Text Editor -->
    <template v-else-if="field.fieldtype === 'Text Editor'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <div class="mt-1">
        <div class="prose prose-sm max-w-none">
          <textarea
            :id="field.fieldname"
            :value="modelValue"
            @input="handleValueUpdate(($event.target as HTMLTextAreaElement).value)"
            rows="6"
            :required="isFieldRequired"
            :disabled="isFieldReadOnly"
            :readonly="isFieldReadOnly"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            :class="{
              'bg-gray-50': isFieldReadOnly,
              'cursor-not-allowed': isFieldReadOnly
            }"
          ></textarea>
        </div>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- File Upload -->
    <template v-else-if="field.fieldtype === 'Attach'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <div class="mt-1 flex items-center space-x-4">
        <div class="flex-grow">
          <input
            :id="field.fieldname"
            type="file"
            @change="handleFileUpload"
            :required="isFieldRequired && !hasExistingFile"
            :disabled="isFieldReadOnly"
            class="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100"
            :class="{
              'cursor-not-allowed opacity-60': isFieldReadOnly
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
            v-if="(filePreview || hasExistingFile) && !isFieldReadOnly"
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
      <p v-if="field.description" class="mt-1 text-xs text-gray-500">
        {{ field.description }}
      </p>
    </template>

    <!-- Image Upload -->
    <template v-else-if="field.fieldtype === 'Attach Image'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <div class="mt-1 flex items-center space-x-4">
        <div class="flex-grow">
          <!-- Show camera button on mobile when [camera] is present -->
          <template v-if="shouldUseCameraInput">
            <button
              type="button"
              @click="openCamera"
              :disabled="isFieldReadOnly"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              :class="{
                'opacity-60 cursor-not-allowed': isFieldReadOnly
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
              :required="isFieldRequired && !hasExistingFile"
              :disabled="isFieldReadOnly"
            />
          </template>
          <!-- Show regular file input when not using camera -->
          <template v-else>
            <input
              :id="field.fieldname"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              :required="isFieldRequired && !hasExistingFile"
              :disabled="isFieldReadOnly"
              class="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100"
              :class="{
                'cursor-not-allowed opacity-60': isFieldReadOnly
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
            v-if="(imagePreview || hasExistingFile) && !isFieldReadOnly"
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
      <!-- Watermark Download Checkbox -->
      <div v-if="shouldUseCameraInput && !shouldUserChangeWatermarkDownloadValue" class="mt-2">
        <label class="inline-flex items-center">
          <input
            type="checkbox"
            :key="checkboxKey"
            v-model="shouldAutoDownload"
            @change="() => console.log('Checkbox changed:', shouldAutoDownload)"
            class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          >
          <span class="ml-2 text-sm text-gray-600">Download a copy of watermarked image</span>
        </label>
      </div>
      <p v-if="field.description && !field.description.includes('watermark')" class="mt-1 text-xs text-gray-500">
        {{ field.description }}
      </p>
    </template>

    <!-- Color Input -->
    <template v-else-if="field.fieldtype === 'Color'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <div class="mt-1 flex items-center space-x-2">
          <input
            :id="field.fieldname"
            :value="modelValue"
            @input="handleValueUpdate(($event.target as HTMLInputElement).value)"
            type="color"
            :required="isFieldRequired"
            :disabled="isFieldReadOnly"
            class="h-8 w-8 rounded-md border-gray-300 p-1"
            :class="{
              'cursor-not-allowed opacity-60': isFieldReadOnly
            }"
          />
          <input
            :value="modelValue"
            @input="handleValueUpdate(($event.target as HTMLInputElement).value)"
            type="text"
            :required="isFieldRequired"
            :disabled="isFieldReadOnly"
            :readonly="isFieldReadOnly"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            :class="{
              'bg-gray-50': isFieldReadOnly,
              'cursor-not-allowed': isFieldReadOnly
            }"
          />
        </div>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Currency Input -->
    <template v-else-if="field.fieldtype === 'Currency'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <div class="mt-1 relative rounded-md shadow-sm">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-500 sm:text-sm">$</span>
        </div>
        <input
          :id="field.fieldname"
          :value="modelValue"
          @input="handleValueUpdate(($event.target as HTMLInputElement).value)"
          type="number"
          step="0.01"
          :required="isFieldRequired"
          :disabled="isFieldReadOnly"
          :readonly="isFieldReadOnly"
          class="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': isFieldReadOnly,
            'cursor-not-allowed': isFieldReadOnly
          }"
        />
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Phone Input -->
    <template v-else-if="field.fieldtype === 'Phone'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <vue-tel-input
        v-model="phoneValue"
        :id="field.fieldname"
        :required="isFieldRequired"
        :disabled="isFieldReadOnly"
        @update:modelValue="onPhoneUpdate"
        @on-input="onPhoneInputEvent"
        class="mt-1"
        :class="{
          'opacity-60': isFieldReadOnly
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
          disabled: isFieldReadOnly
        }"
        :showCountryFlag="true"
        :useEmoji="false"
        :enabledFlags="true"
        :preferredCountries="['US', 'GB', 'CA']"
      />
      <p v-if="field.description" class="mt-1 text-xs text-gray-500">
        {{ field.description }}
      </p>
    </template>

    <!-- Password Input -->
    <template v-else-if="field.fieldtype === 'Password'">
      <div class="w-full lg:w-1/2">
        <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
          {{ formattedLabel }}
          <span v-if="isFieldRequired" class="text-red-500">*</span>
        </label>
        <input
          :id="field.fieldname"
          :value="modelValue"
          @input="handleValueUpdate(($event.target as HTMLInputElement).value)"
          type="password"
          :required="isFieldRequired"
          :disabled="isFieldReadOnly"
          :readonly="isFieldReadOnly"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          :class="{
            'bg-gray-50': isFieldReadOnly,
            'cursor-not-allowed': isFieldReadOnly
          }"
        />
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- Rating Input -->
    <template v-else-if="field.fieldtype === 'Rating'">
      <label class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <div class="mt-1 flex items-center space-x-1">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          @click="!isFieldReadOnly && handleRatingClick(getStarValue(star, $event))"
          :disabled="isFieldReadOnly"
          class="focus:outline-none"
          :class="{
            'cursor-not-allowed': isFieldReadOnly
          }"
          style="background: none; border: none; padding: 0; position: relative; width: 2rem; height: 2rem;"
        >
          <!-- Full Star -->
          <svg v-if="getRatingStars() >= star" class="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <!-- Half Star -->
          <svg v-else-if="getRatingStars() >= star - 0.5" class="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient :id="'half-gradient-' + star" x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stop-color="#facc15" />
                <stop offset="50%" stop-color="#d1d5db" />
              </linearGradient>
            </defs>
            <path :fill="'url(#half-gradient-' + star + ')'" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <!-- Empty Star -->
          <svg v-else class="h-8 w-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      </div>
      <p v-if="modelValue !== null && modelValue !== undefined" class="mt-1 text-xs text-gray-500">
        Rating: {{ formatRatingValue(modelValue) }} ({{ formatStarsValue(getRatingStars()) }} stars)
      </p>
      <p v-if="field.description" class="mt-1 text-xs text-gray-500">
        {{ field.description }}
      </p>
    </template>

    <!-- Signature Input -->
    <template v-else-if="field.fieldtype === 'Signature'">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <div class="mt-1" :data-form-field="field.fieldname">
        <div class="border-2 border-gray-300 rounded-md p-4">
          <!-- Signature Area -->
          <div class="relative bg-white touch-none select-none" ref="signaturePadContainer">
            <!-- Canvas for drawing -->
            <canvas 
              v-show="!modelValue && !isFieldReadOnly"
              ref="signatureCanvas"
              class="border border-gray-200 rounded touch-none"
                              :class="{
                  'cursor-not-allowed': isFieldReadOnly
                }"
              :style="{ 
                width: '100%', 
                height: '200px',
                touchAction: 'none',
                userSelect: 'none'
              }"
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
            <div v-if="!isFieldReadOnly" class="mt-2 flex justify-end">
              <button
                type="button"
                @click="clearSignature"
                class="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50"
              >
                Clear Signature
              </button>
            </div>
          </div>
        </div>
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

    <!-- HTML Display -->
    <template v-else-if="field.fieldtype === 'HTML'">
      <label class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      
      <!-- PDF Viewer -->
      <template v-if="field.label?.includes('[pdf-viewer]')">
        <div v-if="pdfUrl" v-html="pdfViewerHtml" class="prose prose-sm max-w-none"></div>
        <div v-else class="text-sm text-gray-500 italic">
          No PDF URL found in field description
        </div>
      </template>
      
      <!-- Regular HTML Display -->
      <template v-else>
        <div v-html="field.options" class="prose prose-sm max-w-none"></div>
      </template>
      <p v-if="field.description && !field.label?.includes('[pdf-viewer]')" class="mt-1 text-xs text-gray-500">
        {{ field.description }}
      </p>
    </template>

    <!-- Multiple Upload Table -->
    <template v-else-if="field.fieldtype === 'Table' && (field.label.toLowerCase().includes('[multiple-upload]') || field.label.toLowerCase().includes('[multiple-upload-view]') || field.label.toLowerCase().includes('[multiple-camera]') || field.label.toLowerCase().includes('[multiple-camera-view]'))">
      <label class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
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
                  :accept="field.label.toLowerCase().includes('[multiple-camera]') || field.label.toLowerCase().includes('[multiple-camera-view]') ? 'image/*' : 'image/*,application/*'"
                  :capture="field.label.toLowerCase().includes('[multiple-camera]') || field.label.toLowerCase().includes('[multiple-camera-view]') ? 'environment' : undefined"
                  multiple 
                  class="sr-only" 
                  @change="handleMultipleFileUpload"
                />
              </label>
              <p v-if="!isMobile" class="pl-1">or drag and drop</p>
            </div>
            <p class="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 10MB</p>
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
        <p v-if="field.description" class="mt-1 text-xs text-gray-500">
          {{ field.description }}
        </p>
      </div>
    </template>

  <!-- Table Input -->
  <template v-else-if="field.fieldtype === 'Table'">
    <label class="block text-sm font-medium text-gray-700">
      {{ formattedLabel }}
      <span v-if="isFieldRequired" class="text-red-500">*</span>
    </label>
    <div class="mt-1">
      <div class="border border-gray-300 rounded-md">
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-300">
          <div class="flex items-center justify-between">
            <button
              type="button"
              @click="handleAddRow"
              class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Row
            </button>
            <button
              v-if="selectedRows.length > 0"
              type="button"
              @click="deleteSelectedRows"
              class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Selected ({{ selectedRows.length }})
            </button>
          </div>
        </div>

        <!-- Add Row Form -->
        <div v-if="showAddRowForm" class="p-4 border-b border-gray-200">
          <div class="space-y-4">
            <FormField
              v-for="tableField in field.tableFields"
              :key="tableField.fieldname"
              :field="{
                ...tableField,
                reqd: tableField.reqd || 0,
                hidden: tableField.hidden || 0,
                read_only: tableField.read_only || 0
              }"
              v-model="newRowData[tableField.fieldname]"
              :form-data="newRowData"
            />
          </div>
          <div class="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              @click="cancelAddRow"
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="saveNewRow"
              class="px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Save Row
            </button>
          </div>
        </div>

        <!-- Child Table Implementation -->
        <div v-if="field.tableFields" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th
                  v-for="tableField in visibleTableFields"
                  :key="tableField.fieldname"
                  scope="col"
                  class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  {{ tableField.label }}
                </th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="(row, index) in tableData" :key="index" :class="{ 'bg-gray-50': selectedRows.includes(index) }">
                <td class="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    :checked="selectedRows.includes(index)"
                    @change="toggleRowSelection(index)"
                    class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </td>
                <td
                  v-for="tableField in visibleTableFields"
                  :key="tableField.fieldname"
                  class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                >
                  {{ row[tableField.fieldname] }}
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button
                    type="button"
                    @click="deleteRow(index)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <tr v-if="tableData.length === 0">
                <td :colspan="visibleTableFields.length + 2" class="px-3 py-4 text-sm text-gray-500 text-center">
                  No rows added yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="px-4 py-3">
          <p class="text-sm text-gray-500">No table fields defined</p>
        </div>
      </div>
      <p v-if="field.description" class="mt-1 text-xs text-gray-500">
        {{ field.description }}
      </p>
    </div>
  </template>

  <!-- Table MultiSelect Input -->
  <template v-else-if="field.fieldtype === 'Table MultiSelect'">
    <div class="w-full lg:w-1/2">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <div class="mt-1 relative">
        <!-- Selected Items Display -->
        <div v-if="selectedTableItems.length > 0" class="mb-3">
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="item in selectedTableItems" 
              :key="item.name"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200"
            >
              <span class="mr-2">{{ item.name }}</span>
              <button
                v-if="!isFieldReadOnly"
                @click="removeTableItem(item)"
                type="button"
                class="text-green-600 hover:text-green-800"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Search and Select Interface -->
        <div class="relative">
          <div class="relative">
            <input
              :id="field.fieldname"
              v-model="tableSearchQuery"
              @input="searchTableItems"
              @focus="handleSearchFocus"
              @blur="handleSearchBlur"
              @keydown="handleSearchKeydown"
              type="text"
              :placeholder="`Search ${formattedLabel}...`"
              :disabled="isFieldReadOnly"
              :readonly="isFieldReadOnly"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 pr-10"
              :class="{
                'bg-gray-50': isFieldReadOnly,
                'cursor-not-allowed': isFieldReadOnly
              }"
            />
            <!-- Clear search button -->
            <button
              v-if="tableSearchQuery && !isFieldReadOnly"
              @click="clearSearch"
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Dropdown with search results -->
          <div 
            v-if="showTableDropdown && !isFieldReadOnly"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            <!-- Loading state in dropdown -->
            <div v-if="loadingTableItems" class="px-4 py-3 text-sm text-gray-500 text-center">
              <div class="flex items-center justify-center">
                <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </div>
            </div>
            
            <!-- No results state -->
            <div v-else-if="!loadingTableItems && filteredTableItems.length === 0 && tableSearchQuery.trim() !== ''" class="px-4 py-3 text-sm text-gray-500 text-center">
              No results found for "{{ tableSearchQuery }}"
            </div>
            
            <!-- Search results -->
            <div v-else-if="filteredTableItems.length > 0">
              <div 
                v-for="item in filteredTableItems" 
                :key="item.name"
                @click="selectTableItem(item)"
                class="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                :class="{
                  'bg-green-50 hover:bg-green-100': isItemSelected(item)
                }"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ item.name }}</div>
                    <div v-if="item.description" class="text-sm text-gray-500 mt-1">{{ item.description }}</div>
                  </div>
                  <!-- Checkmark for selected items -->
                  <div v-if="isItemSelected(item)" class="ml-2">
                    <svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Initial state when no search query and no items loaded -->
            <div v-else-if="tableSearchQuery.trim() === '' && !loadingTableItems" class="px-4 py-3 text-sm text-gray-500 text-center">
              Start typing to search or browse available options
            </div>
          </div>
          
        </div>
      </div>
      <p v-if="field.description" class="mt-1 text-xs text-gray-500">
        {{ field.description }}
      </p>
    </div>
  </template>

  <!-- Barcode Input -->
  <template v-else-if="field.fieldtype === 'Barcode'">
    <div class="w-full lg:w-1/2">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <input
        :id="field.fieldname"
        :value="modelValue"
        @input="handleBarcodeInput"
        type="text"
        :required="isFieldRequired"
        :disabled="isFieldReadOnly"
        :readonly="isFieldReadOnly"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        :class="{
          'bg-gray-50': isFieldReadOnly,
          'cursor-not-allowed': isFieldReadOnly
        }"
      />
      <div class="mt-2">
        <svg ref="barcodeSvg" />
      </div>
      <p v-if="field.description" class="mt-1 text-xs text-gray-500">
        {{ field.description }}
      </p>
    </div>
  </template>

  <!-- Code Input -->
  <template v-else-if="field.fieldtype === 'Code'">
    <div class="w-full lg:w-1/2">
      <label :for="field.fieldname" class="block text-sm font-medium text-gray-700">
        {{ formattedLabel }}
        <span v-if="isFieldRequired" class="text-red-500">*</span>
      </label>
      <VAceEditor
        v-model:value="codeValue"
        :lang="aceLanguageMode"
        :theme="'chrome'"
        :readonly="isFieldReadOnly"
        style="width: 100%; min-height: 180px; border-radius: 0.375rem; border: 1px solid #d1d5db; font-size: 1rem; margin-top: 0.5rem;"
        :options="{ useWorker: false, tabSize: 2, showPrintMargin: false }"
      />
      <p v-if="field.description" class="mt-1 text-xs text-gray-500">
        {{ field.description }}
      </p>
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
import { useRoute } from 'vue-router';
import { VueTelInput } from 'vue-tel-input';
import 'vue-tel-input/dist/vue-tel-input.css';
import L from 'leaflet';
import type { Map as LeafletMap, Marker as LeafletMarker, FeatureGroup as LeafletFeatureGroup, Control as LeafletControl, Circle as LeafletCircle } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

// Explicitly import Draw control
import 'leaflet-draw/dist/leaflet.draw.js';

import { getFormList, uploadFile } from '../services/erpnext';
import { searchLink } from '../services/deskApi';
import { evaluateFieldDependency } from '../utils/fieldDependency';
import { useErrorStore } from '../stores/error';
import { MapPinIcon, LoaderIcon } from 'lucide-vue-next';
import { getErpNextApiUrl } from '../utils/api';
import { optimizeImage } from '../utils/imageUtils';
import SignaturePad from 'signature_pad';
import { useAuthStore } from '../stores/auth';
import { getCurrentDateFormatted, getCurrentTimeFormatted, getCurrentDateTimeFormatted, toAppTimezoneISO } from '../utils/timezone';
import { getErrorsAsJson } from '../utils/errorCapture';
import FormField from './FormField.vue';
import JsBarcode from 'jsbarcode';
import { VAceEditor } from 'vue3-ace-editor';
import { useMentions } from '../composables/useMentions';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-markdown';

interface TableField {
  fieldname: string;
  label: string;
  fieldtype: string;
  in_list_view?: number;
  reqd?: number;
  options?: string;
  hidden?: number;
  depends_on?: string;
  max_length?: number;
  max_value?: number;
  precision?: string;
  read_only?: number;
  description?: string;
  default?: string;
}

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
  mandatory_depends_on?: string;
  read_only_depends_on?: string;
  description?: string;
  default?: string;
  tableFields?: TableField[];
}

interface UploadedFile {
  file: File | null;
  preview: string;
  uploaded?: boolean;
  fileUrl?: string;
  isExisting?: boolean;
  originalIndex?: number;
}

interface GeolocationData {
  fieldname: string;
  label: string;
  value: string;
  type: 'lat' | 'lng' | 'address';
}

interface TableItem {
  name: string;
  description?: string;
}

interface DynamicLinkDocument {
  name: string;
  description?: string;
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

const route = useRoute();
const imagePreview = ref<string | null>(null);
const showDurationPopup = ref(false);
const durationParts = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
const durationString = ref('');
const durationPopupRef = ref<HTMLElement | null>(null);
const durationWrapperRef = ref<HTMLElement | null>(null);
const phoneValue = ref(
  props.field.fieldtype === 'Phone' && typeof props.modelValue === 'string' 
    ? props.modelValue 
    : ''
);
const linkOptions = ref<any[]>([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadedFiles = ref<UploadedFile[]>([]);

const errorStore = useErrorStore();
const authStore = useAuthStore();

const mediaQueryMatches = ref(false);

// Initialize uploadedFiles with existing data for multiple upload tables
const initializeExistingFiles = () => {
  if (props.field.fieldtype === 'Table' && 
      (props.field.label?.toLowerCase().includes('[multiple-upload]') || 
       props.field.label?.toLowerCase().includes('[multiple-upload-view]') || 
       props.field.label?.toLowerCase().includes('[multiple-camera]') || 
       props.field.label?.toLowerCase().includes('[multiple-camera-view]'))) {
    
    if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
             const existingFiles: UploadedFile[] = [];
       props.modelValue.forEach((item: any, index: number) => {
         const imageUrl = item.image || item.file_url || item.attachment;
         if (imageUrl) {
           // Convert relative URLs to absolute URLs
           const fullUrl = imageUrl.startsWith('http') ? imageUrl : 
                          imageUrl.startsWith('/') ? `${getErpNextApiUrl()}${imageUrl}` : 
                          `${getErpNextApiUrl()}/${imageUrl}`;
           
           existingFiles.push({
             file: null, // No file object for existing files
             preview: fullUrl,
             uploaded: true,
             fileUrl: imageUrl,
             isExisting: true,
             originalIndex: index
           });
         }
       });
       
       uploadedFiles.value = existingFiles;
    }
  }
};

const shouldShowField = computed(() => {
  // console.log('shouldShowField', props.field);
  return evaluateFieldDependency(props.field, props.formData);
});

const isFieldRequired = computed(() => {
  // console.log('props.field.mandatory_depends_on for field', props.field.fieldname, props.field.mandatory_depends_on);
  if (props.field.mandatory_depends_on) {
    return evaluateFieldDependency(props.field, props.formData, 'mandatory_depends_on');
  }
  return props.field.reqd === 1;
});

const isFieldReadOnly = computed(() => {
  // Check if field has read_only_depends_on condition
  if (props.field.read_only_depends_on) {
    return evaluateFieldDependency(props.field, props.formData, 'read_only_depends_on');
  }
  // Fall back to the static read_only property
  return props.field.read_only === 1;
});

const formattedLabel = computed(() => {
  if (!props.field.label) return '';
  return props.field.label.replace(/\[.*?\]/g, '').trim();
});

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return mediaQueryMatches.value;
});

const shouldUseCameraInput = computed(() => {
  return isMobile.value && props.field.label?.includes('[camera]');
});

const shouldUserChangeWatermarkDownloadValue = computed(() => {
  return authStore.user?.roles?.includes('Technician') && !authStore.user?.roles?.includes('System Manager');
});

const shouldAutoFillUserData = computed(() => {
  return props.field.label?.includes('[login-') && props.field.label?.includes(']');
});

watch(() => props.modelValue, (val) => {
  durationString.value = typeof val === 'string' ? val : formatDurationString();
  // Update phoneValue when parent modelValue changes
  if (props.field.fieldtype === 'Phone') {
    const newPhoneValue = typeof val === 'string' ? val : '';
    if (newPhoneValue !== phoneValue.value) {
      phoneValue.value = newPhoneValue;
    }
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

// Handle vue-tel-input model value updates
function onPhoneUpdate(value: string) {
  // Direct v-model update from vue-tel-input
  phoneValue.value = value || '';
  emit('update:modelValue', phoneValue.value);
}

// Handle vue-tel-input input events (provides phone object)
function onPhoneInputEvent(phoneObject: any) {
  // vue-tel-input @on-input event provides a phone object with formatted number
  if (phoneObject && typeof phoneObject === 'object') {
    const formattedNumber = phoneObject.number || phoneObject.formattedNumber || '';
    if (formattedNumber && typeof formattedNumber === 'string') {
      phoneValue.value = formattedNumber;
      emit('update:modelValue', formattedNumber);
    }
  }
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
  isModalOpen.value = false;
  
  isDeleting.value = true;
  
  nextTick().then(() => {
    if (deleteType.value === 'file') {
      if (filePreview.value && filePreview.value !== 'document') {
        URL.revokeObjectURL(filePreview.value);
      }
      filePreview.value = null;
      fileExtension.value = '';
      isPreviewableImage.value = false;
      emit('update:modelValue', '');
      uploadProgress.value = 0;
    } else {
      if (imagePreview.value) {
        if (imagePreview.value.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview.value);
        }
        imagePreview.value = null;
      }
      emit('update:modelValue', '');
      uploadProgress.value = 0;
    }
    
    deleteType.value = 'file';
    
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
  shouldAutoDownload.value = true;
  showDeleteConfirmation('image');
};

const handleFileUpload = async (event: Event) => {
  console.log('handleFileUpload ==== ');
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    if (filePreview.value && filePreview.value !== 'document') {
      URL.revokeObjectURL(filePreview.value);
    }
    
    fileExtension.value = file.name.split('.').pop()?.toUpperCase() || '';
    
    isPreviewableImage.value = file.type.startsWith('image/');
    
    if (isPreviewableImage.value) {
      filePreview.value = URL.createObjectURL(file);
    } else {
      filePreview.value = 'document';
    }
    
    uploading.value = true;
    uploadProgress.value = 0;
    
    try {
      const originalValue = props.modelValue;
      
      uploadProgress.value = 10;
      
      const response = await uploadFile(
        file,
        props.field.parent || '',
        props.parentDocName || '',
        false
      );
      
      uploadProgress.value = 90;
      
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
  console.log('handleImageUpload ==== ');
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    if (imagePreview.value) {
      if (imagePreview.value.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview.value);
      }
    }
    
    imagePreview.value = URL.createObjectURL(file);
    
    const optimizedFile = await optimizeImage(file);
    
    console.log('Current shouldAutoDownload state:', shouldAutoDownload.value);
    console.log('Is mobile:', isMobile.value);
    console.log('Has camera tag:', props.field.label?.includes('[camera]'));
    
    emit('update:modelValue', {
      file: optimizedFile,
      preview: imagePreview.value,
      fieldname: props.field.fieldname,
      needsWatermark: isMobile.value && props.field.label?.includes('[camera]'),
      autoDownload: shouldAutoDownload.value
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

  const mediaQuery = window.matchMedia('(max-width: 1024px)');
  mediaQueryMatches.value = mediaQuery.matches;
  
  const handleResize = (e: MediaQueryListEvent) => {
    mediaQueryMatches.value = e.matches;
  };
  
  mediaQuery.addEventListener('change', handleResize);
  
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleResize);
  });

  console.log('Component mounted, initializing geolocation fields');
  
  // Initialize existing files for multiple upload tables
  initializeExistingFiles();
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
      uploaded: false,
      isExisting: false
    }));
    uploadedFiles.value = [...uploadedFiles.value, ...newFiles];
    
    await uploadFiles();
  }
};

const uploadFiles = async () => {
  console.log('uploadFiles ==== ');
  console.log('uploadedFiles.value', uploadedFiles.value);
  if (uploadedFiles.value.length === 0) return;

  // Only process files that need to be uploaded (not existing files)
  const filesToUpload = uploadedFiles.value.filter(f => !f.uploaded && f.file);
  if (filesToUpload.length === 0) return;

  uploading.value = true;
  uploadProgress.value = 0;
  const totalFiles = filesToUpload.length;
  let completedFiles = 0;

  console.log('filesToUpload', filesToUpload);

  try {
    for (let i = 0; i < uploadedFiles.value.length; i++) {
      const file = uploadedFiles.value[i];
      if (file.uploaded || !file.file) continue;

      try {
        const response = await uploadFile(
          file.file,
          '',
          '',
          false
        );

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
  const fileToRemove = uploadedFiles.value[index];
  
  // Only revoke object URL for newly uploaded files (not existing files)
  if (fileToRemove.file && !fileToRemove.isExisting) {
    URL.revokeObjectURL(fileToRemove.preview);
  }
  
  uploadedFiles.value.splice(index, 1);
  
  emit('update:modelValue', uploadedFiles.value
    .filter(f => f.uploaded && f.fileUrl)
    .map(f => ({ image: f.fileUrl }))
  );
};

onUnmounted(() => {
  uploadedFiles.value.forEach(file => {
    // Only revoke URLs for newly uploaded files, not existing files
    if (file.file && !file.isExisting && file.preview.startsWith('blob:')) {
      URL.revokeObjectURL(file.preview);
    }
  });
});

const cameraInput = ref<HTMLInputElement | null>(null);

const openCamera = () => {
  if (cameraInput.value) {
    cameraInput.value.click();
  }
};

const isGettingLocation = ref(false);
const locationError = ref<string | null>(null);

const isGeolocationField = computed(() => {
  return props.field.label.includes('[geolocation-');
});

const geolocationFieldType = computed(() => {
  if (!isGeolocationField.value) return null;
  const match = props.field.label.match(/\[geolocation-(.*?)\]/);
  return match ? match[1] : null;
});

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
      locationError.value = 'Location permission was denied. Please enable location access in your device settings and try again.';
    } else if (error.code === 2) {
      locationError.value = 'Unable to determine your location. Please check your device\'s GPS settings and try again.';
    } else if (error.code === 3) {
      locationError.value = 'Location request timed out. Please try again.';
    } else {
      locationError.value = error.message || 'Failed to get location';
    }
  } finally {
    isGettingLocation.value = false;
  }
};

onMounted(() => {
  if (isGeolocationField.value && !props.modelValue) {
    getCurrentLocation();
  }
});

const hasExistingFile = computed(() => {
  return typeof props.modelValue === 'string' && props.modelValue.length > 0;
});

const existingFileUrl = computed(() => {
  if (!hasExistingFile.value) return null;
  
  const baseUrl = getErpNextApiUrl();
  const fileUrl = props.modelValue;

  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }

  if (fileUrl.startsWith('/')) {
    return `${baseUrl}${fileUrl}`;
  }

  return `${baseUrl}/${fileUrl}`;
});

const isExistingFileImage = computed(() => {
  if (!hasExistingFile.value) return false;
  const url = props.modelValue.toLowerCase();
  return url.endsWith('.jpg') || url.endsWith('.jpeg') || 
         url.endsWith('.png') || url.endsWith('.gif') || 
         url.endsWith('.webp');
});

watch(() => props.modelValue, async (newValue) => {
  if (isDeleting.value) return;

  if (props.field.fieldtype === 'Attach' || props.field.fieldtype === 'Attach Image') {
    if (newValue && typeof newValue === 'string') {
      if (filePreview.value && filePreview.value !== 'document') {
        URL.revokeObjectURL(filePreview.value);
      }
      if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
      }
      
      if (props.field.fieldtype === 'Attach Image') {
        imagePreview.value = existingFileUrl.value;
      } else {
        if (isExistingFileImage.value) {
          filePreview.value = existingFileUrl.value;
          isPreviewableImage.value = true;
        } else {
          filePreview.value = 'document';
          isPreviewableImage.value = false;
        }
        const urlParts = newValue.split('.');
        if (urlParts.length > 1) {
          fileExtension.value = urlParts.pop()?.toUpperCase() || '';
        }
      }
    }
  }
});

onMounted(() => {
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

const signatureCanvas = ref<HTMLCanvasElement | null>(null);
const signaturePad = ref<SignaturePad | null>(null);
const signaturePadContainer = ref<HTMLElement | null>(null);
const signatureTouchListeners = ref<{ [key: string]: (e: Event) => void } | null>(null);

const cleanupSignaturePad = () => {
  if (signatureCanvas.value && signatureTouchListeners.value) {
    const canvas = signatureCanvas.value;
    const listeners = signatureTouchListeners.value;
    
    // Remove all event listeners
    canvas.removeEventListener('touchstart', listeners.touchstart);
    canvas.removeEventListener('touchmove', listeners.touchmove);
    canvas.removeEventListener('touchend', listeners.touchend);
    canvas.removeEventListener('touchcancel', listeners.touchcancel);
    canvas.removeEventListener('contextmenu', listeners.contextmenu);
    
    signatureTouchListeners.value = null;
  }
  
  if (signaturePad.value) {
    signaturePad.value.off();
    signaturePad.value = null;
  }
};

const initSignaturePad = () => {
  console.log('initSignaturePad');
  if (!signatureCanvas.value) return;

  // Clean up previous instance
  cleanupSignaturePad();

  const container = signaturePadContainer.value;
  if (!container) return;

  const canvas = signatureCanvas.value;
  const rect = container.getBoundingClientRect();
  
  canvas.width = rect.width;
  canvas.height = 200;

  signaturePad.value = new SignaturePad(canvas, {
    backgroundColor: 'rgb(255, 255, 255)',
    penColor: 'rgb(0, 0, 0)'
  });

  // Add touch event listeners to prevent scrolling and other default behaviors
  const preventTouchDefault = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const preventContextMenu = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Store listener references for cleanup
  signatureTouchListeners.value = {
    touchstart: preventTouchDefault,
    touchmove: preventTouchDefault,
    touchend: preventTouchDefault,
    touchcancel: preventTouchDefault,
    contextmenu: preventContextMenu
  };

  // Prevent scrolling and other touch behaviors on the canvas
  canvas.addEventListener('touchstart', preventTouchDefault, { passive: false });
  canvas.addEventListener('touchmove', preventTouchDefault, { passive: false });
  canvas.addEventListener('touchend', preventTouchDefault, { passive: false });
  canvas.addEventListener('touchcancel', preventTouchDefault, { passive: false });

  // Prevent context menu on long press
  canvas.addEventListener('contextmenu', preventContextMenu);

  // Remove the automatic saving on stroke end
  // signaturePad.value.addEventListener("endStroke", () => {
  //   if (signaturePad.value && !signaturePad.value.isEmpty()) {
  //     const dataURL = signaturePad.value.toDataURL();
  //     emit('update:modelValue', dataURL);
  //   }
  // });
};

const clearSignature = () => {
  console.log('clearing signature');
  if (signaturePad.value) {
    signaturePad.value.clear();
  }
  emit('update:modelValue', '');
  
  // Reinitialize the signature pad after clearing
  nextTick(() => {
    initSignaturePad();
  });
};

// Add a method to save the current signature
const saveCurrentSignature = () => {
  if (signaturePad.value && !signaturePad.value.isEmpty()) {
    const dataURL = signaturePad.value.toDataURL();
    emit('update:modelValue', dataURL);
    return dataURL;
  }
  return null;
};

// Expose the save method so parent components can call it
defineExpose({ 
  VueTelInput,
  saveCurrentSignature 
});

// watch(() => props.modelValue, (newValue) => {
//   if (!newValue && signaturePad.value && !signaturePad.value.isEmpty()) {
//     const dataURL = signaturePad.value.toDataURL();
//     emit('update:modelValue', dataURL);
//   }
// });

onMounted(() => {
  if (props.field.fieldtype === 'Signature') {
    nextTick(() => {
      initSignaturePad();
    });
  }
});

const handleResize = () => {
  if (props.field.fieldtype === 'Signature') {
    if (!isMobile.value) {
      initSignaturePad();
    }
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  cleanupSignaturePad();
});

function handleDurationFocus() {
  if (!isFieldReadOnly.value) {
    showDurationPopup.value = true;
  }
  parseDurationString();
}

watch(() => authStore.user, (user) => {
  if (shouldAutoFillUserData.value && !props.modelValue) {
    console.log('shouldAutoFillUserData', user);
    
    // Extract the login type from the label (e.g., [login-user] -> user)
    const loginMatch = props.field.label?.match(/\[login-([^\]]+)\]/);
    if (loginMatch) {
      const loginType = loginMatch[1];
      
      switch (loginType) {
        case 'user':
          if (user?.profile.full_name) {
            emit('update:modelValue', user.profile.full_name);
          }
          break;
        case 'email':
          if (user?.email) {
            emit('update:modelValue', user.email);
          }
          break;
        case 'role':
          if (user?.roles && user.roles.length > 0) {
            console.log('setting login-role', user.roles[0]);
            emit('update:modelValue', user.roles.join(', '));
          }
          break;
        case 'name':
          if (user?.profile.full_name) {
            emit('update:modelValue', user.profile.full_name);
          }
          break;
        default:
          // For any other [login-*] pattern, try to get the value from user.details
          if (user?.details && user.details[loginType]) {
            emit('update:modelValue', user.details[loginType]);
          }
          break;
      }
    }
  }
}, { immediate: true });

const shouldAutoDownload = ref(true);

const checkboxKey = computed(() => `watermark-checkbox-${props.field.fieldtype}-${props.field.label}`);

watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    shouldAutoDownload.value = true;
  }
}, { deep: true });

watch(() => shouldAutoDownload.value, (newValue) => {
  console.log('shouldAutoDownload changed:', newValue);
});

watch(() => shouldShowField.value, (isVisible) => {
  if (isVisible && props.field.fieldtype === 'Signature') {
    nextTick(() => {
      initSignaturePad();
    });
  }
});

// Watch for signature modelValue changes to reinitialize when cleared
watch(() => props.modelValue, (newValue, oldValue) => {
  if (props.field.fieldtype === 'Signature') {
    // If signature was cleared (had value, now empty), reinitialize
    if (oldValue && !newValue) {
      nextTick(() => {
        initSignaturePad();
      });
    }
  }
});

const formatDisplayDate = (isoDate: string) => {
  if (!isoDate) return '';
  try {
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
  } catch (e) {
    return isoDate;
  }
};

const formatDisplayDateTime = (isoDateTime: string) => {
  if (!isoDateTime) return '';
  try {
    const [datePart, timePart] = isoDateTime.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year} ${timePart}`;
  } catch (e) {
    return isoDateTime;
  }
};

// Add function to extract default value from field
const getDefaultValueFromField = (field: FormField) => {
  console.log('getDefaultValueFromField', field.default);
  return field.default || null;
};

// Watch for field changes and set default value if needed
watch(() => props.field, (newField) => {

  // Only set if no value is currently set
  if (!props.modelValue) {
    // Handle special labels first (these don't need explicit default values)
    if (newField.label?.includes('[page-url]')) {
      // Get complete URL with all parameters using Vue Router
      const fullUrl = window.location.origin + route.fullPath;
      emit('update:modelValue', fullUrl);
    } else if (newField.label?.includes('[support-data]')) {
      // Get captured errors as JSON
      try {
        const supportData = getErrorsAsJson();
        
        // Validate that the support data is valid JSON
        JSON.parse(supportData);
        emit('update:modelValue', supportData);
      } catch (error) {
        console.warn('Error generating support data JSON:', error);
        // Fallback to a minimal valid JSON structure
        const fallbackData = {
          captureTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          totalErrors: 0,
          errors: [],
          error: 'Failed to capture error data'
        };
        emit('update:modelValue', JSON.stringify(fallbackData));
      }
    }
    // Handle explicit default values
    else if (newField.default) {
      if (newField.default == 'Now') {
        if (newField.fieldtype === 'Datetime') {
          // For datetime-local input, use Australia/Sydney timezone
          emit('update:modelValue', getCurrentDateTimeFormatted());
        } else if (newField.fieldtype === 'Date') {
          // For date input, use Australia/Sydney timezone
          emit('update:modelValue', getCurrentDateFormatted());
        } else if (newField.fieldtype === 'Time') {
          // For time input, use Australia/Sydney timezone
          emit('update:modelValue', getCurrentTimeFormatted());
        } else {
          // For other field types, use ISO string in app timezone
          emit('update:modelValue', toAppTimezoneISO());
        }
      } else {
        emit('update:modelValue', newField.default);
      }
    }
  }
}, { immediate: true });

const handleValueUpdate = (value: any) => {
  emit('update:modelValue', value);
  if (props.formData) {
    props.formData[props.field.fieldname] = value;
    evaluateFieldDependency(props.field, props.formData);
  }
};

// JSON field handling
const jsonError = ref<string | null>(null);

const formattedJsonValue = computed(() => {
  if (!props.modelValue) return '';
  try {
    // If the value is already a string, try to parse it
    const value = typeof props.modelValue === 'string' 
      ? JSON.parse(props.modelValue)
      : props.modelValue;
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return props.modelValue;
  }
});

const handleJsonInput = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value;
  try {
    // Try to parse the JSON to validate it
    const parsed = JSON.parse(value);
    jsonError.value = null;
    // Store as compact JSON string to avoid formatting issues
    emit('update:modelValue', JSON.stringify(parsed));
  } catch (e) {
    jsonError.value = 'Invalid JSON format';
    // Still emit the value so user can continue editing
    emit('update:modelValue', value);
  }
};

const formatJson = () => {
  try {
    const value = typeof props.modelValue === 'string' 
      ? JSON.parse(props.modelValue)
      : props.modelValue;
    emit('update:modelValue', JSON.stringify(value, null, 2));
    jsonError.value = null;
  } catch (e) {
    jsonError.value = 'Invalid JSON format';
  }
};

// Add function to validate JSON before submission
const validateJsonField = () => {
  if (props.field.fieldtype === 'JSON' && props.modelValue) {
    try {
      const value = typeof props.modelValue === 'string' 
        ? JSON.parse(props.modelValue)
        : props.modelValue;
      // Return compact JSON string
      return JSON.stringify(value);
    } catch (e) {
      throw new Error(`Invalid JSON in field "${props.field.label}": ${e.message}`);
    }
  }
  return props.modelValue;
};

// Add these refs and computed properties after the existing ones
const selectedRows = ref<number[]>([]);
const tableData = ref<any[]>([]);
const showAddRowForm = ref(false);
const newRowData = ref<Record<string, any>>({});

const visibleTableFields = computed(() => {
  if (!props.field.tableFields) return [];
  return props.field.tableFields.filter(field => field.in_list_view === 1);
});

const isAllSelected = computed(() => {
  return tableData.value.length > 0 && selectedRows.value.length === tableData.value.length;
});

// Add these methods after the existing ones
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRows.value = [];
  } else {
    selectedRows.value = tableData.value.map((_, index) => index);
  }
};

const toggleRowSelection = (index: number) => {
  const position = selectedRows.value.indexOf(index);
  if (position === -1) {
    selectedRows.value.push(index);
  } else {
    selectedRows.value.splice(position, 1);
  }
};

const deleteRow = (index: number) => {
  tableData.value.splice(index, 1);
  // Remove the index from selectedRows and adjust other indices
  selectedRows.value = selectedRows.value
    .filter(i => i !== index)
    .map(i => i > index ? i - 1 : i);
  
  // Update the model value
  emit('update:modelValue', tableData.value);
};

const deleteSelectedRows = () => {
  // Sort indices in descending order to avoid index shifting issues
  const sortedIndices = [...selectedRows.value].sort((a, b) => b - a);
  
  // Remove rows
  sortedIndices.forEach(index => {
    tableData.value.splice(index, 1);
  });
  
  // Clear selection
  selectedRows.value = [];
  
  // Update the model value
  emit('update:modelValue', tableData.value);
};

// Initialize table data from model value
watch(() => props.modelValue, (newValue) => {
  if (props.field.fieldtype === 'Table') {
    // Handle multiple upload tables
    if (props.field.label?.toLowerCase().includes('[multiple-upload]') || 
        props.field.label?.toLowerCase().includes('[multiple-upload-view]') || 
        props.field.label?.toLowerCase().includes('[multiple-camera]') || 
        props.field.label?.toLowerCase().includes('[multiple-camera-view]')) {
      initializeExistingFiles();
    } else {
      // Handle regular tables
      tableData.value = Array.isArray(newValue) ? newValue : [];
    }
  }
}, { immediate: true });

// Add this method to handle adding new rows
const handleAddRow = () => {
  showAddRowForm.value = true;
  // Initialize newRowData with empty values for each field
  newRowData.value = {};
  if (props.field.tableFields) {
    props.field.tableFields.forEach(field => {
      // Ensure all required properties are set
      const tableField = {
        ...field,
        reqd: field.reqd || 0,
        hidden: field.hidden || 0,
        read_only: field.read_only || 0
      };
      newRowData.value[tableField.fieldname] = '';
    });
  }
};

const saveNewRow = () => {
  tableData.value.push({ ...newRowData.value });
  showAddRowForm.value = false;
  newRowData.value = {};
  // Update the model value
  emit('update:modelValue', tableData.value);
};

const cancelAddRow = () => {
  showAddRowForm.value = false;
  newRowData.value = {};
};

// Add these to the script setup section
const map = ref<LeafletMap | null>(null);
const marker = ref<LeafletMarker | null>(null);
const latitude = ref<number | ''>('');
const longitude = ref<number | ''>('');
const drawnItems = ref<LeafletFeatureGroup | null>(null);
const drawControl = ref<LeafletControl.Draw | null>(null);

// Initialize map when component is mounted
onMounted(() => {
  if (props.field.fieldtype === 'Geolocation') {
    nextTick(() => {
      initializeMap();
    });
  }
});

function initializeMap() {
  const mapElement = document.getElementById(`map-${props.field.fieldname}`);
  if (!mapElement) return;

  // Initialize map
  map.value = L.map(mapElement).setView([0, 0], 2);
  
  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value as any);

  // Initialize marker
  marker.value = L.marker([0, 0], {
    draggable: !props.field.read_only
  }).addTo(map.value as any);

  // Initialize the FeatureGroup to store editable layers
  drawnItems.value = new L.FeatureGroup().addTo(map.value as any);

  // Initialize the draw control and pass it the FeatureGroup of editable layers
  if (!props.field.read_only) {
    try {
      // Define draw options with proper type definitions
      const drawOptions: L.Control.DrawConstructorOptions = {
        draw: {
          polyline: {
            shapeOptions: {
              color: '#3388ff',
              weight: 2
            },
            showLength: true,
            metric: true
          },
          polygon: {
            shapeOptions: {
              color: '#3388ff',
              weight: 2
            },
            showArea: true,
            metric: true
          },
          circle: {
            shapeOptions: {
              color: '#3388ff',
              weight: 2
            },
            showRadius: true,
            metric: true
          },
          rectangle: {
            shapeOptions: {
              color: '#3388ff',
              weight: 2
            },
            showArea: false,
            metric: true
          },
          marker: {
            icon: L.divIcon({
              className: 'custom-marker',
              html: '<div style="background-color: #3388ff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })
          },
          circlemarker: {}
        },
        edit: {
          featureGroup: drawnItems.value as any,
          remove: true,
          edit: {
            selectedPathOptions: {
              dashArray: '10, 10'
            }
          }
        }
      };

      drawControl.value = new L.Control.Draw(drawOptions);

      // Only add the control after ensuring the map is ready
      if (map.value) {
        map.value.addControl(drawControl.value);
      }

      // Handle drawing events with error handling
      map.value.on('draw:created', (e: any) => {
        try {
          const layer = e.layer;
          if (drawnItems.value) {
            drawnItems.value.addLayer(layer);

            // If it's a point, update the marker position
            if (e.layerType === 'marker') {
              const latlng = layer.getLatLng();
              setMapPosition(latlng.lat, latlng.lng);
            }

            // Update the model value with the drawn shape
            updateDrawnShapeValue();
          }
        } catch (error) {
          console.error('Error handling draw:created event:', error);
        }
      });

      map.value.on('draw:edited', () => {
        try {
          updateDrawnShapeValue();
        } catch (error) {
          console.error('Error handling draw:edited event:', error);
        }
      });

      map.value.on('draw:deleted', () => {
        try {
          updateDrawnShapeValue();
        } catch (error) {
          console.error('Error handling draw:deleted event:', error);
        }
      });
    } catch (error) {
      console.error('Error initializing draw control:', error);
    }
  }

  // Handle marker drag end with error handling
  if (marker.value) {
    marker.value.on('dragend', (event) => {
      try {
        const position = event.target.getLatLng();
        latitude.value = position.lat;
        longitude.value = position.lng;
        updateModelValue();
      } catch (error) {
        console.error('Error handling marker dragend:', error);
      }
    });
  }

  // Set initial position if value exists
  if (props.modelValue) {
    try {
      // Try to parse as GeoJSON first
      let geoJson;
      try {
        geoJson = typeof props.modelValue === 'string' ? JSON.parse(props.modelValue) : props.modelValue;
      } catch (e) {
        geoJson = null;
      }

      if (geoJson && (geoJson.type === 'Feature' || geoJson.type === 'FeatureCollection')) {
        // Handle GeoJSON
        if (geoJson.type === 'Feature') {
          addGeoJsonFeature(geoJson);
        } else if (geoJson.type === 'FeatureCollection') {
          geoJson.features.forEach((feature: any) => {
            addGeoJsonFeature(feature);
          });
        }
        
        // Fit bounds to show all features
        if (drawnItems.value && drawnItems.value.getLayers().length > 0) {
          map.value.fitBounds(drawnItems.value.getBounds());
        }
      } else {
        // Handle simple coordinates
        const coords = typeof props.modelValue === 'string' ? props.modelValue.split(',') : [props.modelValue.lat, props.modelValue.lng];
        const [lat, lng] = coords.map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          setMapPosition(lat, lng);
        }
      }
    } catch (error) {
      console.error('Error parsing geolocation value:', error);
    }
  }
}

// Helper function to add GeoJSON features to the map
function addGeoJsonFeature(feature: any) {
  if (!drawnItems.value) return;

  try {
    if (feature.geometry.type === 'Point' && feature.properties?.point_type === 'circle') {
      // Handle circle points
      const coordinates = feature.geometry.coordinates;
      const radius = feature.properties.radius || 1000; // Default radius if not specified
      
      const circle = L.circle([coordinates[1], coordinates[0]], {
        radius: radius,
        color: '#3388ff',
        weight: 2,
        fillColor: '#3388ff',
        fillOpacity: 0.2
      });
      
      drawnItems.value.addLayer(circle as any);
    } else if (feature.geometry.type === 'Point' && feature.properties?.point_type === 'circlemarker') {
      // Handle circlemarker points
      const coordinates = feature.geometry.coordinates;
      const radius = feature.properties.radius || 6; // Default radius for circlemarker
      
      const circleMarker = L.circleMarker([coordinates[1], coordinates[0]], {
        radius: radius,
        color: '#3388ff',
        weight: 2,
        fillColor: '#3388ff',
        fillOpacity: 0.2
      });
      
      drawnItems.value.addLayer(circleMarker as any);
    } else if (feature.geometry.type === 'Point' && feature.properties?.point_type === 'marker') {
      // Handle marker points
      const coordinates = feature.geometry.coordinates;
      
      const marker = L.marker([coordinates[1], coordinates[0]], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: #3388ff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        })
      });
      
      drawnItems.value.addLayer(marker as any);
    } else {
      // Handle standard GeoJSON features
      const layer = L.geoJSON(feature);
      if (layer.getLayers().length > 0) {
        drawnItems.value.addLayer(layer.getLayers()[0] as any);
      }
    }
  } catch (error) {
    console.error('Error adding GeoJSON feature:', error);
  }
}

// Add a watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (map.value && newValue) {
    try {
      // Clear existing layers
      drawnItems.value?.clearLayers();
      
      // Try to parse as GeoJSON first
      let geoJson;
      try {
        geoJson = typeof newValue === 'string' ? JSON.parse(newValue) : newValue;
      } catch (e) {
        geoJson = null;
      }

      if (geoJson && (geoJson.type === 'Feature' || geoJson.type === 'FeatureCollection')) {
        // Handle GeoJSON
        if (geoJson.type === 'Feature') {
          addGeoJsonFeature(geoJson);
        } else if (geoJson.type === 'FeatureCollection') {
          geoJson.features.forEach((feature: any) => {
            addGeoJsonFeature(feature);
          });
        }
        
        // Fit bounds to show all features
        if (drawnItems.value && drawnItems.value.getLayers().length > 0) {
          map.value.fitBounds(drawnItems.value.getBounds());
        }
      } else {
        // Handle simple coordinates
        const coords = typeof newValue === 'string' ? newValue.split(',') : [newValue.lat, newValue.lng];
        const [lat, lng] = coords.map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          setMapPosition(lat, lng);
        }
      }
    } catch (error) {
      console.error('Error updating map from new value:', error);
    }
  }
}, { immediate: true });

function setMapPosition(lat: number, lng: number) {
  if (!map.value || !marker.value) return;
  
  latitude.value = lat;
  longitude.value = lng;
  
  const newPosition = L.latLng(lat, lng);
  marker.value.setLatLng(newPosition);
  map.value.setView(newPosition, 13);
}

function updateMapPosition() {
  if (latitude.value === '' || longitude.value === '') return;
  setMapPosition(latitude.value, longitude.value);
  updateModelValue();
}

function updateModelValue() {
  if (latitude.value === '' || longitude.value === '') {
    emit('update:modelValue', '');
  } else {
    emit('update:modelValue', `${latitude.value},${longitude.value}`);
  }
}

async function getGeolocation() {
  if (!navigator.geolocation) {
    errorStore.setError('Geolocation is not supported by your browser');
    return;
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude: lat, longitude: lng } = position.coords;
    setMapPosition(lat, lng);
    updateModelValue();
  } catch (error) {
    errorStore.setError('Unable to retrieve your location');
  }
}

function updateDrawnShapeValue() {
  if (!drawnItems.value) return;

  const layers = drawnItems.value.getLayers();
  
  if (layers.length === 0) {
    updateModelValue();
    return;
  }

  // Create a GeoJSON feature collection
  const features = layers.map(layer => {
    if ((layer as any).getRadius && typeof (layer as any).getRadius === 'function') {
      // Convert circle to GeoJSON with point_type
      const latlng = (layer as any).getLatLng();
      const radius = (layer as any).getRadius();
      
      return {
        type: 'Feature',
        properties: {
          point_type: 'circle',
          radius: radius
        },
        geometry: {
          type: 'Point',
          coordinates: [latlng.lng, latlng.lat]
        }
      };
    } else if ((layer as any).getLatLng && typeof (layer as any).getLatLng === 'function') {
      // Handle markers and circlemarkers
      const latlng = (layer as any).getLatLng();
      const isCircleMarker = (layer as any).getRadius && (layer as any).getRadius() <= 10; // Circle markers typically have small radius
      
      if (isCircleMarker) {
        const radius = (layer as any).getRadius();
        return {
          type: 'Feature',
          properties: {
            point_type: 'circlemarker',
            radius: radius
          },
          geometry: {
            type: 'Point',
            coordinates: [latlng.lng, latlng.lat]
          }
        };
      } else {
        // Regular marker
        return {
          type: 'Feature',
          properties: {
            point_type: 'marker'
          },
          geometry: {
            type: 'Point',
            coordinates: [latlng.lng, latlng.lat]
          }
        };
      }
    } else {
      // Handle other layer types (polygon, polyline, rectangle)
      const geoJson = (layer as any).toGeoJSON();
      return geoJson;
    }
  });

  const geoJson = {
    type: 'FeatureCollection',
    features: features
  };

  emit('update:modelValue', JSON.stringify(geoJson));
}

function clearDrawing() {
  if (drawnItems.value) {
    drawnItems.value.clearLayers();
    updateDrawnShapeValue();
  }
}

// Update the cleanup in onUnmounted
onUnmounted(() => {
  if (map.value) {
    try {
      // Remove all event listeners
      map.value.off('draw:created');
      map.value.off('draw:edited');
      map.value.off('draw:deleted');

      // Remove the draw control first
      if (drawControl.value) {
        map.value.removeControl(drawControl.value);
        drawControl.value = null;
      }

      // Clear drawn items
      if (drawnItems.value) {
        drawnItems.value.clearLayers();
        drawnItems.value = null;
      }

      // Remove marker
      if (marker.value) {
        marker.value.remove();
        marker.value = null;
      }

      // Finally remove the map
      map.value.remove();
      map.value = null;
    } catch (error) {
      console.error('Error cleaning up map:', error);
    }
  }
});

const getLoginTypeDescription = () => {
  const loginMatch = props.field.label?.match(/\[login-([^\]]+)\]/);
  if (loginMatch) {
    const loginType = loginMatch[1];
    switch (loginType) {
      case 'user':
        return 'full name';
      case 'email':
        return 'email';
      case 'role':
        return 'role';
      case 'name':
        return 'full name';
      case 'first_name':
        return 'first name';
      case 'last_name':
        return 'last name';
      case 'middle_name':
        return 'middle name';
      case 'full_name':
        return 'full name';
      case 'position':
        return 'position';
      case 'mobile_no':
        return 'mobile number';
      case 'language':
        return 'language';
      case 'time_zone':
        return 'time zone';
      case 'user_type':
        return 'user type';
      case 'last_login':
        return 'last login date';
      case 'last_active':
        return 'last active date';
      case 'creation':
        return 'account creation date';
      case 'modified':
        return 'last modified date';
      case 'owner':
        return 'account owner';
      case 'modified_by':
        return 'last modified by';
      default:
        return loginType.replace(/_/g, ' ');
    }
  }
  return 'user information';
};

const selectedTableItems = ref<TableItem[]>([]);
const tableSearchQuery = ref('');
const showTableDropdown = ref(false);
const filteredTableItems = ref<TableItem[]>([]);
const loadingTableItems = ref(false);
const tableError = ref('');

const searchTableItems = async () => {
  loadingTableItems.value = true;
  tableError.value = '';

  try {
    // If field.options contains a table name, fetch from ERPNext
    console.log('Searching for table items:', props.field);
    if (props.field.options) {
      const response = await searchLink({
        txt: tableSearchQuery.value || '', // Allow empty search to get all items
        doctype: props.field.tableFields?.[0]?.options || props.field.options,
        ignore_user_permissions: 0,
        reference_doctype: props.field.parent || props.field.options,
        page_length: 50 // Increased page length for better browsing
      });
      
      console.log('Search response:', response);
      
      // Handle the response data properly
      if (response && response.message) {
        // Convert the response to the expected format
        filteredTableItems.value = response.message.map((item: any) => ({
          name: item.value || item.name || item,
          description: item.description || item.label || ''
        }));
      } else {
        filteredTableItems.value = [];
      }
    } else {
      // Fallback to mock data
      filteredTableItems.value = [
        { name: 'Item 1', description: 'Description for Item 1' },
        { name: 'Item 2', description: 'Description for Item 2' },
        { name: 'Item 3', description: 'Description for Item 3' },
        { name: 'Item 4', description: 'Description for Item 4' },
        { name: 'Item 5', description: 'Description for Item 5' }
      ].filter(item => 
        !tableSearchQuery.value || 
        item.name.toLowerCase().includes(tableSearchQuery.value.toLowerCase())
      );
    }
  } catch (error) {
    console.error('Error searching table items:', error);
    tableError.value = 'Failed to load options';
    filteredTableItems.value = [];
  } finally {
    loadingTableItems.value = false;
  }
};

const selectTableItem = (item: TableItem) => {
  // Check if item is already selected
  if (!selectedTableItems.value.find(i => i.name === item.name)) {
    selectedTableItems.value.push(item);
    updateTableMultiSelectValue();
  }
  // Don't clear the search query immediately to allow multiple selections
  // tableSearchQuery.value = '';
  // showTableDropdown.value = false;
};

const removeTableItem = (item: TableItem) => {
  selectedTableItems.value = selectedTableItems.value.filter(i => i.name !== item.name);
  updateTableMultiSelectValue();
};

const updateTableMultiSelectValue = () => {
  // For Table MultiSelect, save as child table with proper field structure
  if (props.field.fieldtype === 'Table MultiSelect') {
    // Create child table rows with the selected items
    const formattedItems = selectedTableItems.value.map(item => {
      // Create a row object with the doctype and the actual field data
      const row: any = {
        doctype: props.field.options || 'Table MultiSelect Row'
      };
      
      // If the field has tableFields defined, use the first one as the main field
      if (props.field.tableFields && props.field.tableFields.length > 0) {
        const mainField = props.field.tableFields[0];
        row[mainField.fieldname] = item.name;
        
        // Add other fields if they exist
        if (item.description) {
          const descField = props.field.tableFields.find(f => f.fieldtype === 'Text' || f.fieldtype === 'Small Text');
          if (descField) {
            row[descField.fieldname] = item.description;
          }
        }
      } else {
        // Fallback: use a generic field name
        row.name = item.name;
        if (item.description) {
          row.description = item.description;
        }
      }
      
      return row;
    });
    
    emit('update:modelValue', formattedItems);
  } else {
    // Fallback to comma-separated string for other field types
    const value = selectedTableItems.value.map(item => item.name).join(', ');
    emit('update:modelValue', value);
  }
};

// Watch for external model value changes
watch(() => props.modelValue, (newValue) => {
  if (props.field.fieldtype === 'Table MultiSelect') {
    if (Array.isArray(newValue)) {
      // Handle array format (from ERPNext child table)
      selectedTableItems.value = newValue.map(item => {
        // Extract the main field value based on tableFields configuration
        let name = '';
        let description = '';
        
        if (props.field.tableFields && props.field.tableFields.length > 0) {
          const mainField = props.field.tableFields[0];
          name = item[mainField.fieldname] || item.name || item.value || '';
          
          // Try to find description field
          const descField = props.field.tableFields.find(f => f.fieldtype === 'Text' || f.fieldtype === 'Small Text');
          if (descField && item[descField.fieldname]) {
            description = item[descField.fieldname];
          }
        } else {
          // Fallback: use generic field names
          name = item.name || item.value || '';
          description = item.description || '';
        }
        
        return { name, description };
      });
    } else if (typeof newValue === 'string' && newValue.trim()) {
      // Handle comma-separated string format (fallback)
      const itemNames = newValue.split(',').map(name => name.trim()).filter(Boolean);
      selectedTableItems.value = itemNames.map(name => ({ name }));
    } else {
      selectedTableItems.value = [];
    }
  }
}, { immediate: true });

// Close dropdown when clicking outside
const handleTableMultiSelectClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(`#${props.field.fieldname}`)) {
    showTableDropdown.value = false;
  }
};

onMounted(() => {
  if (props.field.fieldtype === 'Table MultiSelect') {
    document.addEventListener('click', handleTableMultiSelectClickOutside);
  }
  if (props.field.fieldtype === 'Long Text') {
    setupMentionListeners();
  }
});

onUnmounted(() => {
  if (props.field.fieldtype === 'Table MultiSelect') {
    document.removeEventListener('click', handleTableMultiSelectClickOutside);
  }
  if (props.field.fieldtype === 'Long Text') {
    cleanupMentionListeners();
  }
});

const isItemSelected = (item: TableItem) => {
  return selectedTableItems.value.some(selectedItem => selectedItem.name === item.name);
};

const handleSearchBlur = () => {
  // Delay hiding the dropdown to allow for clicks on items
  setTimeout(() => {
    showTableDropdown.value = false;
  }, 200);
};

const clearSearch = () => {
  tableSearchQuery.value = '';
  filteredTableItems.value = [];
  showTableDropdown.value = false;
};

// Add keyboard navigation
const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showTableDropdown.value = false;
  } else if (event.key === 'Enter' && filteredTableItems.value.length > 0) {
    // Select the first item on Enter
    selectTableItem(filteredTableItems.value[0]);
  }
};

const handleSearchFocus = () => {
  showTableDropdown.value = true;
  // Load initial list if no search query and no items are loaded yet
  if (!tableSearchQuery.value && filteredTableItems.value.length === 0) {
    searchTableItems();
  }
};

// PDF Viewer computed properties
const pdfUrl = computed(() => {
  if (props.field.fieldtype === 'HTML' && props.field.label?.includes('[pdf-viewer]')) {
    // The description contains the field name, get the value of that field
    const fieldName = props.field.description;
    if (fieldName && props.formData) {
      return props.formData[fieldName] || '';
    }
    return '';
  }
  return null;
});

const pdfViewerHtml = computed(() => {
  if (!pdfUrl.value) return '';
  
  // Hide PDF viewer on mobile devices
  if (isMobile.value) {
    const pdfUrlValue = pdfUrl.value;
    return `
      <div style="margin-bottom: 8px;">
        <a href="${pdfUrlValue}" target="_blank" 
           style="display:inline-block; padding:4px 8px; font-size: 12px; background:#808080; color:#fff; border-radius:3px; text-decoration:none;">
          Open PDF in New Tab
        </a>
      </div>
    `;
  }
  
  const pdfUrlValue = pdfUrl.value;
  return `
    <div style="margin-bottom: 8px;">
      <a href="${pdfUrlValue}" target="_blank" 
         style="display:inline-block; padding:4px 8px; font-size: 12px; background:#808080; color:#fff; border-radius:3px; text-decoration:none;">
        Open PDF in New Tab
      </a>
    </div>
    <div style="position: relative; width: 100%; padding-bottom: 50%; height: 0; overflow: hidden;">
      <iframe src="${pdfUrlValue}" 
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:1px solid #ccc;" 
              frameborder="0" allowfullscreen>
      </iframe>
    </div>
  `;
});

const dynamicLinkDoctypes = ref<string[]>([]);
const dynamicLinkSearchQuery = ref('');
const showDynamicLinkDropdown = ref(false);
const filteredDynamicLinkDocuments = ref<DynamicLinkDocument[]>([]);
const loadingDynamicLinkDocuments = ref(false);
const dynamicLinkError = ref('');

// Get the doctype from the referenced Link field
const getDynamicLinkDoctype = (): string | null => {
  if (!props.field.options || !props.formData) {
    return null;
  }
  
  // The options field contains the name of the Link field that specifies the doctype
  const linkFieldName = props.field.options.trim();
  const selectedDoctype = props.formData[linkFieldName];
  
  return selectedDoctype || null;
};

// Get the label of the Link field for help text
const getDynamicLinkFieldLabel = (): string => {
  if (!props.field.options) {
    return 'Document Type';
  }
  
  const linkFieldName = props.field.options.trim();
  // Try to find the field label from the form data or use the fieldname
  return linkFieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Get placeholder text based on selected doctype
const getDynamicLinkPlaceholder = (): string => {
  const doctype = getDynamicLinkDoctype();
  if (doctype) {
    return `Search ${doctype} documents...`;
  }
  return 'Select document type first';
};

const searchDynamicLinkDocuments = async () => {
  const doctype = getDynamicLinkDoctype();
  if (!doctype) return;
  
  loadingDynamicLinkDocuments.value = true;
  dynamicLinkError.value = '';

  try {
    const response = await searchLink({
      txt: dynamicLinkSearchQuery.value || '',
      doctype: doctype,
      ignore_user_permissions: 0,
      reference_doctype: props.field.parent || doctype,
      page_length: 50
    });
    
    console.log('Dynamic Link search response:', response);
    
    if (response && response.message) {
      filteredDynamicLinkDocuments.value = response.message.map((item: any) => ({
        name: item.value || item.name || item,
        description: item.description || item.label || ''
      }));
    } else {
      filteredDynamicLinkDocuments.value = [];
    }
  } catch (error) {
    console.error('Error searching dynamic link documents:', error);
    errorStore.setError('Failed to load options for Dynamic Link field.' + error);
    dynamicLinkError.value = 'Failed to load options';
    filteredDynamicLinkDocuments.value = [];
  } finally {
    loadingDynamicLinkDocuments.value = false;
  }
};

const selectDynamicLinkDocument = (doc: DynamicLinkDocument) => {
  dynamicLinkSearchQuery.value = doc.name;
  showDynamicLinkDropdown.value = false;
  
  // For Dynamic Link, we store just the document name
  // The doctype is already stored in the referenced Link field
  emit('update:modelValue', doc.name);
};

const handleDynamicLinkBlur = () => {
  setTimeout(() => {
    showDynamicLinkDropdown.value = false;
    errorStore.clearError();
  }, 200);
};

const clearDynamicLinkSearch = () => {
  dynamicLinkSearchQuery.value = '';
  filteredDynamicLinkDocuments.value = [];
  showDynamicLinkDropdown.value = false;
  dynamicLinkError.value = '';
  errorStore.clearError();
  emit('update:modelValue', '');
};

const handleDynamicLinkKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showDynamicLinkDropdown.value = false;
  } else if (event.key === 'Enter' && filteredDynamicLinkDocuments.value.length > 0) {
    selectDynamicLinkDocument(filteredDynamicLinkDocuments.value[0]);
  }
};

const handleDynamicLinkFocus = () => {
  const doctype = getDynamicLinkDoctype();
  if (doctype) {
    showDynamicLinkDropdown.value = true;
    if (!dynamicLinkSearchQuery.value && filteredDynamicLinkDocuments.value.length === 0) {
      searchDynamicLinkDocuments();
    }
  }
};

// Watch for changes in the referenced Link field to clear the Dynamic Link value
watch(() => {
  if (props.formData && props.field.options) {
    const linkFieldName = props.field.options.trim();
    return props.formData[linkFieldName];
  }
  return null;
}, (newDoctype, oldDoctype) => {
  if (newDoctype !== oldDoctype) {
    // Clear the dynamic link value when the doctype changes
    dynamicLinkSearchQuery.value = '';
    filteredDynamicLinkDocuments.value = [];
    showDynamicLinkDropdown.value = false;
    emit('update:modelValue', '');
  }
});

// Watch for model value changes to populate the search field
watch(() => props.modelValue, (newValue) => {
  if (props.field.fieldtype === 'Dynamic Link' && newValue) {
    if (typeof newValue === 'string') {
      dynamicLinkSearchQuery.value = newValue;
    }
  }
}, { immediate: true });

// Add these helper functions for rating conversion
const getRatingStars = () => {
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
    return 0;
  }
  // Convert ERP rating (0.0-1.0) to stars (0-5)
  // 0.0 = 0 stars, 0.1 = 0.5 stars, 0.2 = 1 star, 0.3 = 1.5 stars, etc.
  const rating = parseFloat(props.modelValue);
  if (isNaN(rating)) return 0;
  return rating * 5; // This will give us the exact star value including decimals
};

const handleRatingClick = (starValue: number) => {
  // Convert star value (0.5, 1, 1.5, 2, 2.5, etc.) to ERP rating (0.1, 0.2, 0.3, 0.4, 0.5, etc.)
  // 0.5 stars = 0.1, 1 star = 0.2, 1.5 stars = 0.3, 2 stars = 0.4, 2.5 stars = 0.5, etc.
  const rating = starValue * 0.2;
  emit('update:modelValue', rating);
  if (props.formData) {
    props.formData[props.field.fieldname] = rating;
    evaluateFieldDependency(props.field, props.formData);
  }
};

const handleStarHover = (star: number) => {
  // Optional: Add hover effects if needed
  // This can be used for preview effects
};

const handleStarLeave = () => {
  // Optional: Remove hover effects if needed
  // This can be used for preview effects
};

// Helper to get the value for a star (full or half) based on mouse position
const getStarValue = (star: number, event: MouseEvent) => {
  const { left, width } = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - left;
  if (x < width / 2) {
    return star - 0.5;
  } else {
    return star;
  }
};

// Helper functions to format rating values and avoid floating-point precision issues
const formatRatingValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  const rating = parseFloat(value);
  if (isNaN(rating)) return '0';
  // Round to 1 decimal place and remove trailing zeros
  return parseFloat(rating.toFixed(1)).toString();
};

const formatStarsValue = (stars: number): string => {
  if (stars === null || stars === undefined || isNaN(stars)) {
    return '0';
  }
  // Round to 1 decimal place and remove trailing zeros
  return parseFloat(stars.toFixed(1)).toString();
};

const barcodeSvg = ref<SVGSVGElement | null>(null);

const handleBarcodeInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  handleValueUpdate(value);
  renderBarcode(value);
};

const renderBarcode = (value: string) => {
  if (barcodeSvg.value) {
    try {
      JsBarcode(barcodeSvg.value, value || ' ', {
        format: 'CODE128',
        lineColor: '#222',
        width: 2,
        height: 60,
        displayValue: true,
      });
    } catch (e) {
      // If invalid, clear barcode
      barcodeSvg.value.innerHTML = '';
    }
  }
};

watch(() => props.modelValue, (val) => {
  renderBarcode(val);
});

onMounted(() => {
  if (props.field.fieldtype === 'Barcode') {
    renderBarcode(props.modelValue);
  }
});

const codeValue = ref(props.modelValue || '');

const aceLanguageMode = computed(() => {
  const opt = (props.field.options || '').toLowerCase();
  if (opt.includes('json')) return 'json';
  if (opt.includes('python')) return 'python';
  if (opt.includes('html')) return 'html';
  if (opt.includes('css')) return 'css';
  if (opt.includes('markdown')) return 'markdown';
  return 'javascript';
});

watch(() => props.modelValue, (val) => {
  if (val !== codeValue.value) codeValue.value = val;
});

watch(codeValue, (val) => {
  if (val !== props.modelValue) emit('update:modelValue', val);
});

// Initialize mentions composable for Long Text fields
const {
  showMentionDropdown,
  mentionQuery,
  mentionResults,
  loadingMentions,
  longTextRef,
  handleLongTextInput,
  selectMention,
  handleMentionKeydown,
  setupMentionListeners,
  cleanupMentionListeners
} = useMentions(handleValueUpdate, () => isFieldReadOnly.value);


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