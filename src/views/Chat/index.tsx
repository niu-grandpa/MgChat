import ActionBar from '@/components/ActionBar';
import ChatBubble from '@/components/ChatBubble';
import { useCallbackPlus, useLocalUsers, useOnline } from '@/hooks';
import { realTimeService } from '@/services';
import { MessageType } from '@/services/enum';
import { ReceivedMessage, UserChatLogs } from '@/services/typing';
import { Button, Input, Layout, Row, Tooltip, message } from 'antd';
import { TextAreaRef } from 'antd/es/input/TextArea';
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

function ChatView() {
  const { data } = useParams();

  const {
    uid,
    friend,
    nickname: friendName,
  } = JSON.parse(data!) as UserChatLogs;

  const usrModel = useLocalUsers();
  const { icon, nickname } = useMemo(() => usrModel.get(uid!), [uid]);

  const online = useOnline();

  const textArea = useRef<TextAreaRef>(null);
  const contentArea = useRef<HTMLElement>(null);

  const [content, setContent] = useState('');
  const [msgData, setMsgData] = useState<ReceivedMessage[]>([]);

  const handleRestScrollTop = useCallback(() => {
    setTimeout(() => {
      const elem = contentArea.current!;
      contentArea.current!.scrollTop = elem.scrollHeight;
    }, 100);
  }, [contentArea]);

  useEffect(() => {
    // todo 获取本地聊天日志

    realTimeService.receiveMessage(data => {
      if (data.to === uid) {
        setMsgData(v => [...v, data]);
        return handleRestScrollTop();
      }
    });
  }, []);

  const handleSendMsg = useCallbackPlus(
    (content: string) => {
      realTimeService.sendMessage(
        {
          icon,
          content,
          nickname,
          from: uid!,
          to: friend!,
          type: MessageType.FRIEND_MSG,
        },
        data => setMsgData(v => [...v, data])
      );
    },
    [icon, uid, friend, nickname]
  )
    .before((content: string) => {
      if (!online) {
        message.warning('请检查网络后重试');
        return false;
      }
      if (!content) {
        message.info('不能发送空白消息');
        return false;
      }
    })
    .after(() => {
      setContent('');
      handleRestScrollTop();
    });

  const handleKeySend = useCallback(
    (e: KeyboardEvent) => {
      e.stopPropagation();

      if (e.key === 'Enter') {
        e.preventDefault();

        const { textArea: elem } = textArea.current?.resizableTextArea!;
        const value = elem.value;
        // ctrl+enter换行
        if (e.ctrlKey) {
          const start = elem.selectionStart;
          const end = elem.selectionEnd;
          // 插入换行符
          elem.value = value.substring(0, start) + '\n' + value.substring(end);
          elem.selectionStart = elem.selectionEnd = start + 1;

          setContent(elem.value);
          // enter发送
        } else if (!e.shiftKey && value) {
          handleSendMsg.invoke(elem.value);
        }
      }
    },
    [textArea, handleSendMsg]
  );

  const handleClickSend = useCallback(() => {
    if (!content) return;
    handleSendMsg.invoke(content);
  }, [handleSendMsg, content]);

  return (
    <Layout>
      <Header className='chat-header'>
        <span style={{ cursor: 'pointer' }}>{friendName}</span>
        <ActionBar
          offset={[-6, 0]}
          keepAliveWhenClosed
          pathname={`/chat/${data}`}
        />
      </Header>
      <Content className='chat-content' ref={contentArea}>
        {msgData?.map(({ from, to, detail }) => {
          const { cid, image, icon, content } = detail;
          const fromMe = from === uid;
          const fromFriend = to === uid;
          return (
            <ChatBubble
              key={cid}
              {...{ icon, content }}
              color={fromMe ? '#647dfb' : '#fff'}
              placement={fromFriend ? 'leftTop' : 'rightTop'}
            />
          );
        })}
      </Content>
      <Footer className='chat-footer'>
        <Row className='chat-footer-toolbar'>111</Row>
        <Input.TextArea
          autoFocus
          value={content}
          ref={textArea}
          spellCheck={false}
          bordered={false}
          onKeyDown={handleKeySend}
          autoSize={{ minRows: 3, maxRows: 3 }}
          onChange={e => setContent(e.target.value)}
        />
        <Button
          type='primary'
          title='按Enter键发送, 按Ctrl+Enter键换行'
          onClick={handleClickSend}>
          发送(S)
        </Button>
      </Footer>
      <Tooltip title='unnset' />
    </Layout>
  );
}

export default ChatView;
