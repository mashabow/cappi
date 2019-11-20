const { remote } = window.require('electron');
const { getCurrentWindow } = remote;

export const setIgnoreMouseEvents: (value: boolean) => void = getCurrentWindow()
  .setIgnoreMouseEvents;
