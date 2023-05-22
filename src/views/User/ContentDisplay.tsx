import Avatar from '@/components/Avatar';
import { Divider } from 'antd';
import { memo } from 'react';

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

function ContentDisplay() {
  return (
    <>
      <Divider plain dashed>
        2023/5/15 13:04:46
      </Divider>
      <div className='content-display-left'>
        <Avatar />
        <Bubble placement='left' content='顺便' />
      </div>
      <div className='content-display-right'>
        <Bubble placement='right' content='我擦，你听到没的说话码' />
        <Avatar />
      </div>
    </>
  );
}

export default memo(ContentDisplay);
