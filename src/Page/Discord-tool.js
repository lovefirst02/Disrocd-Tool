import React, { useState, useEffect } from 'react';
import './Discord-tool.css';
import { Card, Avatar, Layout, Modal, Button, notification, Popover, Input, message, Typography, Empty } from 'antd';
import { UserOutlined, PictureOutlined, CompassOutlined, ExportOutlined } from '@ant-design/icons';
import Menu from '../component/Menu';
import Setting from '../component/Setting';
import Clear from '../component/Clear';
import WindowTop from '../component/windowTop/index';
import { Channel } from 'discord.js';
const { Text, Link } = Typography;
const { Meta } = Card;
const { Header, Footer, Sider, Content } = Layout;
const { ipcRenderer, shell, remote } = window.require('electron');
// const app = window.require('electron').remote;
const app = window.require('electron').remote.app;
const session = window.require('electron').remote.session;

const isDev = remote.require('electron-is-dev');
const fs = remote.require('fs');
const path = remote.require('path');
const Discord = window.require('discord.js');
const electronOpenLinkInBrowser = window.require('electron-open-link-in-browser');
const client = new Discord.Client();
const ReactMarkdown = require('react-markdown');
const autoOpen = require('../script/autoOpen');
const saveConfig = require('../script/saveConfig');
const source = isDev
  ? `${path.join(remote.app.getAppPath(), '/Config.json')}`
  : `${path.join(remote.app.getAppPath(), '../Config.json')}`;
const DiscordOauth2 = window.require('discord-oauth2');
const oauth = new DiscordOauth2();

//electron的remote API可以讓渲染進程使用主進程的API

function App() {
  //各種狀態
  const [token, setToken] = useState('');
  const [loginStatus, setLoginStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tag, setTag] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [cont, setCont] = useState([]);
  const [invite, setInvite] = useState(false);
  const [channel, setChannel] = useState([]);
  const [inviteToken, setInviteToken] = useState([]);
  const [autoLink, setAutoLink] = useState({
    status: false,
    bypass: false,
    keyword: [],
    filterKeyword: [],
  });
  const [visibleStatus, setVisibleStatus] = useState({
    channelVisible: false,
    tokenVisible: false,
    keywordVisible: false,
    filterKeywordVisible: false,
  });
  const [manualStatus, setManualStatus] = useState(false);
  const [settingValue, setSettingValue] = useState('');

  //定義test並且使用ipcRenderer與主進程通信
  //這段主要是讓Discord Client ＲＵＮ起來
  const test = () => {
    if (token === '') {
      message.error('請填入Disocrd Token 😅😅😅');
      return;
    } else if (loginStatus === true) {
      message.error('已經登入，如要換ＴＯＫＥＮ請重開程式');
      return;
    }
    ipcRenderer.on('start', () => {
      setLoading(true);
      client.on('ready', () => {
        if (client.user.avatar !== null) {
          setProfilePhoto(`https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.png?size=256`);
        }
        setTag(client.user.tag);
        const msg = `Login with ${client.user.tag}`;
        setLoginStatus(true);
        notification['success']({
          message: '登入成功',
          description: `Discord名稱為${client.user.tag}`,
        });
        setLoading(false);
      });

      client.on('message', async (msg) => {
        try {
          if (channel.length > 0) {
            if (channel.includes(msg.channel.id)) {
              setCont((old) => [msg, ...old]);
              if (invite === true && msg.content.includes('discord.gg')) {
                const code = msg.content.split('.gg/')[1];
                notification['success']({
                  message: '找到Invite Code',
                  description: `Code為${code}`,
                });
                await auto(code);
              }
              if (autoLink.status === true) {
                let m;
                const embedMessage =
                  msg.embeds.length > 0
                    ? msg.embeds.map(({ fields }) => {
                        fields.map(({ value }) => (m += `${value}\n`));
                      })
                    : (m = msg.content);
                const url = m.match(/\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim);

                if (url.length > 0) {
                  for (let i = 0; i < url.length; i++) {
                    autoOpen.default(url[i], autoLink, autoLink.bypass);
                  }
                }
              }
            }
          } else if (channel.length === 0) {
            setCont((old) => [msg, ...old]);
          }
        } catch (error) {
          console.log(error);
        }
      });

      client.login(token).catch((err) => {
        message.error('登入失敗，請檢查Token');
        setLoading(false);
      });
    });
    ipcRenderer.send('ready');
  };

  //與主進程通信讓Client Destroyer掉
  //注意一按下去Discord Token會重置
  const stop = () => {
    ipcRenderer.on('destroyer', () => {
      client.destroy().then(() => {
        setProfilePhoto('');
        setLoginStatus(false);
      });
    });

    ipcRenderer.send('stop');
  };

  //與主進程通信保存Config，內容包括{登入Token,InviteToken,Keyword,filterKeyword,Channel}
  //這斷有待改進
  const save = () => {
    ipcRenderer.on('saveConfig', () => {
      console.log('save');
      let data = {
        token: token,
        autoInvite: invite,
        autoLink: autoLink.status,
        inviteToken: inviteToken,
        channel: channel,
        keyword: autoLink.keyword,
        filterKeyword: autoLink.filterKeyword,
      };
      let ns = JSON.stringify(data);
      saveConfig.default(ns);
    });
    ipcRenderer.send('save');
  };

  //定義Arrow Function讀取保存的Config並且寫入狀態
  const loadData = async (data) => {
    setToken(data.token);
    setChannel(data.channel);
    setInviteToken(data.inviteToken);
    setAutoLink((old) => {
      old.keyword = data.keyword;
      old.filterKeyword = data.filterKeyword;
      return { ...old };
    });
    console.log('su');
  };

  //使用React useEffect讓每次程序開啟時都讀取保存的Config
  useEffect(async () => {
    let loadConfig = fs.readFileSync(source);
    let data = JSON.parse(loadConfig);
    await loadData(data);
  }, []);

  //這段為了讓Manual Invite視窗讀取現有Token所以使用useEffect保存在主進程的Global Data中 用remote中的getGlobal得到Global Data且賦予Data
  useEffect(() => {
    console.log(`file://${path.join(app.getAppPath(), '/build/index.html#/manual')}`);
    console.log(app.getAppPath());
    remote.getGlobal('sharedObject').tokenData = inviteToken;
  }, [inviteToken]);

  //Discord Auto Invite Requests Code
  const auto = async (code) => {
    for (let i = 0; i < inviteToken.length; i++) {
      fetch(`https://discordapp.com/api/v6/invites/${code}`, {
        headers: {
          authorization: inviteToken[i],
        },
        method: 'POST',
      })
        .then((res) => res.json())
        .then((res) => checkInvite(res, code));
    }
  };

  //檢查是否成功加入Invite並且用Antd的notification組件
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

  //JSX for Discord Message
  const Msg3 = ({ s }) => (
    <>
      {s.map((item, key) =>
        item.embeds.length > 0 ? (
          item.embeds.map(({ fields, thumbnail, title, url, description, author }) => (
            <Card
              style={{ marginTop: 16, width: 839, height: 'auto' }}
              key={key}
              extra={
                <>
                  <ExportOutlined />
                </>
              }
              title={item.author.username}
              actions={[
                thumbnail !== null ? (
                  <Popover content={<img style={{ width: 200, height: 200 }} src={thumbnail.url} />}>
                    <a href={thumbnail.url} target='_blank' el='noopener noreferrer'>
                      <PictureOutlined />
                    </a>
                  </Popover>
                ) : (
                  ''
                ),
                url !== undefined ? (
                  <a id={url} onClick={openLink}>
                    <CompassOutlined style={{ pointerEvents: 'none', cursor: 'default' }} id={url} />
                  </a>
                ) : (
                  ''
                ),
              ]}
            >
              <Meta
                avatar={
                  <Avatar
                    src={
                      item.author.avatar !== null
                        ? `https://cdn.discordapp.com/avatars/${item.author.id}/${item.author.avatar}.png?size=256`
                        : 'https://discord.com//assets/dd4dbc0016779df1378e7812eabaa04d.png'
                    }
                  />
                }
                title={<ReactMarkdown source={title} />}
                key={key}
                description={
                  fields.length > 0 ? (
                    fields.map(({ name, value }) => (
                      <ReactMarkdown
                        renderers={{ link: LinkRenderer }}
                        linkTarget='_blank'
                        source={`${name} : ${value} \n`}
                      />
                    ))
                  ) : (
                    <ReactMarkdown renderers={{ link: LinkRenderer }} linkTarget='_blank' source={description} />
                  )
                }
              />
            </Card>
          ))
        ) : (
          <Card
            style={{
              marginTop: 16,
              width: 839,
              height: 'auto',
              fontSize: 20,
            }}
            key={key}
            extra={<ExportOutlined />}
            title={item.author.username}
          >
            <Meta
              avatar={
                <Avatar
                  src={
                    item.author.avatar !== null
                      ? `https://cdn.discordapp.com/avatars/${item.author.id}/${item.author.avatar}.png?size=256`
                      : 'https://discord.com//assets/dd4dbc0016779df1378e7812eabaa04d.png'
                  }
                />
              }
              description={
                <ReactMarkdown renderers={{ link: LinkRenderer }} linkTarget='_blank' source={item.content} />
              }
              key={key}
            />
          </Card>
        )
      )}
    </>
  );

  //React MarkDown 為了讓Link能以系統預設瀏覽器開啟
  const LinkRenderer = (props) => {
    return (
      <a id={props.href} onClick={openLink}>
        {props.children}
      </a>
    );
  };

  //Change Token state
  const handleChange = (e) => {
    console.log(e.target.value);
    setToken(e.target.value);
  };

  //Change Auto Invite state 開啟或關閉Auto Invite
  const handleOn = () => {
    setInvite(!invite);
    console.log(invite);
  };

  //Change Auto Link state 開啟或關閉Auto Link
  //寫法必較特別，由於State是Object，裡面有其餘資料，為了讓其餘資料不變更，所以使用Arrow Function寫這段
  const handleLinkOn = () => {
    setAutoLink((old) => {
      old.status = !autoLink.status;
      return { ...old };
    });
  };

  //Change Bypass Keyword state 開啟或關閉Bypass KW
  //寫法必較特別，由於State是Object，裡面有其餘資料，為了讓其餘資料不變更，所以使用Arrow Function寫這段
  const handleBypass = () => {
    setAutoLink((old) => {
      old.bypass = true;
      return { ...old };
    });
  };

  //Change Antd Modal[對話框]的State，用Key去判斷要開啟哪個Modal
  //可以用Switch寫法，還不熟！！
  //寫法必較特別，由於State是Object，裡面有其餘資料，為了讓其餘資料不變更，所以使用Arrow Function寫這段
  //這段連結到Menu.js Component
  const handleVisible = (e) => {
    if (e.key === 'Channel') {
      setVisibleStatus((old) => {
        old.channelVisible = !visibleStatus.channelVisible;
        return { ...old };
      });
    } else if (e.key === 'Token') {
      setVisibleStatus((old) => {
        old.tokenVisible = !visibleStatus.tokenVisible;
        return { ...old };
      });
    } else if (e.key === 'Keyword') {
      setVisibleStatus((old) => {
        old.keywordVisible = !visibleStatus.keywordVisible;
        return { ...old };
      });
    } else if (e.key === 'FilterKeyword') {
      setVisibleStatus((old) => {
        old.filterKeywordVisible = !visibleStatus.filterKeywordVisible;
        return { ...old };
      });
    }
  };

  //增加InviteToken,KeyWord,FilterKeyword,Channel，判斷是否重複，如有重複使用Antd Message組件通知，如空白則Return
  //這段連結到Setting.js Component
  const handleSetting = (e) => {
    if (e.key === 'Enter') {
      if (e.target.id === 'Channel') {
        if (e.target.value === '') {
          message.error('請填入Channel ID');
          return;
        } else if (channel.includes(e.target.value)) {
          message.error('此ＩＤ已加入監控Channel，勿重複輸入');
          return;
        }
        setChannel((old) => [e.target.value, ...old]);
        setSettingValue('');
        notification['success']({
          message: '成功將頻道加入監控Channel',
        });
      } else if (e.target.id === 'Token') {
        if (e.target.value === '') {
          message.error('請填入Token');
          return;
        } else if (inviteToken.includes(e.target.value)) {
          message.error('此ＴＯＫＥＮ已加入，勿重複輸入');
          return;
        }
        setInviteToken((old) => [e.target.value, ...old]);
        notification['success']({
          message: '成功加入新Token',
        });
      } else if (e.target.id === 'Keyword') {
        if (e.target.value === '') {
          message.error('請填入Keyword');
          return;
        } else if (autoLink.keyword.includes(e.target.value)) {
          message.error('此KeyWord已加入,勿重複輸入');
          return;
        }
        setAutoLink((old) => {
          old.keyword.push(e.target.value);
          return { ...old };
        });
        notification['success']({
          message: '成功將加入Keyword',
        });
      } else if (e.target.id === 'filterKeyword') {
        if (e.target.value === '') {
          message.error('請填入FilterKeyword');
          return;
        } else if (autoLink.filterKeyword.includes(e.target.value)) {
          message.error('此FilterKeywor已加入,勿重複輸入');
          return;
        }
        setAutoLink((old) => {
          old.filterKeyword.push(e.target.value);
          return { ...old };
        });
        notification['success']({
          message: '成功加入FilterKeyword',
        });
      }
    }
  };

  //刪除所有Channel,InviteToken,KeyWord,FilterKeyword,Msg
  //這段連結到Clear.js Component
  const handleClear = (e) => {
    if (e.key === 'Channel') {
      setChannel([]);
    } else if (e.key === 'Token') {
      setInviteToken([]);
    } else if (e.key === 'Keyword') {
      setAutoLink((old) => {
        old.keyword = [];
        return { ...old };
      });
    } else if (e.key === 'FilterKeyword') {
      setAutoLink((old) => {
        old.filterKeyword = [];
        return { ...old };
      });
    } else if (e.key === 'ClearAllMsg') {
      console.log(e.key);
      setCont([]);
    }
  };

  //Channel,InviteToken,KeyWord,FiterKeyword打開Modal後會有List，List可以指定刪除
  //這段連結到Menu.js Component
  const handleDelete = (current, item) => {
    let index;
    if (current === 'Channel') {
      index = channel.indexOf(item);
      const c = [...channel];
      c.splice(index, 1);
      setChannel(c);
    } else if (current === 'Token') {
      index = inviteToken.indexOf(item);
      const c = [...inviteToken];
      c.splice(index, 1);
      setInviteToken(c);
    } else if (current === 'Keyword') {
      index = autoLink.keyword.indexOf(item);
      const c = [...autoLink.keyword];
      c.splice(index, 1);
      setAutoLink((old) => {
        old.keyword = c;
        return { ...old };
      });
    } else if (current === 'FilterKeyword') {
      index = autoLink.filterKeyword.indexOf(item);
      const c = [...autoLink.filterKeyword];
      c.splice(index, 1);
      setAutoLink((old) => {
        old.filterKeyword = c;
        return { ...old };
      });
    }
  };

  //手動Invite視窗，方便需要手動輸入Invite的使用者
  //使用 electron remote取得BrowserWindow API創建新視窗
  //用State判斷是否開啟，不重複開啟
  const manualInvite = () => {
    if (manualStatus === false) {
      let win;
      const BrowserWindow = remote.BrowserWindow;
      win = new BrowserWindow({
        height: 500,
        width: 300,
        title: 'Manual Invite',
        frame: true,
        webPreferences: {
          nodeIntegration: true,
          webSecurity: false,
        },
      });
      win.loadURL(
        isDev ? 'http://localhost:3000#/manual' : `file://${path.join(app.getAppPath(), '/build/index.html#/manual')}`
      );

      win.on('show', () => {
        console.log('show');
        console.log(BrowserWindow.getAllWindows());
        setManualStatus(true);
      });

      win.on('closed', () => {
        console.log('close');
        win = null;
        setManualStatus(false);
      });
    } else {
      notification['error']({
        message: '已打開Manual Invite視窗',
      });
    }
  };

  //開發用
  const t = () => {
    console.log(cont);
  };

  //嘗試刪除cookies,與檢視cookies
  const testDeleteCookies = () => {
    session.defaultSession.cookies.remove('http://discord.com/', 'dc-tool');
    session.defaultSession.cookies
      .get({ name: 'Discord-Tool' })
      .then((cookies) => {
        console.log(cookies);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //使用系統預設瀏覽器打開連結
  //使用electron shell api
  const openLink = (e) => {
    console.log(e.target);
    shell.openExternal(e.target.id);
  };

  //以下是ＪＳＸ
  return (
    <div className='App'>
      {/* <WindowTop /> */}
      <Layout style={{ backgroundColor: 'white' }}>
        <Header style={{ position: 'fixed', zIndex: 1, backgroundColor: 'white' }}>
          <Menu
            onChange={handleOn}
            onLinkChange={handleLinkOn}
            onBypass={handleBypass}
            onDelete={handleDelete}
            onVisible={handleVisible}
            channelData={channel}
            tokenData={inviteToken}
            kwVisible={visibleStatus}
            keywordData={autoLink.keyword}
            filterKeywordData={autoLink.filterKeyword}
          />
        </Header>
      </Layout>
      <Layout style={{}}>
        <Header style={{ position: 'fixed', top: '65px', zIndex: 1, width: '100%' }}>
          {profilePhoto !== '' && loginStatus === true ? (
            <Avatar size={'large'} style={{ marginRight: '20px' }} src={profilePhoto} />
          ) : profilePhoto === '' && loginStatus === true ? (
            <Avatar size={'large'} style={{ marginRight: '20px' }} icon={<UserOutlined />} />
          ) : (
            <Text type='danger' style={{ color: 'red', marginRight: '20px' }}>
              尚未登入
            </Text>
          )}

          <Input
            style={{ width: '45%', marginTop: '5px' }}
            size='middle'
            placeholder='Login Token Here'
            onChange={handleChange}
            disabled={loginStatus}
            value={token}
          />
          <Button
            disabled={loginStatus === true ? true : false}
            type='primary'
            loading={loading}
            onClick={test}
            style={{ marginLeft: '10px' }}
          >
            登入
          </Button>
          <Button type='primary' onClick={stop} style={{ marginLeft: '5px' }}>
            登出
          </Button>
          <Setting onKeyDown={handleSetting} />
          <Clear onDebug={t} onSave={save} onManual={manualInvite} onClick={handleClear} onCookie={testDeleteCookies} />
        </Header>
      </Layout>
      <Layout
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'auto',
          minHeight: 650,
          marginTop: 128,
        }}
      >
        {cont.length > 0 ? <Msg3 s={cont} /> : <Empty />}
      </Layout>
    </div>
  );
}

export default App;
