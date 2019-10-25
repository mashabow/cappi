const { desktopCapturer } = window.require('electron');
const fs = window.require('fs');

export const record = async () => {
  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  console.log(sources)
  // TODO: ウィンドウ位置からスクリーンを自動で選択
  const source = sources.filter(s => s.name === 'Screen 1').shift();
  if (!source) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        // @ts-ignore
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720
        },
      },
    });

    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async e => {
      const data = await blobToUint8Array(new Blob(chunks));
      fs.writeFileSync('/Users/mashabow/Desktop/out.webm', data);
    };

    // TODO: 録画開始したら start()
    mediaRecorder.start();

    // TODO: 録画終了したら stop()
    await new Promise(resolve => setTimeout(resolve, 3000));
    mediaRecorder.stop();

  } catch (e) {
    console.error(e);
  }
};

const blobToUint8Array = (blob: Blob): Promise<Uint8Array> => new Promise(
  resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blob);
  },
);
