(function(){
'use strict';
const KEY='hollow-road-room-v5',SERVER_KEY='hollow-road-server';
class OnlineParty{
 constructor(){this.server=null;this.discovery=null;this.connectionVersion=0;this.preference='';try{this.preference=localStorage.getItem(SERVER_KEY)||'';}catch{}this.session=null;this.room=null;this.timer=null;this.inFlight=false;this.closed=false;this.lastEvent=null;this.onUpdate=()=>{};this.onError=()=>{};try{const saved=JSON.parse(sessionStorage.getItem(KEY)||'null');if(saved?.code&&saved?.token)this.session=saved;}catch{}}
 get serverPreference(){return this.preference;}
 setServer(value){
  if(this.room)throw Error('Leave your current room before changing servers.');
  const raw=String(value||'').trim();let server='';if(raw){let url;try{url=new URL(raw);}catch{throw Error('Paste the full game website link, beginning with https://.');}if(url.username||url.password||!['https:','http:'].includes(url.protocol)||url.protocol==='http:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw Error('Use a public HTTPS game link. Do not enter a dashboard link or credentials.');if(url.hostname==='vercel.com')throw Error('Use the game link ending in .vercel.app, not the Vercel dashboard link.');server=url.origin;}
  this.preference=server;this.connectionVersion++;try{if(server)localStorage.setItem(SERVER_KEY,server);else localStorage.removeItem(SERVER_KEY);}catch{}this.server=null;this.discovery=null;
 }
 async connect(){
  if(this.server!==null)return;
  if(this.discovery)return this.discovery;
  const version=this.connectionVersion;const attempt=(async()=>{const configured=this.serverPreference||window.HOLLOW_ROAD_SERVER,servers=configured?[String(configured).replace(/\/$/,'')]:['','https://bryan-basement-git-main-bryanwei1228-8505s-projects.vercel.app'];const problems=[];
   for(const server of [...new Set(servers)]){try{const response=await fetch(server+'/api/rooms?status=1',{cache:'no-store',signal:AbortSignal.timeout(5000)});const host=server?new URL(server).host:location.host;if([401,403].includes(response.status)){problems.push(host+': access restricted. Use your public production game link.');continue;}if(!(response.headers.get('content-type')||'').includes('application/json')){problems.push(host+': room API not found.');continue;}const data=await response.json();if(!response.ok){problems.push(host+': '+(data.error||'Server error '+response.status));continue;}if(data.ok){if(version!==this.connectionVersion)throw Error('Connection settings changed.');this.server=server;return;}problems.push(host+': room API is not ready.');}catch{problems.push((server||location.origin)+': could not connect.');}}
   throw Error(problems.join(' ')+' Retry, or set your deployed game link below.');})();
  this.discovery=attempt;try{await attempt;}finally{if(this.discovery===attempt)this.discovery=null;}
 }
 async request(body=null,code=null,query='status=1'){
  await this.connect();const headers={'Content-Type':'application/json'};if((code||body?.op==='command')&&this.session?.token)headers.Authorization='Bearer '+this.session.token;
  let response;try{response=await fetch(this.server+(body?'/api/rooms':'/api/rooms?'+(code?'code='+encodeURIComponent(code):query)),{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(12000)});}catch{throw Error('Cannot reach the room server. Check your connection and retry.');}
  if(!(response.headers.get('content-type')||'').includes('application/json'))throw Error('The room server returned an invalid response. Try again shortly.');
  const data=await response.json();if(!response.ok){const e=Error(data.error||'The room request failed.');e.status=response.status;throw e;}return data;
 }
 async status(){return this.request();}
 async list(mode='all'){return this.request(null,null,'list=1&mode='+encodeURIComponent(mode));}
 accept(data,initial=false){if(this.room?.code===data.code&&data.version<this.room.version)return;if(data.token){this.session={code:data.code,token:data.token,server:this.server};sessionStorage.setItem(KEY,JSON.stringify(this.session));}if(initial)this.lastEvent=null;this.room=data;this.clockOffset=data.serverNow-Date.now();const event=initial?null:data.event&&data.event.id!==this.lastEvent?data.event.result:null;this.lastEvent=data.event?.id||this.lastEvent;this.onUpdate(data,event,initial);}
 async create(name,job,mode='campaign',listed=true){this.closed=false;const data=await this.request({op:'create',name,job,mode,listed});this.accept(data,true);this.schedule();return data;}
 async join(code,name){this.closed=false;const data=await this.request({op:'join',code,name});this.accept(data,true);this.schedule();return data;}
 async resume(){if(!this.session)throw Error('There is no room to resume in this browser tab.');this.closed=false;if(typeof this.session.server==='string')this.server=this.session.server;const data=await this.request(null,this.session.code);this.accept(data,true);this.schedule();return data;}
 schedule(){clearTimeout(this.timer);if(this.closed||!this.session)return;this.timer=setTimeout(()=>this.poll(),1200);}
 async poll(){if(this.closed||!this.session||this.inFlight){this.schedule();return;}try{const data=await this.request(null,this.session.code);if(!this.closed)this.accept(data);}catch(error){this.onError(error);if([401,404].includes(error.status)){this.stop();return;}}finally{this.schedule();}}
 async send(action){if(this.inFlight||!this.room)throw Error('Wait for the party to finish syncing.');this.inFlight=true;try{const data=await this.request({op:'command',code:this.session.code,version:this.room.version,requestId:crypto.randomUUID(),action});if(data.left){this.stop(true);return data;}this.accept(data);return data;}catch(error){this.poll().catch(()=>{});throw error;}finally{this.inFlight=false;this.schedule();}}
 controls(hero){const room=this.room;if(!room)return true;const owner=room.members.find(m=>m.heroId===hero);return !owner?room.yourId===room.hostId:owner.id===room.yourId||(!owner.online&&room.yourId===room.hostId);}
 ready(){return !this.room||Date.now()+(this.clockOffset||0)>=this.room.readyAt;}
 stop(forget=false){this.closed=true;clearTimeout(this.timer);if(forget){this.session=null;sessionStorage.removeItem(KEY);}this.room=null;}
}
window.OnlineParty=OnlineParty;
})();
