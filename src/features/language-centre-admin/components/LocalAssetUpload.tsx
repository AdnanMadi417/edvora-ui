"use client";
import { useState } from "react";
import UploadField from "components/ub/forms/uploads/UploadField";
import type { CentreAsset } from "../model/types";
export default function LocalAssetUpload({
  label,
  asset,
  onChange,
  pdf = false,
  onBusy,
}: {
  label: string;
  asset: CentreAsset | null;
  onChange: (asset: CentreAsset | null) => void;
  pdf?: boolean;
  onBusy: (busy: boolean) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <UploadField
      label={label}
      description={
        pdf
          ? "PDF up to 1 MB. Saved in this browser."
          : "PNG, JPEG or WebP up to 1 MB. Saved in this browser."
      }
      file={null}
      existingUrl={asset?.url}
      accept={
        pdf ? ["application/pdf"] : ["image/png", "image/jpeg", "image/webp"]
      }
      imageOnly={!pdf}
      maxSizeMb={1}
      uploading={busy}
      disabled={busy}
      error={error}
      onError={setError}
      onRemove={() => onChange(null)}
      onExistingRemove={() => onChange(null)}
      onFileChange={async (file) => {
        if (
          file.size > 1024 * 1024 ||
          !(pdf
            ? file.type === "application/pdf"
            : ["image/png", "image/jpeg", "image/webp"].includes(file.type))
        ) {
          setError("Choose a supported file no larger than 1 MB.");
          return;
        }
        setBusy(true);
        onBusy(true);
        setError("");
        try {
          const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
          const text = String.fromCharCode(...bytes);
          const valid = pdf
            ? text.startsWith("%PDF-")
            : file.type === "image/png"
            ? [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
            : file.type === "image/jpeg"
            ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            : text.startsWith("RIFF") && text.slice(8, 12) === "WEBP";
          if (!valid)
            throw new Error(
              "The file does not match its format. Choose another file."
            );
          const url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () =>
              reject(new Error("Unable to read this file."));
            reader.readAsDataURL(file);
          });
          onChange({ name: file.name, url });
        } catch (failure) {
          setError(
            failure instanceof Error ? failure.message : "Upload failed."
          );
        } finally {
          setBusy(false);
          onBusy(false);
        }
      }}
    />
  );
}
