/**
 * A fetch's state as a single value instead of independent loading/error/
 * data booleans — those can contradict each other (e.g. loading=false,
 * error=null, data=null still has to mean *something*). Derive this once
 * from whatever shape a data hook already returns, then switch on it.
 */
export type AsyncStatus = "loading" | "error" | "empty" | "success";

/**
 * Derives an AsyncStatus from a hook's existing `{ loading, error, data }`
 * trio — no hook needs to change its own return shape for this; call this
 * where the data is consumed instead.
 */
export function getAsyncStatus<T>(
  loading: boolean,
  error: string | null | undefined,
  data: T,
  isEmpty: (data: T) => boolean
): AsyncStatus {
  if (loading) return "loading";
  if (error) return "error";
  if (isEmpty(data)) return "empty";
  return "success";
}
