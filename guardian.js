(function(){
'use strict';
// Campaign signatures stay brief; raid realm films keep their separate long presentation.
class GuardianScene extends CampaignScene{
 constructor(canvas){super(canvas);this.running=false;}
 resize(){super.resize();this.scale=Math.min(innerWidth/(innerWidth<650?11:13),innerHeight/9);this.cx=innerWidth*.5;this.cy=innerHeight*.58;this.dirty=true;}
 frame(time){if(this.running){const c=this.ctx,elapsed=time-this.started,t=elapsed/this.duration;this.paint=c;if(this.dirty)this.background();c.clearRect(0,0,this.width,this.height);c.drawImage(this.cache,0,0,this.width,this.height);c.fillStyle='#070b1855';c.fillRect(0,0,this.width,this.height);
 if(elapsed>=this.impactAt&&!this.applied){for(const e of this.result.events){const u=DungeonCampaign.unit(this.state,e.target);if(u&&e.type==='damage')u.hp=Math.max(0,u.hp-e.amount);}this.applied=true;}
 const units=[...this.state.party,...(this.state.summons||[]),...this.state.enemies].sort((a,b)=>{const pa=this.positionFor(a,this.state.party.includes(a)?this.state.party.indexOf(a):this.state.enemies.indexOf(a)),pb=this.positionFor(b,this.state.party.includes(b)?this.state.party.indexOf(b):this.state.enemies.indexOf(b));return pa.x+pa.z-pb.x-pb.z;}),title=this.title;this.title=true;for(const u of units)this.actor(u,u.side==='party'?this.state.party.indexOf(u):this.state.enemies.indexOf(u),time);this.title=title;CombatVFX.draw(this,time);window.OceanVisuals?.attacks(this,time);this.drawDefeats(time);
 const hit=elapsed-this.impactAt;if(hit>0&&hit<85&&!this.reduced){c.fillStyle=this.result.events.some(e=>e.critical)?'#ffe46b':'#e8f2e3';c.globalAlpha=.35*(1-hit/85);c.fillRect(0,0,this.width,this.height);c.globalAlpha=1;}
 c.fillStyle='#050a10';c.fillRect(0,0,this.width,this.height*.09);c.fillRect(0,this.height*.87,this.width,this.height*.13);c.fillStyle=this.move.color||'#dddfb6';c.textAlign='center';c.font='bold 13px Georgia';c.fillText(this.boss.name,this.width/2,this.height*.055);c.font='20px Georgia';c.fillText(this.move.name,this.width/2,this.height*.94);if(hit>=0&&this.result.events.some(e=>e.critical)){c.fillStyle='#ffe46b';c.font='bold 32px Impact';c.fillText('CRITICAL HIT',this.width*.32,this.height*.3);}if(t>1)this.running=false;}requestAnimationFrame(this.frame);}
}
class GuardianDirector{
 constructor(){this.canvas=document.createElement('canvas');this.canvas.className='guardian-scene';this.canvas.hidden=true;document.body.append(this.canvas);this.scene=new GuardianScene(this.canvas);this.active=false;}
 play(result,state,timing){const move=GameContent.MOVES[result.skill];if(!move?.guardian)return;this.stop();const s=this.scene;s.state=structuredClone(state);s.boss=DungeonCampaign.unit(s.state,result.actor);if(!s.boss)return;s.result=result;s.move=move;s.effects=[];s.animations=[];s.positions.clear();s.applied=false;s.biome=DungeonCampaign.encounter(state).biome;s.layoutSeed=DungeonCampaign.encounter(state).scenerySeed||0;s.title=false;s.started=performance.now();s.duration=timing.duration;s.impactAt=timing.impactAt;s.resize();s.play(result);s.running=true;this.active=true;this.canvas.hidden=false;this.timer=setTimeout(()=>this.stop(),timing.duration);}
 point(id){return this.scene.point(id);}
 stop(){clearTimeout(this.timer);this.active=false;this.scene.running=false;this.canvas.hidden=true;}
}
window.GuardianDirector=GuardianDirector;
})();
