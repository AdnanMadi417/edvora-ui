import { mock, httpError } from "../router";
import { table, daysAgo, newId } from "../db";
import { APPLICATIONS } from "../seed";
import type { ChatMessage } from "features/chat/types";

// Mock endpoints for the per-application chat between an Advisor and their
// account manager. Unread counts are relative to whoever is viewing.

/** The mock session's user id for the current area (see config/mockSession.ts). */
export function currentUserId(): string {
  const area = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";
  return area === "partner" ? APPLICATIONS[0].partner.user_id : "mock-admin";
}

export const managerUserId = (managerId: string) => managerId.replace("am_", "usr_am_");

type Line = { from: "partner" | "manager"; text: string };

const THREADS: Line[][] = [
  [
    { from: "partner", text: "Hello, the student has uploaded a new passport scan. The previous one had glare over the MRZ line." },
    { from: "manager", text: "Thanks, the new scan is clear. I have moved the application forward to the Institution." },
    { from: "manager", text: "The Institution has acknowledged receipt. Expect an update within 5 working days." },
  ],
  [
    { from: "manager", text: "The Institution needs a certified English translation of the secondary school transcript. Please upload it under Academic Documents." },
    { from: "partner", text: "Understood. The student is getting it certified this week. Can we submit by Friday?" },
    { from: "manager", text: "Friday works. I will flag it to the Institution so the file is not closed." },
  ],
  [
    { from: "partner", text: "The student has paid the visa processing fee. The bank receipt is attached in Payments." },
    { from: "manager", text: "Received, thank you. I have submitted the EMGS application. Next step is the medical screening once EMGS approves the file." },
  ],
  [
    { from: "partner", text: "Could you confirm the arrival date window? The student wants to book flights for the first week of the intake." },
    { from: "manager", text: "Arrival is open from 5 to 12 January. Please confirm the flight details in the Arrival tab once booked." },
    { from: "partner", text: "Booked for 7 January, arriving KLIA at 14:20. I have added the itinerary." },
    { from: "manager", text: "Airport pickup is arranged. The student will receive the driver's contact 48 hours before arrival." },
  ],
];

const seed: ChatMessage[] = [];
APPLICATIONS.forEach((app, i) => {
  if (i % 4 === 3) return; // some applications have no conversation yet
  const thread = THREADS[i % THREADS.length];
  const managerId = managerUserId(app.account_manager.id);
  thread.forEach((line, k) => {
    const isLast = k === thread.length - 1;
    const created = daysAgo((i % 9) + (thread.length - k) * 0.6, k);
    seed.push({
      id: `msg_${app.id.slice(4)}_${k + 1}`,
      application_id: app.id,
      sender_id: line.from === "partner" ? app.partner.user_id : managerId,
      sender_name: line.from === "partner" ? app.partner.name : app.account_manager.name,
      message_text: line.text,
      created_at: created,
      // The latest message is unread on roughly half the conversations.
      read_at: isLast && i % 2 === 0 ? null : daysAgo(i % 9, -1),
    });
  });
});

export const messages = table<ChatMessage>(seed);

const threadFor = (appId: string) =>
  messages
    .all()
    .filter((m) => m.application_id === appId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

mock.get("/applications/:id/messages", ({ params, query }) => {
  let items = threadFor(params.id);
  if (query.since) items = items.filter((m) => m.created_at > String(query.since));
  const limit = Number(query.limit) || 50;
  return { items: items.slice(-limit) };
});

mock.post("/applications/:id/messages", ({ params, body }) => {
  const app = APPLICATIONS.find((a) => a.id === params.id);
  if (!app) throw httpError(404, "Application not found");
  const text = String(body?.message_text ?? "").trim();
  if (!text) throw httpError(422, "Message text is required");
  const isPartner = currentUserId() === app.partner.user_id;
  return messages.insert({
    id: newId("msg"),
    application_id: app.id,
    sender_id: currentUserId(),
    sender_name: isPartner ? app.partner.name : "Demo User",
    message_text: text,
    created_at: new Date().toISOString(),
    read_at: null,
  });
});

mock.put("/applications/:id/messages/:messageId/read", ({ params }) => {
  const msg = messages.find(params.messageId);
  if (!msg || msg.application_id !== params.id) throw httpError(404, "Message not found");
  if (!msg.read_at) messages.update(msg.id, { read_at: new Date().toISOString() });
  return msg;
});

mock.get("/applications/:id/unread-count", ({ params }) => {
  const me = currentUserId();
  return { count: threadFor(params.id).filter((m) => m.read_at === null && m.sender_id !== me).length };
});
