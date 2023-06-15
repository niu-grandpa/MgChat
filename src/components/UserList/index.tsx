import { mainWinSize } from '@/views/User';
import { Badge, Empty, List } from 'antd';
import { eq } from 'lodash';
import VirtualList from 'rc-virtual-list';
import { memo, useCallback } from 'react';
import Avatar from '../Avatar';
import './index.scss';

type Props = {
  type: 'message' | 'user' | 'group';
  data: any[];
  onItemDbClick?: (uid: number) => void;
};

const height = mainWinSize.height - 36;

function UserList({ type, data, onItemDbClick }: Props) {
  const handleOpenChat = useCallback(
    (uid: number) => onItemDbClick?.(uid),
    [onItemDbClick]
  );

  return (
    <List size='small' split={false}>
      {!data.length ? (
        <Empty
          style={{ marginBlock: '80%' }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description='快去找好友聊天叭~'
        />
      ) : (
        <VirtualList data={data} itemKey='uid' itemHeight={47} height={height}>
          {item => (
            <List.Item
              key={item.uid}
              onDoubleClick={() => handleOpenChat(item.uid)}>
              <List.Item.Meta
                avatar={
                  <div className='list-avatar'>
                    <Avatar
                      icon={item.icon}
                      size={eq(type, 'group') ? 'small' : 'large'}
                    />
                  </div>
                }
                title={
                  <>
                    {eq(type, 'message') ? (
                      <>
                        <sub className='list-info-time'>19:00</sub>
                        <Badge
                          count={item.content.length}
                          size='small'
                          offset={[-6, 26]}>
                          {item.name}
                        </Badge>
                      </>
                    ) : (
                      item.name
                    )}
                  </>
                }
                description={
                  eq(type, 'message') ? <small>{item.content}</small> : null
                }
              />
            </List.Item>
          )}
        </VirtualList>
      )}
    </List>
  );
}

export default memo(UserList);
