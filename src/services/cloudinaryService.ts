const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'your_unsigned_preset'; 

export async function uploadImage(file: File): Promise<string> {
  
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to upload image');
  const data = await res.json();
  return data.secure_url; // this is the image URL
}

// Optionally, you can create a helper to get a transformed image URL
export function getImageUrl(publicId: string, options?: { width?: number; height?: number; crop?: string }) {
  let url = `https://res.cloudinary.com/${cloudName}/image/upload/`;
  if (options) {
    const params = [];
    if (options.width) params.push(`w_${options.width}`);
    if (options.height) params.push(`h_${options.height}`);
    if (options.crop) params.push(`c_${options.crop}`);
    if (params.length) url += params.join(',') + '/';
  }
  url += publicId;
  return url;
}