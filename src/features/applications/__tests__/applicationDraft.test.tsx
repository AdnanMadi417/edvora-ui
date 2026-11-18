import { act, renderHook, waitFor } from "@testing-library/react";
import { createDraftStore, draftKey, type DraftStorage, type StoredDraft } from "features/applications/form/draftStore";
import { useApplicationDraft } from "features/applications/form/useApplicationDraft";
import type { FormDataType } from "features/applications/partner/components/form/utility-functions/types";

/** In-memory stand-in for IndexedDB. */
function memoryStorage() {
  const map = new Map<string, StoredDraft>();
  const storage: DraftStorage = {
    get: async (k) => map.get(k),
    put: async (k, v) => void map.set(k, v),
    delete: async (k) => void map.delete(k),
  };
  return { map, storage };
}

/** Storage that fails like private mode does. */
const brokenStorage: DraftStorage = {
  get: () => Promise.reject(new Error("blocked")),
  put: () => Promise.reject(new Error("blocked")),
  delete: () => Promise.reject(new Error("blocked")),
};

const passport = new File(["passport-bytes"], "passport.pdf", { type: "application/pdf", lastModified: 1700000000000 });

const form = (name = "Nur Aisyah"): FormDataType => ({
  program_id: "p1",
  university_id: "u1",
  intake_date: "2027-01-05",
  student_id: "",
  student: {
    name,
    birthday: "",
    nationality: "Malaysian",
    passport_number: "A123",
    email: "",
    phone: "",
    current_address: "",
    gender: null,
    emergency_contacts: [{ name: "", relation: "", phone: "", email: "" }],
    english_proficiencies: [{ test_type: "", score: "", test_date: "" }],
    previous_educations: [{ institution_name: "", qualification: "", start_date: "", end_date: "", grade: "" }],
  },
  documents: [{ document_type_id: "d1", file_url: "https://cdn/x.pdf", file_key: "k1", name: "passport.pdf", raw: passport }],
  is_draft: false,
});

const readText = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsText(blob);
  });

describe("draftKey", () => {
  it("is per user and per form, and off until the user is known", () => {
    expect(draftKey("user-1")).toBe("application:user-1:new");
    expect(draftKey("user-1", { programId: "p1" })).toBe("application:user-1:programme:p1");
    expect(draftKey("user-2")).not.toBe(draftKey("user-1"));
    expect(draftKey(undefined)).toBeNull();
  });
});

describe("draft store", () => {
  it("round-trips values, step and a file", async () => {
    const { map, storage } = memoryStorage();
    const store = createDraftStore(storage);
    expect(await store.save("k", { formData: form(), step: "documents", completed: ["student"], savedAt: 42 })).toBe(true);

    // The File goes in as a Blob next to the form, not inside it.
    const stored = map.get("k")!;
    expect(stored.formData.documents[0].raw).toBeUndefined();
    expect(stored.files).toHaveLength(1);

    const draft = await store.load("k");
    expect(draft).toMatchObject({ step: "documents", completed: ["student"], savedAt: 42 });
    expect(draft!.formData.student.name).toBe("Nur Aisyah");
    const raw = draft!.formData.documents[0].raw!;
    expect(raw).toBeInstanceOf(File);
    expect(raw.name).toBe("passport.pdf");
    expect(raw.type).toBe("application/pdf");
    expect(await readText(raw)).toBe("passport-bytes");
  });

  it("rebuilds a File when storage hands back a plain Blob", async () => {
    const { map, storage } = memoryStorage();
    const store = createDraftStore(storage);
    await store.save("k", { formData: form(), step: "student", completed: [], savedAt: 1 });
    map.get("k")!.files[0].blob = new Blob(["passport-bytes"], { type: "application/pdf" });
    const raw = (await store.load("k"))!.formData.documents[0].raw!;
    expect(raw).toBeInstanceOf(File);
    expect(raw.name).toBe("passport.pdf");
  });

  it("discards", async () => {
    const { map, storage } = memoryStorage();
    const store = createDraftStore(storage);
    await store.save("k", { formData: form(), step: "student", completed: [], savedAt: 1 });
    expect(await store.discard("k")).toBe(true);
    expect(map.has("k")).toBe(false);
    expect(await store.load("k")).toBeNull();
  });

  it("is a quiet no-op when storage throws", async () => {
    const store = createDraftStore(brokenStorage);
    await expect(store.save("k", { formData: form(), step: "student", completed: [], savedAt: 1 })).resolves.toBe(false);
    await expect(store.load("k")).resolves.toBeNull();
    await expect(store.discard("k")).resolves.toBe(false);

    const throwing = createDraftStore(() => {
      throw new Error("no IndexedDB");
    });
    await expect(throwing.load("k")).resolves.toBeNull();
  });
});

describe("useApplicationDraft", () => {
  const setup = (storage: DraftStorage, initial: Partial<Parameters<typeof useApplicationDraft>[0]> = {}) => {
    const store = createDraftStore(storage);
    const onRestore = jest.fn();
    const props = { key: "k" as string | null, formData: form(), step: "student" as const, completed: [], dirty: false, onRestore, store, delay: 10, ...initial };
    const hook = renderHook((p: typeof props) => useApplicationDraft(p), { initialProps: props });
    return { ...hook, props, onRestore, store };
  };

  it("auto-saves while dirty, then offers the draft on the next visit and resumes it", async () => {
    const { map, storage } = memoryStorage();
    const first = setup(storage, { dirty: true });
    await waitFor(() => expect(map.has("k")).toBe(true));
    await waitFor(() => expect(first.result.current.saved).toBe(true));
    first.unmount();

    const second = setup(storage, { formData: form("") });
    await waitFor(() => expect(second.result.current.offer).toMatchObject({ studentName: "Nur Aisyah" }));
    act(() => second.result.current.resume());
    expect(second.onRestore).toHaveBeenCalledWith(expect.objectContaining({ step: "student" }));
    expect(second.onRestore.mock.calls[0][0].formData.documents[0].raw.name).toBe("passport.pdf");
    expect(second.result.current.offer).toBeNull();
  });

  it("discard removes the offered draft", async () => {
    const { map, storage } = memoryStorage();
    await createDraftStore(storage).save("k", { formData: form(), step: "documents", completed: [], savedAt: 1 });
    const { result } = setup(storage);
    await waitFor(() => expect(result.current.offer).not.toBeNull());
    await act(() => result.current.discard());
    expect(result.current.offer).toBeNull();
    expect(map.has("k")).toBe(false);
  });

  it("does not overwrite an offered draft before the Advisor chooses", async () => {
    const { map, storage } = memoryStorage();
    await createDraftStore(storage).save("k", { formData: form(), step: "documents", completed: [], savedAt: 1 });
    const { result, rerender, props } = setup(storage);
    await waitFor(() => expect(result.current.offer).not.toBeNull());
    rerender({ ...props, dirty: true, formData: form("Someone else") });
    await new Promise((r) => setTimeout(r, 30));
    expect(map.get("k")!.formData.student.name).toBe("Nur Aisyah");
  });

  it("clears the draft after submit and stops saving", async () => {
    const { map, storage } = memoryStorage();
    const { result, rerender, props } = setup(storage, { dirty: true });
    await waitFor(() => expect(map.has("k")).toBe(true));
    await act(() => result.current.clear());
    expect(map.has("k")).toBe(false);
    // A late change (still dirty) must not bring it back.
    rerender({ ...props, dirty: true, formData: form("Late edit") });
    await new Promise((r) => setTimeout(r, 30));
    expect(map.has("k")).toBe(false);
  });

  it("Save draft reports failure when storage is unavailable", async () => {
    const { result } = setup(brokenStorage, { dirty: true });
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.saveNow();
    });
    expect(ok).toBe(false);
    expect(result.current.saved).toBe(false);
    expect(result.current.offer).toBeNull();
  });

  it("does nothing without a key", async () => {
    const { map, storage } = memoryStorage();
    const { result } = setup(storage, { key: null, dirty: true });
    await new Promise((r) => setTimeout(r, 30));
    expect(map.size).toBe(0);
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.saveNow();
    });
    expect(ok).toBe(false);
  });
});
