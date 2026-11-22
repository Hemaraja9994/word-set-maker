import { create } from "zustand";

interface ToastState { message: string | null; show: (m: string) => void; clear: () => void }
let timer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>(set => ({
  message: null,
  show: m => { clearTimeout(timer); set({ message: m }); timer = setTimeout(() => set({ message: null }), 2600); },
  clear: () => set({ message: null })
}));

export const toast = (m: string): void => useToast.getState().show(m);
