"use client";

import { Avatar } from "components/ub/data/media/Avatar";
import PresignedImage from "components/ub/data/media/PresignedImage";

/**
 * A 40px round logo for records whose image is a stored file key (universities,
 * logistics providers, program cards): the presigned logo, else initials on neutral.
 */
export default function UniversityLogo({
  name,
  fileKey,
}: {
  name: string;
  fileKey?: string | null;
}) {
  const fallback = <Avatar name={name} size={40} alt="" />;
  return (
    <PresignedImage
      fileKey={fileKey || undefined}
      alt=""
      fallback={fallback}
      renderImage={(src) => <Avatar name={name} src={src} size={40} alt="" />}
    />
  );
}

/** Status for EntityCell's circle. Hidden wins over active: a hidden university is out of the Advisors' catalogue. */
export function universityStatus(university: {
  is_active?: boolean;
  is_hidden?: boolean;
}) {
  return university.is_hidden
    ? { status: "inactive", label: "Hidden" }
    : { status: university.is_active !== false };
}
