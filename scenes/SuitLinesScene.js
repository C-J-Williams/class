import { Card } from "../components/Card.js";

export class SuitLinesScene {

  constructor() {
    this.isLoaded = false;

    this.infoButton = document.getElementById("infoButton");
    this.flipPanel = document.getElementById("flipPanel");
    this.flipPanelClose = document.getElementById("flipPanelClose");
  }

  async init(engine) {
    this.engine = engine;
    this.cards = [];
    this.buttons = [];

    this.suits = ["clubs", "diamonds", "hearts", "spades"];
    this.ranks = ["A", "2", "3", "4", "5", "6"];

    // Load background
    this.background = await this.loadImage("cards/felt.png");
              this.feltPattern = null; 
              const patternCanvas = document.createElement("canvas");
              patternCanvas.width = this.background.width;
              patternCanvas.height = this.background.height;
              const pctx = patternCanvas.getContext("2d");
              pctx.drawImage(this.background, 0, 0);
              this.feltPattern = this.engine.ctx.createPattern(patternCanvas, "repeat");

    //load buttons          
    this.buttonImages = {
    faces: await this.loadImage("cards/faces.png"),
    backs: await this.loadImage("cards/backs.png"),
    swap:  await this.loadImage("cards/swap.png")
    };

    // Load flip sound safely
    this.flipSound = new Audio("cards/flip.mp3");

    // Load back image once
    this.backImg = await this.loadImage("cards/back.png");

    this.infoIconImg = await this.loadImage("cards/info.png");

    // Load all card faces
    this.faceImages = {};
    for (let suit of this.suits) {
      this.faceImages[suit] = {};
      for (let rank of this.ranks) {
        this.faceImages[suit][rank] = await this.loadImage(`cards/${suit}_${rank}.png`);
      }
    }

    this.createCards();
    this.createButtons();

    // Position and show info button
    this.positionInfoButton();
    this.infoButton.style.display = "block";

    // Clicking the invisible button opens the flipPanel
    this.infoButton.onclick = () => {
    this.flipPanel.style.display = "block";
    this.positionFlipPanel();
    };

    // Close button
    this.flipPanelClose.onclick = () => {
    this.flipPanel.style.display = "none";
    };

    this.titleImg = await this.loadImage("cards/cardflip.png");

    this.isLoaded = true;
  }

  loadImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
    });
  }

  // SAFE sound playback helper
  playFlipSound() {
    if (!this.flipSound) return;
    this.flipSound.currentTime = 0;
    this.flipSound.play().catch(() => {});
  }

  createCards() {
    const startX = 80;
    const startY = 60;
    const cardW = 120;
    const cardH = 180;
    const gapX = 140;
    const gapY = 200;

    for (let row = 0; row < this.suits.length; row++) {
      const suit = this.suits[row];

      for (let col = 0; col < this.ranks.length; col++) {
        const rank = this.ranks[col];

        const card = new Card(
          startX + col * gapX,
          startY + row * gapY,
          cardW,
          cardH,
          this.faceImages[suit][rank],
          this.backImg
        );

        this.cards.push(card);
      }
    }
  }

  createButtons() {
    this.buttons = [
      {
        img: this.buttonImages.backs,
        x: 980,
        y: 60,
        w: 200,
        h: 80,
        action: () => this.setAll(true)
      },
      {
        img: this.buttonImages.faces,
        x: 980,
        y: 160,
        w: 200,
        h: 80,
        action: () => this.setAll(false)
      },
      {
        img: this.buttonImages.swap,
        x: 980,
        y: 260,
        w: 200,
        h: 80,
        action: () => this.swapAll()
      }
    ];
  }

  positionInfoButton() {
    const x = 1119;   // virtual X of icon
    const y = 417;   // virtual Y of icon
    const size = 90; // virtual size of icon

    const screenX = this.engine.offsetX + x * this.engine.scale;
    const screenY = this.engine.offsetY + y * this.engine.scale;

    this.infoButton.style.left = screenX + "px";
    this.infoButton.style.top = screenY + "px";
    this.infoButton.style.width = size * this.engine.scale + "px";
    this.infoButton.style.height = size * this.engine.scale + "px";
  }

  positionFlipPanel() {
    const x = 430;   // virtual X
    const y = 450;   // virtual Y

    const screenX = this.engine.offsetX + x * this.engine.scale;
    const screenY = this.engine.offsetY + y * this.engine.scale;

    this.flipPanel.style.left = screenX + "px";
    this.flipPanel.style.top = screenY + "px";

    this.flipPanel.style.transform = `scale(${this.engine.scale})`;
    this.flipPanel.style.transformOrigin = "top left";
  }

  setAll(faceUp) {
    for (let card of this.cards) {
      if (card.faceUp !== faceUp) {
        card.flip();
        this.playFlipSound();
      }
    }
  }

  swapAll() {
    for (let card of this.cards) {
      card.flip();
      this.playFlipSound();
    }
  }

  update(dt, engine) {
    if (!this.isLoaded) return;

    for (let card of this.cards) {
      card.update(dt);
    }

    const input = engine.input;

    if (input.pointer.justPressed) {
      const p = input.pointer;

      // Check buttons
      for (let btn of this.buttons) {
        if (
          p.x >= btn.x && p.x <= btn.x + 200 &&
          p.y >= btn.y && p.y <= btn.y + 80
        ) {
          btn.action();
          return;
        }
      }

      // Check cards
      for (let card of this.cards) {
        if (card.containsPoint(p.x, p.y)) {
          card.flip();
          this.playFlipSound();
          return;
        }
      }
    }

    this.positionInfoButton();
    this.positionFlipPanel();

  }

  draw(ctx, engine) {
    if (!this.isLoaded) {
        return; // skip drawing until everything is ready
    }

    ctx.save(); //added for scaling

  // Apply centering + scaling
    ctx.translate(engine.offsetX, engine.offsetY);
    ctx.scale(engine.scale, engine.scale);

  // Draw felt background at virtual size
    ctx.fillStyle = this.feltPattern;
    ctx.fillRect(0, 0, engine.virtualWidth, engine.virtualHeight);
 
  // Draw buttons
    ctx.font = "20px Arial";
    ctx.textBaseline = "middle";

    for (let btn of this.buttons) {
      ctx.drawImage(btn.img, btn.x, btn.y, btn.w, btn.h);
      }

  // Draw info icon
    ctx.drawImage(this.infoIconImg, 1100, 400, 126, 126);

    // Draw cards
    for (let card of this.cards) {
      card.draw(ctx);
    }

  // Draw title graphic (bottom-right)
    if (this.titleImg) {
      const w = 350;
      const h = 160;
      const x = 1280 - w - 20;         // 20px from right
      const y = 900 - h - 20;         // 20px from bottom

      ctx.drawImage(this.titleImg, x, y, w, h);
    }

    ctx.restore();
    
  }
}