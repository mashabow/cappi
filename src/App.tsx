import classnames from 'classnames';
import React, { useState, useEffect, useRef } from 'react';
import { Recorder } from './recorder';
import { updateMenu } from './menu';

import './App.css';

const App: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const recorder = useRef<Recorder | null>(null);

  useEffect(() => {
    if (recorder.current) {
      recording ? recorder.current.start() : recorder.current.stop();
    } else {
      recorder.current = new Recorder();
    }
    updateMenu(recording, setRecording);
  }, [recording]);

  return <div className={classnames('App', recording && 'recording')} />;
};

export default App;
