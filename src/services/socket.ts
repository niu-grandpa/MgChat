import { signData } from '@/utils';
import { io } from 'socket.io-client';
import pkg from '../../package.json';
import { SendMessage } from './typing';

const socket = io(pkg.debug.env.SERVER_URL);

socket.on('connect', function () {
  console.log('Connected to server');
});

/**
 * 接收来自好友的消息
 * @param received
 */
export const friendMessagesUpdated = (callback: (res: any) => void) => {
  if (!socket.hasListeners('receive-friend-message')) {
    socket.on(
      'receive-friend-message',
      (res: { state: 'ok' | 'fali'; error?: any }) => callback(res)
    );
  }
};

/**
 * 发送消息
 * @param data 客户端发送的数据
 * @param success 接收服务端处理后的数据
 */
export const sendMessageToFriend = (data: SendMessage) => {
  const newData = signData(data);
  socket.emit('message', newData);
};
