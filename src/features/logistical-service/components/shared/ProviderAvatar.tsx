"use client";

import { Avatar } from "components/ub/data/media/Avatar";
import PresignedImage from "components/ub/data/media/PresignedImage";
import type { ServiceProvider } from "features/logistical-service/types";

/**
 * The provider's 40px round logo: a fresh presigned link for the stored file,
 * else the saved URL, else initials on neutral.
 */
export default function ProviderAvatar({
  provider,
}: {
  provider: Pick<ServiceProvider, "name" | "picture_file_key" | "picture_file_url">;
}) {
  const saved = <Avatar name={provider.name} src={provider.picture_file_url || undefined} size={40} alt="" />;
  return (
    <PresignedImage
      fileKey={provider.picture_file_key || undefined}
      alt=""
      fallback={saved}
      renderImage={(src) => <Avatar name={provider.name} src={src} size={40} alt="" />}
    />
  );
}
