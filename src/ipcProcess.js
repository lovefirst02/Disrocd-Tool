const { ipcMain, BrowserWindow, app } = require('electron');

const ipc = (win) => {
  ipcMain.on('minimize', () => {
    win.minimize();
  });

  ipcMain.on('isMaximized', (event, arg) => {
    if (win.isMaximized()) event.returnValue = true;
    else event.returnValue = false;
  });

  ipcMain.on('maximize', () => {
    win.maximize();
  });

  ipcMain.on('unmaximize', () => {
    win.unmaximize();
  });

  ipcMain.on('close', () => {
    app.quit();
  });

  //双击标题栏也可改变最大化状态，所以需要向渲染进程发送消息改变图标
  ipcMain.on('maximize', () => {
    win.webContents.send('maximized');
  });

  ipcMain.on('unmaximize', () => {
    win.webContents.send('unmaximized');
  });
};
module.exports = ipc;
