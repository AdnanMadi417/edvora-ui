import { useState } from "react";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormModal, { FormSection, type FormModalError } from "./FormModal";

function Harness({ onClose = jest.fn(), onSubmitted = jest.fn() }: { onClose?: () => void; onSubmitted?: () => void }) {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<FormModalError[]>([]);
  return (
    <FormModal
      open
      onClose={onClose}
      title="Add student"
      submitLabel="Add student"
      dirty={name !== ""}
      errors={errors}
      sections={[{ id: "s1", label: "Personal details" }, { id: "s2", label: "Contact" }]}
      onSubmit={() => {
        if (!name) setErrors([{ fieldId: "f-name", message: "Enter the full name." }]);
        else onSubmitted();
      }}
    >
      <FormSection id="s1" title="Personal details">
        <label htmlFor="f-name">Full name</label>
        <input id="f-name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormSection>
      <FormSection id="s2" title="Contact">
        <p>Contact fields</p>
      </FormSection>
    </FormModal>
  );
}

const flush = () => act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));

describe("FormModal", () => {
  it("opens as a labelled dialog with sections", async () => {
    render(<Harness />);
    await flush();
    const dialog = screen.getByRole("dialog", { name: "Add student" });
    expect(within(dialog).getByRole("heading", { name: "Personal details" })).toBeInTheDocument();
  });

  it("failed submit focuses the error summary, whose links focus the field", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await flush();
    await user.click(screen.getByRole("button", { name: "Add student" }));
    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent("Fix 1 field to continue");
    expect(summary).toHaveFocus();
    await user.click(within(summary).getByRole("button", { name: "Enter the full name." }));
    expect(screen.getByLabelText("Full name")).toHaveFocus();
  });

  it("submits when valid", async () => {
    const user = userEvent.setup();
    const onSubmitted = jest.fn();
    render(<Harness onSubmitted={onSubmitted} />);
    await flush();
    await user.type(screen.getByLabelText("Full name"), "Nur Aisyah");
    await user.click(screen.getByRole("button", { name: "Add student" }));
    expect(onSubmitted).toHaveBeenCalled();
  });

  it("closes straight away when clean, asks first when dirty", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<Harness onClose={onClose} />);
    await flush();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    await user.type(screen.getByLabelText("Full name"), "x");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).not.toHaveBeenCalled();
    const confirm = await screen.findByRole("alertdialog", { name: "Discard changes?" });
    await user.click(within(confirm).getByRole("button", { name: "Discard changes" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("locks Cancel while submitting", async () => {
    render(
      <FormModal open onClose={jest.fn()} title="Save" submitLabel="Save" submitting onSubmit={jest.fn()}>
        <p>Body</p>
      </FormModal>,
    );
    await flush();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Save/ })).toHaveAttribute("aria-busy", "true");
  });
});
