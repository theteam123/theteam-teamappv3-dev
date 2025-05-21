<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 text-center">Voice Assistant</h1>
        <p class="mt-2 text-gray-600 text-center">Your AI-powered voice assistant to help you with tasks and queries.</p>
      </div>

      <!-- Main Content -->
      <div class="p-6">
        <!-- Voice Input Section -->
        <div class="flex flex-col items-center justify-center space-y-6 py-8 relative h-[400px]">
          <!-- ElevenLabs Convai Widget -->
          <elevenlabs-convai 
            agent-id="nvCfkohvM6jdPDYsmxtn"
            class="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 z-50"
          ></elevenlabs-convai>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// Function to load the ElevenLabs script
const loadElevenLabsScript = () => {
  const script = document.createElement('script');
  script.src = 'https://elevenlabs.io/convai-widget/index.js';
  script.async = true;
  script.type = 'text/javascript';
  document.body.appendChild(script);
};

// Load the script when the component mounts
onMounted(() => {
  loadElevenLabsScript();
});
</script>

<style scoped>
/* Custom styles for the widget */
:deep(elevenlabs-convai) {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  transform: translate(-50%, -50%);
  z-index: 50;
}
</style> 