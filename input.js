export class Input {
  constructor(canvas, engine) {
    this.canvas = canvas;
    this.engine = engine;

    // Pointer state
    this.pointer = {
      x: 0,
      y: 0,
      down: false,
      justPressed: false,
      justReleased: false
    };

    // Keyboard state
    this.keys = {};
    this.keysPressed = {};
    this.keysReleased = {};

    // Bind events
    canvas.addEventListener("mousedown", e => this.onPointerDown(e));
    canvas.addEventListener("mouseup", e => this.onPointerUp(e));
    canvas.addEventListener("mousemove", e => this.onPointerMove(e));

    canvas.addEventListener("touchstart", e => this.onTouchStart(e));
    canvas.addEventListener("touchend", e => this.onTouchEnd(e));
    canvas.addEventListener("touchmove", e => this.onTouchMove(e));

    window.addEventListener("keydown", e => this.onKeyDown(e));
    window.addEventListener("keyup", e => this.onKeyUp(e));
  }

  // --- POINTER EVENTS ---
  onPointerDown(e) {
    this.pointer.down = true;
    this.pointer.justPressed = true;
    this.updatePointerPosition(e);

    if (this.engine?.scene?.onPointerDown) {
    this.engine.scene.onPointerDown(this.pointer.x, this.pointer.y);
}
  }

  onPointerUp(e) {
    this.pointer.down = false;
    this.pointer.justReleased = true;
    this.updatePointerPosition(e);

    if (this.engine?.scene?.onPointerUp) {
    this.engine.scene.onPointerUp(this.pointer.x, this.pointer.y);
}
  }

  onPointerMove(e) {
    this.updatePointerPosition(e);

    if (this.engine?.scene?.onPointerMove) {
    this.engine.scene.onPointerMove(this.pointer.x, this.pointer.y);
}    
  }

  updatePointerPosition(e) {
    const rect = this.canvas.getBoundingClientRect();

    const realX = e.clientX - rect.left;
    const realY = e.clientY - rect.top;
    this.pointer.x = (realX - this.engine.offsetX) / this.engine.scale;
    this.pointer.y = (realY - this.engine.offsetY) / this.engine.scale;

    /*  this.pointer.x = e.clientX - rect.left;
    this.pointer.y = e.clientY - rect.top;*/
  }

  // --- TOUCH EVENTS ---
  onTouchStart(e) {
    e.preventDefault();
    const t = e.touches[0];
    this.pointer.down = true;
    this.pointer.justPressed = true;

    const rect = this.canvas.getBoundingClientRect();
    const realX = t.clientX - rect.left;
    const realY = t.clientY - rect.top;

    this.pointer.x = (realX - this.engine.offsetX) / this.engine.scale;
    this.pointer.y = (realY - this.engine.offsetY) / this.engine.scale;
  }

  onTouchMove(e) {
    e.preventDefault();
    const t = e.touches[0];

    const rect = this.canvas.getBoundingClientRect();
    const realX = t.clientX - rect.left;
    const realY = t.clientY - rect.top;

    this.pointer.x = (realX - this.engine.offsetX) / this.engine.scale;
    this.pointer.y = (realY - this.engine.offsetY) / this.engine.scale;
  }

  onTouchEnd(e) {
    e.preventDefault();
    this.pointer.down = false;
    this.pointer.justReleased = true;
  }

  // --- KEYBOARD EVENTS ---
  onKeyDown(e) {
    if (!this.keys[e.key]) {
      this.keysPressed[e.key] = true;
    }
    this.keys[e.key] = true;
  }

  onKeyUp(e) {
    this.keys[e.key] = false;
    this.keysReleased[e.key] = true;
  }

  // --- CALLED EACH FRAME ---
  update() {
    this.pointer.justPressed = false;
    this.pointer.justReleased = false;

    this.keysPressed = {};
    this.keysReleased = {};
  }

  // --- PUBLIC HELPERS ---
  isKeyDown(key) {
    return !!this.keys[key];
  }

  wasKeyPressed(key) {
    return !!this.keysPressed[key];
  }

  wasKeyReleased(key) {
    return !!this.keysReleased[key];
  }
}