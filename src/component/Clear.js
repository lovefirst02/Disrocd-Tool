import React from 'react';
import { Button, Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

function App(props) {
  const menu = (
    <Menu onClick={props.onClick}>
      <Menu.Item key='Channel'>Clear Channel</Menu.Item>
      <Menu.Item key='Token'>Clear Token</Menu.Item>
      <Menu.Item key='Keyword'>Clear Keyword</Menu.Item>
      <Menu.Item key='FilterKeyword'>Clear FilterKeyword</Menu.Item>
      <Menu.Item key='ClearAllMsg'>Clear All Message</Menu.Item>
      <Menu.Item key='OpenManualInvite' onClick={props.onManual}>
        Open Manual Invite
      </Menu.Item>
      <Menu.Item onClick={props.onDebug}>開發</Menu.Item>
      <Menu.Item onClick={props.onSave}>保存</Menu.Item>
      <Menu.Item onClick={props.onCookie}>Delete Cookie</Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={menu}>
        <Button type='primary' style={{ marginLeft: '5px' }}>
          <DownOutlined /> Actions
        </Button>
      </Dropdown>
    </>
  );
}

export default App;
