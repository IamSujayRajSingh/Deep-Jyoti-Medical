// Restored for local development: this file was missing from the export.
// A small global toast store (same API as the shadcn/ui `useToast` hook) that
// feeds the existing <Toaster /> in toaster.jsx.
import { useEffect, useState } from "react";

const TOAST_LIMIT = 3;
const TOAST_DURATION = 5000;

let count = 0;
let memoryState = { toasts: [] };
const listeners = new Set();
const timers = new Map();

function setState(next) {
  memoryState = next;
  listeners.forEach((listener) => listener(memoryState));
}

function dismiss(toastId) {
  const ids = toastId ? [toastId] : memoryState.toasts.map((t) => t.id);
  ids.forEach((id) => {
    clearTimeout(timers.get(id));
    timers.delete(id);
  });
  setState({ toasts: memoryState.toasts.filter((t) => !ids.includes(t.id)) });
}

function toast({ duration = TOAST_DURATION, ...props }) {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  const id = String(count);

  const update = (next) =>
    setState({ toasts: memoryState.toasts.map((t) => (t.id === id ? { ...t, ...next } : t)) });

  const toasts = [{ ...props, id }, ...memoryState.toasts];
  toasts.slice(TOAST_LIMIT).forEach((t) => {
    clearTimeout(timers.get(t.id));
    timers.delete(t.id);
  });
  setState({ toasts: toasts.slice(0, TOAST_LIMIT) });

  if (duration !== Infinity) {
    timers.set(id, setTimeout(() => dismiss(id), duration));
  }

  return { id, dismiss: () => dismiss(id), update };
}

function useToast() {
  const [state, setLocalState] = useState(memoryState);

  useEffect(() => {
    listeners.add(setLocalState);
    return () => {
      listeners.delete(setLocalState);
    };
  }, []);

  return { ...state, toast, dismiss };
}

export { useToast, toast };
