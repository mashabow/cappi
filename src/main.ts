import { app, BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';
import 'electron-reload';

import path from 'path';

let mainWindow: BrowserWindow | null;

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
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

  mainWindow.once('ready-to-show', mainWindow.show);
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
};

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
