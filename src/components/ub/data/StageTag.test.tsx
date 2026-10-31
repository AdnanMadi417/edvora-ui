import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StageTag from "./StageTag";
import PipelineBar from "./PipelineBar";
import DescriptionList from "./DescriptionList";

describe("StageTag", () => {
  it("shows the configured label for a stage id", () => {
    render(<StageTag stageId="offer-received" />);
    expect(screen.getByText("Offer received")).toBeInTheDocument();
  });

  it("falls back to the raw id for an unknown stage", () => {
    render(<StageTag stageId="mystery-stage" />);
    expect(screen.getByText("mystery-stage")).toBeInTheDocument();
  });

  it("adds the separate Action needed flag", () => {
    render(<StageTag stageId="documents-pending" actionNeeded />);
    expect(screen.getByText("Documents pending")).toBeInTheDocument();
    expect(screen.getByText("Action needed")).toBeInTheDocument();
  });
});

describe("PipelineBar", () => {
  it("summarises totals for screen readers and skips empty stages", () => {
    render(<PipelineBar counts={{ enquiry: 2, "offer-received": 3, withdrawn: 0 }} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Applications by stage: 5 total. Enquiry 2, Offer received 3");
    expect(screen.queryByText("Withdrawn")).not.toBeInTheDocument();
  });

  it("makes legend items pressable when a handler is passed", async () => {
    const onStageSelect = jest.fn();
    render(<PipelineBar counts={{ enquiry: 2 }} onStageSelect={onStageSelect} selectedStageId="enquiry" />);
    const button = screen.getByRole("button", { name: /Enquiry/ });
    expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(button);
    expect(onStageSelect).toHaveBeenCalledWith("enquiry");
  });
});

describe("DescriptionList", () => {
  it("renders label–value pairs and a fallback for empty values", () => {
    render(<DescriptionList items={[{ label: "Nationality", value: "Malaysia" }, { label: "Passport number", value: "" }]} />);
    expect(screen.getByText("Nationality").tagName).toBe("DT");
    expect(screen.getByText("Malaysia").tagName).toBe("DD");
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
