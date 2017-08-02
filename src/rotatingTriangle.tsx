import Matrix4 from './cuon-matrix';
import { initShader } from './util';
/**
 * Rotating with Matrix4 + varying coloring
 */

class WebGL {
  gl: WebGLRenderingContext;
  shader: WebGLProgram;
  vertexShaderSource: string;
  fragmentShaderSource: string;

  translate: Array<number>;
  
  aPosition: number;
  uxformMatrix: WebGLUniformLocation;
  uWidth: WebGLUniformLocation;
  uHeight: WebGLUniformLocation;
  xformMatrix: Matrix4;
  angle: number;
  vertexBuffers: number;
  tick: number;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.init();
  }

  init() {
    this.vertexShaderSource = `
            attribute vec4 a_Position;
            attribute vec4 a_Color;
            uniform mat4 u_xformMatrix;
            
            varying vec4 v_Color;
            void main() {
                gl_Position = u_xformMatrix * a_Position;
                v_Color = a_Color;
            }
        `;

    this.fragmentShaderSource = `
            precision mediump float;
            uniform float u_Width;
            uniform float u_Height;
            varying vec4 v_Color;
            void main() {
                gl_FragColor = v_Color;
                // gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);
            }
        `;

    this.shader = initShader(this.gl, this.vertexShaderSource, this.fragmentShaderSource);
    this.translate = [0.5, 0.5, 0];
    this.angle = 90.0;

    this.aPosition = this.gl.getAttribLocation(this.shader, 'a_Position');
    this.uxformMatrix = this.gl.getUniformLocation(this.shader, 'u_xformMatrix')!;
    this.uWidth = this.gl.getUniformLocation(this.shader, 'u_Width')!;
    this.uHeight = this.gl.getUniformLocation(this.shader, 'u_Height')!;

    this.xformMatrix = new Matrix4();
    this.vertexBuffers = this.initVertexBuffers();

    this.tick = 0;

    this.draw();
  }

  draw = () => {
    this.tick++;
    const s = Math.sin(this.tick / 100);
    this.xformMatrix.setRotate(this.angle * s, 0, 0, 1);
    this.xformMatrix.translate(0.35, 0, 0);

    this.gl.vertexAttrib3f(this.aPosition, s, 0.0, 0.0);
    this.gl.uniformMatrix4fv(this.uxformMatrix, false, this.xformMatrix.elements);
    this.gl.uniform1f(this.uWidth, this.gl.drawingBufferWidth);
    this.gl.uniform1f(this.uHeight, this.gl.drawingBufferHeight);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexBuffers);
    window.requestAnimationFrame(this.draw);
  };

  initVertexBuffers() {
    const data = [0.0, 0.5, 1.0, 0.0, 0.0, -0.5, -0.5, 0.0, 1.0, 0.0, 0.5, -0.5, 0.0, 0.0, 1.0];
    const verticesColors = new Float32Array(data);
    const n = 3;

    const vertexColorBuffer = this.gl.createBuffer();
    if (!vertexColorBuffer) {
      throw new Error('vertexbuffer failed');
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexColorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, verticesColors, this.gl.STATIC_DRAW);

    const FSIZE = verticesColors.BYTES_PER_ELEMENT;
    const aPosition = this.gl.getAttribLocation(this.shader, 'a_Position');
    const aColor = this.gl.getAttribLocation(this.shader, 'a_Color');

    this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, FSIZE * 5, 0);
    this.gl.enableVertexAttribArray(aPosition);

    this.gl.vertexAttribPointer(aColor, 3, this.gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    this.gl.enableVertexAttribArray(aColor);
    return n;
  }
}

const init = (gl: WebGLRenderingContext): WebGL => {
  return new WebGL(gl);
};

export default init;
