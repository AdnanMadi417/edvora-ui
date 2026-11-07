import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PublicFileUploadField from "./PublicFileUploadField";
import { uploadPublicPartnerFile } from "services/publicUploadService";

jest.mock("services/publicUploadService", () => ({
  uploadPublicPartnerFile: jest.fn(),
}));
const upload = uploadPublicPartnerFile as jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  URL.createObjectURL = jest.fn(() => "blob:preview");
  URL.revokeObjectURL = jest.fn();
});

it("rejects unsupported files before requesting a public upload", () => {
  const onUpload = jest.fn();
  const { container } = render(
    <PublicFileUploadField
      label="Passport"
      fieldId="passport"
      onUpload={onUpload}
      onRemove={jest.fn()}
    />
  );
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: {
      files: [
        new File(["bad"], "app.exe", { type: "application/octet-stream" }),
      ],
    },
  });
  expect(upload).not.toHaveBeenCalled();
  expect(onUpload).not.toHaveBeenCalled();
  expect(screen.getByText(/file type isn't supported/)).toBeInTheDocument();
});

it("preserves the public upload callback and file name", async () => {
  const result = {
    file_key: "public/passport.pdf",
    file_url: "https://example.com/passport.pdf",
  };
  upload.mockImplementation(async (_file, progress) => {
    progress(100);
    return result;
  });
  const onUpload = jest.fn();
  const { container } = render(
    <PublicFileUploadField
      label="Passport"
      fieldId="passport"
      onUpload={onUpload}
      onRemove={jest.fn()}
    />
  );
  const file = new File(["pdf"], "passport.pdf", { type: "application/pdf" });
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: { files: [file] },
  });
  await waitFor(() =>
    expect(onUpload).toHaveBeenCalledWith(result, "passport.pdf")
  );
  expect(upload).toHaveBeenCalledWith(file, expect.any(Function));
});

it("keeps the previously uploaded document when replacement fails", async () => {
  upload.mockRejectedValue(new Error("Upload failed"));
  const { container } = render(
    <PublicFileUploadField
      label="Passport"
      fieldId="passport"
      result={{ file_key: "old.pdf", file_url: "https://example.com/old.pdf" }}
      onUpload={jest.fn()}
      onRemove={jest.fn()}
    />
  );
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: {
      files: [new File(["pdf"], "new.pdf", { type: "application/pdf" })],
    },
  });
  await waitFor(() =>
    expect(screen.getByRole("link", { name: /Preview file/ })).toHaveAttribute(
      "href",
      "https://example.com/old.pdf"
    )
  );
});
