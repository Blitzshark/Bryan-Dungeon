(function(){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),turn=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
class TradingHubScene extends window.CampaignScene{
 constructor(owner,npcs){super(owner.canvas);this.owner=owner;this.npcs=npcs;this.state={party:[],enemies:[],order:[],cursor:0};this.title=true;}
 resize(){super.resize();this.scale=Math.min(this.width/20,this.height/15);this.cx=this.width*.5;this.cy=this.height*.53;this.dirty=true;}
 background(){this.paint=this.cache.getContext('2d');this.paint.setTransform(this.dpr,0,0,this.dpr,0,0);const c=this.paint,g=c.createLinearGradient(0,0,0,this.height);g.addColorStop(0,'#152b35');g.addColorStop(1,'#0c191d');c.fillStyle=g;c.fillRect(0,0,this.width,this.height);
 // A stone promenade sits over the canal, framed by a lantern arcade.
 for(let x=-10;x<10;x++)for(let z=-8;z<9;z++)this.plane(x,z,1,1,'#173f49');
 this.box(0,-.65,0,16,.55,12,'#36494a');for(let x=-8;x<8;x++)for(let z=-6;z<6;z++){this.plane(x,z,.98,.98,['#68746c','#748073','#606f68'][Math.abs(x*3+z*7)%3]);if(z===1||x===-1)this.plane(x+.43,z,.08,.98,'#b5a375');}
 for(const x of [-7.3,7.3]){this.box(x,0,0,.22,.65,11.5,'#9b9b80');for(const z of [-5,-1,3,5]){this.box(x,0,z,.48,1,.48,'#8b947e');this.box(x,1,z,.65,.18,.65,'#b6b598');}}
 for(const x of [-6.6,6.6])for(const z of [-4.5,1,4.5]){this.box(x,0,z,.25,2.8,.25,'#394b43');this.box(x,2.6,z,.7,.7,.7,'#ddba78');this.box(x,3.3,z,.9,.13,.9,'#4e6151');}
 for(const n of this.npcs){const {x,z,color}=n;this.box(x,0,z+.65,2.8,.9,1,'#69513e');this.box(x,.9,z+.65,3,.12,1.15,'#bd9d70');for(const dx of [-1.3,1.3])this.box(x+dx,0,z+.55,.12,3.2,.12,'#aa906c');for(let i=0;i<6;i++)this.box(x-1.25+i*.5,3,z+.45,.49,.18,2,i%2?color:'#d3c09a');this.box(x,2.65,z-.05,1.9,.35,.12,'#423a32');for(let i=0;i<5;i++){const h=.16+(i%3)*.1;this.box(x-1+i*.48,1.04,z+.65,.25,h,.28,i%2?'#9bd1cb':'#d4b267');}}
 // Raised fountain, inset tiles, and flower boxes keep the center inviting.
 this.box(0,0,0,2.2,.3,2.2,'#aaa98a');this.box(0,.3,0,1.85,.12,1.85,'#4c9b9b');this.box(0,.42,0,.5,1.1,.5,'#b0b9a0');this.box(0,1.5,0,1.25,.16,1.25,'#bfbea1');this.box(0,1.66,0,.85,.05,.85,'#83d3cb');
 for(const x of [-5,5])for(const z of [1.5,4.5]){this.box(x,0,z,1.25,.45,.7,'#675747');for(let i=0;i<4;i++){this.box(x-.45+i*.3,.45,z,.3,.4,.5,'#607f58');this.box(x-.45+i*.3,.85,z,.13,.13,.13,i%2?'#e1b07e':'#c29cbc');}}
 for(const x of [-2.4,2.4]){this.box(x,0,4.7,1.8,.45,.65,'#584a3b');this.box(x,0,5,.12,1.1,.12,'#99805e');this.box(x,0,4.4,.12,1.1,.12,'#99805e');}
 this.dirty=false;this.paint=this.ctx;
 }
 atmosphere(time){const c=this.ctx;for(const x of [-6.6,6.6])for(const z of [-4.5,1,4.5]){const p=this.project(x,2.8,z),r=this.scale*1.2,g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'#ffd78a38');g.addColorStop(1,'#ffd78a00');c.fillStyle=g;c.fillRect(p.x-r,p.y-r,r*2,r*2);}
 if(!this.reduced)for(let i=0;i<15;i++){const t=time/1000+i*.72,p=this.project(Math.sin(i*7)*5.5,.6+Math.sin(t*.6)*.3,Math.cos(i*3)*4);c.globalAlpha=.15+Math.max(0,Math.sin(t))*.45;c.fillStyle='#efd9a1';c.beginPath();c.arc(p.x,p.y,1.4,0,Math.PI*2);c.fill();}c.globalAlpha=1;
 if(!this.reduced)for(let i=0;i<4;i++){const t=(time/1500+i/4)%1,p=this.project(0,1.7,0);c.strokeStyle='#adf4df';c.globalAlpha=(1-t)*.45;c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y,this.scale*t*.5,this.scale*t*.18,0,0,Math.PI*2);c.stroke();}c.globalAlpha=1;
 }
 walkable(x,z){return Math.hypot(x,z)>1.28&&!(z< -2.5&&this.npcs.some(n=>Math.abs(x-n.x)<1.6));}
 frame(time){const o=this.owner;if(o?.active){const dt=clamp((time-o.last)/1000,0,.05);o.last=time;const free=document.getElementById('modal').hidden;let dx=free?Number(o.keys.has('d')||o.keys.has('arrowright'))-Number(o.keys.has('a')||o.keys.has('arrowleft')):0,dz=free?Number(o.keys.has('s')||o.keys.has('arrowdown'))-Number(o.keys.has('w')||o.keys.has('arrowup')):0,len=Math.hypot(dx,dz)||1,blend=1-Math.exp(-dt*18);o.vx+=(dx/len*3-o.vx)*blend;o.vz+=(dz/len*3-o.vz)*blend;if(!free)o.vx=o.vz=0;const nx=clamp(o.x+o.vx*dt,-6,6),nz=clamp(o.z+o.vz*dt,-4,4);if(this.walkable(nx,o.z))o.x=nx;if(this.walkable(o.x,nz))o.z=nz;o.moving=free&&Math.hypot(o.vx,o.vz)>.08;if(o.moving)o.facing=turn(o.facing,Math.atan2(o.vx,o.vz),1-Math.exp(-dt*14));o.hubLive?.broadcast({x:o.x,z:o.z,facing:o.facing,moving:o.moving},time);o.updateTalk();
 const c=this.ctx;this.paint=c;if(this.dirty)this.background();c.clearRect(0,0,this.width,this.height);c.drawImage(this.cache,0,0,this.width,this.height);this.atmosphere(time);const list=this.npcs.map((n,i)=>({...DungeonCampaign.hero('vendor-'+n.id,n.name,'mage'),appearance:HeroOptions.appearance({clothes:n.color,outfit:'coat'}),x:n.x+(this.reduced?0:Math.sin(time/2400+i)*.04),z:n.z,npc:true,role:n.role,facing:0}));
 for(const f of o.travelers||[]){if(f.id===o.data?.me.id)continue;const pose=o.hubLive?.pose(f.id,time)||o.remoteHub?.get(f.id)?.render(Date.now()-(o.hubClock||0),time)||f;list.push({...DungeonCampaign.hero(f.id,f.username,'warrior'),...pose,appearance:f.appearance,remote:true});}
 const profile=o.getProfile(),local={...DungeonCampaign.hero('hub-local',o.data?.me.username||profile.name,profile.job),appearance:profile.appearance,x:o.x,z:o.z,facing:o.facing,moving:o.moving};list.push(local);this.state.party=list;list.sort((a,b)=>a.x*.27+a.z*.47-b.x*.27-b.z*.47).forEach((p,i)=>{c.save();c.globalAlpha=p.remote?.9:1;this.actor(p,i,time);const q=this.project(p.x,2.15,p.z);c.font='600 11px Arial';c.textAlign='center';const w=c.measureText(p.name).width;c.fillStyle='#0d1b20bb';c.fillRect(q.x-w/2-7,q.y-12,w+14,18);c.fillStyle=p.npc?'#edce97':'#e9efdc';c.fillText(p.name,q.x,q.y);if(p.npc){c.font='9px Arial';c.fillStyle='#c6d4c3';c.fillText(p.role,q.x,q.y+16);}c.restore();});}requestAnimationFrame(this.frame);}
 positionFor(u){return {x:u.x,z:u.z};}
 poseFor(u,i,time){return {x:u.x,z:u.z,y:0,gesture:0,stride:u.moving&&!this.reduced?Math.sin(time/80)*.13:0,facing:u.facing??Math.PI/2};}
}
window.TradingHubScene=TradingHubScene;
})();
