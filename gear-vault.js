(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./content'):root.GameContent);if(typeof module==='object'&&module.exports)module.exports=api;else root.GearVault=api;})(typeof globalThis!=='undefined'?globalThis:this,function(C){
'use strict';
const LIMIT=120;
const SLOTS=['weapon','armor','charm'],WEAPONS=['sword','bow','staff','emberblade','stormbow','frostaxe','moondaggers','dawnstaff',...Object.keys(C.D.WEAPONS)],ARTS=['pommel','pierce','spark','wildfire','chainshot','frostbite','moonstep','sunburst',...Object.values(C.D.WEAPONS).map(w=>w.skill)];
function item(v){if(!v||!SLOTS.includes(v.slot)||typeof v.id!=='string'||!v.id||v.id.length>180||!Number.isFinite(v.atk)||!Number.isFinite(v.def)||v.atk<0||v.def<0||v.atk>10000||v.def>10000)return null;return {id:v.id,name:String(v.name||'Recovered gear').replace(/[\u0000-\u001f]/g,'').slice(0,64),slot:v.slot,tier:Math.max(1,Math.min(1000,Math.floor(Number(v.tier)||1))),rarity:Object.hasOwn(C.GEAR.RARITIES,v.rarity)?v.rarity:'common',catalogId:Object.hasOwn(C.GEAR.items,v.catalogId)?v.catalogId:null,perk:Object.hasOwn(C.GEAR.PERKS,v.perk)?v.perk:null,atk:Math.floor(v.atk),def:Math.floor(v.def),weaponKey:v.slot==='weapon'&&WEAPONS.includes(v.weaponKey)?v.weaponKey:null,skill:v.slot==='weapon'&&([...ARTS,...Object.keys(C.SKY_ARTS||{}),...Object.keys(C.O?.ARTS||{})].includes(v.skill))?v.skill:null,enchantment:['keen','precise','mighty','sturdy'].includes(v.enchantment)?v.enchantment:null,upgrades:Math.max(0,Math.min(3,Math.floor(Number(v.upgrades)||0)))};}
function merge(...lists){const map=new Map();for(const v of lists.flat()){const clean=item(v);if(clean){const old=map.get(clean.id);if(!old||clean.upgrades>=old.upgrades){map.delete(clean.id);map.set(clean.id,clean);}}}return [...map.values()].slice(-LIMIT);}
function loadout(list){const valid=merge(Array.isArray(list)?list:[]);return SLOTS.map(slot=>valid.find(i=>i.slot===slot)).filter(Boolean);}
function collect(){return [];}
function isPermanent(v){return !!v&&Object.hasOwn(C.GEAR.items,v.catalogId)&&v.id===C.GEAR.items[v.catalogId].id;}
function permanent(list){return merge(Array.isArray(list)?list:[]).filter(isPermanent);}
function seed(state){return state;}
return {isPermanent,permanent,LIMIT,catalog:()=>Object.values(C.GEAR.items).map(item),SLOTS,item,merge,loadout,collect,seed};
});
