import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Cropper from './cropper/Cropper';
import Trimmer from './trimmer/Trimmer';

const Component = (() => {
  const fragment = window.location.hash.substring(1);
  switch (fragment) {
    case 'cropper':
      return Cropper;
    case 'trimmer':
      return Trimmer;
    default:
      throw new Error(`No route matches: ${fragment}`);
  }
})();

ReactDOM.render(<Component />, document.getElementById('root'));
