// 引入electron并创建一个Browserwindow
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const url = require('url');
const isMac = process.platform === 'darwin';

// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;
let loginWindow;

global.sharedObject = {
  tokenData: 'This is a shared property',
  manualURL: `file://${path.join(__dirname, '../build/index.html#/manual')}`,
};

function createWindow() {
  //創建驗證窗口
  loginWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: { nodeIntegration: true, nodeIntegrationInWorker: true, allowRunningInsecureContent: true },
  });

  loginWindow.loadURL(
    isDev ? 'http://localhost:3000#/login' : `file://${path.join(__dirname, '../build/index.html#/login')}`
  );

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

  ipcMain.on('sucess', (event, arg) => {
    if (arg === 'sucess') {
      loginWindow.close();
      //创建浏览器窗口,宽高自定义具体大小你开心就好
      mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInWorker: true,
          allowRunningInsecureContent: true,
          webSecurity: false,
        },
      });

      mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);

      // 打开开发者工具，默认不打开
      // mainWindow.webContents.openDevTools()
      // 关闭window时触发下列事件.
      mainWindow.on('closed', function () {
        mainWindow = null;
      });
    }
  });
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
// const template = [
//   // { role: 'appMenu' }
//   ...(isMac
//     ? [
//         {
//           label: app.name,
//           submenu: [
//             { role: 'about' },
//             { type: 'separator' },
//             { role: 'services' },
//             { type: 'separator' },
//             { role: 'hide' },
//             { role: 'hideothers' },
//             { role: 'unhide' },
//             { type: 'separator' },
//             { role: 'quit' },
//           ],
//         },
//       ]
//     : []),
//   // { role: 'editMenu' }
//   {
//     label: 'Edit',
//     submenu: [
//       { role: 'undo' },
//       { role: 'redo' },
//       { type: 'separator' },
//       { role: 'cut' },
//       { role: 'copy' },
//       { role: 'paste' },
//       ...(isMac
//         ? [
//             { role: 'pasteAndMatchStyle' },
//             { role: 'delete' },
//             { role: 'selectAll' },
//             { type: 'separator' },
//             {
//               label: 'Speech',
//               submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
//             },
//           ]
//         : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
//     ],
//   },
// ];
// const menu = Menu.buildFromTemplate(template);

// Menu.setApplicationMenu(menu);
app.on('ready', createWindow);

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
