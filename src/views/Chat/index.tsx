import ActionBar from '@/components/ActionBar';
import ChatBubble from '@/components/ChatBubble';
import { useCallbackPlus } from '@/hooks';
import { MessageRole } from '@/services/enum';
import { UserChatLogs } from '@/services/typing';
import { Button, Input, Layout, Row, Tooltip } from 'antd';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { ipcRenderer } from 'electron';
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

const { Header, Content, Footer } = Layout;

type MessageLog = {
  role: MessageRole;
  content?: string;
  image?: string;
  createTime: number;
};

function ChatView() {
  const { uid, friend } = useParams();

  const pathname = useMemo(() => `/chat/${uid}/${friend}`, [uid, friend]);

  useEffect(() => {
    ipcRenderer.send('resize-win', {
      width: 560,
      height: 480,
      pathname,
    });
  }, [pathname]);

  const [cloudLogs, setCloudLogs] = useState<UserChatLogs | null>(null);

  useEffect(() => {
    // 获取本地聊天记录文件
  }, []);

  const textArea = useRef<TextAreaRef>(null);
  const [logs, setLogs] = useState<MessageLog[]>([]);

  const handleSend = useCallbackPlus<UserChatLogs['logs']>(
    (data: MessageLog) => {
      // 消息存入数据库并传送给对方用户
    },
    []
  )
    .before((value: string) => {
      if (!value) return false;
      const data = {
        role: MessageRole.ME,
        createTime: Date.now(),
        content: value || textArea.current?.resizableTextArea?.textArea.value!,
      };
      setLogs(v => (v.push(data), v));
      return data;
    })
    .after(data => {
      // 消息本地化存储
    });

  const handleKeySend = useCallback(
    (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        const { textArea: elem } = textArea.current?.resizableTextArea!;
        const value = elem.value;
        if (e.ctrlKey) {
          const start = elem.selectionStart;
          const end = elem.selectionEnd;
          elem.value = value.substring(0, start) + '\n' + value.substring(end);
          elem.selectionStart = elem.selectionEnd = start + 1;
        } else if (!e.shiftKey) {
          handleSend.invoke(value);
          elem.value = '';
        }
      }
    },
    [textArea, handleSend]
  );

  const handleClickSend = useCallback(
    () =>
      handleSend.invoke(textArea.current?.resizableTextArea?.textArea.value),
    [handleSend]
  );

  return (
    <Layout>
      <Header className='chat-header'>
        <span style={{ cursor: 'pointer' }}>管理员</span>
        <ActionBar keepAliveWhenClosed offset={[-6, 0]} pathname={pathname} />
      </Header>
      <Content className='chat-content'>
        {cloudLogs && (
          <>
            <ChatBubble
              color='#fff'
              placement='leftTop'
              content='这是管理员发送的聊天消息'
            />
            <ChatBubble placement='rightTop' content='这是我发送的聊天消息' />
            <Tooltip title='unnset' />
          </>
        )}
      </Content>
      <Footer className='chat-footer'>
        <Row className='chat-footer-toolbar'>111</Row>
        <Input.TextArea
          autoFocus
          ref={textArea}
          spellCheck={false}
          bordered={false}
          autoSize={{ minRows: 3, maxRows: 3 }}
          onKeyDown={handleKeySend}
        />
        <Button
          type='primary'
          title='按Enter键发送，按Shift+Enter键换行'
          onClick={handleClickSend}>
          发送(S)
        </Button>
      </Footer>
    </Layout>
  );
}

export default ChatView;
