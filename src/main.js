const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
require('electron-reload');

const path = require('path');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    frame: false,
    hasShadow: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  });

  // TODO: ディスプレイが切り替わったらそのたびにフルスクリーン化
  mainWindow.setSimpleFullScreen(true);

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`,
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (!mainWindow) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Dock やアプリケーションスイッチャーに表示しないようにする
// これを設定すると、メニューバーにもメニューが表示されなくなる（他のアプリのメニューが表示される）
app.dock.hide();
