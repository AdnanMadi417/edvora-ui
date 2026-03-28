export const setNestedValue = <T extends object>(
  obj: T,
  path: string,
  value: any
): T => {
  const keys = path.split(/[\.\[\]]/).filter(Boolean);
  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur: any = newObj;

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const nextKey = keys[i + 1];
    const isLast = i === keys.length - 1;
    const nextIsIndex = !isNaN(Number(nextKey));

    if (isLast) {
      cur[k] = value;
    } else {
      if (cur[k] === undefined || cur[k] === null) {
        cur[k] = nextIsIndex ? [] : {};
      } else {
        cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] };
      }
      cur = cur[k];
    }
  }

  return newObj as T;
};