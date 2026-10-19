(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./hero-options'):root.HeroOptions);if(typeof module==='object'&&module.exports)module.exports=api;else root.DungeonCampaign=api;})(typeof globalThis!=='undefined'?globalThis:this,function(P){
'use strict';
const WORLDS=[{name:'The Greenwood',biome:'forest',boss:'The Briar Sovereign'},{name:'The Ashen Dungeon',biome:'crypt',boss:'The Iron Warden'},{name:'The Hollow Depths',biome:'throne',boss:'The Hollow King'}];
const ENEMIES={
 slime:{name:'Moss Slime',hp:24,atk:5,speed:3,color:'#94bc63',kind:'slime'},rat:{name:'Wild Rat',hp:21,atk:6,speed:8,color:'#a49b94',kind:'rat'},bandit:{name:'Road Bandit',hp:38,atk:8,speed:5,color:'#b86e52',kind:'humanoid'},wisp:{name:'Lost Wisp',hp:27,atk:7,speed:7,color:'#80c3cc',kind:'wisp'},golem:{name:'Stone Warden',hp:76,atk:12,speed:2,color:'#858a77',kind:'golem'},
 wolf:{name:'Timber Wolf',hp:33,atk:9,speed:10,color:'#9eac9c',kind:'wolf',behavior:'pounce'},spider:{name:'Briar Spider',hp:27,atk:6,speed:8,color:'#6f8f5b',kind:'spider',behavior:'poison'},boar:{name:'Bristleback',hp:52,atk:11,speed:3,color:'#8f7054',kind:'boar',behavior:'charge'},mushroom:{name:'Sporecap',hp:34,atk:6,speed:3,color:'#b98a6a',kind:'mushroom',behavior:'poison'},beetle:{name:'Ironbark Beetle',hp:47,atk:7,speed:2,color:'#5c826b',kind:'beetle',behavior:'guard'},archer:{name:'Outlaw Scout',hp:32,atk:9,speed:8,color:'#ada06c',kind:'archer'},shaman:{name:'Root Shaman',hp:40,atk:8,speed:5,color:'#81966b',kind:'mage',behavior:'heal'},treant:{name:'Walking Oak',hp:83,atk:13,speed:2,color:'#897b51',kind:'treant',behavior:'sweep'},briar:{name:'THE BRIAR SOVEREIGN',hp:180,atk:18,speed:5,color:'#72965c',kind:'stag',boss:true,behavior:'sweep'},
 skeleton:{name:'Keep Sentinel',hp:44,atk:10,speed:4,color:'#d6cdb3',kind:'skeleton'},mage:{name:'Ash Cultist',hp:43,atk:12,speed:6,color:'#a595bf',kind:'mage'},bat:{name:'Vault Bat',hp:29,atk:9,speed:11,color:'#867a9e',kind:'bat',behavior:'drain'},mimic:{name:'Hungry Chest',hp:68,atk:14,speed:3,color:'#b1915e',kind:'mimic',behavior:'charge'},armor:{name:'Hollow Armor',hp:72,atk:13,speed:3,color:'#92a1a0',kind:'golem',behavior:'guard'},ratkin:{name:'Scrap Ratkin',hp:42,atk:11,speed:9,color:'#a58b77',kind:'rat',behavior:'poison'},skull:{name:'Lantern Skull',hp:38,atk:12,speed:7,color:'#d7ba81',kind:'skull'},acolyte:{name:'Bone Acolyte',hp:50,atk:10,speed:5,color:'#a891b9',kind:'mage',behavior:'heal'},gargoyle:{name:'Gutter Gargoyle',hp:78,atk:14,speed:4,color:'#86918c',kind:'gargoyle',behavior:'pounce'},revenant:{name:'Chain Revenant',hp:67,atk:14,speed:6,color:'#8bb4ab',kind:'specter',behavior:'drain'},hound:{name:'Cinder Hound',hp:55,atk:13,speed:10,color:'#a66c58',kind:'wolf',behavior:'pounce'},warden:{name:'THE IRON WARDEN',hp:250,atk:23,speed:4,color:'#909786',kind:'king',boss:true,behavior:'charge'},
 crystal:{name:'Fractured Crystal',hp:63,atk:16,speed:3,color:'#b69ad6',kind:'crystal',behavior:'guard'},imp:{name:'Ember Imp',hp:48,atk:15,speed:10,color:'#bf826e',kind:'imp',behavior:'poison'},shade:{name:'Veil Stalker',hp:68,atk:17,speed:9,color:'#8a8aa8',kind:'specter',behavior:'drain'},voidslime:{name:'Void Slime',hp:77,atk:15,speed:3,color:'#a48bc9',kind:'slime',behavior:'poison'},hellhound:{name:'Rift Hound',hp:82,atk:19,speed:9,color:'#9783a2',kind:'wolf',behavior:'pounce'},sentinel:{name:'Obsidian Sentinel',hp:108,atk:19,speed:3,color:'#727c91',kind:'golem',behavior:'guard'},oracle:{name:'Blind Oracle',hp:72,atk:17,speed:6,color:'#bf9db8',kind:'mage',behavior:'heal'},demon:{name:'Rift Brute',hp:120,atk:22,speed:3,color:'#9e7376',kind:'demon',behavior:'sweep'},king:{name:'THE HOLLOW KING',hp:320,atk:27,speed:5,color:'#7d8798',kind:'king',boss:true,behavior:'sweep'}
};
const layouts=[
 [['slime','slime'],['rat','spider','rat'],['wolf','beetle'],['archer','bandit','slime'],['boar','mushroom','spider'],['shaman','wolf','beetle'],['treant','wisp','mushroom'],['archer','boar','spider'],['golem','shaman','wolf'],['briar']],
 [['skeleton','bat','ratkin'],['mimic','skull'],['armor','skeleton','mage'],['gargoyle','bat','bat'],['acolyte','ratkin','revenant'],['hound','skull','mage'],['mimic','armor','bat'],['revenant','acolyte','gargoyle'],['armor','mage','hound'],['warden']],
 [['voidslime','imp','crystal'],['shade','hellhound','wisp'],['sentinel','oracle'],['demon','imp','imp'],['crystal','shade','oracle'],['hellhound','demon','voidslime'],['sentinel','imp','oracle'],['demon','shade','crystal'],['sentinel','oracle','hellhound'],['king']]
];
const titles=[['The Greenwood','Webbed Trail','The Hunting Grounds','Outlaw Crossing','Spore Hollow','The Root Circle','The Walking Grove','The Broken Bridge','The Briar Gate','The Briar Sovereign'],['Below the Keep','A Chest in the Dark','The Silent Watch','The Gutter Roost','The Bone Chapel','The Cinder Kennel','The False Treasury','The Chain Gallery','The Warden’s Door','The Iron Warden'],['Into the Rift','The Veil Crossing','The Crystal Watch','A Crack in the World','The Oracle’s Chamber','The Hungry Road','The Obsidian Gate','The Last Descent','The Throne Approach','The Hollow King']];
const CHAPTERS=WORLDS.flatMap((world,w)=>layouts[w].map((enemies,p)=>({name:titles[w][p],subtitle:p===9?'WORLD BOSS · '+world.name:'Progression '+(p+1)+' of 10 · '+world.name,biome:world.biome,world:w,progress:p+1,boss:p===9,enemies})));
const RAID_BOSSES=['briar','warden','king','treant','gargoyle','demon'];
function encounter(s){if(s.mode!=='raid')return CHAPTERS[s.stage];const level=s.raidLevel,type=RAID_BOSSES[(level-1)%RAID_BOSSES.length],world=(level-1)%3;return {name:ENEMIES[type].name+' · Raid '+level,subtitle:'RAID BOSS '+level+' · Endless ascent',biome:WORLDS[world].biome,world,progress:level,boss:true,enemies:[type]};}
function raidBossStats(level){return {hp:120+60*level+Math.round(12*Math.pow(level,1.3)),atk:10+5*level+Math.floor(level/5)*2};}
const RARITIES={common:{name:'Common',color:'#b4c5a1'},rare:{name:'Rare',color:'#8fc4df'},epic:{name:'Epic',color:'#c2a1e6'}};
const CLASSES={warrior:{name:'Vanguard',hp:88,mp:6,atk:13,speed:6,color:'#d5aa73',skill:'sunder'},ranger:{name:'Wayfarer',hp:72,mp:8,atk:12,speed:9,color:'#91ad85',skill:'volley'},mage:{name:'Arcanist',hp:65,mp:10,atk:11,speed:7,color:'#ac9bc8',skill:'ember'},rogue:{name:'Nightblade',hp:78,mp:8,atk:15,speed:10,color:'#a29ac2',skill:'shadow'}};
for(const [key,extra]of Object.entries(P.CLASS_EXTRAS))CLASSES[key]={...CLASSES[key],...extra};
const SKILLS={...P.SKILLS,universe:{name:'Universe cleave',cost:0,cd:0,description:'Bryan cuts through the universe. 10,000,000 damage to every enemy.',all:true,mult:1},strike:{name:'Strike',cost:0,cd:0,description:'A reliable hit. No focus cost.',mult:1},sunder:{name:'Sundering blow',cost:2,cd:2,description:'A heavy strike for 170% damage.',mult:1.7},volley:{name:'Scatter shot',cost:3,cd:2,description:'Hit every enemy for 85% damage.',mult:.85,all:true},ember:{name:'Ember arc',cost:3,cd:2,description:'Burn every enemy for 105% damage.',mult:1.05,all:true},shadow:{name:'Hidden blade',cost:2,cd:2,description:'A precise strike for 190% damage.',mult:1.9},mend:{name:'Mend',cost:3,cd:2,description:'Restore 30 health to the weakest ally.',heal:30}};
const clone=value=>JSON.parse(JSON.stringify(value));
function hero(id,name,job){const c=CLASSES[job];return {id,name,job,side:'party',kind:'humanoid',hp:c.hp,maxHp:c.hp,mp:c.mp,maxMp:c.mp,atk:c.atk,speed:c.speed,color:c.color,level:1,race:'human',weapon:job==='ranger'?'bow':job==='mage'?'staff':'sword',charge:0,raceCharge:0,appearance:P.appearance({clothes:c.color}),cooldowns:{},guard:false};}
function createRun(name='Adventurer',job='warrior',mode='campaign',options={}){
 if(!Object.hasOwn(CLASSES,job))job='warrior';
 const s={version:5,runId:options.runId||'run-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9),tavernGold:0,mode:mode==='raid'?'raid':'campaign',raidLevel:1,raidBest:0,phase:'battle',stage:mode==='raid'?9:0,round:1,party:[hero('hero',String(name).trim().slice(0,18)||'Adventurer',job),hero('rowan','Rowan','ranger'),hero('mira','Mira','mage')],enemies:[],order:[],cursor:0,gold:0,potions:4,embers:1,xp:0,log:[],history:[],reward:null,choice:null,seed:Number.isInteger(options.seed)?options.seed>>>0:Math.floor(Math.random()*4294967296),inventory:[],campRested:false,stories:[]};
 s.party[1]=companion(s,'rowan');s.party[2]=companion(s,'mira');if(options.profile)applyLoadout(s.party[0],options.profile);
 startBattle(s);return s;
}
function companion(s,id){
 const names=['Juniper','Orin','Sable','Finch','Bram','Aster','Tala','Nico','Wren','Cedar','Lyra','Ember','Kael','Pip','Vesper','Rook','Sol','Thistle','Moss','Iris'];const jobs=['warrior','ranger','mage','rogue'];
 let name=names[Math.floor(nextRandom(s)*names.length)];if(s.party.some(p=>p.id!==id&&p.name===name))name+=' '+['Ash','Vale','Reed'][Math.floor(nextRandom(s)*3)];const p=hero(id,name,jobs[Math.floor(nextRandom(s)*jobs.length)]);
 const skins=['#e4c7aa','#bd967c','#815d4d','#d6b58f','#a97c61'],colors=['#6b8d78','#a77b68','#7b7caa','#bdac7f','#617d92','#aa8292'];p.appearance=P.appearance({skin:skins[Math.floor(nextRandom(s)*skins.length)],clothes:colors[Math.floor(nextRandom(s)*colors.length)],pants:colors[Math.floor(nextRandom(s)*colors.length)],hairColor:['#40362e','#c2ac7a','#7d4f3b','#a4a19b'][Math.floor(nextRandom(s)*4)],hair:['short','long','spiky','bald'][Math.floor(nextRandom(s)*4)],face:['calm','smile','fierce','scar'][Math.floor(nextRandom(s)*4)],outfit:['traveler','tunic','coat'][Math.floor(nextRandom(s)*3)]});p.color=p.appearance.clothes;return p;
}
function applyLoadout(p,value){const load=P.profile(value),c=CLASSES[load.job],old=CLASSES[p.job]||CLASSES.warrior,hpRatio=p.hp/p.maxHp,mpRatio=p.mp/p.maxMp;p.maxHp=Math.max(1,p.maxHp-old.hp+c.hp);p.hp=Math.min(p.maxHp,Math.round(p.maxHp*hpRatio));p.atk=p.atk-old.atk+c.atk;p.job=load.job;p.speed=c.speed;p.maxMp=c.mp;p.mp=Math.min(p.maxMp,Math.round(p.maxMp*mpRatio));p.race=load.race;p.weapon=load.weapon;p.appearance=load.appearance;p.color=load.appearance.clothes;return p;}
function weaponFor(s,p){const item=(s.inventory||[]).find(i=>i.owner===p.id&&i.slot==='weapon');return P.WEAPONS[item?.weaponKey||p.weapon]||P.WEAPONS.sword;}
function abilities(s,p){return ['strike',CLASSES[p.job].skill,...(['mage','paladin'].includes(p.job)?['mend']:[]),weaponFor(s,p).skill,CLASSES[p.job].ultimate,P.RACES[p.race||'human'].ultimate,...(p.name.trim().toLowerCase()==='bryan'?['universe']:[])];}
function living(s,side){return (side==='party'?s.party:s.enemies).filter(u=>u.hp>0);}
function unit(s,id){return [...s.party,...s.enemies].find(u=>u.id===id);}
function active(s){return s.phase==='battle'?unit(s,s.order[s.cursor]):null;}
function note(s,text){s.log.push(text);s.log=s.log.slice(-30);}
function nextRandom(s){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296;}
function makeOrder(s){return [...living(s,'party'),...living(s,'enemy')].sort((a,b)=>b.speed-a.speed||(a.id<b.id?-1:1)).map(u=>u.id);}
function startBattle(s){
 const chapter=encounter(s);s.decisionKey=null;s.decisionEndsAt=null;s.phase='battle';s.round=1;s.reward=null;s.choice=null;
 s.enemies=chapter.enemies.map((type,i)=>{const d=ENEMIES[type],scale=1+chapter.world*.15+(chapter.progress-1)*.035;return {...d,id:'enemy-'+i,side:'enemy',maxHp:Math.round(d.hp*scale*(d.boss?(chapter.world===2?2.8:2.4):1.65)),hp:Math.round(d.hp*scale*(d.boss?(chapter.world===2?2.8:2.4):1.65)),atk:Math.round(d.atk*scale*(d.boss?(chapter.world===2?1.65:1.4):1.25)),mp:0,maxMp:0,guard:false,cooldowns:{},status:{},enemyType:type};});
 if(s.mode==='raid'){const boss=s.enemies[0],power=raidBossStats(s.raidLevel);Object.assign(boss,{hp:power.hp,maxHp:power.hp,atk:power.atk,boss:true});}
 s.party.forEach(p=>{p.guard=false;p.cooldowns={};p.mp=p.maxMp;p.status={};});
 s.order=makeOrder(s);s.cursor=0;s.log=[];note(s,chapter.name+' — battle begins.');beginTurn(s);
}
function beginTurn(s){const actor=active(s);if(!actor)return;actor.guard=false;if(actor.side==='party'&&actor.race==='elf')actor.mp=Math.min(actor.maxMp,actor.mp+1);for(const k in actor.cooldowns)actor.cooldowns[k]=Math.max(0,actor.cooldowns[k]-1);}
function checkEnd(s){
 if(!living(s,'party').length){s.phase='defeat';note(s,'The party has fallen. The road is not over.');return true;}
 if(!living(s,'enemy').length){
  const gold=s.mode==='raid'?40+22*s.raidLevel:24+s.stage*11,xp=s.mode==='raid'?30+15*s.raidLevel:20+s.stage*8;s.gold+=gold;s.tavernGold=(s.tavernGold||0)+gold;s.xp+=xp;s.potions+=1;
  if(s.mode==='raid')s.raidBest=Math.max(s.raidBest,s.raidLevel);
  const level=s.mode==='raid'?s.raidLevel+1:1+Math.floor((s.stage+1)/2);let leveled=false;
  s.party.forEach(p=>{if(p.level<level){const gain=level-p.level;p.level=level;p.maxHp+=gain*12;p.atk+=gain*3;leveled=true;}});
  const loot=rollLoot(s);s.inventory.push(...loot);s.campRested=false;
  s.reward={gold,xp,potion:1,leveled,boss:encounter(s).boss,loot:loot.map(i=>i.id)};s.history.push(encounter(s).name);s.phase='camp';note(s,'Victory. Your party returns to the campfire.');return true;
 }
 return false;
}
function endTurn(s){
 if(checkEnd(s))return;
 do{s.cursor++;if(s.cursor>=s.order.length){s.round++;s.order=makeOrder(s);s.cursor=0;note(s,'Round '+s.round+'.');}}while(!active(s)||active(s).hp<=0);
 beginTurn(s);
}
function damage(s,source,target,amount,events){const armor=target.side==='party'?stats(s,target).def:0;const dealt=Math.min(target.hp,Math.max(1,Math.round(Math.max(1,amount-armor)*(target.guard?.5:1))));target.hp-=dealt;if(target.side==='party'){target.charge=Math.min(100,(target.charge||0)+15);target.raceCharge=Math.min(100,(target.raceCharge||0)+15);}if(source.race==='revenant'&&source.hp>0&&source.side==='party'){const heal=Math.min(source.maxHp-source.hp,Math.ceil(dealt*.15));if(heal>0){source.hp+=heal;events.push({type:'heal',target:source.id,amount:heal});}}events.push({type:'damage',target:target.id,source:source.id,amount:dealt,guarded:!!target.guard});note(s,source.name+' hits '+target.name+' for '+dealt+(target.guard?' (guarded).':'.'));if(!target.hp)note(s,target.name+' falls.');}
function act(s,command){
 const actor=active(s);if(!actor||actor.side!=='party')return {ok:false,error:'Wait for your party’s turn.'};
 const events=[];
 if(command.type==='focus'){actor.guard=true;const amount=Math.min(3,actor.maxMp-actor.mp);actor.mp+=amount;note(s,actor.name+' focuses: +'+amount+' focus and guards until their next turn.');events.push({type:'focus',target:actor.id,amount});}
 else if(command.type==='potion'){
  const target=unit(s,command.target);
  if(!s.potions)return {ok:false,error:'No healing tonics left.'};
  if(!target||target.side!=='party'||target.hp<=0||target.hp>=target.maxHp)return {ok:false,error:'Choose an injured, standing ally.'};
  s.potions--;const amount=Math.min(tonicHeal(s),target.maxHp-target.hp);target.hp+=amount;events.push({type:'heal',target:target.id,amount});note(s,actor.name+' restores '+amount+' health to '+target.name+'.');
 }else if(command.type==='revive'){
  const target=unit(s,command.target);if(!s.embers)return {ok:false,error:'No revival embers left.'};
  if(!target||target.side!=='party'||target.hp>0)return {ok:false,error:'Choose a fallen ally.'};
  s.embers--;target.hp=Math.ceil(target.maxHp*.5);events.push({type:'heal',target:target.id,amount:target.hp});note(s,actor.name+' brings '+target.name+' back to the fight.');
 }else if(command.type==='skill'){
  const allowed=abilities(s,actor);
  const key=command.skill,skill=SKILLS[key];if(!skill||!allowed.includes(key))return {ok:false,error:'That technique is not available.'};
  if(skill.ultimate&&(actor.charge||0)<100||skill.raceUltimate&&(actor.raceCharge||0)<100)return {ok:false,error:'Your ultimate is still charging.'};
  if(actor.mp<skill.cost)return {ok:false,error:'Not enough focus. Use Focus to recover.'};
  if(actor.cooldowns[key]>0)return {ok:false,error:'That technique is recovering.'};
  const target=unit(s,command.target);
  if(!skill.heal&&!skill.all&&(!target||target.side!=='enemy'||target.hp<=0))return {ok:false,error:'Choose a standing enemy.'};
  actor.mp-=skill.cost;if(skill.ultimate)actor.charge=0;if(skill.raceUltimate)actor.raceCharge=0;if(skill.cd)actor.cooldowns[key]=skill.cd+1;
  if(skill.heal){const allies=skill.healAll?living(s,'party'):[living(s,'party').sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]];for(const ally of allies){const amount=Math.min(skill.heal+Math.max(0,actor.level-1)*2,ally.maxHp-ally.hp);ally.hp+=amount;if(skill.shield)ally.guard=true;events.push({type:'heal',target:ally.id,amount});}note(s,actor.name+' uses '+skill.name+'.');}
  else if(key==='universe'){living(s,'enemy').forEach(t=>{t.hp=Math.max(0,t.hp-10000000);events.push({type:'damage',target:t.id,source:actor.id,amount:10000000,guarded:false});});note(s,actor.name+' cleaves the universe.');}
  else{for(const t of (skill.all?living(s,'enemy'):[target])){damage(s,actor,t,stats(s,actor).atk*skill.mult,events);if(t.hp>0&&(skill.burn||skill.chill)){t.status=t.status||{};if(skill.burn)t.status.burn=2;if(skill.chill)t.status.chill=2;}}if(skill.shield)actor.guard=true;if(skill.drain){const amount=Math.min(actor.maxHp-actor.hp,Math.ceil(events.filter(e=>e.type==='damage').reduce((n,e)=>n+e.amount,0)*.35));actor.hp+=amount;if(amount)events.push({type:'heal',target:actor.id,amount});}}
 }else return {ok:false,error:'Choose an action.'};
 if(!SKILLS[command.skill]?.ultimate)actor.charge=Math.min(100,(actor.charge||0)+25);if(!SKILLS[command.skill]?.raceUltimate)actor.raceCharge=Math.min(100,(actor.raceCharge||0)+25);
 poisonTick(s,actor,events);
 const result={ok:true,actor:actor.id,action:command.type,skill:command.skill||null,events};endTurn(s);return result;
}
function randomAct(s){
 const actor=active(s);if(!actor||actor.side!=='party')return {ok:false,error:'Not a player turn.'};const enemies=living(s,'enemy'),choices=[{type:'focus'}];
 for(const key of abilities(s,actor)){const skill=SKILLS[key];if(actor.mp<skill.cost||actor.cooldowns[key]>0||skill.ultimate&&(actor.charge||0)<100||skill.raceUltimate&&(actor.raceCharge||0)<100)continue;if(skill.heal||skill.all)choices.push({type:'skill',skill:key});else for(const target of enemies)choices.push({type:'skill',skill:key,target:target.id});}
 return act(s,choices[Math.floor(nextRandom(s)*choices.length)]);
}
function botAct(s){
 const a=active(s);if(!a||a.side!=='party')return {ok:false,error:'Not a companion turn.'};
 const weak=living(s,'party').sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],fallen=s.party.find(p=>p.hp<=0);let command;
 if(fallen&&s.embers)command={type:'revive',target:fallen.id};
 else if(weak.hp<weak.maxHp*.4&&s.potions)command={type:'potion',target:weak.id};
 else if(['mage','paladin'].includes(a.job)&&weak.hp<weak.maxHp*.65&&a.mp>=3&&!a.cooldowns.mend)command={type:'skill',skill:'mend'};
 else if((a.charge||0)>=100)command={type:'skill',skill:CLASSES[a.job].ultimate,target:living(s,'enemy')[0]?.id};
 else{const key=CLASSES[a.job].skill,target=living(s,'enemy').sort((a,b)=>a.hp-b.hp)[0]?.id;command=a.mp<SKILLS[key].cost?{type:'focus'}:{type:'skill',skill:a.cooldowns[key]?'strike':key,target};}
 return act(s,command);
}
function enemyAct(s){
 const actor=active(s);if(!actor||actor.side!=='enemy')return {ok:false,error:'Not an enemy turn.'};
 const targets=living(s,'party'),target=targets[Math.floor(nextRandom(s)*targets.length)],events=[];actor.turns=(actor.turns||0)+1;
 let skill=['mage','wisp','skull','crystal','specter','imp'].includes(actor.kind)?'ember':actor.kind==='archer'?'volley':actor.boss||['golem','treant','demon','boar'].includes(actor.kind)?'sunder':'strike';
 const injured=living(s,'enemy').filter(e=>e.hp<e.maxHp*.7).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
 const baseAtk=actor.atk;if(actor.status?.chill)actor.atk=Math.round(actor.atk*.65);
 if(actor.behavior==='heal'&&injured&&actor.turns%2){const amount=Math.min(18+encounter(s).world*8,injured.maxHp-injured.hp);injured.hp+=amount;events.push({type:'heal',target:injured.id,amount});note(s,actor.name+' restores '+amount+' health to '+injured.name+'.');skill='mend';}
 else if(actor.behavior==='guard'&&actor.turns%3===1){actor.guard=true;events.push({type:'focus',target:actor.id,amount:0});note(s,actor.name+' braces behind its armor.');skill='guard';}
 else if(actor.behavior==='charge'&&actor.turns%3===1){actor.charging=true;events.push({type:'focus',target:actor.id,amount:0});note(s,actor.name+' is charging a heavy attack. Guard before its next turn!');skill='guard';}
 else {
  const enrage=actor.boss&&actor.hp<actor.maxHp*.4,sweep=actor.behavior==='sweep'&&(actor.turns%2===0||enrage);
  if(sweep){note(s,actor.name+' unleashes a sweeping attack!');targets.forEach(t=>damage(s,actor,t,actor.atk*(enrage?.85:.65),events));}
  else{damage(s,actor,target,actor.atk*(actor.charging?1.8:actor.behavior==='pounce'&&actor.turns%3===0?1.3:1),events);actor.charging=false;}
  if(actor.behavior==='poison'&&target.hp>0){target.status=target.status||{};target.status.poison=2;note(s,target.name+' is poisoned for two actions.');}
  if(actor.behavior==='drain'){const amount=Math.min(Math.ceil(actor.atk*.5),actor.maxHp-actor.hp);if(amount>0){actor.hp+=amount;events.push({type:'heal',target:actor.id,amount});}}
 }
 actor.atk=baseAtk;if(actor.status?.chill)actor.status.chill--;
 poisonTick(s,actor,events);
 const result={ok:true,actor:actor.id,action:skill==='guard'?'focus':'enemy',skill,events};endTurn(s);return result;
}
function poisonTick(s,actor,events){if(actor.status?.burn&&actor.hp>0){const amount=Math.min(actor.hp,Math.max(4,Math.ceil(actor.maxHp*.05)));actor.hp-=amount;actor.status.burn--;events.push({type:'damage',target:actor.id,source:actor.id,amount,status:'burn'});}if(actor.status?.poison&&actor.hp>0){const amount=Math.min(actor.hp,3+encounter(s).world*2);actor.hp-=amount;actor.status.poison--;events.push({type:'damage',target:actor.id,source:actor.id,amount,guarded:false,status:'poison'});note(s,actor.name+' takes '+amount+' poison damage.');}}
function tonicHeal(s){return s.mode==='raid'?40+s.raidLevel*8:40+Math.floor(s.stage/10)*20;}
function stats(s,p){const gear=(s.inventory||[]).filter(i=>i.owner===p.id);return {atk:p.atk+gear.reduce((n,i)=>n+i.atk,0)+(gear.some(i=>i.slot==='weapon')?0:P.WEAPONS[p.weapon]?.atk||0)+(p.race==='dragonborn'?3:0),def:gear.reduce((n,i)=>n+i.def,0)+(p.race==='dwarf'?2:0)};}
function rollLoot(s){
 const boss=encounter(s).boss,count=boss?2:1,tier=s.mode==='raid'?s.raidLevel:1+Math.floor(s.stage/10);return Array.from({length:count},(_,i)=>{
  const r=nextRandom(s),slot=['weapon','armor','charm'][Math.floor(nextRandom(s)*3)],rarity=boss?'epic':r>.77?'rare':'common',quality=rarity==='epic'?3:rarity==='rare'?2:1;
  const names={weapon:['Traveler’s Blade','Ashwood Edge','Riftforged Steel'],armor:['Ironbark Vest','Keepkeeper Mail','Obsidian Mantle'],charm:['Mossbound Charm','Lantern Sigil','Hollow Star']};
  const weaponKey=slot==='weapon'?Object.keys(P.WEAPONS)[Math.floor(nextRandom(s)*Object.keys(P.WEAPONS).length)]:null;
  return {id:'loot-'+s.stage+'-'+i+'-'+s.seed,name:(slot==='weapon'?P.WEAPONS[weaponKey].name:names[slot][s.mode==='raid'?(s.raidLevel-1)%3:tier-1])+(s.mode==='raid'?' · Raid '+tier:''),tier,slot,rarity,weaponKey,atk:slot==='weapon'?tier*quality+1:slot==='charm'?tier:0,def:slot==='armor'?tier*quality:slot==='charm'?(s.mode==='raid'?tier+quality:quality):0,price:10+tier*quality*8,owner:null,upgrades:0};
 });
}
function campAction(s,command){
 if(s.phase!=='camp')return {ok:false,error:'Return to the campfire first.'};
 const item=s.inventory.find(i=>i.id===command.item),hero=s.party.find(p=>p.id===command.hero);
 if(command.type==='equip-best'){
  if(!hero)return {ok:false,error:'Choose an adventurer.'};
  for(const slot of ['weapon','armor','charm']){const candidates=s.inventory.filter(i=>i.slot===slot&&(!i.owner||i.owner===hero.id)).sort((a,b)=>(b.atk+b.def)-(a.atk+a.def)),best=candidates[0],current=s.inventory.find(i=>i.slot===slot&&i.owner===hero.id);if(best&&best.atk+best.def>(current?current.atk+current.def:slot==='weapon'?(P.WEAPONS[hero.weapon]?.atk||0):0)){if(current)current.owner=null;best.owner=hero.id;}}
 }else if(command.type==='equip'){
  if(!item||!hero)return {ok:false,error:'Choose a piece of gear and an adventurer.'};
  s.inventory.filter(i=>i.owner===hero.id&&i.slot===item.slot).forEach(i=>i.owner=null);item.owner=hero.id;
 }else if(command.type==='unequip'){if(!item)return {ok:false,error:'Gear not found.'};item.owner=null;}
 else if(command.type==='sell'){if(!item||item.owner)return {ok:false,error:'Unequip an item before selling it.'};s.gold+=item.price;s.inventory=s.inventory.filter(i=>i!==item);}
 else if(command.type==='upgrade'){if(!item)return {ok:false,error:'Choose gear to upgrade.'};const cost=25+item.upgrades*20;if(item.upgrades>=3||s.gold<cost)return {ok:false,error:item.upgrades>=3?'This item is fully upgraded.':'Not enough gold.'};s.gold-=cost;item.upgrades++;if(item.slot==='weapon')item.atk+=2;else item.def++;item.price+=10;}
 else if(command.type==='use-tonic'||command.type==='use-ember'){if(!hero)return {ok:false,error:'Choose an adventurer.'};if(command.type==='use-tonic'){if(!s.potions||hero.hp<=0||hero.hp>=hero.maxHp)return {ok:false,error:'Choose an injured standing adventurer with a tonic available.'};s.potions--;hero.hp=Math.min(hero.maxHp,hero.hp+tonicHeal(s));}else{if(!s.embers||hero.hp>0)return {ok:false,error:'Choose a fallen adventurer with an ember available.'};s.embers--;hero.hp=Math.ceil(hero.maxHp*.5);}}
 else if(command.type==='rest'){if(s.mode==='raid'||s.stage>=29||s.stage%10===8)return {ok:false,error:'No spare stage remains before this boss. Use healing items.'};if(s.campRested)return {ok:false,error:'Your party has already rested.'};s.party.forEach(p=>{p.hp=p.maxHp;p.mp=p.maxMp;p.status={};});s.campRested=true;s.restSpent=true;note(s,'Resting consumes the next stage. No battle rewards are earned.');}
 else if(command.type==='buy-tonic'||command.type==='buy-ember'){const price=command.type==='buy-tonic'?20:80;if(s.gold<price)return {ok:false,error:'Not enough gold.'};s.gold-=price;if(price===20)s.potions++;else s.embers++;}
 else return {ok:false,error:'Choose a camp action.'};
 return {ok:true};
}
function travel(s){
 if(s.phase!=='camp')return false;
 if(s.mode==='raid'){s.raidLevel++;s.stage=((s.raidLevel-1)%3)*10+9;startBattle(s);return true;}
 if(s.stage===CHAPTERS.length-1){s.phase='complete';return true;}
 if([1,4,7,11,14,17,22,26].includes(s.stage)&&!s.stories.includes(s.stage)){s.phase='story';s.choice=s.stage===1?'stranger':s.stage===14?'shrine':'crossroads';return true;}
 s.stage+=s.restSpent?2:1;s.restSpent=false;startBattle(s);return true;
}
function choose(s,choice){
 if(s.phase!=='story'||!['accept','decline'].includes(choice))return false;
 if(s.choice==='stranger'){
  if(choice==='accept'){const p=s.party[0],c=CLASSES.rogue;p.job='rogue';p.atk+=3;p.speed=c.speed;p.color=c.color;p.maxMp=Math.max(p.maxMp,8);}
  else s.party.forEach(p=>{p.maxHp+=8;});
 }else if(s.choice==='crossroads'){if(choice==='accept'){s.potions+=2;s.gold+=35;}else s.party.forEach(p=>{p.atk+=1;p.maxHp+=6;});
 }else if(choice==='accept'){s.potions+=3;}else{s.gold+=50;s.embers++;}
 s.lastChoice={kind:s.choice,choice};s.stories.push(s.stage);s.stage+=s.restSpent?2:1;s.restSpent=false;startBattle(s);return true;
}
function buyTonic(s){return campAction(s,{type:'buy-tonic'}).ok;}
function retry(s){if(s.phase!=='defeat')return false;s.party.forEach(p=>{p.hp=p.maxHp;p.mp=p.maxMp;});s.potions=Math.max(2,s.potions);startBattle(s);return true;}
function restore(value){
 try{const s=typeof value==='string'?JSON.parse(value):clone(value);
 if(s?.version===4){s.version=5;s.stage=s.phase==='story'&&s.choice==='shrine'?14:s.stage<4?s.stage:s.stage<7?s.stage+6:19;s.inventory=[];s.campRested=false;s.stories=[];if(['victory','complete'].includes(s.phase)){s.phase='camp';s.reward=s.reward||{gold:0,xp:0};s.reward.loot=[];s.reward.boss=encounter(s).boss;}s.party.forEach(p=>p.status={});}
 if(!s||s.version!==5||!Number.isInteger(s.stage)||s.stage<0||s.stage>=CHAPTERS.length||!['battle','camp','story','defeat','complete'].includes(s.phase))return null;
 s.mode=s.mode||'campaign';s.raidLevel=s.raidLevel||1;s.raidBest=s.raidBest||0;
 if(!['campaign','raid'].includes(s.mode)||!Number.isSafeInteger(s.raidLevel)||s.raidLevel<1||!Number.isSafeInteger(s.raidBest)||s.raidBest<0)return null;
 if(!Array.isArray(s.inventory)||!Array.isArray(s.stories))return null;
 if(!Array.isArray(s.party)||s.party.length!==3||!Array.isArray(s.enemies)||!Array.isArray(s.order)||!Array.isArray(s.log)||!Array.isArray(s.history))return null;
 const all=[...s.party,...s.enemies];if(all.some(p=>!p||!Number.isFinite(p.hp)||!Number.isFinite(p.maxHp)||p.hp<0||p.hp>p.maxHp||!p.cooldowns))return null;
 if(s.party.some(p=>!CLASSES[p.job]||!Number.isFinite(p.mp)||!Number.isFinite(p.maxMp)))return null;
 s.party.forEach(p=>{p.race=Object.hasOwn(P.RACES,p.race)?p.race:'human';p.weapon=Object.hasOwn(P.WEAPONS,p.weapon)?p.weapon:(p.job==='mage'?'staff':p.job==='ranger'?'bow':'sword');p.appearance=P.appearance(p.appearance||{clothes:p.color});p.charge=Math.max(0,Math.min(100,Number(p.charge)||0));p.raceCharge=Math.max(0,Math.min(100,Number(p.raceCharge)||0));});s.tavernGold=s.tavernGold||0;
 if(s.phase==='battle'&&(!active(s)||active(s).hp<=0))return null;
 return s;
 }catch{return null;}
}
return {P,hero,companion,applyLoadout,weaponFor,abilities,encounter,raidBossStats,RAID_BOSSES,WORLDS,CHAPTERS,ENEMIES,RARITIES,CLASSES,SKILLS,stats,tonicHeal,campAction,createRun,randomAct,botAct,active,unit,living,act,enemyAct,travel,choose,buyTonic,retry,restore};
});
