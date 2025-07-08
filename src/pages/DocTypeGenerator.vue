<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">AI DocType Generator</h1>
      <p class="text-sm text-gray-500 mt-1">Generate comprehensive DocType JSON files and HTML mockups using Claude AI</p>
    </div>

    <!-- Requirements Input -->
    <div v-if="!generatedOutput" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">Business Requirements</h2>
      
      <div class="space-y-6">
        <!-- Claude AI Status -->
        <div :class="getClaudeApiKey() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'" class="rounded-lg p-4">
          <h3 :class="getClaudeApiKey() ? 'text-green-800' : 'text-red-800'" class="text-sm font-medium mb-2">
            {{ getClaudeApiKey() ? '✅ Claude AI Ready' : '❌ Claude AI Not Configured' }}
          </h3>
          <p :class="getClaudeApiKey() ? 'text-green-700' : 'text-red-700'" class="text-sm">
            <span v-if="getClaudeApiKey()">
              Claude AI is configured and ready to generate DocTypes using your environment API key.
            </span>
            <span v-else>
              Claude API key not found. Please add <code class="bg-gray-100 px-1 rounded">VITE_CLAUDE_API_KEY</code> to your .env file.
              <br><br>
              <strong>Note:</strong> If you added <code class="bg-gray-100 px-1 rounded">CLAUDE_API_KEY</code> to your .env file, 
              please rename it to <code class="bg-gray-100 px-1 rounded">VITE_CLAUDE_API_KEY</code> (Vite requires the VITE_ prefix for frontend access).
            </span>
          </p>
        </div>

        <!-- Requirements Text -->
         <!-- Test Update -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Business Requirements
            <span class="text-red-500">*</span>
          </label>
          <textarea 
            v-model="requirements" 
            placeholder="Describe your DocType requirements in detail. For example:

I need a DocType for managing employee safety training records. It should include:
- Employee information (name, department, position)
- Training details (course name, completion date, instructor)
- Certification status and expiry date
- Mobile support for field data collection
- Digital signatures for verification
- Photo uploads for certificates
- GPS location for training location

The form should have multiple sections and be optimized for mobile devices."
            class="form-textarea w-full" 
            rows="12"
            required
          ></textarea>
          <p class="text-sm text-gray-500 mt-2">
            Be as detailed as possible. Mention field types, mobile features, child tables, and any specific requirements.
          </p>
        </div>

        <!-- Examples -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="text-sm font-medium text-blue-800 mb-2">Example Requirements</h3>
          <div class="space-y-2">
            <button 
              v-for="example in examples" 
              :key="example.name"
              @click="requirements = example.text"
              class="text-left block w-full p-2 text-sm text-blue-700 hover:bg-blue-100 rounded"
            >
              <strong>{{ example.name }}:</strong> {{ example.description }}
            </button>
          </div>
        </div>

        <!-- Generate Button -->
        <div class="text-center">
          <button 
            @click="generateDocType" 
            :disabled="generating || !requirements.trim() || !getClaudeApiKey()" 
            class="btn-primary text-lg px-8 py-3"
          >
            <span v-if="generating">
              <LoaderIcon class="w-5 h-5 animate-spin inline mr-2" />
              Generating with Claude AI...
            </span>
            <span v-else>
              🤖 Generate with Claude AI
            </span>
          </button>
          <div class="text-sm text-gray-500 mt-2 space-y-1">
            <p>This will send your requirements to Claude AI to generate a complete DocType and HTML mockup</p>
            <p class="text-xs">💡 Note: You need Claude AI credits in your Anthropic account to use this service</p>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 class="text-sm font-medium text-red-800 mb-1">Generation Error</h3>
          <p class="text-sm text-red-700" v-html="error"></p>
        </div>
      </div>
    </div>

    <!-- Results Display -->
    <div v-if="generatedOutput" class="space-y-6">
      <!-- Success Message & Actions -->
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-sm font-medium text-green-800">✅ DocType Generated Successfully!</h3>
            <p class="text-sm text-green-700">Your DocType and HTML mockup have been generated by Claude AI</p>
          </div>
          <button @click="resetGenerator" class="btn-secondary text-sm">
            Generate Another
          </button>
        </div>
      </div>

      <!-- ERP Save Success Message -->
      <div v-if="erpSaveSuccess" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-green-800">✅ Saved to ERP Successfully!</h3>
        <p class="text-sm text-green-700" v-html="erpSaveSuccess"></p>
      </div>

      <!-- ERP Save Warning Message -->
      <div v-if="erpSaveWarning" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-yellow-800">⚠️ DocType Name Changed</h3>
        <p class="text-sm text-yellow-700" v-html="erpSaveWarning"></p>
        <button @click="erpSaveWarning = ''" class="mt-2 text-xs text-yellow-600 underline">
          Dismiss
        </button>
      </div>

      <!-- ERP Save Error Message -->
      <div v-if="erpSaveError" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-red-800">❌ Failed to Save to ERP</h3>
        <p class="text-sm text-red-700" v-html="erpSaveError"></p>
        <button @click="erpSaveError = ''" class="mt-2 text-xs text-red-600 underline">
          Dismiss
        </button>
      </div>

      <!-- Download Options -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">📥 Download Generated Files</h3>
        
        <!-- Quality Indicator -->
        <div class="mb-4 flex items-center space-x-3">
          <span :class="['px-3 py-1 rounded-full text-sm font-medium', getQualityBadgeColor(generatedOutput.metadata.quality)]">
            {{ generatedOutput.metadata.quality === 'enterprise-grade' ? '✅' : generatedOutput.metadata.quality === 'needs-improvement' ? '⚠️' : '❓' }}
            {{ generatedOutput.metadata.quality.charAt(0).toUpperCase() + generatedOutput.metadata.quality.slice(1).replace('-', ' ') }}
          </span>
          <span class="text-sm text-gray-500">
            Generated: {{ formatTimestamp(generatedOutput.metadata.generatedAt) }}
          </span>
        </div>
        
        <!-- Download Buttons -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <button @click="downloadDocTypeJSON" class="btn-secondary text-sm flex items-center justify-center">
            📄 DocType JSON
          </button>
          <button @click="downloadHTMLMockup" class="btn-secondary text-sm flex items-center justify-center">
            🌐 HTML Mockup
          </button>
          <button @click="downloadImplementationGuide" class="btn-secondary text-sm flex items-center justify-center">
            📋 Implementation
          </button>
          <button 
            v-if="generatedOutput.businessLogic" 
            @click="downloadBusinessLogic" 
            class="btn-secondary text-sm flex items-center justify-center"
          >
            🔄 Business Logic
          </button>
          <button 
            v-if="generatedOutput.childDocTypes && generatedOutput.childDocTypes.length > 0" 
            @click="downloadChildDocTypes" 
            class="btn-secondary text-sm flex items-center justify-center"
          >
            📁 Child DocTypes
          </button>
        </div>
        
        <!-- Save to ERP and Download All Buttons -->
        <div class="flex justify-center space-x-4">
          <button 
            @click="saveDocTypeToErp" 
            :disabled="savingToErp || !generatedOutput?.mainDocType"
            class="btn-primary flex items-center justify-center px-6 py-2"
          >
            <span v-if="savingToErp">
              <LoaderIcon class="w-4 h-4 animate-spin mr-2" />
              Saving to ERP...
            </span>
            <span v-else>
              💾 Save Doctype to ERP
            </span>
          </button>
          <button @click="downloadAllFiles" class="btn-secondary flex items-center justify-center px-6 py-2">
            📦 Download All Files
          </button>
        </div>
      </div>

      <!-- Preview Tabs -->
      <div class="bg-white rounded-lg shadow">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6">
            <button v-for="tab in previewTabs" :key="tab.id"
                    @click="activeTab = tab.id"
                    :class="['py-4 px-1 border-b-2 font-medium text-sm',
                            activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- DocType JSON Preview -->
          <div v-if="activeTab === 'doctype'">
            <div class="mb-4">
              <h4 class="font-medium text-gray-900 mb-2">DocType JSON Structure</h4>
              <p class="text-sm text-gray-600">This JSON file can be imported directly into ERPNext</p>
            </div>
            <div class="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-auto max-h-96 font-mono">
              <pre>{{ JSON.stringify(generatedOutput.mainDocType, null, 2) }}</pre>
            </div>
          </div>

          <!-- HTML Mockup Preview -->
          <div v-if="activeTab === 'html'">
            <div class="mb-4">
              <h4 class="font-medium text-gray-900 mb-2">Interactive HTML Mockup</h4>
              <p class="text-sm text-gray-600">Preview of the actual form interface with TheTeam App v3 styling</p>
            </div>
            <div class="border border-gray-200 rounded-lg bg-gray-50">
              <iframe :srcdoc="generatedOutput.htmlMockup" class="w-full h-96 border-0 rounded-lg"></iframe>
            </div>
          </div>

          <!-- Implementation Notes -->
          <div v-if="activeTab === 'implementation'">
            <div class="mb-4">
              <h4 class="font-medium text-gray-900 mb-2">Implementation Guide</h4>
              <p class="text-sm text-gray-600">Instructions for deploying and using the generated DocType</p>
            </div>
            <div class="prose max-w-none bg-gray-50 p-4 rounded-lg">
              <div v-html="generatedOutput.implementationNotes"></div>
            </div>
          </div>

          <!-- Business Logic -->
          <div v-if="activeTab === 'business'">
            <div class="mb-4">
              <h4 class="font-medium text-gray-900 mb-2">Business Logic</h4>
              <p class="text-sm text-gray-600">Description of the business logic implemented in the DocType</p>
            </div>
            <div class="prose max-w-none bg-gray-50 p-4 rounded-lg">
              <div v-html="generatedOutput.businessLogic"></div>
            </div>
          </div>

          <!-- Child DocTypes (if any) -->
          <div v-if="activeTab === 'child' && generatedOutput.childDocTypes && generatedOutput.childDocTypes.length > 0">
            <div class="mb-4">
              <h4 class="font-medium text-gray-900 mb-2">Child DocTypes</h4>
              <p class="text-sm text-gray-600">Additional DocTypes for child tables and relationships</p>
            </div>
            <div class="space-y-4">
              <div v-for="(childDocType, index) in generatedOutput.childDocTypes" :key="index" 
                   class="border border-gray-200 rounded-lg p-4">
                <h5 class="font-medium text-gray-800 mb-2">{{ childDocType.name }}</h5>
                <div class="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-auto max-h-64 font-mono">
                  <pre>{{ JSON.stringify(childDocType, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div v-if="activeTab === 'metadata'">
            <div class="mb-4">
              <h4 class="font-medium text-gray-900 mb-2">🔍 Quality Report</h4>
              <p class="text-sm text-gray-600">Detailed analysis of the generated DocType quality and metadata</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg space-y-4">
              <!-- Quality Badge -->
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-700">Quality Status:</span>
                <span :class="['px-3 py-1 rounded-full text-sm font-medium', getQualityBadgeColor(generatedOutput.metadata.quality)]">
                  {{ generatedOutput.metadata.quality === 'enterprise-grade' ? '✅' : generatedOutput.metadata.quality === 'needs-improvement' ? '⚠️' : '❓' }}
                  {{ generatedOutput.metadata.quality.charAt(0).toUpperCase() + generatedOutput.metadata.quality.slice(1).replace('-', ' ') }}
                </span>
              </div>
              
              <!-- Metadata Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="space-y-2">
                  <div><span class="font-medium">Generated At:</span> {{ formatTimestamp(generatedOutput.metadata.generatedAt) }}</div>
                  <div><span class="font-medium">Generator Version:</span> {{ generatedOutput.metadata.version }}</div>
                  <div><span class="font-medium">Validated At:</span> {{ generatedOutput.metadata.validatedAt ? formatTimestamp(generatedOutput.metadata.validatedAt) : 'Not validated' }}</div>
                </div>
                <div class="space-y-2">
                  <div><span class="font-medium">DocType Name:</span> {{ generatedOutput.mainDocType?.name || 'N/A' }}</div>
                  <div><span class="font-medium">Field Count:</span> {{ generatedOutput.mainDocType?.fields?.length || 0 }}</div>
                  <div><span class="font-medium">Child DocTypes:</span> {{ generatedOutput.childDocTypes?.length || 0 }}</div>
                </div>
              </div>
              
              <!-- Quality Issues -->
              <div v-if="generatedOutput.metadata.qualityIssues && generatedOutput.metadata.qualityIssues.length > 0" 
                   class="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded">
                <h5 class="font-medium text-yellow-800 mb-2">⚠️ Quality Issues Detected</h5>
                <ul class="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li v-for="issue in generatedOutput.metadata.qualityIssues" :key="issue">{{ issue }}</li>
                </ul>
              </div>
              
              <!-- No Issues -->
              <div v-else class="border-l-4 border-green-400 bg-green-50 p-4 rounded">
                <p class="text-sm text-green-700">✅ No quality issues detected. The generated DocType meets all validation criteria.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Module Selection Modal -->
    <div v-if="showModuleSelectionModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">Configure DocType</h3>
          <button @click="cancelModuleSelection" class="text-gray-400 hover:text-gray-500">
            <XIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="px-6 py-4">
          <div v-if="loadingModules" class="flex justify-center py-8">
            <LoaderIcon class="w-8 h-8 animate-spin text-green-600" />
          </div>
          <div v-else class="space-y-6">
            <p class="text-sm text-gray-600">
              Configure your DocType name and module before saving to ERPNext.
            </p>
            
            <!-- DocType Name Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                DocType Name
                <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="selectedDocTypeName" 
                type="text" 
                placeholder="Enter DocType name..."
                class="form-input w-full"
                required
              >
              <p class="text-xs text-gray-500 mt-1">
                This will be the name of your DocType in ERPNext. Make sure it's unique and descriptive.
              </p>
            </div>
            
            <!-- Module Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Module
                <span class="text-red-500">*</span>
              </label>
              <p class="text-sm text-gray-600 mb-3">
                Choose which module this DocType should belong to. This affects organization and permissions.
              </p>
              
              <div class="space-y-2 max-h-60 overflow-y-auto">
                <label 
                  v-for="module in availableModules" 
                  :key="module.value"
                  class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  :class="{ 'border-green-500 bg-green-50': selectedModule === module.value }"
                >
                  <input 
                    type="radio" 
                    :value="module.value" 
                    v-model="selectedModule" 
                    class="text-green-600 focus:ring-green-500"
                  >
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">{{ module.value }}</div>
                    <div v-if="module.description" class="text-xs text-gray-500">{{ module.description }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            @click="cancelModuleSelection"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="proceedWithModuleSave"
            :disabled="!selectedModule || !selectedDocTypeName.trim() || loadingModules"
            class="px-4 py-2 text-sm font-medium text-white btn-primary rounded-md disabled:opacity-50"
          >
            💾 Save DocType
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LoaderIcon, XIcon } from 'lucide-vue-next';
import { createDocType } from '../services/erpnext.js';
import { getModules } from '../services/deskApi.js';

interface GeneratedOutput {
  mainDocType: any;
  childDocTypes?: any[];
  htmlMockup: string;
  implementationNotes: string;
  businessLogic: string;
  metadata: {
    generatedAt: string;
    version: string;
    quality: string;
    qualityIssues?: string[];
    validatedAt?: string;
  };
}

interface Module {
  value: string;
  description?: string;
}

const generating = ref(false);
const generatedOutput = ref<GeneratedOutput | null>(null);
const activeTab = ref('doctype');
const requirements = ref('');
const error = ref('');
const savingToErp = ref(false);
const erpSaveSuccess = ref('');
const erpSaveError = ref('');
const erpSaveWarning = ref('');
const showModuleSelectionModal = ref(false);
const availableModules = ref<Module[]>([]);
const selectedModule = ref('Custom');
const selectedDocTypeName = ref('');
const loadingModules = ref(false);

// Get Claude API key from environment variable
const getClaudeApiKey = () => {
  return (import.meta as any).env.VITE_CLAUDE_API_KEY;
};

const previewTabs = [
  { id: 'doctype', name: '📄 DocType JSON' },
  { id: 'html', name: '🌐 HTML Mockup' },
  { id: 'implementation', name: '📋 Implementation' },
  { id: 'business', name: '🔄 Business Logic' },
  { id: 'child', name: '📁 Child DocTypes' },
  { id: 'metadata', name: '🔍 Quality Report' }
];

// Simple example templates for easy understanding
const examples = [
  {
    name: 'Employee Record',
    description: 'Basic employee information management',
    text: `I need a simple DocType for managing employee records.

REQUIRED FIELDS:
- Employee ID (unique identifier)
- Full Name
- Email Address
- Phone Number
- Department (HR, IT, Sales, Marketing, Finance)
- Position/Job Title
- Hire Date
- Salary
- Status (Active, Inactive, On Leave)
- Address
- Emergency Contact Name
- Emergency Contact Phone

FEATURES:
- Basic employee information tracking
- Department-based organization
- Contact information management
- Employment status tracking`
  },
  {
    name: 'Task Management',
    description: 'Simple task tracking system',
    text: `I need a basic DocType for tracking tasks and to-do items.

REQUIRED FIELDS:
- Task Title
- Description
- Priority (Low, Medium, High, Urgent)
- Status (To Do, In Progress, Completed, Cancelled)
- Assigned To (employee name)
- Due Date
- Start Date
- Project/Category
- Estimated Hours
- Actual Hours
- Notes/Comments

FEATURES:
- Simple task creation and tracking
- Priority and status management
- Time tracking capabilities
- Assignment to team members`
  },
  {
    name: 'Product Inventory',
    description: 'Basic product and inventory management',
    text: `I need a simple DocType for managing product inventory.

REQUIRED FIELDS:
- Product Code (unique identifier)
- Product Name
- Category (Electronics, Clothing, Books, etc.)
- Brand
- Description
- Purchase Price
- Selling Price
- Stock Quantity
- Minimum Stock Level
- Supplier Name
- Supplier Contact
- Product Image (file attachment)
- Status (Active, Discontinued, Out of Stock)

FEATURES:
- Basic product information tracking
- Stock level monitoring
- Supplier management
- Price tracking
- Category-based organization`
  }
];

const generateDocType = async () => {
  generating.value = true;
  error.value = '';
  
  try {
    // Import and use Enhanced Claude AI service
    const { generateDocType } = await import('../services/claudeAI.js');
    const claudeApiKey = getClaudeApiKey();
    if (!claudeApiKey) {
      throw new Error('Claude API key is not configured in environment variables');
    }
    const output = await generateDocType(claudeApiKey, requirements.value);
    
    // Handle enhanced response structure
    generatedOutput.value = {
      mainDocType: output.mainDocType,
      childDocTypes: output.childDocTypes || [],
      htmlMockup: output.htmlMockup,
      implementationNotes: output.implementationNotes,
      businessLogic: output.businessLogic || '',
      metadata: output.metadata || {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        quality: 'unknown'
      }
    };
    
    activeTab.value = 'doctype';
  } catch (err: any) {
    console.error('Generation failed:', err);
    
    // Handle specific error types from the backend
    if (err.message.includes('Insufficient Claude AI Credits')) {
      error.value = `❌ Insufficient Credits: Your Claude AI account needs more credits. Please visit the <a href="https://console.anthropic.com/settings/billing" target="_blank" class="text-blue-600 underline">Anthropic Console</a> to add credits or upgrade your plan.`;
    } else if (err.message.includes('Invalid API Key')) {
      error.value = `❌ Invalid API Key: Please check your Claude AI API key in the <a href="https://console.anthropic.com/settings/keys" target="_blank" class="text-blue-600 underline">Anthropic Console</a>.`;
    } else {
      error.value = err.message || 'Failed to generate DocType. Please try again.';
    }
  } finally {
    generating.value = false;
  }
};

// Enhanced download functions
const downloadDocTypeJSON = () => {
  if (!generatedOutput.value?.mainDocType) return;
  
  const docTypeName = generatedOutput.value.mainDocType.name || 'Generated_DocType';
  const blob = new Blob([JSON.stringify(generatedOutput.value.mainDocType, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${docTypeName.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadHTMLMockup = () => {
  if (!generatedOutput.value?.htmlMockup) return;
  
  const docTypeName = generatedOutput.value.mainDocType?.name || 'Generated_DocType';
  const blob = new Blob([generatedOutput.value.htmlMockup], {
    type: 'text/html'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${docTypeName.replace(/\s+/g, '_')}_mockup.html`;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadChildDocTypes = () => {
  if (!generatedOutput.value?.childDocTypes?.length) return;
  
  generatedOutput.value.childDocTypes.forEach((childDocType) => {
    const blob = new Blob([JSON.stringify(childDocType, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${childDocType.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
};

const downloadImplementationGuide = () => {
  if (!generatedOutput.value?.implementationNotes) return;
  
  const docTypeName = generatedOutput.value.mainDocType?.name || 'Generated_DocType';
  const blob = new Blob([generatedOutput.value.implementationNotes], {
    type: 'text/markdown'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${docTypeName.replace(/\s+/g, '_')}_implementation.md`;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadBusinessLogic = () => {
  if (!generatedOutput.value?.businessLogic) return;
  
  const docTypeName = generatedOutput.value.mainDocType?.name || 'Generated_DocType';
  const blob = new Blob([generatedOutput.value.businessLogic], {
    type: 'text/markdown'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${docTypeName.replace(/\s+/g, '_')}_business_logic.md`;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadAllFiles = () => {
  if (!generatedOutput.value) return;
  
  // Download all files at once
  downloadDocTypeJSON();
  downloadHTMLMockup();
  downloadImplementationGuide();
  if (generatedOutput.value.businessLogic) {
    downloadBusinessLogic();
  }
  if (generatedOutput.value.childDocTypes?.length) {
    downloadChildDocTypes();
  }
};

const resetGenerator = () => {
  generatedOutput.value = null;
  error.value = '';
  requirements.value = '';
  erpSaveSuccess.value = '';
  erpSaveError.value = '';
  erpSaveWarning.value = '';
  // Keep API key for convenience
};

const getQualityBadgeColor = (quality: string) => {
  switch (quality) {
    case 'enterprise-grade': return 'bg-green-100 text-green-800';
    case 'needs-improvement': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

const validateAndFixDocType = (docType: any, skipAutoRename = false) => {
  if (!docType) {
    console.error('validateAndFixDocType: No docType provided');
    return { docType: null, warning: null };
  }

  // Use either 'doctype' or 'name' field as the name (Claude uses 'doctype', API expects 'name')
  let docTypeName = docType.doctype || docType.name;
  const originalName = docTypeName;
  let warning: string | null = null;
  
  // Ensure we have a valid name field
  if (!docTypeName || !docTypeName.trim()) {
    console.error('validateAndFixDocType: DocType name is missing or empty', docType);
    return { docType: null, warning: null };
  }

  // Clean up the name
  docTypeName = docTypeName.trim();

  // Check if the name conflicts with common ERPNext built-in DocTypes (only if auto-rename is enabled)
  if (!skipAutoRename) {
    const builtInDocTypes = ['Employee', 'Customer', 'Supplier', 'Item', 'User', 'Company', 'Project', 'Task', 'Lead', 'Opportunity', 'Account', 'Sales Order', 'Purchase Order', 'Quotation', 'Sales Invoice', 'Purchase Invoice', 'Delivery Note', 'Purchase Receipt', 'Journal Entry', 'Payment Entry', 'Stock Entry', 'Material Request', 'BOM', 'Work Order', 'Timesheet', 'Expense Claim', 'Leave Application', 'Salary Slip', 'Attendance', 'Holiday List', 'Department', 'Designation', 'Branch', 'Warehouse', 'UOM', 'Currency', 'Tax Rule', 'Price List', 'Shipping Rule', 'Terms and Conditions', 'Address', 'Contact', 'Communication', 'Event', 'ToDo', 'Note', 'File', 'Email Account', 'Print Format', 'Letter Head', 'Web Page', 'Blog Post', 'Website Settings'];
    
    if (builtInDocTypes.includes(docTypeName)) {
      // Automatically append "Custom" to avoid conflicts
      docTypeName = `Custom ${docTypeName}`;
      warning = `DocType name changed from "<strong>${originalName}</strong>" to "<strong>${docTypeName}</strong>" to avoid conflicts with built-in ERPNext DocTypes.`;
      console.warn(`DocType name "${originalName}" conflicts with built-in ERPNext DocType. Renamed to "${docTypeName}"`);
    }
  }

  // Start with the original docType object to preserve all attributes
  const cleanDocType: any = {
    ...docType, // Copy all original attributes
    name: docTypeName, // Fix the name field
    module: docType.module || "Custom", // Ensure module is set
    custom: 1, // Ensure it's marked as custom
    istable: docType.istable !== undefined ? docType.istable : 0, // Preserve istable if exists, default to 0
    allow_import: 1 // Enable import functionality
  };

  // Remove the 'doctype' field if it exists (since we're using 'name' instead)
  if (cleanDocType.doctype) {
    delete cleanDocType.doctype;
  }

  // Remove the 'naming_rule' attribute if it exists
  if (cleanDocType.naming_rule) {
    delete cleanDocType.naming_rule;
  }

  console.log('validateAndFixDocType: Creating clean DocType', {
    originalDoctype: docType.doctype,
    originalName: docType.name,
    cleanName: cleanDocType.name,
    module: cleanDocType.module,
    preservedAttributes: Object.keys(cleanDocType).filter(key => !['name', 'module', 'custom', 'istable'].includes(key))
  });

  // Process fields - preserve all original field attributes and fix validation issues
  if (docType.fields && Array.isArray(docType.fields)) {
    cleanDocType.fields = docType.fields.map((field: any) => {
      // Start with the original field object to preserve all attributes
      const cleanField: any = {
        ...field, // Copy all original field attributes
        fieldname: field.fieldname, // Ensure essential properties are present
        fieldtype: field.fieldtype,
        label: field.label
      };

      // Handle field-specific properties that might need processing
      if (field.options && field.fieldtype === 'Select' && Array.isArray(field.options)) {
        cleanField.options = field.options.join('\n');
      }

      // Fix Link field options that might reference non-existent DocTypes
      if (cleanField.fieldtype === 'Link' && cleanField.options) {
        // List of common built-in DocTypes that should be safe to reference
        const safeDocTypes = ['User', 'Company', 'Customer', 'Supplier', 'Item', 'Employee', 'Project', 'Task', 'Lead', 'Contact', 'Address'];
        
        // If the linked DocType is not in our safe list, convert to Data field
        if (!safeDocTypes.includes(cleanField.options)) {
          console.warn(`Converting Link field "${cleanField.fieldname}" from linking to "${cleanField.options}" to Data field to avoid validation errors`);
          cleanField.fieldtype = 'Data';
          cleanField.options = '';
        }
      }

      // Remove any problematic field properties that might cause validation issues
      if (cleanField.fieldtype === 'Table' && !cleanField.options) {
        console.warn(`Table field "${cleanField.fieldname}" has no child table defined, converting to Section Break`);
        cleanField.fieldtype = 'Section Break';
        cleanField.options = '';
      }

      // Fix ERPNext validation issue: Fields cannot be hidden and mandatory without default
      if (cleanField.hidden && cleanField.reqd && !cleanField.default) {
        console.warn(`Field "${cleanField.fieldname}" is hidden and mandatory without default - making it not mandatory`);
        cleanField.reqd = 0; // Make it not mandatory instead of hidden
      }

      // Convert boolean values to integers for ERPNext compatibility
      if (cleanField.hidden === true) cleanField.hidden = 1;
      if (cleanField.hidden === false) cleanField.hidden = 0;
      if (cleanField.reqd === true) cleanField.reqd = 1;
      if (cleanField.reqd === false) cleanField.reqd = 0;
      if (cleanField.read_only === true) cleanField.read_only = 1;
      if (cleanField.read_only === false) cleanField.read_only = 0;

      return cleanField;
    });
  }

  // Fix permissions with invalid role references
  if (cleanDocType.permissions && Array.isArray(cleanDocType.permissions)) {
    // Common roles that exist in most ERPNext installations
    const standardRoles = ['System Manager', 'Administrator', 'Guest', 'All'];
    
    cleanDocType.permissions = cleanDocType.permissions.map((perm: any) => {
      // If the role doesn't exist in our standard list, replace with a safe default
      if (perm.role && !standardRoles.includes(perm.role)) {
        console.warn(`Replacing invalid role "${perm.role}" with "System Manager"`);
        perm.role = 'System Manager';
      }
      
      // Ensure permission values are properly formatted
      if (perm.read === true) perm.read = 1;
      if (perm.read === false) perm.read = 0;
      if (perm.write === true) perm.write = 1;
      if (perm.write === false) perm.write = 0;
      if (perm.create === true) perm.create = 1;
      if (perm.create === false) perm.create = 0;
      if (perm.delete === true) perm.delete = 1;
      if (perm.delete === false) perm.delete = 0;
      if (perm.submit === true) perm.submit = 1;
      if (perm.submit === false) perm.submit = 0;
      if (perm.cancel === true) perm.cancel = 1;
      if (perm.cancel === false) perm.cancel = 0;
      if (perm.amend === true) perm.amend = 1;
      if (perm.amend === false) perm.amend = 0;
      
      return perm;
    });
    
    // If no valid permissions remain, add a basic System Manager permission
    if (cleanDocType.permissions.length === 0) {
      cleanDocType.permissions = [{
        role: 'System Manager',
        read: 1,
        write: 1,
        create: 1,
        delete: 1,
        submit: 0,
        cancel: 0,
        amend: 0
      }];
    }
  } else {
    // If no permissions are defined, add basic System Manager permission
    cleanDocType.permissions = [{
      role: 'System Manager',
      read: 1,
      write: 1,
      create: 1,
      delete: 1,
      submit: 0,
      cancel: 0,
      amend: 0
    }];
  }

  console.log('validateAndFixDocType: Final clean DocType', cleanDocType);
  return { docType: cleanDocType, warning };
};

const fetchModules = async () => {
  loadingModules.value = true;
  try {
    const response = await getModules();
    if (response?.message && Array.isArray(response.message)) {
      // Add Custom as the first option
      availableModules.value = [
        { value: 'Custom', description: 'Custom module for user-created DocTypes' },
        ...response.message.map((module: any) => ({
          value: module.value || module.name || module,
          description: module.description || ''
        }))
      ];
    } else {
      // Fallback if API doesn't return expected format
      availableModules.value = [
        { value: 'Custom', description: 'Custom module for user-created DocTypes' },
        { value: 'Core', description: 'Core system module' },
        { value: 'Setup', description: 'Setup and configuration module' }
      ];
    }
  } catch (error) {
    console.error('Failed to fetch modules:', error);
    // Fallback modules
    availableModules.value = [
      { value: 'Custom', description: 'Custom module for user-created DocTypes' },
      { value: 'Core', description: 'Core system module' },
      { value: 'Setup', description: 'Setup and configuration module' }
    ];
  } finally {
    loadingModules.value = false;
  }
};

const cancelModuleSelection = () => {
  showModuleSelectionModal.value = false;
  selectedDocTypeName.value = '';
  selectedModule.value = 'Custom';
};

const proceedWithModuleSave = async () => {
  showModuleSelectionModal.value = false;
  await actualSaveToErp();
};

const saveDocTypeToErp = async () => {
  if (!generatedOutput.value?.mainDocType) {
    erpSaveError.value = 'No DocType available to save';
    return;
  }

  // Initialize the selected name with the current DocType name
  const validationResult = validateAndFixDocType(generatedOutput.value.mainDocType);
  selectedDocTypeName.value = validationResult.docType?.name || generatedOutput.value.mainDocType.name || '';
  
  // Show warning if name was auto-changed
  if (validationResult.warning) {
    erpSaveWarning.value = validationResult.warning;
  }

  // Show module selection modal
  showModuleSelectionModal.value = true;
  await fetchModules();
};

const actualSaveToErp = async () => {
  if (!generatedOutput.value?.mainDocType) {
    erpSaveError.value = 'No DocType available to save';
    return;
  }

  savingToErp.value = true;
  erpSaveError.value = '';
  erpSaveSuccess.value = '';
  erpSaveWarning.value = '';
  
  try {
    // Create a copy of the DocType with user-selected name
    const docTypeToSave = {
      ...generatedOutput.value.mainDocType,
      name: selectedDocTypeName.value.trim(),
      module: selectedModule.value,
      custom: 1,
      allow_import: 1
    };

    // Validate and fix the DocType structure (but keep user's chosen name)
    const validationResult = validateAndFixDocType(docTypeToSave, true);
    
    if (!validationResult.docType) {
      throw new Error('Failed to validate DocType structure');
    }

    console.log('Sending DocType to ERP:', validationResult.docType);
    
    const response = await createDocType(validationResult.docType);
    
    erpSaveSuccess.value = `Successfully saved "${validationResult.docType.name}" to "${selectedModule.value}" module!`;
    
    // Auto-clear success message after 5 seconds
    setTimeout(() => {
      erpSaveSuccess.value = '';
    }, 5000);
    
  } catch (err: any) {
    console.error('Failed to save DocType to ERP:', err);
    
    // Handle specific error types
    if (err.message?.includes('DuplicateEntryError') || err.message?.includes('already exists') || err.message?.includes('Duplicate entry')) {
      const docTypeName = generatedOutput.value.mainDocType.name;
      erpSaveError.value = `DocType "${docTypeName}" already exists in your ERP system. The system has been enhanced to automatically rename conflicting DocTypes. Please generate a new DocType - it will be automatically renamed to avoid conflicts.`;
    } else if (err.message?.includes('PermissionError') || err.message?.includes('403')) {
      erpSaveError.value = 'You do not have permission to create DocTypes. Please contact your system administrator.';
    } else if (err.message?.includes('HiddenAndMandatoryWithoutDefaultError') || err.message?.includes('hidden and mandatory without default')) {
      erpSaveError.value = 'Field validation error detected. The DocType has been automatically fixed to resolve hidden/mandatory field conflicts. Please try saving again.';
    } else if (err.message?.includes('LinkValidationError') || err.message?.includes('Could not find') || err.message?.includes('Role:')) {
      erpSaveError.value = 'Invalid role reference detected in permissions. The DocType has been automatically fixed to use standard roles. Please try saving again.';
    } else if (err.message?.includes('ValidationError')) {
      erpSaveError.value = `Validation Error: ${err.message}. Please check the DocType structure and try again.`;
    } else if (err.message?.includes('TypeError') || err.message?.includes('NoneType')) {
      erpSaveError.value = 'DocType structure issue detected. The generated DocType has been automatically fixed. Please try saving again.';
    } else {
      erpSaveError.value = err.message || 'Failed to save DocType to ERP system. Please try again.';
    }
  } finally {
    savingToErp.value = false;
  }
};
</script>

<style scoped>
.btn-primary {
  background-color: #22c55e;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #16a34a;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  border: 1px solid #d1d5db;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
}
</style> 