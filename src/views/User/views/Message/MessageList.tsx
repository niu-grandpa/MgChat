import Avatar from '@/components/Avatar';
import { MessageLogs } from '@/services/typing';
import { formatDate } from '@/utils';
import { PushpinOutlined } from '@ant-design/icons';
import { Badge, List } from 'antd';
import VirtualList from 'rc-virtual-list';
import { memo } from 'react';
import './index.scss';

type Props = {
  itemKey: string;
  data: MessageLogs[];
  onItemClick: (data: MessageLogs) => void;
};

function MessageList({ data, itemKey, onItemClick }: Props) {
  return (
    <List className='msg-list' size='small' split={false}>
      <VirtualList height={660 - 36} {...{ itemKey, data }}>
        {(item: MessageLogs) => {
          const { logs, icon, nickname } = item;
          // 每一项只需要显示最后一条消息数据
          const { content, image, createTime } = logs[logs.length - 1];
          // 统计所有未读消息数量
          const { length: count } = logs.filter(
            ({ isRead }) => isRead === false
          );

          return (
            <List.Item
              key={(item as any)[itemKey]}
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
