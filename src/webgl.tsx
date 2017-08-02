import { initShader } from './util';
import Matrix4 from './cuon-matrix';
/**
 * Rotating with Matrix4 + varying coloring
 */

class WebGL {
  gl: WebGLRenderingContext;
  shader: WebGLProgram;
  vertexShaderSource: string;
  fragmentShaderSource: string;

  numberOfVertixes: number;
  tick: number;

  aPosition: number;
  uSampler: WebGLUniformLocation;
  uxformMatrix: WebGLUniformLocation;
  texture: WebGLTexture;

  xformMatrix: Matrix4;
  angle: number;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.init();
  }

  init() {
    this.vertexShaderSource = `
        attribute vec4 a_Position;
        uniform mat4 u_xformMatrix;
        
        attribute vec2 a_TexCoord;
        varying vec2 v_TexCoord;

        void main() {
            gl_Position = u_xformMatrix * a_Position;
            v_TexCoord = a_TexCoord;
        }
    `;

    this.fragmentShaderSource = `
        precision mediump float;
        uniform sampler2D u_Sampler;
        varying vec2 v_TexCoord;
        void main() {
            gl_FragColor = texture2D(u_Sampler, v_TexCoord);
        }
    `;

    this.numberOfVertixes = 4;
    this.tick = 0;
    this.angle = 90.0;
    this.xformMatrix = new Matrix4();

    this.shader = initShader(this.gl, this.vertexShaderSource, this.fragmentShaderSource);

    this.uxformMatrix = this.gl.getUniformLocation(this.shader, 'u_xformMatrix')!;
    this.uSampler = this.gl.getUniformLocation(this.shader, 'u_Sampler')!;
    this.gl.uniform1i(this.uSampler, 0);

    this.initVertexBuffers();
    this.initTextures(this.draw);
  }

  draw = () => {
    this.tick++;

    // const s = Math.sin(this.tick / 100);
    const s = 1;
    this.xformMatrix.setRotate(this.angle * s, 0, 0, 1);
    // this.xformMatrix.translate(0.005 * s, 0, 0);

    this.gl.uniformMatrix4fv(this.uxformMatrix, false, this.xformMatrix.elements);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.numberOfVertixes);

    window.requestAnimationFrame(this.draw);
  };

  initVertexBuffers() {
    const data = [-1, 1, 0.0, 1.0, -1, -1, 0.0, 0.0, 1, 1, 1.0, 1.0, 1, -1, 1.0, 0.0];
    const vertices = new Float32Array(data);

    const FSIZE = vertices.BYTES_PER_ELEMENT;

    const vertexBuffer = this.gl.createBuffer();
    if (!vertexBuffer) {
      throw new Error('vertexbuffer failed');
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    const aPosition = this.gl.getAttribLocation(this.shader, 'a_Position');
    this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, FSIZE * 4, 0);
    this.gl.enableVertexAttribArray(aPosition);

    const aTexCoord = this.gl.getAttribLocation(this.shader, 'a_TexCoord');
    this.gl.vertexAttribPointer(aTexCoord, 2, this.gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    this.gl.enableVertexAttribArray(aTexCoord);
  }

  initTextures(callback: Function) {
    var image = new Image();
    image.onload = () => this.loadTexture(image, callback);
    image.src = 'blueflower.jpg';
  }

  loadTexture(image: HTMLImageElement, callback: Function) {
    this.texture = this.gl.createTexture()!;

    if (!this.texture) {
      throw new Error('Failed to create the texture object');
    }

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, image);

    callback();
  }
}

const init = (gl: WebGLRenderingContext): WebGL => {
  return new WebGL(gl);
};

export default init;
