import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StoredDocumentUpload from "./StoredDocumentUpload";
import { getDocumentDownloadUrl } from "services/documentService";
jest.mock("services/documentService", () => ({ getDocumentDownloadUrl: jest.fn() }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({ useToast: () => ({ showToast: jest.fn() }) }));
const doc = { file_key: "private/passport.pdf", file_url: "", uploading: false, progress: 0, error: "" };

it("previews a locked private document without allowing replacement", async () => {
  (getDocumentDownloadUrl as jest.Mock).mockResolvedValue("https://example.com/signed");
  const open = jest.spyOn(window, "open").mockImplementation(() => null);
  const onUpload = jest.fn();
  render(<StoredDocumentUpload id="passport" label="Passport" document={doc} onUpload={onUpload} locked />);
  expect(screen.getByRole("button", { name: "Replace file" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "View document" }));
  await waitFor(() => expect(open).toHaveBeenCalledWith("https://example.com/signed", "_blank", "noopener,noreferrer"));
  expect(getDocumentDownloadUrl).toHaveBeenCalledWith(doc.file_key);
  expect(onUpload).not.toHaveBeenCalled();
  open.mockRestore();
});

it("rejects documents in an image-only field", () => {
  const onUpload = jest.fn();
  const { container } = render(<StoredDocumentUpload id="photo" label="Profile photo" document={{ ...doc, file_key: "" }} onUpload={onUpload} imageOnly />);
  fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [new File(["pdf"], "passport.pdf", { type: "application/pdf" })] } });
  expect(onUpload).not.toHaveBeenCalled();
  expect(screen.getByText(/file type isn't supported/)).toBeInTheDocument();
});
