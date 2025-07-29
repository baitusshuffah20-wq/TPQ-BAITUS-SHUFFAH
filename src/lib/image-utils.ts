/**
 * Utility functions for handling images and avatars
 */

/**
 * Check if a photo URL is valid and safe to display
 * @param photoUrl - The photo URL to validate
 * @returns boolean - true if the photo is valid and safe
 */
export function isValidPhotoUrl(photoUrl: string | null | undefined): boolean {
  if (!photoUrl) return false;

  // Skip base64 images as they're usually broken/incomplete
  if (photoUrl.startsWith("data:image/")) return false;

  // Only allow http/https URLs
  return photoUrl.startsWith("http://") || photoUrl.startsWith("https://");
}

/**
 * Get initials from a full name
 * @param fullName - The full name to extract initials from
 * @param fallback - Fallback character if name is empty
 * @returns string - The initials (max 2 characters)
 */
export function getInitials(
  fullName: string | null | undefined,
  fallback: string = "U",
): string {
  if (!fullName) return fallback;

  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate a fallback avatar URL using ui-avatars.com
 * @param name - The name to generate avatar for
 * @param backgroundColor - Background color (hex without #)
 * @param textColor - Text color (hex without #)
 * @returns string - The generated avatar URL
 */
export function generateFallbackAvatar(
  name: string | null | undefined,
  backgroundColor: string = "0d9488",
  textColor: string = "ffffff",
): string {
  const displayName = name || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${backgroundColor}&color=${textColor}&size=200`;
}

/**
 * Get the best available photo URL with fallbacks
 * @param primaryPhoto - Primary photo URL (e.g., from santri.photo)
 * @param secondaryPhoto - Secondary photo URL (e.g., from user.avatar)
 * @returns string | null - The best available photo URL or null if should show initials
 */
export function getBestPhotoUrl(
  primaryPhoto: string | null | undefined,
  secondaryPhoto: string | null | undefined,
): string | null {
  // Try primary photo first
  if (isValidPhotoUrl(primaryPhoto)) {
    return primaryPhoto!;
  }

  // Try secondary photo
  if (isValidPhotoUrl(secondaryPhoto)) {
    return secondaryPhoto!;
  }

  // Return null to show initials instead of generating fallback
  // This is better for performance and consistency
  return null;
}

/**
 * Props for image error handling
 */
export interface ImageErrorHandlerProps {
  onError: () => void;
  onLoad: () => void;
  style?: React.CSSProperties;
}

/**
 * Get props for handling image loading and errors
 * @param setImageError - Function to set image error state
 * @param setImageLoaded - Function to set image loaded state
 * @param imageLoaded - Current image loaded state
 * @returns ImageErrorHandlerProps
 */
export function getImageErrorHandlerProps(
  setImageError: (error: boolean) => void,
  setImageLoaded: (loaded: boolean) => void,
  imageLoaded: boolean,
): ImageErrorHandlerProps {
  return {
    onError: () => setImageError(true),
    onLoad: () => setImageLoaded(true),
    style: {
      display: imageLoaded ? "block" : "none",
    },
  };
}
