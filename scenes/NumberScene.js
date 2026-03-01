export class NumberScene {
  constructor() {
    this.isLoaded = false;
    this.background = null;
    this.topLayer = null;

    this.gears = [];

    this.input = document.getElementById("numberInput");
    this.openButton = document.getElementById("openInputButton");

    this.popupPanel = document.getElementById("popupPanel");
    this.popupInput = document.getElementById("popupInput");
    this.popupOk = document.getElementById("popupOk");

    this.pinkButton = document.getElementById("pinkButton");
    this.outputBox = document.getElementById("outputBox");

    this.buttonUp = new Image();
    this.buttonUp.src = "/machine/goup.png";

    this.buttonDown = new Image();
    this.buttonDown.src = "/machine/godown.png";

    this.currentButtonImage = this.buttonUp;

    this.clickSound = new Audio("/machine/click.mp3");
    this.machineSound = new Audio("/machine/machine.mp3");

    this.machineSound.loop = true;
  }

  async init(engine) {
    this.engine = engine;

    engine.virtualWidth = 900;
    engine.virtualHeight = 900;
    engine.handleResize();

    // Position input box
    this.positionInput();
    this.input.style.display = "block";

    //settings box
    this.positionButton();
    this.openButton.style.display = "block";

    //action button
    this.positionPinkButton();
    this.pinkButton.style.display = "block";

    //output text box
    this.positionOutputBox();
    this.outputBox.style.display = "block";

    // Load layers
    this.background = await this.loadImage("/machine/background.png");
    this.topLayer = await this.loadImage("/machine/screwlayer.png");

    // Load gear images
    const gear1Img = await this.loadImage("/machine/n009.png");
    const gear2Img = await this.loadImage("/machine/n008.png");
    const gear3Img = await this.loadImage("/machine/n004.png");
    const gear4Img = await this.loadImage("/machine/n002.png");
    const gear5Img = await this.loadImage("/machine/n001.png");

    // Add gears to the array
    this.gears.push({
      img: gear1Img,
      x: 560,
      y: 50,
      rotation: 0,
      speed: 0.3 // clockwise
    });

    this.gears.push({
      img: gear2Img,
      x: 296,
      y: 105,
      rotation: 0,
      speed: -0.3 // counter‑clockwise
    });

    this.gears.push({
      img: gear3Img,
      x: 100,
      y: 290,
      rotation: 0,
      speed: 0.3 // counter‑clockwise
    });
    
    this.gears.push({
      img: gear4Img,
      x: 349,
      y: 410,
      rotation: 0,
      speed: -0.3 // counter‑clockwise
    });

    this.gears.push({
      img: gear5Img,
      x: 68,
      y: 560,
      rotation: 0,
      speed: -0.3 // counter‑clockwise
    });

    this.openButton.onclick = () => {
      this.popupPanel.style.display = "block";
      this.positionPopup();
      this.popupInput.focus();
    };

    this.popupOk.onclick = () => {
    console.log("User entered:", this.popupInput.value);
    this.popupPanel.style.display = "none";
};

//the input action button and maths for it
    this.pinkButton.onclick = () => {

      this.currentButtonImage = this.buttonDown;

      setTimeout(() => {
        this.currentButtonImage = this.buttonUp; //button down time
      }, 120);

      this.clickSound.currentTime = 0;
      this.clickSound.play();

      const a = parseFloat(this.input.value);
      let expr = this.popupInput.value.trim();

      if (isNaN(a)) {
        this.outputBox.textContent = "In";
        return;
      }

      if (expr === "") {
        this.outputBox.textContent = "Code";
        return;
      }

      expr = expr.replace(/x/gi, "*");

      const fullExpr = a + expr;

      let result;
      try {
        result = this.safeEvaluate(fullExpr);
      } catch (e) {
        this.outputBox.textContent = "Code";
        return;
      }

      this.outputBox.textContent = result;
    };

    this.machineSound.volume = 0.4; //volume control
    this.machineSound.play();

    this.isLoaded = true;

  }

  //forms the number sentence
    safeEvaluate(str) {
      if (!/^[0-9+\-*/(). ]+$/.test(str)) {
        throw new Error("?");
      }

      return Function('"use strict"; return (' + str + ')')();
    }

  positionInput() {
    const x = 80;
    const y = 75;

    const screenX = this.engine.offsetX + x * this.engine.scale;
    const screenY = this.engine.offsetY + y * this.engine.scale;

    this.input.style.left = screenX + "px";
    this.input.style.top = screenY + "px";

    this.input.style.width = 200 * this.engine.scale + "px";
    this.input.style.height = 70 * this.engine.scale + "px";
    this.input.style.fontSize = 70 * this.engine.scale + "px";
  }

  positionButton() {
    const x = 65;   // virtual X of your button
    const y = 192;   // virtual Y of your button
    const size = 80; // virtual size of the square button

    const screenX = this.engine.offsetX + x * this.engine.scale;
    const screenY = this.engine.offsetY + y * this.engine.scale;

    this.openButton.style.left = screenX + "px";
    this.openButton.style.top = screenY + "px";
    this.openButton.style.width = size * this.engine.scale + "px";
    this.openButton.style.height = size * this.engine.scale + "px";
  }

  positionPinkButton() {
    const x = 665;   // virtual X
    const y = 390;   // virtual Y
    const size = 181; // virtual size

    const screenX = this.engine.offsetX + x * this.engine.scale;
    const screenY = this.engine.offsetY + y * this.engine.scale;

    this.pinkButton.style.left = screenX + "px";
    this.pinkButton.style.top = screenY + "px";
    this.pinkButton.style.width = size * this.engine.scale + "px";
    this.pinkButton.style.height = size * this.engine.scale + "px";
  }

  positionOutputBox() {
    const x = 580;
    const y = 755;

    const screenX = this.engine.offsetX + x * this.engine.scale;
    const screenY = this.engine.offsetY + y * this.engine.scale;

    this.outputBox.style.left = screenX + "px";
    this.outputBox.style.top = screenY + "px";

    this.outputBox.style.width = 190 * this.engine.scale + "px";
    this.outputBox.style.height =  70 * this.engine.scale + "px";
    this.outputBox.style.fontSize = 70 * this.engine.scale + "px";
  }

  positionPopup() {
    const x = 105;  // virtual X of popup
    const y = 232;  // virtual Y of popup

    const screenX = this.engine.offsetX + x * this.engine.scale;
    const screenY = this.engine.offsetY + y * this.engine.scale;

    this.popupPanel.style.left = screenX + "px";
    this.popupPanel.style.top = screenY + "px";

    // Scale the popup
    this.popupPanel.style.transform = `scale(${this.engine.scale})`;
    this.popupPanel.style.transformOrigin = "top left";
  }


  async loadImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
    });
  }

  update(dt, engine) {
    if (!this.isLoaded) return;

    // Rotate all gears
    for (let g of this.gears) {
      g.rotation += dt * g.speed;
    }

    this.positionInput();
    this.positionButton();
    this.positionPopup();

    this.positionPinkButton();
    this.positionOutputBox();

  }

  draw(ctx, engine) {
    if (!this.isLoaded) {
      return; // skip drawing until everything is ready
    }

    ctx.save();
    ctx.translate(engine.offsetX, engine.offsetY);
    ctx.scale(engine.scale, engine.scale);

    // Background
    ctx.drawImage(this.background, 0, 0, 900, 900);

    // Button layer (UP or DOWN)
    ctx.drawImage(this.currentButtonImage, 0, 0, 900, 900);

    // Draw all gears
    for (let g of this.gears) {
    ctx.save();

    // Drop shadow for this gear only
    ctx.shadowColor = "rgb(0, 0, 0)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    // Move to gear center
    ctx.translate(g.x + g.img.width / 2, g.y + g.img.height / 2);
    ctx.rotate(g.rotation);

    // Draw gear centered
    ctx.drawImage(
        g.img,
        -g.img.width / 2,
        -g.img.height / 2
    );

    ctx.restore();
    }

    // Top layer
    ctx.drawImage(this.topLayer, 0, 0, 900, 900);

    ctx.restore();
  }
}