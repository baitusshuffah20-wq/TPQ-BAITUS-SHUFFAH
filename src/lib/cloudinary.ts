import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export async function uploadToCloudinary(
  file: Buffer,
  fileName: string,
  folder: string = 'rumah-tahfidz'
): Promise<UploadResult> {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: fileName,
          resource_type: 'auto',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file);
    });

    const uploadResult = result as any;
    
    return {
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: 'Failed to upload file'
    };
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

export async function uploadProfilePhoto(
  file: Buffer,
  userId: string
): Promise<UploadResult> {
  const fileName = `profile_${userId}_${Date.now()}`;
  return uploadToCloudinary(file, fileName, 'rumah-tahfidz/profiles');
}

export async function uploadSantriPhoto(
  file: Buffer,
  santriId: string
): Promise<UploadResult> {
  const fileName = `santri_${santriId}_${Date.now()}`;
  return uploadToCloudinary(file, fileName, 'rumah-tahfidz/santri');
}

export async function uploadDocument(
  file: Buffer,
  documentType: string,
  entityId: string
): Promise<UploadResult> {
  const fileName = `${documentType}_${entityId}_${Date.now()}`;
  return uploadToCloudinary(file, fileName, 'rumah-tahfidz/documents');
}

export async function uploadNewsImage(
  file: Buffer,
  newsId: string
): Promise<UploadResult> {
  const fileName = `news_${newsId}_${Date.now()}`;
  return uploadToCloudinary(file, fileName, 'rumah-tahfidz/news');
}

// Helper function to extract public ID from Cloudinary URL
export function extractPublicId(cloudinaryUrl: string): string {
  const parts = cloudinaryUrl.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
}

// Helper function to generate optimized image URL
export function getOptimizedImageUrl(
  publicId: string,
  width?: number,
  height?: number,
  quality: string = 'auto'
): string {
  const transformations = [];
  
  if (width || height) {
    transformations.push(`w_${width || 'auto'},h_${height || 'auto'},c_fill`);
  }
  
  transformations.push(`q_${quality}`, 'f_auto');
  
  const transformString = transformations.join(',');
  
  return cloudinary.url(publicId, {
    transformation: transformString
  });
}

export default cloudinary;
