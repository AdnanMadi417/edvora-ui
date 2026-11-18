import { render, screen } from "@testing-library/react";
import ItemList from "./ItemList";

type Row = { id: string; name: string; code?: string; active: boolean };
const rows: Row[] = [
  { id: "cs", name: "Computer Science", code: "CS", active: true },
  { id: "art", name: "Arts", active: false },
];

it("renders one row per record: status circle, name, tag and actions, no table", () => {
  const { container } = render(
    <ItemList
      label="Fields of study"
      items={rows}
      getId={(r) => r.id}
      getName={(r) => r.name}
      getStatus={(r) => ({ status: r.active })}
      getTag={(r) => r.code}
      getHref={(r) => `/fields/${r.id}`}
      renderActions={(r) => <button type="button">Edit {r.name}</button>}
    />
  );
  expect(container.querySelector("table")).toBeNull();
  const list = screen.getByRole("list", { name: "Fields of study" });
  expect(list.querySelectorAll("li")).toHaveLength(2);
  expect(screen.getByRole("link", { name: /Computer Science/ })).toHaveAttribute("href", "/fields/cs");
  expect(screen.getByText("CS")).toBeInTheDocument();
  expect(container.querySelectorAll("[data-entity-status]")[1]).toHaveAttribute("title", "Inactive");
  expect(screen.getByRole("button", { name: "Edit Arts" })).toBeInTheDocument();
});

it("shows the empty state and the error state with a retry", () => {
  const retry = jest.fn();
  const { rerender } = render(
    <ItemList label="Things" items={[]} getId={() => ""} getName={() => ""} empty={{ title: "Nothing here" }} />
  );
  expect(screen.getByText("Nothing here")).toBeInTheDocument();
  rerender(<ItemList label="Things" items={[]} getId={() => ""} getName={() => ""} error="Could not load" onRetry={retry} />);
  expect(screen.getByText("Could not load")).toBeInTheDocument();
  screen.getByRole("button", { name: /try again/i }).click();
  expect(retry).toHaveBeenCalled();
});
