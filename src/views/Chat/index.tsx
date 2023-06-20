import { ipcRenderer } from 'electron';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ChatView() {
  const { friend } = useParams();

  useEffect(() => {
    ipcRenderer.send('resize-win', {
      width: 600,
      height: 520,
      pathname: `/chat/${friend}`,
    });
  }, []);

  return <>阿达</>;
}

export default ChatView;
