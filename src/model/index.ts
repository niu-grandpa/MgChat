import { UserInfo } from '@/services/typing';
import { create } from 'zustand';

type UseUserData = {
  data: UserInfo | null;
  get: () => UserInfo | null;
  saveUser: (data: UserInfo) => void;
};

export const useUserData = create<UseUserData>((set, _get) => ({
  data: null,
  saveUser: data => set({ data }),
  // @ts-ignore
  get: () => _get().data,
}));
