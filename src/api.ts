/**
 * MovieNite API Client
 * Cloudflare R2 Presigned Upload & Delete Operations
 */

export interface UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface GetUploadUrlParams {
  fileName: string;
  fileType?: string;
  fileCategory?: string;
  id?: string;
}

export const getApiBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return (import.meta.env.VITE_API_BASE_URL as string).replace(/\/+$/, '');
  }
  // When hosted on GitHub Pages or custom domain outside Netlify, fallback to production backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    return 'https://movienitee.netlify.app';
  }
  // In local dev or Netlify hosting, relative URLs are handled directly
  return '';
};

export async function getUploadUrl(params: GetUploadUrlParams): Promise<UploadUrlResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/.netlify/functions/get-upload-url`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: params.fileName,
      fileType: params.fileType || 'video/mp4',
      fileCategory: params.fileCategory,
      id: params.id,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to get upload URL (status ${response.status})`);
  }

  return await response.json();
}

export async function deleteR2Object(key: string): Promise<boolean> {
  if (!key) return false;
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
