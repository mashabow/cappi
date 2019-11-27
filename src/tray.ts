import trayIconTemplate from './assets/trayIconTemplate.png';
import trayIconTemplate2x from './assets/trayIconTemplate@2x.png';

const { remote } = window.require('electron');
const { nativeImage, Tray } = remote;

// Parcel でビルドするとファイル名にハッシュがついてしまうので、複数 scaleFactor の自動読み込みができない
// そこで parcel-plugin-url-loader を使って base64 でインライン化し、そこからアイコン画像を生成する
const icon = nativeImage.createEmpty();
icon.addRepresentation({
  scaleFactor: 1,
  dataURL: trayIconTemplate,
});
icon.addRepresentation({
  scaleFactor: 2,
  dataURL: trayIconTemplate2x,
});
icon.isMacTemplateImage = true;

let tray: Electron.Tray | null = null;

export const addTray = (onClick: () => void): void => {
  tray = new Tray(icon);
  tray.setToolTip('Click to stop');
  tray.addListener('click', onClick);
};

export const removeTray = (): void => {
  if (!tray) throw new Error('There is no Tray.');
  tray.destroy();
};
