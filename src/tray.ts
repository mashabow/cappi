import trayIconTemplate from './assets/trayIconTemplate.png';
import trayIconTemplate2x from './assets/trayIconTemplate@2x.png';

const { remote } = window.require('electron');
const { nativeImage, Tray } = remote;

// ビルド前後のパスの差を吸収するのが手間そうなので、
// パス指定ではなく、dataURL からアイコン画像を生成する
const icon = nativeImage.createFromDataURL(trayIconTemplate);
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
