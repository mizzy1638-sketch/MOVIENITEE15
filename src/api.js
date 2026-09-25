/**
 * API configuration and client utilities for Cloudflare R2 operations
 * Compatible with local dev, GitHub Pages, and Netlify production.
 */

export const getApiBaseUrl = () => {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? String(import.meta.env.VITE_API_BASE_URL).trim()
    : '';

  // If envUrl is valid and not mistakenly set to the GitHub Pages frontend URL, use it
  if (envUrl && !envUrl.includes('github.io')) {
    return envUrl.replace(/\/+$/, '');
  }

  // When hosted on GitHub Pages or if envUrl was pointing to github.io, use the secure Netlify backend
  if ((typeof window !== 'undefined' && window.location.hostname.includes('github.io')) || (envUrl && envUrl.includes('github.io'))) {
    return 'https://movienitee.netlify.app';
  }

  // In local development or Netlify hosting, relative paths work directly
  return '';
};

/**
 * Request a presigned PUT upload URL for direct client-to-R2 upload
 */
export async function getUploadUrl({ fileName, fileType, fileCategory, id }) {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/.netlify/functions/get-upload-url`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName,
      fileType: fileType || 'video/mp4',
      fileCategory,
      id,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to get upload URL (status ${response.status})`);
  }

  return await response.json();
}

/**
 * Request deletion of an object in Cloudflare R2 storage
 */
export async function deleteR2Object(key) {
  if (!key) return;
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/.netlify/functions/delete-r2-object`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to delete R2 object:', error);
    return false;
  }
}
