"use client";

import { useEffect, useRef, useState } from "react";

interface UseFileDropOptions {
  /** Called with the dropped files (never empty). */
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

/**
 * Drag-and-drop plumbing for a file drop target. Uses a counter to ignore
 * dragenter/leave events bubbling from child elements, so the drag-over
 * state doesn't flicker. Spread `dropHandlers` onto the drop target and
 * style it off `isDragging`.
 */
export function useFileDrop({ onFiles, disabled = false }: UseFileDropOptions) {
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // While an uploader is on the page, a file dropped anywhere else is ignored
  // instead of the browser opening it (which leaves the page and loses the form).
  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const block = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    dragCounter.current++;
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) onFiles(files);
  };

  return {
    isDragging,
    dropHandlers: { onDragEnter, onDragLeave, onDragOver, onDrop },
  };
}
