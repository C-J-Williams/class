export class SortingScene {
  constructor(configPath = "./activities/parts_of_speech.json") {
    this.configPath = configPath;

    this.engine = null;
    this.isLoaded = false;

    this.title = "";
    this.categories = [];
    this.items = [];
    this.buttons = [];

    this.menuX = 818;
    this.menuY = 470;
    this.menuW = 300;
    this.rowH = 50;

    this.mouse = {
      x: 0,
      y: 0,
      isDown: false
    };

    this.activeDragItem = null;
    this.hasChecked = false;

    this.availableLists = [
      { label: "Parts of Speech", path: "./activities/parts_of_speech.json" },
      { label: "Animals", path: "./activities/animals.json" },
      { label: "Maths Operations", path: "./activities/operations.json" },
      { label: "IT Terms", path: "./activities/computer.json" },
      { label: "Land Forms", path: "./activities/landforms.json" },
      { label: "States of Matter", path: "./activities/statesofmatter.json" },
      { label: "Load from Computer…", path: null }
    ];
  }

  // INITIALISATION
  async init(engine) {
    this.engine = engine;

    const resp = await fetch(this.configPath);
    const data = await resp.json();

    this.title = data.title || "Sorting Activity";

    this.buildLayout(data.categories, data.items, data.title);

    this.isLoaded = true;
  }

  async loadNewList(path) {
    this.configPath = path;

    const resp = await fetch(path);
    const data = await resp.json();

    this.buildLayout(data.categories, data.items, data.title);

    this.hasChecked = false;
  } 

  buildLayout(categoryNames, items, title) {
    this.title = title || "Sorting Activity";
    const vw = this.engine.virtualWidth;
    const vh = this.engine.virtualHeight;

    const catCount = categoryNames.length;

    const rows = catCount <= 3 ? 1 : 2;
    const cols = rows === 1 ? catCount : Math.ceil(catCount / 2);

    const margin = 40;
    const topY = 70;
    const rowHeight = 270;
    const boxWidth = (vw - margin * 2) / cols - 20;
    const boxHeight = 250;

    this.categories = [];
    let index = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (index >= catCount) break;

        const name = categoryNames[index];
        const x = margin + c * (boxWidth + 20);
        const y = topY + r * rowHeight;

        this.categories.push({
          name,
          x,
          y,
          w: boxWidth,
          h: boxHeight
        });

        index++;
      }
    }

    const pileCenterX = vw / 2;
    const pileCenterY = vh - 180;

    const cardWidth = 160;
    const cardHeight = 60;

    this.items = items.map((raw, i) => {
    const x = pileCenterX - cardWidth / 2 + (Math.random() * 40 - 20);
    const y = pileCenterY - cardHeight / 2 + (Math.random() * 40 - 20);

      const item = {
        type: raw.type,
        content: raw.content,
        answer: raw.answer,
        correctCategory: raw.answer,
        droppedCategory: null,
        x,
        y,
        w: cardWidth,
        h: cardHeight,
        isDragging: false,
        offsetX: 0,
        offsetY: 0,
        isCorrect: null,
        image: null
      };

      if (raw.type === "image") {
        const img = new Image();
        img.src = raw.content;
        item.image = img;

        img.onload = () => {
          const maxSize = 150;
          const scale = Math.min(maxSize /img.width, maxSize /img.height);

          item.w = img.width * scale;
          item.h = img.height * scale;
        };
      }

      return item;
    });

    const btnW = 140;
    const btnH = 50;
    const btnY = vh - 80;
    const gap = 20;
    const totalW = btnW * 4 + 10 + gap * 2;
    const startX = (vw - totalW) / 2;

    this.buttons = [
      { name: "check", label: "Check", x: startX, y: btnY, w: btnW, h: btnH },
      { name: "reset", label: "Reset", x: startX + (btnW + gap), y: btnY, w: btnW, h: btnH },
      { name: "solve", label: "Solve", x: startX + 2 * (btnW + gap), y: btnY, w: btnW, h: btnH },
      { name: "selectList", label: "Change Activity", x: startX + 3 * (btnW + gap), y: btnY, w: (btnW + 10) , h: btnH }
    ];
  }

  // INPUT
    onPointerDown(x, y) {
    if (!this.isLoaded) return;

    this.mouse.isDown = true;
    this.mouse.x = x;
    this.mouse.y = y;

    const btn = this.hitTestButtons(x, y);

    if (this.showListMenu) {
      const { menuX, menuY, menuW, rowH } = this;

      for (let i = 0; i < this.availableLists.length; i++) {
        const rowY = menuY + i * rowH;

        if (this.pointInRect(x, y, { x: menuX, y: rowY, w: menuW, h: rowH })) {
          const list = this.availableLists[i];

          if (list.path === null) {
            document.getElementById("activityLoader").click();
            this.showListMenu = false;
            return;
          }

          this.loadNewList(list.path);
          this.showListMenu = false;
          return;
        }
      }
    }

    if (btn) {
        this.handleButtonClick(btn.name);
        return;
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        if (this.pointInRect(x, y, item)) {
        this.activeDragItem = item;
        item.isDragging = true;
        item.offsetX = x - item.x;
        item.offsetY = y - item.y;
        this.items.splice(i, 1);
        this.items.push(item);
        break;
        }
    }
  }

  onPointerMove(screenX, screenY) {
    if (!this.isLoaded) return;

    this.mouse.x = x;
    this.mouse.y = y;
  }

onPointerUp(x, y) {
  if (!this.isLoaded) return;

  this.mouse.isDown = false;

  if (this.activeDragItem && this.activeDragItem.isDragging) {
    this.activeDragItem.isDragging = false;

    const tileCenterX = this.activeDragItem.x + this.activeDragItem.w / 2;
    const tileCenterY = this.activeDragItem.y + this.activeDragItem.h / 2;

    const cat = this.getCategoryAt(tileCenterX, tileCenterY);

    if (cat) {
      this.activeDragItem.droppedCategory = cat.name;
    } else {
      this.activeDragItem.droppedCategory = null;
      this.snapToPile(this.activeDragItem);
    }

    this.activeDragItem = null;
  }
}

  pointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w &&
           y >= rect.y && y <= rect.y + rect.h;
  }

  hitTestButtons(x, y) {
    return this.buttons.find(b => this.pointInRect(x, y, b)) || null;
  }

  getCategoryAt(x, y) {
    return this.categories.find(c => this.pointInRect(x, y, c)) || null;
  }

    snapToCategory(item, cat) {
        const margin = 10;

        const minX = cat.x + margin;
        const maxX = cat.x + cat.w - item.w - margin;

        const minY = cat.y + margin;
        const maxY = cat.y + cat.h - item.h - margin;

        item.x = minX + Math.random() * (maxX - minX);
        item.y = minY + Math.random() * (maxY - minY);
    }

  snapToPile(item) {
    const vw = this.engine.virtualWidth;
    const vh = this.engine.virtualHeight;
    const pileCenterX = vw / 2;
    const pileCenterY = vh - 180;

    item.x = pileCenterX - item.w / 2 + (Math.random() * 40 - 20);
    item.y = pileCenterY - item.h / 2 + (Math.random() * 40 - 20);
  }

  // BUTTONS
  handleButtonClick(name) {
    if (name === "check") {
      this.checkAnswers();
    } else if (name === "reset") {
      this.resetItems();
    } else if (name === "solve") {
      this.solveItems();
    } else if (name === "selectList") {
      this.showListMenu = !this.showListMenu;
}
  }

  checkAnswers() {
    this.hasChecked = true;
    this.items.forEach(item => {
      if (!item.droppedCategory) {
        item.isCorrect = false;
      } else {
        item.isCorrect = (item.droppedCategory === item.correctCategory);
      }
    });
  }

  resetItems() {
    this.hasChecked = false;
    this.items.forEach(item => {
      item.droppedCategory = null;
      item.isCorrect = null;
      this.snapToPile(item);
    });
  }

solveItems() {
  this.hasChecked = true;

  this.items.forEach(item => {
    item.droppedCategory = item.correctCategory;
    item.isCorrect = true;
  });

  this.layoutSolvedItems();
}

layoutSolvedItems() {
  const topMargin = 40;   //adjust to move tiles down
  const sideMargin = 10;
  const spacing = 10;

  this.categories.forEach(cat => {
    const catItems = this.items.filter(i => i.droppedCategory === cat.name);
    if (catItems.length === 0) return;

    const itemW = catItems[0].w;
    const itemH = catItems[0].h;

    let cols = Math.floor((cat.w - sideMargin * 2 + spacing) / (itemW + spacing));
    if (cols < 1) cols = 1;

    const rows = Math.ceil(catItems.length / cols);

    const used = new Set();

    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (index >= catItems.length) break;

        let tx = cat.x + sideMargin + c * (itemW + spacing);
        let ty = cat.y + topMargin + r * (itemH + spacing);

        let key = `${tx},${ty}`;

        while (used.has(key)) {
          c++;
          if (c >= cols) {
            c = 0;
            r++;
          }
          tx = cat.x + sideMargin + c * (itemW + spacing);
          ty = cat.y + topMargin + r * (itemH + spacing);
          key = `${tx},${ty}`;
        }

        used.add(key);

        const item = catItems[index];
        item.x = tx;
        item.y = ty;

        index++;
      }
    }
  });
}

  //LOOP
  update(dt, engine) {
    if (!this.isLoaded) return;

    if (this.activeDragItem && this.activeDragItem.isDragging) {
        const x = engine.input.pointer.x;
        const y = engine.input.pointer.y;

        this.activeDragItem.x = x - this.activeDragItem.offsetX;
        this.activeDragItem.y = y - this.activeDragItem.offsetY;
    }
  }

  draw(ctx, engine) {
    if (!this.isLoaded) return;

    ctx.save();
    ctx.translate(engine.offsetX, engine.offsetY);
    ctx.scale(engine.scale, engine.scale);

    const vw = engine.virtualWidth;
    const vh = engine.virtualHeight;

    // Background
    ctx.fillStyle = "#003355";
    ctx.fillRect(0, 0, vw, vh);

    // Title
    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.fillText(this.title, 40, 50);

    // Categories
    ctx.font = "22px Arial";
    this.categories.forEach(cat => {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(cat.x, cat.y, cat.w, cat.h);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(cat.x, cat.y, cat.w, cat.h);

      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(cat.name, cat.x + cat.w / 2, cat.y + 8);
    });

    // Items
    this.items.forEach(item => {

      // Card background
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.fillRect(item.x, item.y, item.w, item.h);
      ctx.strokeRect(item.x, item.y, item.w, item.h);

      if (item.type === "image" && item.image) {
        // Draw image
        ctx.drawImage(item.image, item.x, item.y, item.w, item.h);
      } else {
        // Draw text
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.content, item.x + item.w / 2, item.y + item.h / 2);
      }

      // Feedback
      if (this.hasChecked && item.isCorrect !== null) {
        ctx.font = "24px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillStyle = item.isCorrect ? "green" : "red";
        ctx.fillText(item.isCorrect ? "✓" : "✗", item.x + item.w - 6, item.y + 4);
      }
    });

    // Buttons
    this.buttons.forEach(btn => {
      ctx.fillStyle = "rgba(37, 158, 0, 0.9)";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
      ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    });

    if (this.showListMenu) {
    const { menuX, menuY, menuW, rowH } = this;

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(menuX, menuY, menuW, this.availableLists.length * rowH);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(menuX, menuY, menuW, this.availableLists.length * rowH);

    ctx.font = "22px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    this.availableLists.forEach((list, i) => {
      const y = menuY + i * rowH;

      ctx.fillStyle = "white";
      ctx.fillText(list.label, menuX + 20, y + rowH / 2);
    });
    }

    ctx.restore();
  }

  onExit() {
    // Nothing
  }
}