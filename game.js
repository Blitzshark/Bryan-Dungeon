/* Bryan's Dungeon — game.js
   Works with the current canvas-based index.html.
   Controls: WASD / arrow keys to move, Space to attack.
*/

(() => {
  "use strict";

  const SERVER_URL = "https://bryan-dungeon-game.onrender.com";

  const socket = typeof io === "function"
    ? io(SERVER_URL, { transports: ["websocket", "polling"] })
    : null;

  const canvas = document.getElementById("game");
  const ctx = canvas?.getContext("2d");
  const statusEl = document.getElementById("status");
  const setupEl = document.getElementById("setup");
  const nameInput = document.getElementById("name");
  const colorInput = document.getElementById("color");
  const playButton = document.getElementById("play");
  const messageEl = document.getElementById("message");
  const statsEl = document.getElementById("stats");
  const playersEl = document.getElementById("players");
  const toastEl = document.getElementById("toast");

  if (!canvas || !ctx || !setupEl || !nameInput ||
      !colorInput || !playButton) {
    console.error(
      "Bryan's Dungeon: required elements from index.html are missing."
    );
    return;
  }

  const WORLD = { w: 2200, h: 1600 };
  const PLAYER_RADIUS = 15;
  const SPEED = 245;

  const keys = new Set();
  const players = new Map();

  const local = {
    id: null,
    name: "",
    color: colorInput.value || "#54e6a5",
    x: 350,
    y: 350,
    joined: false,
    zone: "lobby",
    attackUntil: 0,
    facingX: 1,
    facingY: 0,
    lastMoveSent: 0
  };

  let lastFrame = performance.now();
  let lastToastTimer = null;
  let connected = false;
  let lastServerPlayers = {};
  let attackCooldown = 0;
  let dungeonDepth = 1;
  let localEnemies = [];

  const portals = [
    { x: 800, y: 420, r: 42, label: "SQUAD GATE 1",
      color: "#8b5cf6", squad: 1 },
    { x: 800, y: 650, r: 42, label: "SQUAD GATE 2",
      color: "#22d3ee", squad: 2 },
    { x: 800, y: 880, r: 42, label: "SQUAD GATE 3",
      color: "#fb7185", squad: 3 },
    { x: 800, y: 1110, r: 42, label: "SQUAD GATE 4",
      color: "#fbbf24", squad: 4 }
  ];

  // --------------------------------------------------
  // UI HELPERS
  // --------------------------------------------------

  function showToast(text, duration = 2200) {
    if (!toastEl) return;

    toastEl.textContent = text;
    toastEl.style.display = "block";

    clearTimeout(lastToastTimer);

    lastToastTimer = setTimeout(() => {
      toastEl.style.display = "none";
    }, duration);
  }

  function setStatus(text, good = false) {
    if (!statusEl) return;

    statusEl.textContent = text;
    statusEl.style.color = good ? "#54e6a5" : "#aab6cc";
  }

  function safeName(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 18);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resizeCanvas() {
    const dpr = Math.max(
      1,
      Math.min(2, window.devicePixelRatio || 1)
    );

    const rect = canvas.getBoundingClientRect();

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // --------------------------------------------------
  // MULTIPLAYER CONNECTION
  // --------------------------------------------------

  function emitPlayerData() {
    if (!socket || !connected || !local.joined) return;

    socket.emit("playerData", {
      name: local.name,
      color: local.color
    });
  }

  if (socket) {
    socket.on("connect", () => {
      connected = true;
      local.id = socket.id;

      setStatus(
        "Connected • " + socket.id.slice(0, 5),
        true
      );

      if (messageEl) messageEl.textContent = "";

      socket.emit("playerData", {
        name: local.joined
          ? local.name
          : "Guest-" + socket.id.slice(0, 5),
        color: local.color
      });

      if (local.joined) {
        emitPlayerData();
        socket.emit("move", {
          x: local.x,
          y: local.y
        });
      }
    });

    socket.on("disconnect", () => {
      connected = false;

      setStatus("Disconnected — reconnecting…");
      showToast("Connection lost. Reconnecting…", 2600);
    });

    socket.on("connect_error", () => {
      connected = false;

      setStatus("Cannot reach game server");

      if (messageEl) {
        messageEl.textContent =
          "Could not connect to the game server. " +
          "Wait a few seconds and try again.";
      }
    });

    socket.on("players", data => {
      if (!data || typeof data !== "object") return;

      lastServerPlayers = data;
      players.clear();

      for (const [id, p] of Object.entries(data)) {
        if (
          !p ||
          !Number.isFinite(Number(p.x)) ||
          !Number.isFinite(Number(p.y))
        ) {
          continue;
        }

        players.set(id, {
          id,
          name: String(p.name || "Player").slice(0, 18),
          color: /^#[0-9a-f]{6}$/i.test(p.color || "")
            ? p.color
            : "#54e6a5",
          x: Number(p.x),
          y: Number(p.y)
        });
      }

      // Preserve smooth local movement instead of snapping
      // the local character to every server update.
      if (local.id && players.has(local.id)) {
        const me = players.get(local.id);

        me.x = local.x;
        me.y = local.y;
        me.name = local.name || me.name;
        me.color = local.color;
      }

      renderOnlineList();
    });
  } else {
    setStatus("Socket.IO library missing");

    if (messageEl) {
      messageEl.textContent =
        "Socket.IO did not load. Check your internet connection.";
    }
  }

  // --------------------------------------------------
  // JOIN THE GAME
  // --------------------------------------------------

  function enterLobby() {
    const chosenName = safeName(nameInput.value);

    if (!chosenName) {
      messageEl.textContent = "Please choose a player name.";
      nameInput.focus();
      return;
    }

    if (!/^[\p{L}\p{N}_ -]+$/u.test(chosenName)) {
      messageEl.textContent =
        "Use letters, numbers, spaces, _ or - for your name.";
      return;
    }

    if (!connected || !socket) {
      messageEl.textContent =
        "The game server is not connected yet. Try again shortly.";
      return;
    }

    const duplicate = Object.values(lastServerPlayers).some(p =>
      p &&
      p.id !== local.id &&
      String(p.name || "").trim().toLowerCase() ===
        chosenName.toLowerCase()
    );

    if (duplicate) {
      messageEl.textContent =
        "That name is already online. Please choose another.";
      return;
    }

    local.name = chosenName;
    local.color = colorInput.value || "#54e6a5";
    local.joined = true;
    local.zone = "lobby";
    local.x = 350;
    local.y = 350;

    setupEl.style.display = "none";

    canvas.focus();

    emitPlayerData();

    socket.emit("move", {
      x: local.x,
      y: local.y
    });

    showToast("Welcome to the lobby, " + local.name + "!");
    renderOnlineList();
  }

  playButton.addEventListener("click", enterLobby);

  nameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") enterLobby();
  });

  colorInput.addEventListener("input", () => {
    local.color = colorInput.value;

    if (local.joined) {
      emitPlayerData();
    }
  });

  // --------------------------------------------------
  // ONLINE PLAYER LIST
  // --------------------------------------------------

  function renderOnlineList() {
    if (!playersEl || !statsEl) return;

    const visible = [...players.values()].filter(p =>
      p.id !== local.id || !local.joined
    );

    playersEl.replaceChildren();

    if (!visible.length) {
      playersEl.textContent = local.joined
        ? "You're the first one here!"
        : "No other players yet";
    } else {
      for (const p of visible.slice(0, 12)) {
        const line = document.createElement("div");

        line.style.display = "flex";
        line.style.alignItems = "center";
        line.style.gap = "7px";

        const dot = document.createElement("span");

        dot.style.cssText =
          "display:inline-block;" +
          "flex:0 0 9px;width:9px;height:9px;" +
          "border-radius:50%;background:" + p.color;

        const label = document.createElement("span");

        label.textContent =
          p.name + (p.id === local.id ? " (you)" : "");

        line.append(dot, label);
        playersEl.appendChild(line);
      }
    }

    const location = !local.joined
      ? "Not entered yet"
      : local.zone === "lobby"
        ? "Lobby"
        : "Dungeon floor " + dungeonDepth;

    statsEl.textContent =
      players.size + " online · " + location;
  }

  // --------------------------------------------------
  // MOVEMENT INPUT
  // --------------------------------------------------

  document.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();

    if (
      ["arrowup", "arrowdown", "arrowleft",
       "arrowright", " "].includes(key)
    ) {
      e.preventDefault();
    }

    keys.add(key);

    if (
      key === " " &&
      local.joined &&
      local.zone === "dungeon"
    ) {
      attack();
    }
  });

  document.addEventListener("keyup", e => {
    keys.delete(e.key.toLowerCase());
  });

  window.addEventListener("blur", () => {
    keys.clear();
  });

  // --------------------------------------------------
  // COMBAT
  // --------------------------------------------------

  function attack() {
    if (attackCooldown > 0) return;

    attackCooldown = 0.32;
    local.attackUntil = performance.now() + 150;

    const weaponRange = 92;
    let target = null;
    let best = weaponRange;

    for (const enemy of localEnemies) {
      const d = Math.hypot(
        enemy.x - local.x,
        enemy.y - local.y
      );

      if (d < best) {
        best = d;
        target = enemy;
      }
    }

    if (target) {
      target.hp -= 1;
      target.hitAt = performance.now();

      if (target.hp <= 0) {
        localEnemies = localEnemies.filter(e => e !== target);

        showToast(
          target.boss
            ? "Boss defeated! Walk to the exit portal."
            : "Enemy defeated!",
          1200
        );
      }
    }
  }

  function spawnDungeonEnemies() {
    const count = Math.min(4 + dungeonDepth, 12);

    for (let i = 0; i < count; i++) {
      localEnemies.push({
        x: 440 + Math.random() * 520,
        y: 180 + Math.random() * 620,
        r: 13 + Math.min(5, dungeonDepth),
        hp: 1 + Math.floor(dungeonDepth / 2),
        speed: 35 + dungeonDepth * 3,
        boss: false,
        hitAt: 0
      });
    }

    localEnemies.push({
      x: 940,
      y: 500,
      r: 32,
      hp: 5 + dungeonDepth * 2,
      speed: 22 + dungeonDepth,
      boss: true,
      hitAt: 0
    });
  }

  // --------------------------------------------------
  // LOBBY GATES AND DUNGEONS
  // --------------------------------------------------

  function enterDungeon(portal) {
    local.zone = "dungeon";
    dungeonDepth = Math.max(1, portal.squad);

    local.x = 180;
    local.y = 240;

    localEnemies = [];

    spawnDungeonEnemies();

    if (socket) {
      socket.emit("move", {
        x: local.x,
        y: local.y
      });
    }

    showToast(
      "Entered floor " + dungeonDepth +
      ". Space to attack; WASD / arrows to move."
    );

    renderOnlineList();
  }

  function returnLobby() {
    local.zone = "lobby";
    local.x = 350;
    local.y = 350;

    localEnemies = [];

    if (socket) {
      socket.emit("move", {
        x: local.x,
        y: local.y
      });
    }

    showToast("Returned to the lobby.");
    renderOnlineList();
  }

  // --------------------------------------------------
  // GAME UPDATE
  // --------------------------------------------------

  function update(dt, now) {
    if (!local.joined) return;

    attackCooldown = Math.max(0, attackCooldown - dt);

    let dx = 0;
    let dy = 0;

    if (keys.has("w") || keys.has("arrowup")) dy -= 1;
    if (keys.has("s") || keys.has("arrowdown")) dy += 1;
    if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
    if (keys.has("d") || keys.has("arrowright")) dx += 1;

    // Normalize the direction so diagonal movement is not faster.
    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy);

      dx /= length;
      dy /= length;

      local.facingX = dx;
      local.facingY = dy;

      local.x = clamp(
        local.x + dx * SPEED * dt,
        PLAYER_RADIUS,
        WORLD.w - PLAYER_RADIUS
      );

      local.y = clamp(
        local.y + dy * SPEED * dt,
        PLAYER_RADIUS,
        WORLD.h - PLAYER_RADIUS
      );

      // Send position updates without flooding the server.
      if (
        now - local.lastMoveSent > 45 &&
        socket &&
        connected
      ) {
        local.lastMoveSent = now;

        socket.emit("move", {
          x: local.x,
          y: local.y
        });
      }
    }

    if (local.zone === "lobby") {
      for (const portal of portals) {
        const distance = Math.hypot(
          local.x - portal.x,
          local.y - portal.y
        );

        if (distance < portal.r + PLAYER_RADIUS) {
          enterDungeon(portal);
          break;
        }
      }
    } else {
      // Local enemy movement.
      for (const enemy of localEnemies) {
        const ex = local.x - enemy.x;
        const ey = local.y - enemy.y;
        const distance = Math.hypot(ex, ey) || 1;

        if (distance > enemy.r + PLAYER_RADIUS + 5) {
          enemy.x += ex / distance * enemy.speed * dt;
          enemy.y += ey / distance * enemy.speed * dt;
        }
      }

      // Allow holding Space to attack repeatedly.
      if (keys.has(" ") && attackCooldown <= 0) {
        attack();
      }

      // The green exit only works after every enemy is defeated.
      if (
        localEnemies.length === 0 &&
        local.x > 1060 &&
        local.y > 420 &&
        local.y < 590
      ) {
        dungeonDepth++;

        local.x = 180;
        local.y = 240;

        spawnDungeonEnemies();

        showToast("Floor " + dungeonDepth + " unlocked!");
      }
    }

    renderOnlineList();
  }

  // --------------------------------------------------
  // DRAWING HELPERS
  // --------------------------------------------------

  function drawCircle(
    x,
    y,
    r,
    fill,
    stroke = null,
    lineWidth = 2
  ) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);

    ctx.fillStyle = fill;
    ctx.fill();

    if (stroke) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function drawText(
    text,
    x,
    y,
    size = 13,
    color = "#eef3ff",
    align = "center"
  ) {
    ctx.font = `600 ${size}px system-ui, sans-serif`;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function drawGrid(camX, camY, w, h) {
    ctx.fillStyle =
      local.zone === "lobby" ? "#101a2b" : "#17141f";

    ctx.fillRect(0, 0, w, h);

    const grid = 48;

    ctx.strokeStyle =
      local.zone === "lobby" ? "#1d2a40" : "#292233";

    ctx.lineWidth = 1;

    const startX = -((camX % grid) + grid) % grid;
    const startY = -((camY % grid) + grid) % grid;

    ctx.beginPath();

    for (let x = startX; x < w; x += grid) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }

    for (let y = startY; y < h; y += grid) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }

    ctx.stroke();
  }

  // --------------------------------------------------
  // RENDER GAME
  // --------------------------------------------------

  function render(now) {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (!w || !h) return;

    const camX = clamp(
      local.x - w / 2,
      0,
      Math.max(0, WORLD.w - w)
    );

    const camY = clamp(
      local.y - h / 2,
      0,
      Math.max(0, WORLD.h - h)
    );

    drawGrid(camX, camY, w, h);

    ctx.save();
    ctx.translate(-camX, -camY);

    // World boundary.
    ctx.strokeStyle = "#52617b";
    ctx.lineWidth = 5;

    ctx.strokeRect(
      8,
      8,
      WORLD.w - 16,
      WORLD.h - 16
    );

    // ---------------- LOBBY ----------------

    if (local.zone === "lobby") {
      ctx.fillStyle = "#17243a";
      ctx.fillRect(90, 90, 610, 330);

      ctx.strokeStyle = "#344767";
      ctx.lineWidth = 3;
      ctx.strokeRect(90, 90, 610, 330);

      drawText("THE LOBBY", 395, 135, 25, "#dbe7ff");

      drawText(
        "Walk into a glowing gate to enter a dungeon floor",
        395,
        164,
        13,
        "#aab6cc"
      );

      for (const portal of portals) {
        const pulse =
          1 + Math.sin(now / 260 + portal.squad) * 0.08;

        drawCircle(
          portal.x,
          portal.y,
          portal.r * pulse,
          portal.color + "33",
          portal.color,
          4
        );

        drawCircle(
          portal.x,
          portal.y,
          portal.r * 0.65,
          "#151c2c",
          portal.color,
          2
        );

        drawText(
          "▶",
          portal.x,
          portal.y + 6,
          21,
          portal.color
        );

        drawText(
          portal.label,
          portal.x,
          portal.y + 63,
          13,
          "#eef3ff"
        );

        drawText(
          "Floor " + portal.squad,
          portal.x,
          portal.y + 81,
          11,
          "#aab6cc"
        );
      }

      drawText(
        "Players can gather here before entering a gate",
        350,
        1490,
        15,
        "#aab6cc"
      );
    } else {
      // ---------------- DUNGEON ----------------

      ctx.fillStyle = "#211c2c";
      ctx.fillRect(70, 70, 1120, 760);

      ctx.strokeStyle = "#554361";
      ctx.lineWidth = 8;
      ctx.strokeRect(70, 70, 1120, 760);

      drawText(
        "DUNGEON FLOOR " + dungeonDepth,
        630,
        115,
        24,
        "#f3d6ff"
      );

      drawText(
        "Defeat every enemy and the boss to unlock the next floor",
        630,
        140,
        13,
        "#c8b5d8"
      );

      if (localEnemies.length === 0) {
        const pulse =
          1 + Math.sin(now / 240) * 0.08;

        drawCircle(
          1120,
          505,
          34 * pulse,
          "#22c55e33",
          "#4ade80",
          4
        );

        drawText(
          "NEXT FLOOR",
          1120,
          565,
          13,
          "#86efac"
        );
      }

      // Enemies and health bars.
      for (const enemy of localEnemies) {
        const color = enemy.boss
          ? "#f43f5e"
          : "#e879f9";

        drawCircle(
          enemy.x,
          enemy.y,
          enemy.r + 4,
          color + "22"
        );

        drawCircle(
          enemy.x,
          enemy.y,
          enemy.r,
          color,
          "#fecdd3",
          enemy.boss ? 3 : 1.5
        );

        drawText(
          enemy.boss ? "BOSS" : "✦",
          enemy.x,
          enemy.y + 4,
          enemy.boss ? 11 : 15,
          "#ffffff"
        );

        const barW = enemy.boss ? 72 : 38;

        const maxHp = enemy.boss
          ? 5 + dungeonDepth * 2
          : 1 + Math.floor(dungeonDepth / 2);

        ctx.fillStyle = "#3f1724";

        ctx.fillRect(
          enemy.x - barW / 2,
          enemy.y - enemy.r - 12,
          barW,
          5
        );

        ctx.fillStyle = "#fb7185";

        ctx.fillRect(
          enemy.x - barW / 2,
          enemy.y - enemy.r - 12,
          barW * Math.max(0, enemy.hp) / maxHp,
          5
        );
      }

      drawText(
        "RETURN TO LOBBY",
        200,
        875,
        12,
        "#aab6cc"
      );

      ctx.fillStyle = "#374151";
      ctx.fillRect(110, 850, 180, 44);
    }

    // ---------------- OTHER PLAYERS ----------------

    if (local.zone === "lobby") {
      for (const p of players.values()) {
        if (p.id === local.id) continue;

        drawCircle(
          p.x,
          p.y,
          PLAYER_RADIUS + 5,
          p.color + "22"
        );

        drawCircle(
          p.x,
          p.y,
          PLAYER_RADIUS,
          p.color,
          "#e5e7eb",
          2
        );

        drawText(
          p.name,
          p.x,
          p.y - 23,
          12,
          "#eef3ff"
        );
      }
    }

    // ---------------- LOCAL PLAYER ----------------

    if (local.joined) {
      // Attack swipe.
      if (now < local.attackUntil) {
        const angle = Math.atan2(
          local.facingY,
          local.facingX
        );

        ctx.beginPath();

        ctx.arc(
          local.x,
          local.y,
          58,
          angle - 0.7,
          angle + 0.7
        );

        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      drawCircle(
        local.x,
        local.y,
        PLAYER_RADIUS + 6,
        local.color + "28"
      );

      drawCircle(
        local.x,
        local.y,
        PLAYER_RADIUS,
        local.color,
        "#ffffff",
        2
      );

      drawCircle(
        local.x + local.facingX * 7,
        local.y + local.facingY * 7,
        3,
        "#102018"
      );

      drawText(
        local.name,
        local.x,
        local.y - 25,
        13,
        "#ffffff"
      );
    }

    ctx.restore();

    // ---------------- HUD ----------------

    if (local.joined) {
      ctx.fillStyle = "#0b1020d9";
      ctx.fillRect(12, 12, 230, 56);

      ctx.strokeStyle = "#29344a";
      ctx.strokeRect(12, 12, 230, 56);

      drawText(
        local.zone === "lobby"
          ? "LOBBY"
          : "DUNGEON • FLOOR " + dungeonDepth,
        24,
        34,
        12,
        "#b6a2ff",
        "left"
      );

      drawText(
        local.name,
        24,
        54,
        15,
        "#eef3ff",
        "left"
      );

      if (local.zone === "dungeon") {
        ctx.fillStyle = "#0b1020d9";
        ctx.fillRect(w / 2 - 125, h - 54, 250, 34);

        drawText(
          "SPACE: ATTACK  •  WALK TO GREEN GATE",
          w / 2,
          h - 33,
          11,
          "#eef3ff"
        );
      }
    }
  }

  // --------------------------------------------------
  // RETURN TO LOBBY BY CLICKING ITS BUTTON
  // --------------------------------------------------

  canvas.addEventListener("click", e => {
    if (
      !local.joined ||
      local.zone !== "dungeon"
    ) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    const camX = clamp(
      local.x - rect.width / 2,
      0,
      Math.max(0, WORLD.w - rect.width)
    );

    const camY = clamp(
      local.y - rect.height / 2,
      0,
      Math.max(0, WORLD.h - rect.height)
    );

    const x = e.clientX - rect.left + camX;
    const y = e.clientY - rect.top + camY;

    if (
      x >= 100 &&
      x <= 300 &&
      y >= 840 &&
      y <= 900
    ) {
      returnLobby();
    }
  });

  // --------------------------------------------------
  // MAIN GAME LOOP
  // --------------------------------------------------

  function frame(now) {
    const dt = Math.min(
      0.04,
      Math.max(0, (now - lastFrame) / 1000)
    );

    lastFrame = now;

    update(dt, now);
    render(now);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(() => {
    resizeCanvas();
    requestAnimationFrame(frame);
  });
})();
