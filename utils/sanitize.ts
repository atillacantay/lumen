/**
 * Sanitization utilities to prevent XSS attacks
 * Removes potentially dangerous HTML/JavaScript from user input
 */

/**
 * Sanitize user input for storage
 * - Trim whitespace
 * - Remove dangerous characters/scripts
 * - Limit length
 */
export function sanitizeText(text: string, maxLength: number = 5000): string {
  if (!text || typeof text !== "string") return "";

  let sanitized = text
    // Trim whitespace
    .trim()
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove control characters except newlines/tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize author name
 * - Alphanumeric, spaces, hyphens, underscores only
 * - Max 50 characters
 */
export function sanitizeAuthorName(name: string): string {
  if (!name || typeof name !== "string") return "Anonymous";

  // Remove special characters, keep only alphanumeric, spaces, hyphens, underscores
  let sanitized = name
    .replace(/[^a-zA-Z0-9\s\-_]/g, "")
    .trim()
    .substring(0, 50);

  return sanitized || "Anonymous";
}

/**
 * Validate and sanitize category ID
 * Ensures it's a valid UUID-like string
 */
export function sanitizeCategoryId(id: string): string | null {
  if (!id || typeof id !== "string") return null;

  // Allow alphanumeric, hyphens, underscores (typical UUID format)
  if (!/^[a-zA-Z0-9\-_]+$/.test(id)) return null;

  // Max 50 chars (reasonable for IDs)
  if (id.length > 50) return null;

  return id;
}

/**
 * Validate title for posts
 * - Max 200 characters
 * - Not empty
 */
export function validateTitle(title: string): boolean {
  if (!title || typeof title !== "string") return false;
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= 200;
}

/**
 * Validate content/comment text
 * - Max 5000 characters
 * - Not empty
 */
export function validateContent(content: string): boolean {
  if (!content || typeof content !== "string") return false;
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length <= 5000;
}

/**
 * Validate image URL
 * - Must be valid URL
 * - Only allow http/https
 * - Not too long
 */
export function validateImageUrl(url?: string): boolean {
  if (!url) return true; // Optional field
  if (typeof url !== "string") return false;
  if (url.length > 2048) return false; // URL length limit

  try {
    const parsed = new URL(url);
    // Only allow http/https
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Composite sanitization for post creation
 */
export function sanitizePostInput(input: {
  title: string;
  content: string;
  categoryId: string;
  authorName: string;
  imageUrl?: string;
}): {
  title: string;
  content: string;
  categoryId: string;
  authorName: string;
  imageUrl?: string;
} | null {
  // Validate lengths first
  if (!validateTitle(input.title) || !validateContent(input.content)) {
    return null;
  }

  const categoryId = sanitizeCategoryId(input.categoryId);
  if (!categoryId) {
    return null;
  }

  if (!validateImageUrl(input.imageUrl)) {
    return null;
  }

  return {
    title: sanitizeText(input.title, 200),
    content: sanitizeText(input.content, 5000),
    categoryId,
    authorName: sanitizeAuthorName(input.authorName),
    imageUrl: input.imageUrl,
  };
}

/**
 * Composite sanitization for comment creation
 */
export function sanitizeCommentInput(input: {
  content: string;
  authorName: string;
}): {
  content: string;
  authorName: string;
} | null {
  if (!validateContent(input.content)) {
    return null;
  }

  return {
    content: sanitizeText(input.content, 5000),
    authorName: sanitizeAuthorName(input.authorName),
  };
}
