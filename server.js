const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" }, maxHttpBufferSize: 1e6 });
app.use(express.json({ limit: "128kb" }));

const players = Object.create(null);
let queue = { id: "keep-queue", members: [], leader: null, expedition: null, dungeonId: null, countdownEndsAt: null };
let raidExpeditionId = null;
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
      x: p.x, y: p.y, fx: p.fx || 1, fy: p.fy || 0, zone: p.zone, hp: p.hp, maxHp: p.maxHp,
      floor: p.floor || 1, level: p.level || 1, xp: p.xp || 0, coins: p.coins || 0, expeditionId: p.expeditionId || null
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
  const data = { queue: { id: queue.id, leader: queue.leader, expedition: queue.expedition, dungeonId: queue.dungeonId, dungeonName: chosen ? chosen.name : null, countdownEndsAt: queue.countdownEndsAt }, members };
  if (to) io.to(to).emit("queueState", data); else io.emit("queueState", data);
}
function makeEnemies(floor, mode) {
  const defs=[["skeleton","Bone Soldier",18,43,15],["brute","Crypt Brute",48,24,11],["archer","Grave Archer",16,35,13],["shade","Lantern Shade",22,66,12],["bomber","Cinder Husk",20,31,14],["mage","Rune Acolyte",25,29,12],["sentinel","Iron Sentinel",38,21,16]];
  if(mode==="raid")return [{id:crypto.randomUUID(),type:"raidboss",name:"THE HOLLOW TITAN",x:860,y:470,r:82,hp:3600,maxHp:3600,speed:23,boss:true,stage:1,hitAt:0,attackCd:0}];
  const count=Math.min(5+Math.floor(floor*.8),12), enemies=[];
  for(let i=0;i<count;i++){const d=defs[Math.floor(Math.random()*defs.length)],scale=1+floor*.19,hp=Math.round(d[2]*scale);enemies.push({id:crypto.randomUUID(),type:d[0],name:d[1],x:260+Math.random()*690,y:210+Math.random()*470,r:d[4]+Math.min(5,floor*.25),hp,maxHp:hp,speed:d[3]+Math.min(20,floor),boss:false,hitAt:0,attackCd:0});}
  if(floor%10===0){const hp=900+floor*115;enemies.push({id:crypto.randomUUID(),type:"boss",name:"WRAITH KING",x:900,y:470,r:54,hp,maxHp:hp,speed:25+floor,boss:true,stage:1,hitAt:0,attackCd:0});}
  else if(floor%5===0){const hp=250+floor*45;enemies.push({id:crypto.randomUUID(),type:"miniboss",name:"IRON WARDEN",x:900,y:470,r:38,hp,maxHp:hp,speed:21+floor,boss:true,stage:1,hitAt:0,attackCd:0});}
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
  const exp = { id, floor: 1, mode: "normal", members, enemies: makeEnemies(1), mapTiles: custom ? custom.tiles : null, lastTick: Date.now() };
  queue.countdownEndsAt = null;
  expeditions.set(id, exp);
  queue.expedition = id;
  for (const playerId of members) {
    const p = players[playerId];
    p.zone = "dungeon"; p.expeditionId = id; p.floor = 1; p.x = 170 + Math.random() * 45; p.y = 170 + Math.random() * 45;
    p.hp = p.maxHp; p.down = false;
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
  if (!queue.members.length) queue = { id: "keep-queue", members: [], leader: null, expedition: null, dungeonId: null, countdownEndsAt: null };
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
  p.expeditionId = null; p.zone = "lobby"; p.floor = 1; p.x = 280; p.y = 260; p.hp = p.maxHp; p.down = false;
  if (queue.expedition && queue.expedition === (exp && exp.id)) {
    if (!exp || !exp.members.length) {
      queue = { id: "keep-queue", members: [], leader: null, expedition: null, dungeonId: null };
    } else {
      queue.members = exp.members.slice();
      if (!queue.members.includes(queue.leader)) queue.leader = queue.members[0] || null;
    }
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
    const p = players[socket.id] = { id: socket.id, name, color, playerClass, x: 280, y: 260, fx: 1, fy: 0, zone: "lobby", hp: 100, maxHp: 100, floor: 1, level: 1, xp: 0, coins: 0, weaponPower: 0, down: false, expeditionId: null };
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
    if (!queue.countdownEndsAt) queue.countdownEndsAt = Date.now() + 10000;
    sendQueue();
  });
  socket.on("queueLeave", () => { removeFromQueue(socket.id); sendQueue(); });
  socket.on("queueStart", () => {
    if (!queue.members.includes(socket.id)) return socket.emit("serverMessage", { text: "Join the queue before opening the gate." });
    if (queue.leader !== socket.id) return socket.emit("serverMessage", { text: "Only the party leader can open the gate." });
    if (queue.expedition) return socket.emit("serverMessage", { text: "Your party is already below." });
    startExpedition();
  });
  function damageEnemy(exp, enemy, amount, attacker) {
    if(!enemy||!exp.enemies.includes(enemy))return;
    enemy.hp-=amount;enemy.hitAt=Date.now();enemy.lastHitBy=attacker;
    if(enemy.hp<=0){exp.enemies=exp.enemies.filter(e=>e.id!==enemy.id);const p=players[attacker];const xp=enemy.boss?150:enemy.type==="brute"?24:12,coins=enemy.boss?50:3+Math.floor(Math.random()*4);
      if(p){p.xp=(p.xp||0)+xp;p.coins=(p.coins||0)+coins;io.to(attacker).emit("reward",{xp,coins});}
      broadcastExpedition(exp,"combatState",{message:enemy.boss?(enemy.type==="raidboss"?"THE RAID TITAN FALLS!":"The boss crashes to the stones!"):"The "+(enemy.name||enemy.type)+" falls."});
    }else broadcastExpedition(exp,"combatState");
    if(!exp.enemies.length)broadcastExpedition(exp,"combatState",{message:"The stairway groans open. Find the green-lit exit."});
  }
  socket.on("attack",data=>{
    const p=players[socket.id];if(!p||p.zone!=="dungeon"||p.hp<=0||!p.expeditionId)return;
    const exp=expeditions.get(p.expeditionId);if(!exp||!validPosition(data))return;
    const klass=p.playerClass,range=klass==="ranger"?190:klass==="arcanist"?165:115,damage=(klass==="vanguard"?12:klass==="ranger"?9:11)+(p.weaponPower||0);
    const fx=Number.isFinite(data.fx)?data.fx:p.fx||1,fy=Number.isFinite(data.fy)?data.fy:p.fy||0,arc=klass==="vanguard"?.85:.55;
    const targets=exp.enemies.filter(e=>{const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);return d<range&&(d===0||(dx*fx+dy*fy)/d>Math.cos(arc));});
    if(targets.length)targets.forEach(e=>damageEnemy(exp,e,damage,socket.id));else broadcastExpedition(exp,"combatState");
  });
  socket.on("ability",data=>{
    const p=players[socket.id];if(!p||p.zone!=="dungeon"||p.hp<=0||!p.expeditionId)return;
    const exp=expeditions.get(p.expeditionId);if(!exp)return;
    const slot=Math.max(1,Math.min(4,Number(data&&data.slot)||1)),klass=p.playerClass,mult=slot===4?4.5:slot===3?2.8:slot===2?1.9:1.35,range=slot===1?170:slot===2?230:slot===3?280:360;
    const dmg=Math.round((klass==="vanguard"?15:klass==="ranger"?12:14)*mult)+(p.weaponPower||0),near=exp.enemies.filter(e=>Math.hypot(e.x-p.x,e.y-p.y)<range);
    if(klass==="vanguard"&&slot===2){p.hp=Math.min(p.maxHp,p.hp+22);io.to(socket.id).emit("healed",{amount:22});}
    near.forEach(e=>damageEnemy(exp,e,dmg,socket.id));
    broadcastExpedition(exp,"combatState",{effect:{kind:klass,slot,x:p.x,y:p.y,fx:p.fx,fy:p.fy,at:Date.now()}});
  });
  socket.on("equipItem",data=>{const p=players[socket.id];if(!p)return;const power={"Iron sword":0,"Knight's blade":5,"Warden greatsword":12,"Ashwood bow":0,"Hunter's bow":5,"Storm bow":11,"Ember staff":0,"Runed staff":6,"Starfire staff":12};if(power[data&&data.weapon]!==undefined){p.weapon=data.weapon;p.weaponPower=power[data.weapon];}});
  socket.on("nextFloor", () => {
    const p = players[socket.id]; if (!p || p.zone !== "dungeon" || !p.expeditionId) return;
    const exp = expeditions.get(p.expeditionId); if (!exp || exp.enemies.length) return;
    exp.floor += 1; exp.enemies = makeEnemies(exp.floor, exp.mode);
    for (const id of exp.members) { const member = players[id]; if (member) { member.floor = exp.floor; member.x = 170; member.y = 170; member.hp = member.maxHp; io.to(id).emit("floorChanged", { floor: exp.floor, enemies: exp.enemies, mapTiles: exp.mapTiles || null }); } }
    broadcastPlayers(); broadcastExpedition(exp);
  });
  socket.on("raidJoin",()=>{
    const p=players[socket.id];if(!p||p.zone!=="lobby")return socket.emit("serverMessage",{text:"Return to the keep before entering the raid."});
    let exp=raidExpeditionId&&expeditions.get(raidExpeditionId);
    if(!exp||!exp.enemies.length){const id=crypto.randomUUID();exp={id,mode:"raid",floor:10,members:[],enemies:makeEnemies(10,"raid"),mapTiles:null,lastTick:Date.now()};expeditions.set(id,exp);raidExpeditionId=id;}
    if(!exp.members.includes(socket.id)){exp.members.push(socket.id);p.zone="dungeon";p.expeditionId=exp.id;p.floor=10;p.hp=p.maxHp;p.down=false;p.x=170+Math.random()*60;p.y=170+Math.random()*60;}
    socket.emit("queueState",{queue:{id:"raid",leader:exp.members[0],expedition:exp.id,dungeonId:null,dungeonName:"Raid Titan"},members:exp.members.map(id=>players[id]).filter(Boolean).map(m=>({id:m.id,name:m.name,playerClass:m.playerClass,color:m.color})),started:true,expedition:exp.id,floor:10,enemies:exp.enemies,raid:true});
    broadcastPlayers();broadcastExpedition(exp);socket.emit("serverMessage",{text:"Raid entered: the Titan's health is shared by every raider."});
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
setInterval(()=>{
  const now=Date.now();
  if(queue.countdownEndsAt&&!queue.expedition&&queue.members.length&&now>=queue.countdownEndsAt)startExpedition();
  else if(queue.countdownEndsAt&&!queue.expedition)sendQueue();
  for(const exp of expeditions.values()){
    if(!exp.enemies.length)continue;let changed=false;
    const targets=exp.members.map(id=>players[id]).filter(p=>p&&p.zone==="dungeon"&&p.expeditionId===exp.id&&p.hp>0);
    for(const e of exp.enemies){
      if(!targets.length)break;let target=targets[0],distance=Infinity;
      for(const p of targets){const d=Math.hypot(p.x-e.x,p.y-e.y);if(d<distance){distance=d;target=p;}}
      if(e.boss){const stage=e.hp/e.maxHp<.3?3:e.hp/e.maxHp<.65?2:1;if(stage!==e.stage){e.stage=stage;e.attackCd=0;broadcastExpedition(exp,"combatState",{message:stage===2?"The boss enters its second phase!":"THE BOSS ENRAGES — THE FLOOR SHUDDERS!"});}}
      if(distance>e.r+32){const speed=e.speed*(e.type==="shade"&&e.stage>=2?1.55:1);e.x+=(target.x-e.x)/Math.max(1,distance)*speed*.25;e.y+=(target.y-e.y)/Math.max(1,distance)*speed*.25;changed=true;}
      if(!e.attackCd)e.attackCd=now+700+Math.random()*500;
      if(now>=e.attackCd&&!e.telegraphAt){e.telegraphAt=now;e.targetId=target.id;e.attackType=e.type==="archer"?"volley":e.type==="bomber"?"blast":e.type==="shade"?"dash":e.type==="mage"?"rune":e.boss?(e.stage>=3?"cataclysm":e.stage===2?"shockwave":"cleave"):e.type==="brute"?"slam":"claw";changed=true;}
      if(e.telegraphAt&&now-e.telegraphAt>(e.boss?(e.stage>=3?450:750):e.type==="bomber"?550:850)){
        const victim=players[e.targetId]||target,dist=Math.hypot(victim.x-e.x,victim.y-e.y);let hit=false;
        if(["blast","shockwave","cataclysm"].includes(e.attackType))hit=dist<(e.attackType==="cataclysm"?390:e.attackType==="shockwave"?250:145);
        else if(e.attackType==="volley"||e.attackType==="rune")hit=dist<(e.attackType==="rune"?300:520);
        else if(e.attackType==="dash"){e.x=victim.x+(e.x-victim.x)*.15;e.y=victim.y+(e.y-victim.y)*.15;hit=dist<240;}
        else hit=dist<(e.type==="brute"?100:e.boss?190:65);
        if(hit&&victim.hp>0){const dmg=e.type==="raidboss"?(e.stage>=3?34:24):e.boss?(e.stage>=3?24:e.stage===2?18:13):e.type==="brute"?16:e.type==="bomber"?20:e.type==="mage"?13:e.type==="archer"?11:e.type==="shade"?14:7;victim.hp=Math.max(0,victim.hp-dmg);io.to(victim.id).emit("damageTaken",{amount:dmg,attack:e.attackType});if(victim.hp===0){victim.down=true;victim.zone="downed";io.to(victim.id).emit("playerDown",{name:victim.name});}}
        e.telegraphAt=0;e.attackCd=now+(e.boss?(e.stage>=3?850:1450):e.type==="bomber"?2100:1200+Math.random()*600);e.attackType=null;changed=true;
      }
      if(e.type==="raidboss"&&e.hp<e.maxHp*.5&&now-(e.lastSummon||0)>10000&&exp.enemies.length<12){e.lastSummon=now;exp.enemies.push(...makeEnemies(6,"adds").filter(x=>!x.boss).slice(0,3));}
    }
    if(!targets.length&&exp.members.length){for(const id of exp.members){const p=players[id];if(p&&p.zone==="downed"){p.zone="dungeon";p.hp=1;io.to(id).emit("raidDefeated",{text:"Your party has fallen. You crawl back to the keep."});setTimeout(()=>leaveExpedition(id),1600);}}}
    if(changed||now-(exp.lastBroadcast||0)>500){exp.lastBroadcast=now;broadcastExpedition(exp);broadcastPlayers();}
  }
},250);
app.get("/", (req, res) => res.send("Bryan's Dungeon server is awake."));
app.get("/health", (req, res) => res.json({ ok: true, players: Object.keys(players).length, dungeons: published.length }));
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Bryan's Dungeon listening on " + PORT));
