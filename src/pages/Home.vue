<template>
  <div class="p-8">
    <div class="flex flex-col items-center space-y-6">
      <img 
        :src="logo" 
        alt="App Logo" 
        class="h-12" 
      />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
        <h2>Welcome to the Home Page</h2>
      </div>
      <div class="max-w-xl w-full">
        <div class="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <SearchIcon class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ClipboardIcon, UsersIcon, BuildingIcon, ShieldIcon, SearchIcon } from 'lucide-vue-next';
import { getLogo } from '../config/domains';

const logo = computed(() => getLogo());
</script>