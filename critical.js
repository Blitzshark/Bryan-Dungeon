(function(){
'use strict';
class CriticalScene extends CampaignScene{
 constructor(canvas){super(canvas);this.running=false;}
 resize(){super.resize();this.scale=Math.min(innerWidth/6.2,innerHeight/4.8);this.cx=innerWidth*.5;this.cy=innerHeight*.66;this.dirty=true;}
 positionFor(unit){return {x:unit.id===this.result.actor?-1.5:1.4,z:0};}
 poseFor(unit,index,time){const p=this.positionFor(unit),t=Math.min(1,(time-this.started)/this.duration),attacker=unit.id===this.result.actor,hit=this.impactAt/this.duration;if(!attacker)return {x:p.x,z:0,y:0,stride:0,gesture:0,swing:0,facing:-Math.PI/2};const approach=Math.min(1,t/.32),ease=approach*approach*(3-2*approach),swing=t<hit?-.2-1.4*Math.min(1,(t-.25)/.3):2.2*Math.max(0,1-(t-hit)/.3);return {x:p.x+ease*2.05,z:0,y:this.reduced?0:Math.sin(Math.max(0,Math.min(1,(t-.25)/.45))*Math.PI)*.22,stride:t<.3&&!this.reduced?Math.sin(t*40)*.12:0,gesture:.5,swing,facing:Math.PI/2};}
 frame(time){if(this.running){const c=this.ctx,t=time-this.started;this.paint=c;if(this.dirty)this.background();c.clearRect(0,0,this.width,this.height);c.drawImage(this.cache,0,0,this.width,this.height);if(t>=this.impactAt&&!this.applied){for(const e of this.result.events){const u=DungeonCampaign.unit(this.state,e.target);if(u&&e.type==='damage')u.hp=Math.max(0,u.hp-e.amount);}this.applied=true;}c.fillStyle='#080b1570';c.fillRect(0,0,this.width,this.height);const title=this.title;this.title=true;this.actor(this.attacker,0,time);this.actor(this.target,1,time);this.title=title;this.drawDefeats(time);const p=this.project(1.4,1,0),hit=t>=this.impactAt;
 if(hit){c.save();const elapsed=t-this.impactAt;c.strokeStyle='#ffe269';c.lineWidth=8;c.shadowColor='#ffc34d';c.shadowBlur=22;for(let i=0;i<9;i++){const a=i*Math.PI*2/9,r=this.scale*(.25+Math.min(1,elapsed/400)*1.2);c.beginPath();c.moveTo(p.x+Math.cos(a)*r*.3,p.y+Math.sin(a)*r*.3);c.lineTo(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r);c.stroke();}if(!this.reduced&&elapsed<100){c.globalCompositeOperation='difference';c.fillStyle='#fff4cc';c.fillRect(0,0,this.width,this.height);}c.restore();c.fillStyle='#ffdc44';c.strokeStyle='#281c07';c.lineWidth=6;c.font='900 '+Math.min(66,this.width*.07)+'px Impact, sans-serif';c.textAlign='center';const x=Math.min(this.width*.7,p.x),y=Math.max(95,p.y-this.scale*.95);c.strokeText('CRITICAL HIT',x,y);c.fillText('CRITICAL HIT',x,y);}
 c.fillStyle='#06090d';c.fillRect(0,0,this.width,Math.min(60,this.height*.08));c.fillRect(0,this.height*.88,this.width,this.height*.12);
 }requestAnimationFrame(this.frame);}
}
class CriticalDirector{
 constructor(){this.canvas=document.createElement('canvas');this.canvas.className='critical-scene';this.canvas.hidden=true;document.body.append(this.canvas);this.scene=new CriticalScene(this.canvas);this.active=false;}
 play(result,state,timing){this.active=true;const s=this.scene;s.result=result;s.applied=false;s.state=structuredClone(state);s.attacker=DungeonCampaign.unit(s.state,result.actor);s.target=DungeonCampaign.unit(s.state,result.events.find(e=>e.critical)?.target);if(!s.attacker||!s.target)return this.stop();s.biome=DungeonCampaign.encounter(state).biome;s.layoutSeed=DungeonCampaign.encounter(state).scenerySeed||0;s.started=performance.now();s.duration=timing.duration;s.impactAt=timing.impactAt;s.title=false;s.resize();s.effects=result.events.map(e=>({...e,at:s.started+timing.impactAt,style:timing.style}));s.running=true;this.canvas.hidden=false;clearTimeout(this.timer);this.timer=setTimeout(()=>this.stop(),s.duration);}
 point(id){const point=this.scene.point(id);if(point)return point;const target=this.scene.point(this.scene.target?.id);if(!target)return null;const ids=[...new Set(this.scene.result.events.filter(e=>e.type==='damage').map(e=>e.target))],index=ids.indexOf(id);return index<0?null:{...target,x:Math.max(80,Math.min(innerWidth-170,target.x-120)),y:target.y+45*(index+1)};}
 stop(){this.active=false;this.scene.running=false;this.canvas.hidden=true;}
}
window.CriticalDirector=CriticalDirector;
})();
