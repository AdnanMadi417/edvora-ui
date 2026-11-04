import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormReuploadDialog from "./FormReuploadDialog";

jest.mock("components/ub/feedback/ToastContext", () => ({ useToast: () => ({ showToast: jest.fn() }) }));
jest.mock("utils/parseApiError", () => ({ getApiErrorCode: () => "invalid_status", parseApiError: (_: unknown, f: string) => f }));

const setup = (upload = jest.fn().mockResolvedValue(undefined)) => {
  const onClose = jest.fn();
  const onRefetch = jest.fn();
  render(<FormReuploadDialog isOpen onClose={onClose} onRefetch={onRefetch} applicationId="app-1" correctionReason="Missing signature" formName="application form" fieldId="application_form" upload={upload} isUploading={false} errorMessages={{ invalid_status: "Not awaiting an application form." }} />);
  return { upload, onClose, onRefetch };
};

describe("FormReuploadDialog", () => {
  it("shows the reason and keeps Submit disabled until a file is chosen", async () => {
    setup();
    const dialog = await screen.findByRole("dialog", { name: "Re-upload the application form" });
    expect(within(dialog).getByText("Missing signature")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /Submit application form/ })).toBeDisabled();
  });

  it("uploads, closes and refetches", async () => {
    const { upload, onClose, onRefetch } = setup();
    const input = (await screen.findByRole("dialog")).querySelector("input[type=file]") as HTMLInputElement;
    await userEvent.upload(input, new File(["x"], "form.pdf", { type: "application/pdf" }));
    await userEvent.click(screen.getByRole("button", { name: /Submit application form/ }));
    expect(upload).toHaveBeenCalledWith(expect.any(File), "app-1");
    expect(onClose).toHaveBeenCalled();
    expect(onRefetch).toHaveBeenCalled();
  });

  it("maps backend error codes to readable messages", async () => {
    setup(jest.fn().mockRejectedValue(new Error("x")));
    const input = (await screen.findByRole("dialog")).querySelector("input[type=file]") as HTMLInputElement;
    await userEvent.upload(input, new File(["x"], "form.pdf", { type: "application/pdf" }));
    await userEvent.click(screen.getByRole("button", { name: /Submit application form/ }));
    expect(await screen.findByText("Not awaiting an application form.")).toBeInTheDocument();
  });
  it("prevents closing while an upload is in progress", async () => {
    const onClose = jest.fn();
    render(<FormReuploadDialog isOpen onClose={onClose} applicationId="app-1" formName="application form" fieldId="application_form" upload={jest.fn()} isUploading />);
    const dialog = await screen.findByRole("dialog", { name: "Re-upload the application form" });
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: /Submit application form/ })).toBeDisabled();
    await userEvent.click(within(dialog).getByRole("button", { name: "Close dialog" }));
    await userEvent.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

});
