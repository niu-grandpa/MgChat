import { SearchOutlined } from '@ant-design/icons';
import Input from 'antd/es/input/Input';
import { memo } from 'react';

function TabPanel({ index }: { index: number }) {
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
    </section>
  );
}

export default memo(TabPanel);
