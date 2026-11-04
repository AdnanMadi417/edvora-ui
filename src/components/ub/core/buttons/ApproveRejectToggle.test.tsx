import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApproveRejectToggle, { type ApproveRejectToggleProps, type Decision } from "./ApproveRejectToggle";

function Harness(props: Partial<ApproveRejectToggleProps>) {
  const [value, setValue] = useState<Decision | null>(null);
  return <ApproveRejectToggle value={value} onChange={setValue} {...props} />;
}

describe("ApproveRejectToggle", () => {
  it("is one radio group; Tab lands once, arrows move and select", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "Decision" })).toBeInTheDocument();
    const [approve, reject] = screen.getAllByRole("radio");
    await user.tab();
    expect(approve).toHaveFocus();
    expect(approve).toHaveAttribute("aria-checked", "false");
    await user.keyboard("{ArrowRight}");
    expect(reject).toHaveFocus();
    expect(reject).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Home}");
    expect(approve).toHaveAttribute("aria-checked", "true");
    expect(reject).toHaveAttribute("tabindex", "-1");
  });

  it("clicks select, with custom labels and descriptions", async () => {
    const onChange = jest.fn();
    render(<ApproveRejectToggle value={null} onChange={onChange} approveLabel="Verify document" rejectLabel="Request replacement" rejectDescription="The Advisor is asked to upload it again." />);
    await userEvent.click(screen.getByRole("radio", { name: /Request replacement/ }));
    expect(onChange).toHaveBeenCalledWith("rejected");
    expect(screen.getByText("The Advisor is asked to upload it again.")).toBeInTheDocument();
  });

  it("shows the error and marks the group invalid", () => {
    render(<ApproveRejectToggle value={null} onChange={jest.fn()} required error="Choose approve or reject." />);
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toHaveAccessibleDescription("Choose approve or reject.");
  });

  it("disabled keeps the recorded decision readable and blocks changes", async () => {
    const onChange = jest.fn();
    render(<ApproveRejectToggle value="approved" onChange={onChange} disabled companyName="Global Pathways Education" />);
    expect(screen.getByRole("radio", { name: /Approve/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /Reject/ })).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: /Reject/ }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("Global Pathways Education")).toBeInTheDocument();
  });

  it("compact variant renders the same group", () => {
    render(<Harness variant="compact" />);
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });
});
