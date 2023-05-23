import {
  FolderOpenOutlined,
  ScissorOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { Button, Col, Input, Layout, Row } from 'antd';
import { memo } from 'react';

function ChatInput() {
  return (
    <Layout.Footer className='chat-footer'>
      <Row className='chat-footer-tools' gutter={[32, 0]}>
        <Col span={1} title='表情'>
          <SmileOutlined />
        </Col>
        <Col span={1} title='发送文件'>
          <FolderOpenOutlined />
        </Col>
        <Col span={1} title='截图'>
          <ScissorOutlined />
        </Col>
      </Row>
      <Input.TextArea
        bordered={false}
        placeholder='输入聊天内容'
        autoSize={{ minRows: 3, maxRows: 4 }}
      />
      <Button size='small' type='primary' className='chat-footer-send'>
        发送
      </Button>
    </Layout.Footer>
  );
}

export default memo(ChatInput);
