import { defineStore } from 'pinia';

interface SuccessState {
  message: string;
}

export const useSuccessStore = defineStore('success', {
  state: (): SuccessState => ({
    message: '',
  }),
  actions: {
    showSuccess(message: string) {
      this.message = message;
    },
    clearSuccess() {
      this.message = '';
    },
  },
}); 