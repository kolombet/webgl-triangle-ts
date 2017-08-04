import registerServiceWorker from './registerServiceWorker';
// import init from './webgl';
import './styles.css';

import Init from './MapView';
// if (!document.getElementById('glcanvas')) {
//   throw new Error('glcanvas not found');
// }
// const canvas: HTMLCanvasElement = document.getElementById('glcanvas')! as HTMLCanvasElement;
// canvas.style.display = 'none';
// const gl = canvas.getContext('webgl')!;
// init(gl);
Init();
registerServiceWorker();
