import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProgramDetailsView from "./ProgramDetailsView";
import {
  sampleProgram,
  sampleProgramDocuments,
} from "components/showcase/fixtures/program";

jest.mock(
  "components/ub/data/display/RichTextDisplay",
  () =>
    function RichText({ html }: { html: string }) {
      return <div>{html}</div>;
    }
);

function renderDetails() {
  return render(
    <ProgramDetailsView
      program={sampleProgram}
      commission={sampleProgram.commission}
      requiredDocuments={sampleProgramDocuments}
      exchangeRates={[{ to_currency: "USD", rate: 0.25 }]}
      actions={<button>Apply now</button>}
    />
  );
}

it("converts tuition and commission together and copies the displayed fee summary", async () => {
  const user = userEvent.setup();
  renderDetails();
  await user.click(screen.getByRole("button", { name: /Display currency/ }));
  await user.click(screen.getByRole("menuitemradio", { name: /USD/ }));
  const summary = screen.getByRole("complementary", {
    name: "Program summary",
  });
  expect(within(summary).getByText("USD 8,125")).toBeInTheDocument();
  expect(within(summary).getByText("USD 1,050")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Copy fee summary" }));
  expect(screen.getByRole("status")).toHaveTextContent("Fee summary copied");
  const text = await navigator.clipboard.readText();
  expect(text).toContain("Year 1: USD 8,125");
  expect(text).toContain("Registration: USD 300");
});

it("links each section and lets optional documents expand", async () => {
  const user = userEvent.setup();
  renderDetails();
  for (const link of within(
    screen.getByRole("navigation", { name: "Program sections" })
  ).getAllByRole("link")) {
    expect(
      document.getElementById(link.getAttribute("href")!.slice(1))
    ).toBeInTheDocument();
  }
  const optional = screen.getByText("Optional documents (1)");
  expect(optional.parentElement).not.toHaveAttribute("open");
  await user.click(optional);
  expect(optional.parentElement).toHaveAttribute("open");
  await waitFor(() => expect(screen.getByText("Reference letter")).toBeVisible());
});
