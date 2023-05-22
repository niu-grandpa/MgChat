import { CloseOutlined, MinusOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import { ipcRenderer } from 'electron';
import { ReactNode, memo, useMemo } from 'react';
import './index.scss';

type NavbarProps = {
  items?: Partial<{
    title: string;
    span: number;
    icon: ReactNode;
    danger: boolean;
    onClick: () => void;
  }>[];
};

function Navbar({ items }: NavbarProps) {
  const _items = useMemo<NavbarProps['items']>(
    () => [
      {
        title: '最小化',
        icon: <MinusOutlined />,
        onClick: () => ipcRenderer.send('min-win', 'main'),
      },
      {
        title: '关闭',
        icon: <CloseOutlined />,
        danger: true,
        onClick: () => ipcRenderer.send('close-win', { pathname: 'main' }),
      },
      ...(items || []),
    ],
    [items]
  );
  return (
    <Row className='navbar' justify={'end'}>
      {_items?.map(({ title, icon, span, danger, onClick }) => {
        span = span ?? 3;
        return (
          <Col
            key={title}
            {...{ span, title, onClick }}
            className={`navbar-item ${danger ? 'hover-red' : ''}`}>
            <a>{!icon ? title : icon}</a>
          </Col>
        );
      })}
    </Row>
  );
}

export default memo(Navbar);
