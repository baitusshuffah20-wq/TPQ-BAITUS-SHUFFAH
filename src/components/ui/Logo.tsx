"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "@/components/providers/SettingsProvider";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: "light" | "dark";
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  width = 150,
  height = 50,
  variant = "light",
}) => {
  const { settings, isLoading } = useSettings();

  // Calculate appropriate size for loading state and fallback
  const size = Math.min(width, height);
  const iconSize = Math.max(Math.floor(size * 0.6), 4); // Ensure icon is at least 4px

  if (isLoading) {
    return (
      <div
        className={`bg-gray-200 animate-pulse rounded-lg ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      ></div>
    );
  }

  return (
    <Link href="/" className={`block ${className}`}>
      {settings.system.logo && settings.system.logo !== "/logo.png" ? (
        <Image
          src={settings.system.logo}
          alt={settings.system.siteName}
          width={width}
          height={height}
          className="max-w-full"
          style={{
            objectFit: "contain",
            width: "auto",
            height: "auto",
            maxWidth: `${width}px`,
            maxHeight: `${height}px`
          }}
          priority
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-lg ${variant === "dark" ? "bg-teal-400" : "bg-teal-600"}`}
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
            style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      )}
    </Link>
  );
};

export default Logo;
