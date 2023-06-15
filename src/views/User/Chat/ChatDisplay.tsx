import Avatar from '@/components/Avatar';
import NetAlert from '@/components/NetAlert';
import { MessageData } from '@/services/enum';
import { Divider, Layout } from 'antd';
import { memo, useEffect, useState } from 'react';

const Bubble = memo(
  ({ content, placement }: { content: string; placement: string }) => (
    <div className={`bubble bubble-placement-${placement}`}>
      <div className='bubble-arrow' />
      <div className='bubble-content'>
        <div className='bubble-inner'>{content}</div>
      </div>
    </div>
  )
);

function ChatDisplay({ message }: { message?: MessageData }) {
  // 收集消息
  const [msgList, setMsgList] = useState<MessageData[]>([]);

  useEffect(() => {
    if (message !== undefined) {
      setMsgList(v => (v.push(message as MessageData), v.slice()));
    }
  }, [message]);

  return (
    <>
      <NetAlert />
      <Layout.Content className='chat-display'>
        <Divider plain dashed>
          2023/5/15 13:04:46
        </Divider>
        {msgList.map(item => {
          const placement = item.role === MessageRoles.ME ? 'right' : 'left';
          return (
            <div className={`chat-display-${placement}`} key={item.timestamp}>
              <Avatar icon={item.icon} />
              <Bubble placement={placement} content={item.content} />
            </div>
          );
        })}
      </Layout.Content>
    </>
  );
}

export default memo(ChatDisplay);
