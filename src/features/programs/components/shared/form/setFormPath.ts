/**
 * Immutably sets a value at a dotted/bracket path (e.g.
 * "scholarships[0].conditions[2]") without cloning the parts of the object
 * the path doesn't touch. structuredClone-ing the whole form on every
 * keystroke does real, unnecessary work once there are enough fee/
 * scholarship rows — this only shallow-copies the objects/arrays actually
 * on the path, so every untouched row keeps its original reference.
 *
 * Missing intermediate containers are created as arrays when the next path
 * segment is numeric, objects otherwise — matching how these forms' field
 * paths are actually shaped (e.g. "scholarships[0]" needs an array at
 * "scholarships", an object at index 0).
 */
export function setFormPath<T extends object>(obj: T, path: string, value: any): T {
  const keys = path.replace(/\[(\w+)\]/g, ".$1").split(".");
  return setAtKeys(obj, keys, value);
}

function setAtKeys(obj: any, keys: string[], value: any): any {
  const [key, ...rest] = keys;

  if (rest.length === 0) {
    if (Array.isArray(obj)) {
      const copy = obj.slice();
      copy[Number(key)] = value;
      return copy;
    }
    return { ...obj, [key]: value };
  }

  const existingChild = obj?.[key];
  const childContainer = existingChild !== undefined ? existingChild : (isNaN(Number(rest[0])) ? {} : []);
  const nextChild = setAtKeys(childContainer, rest, value);

  if (Array.isArray(obj)) {
    const copy = obj.slice();
    copy[Number(key)] = nextChild;
    return copy;
  }
  return { ...obj, [key]: nextChild };
}
