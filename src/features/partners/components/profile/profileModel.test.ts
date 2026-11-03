import { contactHref, draftToPayload, placeName, validateDraft, youtubeEmbedUrl, type AdvisorProfileDraft } from "./profileModel";

const draft = (over: Partial<AdvisorProfileDraft> = {}): AdvisorProfileDraft => ({
  display_name: "Ahmed",
  headline: "",
  role_title: "",
  city: "",
  countries_supported: [],
  intro_video_url: "",
  help_intro: "",
  help_points: [],
  faqs: [],
  contact_channel: "whatsapp",
  contact_label: "Contact me",
  contact_value: "+60 12-345 6789",
  ...over,
});

describe("youtubeEmbedUrl", () => {
  it("turns watch, short and youtu.be links into privacy-enhanced embeds", () => {
    expect(youtubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(youtubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(youtubeEmbedUrl("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });
  it("rejects anything that isn't YouTube", () => {
    expect(youtubeEmbedUrl("https://vimeo.com/123456")).toBeNull();
    expect(youtubeEmbedUrl("not a url")).toBeNull();
    expect(youtubeEmbedUrl("")).toBeNull();
  });
});

describe("contactHref", () => {
  it("builds WhatsApp and Telegram links from a formatted number", () => {
    expect(contactHref("whatsapp", "+60 12-345 6789", "Ahmed")).toMatch(/^https:\/\/wa\.me\/60123456789\?text=/);
    expect(contactHref("telegram", "+60 12-345 6789", "Ahmed")).toBe("https://t.me/+60123456789");
  });
  it("only accepts http(s) links for the link channel", () => {
    expect(contactHref("link", "https://example.com", "Ahmed")).toBe("https://example.com");
    expect(contactHref("link", "javascript:alert(1)", "Ahmed")).toBeNull();
  });
});

describe("validateDraft", () => {
  it("passes a complete draft", () => {
    expect(validateDraft(draft())).toEqual({});
  });
  it("flags an empty name, a non-YouTube video and a bad contact", () => {
    const errors = validateDraft(draft({ display_name: " ", intro_video_url: "https://vimeo.com/1", contact_channel: "link", contact_value: "example" }));
    expect(Object.keys(errors).sort()).toEqual(["contact_value", "display_name", "intro_video_url"]);
  });
});

describe("draftToPayload", () => {
  it("trims values and drops half-written list rows", () => {
    const payload = draftToPayload(draft({ help_points: [" Visa ", ""], faqs: [{ question: "Q?", answer: "" }, { question: " Fee? ", answer: " Free " }] }));
    expect(payload.content?.help_points).toEqual(["Visa"]);
    expect(payload.content?.faqs).toEqual([{ question: "Fee?", answer: "Free" }]);
    expect(payload.content?.headline).toBeNull();
  });
});

describe("placeName", () => {
  it("expands ISO codes and capitalises stored names", () => {
    expect(placeName("MY")).toBe("Malaysia");
    expect(placeName("palestine")).toBe("Palestine");
    expect(placeName(null)).toBeNull();
  });
});
