'use strict';
const crypto=require('node:crypto'),P=require('../hero-options'),{RoomError}=require('./room-store');
const KEY='__tavern__',hash=t=>crypto.createHash('sha256').update(String(t)).digest('hex');
class TavernService{
 constructor(store,{now=()=>Date.now()}={}){this.store=store;this.now=now;}
 public(person){return {id:person.id,name:person.profile.name,job:person.profile.job,race:person.profile.race,weapon:person.profile.weapon,appearance:person.profile.appearance,x:person.x,z:person.z,facing:person.facing,moving:person.moving,at:person.movedAt};}
 async request(input){if(!['tavernJoin','tavernMove','tavernProfile','tavernShop','tavernLeave'].includes(input.op))throw new RoomError(400,'Unknown tavern action.');return this.store.locked(KEY,async()=>{const room=await this.store.get(KEY)||{kind:'tavern',people:[]};room.people=room.people.filter(p=>this.now()-p.seen<20000);let person=room.people.find(p=>p.id===input.id&&p.tokenHash===hash(input.token||'')),token;
  if(input.op==='tavernJoin'){
   if(!person){if(room.people.length>=40)throw new RoomError(409,'The tavern is full. Try again shortly.');token=crypto.randomBytes(24).toString('hex');person={id:crypto.randomUUID(),tokenHash:hash(token),profile:P.profile(input.profile),profileVersion:1,x:(Math.random()-.5)*2,z:3,seen:this.now(),movedAt:this.now(),facing:0,moving:false};room.people.push(person);}
  }else if(!person)throw new RoomError(401,'Your tavern visit expired. Reconnect to see other visitors.');
  if(input.op==='tavernLeave'){room.people=room.people.filter(p=>p!==person);await this.store.set(KEY,room);return {left:true};}
  if(input.op==='tavernMove'){
   const x=Number(input.x),z=Number(input.z),elapsed=Math.min(2,Math.max(.15,(this.now()-person.movedAt)/1000)),limit=elapsed*4.2+.3;if(!Number.isFinite(x)||!Number.isFinite(z)||Math.hypot(x-person.x,z-person.z)>limit)throw new RoomError(400,'Move a little closer before trying again.');person.x=Math.max(-6.3,Math.min(6.3,x));person.z=Math.max(-4.8,Math.min(5.1,z));person.facing=Number.isFinite(input.facing)?input.facing:0;person.moving=!!input.moving;person.movedAt=this.now();
  }
  if(input.op==='tavernProfile'){const next=P.profile(input.profile);person.profile.name=next.name;person.profile.appearance=next.appearance;person.profileVersion=(person.profileVersion||0)+1;for(const [type,key]of [['classes','job'],['races','race'],['weapons','weapon']])if(person.profile[type].includes(next[key]))person.profile[key]=next[key];}
  if(input.op==='tavernShop'){if(Math.hypot(person.x-3,person.z+4.5)>3)throw new RoomError(400,'Walk to Alden at the bar to trade.');const changed=input.action==='equip'?P.equip(person.profile,input.type,input.item):P.purchase(person.profile,input.type,input.item);if(!changed.ok)throw new RoomError(400,changed.error);person.profileVersion=(person.profileVersion||0)+1;}
  person.seen=this.now();await this.store.set(KEY,room);return {id:person.id,...(token?{token}:{}),profile:person.profile,profileVersion:person.profileVersion,x:person.x,z:person.z,people:room.people.map(p=>this.public(p)),serverNow:this.now()};
 });}
}
module.exports={TavernService};
