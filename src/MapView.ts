import * as PIXI from 'pixi.js';

class Point {
  x: number;
  y: number;
}

class Hectare {
  data: Array<Array<boolean>>;

  constructor() {
    this.data = [];
    for (let row = 0; row < 10; row++) {
      let rData = [];
      for (let i = 0; i < 10; i++) {
        let rand = Math.random() - 0.5 > 0;
        rData[i] = rand;
      }
      this.data[row] = rData;
    }
  }
}

class World {
  data: Array<Array<Hectare>>;
  constructor() {
    const size = 30;
    this.data = [];
    for (let row = 0; row < size; row++) {
      let rData = [];
      for (let i = 0; i < size; i++) {
        rData[i] = new Hectare();
      }
      this.data[row] = rData;
    }
  }
}

export default function Init() {
  var stage = new PIXI.Container();
  let iw = window.innerWidth;
  let ih = window.innerHeight;
  console.log('iw = ' + iw + ' ih ' + ih);
  var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
  renderer.render(stage);
  renderer.view.width = window.innerWidth;
  renderer.view.height = window.innerHeight;
  renderer.view.style.width = window.innerWidth + 'px';
  renderer.view.style.height = window.innerHeight + 'px';
  renderer.view.style.position = 'absolute';
  renderer.view.className = 'game-canvas';
  document.body.appendChild(renderer.view);
  PIXI.loader.add('coffee', '/tile.png').load(setup);

  let world = new World();

  var mainContainer = new PIXI.Sprite();
  var lastDX = 0;
  var lastDY = 0;
  let isPressed: boolean = false;

  function setup() {
    console.log('tile loaded');

    stage.addChild(mainContainer);

    var texture = PIXI.loader.resources.coffee.texture;
    for (let i = 0; i < world.data.length; i++) {
      var row: Array<Hectare> = world.data[i];
      for (let m = 0; m < row.length; m++) {
        var hec: Hectare = row[m];
        for (let n = 0; n < hec.data.length; n++) {
          var hecRow = hec.data[n];
          for (let z = 0; z < hecRow.length; z++) {
            let isExist: boolean = hecRow[z];
            let coordX = i * 320 + n * 32;
            let coordY = m * 320 + z * 32;
            if (isExist) {
              let spr = new PIXI.Sprite(texture);
              spr.position.x = coordX;
              spr.position.y = coordY;
              mainContainer.addChild(spr);
            }
          }
        }
      }
    }
    // if (texture === undefined || texture === null) {
    //   throw new Error('error');
    // }
    // block = new PIXI.Sprite(texture);
    // block.anchor.x = 0.5;
    // block.anchor.y = 0.61;

    // block.position.x = 200;
    // block.position.y = 150;
    // stage.addChild(block);

    // let graphics = new PIXI.Graphics();
    // graphics.beginFill(0xffff00);
    // graphics.lineStyle(5, 0xff0000);
    // graphics.drawRect(0, 0, 300, 200);
    // stage.addChild(graphics);

    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
    window.addEventListener('touchstart', mouseDownHandler, false);
    window.addEventListener('touchend', mouseUpHandler, false);
    // window.addEventListener('touchcancel', handleCancel, false);
    window.addEventListener('touchmove', mouseMoveHandler, false);

    function getMousePos(event: MouseEvent | TouchEvent) {
      var point = { x: 0, y: 0 };
      if (event instanceof MouseEvent) {
        point.x = event.clientX;
        point.y = event.clientY;
      }
      if (event instanceof TouchEvent) {
        point.x = event.touches[0].pageX;
        point.y = event.touches[0].pageY;
      }
      var rect = renderer.view.getBoundingClientRect();
      var cp: Point = { x: 0, y: 0 };
      cp.x = point.x - rect.left;
      cp.y = point.y - rect.top;
      return cp;
    }

    let currentPoint: Point = { x: 0, y: 0 };
    function mouseDownHandler(event: MouseEvent) {
      isPressed = true;
      currentPoint = getMousePos(event);
    }
    function mouseMoveHandler(event: MouseEvent | TouchEvent) {
      if (!isPressed) {
        return;
      }

      let cp = getMousePos(event);
      lastDX = cp.x - currentPoint.x;
      lastDY = cp.y - currentPoint.y;
      mainContainer.position.x += lastDX;
      mainContainer.position.y += lastDY;

      currentPoint = cp;
    }

    function mouseUpHandler(event: MouseEvent) {
      isPressed = false;
    }
    theloop();
  }

  var theloop = function() {
    requestAnimationFrame(theloop);
    // block.rotation += 0.03;
    // console.log(' dx ' + lastDX);
    var v: PIXI.ObservablePoint = mainContainer.position as PIXI.ObservablePoint;
    var vw = new PIXI.Point();
    vw.set(v.x, v.y);
    vw.x += window.innerWidth;
    var vh = new PIXI.Point();
    vh.set(v.x, v.y);
    vh.y += window.innerHeight;
    var vwh = new PIXI.Point();
    vwh.set(v.x, v.y);
    vwh.x += window.innerWidth;
    vwh.y += window.innerHeight;

    console.log(`visible space ${v} ${vw} ${vh} ${vwh} `);
    if (!isPressed) {
      const epsilon = 0.5;
      let maxSpeed = Math.max(Math.abs(lastDX), Math.abs(lastDY));
      if (maxSpeed > epsilon) {
        let coef = 0.95;
        if (maxSpeed < 6) {
          coef = 0.9;
        } else if (maxSpeed < 3) {
          coef = 0.7;
        }
        lastDX = coef * lastDX;
        lastDY = coef * lastDY;
        mainContainer.position.x += lastDX;
        mainContainer.position.y += lastDY;
      } else {
        lastDX = lastDY = 0;
      }
    }

    renderer.render(stage);
  };
}
