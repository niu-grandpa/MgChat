import { UserInfo } from '@/services/typing';
import { create } from 'zustand';

type UseUserStore = {
  data: UserInfo | null;
  setState: (state: UserInfo) => void;
};

export const useUserStore = create<UseUserStore>(set => ({
  data: null,
  setState: (state: UserInfo) => set(state as any, true),
}));
