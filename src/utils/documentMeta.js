import { getDomainConfig } from '../config/domains';

export function updateDocumentMeta() {
  const config = getDomainConfig();
  
  // Update favicon
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    favicon.href = config.ico;
  }
  
  // Update title
  document.title = `${config.key} - TheTeam App`;
} 