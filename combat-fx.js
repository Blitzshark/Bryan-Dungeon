(function(root){
'use strict';
// Each technique has a readable silhouette, palette and attack motion.
const profiles={
 strike:['#f3dfaf','slash','swing'],sunder:['#eeb27a','crescent','leap'],volley:['#bae09b','arrows','bow'],ember:['#ff965d','flame','cast'],shadow:['#c8a0ff','cross','dash'],mend:['#b6efb7','bloom','cast'],
 radiance:['#fff1a3','sun','thrust'],cleave:['#ed8273','sweep','spin'],pommel:['#e5ceaa','rings','thrust'],pierce:['#c1e6ce','lance','bow'],spark:['#a9bfff','lightning','cast'],wildfire:['#ff794a','flame','spin'],chainshot:['#88e5ff','lightning','bow'],frostbite:['#b4f3ff','ice','leap'],moonstep:['#d4afff','cross','dash'],sunburst:['#fff0a0','sun','cast'],
 earthshatter:['#e8bb81','quake','leap'],arrowrain:['#d5efac','arrows','bow'],supernova:['#daacff','nova','cast'],execution:['#ca88ef','cross','dash'],daybreak:['#fff2bb','sun','cast'],ragnarok:['#ff866c','sweep','spin'],rally:['#baf0cb','bloom','cast'],starfall:['#a9cbff','stars','cast'],stoneheart:['#d1c0a2','quake','cast'],soulharvest:['#9bf2d8','vortex','cast'],dragonbreath:['#ffa367','flame','cast'],
 potion:['#c1e9af','bloom','cast'],revive:['#ffe7ac','stars','cast'],focus:['#a1d9db','rings','cast'],guard:['#a1d9db','rings','cast']
};
function profile(skill,style){if(skill==='strike'&&style==='magic')return {color:'#c2b4ff',shape:'nova',motion:'cast'};if(skill==='strike'&&style==='arrow')return {color:'#d3dfad',shape:'lance',motion:'bow'};const p=profiles[skill]||['#dec6a0',style==='magic'?'nova':style==='arrow'?'arrows':'slash','swing'];return {color:p[0],shape:p[1],motion:p[2]};}
function draw(scene,time){const c=scene.paint,s=scene.scale;
 for(const a of scene.animations){if(a.style==='cosmic')continue;const progress=(time-a.at)/a.duration;if(progress<0||progress>1)continue;const p=profile(a.skill,a.style),origin=scene.point(a.actor),target=scene.point(a.target)||origin;if(!origin||!target)continue;const impact=a.impactAt||450,elapsed=time-a.at-impact,t=Math.max(0,elapsed/550),strong=!!(a.ultimate||a.critical);
 c.save();c.strokeStyle=p.color;c.fillStyle=p.color;c.lineCap='round';c.lineJoin='round';
 if(strong){const fade=Math.sin(progress*Math.PI);c.fillStyle='rgba(8,10,22,'+fade*.32+')';c.fillRect(0,0,scene.width,scene.height);c.fillStyle='#080b12';c.fillRect(0,0,scene.width,fade*scene.height*.065);c.fillRect(0,scene.height-fade*scene.height*.065,scene.width,fade*scene.height*.065);c.strokeStyle=p.color;c.lineWidth=2;c.globalAlpha=fade*.55;for(let i=0;i<12;i++){const angle=i*Math.PI/6,from=s*(1.8+progress*2);c.beginPath();c.moveTo(target.x+Math.cos(angle)*from,target.y+35+Math.sin(angle)*from*.5);c.lineTo(target.x+Math.cos(angle)*(from+s*2),target.y+35+Math.sin(angle)*(from+s*2)*.5);c.stroke();}c.globalAlpha=1;}
 c.fillStyle=p.color;
 const tx=target.x,ty=target.y+s*.65,ox=origin.x,oy=origin.y+s*.55;
 c.shadowColor=p.color;c.shadowBlur=strong?20:9;c.lineWidth=strong?4:2;
 if(elapsed<0&&progress>.1&&['arrows','lance','lightning','stars','flame','nova'].includes(p.shape)){
  const flight=Math.max(0,Math.min(1,(time-a.at-100)/(impact-100))),count=p.shape==='arrows'?(a.skill==='arrowrain'?9:3):p.shape==='stars'?5:p.shape==='flame'?4:1;
  for(let i=0;i<count;i++){const offset=(i-(count-1)/2)*s*.17,x=ox+(tx-ox)*flight+offset,y=oy+(ty-oy)*flight-Math.sin(flight*Math.PI)*s*(.3+i*.06);c.beginPath();if(p.shape==='lightning'){c.moveTo(ox,oy);for(let j=1;j<=6;j++)c.lineTo(ox+(x-ox)*j/6+(j%2?5:-5),oy+(y-oy)*j/6);c.stroke();}else if(p.shape==='arrows'||p.shape==='lance'){const angle=Math.atan2(ty-oy,tx-ox);c.moveTo(x-Math.cos(angle)*18,y-Math.sin(angle)*18);c.lineTo(x,y);c.lineTo(x-Math.cos(angle-.5)*7,y-Math.sin(angle-.5)*7);c.stroke();}else{c.arc(x,y,Math.max(2,s*(p.shape==='nova'?.12:.06)),0,Math.PI*2);c.fill();}}
 }
 if(elapsed>=0&&elapsed<600&&!a.missed){const fade=1-t,r=s*(.2+t*(strong?2.4:1));c.globalAlpha=Math.max(0,fade);c.fillStyle=p.color;
  if(['slash','crescent','sweep','cross'].includes(p.shape)){const count=p.shape==='cross'?2:p.shape==='sweep'?3:1;for(let i=0;i<count;i++){c.save();c.translate(tx,ty);c.rotate((p.shape==='cross'?i*Math.PI/2:i*.3)-.65);c.lineWidth=(strong?7:4)*(1-t*.6);c.beginPath();c.ellipse(0,0,r*1.2,r*.4,0,-2.6+t*.5,.6+t*.5);c.stroke();c.restore();}}
  else if(p.shape==='ice'||p.shape==='stars'){for(let i=0;i<8;i++){const angle=i*Math.PI/4+t*.4,x=tx+Math.cos(angle)*r,y=ty+Math.sin(angle)*r*.6;c.beginPath();c.moveTo(x,y-10);c.lineTo(x+4,y);c.lineTo(x,y+10);c.lineTo(x-4,y);c.closePath();c.fill();}}
  else if(p.shape==='quake'){for(let i=0;i<7;i++){const angle=i*Math.PI*2/7;c.beginPath();c.moveTo(tx,ty);c.lineTo(tx+Math.cos(angle)*r*.5+5,ty+Math.sin(angle)*r*.3);c.lineTo(tx+Math.cos(angle)*r,ty+Math.sin(angle)*r*.6);c.stroke();}}
  else if(p.shape==='flame'){for(let i=0;i<9;i++){const px=tx+Math.sin(i*12.3)*r*.6,py=ty-t*s*(.4+i*.08);c.fillStyle=i%2?p.color:'#ffe5a2';c.beginPath();c.moveTo(px,py-r*.4);c.quadraticCurveTo(px+r*.2,py+r*.15,px,py+r*.2);c.quadraticCurveTo(px-r*.2,py+r*.15,px,py-r*.4);c.fill();}}
  else if(p.shape==='lightning'){for(let i=0;i<6;i++){const angle=i*Math.PI/3;c.beginPath();c.moveTo(tx,ty);c.lineTo(tx+Math.cos(angle)*r*.4+8,ty+Math.sin(angle)*r*.4);c.lineTo(tx+Math.cos(angle)*r*.6-5,ty+Math.sin(angle)*r*.6);c.lineTo(tx+Math.cos(angle)*r,ty+Math.sin(angle)*r);c.stroke();}}
  else if(p.shape==='sun'){for(let i=0;i<12;i++){const angle=i*Math.PI/6+t;c.beginPath();c.moveTo(tx+Math.cos(angle)*r*.4,ty+Math.sin(angle)*r*.4);c.lineTo(tx+Math.cos(angle)*r,ty+Math.sin(angle)*r);c.stroke();}}
  else{const count=p.shape==='vortex'?4:p.shape==='rings'?3:1;for(let i=0;i<count;i++){c.beginPath();c.ellipse(tx,ty-i*8,r*(1-i*.13),r*(p.shape==='vortex'?.35:.55),t+i,0,Math.PI*2);c.stroke();}}
  const hash=[...String(a.skill)].reduce((n,ch)=>n+ch.charCodeAt(0),0);for(let i=0;i<(strong?28:12);i++){const angle=i*2.399+hash,distance=s*(.15+t*(.6+(i%5)*.18))*(strong?1.8:1),x=tx+Math.cos(angle)*distance,y=ty+Math.sin(angle)*distance*.7-t*s*.4;c.fillRect(x,y,Math.max(1,3*(1-t)),Math.max(1,3*(1-t)));}
 }
 c.restore();
 }
}
root.CombatVFX={profiles,profile,draw};
})(typeof globalThis!=='undefined'?globalThis:this);
