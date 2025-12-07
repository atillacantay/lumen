import { CLOUDINARY_CONFIG } from "@/config";
import { errorLogger } from "@/services/error-logger";

export const uploadImage = async (imageUri: string): Promise<string | null> => {
  try {
    const formData = new FormData();

    const filename = imageUri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("file", {
      uri: imageUri,
      name: filename,
      type,
    } as any);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", CLOUDINARY_CONFIG.folderName);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url || null;
  } catch (error) {
    await errorLogger.logError(error, {
      action: "uploadImage",
      screen: "CreatePost",
    });
    return null;
  }
};
