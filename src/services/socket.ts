import { signData, verifyToken } from '@/utils';
import { io } from 'socket.io-client';
import pkg from '../../package.json';
import { ReceivedMessage, SendMessage } from './typing';

const socket = io(pkg.debug.env.SERVER_URL);

socket.on('connect', function () {
  console.log('Connected to server');
});

/**
 * 接收来自好友/群聊的消息
 * @param received
 */
export const receiveMessage = (received: (data: ReceivedMessage) => void) => {
  if (!socket.hasListeners('receive-message')) {
    socket.on('receive-message', (token: string) =>
      received(verifyToken(token)!)
    );
  }
};

/**
 * 发送消息
 * @param data 客户端发送的数据
 * @param success 接收服务端处理后的数据
 */
export const sendMessage = (
  data: SendMessage,
  success: (data: ReceivedMessage) => void
) => {
  socket
    .emit('message', signData(data))
    .once('send-message-ok', (token: string) => success(verifyToken(token)!));
};

/**
 * @description
 * 实现1v1聊天需要用户提前加入好友列表所有好友的房间，
 * 且房间号以用户uid+好友uid组成确保号码唯一性，
 * 使得一个用户房间不会有多个好友同时存在，避免消息错误的广播。
 *
 * 房间号格式: ${friend}-${uid}
 *
 * 实现群聊则不用上面那样。
 */
// export const joinRoom = (uid: string, friend?: string | string[]) => {
//   let room: string | string[] = '';
//   if (friend) {
//     Array.isArray(friend)
//       ? (room = friend.map(item => `${item}-${uid}`))
//       : (room = uid);
//   }
//   socket.emit('join-frd', room);
// };
