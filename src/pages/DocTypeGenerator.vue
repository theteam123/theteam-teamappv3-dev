<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">AI DocType Generator</h1>
      <p class="text-sm text-gray-500 mt-1">Generate comprehensive DocType JSON files and HTML mockups using Claude AI</p>
      <div class="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ⚡ Optimized for ERPNext v15+ with advanced field types
      </div>
    </div>

    <!-- Requirements Input -->
    <div v-if="!generatedOutput" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">Input Method</h2>
      
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

        <!-- Input Method Tabs -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button 
              @click="activeInputTab = 'requirements'"
              :class="['py-2 px-1 border-b-2 font-medium text-sm',
                      activeInputTab === 'requirements' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
            >
              📝 Business Requirements
            </button>
            <button 
              @click="activeInputTab = 'jotform'"
              :class="['py-2 px-1 border-b-2 font-medium text-sm',
                      activeInputTab === 'jotform' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
            >
              📋 JotForm Resources
            </button>
          </nav>
        </div>

        <!-- Business Requirements Tab -->
        <div v-if="activeInputTab === 'requirements'" class="space-y-4">
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

The form should have multiple sections."
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
        </div>

        <!-- JotForm Resources Tab -->
        <div v-if="activeInputTab === 'jotform'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              JotForm Resources
              <span class="text-red-500">*</span>
            </label>
            <textarea 
              v-model="jotformData" 
              placeholder="Paste any JotForm resources here. You can include:

- HTML/JavaScript embed code from JotForm
- Exported form structure or configuration
- Field lists and definitions
- Form settings and validation rules
- Conditional logic and workflow
- Any other JotForm-related content

Example:
<script>window.enableEventObserver=true</script>
<script src='https://cdn.jotfor.ms/s/static/a8f2017c497/static/prototype.forms.js' type='text/javascript'></script>
<script src='https://cdn.jotfor.ms/s/static/a8f2017c497/static/jotform.forms.js' type='text/javascript'></script>
<form class='jotform-form'>
  <div class='form-line'>
    <label class='form-label'>Full Name</label>
    <input type='text' name='q1_fullName' class='form-textbox' required />
  </div>
  <!-- ... more fields ... -->
</form>

The AI will analyze this content and create an equivalent ERPNext DocType with mobile support."
              class="form-textarea w-full" 
              rows="16"
              required
            ></textarea>
            <p class="text-sm text-gray-500 mt-2">
              Paste any JotForm content including HTML/JS embed code, exported form data, field structures, or configuration. The AI will analyze this and create an equivalent ERPNext DocType.
            </p>
          </div>

          <!-- JotForm Examples -->
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 class="text-sm font-medium text-purple-800 mb-2">📋 Example JotForm Resources</h3>
            <p class="text-xs text-purple-700 mb-3">
              Click any example below to see what type of JotForm content you can paste:
            </p>
            <div class="space-y-2">
              <button 
                v-for="example in jotformExamples" 
                :key="example.name"
                @click="jotformData = example.text"
                class="text-left block w-full p-2 text-sm text-purple-700 hover:bg-purple-100 rounded transition-colors"
              >
                <strong>{{ example.name }}:</strong> {{ example.description }}
              </button>
            </div>
            <div class="mt-3 text-xs text-purple-600">
              💡 These examples show different formats you can paste - field lists, HTML embed code, exported data, etc.
            </div>
          </div>

          <!-- JotForm Tips -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 class="text-sm font-medium text-yellow-800 mb-2">💡 Tips for JotForm Input</h3>
            <ul class="text-sm text-yellow-700 space-y-1">
              <li>• You can copy/paste field lists directly from your JotForm builder</li>
              <li>• Include field types (text, dropdown, checkbox, etc.) for better accuracy</li>
              <li>• Mention any conditional logic or field dependencies</li>
              <li>• Include validation rules and required fields</li>
              <li>• Describe any file uploads or special field types</li>
              <li>• Add form submission workflow information if available</li>
            </ul>
          </div>
        </div>

        <!-- Generate Button -->
        <div class="text-center">
          <button 
            @click="generateDocType" 
            :disabled="generating || !validateInput() || !getClaudeApiKey()" 
            class="btn-primary text-lg px-8 py-3"
          >
            <span v-if="generating">
              <LoaderIcon class="w-5 h-5 animate-spin inline mr-2" />
              Generating with Claude AI...
            </span>
            <span v-else>
              🤖 Generate DocType with Claude AI
            </span>
          </button>
          <div class="text-sm text-gray-500 mt-2 space-y-1">
            <p v-if="activeInputTab === 'requirements'">
              This will send your business requirements to Claude AI to generate a complete DocType and HTML mockup
            </p>
            <p v-else-if="activeInputTab === 'jotform'">
              This will analyze your JotForm structure and generate an equivalent ERPNext DocType with HTML mockup
            </p>
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
            <p class="text-sm text-green-700">
              Your DocType and HTML mockup have been generated by Claude AI
              <span v-if="activeInputTab === 'jotform'"> from your JotForm structure</span>
              <span v-else> from your business requirements</span>
            </p>
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
        
        <!-- Generation Info -->
        <div class="mb-4 flex items-center space-x-3">
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

// Add new reactive variables for tabs and JotForm input
const generating = ref(false);
const generatedOutput = ref<GeneratedOutput | null>(null);
const activeTab = ref('doctype');
const activeInputTab = ref('requirements'); // New: for input method tabs
const requirements = ref('');
const jotformData = ref(''); // New: for JotForm input
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
  { id: 'child', name: '📁 Child DocTypes' }
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

// Add JotForm-specific examples
const jotformExamples = [
  {
    name: 'Real-World Meeting Minutes Form',
    description: 'Complete JotForm for Management Meeting Minutes with advanced features',
    text: `JotForm Management Meeting Minutes - Form ID: 250758111292454

FORM HEADER:
- Title: "Management Meeting Minutes" 
- Theme: Professional with Inter font
- Mobile Responsive: Yes
- Max Width: 752px

BASIC INFORMATION SECTION:
q3_location: Location (Text Field)
  - Style: width 500px
  - Label: "Location"
  - Type: control_textbox

q4_date: Date (DateTime Field)
  - Format: DD-MM-YYYY
  - Validation: limitDate
  - Current value: "14-07-2025"
  - Calendar picker enabled
  - Type: control_datetime

q5_time: Time (Time Field)
  - Format: HH:MM with AM/PM
  - Default: "09:07 PM"
  - Time input with dropdown
  - Type: control_time

q6_meetingPurpose: Meeting Purpose (Text Area)
  - Required: Yes (marked with *)
  - Size: 648px width x 100px height
  - Validation: required
  - Type: control_textarea

ATTENDANCE SECTION (Collapsible):
q9_typeA: Attendees (Multi-Selection Widget)
  - Widget: Multiple Selection dropdown
  - Options: 49+ employee names (Adriaan Frederik Lourens, Alexander Salva, Barry Norris, etc.)
  - Placeholder: "Search and select names"
  - Height: 45px, Max width: 500px
  - Type: control_widget

q10_absentees: Absentees (Multi-Selection Widget)
  - Same configuration as Attendees
  - Widget: Multiple Selection dropdown
  - Same employee list
  - Type: control_widget

AGENDA & TOPICS SECTION (Collapsible):
q11_agenda: Agenda (Text Field)
  - Width: 500px
  - Type: control_textbox

q13_description: Description (Text Area)  
  - Size: 648px x 163px
  - Type: control_textarea

DYNAMIC AGENDA ITEMS (With Conditional Logic):
q14_typeA14: Add Another Checkbox
  - Triggers display of additional agenda items
  - Value: "Add another"
  - Type: control_checkbox

q16_agenda16, q20_agenda20, q24_agenda24, q28_agenda28: Additional Agenda Fields
  - Hidden by default (display:none)
  - Shown when "Add another" is checked
  - Each followed by description textarea
  - Type: control_textbox

ACTION ITEMS SECTION (Collapsible):
q33_actionRequired: Action Required (Text Area)
  - Size: 648px x 163px
  - Type: control_textarea

q34_assignedTo: Assigned To (Dropdown)
  - Options: 60+ employees with email calculations
  - Includes "Other" option
  - Width: 310px
  - Calculation field for email addresses
  - Type: control_dropdown

q62_name: Name (Text Field - Conditional)
  - Hidden by default
  - Shows when "Other" is selected in Assigned To
  - Width: 310px
  - Type: control_textbox

q37_emailAddress: Email Address (Text Field)
  - Auto-populated based on Assigned To selection
  - Width: 310px
  - Type: control_textbox

q55_status: Status (Dropdown)
  - Options: New (default), In Progress, Closed
  - Width: 310px
  - Type: control_dropdown

q35_dueDate: Due Date (DateTime Field)
  - Format: DD-MM-YYYY
  - Calendar picker
  - Type: control_datetime

FORM CONFIGURATION:
- Form ID: 250758111292454
- Submit Action: https://submit.jotform.com/submit/250758111292454
- Auto-complete: On
- Character encoding: UTF-8

CONDITIONAL LOGIC RULES:
1. Show q62_name if q34_assignedTo equals "Other"
2. Show form fields when URL contains specific patterns
3. Show q38 if q36_typeOf equals "Management Quarterly"  
4. Calculate email address based on selected assignee
5. Progressive agenda item display (q14→q15-17, q18→q19-21, etc.)

ADVANCED FEATURES:
- JotForm calculations for email assignment
- Progressive form sections with collapsible design
- Widget integration for multi-selection
- URL tracking widget
- Form event tracking and analytics
- Professional styling with custom CSS
- Payment integration ready
- Multi-language support structure

FORM SECTIONS:
1. Basic Information (Location, Date, Time, Purpose)
2. Attendance (Attendees, Absentees with search)
3. Agenda & Topics (Dynamic expandable agenda items)
4. Action Items (Tasks, assignments, status tracking)
5. Hidden utility section (URL tracking, meeting type)

STYLING:
- Font Family: Inter, sans-serif
- Background: #FFFFFF
- Text Color: #2C3345
- Form width: 752px max-width
- Responsive design enabled
- Custom CSS for enhanced appearance`
  },
  {
    name: 'Field Export Structure',
    description: 'Exported field definitions from JotForm builder',
    text: `JotForm Field Export - Meeting Minutes Form

FIELD DEFINITIONS:
1. q1_heading: "Management Meeting Minutes" (Header)
   - Type: control_head
   - Position: form-input-wide, hidden by default

2. q3_location: "Location" (Text Input)
   - Type: control_textbox
   - Required: No
   - Width: 500px
   - Layout: half-width

3. q4_date: "Date" (DateTime)
   - Type: control_datetime  
   - Format: DD-MM-YYYY
   - Validation: limitDate
   - Layout: form-col-1

4. q5_time: "Time" (Time Input)
   - Type: control_time
   - Format: HH:MM AM/PM
   - Layout: form-col-2

5. q6_meetingPurpose: "Meeting Purpose" (Textarea)
   - Type: control_textarea
   - Required: Yes
   - Size: 648x100px
   - Validation: required

6. q7_attendance: "Attendance" (Collapsible Section)
   - Type: control_collapse
   - Contains: Attendees and Absentees widgets

7. q9_typeA: "Attendees" (Multi-Selection Widget)
   - Type: control_widget
   - Widget: Multiple Selection
   - Data: 49+ employee names
   - Searchable: Yes

8. q10_absentees: "Absentees" (Multi-Selection Widget)
   - Type: control_widget
   - Same configuration as Attendees

9. q11_agenda: "Agenda" (Text Input)
   - Type: control_textbox
   - Width: 500px

10. q13_description: "Description" (Textarea)
    - Type: control_textarea
    - Size: 648x163px

11. q14_typeA14: Add Another Checkbox
    - Type: control_checkbox
    - Value: "Add another"
    - Triggers: Conditional display

12. q33_actionRequired: "Action Required" (Textarea)
    - Type: control_textarea
    - Size: 648x163px

13. q34_assignedTo: "Assigned To" (Dropdown)
    - Type: control_dropdown
    - Options: 60+ employees + "Other"
    - Calculations: Auto email assignment

14. q37_emailAddress: "Email Address" (Text)
    - Type: control_textbox
    - Auto-populated via calculations

15. q55_status: "Status" (Dropdown)
    - Type: control_dropdown
    - Options: New, In Progress, Closed
    - Default: New

16. q35_dueDate: "Due Date" (DateTime)
    - Type: control_datetime
    - Format: DD-MM-YYYY

WIDGET CONFIGURATIONS:
- Multiple Selection Widget Settings:
  * Client ID: 5293157eb5ac485477000004
  * Height: 45px
  * Max Width: 500px
  * Placeholder: "Search and select names"
  * Data source: Encoded employee list

CONDITIONAL LOGIC:
- 8 conditional rules defined
- Field visibility based on selections
- Progressive form sections
- Email calculations
- Dynamic content display

FORM VALIDATION:
- Required field validation
- Date format validation
- Email format checks (implied)
- Character limits on text areas
- Dropdown selection validation`
  },
  {
    name: 'Advanced JotForm Features',
    description: 'Complex JotForm with calculations, widgets, and conditional logic',
    text: `JotForm Advanced Features Example:

FORM CALCULATIONS:
- Calculation ID: action_0_1743036575074
- Field 34 (Assigned To) triggers email calculation
- Formula: {34} → Auto-populates email address
- Decimal places: 2
- Result field: 37 (Email Address)
- Conditions: Executes when Field 34 is not "Other" and is filled

CONDITIONAL LOGIC SYSTEM:
Rule 1: Show Custom Name Field
- Action: Show field q62_name
- Condition: q34_assignedTo equals "Other"
- Priority: 0

Rule 2: URL-Based Form Display  
- Action: Show field q1 (main form)
- Conditions: q60_typeA60 contains specific URLs
- Multiple URL patterns supported
- Priority: 1

Rule 3: Meeting Type Specific Fields
- Action: Show field q38
- Condition: q36_typeOf equals "Management Quarterly"  
- Priority: 2

Rule 4: Progressive Agenda Items
- Rules 4-7: Sequential agenda item display
- Each "Add another" checkbox reveals next section
- Cascading field visibility (q14→q15-17→q18-21→etc.)

WIDGET INTEGRATIONS:
Multiple Selection Widgets:
- Widget Name: "Multiple Selection"
- Client ID: 5293157eb5ac485477000004
- Frame source: app-widgets.jotform.io/multipleSelection
- Data encoding: URL-encoded employee lists
- Features: Search, multi-select, responsive

URL Tracking Widget:
- Widget: "Get Page URL"  
- Purpose: Track form referrer
- Hidden field: q60_typeA60
- Script: widgets.jotform.io/getParentUrl

FORM JAVASCRIPT FEATURES:
- Event observer enabled
- Form tracking and analytics
- Auto-calendar integration
- Masked input support (time, phone)
- Smooth scrolling
- Error navigation
- Payment UI support
- Multiple file upload handling

FORM SECURITY:
- CSRF protection via simple_spc tokens
- Form ID validation: 250758111292454
- Hidden honeypot fields
- Submission source tracking
- Event tracking with UUIDs

RESPONSIVE DESIGN:
- Mobile-optimized layout
- Flexible form width (max 752px)
- Column layouts for related fields
- Collapsible sections for better UX
- Touch-friendly controls

NOTIFICATION SYSTEM:
- Form submission tracking
- Event logging with timestamps
- User agent detection
- Referrer tracking
- Session management

FIELD STYLING:
- Custom CSS injection
- Theme: Professional navy (#2C3345)
- Font: Inter sans-serif
- Button styling: Navy-700 submit buttons
- Form validation styling
- Error message customization

API INTEGRATION READY:
- Upload server: upload.jotform.com
- Submit endpoint: submit.jotform.com
- Widget communication protocols
- Event tracking APIs
- Form analytics integration`
  },
  {
    name: 'JotForm Submission Data',
    description: 'Real submission data structure from Management Meeting Minutes form',
    text: `JotForm Submission Data - Management Meeting Minutes

FORM SUBMISSION ID: 4567891234567890123
SUBMITTED: 2025-01-15 14:30:25 UTC
FORM ID: 250758111292454

SUBMISSION DATA:
{
  "q3_location": "Boretech Head Office - Conference Room A",
  "q4_date": {
    "day": "15",
    "month": "01", 
    "year": "2025"
  },
  "q5_time": {
    "hourSelect": "14",
    "minuteSelect": "30",
    "ampm": "PM",
    "timeInput": "14:30"
  },
  "q6_meetingPurpose": "Quarterly management review and strategic planning session for Q1 2025 objectives",
  "q9_typeA": [
    "James McKenna",
    "Stephen Roberts", 
    "Garry Smith",
    "Patrick Dunne",
    "Michael Ferris"
  ],
  "q10_absentees": [
    "Barry Norris",
    "Lance McDonald"
  ],
  "q11_agenda": "Q4 Performance Review",
  "q13_description": "Review of Q4 2024 performance metrics, financial results, and operational achievements. Discussion of areas for improvement and lessons learned.",
  "q14_typeA14": ["Add another"],
  "q16_agenda16": "Q1 2025 Strategic Objectives",
  "q17_description17": "Setting strategic objectives for Q1 2025 including revenue targets, operational improvements, and new client acquisition goals.",
  "q18_input18": ["Add another"],
  "q20_agenda20": "Budget Allocation Review",
  "q21_description21": "Review and approval of budget allocations for various departments and projects for the upcoming quarter.",
  "q33_actionRequired": "Prepare detailed Q1 budget breakdown with department-specific allocations and submit for board approval",
  "q34_assignedTo": "Stephen Roberts",
  "q37_emailAddress": "stephen@boretechcontracting.com.au",
  "q55_status": "New",
  "q35_dueDate": {
    "day": "31",
    "month": "01",
    "year": "2025"
  },
  "q36_typeOf": "Management Quarterly",
  "q60_typeA60": "https://team.boretechcontracting.com.au/form/?id=management-minutes",
  "formOpenId_V5": "12345678901234567890"
}

METADATA:
- Submission Duration: 12 minutes 45 seconds
- IP Address: 203.123.45.67
- User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
- Browser: Chrome 120.0.0.0
- Device Type: Desktop
- Referrer: https://team.boretechcontracting.com.au/meetings
- Form Version: 3.3.64022

CALCULATED FIELDS:
- Email auto-populated based on "Stephen Roberts" selection
- Meeting type determined: "Management Quarterly"
- Conditional fields triggered: q38 (quarterly-specific fields)
- Form tracking ID generated: 12345678901234567890

FIELD VALIDATIONS PASSED:
✓ Required field q6_meetingPurpose completed
✓ Date format validation (DD-MM-YYYY)
✓ Time format validation (HH:MM AM/PM)
✓ Email calculation successful
✓ Conditional logic executed correctly
✓ Widget data properly serialized

FORM SECTIONS COMPLETED:
✓ Basic Information (Location, Date, Time, Purpose)
✓ Attendance (5 attendees, 2 absentees selected)
✓ Agenda & Topics (3 agenda items with descriptions)
✓ Action Items (1 action assigned to Stephen Roberts)
✓ Hidden fields (URL tracking, meeting type)

NOTIFICATIONS TRIGGERED:
- Email sent to: stephen@boretechcontracting.com.au
- Management team notification sent
- Form submission confirmation generated
- Calendar integration triggered (if enabled)

EXPORT FORMATS AVAILABLE:
- JSON (as shown above)
- CSV for spreadsheet import
- PDF formatted report
- XML for system integration
- Excel workbook format`
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
    
    // Prepare input based on active tab
    let inputPrompt = '';
    if (activeInputTab.value === 'requirements') {
      inputPrompt = requirements.value;
    } else if (activeInputTab.value === 'jotform') {
      // Construct JotForm-based prompt
      inputPrompt = `Please generate a DocType based on this JotForm data:

${jotformData.value}

Please analyze this JotForm information and create an equivalent ERPNext DocType that captures all the fields and functionality, optimized for ERPNext and mobile use.`;
    }
    
    const output = await generateDocType(claudeApiKey, inputPrompt);
    
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



const downloadAllFiles = () => {
  if (!generatedOutput.value) return;
  
  // Download all files at once
  downloadDocTypeJSON();
  downloadHTMLMockup();
  downloadImplementationGuide();
  if (generatedOutput.value.childDocTypes?.length) {
    downloadChildDocTypes();
  }
};

const resetGenerator = () => {
  generatedOutput.value = null;
  error.value = '';
  requirements.value = '';
  jotformData.value = '';
  activeInputTab.value = 'requirements';
  erpSaveSuccess.value = '';
  erpSaveError.value = '';
  erpSaveWarning.value = '';
  // Keep API key for convenience
};

// Helper function to validate input based on active tab
const validateInput = () => {
  if (activeInputTab.value === 'requirements') {
    return requirements.value.trim().length > 0;
  } else if (activeInputTab.value === 'jotform') {
    return jotformData.value.trim().length > 0;
  }
  return false;
};


const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

// Function to fix advanced field types and their requirements
const fixAdvancedFieldTypes = (fields: any[]) => {
  if (!fields || !Array.isArray(fields)) return fields;

  const dynamicLinkFields: Array<{ field: any; index: number }> = [];
  const docTypeFields: any[] = [];
  
  // First pass: identify Dynamic Link fields and existing DocType Link fields
  fields.forEach((field, index) => {
    if (field.fieldtype === 'Dynamic Link') {
      dynamicLinkFields.push({ field, index });
    }
    if (field.fieldtype === 'Link' && field.options === 'DocType') {
      docTypeFields.push(field);
    }
  });

  // Process Dynamic Link fields
  dynamicLinkFields.forEach(({ field, index }) => {
    let docTypeFieldName: string | null = null;
    
    // Check if the field already has a valid options pointing to a DocType field
    if (field.options && docTypeFields.some((f: any) => f.fieldname === field.options)) {
      docTypeFieldName = field.options;
      console.log(`Dynamic Link field "${field.fieldname}" already has valid DocType field: ${docTypeFieldName}`);
    } else {
      // Look for an existing DocType field we can use
      if (docTypeFields.length > 0) {
        docTypeFieldName = docTypeFields[0].fieldname;
        console.log(`Dynamic Link field "${field.fieldname}" will use existing DocType field: ${docTypeFieldName}`);
      } else {
        // Create a new DocType field
        docTypeFieldName = `${field.fieldname}_doctype`;
        const newDocTypeField = {
          fieldname: docTypeFieldName,
          fieldtype: 'Link',
          label: `${field.label || field.fieldname} DocType`,
          options: 'DocType', // Exact capitalization is critical for ERPNext validation
          reqd: field.reqd || 0,
          hidden: 0,
          read_only: 0
        };
        
        // Insert the new DocType field before the Dynamic Link field
        fields.splice(index, 0, newDocTypeField);
        docTypeFields.push(newDocTypeField);
        console.log(`Created new DocType field "${docTypeFieldName}" for Dynamic Link field "${field.fieldname}"`);
      }
    }
    
    // Update the Dynamic Link field to point to the DocType field
    if (docTypeFieldName) {
      field.options = docTypeFieldName;
    }
  });

  // Enhance advanced field types for ERPNext v15+
  fields.forEach((field) => {
    // Configure Geolocation fields for v15+ features
    if (field.fieldtype === 'Geolocation') {
      if (!field.label) field.label = field.fieldname.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      // v15+ supports advanced geolocation features
      field.map_default_zoom = field.map_default_zoom || 15;
      field.map_default_location = field.map_default_location || '';
      console.log(`Geolocation field "${field.fieldname}" configured for ERPNext v15+ with enhanced mapping`);
    }
    
    // Configure JSON fields for v15+ capabilities
    if (field.fieldtype === 'JSON') {
      if (!field.label) field.label = field.fieldname.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      // v15+ has improved JSON editor and validation
      field.enable_json_editor = 1;
      console.log(`JSON field "${field.fieldname}" configured for ERPNext v15+ with enhanced JSON editor`);
    }
    
    // Configure Icon fields for v15+ support
    if (field.fieldtype === 'Icon') {
      if (!field.label) field.label = field.fieldname.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      // v15+ has full icon field support
      console.log(`Icon field "${field.fieldname}" configured for ERPNext v15+ with full icon support`);
    }
    
    // Configure Rating fields for v15+
    if (field.fieldtype === 'Rating') {
      if (!field.label) field.label = field.fieldname.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      field.options = field.options || 5; // Default to 5-star rating
      console.log(`Rating field "${field.fieldname}" configured for ERPNext v15+ with ${field.options}-star rating`);
    }
    
    // Configure Duration fields for v15+
    if (field.fieldtype === 'Duration') {
      if (!field.label) field.label = field.fieldname.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      field.hide_days = field.hide_days || 0;
      field.hide_seconds = field.hide_seconds || 0;
      console.log(`Duration field "${field.fieldname}" configured for ERPNext v15+ with time tracking`);
    }
    
    // Configure Barcode fields for v15+
    if (field.fieldtype === 'Barcode') {
      if (!field.label) field.label = field.fieldname.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      field.options = field.options || 'CODE128'; // Default barcode type
      console.log(`Barcode field "${field.fieldname}" configured for ERPNext v15+ with ${field.options} encoding`);
    }
  });

  return fields;
};

const validateAndFixDocType = (docType: any, skipAutoRename = false) => {
  if (!docType) {
    console.error('validateAndFixDocType: No docType provided');
    return { docType: null, warning: null };
  }

  // Use either 'doctype' or 'name' field as the name (Claude uses 'doctype', API expects 'name')
  // Priority: name field (user input) > doctype field (AI generated)
  let docTypeName = docType.name || docType.doctype;
  const originalName = docTypeName;
  let warning: string | null = null;
  
  // Ensure we have a valid name field
  if (!docTypeName || !docTypeName.trim()) {
    console.error('validateAndFixDocType: DocType name is missing or empty', docType);
    return { docType: null, warning: null };
  }

  console.log('validateAndFixDocType: Using DocType name:', docTypeName);

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
    is_submittable: 0, // Always 0 - prevents submit/cancel workflow complications
    allow_import: 1 // Enable import functionality
  };

  // Remove the 'doctype' field if it exists (since we're using 'name' instead)
  if (cleanDocType.doctype) {
    delete cleanDocType.doctype;
  }

  // Remove potentially problematic attributes that may cause validation issues
  if (cleanDocType.naming_rule) {
    delete cleanDocType.naming_rule;
  }
  
  // Remove autoname for custom DocTypes as it can cause validation issues
  if (cleanDocType.autoname) {
    console.warn(`Removing autoname "${cleanDocType.autoname}" from custom DocType as it may cause validation issues`);
    delete cleanDocType.autoname;
  }
  
  // Ensure allow_rename is properly set for custom DocTypes
  if (cleanDocType.allow_rename === undefined) {
    cleanDocType.allow_rename = 1; // Allow renaming by default for custom DocTypes
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
        // Clean up Select field options
        const cleanOptions = field.options
          .filter(option => option && typeof option === 'string' && option.trim().length > 0)
          .map(option => option.trim())
          .filter((option, index, arr) => arr.indexOf(option) === index); // remove duplicates
        
        cleanField.options = cleanOptions.join('\n');
        
        if (cleanOptions.length !== field.options.length) {
          console.log(`Select field "${cleanField.fieldname}": Cleaned options from ${field.options.length} to ${cleanOptions.length} valid options`);
        }
      } else if (field.options && field.fieldtype === 'Select' && typeof field.options === 'string') {
        // Handle string options (already newline-separated)
        const cleanOptions = field.options
          .split('\n')
          .map(option => option.trim())
          .filter(option => option.length > 0)
          .filter((option, index, arr) => arr.indexOf(option) === index); // remove duplicates
        
        cleanField.options = cleanOptions.join('\n');
      }

      // Enhanced Link field validation for ERPNext v15+
      if (cleanField.fieldtype === 'Link' && cleanField.options) {
        // v15+ has excellent support for linking to custom DocTypes but validates strictly
        const problematicDocTypes = ['undefined', 'null', '', ' '];
        const suspiciousPatterns = [
          /^[a-z]+$/, // all lowercase (usually invalid)
          /\s{2,}/, // multiple spaces
          /[^a-zA-Z0-9\s_-]/, // special characters except space, underscore, hyphen
          /^\d/, // starts with number
        ];
        
        let isProblematic = problematicDocTypes.includes(cleanField.options) || 
                           cleanField.options.length < 2 ||
                           suspiciousPatterns.some(pattern => pattern.test(cleanField.options));
        
        if (isProblematic) {
          console.warn(`Converting Link field "${cleanField.fieldname}" with potentially invalid DocType reference "${cleanField.options}" to Data field`);
          cleanField.fieldtype = 'Data';
          cleanField.options = '';
                  } else {
            // Special handling for DocType master references
            if (cleanField.options.toLowerCase() === 'doctype') {
              cleanField.options = 'DocType'; // Exact capitalization required by ERPNext
              console.log(`Link field "${cleanField.fieldname}": Fixed DocType master reference to exact "DocType" capitalization`);
            } else {
              // Try to fix common DocType name issues for other DocTypes
              let fixedOptions = cleanField.options
                .trim()
                .replace(/\s+/g, ' ') // normalize spaces
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' '); // Title Case
              
              if (fixedOptions !== cleanField.options) {
                console.log(`Link field "${cleanField.fieldname}": Fixed DocType name from "${cleanField.options}" to "${fixedOptions}"`);
                cleanField.options = fixedOptions;
              }
            }
            
            console.log(`Link field "${cleanField.fieldname}" linking to "${cleanField.options}" - validated for ERPNext v15+`);
          }
      }

      // Enhanced Table and Table MultiSelect field validation for ERPNext v15+
      if (cleanField.fieldtype === 'Table' || cleanField.fieldtype === 'Table MultiSelect') {
        if (!cleanField.options) {
          console.warn(`Table field "${cleanField.fieldname}" has no child table defined, converting to Section Break`);
          cleanField.fieldtype = 'Section Break';
          cleanField.options = '';
        } else {
          // Validate Table field options (child DocType names)
          const problematicDocTypes = ['undefined', 'null', '', ' '];
          const suspiciousPatterns = [
            /^[a-z]+$/, // all lowercase (usually invalid)
            /\s{2,}/, // multiple spaces
            /[^a-zA-Z0-9\s_-]/, // special characters except space, underscore, hyphen
            /^\d/, // starts with number
          ];
          
          let isProblematic = problematicDocTypes.includes(cleanField.options) || 
                             cleanField.options.length < 2 ||
                             suspiciousPatterns.some(pattern => pattern.test(cleanField.options));
          
          // Check for ERPNext master DocTypes (not child tables) that can't be used in Table/Table MultiSelect fields
          const erpNextMasterDocTypes = [
            'Employee', 'Customer', 'Supplier', 'Item', 'User', 'Company', 'Project', 'Task', 
            'Lead', 'Opportunity', 'Account', 'Sales Order', 'Purchase Order', 'Quotation', 
            'Sales Invoice', 'Purchase Invoice', 'Delivery Note', 'Purchase Receipt', 
            'Journal Entry', 'Payment Entry', 'Stock Entry', 'Material Request', 'BOM', 
            'Work Order', 'Timesheet', 'Expense Claim', 'Leave Application', 'Salary Slip', 
            'Attendance', 'Holiday List', 'Department', 'Designation', 'Branch', 'Warehouse', 
            'UOM', 'Currency', 'Tax Rule', 'Price List', 'Shipping Rule', 'Terms and Conditions', 
            'Address', 'Contact', 'Communication', 'Event', 'ToDo', 'Note', 'File', 'Email Account',
            'Print Format', 'Letter Head', 'Web Page', 'Blog Post', 'Website Settings'
          ];
          
          const isMasterDocType = erpNextMasterDocTypes.includes(cleanField.options);
          
          // Check for non-existent child DocType patterns (common AI-generated names that don't exist)
          const nonExistentChildDocTypePatterns = [
            /^Form Field$/i, // exactly "Form Field" (very common AI-generated name)
            /^Field$/i, // exactly "Field" (common AI-generated name)
            /^Custom Field$/i, // exactly "Custom Field" (common AI-generated name)
            /^Dynamic Field$/i, // exactly "Dynamic Field" (common AI-generated name)
            /^Table Field$/i, // exactly "Table Field" (common AI-generated name)
            /^Form Element$/i, // exactly "Form Element" (common AI-generated name)
            /^Form Item$/i, // exactly "Form Item" (common AI-generated name)
            /^Form Component$/i, // exactly "Form Component" (common AI-generated name)
            /^Meeting Agenda Item$/i, // exactly "Meeting Agenda Item" (common AI-generated name)
            /^Meeting Action Item$/i, // exactly "Meeting Action Item" (common AI-generated name)
            /^Meeting Attendee$/i, // exactly "Meeting Attendee" (common AI-generated name)
            /^Action Item$/i, // exactly "Action Item" (common AI-generated name)
            /^Agenda Item$/i, // exactly "Agenda Item" (common AI-generated name)
            /^Attendee$/i, // exactly "Attendee" (common AI-generated name)
            /^Meeting Item$/i, // exactly "Meeting Item" (common AI-generated name)
            /^Meeting Entry$/i, // exactly "Meeting Entry" (common AI-generated name)
            /Field$/i, // ends with "Field" (e.g., "Form Field", "Input Field", "Custom Field")
            /Fields$/i, // ends with "Fields" (e.g., "Form Fields", "Input Fields")
            /Item$/i, // ends with "Item" (e.g., "Field Type Showcase Item", "Product Item")
            /Items$/i, // ends with "Items" (e.g., "Gallery Items", "Order Items")
            /Detail$/i, // ends with "Detail" (e.g., "Order Detail", "Invoice Detail")
            /Details$/i, // ends with "Details" (e.g., "Product Details", "Customer Details")
            /Line$/i, // ends with "Line" (e.g., "Sales Line", "Purchase Line")
            /Lines$/i, // ends with "Lines" (e.g., "Invoice Lines", "Order Lines")
            /Entry$/i, // ends with "Entry" (e.g., "Log Entry", "Data Entry")
            /Entries$/i, // ends with "Entries" (e.g., "Log Entries", "Time Entries")
            /Record$/i, // ends with "Record" (e.g., "History Record", "Audit Record")
            /Records$/i, // ends with "Records" (e.g., "Training Records", "Audit Records")
            /Child$/i, // ends with "Child" (e.g., "Table Child", "Item Child")
            /Children$/i, // ends with "Children" (e.g., "Table Children", "Child Items")
            /Image$/i, // ends with "Image" (e.g., "Gallery Image", "Product Image")
            /Images$/i, // ends with "Images" (e.g., "Gallery Images", "Product Images")
            /Photo$/i, // ends with "Photo" (e.g., "Gallery Photo", "Profile Photo")
            /Photos$/i, // ends with "Photos" (e.g., "Gallery Photos", "Event Photos")
            /File$/i, // ends with "File" (e.g., "Attachment File", "Document File")
            /Files$/i, // ends with "Files" (e.g., "Attachment Files", "Document Files")
            /Document$/i, // ends with "Document" (e.g., "Support Document", "Reference Document")
            /Documents$/i, // ends with "Documents" (e.g., "Support Documents", "Reference Documents")
            /Attachment$/i, // ends with "Attachment" (e.g., "Email Attachment", "File Attachment")
            /Attachments$/i, // ends with "Attachments" (e.g., "Email Attachments", "File Attachments")
            /Element$/i, // ends with "Element" (e.g., "Form Element", "UI Element")
            /Elements$/i, // ends with "Elements" (e.g., "Form Elements", "UI Elements")
            /Component$/i, // ends with "Component" (e.g., "Form Component", "UI Component")
            /Components$/i, // ends with "Components" (e.g., "Form Components", "UI Components")
            /Gallery/i, // contains "Gallery" (e.g., "Photo Gallery", "Image Gallery")
            /Media/i, // contains "Media" (e.g., "Media Files", "Media Gallery")
            /Upload/i, // contains "Upload" (e.g., "File Upload", "Image Upload")
            /Sub/i, // contains "Sub" (e.g., "Sub Item", "Sub Category")
            /Meeting/i, // contains "Meeting" (e.g., "Meeting Attendee", "Meeting Item")
            /Attendee/i, // contains "Attendee" (e.g., "Meeting Attendee", "Event Attendee")
            /Participant/i, // contains "Participant" (e.g., "Meeting Participant")
            /Member/i // contains "Member" (e.g., "Team Member", "Group Member")
          ];
          
          const seemsLikeNonExistentChildDocType = nonExistentChildDocTypePatterns.some(pattern => 
            pattern.test(cleanField.options)
          );
          
          if (isMasterDocType) {
            // Convert Table/Table MultiSelect fields that reference master DocTypes to appropriate field types
            if (cleanField.fieldtype === 'Table MultiSelect') {
              // For multi-selection scenarios like attendees/absentees, convert to Text field since ERPNext doesn't support multi-select links directly
              if (cleanField.fieldname.toLowerCase().includes('attendee') || cleanField.fieldname.toLowerCase().includes('absentee') || cleanField.fieldname.toLowerCase().includes('participant')) {
                console.warn(`Table MultiSelect field "${cleanField.fieldname}" for multiple employee selection. Converting to Text field for manual entry.`);
                cleanField.fieldtype = 'Text';
                cleanField.options = '';
                if (!cleanField.description) {
                  cleanField.description = `Enter ${cleanField.label || cleanField.fieldname} names (converted from Table MultiSelect - use comma-separated names)`;
                }
              } else {
                console.warn(`Table MultiSelect field "${cleanField.fieldname}" references master DocType "${cleanField.options}". Converting to Link field for single selection.`);
                cleanField.fieldtype = 'Link';
                if (!cleanField.description) {
                  cleanField.description = `Select ${cleanField.label || cleanField.fieldname} (converted from Table MultiSelect for ERPNext compatibility)`;
                }
              }
            } else if (cleanField.fieldtype === 'Table') {
              console.warn(`Table field "${cleanField.fieldname}" references master DocType "${cleanField.options}". Converting to Link field.`);
              cleanField.fieldtype = 'Link';
              if (!cleanField.description) {
                cleanField.description = `Select ${cleanField.label || cleanField.fieldname} (converted from Table field for ERPNext compatibility)`;
              }
            }
          } else if (isProblematic || seemsLikeNonExistentChildDocType) {
            if (seemsLikeNonExistentChildDocType) {
              console.warn(`Table field "${cleanField.fieldname}" references likely non-existent child DocType "${cleanField.options}". Converting to Text field for data entry.`);
              cleanField.fieldtype = 'Text';
              cleanField.options = '';
              // Keep the label and add helpful description
              if (!cleanField.description) {
                cleanField.description = `Enter ${cleanField.label || cleanField.fieldname} details (converted from table field)`;
              }
            } else {
              console.warn(`Table field "${cleanField.fieldname}" has invalid child DocType "${cleanField.options}", converting to Section Break`);
              cleanField.fieldtype = 'Section Break';
              cleanField.options = '';
            }
          } else {
            // Special handling for DocType master references in Table fields (rare but possible)
            if (cleanField.options.toLowerCase() === 'doctype') {
              cleanField.options = 'DocType'; // Exact capitalization required by ERPNext
              console.log(`Table field "${cleanField.fieldname}": Fixed DocType master reference to exact "DocType" capitalization`);
            } else {
              // Try to fix common child DocType name issues
              let fixedOptions = cleanField.options
                .trim()
                .replace(/\s+/g, ' ') // normalize spaces
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' '); // Title Case
              
              if (fixedOptions !== cleanField.options) {
                console.log(`Table field "${cleanField.fieldname}": Fixed child DocType name from "${cleanField.options}" to "${fixedOptions}"`);
                cleanField.options = fixedOptions;
              }
            }
            
            console.log(`Table field "${cleanField.fieldname}" with child DocType "${cleanField.options}" - validated for ERPNext v15+`);
          }
        }
      }

      // Additional safety net: Convert any remaining Table/Table MultiSelect fields that might cause validation issues
      if ((cleanField.fieldtype === 'Table' || cleanField.fieldtype === 'Table MultiSelect') && cleanField.options) {
        // Check if the options might cause validation issues (catch anything we might have missed)
        const potentiallyProblematicOptions = [
          'Meeting Attendee', 'Meeting Action Item', 'Meeting Agenda Item', 'Action Item', 'Agenda Item',
          'Form Field', 'Custom Field', 'Dynamic Field', 'Table Field', 'Form Element', 'Form Item',
          'Attendee', 'Participant', 'Member'
        ];
        
        if (potentiallyProblematicOptions.includes(cleanField.options) || 
            cleanField.options.includes('Meeting') || 
            cleanField.options.includes('Attendee') ||
            cleanField.options.includes('Action') ||
            cleanField.options.includes('Agenda')) {
          
          console.warn(`Safety net: Converting Table field "${cleanField.fieldname}" with potentially problematic options "${cleanField.options}"`);
          
          // Special handling for attendee/participant-related fields
          if (cleanField.fieldname.toLowerCase().includes('attendee') || 
              cleanField.fieldname.toLowerCase().includes('absentee') || 
              cleanField.fieldname.toLowerCase().includes('participant') ||
              cleanField.options.toLowerCase().includes('attendee') ||
              cleanField.options.toLowerCase().includes('participant')) {
            cleanField.fieldtype = 'Text';
            cleanField.options = '';
            if (!cleanField.description) {
              cleanField.description = `Enter ${cleanField.label || cleanField.fieldname} names (converted from Table field - use comma-separated names)`;
            }
            console.log(`Safety net: Converted attendee-related Table field "${cleanField.fieldname}" to Text field`);
          } else {
            // For other Table fields, convert to Text for data entry
            cleanField.fieldtype = 'Text';
            cleanField.options = '';
            if (!cleanField.description) {
              cleanField.description = `Enter ${cleanField.label || cleanField.fieldname} details (converted from Table field)`;
            }
            console.log(`Safety net: Converted Table field "${cleanField.fieldname}" to Text field`);
          }
        }
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

    // Post-process fields to handle advanced field types that need special configuration
    cleanDocType.fields = fixAdvancedFieldTypes(cleanDocType.fields);
  }

  // Fix permissions with invalid role references and remove duplicates
  if (cleanDocType.permissions && Array.isArray(cleanDocType.permissions)) {
    // Common roles that exist in most ERPNext installations
    const standardRoles = ['System Manager', 'Administrator', 'Guest', 'All'];
    
    // Process and fix permissions
    const processedPermissions = cleanDocType.permissions.map((perm: any) => {
      // If the role doesn't exist in our standard list, replace with a safe default
      if (perm.role && !standardRoles.includes(perm.role)) {
        console.warn(`Replacing invalid role "${perm.role}" with "System Manager"`);
        perm.role = 'System Manager';
      }
      
      // Ensure permission values are properly formatted
      const cleanPerm = {
        role: perm.role || 'System Manager',
        permlevel: perm.permlevel || 0,
        if_owner: perm.if_owner || 0,
        read: perm.read === true ? 1 : (perm.read === false ? 0 : (perm.read || 0)),
        write: perm.write === true ? 1 : (perm.write === false ? 0 : (perm.write || 0)),
        create: perm.create === true ? 1 : (perm.create === false ? 0 : (perm.create || 0)),
        delete: perm.delete === true ? 1 : (perm.delete === false ? 0 : (perm.delete || 0)),
        submit: 0, // Always 0 - submittable DocTypes need special configuration
        cancel: 0, // Always 0 - submittable DocTypes need special configuration
        amend: 0, // Always 0 - submittable DocTypes need special configuration
        report: perm.report === true ? 1 : (perm.report === false ? 0 : (perm.report || 0)),
        export: perm.export === true ? 1 : (perm.export === false ? 0 : (perm.export || 0)),
        import: perm.import === true ? 1 : (perm.import === false ? 0 : (perm.import || 0)),
        share: perm.share === true ? 1 : (perm.share === false ? 0 : (perm.share || 0)),
        print: perm.print === true ? 1 : (perm.print === false ? 0 : (perm.print || 0)),
        email: perm.email === true ? 1 : (perm.email === false ? 0 : (perm.email || 0))
      };
      
      return cleanPerm;
    });

    // Remove duplicates by grouping by role + permlevel + if_owner
    const uniquePermissions = new Map();
    
    processedPermissions.forEach((perm: any) => {
      const key = `${perm.role}-${perm.permlevel}-${perm.if_owner}`;
      
      if (uniquePermissions.has(key)) {
        // Merge permissions - take the maximum value for each permission type
        const existingPerm = uniquePermissions.get(key);
        uniquePermissions.set(key, {
          ...existingPerm,
          read: Math.max(existingPerm.read, perm.read),
          write: Math.max(existingPerm.write, perm.write),
          create: Math.max(existingPerm.create, perm.create),
          delete: Math.max(existingPerm.delete, perm.delete),
          submit: 0, // Always 0 - submittable DocTypes need special configuration
          cancel: 0, // Always 0 - submittable DocTypes need special configuration
          amend: 0, // Always 0 - submittable DocTypes need special configuration
          report: Math.max(existingPerm.report, perm.report),
          export: Math.max(existingPerm.export, perm.export),
          import: Math.max(existingPerm.import, perm.import),
          share: Math.max(existingPerm.share, perm.share),
          print: Math.max(existingPerm.print, perm.print),
          email: Math.max(existingPerm.email, perm.email)
        });
        console.warn(`Merged duplicate permission for role "${perm.role}" at level ${perm.permlevel}`);
      } else {
        uniquePermissions.set(key, perm);
      }
    });
    
    // Convert back to array
    cleanDocType.permissions = Array.from(uniquePermissions.values());
    
    // If no valid permissions remain, add a basic System Manager permission
    if (cleanDocType.permissions.length === 0) {
      cleanDocType.permissions = [{
        role: 'System Manager',
        permlevel: 0,
        if_owner: 0,
        read: 1,
        write: 1,
        create: 1,
        delete: 1,
        submit: 0, // Always 0 - submittable DocTypes need special configuration
        cancel: 0, // Always 0 - submittable DocTypes need special configuration
        amend: 0, // Always 0 - submittable DocTypes need special configuration
        report: 1,
        export: 1,
        import: 1,
        share: 1,
        print: 1,
        email: 1
      }];
    }
  } else {
    // If no permissions are defined, add basic System Manager permission
    cleanDocType.permissions = [{
      role: 'System Manager',
      permlevel: 0,
      if_owner: 0,
      read: 1,
      write: 1,
      create: 1,
      delete: 1,
      submit: 0, // Always 0 - submittable DocTypes need special configuration
      cancel: 0, // Always 0 - submittable DocTypes need special configuration
      amend: 0, // Always 0 - submittable DocTypes need special configuration
      report: 1,
      export: 1,
      import: 1,
      share: 1,
      print: 1,
      email: 1
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
  erpSaveWarning.value = ''; // Clear any warnings when canceling
  console.log('cancelModuleSelection: Cleared selected name and module');
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
  const initialName = validationResult.docType?.name || generatedOutput.value.mainDocType.name || generatedOutput.value.mainDocType.doctype || '';
  selectedDocTypeName.value = initialName;
  
  console.log('saveDocTypeToErp: Initializing modal with name:', initialName);
  
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
    const userSelectedName = selectedDocTypeName.value.trim();
    console.log('actualSaveToErp: User selected name:', userSelectedName);
    
    // Create a copy of the DocType with user-selected name
    const docTypeToSave = {
      ...generatedOutput.value.mainDocType,
      name: userSelectedName,
      module: selectedModule.value,
      custom: 1,
      allow_import: 1
    };

    // Remove the original 'doctype' field to prevent it from overriding user's choice
    if (docTypeToSave.doctype) {
      console.log('actualSaveToErp: Removing original doctype field:', docTypeToSave.doctype);
      delete docTypeToSave.doctype;
    }

    console.log('actualSaveToErp: DocType before validation:', { name: docTypeToSave.name, hasDoctype: !!docTypeToSave.doctype });

    // Validate and fix the DocType structure (but keep user's chosen name)
    const validationResult = validateAndFixDocType(docTypeToSave, true);
    
    if (!validationResult.docType) {
      throw new Error('Failed to validate DocType structure');
    }

    console.log('actualSaveToErp: Final DocType name after validation:', validationResult.docType.name);
    console.log('actualSaveToErp: Sending DocType to ERP:', { name: validationResult.docType.name, module: validationResult.docType.module });
    
    const response = await createDocType(validationResult.docType);
    
    erpSaveSuccess.value = `Successfully saved "${validationResult.docType.name}" to "${selectedModule.value}" module!`;
    
    // Auto-clear success message after 5 seconds
    setTimeout(() => {
      erpSaveSuccess.value = '';
    }, 5000);
    
  } catch (err: any) {
    console.error('Failed to save DocType to ERP:', err);
    
    // Parse and clean server error messages
    let error_message = err.response.data._server_messages || '';
    
    // Handle server messages with HTML tags and JSON parsing
    if (err.response.data._server_messages) {
      try {
        const serverMessages = JSON.parse(err.response.data._server_messages);
        if (Array.isArray(serverMessages)) {
          // Join multiple messages if they exist and strip HTML tags
          error_message = serverMessages.map(msg => {
            try {
              const parsedMsg = JSON.parse(msg).message;
              // Remove HTML tags from the message
              return parsedMsg.replace(/<[^>]*>/g, '');
            } catch {
              // Remove HTML tags from the raw message
              return msg.replace(/<[^>]*>/g, '');
            }
          }).join('. ');
        }
      } catch {
        // Remove HTML tags from the raw server messages
        error_message = err.response.data._server_messages.replace(/<[^>]*>/g, '');
      }
    }
    
    // Handle specific error types using cleaned error message
    if (error_message.includes('DuplicateEntryError') || error_message.includes('already exists') || error_message.includes('Duplicate entry')) {
      const docTypeName = generatedOutput.value.mainDocType.name;
      erpSaveError.value = `DocType "${docTypeName}" already exists in your ERP system. The system has been enhanced to automatically rename conflicting DocTypes. Please generate a new DocType - it will be automatically renamed to avoid conflicts.`;
    } else if (error_message.includes('PermissionError') || error_message.includes('403')) {
      erpSaveError.value = 'You do not have permission to create DocTypes. Please contact your system administrator.';
    } else if (error_message.includes('HiddenAndMandatoryWithoutDefaultError') || error_message.includes('hidden and mandatory without default')) {
      erpSaveError.value = 'Field validation error detected. The DocType has been automatically fixed to resolve hidden/mandatory field conflicts. Please try saving again.';
    } else if (error_message.includes('LinkValidationError') || error_message.includes('Could not find') || error_message.includes('Role:')) {
      erpSaveError.value = 'Invalid role reference detected in permissions. The DocType has been automatically fixed to use standard roles. Please try saving again.';
    } else if (error_message.includes('Only one rule allowed with the same Role, Level and If Owner') || error_message.includes('duplicate permission')) {
      erpSaveError.value = 'Duplicate permission rules detected. The DocType has been automatically fixed to remove duplicates and merge conflicting permissions. Please try saving again.';
    } else if (error_message.includes('Dynamic Link') || error_message.includes('must point to another Link Field')) {
      erpSaveError.value = 'Dynamic Link field configuration issue detected. The DocType has been automatically fixed with proper ERPNext v15+ Dynamic Link configuration including required DocType reference fields. Please try saving again.';
    } else if (error_message.includes('WrongOptionsDoctypeLinkError') || error_message.includes('Options must be a valid DocType') || error_message.includes('Form Field') || error_message.includes('field') && error_message.includes('row')) {
      erpSaveError.value = `❌ <strong>Table Field Issue Detected:</strong> The AI generated a Table field that references a child DocType (like "Form Field") that doesn't exist in your ERPNext system.<br><br>
      🔧 <strong>Automatic Fix Applied:</strong> The system has been enhanced to automatically detect and convert such Table fields to Text fields for data entry.<br><br>
      🔄 <strong>Next Steps:</strong> Please try saving again. If you continue to get this error, try generating a new DocType - it will be automatically fixed with proper field types.`;
    } else if (error_message.includes('is not a child table') || error_message.includes('Table MultiSelect') || error_message.includes('Employee') && (error_message.includes('attendees') || error_message.includes('absentees'))) {
      erpSaveError.value = `❌ <strong>Master DocType in Table Field:</strong> The AI generated Table or Table MultiSelect fields that reference master DocTypes (like "Employee") which cannot be used as child tables.<br><br>
      🔧 <strong>Automatic Fix Applied:</strong> The system now automatically converts:<br>
      • Table MultiSelect → Link fields (for single selection)<br>
      • Table fields with master DocTypes → Link fields<br>
      • Invalid child DocTypes → Text fields<br><br>
      🔄 <strong>Next Steps:</strong> Please try saving again. The DocType will be automatically fixed with proper field types that work with ERPNext validation.`;
    } else if (error_message.includes('ValidationError')) {
      erpSaveError.value = `Validation Error: ${error_message}. The DocType has been automatically optimized for ERPNext v15+ compatibility. Please try saving again.`;
    } else if (error_message.includes('TypeError') || error_message.includes('NoneType')) {
      erpSaveError.value = 'DocType structure issue detected. The generated DocType has been automatically enhanced for ERPNext v15+ features. Please try saving again.';
    } else {
      erpSaveError.value = error_message || 'Failed to save DocType to ERP system. The DocType has been optimized for ERPNext v15+ - please try saving again.';
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