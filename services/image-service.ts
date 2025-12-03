import { CLOUDINARY_CONFIG } from "@/config";

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
    formData.append("folder", "lumen");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    console.log("Cloudinary response:", data);

    return data.secure_url || null;
  } catch (error) {
    console.error("Image upload error:", error);
    return null;
  }
};
