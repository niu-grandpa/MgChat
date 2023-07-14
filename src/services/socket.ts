import { signData, verifyToken } from '@/utils';
import { io } from 'socket.io-client';
import pkg from '../../package.json';
import { MessageLogType, SendMessage } from './typing';

const socket = io(pkg.debug.env.SERVER_URL);

socket.on('connect', function () {
  console.log('Connected to server');
});

/**
 * 接收来自好友的消息
 * @param received
 */
export const receiveFriendMessages = (
  received: (data: MessageLogType) => void
) => {
  if (!socket.hasListeners('receive-friend-message')) {
    socket.on('receive-friend-message', (token: string) =>
      received(verifyToken(token)!)
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
