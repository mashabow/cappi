// node モジュールは window.require() でインポートする必要があるが、
// それだと any になってしまうので、ここで型をつける
// https://stackoverflow.com/a/58422337

import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

declare global {
  interface Window {
    require(_: 'child_process'): typeof childProcess;
    require(_: 'fs'): typeof fs;
    require(_: 'path'): typeof path;
    require(_: 'util'): typeof util;
  }
}
