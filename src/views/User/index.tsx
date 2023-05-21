import { ipcRenderer } from 'electron';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function UserPanel() {
  const { state } = useLocation() as { state: { account: string } };

  const changeWinShape = useCallback(() => {
    ipcRenderer.send('resize-win', {
      pathname: 'main',
      width: 283,
      height: 755,
      resizable: true,
    });
    ipcRenderer.send('set-position', {
      pathname: 'main',
      marginRight: 350,
      y: 50,
    });
  }, []);

  useEffect(() => {
    changeWinShape();
  }, [state]);

  return <>{state.account}</>;
}

export default UserPanel;
