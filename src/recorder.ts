import { format } from 'date-fns';

const { desktopCapturer, remote } = window.require('electron');
const fs = window.require('fs');
const path = window.require('path');
const { app, getCurrentWindow, screen } = remote;

export class Recorder {
  readonly screenVideo = document.createElement('video');
  readonly croppingCanvas = document.createElement('canvas');
  readonly frameRate = 10;

  private mediaRecorder: MediaRecorder | null = null;
  private intervalId: number | null = null;

  public async start() {
    if (this.mediaRecorder) throw new Error('Recording has already started.');

    // ウィンドウ位置に基づいて、録画対象の source を選択
    const windowBounds = getCurrentWindow().getBounds();
    const display = screen.getDisplayMatching(windowBounds);
    const source = (await desktopCapturer.getSources({
      types: ['screen'],
    })).find(({ display_id }) => Number(display_id) === display.id);
    if (!source) throw new Error('Failed to find display.');

    const screenStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        // @ts-ignore
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id,
          minFrameRate: this.frameRate,
          maxFrameRate: this.frameRate,
        },
      },
    });
    // windowBounds 内の領域だけを切り出す
    // windowBounds, display.bounds ともに、メインディスプレイ左上が原点になっているので、
    // 座標を差し引く必要がある
    const croppedStream = this.cropStream(screenStream, {
      ...windowBounds,
      x: windowBounds.x - display.bounds.x,
      y: windowBounds.y - display.bounds.y,
    });

    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(croppedStream, {
      mimeType: 'video/webm',
      bitsPerSecond: 100 * 1000 * 1000,
    });
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

    if (!this.intervalId) return;
    window.clearInterval(this.intervalId);
    this.intervalId = null;
  }

  // video 要素と canvas 要素を経由して、指定領域のみを切り出す
  private cropStream(
    src: MediaStream,
    bounds: Electron.Rectangle,
  ): MediaStream {
    this.croppingCanvas.width = bounds.width;
    this.croppingCanvas.height = bounds.height;
    const ctx = this.croppingCanvas.getContext('2d')!;

    this.screenVideo.autoplay = true;
    this.screenVideo.srcObject = src;
    this.screenVideo.onplay = () => {
      this.intervalId = window.setInterval(
        () => ctx.drawImage(this.screenVideo, -bounds.x, -bounds.y),
        1000 / this.frameRate,
      );
      this.screenVideo.onplay = null;
    };

    // @ts-ignore: 型定義に captureStream() がまだ入っていない様子
    return this.croppingCanvas.captureStream();
  }
}

const blobToUint8Array = (blob: Blob): Promise<Uint8Array> =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blob);
  });
