(function(){
'use strict';
const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v);},random=n=>{const x=Math.sin(n*127.1+43.3)*43758.5453;return x-Math.floor(x);};
class UniverseCutscene{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.frame=null;}
 stop(){cancelAnimationFrame(this.frame);this.frame=null;this.canvas.hidden=true;}
 play(reduced=false){cancelAnimationFrame(this.frame);this.reduced=reduced;this.started=performance.now();this.canvas.hidden=false;this.draw(this.started);}
 draw(now){
  const t=(now-this.started)/1000;if(t>=9){this.canvas.hidden=true;return;}
  const c=this.ctx,w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);if(this.canvas.width!==w*dpr||this.canvas.height!==h*dpr){this.canvas.width=w*dpr;this.canvas.height=h*dpr;}c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
  c.save();c.globalAlpha=t>7.25?1-smooth((t-7.25)/1.65):smooth(t/.25);c.fillStyle='#030511';c.fillRect(0,0,w,h);const x=w/2,y=h*.46,size=Math.min(w,h);
  // The camera pulls from the planet into the surrounding stars, then galaxies.
  const zoom=this.reduced?1:Math.exp(-Math.min(t,5)*1.4);
  for(let i=0;i<250;i++){const sx=random(i+1)*w,sy=random(i+301)*h,r=.5+random(i+601)*1.4;c.fillStyle=i%4?'#b5cbe8':'#efcfa5';c.fillRect(sx,sy,r,r);}
  if(t<3.3){const radius=this.reduced?size*.18:Math.max(1,size*1.55*zoom);c.save();c.translate(x,y);const atmosphere=c.createRadialGradient(0,0,radius*.92,0,0,radius*1.15);atmosphere.addColorStop(0,'#4dabf8aa');atmosphere.addColorStop(1,'#4dabf800');c.fillStyle=atmosphere;c.beginPath();c.arc(0,0,radius*1.15,0,Math.PI*2);c.fill();c.beginPath();c.arc(0,0,radius,0,Math.PI*2);c.clip();const ocean=c.createLinearGradient(-radius,-radius,radius,radius);ocean.addColorStop(0,'#4ca7ca');ocean.addColorStop(.6,'#175a9b');ocean.addColorStop(1,'#081d42');c.fillStyle=ocean;c.fillRect(-radius,-radius,radius*2,radius*2);
   c.scale(radius,radius);c.fillStyle='#80ad87';for(const points of [[[-.8,-.5],[-.45,-.73],[-.04,-.6],[.05,-.28],[-.22,-.1],[-.12,.08],[-.34,.13],[-.48,-.18]],[[-.19,.08],[.06,.22],[.1,.45],[-.04,.84],[-.23,.59],[-.35,.22]],[[.18,-.6],[.63,-.55],[.9,-.19],[.55,.01],[.35,-.13],[.18,.09],[.07,-.24]],[[.2,-.02],[.54,.12],[.45,.54],[.22,.61],[.05,.28]],[[.64,.53],[.85,.57],[.8,.76],[.57,.72]]]){c.beginPath();points.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.fill();}c.strokeStyle='#e2f3ef88';c.lineWidth=.025;for(let i=0;i<5;i++){c.beginPath();c.ellipse(-.2+i*.15,-.6+i*.27,.65,.065,-.23,0,Math.PI);c.stroke();}c.restore();}
  if(t>1.8&&t<5.8){const p=smooth((t-1.8)/2),radius=this.reduced?size*.32:size*(.8-.7*p);c.save();c.translate(x,y);c.scale(1,.48);c.rotate(-.35);for(let i=0;i<850;i++){const a=i*.08,r=Math.sqrt(i/850)*radius,spiral=a+r/radius*8;const px=Math.cos(spiral)*r,py=Math.sin(spiral)*r;c.fillStyle=i%3?'#c1b0ed99':'#7c9eebbb';c.beginPath();c.arc(px,py,.5+random(i)*1.6,0,Math.PI*2);c.fill();}const glow=c.createRadialGradient(0,0,0,0,0,Math.max(1,radius*.7));glow.addColorStop(0,'#fff4d9');glow.addColorStop(.12,'#d1b4df88');glow.addColorStop(1,'#7358ba00');c.fillStyle=glow;c.fillRect(-radius,-radius,radius*2,radius*2);c.restore();}
  if(t>3.6){const p=smooth((t-3.6)/1.8);c.save();c.translate(x,y);for(let i=0;i<65;i++){const angle=random(i+1700)*Math.PI*2,r=Math.sqrt(random(i+1900))*size*.45*p,gx=Math.cos(angle)*r,gy=Math.sin(angle)*r*.8;c.save();c.translate(gx,gy);c.rotate(random(i+2100)*Math.PI);c.strokeStyle=i%2?'#a8b1f488':'#b988d488';c.lineWidth=2;c.beginPath();c.ellipse(0,0,4+random(i+2500)*11,1.5,0,0,Math.PI*2);c.stroke();c.restore();}c.strokeStyle='#6778b744';c.lineWidth=1;c.beginPath();c.arc(0,0,size*.47,0,Math.PI*2);c.stroke();c.restore();}
  // One decisive cut, followed by an expanding explosion (no repeating flashes).
  if(t>5.6){const cut=smooth((t-5.6)/.65);c.save();c.translate(x,y);c.rotate(-.48);c.shadowColor='#e2c6ff';c.shadowBlur=30;c.strokeStyle='#fff2ff';c.lineWidth=2+cut*5;c.beginPath();c.moveTo(-w*cut,0);c.lineTo(w*cut,0);c.stroke();c.restore();}
  if(t>6.65){const p=clamp((t-6.65)/1.3),radius=Math.max(1,p*Math.hypot(w,h));const blast=c.createRadialGradient(x,y,0,x,y,radius);blast.addColorStop(0,'#fff8ec');blast.addColorStop(.22,'#ffd8af');blast.addColorStop(.5,'#d697e8dd');blast.addColorStop(.78,'#6a73d077');blast.addColorStop(1,'#22134700');c.fillStyle=blast;c.fillRect(0,0,w,h);}
  const title=t<2?'EARTH':t<3.8?'THE GALAXY':t<5.6?'THE UNIVERSE':t<6.65?'ONE CUT.':'UNIVERSE CLEAVE';c.textAlign='center';c.fillStyle='#f6ecff';c.shadowColor='#070516';c.shadowBlur=12;c.font='600 '+Math.min(34,w*.06)+'px Arial';c.fillText(title,x,h*.79);c.font='11px Arial';c.fillText(t<6.65?'BRYAN · BEYOND THE HOLLOW ROAD':'10,000,000 DAMAGE · ALL ENEMIES',x,h*.84);c.restore();this.frame=requestAnimationFrame(next=>this.draw(next));
 }
}
window.UniverseCutscene=UniverseCutscene;
})();
