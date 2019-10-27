import { format } from 'date-fns';

const { desktopCapturer, remote } = window.require('electron');
const fs = window.require('fs');
const path = window.require('path');
const { app } = remote;

export class Recorder {
  private mediaRecorder: MediaRecorder | null = null;

  public async start() {
    if (this.mediaRecorder) throw new Error('Recording has already started.');

    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    console.log(sources)
    // TODO: ウィンドウ位置からスクリーンを自動で選択
    const source = sources.filter(s => s.name === 'Screen 1').shift();
    if (!source) return;

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
      const fileName = path.join(
        app.getPath('desktop'),
        `recording_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.webm`,
        );
      const data = await blobToUint8Array(new Blob(chunks));
      fs.writeFileSync(fileName, data);
    };

    mediaRecorder.start();
    this.mediaRecorder = mediaRecorder;
  }

  public stop() {
    if (!this.mediaRecorder) return;
    this.mediaRecorder.stop();
    this.mediaRecorder = null;
  }
}

const blobToUint8Array = (blob: Blob): Promise<Uint8Array> => new Promise(
  resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blob);
  },
);
