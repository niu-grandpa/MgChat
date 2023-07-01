import { useUserStore } from '@/model';
import { msgApi, realTimeService } from '@/services';
import { MessageType } from '@/services/enum';
import {
  MessageLogType,
  MessageLogs,
  ReceivedMessage,
} from '@/services/typing';
import { ipcRenderer } from 'electron';
import { useCallback, useEffect, useState } from 'react';
import MessageList from './MessageList';

function MessageView() {
  const { userData } = useUserStore(state => ({ userData: state.data }));
  const [logs, setLogs] = useState<MessageLogs[]>([]);

  // 从本地缓存获取所有聊天记录
  useEffect(() => {
    ipcRenderer.send('request-chat-data', '8549947001');
    ipcRenderer.on('get-chat-data', onGetData);
    return () => {
      ipcRenderer.off('get-chat-data', onGetData);
    };
  }, []);

  const onGetData = useCallback(
    (_: any, data: Record<string, MessageLogType[]> & { code: number }) => {
      console.log(data);
    },
    []
  );

  // 节流优化
  const onGetBroadcastData = useCallback(
    (data: ReceivedMessage) => {
      const { type, from, to, detail, ...rest1 } = data;
      // 只关注好友消息
      if (type !== MessageType.FRIEND_MSG) return;
      const toMe = to === userData?.uid;
      const fromMe = from === userData?.uid;
      // 监听广播消息中from或to都是自身uid的数据。
      if (toMe || fromMe) {
        const { icon, nickname, ...rest2 } = detail;
        const data = { from, to, ...rest1, ...rest2 };

        let uid = toMe ? to : from;
        let friend = fromMe ? to : from;

        // 本地存储
        ipcRenderer.send('post-chat-data', { uid, friend, data });

        // 服务器存储
        msgApi.save({
          uid,
          friend,
          icon,
          nickname,
          logs: [data],
        });
      }
    },
    [userData?.uid]
  );

  useEffect(() => {
    realTimeService.receiveMessage(onGetBroadcastData);
  }, [onGetBroadcastData]);

  // 与好友聊天时，把uid和好友uid传给聊天窗口去查询记录。
  const handleOpenChat = useCallback(({ logs, ...info }: MessageLogs) => {
    ipcRenderer.send('open-win', {
      pathname: `/chat/${JSON.stringify(info)}`,
      width: 560,
      height: 500,
    });
  }, []);

  return <MessageList data={logs} onItemClick={handleOpenChat} />;
}

export default MessageView;
