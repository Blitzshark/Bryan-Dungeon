(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./hero-options'):root.HeroOptions,typeof module==='object'&&module.exports?require('./content'):root.GameContent,typeof module==='object'&&module.exports?require('./routes'):root.RunRoutes,typeof module==='object'&&module.exports?require('./elements'):root.CombatElements);if(typeof module==='object'&&module.exports)module.exports=api;else root.DungeonCampaign=api;})(typeof globalThis!=='undefined'?globalThis:this,function(P,C,G,Elements){
'use strict';
const WORLDS=[{name:'The Greenwood',biome:'forest',boss:'The Briar Sovereign'},{name:'The Ashen Dungeon',biome:'crypt',boss:'The Iron Warden'},{name:'The Hollow Depths',biome:'throne',boss:'The Triune Abyss'}];
const ENEMIES={
 slime:{name:'Moss Slime',hp:24,atk:5,speed:3,color:'#94bc63',kind:'slime'},rat:{name:'Wild Rat',hp:21,atk:6,speed:8,color:'#a49b94',kind:'rat'},bandit:{name:'Road Bandit',hp:38,atk:8,speed:5,color:'#b86e52',kind:'humanoid'},wisp:{name:'Lost Wisp',hp:27,atk:7,speed:7,color:'#80c3cc',kind:'wisp'},golem:{name:'Stone Warden',hp:76,atk:12,speed:2,color:'#858a77',kind:'golem'},
 wolf:{name:'Timber Wolf',hp:33,atk:9,speed:10,color:'#9eac9c',kind:'wolf',behavior:'pounce'},spider:{name:'Briar Spider',hp:27,atk:6,speed:8,color:'#6f8f5b',kind:'spider',behavior:'poison'},boar:{name:'Bristleback',hp:52,atk:11,speed:3,color:'#8f7054',kind:'boar',behavior:'charge'},mushroom:{name:'Sporecap',hp:34,atk:6,speed:3,color:'#b98a6a',kind:'mushroom',behavior:'poison'},beetle:{name:'Ironbark Beetle',hp:47,atk:7,speed:2,color:'#5c826b',kind:'beetle',behavior:'guard'},archer:{name:'Outlaw Scout',hp:32,atk:9,speed:8,color:'#ada06c',kind:'archer'},shaman:{name:'Root Shaman',hp:40,atk:8,speed:5,color:'#81966b',kind:'mage',behavior:'heal'},treant:{name:'Walking Oak',hp:83,atk:13,speed:2,color:'#897b51',kind:'treant',behavior:'sweep'},briar:{name:'THE BRIAR SOVEREIGN',hp:180,atk:18,speed:5,color:'#72965c',kind:'stag',boss:true,behavior:'sweep'},
 skeleton:{name:'Keep Sentinel',hp:44,atk:10,speed:4,color:'#d6cdb3',kind:'skeleton'},mage:{name:'Ash Cultist',hp:43,atk:12,speed:6,color:'#a595bf',kind:'mage'},bat:{name:'Vault Bat',hp:29,atk:9,speed:11,color:'#867a9e',kind:'bat',behavior:'drain'},mimic:{name:'Hungry Chest',hp:68,atk:14,speed:3,color:'#b1915e',kind:'mimic',behavior:'charge'},armor:{name:'Hollow Armor',hp:72,atk:13,speed:3,color:'#92a1a0',kind:'golem',behavior:'guard'},ratkin:{name:'Scrap Ratkin',hp:42,atk:11,speed:9,color:'#a58b77',kind:'rat',behavior:'poison'},skull:{name:'Lantern Skull',hp:38,atk:12,speed:7,color:'#d7ba81',kind:'skull'},acolyte:{name:'Bone Acolyte',hp:50,atk:10,speed:5,color:'#a891b9',kind:'mage',behavior:'heal'},gargoyle:{name:'Gutter Gargoyle',hp:78,atk:14,speed:4,color:'#86918c',kind:'gargoyle',behavior:'pounce'},revenant:{name:'Chain Revenant',hp:67,atk:14,speed:6,color:'#8bb4ab',kind:'specter',behavior:'drain'},hound:{name:'Cinder Hound',hp:55,atk:13,speed:10,color:'#a66c58',kind:'wolf',behavior:'pounce'},warden:{name:'THE IRON WARDEN',hp:250,atk:23,speed:4,color:'#909786',kind:'king',boss:true,behavior:'charge'},
 crystal:{name:'Fractured Crystal',hp:63,atk:16,speed:3,color:'#b69ad6',kind:'crystal',behavior:'guard'},imp:{name:'Ember Imp',hp:48,atk:15,speed:10,color:'#bf826e',kind:'imp',behavior:'poison'},shade:{name:'Veil Stalker',hp:68,atk:17,speed:9,color:'#8a8aa8',kind:'specter',behavior:'drain'},voidslime:{name:'Void Slime',hp:77,atk:15,speed:3,color:'#a48bc9',kind:'slime',behavior:'poison'},hellhound:{name:'Rift Hound',hp:82,atk:19,speed:9,color:'#9783a2',kind:'wolf',behavior:'pounce'},sentinel:{name:'Obsidian Sentinel',hp:108,atk:19,speed:3,color:'#727c91',kind:'golem',behavior:'guard'},oracle:{name:'Blind Oracle',hp:72,atk:17,speed:6,color:'#bf9db8',kind:'mage',behavior:'heal'},demon:{name:'Rift Brute',hp:120,atk:22,speed:3,color:'#9e7376',kind:'demon',behavior:'sweep'},king:{name:'THE HOLLOW KING',hp:320,atk:27,speed:5,color:'#7d8798',kind:'king',boss:true,behavior:'sweep'}
};
Object.assign(ENEMIES,{
 mirrorkin:{name:'Mirror Pilgrim',hp:145,atk:31,speed:8,color:'#a597cc',kind:'humanoid',behavior:'illusion'},jester:{name:'Briar Jester',hp:165,atk:34,speed:11,color:'#c78fae',kind:'humanoid',behavior:'illusion'},lantern:{name:'False Lantern',hp:155,atk:32,speed:7,color:'#8ed3c2',kind:'wisp',behavior:'illusion'},dreammoth:{name:'Dream Moth',hp:130,atk:33,speed:12,color:'#9ca3dc',kind:'bat',behavior:'illusion'},puppet:{name:'Hollow Marionette',hp:220,atk:36,speed:5,color:'#aa90ad',kind:'skeleton',behavior:'guard'},masquerade:{name:'THE MASKED SOVEREIGN',hp:900,atk:48,speed:8,color:'#c19cd8',kind:'king',boss:true,behavior:'illusion'}
});
Object.assign(ENEMIES,C.FOES);ENEMIES.king={...ENEMIES.king,name:'THE TRIUNE ABYSS',kind:'voidentity'};
const SEQUEL=C.CAMPAIGN2;
const layouts=[
 [['slime','slime'],['rat','spider','rat'],['wolf','beetle'],['archer','bandit','slime'],['boar','mushroom','spider'],['shaman','wolf','beetle'],['treant','wisp','mushroom'],['archer','boar','spider'],['golem','shaman','wolf'],['briar']],
 [['skeleton','bat','ratkin'],['mimic','skull'],['armor','skeleton','mage'],['gargoyle','bat','bat'],['acolyte','ratkin','revenant'],['hound','skull','mage'],['mimic','armor','bat'],['revenant','acolyte','gargoyle'],['armor','mage','hound'],['warden']],
 [['voidslime','imp','crystal'],['shade','hellhound','wisp'],['sentinel','oracle'],['demon','imp','imp'],['crystal','shade','oracle'],['hellhound','demon','voidslime'],['sentinel','imp','oracle'],['demon','shade','crystal'],['sentinel','oracle','hellhound'],['king']]
];
const titles=[['The Greenwood','Webbed Trail','The Hunting Grounds','Outlaw Crossing','Spore Hollow','The Root Circle','The Walking Grove','The Broken Bridge','The Briar Gate','The Briar Sovereign'],['Below the Keep','A Chest in the Dark','The Silent Watch','The Gutter Roost','The Bone Chapel','The Cinder Kennel','The False Treasury','The Chain Gallery','The Warden’s Door','The Iron Warden'],['Into the Rift','The Veil Crossing','The Crystal Watch','A Crack in the World','The Oracle’s Chamber','The Hungry Road','The Obsidian Gate','The Last Descent','The Throne Approach','The Triune Abyss']];
const CHAPTERS=WORLDS.flatMap((world,w)=>layouts[w].map((enemies,p)=>({name:titles[w][p],subtitle:p===9?'WORLD BOSS · '+world.name:'Progression '+(p+1)+' of 10 · '+world.name,biome:world.biome,world:w,progress:p+1,boss:p===9,enemies})));
const RAID_BOSSES=C.RAID_THEMES.map(t=>t.id);
function routeIndex(s){return ((s.act||1)-1)*30+s.stage;}
function attachRoute(s,preserve=false){if(s.mode==='raid'){if(s.raidSchedule&&s.raidRosterVersion!==2){const fresh=G.raid((s.routeSeed??s.seed)^0x728dc,RAID_BOSSES,Math.max(128,s.raidLevel+64));const tail=fresh.slice(s.raidLevel);if(tail[0]===s.raidSchedule[s.raidLevel-1])tail.shift();s.raidSchedule=[...s.raidSchedule.slice(0,s.raidLevel),...tail];s.raidRosterVersion=2;}if(!Array.isArray(s.raidSchedule))s.raidSchedule=G.raid(s.routeSeed??(s.seed^0x6ac690c5),RAID_BOSSES,Math.max(128,s.raidLevel+64));else if(s.raidSchedule.length<s.raidLevel){const extra=G.raid((s.routeSeed??s.seed)^s.raidSchedule.length,RAID_BOSSES,Math.max(128,s.raidLevel-s.raidSchedule.length+64));if(extra[0]===s.raidSchedule.at(-1))extra.shift();s.raidSchedule.push(...extra);}s.raidRosterVersion=2;return;}if(s.route){if(s.route.version<4){const old=s.route.encounters[routeIndex(s)];const previous=s.route;s.route=G.generate(s.route.seed,ENEMIES);if(s.phase==='story')s.route.encounters[routeIndex(s)].storyKey=old.storyKey;}return;}const old=s.act===2?SEQUEL[s.stage]:CHAPTERS[s.stage];s.route=G.generate((s.routeSeed??(s.seed^0x6ac690c5))>>>0,ENEMIES);if(preserve&&old){const index=routeIndex(s);s.route.encounters[index]={...s.route.encounters[index],...clone(old),regionName:(s.act===2?C.WORLDS2:WORLDS)[old.world].name,procedural:false};if(s.phase==='story')s.route.encounters[index].storyKey=s.choice;}}
function routeFor(s,act=s.act||1){attachRoute(s);return s.route?s.route.encounters.slice((act-1)*30,act*30):[];}
function worlds(s){attachRoute(s);return s.route?s.route.regions.slice(((s.act||1)-1)*3,(s.act||1)*3):WORLDS;}
function encounter(s){attachRoute(s);if(s.mode!=='raid')return s.route.encounters[routeIndex(s)];const level=s.raidLevel,type=s.raidSchedule[level-1],theme=C.RAID_THEMES.find(t=>t.id===type),world=(level-1)%3;return {name:ENEMIES[type].name+' · Raid '+level,subtitle:'RAID BOSS '+level+' · Endless ascent',biome:theme.biome,world,progress:level,boss:true,scenerySeed:((s.routeSeed||0)+Math.imul(level,2654435761))>>>0,enemies:[type]};}
function isOcean(s){return ['reef','wreck','trench'].includes(encounter(s).biome);}
function storyFor(s){return s.choice?.startsWith('sea-')?C.O.STORIES[Number(s.choice.slice(4))]:null;}
function needsMigration(s){return s.mode==='raid'?(!s.raidSchedule||s.raidBalanceVersion!==3||s.raidRosterVersion!==2):!s.route||s.route.version<4;}
function raidBossStats(level,type){const base=5500+Math.min(Math.max(0,level-1),8)*50,bonus=type==='raid_demon'?1800:type==='raid_furnace'?1000:0;return {hp:base+Math.round(bonus*(1+Math.max(0,level-1)*.06)),atk:22+4*level+Math.floor(level/5)*2};}
const RARITIES={common:{name:'Common',color:'#b4c5a1'},rare:{name:'Rare',color:'#8fc4df'},epic:{name:'Epic',color:'#c2a1e6'}};
const CLASSES={warrior:{name:'Vanguard',hp:88,mp:6,atk:13,speed:6,color:'#d5aa73',skill:'sunder'},ranger:{name:'Wayfarer',hp:72,mp:8,atk:12,speed:9,color:'#91ad85',skill:'volley'},mage:{name:'Arcanist',hp:65,mp:10,atk:11,speed:7,color:'#ac9bc8',skill:'ember'},rogue:{name:'Nightblade',hp:78,mp:8,atk:15,speed:10,color:'#a29ac2',skill:'shadow'}};
for(const [key,extra]of Object.entries(P.CLASS_EXTRAS))CLASSES[key]={...CLASSES[key],...extra};
const SKILLS={...P.SKILLS,...C.MOVES,...C.CARDS,...Object.fromEntries(Object.entries(C.BASICS).map(([k,v])=>['basic_'+k,{...v,cost:0,cd:0,description:v.name+': a free '+CLASSES[k].name+' attack.'}])),knightCut:{name:'Oathblade',cost:0,cd:0,mult:1,style:'slash',description:'A measured knight’s strike.'},knightSlam:{name:'Shield Rampart',cost:0,cd:0,mult:.85,shield:true,style:'heavy',description:'Shield bash and guard.'},universe:{name:'Universe cleave',cost:0,cd:0,description:'Bryan cuts through the universe. 10,000,000 damage to every enemy.',all:true,mult:1},strike:{name:'Strike',cost:0,cd:0,description:'A reliable hit. No focus cost.',mult:1},sunder:{name:'Sundering blow',cost:2,cd:2,description:'A heavy strike for 170% damage.',mult:1.7},volley:{name:'Scatter shot',cost:3,cd:2,description:'Hit every enemy for 85% damage.',mult:.85,all:true},ember:{name:'Ember arc',cost:3,cd:2,description:'Burn every enemy for 105% damage.',mult:1.05,all:true},shadow:{name:'Hidden blade',cost:2,cd:2,description:'A precise strike for 190% damage.',mult:1.9},mend:{name:'Mend',cost:3,cd:2,description:'Restore 30 health to the weakest ally.',heal:30}};
Object.assign(SKILLS,C.SUMMON_SKILLS);
for(const [type,enemy]of Object.entries(ENEMIES))Object.assign(enemy,Elements.affinity({element:Elements.enemy(type,enemy)}));
for(const [key,skill]of Object.entries(SKILLS))skill.element=Elements.infer({...skill,id:key});
for(const [type,kit]of Object.entries(C.ENEMY_MOVES))for(const key of kit){const move=SKILLS[key];if(move&&move.element==='physical')move.element=ENEMIES[type]?.element||'physical';}
for(const [key,weapon]of Object.entries(P.WEAPONS))weapon.element=Elements.infer({...weapon,id:key});
function enemyAffinity(unit){return Elements.affinity({...ENEMIES[unit?.enemyType],...unit,element:unit?.element||ENEMIES[unit?.enemyType]?.element});}
function attackElement(s,actor,key){const skill=SKILLS[key]||SKILLS.strike;if(actor?.side==='party'&&(key==='strike'||key.startsWith('basic_'))){const element=weaponFor(s,actor).element||'physical';return element==='physical'?skill.element:element;}return skill.element||'physical';}

const clone=value=>JSON.parse(JSON.stringify(value));
function campaignUnlocks(s){
 if(!s||s.mode==='raid')return [1];
 if(s.campaignUnlockVersion===1)return P.profile({unlockedCampaigns:s.unlockedCampaigns}).unlockedCampaigns;
 // Older saves must contain victories over all three guardians, not merely a later act number.
 const unlocked=[1],history=s.history||[];if(!s.skipped?.length)for(let act=1;act<=2;act++){const bosses=[9,19,29].map(stage=>s.route?.encounters[(act-1)*30+stage]?.name);if(bosses.every(name=>name&&history.includes(name)))unlocked.push(act+1);else break;}return unlocked;
}
function markCampaignShortcut(s){s.unlockedCampaigns=campaignUnlocks(s);s.campaignUnlockVersion=1;s.progressionCheated=true;}
function beginSequel(s){if(s.mode==='raid'||(s.act||1)>=3||s.phase!=='complete'||s.stage!==29||!campaignUnlocks(s).includes((s.act||1)+1))return false;s.act=(s.act||1)+1;s.stage=0;s.stories=[];s.restSpent=false;s.campConfirmed=false;startBattle(s);return true;}
function entryDuration(s){return s.mode==='raid'?12000:encounter(s).boss?2300:1100;}
function hero(id,name,job){const c=CLASSES[job];return {id,name,job,side:'party',kind:'humanoid',hp:c.hp,maxHp:c.hp,mp:c.mp,maxMp:c.mp,atk:c.atk,speed:c.speed,color:c.color,level:1,race:'human',weapon:job==='ranger'?'bow':job==='mage'?'staff':'sword',charge:0,raceCharge:0,appearance:P.appearance({clothes:c.color}),cooldowns:{},cards:['aegis'],guard:false};}
function createRun(name='Adventurer',job='warrior',mode='campaign',options={}){
 if(!Object.hasOwn(CLASSES,job))job='warrior';
 const s={version:5,campaignUnlockVersion:1,unlockedCampaigns:[1],economyVersion:2,goldEarned:0,runId:options.runId||'run-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9),tavernGold:0,mode:mode==='raid'?'raid':'campaign',raidLevel:1,raidBest:0,phase:'battle',stage:mode==='raid'?9:0,round:1,party:[hero('hero',String(name).trim().slice(0,18)||'Adventurer',job),hero('rowan','Rowan','ranger'),hero('mira','Mira','mage')],enemies:[],order:[],cursor:0,gold:0,potions:4,embers:1,xp:0,log:[],history:[],reward:null,choice:null,seed:Number.isInteger(options.seed)?options.seed>>>0:Math.floor(Math.random()*4294967296),inventory:[],campRested:false,stories:[]};
 s.routeSeed=(s.seed^0x6ac690c5)>>>0;s.party[1]=companion(s,'rowan');s.party[2]=companion(s,'mira');if(options.profile)applyLoadout(s.party[0],options.profile);
 s.party[0].adminAllowed=options.adminAllowed===true;s.party[0].adminDisabled=options.adminDisabled===true;if(options.partySize===6)expandParty(s);if(s.mode!=='raid'&&[2,3].includes(options.campaign)){s.act=options.campaign;s.startCampaign=s.act;s.unlockedCampaigns=Array.from({length:s.act},(_,i)=>i+1);const level=1+(s.act-1)*16;s.party.forEach(p=>{p.level=level;p.maxHp+=12*(level-1);p.hp=p.maxHp;p.atk+=3*(level-1);});s.gold=s.act===2?240:400;s.potions=8;}attachRoute(s);startBattle(s);return s;
}
function expandParty(s){for(const id of ['ember','sable','orin'])if(!s.party.some(p=>p.id===id)){const p=companion(s,id),level=s.party[0].level||1;p.level=level;p.maxHp+=12*(level-1);p.hp=p.maxHp;p.atk+=3*(level-1);s.party.push(p);if(s.phase==='battle'&&s.order?.length)s.order.push(id);}return s;}
function companion(s,id){
 const names=['Juniper','Orin','Sable','Finch','Bram','Aster','Tala','Nico','Wren','Cedar','Lyra','Ember','Kael','Pip','Vesper','Rook','Sol','Thistle','Moss','Iris'];const jobs=['warrior','ranger','mage','rogue'];
 let name=names[Math.floor(nextRandom(s)*names.length)];if(s.party.some(p=>p.id!==id&&p.name===name))name+=' '+['Ash','Vale','Reed'][Math.floor(nextRandom(s)*3)];const p=hero(id,name,jobs[Math.floor(nextRandom(s)*jobs.length)]);
 const skins=['#e4c7aa','#bd967c','#815d4d','#d6b58f','#a97c61'],colors=['#6b8d78','#a77b68','#7b7caa','#bdac7f','#617d92','#aa8292'];p.appearance=P.appearance({skin:skins[Math.floor(nextRandom(s)*skins.length)],clothes:colors[Math.floor(nextRandom(s)*colors.length)],pants:colors[Math.floor(nextRandom(s)*colors.length)],hairColor:['#40362e','#c2ac7a','#7d4f3b','#a4a19b'][Math.floor(nextRandom(s)*4)],hair:['short','long','spiky','bald'][Math.floor(nextRandom(s)*4)],face:['calm','smile','fierce','scar'][Math.floor(nextRandom(s)*4)],outfit:['traveler','tunic','coat'][Math.floor(nextRandom(s)*3)]});p.color=p.appearance.clothes;return p;
}
function applyLoadout(p,value){const load=P.profile(value),c=CLASSES[load.job],old=CLASSES[p.job]||CLASSES.warrior,hpRatio=p.hp/p.maxHp,mpRatio=p.mp/p.maxMp;p.maxHp=Math.max(1,p.maxHp-old.hp+c.hp);p.hp=Math.min(p.maxHp,Math.round(p.maxHp*hpRatio));p.atk=p.atk-old.atk+c.atk;p.job=load.job;p.speed=c.speed;p.maxMp=c.mp;p.mp=Math.min(p.maxMp,Math.round(p.maxMp*mpRatio));p.cards=load.equippedCards;p.race=load.race;p.weapon=load.weapon;p.appearance=load.appearance;p.color=load.appearance.clothes;return p;}
function weaponFor(s,p){const item=(s.inventory||[]).find(i=>i.owner===p.id&&i.slot==='weapon');const base=P.WEAPONS[item?.weaponKey||p.weapon]||P.WEAPONS.sword;return item?.skill&&SKILLS[item.skill]?{...base,name:item.name,skill:item.skill}:base;}
function hasAdmin(p){return p?.adminAllowed===true&&p.adminDisabled!==true;}
function abilities(s,p){return p.summon?(p.summonKit||['knightCut','knightSlam']):['basic_'+p.job,CLASSES[p.job].skill,...(p.cards||[]),...(['mage','paladin'].includes(p.job)?['mend']:[]),weaponFor(s,p).skill,CLASSES[p.job].ultimate,P.RACES[p.race||'human'].ultimate,...(hasAdmin(p)?['universe']:[])];}
function living(s,side){return (side==='party'?[...s.party,...(s.summons||[])]:s.enemies).filter(u=>u.hp>0);}
function unit(s,id){return [...s.party,...(s.summons||[]),...s.enemies].find(u=>u.id===id);}
function active(s){return s.phase==='battle'?unit(s,s.order[s.cursor]):null;}
function note(s,text){s.log.push(text);s.log=s.log.slice(-30);}
function nextRandom(s){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296;}
function makeOrder(s){return [...living(s,'party'),...living(s,'enemy')].sort((a,b)=>b.speed-a.speed||(a.id<b.id?-1:1)).map(u=>u.id);}
function startBattle(s){
 if(s.act===2)s.campaignTheme='ocean-v1';
 const chapter=encounter(s);s.decisionKey=null;s.decisionEndsAt=null;s.phase='battle';s.round=1;s.reward=null;s.choice=null;
 s.enemies=chapter.enemies.map((type,i)=>{const d=ENEMIES[type],scale=1+chapter.world*.15+(chapter.progress-1)*.035;return {...d,id:'enemy-'+i,side:'enemy',maxHp:Math.round(d.hp*scale*(d.boss?(s.act===2?1.5:chapter.world===2?2.8:2.4):1.65)),hp:Math.round(d.hp*scale*(d.boss?(s.act===2?1.5:chapter.world===2?2.8:2.4):1.65)),atk:Math.round(d.atk*scale*(d.boss?(s.act===2?1.2:chapter.world===2?1.65:1.4):1.25)),mp:0,maxMp:0,guard:false,cooldowns:{},status:{},enemyType:type};});
 if(chapter.procedural){const global=routeIndex(s),region=G.REGIONS[chapter.biome];s.enemies.forEach(e=>{const d=ENEMIES[e.enemyType],ratio=n=>Math.max(.65,Math.min(1.5,n)),v=chapter.variation||1;if(chapter.boss){e.hp=e.maxHp=Math.round((420+global*44)*v);e.atk=Math.round((15+global*1.3)*v);}else{const single=s.enemies.length===1;e.hp=e.maxHp=Math.round((35+global*5)*ratio(d.hp/region.hp)*v*(single?1.65:1));e.atk=Math.round((6+global*1.02)*ratio(d.atk/region.atk)*v*(single?1.15:1));}const mutation=G.MUTATIONS[chapter.mutations?.[s.enemies.indexOf(e)]];if(mutation){e.variant=chapter.mutations[s.enemies.indexOf(e)];e.name=mutation.name+' '+e.name;e.speed=Math.max(1,e.speed+(mutation.speed||0));e.hp=e.maxHp=Math.round(e.maxHp*(mutation.hp||1));e.atk=Math.max(1,Math.round(e.atk*(mutation.atk||1)));}if(s.party.length===6)e.atk=Math.round(e.atk*1.12);});}
 // Three adventurers are the baseline; summons and fallen fighters do not change difficulty.
 if(s.mode!=='raid'){const healthScale=1+Math.max(0,s.party.length-3)*.25;for(const enemy of s.enemies)enemy.hp=enemy.maxHp=Math.round(enemy.maxHp*healthScale);}
 if(s.mode==='raid'){const boss=s.enemies[0],power=raidBossStats(s.raidLevel,boss.enemyType);const hp=power.hp;Object.assign(boss,{hp,maxHp:hp,atk:power.atk,boss:true});s.raidBalanceVersion=3;}
 s.arena=null;s.summons=(s.summons||[]).filter(k=>k.hp>0);for(const k of s.summons){const owner=s.party.find(p=>p.id===k.ownerId);if(owner&&owner.level>k.level){const d=C.SUMMONS[k.summonCard||'summonKnight']||C.SUMMONS.summonKnight;k.level=owner.level;k.maxHp=d.hp+k.level*d.hpLevel;k.atk=d.atk+k.level*d.atkLevel;k.baseDef=d.def+(d.taunt?k.level:0);}k.guard=false;k.status={};}s.party.forEach(p=>{p.guard=false;p.cooldowns=Object.fromEntries(Object.entries(p.cooldowns||{}).filter(([key])=>SKILLS[key]?.summon));p.mp=p.maxMp;p.status={};});
 s.order=makeOrder(s);s.cursor=0;s.log=[];note(s,chapter.name+' — battle begins.');beginTurn(s);
}
function beginTurn(s){const actor=active(s);if(!actor)return;actor.guard=false;if(actor.side==='party'&&actor.race==='elf')actor.mp=Math.min(actor.maxMp,actor.mp+1);for(const k in actor.cooldowns)actor.cooldowns[k]=Math.max(0,actor.cooldowns[k]-1);}
function campPrices(s){return s.mode!=='raid'&&(s.act||1)===1?{tonic:1,ember:6,upgrade:5,step:3}:{tonic:20,ember:80,upgrade:25,step:20};}
function grantGold(s,value){const first=s.mode!=='raid'&&(s.act||1)===1,earned=s.goldEarned||0,amount=Math.max(0,Math.floor(first?Math.min(value,200-earned):value));s.gold=first?Math.min(200,s.gold+amount):s.gold+amount;s.goldEarned=earned+amount;return amount;}
function checkEnd(s){
 if(!s.party.some(p=>p.hp>0)){s.phase='defeat';note(s,'The party has fallen. The road is not over.');return true;}
 if(!living(s,'enemy').length){
  const gold=s.mode==='raid'?40+22*s.raidLevel:s.act>=2?360+s.stage*35:encounter(s).boss?12:4,xp=s.mode==='raid'?30+15*s.raidLevel:20+s.stage*8;const received=grantGold(s,gold);s.tavernGold=(s.tavernGold||0)+(s.mode==='raid'?3+Math.floor(s.raidLevel/5):encounter(s).boss?5:1);s.xp+=xp;s.potions+=1;
  if(s.mode==='raid')s.raidBest=Math.max(s.raidBest,s.raidLevel);
  const level=s.mode==='raid'?s.raidLevel+1:s.act>=2?1+(s.act-1)*16+Math.floor((s.stage+1)/2):1+Math.floor((s.stage+1)/2);let leveled=false;
  s.party.forEach(p=>{if(p.level<level){const gain=level-p.level;p.level=level;p.maxHp+=gain*12;p.atk+=gain*3;leveled=true;}});
  s.oceanWard=false;const loot=rollLoot(s);s.inventory.push(...loot);s.campRested=false;s.campConfirmed=false;
  if(s.mode!=='raid'&&s.stage===29&&(s.act||1)<3&&!s.progressionCheated){s.unlockedCampaigns=[...new Set([...campaignUnlocks(s),(s.act||1)+1])];s.campaignUnlockVersion=1;}
  s.reward={gold:received,xp,potion:1,leveled,boss:encounter(s).boss,loot:loot.map(i=>i.id)};s.history.push(encounter(s).name);s.phase='camp';note(s,'Victory. Your party returns to the campfire.');return true;
 }
 return false;
}
function endTurn(s){
 for(const knight of (s.summons||[]).filter(k=>k.hp<=0)){const owner=unit(s,knight.ownerId);if(owner){const card=knight.summonCard||'summonKnight';owner.cooldowns[card]=(SKILLS[card].cd||4)+1;}note(s,knight.name+' dissolves. Its summon card begins recovering.');}s.summons=(s.summons||[]).filter(k=>k.hp>0);
 if(checkEnd(s))return;
 do{s.cursor++;if(s.cursor>=s.order.length){s.round++;if(s.arena&&!--s.arena.rounds)s.arena=null;s.order=makeOrder(s);s.cursor=0;note(s,'Round '+s.round+'.');}}while(!active(s)||active(s).hp<=0);
 beginTurn(s);
}
function damage(s,source,target,amount,events,flags={}){const element=flags.element||'physical',effectiveness=Elements.multiplier(target.side==='enemy'?{...target,...enemyAffinity(target)}:target,element);if(flags.shock&&target.status?.soaked)amount*=1.3;const gear=(s.inventory||[]).filter(i=>i.owner===source.id),miss=gear.some(i=>i.enchantment==='precise')?.02:.08;if(nextRandom(s)<(source.status?.ink?.22:miss)){events.push({type:'miss',source:source.id,target:target.id,amount:0,element});note(s,source.name+' misses '+target.name+'.');return false;}const critical=nextRandom(s)<(.03+(gear.some(i=>i.enchantment==='keen')?.04:0));if(critical)amount*=1.6;if(target.images>0){target.images--;events.push({type:'miss',reason:'illusion',target:target.id,source:source.id,amount:0,element});note(s,'A false image of '+target.name+' shatters.');return false;}const armor=target.side==='party'?stats(s,target).def:0;const dealt=Math.min(target.hp,Math.max(1,Math.round(Math.max(1,amount-armor)*effectiveness*(target.guard?.5:1))));target.hp-=dealt;if(target.side==='party'){target.charge=Math.min(100,(target.charge||0)+15);target.raceCharge=Math.min(100,(target.raceCharge||0)+15);}if(source.race==='revenant'&&source.hp>0&&source.side==='party'){const heal=Math.min(source.maxHp-source.hp,Math.ceil(dealt*.15));if(heal>0){source.hp+=heal;events.push({type:'heal',target:source.id,amount:heal});}}events.push({type:'damage',target:target.id,source:source.id,amount:dealt,critical,element,effectiveness,defeated:!target.hp,guarded:!!target.guard});note(s,source.name+' hits '+target.name+' for '+dealt+(target.guard?' (guarded).':'.'));if(!target.hp)note(s,target.name+' falls.');return true;}
function act(s,command){
 const actor=active(s);if(!actor||actor.side!=='party')return {ok:false,error:'Wait for your party’s turn.'};
 const events=[];
 if(command.type==='focus'){if(actor.status){actor.status.ink=0;actor.status.pressure=0;}living(s,'enemy').forEach(e=>{if(e.images){e.images=0;events.push({type:'reveal',target:e.id,source:actor.id,amount:0});}});note(s,actor.name+' studies the battlefield, exposing every illusion.');actor.guard=true;const amount=Math.min(3,actor.maxMp-actor.mp);actor.mp+=amount;note(s,actor.name+' focuses: +'+amount+' focus and guards until their next turn.');events.push({type:'focus',target:actor.id,amount});}
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
  const key=command.skill==='strike'?'basic_'+actor.job:command.skill,skill=SKILLS[key];command={...command,skill:key};if(!skill||!allowed.includes(key))return {ok:false,error:'That technique is not available.'};
  if(skill.ultimate&&(actor.charge||0)<100||skill.raceUltimate&&(actor.raceCharge||0)<100)return {ok:false,error:'Your ultimate is still charging.'};
  if(actor.mp<skill.cost)return {ok:false,error:'Not enough focus. Use Focus to recover.'};
  if(actor.cooldowns[key]>0)return {ok:false,error:'That technique is recovering.'};
  const target=unit(s,command.target);
  if(skill.summon){const own=(s.summons||[]).filter(k=>k.ownerId===actor.id&&k.hp>0);if(own.some(k=>(k.summonCard||'summonKnight')===key))return {ok:false,error:'That summoned ally is already here.'};if(own.length>=2)return {ok:false,error:'You can maintain two different summoned allies.'};}
  if(!skill.summon&&!skill.self&&!skill.heal&&!skill.all&&(!target||target.side!=='enemy'||target.hp<=0))return {ok:false,error:'Choose a standing enemy.'};
  if(key==='universe')markCampaignShortcut(s);actor.mp-=skill.cost;if(skill.ultimate)actor.charge=0;if(skill.raceUltimate)actor.raceCharge=0;if(skill.cd&&!skill.summon)actor.cooldowns[key]=skill.cd+1;
  if(skill.summon){const d=C.SUMMONS[key]||C.SUMMONS.summonKnight,ally=hero('summon-'+actor.id+'-'+key+'-'+s.seed,d.name,d.job);Object.assign(ally,{summon:true,summonCard:key,summonKit:d.kit,ownerId:actor.id,taunt:!!d.taunt,kind:d.kind,level:actor.level,hp:d.hp+actor.level*d.hpLevel,maxHp:d.hp+actor.level*d.hpLevel,atk:d.atk+actor.level*d.atkLevel,speed:d.speed,baseDef:d.def+(d.taunt?actor.level:0),appearance:P.appearance({clothes:d.color,hair:d.kind==='humanoid'?'long':'bald',outfit:'coat'}),color:d.color});s.summons=s.summons||[];s.summons.push(ally);s.order.push(ally.id);events.push({type:'summon',source:actor.id,target:ally.id,amount:0});note(s,actor.name+' summons '+ally.name+(ally.taunt?'. Taunt draws enemy attacks.':'.'));}
  else if(skill.self){actor.guard=true;const recovered=Math.min(skill.restoreFocus||0,actor.maxMp-actor.mp);actor.mp+=recovered;events.push({type:'focus',target:actor.id,amount:recovered});}
  else if(skill.heal){const allies=skill.healAll?living(s,'party'):[living(s,'party').sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]];for(const ally of allies){const amount=Math.min(skill.heal+Math.max(0,actor.level-1)*2,ally.maxHp-ally.hp);ally.hp+=amount;if(skill.shield)ally.guard=true;if(skill.cleanse)ally.status={};events.push({type:'heal',target:ally.id,amount});}note(s,actor.name+' uses '+skill.name+'.');}
  else if(key==='universe'){living(s,'enemy').forEach(t=>{t.hp=Math.max(0,t.hp-10000000);events.push({type:'damage',target:t.id,source:actor.id,amount:10000000,element:'arcane',effectiveness:1,guarded:false,defeated:!t.hp});});note(s,actor.name+' cleaves the universe.');}
  else{for(const t of (skill.all?living(s,'enemy'):[target])){const hit=damage(s,actor,t,stats(s,actor).atk*skill.mult*(actor.status?.webbed?.75:1)*(actor.status?.chill?.65:1)*(s.arena?.kind==='gravity'?.8:1),events,{...skill,element:attackElement(s,actor,key)});if(hit&&t.hp>0&&(skill.burn||skill.chill||skill.water||skill.ink||skill.pressure||skill.poison)){t.status=t.status||{};if(skill.poison)t.status.poison=2;if(skill.burn)t.status.burn=2;if(skill.chill)t.status.chill=2;if(skill.water)t.status.soaked=3;if(skill.ink)t.status.ink=3;if(skill.pressure)t.status.pressure=3;}}if(skill.shield)actor.guard=true;if(skill.drain){const amount=Math.min(actor.maxHp-actor.hp,Math.ceil(events.filter(e=>e.type==='damage').reduce((n,e)=>n+e.amount,0)*.35));actor.hp+=amount;if(amount)events.push({type:'heal',target:actor.id,amount});}}
 }else return {ok:false,error:'Choose an action.'};
 if(!SKILLS[command.skill]?.ultimate)actor.charge=Math.min(100,(actor.charge||0)+30);if(!SKILLS[command.skill]?.raceUltimate)actor.raceCharge=Math.min(100,(actor.raceCharge||0)+30);
 poisonTick(s,actor,events);
 const result={ok:true,actor:actor.id,action:command.type,skill:command.skill||null,events};endTurn(s);return result;
}
function randomAct(s){
 const actor=active(s);if(!actor||actor.side!=='party')return {ok:false,error:'Not a player turn.'};const enemies=living(s,'enemy'),choices=[{type:'focus'}];
 for(const key of abilities(s,actor)){const skill=SKILLS[key];if(actor.mp<skill.cost||actor.cooldowns[key]>0||skill.ultimate&&(actor.charge||0)<100||skill.raceUltimate&&(actor.raceCharge||0)<100)continue;if(skill.summon){const own=(s.summons||[]).filter(k=>k.ownerId===actor.id);if(own.length>=2||own.some(k=>(k.summonCard||'summonKnight')===key))continue;}if(skill.heal||skill.all||skill.self||skill.summon)choices.push({type:'skill',skill:key});else for(const target of enemies)choices.push({type:'skill',skill:key,target:target.id});}
 return act(s,choices[Math.floor(nextRandom(s)*choices.length)]);
}
function botAct(s){
 const a=active(s);if(!a||a.side!=='party')return {ok:false,error:'Not a companion turn.'};
 if(a.summon){const kit=a.summonKit||['knightCut','knightSlam'],turn=a.summonTurns||0;a.summonTurns=turn+1;return act(s,{type:'skill',skill:kit[turn%kit.length],target:living(s,'enemy')[0]?.id});}
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
 const all=living(s,'party'),taunt=all.findLast(p=>p.taunt),targets=taunt?[taunt]:all,target=targets[Math.floor(nextRandom(s)*targets.length)],events=[];actor.turns=(actor.turns||0)+1;
 const kit=C.ENEMY_MOVES[actor.enemyType]||['strike','sunder'];
 // Shuffle each complete repertoire into a deterministic, non-repeating cycle.
 if(!actor.moveDeck?.length){actor.moveDeck=[...kit];for(let i=actor.moveDeck.length-1;i>0;i--){const j=Math.floor(nextRandom(s)*(i+1));[actor.moveDeck[i],actor.moveDeck[j]]=[actor.moveDeck[j],actor.moveDeck[i]];}}
 // Raid films are signature moments: four quick turns before the first,
 // and at least four ordinary boss actions between films. Deferred moves stay in the deck.
 let moveIndex=0;
 if(actor.raidOnly){const ready=actor.turns-(actor.lastCinematicTurn||0)>=5;
  const preferred=actor.moveDeck.findIndex(key=>!!SKILLS[key]?.cinematic===ready);
  moveIndex=preferred>=0?preferred:ready?0:-1;
 }
 const skill=moveIndex<0?kit.find(key=>!SKILLS[key]?.cinematic):actor.moveDeck.splice(moveIndex,1)[0],move=SKILLS[skill]||SKILLS.strike;
 if(actor.raidOnly&&move.cinematic)actor.lastCinematicTurn=actor.turns;note(s,actor.name+' uses '+move.name+'.');if(move.shell)actor.guard=true;
 if(move.summonEnemy){const species={raid_tide:['tideeye','Drowned Spawn'],raid_furnace:['imp','Forge Drone'],raid_eclipse:['wisp','Starved Echo'],raid_spider:['spider','Widow Hatchling'],raid_demon:['skeleton','Risen Legionnaire']}[actor.enemyType],type=species[0];if(living(s,'enemy').length<4){const d=ENEMIES[type],id='spawn-'+s.round+'-'+actor.turns,scale=1+s.raidLevel*.2;const minion={...d,id,enemyType:type,name:species[1],side:'enemy',hp:Math.round(40*scale),maxHp:Math.round(40*scale),atk:Math.round(7+s.raidLevel*2),speed:4,mp:0,maxMp:0,cooldowns:{},status:{},raidMinion:true};s.enemies.push(minion);s.order.push(id);events.push({type:'summon',source:actor.id,target:id,amount:0});}}
 if(move.arena){s.arena={kind:move.arena,rounds:5,source:actor.id,theme:actor.enemyType,variant:move.domainVariant||0,name:move.name};events.push({type:'arena',source:actor.id,target:actor.id,amount:0,arena:move.arena});note(s,'The battlefield becomes '+move.arena+' for five rounds.');}
 if(actor.behavior==='heal'&&actor.turns%2===1){const ally=living(s,'enemy').sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],amount=Math.min(25,ally.maxHp-ally.hp);ally.hp+=amount;events.push({type:'heal',target:ally.id,amount});}
 if(actor.behavior==='guard'&&actor.turns%3===1){actor.guard=true;events.push({type:'focus',source:actor.id,target:actor.id,amount:0});const result={ok:true,actor:actor.id,action:'focus',skill,events};endTurn(s);return result;}
 if(actor.behavior==='charge'&&actor.turns%3===1){actor.charging=true;events.push({type:'focus',source:actor.id,target:actor.id,amount:0});const result={ok:true,actor:actor.id,action:'focus',skill,events};endTurn(s);return result;}
 if(actor.behavior==='illusion'&&actor.turns%3===1){actor.images=actor.boss&&((s.act||1)>1||s.stage>=19)?2:1;events.push({type:'illusion',source:actor.id,target:actor.id,amount:0});}
 const sweep=move.all||actor.behavior==='sweep'&&actor.turns%2===0,atk=actor.atk*(actor.status?.chill?.65:1);
 for(const t of (sweep?targets:[target])){const hit=damage(s,actor,t,atk*(actor.charging?1.8:sweep&&!actor.raidOnly?Math.min(.85,move.mult):move.mult),events,move);if(hit&&t.hp>0){t.status=t.status||{};if(move.burn)t.status.burn=2;if(move.chill)t.status.chill=2;if(move.water)t.status.soaked=3;if(move.ink)t.status.ink=3;if(move.pressure)t.status.pressure=3;if(move.poison||actor.behavior==='poison')t.status.poison=2;if(move.webbed)t.status.webbed=2;if(move.focusLoss)t.mp=Math.max(0,(t.mp||0)-move.focusLoss);}}
 if(move.drain){const amount=Math.min(actor.maxHp-actor.hp,Math.ceil(events.filter(e=>e.type==='damage').reduce((n,e)=>n+e.amount,0)*.4));actor.hp+=amount;if(amount)events.push({type:'heal',source:actor.id,target:actor.id,amount});}actor.charging=false;if(actor.behavior==='drain'){const amount=Math.min(actor.maxHp-actor.hp,Math.ceil(actor.atk*.5));if(amount){actor.hp+=amount;events.push({type:'heal',source:actor.id,target:actor.id,amount});}}if(actor.status?.chill)actor.status.chill--;poisonTick(s,actor,events);
 const result={ok:true,actor:actor.id,action:'enemy',skill,events};endTurn(s);return result;
}
function poisonTick(s,actor,events){if(actor.status?.pressure&&actor.hp>0){const lost=Math.min(actor.mp||0,1);actor.mp=Math.max(0,(actor.mp||0)-lost);if(lost)events.push({type:'drainFocus',source:actor.id,target:actor.id,amount:lost});}for(const key of ['soaked','ink','pressure'])if(actor.status?.[key])actor.status[key]--;if(actor.side==='party'&&actor.status?.chill)actor.status.chill--;if(actor.status?.webbed)actor.status.webbed--;delete actor.status?.hallucination;if(s.arena&&actor.side==='party'&&actor.hp>0){if(s.arena.kind==='inferno'){const amount=Math.min(actor.hp,Math.max(3,Math.ceil(actor.maxHp*.025)));actor.hp-=amount;events.push({type:'damage',source:s.arena.source,target:actor.id,amount,element:'fire',effectiveness:1,status:'arena'});}if(s.arena.kind==='web')actor.status.webbed=2;if(s.arena.kind==='necropolis')actor.mp=Math.max(0,(actor.mp||0)-1);if(s.arena.kind==='undertow')actor.mp=Math.max(0,actor.mp-1);}if(actor.status?.burn&&actor.hp>0){const effectiveness=Elements.multiplier(actor.side==='enemy'?{...actor,...enemyAffinity(actor)}:actor,'fire'),amount=Math.min(actor.hp,Math.max(1,Math.ceil(Math.max(4,Math.ceil(actor.maxHp*.05))*effectiveness)));actor.hp-=amount;actor.status.burn--;events.push({type:'damage',target:actor.id,source:actor.id,amount,element:'fire',effectiveness,status:'burn'});}if(actor.status?.poison&&actor.hp>0){const effectiveness=Elements.multiplier(actor.side==='enemy'?{...actor,...enemyAffinity(actor)}:actor,'nature'),amount=Math.min(actor.hp,Math.max(1,Math.ceil((3+encounter(s).world*2)*effectiveness)));actor.hp-=amount;actor.status.poison--;events.push({type:'damage',target:actor.id,source:actor.id,amount,element:'nature',effectiveness,guarded:false,status:'poison'});note(s,actor.name+' takes '+amount+' poison damage.');}}
function tonicHeal(s){return s.mode==='raid'?40+s.raidLevel*8:s.act>=2?120+(s.act-2)*80:40+Math.floor(s.stage/10)*20;}
function stats(s,p){const gear=(s.inventory||[]).filter(i=>i.owner===p.id);return {atk:p.atk+gear.reduce((n,i)=>n+i.atk+(i.enchantment==='mighty'?2:0),0)+(gear.some(i=>i.slot==='weapon')?0:P.WEAPONS[p.weapon]?.atk||0)+(p.race==='dragonborn'?3:0),def:(s.oceanWard&&isOcean(s)&&s.round<=2?2:0)+(p.baseDef||0)+gear.reduce((n,i)=>n+i.def+(i.enchantment==='sturdy'?2:0),0)+(p.race==='dwarf'?2:0)};}
function rollLoot(s){
 const boss=encounter(s).boss,count=boss?2:1,tier=s.mode==='raid'?s.raidLevel:s.act>=2?4+(s.act-2)*6+Math.floor(s.stage/5):1+Math.floor(s.stage/10);return Array.from({length:count},(_,i)=>{
  const r=nextRandom(s),slot=['weapon','armor','charm'][Math.floor(nextRandom(s)*3)],rarity=boss?'epic':r>.77?'rare':'common',quality=rarity==='epic'?3:rarity==='rare'?2:1;
  const names={weapon:['Traveler’s Blade','Ashwood Edge','Riftforged Steel'],armor:['Ironbark Vest','Keepkeeper Mail','Obsidian Mantle'],charm:['Mossbound Charm','Lantern Sigil','Hollow Star']};
  const enchantment=nextRandom(s)<(boss?.75:.35)?['keen','precise','mighty','sturdy'][Math.floor(nextRandom(s)*4)]:null;
  const weaponKey=slot==='weapon'?Object.keys(P.WEAPONS)[Math.floor(nextRandom(s)*Object.keys(P.WEAPONS).length)]:null;
  const sea=s.mode!=='raid'&&isOcean(s),sky=s.mode!=='raid'&&s.act===3,art=slot==='weapon'&&(sea||sky)?Object.keys(sky?C.SKY_ARTS:C.O.ARTS)[Math.floor(nextRandom(s)*(sky?3:4))]:null;
  return {id:'loot-'+s.stage+'-'+i+'-'+s.seed,name:(sky?(slot==='weapon'?{galeNeedle:'Zephyr Needle',haloBreak:'Sunspire Halo',stormThread:'Stormthread Rod'}[art]:slot==='armor'?['Cloudweave Coat','Thunderhead Mantle','Sunforged Aegis'][encounter(s).world]:['Skyglass Feather','Storm Compass','Zenith Diadem'][encounter(s).world]):sea?(slot==='weapon'?{brineSpear:'Coralglass Trident',arcHarpoon:'Convoy Arc Harpoon',inkstep:'Inkveil Sabre',pressureBell:'Bathyal Bellstaff'}[art]:slot==='armor'?['Anemone Mail','Wreckplate Dive Suit','Hadal Carapace'][['reef','wreck','trench'].indexOf(encounter(s).biome)]:['Tideglass Pearl','Convoy Compass','Lightless Lure'][['reef','wreck','trench'].indexOf(encounter(s).biome)]):slot==='weapon'?P.WEAPONS[weaponKey].name:names[slot][s.mode==='raid'?(s.raidLevel-1)%3:Math.min(2,tier-1)])+(s.mode==='raid'?' · Raid '+tier:''),tier,slot,rarity,weaponKey,enchantment,skill:art|| (weaponKey?P.WEAPONS[weaponKey].skill:null),atk:slot==='weapon'?tier*quality+1:slot==='charm'?tier:0,def:slot==='armor'?tier*quality:slot==='charm'?(s.mode==='raid'?tier+quality:quality):0,price:s.mode!=='raid'&&(s.act||1)===1?1+quality:10+tier*quality*8,owner:null,upgrades:0};
 });
}
function gearPower(i){return i.atk+i.def+(i.enchantment==='mighty'||i.enchantment==='sturdy'?2:0);}
function finishCamp(s,botIds){if(s.phase!=='camp')return false;for(let pass=0;pass<botIds.length;pass++){const before=s.inventory.map(i=>i.owner).join('|');for(const hero of botIds)campAction(s,{type:'equip-best',hero});if(before===s.inventory.map(i=>i.owner).join('|'))break;}s.campConfirmed=true;return true;}
function campAction(s,command){
 if(s.phase!=='camp')return {ok:false,error:'Return to the campfire first.'};
 const item=s.inventory.find(i=>i.id===command.item),hero=s.party.find(p=>p.id===command.hero)|| (command.type==='use-tonic'?(s.summons||[]).find(p=>p.id===command.hero):null);
 if(command.type==='sell-junk'){const junk=s.inventory.filter(i=>!i.owner);grantGold(s,junk.reduce((sum,i)=>sum+i.price,0));s.inventory=s.inventory.filter(i=>i.owner);s.campConfirmed=false;return {ok:true,sold:junk.length};}
 if(command.type==='equip-best'){
  if(!hero)return {ok:false,error:'Choose an adventurer.'};
  for(const slot of ['weapon','armor','charm']){const candidates=s.inventory.filter(i=>i.slot===slot&&(!i.owner||i.owner===hero.id)).sort((a,b)=>gearPower(b)-gearPower(a)),best=candidates[0],current=s.inventory.find(i=>i.slot===slot&&i.owner===hero.id);if(best&&gearPower(best)>(current?gearPower(current):slot==='weapon'?(P.WEAPONS[hero.weapon]?.atk||0):0)){if(current)current.owner=null;best.owner=hero.id;}}
 }else if(command.type==='equip'){
  if(!item||!hero)return {ok:false,error:'Choose a piece of gear and an adventurer.'};
  s.inventory.filter(i=>i.owner===hero.id&&i.slot===item.slot).forEach(i=>i.owner=null);item.owner=hero.id;
 }else if(command.type==='unequip'){if(!item)return {ok:false,error:'Gear not found.'};item.owner=null;}
 else if(command.type==='sell'){if(!item||item.owner)return {ok:false,error:'Unequip an item before selling it.'};grantGold(s,item.price);s.inventory=s.inventory.filter(i=>i!==item);}
 else if(command.type==='upgrade'){if(!item)return {ok:false,error:'Choose gear to upgrade.'};const prices=campPrices(s),cost=prices.upgrade+item.upgrades*prices.step;if(item.upgrades>=3||s.gold<cost)return {ok:false,error:item.upgrades>=3?'This item is fully upgraded.':'Not enough gold.'};s.gold-=cost;item.upgrades++;if(item.slot==='weapon')item.atk+=2;else item.def++;item.price+=10;}
 else if(command.type==='use-tonic'||command.type==='use-ember'){if(!hero)return {ok:false,error:'Choose an adventurer.'};if(command.type==='use-tonic'){if(!s.potions||hero.hp<=0||hero.hp>=hero.maxHp)return {ok:false,error:'Choose an injured standing adventurer with a tonic available.'};s.potions--;hero.hp=Math.min(hero.maxHp,hero.hp+tonicHeal(s));}else{if(!s.embers||hero.hp>0)return {ok:false,error:'Choose a fallen adventurer with an ember available.'};s.embers--;hero.hp=Math.ceil(hero.maxHp*.5);}}
 else if(command.type==='rest'){if(s.mode==='raid'||s.stage>=29||s.stage%10===8)return {ok:false,error:'No spare stage remains before this boss. Use healing items.'};if(s.campRested)return {ok:false,error:'Your party has already rested.'};[...s.party,...(s.summons||[])].forEach(p=>{p.hp=p.maxHp;p.mp=p.maxMp;p.status={};});s.campRested=true;s.restSpent=true;note(s,'Resting consumes the next stage. No battle rewards are earned.');}
 else if(command.type==='buy-tonic'||command.type==='buy-ember'){const prices=campPrices(s),price=command.type==='buy-tonic'?prices.tonic:prices.ember;if(s.gold<price)return {ok:false,error:'Not enough gold.'};s.gold-=price;if(command.type==='buy-tonic')s.potions++;else s.embers++;}
 else return {ok:false,error:'Choose a camp action.'};
 s.campConfirmed=false;return {ok:true};
}
function warp(s,heroId,act,stage){const p=s.party.find(p=>p.id===heroId);if(!p||!hasAdmin(p)||![1,2,3].includes(act)||!Number.isInteger(stage)||stage<0||stage>=30)return false;markCampaignShortcut(s);s.mode='campaign';s.act=act;s.stage=stage;s.stories=[];s.restSpent=false;startBattle(s);return true;}
function skipEncounter(s,heroId='hero'){
 const player=s.party.find(p=>p.id===heroId);if(s.phase!=='battle'||!player||!hasAdmin(player))return false;
 markCampaignShortcut(s);s.skipped=[...(s.skipped||[]),{act:s.act||1,stage:s.stage,raidLevel:s.mode==='raid'?s.raidLevel:null}].slice(-100);
 if(s.mode==='raid'){s.raidLevel++;s.stage=((s.raidLevel-1)%3)*10+9;startBattle(s);return true;}
 if(s.stage===(s.act===2?SEQUEL.length:CHAPTERS.length)-1){s.phase='complete';s.decisionEndsAt=null;return true;}
 s.stage++;s.restSpent=false;startBattle(s);return true;
}
function travel(s){
 if(s.phase!=='camp')return false;
 if(s.mode==='raid'){s.raidLevel++;s.stage=((s.raidLevel-1)%3)*10+9;startBattle(s);return true;}
 if(s.stage===(s.act===2?SEQUEL.length:CHAPTERS.length)-1){s.phase='complete';return true;}
 if(encounter(s).storyKey&&!s.stories.includes(s.stage)){s.phase='story';s.choice=encounter(s).storyKey;return true;}
 s.stage+=s.restSpent?2:1;s.restSpent=false;startBattle(s);return true;
}
function choose(s,choice){
 if(s.phase!=='story'||!['accept','decline'].includes(choice))return false;
 if(s.choice.startsWith('sea-')){const story=storyFor(s);if(!story)return false;if(choice==='accept'){s.potions+=story.potions||0;s.embers+=story.embers||0;grantGold(s,story.gold||0);}else if(story.declineDetail.includes('armor'))s.oceanWard=true;else s.party.forEach(p=>p.atk++);}
 else if(s.choice==='stranger'){
  if(choice==='accept'){const p=s.party[0],c=CLASSES.rogue;p.job='rogue';p.atk+=3;p.speed=c.speed;p.color=c.color;p.maxMp=Math.max(p.maxMp,8);}
  else s.party.forEach(p=>{p.maxHp+=8;});
 }else if(s.choice==='crossroads'){if(choice==='accept'){s.potions+=2;grantGold(s,s.act===2?35:5);}else s.party.forEach(p=>{p.atk+=1;p.maxHp+=6;});
 }else if(choice==='accept'){s.potions+=3;}else{grantGold(s,s.act===2?50:8);s.embers++;}
 s.lastChoice={kind:s.choice,choice};s.stories.push(s.stage);s.stage+=s.restSpent?2:1;s.restSpent=false;startBattle(s);return true;
}
function buyTonic(s){return campAction(s,{type:'buy-tonic'}).ok;}
function retry(s){if(s.mode==='raid'||s.phase!=='defeat')return false;s.party.forEach(p=>{p.hp=p.maxHp;p.mp=p.maxMp;});s.potions=Math.max(2,s.potions);startBattle(s);return true;}
function restore(value){
 try{const s=typeof value==='string'?JSON.parse(value):clone(value);
 if(s?.version===4){s.version=5;s.stage=s.phase==='story'&&s.choice==='shrine'?14:s.stage<4?s.stage:s.stage<7?s.stage+6:19;s.inventory=[];s.campRested=false;s.campConfirmed=false;s.stories=[];if(['victory','complete'].includes(s.phase)){s.phase='camp';s.reward=s.reward||{gold:0,xp:0};s.reward.loot=[];s.reward.boss=encounter(s).boss;}s.party.forEach(p=>p.status={});}
 if(!s||s.version!==5||!Number.isInteger(s.stage)||s.stage<0||s.stage>=CHAPTERS.length||!['battle','camp','story','defeat','complete'].includes(s.phase))return null;
 s.mode=s.mode||'campaign';if(s.economyVersion!==2&&s.mode!=='raid'&&(s.act||1)===1){s.gold=Math.min(200,Math.floor(s.gold/20));s.goldEarned=s.gold;s.inventory?.forEach(i=>i.price=1+({common:1,rare:2,epic:3}[i.rarity]||1));}s.economyVersion=2;if(s.act!==undefined&&![1,2,3].includes(s.act))return null;if(s.act>=2&&(s.mode==='raid'||s.stage>=30))return null;s.raidLevel=s.raidLevel||1;s.raidBest=s.raidBest||0;
 if(!['campaign','raid'].includes(s.mode)||!Number.isSafeInteger(s.raidLevel)||s.raidLevel<1||!Number.isSafeInteger(s.raidBest)||s.raidBest<0)return null;
 if(!Array.isArray(s.inventory)||!Array.isArray(s.stories))return null;
 if(!Array.isArray(s.party)||![3,6].includes(s.party.length)||!Array.isArray(s.enemies)||!Array.isArray(s.order)||!Array.isArray(s.log)||!Array.isArray(s.history))return null;
 const all=[...s.party,...s.enemies];if(all.some(p=>!p||!Number.isFinite(p.hp)||!Number.isFinite(p.maxHp)||p.hp<0||p.hp>p.maxHp||!p.cooldowns))return null;
 if(s.party.some(p=>!CLASSES[p.job]||!Number.isFinite(p.mp)||!Number.isFinite(p.maxMp)))return null;
 s.summons=Array.isArray(s.summons)?s.summons.filter(k=>k.summon&&k.ownerId&&k.hp>0&&Number.isFinite(k.maxHp)&&k.cooldowns):[];s.party.forEach(p=>{p.cards=(p.cards||[]).filter(k=>C.CARDS[k]).slice(0,3);p.race=Object.hasOwn(P.RACES,p.race)?p.race:'human';p.weapon=Object.hasOwn(P.WEAPONS,p.weapon)?p.weapon:(p.job==='mage'?'staff':p.job==='ranger'?'bow':'sword');p.appearance=P.appearance(p.appearance||{clothes:p.color});p.charge=Math.max(0,Math.min(100,Number(p.charge)||0));p.raceCharge=Math.max(0,Math.min(100,Number(p.raceCharge)||0));});s.tavernGold=s.tavernGold||0;
 if(s.route&&!G.valid(s.route,ENEMIES))return null;if(s.mode==='raid'&&s.raidSchedule&&(!Array.isArray(s.raidSchedule)||s.raidSchedule.some(k=>!RAID_BOSSES.includes(k))))return null;attachRoute(s,true);if(s.mode==='raid')for(const boss of s.enemies.filter(e=>e.raidOnly)){const d=ENEMIES[boss.enemyType];if(d){boss.name=d.name;boss.kind=d.kind;}}if(s.mode==='raid'&&s.raidBalanceVersion!==3){const boss=s.enemies.find(e=>e.raidOnly);if(boss){const ratio=boss.maxHp?boss.hp/boss.maxHp:1,power=raidBossStats(s.raidLevel,boss.enemyType);boss.maxHp=power.hp;boss.hp=ratio===0?0:Math.max(1,Math.round(boss.maxHp*ratio));boss.atk=power.atk;boss.moveDeck=null;}s.raidBalanceVersion=3;}for(const enemy of s.enemies)Object.assign(enemy,enemyAffinity(enemy));for(const u of [...s.party,...s.enemies,...(s.summons||[])])if(u.status)delete u.status.hallucination;
 if(s.phase==='battle'&&(!active(s)||active(s).hp<=0))return null;
 return s;
 }catch{return null;}
}
return {campaignUnlocks,Elements,enemyAffinity,attackElement,G,routeFor,storyFor,isOcean,needsMigration,C,worlds,warp,P,entryDuration,hero,expandParty,companion,applyLoadout,weaponFor,hasAdmin,abilities,encounter,SEQUEL,beginSequel,raidBossStats,RAID_BOSSES,WORLDS,CHAPTERS,ENEMIES,RARITIES,CLASSES,SKILLS,stats,tonicHeal,campPrices,finishCamp,campAction,createRun,randomAct,botAct,skipEncounter,active,unit,living,act,enemyAct,travel,choose,buyTonic,retry,restore};
});
