export class MainMenuScene {
  init(engine) {
    this.engine = engine;

    this.buttons = [
      { label: "Card Flipper", image: "./icons/card.png", action: () => this.startCardFlipper() },
      { label: "Number Machine", image: "./icons/num.png", action: () => this.startNumberMachine() },
      { label: "Group Creator", image: "./icons/group.png", action: () => this.startRandomSorter() },
      { label: "Item Sorter", image: "./icons/sort.png", action: () => this.startItemSorter() }
    ];

  let imagesLoaded = 0;

  for (let btn of this.buttons) {
    btn.img = new Image();
    btn.img.src = btn.image;

    btn.img.onload = () => {
      btn.width = btn.img.width;
      btn.height = btn.img.height;

      imagesLoaded++;

      if (imagesLoaded === this.buttons.length) {
        this.layoutButtons();   // <-- stack once all loaded
      }
    };
  }
  }

  startCardFlipper() {
    import("./SuitLinesScene.js").then(module => {
      this.engine.setScene(new module.SuitLinesScene());
    });
  }

  startNumberMachine() {
    import("./NumberScene.js").then(module => {
      this.engine.setScene(new module.NumberScene());
    });
  }

  startRandomSorter() {
    import("./RandomSorterScene.js").then(module => {
      this.engine.setScene(new module.RandomSorterScene());
    });
  }

  startItemSorter() {
    import("./SortingScene.js").then(module => {
      this.engine.setScene(new module.SortingScene());
    });
  }


layoutButtons() {

  const spacing = 20;  // space between buttons
  const startY = 150;  // top starting position

  let currentY = startY;

  for (let btn of this.buttons) {

    // Center horizontally
    btn.x = (this.engine.virtualWidth - btn.width) / 2;

    btn.y = currentY;

    currentY += btn.height + spacing;
  }
}


  update(dt, engine) {
    const input = engine.input;

    if (input.pointer.justPressed) {
      const p = input.pointer;

      for (let btn of this.buttons) {
        if (
          p.x >= btn.x && p.x <= btn.x + btn.width &&
          p.y >= btn.y && p.y <= btn.y + btn.height
        ) {
          btn.action();
          return;
        }
      }
    }
  }

draw(ctx, engine) {
  ctx.save();

  // Apply scaling + centering
  ctx.translate(engine.offsetX, engine.offsetY);
  ctx.scale(engine.scale, engine.scale);

  // Clear virtual area
  ctx.clearRect(0, 0, engine.virtualWidth, engine.virtualHeight);

  ctx.font = "32px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Choose an item", 100, 80);

  ctx.font = "24px Arial";
  ctx.textBaseline = "middle";

  for (let btn of this.buttons) {

    if (btn.img && btn.img.complete) {

      ctx.drawImage(btn.img, btn.x, btn.y);

      // Optional dark overlay for readability
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

      ctx.fillStyle = "yellow";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        btn.label,
        btn.x + btn.width / 2,
        btn.y + btn.height / 2
      );
    }
  }

  ctx.restore();
}

}