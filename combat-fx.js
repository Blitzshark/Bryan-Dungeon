(function(root){
'use strict';
// Each technique has a readable silhouette, palette and attack motion.
const profiles={
 strike:['#f3dfaf','slash','swing'],sunder:['#eeb27a','crescent','leap'],volley:['#bae09b','arrows','bow'],ember:['#ff965d','flame','cast'],shadow:['#c8a0ff','cross','dash'],mend:['#b6efb7','bloom','cast'],
 radiance:['#fff1a3','sun','thrust'],cleave:['#ed8273','sweep','spin'],pommel:['#e5ceaa','rings','thrust'],pierce:['#c1e6ce','lance','bow'],spark:['#a9bfff','lightning','cast'],wildfire:['#ff794a','flame','spin'],chainshot:['#88e5ff','lightning','bow'],frostbite:['#b4f3ff','ice','leap'],moonstep:['#d4afff','cross','dash'],sunburst:['#fff0a0','sun','cast'],
 earthshatter:['#e8bb81','quake','leap'],arrowrain:['#d5efac','arrows','bow'],supernova:['#daacff','nova','cast'],execution:['#ca88ef','cross','dash'],daybreak:['#fff2bb','sun','cast'],ragnarok:['#ff866c','sweep','spin'],rally:['#baf0cb','bloom','cast'],starfall:['#a9cbff','stars','cast'],stoneheart:['#d1c0a2','quake','cast'],soulharvest:['#9bf2d8','vortex','cast'],dragonbreath:['#ffa367','flame','cast'],
 potion:['#c1e9af','bloom','cast'],revive:['#ffe7ac','stars','cast'],focus:['#a1d9db','rings','cast'],guard:['#a1d9db','rings','cast']
};
const content=typeof module==='object'&&module.exports?require('./content'):root.GameContent;
const added={...content.SUMMON_SKILLS,...content.MOVES,...content.CARDS,...Object.fromEntries(Object.entries(content.BASICS).map(([k,v])=>['basic_'+k,v])),knightCut:{style:'slash'},knightSlam:{style:'heavy'}};
let variant=0;for(const [id,move]of Object.entries(added)){const n=++variant;profiles[id]=[move.color||'#'+(0x779999+(n*3571)%0x886666).toString(16).padStart(6,'0'),move.shape|| (move.summon?'portal':move.style==='magic'?['nova','stars','lightning','flame','vortex','ice'][n%6]:move.style==='arrow'?'arrows':['slash','crescent','cross','quake','sweep'][n%5]),move.style==='magic'||move.summon?'cast':move.style==='arrow'?'bow':['swing','leap','thrust','dash','spin'][n%5]];}
profiles.snailRoll=['#9ec486','snail-roll','spin'];profiles.snailSaw=['#ddd7ae','snail-saw','thrust'];profiles.snailGoop=['#84cf5e','snail-goop','cast'];profiles.tarasCube=['#ef4c50','taras-cube','bow'];
function profile(skill,style){if(skill?.startsWith('basic_')&&content.BASICS[skill.slice(6)]?.style!==style){const p=profiles[skill];return {color:p?.[0]||'#c2b4ff',shape:style==='magic'?'stars':style==='arrow'?'arrows':style==='heavy'?'quake':'slash',motion:style==='magic'?'cast':style==='arrow'?'bow':'swing'};}if(skill==='strike'&&style==='magic')return {color:'#c2b4ff',shape:'nova',motion:'cast'};if(skill==='strike'&&style==='arrow')return {color:'#d3dfad',shape:'lance',motion:'bow'};const p=profiles[skill]||['#dec6a0',style==='magic'?'nova':style==='arrow'?'arrows':'slash','swing'];return {color:p[0],shape:p[1],motion:p[2]};}
function draw(scene,time){const c=scene.paint,s=scene.scale;
 for(const a of scene.animations){if(a.style==='cosmic')continue;const progress=(time-a.at)/a.duration;if(progress<0||progress>1)continue;const p={...profile(a.skill,a.style)};if(a.enemy&&globalThis.CombatElements?.TYPES[a.element])p.color=globalThis.CombatElements.TYPES[a.element].color;const origin=scene.point(a.actor),target=scene.point(a.target)||origin;if(!origin||!target)continue;const impact=a.impactAt||450,elapsed=time-a.at-impact,t=Math.max(0,elapsed/550),strong=!!(a.ultimate||a.critical);
 c.save();c.strokeStyle=p.color;c.fillStyle=p.color;c.lineCap='round';c.lineJoin='round';
 if(['snail-roll','snail-saw','snail-goop','taras-cube'].includes(p.shape)){
 const flight=Math.max(0,Math.min(1,(time-a.at-80)/Math.max(1,impact-80))),x=origin.x+(target.x-origin.x)*flight,y=origin.y+(target.y+s*.5-origin.y)*flight-Math.sin(flight*Math.PI)*s*.5;
 c.save();if(p.shape==='taras-cube'){c.translate(x,y);c.rotate(progress*5);c.fillStyle='#ef444a';c.fillRect(-s*.16,-s*.16,s*.32,s*.32);c.fillStyle='#231b24';c.fillRect(-s*.08,-s*.06,s*.035,s*.035);c.fillRect(s*.04,-s*.06,s*.035,s*.035);c.strokeStyle='#231b24';c.lineWidth=2;c.beginPath();c.arc(0,0,s*.075,0,Math.PI);c.stroke();}
 else if(p.shape==='snail-goop'){for(let i=0;i<7;i++){c.fillStyle=i%2?'#a3e376':'#67b948';c.beginPath();c.arc(x+Math.sin(i*2.3)*s*.25,y+Math.cos(i)*s*.13,s*.08,0,Math.PI*2);c.fill();}}
 else{const r=s*(p.shape==='snail-roll'?.65:.4);c.translate(x,y);c.rotate(progress*14);c.strokeStyle=p.shape==='snail-roll'?'#a3bf7c':'#ede1b4';c.lineWidth=5;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();for(let i=0;i<12;i++){const angle=i*Math.PI/6;c.beginPath();c.moveTo(Math.cos(angle)*r*.5,Math.sin(angle)*r*.5);c.lineTo(Math.cos(angle)*r*1.15,Math.sin(angle)*r*1.15);c.stroke();}}
 c.restore();
 }
 if(p.shape.startsWith('admiral-')){
 const flight=Math.max(0,Math.min(1,(time-a.at-100)/Math.max(1,impact-100))),fade=Math.sin(progress*Math.PI);c.globalAlpha=fade;
 if(p.shape==='admiral-broadside'){
  for(let i=0;i<3;i++){const gx=origin.x+(i-1)*s*.75,gy=origin.y+s*(.3+i*.18);c.fillStyle='#284b50';c.fillRect(gx-s*.24,gy-s*.12,s*.5,s*.22);c.fillStyle='#95f5d4';c.shadowBlur=18;c.beginPath();c.arc(gx+(target.x-gx)*flight,gy+(target.y+s*.6-gy)*flight,4+flight*5,0,Math.PI*2);c.fill();c.strokeStyle='#b4e6c680';c.beginPath();c.moveTo(gx,gy);c.lineTo(gx+(target.x-gx)*flight,gy+(target.y+s*.6-gy)*flight);c.stroke();}
 }else if(p.shape==='admiral-anchor'){
  const ax=origin.x+(target.x-origin.x)*flight,ay=origin.y+(target.y+s*.65-origin.y)*flight-Math.sin(flight*Math.PI)*s*1.7;c.strokeStyle='#9fc5b6';c.lineWidth=3;c.beginPath();c.moveTo(origin.x,origin.y+s*.5);c.quadraticCurveTo((origin.x+ax)/2,ay-s,ax,ay);c.stroke();c.save();c.translate(ax,ay);c.rotate(flight*5);c.lineWidth=5;c.beginPath();c.moveTo(0,-s*.35);c.lineTo(0,s*.3);c.moveTo(-s*.2,-s*.1);c.lineTo(s*.2,-s*.1);c.moveTo(-s*.3,s*.08);c.quadraticCurveTo(0,s*.65,s*.3,s*.08);c.stroke();c.restore();
 }else if(p.shape==='admiral-shot'){
  for(let i=0;i<7;i++){const x=origin.x+(target.x-origin.x)*flight,y=origin.y+(target.y+s*.65-origin.y)*flight+(i-3)*s*.07*flight;c.fillStyle=i%2?'#182e39':'#b1ebd9';c.fillRect(x,y,5,3);}
 }else{
  for(let i=0;i<5;i++){const x=origin.x+(target.x-origin.x)*flight+(i-2)*s*.3,y=origin.y+(target.y+s*.6-origin.y)*flight;c.strokeStyle='#79d7cb';c.beginPath();c.ellipse(x,y,s*(.25+flight*.25),s*.2,-.4,Math.PI,Math.PI*2);c.stroke();}
 }
 if(elapsed>=0){c.globalAlpha=Math.max(0,1-t);c.strokeStyle=p.color;for(let i=0;i<12;i++){const a=i*2.399,x=target.x+Math.cos(a)*s*t*1.6,y=target.y+s*.6+Math.sin(a)*s*t*.65;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*10,y-12);c.stroke();}}
 c.globalAlpha=1;
 }
 if(p.shape==='portal'){const spawn=scene.positionFor(scene.state?.summons?.find(k=>k.ownerId===a.actor&&k.summonCard===a.skill)||{summon:true,ownerId:a.actor},0),summon=(content.MOVES[a.skill]?.raid||scene.state&&DungeonCampaign.unit(scene.state,a.actor)?.side==='enemy')?origin:scene.project(spawn.x,.1,spawn.z);c.save();c.globalAlpha=Math.sin(progress*Math.PI);c.translate(summon.x,summon.y);for(let i=0;i<3;i++){c.rotate(progress*2+i);c.beginPath();c.ellipse(0,-i*12,s*(.7+progress*.5),s*.3,0,0,Math.PI*2);c.stroke();}for(let i=0;i<20;i++)c.fillRect(Math.sin(i*7)*s, -progress*s*3+(i%5)*12,3,12);c.restore();}
 if(strong){const fade=Math.sin(progress*Math.PI);c.fillStyle='rgba(8,10,22,'+fade*.32+')';c.fillRect(0,0,scene.width,scene.height);c.fillStyle='#080b12';c.fillRect(0,0,scene.width,fade*scene.height*.065);c.fillRect(0,scene.height-fade*scene.height*.065,scene.width,fade*scene.height*.065);c.strokeStyle=p.color;c.lineWidth=2;c.globalAlpha=fade*.55;for(let i=0;i<12;i++){const angle=i*Math.PI/6,from=s*(1.8+progress*2);c.beginPath();c.moveTo(target.x+Math.cos(angle)*from,target.y+35+Math.sin(angle)*from*.5);c.lineTo(target.x+Math.cos(angle)*(from+s*2),target.y+35+Math.sin(angle)*(from+s*2)*.5);c.stroke();}c.globalAlpha=1;}
 c.fillStyle=p.color;
 const tx=target.x,ty=target.y+s*.65,ox=origin.x,oy=origin.y+s*.55;
 c.shadowColor=p.color;c.shadowBlur=strong?20:9;c.lineWidth=strong?4:2;
 if(elapsed<0&&progress>.1&&['arrows','lance','lightning','stars','flame','nova'].includes(p.shape)){
  const flight=Math.max(0,Math.min(1,(time-a.at-100)/(impact-100))),count=p.shape==='arrows'?(a.skill==='arrowrain'?9:3):p.shape==='stars'?5:p.shape==='flame'?4:1;
  for(let i=0;i<count;i++){const offset=(i-(count-1)/2)*s*.17,x=ox+(tx-ox)*flight+offset,y=oy+(ty-oy)*flight-Math.sin(flight*Math.PI)*s*(.3+i*.06);c.beginPath();if(p.shape==='lightning'){c.moveTo(ox,oy);for(let j=1;j<=6;j++)c.lineTo(ox+(x-ox)*j/6+(j%2?5:-5),oy+(y-oy)*j/6);c.stroke();}else if(p.shape==='arrows'||p.shape==='lance'){const angle=Math.atan2(ty-oy,tx-ox);c.moveTo(x-Math.cos(angle)*18,y-Math.sin(angle)*18);c.lineTo(x,y);c.lineTo(x-Math.cos(angle-.5)*7,y-Math.sin(angle-.5)*7);c.stroke();}else{c.arc(x,y,Math.max(2,s*(p.shape==='nova'?.12:.06)),0,Math.PI*2);c.fill();}}
 }
 if(elapsed>=0&&elapsed<600&&!a.missed){const fade=1-t,r=s*(.2+t*(strong?2.4:1));c.globalAlpha=Math.max(0,fade);c.fillStyle=p.color;
  if(['thorns','chains','mirrors','orbit','teeth'].includes(p.shape)){for(let i=0;i<8;i++){const angle=i*Math.PI/4+t,x=tx+Math.cos(angle)*r,y=ty+Math.sin(angle)*r*.55;c.beginPath();if(p.shape==='chains'){c.ellipse(x,y,7,3,angle,0,Math.PI*2);c.moveTo(tx,ty);c.lineTo(x,y);}else if(p.shape==='orbit'){c.ellipse(tx,ty,r,r*.3,angle,0,Math.PI*2);c.fillRect(x-3,y-3,6,6);}else if(p.shape==='mirrors'){c.moveTo(x,y-14);c.lineTo(x+7,y);c.lineTo(x,y+14);c.lineTo(x-7,y);c.closePath();}else{c.moveTo(x-5,y+8);c.lineTo(x, y-s*(p.shape==='thorns'?.6:.3));c.lineTo(x+5,y+8);c.closePath();c.fill();}c.stroke();}}
  else if(['slash','crescent','sweep','cross'].includes(p.shape)){const count=p.shape==='cross'?2:p.shape==='sweep'?3:1;for(let i=0;i<count;i++){c.save();c.translate(tx,ty);c.rotate((p.shape==='cross'?i*Math.PI/2:i*.3)-.65);c.lineWidth=(strong?7:4)*(1-t*.6);c.beginPath();c.ellipse(0,0,r*1.2,r*.4,0,-2.6+t*.5,.6+t*.5);c.stroke();c.restore();}}
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
