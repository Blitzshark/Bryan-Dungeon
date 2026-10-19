(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TavernMotion=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const mix=(a,b,t)=>a+(b-a)*t,turn=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
// Render a short distance behind the server clock, between complete snapshots.
class RemoteMotion{
 constructor(delay=200){this.baseDelay=delay;this.delay=delay;this.samples=[];this.rendered=null;}
 push(value,receivedAt){if(!Number.isFinite(value.at)||!Number.isFinite(value.x)||!Number.isFinite(value.z))return;const point={at:value.at,x:value.x,z:value.z,facing:Number.isFinite(value.facing)?value.facing:0,moving:!!value.moving},last=this.samples.at(-1);if(last&&point.at<=last.at)return;if(Number.isFinite(receivedAt)){const needed=Math.max(this.baseDelay,Math.min(1200,receivedAt-point.at+this.baseDelay));this.delay=last?mix(this.delay,needed,.15):needed;}if(last&&(point.at-last.at>5000||Math.hypot(point.x-last.x,point.z-last.z)>8)){this.samples=[];this.rendered=null;}this.samples.push(point);this.samples=this.samples.slice(-12);}
 render(serverTime,frameTime=serverTime){const desired=this.sample(serverTime);if(!this.rendered){this.rendered={...desired,frameTime};return {...this.rendered};}const previous=this.rendered,dt=Math.min(.05,Math.max(0,(frameTime-previous.frameTime)/1000)),dx=desired.x-previous.x,dz=desired.z-previous.z,distance=Math.hypot(dx,dz),step=Math.min(distance,dt*3.2),angle=Math.atan2(Math.sin(desired.facing-previous.facing),Math.cos(desired.facing-previous.facing));this.rendered={x:previous.x+(distance?dx/distance*step:0),z:previous.z+(distance?dz/distance*step:0),facing:previous.facing+Math.max(-dt*7,Math.min(dt*7,angle)),moving:step>.001,frameTime};return {...this.rendered};}

 sample(now){if(!this.samples.length)return {x:0,z:0,facing:0,moving:false};const time=now-this.delay,first=this.samples[0],last=this.samples.at(-1);if(time<=first.at)return {...first,moving:false};
  for(let i=1;i<this.samples.length;i++){const a=this.samples[i-1],b=this.samples[i];if(time<=b.at){const t=(time-a.at)/(b.at-a.at);return {x:mix(a.x,b.x,t),z:mix(a.z,b.z,t),facing:turn(a.facing,b.facing,t),moving:Math.hypot(b.x-a.x,b.z-a.z)>.015};}}
  const before=this.samples.at(-2),extra=Math.min(150,Math.max(0,time-last.at));if(before&&last.moving&&extra>0){const dt=last.at-before.at,vx=(last.x-before.x)/dt,vz=(last.z-before.z)/dt,speed=Math.hypot(vx,vz),scale=speed>0?Math.min(1,.0032/speed):0;return {x:last.x+vx*extra*scale,z:last.z+vz*extra*scale,facing:last.facing,moving:time-last.at<150&&speed>.0001};}
  return {...last,moving:false};
 }
}
return {RemoteMotion};
});
