const electron = require('electron');
const isDev = require('electron-is-dev');
require('electron-reload');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');

let mainWindow;

function createWindow() {
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

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Dock やアプリケーションスイッチャーに表示しないようにする
// これを設定すると、メニューバーにもメニューが表示されなくなる（他のアプリのメニューが表示される）
app.dock.hide();
