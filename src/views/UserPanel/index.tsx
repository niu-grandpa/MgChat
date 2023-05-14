import { useLocation } from 'react-router-dom';

function UserPanel() {
  const { state } = useLocation();

  return <>{state.userId}</>;
}

export default UserPanel;
