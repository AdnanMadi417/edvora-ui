import { render, screen } from "@testing-library/react";
import EntityCell from "./EntityCell";
import EntityStatusBadge, { entityStatusOf } from "../badges/EntityStatusBadge";

it("maps backend values onto three tones", () => {
  expect(entityStatusOf(true)).toBe("active");
  expect(entityStatusOf("Verified")).toBe("active");
  expect(entityStatusOf("suspended")).toBe("inactive");
  expect(entityStatusOf(false)).toBe("inactive");
  expect(entityStatusOf("unverified")).toBe("pending");
  expect(entityStatusOf("invited")).toBe("pending");
});

it("shows status as a small circle on the avatar, with a tooltip and screen-reader text", () => {
  const { container } = render(<EntityCell name="KL Student Arrival Services" subtitle="Kuala Lumpur" status={{ status: "active" }} />);
  const dot = container.querySelector("[data-entity-status]")!;
  expect(dot).toHaveAttribute("data-entity-status", "active");
  expect(dot).toHaveAttribute("title", "Active");
  expect(screen.getByText("Active")).toHaveClass("sr-only");
  // No badge, no status text in view: only the name and the sub-line.
  expect(container.querySelector("[data-ub-badge]")).toBeNull();
  expect(screen.getByTitle("KL Student Arrival Services")).toBeInTheDocument();
  expect(screen.getByText("Kuala Lumpur")).toBeInTheDocument();
  // No image: initials on a neutral background.
  expect(screen.getByText("KS")).toBeInTheDocument();
});

it("accepts an EntityStatusBadge and keeps its label and tone", () => {
  const { container } = render(<EntityCell name="Global Pathways" status={<EntityStatusBadge status="unverified" label="Pending verification" />} />);
  expect(container.querySelector("[data-entity-status]")).toHaveAttribute("data-entity-status", "pending");
  expect(container.querySelector("[data-entity-status]")).toHaveAttribute("title", "Pending verification");
});

it("puts the circle before the name when there is no avatar", () => {
  const { container } = render(<EntityCell name="Computer Science" noAvatar status={{ status: false }} />);
  expect(container.querySelector("[data-entity-status]")).toHaveAttribute("title", "Inactive");
  expect(screen.queryByText("CS")).toBeNull();
});
