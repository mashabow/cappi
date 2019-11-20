import trayIconTemplate from './assets/trayIconTemplate.png';
import trayIconTemplate2x from './assets/trayIconTemplate@2x.png';

const { remote } = window.require('electron');
const { Menu, nativeImage, Tray } = remote;

let tray = null;

export const setTray = (): void => {
  // ビルド前後のパスの差を吸収するのが手間そうなので、
  // パス指定ではなく、dataURL からアイコン画像を生成する
  const icon = nativeImage.createFromDataURL(trayIconTemplate);
  icon.addRepresentation({
    scaleFactor: 2,
    dataURL: trayIconTemplate2x,
  });
  icon.isMacTemplateImage = true;

  tray = new Tray(icon);
  tray.setToolTip('This is my app.');
  tray.setTitle('hoge');

  const contextMenu = Menu.buildFromTemplate([{ role: 'quit' }]);
  tray.setContextMenu(contextMenu);
};
