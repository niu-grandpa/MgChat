import ActionBar from '@/components/ActionBar';
import ChatBubble from '@/components/ChatBubble';
import NetAlert from '@/components/NetAlert';
import { useCallbackPlus, useLocalUsers, useOnline } from '@/hooks';
import { realTimeService } from '@/services';
import { MessageType } from '@/services/enum';
import { MessageLogs, ReceivedMessage } from '@/services/typing';
import { Button, Input, Layout, Row, Tooltip, message } from 'antd';
import { TextAreaRef } from 'antd/es/input/TextArea';
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
  const online = useOnline();
  const { data } = useParams();
  const usrModel = useLocalUsers();

  const {
    uid,
    friend,
    nickname: friendName,
  } = JSON.parse(data!) as MessageLogs;

  const { icon, nickname } = useMemo(() => usrModel.get(uid!), [uid]);

  const ForwardChatBubble = forwardRef(ChatBubble);
  const textArea = useRef<TextAreaRef>(null);
  const contentArea = useRef<HTMLElement>(null);
  const listRef = useRef<ListRef>(null);

  const [content, setContent] = useState('');
  const [msgData, setMsgData] = useState<ReceivedMessage[]>([]);
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
    // todo 获取本地聊天日志

    // 监听广播消息中发给我的数据
    realTimeService.receiveMessage(data => {
      if (data.to === uid) {
        setMsgData(v => [...v, data]);
        onSetListTop(Number.MAX_VALUE);
        // 存到数据库
      }
    });
  }, []);

  const handleSendMsg = useCallbackPlus(
    (content: string) => {
      // 广播消息
      realTimeService.sendMessage(
        {
          icon,
          content,
          nickname,
          from: uid!,
          to: friend!,
          type: MessageType.FRIEND_MSG,
        },
        data => {
          setMsgData(v => [...v, data]);
          setContent('');
          onSetListTop(msgData.length + 1);
        }
      );
    },
    [icon, uid, friend, nickname, msgData]
  ).before((content: string) => {
    if (!online) return false;
    if (!content) {
      message.info('不能发送空白消息');
      return false;
    }
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
          // 换行
          elem.value = `${value.substring(0, start)}
          
          ${value.substring(end)}`;
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
        <NetAlert />
        <div style={{ height: 18 }} />
        <VirtualList
          data={msgData}
          itemKey='cid'
          ref={listRef}
          itemHeight={50}
          height={listHeight}>
          {({ from, to, detail }) => {
            const { image, icon, content } = detail;
            const fromMe = from === uid;
            const fromFriend = to === uid;
            return (
              <ForwardChatBubble
                {...{ icon, content }}
                color={fromMe ? '#647dfb' : '#fff'}
                placement={fromFriend ? 'leftTop' : 'rightTop'}
              />
            );
          }}
        </VirtualList>
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
