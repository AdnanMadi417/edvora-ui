import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentTypesDirectory from "./DocumentTypesDirectory";
import SetStaticTemplatePage from "../admin/SetStaticTemplatePage";
import { fileInput, rowAction, queryRowAction } from "testUtils/rowActions";
const mockSet = jest.fn();
const mockPush = jest.fn();
const mockRefetch = jest.fn();
const mockPresign = jest.fn();
const mockUpload = jest.fn();
const mockTypes = [
  {
    id: "health",
    type: "Health declaration",
    code: "health",
    description: "Blank health declaration.",
    has_static_template: true,
    static_template_file_key: null,
    is_init_app_doc: false,
    is_required_init_app_doc: false,
    is_required_for_init: false,
  },
  {
    id: "passport",
    type: "Passport",
    code: "passport",
    description: "Passport bio-data page.",
    has_static_template: false,
    static_template_file_key: null,
    is_init_app_doc: true,
    is_required_init_app_doc: true,
    is_required_for_init: true,
  },
];
jest.mock("../../hooks", () => ({
  useDocumentType: () => ({
    documentTypes: mockTypes,
    loading: false,
    error: null,
    refetch: mockRefetch,
  }),
  useSetStaticTemplate: () => ({ setTemplate: mockSet, loading: false }),
}));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("components/ub/feedback/notifications/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));
jest.mock("services/uploadService", () => ({
  getPresignedUploads: (...args: any[]) => mockPresign(...args),
  uploadFilesToSpaces: (...args: any[]) => mockUpload(...args),
  ALLOWED_FILE_TYPES: {
    mimeTypes: ["application/pdf"],
    extensions: [".pdf"],
    label: "PDF",
  },
}));
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
beforeEach(() => {
  jest.clearAllMocks();
  mockPresign.mockResolvedValue([{ upload_url: "upload" }]);
  mockUpload.mockResolvedValue([
    {
      file_key: "templates/health.pdf",
      public_url: "https://example.test/health.pdf",
    },
  ]);
  mockSet.mockResolvedValue(undefined);
});
it("offers uploads only for supported document types", () => {
  render(<DocumentTypesDirectory />);
  // Row actions sit in each row's menu; only supported types offer an upload.
  expect(rowAction("Upload Health declaration template")).toBeInTheDocument();
  expect(queryRowAction("Upload Passport template")).not.toBeInTheDocument();
  expect(screen.getByText("Missing template")).toBeInTheDocument();
  expect(screen.getByText("Not applicable")).toBeInTheDocument();
});
it("uploads the file before saving the existing template payload", async () => {
  const user = userEvent.setup();
  render(<SetStaticTemplatePage id="health" />);
  const file = new File(["pdf"], "health.pdf", { type: "application/pdf" });
  await user.upload(fileInput(/Template file/), file);
  await user.click(screen.getByRole("button", { name: "Save template" }));
  await waitFor(() =>
    expect(mockSet).toHaveBeenCalledWith("health", {
      file_key: "templates/health.pdf",
      file_url: "https://example.test/health.pdf",
    })
  );
  expect(mockPresign).toHaveBeenCalledWith([file], "document-templates");
  expect(mockPush).toHaveBeenCalledWith("/admin/document-types/health");
  expect(mockRefetch).toHaveBeenCalled();
});
it("keeps the selected file when storage upload fails", async () => {
  mockUpload.mockRejectedValue(new Error("Storage unavailable"));
  const user = userEvent.setup();
  render(<SetStaticTemplatePage id="health" />);
  await user.upload(
    fileInput(/Template file/),
    new File(["pdf"], "health.pdf", { type: "application/pdf" })
  );
  await user.click(screen.getByRole("button", { name: "Save template" }));
  await screen.findByRole("alert");
  expect(mockSet).not.toHaveBeenCalled();
  expect(mockPush).not.toHaveBeenCalled();
  expect(screen.getByText("health.pdf")).toBeInTheDocument();
});
it("blocks the editor for types without static templates", () => {
  render(<SetStaticTemplatePage id="passport" />);
  expect(
    screen.getByText("This document type does not use a static template.")
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Save template" })
  ).not.toBeInTheDocument();
});
it("disables saving during storage preparation", async () => {
  let resolveUpload!: (value: unknown) => void;
  mockPresign.mockReturnValue(
    new Promise((resolve) => {
      resolveUpload = resolve;
    })
  );
  const user = userEvent.setup();
  render(<SetStaticTemplatePage id="health" />);
  await user.upload(
    fileInput(/Template file/),
    new File(["pdf"], "health.pdf", { type: "application/pdf" })
  );
  await user.click(screen.getByRole("button", { name: "Save template" }));
  expect(screen.getByRole("button", { name: "Save template" })).toBeDisabled();
  expect(mockSet).not.toHaveBeenCalled();
  expect(mockPresign).toHaveBeenCalledTimes(1);
  resolveUpload([{ upload_url: "upload" }]);
  await waitFor(() => expect(mockSet).toHaveBeenCalledTimes(1));
});
