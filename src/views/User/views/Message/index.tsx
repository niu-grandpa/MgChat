import { useUserStore } from '@/model';
import { realTimeService } from '@/services';
import { MessageType } from '@/services/enum';
import {
  FileMessageLogs,
  MessageLogs,
  ReceivedMessage,
} from '@/services/typing';
import { ipcRenderer } from 'electron';
import { throttle } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import MessageList from './MessageList';

function MessageView() {
  const { userData } = useUserStore(state => ({ userData: state.data }));

  const uid = useMemo(() => userData?.uid, [userData]);

  const [buffer, setBuffer] = useState<MessageLogs[]>([]);
  const [msgHistory, setMsgHistory] = useState<MessageLogs[]>([]);

  // 从本地缓存获取所有聊天记录
  useEffect(() => {
    const onGetHistory = (_: any, data: FileMessageLogs) => {
      if (data.code !== 200) return;
      const newHistory = Object.keys(data).map(key => {
        const item = data[key] as any;
        return {
          uid,
          friend: key,
          ...item,
        };
      });
      setMsgHistory(v => [...v, ...newHistory]);
    };
    if (uid) {
      ipcRenderer.send('request-chat-data', uid);
      ipcRenderer.once('get-chat-data', onGetHistory);
    }
  }, [uid]);

  const onGetBroadcastData = useCallback(
    (data: ReceivedMessage) => {
      const { type, icon, nickname, detail } = data;
      const { from, to } = detail;
      if (type !== MessageType.FRIEND_MSG) return;
      const toMe = to === uid;
      const fromMe = from === uid;
      // 监听广播消息中from或to都是自身uid的数据。
      if (toMe || fromMe) {
        let uid = toMe ? to : from;
        let friend = fromMe ? to : from;
        // 存储到缓冲区
        setBuffer(v => [
          ...v,
          {
            uid,
            friend,
            icon,
            nickname,
            logs: [detail],
          },
        ]);
      }
    },
    [uid]
  );

  useEffect(() => {
    realTimeService.receiveMessage(onGetBroadcastData);
  }, [onGetBroadcastData]);

  // 节流优化
  const onCachedMessages = useCallback(
    throttle(() => {
      buffer.forEach(item => {
        // 服务器存储 vip
        // msgApi.save(item);
        // 本地存储
        ipcRenderer.send('post-chat-data', item);
      });
    }, 1000),
    []
  );

  useEffect(() => {
    if (buffer.length) {
      onCachedMessages();
    }
  }, [buffer, onCachedMessages]);

  const handleOpenChat = useCallback(({ logs, ...info }: MessageLogs) => {
    ipcRenderer.send('open-win', {
      pathname: `/chat/${JSON.stringify(info)}`,
      width: 560,
      height: 500,
    });
  }, []);

  return <MessageList data={msgHistory} onItemClick={handleOpenChat} />;
}

export default MessageView;
