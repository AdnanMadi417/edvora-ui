"use client";

import { useState, type FormEvent } from "react";
import { StickyNote } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import SectionCard, { type SectionCardState } from "components/ub/data/cards/SectionCard";
import Timeline from "components/ub/data/display/Timeline";
import Textarea from "components/ub/forms/text/Textarea";

export interface NoteItem {
  id: string;
  author: string;
  body: string;
  /** ISO date-time. */
  at: string;
}

export interface NotesPanelProps {
  notes: NoteItem[];
  /** Adds a note; omit for read-only viewers. Resolve when saved. */
  onAdd?: (body: string) => Promise<void> | void;
  state?: SectionCardState;
  onRetry?: () => void;
  now?: Date;
  className?: string;
}

/**
 * Internal notes for the Unibexs team and the Advisor. Never render this in
 * the Glass Box (student view).
 */
export default function NotesPanel({ notes, onAdd, state = "ready", onRetry, now, className }: NotesPanelProps) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !onAdd) return;
    setSaving(true);
    try {
      await onAdd(body);
      setDraft("");
    } finally {
      setSaving(false);
    }
  };

  const resolved = state === "ready" && notes.length === 0 && !onAdd ? "empty" : state;
  return (
    <SectionCard
      title="Notes"
      description="Internal. Not shown in the Glass Box."
      state={resolved}
      empty={{ icon: StickyNote, title: "No notes yet" }}
      errorMessage="Notes couldn't load."
      onRetry={onRetry}
      className={className}
    >
      {notes.length > 0 && <Timeline grouped={false} now={now} aria-label="Notes" events={notes.map((n) => ({ id: n.id, title: n.author, description: <p className="whitespace-pre-wrap">{n.body}</p>, at: n.at }))} />}
      {onAdd && (
        <form onSubmit={submit} className={notes.length ? "mt-4 grid gap-2" : "grid gap-2"}>
          <Textarea
            label="Add a note"
            rows={3}
            value={draft}
            onChange={setDraft}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" text="Save note" loading={saving} disabled={!draft.trim()} />
          </div>
        </form>
      )}
    </SectionCard>
  );
}
