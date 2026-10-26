(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CorpseMotion=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
class Field{
 constructor(){this.rows=new Map();}
 look(id,yaw,pitch){let r=this.rows.get(id);if(!r){r={x:0,z:0,y:0,vx:0,vz:0,vy:0,tilt:0,vt:0,seq:0,yaw:0,pitch:0};this.rows.set(id,r);}if(Number.isFinite(yaw))r.yaw=yaw;if(Number.isFinite(pitch))r.pitch=clamp(pitch,-1.3,1.3);return r;}
 impulse(id,yaw,pitch,count=1){const r=this.look(id,yaw,pitch),n=clamp(count,1,8);r.seq+=n;r.vx=clamp(r.vx+Math.cos(yaw)*n*.8,-3,3);r.vz=clamp(r.vz+Math.sin(yaw)*n*.8,-3,3);r.vy=clamp(r.vy+n*1.65,0,4);r.vt=clamp(r.vt+(r.seq%2?1:-1)*n*3,-7,7);return r.seq;}
 step(id,time,reduced=false){const r=this.rows.get(id);if(!r)return null;const dt=clamp((time-(r.time??time))/1000,0,.04);r.time=time;r.vx+=(-r.x*13-r.vx*3)*dt;r.vz+=(-r.z*13-r.vz*3)*dt;r.x+=r.vx*dt;r.z+=r.vz*dt;const radius=Math.hypot(r.x,r.z);if(radius>.75){r.x*=.75/radius;r.z*=.75/radius;r.vx*=.45;r.vz*=.45;}r.vy-=10*dt;r.y+=r.vy*dt;if(r.y<0){r.y=0;r.vy=Math.abs(r.vy)>.35?-r.vy*.28:0;}if(r.y>.85){r.y=.85;r.vy=Math.min(0,r.vy);}r.vt+=(-r.tilt*22-r.vt*4)*dt;r.tilt=clamp(r.tilt+r.vt*dt,-.45,.17);return {x:reduced?r.x*.12:r.x,z:reduced?r.z*.12:r.z,y:reduced?0:r.y,fall:Math.PI/2+(reduced?0:r.tilt),headYaw:r.yaw,headPitch:clamp(r.pitch+(reduced?0:Math.sin(time/130)*Math.abs(r.tilt)*.35),-1.3,1.3),seq:r.seq,limb:reduced?0:clamp(Math.abs(r.vt)*.08+Math.abs(r.vy)*.04,0,.6),phase:time/150};}
}
function field(scene){return scene.corpseMotion??=new Field();}
function pose(scene,u,base,time){if(u.hp>0||base.transport){scene.corpseMotion?.rows.delete(u.id);return base;}const r=scene.corpseMotion?.step(u.id,time,scene.reduced);if(!r)return base;return {...base,x:base.x+r.x,z:base.z+r.z,y:base.y+r.y,corpse:r};}
function legs(s,x,Y,z,big,color,r){for(const side of [-1,1]){const old=s.partTransform,angle=.2+(side>0?Math.sin(r.phase):Math.cos(r.phase))*r.limb,hip=Y(.52),ey=hip-.25*big*Math.cos(angle),ez=z-.25*big*Math.sin(angle);s.partTransform={y:hip,z,angle};s.box(x+side*.16*big,Y(.27),z,.26*big,.25*big,.3*big,color);s.partTransform={y:ey,z:ez,angle:Math.max(.05,angle+.25)};s.box(x+side*.16*big,ey-.25*big,ez,.24*big,.25*big,.28*big,color);s.partTransform=old;}}
return {Field,field,pose,legs};
});
