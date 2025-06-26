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

  private addError(error: CapturedError) {
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

// Export functions for easy use
export const getErrorsAsJson = () => errorCapture.getErrorsAsJson();
export const clearCapturedErrors = () => errorCapture.clearErrors();
export const getCapturedErrorCount = () => errorCapture.getErrorCount(); 