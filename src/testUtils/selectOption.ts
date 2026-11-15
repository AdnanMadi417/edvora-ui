import { within } from "@testing-library/react";

/** Exercise the real searchable trigger and option click, using the option's saved value. */
export async function selectOption(
  user: {
    click: (element: Element) => Promise<unknown>;
    selectOptions?: (...args: any[]) => Promise<unknown>;
  },
  trigger: HTMLElement,
  value: string | string[]
) {
  if (trigger.tagName === "SELECT") return user.selectOptions!(trigger, value);
  for (const entry of Array.isArray(value) ? value : [value]) {
    if (trigger.getAttribute("aria-expanded") !== "true")
      await user.click(trigger);
    const list = document.getElementById(
      trigger.getAttribute("aria-controls") ?? ""
    );
    if (!list)
      throw new Error(`No option list opened for ${trigger.textContent}`);
    const option = within(list)
      .getAllByRole("option")
      .find((item) => item.getAttribute("data-value") === String(entry));
    if (!option)
      throw new Error(
        `Option ${entry} is not available in ${list.textContent}`
      );
    await user.click(option);
  }
}
