import { create } from 'zustand';

export const useUserInfo = create((set, get) => ({
  clear: () => set({}, true),
}));
