import { getTheme } from '../config/domains';

/**
 * Initialize theme colors based on the current domain
 */
export function initializeTheme() {
  const theme = getTheme();
  
  // Set CSS variables
  document.documentElement.style.setProperty('--color-primary', theme.primary);
  document.documentElement.style.setProperty('--color-secondary', theme.secondary);
  document.documentElement.style.setProperty('--color-accent', theme.accent);
} 