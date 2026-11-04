import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadField from "./UploadField";
import ImageUploadField from "./ImageUploadField";

const file = new File(["image"], "logo.png", { type: "image/png" });
beforeEach(() => {
  URL.createObjectURL = jest.fn(() => "blob:preview");
  URL.revokeObjectURL = jest.fn();
});

it("previews an image, replaces it and releases the local URL on unmount", async () => {
  const onChange = jest.fn();
  const { container, unmount } = render(
    <UploadField
      label="Logo"
      imageOnly
      file={file}
      onFileChange={onChange}
      onRemove={jest.fn()}
    />
  );
  expect(
    await screen.findByRole("img", { name: "Preview of logo.png" })
  ).toHaveAttribute("src", "blob:preview");
  expect(screen.getByRole("link", { name: /Preview file/ })).toHaveAttribute(
    "href",
    "blob:preview"
  );
  await userEvent.click(screen.getByRole("button", { name: "Replace file" }));
  await userEvent.upload(
    container.querySelector('input[type="file"]')!,
    new File(["new"], "new.png", { type: "image/png" })
  );
  expect(onChange).toHaveBeenCalledWith(
    expect.objectContaining({ name: "new.png" })
  );
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
});

it("rejects unsupported files and oversized images without changing the selected file", () => {
  const onChange = jest.fn();
  const onError = jest.fn();
  const { container } = render(
    <UploadField
      label="Logo"
      imageOnly
      file={null}
      onFileChange={onChange}
      onRemove={jest.fn()}
      onError={onError}
    />
  );
  const input = container.querySelector('input[type="file"]')!;
  fireEvent.change(input, {
    target: {
      files: [new File(["pdf"], "file.pdf", { type: "application/pdf" })],
    },
  });
  expect(
    screen.getByText(/This file type isn't supported/)
  ).toBeInTheDocument();
  const large = new File(["image"], "large.png", { type: "image/png" });
  Object.defineProperty(large, "size", { value: 11 * 1024 * 1024 });
  fireEvent.change(input, { target: { files: [large] } });
  expect(screen.getByText(/This file is over 10 MB/)).toBeInTheDocument();
  expect(onError).toHaveBeenCalled();
  expect(onChange).not.toHaveBeenCalled();
});

it("announces upload progress and locks replace/remove while uploading", () => {
  render(
    <UploadField
      label="Logo"
      file={file}
      uploading
      progress={45}
      onFileChange={jest.fn()}
      onRemove={jest.fn()}
    />
  );
  expect(
    screen.getByRole("progressbar", { name: "Uploading logo.png" })
  ).toHaveAttribute("aria-valuenow", "45");
  expect(
    screen.queryByRole("button", { name: "Replace file" })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Cancel upload of logo.png" })
  ).toBeDisabled();
});

it("supports existing-file previews and removal without creating a local object URL", async () => {
  const onRemove = jest.fn();
  render(
    <UploadField
      label="Logo"
      imageOnly
      file={null}
      existingUrl="https://example.com/logo.png"
      onExistingRemove={onRemove}
      onFileChange={jest.fn()}
      onRemove={jest.fn()}
    />
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Remove Current logo" })
  );
  expect(onRemove).toHaveBeenCalledTimes(1);
  expect(URL.createObjectURL).not.toHaveBeenCalled();
});

it("downloads non-previewable document types instead of opening them inline", async () => {
  render(
    <UploadField
      label="Document"
      file={
        new File(["doc"], "application.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
      }
      onFileChange={jest.fn()}
      onRemove={jest.fn()}
    />
  );
  expect(
    await screen.findByRole("link", { name: /Download file/ })
  ).toHaveAttribute("download", "application.docx");
});

it("preserves the document-type upload contract and reports request failures inline", async () => {
  const upload = jest
    .fn()
    .mockRejectedValue(new Error("Connection interrupted"));
  const { container } = render(
    <ImageUploadField
      label="Passport"
      field="documents"
      documentTypeId="passport-type"
      formData={{ documents: [] }}
      uploadHandler={upload}
      errors={{}}
    />
  );
  const document = new File(["pdf"], "passport.pdf", {
    type: "application/pdf",
  });
  await userEvent.upload(
    container.querySelector('input[type="file"]')!,
    document
  );
  expect(upload).toHaveBeenCalledWith(
    { target: { files: [document] } },
    "passport-type"
  );
  expect(await screen.findByText("Connection interrupted")).toBeInTheDocument();
});
