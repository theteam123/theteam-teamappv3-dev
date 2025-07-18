<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">App Dashboard</h1>
        <p class="text-gray-600 mt-2">Access your shortcuts, reports, and business modules</p>
      </div>

      <!-- Your Shortcuts, Reports & Masters Widget -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Your Shortcuts, Reports & Masters</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 class="font-medium text-blue-800 mb-2">Quick Shortcuts</h3>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• New Document</li>
              <li>• Recent Items</li>
              <li>• Favorites</li>
            </ul>
          </div>
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 class="font-medium text-green-800 mb-2">Reports</h3>
            <ul class="text-sm text-green-700 space-y-1">
              <li>• Financial Reports</li>
              <li>• Inventory Reports</li>
              <li>• Sales Reports</li>
            </ul>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 class="font-medium text-purple-800 mb-2">Masters</h3>
            <ul class="text-sm text-purple-700 space-y-1">
              <li>• User Management</li>
              <li>• System Settings</li>
              <li>• Data Configuration</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Stats Cards Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-gray-50 p-5 rounded-lg">
          <div class="text-sm text-gray-500 mb-1">Total Companies</div>
          <div class="text-2xl font-semibold text-green-600">{{ stats.companies }}</div>
        </div>
        <div class="bg-gray-50 p-5 rounded-lg">
          <div class="text-sm text-gray-500 mb-1">Active Leads</div>
          <div class="text-2xl font-semibold text-green-500">{{ stats.leads }}</div>
        </div>
        <div class="bg-gray-50 p-5 rounded-lg">
          <div class="text-sm text-gray-500 mb-1">Opportunities</div>
          <div class="text-2xl font-semibold text-orange-500">{{ stats.opportunities }}</div>
        </div>
        <div class="bg-gray-50 p-5 rounded-lg">
          <div class="text-sm text-gray-500 mb-1">Activities</div>
          <div class="text-2xl font-semibold text-blue-500">{{ stats.activities }}</div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow-md mb-8">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-semibold text-gray-800">Recent Items</h3>
            <span class="text-sm bg-gray-100 px-2 py-1 rounded-lg">{{ filteredData.length }} items</span>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="toggleFilters" 
              class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              title="Toggle Filters"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
            </button>
            <button 
              @click="refreshData" 
              class="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Refresh
            </button>
            <button 
              @click="addNewItem" 
              class="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div v-if="showFilters" class="border-b border-gray-200 p-4 bg-gray-50">
          <div class="flex flex-wrap gap-4 items-center">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">Status:</label>
              <select v-model="filters.status" @change="applyFilters" class="text-sm border border-gray-300 rounded-md px-2 py-1">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">Type:</label>
              <select v-model="filters.type" @change="applyFilters" class="text-sm border border-gray-300 rounded-md px-2 py-1">
                <option value="">All Types</option>
                <option value="Company">Company</option>
                <option value="Contact">Contact</option>
                <option value="Lead">Lead</option>
                <option value="Opportunity">Opportunity</option>
              </select>
            </div>
            <button 
              @click="clearFilters" 
              class="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Bulk Actions Bar -->
        <div v-if="selectedItems.size > 0" class="bg-green-600 text-white p-3 flex items-center justify-between">
          <span class="text-sm">{{ selectedItems.size }} item{{ selectedItems.size > 1 ? 's' : '' }} selected</span>
          <div class="flex gap-2">
            <button @click="bulkEdit" class="px-3 py-1 text-sm bg-white bg-opacity-20 rounded hover:bg-opacity-30">Edit</button>
            <button @click="bulkDelete" class="px-3 py-1 text-sm bg-white bg-opacity-20 rounded hover:bg-opacity-30">Delete</button>
            <button @click="clearSelection" class="px-3 py-1 text-sm bg-white bg-opacity-20 rounded hover:bg-opacity-30">Clear</button>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="w-10 p-4">
                  <input 
                    type="checkbox" 
                    @change="toggleSelectAll" 
                    :checked="selectedItems.size > 0 && selectedItems.size === currentPageData.length"
                    class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  >
                </th>
                <th @click="sortBy('name')" class="text-left p-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100">
                  Name
                  <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </th>
                <th @click="sortBy('type')" class="text-left p-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100">
                  Type
                  <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </th>
                <th @click="sortBy('status')" class="text-left p-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100">
                  Status
                  <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </th>
                <th @click="sortBy('updated')" class="text-left p-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100">
                  Updated
                  <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </th>
                <th class="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr 
                v-for="item in currentPageData" 
                :key="item.id" 
                @click="viewItem(item)"
                class="hover:bg-gray-50 cursor-pointer"
              >
                <td class="p-4" @click.stop>
                  <input 
                    type="checkbox" 
                    :checked="selectedItems.has(item.id)"
                    @change="toggleItemSelection(item.id)"
                    class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  >
                </td>
                <td class="p-4">
                  <div class="font-medium text-gray-900">{{ item.name }}</div>
                </td>
                <td class="p-4 text-gray-600">{{ item.type }}</td>
                <td class="p-4">
                  <span :class="getStatusBadgeClass(item.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ getStatusText(item.status) }}
                  </span>
                </td>
                <td class="p-4 text-sm text-gray-500">{{ item.updated }}</td>
                <td class="p-4" @click.stop>
                  <div class="flex gap-2">
                    <button 
                      @click="editItem(item)" 
                      class="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      @click="deleteItem(item)" 
                      class="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between p-4 border-t border-gray-200">
          <div class="text-sm text-gray-500">
            Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredData.length) }} of {{ filteredData.length }} items
          </div>
          <div class="flex gap-2">
            <button 
              @click="previousPage" 
              :disabled="currentPage === 1"
              class="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Actions Card -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-5">Quick Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            @click="handleQuickAction('company')"
            class="border border-gray-200 rounded-lg p-5 text-left hover:shadow-md hover:-translate-y-1 transition-all duration-200"
          >
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span class="font-medium text-gray-900">Add New Company</span>
            </div>
            <p class="text-sm text-gray-500">Create a new company record in your CRM</p>
          </button>
          
          <button 
            @click="handleQuickAction('document')"
            class="border border-gray-200 rounded-lg p-5 text-left hover:shadow-md hover:-translate-y-1 transition-all duration-200"
          >
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span class="font-medium text-gray-900">Generate Document</span>
            </div>
            <p class="text-sm text-gray-500">Use AI to generate documents and templates</p>
          </button>
          
          <button 
            @click="handleQuickAction('voice')"
            class="border border-gray-200 rounded-lg p-5 text-left hover:shadow-md hover:-translate-y-1 transition-all duration-200"
          >
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span class="font-medium text-gray-900">Voice Assistant</span>
            </div>
            <p class="text-sm text-gray-500">Get help using the AI voice assistant</p>
          </button>
        </div>
      </div>

      <!-- Business Modules -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Accounting Module -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800">Accounting</h3>
          </div>
          <p class="text-gray-600 text-sm mb-4">Manage financial transactions and accounting operations</p>
          <div class="space-y-2">
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Chart of Accounts
            </button>
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Journal Entries
            </button>
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Financial Statements
            </button>
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Tax Management
            </button>
          </div>
        </div>

        <!-- Stock Module -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800">Stock</h3>
          </div>
          <p class="text-gray-600 text-sm mb-4">Inventory management and stock operations</p>
          <div class="space-y-2">
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Item Master
            </button>
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Stock Entry
            </button>
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Stock Reconciliation
            </button>
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Warehouse Management
            </button>
          </div>
        </div>

        <!-- CRM Module -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800">CRM</h3>
          </div>
          <p class="text-gray-600 text-sm mb-4">Customer relationship management and sales</p>
          <div class="space-y-2">
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Customer Management
            </button>
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Leads & Opportunities
            </button>
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Sales Orders
            </button>
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Communication Log
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Reactive data
const stats = ref({
  companies: 247,
  leads: 68,
  opportunities: 34,
  activities: 156
})

// Sample data for the table
const allData = ref([
  { id: 1, name: 'Mining Corp Australia', type: 'Company', status: 'active', updated: '2 hours ago' },
  { id: 2, name: 'Sarah Johnson', type: 'Contact', status: 'active', updated: '1 hour ago' },
  { id: 3, name: 'Tech Solutions Pty', type: 'Company', status: 'active', updated: '5 hours ago' },
  { id: 4, name: 'Australia Mining Expansion', type: 'Lead', status: 'qualified', updated: '30 minutes ago' },
  { id: 5, name: 'Green Energy Ltd', type: 'Company', status: 'inactive', updated: '1 day ago' },
  { id: 6, name: 'Queensland Mining Contract', type: 'Opportunity', status: 'proposal', updated: '1 hour ago' },
  { id: 7, name: 'Michael Chen', type: 'Contact', status: 'active', updated: '3 hours ago' },
  { id: 8, name: 'Sydney Office Fit-out', type: 'Lead', status: 'new', updated: '2 hours ago' },
  { id: 9, name: 'Construction Plus', type: 'Company', status: 'active', updated: '2 days ago' },
  { id: 10, name: 'Melbourne Commercial Build', type: 'Opportunity', status: 'negotiation', updated: '4 hours ago' }
])

// Filter and pagination state
const showFilters = ref(false)
const filters = ref({
  status: '',
  type: ''
})
const selectedItems = ref(new Set())
const sortField = ref('')
const sortDirection = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed properties
const filteredData = computed(() => {
  let filtered = allData.value

  if (filters.value.status) {
    filtered = filtered.filter(item => item.status === filters.value.status)
  }

  if (filters.value.type) {
    filtered = filtered.filter(item => item.type === filters.value.type)
  }

  // Apply sorting
  if (sortField.value) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      
      if (sortDirection.value === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const currentPageData = computed(() => {
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const applyFilters = () => {
  currentPage.value = 1 // Reset to first page when filtering
}

const clearFilters = () => {
  filters.value.status = ''
  filters.value.type = ''
  applyFilters()
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const toggleItemSelection = (id) => {
  if (selectedItems.value.has(id)) {
    selectedItems.value.delete(id)
  } else {
    selectedItems.value.add(id)
  }
}

const toggleSelectAll = () => {
  if (selectedItems.value.size === currentPageData.value.length) {
    selectedItems.value.clear()
  } else {
    selectedItems.value.clear()
    currentPageData.value.forEach(item => {
      selectedItems.value.add(item.id)
    })
  }
}

const clearSelection = () => {
  selectedItems.value.clear()
}

const bulkEdit = () => {
  alert(`Bulk edit ${selectedItems.value.size} items functionality would open here`)
}

const bulkDelete = () => {
  if (confirm(`Are you sure you want to delete ${selectedItems.value.size} items?`)) {
    const selectedArray = Array.from(selectedItems.value)
    allData.value = allData.value.filter(item => !selectedArray.includes(item.id))
    selectedItems.value.clear()
    showNotification(`${selectedArray.length} items deleted successfully`)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const refreshData = () => {
  showNotification('Data refreshed successfully')
}

const addNewItem = () => {
  const newItem = {
    id: Date.now(),
    name: 'New Item',
    type: 'Company',
    status: 'active',
    updated: 'Just now'
  }
  allData.value.unshift(newItem)
  showNotification('New item added successfully')
}

const viewItem = (item) => {
  alert(`Viewing details for: ${item.name}`)
}

const editItem = (item) => {
  alert(`Edit functionality for: ${item.name}`)
}

const deleteItem = (item) => {
  if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
    allData.value = allData.value.filter(i => i.id !== item.id)
    showNotification('Item deleted successfully')
  }
}

const handleQuickAction = (action) => {
  switch(action) {
    case 'company':
      alert('Add New Company form would open here')
      break
    case 'document':
      alert('AI Document Generator would open here - Generate templates, contracts, and reports using AI')
      break
    case 'voice':
      alert('Voice Assistant activated - Say "Help me find companies in mining industry" or "Show me today\'s activities"')
      break
    default:
      alert(`Quick Action: ${action}`)
  }
}

const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-red-100 text-red-800',
    'new': 'bg-yellow-100 text-yellow-800',
    'qualified': 'bg-green-100 text-green-800',
    'proposal': 'bg-blue-100 text-blue-800',
    'negotiation': 'bg-orange-100 text-orange-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const statusTexts = {
    'active': 'Active',
    'inactive': 'Inactive',
    'new': 'New',
    'qualified': 'Qualified',
    'proposal': 'Proposal',
    'negotiation': 'Negotiation'
  }
  return statusTexts[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

const showNotification = (message) => {
  // You could integrate this with your existing notification system
  console.log('Notification:', message)
  // For now just use alert, but you could use a toast library
  setTimeout(() => alert(message), 100)
}

// Initialize data on mount
onMounted(() => {
  // Any initialization logic can go here
})
</script> 