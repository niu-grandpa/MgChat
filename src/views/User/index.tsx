import NavBar from '@/components/NavBar';
import { Layout } from 'antd';
import { ipcRenderer } from 'electron';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ContentPanel from './component/ContentPanel';
import SiderToolsBar from './component/SiderToolsBar';
import './index.scss';

const { Sider } = Layout;

function UserPanel() {
  const { state } = useLocation() as { state: { login: boolean } };

  const [tab, setTab] = useState(0);

  const changeWinShape = useCallback(() => {
    ipcRenderer.send('resize-win', {
      key: 'main',
      width: 300,
      height: 660,
      resizable: true,
    });
    ipcRenderer.send('set-position', {
      key: 'main',
      marginRight: 320,
      y: 60,
    });
  }, []);

  useEffect(() => {
    if (state.login) {
      const userData = JSON.parse(sessionStorage.getItem('temporary') || '{}');
      changeWinShape();
      console.log(userData);
    }
  }, [state]);

  return (
    <Layout className='user'>
      <Sider width={251} className='user-main'>
        <div className='user-main-nav'>
          <NavBar />
        </div>
        <ContentPanel index={tab} />
      </Sider>
      <Sider width={52} className='user-siderbar'>
        <SiderToolsBar onChange={setTab} />
      </Sider>
    </Layout>
  );
}

export default UserPanel;
