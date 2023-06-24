import { Dropdown, MenuProps } from 'antd';
import { memo, useCallback } from 'react';
import Avatar from '../Avatar';
import './index.scss';

type MenuItemKeys =
  | 'copy'
  | 'translate'
  | 'forward'
  | 'reply'
  | 'withdraw'
  | 'delete';

type Props = {
  color: string;
  icon: string;
  content: string;
  placement: 'leftTop' | 'rightTop';
  onAvatarClick: () => void;
  onAvatarDbClick: () => void;
  onMeunItemClick: (key: MenuItemKeys) => void;
};

function ChatBubble({
  icon,
  color,
  content,
  placement,
  onAvatarClick,
  onAvatarDbClick,
  onMeunItemClick,
}: Partial<Props>) {
  placement = placement === 'leftTop' ? 'rightTop' : 'leftTop';

  const handleClick = useCallback(
    ({ key }: any) => onMeunItemClick?.(key),
    [onMeunItemClick]
  );

  const items: MenuProps['items'] = [
    { label: '复制', key: 'copy', onClick: handleClick },
    { label: '翻译', key: 'translate', onClick: handleClick },
    { label: '转发', key: 'forward', onClick: handleClick },
    { label: '回复', key: 'reply', onClick: handleClick },
    { label: '撤回', key: 'withdraw', onClick: handleClick },
    { label: '删除', key: 'delete', onClick: handleClick },
  ];

  const elements = [
    <li key='asd'>
      <section
        className={`ant-tooltip chat-bubble-tooltip-${placement} css-dev-only-do-not-override-15rg2km ant-tooltip-placement-${placement}`}>
        <span className='ant-tooltip-arrow' />
        <div className='ant-tooltip-content'>
          <div className='ant-tooltip-inner' style={{ background: color }}>
            {content}
          </div>
        </div>
      </section>
    </li>,
    <li
      key='dsa'
      className='chat-bubble-icon'
      onContextMenu={e => e.stopPropagation()}
      onDoubleClick={() => onAvatarDbClick?.()}>
      <Avatar
        {...{ icon }}
        onClick={e => {
          e?.stopPropagation();
          onAvatarClick?.();
        }}
      />
    </li>,
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={['contextMenu']}
      overlayStyle={{ width: 90, zIndex: 99999 }}>
      <ul className={`chat-bubble ${placement}`}>
        {placement === 'rightTop' ? elements.reverse() : elements}
      </ul>
    </Dropdown>
  );
}

export default memo(ChatBubble);
