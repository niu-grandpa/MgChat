import UserList from '@/components/UserList';
import { UserMsgList } from '@/services/typing';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { ipcRenderer } from 'electron';
import { memo, useCallback, useState } from 'react';

const mock = [
  {
    uid: 0,
    name: '谋生额',
    gender: 'm',
    icon: '',
    timestamp: 1684997928239,
    content: ['给你发了条新消息'],
  },
  {
    uid: 1,
    name: '谋生额',
    gender: 'm',
    icon: '',
    timestamp: 1684997928239,
    content: ['给你发了条新消息'],
  },
];

function TabPanel({ index }: { index: number }) {
  //@ts-ignore
  const [data, setData] = useState<UserMsgList[]>(mock);

  const handleOpenChat = useCallback((uid: number) => {
    ipcRenderer.send('open-win', {
      pathname: 'chat',
      title: '聊天',
      frame: false,
      alive: true,
      width: 580,
      height: 520,
      search: `uid=${uid}`,
    });
  }, []);

  return (
    <section className='panel'>
      <div className='panel-search'>
        <Input
          size='small'
          bordered={false}
          prefix={<SearchOutlined />}
          placeholder='搜索'
          allowClear
          style={{ width: 160 }}
        />
      </div>
      <UserList type='message' data={data} onItemDbClick={handleOpenChat} />
    </section>
  );
}

export default memo(TabPanel);
