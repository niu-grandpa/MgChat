import Avatar from '@/components/Avatar';
import { useOnline } from '@/hooks';
import { UserGender } from '@/services/enum';
import { SearchUserResults } from '@/services/typing';
import {
  Button,
  Checkbox,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  message,
} from 'antd';
import { MouseEvent, useCallback, useState } from 'react';

const { useForm } = Form;

function FindPeople() {
  const online = useOnline();

  const [filter, setFilter] = useState({
    keywords: '',
    city: '',
    status: true,
    ageRange: '[]',
    gender: UserGender.NONE,
  });

  const [list, setList] = useState<SearchUserResults[]>([
    {
      uid: 'string',
      age: 20,
      city: '西安',
      icon: '',
      nickname: 'string',
    },
  ]);

  const [open, setOpen] = useState(true);
  const [form] = useForm<{ alias: string; group: number; message: string }>();

  const handleSearch = useCallback(
    (value: string) => {
      setFilter(prev => ({
        ...prev,
        keywords: value,
        ageRange: JSON.parse(prev.ageRange),
      }));
      console.log(filter);
    },
    [filter]
  );

  const handleBubbleEvent = useCallback(
    ({ target }: MouseEvent) => {
      const elem = target as HTMLElement;
      const { parentElement } = elem;
      if (
        !elem.classList.contains('ant-btn') &&
        !parentElement?.classList.contains('ant-btn')
      ) {
        return false;
      }
      if (!online) {
        message.error('请检查网络是否连接');
        return false;
      }
      const idx = elem?.id || parentElement?.id;
      const { nickname } = list[Number(idx)];
      setOpen(true);
      form.setFieldsValue({ alias: nickname, message: `我是dads` });
    },
    [online]
  );

  const handleAddUser = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <section className='find-p-search'>
        <Input.Search
          allowClear
          onSearch={handleSearch}
          enterButton='查找'
          placeholder='请输入用户名/昵称/手机号/关键字'
        />
        <Row gutter={16}>
          <Col className='gutter-row' span={6}>
            <Input size='small' placeholder='城市' />
          </Col>
          <Col className='gutter-row' span={6}>
            <Select
              size='small'
              placeholder='性别'
              style={{ width: 120 }}
              onChange={value => setFilter(v => ({ ...v, gender: value }))}
              options={[
                { value: 2, label: '不限' },
                { value: 0, label: '男' },
                { value: 1, label: '女' },
              ]}
            />
          </Col>
          <Col className='gutter-row' span={6}>
            <Select
              size='small'
              placeholder='年龄'
              style={{ width: 120 }}
              onChange={value => setFilter(v => ({ ...v, ageRange: value }))}
              options={[
                { value: '[]', label: '不限' },
                { value: '[18, 22]', label: '18-22岁' },
                { value: '[23, 26]', label: '23-26岁' },
                { value: '[27, 35]', label: '27-35岁' },
                { value: '[35]', label: '35岁以上' },
              ]}
            />
          </Col>
          <Col className='gutter-row' span={6}>
            <Checkbox
              defaultChecked={true}
              onChange={({ target }) =>
                setFilter(v => ({ ...v, status: target.checked }))
              }>
              在线
            </Checkbox>
          </Col>
        </Row>
      </section>

      <section className='find-p-result'>
        {!list.length ? (
          <Empty description='暂无数据' />
        ) : (
          <Row gutter={[8, 26]} onClick={handleBubbleEvent}>
            {list.map(
              ({ uid, icon, age, city, nickname }: SearchUserResults, i) => (
                <Col span={8} key={uid}>
                  <section className='find-p-result-user'>
                    <a>
                      <Avatar size={56} icon={icon} />
                    </a>
                    <div className='find-p-result-info'>
                      <a className='name' title={nickname}>
                        {nickname}
                      </a>
                      <small style={{ margin: '2px 0', color: '#999999' }}>
                        {age}岁 | 在{city}
                      </small>
                      <Button size='small' id={`${i}`}>
                        添加
                      </Button>
                    </div>
                  </section>
                </Col>
              )
            )}
          </Row>
        )}
      </section>

      <Modal
        width={360}
        open={open}
        title='MG-添加好友'
        footer={false}
        closable={false}>
        <Form layout='vertical' form={form} onFinish={handleAddUser}>
          <Form.Item name='message' label='发送申请信息'>
            <Input />
          </Form.Item>
          <Form.Item name='alias' label='备注名'>
            <Input />
          </Form.Item>
          <Form.Item name='group' label='分组'>
            <Select />
          </Form.Item>
          <Form.Item
            style={{ position: 'relative', top: 24, textAlign: 'center' }}>
            <Button htmlType='submit' type='primary'>
              确定
            </Button>
            <Button style={{ marginLeft: 12 }} onClick={() => setOpen(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default FindPeople;
