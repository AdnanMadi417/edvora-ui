// Tiny route table for the mock API. Handlers are registered per module in
// mocks/handlers/* and matched against the request path (relative to /api).

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface MockRequest {
  method: HttpMethod;
  /** Path relative to the API base, e.g. "/admin/applications/app_001". */
  path: string;
  /** Path parameters from the pattern, e.g. { id: "app_001" } for "/x/:id". */
  params: Record<string, string>;
  /** Query string merged with axios `params`. */
  query: Record<string, any>;
  /** Parsed JSON body, or FormData entries as an object. */
  body: any;
}

export type MockHandler = (req: MockRequest) => unknown;

/** Return from a handler to control the status code. */
export class MockReply {
  constructor(public status: number, public data: unknown) {}
}

export const reply = (status: number, data: unknown = {}) => new MockReply(status, data);

/** Throw (or return) from a handler to fail the request like the backend would. */
export const httpError = (status: number, detail: string) => new MockReply(status, { detail });

interface Route {
  method: HttpMethod;
  pattern: string;
  segments: string[];
  /** Fewer params = more specific; literal routes win over "/:id". */
  paramCount: number;
  handler: MockHandler;
}

const routes: Route[] = [];

function register(method: HttpMethod, pattern: string, handler: MockHandler) {
  const segments = pattern.split("/").filter(Boolean);
  routes.push({ method, pattern, segments, paramCount: segments.filter((s) => s.startsWith(":")).length, handler });
}

export const mock = {
  get: (pattern: string, handler: MockHandler) => register("get", pattern, handler),
  post: (pattern: string, handler: MockHandler) => register("post", pattern, handler),
  put: (pattern: string, handler: MockHandler) => register("put", pattern, handler),
  patch: (pattern: string, handler: MockHandler) => register("patch", pattern, handler),
  delete: (pattern: string, handler: MockHandler) => register("delete", pattern, handler),
};

export function matchRoute(method: HttpMethod, path: string): { route: Route; params: Record<string, string> } | null {
  const parts = path.split("/").filter(Boolean);
  let best: { route: Route; params: Record<string, string> } | null = null;

  for (const route of routes) {
    if (route.method !== method || route.segments.length !== parts.length) continue;
    const params: Record<string, string> = {};
    const ok = route.segments.every((seg, i) => {
      if (seg.startsWith(":")) {
        params[seg.slice(1)] = decodeURIComponent(parts[i]);
        return true;
      }
      return seg === parts[i];
    });
    if (ok && (!best || route.paramCount < best.route.paramCount)) best = { route, params };
  }
  return best;
}
