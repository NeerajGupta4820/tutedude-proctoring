// utils/cloudinaryUpload.js
import cloudinary from '../config/cloudinary.js';

// Upload buffer to Cloudinary
export const uploadToCloudinary = (
  fileBuffer,
  folder,
  resourceType = 'auto'
) => {
  return new Promise((resolve, reject) => {
    // Validate buffer
    if (!fileBuffer || fileBuffer.length === 0) {
      return reject(new Error('Empty file buffer'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        // Image optimization
        ...(resourceType === 'image' && {
          transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
        }),
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }

        console.log('✅ Cloudinary upload success:', result.secure_url);

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    // Send buffer
    uploadStream.end(fileBuffer);
  });
};

// Delete from Cloudinary using Public ID
export const deleteFromCloudinary = async (
  publicId,
  resourceType = 'image'
) => {
  try {
    if (!publicId) {
      console.log('No publicId provided, skipping delete');
      return { success: true };
    }

    console.log(`🗑️ Deleting from Cloudinary: ${publicId}`);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log('Delete result:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error: error.message };
  }
};

// Delete using URL (extracts public ID from URL)
export const deleteFromCloudinaryByUrl = async (
  url,
  resourceType = 'image'
) => {
  try {
    if (!url) return { success: true };

    // Extract public ID from URL
    // URL: https://res.cloudinary.com/xxx/image/upload/v123/tutedude/profile/photo-123.jpg
    // Public ID: tutedude/profile/photo-123

    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');

    if (uploadIndex === -1) {
      console.log('Invalid Cloudinary URL');
      return { success: false, error: 'Invalid URL' };
    }

    // Get path after version (v123)
    const pathParts = urlParts.slice(uploadIndex + 2); // Skip 'upload' and 'v123'
    const fullPath = pathParts.join('/');

    // Remove extension
    const publicId = fullPath.replace(/\.[^/.]+$/, '');

    console.log(`Extracted publicId: ${publicId}`);

    return await deleteFromCloudinary(publicId, resourceType);
  } catch (error) {
    console.error('Error extracting publicId:', error);
    return { success: false, error: error.message };
  }
};
