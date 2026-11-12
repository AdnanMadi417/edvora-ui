import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useLeaveGuard } from "./useLeaveGuard";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

function Page({ active }: { active: boolean }) {
  const { dialog } = useLeaveGuard(active, { title: "Leave this application?" });
  return (
    <>
      <a href="/partner/home">Home</a>
      {dialog}
    </>
  );
}

beforeEach(() => push.mockReset());

it("does nothing while there is no unsaved work", () => {
  render(<Page active={false} />);
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  screen.getByRole("link", { name: "Home" }).dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
});

it("asks before following an in-app link, and Stay keeps the person on the page", () => {
  render(<Page active />);
  fireEvent.click(screen.getByRole("link", { name: "Home" }));
  expect(screen.getByRole("alertdialog", { name: "Leave this application?" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Stay" }));
  expect(push).not.toHaveBeenCalled();
});

it("Leave goes to the link the person clicked", () => {
  render(<Page active />);
  fireEvent.click(screen.getByRole("link", { name: "Home" }));
  fireEvent.click(screen.getByRole("button", { name: "Leave" }));
  expect(push).toHaveBeenCalledWith("/partner/home");
});

it("warns when the tab is closed or reloaded", () => {
  render(<Page active />);
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
});
