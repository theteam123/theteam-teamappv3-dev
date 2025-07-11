interface CapturedError {
  timestamp: string;
  type: 'error' | 'warn' | 'log';
  message: string;
  source?: string;
  line?: number;
  column?: number;
  stack?: string;
  url?: string;
}

class ErrorCapture {
  private errors: CapturedError[] = [];
  private maxErrors = 50; // Limit to prevent memory issues

  constructor() {
    this.clearErrors(); // Clear any existing errors on page load
    this.setupErrorCapture();
  }

  private setupErrorCapture() {
    // Capture JavaScript runtime errors
    window.addEventListener('error', (event) => {
      this.addError({
        timestamp: new Date().toISOString(),
        type: 'error',
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        url: window.location.href
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addError({
        timestamp: new Date().toISOString(),
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href
      });
    });

    // Override console methods to capture console errors and warnings
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    console.error = (...args) => {
      this.addError({
        timestamp: new Date().toISOString(),
        type: 'error',
        message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
        url: window.location.href
      });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.addError({
        timestamp: new Date().toISOString(),
        type: 'warn',
        message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
        url: window.location.href
      });
      originalWarn.apply(console, args);
    };

    // Optionally capture console.log for debugging (commented out by default)
    // console.log = (...args) => {
    //   this.addError({
    //     timestamp: new Date().toISOString(),
    //     type: 'log',
    //     message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
    //     url: window.location.href
    //   });
    //   originalLog.apply(console, args);
    // };
  }

  public addError(error: CapturedError) {
    // Add to the beginning of the array (most recent first)
    this.errors.unshift(error);
    
    // Limit the number of stored errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Store in localStorage
    this.storeErrors();
  }

  private storeErrors() {
    try {
      localStorage.setItem('capturedErrors', JSON.stringify(this.errors));
    } catch (e) {
      // If localStorage is full, remove oldest errors and try again
      this.errors = this.errors.slice(0, this.maxErrors / 2);
      try {
        localStorage.setItem('capturedErrors', JSON.stringify(this.errors));
      } catch (e2) {
        console.warn('Unable to store captured errors in localStorage');
      }
    }
  }

  public getErrorsAsJson(): string {
    const errorSummary = {
      captureTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      totalErrors: this.errors.length,
      errors: this.errors.map(error => ({
        timestamp: error.timestamp,
        type: error.type,
        message: error.message,
        source: error.source,
        line: error.line,
        column: error.column,
        stack: error.stack,
        url: error.url
      }))
    };

    return JSON.stringify(errorSummary, null, 2);
  }

  public clearErrors() {
    this.errors = [];
    localStorage.removeItem('capturedErrors');
  }

  public getErrorCount(): number {
    return this.errors.length;
  }
}

// Create a singleton instance
export const errorCapture = new ErrorCapture();

/**
 * Parse ERPNext/Frappe server error responses into user-friendly messages
 * @param error - The error object from the server response
 * @param defaultMessage - Default message to use if parsing fails
 * @returns Parsed and cleaned error message
 */
export const parseServerError = (error: any, defaultMessage: string = 'An error occurred'): string => {
  let errorMessage = defaultMessage;

  try {
    // Parse server messages if they exist
    if (error._server_messages) {
      try {
        const serverMessages = JSON.parse(error._server_messages);
        if (Array.isArray(serverMessages)) {
          // Join multiple messages if they exist and strip HTML tags
          errorMessage = serverMessages.map(msg => {
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
        errorMessage = error._server_messages.replace(/<[^>]*>/g, '');
      }
    }
    
    // Check for direct message property
    else if (error.message) {
      errorMessage = error.message.replace(/<[^>]*>/g, '');
    }
    
    // Check for response data message
    else if (error.response?.data?.message) {
      errorMessage = error.response.data.message.replace(/<[^>]*>/g, '');
    }
    
    // Check for response data _error_message
    else if (error.response?.data?._error_message) {
      errorMessage = error.response.data._error_message.replace(/<[^>]*>/g, '');
    }
    
    // Check for exc property (raw exception message)
    else if (error.exc) {
      errorMessage = error.exc.replace(/<[^>]*>/g, '');
    }
    
    // Add exception type if it exists
    if (error.exc_type && !errorMessage.includes(error.exc_type)) {
      errorMessage = `${error.exc_type}: ${errorMessage}`;
    }
  } catch (parseError) {
    console.warn('Error parsing server error:', parseError);
    // Fall back to default message if parsing completely fails
    errorMessage = defaultMessage;
  }

  return errorMessage.trim();
};

/**
 * Enhanced error handling wrapper that logs to error capture and returns parsed message
 * @param error - The error object
 * @param context - Context information about where the error occurred
 * @param defaultMessage - Default message if parsing fails
 * @returns Parsed error message
 */
export const handleServerError = (error: any, context: string, defaultMessage: string = 'An error occurred'): string => {
  const parsedMessage = parseServerError(error, defaultMessage);
  
  // Log the error with context
  console.error(`Error in ${context}:`, {
    originalError: error,
    parsedMessage,
    timestamp: new Date().toISOString()
  });
  
  // Add to error capture
  errorCapture.addError({
    timestamp: new Date().toISOString(),
    type: 'error',
    message: `${context}: ${parsedMessage}`,
    stack: error.stack,
    url: window.location.href
  });
  
  return parsedMessage;
};

// Export functions for easy use
export const getErrorsAsJson = () => errorCapture.getErrorsAsJson();
export const clearCapturedErrors = () => errorCapture.clearErrors();
export const getCapturedErrorCount = () => errorCapture.getErrorCount(); 