import { ipcRenderer } from 'electron';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function UserPanel() {
  const { state } = useLocation();

  const changeWinShape = useCallback(() => {
    ipcRenderer.invoke('set-always-on-top');
    ipcRenderer.invoke('resize-win', {
      path: 'main',
      width: 283,
      height: 755,
      resizable: true,
    });
    ipcRenderer.invoke('set-position', {
      path: 'main',
      marginRight: 350,
      y: 50,
    });
  }, []);

  useEffect(() => {
    changeWinShape();
  }, [state]);

  return <>{state.userId}</>;
}

export default UserPanel;
