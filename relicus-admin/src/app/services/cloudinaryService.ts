/**
 * Cloudinary Media & Document Upload Service for Relicus Admin
 * Bypasses database/backend storage limits by leveraging Cloudinary CDN.
 */

const CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'relicus';
const UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'relicus_unsigned';

export interface CloudinaryUploadResult {
  secureUrl: string;
  url: string;
  bytes: number;
  format: string;
  originalFilename: string;
  pages?: number;
  publicId: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function uploadFileToCloudinary(
  file: File,
  options?: {
    folder?: string;
    resourceType?: 'auto' | 'image' | 'raw';
    onProgress?: (percent: number) => void;
  }
): Promise<CloudinaryUploadResult> {
  const resourceType = options?.resourceType || 'auto';
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (options?.folder) {
    formData.append('folder', options.folder);
  }

  // Use XMLHttpRequest if progress callback is needed, or fetch
  if (options?.onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress?.(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              secureUrl: data.secure_url,
              url: data.url,
              bytes: data.bytes || file.size,
              format: data.format || file.name.split('.').pop() || '',
              originalFilename: data.original_filename || file.name,
              pages: data.pages,
              publicId: data.public_id,
            });
          } catch (e: any) {
            reject(new Error('Invalid response from Cloudinary upload'));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData?.error?.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload to Cloudinary'));
      xhr.send(formData);
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Upload failed with status ${response.status}`);
  }

  return {
    secureUrl: data.secure_url,
    url: data.url,
    bytes: data.bytes || file.size,
    format: data.format || file.name.split('.').pop() || '',
    originalFilename: data.original_filename || file.name,
    pages: data.pages,
    publicId: data.public_id,
  };
}
