import NavBar from '@/components/NavBar';
import { useUserData } from '@/model';
import { Layout } from 'antd';
import { ipcRenderer } from 'electron';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ContentPanel from './component/ContentPanel';
import SiderToolsBar from './component/SiderToolsBar';
import './index.scss';

const { Sider } = Layout;

function UserPanel() {
  const { state } = useLocation() as { state: { login: boolean } };
  const userModel = useUserData();
  const data = useMemo(() => userModel.get(), [userModel]);

  const [tab, setTab] = useState(0);

  const changeWinShape = useCallback(() => {
    ipcRenderer.send('resize-win', {
      pathname: '/',
      width: 220,
      height: 660,
      resizable: true,
    });
    ipcRenderer.send('adjust-win-pos', {
      pathname: '/',
      top: 60,
      leftDelta: 320,
    });
  }, []);

  useEffect(() => {
    if (state.login) {
      changeWinShape();
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
      <Sider width={46} className='user-siderbar'>
        <SiderToolsBar onChange={setTab} />
      </Sider>
    </Layout>
  );
}

export default UserPanel;
