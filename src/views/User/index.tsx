import NavBar from '@/components/NavBar';
import { useUserData } from '@/model';
import { UserInfo } from '@/services/typing';
import { Layout } from 'antd';
import { ipcRenderer } from 'electron';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import RightOptionBar from './components/RightOptionBar';
import './index.scss';

const { Sider } = Layout;

function UserView() {
  const { state } = useLocation() as { state: { login: boolean } };

  const userModel = useUserData();
  const userData = useMemo(() => userModel.get<UserInfo>('user'), [userModel]);

  const [tab, setTab] = useState(0);

  const handleChangeShape = useCallback(() => {
    ipcRenderer.send('resize-win', {
      pathname: '/',
      width: 295,
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
    if (state && state.login) handleChangeShape();
  }, [state, handleChangeShape]);

  return (
    <Layout className='user'>
      <Sider width={251} className='user-main'>
        <div className='user-main-nav'>
          <NavBar />
        </div>
        <Outlet />
      </Sider>
      <Sider width={46} className='user-siderbar'>
        <RightOptionBar
          status={userData.status}
          icon={userData.icon}
          onChange={setTab}
        />
      </Sider>
    </Layout>
  );
}

export default UserView;
