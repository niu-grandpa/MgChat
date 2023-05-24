import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import { Badge, List } from 'antd';
import { eq } from 'lodash';
import VirtualList from 'rc-virtual-list';
import { memo, useCallback } from 'react';
import UAvatar from '../Avatar';
import './index.scss';

type Props = {
  type: 'message' | 'user' | 'group';
  data: any[];
  onItemDbClick?: () => void;
};

const ContainerHeight = 660 - 36;

function UserList({ type, data, onItemDbClick }: Props) {
  const handleOpenChat = useCallback(() => {
    onItemDbClick?.();
  }, [onItemDbClick]);

  return (
    <List size='small' split={false}>
      <VirtualList
        data={data}
        itemKey='id'
        itemHeight={47}
        height={ContainerHeight}>
        {item => (
          <List.Item key={item.id} onDoubleClick={handleOpenChat}>
            <List.Item.Meta
              avatar={
                <div className='list-avatar'>
                  <UAvatar
                    icon={item.icon}
                    size={eq(type, 'group') ? 'small' : 'large'}
                  />
                  <sub className='list-gender'>
                    {item.gender === 'w' ? (
                      <WomanOutlined twoToneColor='#eb2f96' />
                    ) : item.gender === 'm' ? (
                      <ManOutlined twoToneColor='#1677ff' />
                    ) : (
                      ''
                    )}
                  </sub>
                </div>
              }
              title={
                <>
                  {eq(type, 'message') ? (
                    <>
                      <sub className='list-info-time'>19:00</sub>
                      <Badge count={5} size='small' offset={[-6, 18]}>
                        {item.name}
                      </Badge>
                    </>
                  ) : (
                    item.name
                  )}
                </>
              }
              description={eq(type, 'message') ? item.desc : null}
            />
          </List.Item>
        )}
      </VirtualList>
    </List>
  );
}

export default memo(UserList);
