import { defineStore } from 'pinia';

export const useErrorStore = defineStore('error', {
  state: () => ({
    message: '',
    type: 'error' // 'error', 'warning', etc.
  }),
  
  actions: {
    setError(message: string, type: string = 'error') {
      this.$patch({
        message,
        type
      });
    },
    
    clearError() {
      this.$patch({
        message: '',
        type: ''
      });
    }
  }
}); 