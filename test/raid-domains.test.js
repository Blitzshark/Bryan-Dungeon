const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../test-support/fixture-engine');
test('raid durability scales sharply and old saves preserve damage while removing obsolete hallucinations',()=>{
 const s=E.createRun('Tester','warrior','raid',{seed:2}),boss=s.enemies[0];assert.equal(boss.maxHp,E.raidBossStats(1,boss.enemyType).hp);assert(E.raidBossStats(10,'raid_demon').hp>E.raidBossStats(10).hp);boss.hp=boss.maxHp/2;boss.status.hallucination=3;s.party[0].status.hallucination=2;delete s.raidBalanceVersion;assert(E.needsMigration(s));const loaded=E.restore(s);assert.equal(loaded.enemies[0].hp,loaded.enemies[0].maxHp/2);assert(!loaded.enemies[0].status.hallucination);assert(!loaded.party[0].status.hallucination);assert(!E.needsMigration(loaded));
});
test('each raid theme has sustained domains and devastating cinematics without distortion statuses',()=>{
 for(const type of E.RAID_BOSSES.filter(k=>k!=='raid_snail')){const moves=E.C.ENEMY_MOVES[type].map(id=>E.SKILLS[id]);assert.equal(moves.filter(m=>m.arena).length,11);assert(moves.some(m=>m.duration===4800&&m.mult>=2));assert(moves.every(m=>!m.hallucinate));const s=E.createRun('Tester','warrior','raid',{seed:2}),boss=s.enemies[0];Object.assign(boss,E.ENEMIES[type],{enemyType:type,hp:1e8,maxHp:1e8});s.party.forEach(p=>p.hp=p.maxHp=1e8);const id=E.C.ENEMY_MOVES[type][2];boss.moveDeck=[id];boss.turns=4;s.order=[boss.id,...s.order.filter(k=>k!==boss.id)];s.cursor=0;const result=E.enemyAct(s);assert.equal(result.skill,id);assert.equal(s.arena.rounds,5);assert.equal(s.arena.name,E.SKILLS[id].name);assert.equal(s.arena.kind,E.SKILLS[id].arena);assert(!result.events.some(e=>e.type==='hallucination'));}
});
test('most raid species stay just above five thousand HP while stronger species receive a bonus without a party-size multiplier',()=>{for(const level of [1,5,10,40,100]){let ordinary=0;for(const type of E.RAID_BOSSES){const hp=E.raidBossStats(level,type).hp;if(hp>=5500&&hp<=5900)ordinary++;}assert(ordinary>E.RAID_BOSSES.length/2);assert(E.raidBossStats(level,'raid_demon').hp>E.raidBossStats(level,'raid_tide').hp);assert(E.raidBossStats(level,'raid_furnace').hp>E.raidBossStats(level,'raid_tide').hp);}for(let seed=1;seed<=10;seed++){const a=E.createRun('Tester','warrior','raid',{seed}),b=E.createRun('Tester','warrior','raid',{seed,partySize:6});assert.equal(a.enemies[0].maxHp,b.enemies[0].maxHp);}});

test('raid films are rare and separated by four normal boss actions, including across save restoration',()=>{
 for(const type of E.RAID_BOSSES.filter(k=>k!=='raid_snail')){
  let s=E.createRun('Tester','warrior','raid',{seed:17});const id=s.enemies[0].id;
  Object.assign(s.enemies[0],E.ENEMIES[type],{enemyType:type,hp:1e9,maxHp:1e9});
  s.party.forEach(p=>p.hp=p.maxHp=1e9);
  let previous=0,films=0;
  for(let turn=1;turn<=130;turn++){
   const b=s.enemies.find(e=>e.id===id);s.order=[id,...s.party.map(p=>p.id)];s.cursor=0;
   const result=E.enemyAct(s);assert(result.ok);
   if(E.SKILLS[result.skill].cinematic){assert(turn-previous>=5);previous=turn;films++;}
   if(turn===40)s=E.restore(s);
  }
  assert(films>0&&films<=26);
  const moves=E.C.ENEMY_MOVES[type].map(k=>E.SKILLS[k]);
  assert.equal(moves.filter(m=>m.cinematic).length,22);
  assert(moves.filter(m=>!m.cinematic).every(m=>m.duration<=1900));
 }
});
