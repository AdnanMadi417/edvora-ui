import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Landmark } from "lucide-react";
import SteppedFormPage from "./SteppedFormPage";
import Input from "../text/Input";

function Example({ onSubmit = jest.fn(), blocked = false, valid = true }) {
  const [currentStep, onStepChange] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  return (
    <SteppedFormPage
      title="Register institution"
      description="Complete each section."
      icon={Landmark}
      currentStep={currentStep}
      onStepChange={onStepChange}
      onSubmit={onSubmit}
      onCancel={jest.fn()}
      submitLabel="Create institution"
      navigationDisabled={blocked}
      steps={[
        {
          id: "profile",
          label: "Profile",
          description: "Enter a name",
          validate: () => {
            setError(name && valid ? "" : "Enter a valid name");
            return !!name && valid;
          },
          content: (
            <Input label="Name" value={name} onChange={setName} error={error} />
          ),
        },
        {
          id: "settings",
          label: "Settings",
          description: "Choose settings",
          content: <p>Settings content</p>,
        },
      ]}
      review={<p>Review: {name}</p>}
    />
  );
}

it("validates each step, preserves values on Back, and submits only from Review", async () => {
  const onSubmit = jest.fn();
  render(<Example onSubmit={onSubmit} />);
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Enter a valid name")).toBeInTheDocument();
  await userEvent.type(screen.getByRole("textbox", { name: /Name/ }), "Sunway");
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Settings content")).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByRole("textbox", { name: /Name/ })).toHaveValue("Sunway");
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Review: Sunway")).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
  await userEvent.click(
    screen.getByRole("button", { name: "Create institution" })
  );
  expect(onSubmit).toHaveBeenCalledTimes(1);
});

it("reopens an earlier invalid step when review submission revalidates", async () => {
  const onSubmit = jest.fn();
  const { rerender } = render(<Example onSubmit={onSubmit} />);
  await userEvent.type(screen.getByRole("textbox", { name: /Name/ }), "Sunway");
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
  rerender(<Example onSubmit={onSubmit} valid={false} />);
  await userEvent.click(
    screen.getByRole("button", { name: "Create institution" })
  );
  expect(screen.getByRole("textbox", { name: /Name/ })).toHaveValue("Sunway");
  expect(screen.getByText("Enter a valid name")).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

it("prevents advancing during an upload", () => {
  render(<Example blocked />);
  expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
});
