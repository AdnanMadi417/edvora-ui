import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Landmark } from "lucide-react";
import FormPage, { type FormPageProps } from "./FormPage";
import Input from "../text/Input";

const props: FormPageProps = {
  title: "Add bank",
  description: "Add a bank for payouts.",
  icon: Landmark,
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  submitLabel: "Add bank",
  children: <Input label="Name" value="Maybank" onChange={jest.fn()} />,
};

it("submits with Enter and keeps Cancel separate from submission", async () => {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  render(<FormPage {...props} onSubmit={onSubmit} onCancel={onCancel} />);
  await userEvent.type(screen.getByRole("textbox"), "{Enter}");
  expect(onSubmit).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledTimes(1);
});

it("locks fields and actions while saving, including implicit submission", () => {
  const onSubmit = jest.fn();
  render(<FormPage {...props} onSubmit={onSubmit} submitting />);
  expect(screen.getByRole("textbox")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Add bank" })).toBeDisabled();
  fireEvent.submit(screen.getByRole("textbox").closest("form")!);
  expect(onSubmit).not.toHaveBeenCalled();
});

it("blocks implicit submission when invalid or when actions are hidden", () => {
  const onSubmit = jest.fn();
  const { rerender } = render(
    <FormPage {...props} onSubmit={onSubmit} submitDisabled />
  );
  fireEvent.submit(screen.getByRole("textbox").closest("form")!);
  expect(onSubmit).not.toHaveBeenCalled();
  rerender(<FormPage {...props} onSubmit={onSubmit} showActions={false} />);
  expect(
    screen.queryByRole("button", { name: "Add bank" })
  ).not.toBeInTheDocument();
  fireEvent.submit(screen.getByRole("textbox").closest("form")!);
  expect(onSubmit).not.toHaveBeenCalled();
});
