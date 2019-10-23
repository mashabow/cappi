import classnames from 'classnames';
import React, { useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [recording, setRecording] = useState(false);

  return (
    <div className={classnames('App', recording && 'recording')} />
  );
}

export default App;
