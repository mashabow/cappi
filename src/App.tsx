import classnames from 'classnames';
import React, { useState, useEffect, useRef } from 'react';
import { Recorder } from './recorder';
import './App.css';

const { Menu, getCurrentWebContents } = window.require('electron').remote;

const App: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const recorder = useRef(new Recorder());

  useEffect(() => {
    recording ? recorder.current.start() : recorder.current.stop();

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
  }, [recording]);

  return <div className={classnames('App', recording && 'recording')} />;
};

export default App;
