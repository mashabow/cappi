import React, { useState, useEffect, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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

  const [crop, setCrop] = useState<ReactCrop.Crop>({
    x: 300,
    y: 300,
    width: 300,
    height: 200,
  });

  return (
    <div>
      <ReactCrop
        src="" // renderComponent を表示するので不要だが、型の上では必須
        renderComponent={<div className="CropTarget" />}
        crop={crop}
        onChange={setCrop}
        keepSelection
      />
    </div>
  );
};

export default App;
