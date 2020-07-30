import React from 'react';
import { Menu, Switch, Statistic, Modal, List } from 'antd';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 'Channel',
      visible: false,
    };
  }

  handleClick = (e) => {
    this.setState({ current: e.key });
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  hideModal = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { current } = this.state;
    return (
      <Menu mode='horizontal' selectedKeys={[current]} onClick={this.handleClick}>
        <Menu.Item title='Auto Invite' key='invite'>
          Auto Invite &nbsp; <Switch onChange={this.props.onChange} />
        </Menu.Item>
        <Menu.Item title='Auto Link' key='link'>
          Auto Link &nbsp; <Switch onChange={this.props.onLinkChange} />
        </Menu.Item>
        <Menu.Item title='Bypass Keyword' key='BypassKeyword'>
          Bypass KW &nbsp; <Switch onChange={this.props.onBypass} />
        </Menu.Item>
        <Menu.Item title='Channel' key='Channel' onClick={this.props.onVisible}>
          <Statistic title='Channel' value={this.props.channelData.length} />
          <Modal
            title='Channel'
            visible={this.props.kwVisible.channelVisible}
            onOk={this.props.onVisible}
            onCancel={this.props.onVisible}
            okText='確認'
            cancelText='取消'
          >
            <List
              size='small'
              bordered
              dataSource={this.props.channelData}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a key='Delete' onClick={() => this.props.onDelete(current, item)}>
                      Delete
                    </a>,
                  ]}
                >
                  {item}
                </List.Item>
              )}
            />
          </Modal>
        </Menu.Item>
        <Menu.Item title='Token' key='Token' onClick={this.props.onVisible}>
          <Statistic title='Token' value={this.props.tokenData.length} />
          <Modal
            title='Token'
            visible={this.props.kwVisible.tokenVisible}
            onOk={this.props.onVisible}
            onCancel={this.props.onVisible}
            okText='確認'
            cancelText='取消'
            width={900}
          >
            <List
              size='small'
              bordered={true}
              dataSource={this.props.tokenData}
              style={{ outline: false }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a key='Delete' onClick={() => this.props.onDelete(current, item)}>
                      Delete
                    </a>,
                  ]}
                >
                  {item}
                </List.Item>
              )}
            />
          </Modal>
        </Menu.Item>
        <Menu.Item title='Keyword' key='Keyword' onClick={this.props.onVisible}>
          <Statistic title='Keyword' value={this.props.keywordData.length} />
          <Modal
            title='Keyword'
            visible={this.props.kwVisible.keywordVisible}
            onOk={this.props.onVisible}
            onCancel={this.props.onVisible}
            okText='確認'
            cancelText='取消'
          >
            <List
              size='small'
              bordered={true}
              dataSource={this.props.keywordData}
              style={{ outline: false }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a key='Delete' onClick={() => this.props.onDelete(current, item)}>
                      Delete
                    </a>,
                  ]}
                >
                  {item}
                </List.Item>
              )}
            />
          </Modal>
        </Menu.Item>
        <Menu.Item title='Filter Keyword' key='FilterKeyword' onClick={this.props.onVisible}>
          <Statistic title='Filter Keyword' value={this.props.filterKeywordData.length} />
          <Modal
            title='Keyword'
            visible={this.props.kwVisible.filterKeywordVisible}
            onOk={this.props.onVisible}
            onCancel={this.props.onVisible}
            okText='確認'
            cancelText='取消'
          >
            <List
              size='small'
              bordered={true}
              dataSource={this.props.filterKeywordData}
              style={{ outline: false }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a key='Delete' onClick={() => this.props.onDelete(current, item)}>
                      Delete
                    </a>,
                  ]}
                >
                  {item}
                </List.Item>
              )}
            />
          </Modal>
        </Menu.Item>
      </Menu>
    );
  }
}

export default App;
