import { Input } from "./input.js";

export class Engine {
constructor(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  this.scene = null;
  this.last = 0;

  // Virtual resolution (your design size)
  this.virtualWidth = 1280;
  this.virtualHeight = 900;

  // Scale + offset for centering
  this.scale = 1;
  this.offsetX = 0;
  this.offsetY = 0;

  // Input needs access to engine for coordinate conversion
  this.input = new Input(canvas, this);

  // Handle initial size + future resizes
  this.handleResize();
  window.addEventListener("resize", () => this.handleResize());


  /*this.input = new Input(canvas);

  this.resize();
  window.addEventListener("resize", () => this.resize());
*/


  this.loop = this.loop.bind(this);
  requestAnimationFrame(this.loop);
}

  handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Compute scale to fit while preserving aspect ratio
    const scaleX = w / this.virtualWidth;
    const scaleY = h / this.virtualHeight;
    this.scale = Math.min(scaleX, scaleY);

    // Resize canvas to full browser size
    this.canvas.width = w;
    this.canvas.height = h;

    // Center the virtual canvas
    this.offsetX = (w - this.virtualWidth * this.scale) / 2;
    this.offsetY = (h - this.virtualHeight * this.scale) / 2;
  }

/*  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
*/

  setScene(scene) {
    this.scene = scene;
    scene.init(this);
  }

  loop(ts) {
    const dt = (ts - this.last) / 1000;
    this.last = ts;

    if (this.scene) {
      this.scene.update(dt, this);
      this.scene.draw(this.ctx, this);
    }

    this.input.update(); // ← ADD THIS

    requestAnimationFrame(this.loop);
  }
}