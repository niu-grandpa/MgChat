import { Badge, List, message } from 'antd';
import { ipcRenderer } from 'electron';
import VirtualList from 'rc-virtual-list';
import { memo, useCallback, useEffect, useState } from 'react';
import UAvatar from '../Avatar';
import './index.scss';

interface UserItem {
  email: string;
  gender: string;
  name: {
    first: string;
    last: string;
    title: string;
  };
  nat: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
}

const fakeDataUrl =
  'https://randomuser.me/api/?results=20&inc=name,gender,email,nat,picture&noinfo';
const ContainerHeight = 660 - 36;

type Props = {};

function UserList({}: Props) {
  const [data, setData] = useState<UserItem[]>([]);

  const appendData = () => {
    fetch(fakeDataUrl)
      .then(res => res.json())
      .then(body => {
        setData(data.concat(body.results));
        message.success(`${body.results.length} more items loaded!`);
      });
  };

  const handleOpenChat = useCallback(() => {
    ipcRenderer.send('open-win', {
      pathname: 'chat',
      title: '聊天',
      frame: false,
      alive: true,
      width: 580,
      height: 520,
    });
  }, []);

  useEffect(() => {
    appendData();
  }, []);

  return (
    <List size='small' split={false}>
      <VirtualList
        data={data}
        height={ContainerHeight}
        itemHeight={47}
        itemKey='email'>
        {(item: UserItem) => (
          <List.Item key={item.email} onDoubleClick={handleOpenChat}>
            <List.Item.Meta
              avatar={<UAvatar icon={item.picture.large} size='large' />}
              title={
                <>
                  <sub className='info-time'>19:00</sub>
                  <Badge count={5} size='small' offset={[-6, 18]}>
                    {item.name.last}
                  </Badge>
                </>
              }
              description={item.email}
            />
          </List.Item>
        )}
      </VirtualList>
    </List>
  );
}

export default memo(UserList);
