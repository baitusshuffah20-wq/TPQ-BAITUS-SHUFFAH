"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  photo?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  bgColor?: string;
  textColor?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  photo,
  size = "md",
  className,
  bgColor = "bg-gray-100",
  textColor = "text-gray-600",
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-20 h-20 text-2xl",
    "2xl": "w-32 h-32 text-4xl",
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if photo is valid
  const isValidPhoto = (photoUrl: string | null | undefined): boolean => {
    if (!photoUrl || typeof photoUrl !== 'string') return false;

    // Allow http/https URLs
    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) return true;

    // Allow local paths (starting with /)
    if (photoUrl.startsWith("/")) return true;

    // Validate base64 images more strictly
    if (photoUrl.startsWith("data:image/")) {
      try {
        const parts = photoUrl.split(',');
        if (parts.length !== 2) return false;

        const header = parts[0];
        const data = parts[1];

        // Check header format
        if (!header.includes('data:image/') || !header.includes('base64')) return false;

        // Check if base64 data is valid (basic check)
        if (!data || data.length === 0) return false;

        // Try to validate base64 format
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        return base64Regex.test(data);
      } catch (error) {
        console.error('Invalid data URL in UserAvatar:', error);
        return false;
      }
    }

    return false;
  };

  const shouldShowImage = photo && isValidPhoto(photo) && !imageError;

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center overflow-hidden relative",
        sizeClasses[size],
        className,
      )}
    >
      {shouldShowImage ? (
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
        />
      ) : null}

      {(!shouldShowImage || !imageLoaded) && (
        <div
          className={cn(
            "w-full h-full rounded-full flex items-center justify-center",
            bgColor,
          )}
        >
          <span className={cn("font-semibold", textColor)}>
            {getInitials(name)}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
