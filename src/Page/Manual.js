import React, { useState, useEffect } from 'react';
import { Input, Button, notification, Statistic } from 'antd';
import './Manual.css';
const { remote } = window.require('electron');
const { getCurrentWindow } = window.require('electron').remote;

function Manual() {
  const [code, setCode] = useState('');
  const [invite, setInvite] = useState([]);

  //改變頁面Title
  useEffect(() => {
    document.title = 'Manual Invite';
  }, []);

  //使用electron remote API獲取主進程的Global Data
  useEffect(() => {
    setInvite(remote.getGlobal('sharedObject').tokenData);
  }, []);

  //偵測invite code使用keydown Enter
  const handleSubmit = (e) => {
    switch (e.key) {
      case 'Enter':
        if (code.includes('discord.gg')) {
          const c = code.split('.gg/')[1];
          auto(c);
        } else {
          auto(code);
        }
        e.preventDefault();
        setCode('');
      default:
        break;
    }
  };

  //改變code state
  const handleChange = (e) => {
    setCode(e.target.value);
  };

  //Discord Auto Invite Code
  const auto = async (code) => {
    for (let i = 0; i < invite.length; i++) {
      fetch(`https://discordapp.com/api/v6/invites/${code}`, {
        headers: {
          authorization: invite[i],
        },
        method: 'POST',
      })
        .then((res) => res.json())
        .then((res) => checkInvite(res, code));
    }
  };

  //檢查是否加入成功
  const checkInvite = (res, code) => {
    if (res.code === code) {
      console.log(res);
      // res.status >= 200 && res.status < 300
      return notification['success']({
        message: '加入Invite成功',
        description: `成功加入${res.guild.name} Server`,
      });
    } else {
      return notification['error']({
        message: '加入Invite失敗',
        description: `Invite Code為${code}`,
      });
    }
  };

  //偵測invite code 使用按鈕
  const handleClick = (e) => {
    if (code.includes('discord.gg')) {
      const c = code.split('.gg/')[1];
      auto(c);
    } else {
      auto(code);
    }
    e.preventDefault();
    setCode('');
  };

  //Reload Manual Invite 如果InviteToken有增加
  const handleReload = () => {
    getCurrentWindow().reload();
  };

  //JSX
  return (
    <div className='manual'>
      <div className='count'>
        <Statistic valueStyle={{ color: '#ffffff' }} title='Token' value={invite.length} />
      </div>
      <Input
        value={code}
        onKeyDown={handleSubmit}
        onChange={handleChange}
        size='middle'
        placeholder='輸入Invite Code'
      />
      <Button onClick={handleClick} type='primary'>
        Submit
      </Button>

      <Button onClick={handleReload} type='default'>
        reload
      </Button>
    </div>
  );
}

export default Manual;
