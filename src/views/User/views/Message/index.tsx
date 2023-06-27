import { useUserStore } from '@/model';
import { msgApi, realTimeService } from '@/services';
import { MessageType } from '@/services/enum';
import { MessageLogs, ReceivedMessage } from '@/services/typing';
import { ipcRenderer } from 'electron';
import { useCallback, useEffect } from 'react';
import MessageList from './MessageList';

function MessageView() {
  const { userData } = useUserStore(state => ({ userData: state.data }));

  // 获取所有聊天记录，本地有数据则不请求服务器。
  const onGetMessageLogs = useCallback(() => {}, []);

  const handleBroadcast = useCallback((data: ReceivedMessage) => {
    const { type, from, to, detail, ...rest1 } = data;
    if (type === MessageType.FRIEND_MSG) {
      const toMe = to === userData?.uid;
      const fromMe = from === userData?.uid;
      // 监听广播消息中from或to都是自身uid的数据。
      if (toMe || fromMe) {
        const { icon, nickname, ...rest2 } = detail;
        let uid = toMe ? to : from;
        let friend = fromMe ? to : from;
        msgApi.save({
          uid,
          friend,
          icon,
          nickname,
          logs: [{ from, to, ...rest1, ...rest2 }],
        });
      }
    }
  }, []);

  useEffect(() => {
    realTimeService.receiveMessage(handleBroadcast);
  }, [handleBroadcast]);

  // 与好友聊天时，把uid和好友uid传给聊天窗口去查询记录。
  const handleOpenChat = useCallback(({ logs, ...info }: MessageLogs) => {
    ipcRenderer.send('open-win', {
      pathname: `/chat/${JSON.stringify(info)}`,
      width: 560,
      height: 500,
    });
  }, []);

  return <MessageList data={[]} onItemClick={handleOpenChat} />;
}

export default MessageView;
