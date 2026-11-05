import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProgramFilterPanel from "./ProgramFilterPanel";

it("keeps draft filters until Apply and restores focus when dismissed", async () => {
  const user = userEvent.setup();
  const apply = jest.fn();
  render(
    <ProgramFilterPanel
      searchTerm=""
      onSearchChange={jest.fn()}
      stateOptions={[{ value: "kl", label: "Kuala Lumpur" }]}
      fieldOptions={[]}
      universityOptions={[]}
      qualificationOptions={[]}
      filters={{
        state: "all",
        field: "all",
        university: "all",
        qualId: null,
        scholarship: "all",
        courseType: "all",
        classType: "all",
      }}
      onApplyFilters={apply}
      onRemoveFilter={jest.fn()}
      onClearAll={jest.fn()}
      sortBy="all"
      onSortChange={jest.fn()}
    />
  );
  const trigger = screen.getByRole("button", { name: "Filters" });
  await user.click(trigger);
  const drawer = screen.getByRole("dialog", { name: "Filter programs" });
  expect(drawer).toHaveAttribute("aria-modal", "true");
  await user.selectOptions(
    within(drawer).getByRole("combobox", { name: "Location" }),
    "kl"
  );
  expect(apply).not.toHaveBeenCalled();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  );
  expect(trigger).toHaveFocus();
  await user.click(trigger);
  expect(screen.getByRole("combobox", { name: "Location" })).toHaveValue("all");
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Location" }),
    "kl"
  );
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  expect(apply).toHaveBeenCalledWith(expect.objectContaining({ state: "kl" }));
});
