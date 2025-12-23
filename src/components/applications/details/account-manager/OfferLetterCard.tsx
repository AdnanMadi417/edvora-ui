import { useState } from "react";
import { Download } from "lucide-react";
import { getDocumentDownloadUrl } from "services/documentService";
import {
  FaFilePdf,
} from "react-icons/fa";

interface OfferLetterDecisionProps {
  application: any;
}

export default function OfferLetterDecision({
  application,
}: OfferLetterDecisionProps) {
  const offerLetter = application?.offer_letter_document;

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (fileKey?: string) => {
    if (!fileKey || downloading) return;

    try {
      setDownloading(true);
      const downloadUrl = await getDocumentDownloadUrl(fileKey);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      alert("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (!offerLetter) return null;

  return (
    <section>
      <div className="mb-5 mt-5 space-y-4 rounded-lg border border-default bg-card p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200">
            <FaFilePdf className="text-lg text-blue-700" />
          </span>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              University Offer Letter
            </h3>
            <span
              className="mt-1 inline-flex text-sm text-text-muted items-center gap-2 rounded-full px-3 py-1 font-semibold">
              <FaFilePdf className="h-3 w-3" />
              Status {" "}
              {offerLetter.status}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-md border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <FaFilePdf className="text-2xl text-red-500" />
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">
                {offerLetter.file_key.split("/").pop()}
              </p>
              <p className="text-xs text-gray-500">
                PDF • Uploaded on{" "}
                {new Date(offerLetter.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload(offerLetter.file_key)}
            disabled={downloading}
            className="group rounded-full border border-transparent bg-green-50 p-2 text-green-600 transition hover:border-green-200 hover:bg-green-100 disabled:opacity-50"
            title="Download Offer Letter"
          >
            <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
        </div>
      </div>
    </section>
  );
}
