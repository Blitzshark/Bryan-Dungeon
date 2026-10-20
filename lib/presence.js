'use strict';
const crypto=require('node:crypto'),{RoomError}=require('./room-store');
const KEY='__online_players__';
class PresenceService{
 constructor(store,{now=()=>Date.now()}={}){this.store=store;this.now=now;}
 async request(input,account=null){if(!/^[a-zA-Z0-9-]{24,80}$/.test(input.token||''))throw new RoomError(400,'Invalid presence session.');return this.store.locked(KEY,async()=>{const state=await this.store.get(KEY)||{kind:'tavern',people:[]},id=crypto.createHash('sha256').update(input.token).digest('hex');state.people=state.people.filter(p=>this.now()-p.seen<35000&&p.id!==id);if(input.op!=='presenceLeave'){if(state.people.length>=200)throw new RoomError(503,'The player list is busy.');const name=String(account?.username||input.name||'Adventurer').trim().replace(/\s+/g,' ').slice(0,18)||'Adventurer',place=['Menu','Tavern','Campaign','Raid','Camp'].includes(input.place)?input.place:'Menu';state.people.push({id,name,place,seen:this.now()});}await this.store.set(KEY,state);return {players:state.people.map(({id,name,place})=>({id,name,place})),serverNow:this.now()};});}
}
module.exports={PresenceService};
