import { UserInfo } from '@/services/typing';
import { create } from 'zustand';

export const useUserStore = create<{
  data: UserInfo | null;
  setState: (state: UserInfo) => void;
}>(set => ({
  data: null,
  setState: (state: UserInfo) => set({ data: state }, true),
}));

export const isAutoLogin = create<{
  count: number;
  setCount: (v: number) => void;
}>(set => ({
  count: 0,
  setCount: count => set({ count }),
}));
