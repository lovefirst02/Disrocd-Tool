// 引入electron并创建一个Browserwindow
const { app, BrowserWindow, ipcMain, session } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const url = require('url');
const ipcProcess = require('./src/ipcProcess');

// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;
let loginWindow;
global.sharedObject = {
  tokenData: 'This is a shared property',
};

function createWindow() {
  //判斷cookies
  session.defaultSession.cookies
    .get({ name: 'dc-tool' })
    .then((cookies) => {
      if (cookies.length === 0) {
        //創建驗證窗口
        loginWindow = new BrowserWindow({
          width: 400,
          height: 600,
          webPreferences: { nodeIntegration: true, nodeIntegrationInWorker: true, allowRunningInsecureContent: true },
        });

        loginWindow.loadURL(
          isDev ? 'http://localhost:3000#/login' : `file://${path.join(__dirname, '../build/index.html#/login')}`
        );
      } else {
        console.log(cookies);
        mainWindow = new BrowserWindow({
          width: 1000,
          height: 800,
          autoHideMenuBar: true,
          webPreferences: { nodeIntegration: true, nodeIntegrationInWorker: true, allowRunningInsecureContent: true },
        });

        mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
        ipcProcess(mainWindow);
        // 打开开发者工具，默认不打开
        // mainWindow.webContents.openDevTools()
        // 关闭window时触发下列事件.
        mainWindow.on('closed', function () {
          mainWindow = null;
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });

  //创建浏览器窗口,宽高自定义具体大小你开心就好

  ipcMain.on('ready', () => {
    mainWindow.webContents.send('start');
  });

  ipcMain.on('stop', () => {
    mainWindow.webContents.send('destroyer');
  });

  ipcMain.on('save', () => {
    mainWindow.webContents.send('saveConfig');
  });

  ipcMain.on('manual', () => {
    mainWindow.webContents.send('manualCready');
  });

  //双击标题栏也可改变最大化状态，所以需要向渲染进程发送消息改变图标
  ipcMain.on('maximize', () => {
    mainWindow.webContents.send('maximized');
  });

  ipcMain.on('unmaximize', () => {
    mainWindow.webContents.send('unmaximized');
  });

  ipcMain.on('sucess', (event, arg) => {
    if (arg === 'sucess') {
      mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: { nodeIntegration: true, nodeIntegrationInWorker: true, allowRunningInsecureContent: true },
      });

      mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);

      ipcProcess(mainWindow);
      // 打开开发者工具，默认不打开
      // mainWindow.webContents.openDevTools()
      // 关闭window时触发下列事件.
      mainWindow.on('closed', function () {
        mainWindow = null;
      });
    }
    loginWindow.close();
  });
}

app.whenReady().then(createWindow);
// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
// app.on('ready', createWindow);

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});

// 你可以在这个脚本中续写或者使用require引入独立的js文件.
