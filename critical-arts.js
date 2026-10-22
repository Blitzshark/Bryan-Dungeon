(function(root,factory){const api=factory(typeof module==='object'&&module.exports?(require('./combat-fx'),globalThis.CombatVFX):root.CombatVFX);if(typeof module==='object'&&module.exports)module.exports=api;else root.CriticalArts=api;})(typeof globalThis!=='undefined'?globalThis:this,function(VFX){
'use strict';
const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
function recipe(skill,style,element='physical'){const p=VFX.profile(skill,style),hash=[...(String(skill)+':'+style+':'+element)].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,7),family=style==='arrow'?'ranged':style==='magic'?'magic':'melee';return {...p,skill,style,element,family,seed:hash,signature:skill+':'+style+':'+element,count:skill==='tarasCube'?1:skill==='arrowrain'?11:skill==='volley'?5:1+hash%3,angle:(hash%17-8)*.055,arc:.2+(hash%9)*.07,pan:(hash%7-3)*.009,zoom:.06+(hash%5)*.025,pattern:hash%5};}
function pose(r,time,hit=.6,reduced=false){const t=clamp(time),wind=ease(t/Math.max(.01,hit)),after=ease((t-hit)/Math.max(.01,1-hit)),p={x:-1.5,z:0,y:0,gesture:0,swing:0,stride:0,facing:Math.PI/2};if(r.family==='ranged'){p.x-=wind*.16;p.gesture=t<hit?wind:1-after;p.swing=t<hit?0:-.18*(1-after);return p;}if(r.family==='magic'){p.gesture=wind*(1-after*.6);p.y=reduced?0:Math.sin(wind*Math.PI)*.12*(r.pattern+1);p.z=Math.sin(wind*Math.PI)*r.angle;return p;}
 const approach=ease(t/(hit*.58)),release=ease((t-hit)/.18),motion=r.motion;
 p.x+=approach*(motion==='thrust'?2.25:motion==='dash'?2.3:1.95);p.stride=!reduced&&t<hit*.58?Math.sin(t*48)*.15:0;p.gesture=.45;
 p.z=motion==='spin'?Math.sin(approach*Math.PI)*.5:motion==='dash'?Math.sin(approach*Math.PI)*-.55:r.angle*Math.sin(approach*Math.PI);
 p.y=reduced?0:motion==='leap'?Math.sin(clamp((t-hit*.2)/(hit*.9))*Math.PI)*1.1:Math.sin(approach*Math.PI)*.12;
 p.swing=t<hit?-(motion==='thrust'?.6:1.5)*ease((t-hit*.4)/(hit*.6)):(motion==='thrust'?1.1:2.3)*(1-release);if(motion==='spin')p.facing+=Math.sin(clamp((t-hit*.25)/(hit*.75))*Math.PI)*Math.PI*1.7;return p;
}
function camera(r,time,reduced=false){const t=clamp(time),pulse=reduced?0:Math.sin(t*Math.PI);return {zoom:1+pulse*r.zoom,x:pulse*r.pan,y:-pulse*(r.family==='ranged'?.025:r.family==='magic'?.045:.015)};}
function draw(scene,elapsed){const c=scene.paint,r=scene.recipe,s=scene.scale,hit=scene.impactAt,progress=clamp(elapsed/scene.duration),charge=clamp(elapsed/hit),flight=ease((charge-.35)/.65),age=elapsed-hit,after=clamp(age/650),pose=scene.poseFor(scene.attacker,0,scene.started+elapsed),o=scene.project(pose.x,1.2+pose.y,pose.z),p=scene.project(1.4,1,0),color=r.color;
 c.save();c.strokeStyle=color;c.fillStyle=color;c.shadowColor=color;c.shadowBlur=16;c.lineWidth=3;c.lineCap='round';
 const ring=(x,y,rx,ry,angle=0)=>{c.beginPath();c.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),angle,0,Math.PI*2);c.stroke();},bolt=(x,y,angle,size)=>{c.save();c.translate(x,y);c.rotate(angle);if(r.shape==='taras-cube'){c.fillStyle='#ef444a';c.fillRect(-size*.6,-size*.6,size*1.2,size*1.2);c.fillStyle='#261c24';c.fillRect(-size*.3,-size*.2,size*.12,size*.12);c.fillRect(size*.2,-size*.2,size*.12,size*.12);c.strokeStyle='#261c24';c.beginPath();c.arc(0,0,size*.3,0,Math.PI);c.stroke();c.restore();return;}c.beginPath();c.moveTo(-size,0);c.lineTo(size*.4,0);c.moveTo(size*.05,-size*.2);c.lineTo(size*.45,0);c.lineTo(size*.05,size*.2);c.stroke();c.restore();};
 if(age<0){
 if(r.family==='ranged'){
  // Arrow rain descends; volleys fan out; single shots track their weapon's element.
  for(let i=0;i<r.count;i++){const lane=(i-(r.count-1)/2),rain=r.skill==='arrowrain',x=rain?p.x+lane*s*.13:o.x+(p.x-o.x)*flight,y=rain?p.y-s*3*(1-flight):o.y+(p.y-o.y)*flight-Math.sin(flight*Math.PI)*s*(r.arc+Math.abs(lane)*.1)+lane*s*.08*(1-flight);if(charge>.35)bolt(x,y,rain?Math.PI/2:Math.atan2(p.y-o.y,p.x-o.x)+r.angle,s*.24);}
  ring(o.x,o.y,s*.22*charge,s*.35*charge,r.angle);if(r.element==='storm'){c.beginPath();c.moveTo(o.x,o.y);for(let i=1;i<=8;i++)c.lineTo(o.x+(p.x-o.x)*flight*i/8,o.y+(p.y-o.y)*flight*i/8+(i%2?8:-8));c.stroke();}
 }else if(r.family==='magic'){
  const radius=s*(.15+charge*.45);for(let i=0;i<2+(r.seed%3);i++)ring(o.x,o.y,radius*(1+i*.2),radius*.35,progress*(i%2?2:-2)+r.angle);
  for(let i=0;i<5+r.pattern;i++){const a=i*Math.PI*2/(5+r.pattern)+charge*2;c.fillRect(o.x+Math.cos(a)*radius,o.y+Math.sin(a)*radius*.5,3,7);}
  if(charge>.35){const x=o.x+(p.x-o.x)*flight,y=o.y+(p.y-o.y)*flight-Math.sin(flight*Math.PI)*s*r.arc;
   if(r.shape==='lightning'||r.element==='storm'){c.beginPath();c.moveTo(o.x,o.y);for(let i=1;i<=10;i++)c.lineTo(o.x+(x-o.x)*i/10,o.y+(y-o.y)*i/10+(i%2?9:-9));c.stroke();}
   else if(r.shape==='flame'||r.element==='fire'){for(let i=0;i<7;i++){const px=x-i*s*.07,py=y+Math.sin(i+progress*20)*s*.08;c.beginPath();c.moveTo(px,py-s*.12);c.quadraticCurveTo(px+s*.15,py+s*.15,px-s*.2,py+s*.06);c.fill();}}
   else if(r.shape==='ice'||r.element==='frost'){for(let i=0;i<r.count+2;i++){const px=x+(i-1)*s*.12,py=y+(i%2)*s*.1;c.beginPath();c.moveTo(px,py-s*.18);c.lineTo(px+s*.06,py);c.lineTo(px,py+s*.18);c.lineTo(px-s*.06,py);c.closePath();c.fill();}}
   else if(['stars','orbit','nova'].includes(r.shape)){for(let i=0;i<r.count+2;i++){const a=i*2.399+flight*6;ring(x+Math.cos(a)*s*.18,y+Math.sin(a)*s*.18,s*.04,s*.04);}}
   else if(r.shape==='vortex'){for(let i=0;i<4;i++)ring(x,y,s*(.1+i*.07),s*.08,flight*6+i);}
   else{c.beginPath();c.arc(x,y,s*(.08+charge*.08),0,Math.PI*2);c.fill();ring(x,y,s*.25,s*.12,progress*5);}
  }
 }else{
  // The wind-up previews the actual slash, thrust, spin or falling strike.
  c.globalAlpha=Math.sin(charge*Math.PI)*.75;const x=o.x+s*.35,y=o.y-s*.2;c.save();c.translate(x,y);c.rotate(r.angle+(r.motion==='thrust'?0:-charge));if(r.motion==='thrust'){c.beginPath();c.moveTo(-s*.3,0);c.lineTo(s*.5,0);c.stroke();}else{c.beginPath();c.ellipse(0,0,s*.55,s*.15,-.5,-2.6,-.4+charge*.7);c.stroke();}c.restore();
 }
 }else if(age<750){
 c.globalAlpha=1-after;const radius=s*(.2+after*(1.1+r.pattern*.12));
 if(r.family==='ranged'){for(let i=0;i<r.count;i++)bolt(p.x+(i-(r.count-1)/2)*s*.13,p.y,r.skill==='arrowrain'?Math.PI/2:r.angle,s*(.22+after*.5));ring(p.x,p.y,radius,radius*.3,r.angle);}
 else if(r.shape==='flame'||r.element==='fire'){for(let i=0;i<12;i++){const a=i*2.399,x=p.x+Math.cos(a)*radius*.5,y=p.y-after*s*(.4+i%4*.2);c.beginPath();c.moveTo(x,y-s*.35);c.quadraticCurveTo(x+s*.2,y+s*.2,x-s*.15,y+s*.05);c.fill();}}
 else if(r.shape==='lightning'||r.element==='storm'){for(let i=0;i<8;i++){const a=i*Math.PI/4+r.angle;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+Math.cos(a)*radius*.5+7,p.y+Math.sin(a)*radius*.5);c.lineTo(p.x+Math.cos(a)*radius,p.y+Math.sin(a)*radius);c.stroke();}}
 else if(r.shape==='ice'||r.element==='frost'){for(let i=0;i<9;i++){const a=i*2.399,x=p.x+Math.cos(a)*radius,y=p.y+Math.sin(a)*radius*.5;c.beginPath();c.moveTo(x,y-s*.3);c.lineTo(x+s*.1,y);c.lineTo(x,y+s*.1);c.closePath();c.fill();}}
 else if(r.shape==='quake'||r.style==='heavy'){for(let i=0;i<9;i++){const a=i*2.399+r.angle;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+Math.cos(a)*radius*.5+8,p.y+Math.sin(a)*radius*.25);c.lineTo(p.x+Math.cos(a)*radius,p.y+Math.sin(a)*radius*.5);c.stroke();}}
 else if(r.family==='melee'){for(let i=0;i<(r.motion==='spin'?4:r.shape==='cross'?2:1);i++){c.save();c.translate(p.x,p.y);c.rotate(r.angle+i*Math.PI/2+(r.motion==='thrust'?0:-.6));c.lineWidth=7*(1-after*.6);c.beginPath();if(r.motion==='thrust'){c.moveTo(-radius,0);c.lineTo(radius,0);}else c.ellipse(0,0,radius,radius*.3,0,-2.6,.8);c.stroke();c.restore();}}
 else{for(let i=0;i<3+r.pattern;i++)ring(p.x,p.y,radius*(1-i*.1),radius*(r.shape==='vortex'?.18:.5),after*3+i*.7);}
 for(let i=0;i<22+r.pattern*3;i++){const a=i*2.399+r.angle,d=radius*(.3+i%5*.14);c.fillRect(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d*.6-after*s*.3,3,3);}
 }
 c.restore();
}
function impact(c,width,height,p,elapsed,r,reduced=false){if(elapsed<0)return;c.save();if(!reduced&&elapsed<100){c.fillStyle=elapsed<40?'#13121c':'#fff3c4';c.globalAlpha=elapsed<40?.6:.35;c.fillRect(0,0,width,height);c.globalAlpha=1;c.strokeStyle=elapsed<40?'#fff2bb':'#19142b';c.lineWidth=3;for(let i=0;i<11;i++){const a=i*Math.PI*2/11+(r?.angle||0),d=Math.min(width,height)*(.18+elapsed/650);c.beginPath();c.moveTo(p.x+Math.cos(a)*d*.3,p.y+Math.sin(a)*d*.3);c.lineTo(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d);c.stroke();}}
 c.fillStyle='#ffdc44';c.strokeStyle='#281c07';c.lineWidth=6;c.font='900 '+Math.min(60,width*.075)+'px Impact, sans-serif';c.textAlign='center';const x=Math.max(width*.29,Math.min(width*.72,p.x+width*.06)),y=Math.max(height*.18,p.y-height*.16);c.strokeText('CRITICAL HIT',x,y);c.fillText('CRITICAL HIT',x,y);c.restore();}
return {recipe,pose,camera,draw,impact};
});
