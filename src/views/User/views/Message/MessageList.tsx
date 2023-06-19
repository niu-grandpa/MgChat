import Avatar from '@/components/Avatar';
import { UserMessage } from '@/services/typing';
import { formatDate } from '@/utils';
import { PushpinOutlined } from '@ant-design/icons';
import { Badge, List } from 'antd';
import VirtualList from 'rc-virtual-list';
import { memo } from 'react';
import './index.scss';

type Props = {
  itemKey: string;
  data: UserMessage[];
  onItemClick: (data: UserMessage) => void;
};

function MessageList({ data, itemKey, onItemClick }: Props) {
  return (
    <List className='msg-list' size='small' split={false}>
      <VirtualList height={660 - 36} {...{ itemKey, data }}>
        {(item: UserMessage) => {
          const { message, icon, nickname } = item;
          const { content, image, createTime } = message[message.length - 1];

          const { length: count } = message.filter(
            ({ isRead }) => isRead === false
          );

          return (
            <List.Item
              key={
                // @ts-ignore
                item[itemKey]
              }
              onDoubleClick={() => onItemClick(item)}>
              <List.Item.Meta
                avatar={
                  <Badge {...{ count }} size='small' offset={[-36, 4]}>
                    <Avatar size={42} src={icon} />
                  </Badge>
                }
                title={nickname}
                description={image ? '[图片]' : content}
              />
              <section className='msg-list-extra'>
                <small>{formatDate(createTime)}</small>
                <div>
                  <PushpinOutlined />
                </div>
              </section>
            </List.Item>
          );
        }}
      </VirtualList>
    </List>
  );
}

export default memo(MessageList);
