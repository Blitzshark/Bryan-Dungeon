const {recoverAtCamp}=require('../test-support/helpers');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {E,playBattle,advanceTo,equipBest}=require('../test-support/helpers');
test('three worlds each have nine encounters and a tenth boss, with diverse enemy rosters',()=>{
 assert.equal(E.CHAPTERS.length,30);assert(Object.keys(E.ENEMIES).length>=35);assert(new Set(Object.values(E.ENEMIES).map(e=>e.kind)).size>=18);
 for(let w=0;w<3;w++){const chapters=E.CHAPTERS.filter(c=>c.world===w);assert.equal(chapters.length,10);assert.deepEqual(chapters.map(c=>c.progress),[1,2,3,4,5,6,7,8,9,10]);assert.equal(chapters.filter(c=>c.boss).length,1);assert(chapters[9].boss);chapters.forEach(c=>c.enemies.forEach(type=>assert(E.ENEMIES[type])));}
 const s=E.createRun('Bryan');assert.equal(s.party.length,3);assert.equal(E.active(s).id,'rowan');assert.deepEqual(E.createRun('Bryan'),s);
});
test('invalid and wrong-side actions do not consume resources or advance combat',()=>{
 const s=E.createRun();for(const command of [{type:'skill',skill:'sunder',target:'enemy-0'},{type:'skill',skill:'strike',target:'hero'},{type:'potion',target:'hero'},{type:'revive',target:'hero'},{type:'bad'}]){const before=JSON.stringify(s);assert.equal(E.act(s,command).ok,false);assert.equal(JSON.stringify(s),before);}const before=JSON.stringify(s);assert.equal(E.enemyAct(s).ok,false);assert.equal(JSON.stringify(s),before);
});
test('each fighter acts once per round and player turns wait indefinitely',()=>{
 const s=E.createRun(),order=[...s.order],seen=[];while(s.round===1){const actor=E.active(s);seen.push(actor.id);assert((actor.side==='party'?E.act(s,{type:'focus'}):E.enemyAct(s)).ok);}assert.deepEqual(seen,order);const before=JSON.stringify(s);for(let i=0;i<100;i++)E.active(s);assert.equal(JSON.stringify(s),before);
});
test('focus, guarding, skill costs, and turn-based cooldowns remain authoritative',()=>{
 const s=E.createRun(),p=s.party[1],mp=p.mp;const result=E.act(s,{type:'skill',skill:'volley'});assert(result.ok);assert.equal(result.skill,'volley');assert.equal(p.mp,mp-3);assert.equal(p.cooldowns.volley,3);advanceTo(s,'rowan');assert.equal(p.cooldowns.volley,2);assert.equal(E.act(s,{type:'skill',skill:'volley'}).ok,false);E.act(s,{type:'focus'});assert(p.guard);assert.equal(p.mp,p.maxMp);advanceTo(s,'rowan');assert.equal(p.cooldowns.volley,1);assert.equal(p.guard,false);
});
test('tonics, revival, poison, and enemy healing have distinct effects',()=>{
 const s=E.createRun();s.party[0].hp-=45;const n=s.potions;assert(E.act(s,{type:'potion',target:'hero'}).ok);assert.equal(s.potions,n-1);assert.equal(s.party[0].hp,s.party[0].maxHp-5);advanceTo(s,'mira');s.party[0].hp=0;assert(E.act(s,{type:'revive',target:'hero'}).ok);assert.equal(s.party[0].hp,Math.ceil(s.party[0].maxHp/2));
 const spider=E.createRun();spider.enemies[0].behavior='poison';advanceTo(spider,'enemy-0');const hit=E.enemyAct(spider);const target=E.unit(spider,hit.events[0].target);assert.equal(target.status.poison,2);advanceTo(spider,target.id);const tick=E.act(spider,{type:'focus'});assert(tick.events.some(e=>e.status==='poison'));assert.equal(target.status.poison,1);
 const healer=E.createRun();healer.enemies[0].behavior='heal';healer.enemies[1].hp=3;advanceTo(healer,'enemy-0');const heal=E.enemyAct(healer);assert.equal(heal.skill,'mend');assert(heal.events.some(e=>e.type==='heal'));assert(healer.enemies[1].hp>3);
});
test('every victory leads to a campfire with loot, rest, shopping and equipment',()=>{
 const s=E.createRun();playBattle(s);assert.equal(s.phase,'camp');assert.equal(s.history.length,1);assert.equal(s.inventory.length,1);assert.equal(E.act(s,{type:'focus'}).ok,false);const item=s.inventory[0],base=E.stats(s,s.party[0]);assert(E.campAction(s,{type:'equip',item:item.id,hero:'hero'}).ok);const stats=E.stats(s,s.party[0]);assert.equal(stats.atk,base.atk+item.atk);assert.equal(stats.def,base.def+item.def);assert.equal(E.campAction(s,{type:'sell',item:item.id}).ok,false);assert(E.campAction(s,{type:'unequip',item:item.id}).ok);const gold=s.gold;assert(E.campAction(s,{type:'sell',item:item.id}).ok);assert.equal(s.gold,gold+item.price);assert.equal(s.inventory.length,0);
 const p=s.party[0];p.hp=1;p.status.poison=2;E.campAction(s,{type:'rest'});assert.equal(p.hp,p.maxHp);assert.deepEqual(p.status,{});assert.equal(E.campAction(s,{type:'rest'}).ok,false);const count=s.potions;assert(E.buyTonic(s));assert.equal(s.potions,count+1);
});
test('gear upgrades consume gold, increase stats and stop at three upgrades',()=>{
 const s=E.createRun();playBattle(s);s.gold=300;const item=s.inventory[0],initial=item.atk+item.def;for(let i=0;i<3;i++)assert(E.campAction(s,{type:'upgrade',item:item.id}).ok);assert(item.atk+item.def>initial);assert.equal(s.gold,300-5-8-11);assert.equal(E.campAction(s,{type:'upgrade',item:item.id}).ok,false);
});
test('full thirty-encounter campaign is winnable, camps appear thirty times, bosses unlock worlds',()=>{
 const s=E.createRun('Campaign tester'),worlds=[],bosses=[];let camps=0,total=0;
 for(let stage=0;stage<30;stage++){
  total+=playBattle(s);assert.notEqual(s.phase,'defeat','failed stage '+stage);assert.equal(s.phase,'camp');camps++;assert.equal(s.stage,stage);if(E.CHAPTERS[stage].boss){bosses.push(stage+1);assert.equal(s.reward.boss,true);assert(s.inventory.filter(i=>s.reward.loot.includes(i.id)).every(i=>i.rarity==='epic'));}
  recoverAtCamp(s);equipBest(s);assert(E.travel(s));if(s.phase==='story')assert(E.choose(s,'accept'));if(stage===9||stage===19){worlds.push(E.CHAPTERS[s.stage].world);assert.equal(E.CHAPTERS[s.stage].progress,1);}
 }
 assert.equal(s.phase,'complete');assert.equal(s.history.length,30);assert.equal(camps,30);assert.deepEqual(bosses,[10,20,30]);assert.deepEqual(worlds,[1,2]);assert.equal(s.party[0].level,16);assert(total>150);
});
test('defeat retries the current encounter without discarding loot',()=>{
 const s=E.createRun();s.party.forEach(p=>p.hp=1);s.enemies.forEach(e=>e.atk=999);while(s.phase==='battle')E.active(s).side==='enemy'?E.enemyAct(s):E.act(s,{type:'focus'});assert.equal(s.phase,'defeat');assert(E.retry(s));assert.equal(s.stage,0);s.party.forEach(p=>assert.equal(p.hp,p.maxHp));assert.equal(s.phase,'battle');
});
test('saves round trip camp state and migrate the previous eight-encounter campaign',()=>{
 const s=E.createRun();playBattle(s);assert.deepEqual(E.restore(JSON.stringify(s)),s);const old=E.createRun();old.version=4;old.stage=4;delete old.inventory;delete old.stories;const restored=E.restore(old);assert(restored);assert.equal(restored.version,5);assert.equal(restored.stage,10);assert.deepEqual(restored.inventory,[]);old.stage=7;old.phase='complete';const finished=E.restore(old);assert.equal(finished.stage,19);assert.equal(finished.phase,'camp');assert(E.travel(finished));assert.equal(finished.stage,20);assert.equal(E.restore('{broken'),null);
});

test('armored, charging, sweeping, and draining enemies use different actions',()=>{
 const guard=E.createRun();guard.enemies[0].behavior='guard';advanceTo(guard,'enemy-0');const brace=E.enemyAct(guard);assert.equal(brace.action,'focus');assert.equal(guard.enemies[0].guard,true);
 const charge=E.createRun();charge.enemies[0].behavior='charge';advanceTo(charge,'enemy-0');E.enemyAct(charge);assert.equal(charge.enemies[0].charging,true);advanceTo(charge,'enemy-0');charge.party.forEach(p=>p.guard=false);const heavy=E.enemyAct(charge);assert.equal(heavy.events[0].amount,Math.round(charge.enemies[0].atk*1.8));assert.equal(charge.enemies[0].charging,false);
 const sweep=E.createRun();sweep.enemies[0].behavior='sweep';sweep.enemies[0].turns=1;advanceTo(sweep,'enemy-0');assert.equal(E.enemyAct(sweep).events.filter(e=>e.type==='damage').length,3);
 const drain=E.createRun();drain.enemies[0].behavior='drain';drain.enemies[0].hp=1;advanceTo(drain,'enemy-0');const leech=E.enemyAct(drain);assert(leech.events.some(e=>e.type==='heal'));assert(drain.enemies[0].hp>1);
});
test('Universe cleave belongs only to Bryan and deals exactly ten million to every living enemy',()=>{
 for(const name of ['Bryan','bryan','  BRYAN  ']){const s=E.createRun(name);s.order=['hero',...s.order.filter(id=>id!=='hero')];s.cursor=0;s.enemies[0].guard=true;const result=E.act(s,{type:'skill',skill:'universe'});assert.equal(result.ok,true);assert.equal(result.events.length,2);assert(result.events.every(e=>e.amount===10000000&&!e.guarded));assert(s.enemies.every(e=>e.hp===0));assert.equal(s.phase,'camp');assert(E.restore(s));}
 const s=E.createRun('Other');s.order=['hero',...s.order.filter(id=>id!=='hero')];s.cursor=0;const before=JSON.stringify(s);assert.equal(E.act(s,{type:'skill',skill:'universe'}).ok,false);assert.equal(JSON.stringify(s),before);
});
