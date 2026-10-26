'use strict';
const crypto=require('node:crypto'),{RoomError}=require('./room-store');
const fail=(status,message)=>{throw new RoomError(status,message);},hash=value=>crypto.createHash('sha256').update(String(value||'')).digest('hex');
// Resolve the authenticated speaker without tying voice to cosmetic features or combat turns.
class VoiceIdentity{
 constructor(store,rooms,{now=()=>Date.now()}={}){Object.assign(this,{store,rooms,now});}
 async context(input,token,account){const c=input.context||{};if(c.kind==='hub'){if(!account)fail(401,'Sign in to use the trading hub.');return {id:account.id,name:account.username};}if(c.kind==='tavern'){const room=await this.store.get('__tavern__'),person=room?.people.find(p=>p.id===c.id&&p.tokenHash===hash(c.token)&&this.now()-p.seen<60000);if(!person)fail(401,'Reconnect to the tavern.');return {id:person.id,name:person.profile.name};}const code=String(c.code||'').toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))fail(400,'Invalid voice room.');let room,member;if(c.kind==='party'){room=await this.rooms.load(code);if(!room)fail(404,'This party has closed.');member=this.rooms.member(room,token);member={...member,id:member.heroId};}else if(['duel','masq'].includes(c.kind)){room=await this.store.get((c.kind==='duel'?'__duel_':'__masquerade_')+code);if(!room)fail(404,'This room has closed.');member=room.members.find(m=>!m.left&&m.hash===hash(token));if(!member)fail(403,'This is not your room session.');}else fail(400,'Choose a voice area.');if(!room.state)return {id:member.id,name:member.name};const unit=[...room.state.party,...room.state.enemies].find(p=>p.id===member.id);if(!unit)fail(403,'Your character is not in this match.');return {id:member.id,name:unit.playerName||unit.name};}
}
module.exports={VoiceIdentity};
