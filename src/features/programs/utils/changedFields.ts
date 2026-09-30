/**
 * The keys of `current` whose value differs from `baseline` (plain JSON
 * comparison), for building a partial-update payload.
 *
 * The program edit form used to send every field it had loaded, so a save
 * wrote back values the user never touched -- overwriting whatever a
 * colleague had saved to the same program in the meantime. Sending only what
 * changed keeps an edit from reaching past the fields the user edited.
 *
 * `groups` lists keys that must travel together: if any key in a group
 * changed, the whole group is included. The program commission is saved as
 * one versioned row, so its fields are sent as a unit rather than piecemeal.
 */
export function pickChangedFields<T extends object>(
  current: T,
  baseline: T,
  groups: ReadonlyArray<ReadonlyArray<keyof T>> = []
): Partial<T> {
  const differs = (key: keyof T) => JSON.stringify(current[key]) !== JSON.stringify(baseline[key]);
  const changed: Partial<T> = {};

  (Object.keys(current) as (keyof T)[]).forEach((key) => {
    if (differs(key)) changed[key] = current[key];
  });

  groups.forEach((group) => {
    if (group.some((key) => key in changed)) {
      group.forEach((key) => {
        changed[key] = current[key];
      });
    }
  });

  return changed;
}
