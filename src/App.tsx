import classnames from 'classnames';
import React, { useState, useEffect } from 'react';
import { record } from './record';
import './App.css';

const { Menu, getCurrentWebContents } = window.require('electron').remote;

const App: React.FC = () => {
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (recording) record();

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
            }
          ]
        }
      ])
    )
  }, [recording])

  return (
    <div className={classnames('App', recording && 'recording')}>
      <video />
    </div>
  );
}

export default App;
