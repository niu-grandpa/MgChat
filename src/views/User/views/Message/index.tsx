import { useUserStore } from '@/model';
import { msgApi } from '@/services';
import { GetLocalMessageLogs, MessageLogs } from '@/services/typing';
import { verifyToken } from '@/utils';
import { message } from 'antd';
import { ipcRenderer } from 'electron';
import { useCallback, useEffect, useRef, useState } from 'react';
import MessageList from './MessageList';

function MessageView() {
  const { userData } = useUserStore(state => ({ userData: state.data }));

  const uid = useRef(userData!.uid);

  const [messageList, setMessageList] = useState<MessageLogs[]>([]);

  // 同步用户远程聊天数据
  const syncRemoteMessage = useCallback(async () => {
    const { data: token } = await msgApi.syncUserMessage(uid.current);
    const data = verifyToken<MessageLogs[]>(token);
    setMessageList([...data]);
  }, []);

  // 同步本地缓存聊天数据
  const syncLocalMessages = useCallback(() => {
    const getLocalMessages = (_: any, { code, data }: GetLocalMessageLogs) => {
      if (code === 500) {
        message.error('同步本地消息数据失败');
        return;
      }
      if (code === 200) {
        const map: Map<string, MessageLogs> = JSON.parse(data);
        setMessageList(prev => [...prev, ...map.values()]);
      }
    };
    ipcRenderer.send('load-friend-messages', uid.current);
    ipcRenderer.once('get-friend-messages', getLocalMessages);
  }, []);

  // 实时收取消息
  const receiveMessageInRealTime = useCallback(async () => {
    // 当sokect触发"receive-friend-message"事件时，说明广播中有新消息，
    // 开启一个周期2分钟的轮询间隔1s重复请求消息接口，实时监听是否有给自己的新消息
  }, []);

  useEffect(() => {
    uid.current = userData!.uid;
    try {
      syncRemoteMessage()
        .then(syncLocalMessages)
        .then(receiveMessageInRealTime);
    } catch (error) {
      message.error('处理消息数据时发生错误');
      console.error(error);
    }
  }, []);

  const handleOpenChat = useCallback(({ logs, ...info }: MessageLogs) => {
    ipcRenderer.send('open-win', {
      pathname: `/chat/${JSON.stringify(info)}`,
      width: 560,
      height: 500,
    });
  }, []);

  return <MessageList data={messageList} onItemClick={handleOpenChat} />;
}

export default MessageView;
