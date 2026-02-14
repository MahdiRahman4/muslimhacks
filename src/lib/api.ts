const rawApiBaseUrl = import.meta.env.VITE_API_URL || '';
const apiBaseUrl = rawApiBaseUrl.endsWith('/')
  ? rawApiBaseUrl.slice(0, -1)
  : rawApiBaseUrl;

export const SUBSCRIBE_ENDPOINT = `${apiBaseUrl}/api/subscribe`;
