import { format } from 'date-fns';

const { desktopCapturer, remote } = window.require('electron');
const fs = window.require('fs');
const path = window.require('path');
const util = window.require('util');
const childProcess = window.require('child_process');
const { app } = remote;

const exec = util.promisify(childProcess.exec);

export class Recorder {
  readonly frameRate = 10;

  private tempDir: string | null = null;
  private intervalId: number | null = null;

  public async start(bounds: Electron.Rectangle): Promise<void> {
    if (this.intervalId) throw new Error('Recording has already started.');

    this.tempDir = path.join(
      app.getPath('temp'),
      `cappi_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`,
    );
    fs.mkdirSync(this.tempDir);
    console.log(this.tempDir);

    // TODO: start() メソッドの引数を経由して対象スクリーンを指定可能にする
    const source = (await desktopCapturer.getSources({
      types: ['screen'],
    })).find(({ name }) => name === 'Entire Screen' || name === 'Screen 1');
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

    this.startSavingFrames(screenStream, bounds);
  }

  public async stop(): Promise<void> {
    this.stopSavingFrames();
    await this.generateWebP();
  }

  // フレームごとの保存を開始する
  // video 要素と canvas 要素を経由して、指定領域のみを切り出す
  private startSavingFrames(
    src: MediaStream,
    bounds: Electron.Rectangle,
  ): void {
    const video = document.createElement('video');
    video.autoplay = true;
    video.srcObject = src;

    const canvas = document.createElement('canvas');
    canvas.width = bounds.width;
    canvas.height = bounds.height;

    let count = 0;

    video.onplay = () => {
      this.intervalId = window.setInterval(() => {
        canvas.getContext('2d')!.drawImage(video, -bounds.x, -bounds.y);
        canvas.toBlob(async blob => {
          const data = await blobToUint8Array(blob!);
          const fileName = `${count.toString().padStart(5, '0')}.png`;
          fs.writeFileSync(path.join(this.tempDir!, fileName), data);
          count++;
        }, 'image/png');
      }, 1000 / this.frameRate);
      video.onplay = null;
    };
  }

  private stopSavingFrames(): void {
    if (!this.intervalId) throw new Error('Recording has not started.');
    window.clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private async generateWebP(): Promise<void> {
    const duration = Math.round(1000 / this.frameRate); // ms / frame
    const input = path.join(this.tempDir!, '*.png');
    const output = path.join(
      app.getPath('desktop'),
      `${path.basename(this.tempDir!)}.webp`,
    );
    try {
      await exec(`img2webp -lossy -d ${duration} ${input} -o ${output}`);
    } catch (e) {
      console.error(e);
    }
  }
}

const blobToUint8Array = (blob: Blob): Promise<Uint8Array> =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blob);
  });
