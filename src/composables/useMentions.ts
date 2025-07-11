import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { getNamesForMentions } from '../services/erpnext';

export function useMentions(handleValueUpdate: (value: any) => void, isFieldReadOnly: () => boolean) {
  // Mention functionality reactive state
  const showMentionDropdown = ref(false);
  const mentionQuery = ref('');
  const mentionResults = ref<any[]>([]);
  const loadingMentions = ref(false);
  const mentionCursorPosition = ref(0);
  const mentionStartPosition = ref(0);
  const longTextRef = ref<HTMLTextAreaElement | null>(null);

  // Handle mention input detection and API call
  const handleLongTextInput = async (event: Event) => {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    const cursorPosition = textarea.selectionStart || 0;
    
    // First, update the model value
    handleValueUpdate(value);
    
    // Check if user typed "@" and get the current word being typed
    const textUpToCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textUpToCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if the @ is at the start or preceded by whitespace
      const charBeforeAt = lastAtIndex > 0 ? textUpToCursor[lastAtIndex - 1] : ' ';
      const isValidMentionStart = /\s/.test(charBeforeAt) || lastAtIndex === 0;
      
      if (isValidMentionStart) {
        const mentionText = textUpToCursor.substring(lastAtIndex + 1);
        
        // Check if there's no space after @ (meaning we're still typing the mention)
        if (!mentionText.includes(' ') && !mentionText.includes('\n')) {
          mentionQuery.value = mentionText;
          mentionStartPosition.value = lastAtIndex;
          mentionCursorPosition.value = cursorPosition;
          
          // Call the API to get names for mentions
          await searchMentions(mentionText);
          showMentionDropdown.value = true;
          return;
        }
      }
    }
    
    // Hide dropdown if conditions are not met
    showMentionDropdown.value = false;
  };

  // Search for mention names using the API
  const searchMentions = async (query: string) => {
    loadingMentions.value = true;
    
    try {
      const response = await getNamesForMentions({
        search_term: query,
        page_length: 10
      });
      
      console.log('Mention search response:', response);
      
      // Handle the response format - adjust based on actual API response structure
      if (response && response.message) {
        mentionResults.value = response.message;
      } else if (response && Array.isArray(response)) {
        mentionResults.value = response;
      } else {
        mentionResults.value = [];
      }
    } catch (error) {
      console.error('Error searching mentions:', error);
      mentionResults.value = [];
    } finally {
      loadingMentions.value = false;
    }
  };

  // Handle mention selection
  const selectMention = (mention: any) => {
    if (!longTextRef.value) return;
    
    const textarea = longTextRef.value;
    const currentValue = textarea.value;
    const mentionName = mention.value || mention.name || mention;
    
    // Replace the @query with @mentionName
    const beforeMention = currentValue.substring(0, mentionStartPosition.value);
    const afterMention = currentValue.substring(mentionCursorPosition.value);
    const newValue = beforeMention + '@' + mentionName + ' ' + afterMention;
    
    // Update the value
    handleValueUpdate(newValue);
    
    // Set cursor position after the inserted mention
    nextTick(() => {
      const newCursorPosition = mentionStartPosition.value + mentionName.length + 2; // +2 for @ and space
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      textarea.focus();
    });
    
    // Hide dropdown
    showMentionDropdown.value = false;
    mentionQuery.value = '';
    mentionResults.value = [];
  };

  // Handle keyboard navigation in mention dropdown
  const handleMentionKeydown = (event: KeyboardEvent) => {
    if (!showMentionDropdown.value || mentionResults.value.length === 0) return;
    
    if (event.key === 'Escape') {
      showMentionDropdown.value = false;
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      // Could implement arrow navigation here if needed
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      // Could implement arrow navigation here if needed
      event.preventDefault();
    } else if (event.key === 'Enter') {
      // Select first mention on Enter
      if (mentionResults.value.length > 0) {
        selectMention(mentionResults.value[0]);
        event.preventDefault();
      }
    }
  };

  // Close dropdown when clicking outside
  const handleMentionClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.mention-container')) {
      showMentionDropdown.value = false;
    }
  };

  // Setup and cleanup
  const setupMentionListeners = () => {
    document.addEventListener('click', handleMentionClickOutside);
  };

  const cleanupMentionListeners = () => {
    document.removeEventListener('click', handleMentionClickOutside);
    // Clean up mention state
    showMentionDropdown.value = false;
    mentionResults.value = [];
    mentionQuery.value = '';
  };

  return {
    // Reactive state
    showMentionDropdown,
    mentionQuery,
    mentionResults,
    loadingMentions,
    longTextRef,
    
    // Methods
    handleLongTextInput,
    selectMention,
    handleMentionKeydown,
    setupMentionListeners,
    cleanupMentionListeners
  };
} 