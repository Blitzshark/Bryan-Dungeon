'use strict';
const crypto=require('node:crypto'),E=require('../campaign'),{RoomError}=require('./room-store');
const CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',SLOTS=['hero','rowan','mira'];
function fail(status,message){throw new RoomError(status,message);}
function cleanName(value){const name=String(value||'').trim().replace(/\s+/g,' ').slice(0,18);if(!name)fail(400,'Enter your adventurer name.');return name;}
function hash(token){return crypto.createHash('sha256').update(token).digest('hex');}
class RoomService{
 constructor(store,{now=()=>Date.now()}={}){this.store=store;this.now=now;}
 member(room,token){if(typeof token!=='string'||token.length<20)fail(401,'Rejoin the room to continue.');const h=hash(token),member=room.members.find(m=>m.tokenHash===h);if(!member)fail(401,'This session cannot access that room.');return member;}
 code(value){const code=String(value||'').trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))fail(400,'Enter the six-character room code.');return code;}
 view(room,member){const now=this.now();return {code:room.code,version:room.version,started:room.started,hostId:room.hostId,yourId:member.id,heroId:member.heroId,state:room.state,readyAt:room.readyAt,serverNow:now,storage:this.store.kind,members:room.members.map(m=>({id:m.id,name:m.name,heroId:m.heroId,ready:m.ready,online:now-m.seenAt<15000})),event:room.event||null};}
 async create(input){const name=cleanName(input.name),job=['warrior','ranger','mage'].includes(input.job)?input.job:'warrior';let code;
 for(let i=0;i<10;i++){code=Array.from(crypto.randomBytes(6),n=>CHARS[n%CHARS.length]).join('');if(!await this.store.get(code))break;if(i===9)fail(503,'Room creation is busy. Try again.');}
 return this.store.locked(code,async()=>{if(await this.store.get(code))fail(409,'Please create the room again.');const token=crypto.randomBytes(24).toString('hex'),id=crypto.randomUUID(),now=this.now(),member={id,name,heroId:'hero',tokenHash:hash(token),seenAt:now,ready:false};
 const room={code,hostId:id,members:[member],version:1,state:E.createRun(name,job),started:false,readyAt:now,nextEnemyAt:null,event:null,requests:[]};await this.store.set(code,room);return {...this.view(room,member),token};});}
 async join(input){const code=this.code(input.code),name=cleanName(input.name);return this.store.locked(code,async()=>{const room=await this.store.get(code);if(!room)fail(404,'That room has expired or does not exist.');if(room.started&&room.state.phase!=='camp')fail(409,'Your friends are in a fight. Join when they reach the campfire.');if(room.members.length>=3)fail(409,'This party already has three players.');
 const heroId=SLOTS.find(id=>!room.members.some(m=>m.heroId===id)),token=crypto.randomBytes(24).toString('hex'),id=crypto.randomUUID(),member={id,name,heroId,tokenHash:hash(token),seenAt:this.now(),ready:false};room.members.push(member);const p=room.state.party.find(p=>p.id===heroId);p.name=name;room.version++;room.members.forEach(m=>m.ready=false);await this.store.set(code,room);return {...this.view(room,member),token};});}
 canControl(room,member,heroId){const owner=room.members.find(m=>m.heroId===heroId);return !owner?member.id===room.hostId:owner.id===member.id||(member.id===room.hostId&&this.now()-owner.seenAt>=15000);}
 async poll(codeValue,token){const code=this.code(codeValue);let room=await this.store.get(code);if(!room)fail(404,'That room has expired. Create a new room.');let member=this.member(room,token);const due=room.started&&room.state.phase==='battle'&&E.active(room.state)?.side==='enemy'&&this.now()>=room.nextEnemyAt;
 const absentHost=room.members.find(m=>m.id===room.hostId);const transfer=absentHost&&absentHost.id!==member.id&&this.now()-absentHost.seenAt>=30000;
 if(due||transfer||this.now()-member.seenAt>7000)return this.store.locked(code,async()=>{room=await this.store.get(code);if(!room)fail(404,'That room has expired.');member=this.member(room,token);member.seenAt=this.now();const host=room.members.find(m=>m.id===room.hostId);if(host&&host.id!==member.id&&this.now()-host.seenAt>=30000){room.hostId=member.id;this.record(room);}
 if(room.started&&room.state.phase==='battle'&&E.active(room.state)?.side==='enemy'&&this.now()>=room.nextEnemyAt){const result=E.enemyAct(room.state);if(result.ok)this.record(room,result);}await this.store.set(code,room);return this.view(room,member);});
 return this.view(room,member);}
 record(room,result=null){room.version++;room.readyAt=this.now()+(result?.events?1500:0);room.nextEnemyAt=room.state.phase==='battle'&&E.active(room.state)?.side==='enemy'?room.readyAt+500:null;if(result?.events)room.event={id:room.version,result};else room.event=null;if(room.state.phase==='camp')room.members.forEach(m=>m.ready=false);}
 async command(input,token){const code=this.code(input.code);return this.store.locked(code,async()=>{const room=await this.store.get(code);if(!room)fail(404,'The room has expired.');const member=this.member(room,token);member.seenAt=this.now();const requestId=String(input.requestId||'');if(!/^[a-zA-Z0-9-]{8,80}$/.test(requestId))fail(400,'Invalid action identifier.');
 if(room.requests.includes(member.id+':'+requestId))return this.view(room,member);
 if(input.version!==room.version)fail(409,'The party state changed. Syncing the latest turn—try again.');
 const action=input.action;if(!action||typeof action.type!=='string')fail(400,'Choose an action.');let result=null;
 if(action.type==='start'){if(member.id!==room.hostId||room.started)fail(403,'Only the host can start a new room.');room.started=true;}
 else if(action.type==='leave'){
  room.members=room.members.filter(m=>m.id!==member.id);if(!room.members.length){await this.store.delete(code);return {left:true};}if(room.hostId===member.id)room.hostId=room.members[0].id;room.version++;await this.store.set(code,room);return {left:true};
 }else if(!room.started)fail(409,'Wait for the host to start the campaign.');
 else if(action.type==='act'){
  if(this.now()<room.readyAt)fail(409,'The last animation is still resolving.');const actor=E.active(room.state);if(!actor||!this.canControl(room,member,actor.id))fail(403,'It is another player’s turn.');result=E.act(room.state,action.command||{});if(!result.ok)fail(400,result.error);
 }else if(action.type==='ready'){if(room.state.phase!=='camp')fail(409,'Ready up at the campfire.');member.ready=!member.ready;}
 else if(action.type==='camp'){
  const cmd=action.command||{},item=room.state.inventory.find(i=>i.id===cmd.item),hero=cmd.hero||item?.owner;
  if([cmd.hero,item?.owner].filter(Boolean).some(id=>!this.canControl(room,member,id)))fail(403,'That gear belongs to another adventurer.');const changed=E.campAction(room.state,cmd);if(!changed.ok)fail(400,changed.error);room.members.forEach(m=>m.ready=false);
 }else if(['travel','choice','retry'].includes(action.type)){
  if(member.id!==room.hostId)fail(403,'The party host chooses when to travel.');
  if(action.type==='travel'){if(room.members.some(m=>this.now()-m.seenAt<15000&&!m.ready))fail(409,'Wait for everyone at the fire to ready up.');if(!E.travel(room.state))fail(409,'You cannot travel yet.');}
  else if(action.type==='choice'){if(!E.choose(room.state,action.choice))fail(409,'That story choice is no longer available.');}
  else if(!E.retry(room.state))fail(409,'There is no defeated battle to retry.');
 }else fail(400,'Unknown room action.');
 const preserveReady=action.type==='ready';const ready=room.members.map(m=>m.ready);this.record(room,result);if(preserveReady)room.members.forEach((m,i)=>m.ready=ready[i]);room.requests.push(member.id+':'+requestId);room.requests=room.requests.slice(-60);await this.store.set(code,room);return this.view(room,member);
 });}
}
module.exports={RoomService};
