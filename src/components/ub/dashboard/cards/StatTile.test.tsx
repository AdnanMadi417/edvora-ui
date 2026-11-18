import { render, screen } from "@testing-library/react";
import { Wallet } from "lucide-react";
import StatTile from "./StatTile";

it("shows the label, value, change pill and a footer link to the list behind the number", () => {
  render(
    <StatTile
      label="Active applications"
      value="10"
      icon={Wallet}
      delta={{ value: 10.7, comparedTo: "vs last 7 days" }}
      footer={{ value: "+3", text: "vs last 7 days" }}
      href="/partner/applications"
    />
  );
  expect(screen.getByRole("heading", { name: "Active applications" })).toBeInTheDocument();
  expect(screen.getByText("10")).toBeInTheDocument();
  expect(screen.getByText("+3")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Open Active applications" })).toHaveAttribute("href", "/partner/applications");
});

it("has no change pill or link unless given, and shows loading and error states", () => {
  const retry = jest.fn();
  const { rerender, container } = render(<StatTile label="Action required" value="7" footer={{ text: "Waiting for you" }} />);
  expect(screen.queryByRole("link")).toBeNull();
  expect(screen.getByText("Waiting for you")).toBeInTheDocument();
  rerender(<StatTile label="Action required" value="7" state="loading" />);
  expect(container.querySelector("[aria-busy=true]")).not.toBeNull();
  expect(screen.queryByText("7")).toBeNull();
  rerender(<StatTile label="Action required" value="7" state="error" onRetry={retry} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load this number.");
  screen.getByRole("button", { name: "Try again" }).click();
  expect(retry).toHaveBeenCalled();
});
