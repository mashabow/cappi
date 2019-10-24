const { desktopCapturer } = window.require('electron');

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

    // TODO: ファイルに出力
    const video = document.querySelector('video');
    if (video) {
      video.srcObject = stream;
      video.onloadedmetadata = (e) => video.play();
    }
  } catch (e) {
    console.error(e);
  }
};
