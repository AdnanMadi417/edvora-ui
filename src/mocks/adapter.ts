import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosError } from "axios";
import { matchRoute, MockReply, type HttpMethod } from "./router";
import "./handlers";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseBody(data: unknown): unknown {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    const out: Record<string, unknown> = {};
    data.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

function resolvePath(config: InternalAxiosRequestConfig): { path: string; query: Record<string, any> } {
  const url = new URL(config.url ?? "", "http://mock.local");
  // Absolute URLs (or ones carrying the base) are reduced to the part after /api.
  const path = url.pathname.replace(/^.*?\/api(?=\/)/, "") || "/";
  const query: Record<string, any> = Object.fromEntries(url.searchParams.entries());
  return { path, query: { ...query, ...(config.params ?? {}) } };
}

/**
 * Axios adapter that answers every request from mocks/handlers instead of the
 * network. Unknown GETs fail with 404 (and a console warning) so missing
 * fixtures are easy to spot; unknown writes succeed with an empty body.
 */
export const mockAdapter: AxiosAdapter = async (config) => {
  const method = (config.method ?? "get").toLowerCase() as HttpMethod;
  const { path, query } = resolvePath(config);
  await sleep(150 + Math.random() * 250);

  const match = matchRoute(method, path);
  let status = 200;
  let data: unknown = {};

  if (match) {
    try {
      const result = await match.route.handler({ method, path, params: match.params, query, body: parseBody(config.data) });
      if (result instanceof MockReply) {
        status = result.status;
        data = result.data;
      } else {
        data = result ?? {};
      }
    } catch (err) {
      if (err instanceof MockReply) {
        status = err.status;
        data = err.data;
      } else {
        console.error(`[mocks] handler for ${method.toUpperCase()} ${path} threw`, err);
        status = 500;
        data = { detail: "Mock handler error" };
      }
    }
  } else if (method === "get") {
    console.warn(`[mocks] no handler for GET ${path}`, query);
    status = 404;
    data = { detail: `No mock for GET ${path}` };
  } else {
    console.info(`[mocks] no handler for ${method.toUpperCase()} ${path}; replying 200 {}`);
  }

  if (config.responseType === "blob" && !(data instanceof Blob)) {
    data = new Blob([typeof data === "string" ? data : JSON.stringify(data)], { type: "application/octet-stream" });
  }

  const response: AxiosResponse = { data, status, statusText: String(status), headers: { "content-type": "application/json" }, config, request: {} };
  if (status >= 400) {
    throw new AxiosError(`Request failed with status code ${status}`, status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST, config, {}, response);
  }
  return response;
};
