(function(){
'use strict';
class JourneyScene extends CampaignScene{
 constructor(canvas){super(canvas);this.running=false;}
 positionFor(unit,index){if(unit.npc)return {x:0,z:3.5};return {x:(index-1)*1.8,z:index===1?1.4:0};}
 poseFor(unit,index,time){
 const p=this.positionFor(unit,index),t=Math.min(1,(time-this.started)/this.duration),pulse=Math.sin(t*Math.PI),wave=Math.sin(t*18+index);let x=p.x,z=p.z,y=0,gesture=0,stride=0,swing=0,facing=Math.PI/2;
 if(this.kind!=='story'){x+=(t-.5)*10;stride=this.reduced?0:wave*.12;}
 else if(this.variant==='supply-handoff'){const step=Math.max(0,Math.min(1,(t-index*.14)*2));if(!unit.npc){x*=1-Math.sin(step*Math.PI)*.65;z+=Math.sin(step*Math.PI)*1.3;}gesture=.6;facing=unit.npc?Math.PI:0;stride=this.reduced?0:wave*.08;}
 else if(this.variant==='blade-lesson'){if(index===0){x+=pulse*.6;z+=pulse; swing=Math.sin(t*18)*.9;}else if(unit.npc)swing=Math.sin(t*18+.7);gesture=.25;facing=unit.npc?Math.PI:0;}
 else if(this.variant==='group-drill'){z=unit.npc?3.5:0;swing=Math.sin(t*22-index*.65)*.9;gesture=.3;facing=unit.npc?Math.PI:0;}
 else if(this.variant==='sparring'){x+=Math.sin(t*12+index)*.55;z+=Math.sin(t*12+index)*.3;swing=Math.sin(t*24+index)*1.1;y=this.reduced?0:Math.abs(Math.sin(t*12+index))*.12;facing=index%2?Math.PI/2:-Math.PI/2;}
 else if(this.variant==='medicine'){if(!unit.npc){x*=1-pulse*.3;z+=pulse*.6;y=-pulse*.16;}gesture=pulse*.4;facing=unit.npc?Math.PI:0;}
 else if(this.variant==='ember-procession'){if(!unit.npc){x+=(t-.2)*4;z+=t*.6;stride=this.reduced?0:wave*.1;gesture=index===0?.8:0;}}
 return {x,z,y,gesture,stride,swing:this.reduced?0:swing,facing};
 }
 drawStoryProps(t){const c=this.paint,v=this.variant;
 if(v==='supply-handoff'){this.box(0,.3,4.2,3.3,.45,1.3,'#8b6140');for(const x of [-1.3,1.3])for(const z of [3.7,4.7])this.box(x,.05,z,.4,.55,.4,'#493c32');for(let i=0;i<4;i++)this.box(-1+i*.65,.8,4.2,.48,.48,.5,'#b89665');for(let i=0;i<3;i++){const a=Math.max(0,Math.min(1,(t-i*.16)*2)),p=this.project((i-1)*1.2*a,.9+Math.sin(a*Math.PI),3.2-a*2);c.fillStyle='#e5c78e';c.fillRect(p.x-5,p.y-5,10,10);}}
 else if(v==='medicine'||v==='ember-procession'){this.box(0,.02,3.7,2.5,.3,1.5,'#7a827a');this.box(0,.32,4,.6,1.4,.5,'#a3aea4');for(let i=0;i<3;i++){const p=this.project((i-1)*1.3,1+Math.sin(t*Math.PI)*.6,1.5);c.fillStyle=v==='medicine'?'#a3e8dc':'#ffd78b';c.shadowColor=c.fillStyle;c.shadowBlur=14;if(v==='medicine'){c.fillRect(p.x-3,p.y-6,6,12);c.fillStyle='#f0e6c9';c.fillRect(p.x-2,p.y-9,4,3);}else{c.beginPath();c.arc(p.x+t*80,p.y-10,4,0,Math.PI*2);c.fill();}c.shadowBlur=0;}}
 else if(v==='blade-lesson'){this.box(-2,.02,3,.22,1.1,.22,'#8a694d');this.box(-2,.7,3,.7,.15,.2,'#c1a376');const p=this.project(0,1.5,2.5);c.strokeStyle='#d8c9ef';c.beginPath();c.arc(p.x,p.y,18,-2+t*2,t*2);c.stroke();}
 else if(v==='group-drill'){for(let i=0;i<3;i++)this.plane((i-1)*1.8-.4,1,.8,1,'#9f8a68');}
 else if(v==='sparring'){for(const x of [-2.4,2.4]){this.box(x,.02,3,.16,1.1,.2,'#8a664c');this.box(x,.7,3,1,.15,.2,'#bd9870');}const p=this.project(0,1.4,1.8);c.strokeStyle='#ffe0ac';for(let i=0;i<5;i++){const a=i*Math.PI*2/5+t*8;c.beginPath();c.moveTo(p.x+Math.cos(a)*8,p.y+Math.sin(a)*8);c.lineTo(p.x+Math.cos(a)*18,p.y+Math.sin(a)*18);c.stroke();}}
 }
 frame(time){if(this.running){this.paint=this.ctx;const c=this.ctx,t=Math.min(1,(time-this.started)/this.duration);if(this.kind==='world'&&t>.5&&this.biome!==this.nextBiome){this.biome=this.nextBiome;this.dirty=true;}if(this.dirty)this.background();c.clearRect(0,0,this.width,this.height);c.drawImage(this.cache,0,0,this.width,this.height);if(this.kind==='world'){for(const x of [-2,2])this.box(x,0,-2,.8,5,1,'#6b7064');this.box(0,4.5,-2,4.7,.7,1,'#747b6c');}const title=this.title;this.title=true;this.state.party.forEach((p,i)=>this.actor(p,i,time));this.title=title;if(this.kind==='story'){const guide={...DungeonCampaign.hero('guide','Traveler',this.variant==='medicine'||this.variant==='ember-procession'?'mage':this.variant==='supply-handoff'?'warrior':'rogue'),npc:true};this.title=true;this.actor(guide,3,time);this.title=title;}if(this.kind==='story')this.drawStoryProps(t);c.fillStyle='#0b1011';c.fillRect(0,0,this.width,this.height*.09);c.fillRect(0,this.height*.88,this.width,this.height*.12);c.fillStyle='#e8dec1';c.textAlign='center';c.font='16px Georgia';c.fillText(this.caption,this.width/2,this.height*.94);const fade=Math.max(0,1-t*7,t*7-6,this.kind==='world'?1-Math.abs(t-.5)*10:0);c.fillStyle='rgba(5,9,9,'+fade+')';c.fillRect(0,0,this.width,this.height);}requestAnimationFrame(this.frame);}
}
class JourneyDirector{
 constructor(){this.canvas=document.createElement('canvas');this.canvas.className='journey-scene';this.canvas.hidden=true;document.body.append(this.canvas);this.scene=new JourneyScene(this.canvas);}
 play({kind='enter',party,from='forest',to=from,choice='accept',story='crossroads'}){const s=this.scene;s.kind=kind;s.choice=choice;s.variant=story==='stranger'?(choice==='accept'?'blade-lesson':'group-drill'):story==='shrine'?(choice==='accept'?'medicine':'ember-procession'):(choice==='accept'?'supply-handoff':'sparring');s.started=performance.now();s.duration=kind==='world'?3200:kind==='story'?2400:1100;s.biome=from;s.nextBiome=to;s.title=false;s.camp=false;s.state={phase:'journey',party:structuredClone(party),enemies:[],inventory:[]};s.caption=kind==='world'?'From '+({forest:'the Greenwood',crypt:'the Ashen Dungeon',throne:'the Hollow Depths'}[from])+' to '+({forest:'the Greenwood',crypt:'the Ashen Dungeon',throne:'the Hollow Depths'}[to])+'.':kind==='enter'?'Into the fray.':kind==='leave'?'Back to the fire.':story==='stranger'?(choice==='accept'?'The traveler demonstrates. You follow the blade.':'Your companions practice the traveler’s techniques.'):story==='shrine'?(choice==='accept'?'The party gathers medicine from the shrine.':'Together, you carry the ember onward.'):(choice==='accept'?'The caravan shares supplies with your party.':'Everyone joins the evening practice.');s.resize();s.dirty=true;s.running=true;this.canvas.hidden=false;return new Promise(resolve=>setTimeout(()=>{s.running=false;this.canvas.hidden=true;resolve();},s.duration));}
}
window.JourneyDirector=JourneyDirector;
})();
