import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationFilterBar from "./ApplicationFilterBar";

it("applies filters together and discards unapplied changes when closed", async () => {
  const changed = jest.fn();
  function Harness() {
    const [open, setOpen] = useState(false);
    const [university, setUniversity] = useState("all");
    return (
      <ApplicationFilterBar
        searchTerm=""
        onSearchChange={jest.fn()}
        selectedStages="all"
        onStagesChange={jest.fn()}
        stageOptions={[]}
        selectedUniversity={university}
        onUniversityChange={(value) => {
          changed(value);
          setUniversity(value);
        }}
        universityOptions={[{ value: "APU", label: "Asia Pacific University" }]}
        selectedStageStatus="all"
        onStageStatusChange={jest.fn()}
        stageStatusOptions={[]}
        activeFiltersCount={university === "all" ? 0 : 1}
        onClearFilters={jest.fn()}
        showFilters={open}
        onToggleFilters={() => setOpen((value) => !value)}
      />
    );
  }
  const user = userEvent.setup();
  render(<Harness />);
  const trigger = screen.getByRole("button", { name: "Filters" });
  await user.click(trigger);
  await user.selectOptions(
    screen.getByRole("combobox", { name: "University" }),
    "APU"
  );
  expect(changed).not.toHaveBeenCalled();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  );
  expect(trigger).toHaveFocus();
  await user.click(trigger);
  expect(screen.getByRole("combobox", { name: "University" })).toHaveValue(
    "all"
  );
  await user.selectOptions(
    screen.getByRole("combobox", { name: "University" }),
    "APU"
  );
  await user.click(screen.getByRole("button", { name: "Apply filters" }));
  expect(changed).toHaveBeenCalledWith("APU");
});
