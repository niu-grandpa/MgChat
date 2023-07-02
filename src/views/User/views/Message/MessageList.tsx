import Avatar from '@/components/Avatar';
import { MessageLogs } from '@/services/typing';
import { formatDate } from '@/utils';
import { PushpinOutlined } from '@ant-design/icons';
import { Badge, Empty, List } from 'antd';
import VirtualList from 'rc-virtual-list';
import { memo, useCallback } from 'react';
import './index.scss';

type Props = {
  data: MessageLogs[];
  onItemClick: (data: MessageLogs) => void;
};

function MessageList({ data, onItemClick }: Props) {
  if (data.length === 0) {
    return (
      <Empty
        style={{
          position: 'absolute',
          top: '36%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        description={false}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }
  const renderItem = useCallback(
    (item: MessageLogs) => {
      const { logs, icon, nickname } = item;
      const { cid, content, image, createTime } = logs[logs.length - 1];
      const { length: count } = logs.filter(({ read }) => read === false);
      return (
        <List.Item key={cid} onDoubleClick={() => onItemClick(item)}>
          <List.Item.Meta
            avatar={
              <Badge count={count} size='small' offset={[-36, 4]}>
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
    },
    [onItemClick]
  );
  return (
    <List className='msg-list' size='small' split={false}>
      <VirtualList
        data={data}
        itemKey='cid'
        height={660 - 36}
        children={renderItem}
      />
    </List>
  );
}

export default memo(MessageList);
