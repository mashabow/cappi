import React, { useState, useEffect, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Recorder } from './recorder';
import { updateMenu } from './menu';

import './App.css';

const cropToBounds = (crop: ReactCrop.Crop): Electron.Rectangle => ({
  x: crop.x || 0,
  y: crop.y || 0,
  width: crop.width || 0,
  height: crop.height || 0,
});

const App: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const recorder = useRef<Recorder | null>(null);
  const [crop, setCrop] = useState<ReactCrop.Crop>({});

  useEffect(() => {
    if (recorder.current) {
      recording
        ? recorder.current.start(cropToBounds(crop))
        : recorder.current.stop();
    } else {
      recorder.current = new Recorder();
    }
    updateMenu(recording, setRecording);
    // recording を切り替えたときだけ実行したいので、crop は deps に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  // renderComponent を使っていると crop の初期値が反映されない（crop が表示されない）ので、
  // マウントされた後に初期値を setCrop して表示させる
  useEffect(() => {
    setCrop({
      // TODO: 前回録画時の値を使う
      x: 300,
      y: 300,
      width: 300,
      height: 200,
    });
  }, []);

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
