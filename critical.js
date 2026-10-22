(function(){
'use strict';
class CriticalScene extends CampaignScene{
 constructor(canvas){super(canvas);this.running=false;}
 resize(){super.resize();this.baseScale=Math.min(innerWidth/(innerWidth<650?6.8:6.2),innerHeight/4.8);this.scale=this.baseScale;this.cx=innerWidth*.5;this.cy=innerHeight*.66;this.dirty=true;}
 positionFor(unit){return {x:unit.id===this.result.actor?-1.5:1.4,z:0};}
 poseFor(unit,index,time){const t=Math.max(0,Math.min(1,(time-this.started)/this.duration));if(unit.id!==this.result.actor){const recoil=this.reduced?0:Math.sin(Math.max(0,Math.min(1,(time-this.started-this.impactAt)/400))*Math.PI)*.13;return {x:1.4+recoil,z:0,y:0,stride:0,gesture:0,swing:0,facing:-Math.PI/2};}return {...CriticalArts.pose(this.recipe,t,this.impactAt/this.duration,this.reduced),anim:{skill:this.result.skill}};}
 frame(time){if(this.running){const c=this.ctx,elapsed=Math.max(0,time-this.started),progress=Math.min(1,elapsed/this.duration),camera=CriticalArts.camera(this.recipe,progress,this.reduced);this.paint=c;if(this.dirty){this.scale=this.baseScale;this.cx=this.width*.5;this.cy=this.height*.66;this.background();}this.scale=this.baseScale*camera.zoom;this.cx=this.width*(.5+camera.x);this.cy=this.height*(.66+camera.y);c.clearRect(0,0,this.width,this.height);c.drawImage(this.cache,this.cx-this.width*.5*camera.zoom,this.cy-this.height*.66*camera.zoom,this.width*camera.zoom,this.height*camera.zoom);
 if(elapsed>=this.impactAt&&!this.applied){for(const e of this.result.events){const u=DungeonCampaign.unit(this.state,e.target);if(u&&e.type==='damage')u.hp=Math.max(0,u.hp-e.amount);}this.applied=true;}
 c.fillStyle='#080b1570';c.fillRect(0,0,this.width,this.height);const title=this.title;this.title=true;this.actor(this.attacker,0,time);this.actor(this.target,1,time);this.title=title;CriticalArts.draw(this,elapsed);this.drawDefeats(time);CriticalArts.impact(c,this.width,this.height,this.project(1.4,1,0),elapsed-this.impactAt,this.recipe,this.reduced);
 c.fillStyle='#06090d';c.fillRect(0,0,this.width,Math.min(60,this.height*.08));c.fillRect(0,this.height*.88,this.width,this.height*.12);c.fillStyle=this.recipe.color;c.textAlign='center';c.font='bold '+Math.min(22,this.width*.045)+'px Georgia';c.fillText(this.moveName,this.width*.5,this.height*.94);
 }requestAnimationFrame(this.frame);}
}
class CriticalDirector{
 constructor(){this.canvas=document.createElement('canvas');this.canvas.className='critical-scene';this.canvas.hidden=true;this.canvas.setAttribute('aria-label','Critical attack cinematic');document.body.append(this.canvas);this.scene=new CriticalScene(this.canvas);this.active=false;}
 play(result,state,timing){this.stop();const s=this.scene;s.result=result;s.applied=false;s.state=structuredClone(state);s.attacker=DungeonCampaign.unit(s.state,result.actor);s.target=DungeonCampaign.unit(s.state,result.events.find(e=>e.critical)?.target);if(!s.attacker||!s.target)return;const event=result.events.find(e=>e.critical),key=result.skill||result.action;s.recipe=CriticalArts.recipe(key,timing.style,event.element||'physical');s.moveName=DungeonCampaign.skillFor(state,s.attacker,key)?.name||'Critical strike';s.biome=DungeonCampaign.encounter(state).biome;s.layoutSeed=DungeonCampaign.encounter(state).scenerySeed||0;s.started=performance.now();s.duration=timing.duration;s.attackStyle=timing.style;s.impactAt=timing.impactAt;s.title=false;s.positions.clear();s.falls.clear();s.animations=[];s.resize();s.effects=result.events.map(e=>({...e,at:s.started+timing.impactAt,style:timing.style}));s.running=true;this.active=true;this.canvas.hidden=false;this.timer=setTimeout(()=>this.stop(),s.duration);}
 point(id){const point=this.scene.point(id);if(point)return point;const target=this.scene.point(this.scene.target?.id);if(!target)return null;const ids=[...new Set(this.scene.result.events.filter(e=>e.type==='damage').map(e=>e.target))],index=ids.indexOf(id);return index<0?null:{...target,x:Math.max(80,Math.min(innerWidth-170,target.x-120)),y:target.y+45*(index+1)};}
 stop(){clearTimeout(this.timer);this.active=false;this.scene.running=false;this.canvas.hidden=true;}
}
window.CriticalDirector=CriticalDirector;
})();
