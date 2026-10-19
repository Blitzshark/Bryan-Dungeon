(function(){
'use strict';
const KEY='hollow-road-room-v5';
class OnlineParty{
 constructor(){this.session=null;this.room=null;this.timer=null;this.inFlight=false;this.closed=false;this.lastEvent=null;this.onUpdate=()=>{};this.onError=()=>{};try{const saved=JSON.parse(sessionStorage.getItem(KEY)||'null');if(saved?.code&&saved?.token)this.session=saved;}catch{}}
 async request(body=null,code=null){
  const headers={'Content-Type':'application/json'};if(this.session?.token)headers.Authorization='Bearer '+this.session.token;
  let response;try{response=await fetch(body?'/api/rooms':'/api/rooms?'+(code?'code='+encodeURIComponent(code):'status=1'),{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(12000)});}catch{throw Error('Cannot reach the room server. Check your connection and retry.');}
  const type=response.headers.get('content-type')||'';if(!type.includes('application/json'))throw Error('Online rooms run on the Vercel version of the game. Open your Vercel site to play online.');
  const data=await response.json();if(!response.ok){const e=Error(data.error||'The room request failed.');e.status=response.status;throw e;}return data;
 }
 async status(){return this.request();}
 accept(data,initial=false){if(this.room?.code===data.code&&data.version<this.room.version)return;if(data.token){this.session={code:data.code,token:data.token};sessionStorage.setItem(KEY,JSON.stringify(this.session));}if(initial)this.lastEvent=null;this.room=data;this.clockOffset=data.serverNow-Date.now();const event=initial?null:data.event&&data.event.id!==this.lastEvent?data.event.result:null;this.lastEvent=data.event?.id||this.lastEvent;this.onUpdate(data,event,initial);}
 async create(name,job){this.closed=false;const data=await this.request({op:'create',name,job});this.accept(data,true);this.schedule();return data;}
 async join(code,name){this.closed=false;const data=await this.request({op:'join',code,name});this.accept(data,true);this.schedule();return data;}
 async resume(){if(!this.session)throw Error('There is no room to resume in this browser tab.');this.closed=false;const data=await this.request(null,this.session.code);this.accept(data,true);this.schedule();return data;}
 schedule(){clearTimeout(this.timer);if(this.closed||!this.session)return;this.timer=setTimeout(()=>this.poll(),1200);}
 async poll(){if(this.closed||!this.session||this.inFlight){this.schedule();return;}try{const data=await this.request(null,this.session.code);if(!this.closed)this.accept(data);}catch(error){this.onError(error);if([401,404].includes(error.status)){this.stop();return;}}finally{this.schedule();}}
 async send(action){if(this.inFlight||!this.room)throw Error('Wait for the party to finish syncing.');this.inFlight=true;try{const data=await this.request({op:'command',code:this.session.code,version:this.room.version,requestId:crypto.randomUUID(),action});if(data.left){this.stop(true);return data;}this.accept(data);return data;}catch(error){this.poll().catch(()=>{});throw error;}finally{this.inFlight=false;this.schedule();}}
 controls(hero){const room=this.room;if(!room)return true;const owner=room.members.find(m=>m.heroId===hero);return !owner?room.yourId===room.hostId:owner.id===room.yourId||(!owner.online&&room.yourId===room.hostId);}
 ready(){return !this.room||Date.now()+(this.clockOffset||0)>=this.room.readyAt;}
 stop(forget=false){this.closed=true;clearTimeout(this.timer);if(forget){this.session=null;sessionStorage.removeItem(KEY);}this.room=null;}
}
window.OnlineParty=OnlineParty;
})();
