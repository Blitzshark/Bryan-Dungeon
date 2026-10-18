const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../campaign');
function advanceTo(s,id){let count=0;while(s.phase==='battle'&&E.active(s).id!==id&&count++<60){E.active(s).side==='enemy'?E.enemyAct(s):E.act(s,{type:'focus'});}assert.equal(E.active(s)?.id,id);}
function nextTurn(s,id){if(E.active(s).id===id)E.act(s,{type:'focus'});advanceTo(s,id);}
test('three adventurers, eight encounters, deterministic speed-based initiative',()=>{
 const s=E.createRun('Bryan','warrior');assert.equal(E.CHAPTERS.length,8);assert.equal(s.party.length,3);assert.equal(s.stage,0);assert.equal(E.active(s).id,'rowan');assert.equal(s.enemies.length,2);assert.deepEqual(E.createRun('Bryan','warrior'),s);
 for(const job of ['warrior','ranger','mage'])assert.equal(E.createRun('Test',job).party[0].job,job);
});
test('invalid actions and wrong-side actions cannot change state or consume turns',()=>{
 const s=E.createRun();let previous=JSON.stringify(s);assert.equal(E.enemyAct(s).ok,false);assert.equal(JSON.stringify(s),previous);
 for(const command of [{type:'skill',skill:'sunder',target:'enemy-0'},{type:'skill',skill:'strike',target:'hero'},{type:'potion',target:'hero'},{type:'revive',target:'hero'},{type:'made-up'}]){assert.equal(E.act(s,command).ok,false);assert.equal(JSON.stringify(s),previous);}
 s.party[1].mp=0;previous=JSON.stringify(s);assert.equal(E.act(s,{type:'skill',skill:'volley',target:'enemy-0'}).ok,false);assert.equal(JSON.stringify(s),previous);
});
test('exactly one action per fighter per round; planning never advances combat',()=>{
 const s=E.createRun(),initial=s.enemies.map(e=>e.hp),order=[...s.order],seen=[];
 while(s.round===1){const a=E.active(s);seen.push(a.id);assert.equal((a.side==='party'?E.act(s,{type:'focus'}):E.enemyAct(s)).ok,true);}
 assert.deepEqual(seen,order);assert.deepEqual(s.enemies.map(e=>e.hp),initial);assert.equal(s.round,2);
 const copy=JSON.stringify(s);for(let i=0;i<50;i++)E.active(s);assert.equal(JSON.stringify(s),copy);
});
test('skills damage targets, spend focus, and cool down on owner turns only',()=>{
 const s=E.createRun(),actor=E.active(s),mp=actor.mp,hps=s.enemies.map(e=>e.hp);assert.equal(E.act(s,{type:'skill',skill:'volley',target:'enemy-0'}).ok,true);assert.equal(actor.mp,mp-3);assert.equal(actor.cooldowns.volley,3);s.enemies.forEach((e,i)=>assert(e.hp<hps[i]));
 advanceTo(s,'rowan');assert.equal(actor.cooldowns.volley,2);const before=JSON.stringify(s);assert.equal(E.act(s,{type:'skill',skill:'volley',target:'enemy-0'}).ok,false);assert.equal(JSON.stringify(s),before);
 nextTurn(s,'rowan');assert.equal(actor.cooldowns.volley,1);nextTurn(s,'rowan');assert.equal(actor.cooldowns.volley,0);
});
test('focus restores resource and guards until the owner’s next turn',()=>{
 const a=E.createRun(),b=E.createRun();a.party[1].mp=0;E.act(a,{type:'focus'});assert.equal(a.party[1].mp,3);assert.equal(a.party[1].guard,true);
 advanceTo(a,'enemy-0');advanceTo(b,'enemy-0');a.seed=b.seed=12;a.party.forEach(p=>p.guard=true);b.party.forEach(p=>p.guard=false);
 const r1=E.enemyAct(a),r2=E.enemyAct(b);assert.equal(r1.events[0].target,r2.events[0].target);assert.equal(r1.events[0].amount,Math.round(r2.events[0].amount*.5));advanceTo(a,'rowan');assert.equal(a.party[1].guard,false);
});
test('items heal or revive valid allies and consume one action',()=>{
 const s=E.createRun();s.party[0].hp-=45;const count=s.potions;assert.equal(E.act(s,{type:'potion',target:'hero'}).ok,true);assert.equal(s.potions,count-1);assert.equal(s.party[0].hp,s.party[0].maxHp-5);assert.notEqual(E.active(s).id,'rowan');
 advanceTo(s,'mira');s.party[0].hp=0;const embers=s.embers;assert.equal(E.act(s,{type:'revive',target:'hero'}).ok,true);assert.equal(s.embers,embers-1);assert.equal(s.party[0].hp,Math.ceil(s.party[0].maxHp*.5));
});
test('fallen units are skipped; defeat offers a full-health retry of the same encounter',()=>{
 const s=E.createRun();s.party[0].hp=0;E.act(s,{type:'focus'});assert.equal(E.active(s).id,'mira');E.act(s,{type:'focus'});assert.notEqual(E.active(s).id,'hero');s.party.forEach(p=>p.hp=1);s.enemies.forEach(e=>e.atk=10000);
 for(let i=0;i<20&&s.phase==='battle';i++){E.active(s).side==='enemy'?E.enemyAct(s):E.act(s,{type:'focus'});}assert.equal(s.phase,'defeat');const stage=s.stage;assert.equal(E.retry(s),true);assert.equal(s.stage,stage);s.party.forEach(p=>assert.equal(p.hp,p.maxHp));assert(s.potions>=2);
});
test('save round trips include enemy turns; malformed and old saves are rejected',()=>{
 const s=E.createRun();advanceTo(s,'enemy-0');assert.deepEqual(E.restore(JSON.stringify(s)),s);assert.equal(E.restore('{broken'),null);assert.equal(E.restore({version:1}),null);const broken=JSON.parse(JSON.stringify(s));broken.party[0].hp=NaN;assert.equal(E.restore(broken),null);
});
function playBattle(s){let turns=0;while(s.phase==='battle'&&turns++<500){const a=E.active(s);if(a.side==='enemy'){assert(E.enemyAct(s).ok);continue;}const weak=E.living(s,'party').sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],fallen=s.party.find(p=>p.hp<=0);let command;
 if(fallen&&s.embers)command={type:'revive',target:fallen.id};else if(weak.hp<weak.maxHp*.4&&s.potions)command={type:'potion',target:weak.id};else if(a.id==='mira'&&weak.hp<weak.maxHp*.6&&a.mp>=3&&!a.cooldowns.mend)command={type:'skill',skill:'mend'};
 else{const skill=E.CLASSES[a.job].skill,def=E.SKILLS[skill],enemies=E.living(s,'enemy').sort((a,b)=>a.hp-b.hp),ready=a.mp>=def.cost&&!a.cooldowns[skill];command=a.mp<def.cost?{type:'focus'}:{type:'skill',skill:ready?skill:'strike',target:enemies[0].id};}const r=E.act(s,command);assert.equal(r.ok,true,r.error);
 }assert(turns<500);return turns;}
test('the full eight-encounter campaign is winnable with legal actions and story choices',()=>{
 const s=E.createRun('Campaign tester','warrior');let total=0,stories=0;
 for(let i=0;i<8;i++){total+=playBattle(s);assert.notEqual(s.phase,'defeat','failed encounter '+(i+1));assert.equal(s.stage,i);assert(s.reward.gold>0);if(i<7){assert.equal(s.phase,'victory');const gold=s.gold;assert.equal(E.act(s,{type:'focus'}).ok,false);assert.equal(s.gold,gold);E.travel(s);if(s.phase==='story'){stories++;assert.equal(E.choose(s,'accept'),true);}}}
 assert.equal(stories,2);assert.equal(s.phase,'complete');assert.equal(s.history.length,8);assert.equal(s.party[0].job,'rogue');assert.equal(s.party[0].level,5);assert(total>30);
 const alt=E.createRun();alt.phase='story';alt.stage=1;alt.choice='stranger';const hp=alt.party[0].maxHp;E.choose(alt,'decline');assert.equal(alt.party[0].job,'warrior');assert.equal(alt.party[0].maxHp,hp+8);alt.phase='story';alt.stage=4;alt.choice='shrine';const gold=alt.gold,embers=alt.embers;E.choose(alt,'decline');assert.equal(alt.gold,gold+50);assert.equal(alt.embers,embers+1);
});

test('camp supplies can be bought only after victory with sufficient gold',()=>{const s=E.createRun();assert.equal(E.buyTonic(s),false);s.phase='victory';s.gold=19;assert.equal(E.buyTonic(s),false);s.gold=24;const count=s.potions;assert.equal(E.buyTonic(s),true);assert.equal(s.gold,4);assert.equal(s.potions,count+1);assert.equal(E.buyTonic(s),false);});
