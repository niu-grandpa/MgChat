import { UserInfo } from '@/services/typing';
import { create } from 'zustand';

interface UseUserData {
  data: UserInfo | null;
  get: () => UserInfo | null;
  save: (data: UserInfo) => void;
}

export const useUserData = create<UseUserData>((set, _get) => ({
  data: null,
  get: () => _get().data,
  save: data => set({ data }),
}));
