import { useOnline } from '@/hooks';
import { PictureOutlined, SmileOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  Layout,
  Row,
  Upload,
  UploadProps,
  message,
} from 'antd';
import { KeyboardEvent, memo, useCallback, useState } from 'react';

export type SendEventProps = {
  content?: string;
  images?: string[];
};

const imgType = ['image/gif', 'image/jpeg', 'image/jpg', 'image/png'];

function ChatInput({ onSend }: { onSend: (c: SendEventProps) => void }) {
  const isOnline = useOnline();

  const [value, setValue] = useState('');

  const uploadProps: UploadProps = {
    beforeUpload: file => {
      const isImg = imgType.includes(file.type);
      if (!isImg) {
        message.error('请选择图片后缀格式');
      }
      return isImg || Upload.LIST_IGNORE;
    },
    onChange: info => {
      // todo 上传服务器转换成url
      // handleSendImg(['']);
    },
  };

  const handleSendImg = useCallback(
    (images: string[]) => {
      if (!images.length) return;
      onSend?.({ images });
    },
    [onSend]
  );

  const handleSendText = useCallback(() => {
    if (!isOnline || !value) return;
    onSend?.({ content: value });
    setValue('');
  }, [value, onSend]);

  const handleEnterKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.cancelable = false;
        e.preventDefault();
        e.stopPropagation();
        handleSendText();
      }
    },
    [handleSendText]
  );

  return (
    <Layout.Footer className='chat-footer'>
      <Row className='chat-footer-tools' gutter={[32, 0]}>
        <Col span={1} title='表情'>
          <SmileOutlined />
        </Col>
        <Col span={1} title='发送图片'>
          <Upload
            multiple
            showUploadList={false}
            action=''
            accept='image/gif,image/jpeg,image/jpg,image/png'
            {...uploadProps}>
            <PictureOutlined />
          </Upload>
        </Col>
        {/* <Col span={1} title='截图'>
          <ScissorOutlined />
        </Col> */}
      </Row>
      <Input.TextArea
        value={value}
        bordered={false}
        placeholder='ctrl + enter 键发送'
        className='chat-footer-input'
        autoSize={{ maxRows: 3 }}
        onKeyDown={handleEnterKey}
        onChange={({ target }) => setValue(target.value)}
      />
      <Button
        size='small'
        type='primary'
        className='chat-footer-send'
        onClick={handleSendText}>
        发送
      </Button>
    </Layout.Footer>
  );
}

export default memo(ChatInput);
