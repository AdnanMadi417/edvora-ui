import React, { useEffect, useState } from "react";
import { getDocumentDownloadUrl } from "services/documentService";

interface PresignedImageProps {
  fileKey?: string;
  alt?: string;
  className?: string;
  fallback: React.ReactNode;
  renderImage?: (src: string) => React.ReactNode;
}

const PresignedImage = ({ fileKey, alt, className, fallback, renderImage }: PresignedImageProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileKey) return;
    getDocumentDownloadUrl(fileKey)
      .then(setSrc)
      .catch(() => setError(true));
  }, [fileKey]);

  if (!fileKey || error || !src) return <>{fallback}</>;

  if (renderImage) return <>{renderImage(src)}</>;

  return (
    // Presigned links change per request and expire, so next/image can't optimise or cache them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default PresignedImage;
