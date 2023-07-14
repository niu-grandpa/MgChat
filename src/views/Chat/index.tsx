import ActionBar from '@/components/ActionBar';
import ChatBubble from '@/components/ChatBubble';
import NetAlert from '@/components/NetAlert';
import { useLocalUsers, useOnline } from '@/hooks';
import { realTimeService } from '@/services';
import { MessageType } from '@/services/enum';
import { FileMessageLogs, MessageLogs } from '@/services/typing';
import { Button, Input, Layout, Row, Tooltip, message } from 'antd';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { ipcRenderer } from 'electron';
import VirtualList, { ListRef } from 'rc-virtual-list';
import {
  KeyboardEvent,
  forwardRef,
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
  const ForwardChatBubble = forwardRef(ChatBubble);

  const online = useOnline();
  const { data } = useParams();
  const usrModel = useLocalUsers();

  const { uid, friend, nickname: frdName } = JSON.parse(data!) as MessageLogs;
  const { icon, nickname } = useMemo(() => usrModel.get(uid!), [uid]);

  const textArea = useRef<TextAreaRef>(null);
  const contentArea = useRef<HTMLElement>(null);
  const listRef = useRef<ListRef>(null);

  const [content, setContent] = useState('');
  const [history, setHistory] = useState<ReceivedMessage[]>([]);
  const [listHeight, setListHeight] = useState<number | undefined>();

  useEffect(() => {
    setListHeight(contentArea.current?.offsetHeight);
  }, [contentArea]);

  useEffect(() => {
    const onRestListHeight = () => {
      setListHeight(contentArea.current?.offsetHeight);
    };
    window.addEventListener('resize', onRestListHeight);
    return () => {
      window.removeEventListener('resize', onRestListHeight);
    };
  }, []);

  const onSetListTop = useCallback(
    (index: number) => {
      listRef.current?.scrollTo({
        index,
        align: 'auto',
      });
    },
    [listRef]
  );

  useEffect(() => {
    // 获取本地聊天日志
    const getHistoryLogs = (_: any, data: FileMessageLogs) => {
      if (data.code !== 200) return;
      const { icon, nickname, logs } = data[friend];
      const newHistory = logs.map(item => ({
        icon,
        nickname,
        detail: item,
        type: MessageType.FRIEND_MSG,
      }));
      setHistory(newHistory);
    };

    // 监听广播消息中发给我的数据
    realTimeService.receiveMessage(data => {
      if (data.detail.to === uid) {
        setHistory(prevMsgData => [...prevMsgData, data]);
        onSetListTop(Number.MAX_VALUE);
      }
    });

    ipcRenderer.send('request-chat-data', uid);
    ipcRenderer.on('get-chat-data', getHistoryLogs);

    return () => {
      ipcRenderer.off('get-chat-data', getHistoryLogs);
    };
  }, [uid]);

  const handleSendMsg = useCallback(
    (content: string) => {
      if (!online) return false;
      if (!content) {
        message.info('不能发送空白消息');
        return;
      }
      const obj = {
        icon,
        content,
        nickname,
        from: uid!,
        to: friend!,
        type: MessageType.FRIEND_MSG,
      };
      realTimeService.sendMessageToFriend(obj);
    },
    [online, content, icon, uid, friend, nickname]
  );

  const handleKeySend = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        const { textArea: elem } = textArea.current?.resizableTextArea!;
        const value = elem.value;
        // ctrl+enter换行
        if (e.ctrlKey) {
          const start = elem.selectionStart;
          const end = elem.selectionEnd;
          // 换行
          elem.value = `${value.substring(0, start)}
          
          ${value.substring(end)}`;
          elem.selectionStart = elem.selectionEnd = start + 1;

          setContent(elem.value);
          // enter发送
        } else if (!e.shiftKey && value) {
          handleSendMsg(elem.value);
        }
      }
    },
    [textArea, handleSendMsg]
  );

  const handleClickSend = useCallback(() => {
    if (content) handleSendMsg(content);
  }, [handleSendMsg, content]);

  const renderItem = useCallback(({ icon, detail }: ReceivedMessage) => {
    const { image, content, from, to } = detail;
    const fromMe = from === uid;
    const fromFriend = to === uid;
    return (
      <ForwardChatBubble
        {...{ icon, content }}
        color={fromMe ? '#647dfb' : '#fff'}
        placement={fromFriend ? 'leftTop' : 'rightTop'}
      />
    );
  }, []);

  return (
    <Layout>
      <Header className='chat-header'>
        <span style={{ cursor: 'pointer' }}>{frdName}</span>
        <ActionBar
          offset={[-6, 0]}
          keepAliveWhenClosed
          pathname={`/chat/${data}`}
        />
      </Header>
      <Content className='chat-content' ref={contentArea}>
        <NetAlert />
        <div style={{ height: 18 }} />
        <VirtualList
          data={history}
          itemKey='cid'
          ref={listRef}
          itemHeight={50}
          height={listHeight}
          children={renderItem}
        />
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
