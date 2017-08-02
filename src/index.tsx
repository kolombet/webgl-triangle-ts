import registerServiceWorker from './registerServiceWorker';
import init from './webgl';

if (!document.getElementById('glcanvas')) {
  throw new Error('glcanvas not found');
}
const canvas: HTMLCanvasElement = document.getElementById('glcanvas')! as HTMLCanvasElement;
const gl = canvas.getContext('webgl')!;
init(gl);
registerServiceWorker();
