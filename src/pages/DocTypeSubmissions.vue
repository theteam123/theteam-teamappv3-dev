<template>
  <div class="p-8">
    <!-- Page Title -->
    <div class="mb-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ docType?.name || 'Loading...' }}</h1>
          <p class="text-sm text-gray-500 mt-1" v-if="!docType?.description?.includes('[redirect:')">{{ docType?.description }}</p>
        </div>
      </div>
    </div>
    <!-- New Document Button -->
    <div class="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-start mb-6">
      <button
        v-if="docTypePermissions?.create === 1 || authStore.user?.roles?.includes('System Manager')"
        @click="router.push(`/documents/${route.params.id}/new`)"
        class="btn-primary text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto"
      >
        <FilePlusIcon class="w-5 h-5" />
        New {{ docType?.name }}
      </button>

      <button
        @click="showFilters = !showFilters"
        class="btn-primary text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto sm:ml-2"
      >
        <FilterIcon class="w-5 h-5" />
        {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
      </button>

      <button
        @click="shareCurrentURL"
        class="btn-primary text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto sm:ml-2"
        title="Share current search results"
      >
        <ShareIcon class="w-5 h-5" />
        Share Filters Results
      </button>
    </div>


    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col gap-4">
      <!-- Global Search -->
      <div class="flex-1">
        <div class="relative">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="`Search ${docType?.name || 'submissions'}...`"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
      <!-- Saved Filters -->
      <div class="mb-4 saved-filters-all-filters" v-show="showFilters">
        <button
          @click="showSavedFilters = !showSavedFilters"
          class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border mb-2"
          :class="[
            showSavedFilters 
              ? 'bg-green-50 text-green-600 border-green-200' 
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          ]"
        >
          <component :is="showSavedFilters ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4" />
          Saved Filters
        </button>

        <!-- Save Current Filter -->
        <div v-if="showSavedFilters" class="mb-4">
          <button
            v-if="!showSaveFilter"
            @click="showSaveFilter = true"
            class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700"
          >
            <PlusIcon class="w-4 h-4" />
            Save Current Filter
          </button>
          <div v-else class="flex items-center gap-2">
            <input
              v-model="newFilterName"
              type="text"
              placeholder="Enter filter name"
              class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              @keyup.enter="handleSaveFilter"
            />
            <button
              @click="handleSaveFilter"
              class="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              :disabled="!newFilterName.trim()"
            >
              Save
            </button>
            <button
              @click="showSaveFilter = false; newFilterName = ''"
              class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>

        <div 
          v-if="showSavedFilters" 
          class="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4"
          :class="{ 'min-h-[60px]': savedFilters.length === 0 }"
        >
          <div v-if="savedFilters.length === 0" class="flex items-center justify-center h-full text-gray-500 text-sm">
            No saved filters
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <button
              v-for="filter in savedFilters"
              :key="filter.name"
              @click="handleFilterSelect(filter)"
              class="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-colors border"
              :class="[
                selectedFilter?.name === filter.name
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              ]"
            >
              <span>{{ filter.filter_name }}</span>
              <div class="flex gap-2 items-center">
                <XIcon 
                  v-if="selectedFilter?.name === filter.name"
                  class="w-4 h-4 cursor-pointer text-green-600"
                  @click.stop="clearSelectedFilter"
                />
                <TrashIcon 
                  class="w-4 h-4 cursor-pointer text-gray-400 hover:text-red-500"
                  @click.stop="openDeleteModal(filter)"
                  title="Delete filter"
                />
              </div>
            </button>
          </div>
        </div>

        <!-- Field-specific Searches -->
        <div v-if="filteredFields?.length" class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <div v-for="field in filteredFields" :key="field.fieldname">
            <label :for="field.fieldname" class="block text-sm font-medium text-gray-700 mb-1">
              {{ field.label || 'Field' }}
            </label>
            
            <!-- Select Field Dropdown -->
            <select
              v-if="field.fieldtype === 'Select'"
              :id="field.fieldname"
              v-model="fieldSearches[field.fieldname]"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option value="">All {{ field.label || 'options' }}</option>
              <option 
                v-for="option in parseSelectOptions(field.options || '')" 
                :key="option" 
                :value="option"
              >
                {{ option }}
              </option>
            </select>
            
            <!-- Text Input for other field types -->
            <input
              v-else
              :id="field.fieldname"
              type="text"
              v-model="fieldSearches[field.fieldname]"
              :placeholder="`Search by ${field.label ? field.label.toLowerCase() : 'field'}...`"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
        </div>
    </div>

      <!-- View Mode Buttons -->
      <div class="flex justify-end gap-4">
        <button
          @click="viewMode = 'grid'"
          :class="[
            'p-2 rounded-lg',
            viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'
          ]"
          title="Grid View"
        >
          <GridIcon class="w-5 h-5" />
        </button>
        <button
          @click="viewMode = 'list'"
          :class="[
            'p-2 rounded-lg',
            viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'
          ]"
          title="List View"
        >
          <ListIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- DocType Count -->
    <div class="mb-4 text-sm text-gray-600">
      <template v-if="debouncedSearchQuery && debouncedSearchQuery.length >= MIN_SEARCH_LENGTH">
        Showing {{ filteredDocuments.length }} of {{ totalItems }} submissions (client-side filtered)
      </template>
      <template v-else>
        Showing {{ filteredDocuments.length }} of {{ totalItems }} submissions
      </template>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoaderIcon class="w-8 h-8 animate-spin text-green-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Submissions Content -->
    <div v-else-if="docType">
      <!-- Grid View -->
      <div v-if="documents.length > 0 && viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="doc in filteredDocuments"
          :key="doc.name"
          :class="[
            'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow',
            doc.owner === authStore.user?.email ? 'border-l-4 border-green-500' : ''
          ]"
        >
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div class="flex gap-2">
                <button
                  v-if="canEditDocument(doc)"
                  @click="router.push(`/documents/${route.params.id}/${doc.name}/edit`)"
                  class="text-white hover:text-green-600 border border-green-600 hover:bg-white btn-primary p-1 rounded"
                  title="Edit Document"
                >
                  <PencilIcon class="w-5 h-5" />
                </button>
                <template v-for="field in actionFields" :key="field.fieldname">
                  <a
                    v-if="doc[field.fieldname]"
                    :href="doc[field.fieldname]"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-gray-600 hover:text-green-600 hover:bg-white border border-green-600 btn-primary p-1 rounded text-white"
                    :title="field.label ? field.label.replace('[action]', '').trim() : ''"
                    @mouseenter="hoveredPdfIcon = doc.name + field.fieldname"
                    @mouseleave="hoveredPdfIcon = null"
                  >
                    <component 
                      :is="(field.label && field.label.toLowerCase().includes('sign on')) ? FileCheck2 :
                           (field.label && field.label.toLowerCase().includes('pdf')) ? 
                           (hoveredPdfIcon === (doc.name + field.fieldname) ? PdfIconBlack : PdfIcon) : 
                           (field.label && field.label.toLowerCase().includes('folder')) ? FolderIcon : 
                           LinkIcon" 
                      class="w-5 h-5"
                    />
                  </a>
                </template>
              </div>
            </div>

            <!-- Document Fields -->
            <div class="mt-4 space-y-2">
              <template v-for="field in docType?.fields.filter(f => !(f.label && f.label.toLowerCase().includes('[action]')))" :key="field.fieldname">
                <div v-if="doc[field.fieldname]" class="flex items-start gap-2">
                  <span class="text-sm font-medium text-gray-500">{{ field.label ? field.label.replace(/\[.*?\]/g, '').trim() : 'Field' }}:</span>
                  <span class="text-sm text-gray-900">
                    <template v-if="field.fieldtype === 'Table' && ( (field.label && field.label.includes('[multiple-upload-view]'))  || (field.label && field.label.includes('[multiple-camera-view]')) )">
                      <button 
                        @click="handleImageClick(doc, field.fieldname)"
                        class="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        title="View Images"
                      >
                        <ImageIcon class="w-4 h-4" />
                        <span>View Images</span>
                      </button>
                    </template>
                    <template v-else-if="field.fieldtype === 'Attach'">
                      <button 
                        @click="isImageFile(doc[field.fieldname]) ? 
                          handleSingleImageClick(doc, field.fieldname) : 
                          handleFileClick(doc[field.fieldname])"
                        class="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        :title="isImageFile(doc[field.fieldname]) ? 'View Image' : 'Open File'"
                      >
                        <component :is="getFileIcon(doc[field.fieldname])" class="w-4 h-4" />
                        <span>View File</span>
                      </button>
                    </template>
                    <template v-else-if="field.fieldtype === 'Attach Image'">
                      <button 
                        @click="handleSingleImageClick(doc, field.fieldname)"
                        class="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        title="View Image"
                      >
                        <ImageIcon class="w-4 h-4" />
                        <span>View Image</span>
                      </button>
                    </template>
                    <template v-else-if="field.fieldtype === 'Signature'">
                      <img 
                        v-if="doc[field.fieldname]"
                        :src="doc[field.fieldname]"
                        alt="Signature"
                        class="max-h-12 max-w-[200px] object-contain"
                        @click="handleSignatureClick(doc[field.fieldname])"
                        style="cursor: pointer;"
                      />
                      <span v-else class="text-gray-400 text-sm">No signature added</span>
                    </template>
                    <template v-else-if="(field.label && field.label.toLowerCase().includes('[support-data]')) && doc[field.fieldname]">
                      <button 
                        @click="showJsonModal(doc[field.fieldname])"
                        class="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        title="View JSON Data"
                      >
                        <FileCodeIcon class="w-5 h-5" />
                      </button>
                    </template>
                    <template v-else>
                      {{ doc[field.fieldname] }}
                    </template>
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else-if="documents.length > 0 && viewMode === 'list'" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <div class="inline-block min-w-full align-middle">
            <div class="overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200 table-fixed">
                <thead class="bg-gray-50">
                  <tr>
                    <th 
                      class="relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
                      :style="{ width: columnWidths.actions + 'px' }"
                    >
                      Actions
                      <div 
                        class="absolute top-0 right-0 w-1 h-full cursor-col-resize resize-handle"
                        @mousedown="startResize('actions', $event)"
                        title="Drag to resize column"
                      ></div>
                    </th>
                    <th
                      v-for="(field, index) in docType?.fields.filter(f => !(f.label && f.label.toLowerCase().includes('[action]')))"
                      :key="field.fieldname"
                      class="relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      :class="{ 'border-r border-gray-200': index < (docType?.fields.filter(f => !(f.label && f.label.toLowerCase().includes('[action]'))).length - 1) }"
                      :style="{ width: columnWidths[field.fieldname] + 'px' }"
                      @click="sortByColumn(field.fieldname)"
                    >
                      <div class="flex items-center gap-1">
                        {{ field.label ? field.label.replace(/\[.*?\]/g, '').trim() : 'Field' }}
                        <div class="flex flex-col">
                          <ChevronUpIcon 
                            class="w-3 h-3" 
                            :class="{'text-green-600': sortBy === field.fieldname && sortDirection === 'asc'}"
                          />
                          <ChevronDownIcon 
                            class="w-3 h-3 -mt-1" 
                            :class="{'text-green-600': sortBy === field.fieldname && sortDirection === 'desc'}"
                          />
                        </div>
                      </div>
                      <div 
                        v-if="index < (docType?.fields.filter(f => !(f.label && f.label.toLowerCase().includes('[action]'))).length - 1)"
                        class="absolute top-0 right-0 w-1 h-full cursor-col-resize resize-handle"
                        @mousedown="startResize(field.fieldname, $event)"
                        title="Drag to resize column"
                      ></div>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr 
                    v-for="doc in filteredDocuments" 
                    :key="doc.name" 
                    :class="[
                      canEditDocument(doc) ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default',
                      doc.owner === authStore.user?.email ? 'bg-green-50' : ''
                    ]"
                  >
                    <td 
                      class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium"
                      :style="{ width: columnWidths.actions + 'px' }"
                    >
                      <div class="flex gap-2">
                        <button
                          v-if="canEditDocument(doc)"
                          @click="router.push(`/documents/${route.params.id}/${doc.name}/edit`)"
                          class="text-white hover:text-green-600 border border-green-600 hover:bg-white btn-primary p-1 rounded"
                          title="Edit Document"
                        >
                          <PencilIcon class="w-5 h-5" />
                        </button>
                        <template v-for="field in actionFields" :key="field.fieldname">
                          <a
                            v-if="doc[field.fieldname]"
                            :href="doc[field.fieldname]"
                            rel="noopener noreferrer"
                            class="text-gray-600 hover:text-green-600 hover:bg-white border border-green-600 btn-primary p-1 rounded text-white"
                            :title="field.label ? field.label.replace('[action]', '').trim() : ''"
                            @mouseenter="hoveredPdfIcon = doc.name + field.fieldname"
                            @mouseleave="hoveredPdfIcon = null"
                          >
                            <component 
                              :is="(field.label && field.label.toLowerCase().includes('sign on')) ? FileCheck2 :
                                   (field.label && field.label.toLowerCase().includes('pdf')) ? 
                                   (hoveredPdfIcon === (doc.name + field.fieldname) ? PdfIconBlack : PdfIcon) : 
                                   (field.label && field.label.toLowerCase().includes('folder')) ? FolderIcon : 
                                   LinkIcon" 
                              class="w-5 h-5"
                            />
                          </a>
                        </template>
                      </div>
                    </td>
                    <td
                      v-for="field in docType?.fields.filter(f => !(f.label && f.label.toLowerCase().includes('[action]')))"
                      :key="field.fieldname"
                      class="px-6 py-4 text-sm text-gray-900"
                      :class="{'whitespace-nowrap': !field.fieldtype.includes('Text')}"
                      :style="{ width: columnWidths[field.fieldname] + 'px' }"
                    >
                      <template v-if="field.fieldtype === 'Table' && ( (field.label && field.label.includes('[multiple-upload-view]'))  || (field.label && field.label.includes('[multiple-camera-view]')) )">
                        <button 
                          @click="handleImageClick(doc, field.fieldname)"
                          class="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          title="View Images"
                          v-if="doc[field.fieldname]?.length"
                        >
                          <ImageIcon class="w-5 h-5" />
                        </button>
                        <span v-else class="text-gray-400 text-sm">No images added</span>
                      </template>
                      <template v-else-if="field.fieldtype === 'Attach'">
                        <button 
                          v-if="doc[field.fieldname]"
                          @click="isImageFile(doc[field.fieldname]) ? 
                            handleSingleImageClick(doc, field.fieldname) : 
                            handleFileClick(doc[field.fieldname])"
                          class="text-gray-500 hover:text-gray-700"
                          :title="isImageFile(doc[field.fieldname]) ? 'View Image' : 'Open File'"
                        >
                          <component 
                            :is="getFileIcon(doc[field.fieldname])" 
                            class="w-5 h-5"
                          />
                        </button>
                        <span v-else class="text-gray-400 text-sm">No file added</span>
                      </template>
                      <template v-else-if="field.fieldtype === 'Attach Image'">
                        <button 
                          @click="handleSingleImageClick(doc, field.fieldname)"
                          class="text-gray-500 hover:text-gray-700"
                          title="View Image"
                          v-if="doc[field.fieldname]"
                        >
                          <ImageIcon class="w-5 h-5" />
                        </button>
                        <span v-else class="text-gray-400 text-sm">No image added</span>
                      </template>
                      <template v-else-if="field.fieldtype === 'Signature'">
                        <img 
                          v-if="doc[field.fieldname]"
                          :src="doc[field.fieldname]"
                          alt="Signature"
                          class="max-h-12 max-w-[200px] object-contain"
                          @click="handleSignatureClick(doc[field.fieldname])"
                          style="cursor: pointer;"
                        />
                        <span v-else class="text-gray-400 text-sm">No signature added</span>
                      </template>
                      <template v-else-if="(field.label && field.label.toLowerCase().includes('[support-data]')) && doc[field.fieldname]">
                        <button 
                          @click="showJsonModal(doc[field.fieldname])"
                          class="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          title="View JSON Data"
                        >
                          <FileCodeIcon class="w-5 h-5" />
                        </button>
                      </template>
                      <template v-else>
                        {{ doc[field.fieldname] }}
                      </template>

                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <FileIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
        <p class="mt-1 text-sm text-gray-500">No submissions available for this document.</p>
      </div>

      <!-- Pagination -->
      <div v-if="documents.length > 0" class="mt-6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span class="text-sm text-gray-600">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Items per page:</span>
          <select
            v-model="pageSize"
            @change="fetchDocuments(1)"
            class="rounded border-gray-300 text-sm"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <ImageModal
      v-if="selectedDocument"
      :is-open="showImageModal"
      :doc-type-id="route.params.id as string"
      :document-id="selectedDocument.name"
      :fieldname="selectedFieldname"
      :is-single-image="selectedDocument[selectedFieldname] && !Array.isArray(selectedDocument[selectedFieldname])"
      :single-image-url="selectedDocument[selectedFieldname]"
      :single-image-name="selectedFieldname"
      @close="showImageModal = false"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Delete Filter</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to remove the "{{ filterToDelete?.filter_name }}" filter?
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="handleDeleteFilter"
            class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- JSON Data Modal -->
    <div v-if="showJsonDataModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">JSON Data</h3>
          <button 
            @click="showJsonDataModal = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="flex-1 overflow-auto">
          <pre class="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded">{{ formattedJsonData }}</pre>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="showSuccessMessage" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
      <CheckCircleIcon class="w-5 h-5" />
      <span>{{ successMessage }}</span>
      <button
        @click="showSuccessMessage = false"
        class="ml-2 text-white hover:text-green-100"
      >
        <XIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { getFormList, getFormData, getDoctypePermissions } from '../services/erpnext';
import { getErpNextApiUrl } from '../utils/api';
import { getReportView, deleteItem, insertItem } from '../services/deskApi';
import {
  FileIcon,
  FilePlusIcon,
  PencilIcon,
  TrashIcon,
  LoaderIcon,
  ArrowLeftIcon,
  SearchIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FileTextIcon,
  ImageIcon,
  FileImageIcon,
  FileTextIcon as FileDocIcon,
  FileArchiveIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileCodeIcon,
  FolderIcon,
  LinkIcon,
  GridIcon,
  ListIcon,
  XIcon,
  PlusIcon,
  FilterIcon,
  ShareIcon,
  CheckCircleIcon,
  FileCheck2
} from 'lucide-vue-next';
import ImageModal from '../components/ImageModal.vue';
import PdfIcon from '../components/icons/PdfIcon.vue';
import PdfIconBlack from '../components/icons/PdfIconBlack.vue';
import { initializeFormFilter } from '../utils/formUtils';

interface DocTypeField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd?: number;
  in_list_view?: number;
  in_preview?: number;
  options?: string;
  in_standard_filter?: number;
  [key: string]: any; // for other properties that might be present
}

interface DocType {
  name: string;
  description: string;
  fields: DocTypeField[];
}

interface Document {
  name: string;
  [key: string]: any;
}

interface DocTypePermission {
  create: number;
  read: number;
  write: number;
  delete: number;
  submit: number;
  cancel: number;
  amend: number;
  if_owner: number;
}

interface SavedFilter {
  name: string;
  filter_name: string;
  for_user: string;
  filters: string;
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref<string | null>(null);
const documents = ref<Document[]>([]);
const docType = ref<DocType | null>(null);
const searchQuery = ref('');
const sortBy = ref('modified');
const sortDirection = ref<'asc' | 'desc'>('desc');
const ifOwnerPermission = ref(false);
const docTypePermissions = ref<DocTypePermission | null>(null);
const hoveredPdfIcon = ref<string | null>(null);
const fieldSearches = ref<Record<string, string>>({});
const filteredFields = ref<DocTypeField[]>([]);

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const totalPages = ref(0);

const showImageModal = ref(false);
const selectedDocument = ref<Document | null>(null);
const selectedFieldname = ref<string>('');

// Add this with other refs
const mediaQueryMatches = ref(false);

// Add this computed property
const isMobile = computed(() => {
  return mediaQueryMatches.value;
});

// Add this computed property before onMounted
const actionFields = computed(() => {
  if (!docType.value) return [];
  return docType.value.fields.filter(field => field.label && field.label.toLowerCase().includes('[action]'));
});

// Computed
const filteredDocuments = computed(() => {
  // Start with the documents from server
  let filtered = [...documents.value];
  
  // Apply client-side global search if there's a search query
  if (debouncedSearchQuery.value && debouncedSearchQuery.value.length >= MIN_SEARCH_LENGTH) {
    const query = debouncedSearchQuery.value.toLowerCase();
    
    // Get all available filter fields for client-side search
    const searchableFields = filteredFields.value
      .filter(field => field.fieldtype !== 'Select')
      .map(field => field.fieldname);
    
    // Add common fields that might exist in the documents
    const commonFields = ['name', 'title', 'subject', 'description', 'notes', 'comments'];
    const allSearchFields = [...new Set([...searchableFields, ...commonFields])];
    
    console.log('Client-side global search fields:', allSearchFields);
    
    filtered = filtered.filter(doc => {
      // Search across all available fields
      return allSearchFields.some(field => {
        const value = doc[field];
        return value && String(value).toLowerCase().includes(query);
      });
    });
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value];
    const bValue = b[sortBy.value];
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection.value === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection.value === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    // Default numeric comparison
    return sortDirection.value === 'asc'
      ? (aValue || 0) - (bValue || 0)
      : (bValue || 0) - (aValue || 0);
  });

  return filtered;
});

// Add viewMode ref with other refs - default to grid on mobile, list on desktop
const viewMode = ref('list');
const showFilters = ref(false);

// Add these refs with other refs
const showSavedFilters = ref(false);
const savedFilters = ref<SavedFilter[]>([]);
const selectedFilter = ref<SavedFilter | null>(null);
const showDeleteModal = ref(false);
const filterToDelete = ref<SavedFilter | null>(null);

// Add new refs for save filter functionality
const showSaveFilter = ref(false);
const newFilterName = ref('');

// Add these refs with other refs
const showJsonDataModal = ref(false);
const jsonData = ref<any>(null);

// Add success message ref
const showSuccessMessage = ref(false);
const successMessage = ref('');

// Add debounced search refs
const debouncedSearchQuery = ref('');
const debouncedFieldSearches = ref<Record<string, string>>({});

// Add timeout refs for debouncing
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
let fieldSearchTimeout: ReturnType<typeof setTimeout> | null = null;

// Add minimum character limit for search
const MIN_SEARCH_LENGTH = 3;

// Add column resize state
const columnWidths = ref<Record<string, number>>({});
const isResizing = ref(false);
const resizingColumn = ref<string | null>(null);
const startX = ref(0);
const startWidth = ref(0);

// Add URL parameter handling
// URL Parameters supported:
// - search: Global search query (e.g., ?search=john)
// - field_[fieldname]: Field-specific search (e.g., ?field_name=john&field_email=john@example.com)
// - view: View mode (grid/list) (e.g., ?view=grid)
// - page: Current page number (e.g., ?page=2)
// - pageSize: Items per page (e.g., ?pageSize=50)
// - sortBy: Sort column (e.g., ?sortBy=name)
// - sortDir: Sort direction (asc/desc) (e.g., ?sortDir=asc)
// - showFilters: Show filters panel (e.g., ?showFilters=true)
// Example URL: /documents/123?search=john&field_name=john&view=grid&page=2&sortBy=name&sortDir=asc&showFilters=true
const updateURLWithSearchParams = () => {
  const url = new URL(window.location.href);
  
  // Update global search parameter
  if (searchQuery.value && searchQuery.value.length >= MIN_SEARCH_LENGTH) {
    url.searchParams.set('search', searchQuery.value);
  } else {
    url.searchParams.delete('search');
  }
  
  // Update field-specific search parameters
  Object.entries(fieldSearches.value).forEach(([fieldname, value]) => {
    if (value && value.trim()) {
      // Find the field definition to check if it's a Select field
      const field = filteredFields.value.find(f => f.fieldname === fieldname);
      
      // For Select fields, include any non-empty value
      // For other fields, only include if it meets minimum length
      if (field?.fieldtype === 'Select' || value.length >= MIN_SEARCH_LENGTH) {
        url.searchParams.set(`field_${fieldname}`, value);
      } else {
        url.searchParams.delete(`field_${fieldname}`);
      }
    } else {
      url.searchParams.delete(`field_${fieldname}`);
    }
  });
  
  // Always include status parameter if it has a value
  if (fieldSearches.value.status) {
    url.searchParams.set('field_status', fieldSearches.value.status);
  }
  
  // Update view mode parameter
  if (viewMode.value !== 'list') {
    url.searchParams.set('view', viewMode.value);
  } else {
    url.searchParams.delete('view');
  }
  
  // Update page parameter
  if (currentPage.value > 1) {
    url.searchParams.set('page', currentPage.value.toString());
  } else {
    url.searchParams.delete('page');
  }
  
  // Update page size parameter
  if (pageSize.value !== 20) {
    url.searchParams.set('pageSize', pageSize.value.toString());
  } else {
    url.searchParams.delete('pageSize');
  }
  
  // Update sort parameters
  if (sortBy.value !== 'modified' || sortDirection.value !== 'desc') {
    url.searchParams.set('sortBy', sortBy.value);
    url.searchParams.set('sortDir', sortDirection.value);
  } else {
    url.searchParams.delete('sortBy');
    url.searchParams.delete('sortDir');
  }
  
  // Update filters visibility
  if (showFilters.value) {
    url.searchParams.set('showFilters', 'true');
  } else {
    url.searchParams.delete('showFilters');
  }
  
  // Update browser history without reloading the page
  window.history.replaceState({}, '', url.toString());
};

const loadSearchParamsFromURL = () => {
  const url = new URL(window.location.href);
  
  // Load global search
  const searchParam = url.searchParams.get('search');
  if (searchParam) {
    searchQuery.value = searchParam;
    debouncedSearchQuery.value = searchParam;
  }
  
  // Load field-specific searches
  const fieldParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    if (key.startsWith('field_')) {
      const fieldname = key.replace('field_', '');
      fieldParams[fieldname] = value;
    }
  });
  
  if (Object.keys(fieldParams).length > 0) {
    // Load all field parameters including status if it exists in URL
    fieldSearches.value = { ...fieldSearches.value, ...fieldParams };
    debouncedFieldSearches.value = { ...debouncedFieldSearches.value, ...fieldParams };
  }
  
  // Load view mode
  const viewParam = url.searchParams.get('view');
  if (viewParam && ['grid', 'list'].includes(viewParam)) {
    viewMode.value = viewParam;
  }
  
  // Load page
  const pageParam = url.searchParams.get('page');
  if (pageParam) {
    const page = parseInt(pageParam);
    if (page > 0) {
      currentPage.value = page;
    }
  }
  
  // Load page size
  const pageSizeParam = url.searchParams.get('pageSize');
  if (pageSizeParam) {
    const size = parseInt(pageSizeParam);
    if ([10, 20, 50, 100].includes(size)) {
      pageSize.value = size;
    }
  }
  
  // Load sort parameters
  const sortByParam = url.searchParams.get('sortBy');
  const sortDirParam = url.searchParams.get('sortDir');
  if (sortByParam && sortDirParam && ['asc', 'desc'].includes(sortDirParam)) {
    sortBy.value = sortByParam;
    sortDirection.value = sortDirParam as 'asc' | 'desc';
  }
  
  // Load filters visibility
  const showFiltersParam = url.searchParams.get('showFilters');
  if (showFiltersParam === 'true') {
    showFilters.value = true;
  }
};

const hasURLSearchParams = () => {
  const url = new URL(window.location.href);
  return url.searchParams.toString().length > 0;
};

const handleBrowserNavigation = () => {
  loadSearchParamsFromURL();
  // Re-fetch documents with the loaded parameters
  fetchDocuments(currentPage.value);
};

// Add this computed property
const formattedJsonData = computed(() => {
  if (!jsonData.value) return '';
  try {
    const data = typeof jsonData.value === 'string' 
      ? JSON.parse(jsonData.value)
      : jsonData.value;
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error formatting JSON:', error);
    return 'Invalid JSON data';
  }
});

// Methods
const fetchDocType = async () => {
  try {
    console.log('Fetching DocType:', route.params.id);
    const response = await getFormData('DocType', route.params.id as string);
    // console.log('DocType Response:', response);
    // console.log('DocType Data:', response.data);
    // console.log('DocType Fields:', response.data.fields);

    filteredFields.value = initializeFormFilter(response.data.fields);
    console.log('Filtered Fields (in_standard_filter=1):', filteredFields.value);

    // Check if user has System Manager role
    const isSystemManager = authStore.user?.roles?.includes('System Manager');
    console.log('Is System Manager:', isSystemManager);

    let permissions;
    if (isSystemManager) {
      // If System Manager, only get permissions for that role
      permissions = await getDoctypePermissions(route.params.id as string, 'System Manager');
      docTypePermissions.value = permissions[0];
      ifOwnerPermission.value = false; // System Managers bypass owner permission check
    } else {
      // For non-System Managers, check all non-system roles
      const systemRoles = ['Administrator', 'Desk User', 'Guest', 'All'];
      const userRoles = authStore.user?.roles?.filter(role => !systemRoles.includes(role)) || [];
      console.log('Filtered user roles:', userRoles);

      // Get permissions for each role
      const rolePermissionsPromises = userRoles.map(role => 
        getDoctypePermissions(route.params.id as string, role)
      );

      const rolePermissionsResponses = await Promise.all(rolePermissionsPromises);
      
      // Combine permissions from all roles
      const allPermissions = rolePermissionsResponses.flatMap(response => response[0] || []);
      console.log('Combined permissions from all roles:', allPermissions);

      // Get the highest permission level for each permission type
      docTypePermissions.value = {
        create: Math.max(...allPermissions.map(p => p?.create || 0)),
        read: Math.max(...allPermissions.map(p => p?.read || 0)),
        write: Math.max(...allPermissions.map(p => p?.write || 0)),
        delete: Math.max(...allPermissions.map(p => p?.delete || 0)),
        submit: Math.max(...allPermissions.map(p => p?.submit || 0)),
        cancel: Math.max(...allPermissions.map(p => p?.cancel || 0)),
        amend: Math.max(...allPermissions.map(p => p?.amend || 0)),
        if_owner: Math.max(...allPermissions.map(p => p?.if_owner || 0))
      };

      // Set if_owner permission if any role has it
      ifOwnerPermission.value = docTypePermissions.value.if_owner === 1;
      console.log('DocType Permissions:', docTypePermissions.value);
    }
    
    console.log('DocType Permissions:', docTypePermissions.value);
    
    // Only proceed if user has read permission or is System Manager
    if (isSystemManager || docTypePermissions.value?.read === 1) {
      // Filter fields to only show those marked for list view
      docType.value = {
        ...response.data,
        fields: response.data.fields.filter((field: DocTypeField) => 
          (field.label && field.label.toLowerCase().includes('[multiple-upload-view]')) || 
          (field.label && field.label.toLowerCase().includes('[multiple-camera-view]')) || 
          field.in_preview === 1 ||
          field.in_list_view === 1
        )
      };
      console.log('DocType Fields:', docType.value?.fields);
      
      // Initialize column widths after docType is loaded
      initializeColumnWidths();
    } else {
      error.value = "You don't have permission to read this document";
      docType.value = null;
    }
    
    console.log('DocType Value:', docType.value);
  } catch (err: any) {
    console.error('Error fetching DocType:', err);
    error.value = err.message;
  }
};

const fetchDocuments = async (page = 1) => {
  if (!route.params.id) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // Build filters for server-side filtering
    const filters: any[] = [];
    
    // Add global search filter
    if (debouncedSearchQuery.value && debouncedSearchQuery.value.length >= MIN_SEARCH_LENGTH) {
      // Client-side global search: Don't add server filters, we'll filter client-side
      console.log('Using client-side global search');
      // We'll handle this in the computed property
    }
    
    // Add field-specific filters
    Object.entries(debouncedFieldSearches.value).forEach(([fieldname, searchValue]) => {
      if (searchValue && searchValue.trim()) {
        const field = filteredFields.value.find(f => f.fieldname === fieldname);
        
        if (field?.fieldtype === 'Select') {
          // For Select fields, use exact matching
          filters.push([fieldname, '=', searchValue.trim()]);
        } else if (searchValue.length >= MIN_SEARCH_LENGTH) {
          // For other fields, use partial matching
          filters.push([fieldname, 'like', `%${searchValue}%`]);
        }
      }
    });
    
    // Note: Owner filter is automatically added by getFormList function when ifOwner permission is true
    // So we don't need to add it here
    
    console.log('Server-side filters:', filters);
    
    // Get total count with filters
    const countResponse = await getFormList(route.params.id as string, {
      fields: ['count(name) as total_count'],
      filters: filters,
      limit: 1
    });
    
    console.log('Count response:', countResponse);
    totalItems.value = countResponse.data[0]?.total_count || 0;
    totalPages.value = Math.ceil(totalItems.value / pageSize.value);
    console.log('Total items:', totalItems.value, 'Total pages:', totalPages.value);

    // Then get paginated data with filters
    const response = await getFormList(route.params.id as string, {
      limit: debouncedSearchQuery.value && debouncedSearchQuery.value.length >= MIN_SEARCH_LENGTH ? 100 : pageSize.value, // Fetch more for global search
      offset: (page - 1) * pageSize.value,
      order_by: `${sortBy.value} ${sortDirection.value}`,
      fields: ['name', 'owner', 'creation', 'modified', 'docstatus'],
      filters: filters
    });

    console.log('Documents response:', response);
    console.log('Documents count:', response.data?.length || 0);
    
    // Fetch full data for each document in the current page
    const fullDocuments = await Promise.all(
      response.data.map(async (doc: { name: string }) => {
        try {
          const docResponse = await getFormData(route.params.id as string, doc.name);
          console.log('DocResponse:', docResponse);
          return docResponse.data;
        } catch (err) {
          return { name: doc.name, error: 'Failed to load document data' };
        }
      })
    );
    
    documents.value = fullDocuments;
    currentPage.value = page;
    
    // Update count for client-side global search
    if (debouncedSearchQuery.value && debouncedSearchQuery.value.length >= MIN_SEARCH_LENGTH) {
      // For client-side search, we need to fetch all documents to get accurate count
      // This is a limitation of client-side search
      console.log('Client-side global search active - filtering will be done client-side');
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchDocuments(page);
    updateURLWithSearchParams();
  }
};

const sortByColumn = (column: string) => {
  if (sortBy.value === column) {
    // Toggle direction if clicking the same column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new column and default to descending
    sortBy.value = column;
    sortDirection.value = 'desc';
  }
  updateURLWithSearchParams();
};

// Watch for search changes
watch(searchQuery, (newValue) => {
  console.log('Search query changed:', newValue);
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // If search is completely cleared, trigger immediate search to show all results
  if (!newValue) {
    console.log('Search cleared, triggering immediate search');
    debouncedSearchQuery.value = newValue;
    currentPage.value = 1;
    fetchDocuments(1);
    updateURLWithSearchParams();
    return;
  }
  
  // If search is too short, don't search at all
  if (newValue.length < MIN_SEARCH_LENGTH) {
    console.log('Search too short, updating URL only');
    debouncedSearchQuery.value = newValue;
    updateURLWithSearchParams();
    return;
  }
  
  // Debounce search for valid queries (3+ characters)
  console.log('Debouncing search for valid query');
  searchTimeout = setTimeout(() => {
    console.log('Executing debounced search');
    debouncedSearchQuery.value = newValue;
    currentPage.value = 1;
    fetchDocuments(1);
    updateURLWithSearchParams();
  }, 300); // 300ms delay
});

// Watch for page size changes
watch(pageSize, () => {
  currentPage.value = 1;
  fetchDocuments(1);
  updateURLWithSearchParams();
});

// Watch for sorting changes
watch([sortBy, sortDirection], () => {
  fetchDocuments(currentPage.value);
  updateURLWithSearchParams();
});

// Watch for view mode changes
watch(viewMode, () => {
  updateURLWithSearchParams();
});

// Watch for page changes
watch(currentPage, () => {
  updateURLWithSearchParams();
});

// Watch for filters visibility
watch(showFilters, () => {
  updateURLWithSearchParams();
});

// Watch for docType changes to reinitialize column widths
watch(docType, (newDocType) => {
  if (newDocType) {
    initializeColumnWidths();
  }
});

// Add watch for field searches
watch(fieldSearches, (newValue) => {
  console.log('Field searches changed:', newValue);
  
  if (fieldSearchTimeout) {
    clearTimeout(fieldSearchTimeout);
  }
  
  // Check if any field has a value
  const hasAnyValue = Object.values(newValue).some(value => value && value.trim());
  console.log('Has any value:', hasAnyValue);
  
  // If no fields have any value, trigger immediate search to show all results
  if (!hasAnyValue) {
    console.log('No field values, triggering immediate search');
    debouncedFieldSearches.value = { ...newValue };
    currentPage.value = 1;
    fetchDocuments(1);
    updateURLWithSearchParams();
    return;
  }
  
  // Check if there are any Select field changes (these should trigger immediate search)
  const hasSelectFieldChanges = Object.entries(newValue).some(([fieldname, value]) => {
    const field = filteredFields.value.find(f => f.fieldname === fieldname);
    return field?.fieldtype === 'Select' && value && value.trim();
  });
  
  console.log('Has select field changes:', hasSelectFieldChanges);
  
  // If there are Select field changes, trigger immediate search
  if (hasSelectFieldChanges) {
    console.log('Select field changes detected, triggering immediate search');
    debouncedFieldSearches.value = { ...newValue };
    currentPage.value = 1;
    fetchDocuments(1);
    updateURLWithSearchParams();
    return;
  }
  
  // Check if any text field has a value that meets minimum length
  const hasValidTextSearch = Object.entries(newValue).some(([fieldname, value]) => {
    const field = filteredFields.value.find(f => f.fieldname === fieldname);
    return field?.fieldtype !== 'Select' && value && value.length >= MIN_SEARCH_LENGTH;
  });
  
  console.log('Has valid text search:', hasValidTextSearch);
  
  // If no valid text searches (all are too short), don't search at all
  if (!hasValidTextSearch) {
    console.log('No valid text searches, updating URL only');
    debouncedFieldSearches.value = { ...newValue };
    updateURLWithSearchParams();
    return;
  }
  
  // Debounce search for text field queries only
  console.log('Debouncing search for text field queries');
  fieldSearchTimeout = setTimeout(() => {
    console.log('Executing debounced search');
    debouncedFieldSearches.value = { ...newValue };
    currentPage.value = 1;
    fetchDocuments(1);
    updateURLWithSearchParams();
  }, 300); // 300ms delay
}, { deep: true });

const canEditDocument = (doc: Document) => {
  if (authStore.user?.roles?.includes('System Manager')) {
    return true;
  }

  if (ifOwnerPermission.value) {
    return doc.owner === authStore.user?.email;
  } else {
    return docTypePermissions.value?.write === 1;
  }
  return false;
};

const handleImageClick = (doc: Document, fieldname: string) => {
  if (isMobile.value) {
    router.push(`/documents/${route.params.id}/${doc.name}/images`);
  } else {
    selectedDocument.value = doc;
    selectedFieldname.value = fieldname;
    showImageModal.value = true;
  }
};

const handleSingleImageClick = (doc: Document, fieldname: string) => {
  if (isMobile.value) {
    // Route to the single image view page
    router.push(`/documents/${route.params.id}/${doc.name}/image/${fieldname}`);
  } else {
    selectedDocument.value = doc;
    selectedFieldname.value = fieldname;
    showImageModal.value = true;
  }
};

const getFileIcon = (filename: string) => {
  if (!filename) return FileIcon;
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return FileImageIcon;
    case 'pdf':
      return PdfIcon;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return FileCodeIcon;
    case 'doc':
    case 'docx':
    case 'txt':
      return FileDocIcon;
    case 'zip':
    case 'rar':
    case '7z':
      return FileArchiveIcon;
    case 'mp4':
    case 'avi':
    case 'mov':
      return FileVideoIcon;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return FileAudioIcon;
    case 'js':
    case 'ts':
    case 'html':
    case 'css':
    case 'json':
      return FileCodeIcon;
    default:
      return FileIcon;
  }
};

// Add these helper functions after getFileIcon and before onMounted
const isImageFile = (filename: string): boolean => {
  if (!filename) return false;
  const extension = filename.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '');
};

const handleFileClick = (fileUrl: string) => {
  const fullUrl = fileUrl.startsWith('/files/') 
    ? `${getErpNextApiUrl()}${fileUrl}`
    : fileUrl;
  window.open(fullUrl, '_blank');
};

const handleSignatureClick = (signatureData: string) => {
  // Open signature in a new tab for better viewing
  const newTab = window.open();
  if (newTab) {
    newTab.document.write(`
      <html>
        <head>
          <title>Signature View</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f3f4f6;
            }
            img {
              max-width: 100%;
              background: white;
              padding: 20px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
          </style>
        </head>
        <body>
          <img src="${signatureData}" alt="Signature" />
        </body>
      </html>
    `);
  }
};

const formatDate = (date: string) => {
  if (!date) return 'N/A';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date:', date);
      return 'N/A';
    }
    
    return parsedDate.toLocaleDateString('en-AU', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (err) {
    console.warn('Error formatting date:', err);
    return 'N/A';
  }
};

const handleFilterSelect = (filter: SavedFilter) => {
  if (!filter) return;
  
  try {
    selectedFilter.value = filter;
    const filterConditions = JSON.parse(filter.filters || '[]') as string[][];

    // Reset all existing field searches
    fieldSearches.value = Object.fromEntries(
      filteredFields.value.map(field => [field.fieldname, ''])
    );

    // Process each filter condition
    filterConditions.forEach(condition => {
      if (condition.length >= 4) {
        const fieldname = condition[1];
        const value = condition[3];
        
        
        // Find the matching field and apply the value
        if (fieldSearches.value.hasOwnProperty(fieldname)) {
          // Remove any '%' characters and trim the value
          const cleanValue = value.replace(/%/g, '').trim();
          fieldSearches.value[fieldname] = cleanValue;
        }
      }
    });

    // Update debounced values immediately for saved filters
    debouncedFieldSearches.value = { ...fieldSearches.value };

    // Apply default status filter if not already set by the saved filter
    applyDefaultStatusFilter();

    console.log('Applied field searches:', fieldSearches.value);
    
    // Trigger a new search
    fetchDocuments(1);
    updateURLWithSearchParams();
  } catch (error) {
    console.error('Error applying filter:', error);
  }
};

const clearSelectedFilter = () => {
  selectedFilter.value = null;
  fieldSearches.value = {};
  debouncedFieldSearches.value = {};
  
  // Apply default status filter after clearing
  applyDefaultStatusFilter();
  
  fetchDocuments(1);
  updateURLWithSearchParams();
};

const handleDeleteFilter = async () => {
  if (!filterToDelete.value) return;
  
  try {
    await deleteItem('List Filter', filterToDelete.value.name);
    
    // Remove the filter from the list
    savedFilters.value = savedFilters.value.filter(f => f.name !== filterToDelete.value?.name);
    
    // If the deleted filter was selected, clear the selection
    if (selectedFilter.value?.name === filterToDelete.value.name) {
      clearSelectedFilter();
    }
    
    // Close the modal
    showDeleteModal.value = false;
    filterToDelete.value = null;
  } catch (error) {
    console.error('Error deleting filter:', error);
  }
};

const openDeleteModal = (filter: SavedFilter) => {
  filterToDelete.value = filter;
  showDeleteModal.value = true;
};

const handleSaveFilter = async () => {
  if (!newFilterName.value.trim()) return;

  try {
    // Create filter conditions array from current field searches
    const filterConditions = Object.entries(fieldSearches.value)
      .filter(([_, value]) => value) // Only include non-empty searches
      .map(([fieldname, value]) => [
        route.params.id as string,
        fieldname,
        'like',
        `%${value}%`
      ]);

    if (filterConditions.length === 0) {
      console.warn('No filter conditions to save');
      return;
    }

    const newFilter = {
      doctype: "List Filter",
      reference_doctype: route.params.id as string,
      filter_name: newFilterName.value.trim(),
      for_user: authStore.user?.email || '',
      filters: JSON.stringify(filterConditions)
    };

    const response = await insertItem(newFilter);
    console.log('Filter saved:', response);

    // Add the new filter to the list
    if (response.message) {
      savedFilters.value.push({
        name: response.message.name,
        filter_name: newFilterName.value.trim(),
        for_user: authStore.user?.email || '',
        filters: JSON.stringify(filterConditions)
      });
    }

    // Clear the input and hide the save section
    newFilterName.value = '';
    showSaveFilter.value = false;
  } catch (error) {
    console.error('Error saving filter:', error);
  }
};

const showJsonModal = (data: any) => {
  jsonData.value = data;
  showJsonDataModal.value = true;
};

const shareCurrentURL = async () => {
  const url = window.location.href;
  const shareData = {
    title: docType.value?.name || 'Document Submissions',
    text: 'Check out these submissions!',
    url: url
  };

  try {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      showSuccessMessage.value = true;
      successMessage.value = 'Shared successfully!';
    } else {
      // Fallback to copying the URL
      await navigator.clipboard.writeText(url);
      showSuccessMessage.value = true;
      successMessage.value = 'URL copied to clipboard!';
    }
  } catch (error) {
    console.error('Error sharing:', error);
    // Fallback for older browsers
    try {
      const tempInput = document.createElement('input');
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showSuccessMessage.value = true;
      successMessage.value = 'URL copied to clipboard!';
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      showSuccessMessage.value = true;
      successMessage.value = 'Failed to copy URL';
    }
  }
  
  // Hide success message after 3 seconds
  setTimeout(() => {
    showSuccessMessage.value = false;
    successMessage.value = '';
  }, 3000);
};

// Add this helper function after the existing helper functions and before onMounted
const parseSelectOptions = (options: string): string[] => {
  if (!options) return [];
  
  // Split by newlines and filter out empty strings
  return options
    .split('\n')
    .map(option => option.trim())
    .filter(option => option.length > 0);
};

// Helper function to apply default status filter
const applyDefaultStatusFilter = () => {
  if (filteredFields.value) {
    const statusField = filteredFields.value.find(field => 
      field.fieldname === 'status' && field.fieldtype === 'Select'
    );
    console.log('Status Field:', statusField);
    
    if (statusField) {
      // Check if "Completed" is available in the options
      const options = parseSelectOptions(statusField.options || '');
      console.log(options.includes('Completed') || options.includes('Active'));
      
      if (options.includes('Completed') || options.includes('Active')) {
        // Set to "Completed" if no status value exists or if it's empty
        const currentStatus = fieldSearches.value.status;
        if (!currentStatus || currentStatus.trim() === '') {
          if (options.includes('Completed')) {
            fieldSearches.value.status = 'Completed';
            debouncedFieldSearches.value.status = 'Completed';
            return true; // Indicate that a default filter was applied
          } else if (options.includes('Active')) {
            fieldSearches.value.status = 'Active';
            debouncedFieldSearches.value.status = 'Active';
            return true; // Indicate that a default filter was applied
          }
        }
      }
    }
  }
  return false; // No default filter was applied
};

// Add this computed property after the filteredDocuments computed
const displayCount = computed(() => {
  if (debouncedSearchQuery.value && debouncedSearchQuery.value.length >= MIN_SEARCH_LENGTH) {
    // For client-side search, use the filtered documents count
    return filteredDocuments.value.length;
  }
  // For server-side search, use the total items count
  return totalItems.value;
});

// Add column resize functions
const initializeColumnWidths = () => {
  if (!docType.value) return;
  
  const newWidths: Record<string, number> = {
    actions: 150, // Fixed width for actions column
  };
  
  // Add dynamic widths for each field
  docType.value.fields
    .filter(f => !(f.label && f.label.toLowerCase().includes('[action]')))
    .forEach(field => {
      // Set default width based on field type and label length
      let defaultWidth = 200;
      
      if (field.fieldtype === 'Attach' || field.fieldtype === 'Attach Image') {
        defaultWidth = 120;
      } else if (field.fieldtype === 'Table') {
        defaultWidth = 120;
      } else if (field.fieldtype === 'Signature') {
        defaultWidth = 200;
      } else if (field.label && field.label.length > 20) {
        defaultWidth = 250;
      } else if (field.label && field.label.length < 10) {
        defaultWidth = 150;
      }
      
      newWidths[field.fieldname] = defaultWidth;
    });
  
  columnWidths.value = newWidths;
};

const startResize = (columnKey: string, event: MouseEvent) => {
  isResizing.value = true;
  resizingColumn.value = columnKey;
  startX.value = event.clientX;
  startWidth.value = columnWidths.value[columnKey] || 200;
  
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = 'col-resize';
  document.body.classList.add('table-resizing');
  event.preventDefault();
};

const handleResize = (event: MouseEvent) => {
  if (!isResizing.value || !resizingColumn.value) return;
  
  const deltaX = event.clientX - startX.value;
  const newWidth = Math.max(80, startWidth.value + deltaX); // Minimum width of 80px
  columnWidths.value[resizingColumn.value] = newWidth;
};

const stopResize = () => {
  isResizing.value = false;
  resizingColumn.value = null;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = 'default';
  document.body.classList.remove('table-resizing');
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }

  const mediaQuery = window.matchMedia('(max-width: 768px)');
  mediaQueryMatches.value = mediaQuery.matches;
  
  // Set default view mode based on screen size
  viewMode.value = mediaQuery.matches ? 'grid' : 'list';
  
  const handleResize = (e: MediaQueryListEvent) => {
    mediaQueryMatches.value = e.matches;
    // Update view mode when screen size changes
    if (e.matches && viewMode.value === 'list') {
      viewMode.value = 'grid';
    } else if (!e.matches && viewMode.value === 'grid') {
      viewMode.value = 'list';
    }
  };
  
  mediaQuery.addEventListener('change', handleResize);
  
  // Add browser navigation event listener
  window.addEventListener('popstate', handleBrowserNavigation);
  
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleResize);
    window.removeEventListener('popstate', handleBrowserNavigation);
    // Clear any pending timeouts
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    if (fieldSearchTimeout) {
      clearTimeout(fieldSearchTimeout);
    }
    // Cleanup resize event listeners
    if (isResizing.value) {
      stopResize();
    }
  });
  
  // Get saved filters for this doctype
  try {
    const filtersResponse = await getReportView({
      reference_doctype: route.params.id as string,
      for_user: authStore.user?.email
    });
    savedFilters.value = filtersResponse.message || [];
    console.log('Saved Filters:', savedFilters.value);
  } catch (error) {
    console.error('Error fetching saved filters:', error);
  }
  
  await fetchDocType();
  
  // Load search parameters from URL first
  loadSearchParamsFromURL();
  
  // Set default status filter to "Completed" if status field exists and no status in URL
  const defaultFilterApplied = applyDefaultStatusFilter();
  
  // Show filters if there are URL parameters
  if (hasURLSearchParams()) {
    showFilters.value = true;
  }
  
  // If a default filter was applied, we need to fetch documents with that filter
  // Otherwise, just fetch documents normally
  await fetchDocuments();
});
</script>

<style scoped>
/* Prevent text selection during resize */
.table-resizing {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Custom resize handle styles */
.resize-handle {
  transition: background-color 0.2s ease;
}

.resize-handle:hover {
  background-color: rgba(59, 130, 246, 0.3);
}

.resize-handle:active {
  background-color: rgba(59, 130, 246, 0.5);
}
</style> 