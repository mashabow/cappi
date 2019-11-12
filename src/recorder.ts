import { format } from 'date-fns';

const { desktopCapturer, remote } = window.require('electron');
const fs = window.require('fs');
const path = window.require('path');
const util = window.require('util');
const childProcess = window.require('child_process');
const { app, getCurrentWindow, screen } = remote;

const exec = util.promisify(childProcess.exec);

export class Recorder {
  readonly screenVideo = document.createElement('video');
  readonly croppingCanvas = document.createElement('canvas');
  readonly frameRate = 10;

  private tempDir: string | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private intervalId: number | null = null;
  private recorded: boolean = false;

  public async start() {
    if (this.mediaRecorder) throw new Error('Recording has already started.');
    this.recorded = false;

    this.tempDir = path.join(
      app.getPath('temp'),
      `cappi_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`,
    );
    fs.mkdirSync(this.tempDir);
    console.log(this.tempDir);

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
      const fileName = path.join(this.tempDir, 'video.webm');
      const data = await blobToUint8Array(new Blob(chunks));
      fs.writeFileSync(fileName, data);
      this.recorded = true;
    };

    mediaRecorder.start();
    this.mediaRecorder = mediaRecorder;
  }

  public async stop() {
    if (!this.mediaRecorder) return;
    this.mediaRecorder.stop();
    this.mediaRecorder = null;

    if (!this.intervalId) return;
    window.clearInterval(this.intervalId);
    this.intervalId = null;

    await this.generateWebP();
  }

  private async generateWebP() {
    if (!this.recorded) throw new Error('Recording has not finished.');
    const duration = Math.round(1000 / this.frameRate); // ms / frame
    const input = path.join(this.tempDir, '*.png');
    const output = path.join(
      app.getPath('desktop'),
      `${path.basename(this.tempDir)}.webp`,
    );
    try {
      await exec(`img2webp -lossy -d ${duration} ${input} -o ${output}`);
    } catch (e) {
      console.error(e);
    }
  }

  // video 要素と canvas 要素を経由して、指定領域のみを切り出す
  private cropStream(
    src: MediaStream,
    bounds: Electron.Rectangle,
  ): MediaStream {
    this.croppingCanvas.width = bounds.width;
    this.croppingCanvas.height = bounds.height;
    const ctx = this.croppingCanvas.getContext('2d')!;

    let count = 0;

    this.screenVideo.autoplay = true;
    this.screenVideo.srcObject = src;
    this.screenVideo.onplay = () => {
      this.intervalId = window.setInterval(() => {
        ctx.drawImage(this.screenVideo, -bounds.x, -bounds.y);
        this.croppingCanvas.toBlob(async blob => {
          const data = await blobToUint8Array(blob!);
          const fileName = `${count.toString().padStart(5, '0')}.png`;
          fs.writeFileSync(path.join(this.tempDir, fileName), data);
          count++;
        }, 'image/png');
      }, 1000 / this.frameRate);
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
