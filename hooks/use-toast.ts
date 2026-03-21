"use client";

import { useState, useEffect } from "react";

export type ToastVariant = "default" | "destructive" | "success";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners: Set<Listener> = new Set();

function emit() {
  listeners.forEach((l) => l([...toasts]));
}

export function toast(props: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  const duration = props.duration ?? 3500;
  toasts = [...toasts, { id, ...props }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

export function useToast() {
  const [list, setList] = useState<Toast[]>(toasts);

  useEffect(() => {
    const listener: Listener = (t) => setList(t);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const dismiss = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  };

  return { toasts: list, toast, dismiss };
}
