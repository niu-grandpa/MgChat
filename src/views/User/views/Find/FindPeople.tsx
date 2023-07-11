import { UserGender } from '@/services/enum';
import { Checkbox, Col, Input, Row, Select } from 'antd';
import { useCallback, useState } from 'react';

function FindPeople() {
  const [filter, setFilter] = useState({
    keywords: '',
    city: '',
    status: true,
    ageRange: '[]',
    gender: UserGender.NONE,
  });

  const handleSearch = useCallback(
    (value: string) => {
      setFilter(v => ((v.keywords = value), v));
      console.log(filter);
    },
    [filter]
  );

  return (
    <>
      <section className='find-p-search'>
        <Input.Search
          allowClear
          onSearch={handleSearch}
          placeholder='请输入用户名/昵称/手机号/关键字'
        />
        <Row gutter={16}>
          <Col className='gutter-row' span={6}>
            <Input size='small' placeholder='城市' />
          </Col>
          <Col className='gutter-row' span={6}>
            <Select
              size='small'
              defaultValue={2}
              style={{ width: 120 }}
              // @ts-ignore
              onChange={value => setFilter(v => ((v.gender = value), v))}
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
              defaultValue={'[]'}
              style={{ width: 120 }}
              // @ts-ignore
              onChange={value => setFilter(v => ((v.ageRange = value), v))}
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
                setFilter(v => ((v.status = target.checked), v))
              }>
              在线
            </Checkbox>
          </Col>
        </Row>
      </section>

      <section className='find-p-result'>13</section>
    </>
  );
}

export default FindPeople;
