import UserList from '@/components/UserList';
import { UserMsgList } from '@/services/typing';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { ipcRenderer } from 'electron';
import { memo, useCallback, useState } from 'react';

function TabPanel({ index }: { index: number }) {
  const [data, setData] = useState<UserMsgList[]>([]);

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
