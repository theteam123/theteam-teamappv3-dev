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
        <DocTypeSearch @resultClick="handleResultClick" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getLogo } from '../config/domains';
import DocTypeSearch from '../components/DocTypeSearch.vue';

const logo = computed(() => getLogo());

const handleResultClick = (result) => {
  console.log('Selected doctype:', result);
};
</script>