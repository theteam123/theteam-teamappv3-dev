<template>
  <div class="p-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Forms & Records -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-start">
          <ClipboardIcon class="w-8 h-8 text-green-600 mr-4" />
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Forms & Records</h2>
            <p class="text-gray-600 mt-1">Access and manage all your forms and records in one place.</p>
          </div>
        </div>
      </div>

      <!-- User Management -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-start">
          <UsersIcon class="w-8 h-8 text-green-600 mr-4" />
          <div>
            <h2 class="text-xl font-semibold text-gray-900">User Management</h2>
            <p class="text-gray-600 mt-1">Manage user accounts, roles, and permissions.</p>
          </div>
        </div>
      </div>

      <!-- Company Management -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-start">
          <BuildingIcon class="w-8 h-8 text-green-600 mr-4" />
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Company Management</h2>
            <p class="text-gray-600 mt-1">Organize and manage company information.</p>
          </div>
        </div>
      </div>

      <!-- Role Management -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-start">
          <ShieldIcon class="w-8 h-8 text-green-600 mr-4" />
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Role Management</h2>
            <p class="text-gray-600 mt-1">Configure roles and their associated permissions.</p>
          </div>
        </div>
      </div>
    </div>

    <p class="text-gray-500 text-sm mt-8">
      Need help? Contact your administrator for assistance.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ClipboardIcon, UsersIcon, BuildingIcon, ShieldIcon } from 'lucide-vue-next'
</script>