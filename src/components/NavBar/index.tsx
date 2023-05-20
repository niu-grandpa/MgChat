import { Col, Row } from 'antd';
import { ReactNode, memo } from 'react';
import './index.scss';

type NavbarProps = {
  items: Partial<{
    title: string;
    span: number;
    icon: ReactNode;
    danger: boolean;
    onClick: () => void;
  }>[];
};

function Navbar({ items }: NavbarProps) {
  return (
    <Row className='navbar' justify={'end'}>
      {items.map(({ title, icon, span, danger, onClick }) => {
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
