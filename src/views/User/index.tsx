import NavBar from '@/components/NavBar';
import { useUserStore } from '@/model';
import { apiHandler, userApi } from '@/services';
import { Layout } from 'antd';
import { ipcRenderer } from 'electron';
import { useCallback, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import pkg from '../../../package.json';
import RightOptionBar from './components/RightOptionBar';
import './index.scss';

const [initW, initH] = pkg.debug.winSize;
const { Sider } = Layout;

function UserView() {
  const navTo = useNavigate();

  const { data } = useUserStore();

  const resizeWindow = useCallback(
    (width: number, height: number, resizable: boolean) => {
      ipcRenderer.send('resize-win', {
        pathname: '/',
        width,
        height,
        resizable,
      });
    },
    []
  );

  const adjustWindowPosition = useCallback(
    (top: number, leftDelta: number, center: boolean) => {
      ipcRenderer.send('adjust-win-pos', {
        pathname: '/',
        top,
        leftDelta,
        center,
      });
    },
    []
  );

  useEffect(() => {
    if (data !== null) {
      resizeWindow(295, 660, true);
      adjustWindowPosition(60, 320, false);
    }
  }, [data]);

  const handleLogout = useCallback(async () => {
    await apiHandler(() => userApi.logout(data!.uid));
    navTo('/', { replace: true });
    resizeWindow(initW, initH, false);
    adjustWindowPosition(0, 0, true);
  }, [data?.uid]);

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
          status={data?.status}
          icon={data?.icon}
          onLogout={handleLogout}
        />
      </Sider>
    </Layout>
  );
}

export default UserView;
