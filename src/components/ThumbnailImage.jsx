import React from "react";

// A component to display a thumbnail image from a YouTube URL or a default image.
export default function ThumbnailImage({
  youtubeUrl,
  alt = "Thumbnail",
  className = "",
}) {
  let src = "/music%20note.jpg"; // fallback

  if (youtubeUrl) {
    const match = youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    const videoId = match?.[1];
    if (videoId) {
      src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  const defaultClasses = "object-cover rounded";
  const hasWidth = /\bw-\d+\b/.test(className);
  const hasHeight = /\bh-\d+\b/.test(className);

  return (
    <img
      src={src}
      alt={alt}
      className={`${defaultClasses} ${hasWidth ? "" : "w-16"} ${
        hasHeight ? "" : "h-16"
      } ${className}`}
      loading="lazy"
    />
  );
}
