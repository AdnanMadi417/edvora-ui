jest.mock("lib/useApi", () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock("js-cookie", () => ({ __esModule: true, default: { get: jest.fn(() => "tok") } }));

import api from "lib/useApi";
import { clearDocumentUrlCache, getDocumentDownloadUrl } from "./documentService";

const post = api.post as jest.Mock;
// @types/jest in this repo predates modern fake timers; the jest 29 runtime supports them.
const timers = jest as unknown as { useFakeTimers: (opts?: { now?: number }) => void; setSystemTime: (now: number) => void };
const signed = (url: string, expiresIn = 3600) => ({ data: { download_url: url, expires_in: expiresIn } });

beforeEach(() => {
  post.mockReset();
  clearDocumentUrlCache();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("getDocumentDownloadUrl", () => {
  it("requests a key once and reuses the signed URL afterwards", async () => {
    post.mockResolvedValue(signed("https://spaces/avatar?sig=1"));
    expect(await getDocumentDownloadUrl("avatars/a.png")).toBe("https://spaces/avatar?sig=1");
    expect(await getDocumentDownloadUrl("avatars/a.png")).toBe("https://spaces/avatar?sig=1");
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(
      "/storage/presigned-download-url",
      { file_key: "avatars/a.png" },
      expect.objectContaining({ headers: { Authorization: "Bearer tok" } }),
    );
  });

  it("collapses concurrent requests for the same key into one call", async () => {
    let resolve: (value: unknown) => void = () => undefined;
    post.mockReturnValue(new Promise((r) => { resolve = r; }));
    const navbar = getDocumentDownloadUrl("avatars/a.png");
    const sidebar = getDocumentDownloadUrl("avatars/a.png");
    resolve(signed("https://spaces/avatar?sig=1"));
    expect(await navbar).toBe("https://spaces/avatar?sig=1");
    expect(await sidebar).toBe("https://spaces/avatar?sig=1");
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("requests different keys separately", async () => {
    post.mockResolvedValueOnce(signed("https://spaces/a")).mockResolvedValueOnce(signed("https://spaces/b"));
    expect(await getDocumentDownloadUrl("a")).toBe("https://spaces/a");
    expect(await getDocumentDownloadUrl("b")).toBe("https://spaces/b");
    expect(post).toHaveBeenCalledTimes(2);
  });

  it("refreshes a URL shortly before it expires", async () => {
    timers.useFakeTimers({ now: 0 });
    post.mockResolvedValueOnce(signed("https://spaces/first", 120)).mockResolvedValueOnce(signed("https://spaces/second", 120));

    expect(await getDocumentDownloadUrl("k")).toBe("https://spaces/first");
    timers.setSystemTime(30_000);
    expect(await getDocumentDownloadUrl("k")).toBe("https://spaces/first");
    timers.setSystemTime(61_000); // 59 s left: inside the 60 s safety margin
    expect(await getDocumentDownloadUrl("k")).toBe("https://spaces/second");
    expect(post).toHaveBeenCalledTimes(2);
  });

  it("falls back to the default expiry when the backend omits expires_in", async () => {
    timers.useFakeTimers({ now: 0 });
    post.mockResolvedValue({ data: { download_url: "https://spaces/x" } });
    await getDocumentDownloadUrl("k");
    timers.setSystemTime(3_500_000);
    await getDocumentDownloadUrl("k");
    expect(post).toHaveBeenCalledTimes(1);
    timers.setSystemTime(3_600_000);
    await getDocumentDownloadUrl("k");
    expect(post).toHaveBeenCalledTimes(2);
  });

  it("does not cache failures", async () => {
    post.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(signed("https://spaces/ok"));
    await expect(getDocumentDownloadUrl("k")).rejects.toThrow("boom");
    expect(await getDocumentDownloadUrl("k")).toBe("https://spaces/ok");
    expect(post).toHaveBeenCalledTimes(2);
  });

  it("rejects an empty key and a response without a URL", async () => {
    await expect(getDocumentDownloadUrl("")).rejects.toThrow("No file key provided");
    post.mockResolvedValueOnce({ data: {} });
    await expect(getDocumentDownloadUrl("k")).rejects.toThrow("No download URL returned");
  });
});
