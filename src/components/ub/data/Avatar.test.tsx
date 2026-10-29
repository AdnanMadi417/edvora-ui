import React from "react";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarGroup, getInitials } from "components/ub/data/Avatar";

const PEOPLE = ["Nur Aisyah Binti Kamal", "Chinedu Okafor", "Tanvir Hossain", "Sara Mahmoud", "Lim Wei Jie", "Priya Nair"].map((name) => ({ name }));

describe("Avatar", () => {
  it("derives initials from first and last names", () => {
    expect(getInitials("Nur Aisyah Binti Kamal")).toBe("NK");
    expect(getInitials("Sunway")).toBe("S");
  });

  it("falls back to initials with an accessible name", () => {
    render(<Avatar name="Nur Aisyah Binti Kamal" status="online" />);
    expect(screen.getByRole("img", { name: "Nur Aisyah Binti Kamal" })).toHaveTextContent("NK");
    expect(screen.getByText("Online")).toBeInTheDocument();
  });
});

describe("AvatarGroup", () => {
  it("shows at most 4 avatars then +N", () => {
    render(<AvatarGroup people={PEOPLE} label="Assigned Advisors" />);
    const group = screen.getByRole("group", { name: "Assigned Advisors" });
    expect(group.children).toHaveLength(5);
    expect(screen.getByRole("img", { name: "2 more" })).toHaveTextContent("+2");
  });

  it("omits the counter when everyone fits", () => {
    render(<AvatarGroup people={PEOPLE.slice(0, 3)} />);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });
});
