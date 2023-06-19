import { UserInfo, UserMessage } from '@/services/typing';
import { create } from 'zustand';

type UseUserData = {
  data: UserInfo | null;
  msgList: Map<string, UserMessage>;
  get: <T>(type: 'user' | 'msgList') => T;
  saveUser: (data: UserInfo) => void;
  setMsgList: (data: UserMessage) => void;
  deleteMsg: (key: string) => void;
};

export const useUserData = create<UseUserData>((set, _get) => ({
  data: null,
  msgList: new Map(),

  saveUser: data => set({ data }),

  // @ts-ignore
  get: (type: 'user' | 'msgList') => {
    return type === 'user' ? _get().data : _get().msgList;
  },

  setMsgList: data => {
    const { msgList } = _get();
    msgList.set(data.who, data);
    set({ msgList });
  },

  deleteMsg: key => {
    const { msgList } = _get();
    msgList.delete(key);
    set({ msgList });
  },
}));
