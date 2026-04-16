import React, { useEffect, useState } from "react";
import { getDocumentDownloadUrl } from "services/documentService";

interface PresignedImageProps {
  fileKey: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}

const PresignedImage = ({ fileKey, alt, className, fallback }: PresignedImageProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileKey) return;
    getDocumentDownloadUrl(fileKey)
      .then(setSrc)
      .catch(() => setError(true));
  }, [fileKey]);

  if (!fileKey || error || !src) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default PresignedImage;
