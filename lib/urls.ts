export const isLocal = process.env.NODE_ENV === 'development';

export const SERVICE_URLS = {
  docs: process.env.NEXT_PUBLIC_DOCS_URL || '',
  community: process.env.NEXT_PUBLIC_COMMUNITY_URL || '',
  dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL || '',
  builder: process.env.NEXT_PUBLIC_BUILDER_URL || '',
};
