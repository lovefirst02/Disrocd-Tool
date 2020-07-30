import React, { useState, useEffect } from 'react';
import LoginIcon from '../image/discord.png';
import './Login.css';
import { Progress } from 'antd';
const { ipcRenderer, remote } = window.require('electron');
const BrowserWindow = remote.BrowserWindow;
const DiscordOauth2 = window.require('discord-oauth2');
const oauth = new DiscordOauth2();

function Login() {
  const [code, setCode] = useState('');
  const [access, setAccess] = useState(false);
  const [lodingStatus, setLodingStatus] = useState('');
  const [percent, setPercent] = useState(0);

  //Discord Oauth2 LINK
  const loginUrl =
    'http://discord.com/api/oauth2/authorize?client_id=736909580612665384&redirect_uri=https%3A%2F%2Fdiscordapp.com&response_type=code&scope=identify%20guilds';

  //Node JS Sleep
  const timer = (ms) => new Promise((res) => setTimeout(res, ms));

  //驗證帳號是否在Server裡面
  const handleAuth = (data) => {
    if (JSON.stringify(data).includes('496860072383610890')) {
      setPercent(75);
      setAccess(true);
      timer(3000).then(() => {
        setPercent(100);
        openMain();
      });
    } else {
      setLodingStatus('exception');
    }
  };

  //與主進程通信打開主頁面，關閉登入頁面
  const openMain = () => {
    timer(1000).then(() => {
      ipcRenderer.sendSync('sucess', 'sucess');
    });
  };

  //Discord Oauth2 API 用來獲取使用者的Server
  const getGuilds = (access_token) => {
    oauth.getUserGuilds(access_token).then((item) => {
      setPercent(50);
      handleAuth(item);
    });
  };

  //Discord Oauth2 API 用來獲取使用者的Access_token
  const getToken = (code) => {
    setPercent(0);
    oauth
      .tokenRequest({
        clientId: '736909580612665384',
        clientSecret: 'EHFM6z1p9YMKkPOg2LU3eg6zRo99cAR8',

        code: code,
        scope: 'identify guilds',
        grantType: 'authorization_code',

        redirectUri: 'https://discordapp.com',
      })
      .then(({ access_token }) => {
        setLodingStatus('');
        setPercent(25);
        getGuilds(access_token);
      });
  };

  //判斷Code是否為空,如不為空就開始GetToken,使用React的UseEffect API
  useEffect(() => {
    if (code !== '') {
      getToken(code);
    }
  }, [code]);

  //打開新視窗，使用ＤＩＳＣＯＲＤ登入
  const openLogin = () => {
    let win = new BrowserWindow({ width: 800, height: 600 });
    win.loadURL(loginUrl);

    //使用setInterval每1秒偵測連結,如果偵測的需要的Code，ClearInterval並且set code to state
    const getCode = setInterval(() => {
      if (win.webContents.getURL().split('code=').length > 1) {
        setCode(win.webContents.getURL().split('code=')[1]);
        clearInterval(getCode);
        win.close();
      }
    }, 1000);
  };

  //開發用
  const test = () => {
    console.log(access, lodingStatus);
  };

  //JSX
  return (
    <div className='Login'>
      <div className='progress'>
        <Progress type='circle' percent={percent} status={lodingStatus} />
      </div>
      <div className='btn'>
        <a onClick={openLogin}>
          <img src={LoginIcon} />
        </a>
      </div>
    </div>
  );
}

export default Login;
