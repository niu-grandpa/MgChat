import { io } from 'socket.io-client';
import pkg from '../../package.json';
import { ReceivedMsgData, SendMsgData } from './typing';

const socket = io(pkg.debug.env.SERVER_URL);

/**
 * @description
 * 为了实现1v1聊天就需要用户提前加入好友列表所有好友的房间，
 * 且房间号以用户uid+好友uid组成确保号码唯一性，
 * 使得一个用户房间不会有多个好友同时存在，避免消息错误的广播。
 *
 * 房间号格式: ${uid}-${friend}
 */
export const joinFriendRoom = () => {
  //
};

/**
 * 向好友发起会话
 * @param data 客户端发送的数据
 * @param success 接收服务端处理后的数据
 */
export const sendMsgToFriend = (
  data: SendMsgData,
  success: (data: ReceivedMsgData) => void
) => {
  socket.emit('send-msg-to-frd', data).on('send-frd-success', success);
};

/**
 * 接收来自好友的消息
 * @param received
 */
export const receiveFriendMsg = (received: (data: ReceivedMsgData) => void) => {
  socket.on('receive-frd-msg', received);
};
