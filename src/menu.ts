const { app, Menu, getCurrentWebContents } = window.require('electron').remote;

// ショートカットキーを設定する
// app.dock.hide() を使っているので、メニューバーには表示されない
// また録画中は win.setIgnoreMouseEvents(true) になっているので、ショートカットにも反応しない
export const updateMenu = (
  recording: boolean,
  setRecording: (_: boolean) => void,
): void =>
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: app.name,
        submenu: [
          {
            label: 'Start Recording',
            accelerator: 'Enter',
            click: () => setRecording(true),
            enabled: !recording,
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: 'Alt+Command+I',
            click: () => getCurrentWebContents().toggleDevTools(),
          },
          {
            role: 'quit',
          },
        ],
      },
    ]),
  );
