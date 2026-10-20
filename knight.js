(function(){
'use strict';
class KnightScene extends CampaignScene{
 constructor(canvas){super(canvas);this.running=false;}
 resize(){super.resize();if(!this.state)return;this.scale=Math.min(innerWidth/(innerWidth<650?13:15),innerHeight/10);this.cx=innerWidth*.5;this.cy=innerHeight*.52;this.dirty=true;}
 poseFor(unit,index,time){const p=this.positionFor(unit,index),t=time-this.started;let facing=unit.side==='party'?Math.PI/2:-Math.PI/2,y=0,gesture=0;
  if(unit.id===this.knight.id){const rise=Math.max(0,Math.min(1,(t-900)/900));y=-(1-rise)*1.8;gesture=Math.sin(rise*Math.PI)*.35;}
  if(unit.side==='enemy'&&t>this.impactAt-300){const k=this.positionFor(this.knight,0),desired=Math.atan2(k.x-p.x,k.z-p.z),blend=Math.max(0,Math.min(1,(t-this.impactAt+300)/600)),delta=Math.atan2(Math.sin(desired-facing),Math.cos(desired-facing));facing+=delta*blend;}
  return {x:p.x,z:p.z,y,gesture,stride:0,swing:0,facing};
 }
 frame(time){if(this.running){const c=this.ctx,t=time-this.started,k=this.positionFor(this.knight,0),anchor=this.project(k.x,.6,k.z);this.paint=c;if(this.dirty)this.background();c.clearRect(0,0,this.width,this.height);c.save();const zoom=this.reduced?1:1+Math.sin(Math.min(1,t/this.duration)*Math.PI)*.12;c.translate(this.width/2,this.height*.48);c.scale(zoom,zoom);c.translate(-this.width/2,-this.height*.48);c.drawImage(this.cache,0,0,this.width,this.height);c.fillStyle='#07111b55';c.fillRect(0,0,this.width,this.height);
  // The gate rises first; the armored knight then steps out beneath its oath shield.
  c.save();c.translate(anchor.x,anchor.y+this.scale*.55);c.strokeStyle='#abd9ed';c.shadowColor='#88c8f5';c.shadowBlur=22;c.lineWidth=3;const portal=Math.max(0,Math.sin(Math.min(1,t/2800)*Math.PI));c.globalAlpha=portal;for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,-i*this.scale*.12,this.scale*(.8+i*.15),this.scale*.3,this.reduced?0:t/1800,0,Math.PI*2);c.stroke();}for(let i=0;i<18;i++){const x=Math.sin(i*7.4)*this.scale*.8,y=-((t/10+i*13)%160);c.fillStyle=i%2?'#e6f4ff':'#8ebee9';c.fillRect(x,y,2,9);}c.restore();
  const units=[...this.state.party,...this.state.summons,...this.state.enemies].filter(u=>u.hp>0).sort((a,b)=>{const p=this.positionFor(a,this.state.party.indexOf(a)),q=this.positionFor(b,this.state.party.indexOf(b));return p.x*.27+p.z*.47-q.x*.27-q.z*.47;});const title=this.title;this.title=true;for(const u of units){if(u.id===this.knight.id&&t<900)continue;const list=u.side==='enemy'?this.state.enemies:this.state.party;this.actor(u,list.indexOf(u),time);}this.title=title;
  if(t>=this.impactAt&&t<this.impactAt+1300){c.textAlign='center';c.font='900 '+Math.min(38,this.scale*.7)+'px Arial';c.fillStyle='#ffeaa0';c.strokeStyle='#4f2f12';c.lineWidth=4;c.shadowColor='#ffc94c';c.shadowBlur=14;for(const enemy of this.state.enemies.filter(e=>e.hp>0)){const p=this.point(enemy.id);if(!p)continue;const hop=this.reduced?0:Math.sin(Math.min(1,(t-this.impactAt)/350)*Math.PI)*12;c.strokeText('!',p.x,p.y-14-hop);c.fillText('!',p.x,p.y-14-hop);}c.shadowBlur=0;}
  c.restore();this.shield(c,t);c.fillStyle='#030a11';c.fillRect(0,0,this.width,this.height*.065);c.fillRect(0,this.height*.93,this.width,this.height*.07);}
 requestAnimationFrame(this.frame);}
 shield(c,t){if(t<200||t>this.impactAt+400)return;const progress=Math.max(0,Math.min(1,(t-200)/500)),exit=Math.max(0,Math.min(1,(t-this.impactAt)/400)),size=Math.min(this.width*.12,76)*(this.reduced?1:.55+.45*(1-Math.pow(1-progress,3))),x=this.width*.5,y=this.height*.31;
 c.save();c.translate(x,y);c.globalAlpha=(1-exit)*progress;c.fillStyle='#244b67ed';c.strokeStyle='#e0f4ff';c.shadowColor='#9adaff';c.shadowBlur=25;c.lineWidth=4;c.beginPath();c.moveTo(-size*.65,-size*.65);c.lineTo(0,-size*.85);c.lineTo(size*.65,-size*.65);c.lineTo(size*.58,size*.2);c.quadraticCurveTo(size*.3,size*.7,0,size*.95);c.quadraticCurveTo(-size*.3,size*.7,-size*.58,size*.2);c.closePath();c.fill();c.stroke();c.strokeStyle='#d7bd83';c.lineWidth=5;c.beginPath();c.moveTo(0,-size*.46);c.lineTo(0,size*.5);c.moveTo(-size*.34,-size*.12);c.lineTo(size*.34,-size*.12);c.stroke();c.restore();}
}
class KnightDirector{
 constructor(){this.canvas=document.createElement('canvas');this.canvas.className='knight-scene';this.canvas.hidden=true;this.canvas.setAttribute('aria-label','Oathbound Knight summon: shield and enemy taunt');document.body.append(this.canvas);this.scene=new KnightScene(this.canvas);this.active=false;}
 play(result,state,timing){const s=this.scene;s.state=structuredClone(state);s.knight=s.state.summons.find(k=>k.id===result.events.find(e=>e.type==='summon')?.target);if(!s.knight)return;this.active=true;s.started=performance.now();s.duration=timing.duration;s.impactAt=timing.impactAt;s.biome=DungeonCampaign.encounter(state).biome;s.camp=false;s.title=false;s.resize();s.running=true;this.canvas.hidden=false;clearTimeout(this.timer);this.timer=setTimeout(()=>this.stop(),timing.duration);}
 stop(){this.active=false;this.scene.running=false;this.canvas.hidden=true;}
}
window.KnightDirector=KnightDirector;
})();
