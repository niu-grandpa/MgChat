import ActionBar from '@/components/ActionBar';
import { Tabs, TabsProps } from 'antd';
import { useParams } from 'react-router-dom';
import FindGroup from './FindGroup';
import FindPeople from './FindPeople';
import './index.scss';

const tabItems: TabsProps['items'] = [
  { label: '找人', children: <FindPeople />, key: 'p' },
  { label: '找群', children: <FindGroup />, key: 'g' },
];

function Find() {
  const { data } = useParams();
  return (
    <Tabs
      size='large'
      animated
      defaultActiveKey='p'
      className='find-tabs'
      items={tabItems}
      tabBarExtraContent={<ActionBar pathname={`/find/${data}`} />}
    />
  );
}

export default Find;
