const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
require('electron-reload');

const path = require('path');

let cropperWindow;

const createCropperWindow = () => {
  cropperWindow = new BrowserWindow({
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    frame: false,
    hasShadow: false,
    show: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  cropperWindow.once('ready-to-show', cropperWindow.show);
  cropperWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  });
  // TODO: ディスプレイが切り替わったらそのたびにフルスクリーン化
  cropperWindow.setSimpleFullScreen(true);

  cropperWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`,
  );

  cropperWindow.on('closed', () => {
    cropperWindow = null;
  });
};

app.whenReady().then(createCropperWindow);

app.on('activate', () => {
  if (!cropperWindow) createCropperWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Dock やアプリケーションスイッチャーに表示しないようにする
// これを設定すると、メニューバーにもメニューが表示されなくなる（他のアプリのメニューが表示される）
app.dock.hide();
