import UserList from '@/components/UserList';
import { ipcRenderer } from 'electron';
import { memo, useCallback, useState } from 'react';

function TabPanel({ index }: { index: number }) {
  const [list, setList] = useState<[]>([]);

  const handleItemClick = useCallback((uid: number) => {
    ipcRenderer.send('open-win', {
      pathname: '/chat',
      title: '聊天',
      width: 580,
      height: 520,
      keepAlive: true,
    });
  }, []);

  return (
    <section className='panel'>
      {/* <div className='panel-search'>
        <Input
          size='small'
          bordered={false}
          prefix={<SearchOutlined />}
          placeholder='搜索'
          allowClear
          style={{ width: 160 }}
        />
      </div> */}
      <UserList type='message' data={list} onItemDbClick={handleItemClick} />
    </section>
  );
}

export default memo(TabPanel);
