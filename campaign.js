(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DungeonCampaign=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const CHAPTERS=[
 {name:'The Greenwood',subtitle:'A small beginning',biome:'forest',enemies:['slime','slime'],text:'The old road has gone quiet. Find out what is keeping the village caravans from coming home.'},
 {name:'Trouble on the trail',subtitle:'Not every traveler is friendly',biome:'forest',enemies:['bandit','rat','rat']},
 {name:'The hollow grove',subtitle:'Something is waking',biome:'forest',enemies:['wisp','slime','bandit']},
 {name:'Guardian of the gate',subtitle:'The forest remembers',biome:'forest',enemies:['golem','wisp']},
 {name:'Below the Keep',subtitle:'Leave the daylight behind',biome:'crypt',enemies:['skeleton','skeleton','rat']},
 {name:'The candle vault',subtitle:'A light that should have gone out',biome:'crypt',enemies:['mage','skeleton','wisp']},
 {name:'The forgotten guard',subtitle:'One last watch',biome:'crypt',enemies:['golem','mage','skeleton']},
 {name:'The Hollow King',subtitle:'Every road led here',biome:'throne',enemies:['king','skeleton','wisp']}
];
const ENEMIES={slime:{name:'Moss Slime',hp:24,atk:5,speed:3,color:'#94bc63',kind:'slime'},rat:{name:'Wild Rat',hp:21,atk:6,speed:8,color:'#a49b94',kind:'rat'},bandit:{name:'Road Bandit',hp:38,atk:8,speed:5,color:'#b86e52',kind:'humanoid'},wisp:{name:'Lost Wisp',hp:27,atk:7,speed:7,color:'#80c3cc',kind:'wisp'},golem:{name:'Stone Warden',hp:76,atk:12,speed:2,color:'#858a77',kind:'golem'},skeleton:{name:'Keep Sentinel',hp:40,atk:9,speed:4,color:'#d6cdb3',kind:'skeleton'},mage:{name:'Ash Cultist',hp:37,atk:12,speed:6,color:'#a595bf',kind:'mage'},king:{name:'THE HOLLOW KING',hp:180,atk:16,speed:5,color:'#6a7165',kind:'king'}};
const CLASSES={warrior:{name:'Vanguard',hp:88,mp:6,atk:13,speed:6,color:'#d5aa73',skill:'sunder'},ranger:{name:'Wayfarer',hp:72,mp:8,atk:12,speed:9,color:'#91ad85',skill:'volley'},mage:{name:'Arcanist',hp:65,mp:10,atk:11,speed:7,color:'#ac9bc8',skill:'ember'},rogue:{name:'Nightblade',hp:78,mp:8,atk:15,speed:10,color:'#a29ac2',skill:'shadow'}};
const SKILLS={strike:{name:'Strike',cost:0,cd:0,description:'A reliable hit. No focus cost.',mult:1},sunder:{name:'Sundering blow',cost:2,cd:2,description:'A heavy strike for 170% damage.',mult:1.7},volley:{name:'Scatter shot',cost:3,cd:2,description:'Hit every enemy for 85% damage.',mult:.85,all:true},ember:{name:'Ember arc',cost:3,cd:2,description:'Burn every enemy for 105% damage.',mult:1.05,all:true},shadow:{name:'Hidden blade',cost:2,cd:2,description:'A precise strike for 190% damage.',mult:1.9},mend:{name:'Mend',cost:3,cd:2,description:'Restore 30 health to the weakest ally.',heal:30}};
const clone=value=>JSON.parse(JSON.stringify(value));
function hero(id,name,job){const c=CLASSES[job];return {id,name,job,side:'party',kind:'humanoid',hp:c.hp,maxHp:c.hp,mp:c.mp,maxMp:c.mp,atk:c.atk,speed:c.speed,color:c.color,level:1,cooldowns:{},guard:false};}
function createRun(name='Adventurer',job='warrior'){
 if(!CLASSES[job]||job==='rogue')job='warrior';
 const s={version:4,phase:'battle',stage:0,round:1,party:[hero('hero',String(name).trim().slice(0,18)||'Adventurer',job),hero('rowan','Rowan','ranger'),hero('mira','Mira','mage')],enemies:[],order:[],cursor:0,gold:0,potions:4,embers:1,xp:0,log:[],history:[],reward:null,choice:null,seed:9417};
 startBattle(s);return s;
}
function living(s,side){return (side==='party'?s.party:s.enemies).filter(u=>u.hp>0);}
function unit(s,id){return [...s.party,...s.enemies].find(u=>u.id===id);}
function active(s){return s.phase==='battle'?unit(s,s.order[s.cursor]):null;}
function note(s,text){s.log.push(text);s.log=s.log.slice(-30);}
function nextRandom(s){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296;}
function makeOrder(s){return [...living(s,'party'),...living(s,'enemy')].sort((a,b)=>b.speed-a.speed||(a.id<b.id?-1:1)).map(u=>u.id);}
function startBattle(s){
 const chapter=CHAPTERS[s.stage];s.phase='battle';s.round=1;s.reward=null;s.choice=null;
 s.enemies=chapter.enemies.map((type,i)=>{const d=ENEMIES[type],scale=1+s.stage*.055;return {...d,id:'enemy-'+i,side:'enemy',maxHp:Math.round(d.hp*scale),hp:Math.round(d.hp*scale),atk:Math.round(d.atk*scale),mp:0,maxMp:0,guard:false,cooldowns:{}};});
 s.party.forEach(p=>{p.guard=false;p.cooldowns={};p.mp=p.maxMp;});
 s.order=makeOrder(s);s.cursor=0;s.log=[];note(s,chapter.name+' — battle begins.');beginTurn(s);
}
function beginTurn(s){const actor=active(s);if(!actor)return;actor.guard=false;for(const k in actor.cooldowns)actor.cooldowns[k]=Math.max(0,actor.cooldowns[k]-1);}
function checkEnd(s){
 if(!living(s,'party').length){s.phase='defeat';note(s,'The party has fallen. The road is not over.');return true;}
 if(!living(s,'enemy').length){
  const gold=24+s.stage*11,xp=20+s.stage*8;s.gold+=gold;s.xp+=xp;s.potions+=1;
  const level=1+Math.floor((s.stage+1)/2);let leveled=false;
  s.party.forEach(p=>{if(p.level<level){const gain=level-p.level;p.level=level;p.maxHp+=gain*12;p.atk+=gain*3;leveled=true;}p.hp=Math.min(p.maxHp,Math.max(p.hp,1)+Math.round(p.maxHp*.35));p.mp=p.maxMp;});
  s.reward={gold,xp,potion:1,leveled};s.history.push(CHAPTERS[s.stage].name);s.phase=s.stage===CHAPTERS.length-1?'complete':'victory';note(s,'Victory. The road ahead is open.');return true;
 }
 return false;
}
function endTurn(s){
 if(checkEnd(s))return;
 do{s.cursor++;if(s.cursor>=s.order.length){s.round++;s.order=makeOrder(s);s.cursor=0;note(s,'Round '+s.round+'.');}}while(!active(s)||active(s).hp<=0);
 beginTurn(s);
}
function damage(s,source,target,amount,events){const dealt=Math.min(target.hp,Math.max(1,Math.round(amount*(target.guard?.5:1))));target.hp-=dealt;events.push({type:'damage',target:target.id,source:source.id,amount:dealt,guarded:!!target.guard});note(s,source.name+' hits '+target.name+' for '+dealt+(target.guard?' (guarded).':'.'));if(!target.hp)note(s,target.name+' falls.');}
function act(s,command){
 const actor=active(s);if(!actor||actor.side!=='party')return {ok:false,error:'Wait for your party’s turn.'};
 const events=[];
 if(command.type==='focus'){actor.guard=true;const amount=Math.min(3,actor.maxMp-actor.mp);actor.mp+=amount;note(s,actor.name+' focuses: +'+amount+' focus and guards until their next turn.');events.push({type:'focus',target:actor.id,amount});}
 else if(command.type==='potion'){
  const target=unit(s,command.target);
  if(!s.potions)return {ok:false,error:'No healing tonics left.'};
  if(!target||target.side!=='party'||target.hp<=0||target.hp>=target.maxHp)return {ok:false,error:'Choose an injured, standing ally.'};
  s.potions--;const amount=Math.min(40,target.maxHp-target.hp);target.hp+=amount;events.push({type:'heal',target:target.id,amount});note(s,actor.name+' restores '+amount+' health to '+target.name+'.');
 }else if(command.type==='revive'){
  const target=unit(s,command.target);if(!s.embers)return {ok:false,error:'No revival embers left.'};
  if(!target||target.side!=='party'||target.hp>0)return {ok:false,error:'Choose a fallen ally.'};
  s.embers--;target.hp=Math.ceil(target.maxHp*.5);events.push({type:'heal',target:target.id,amount:target.hp});note(s,actor.name+' brings '+target.name+' back to the fight.');
 }else if(command.type==='skill'){
  const allowed=['strike',CLASSES[actor.job].skill,...(actor.id==='mira'?['mend']:[])];
  const key=command.skill,skill=SKILLS[key];if(!skill||!allowed.includes(key))return {ok:false,error:'That technique is not available.'};
  if(actor.mp<skill.cost)return {ok:false,error:'Not enough focus. Use Focus to recover.'};
  if(actor.cooldowns[key]>0)return {ok:false,error:'That technique is recovering.'};
  const target=unit(s,command.target);
  if(!skill.heal&&!skill.all&&(!target||target.side!=='enemy'||target.hp<=0))return {ok:false,error:'Choose a standing enemy.'};
  actor.mp-=skill.cost;if(skill.cd)actor.cooldowns[key]=skill.cd+1;
  if(skill.heal){const ally=living(s,'party').sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];const amount=Math.min(skill.heal,ally.maxHp-ally.hp);ally.hp+=amount;events.push({type:'heal',target:ally.id,amount});note(s,actor.name+' mends '+ally.name+' for '+amount+'.');}
  else{(skill.all?living(s,'enemy'):[target]).forEach(t=>damage(s,actor,t,actor.atk*skill.mult,events));}
 }else return {ok:false,error:'Choose an action.'};
 const result={ok:true,actor:actor.id,action:command.type,skill:command.skill||null,events};endTurn(s);return result;
}
function enemyAct(s){
 const actor=active(s);if(!actor||actor.side!=='enemy')return {ok:false,error:'Not an enemy turn.'};
 const targets=living(s,'party'),target=targets[Math.floor(nextRandom(s)*targets.length)],events=[];
 const enraged=actor.kind==='king'&&actor.hp<actor.maxHp*.4;
 if(enraged){note(s,'The Hollow King unleashes a sweeping blow!');targets.forEach(t=>damage(s,actor,t,actor.atk*.7,events));}
 else damage(s,actor,target,actor.atk,events);
 const result={ok:true,actor:actor.id,action:"enemy",skill:["mage","wisp"].includes(actor.kind)?"ember":actor.kind==="king"||actor.kind==="golem"?"sunder":"strike",events};endTurn(s);return result;
}
function travel(s){if(s.phase!=='victory')return false;if([1,4].includes(s.stage)){s.phase='story';s.choice=s.stage===1?'stranger':'shrine';return true;}s.stage++;startBattle(s);return true;}
function choose(s,choice){
 if(s.phase!=='story'||!['accept','decline'].includes(choice))return false;
 if(s.choice==='stranger'){
  if(choice==='accept'){const p=s.party[0],c=CLASSES.rogue;p.job='rogue';p.atk+=3;p.speed=c.speed;p.color=c.color;p.maxMp=Math.max(p.maxMp,8);note(s,p.name+' learns the hidden blade.');}
  else{s.party.forEach(p=>{p.maxHp+=8;p.hp=Math.min(p.maxHp,p.hp+8)});}
 }else if(choice==='accept'){s.party.forEach(p=>{p.hp=p.maxHp;p.mp=p.maxMp});}
 else{s.gold+=50;s.embers++;}
 s.stage++;startBattle(s);return true;
}
function buyTonic(s){if(s.phase!=='victory'||s.gold<20)return false;s.gold-=20;s.potions++;return true;}
function retry(s){if(s.phase!=='defeat')return false;s.party.forEach(p=>{p.hp=p.maxHp;p.mp=p.maxMp});s.potions=Math.max(2,s.potions);startBattle(s);return true;}
function restore(value){
 try{const s=typeof value==='string'?JSON.parse(value):clone(value);
 if(!s||s.version!==4||!Number.isInteger(s.stage)||s.stage<0||s.stage>=CHAPTERS.length||!['battle','victory','story','defeat','complete'].includes(s.phase))return null;
 if(!Array.isArray(s.party)||s.party.length!==3||!Array.isArray(s.enemies)||!Array.isArray(s.order)||!Array.isArray(s.log)||!Array.isArray(s.history))return null;
 const all=[...s.party,...s.enemies];if(all.some(p=>!p||!Number.isFinite(p.hp)||!Number.isFinite(p.maxHp)||p.hp<0||p.hp>p.maxHp||!p.cooldowns))return null;
 if(s.party.some(p=>!CLASSES[p.job]||!Number.isFinite(p.mp)||!Number.isFinite(p.maxMp)))return null;
 if(s.phase==='battle'&&(!active(s)||active(s).hp<=0))return null;
 return s;
 }catch{return null;}
}
return {CHAPTERS,ENEMIES,CLASSES,SKILLS,createRun,active,unit,living,act,enemyAct,travel,choose,buyTonic,retry,restore};
});
