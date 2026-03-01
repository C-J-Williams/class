export class RandomSorterScene {
  constructor() {
    // HTML overlay elements
    this.panel = document.getElementById("sorterPanel");

    // ★ UPDATED FOR CHECKBOX LIST
    this.studentListContainer = document.getElementById("sorterStudentListContainer");

    this.addNameInput = document.getElementById("sorterAddName");
    this.removeNameInput = document.getElementById("sorterRemoveName");
    this.saveButton = document.getElementById("sorterSaveButton");
    this.addButton = document.getElementById("sorterAddButton");
    this.removeButton = document.getElementById("sorterRemoveButton");
    this.numGroupsInput = document.getElementById("sorterNumGroups");
    this.groupSizeInput = document.getElementById("sorterGroupSize");
    this.generateButton = document.getElementById("sorterGenerateButton");
    this.groupsOutput = document.getElementById("sorterGroupsOutput");

    this.localStorageKey = "randomSorterStudents";
    this.engine = null;
    this.isLoaded = false;

    this._bindHandlers();
  }

  // -------------------------------
  // HTML EVENT HANDLERS
  // -------------------------------
  _bindHandlers() {

    // ★ UPDATED — textarea no longer exists, so remove auto-save listener

    // Add student
    this.addButton?.addEventListener("click", () => {
      const name = this.addNameInput.value.trim();
      if (!name) return;

      const names = this.getAllNames();
      names.push(name);

      this.renderStudentList(names);
      this.saveStudentList();

      this.addNameInput.value = "";
    });

    // Remove student (typed)
    this.removeButton?.addEventListener("click", () => {
      const name = this.removeNameInput.value.trim().toLowerCase();
      if (!name) return;

      const names = this.getAllNames().filter(
        n => n.toLowerCase() !== name
      );

      this.renderStudentList(names);
      this.saveStudentList();

      this.removeNameInput.value = "";
    });

    // Manual save
    this.saveButton?.addEventListener("click", () => {
      this.saveStudentList();
      alert("Student list saved.");
    });

    // Mutually exclusive inputs
    this.numGroupsInput?.addEventListener("input", () => {
      if (this.numGroupsInput.value) this.groupSizeInput.value = "";
    });

    this.groupSizeInput?.addEventListener("input", () => {
      if (this.groupSizeInput.value) this.numGroupsInput.value = "";
    });

    // Generate groups
    this.generateButton?.addEventListener("click", () => {
      this.generateGroups();
    });
  }

  // -------------------------------
  // INITIALISATION
  // -------------------------------
  async init(engine) {
    this.engine = engine;

    if (this.panel) {
      this.panel.style.display = "block";
    }

    let stored = localStorage.getItem(this.localStorageKey);

    if (stored && stored.trim().length > 0) {
      this.renderStudentList(stored.split("\n"));
    } else {
      try {
        const resp = await fetch("sorter/students.txt");
        if (resp.ok) {
          const text = await resp.text();
          this.renderStudentList(text.split("\n"));
          this.saveStudentList();
        } else {
          this.renderStudentList([]);
        }
      } catch {
        this.renderStudentList([]);
      }
    }

    this.isLoaded = true;
    this.positionSorterPanel();
  }

  // -------------------------------
  // SCALING
  // -------------------------------
  positionSorterPanel() {
    if (!this.panel || !this.engine) return;

    const x = 20;
    const y = 50;

    const screenX = this.engine.offsetX + x * this.engine.scale;
    const screenY = this.engine.offsetY + y * this.engine.scale;

    this.panel.style.left = screenX + "px";
    this.panel.style.top = screenY + "px";

    this.panel.style.transform = `scale(${this.engine.scale})`;
    this.panel.style.transformOrigin = "top left";
  }

  // -------------------------------
  // STUDENT LIST HELPERS
  // -------------------------------

  // ★ NEW — get all names (ignoring exclusions)
  getAllNames() {
    const rows = [...this.studentListContainer.querySelectorAll(".studentRow")];
    return rows.map(r =>
      r.querySelector(".studentName").textContent.trim()
    );
  }

  // ★ NEW — get names that are NOT excluded
  getStudentLines() {
    const rows = [...this.studentListContainer.querySelectorAll(".studentRow")];

    return rows
      .filter(row => !row.querySelector(".excludeCheckbox").checked)
      .map(row => row.querySelector(".studentName").textContent.trim());
  }

  // ★ NEW — render the checkbox list
  renderStudentList(names) {
    this.studentListContainer.innerHTML = "";

    names
      .map(n => n.trim())
      .filter(n => n.length > 0)
      .forEach(name => {
        const row = document.createElement("div");
        row.className = "studentRow";
        row.style.marginBottom = "1px";
        row.style.display = "flex";
        row.style.alignItems = "center";

        row.innerHTML = `
          <input type="checkbox" class="excludeCheckbox" style="margin-right:8px;">
          <span class="studentName" style="font-size:20px;">${name}</span>
        `;

        this.studentListContainer.appendChild(row);
      });
  }

  // ★ UPDATED — save only names, not exclusions
  saveStudentList() {
    const names = this.getAllNames();
    localStorage.setItem(this.localStorageKey, names.join("\n"));
  }

  // -------------------------------
  // GROUP GENERATION (unchanged)
  // -------------------------------
  shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  generateGroups() {
    const students = this.getStudentLines();
    if (students.length === 0) {
      this.groupsOutput.innerHTML = "<div>No students in the list.</div>";
      return;
    }

    const numGroupsVal = parseInt(this.numGroupsInput.value, 10);
    const groupSizeVal = parseInt(this.groupSizeInput.value, 10);

    let mode = null;
    if (!isNaN(numGroupsVal) && numGroupsVal > 0) mode = "numGroups";
    else if (!isNaN(groupSizeVal) && groupSizeVal > 0) mode = "groupSize";

    if (!mode) {
      this.groupsOutput.innerHTML =
        "<div>Please enter number of groups OR group size.</div>";
      return;
    }

    const shuffled = this.shuffleArray(students);
    let groups = [];

    if (mode === "numGroups") {
      groups = this.makeGroupsByCount(shuffled, numGroupsVal);
    } else {
      groups = this.makeGroupsBySize(shuffled, groupSizeVal);
    }

    this.renderGroups(groups);
  }

  makeGroupsByCount(students, groupsCount) {
    const n = students.length;
    if (groupsCount < 1) groupsCount = 1;
    if (groupsCount > n) groupsCount = n;

    const baseSize = Math.floor(n / groupsCount);
    const groups = [];
    let index = 0;

    for (let g = 0; g < groupsCount; g++) {
      groups[g] = students.slice(index, index + baseSize);
      index += baseSize;
    }

    const leftovers = students.slice(index);
    leftovers.forEach(s => {
      const idx = Math.floor(Math.random() * groupsCount);
      groups[idx].push(s);
    });

    return groups;
  }

  makeGroupsBySize(students, groupSize) {
    const n = students.length;
    if (groupSize < 1) groupSize = 1;

    let groupsCount = Math.floor(n / groupSize);
    if (groupsCount < 1) groupsCount = 1;

    const groups = [];
    let index = 0;

    for (let g = 0; g < groupsCount; g++) {
      groups[g] = students.slice(index, index + groupSize);
      index += groupSize;
    }

    const leftovers = students.slice(index);
    leftovers.forEach(s => {
      const idx = Math.floor(Math.random() * groupsCount);
      groups[idx].push(s);
    });

    return groups;
  }

  renderGroups(groups) {
    let html = "";
    groups.forEach((group, idx) => {
      html += `
        <div style="
          margin-bottom:8px;
          padding:6px 8px;
          background:rgba(0,0,0,0.5);
          border-radius:6px;
        ">
          <div style="font-weight:bold; margin-bottom:4px;">
            Group ${idx + 1}
          </div>
          <div>${group.join(", ")}</div>
        </div>
      `;
    });
    this.groupsOutput.innerHTML = html;
  }

  // -------------------------------
  // ENGINE LOOP
  // -------------------------------
  update(dt, engine) {
    if (!this.isLoaded) return;
    this.positionSorterPanel();
  }

  draw(ctx, engine) {
    if (!this.isLoaded) return;

    ctx.save();
    ctx.translate(engine.offsetX, engine.offsetY);
    ctx.scale(engine.scale, engine.scale);

    ctx.fillStyle = "#004400";
    ctx.fillRect(0, 0, engine.virtualWidth, engine.virtualHeight);

    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.fillText("Random Group Sorter", 20, 40);

    ctx.restore();
  }

  onExit() {
    if (this.panel) this.panel.style.display = "none";
  }
}