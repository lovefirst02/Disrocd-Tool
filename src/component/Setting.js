import React from 'react';
import 'antd/dist/antd.css';
import { Drawer, Form, Button, Col, Row, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

class DrawerForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    return (
      <>
        <Button type='primary' onClick={this.showDrawer} style={{ marginLeft: '5px' }}>
          <PlusOutlined /> Setting
        </Button>
        <Drawer
          title='Add New Token or Channel'
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
          footer={
            <div
              style={{
                textAlign: 'right',
              }}
            >
              <Button onClick={this.onClose} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button onClick={this.onClose} type='primary'>
                Submit
              </Button>
            </div>
          }
        >
          <Form layout='vertical' hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name='Channel' label='Channel'>
                  <Input
                    onKeyDown={this.props.onKeyDown}
                    onChange={this.props.onChange}
                    placeholder='Please enter user Channel'
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name='Token' label='Token'>
                  <Input onKeyDown={this.props.onKeyDown} placeholder='Please enter Token' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name='Keyword' label='Keyword'>
                  <Input onKeyDown={this.props.onKeyDown} placeholder='Please enter Keyword' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name='filterKeyword' label='filterKeyword'>
                  <Input onKeyDown={this.props.onKeyDown} placeholder='Please enter FilterKeyword' />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>
      </>
    );
  }
}

export default DrawerForm;
