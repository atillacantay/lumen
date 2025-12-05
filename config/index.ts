// App Configuration
export const APP_CONFIG = {
  version: process.env.EXPO_PUBLIC_APP_VERSION,
};

// API Base URL - localhost for development, real URL for production
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 10000,
};

// Cloudinary Config
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
};
