const { Menu, getCurrentWebContents } = window.require('electron').remote;

export const updateMenu = (
  recording: boolean,
  setRecording: (_: boolean) => void,
): void =>
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'Record',
        submenu: [
          {
            label: recording ? 'Stop Recording' : 'Start Recording',
            accelerator: 'CmdOrCtrl+@',
            click: () => setRecording(!recording),
          },
          {
            type: 'separator',
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: 'Alt+Command+I',
            click: () => getCurrentWebContents().toggleDevTools(),
          },
          {
            type: 'separator',
          },
          {
            role: 'quit',
          },
        ],
      },
    ]),
  );
