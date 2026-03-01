export class Card {
  constructor(x, y, width, height, frontImg, backImg) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.frontImg = frontImg;
    this.backImg = backImg;

    this.faceUp = false;
    this.flipping = false;
    this.progress = 0; // 0 → 1
  }

  flip() {
    if (!this.flipping) {
      this.flipping = true;
    }
  }

  update(dt) {
    if (this.flipping) {
      this.progress += dt * 2; // 0.5 sec flip

      if (this.progress >= 1) {
        this.progress = 0;
        this.flipping = false;
        this.faceUp = !this.faceUp;
      }
    }
  }

    draw(ctx) {
    ctx.save();

    // --- Drop shadow ---
    ctx.shadowColor = "rgba(0, 0, 0, 0.78)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;

    // Move to card center
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Flip animation
    const scale = Math.abs(Math.cos(this.progress * Math.PI));
    ctx.scale(scale, 1);

    const showingBack = this.progress > 0.5 ? !this.faceUp : this.faceUp;
    const img = showingBack ? this.backImg : this.frontImg;

    ctx.drawImage(
        img,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
    );

  ctx.restore();
}

  containsPoint(px, py) {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }
}