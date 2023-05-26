import Avatar from '@/components/Avatar';
import NetAlert from '@/components/NetAlert';
import { Divider, Layout } from 'antd';
import { memo } from 'react';

export type ChatMessageProps = {
  message: {
    role: 'me' | 'other';
    content: string;
    images: string[];
    timestamp: number;
  };
};

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

function ChatDisplay({ message }: ChatMessageProps) {
  // [
  //  {role: 'me', content: '', images: [], timestamp: 0},
  //  {role: 'other', content: '', images: [], timestamp: 0},
  // ]
  // 收集消息

  return (
    <>
      <NetAlert />
      <Layout.Content className='chat-display'>
        <Divider plain dashed>
          2023/5/15 13:04:46
        </Divider>
        <div className='chat-display-left'>
          <Avatar />
          <Bubble placement='left' content='顺便' />
        </div>
        <div className='chat-display-right'>
          <Bubble placement='right' content='我擦，你听到没的说话码' />
          <Avatar />
        </div>
      </Layout.Content>
    </>
  );
}

export default memo(ChatDisplay);
