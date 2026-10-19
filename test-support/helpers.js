const assert=require('node:assert/strict'),E=require('../campaign');
function playBattle(s){let turns=0;while(s.phase==='battle'&&turns++<700){const a=E.active(s);if(a.side==='enemy'){assert(E.enemyAct(s).ok);continue;}const weak=E.living(s,'party').sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],fallen=s.party.find(p=>p.hp<=0);let command;
 if(fallen&&s.embers)command={type:'revive',target:fallen.id};else if(weak.hp<weak.maxHp*.4&&s.potions)command={type:'potion',target:weak.id};else if(a.id==='mira'&&weak.hp<weak.maxHp*.6&&a.mp>=3&&!a.cooldowns.mend)command={type:'skill',skill:'mend'};else{const key=E.CLASSES[a.job].skill,skill=E.SKILLS[key],target=E.living(s,'enemy').sort((a,b)=>a.hp-b.hp)[0].id;command=a.mp<skill.cost?{type:'focus'}:{type:'skill',skill:!a.cooldowns[key]?key:'strike',target};}
 const result=E.act(s,command);assert.equal(result.ok,true,result.error);
 }assert(turns<700,'battle must finish');return turns;}
function advanceTo(s,id){let count=0;while(s.phase==='battle'&&E.active(s).id!==id&&count++<80)E.active(s).side==='enemy'?E.enemyAct(s):E.act(s,{type:'focus'});assert.equal(E.active(s)?.id,id);}
function equipBest(s){for(const p of s.party)for(const slot of ['weapon','armor','charm']){const best=s.inventory.filter(i=>i.slot===slot&&(!i.owner||i.owner===p.id)).sort((a,b)=>(b.atk+b.def)-(a.atk+a.def))[0];if(best)E.campAction(s,{type:'equip',hero:p.id,item:best.id});}}
module.exports={E,playBattle,advanceTo,equipBest};
