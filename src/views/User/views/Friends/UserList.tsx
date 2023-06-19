import Avatar from '@/components/Avatar';
import { FriendsInfo } from '@/services/typing';
import { List } from 'antd';
import VirtualList from 'rc-virtual-list';
import { memo } from 'react';

type Props = {
  itemKey: string;
  data: FriendsInfo[];
};

function UserList({ data, itemKey }: Props) {
  return (
    <List>
      <VirtualList height={660 - 36} itemHeight={47} {...{ data, itemKey }}>
        {(item: FriendsInfo) => (
          <List.Item
            key={
              // @ts-ignore
              item[itemKey]
            }>
            <List.Item.Meta
              avatar={<Avatar size='small' src={item.icon} />}
              title={item.nickname}
            />
          </List.Item>
        )}
      </VirtualList>
    </List>
  );
}

export default memo(UserList);
