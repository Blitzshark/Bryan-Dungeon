const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" }, maxHttpBufferSize: 1e6 });
app.use(express.json({ limit: "128kb" }));

const players = Object.create(null);
let queue = { id: "keep-queue", members: [], leader: null, expedition: null, dungeonId: null };
const expeditions = new Map();
const published = [];
const NPC_LINES = [
  "The stones below were old when my grandfather was young. He never went past the third stair.",
  "A shield is worth more than a boast. A friend with a shield is worth more than both.",
  "Those chains were not put there to hold the doors shut.",
  "If you find a helmet without a skull, leave it where it lies. It may be waiting for someone.",
  "Bring a party. The dark has a long reach, and it never tires."
];
const allowedClasses = new Set(["vanguard", "ranger", "arcanist"]);
const allowedColors = /^#[0-9a-f]{6}$/i;
const allowedTiles = new Set(["floor", "wall", "crate", "skeleton", "chain", "helmet", "exit", "spawn"]);

function publicPlayers() {
  const out = {};
  for (const [id, p] of Object.entries(players)) {
    out[id] = {
      id, name: p.name, color: p.color, playerClass: p.playerClass,
      x: p.x, y: p.y, zone: p.zone, hp: p.hp, maxHp: p.maxHp,
      floor: p.floor || 1, expeditionId: p.expeditionId || null
    };
  }
  return out;
}
function broadcastPlayers() { io.emit("players", publicPlayers()); }
function sendQueue(to) {
  const members = queue.members.map(id => players[id]).filter(Boolean).map(p => ({
    id: p.id, name: p.name, playerClass: p.playerClass, color: p.color
  }));
  const chosen = published.find(d => d.id === queue.dungeonId);
  const data = { queue: { id: queue.id, leader: queue.leader, expedition: queue.expedition, dungeonId: queue.dungeonId, dungeonName: chosen ? chosen.name : null }, members };
  if (to) io.to(to).emit("queueState", data); else io.emit("queueState", data);
}
function makeEnemies(floor) {
  const count = Math.min(4 + floor, 10);
  const enemies = [];
  for (let i = 0; i < count; i++) {
    const hp = 2 + Math.floor(floor / 2);
    enemies.push({ id: crypto.randomUUID(), x: 260 + Math.random() * 690, y: 210 + Math.random() * 470,
      r: 13 + Math.min(5, floor), hp, maxHp: hp, speed: 20 + floor * 2, boss: false, hitAt: 0 });
  }
  const hp = 9 + floor * 4;
  enemies.push({ id: crypto.randomUUID(), x: 900, y: 470, r: 29, hp, maxHp: hp, speed: 13 + floor, boss: true, hitAt: 0 });
  return enemies;
}
function expeditionState(exp) {
  return { id: exp.id, floor: exp.floor, enemies: exp.enemies, members: exp.members.slice(), mapTiles: exp.mapTiles || null };
}
function broadcastExpedition(exp, event = "expeditionState", extra = {}) {
  const payload = { ...expeditionState(exp), ...extra };
  for (const id of exp.members) io.to(id).emit(event, payload);
}
function startExpedition() {
  if (queue.expedition) return;
  const members = queue.members.filter(id => players[id] && players[id].zone === "lobby");
  if (!members.length) return;
  const id = crypto.randomUUID();
  const custom = published.find(d => d.id === queue.dungeonId);
  const exp = { id, floor: 1, members, enemies: makeEnemies(1), mapTiles: custom ? custom.tiles : null, lastTick: Date.now() };
  expeditions.set(id, exp);
  queue.expedition = id;
  for (const playerId of members) {
    const p = players[playerId];
    p.zone = "dungeon"; p.expeditionId = id; p.floor = 1; p.x = 170 + Math.random() * 45; p.y = 170 + Math.random() * 45;
    p.hp = p.maxHp;
    if (custom && custom.tiles) {
      let spawn = null;
      custom.tiles.forEach((row,y)=>row.forEach((t,x)=>{ if(t==="spawn" && !spawn) spawn={x,y}; }));
      if (spawn) { p.x = 150 + spawn.x * 78 + 39; p.y = 170 + spawn.y * 78 + 39; }
    }
  }
  broadcastPlayers();
  const memberCards = members.map(playerId => players[playerId]).filter(Boolean).map(p => ({ id:p.id, name:p.name, playerClass:p.playerClass, color:p.color }));
  for (const playerId of members) io.to(playerId).emit("queueState", { queue: { id: queue.id, leader: queue.leader, expedition: id, dungeonId: queue.dungeonId, dungeonName: custom ? custom.name : null }, members: memberCards, started: true, expedition: id, floor: 1, enemies: exp.enemies, mapTiles: exp.mapTiles || null });
  broadcastExpedition(exp);
  sendQueue();
}
function removeFromQueue(id) {
  queue.members = queue.members.filter(x => x !== id);
  if (queue.leader === id) queue.leader = queue.members[0] || null;
  if (!queue.members.length) queue = { id: "keep-queue", members: [], leader: null, expedition: null, dungeonId: null };
  else if (!queue.expedition) sendQueue();
}
function leaveExpedition(id) {
  const p = players[id];
  if (!p || !p.expeditionId) return;
  const exp = expeditions.get(p.expeditionId);
  if (exp) {
    exp.members = exp.members.filter(x => x !== id);
    if (!exp.members.length) expeditions.delete(exp.id);
    else broadcastExpedition(exp);
  }
  p.expeditionId = null; p.zone = "lobby"; p.floor = 1; p.x = 280; p.y = 260; p.hp = p.maxHp;
  if (queue.expedition && queue.expedition === (exp && exp.id)) {
    queue.expedition = null;
    queue.members = queue.members.filter(x => players[x] && players[x].zone === "lobby");
    queue.leader = queue.members[0] || null;
  }
  io.to(id).emit("returned");
  broadcastPlayers(); sendQueue();
}
function validPosition(v) { return v && Number.isFinite(v.x) && Number.isFinite(v.y) && Math.abs(v.x) < 3000 && Math.abs(v.y) < 3000; }
function sanitizeMap(tiles) {
  if (!Array.isArray(tiles) || tiles.length !== 8 || tiles.some(row => !Array.isArray(row) || row.length !== 12)) return null;
  const clean = tiles.map(row => row.map(t => allowedTiles.has(t) ? t : "floor"));
  if (!clean.some(row => row.includes("spawn")) || !clean.some(row => row.includes("exit"))) return null;
  return clean;
}
io.on("connection", socket => {
  socket.on("hello", () => socket.emit("serverMessage", { text: "The keep's lamps are lit." }));
  socket.on("join", data => {
    const name = String(data && data.name || "").trim().replace(/\s+/g, " ").slice(0, 18);
    const color = allowedColors.test(String(data && data.color || "")) ? data.color : "#777b68";
    const playerClass = allowedClasses.has(data && data.playerClass) ? data.playerClass : "vanguard";
    if (!name || !/^[\p{L}\p{N}_ -]+$/u.test(name)) return socket.emit("joinError", { error: "Choose a valid name using letters, numbers, spaces, _ or -." });
    const duplicate = Object.values(players).some(p => p.id !== socket.id && p.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (duplicate) return socket.emit("joinError", { error: "That name is already in the keep. Choose another." });
    if (players[socket.id]) return socket.emit("joined", { ok: true, player: publicPlayers()[socket.id] });
    const p = players[socket.id] = { id: socket.id, name, color, playerClass, x: 280, y: 260, zone: "lobby", hp: 100, maxHp: 100, floor: 1, expeditionId: null };
    socket.emit("joined", { ok: true, player: { ...p } });
    broadcastPlayers();
  });
  socket.on("playerData", data => {
    const p = players[socket.id]; if (!p || !data) return;
    const name = String(data.name || p.name).trim().replace(/\s+/g, " ").slice(0, 18);
    if (name.toLocaleLowerCase() !== p.name.toLocaleLowerCase() &&
      Object.values(players).some(other => other.id !== socket.id && other.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      socket.emit("joinError", { error: "That name is already in use." }); return;
    }
    if (name && /^[\p{L}\p{N}_ -]+$/u.test(name)) p.name = name;
    if (allowedColors.test(String(data.color || ""))) p.color = data.color;
    if (allowedClasses.has(data.playerClass)) p.playerClass = data.playerClass;
    broadcastPlayers();
  });
  socket.on("move", data => {
    const p = players[socket.id]; if (!p || !validPosition(data)) return;
    p.x = Math.max(15, Math.min(1785, data.x)); p.y = Math.max(15, Math.min(1185, data.y));
    if (Number.isFinite(data.fx)) p.fx = Math.max(-1, Math.min(1, data.fx));
    if (Number.isFinite(data.fy)) p.fy = Math.max(-1, Math.min(1, data.fy));
    broadcastPlayers();
  });
  socket.on("queueJoin", data => {
    const p = players[socket.id]; if (!p) return socket.emit("serverMessage", { text: "Enter the keep first." });
    if (p.zone !== "lobby") return socket.emit("serverMessage", { text: "Return to the keep before joining a new queue." });
    if (queue.expedition) return socket.emit("serverMessage", { text: "That party has already left. Wait for the next queue." });
    if (queue.members.includes(socket.id)) return sendQueue(socket.id);
    const requestedDungeon = String(data && data.dungeonId || "") || null;
    if (queue.members.length && queue.dungeonId !== requestedDungeon) return socket.emit("serverMessage", { text: "Everyone in a party must choose the same dungeon. Leave the queue to change maps." });
    if (queue.members.length >= 5) return socket.emit("serverMessage", { text: "The party is full. Wait for the next opening." });
    if (!queue.members.length) queue.dungeonId = requestedDungeon;
    queue.members.push(socket.id); if (!queue.leader) queue.leader = socket.id;
    sendQueue();
    if (queue.members.length === 5) startExpedition();
  });
  socket.on("queueLeave", () => { removeFromQueue(socket.id); sendQueue(); });
  socket.on("queueStart", () => {
    if (!queue.members.includes(socket.id)) return socket.emit("serverMessage", { text: "Join the queue before opening the gate." });
    if (queue.leader !== socket.id) return socket.emit("serverMessage", { text: "Only the party leader can open the gate." });
    if (queue.expedition) return socket.emit("serverMessage", { text: "Your party is already below." });
    startExpedition();
  });
  socket.on("attack", data => {
    const p = players[socket.id]; if (!p || p.zone !== "dungeon" || !p.expeditionId) return;
    const exp = expeditions.get(p.expeditionId); if (!exp || !validPosition(data)) return;
    const klass = p.playerClass;
    const range = klass === "ranger" ? 150 : klass === "arcanist" ? 130 : 92;
    const damage = klass === "vanguard" ? 2 : klass === "ranger" ? 1 : 2;
    const fx = Number.isFinite(data.fx) ? data.fx : 1, fy = Number.isFinite(data.fy) ? data.fy : 0;
    let target = null, best = range;
    for (const e of exp.enemies) {
      const dx = e.x - p.x, dy = e.y - p.y, dist = Math.hypot(dx, dy);
      const dot = dist ? (dx * fx + dy * fy) / dist : 1;
      if (dist < best && dot > (klass === "arcanist" ? -0.1 : 0.05)) { best = dist; target = e; }
    }
    if (target) {
      target.hp -= damage; target.hitAt = Date.now();
      if (target.hp <= 0) {
        exp.enemies = exp.enemies.filter(e => e.id !== target.id);
        broadcastExpedition(exp, "combatState", { message: target.boss ? "The Wraith Knight collapses into rust and dust." : "A skeleton falls apart." });
      } else broadcastExpedition(exp, "combatState");
      if (!exp.enemies.length) broadcastExpedition(exp, "combatState", { message: "The stairway groans open. Find the green-lit exit." });
    } else broadcastExpedition(exp, "combatState");
  });
  socket.on("nextFloor", () => {
    const p = players[socket.id]; if (!p || p.zone !== "dungeon" || !p.expeditionId) return;
    const exp = expeditions.get(p.expeditionId); if (!exp || exp.enemies.length) return;
    exp.floor += 1; exp.enemies = makeEnemies(exp.floor);
    for (const id of exp.members) { const member = players[id]; if (member) { member.floor = exp.floor; member.x = 170; member.y = 170; member.hp = member.maxHp; io.to(id).emit("floorChanged", { floor: exp.floor, enemies: exp.enemies, mapTiles: exp.mapTiles || null }); } }
    broadcastPlayers(); broadcastExpedition(exp);
  });
  socket.on("returnLobby", () => leaveExpedition(socket.id));
  socket.on("talkToKeeper", () => socket.emit("npcReply", { text: NPC_LINES[Math.floor(Math.random() * NPC_LINES.length)] }));
  socket.on("publishDungeon", data => {
    const p = players[socket.id]; if (!p) return socket.emit("serverMessage", { text: "Enter the keep before publishing." });
    if (published.length >= 100) published.shift();
    const tiles = sanitizeMap(data && data.tiles);
    if (!tiles) return socket.emit("serverMessage", { text: "Your map needs a valid 12 by 8 layout, a spawn, and an exit." });
    const name = String(data.name || "Unnamed crypt").trim().slice(0, 36) || "Unnamed crypt";
    const description = String(data.description || "").trim().slice(0, 120);
    const item = { id: crypto.randomUUID(), name, description, author: p.name, tiles, createdAt: Date.now() };
    published.unshift(item);
    socket.emit("dungeonPublished", { message: "“" + name + "” has been placed on the community shelf." });
    io.emit("dungeonList", published.map(({ id, name, description, author, createdAt }) => ({ id, name, description, author, createdAt })));
  });
  socket.on("listDungeons", () => socket.emit("dungeonList", published.map(({ id, name, description, author, createdAt }) => ({ id, name, description, author, createdAt }))));
  socket.on("playCommunityDungeon", data => {
    const p = players[socket.id]; if (!p) return;
    const item = published.find(d => d.id === (data && data.id));
    if (!item) return socket.emit("serverMessage", { text: "That dungeon is no longer on the shelf." });
    socket.emit("serverMessage", { text: "“" + item.name + "” is ready to explore. Join an expedition queue to enter with a party." });
  });
  socket.on("disconnect", () => {
    removeFromQueue(socket.id);
    if (players[socket.id] && players[socket.id].expeditionId) {
      const exp = expeditions.get(players[socket.id].expeditionId);
      if (exp) { exp.members = exp.members.filter(id => id !== socket.id); if (!exp.members.length) expeditions.delete(exp.id); else broadcastExpedition(exp); }
    }
    delete players[socket.id];
    broadcastPlayers(); sendQueue();
  });
});
setInterval(() => {
  const now = Date.now();
  for (const exp of expeditions.values()) {
    if (!exp.enemies.length) continue;
    for (const e of exp.enemies) {
      const targets = exp.members.map(id => players[id]).filter(p => p && p.zone === "dungeon" && p.expeditionId === exp.id);
      if (!targets.length) continue;
      let target = targets[0], distance = Infinity;
      for (const p of targets) { const d = Math.hypot(p.x - e.x, p.y - e.y); if (d < distance) { distance = d; target = p; } }
      if (distance > e.r + 20) { e.x += (target.x - e.x) / distance * e.speed * .25; e.y += (target.y - e.y) / distance * e.speed * .25; }
      else if (now - (e.lastHit || 0) > 1300) { target.hp = Math.max(0, target.hp - (e.boss ? 10 : 5)); e.lastHit = now; if (target.hp === 0) target.hp = 1; }
    }
    broadcastExpedition(exp); broadcastPlayers();
  }
}, 250);
app.get("/", (req, res) => res.send("Bryan's Dungeon server is awake."));
app.get("/health", (req, res) => res.json({ ok: true, players: Object.keys(players).length, dungeons: published.length }));
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Bryan's Dungeon listening on " + PORT));
