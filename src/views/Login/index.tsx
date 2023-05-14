import { ipcRenderer } from 'electron';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginView() {
  const navigate = useNavigate();

  const changeWinShape = useCallback(() => {
    navigate('/user', { replace: true, state: { userId: 0 } });
    ipcRenderer.invoke('set-always-on-top');
    ipcRenderer.invoke('resize-win', 283, 755);
    ipcRenderer.invoke('set-position', { marginRight: 350, y: 50 });
    ipcRenderer.invoke('close-win', { path: 'login', destroy: true });
  }, []);

  return <button onClick={changeWinShape}>close</button>;
}

export default LoginView;
