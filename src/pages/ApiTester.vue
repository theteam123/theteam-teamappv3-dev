<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">API Endpoint Tester</h1>
    
    <div class="bg-white rounded-lg shadow-lg p-6">
      <!-- Request Form -->
      <form @submit.prevent="sendRequest" class="space-y-6">
        <!-- Method and URL -->
        <div class="flex gap-4">
          <div class="w-1/4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Method</label>
            <select v-model="request.method" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
              <option>PATCH</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">URL</label>
            <input type="text" v-model="request.url" placeholder="https://api.example.com/endpoint" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>

        <!-- Authentication -->
        <div>
          <div class="flex items-center justify-between">
            <label class="block text-sm font-medium text-gray-700">Authentication</label>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <input type="radio" v-model="authType" value="oauth" id="useOAuth" 
                       class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                <label for="useOAuth" class="ml-2 text-sm text-gray-600">Use OAuth Token</label>
              </div>
              <div class="flex items-center">
                <input type="radio" v-model="authType" value="apikey" id="useApiKey" 
                       class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                <label for="useApiKey" class="ml-2 text-sm text-gray-600">Use API Key</label>
              </div>
            </div>
          </div>
          <div v-if="authType === 'oauth'" class="mt-2 text-sm text-gray-600">
            OAuth token will be automatically included in the request
          </div>
          <div v-if="authType === 'apikey'" class="mt-2 space-y-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">API Key</label>
              <input type="text" v-model="apiKey" placeholder="Enter API Key" 
                     class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">API Secret</label>
              <input type="password" v-model="apiSecret" placeholder="Enter API Secret" 
                     class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
        </div>

        <!-- Headers -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Headers</label>
          <div v-for="(header, index) in request.headers" :key="index" class="flex gap-4 mb-2">
            <input type="text" v-model="header.key" placeholder="Header name" 
                   class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <input type="text" v-model="header.value" placeholder="Header value" 
                   class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button type="button" @click="removeHeader(index)" 
                    class="px-3 py-2 text-red-600 hover:text-red-800">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <button type="button" @click="addHeader" 
                  class="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800">
            + Add Header
          </button>
        </div>

        <!-- Request Body -->
        <div v-if="['POST', 'PUT', 'PATCH'].includes(request.method)">
          <div class="flex items-center justify-between mb-4">
            <label class="block text-sm font-medium text-gray-700">Request Body</label>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <input type="radio" v-model="bodyType" value="form" id="useFormFields" 
                       class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                <label for="useFormFields" class="ml-2 text-sm text-gray-600">Form Fields</label>
              </div>
              <div class="flex items-center">
                <input type="radio" v-model="bodyType" value="json" id="useRawJSON" 
                       class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                <label for="useRawJSON" class="ml-2 text-sm text-gray-600">Raw JSON</label>
              </div>
            </div>
          </div>
          
          <!-- Form Fields Mode -->
          <div v-if="bodyType === 'form'">
            <div v-for="(field, index) in bodyFields" :key="index" class="flex gap-4 mb-2">
              <input type="text" v-model="field.key" placeholder="Key" 
                     class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <input type="text" v-model="field.value" placeholder="Value" 
                     class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <button type="button" @click="removeBodyField(index)" 
                      class="px-3 py-2 text-red-600 hover:text-red-800">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button type="button" @click="addBodyField" 
                    class="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800">
              + Add Field
            </button>
          </div>
          
          <!-- Raw JSON Mode -->
          <div v-if="bodyType === 'json'">
            <textarea v-model="rawJsonBody" 
                      placeholder='{\n  "key": "value",\n  "array": [1, 2, 3],\n  "nested": {\n    "property": "value"\n  }\n}'
                      class="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows="10"></textarea>
            <div class="mt-2 text-sm text-gray-600">
              Enter valid JSON data that will be sent as the request body
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button type="submit" 
                  class="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  :disabled="isLoading">
            {{ isLoading ? 'Sending...' : 'Send Request' }}
          </button>
        </div>
      </form>

      <!-- Response Section -->
      <div v-if="response" class="mt-8">
        <h2 class="text-xl font-semibold mb-4">Response</h2>
        <div class="bg-gray-100 rounded-lg p-4">
          <div class="mb-4">
            <span class="font-medium">Status:</span> 
            <span :class="{'text-green-600': response.status < 400, 'text-red-600': response.status >= 400}">
              {{ response.status }} {{ response.statusText }}
            </span>
          </div>
          <div class="mb-4">
            <span class="font-medium">Response Time:</span> {{ response.time }}ms
          </div>
          <div>
            <span class="font-medium">Response Body:</span>
            <pre class="mt-2 p-4 bg-gray-800 text-white rounded-lg overflow-x-auto">{{ formattedResponse }}</pre>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getCurrentToken } from '../services/oauth'
import { useAuthStore } from '../stores/auth'
import { getErpNextApiUrl, getApiKeyAuthHeader } from '../utils/api'

const authStore = useAuthStore()

const request = ref({
  method: 'GET',
  url: '',
  headers: [{ key: '', value: '' }],
  body: ''
})

const response = ref(null)
const error = ref(null)
const isLoading = ref(false)
const authType = ref('oauth')
const apiKey = ref('')
const apiSecret = ref('')
const bodyFields = ref([{ key: '', value: '' }])
const bodyType = ref('form')
const rawJsonBody = ref('')

// Set default API URL if empty
const apiUrl = getErpNextApiUrl()
if (!request.value.url && apiUrl) {
  request.value.url = apiUrl
}

const formattedResponse = computed(() => {
  if (!response.value?.data) return ''
  try {
    return JSON.stringify(response.value.data, null, 2)
  } catch (e) {
    return response.value.data
  }
})

const addHeader = () => {
  request.value.headers.push({ key: '', value: '' })
}

const removeHeader = (index) => {
  request.value.headers.splice(index, 1)
}

const addBodyField = () => {
  bodyFields.value.push({ key: '', value: '' })
}

const removeBodyField = (index) => {
  bodyFields.value.splice(index, 1)
}

const sendRequest = async () => {
  error.value = null;
  isLoading.value = true;
  
  try {
    // Validate URL
    if (!request.value.url) {
      throw new Error('Please enter a URL')
    }

    // Prepare headers
    const headers = {}
    request.value.headers.forEach(header => {
      if (header.key && header.value) {
        headers[header.key] = header.value
      }
    })

    // Add authentication headers based on selected type
    if (authType.value === 'oauth') {
      try {
        const token = await getCurrentToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        } else {
          throw new Error('No OAuth token available. Please ensure you are logged in.')
        }
      } catch (e) {
        throw new Error('Failed to get OAuth token: ' + e.message)
      }
    } else if (authType.value === 'apikey') {
      if (!apiKey.value || !apiSecret.value) {
        throw new Error('Please provide both API Key and API Secret')
      }
      const apiKeyAuth = btoa(`${apiKey.value}:${apiSecret.value}`)
      headers['Authorization'] = `Basic ${apiKeyAuth}`
    }

    // Prepare request options
    const options = {
      method: request.value.method,
      headers
    }

    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.value.method)) {
      headers['Content-Type'] = 'application/json';
      
      if (bodyType.value === 'json') {
        // Use raw JSON body
        if (rawJsonBody.value.trim()) {
          try {
            // Validate JSON syntax
            JSON.parse(rawJsonBody.value);
            options.body = rawJsonBody.value;
          } catch (e) {
            throw new Error('Invalid JSON syntax in request body: ' + e.message);
          }
        }
      } else {
        // Use form fields converted to JSON object
        const bodyObject = bodyFields.value.reduce((acc, field) => {
          if (field.key) {
            try {
              // Try to parse the value as JSON if it looks like an object or array
              if (field.value.startsWith('{') || field.value.startsWith('[')) {
                acc[field.key] = JSON.parse(field.value);
              } else {
                acc[field.key] = field.value;
              }
            } catch (e) {
              acc[field.key] = field.value;
            }
          }
          return acc;
        }, {});

        options.body = JSON.stringify(bodyObject);
      }
    }

    const startTime = performance.now()
    const res = await fetch(request.value.url, options)
    const endTime = performance.now()

    let data
    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await res.json()
    } else {
      data = await res.text()
    }

    response.value = {
      status: res.status,
      statusText: res.statusText,
      data,
      time: Math.round(endTime - startTime)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}
</script> 