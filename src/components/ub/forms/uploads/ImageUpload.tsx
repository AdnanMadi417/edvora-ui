"use client";

import UploadField, { type UploadFieldProps } from "./UploadField";

export type ImageUploadProps = Omit<UploadFieldProps, "imageOnly">;

/** Image picker with local preview, replacement, removal and URL cleanup. */
export default function ImageUpload(props: ImageUploadProps) {
  return (
    <UploadField
      {...props}
      imageOnly
      accept={props.accept ?? [".png", ".jpg", ".jpeg"]}
    />
  );
}
