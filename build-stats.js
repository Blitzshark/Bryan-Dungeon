(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BuildStats=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const DEFS={
 strength:{name:'Strength',group:'Offense',description:'+3% melee damage per point.'},
 intellect:{name:'Intellect',group:'Offense',description:'+3% magic damage per point.'},
 dexterity:{name:'Dexterity',group:'Offense',description:'+3% ranged damage, +0.5% accuracy and +0.25% critical chance per point.'},
 vitality:{name:'Vitality',group:'Survival',description:'+6 maximum health per point. Allocating points does not heal you.'},
 endurance:{name:'Endurance',group:'Survival',description:'+0.5 armor and 0.5% resistance to nonphysical hits per point.'},
 agility:{name:'Agility',group:'Survival',description:'+1 initiative per 2 points and +0.4% evasion per point.'},
 spirit:{name:'Spirit',group:'Focus & support',description:'+1 maximum focus per 3 points. Guard & focus restores +1 focus per 5 points.'},
 discipline:{name:'Discipline',group:'Focus & support',cap:16,description:'Every 8 points reduces paid technique costs by 1 focus, up to 2 off. Paid moves always cost at least 1.'},
 resolve:{name:'Resolve',group:'Focus & support',description:'+1 ultimate charge per action and +0.5 charge when hit per point.'},
 restoration:{name:'Restoration',group:'Focus & support',description:'+4% healing from your healing abilities per point.'},
 alchemy:{name:'Alchemy',group:'Focus & support',description:'+4% tonic healing received and +1% maximum health restored by revival embers per point.'},
 command:{name:'Command',group:'Summons',description:'Your summons gain +6% health, +2% damage and +0.2 defense per point. They still last one encounter.'}
};
const MAX_POINTS=110;
function budget(level=1){return 12+2*(Math.max(1,Math.min(50,Math.floor(Number(level)||1)))-1);}
function total(points){return Object.values(points||{}).reduce((sum,n)=>sum+(Number.isFinite(n)?n:0),0);}
function allocation(value={},limit=MAX_POINTS){const points={};for(const [key,d]of Object.entries(DEFS)){const n=value&&Object.hasOwn(value,key)?value[key]:0;points[key]=Number.isSafeInteger(n)?Math.max(0,Math.min(d.cap||20,n)):0;}const sum=total(points);if(sum>limit){const desired={...points};for(const key in points)points[key]=0;for(let n=0;n<limit;n++){let winner=null,best=-1;for(const key in points)if(points[key]<desired[key]){const priority=desired[key]/(points[key]+1);if(priority>best){winner=key;best=priority;}}if(!winner)break;points[winner]++;}}return points;}
function active(hero){return allocation(hero?.statPlan||hero?.statAllocation||{},budget(hero?.level));}
function effects(value={}){const p=allocation(value);return {hp:p.vitality*6,mp:Math.floor(p.spirit/3),speed:Math.floor(p.agility/2),armor:p.endurance*.5,resist:p.endurance*.005,melee:1+p.strength*.03,magic:1+p.intellect*.03,ranged:1+p.dexterity*.03,accuracy:p.dexterity*.005,crit:p.dexterity*.0025,evasion:p.agility*.004,focus:3+Math.floor(p.spirit/5),discount:Math.floor(p.discipline/8),charge:p.resolve,heal:1+p.restoration*.04,tonic:1+p.alchemy*.04,revive:.5+p.alchemy*.01,summonHp:1+p.command*.06,summonAtk:1+p.command*.02,summonDef:p.command*.2};}
function forHero(hero){return effects(active(hero));}
function requiredLevel(points){return Math.max(1,Math.ceil((total(points)-12)/2)+1);}
function exportCode(build){const obj={v:1,job:build.job,race:build.race,weapon:build.weapon,cards:[...(build.cards||build.equippedCards||[])],stats:allocation(build.stats||build.statAllocation)};const text=JSON.stringify(obj),encoded=typeof Buffer!=='undefined'?Buffer.from(text).toString('base64'):btoa(text);return 'BB1.'+encoded.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function importCode(code){if(typeof code!=='string'||code.trim().length>3000||!/^BB1\.[A-Za-z0-9_-]+$/.test(code.trim()))throw Error('Paste a valid BB1 build code.');try{const raw=code.trim().slice(4).replace(/-/g,'+').replace(/_/g,'/'),text=typeof Buffer!=='undefined'?Buffer.from(raw,'base64').toString():atob(raw),v=JSON.parse(text);if(v.v!==1||Object.keys(v).some(k=>!['v','job','race','weapon','cards','stats'].includes(k))||!['job','race','weapon'].every(k=>typeof v[k]==='string'&&/^[a-zA-Z0-9_]{1,40}$/.test(v[k]))||!Array.isArray(v.cards)||v.cards.length>3||new Set(v.cards).size!==v.cards.length||!v.cards.every(id=>typeof id==='string'&&/^[a-zA-Z0-9_]{1,40}$/.test(id))||!v.stats||typeof v.stats!=='object'||Array.isArray(v.stats)||Object.entries(v.stats).some(([k,n])=>!Object.hasOwn(DEFS,k)||!Number.isSafeInteger(n)||n<0||n>(DEFS[k].cap||20))||total(v.stats)>MAX_POINTS)throw Error();return {...v,stats:allocation(v.stats)};}catch{throw Error('That build code is invalid or uses an unsupported version.');}}
return {DEFS,MAX_POINTS,budget,total,allocation,active,effects,forHero,requiredLevel,exportCode,importCode};
});
