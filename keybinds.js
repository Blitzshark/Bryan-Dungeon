(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.BattleKeybinds=factory();})(typeof window==='object'?window:globalThis,function(){
'use strict';
const reserved=new Set(['escape','tab','/','control','alt','meta','shift','f5','f11','f12']);
function normalize(key){key=String(key||'').toLowerCase();return key===' '?'space':key;}
function allowed(key){return /^[a-z0-9]$/.test(key)||['space','enter','backspace','arrowleft','arrowright','arrowup','arrowdown','home','end','pageup','pagedown','insert','delete','f1','f2','f3','f4','f6','f7','f8','f9','f10','-','=','[',']',';',"'",',','.','`','\\'].includes(key);}
function label(key){return {space:'Space',arrowleft:'←',arrowright:'→',arrowup:'↑',arrowdown:'↓',backspace:'Backspace',enter:'Enter'}[key]||key?.toUpperCase()||'Unbound';}
class Bindings{
 constructor(storage,key){this.storage=storage;this.key=key;this.custom={};try{const data=JSON.parse(storage.getItem(key)||'{}');if(data&&typeof data==='object'&&!Array.isArray(data))for(const [id,value]of Object.entries(data))if(typeof value==='string'&&(value===''||allowed(value)&&!reserved.has(value)))this.custom[id]=value;}catch{}}
 resolve(entries){const result=new Map(),used=new Set();for(const e of entries){if(result.has(e.id)||!Object.hasOwn(this.custom,e.id))continue;const key=this.custom[e.id];result.set(e.id,key&&!used.has(key)?key:'');if(key)used.add(key);}for(const e of entries){if(result.has(e.id))continue;const key=normalize(e.key);result.set(e.id,key&&!used.has(key)?key:'');if(key)used.add(key);}return result;}
 set(id,key,entries){key=normalize(key);if(key&&(!allowed(key)||reserved.has(key)))return 'Choose a letter, number, arrow or supported key. Escape, Tab and / stay reserved.';const bindings=this.resolve(entries);const conflict=entries.find(e=>e.id!==id&&bindings.get(e.id)===key&&key);if(conflict)return label(key)+' is used by '+conflict.label+'. Clear or change that binding first.';this.custom[id]=key;this.save();return null;}
 save(){try{this.storage.setItem(this.key,JSON.stringify(this.custom));}catch{}}
 reset(){this.custom={};this.save();}
}
return {Bindings,normalize,label};
});
