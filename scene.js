(function(){
'use strict';
const palette={forest:{sky:'#233d37',far:'#46604b',ground:'#526d45',tile:['#52704a','#4c6943','#57724b','#496540','#566c44'],leaf:['#405f3b','#4f6c40','#5b7445','#3a5635'],rock:'#7c8470'},crypt:{sky:'#162426',far:'#263834',ground:'#53584a',tile:['#4d5143','#555747','#494e42','#515344','#535749'],leaf:['#40523a'],rock:'#707568'},throne:{sky:'#160b24',far:'#391c3e',ground:'#382735',tile:['#332635','#3d2a3d','#29232f','#422936'],leaf:['#49334f'],rock:'#59455f'}};
Object.assign(palette,{ship:{...palette.forest,sky:'#5c94af',far:'#b5d4d5',ground:'#477e91',tile:['#97734f'],rock:'#738b8c'},jungle:{...palette.forest,sky:'#163c32',far:'#48765a',ground:'#466b3c',tile:['#486b3b','#4e7140','#3e6239'],leaf:['#2c613d','#387349','#5b8a46','#235139'],rock:'#72836a'},cloud:{...palette.forest,sky:'#6baccb',far:'#d1e7eb',tile:['#bdcbbb'],rock:'#9ca9ab'},tempest:{...palette.crypt,sky:'#202b49',far:'#626e92',tile:['#6a7788'],rock:'#8596aa'},zenith:{...palette.throne,sky:'#566ba5',far:'#f5d8a1',tile:['#c7b78f'],rock:'#e1cfa0'},storm:{...palette.forest,sky:'#121f35',far:'#364c64',ground:'#53545a',tile:['#56616a','#4c5861','#64717b'],leaf:['#a08855','#7d795e'],rock:'#8d8d85'},abyss:{...palette.crypt,sky:'#041f2b',far:'#104956',ground:'#234c56',tile:['#27525c','#284550','#31636a'],rock:'#5d9398'},astral:{...palette.throne,sky:'#090d27',far:'#29214b',ground:'#302b4f',tile:['#353356','#2b284c','#443c65'],rock:'#887ea6'}});
function seeded(n){const x=Math.sin(n*127.1+217.7)*43758.5453;return x-Math.floor(x);}
function shade(hex,factor){const n=parseInt(hex.slice(1),16);return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*factor))).toString(16).padStart(2,'0')).join('');}
class CampaignScene{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.state=null;this.title=true;this.camp=false;this.biome='forest';this.positions=new Map();this.falls=new Map();this.effects=[];this.animations=[];this.reduced=GameDisplay.reduced;addEventListener('hollow-motion-change',()=>{this.reduced=GameDisplay.reduced;});this.cache=document.createElement('canvas');this.resize();addEventListener('resize',()=>this.resize());this.frame=this.frame.bind(this);requestAnimationFrame(this.frame);}
 resize(){this.width=innerWidth;this.height=innerHeight;this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=this.width*this.dpr;this.canvas.height=this.height*this.dpr;this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.cache.width=this.canvas.width;this.cache.height=this.canvas.height;
 this.scale=this.title?Math.min(this.width/(this.width<650?13:19),this.height/13):Math.min(this.width/(this.width<650?12.5:16.5),this.height/10.3,Math.max(12,(this.height-270)/6.2));
 this.cx=this.width*(this.title?.65:this.camp&&this.width>800?.29:.5);this.cy=this.title?this.height*.57:this.camp?(this.height*(this.width>800?.54:.30)):Math.min(this.height*.52,this.height-(this.width<650?185:170)-16-this.scale*2.1);this.dirty=true;}


 setState(state,title=false){if(this.menuTrailerActive&&!title){this.menuTrailerActive=false;this.trailer=null;this.animations=[];this.effects=[];this.positions.clear();this.enemyFacing?.clear();}this.state=state;const biome=state?DungeonCampaign.encounter(state).biome:'forest',camp=state?.phase==='camp',layout=state?DungeonCampaign.encounter(state).scenerySeed||0:0;if(this.layoutSeed!==layout||this.biome!==biome||this.title!==title||this.camp!==camp||this.raid!==(state?.mode==='raid')){this.layoutSeed=layout;this.raid=state?.mode==='raid';this.biome=biome;this.title=title;this.camp=camp;this.resize();}this.state=state;}
 project(x,y,z){return {x:this.cx+(x-z*.57)*this.scale,y:this.cy+(x*.27+z*.47-y)*this.scale};}
 polygon(points,color,stroke){if(this.fallenTint&&/^#[0-9a-f]{6}$/i.test(color)){const n=parseInt(color.slice(1),16),v=Math.round(((n>>16)*.3+((n>>8)&255)*.59+(n&255)*.11)*.78);color='#'+v.toString(16).padStart(2,'0').repeat(3);}if(this.actorPolygons&&points.every(p=>Number.isFinite(p.depth))){this.actorPolygons.push({depth:points.reduce((sum,p)=>sum+p.depth,0)/points.length,draw:()=>{const tint=this.fallenTint;this.fallenTint=false;this.polygon(points,color,stroke);this.fallenTint=tint;}});return;}const c=this.paint;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.6;c.stroke();}}
 plane(x,z,w,d,color){this.polygon([this.project(x,0,z),this.project(x+w,0,z),this.project(x+w,0,z+d),this.project(x,0,z+d)],color);}
 box(x,y,z,w,h,d,color,top){if(this.skinMaterial){color=this.skinMaterial;top=null;}
 if(this.bodyTransform){this.orientedBox(x,y,z,w,h,d,color,top);return;}const a=x-w/2,b=z-d/2,p=(xx,yy,zz)=>this.project(xx,yy,zz);this.polygon([p(a,y,b+d),p(a+w,y,b+d),p(a+w,y+h,b+d),p(a,y+h,b+d)],shade(color,.83));this.polygon([p(a+w,y,b),p(a+w,y,b+d),p(a+w,y+h,b+d),p(a+w,y+h,b)],shade(color,.65));this.polygon([p(a,y+h,b),p(a+w,y+h,b),p(a+w,y+h,b+d),p(a,y+h,b+d)],top||shade(color,1.13));}
 orientedBox(x,y,z,w,h,d,color,top){
 const t=this.bodyTransform,cos=Math.cos(t.angle),sin=Math.sin(t.angle);
 const point=(dx,dy,dz)=>{let xx=x+dx,yy=y+dy,zz=z+dz;const part=this.partTransform;if(part){const py=yy-part.y,pz=zz-part.z,pc=Math.cos(part.angle),ps=Math.sin(part.angle);yy=part.y+py*pc-pz*ps;zz=part.z+py*ps+pz*pc;}if(t.fall){const fy=yy-(t.y||0),fz=zz-t.z,fc=Math.cos(t.fall),fs=Math.sin(t.fall);yy=(t.y||0)+fy*fc-fz*fs+.3*fs;zz=t.z+fy*fs+fz*fc;}const px=xx-t.x,pz=zz-t.z;const wx=t.x+px*cos+pz*sin,wz=t.z-px*sin+pz*cos;return {...this.project(wx,yy,wz),depth:wx*.57+yy*.624+wz};};
 const faces=[
  {n:[0,1],v:[[-w/2,0,d/2],[w/2,0,d/2],[w/2,h,d/2],[-w/2,h,d/2]]},
  {n:[0,-1],v:[[w/2,0,-d/2],[-w/2,0,-d/2],[-w/2,h,-d/2],[w/2,h,-d/2]]},
  {n:[1,0],v:[[w/2,0,d/2],[w/2,0,-d/2],[w/2,h,-d/2],[w/2,h,d/2]]},
  {n:[-1,0],v:[[-w/2,0,-d/2],[-w/2,0,d/2],[-w/2,h,d/2],[-w/2,h,-d/2]]}
 ];
 for(const face of faces){const nx=face.n[0]*cos+face.n[1]*sin,nz=-face.n[0]*sin+face.n[1]*cos;if(t.fall||nx*.57+nz>.001)this.polygon(face.v.map(v=>point(...v)),shade(color,.74-.09*nx+.09*nz));}
 if(t.fall)this.polygon([point(-w/2,0,-d/2),point(w/2,0,-d/2),point(w/2,0,d/2),point(-w/2,0,d/2)],shade(color,.65));this.polygon([point(-w/2,h,-d/2),point(w/2,h,-d/2),point(w/2,h,d/2),point(-w/2,h,d/2)],top||shade(color,1.13));
 }
 drawFace(x,y,z,big,drawing){
 const t=this.bodyTransform,cos=Math.cos(t.angle),sin=Math.sin(t.angle);if(sin*.57+cos<=.001)return;
 this.faceTextures??=new Map();let texture=this.faceTextures.get(drawing);if(!texture){texture=document.createElement('canvas');texture.width=texture.height=16;FaceEditor.paint(texture,drawing);if(this.faceTextures.size>=64)this.faceTextures.delete(this.faceTextures.keys().next().value);this.faceTextures.set(drawing,texture);}
 const point=(dx,dy)=>this.project(x+dx*cos+.24*big*sin,y+dy*big,z-dx*sin+.24*big*cos),a=point(-.2*big,1.53),b=point(.2*big,1.53),d=point(-.2*big,1.23),c=this.paint;const draw=()=>{c.save();c.transform((b.x-a.x)/16,(b.y-a.y)/16,(d.x-a.x)/16,(d.y-a.y)/16,a.x,a.y);c.imageSmoothingEnabled=false;c.drawImage(texture,0,0);c.restore();};if(this.actorPolygons)this.actorPolygons.push({depth:(x+.24*big*sin)*.57+(y+1.42*big)*.624+z+.24*big*cos+.001,draw});else draw();
 }
 poseFor(unit,index,time){
 const pos=this.positionFor(unit,index),anim=this.animations.find(a=>a.actor===unit.id&&time>=a.at&&time-a.at<a.duration);let x=pos.x+(unit.ghostX||0),z=pos.z+(unit.ghostZ||0),y=0,gesture=0,stride=0,swing=0,facing=null;
 if(unit.hp&&!this.reduced)y=Math.sin(time/750+index)*.018;
 if(anim){const target=anim.destination||this.positions.get(anim.target),progress=(time-anim.at)/anim.duration;
  if(target&&['slash','heavy'].includes(anim.style)){
   const dx=target.worldX-pos.x,dz=target.worldZ-pos.z,distance=Math.max(.01,Math.hypot(dx,dz));
   const approach=progress<.42?progress/.42:progress<.72?1:Math.max(0,(1-progress)/.28),amount=(approach*approach*(3-2*approach))*Math.max(0,1-.7/distance);
   const walking=progress<.42||progress>.72;stride=walking&&!this.reduced?Math.sin(progress*18*Math.PI)*.15:0;
   facing=Math.atan2(dx,dz);x+=dx*amount;z+=dz*amount;y+=Math.abs(stride)*.18;gesture=Math.sin(Math.max(0,Math.min(1,(progress-.42)/.30))*Math.PI);const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};swing=progress<.54?-.9*ease((progress-.42)/.12):progress<.61?-.9+2.5*ease((progress-.54)/.07):1.6*(1-ease((progress-.65)/.1));x+=dx/distance*Math.sin(swing)*.16;z+=dz/distance*Math.sin(swing)*.16;
  }else if(anim.style==='magic'){gesture=Math.sin(Math.min(1,progress/.6)*Math.PI/2);y+=this.reduced?0:Math.sin(progress*Math.PI)*.14;}else {gesture=Math.sin(progress*Math.PI);x+=(unit.side==='party'?1:-1)*gesture*.1;y+=gesture*.025;}
 }
 if(anim&&!this.reduced){const p=(time-anim.at)/anim.duration,motion=CombatVFX.profile(anim.skill,anim.style).motion,hit=Math.max(0,Math.sin(Math.max(0,Math.min(1,(p-.42)/.3))*Math.PI));if(motion==='leap')y+=hit*.55;if(motion==='spin'&&facing!==null)facing+=hit*Math.PI*2;if(motion==='thrust')swing*=.4;if(motion==='dash')y+=hit*.08;}
 if(unit.side==='enemy'&&!anim&&!this.tavern){const knight=(this.state?.summons||[]).findLast(k=>k.hp>0&&k.taunt),p=knight?this.positionFor(knight,0):null,wanted=p?Math.atan2(p.x-pos.x,p.z-pos.z):unit.kind==='rat'?0:-Math.PI/2;this.enemyFacing??=new Map();const old=this.enemyFacing.get(unit.id)||{angle:unit.kind==='rat'?0:-Math.PI/2,at:time},dt=Math.max(0,Math.min(.08,(time-old.at)/1000)),difference=Math.atan2(Math.sin(wanted-old.angle),Math.cos(wanted-old.angle));facing=old.angle+difference*(this.reduced?1:1-Math.exp(-dt*8));this.enemyFacing.set(unit.id,{angle:facing,at:time});}
 return {x,z,y,gesture,stride,swing,facing,anim};
 }
 shadow(x,z,w=1,d=.6,alpha=.25){const p=this.project(x,.015,z),c=this.paint;c.save();c.translate(p.x,p.y);c.scale(1,.38);c.beginPath();c.ellipse(0,0,w*this.scale,d*this.scale,0,0,Math.PI*2);c.fillStyle=`rgba(5,14,9,${alpha})`;c.fill();c.restore();}
 tree(x,z,size,seed){const p=palette[this.biome],h=3.2*size;this.shadow(x+.6,z+.8,1.8*size,1.4*size,.24);this.box(x,0,z,.42*size,h,.46*size,'#554738');this.box(x+.32*size,h*.4,z,.7*size,.22*size,.22*size,'#554738');this.box(x-.38*size,h*.55,z,.9*size,.2*size,.22*size,'#554738');for(let k=0;k<6;k++){const dx=(seeded(seed+k)-.5)*2.1*size,dz=(seeded(seed+50+k)-.5)*2*size;this.box(x+dx,h*.63+seeded(seed+20+k)*1.1*size,z+dz,1.6*size,.9*size,1.5*size,p.leaf[k%p.leaf.length]);}}
 rock(x,z,s=1){this.shadow(x,z,s*.8,s*.5,.2);this.box(x,.02,z,s,.5*s,s*.8,palette[this.biome].rock);this.box(x-.18*s,.5*s,z,.68*s,.25*s,.5*s,shade(palette[this.biome].rock,1.04));}
 candle(x,z,y=0){this.box(x,y,z,.11,.3,.11,'#d7cb94');const p=this.project(x,y+.38,z),c=this.paint,g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,this.scale*.85);g.addColorStop(0,'#f3d57c44');g.addColorStop(1,'#f3d57c00');c.fillStyle=g;c.fillRect(p.x-this.scale,p.y-this.scale,this.scale*2,this.scale*2);c.fillStyle='#ffe4a0';c.fillRect(p.x-1.6,p.y-3,3.2,6);}
 barrel(x,z){this.shadow(x,z,.45,.3);this.box(x,.03,z,.6,.7,.6,'#786144');for(const y of [.12,.55])this.box(x,y,z,.63,.07,.63,'#afa682');}
 shipBackground(){const c=this.paint;c.fillStyle='#75a8bb';c.fillRect(0,0,this.width,this.height);this.plane(-30,-24,60,48,'#397b93');for(let i=0;i<45;i++)this.plane(-24+seeded(i)*48,-20+seeded(i+40)*40,2+seeded(i+20)*3,.08,'#75b7c0');for(let x=-8;x<8;x++)for(let z=-5;z<5;z++)this.box(x,-.2,z,.98,.2,.98,(x+z)%2?'#98764f':'#a5845b');for(const z of [-5.2,5.2])for(let x=-8;x<9;x++){this.box(x,0,z,.16,1,.16,'#725139');this.box(x,.8,z,1.1,.12,.14,'#d4b380');}for(const x of [-5.8,5.8]){this.box(x,0,-3,.3,7,.3,'#75523a');this.box(x,5.5,-3,.25,.25,6,'#8b6746');this.box(x,2.8,-3,.08,2.6,4.8,'#e3ddbe');}for(const [x,z]of [[-6,2.5],[5,3],[-4,-4]]){this.barrel(x,z);this.box(x+.8,0,z,.8,.6,.7,'#746148');}this.box(7,0,0,1.5,.5,7,'#97744d');}
 jungleBackground(){const c=this.paint;c.fillStyle='#294a36';c.fillRect(0,0,this.width,this.height);
 // A continuous ground-level clearing; canopy never forms the arena floor.
 for(let x=-22;x<22;x++)for(let z=-22;z<22;z++){const d=Math.hypot(x/1.15,z),inside=d<7.8;this.plane(x,z,1,1,inside?['#827654','#8c7f59','#7a7250','#948462'][Math.floor(seeded(x*37+z)*4)]:palette.jungle.tile[Math.abs(x+z)%3]);}
 for(let i=0;i<38;i++){const a=i*Math.PI*2/38,x=Math.cos(a)*(11+seeded(i)*3),z=Math.sin(a)*(10+seeded(i+40)*3),front=x*.27+z*.47>3.8;
 if(!front)this.tree(x,z,1+seeded(i+60)*.4,i*37);else{this.box(x,0,z,.6,4.5,.65,'#4d4934');this.box(x+Math.sign(x)*2.5,4.5,z+Math.sign(z)*2.5,3.2,1.2,3.2,'#285b38');for(const side of [-1,1])this.box(x+side*.5,.01,z,.9,.18,.3,'#5c5c3e');}
 if(i%2===0){this.box(x,1.2,z,.09,1.7,.09,'#6c9850');for(let j=0;j<3;j++)this.box(x+(j-1)*.25,.1,z+.4,.35,.25+j*.13,.6,'#366b3f');}}
 for(let i=0;i<16;i++){const a=i*2.399,x=Math.cos(a)*8.7,z=Math.sin(a)*7.8;this.box(x,.02,z,.65,.12,.5,'#59713e');this.box(x,.14,z,.14,.35,.14,i%3?'#779459':'#c5a67b');}
 // Half-buried ruin stones sit beyond the fighting space, never under the party.
 for(let i=0;i<4;i++)this.box(-3+i*.8,.02,-8,1,.3+(i%2)*.2,.8,'#768567');
 }

 skyBackground(){const c=this.paint,p=palette[this.biome],g=c.createLinearGradient(0,0,0,this.height);g.addColorStop(0,p.sky);g.addColorStop(1,p.far);c.fillStyle=g;c.fillRect(0,0,this.width,this.height);
  const rand=n=>seeded(n+this.layoutSeed);for(let i=0;i<32;i++){const x=rand(i+90)*this.width,y=this.height*(.2+rand(i+120)*.8);c.fillStyle=this.biome==='tempest'?'#a6b4d433':'#f4f6e977';c.beginPath();c.ellipse(x,y,80+rand(i+88)*140,15+rand(i+33)*25,0,0,Math.PI*2);c.fill();}
  // Islands taper into open air. The arena has no surrounding ground plane.
  for(let x=-7;x<=6;x++)for(let z=-5;z<=4;z++){if(Math.abs(x)>5&&Math.abs(z)>3)continue;this.box(x,-.38,z,.99,.38,.99,p.tile[0]);if((x*17+z*7)%5===0)this.box(x,-1.1,z,.7,.75,.7,p.rock);}
  for(let i=0;i<12;i++){const a=i*Math.PI/6,x=Math.cos(a)*11,z=Math.sin(a)*9;this.box(x,-1,z,2.2,.65,2,p.rock);this.box(x,-2,z,1.1,1.2,1,p.rock);if(this.biome==='cloud'){this.box(x,-.35,z,2.2,.12,2,'#9fb897');this.box(x,.1,z,.13,1.3,.13,'#ae9877');this.box(x,1.3,z,1.6,.25,1.4,'#d6b9c8');}else if(this.biome==='tempest'){this.box(x,-.35,z,.2,3,.2,'#9293ac');this.box(x,2.65,z,.6,.2,.6,'#d8dcf5');}else{this.box(x,-.35,z,.6,2.5,.6,'#d7c49a');this.box(x,2.15,z,1.2,.3,1.2,'#f2d9a6');}}
  if(this.biome==='zenith'){const p=this.project(1,3,-7);c.strokeStyle='#ffe6aa';c.lineWidth=6;c.beginPath();c.ellipse(p.x,p.y,this.scale*2.3,this.scale*2.3,0,0,Math.PI*2);c.stroke();}
 }
 background(){const old=this.paint,c=this.cache.getContext('2d');c.setTransform(this.dpr,0,0,this.dpr,0,0);this.paint=c;if(this.biome==='ship'||this.biome==='jungle'){this[this.biome+'Background']();this.dirty=false;this.paint=old;return;}if(['cloud','tempest','zenith'].includes(this.biome)){this.skyBackground();this.dirty=false;this.paint=old;return;}if(window.OceanVisuals?.isOcean(this.biome)){OceanVisuals.background(this);this.dirty=false;this.paint=old;return;}const rand=n=>seeded(n+(this.layoutSeed||0)%100000),p=palette[this.biome];c.fillStyle=p.sky;c.fillRect(0,0,this.width,this.height);const g=c.createLinearGradient(0,0,0,this.height);g.addColorStop(0,p.far);g.addColorStop(1,p.sky);c.fillStyle=g;c.fillRect(0,0,this.width,this.height);
 // An elevated tiled clearing, surrounded by a layered block-built world.
 for(let x=-17;x<18;x++)for(let z=-15;z<16;z++){
  const n=rand(x*43+z*13),color=p.tile[Math.floor(n*p.tile.length)];
  this.plane(x,z,1.005,1.005,color);
  if(this.biome==='forest'&&n>.7){const a=this.project(x+.5,.01,z+.5);c.fillStyle=n>.9?'#99a36566':'#2b4e2d66';c.fillRect(a.x,a.y,2+n*5,1.5);}
  if(this.biome!=='forest'){const pts=[this.project(x,0,z),this.project(x+1,0,z),this.project(x+1,0,z+1)];c.strokeStyle='#0c181115';c.lineWidth=1;c.beginPath();c.moveTo(pts[0].x,pts[0].y);c.lineTo(pts[1].x,pts[1].y);c.lineTo(pts[2].x,pts[2].y);c.stroke();}
 }
 if(this.biome==='forest'){
  const trees=[];for(let i=0;i<26;i++){const angle=i/26*Math.PI*2;const x=Math.cos(angle)*(10.5+rand(i+6)*2),z=Math.sin(angle)*(9.5+rand(i+8)*2);trees.push({x,z,size:.8+rand(i+9)*.65,seed:i*27});}trees.sort((a,b)=>(a.x*.27+a.z*.47)-(b.x*.27+b.z*.47));
  // Terraced stone along the old road.
  for(let i=0;i<13;i++){this.box(-9+i*1.5,0,-7,1.45,.45,1.4,'#737b60');this.box(-9+i*1.5,.45,-7.6,1.45,.4,1.2,'#667455');}
  trees.forEach(t=>this.tree(t.x,t.z,t.size,t.seed));
  [[-5,-3,1.1],[5,-3,.8],[5,4,1.3],[-5,4,.7],[-2,-5,.7],[2,5,.6]].forEach(a=>this.rock(...a));
  for(let i=0;i<16;i++){const x=-6+rand(i+44)*12,z=-5+rand(i+17)*10;if(Math.abs(x)>4||Math.abs(z)>4){this.box(x,0,z,.15,.25,.13,'#91a263');if(i%3===0)this.box(x,.25,z,.14,.12,.15,'#c4b382');}}
  this.box(-5.3,0,2.5,.16,1.3,.16,'#65543b');this.box(-5.3,.9,2.5,.7,.32,.14,'#9f8960');
  }else if(this.biome==='crypt'){
  // A cavern suspended above a black chasm: no forest terraces or ocean sediment.
  this.plane(-18,-15,36,30,'#090c13');
  this.plane(-6,-4.8,12,10,'#414454');
  for(let i=-6;i<7;i++){this.box(i,.01,-5.1,.96,.25,.8,'#626274');this.box(i,.01,5.1,.96,.25,.8,'#626274');}
  for(const side of [-1,1])for(let i=0;i<10;i++){
   const x=side*(7+rand(i+side+8)*3),z=-8+i*1.7,h=2+rand(i+80)*4;
   this.box(x,-1,z,1.3,h,1.5,'#292d40');this.box(x+.15,h-1,z,.65,.9,.7,'#46465d');
   this.box(x,6,z,.5,1+rand(i+50)*2,.5,'#303448');
   if(i%3===0){this.box(side*5.7,.1,z,.5,.4,.5,'#666575');this.candle(side*5.7,z,.5);}
  }
  for(let i=0;i<7;i++){this.box(-1.5+i*.5,0,-6.8,.4,.12,2.8,'#777181');}
  for(let i=0;i<10;i++){const x=-5+rand(i+200)*10,z=-4+rand(i+230)*8;if(Math.abs(x)>4||Math.abs(z)>3.5){this.box(x,.04,z,.25,.15,.7,'#b2ab9d');this.box(x,.15,z,.45,.1,.12,'#b2ab9d');}}
 }else{
  for(let i=-7;i<8;i++){this.box(i,.05,-6.8,.98,3.8,.75,(this.biome==='throne'?'#392738':'#555a4d'));if(i%3===0)this.box(i,0,-6.1,.6,4.6,.7,'#686e5a');}
  for(let i=-6;i<7;i++){this.box(-7,.02,i,.75,2.8,.98,(this.biome==='throne'?'#2b2032':'#50594a'));}
  [[-5,-4],[5,-4],[-5,4],[5,4]].forEach(([x,z])=>{this.box(x,0,z,1.1,.3,1.1,(this.biome==='throne'?'#594151':'#81816b'));this.box(x,.3,z,.65,3.4,.65,(this.biome==='throne'?'#3b2b45':'#777a65'));this.box(x,3.7,z,1,.3,1,(this.biome==='throne'?'#795466':'#8e8c70'));});
  for(let i=0;i<9;i++){const x=-5+i*1.2;this.candle(x,-5.9,.3);if(i%2===0)this.box(x,0,-5.8,.7,.22,.6,'#6f725c');}
  [[-5,2],[-4.7,2.7],[4,-4],[4.8,-4.2]].forEach(([x,z])=>this.barrel(x,z));
  [[-4.2,-3],[4.4,3.3],[-4,3.5]].forEach(([x,z])=>{this.box(x,0,z,.5,.15,.35,'#a99c79');this.candle(x,z,.15);});
  if(this.biome==='throne'){for(let i=0;i<22;i++){const x=-8+rand(i+88)*16,z=-6+rand(i+99)*12;this.plane(x,z,.1+rand(i)*.18,1.1,'#e15e44');this.plane(x+.02,z,.05,.9,'#ffb357');if(i%3===0){this.box(x,1.9+rand(i+55),z,.35,.4,.4,'#62406e');const p=this.project(x,2.5,z);c.fillStyle='#bc7fff';c.fillRect(p.x,p.y,2,5);}}this.box(2.2,.02,-4.6,3,.4,2.2,(this.biome==='throne'?'#513445':'#6d7057'));this.box(2.2,.4,-5,1.6,2.2,.4,(this.biome==='throne'?'#472b49':'#79775a'));this.box(2.2,.4,-4.5,1.6,.55,1.4,(this.biome==='throne'?'#603644':'#7f7654'));this.box(1.25,.4,-4.5,.3,1,.3,(this.biome==='throne'?'#ab685e':'#b3a371'));this.box(3.15,.4,-4.5,.3,1,.3,(this.biome==='throne'?'#ab685e':'#b3a371'));}
 }
 // Atmospheric light pools and soft horizon fog are baked once per scene.
 if(this.state?.act===2&&this.biome==='forest'){c.fillStyle='#6c3e9030';c.fillRect(0,0,this.width,this.height);for(let i=0;i<18;i++){const p=this.project(-7+rand(i+700)*14,1+rand(i+701)*2,-6+rand(i+702)*12);c.strokeStyle='#cfb0ed80';c.strokeRect(p.x,p.y,5,9);}}
 if(this.biome==='storm'){for(let i=0;i<14;i++){const x=-7+rand(i+800)*14,z=-6+rand(i+801)*12;this.box(x,0,z,.6,.15,.6,'#ac905f');if(i%3===0){this.box(x,.15,z,.25,3,.25,'#667d92');this.box(x,3,z,1,.15,.2,'#d0ae65');}}}
 if(this.biome==='abyss'){for(let i=0;i<20;i++){const x=-7+rand(i+820)*14,z=-6+rand(i+821)*12;if(i%2)this.box(x,0,z,.2,.7+rand(i)*2,.25,'#509aa4');else this.box(x,0,z,.7,.3,.5,'#366f7b');}for(const x of [-4,0,4]){this.box(x,0,-5.6,.4,4,.4,'#6eaaaa');this.box(x,4,-5.6,1,.2,1,'#a0d7d1');}}
 if(this.biome==='astral'){for(let i=0;i<45;i++){const p=this.project(-9+rand(i+840)*18,1+rand(i+841)*6,-8+rand(i+842)*16);c.fillStyle=i%3?'#bdabdf':'#fff4de';c.fillRect(p.x,p.y,i%3?1:3,i%3?1:3);}for(let i=0;i<10;i++){const a=i*Math.PI/5;this.box(Math.cos(a)*6,1+Math.sin(a),Math.sin(a)*5,.5,.5,.5,'#9586b3');}}
 const light=c.createRadialGradient(this.width*.62,this.height*.27,0,this.width*.6,this.height*.4,this.width*.6);light.addColorStop(0,this.biome==='forest'?'#d8e8ab19':'#d8c7870d');light.addColorStop(1,'#172c1900');c.fillStyle=light;c.fillRect(0,0,this.width,this.height);
 if(this.camp)this.campEnvironment();
 this.paint=old;this.dirty=false;
 }
 campEnvironment(){
 this.shadow(0,0,2,1,.3);for(let i=0;i<10;i++){const a=i*Math.PI/5;this.box(Math.cos(a)*.75,.02,Math.sin(a)*.65,.3,.2,.28,'#8a8a72');}
 this.box(0,.02,0,1.05,.16,.22,'#69503a');this.box(0,.13,0,.22,.16,.8,'#806045');
 [[-2.2,1.3],[0,3],[2.2,1.3]].forEach(([x,z])=>this.box(x,0,z,1.3,.3,.42,'#725b42'));
 this.barrel(-3.8,-1.3);this.barrel(-4.2,-.6);this.box(3,.02,-1.6,.7,.5,.65,'#9f8256');this.box(3,.52,-1.6,.7,.15,.7,'#675639');
 this.box(-2.6,.02,-3.1,2.3,.15,1.9,'#484f38');for(let i=0;i<6;i++)this.box(-2.6,.17+i*.24,-3.1,2.3-i*.34,.25,1.9,'#829269');
 }
 drawCampfire(time){if(window.OceanVisuals&&(OceanVisuals.isOcean(this.biome)||this.biome==='ship'||this.biome==='abyss')){OceanVisuals.heater(this,time);return;}
 const c=this.paint,p=this.project(0,.55,0),g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,this.scale*2.3);g.addColorStop(0,'#ffc56a44');g.addColorStop(1,'#ffc56a00');c.fillStyle=g;c.fillRect(p.x-this.scale*3,p.y-this.scale*3,this.scale*6,this.scale*6);
 for(let i=0;i<5;i++){const flicker=this.reduced?.97+Math.sin(time/450+i)*.04:.9+Math.sin(time/95+i*2)*.16;this.box((i-2)*.11,.15,Math.sin(i*2)*.12,.2,(.65-Math.abs(i-2)*.12)*flicker,.2,i%2?'#ffbb57':'#e57738');}
 if(!this.reduced){c.fillStyle='#ffe098';for(let i=0;i<8;i++){const t=(time/1800+i/8)%1,x=p.x+Math.sin(i*12+t*5)*this.scale*.35,y=p.y-t*this.scale*1.7;c.globalAlpha=1-t;c.fillRect(x,y,2,2);}c.globalAlpha=1;}
 }
 skinEffects(unit,x,y,z,time,pose){if(unit.side!=='party')return;const look=unit.appearance||{},skins=[window.SkinCatalog?.SKINS[look.weaponSkin],...(look.accessories?.length?[window.SkinCatalog?.SKINS[look.accessorySkin]]:[])].filter(Boolean);for(const skin of skins){if(!skin.animated)continue;const c=this.paint,p=this.project(x,y+1.1,z),r=this.scale*.65,t=this.reduced?0:time/900;c.save();c.strokeStyle=skin.color;c.fillStyle=skin.color;c.shadowColor=skin.color;c.shadowBlur=this.reduced?0:9;c.lineWidth=1.5;for(let i=0;i<7;i++){const a=i*Math.PI*2/7+t,q=(t+i*.17)%1,px=p.x+Math.cos(a)*r,py=p.y+Math.sin(a)*r*.5;if(skin.theme==='fire'){c.globalAlpha=.7*(1-q);c.beginPath();c.moveTo(px,py-q*r);c.lineTo(px-3,py+6-q*r);c.lineTo(px+3,py+6-q*r);c.fill();}else if(skin.theme==='ocean'){c.globalAlpha=.6;c.beginPath();c.arc(px,py-q*r,2+q*3,0,7);c.stroke();}else{c.globalAlpha=.65;c.beginPath();c.moveTo(px-4,py);c.lineTo(px+4,py);c.moveTo(px,py-4);c.lineTo(px,py+4);c.stroke();}}if(pose.anim){const target=this.point(pose.anim.target);if(target){const progress=Math.max(0,Math.min(1,(time-pose.anim.at)/pose.anim.duration));c.globalAlpha=Math.sin(progress*Math.PI)*.55;c.lineWidth=skin.theme==='fire'?5:2;c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo((p.x+target.x)/2,p.y-r*2,target.x,target.y+this.scale*.5);c.stroke();}}c.restore();}}
 summonPosition(unit){
 const party=this.state?.party||[],summons=this.state?.summons||[],used=new Set();let slot=0;
 // Reserve one position per adventurer before adding another row, regardless of ownership.
 for(const summon of (summons.some(p=>p.id===unit.id)?summons:[...summons,unit])){const preferred=Math.max(0,party.findIndex(p=>p.id===summon.ownerId));slot=preferred;if(used.has(slot)){slot=0;while(used.has(slot))slot++;}used.add(slot);if(summon.id===unit.id)break;}
 const row=Math.floor(slot/3);return {x:-.4-row*1.65,z:(slot%3-1)*2.6+(row%2)*1.2};
 }
 positionFor(unit,index){if(unit.summon&&this.camp){const n=(this.state?.summons||[]).findIndex(p=>p.id===unit.id);return {x:-3+(n%4)*1.7,z:5.5+Math.floor(n/4)*1.3};}if(unit.summon)return this.summonPosition(unit);if(unit.raidOnly)return {x:4.8,z:.5};if(this.camp){return [{x:-2.2,z:1.3},{x:0,z:3},{x:2.2,z:1.3},{x:-3.7,z:3},{x:0,z:4.6},{x:3.7,z:3}][index]||{x:0,z:0};}const side=unit.side==='party'?-1:1;const roster=unit.side==='party'?this.state?.party:this.state?.enemies;const count=roster?.length||3;if(unit.side==='party'&&count>3)return {x:index<3?-2.8:-5,z:(index%3-1)*2.6};return {x:side*(3.3+(index%2)*.2),z:(index-(count-1)/2)*(count>3?1.8:2.4)};}
 actor(unit,index,time){let dying=false;if(unit.images>0&&unit.hp>0&&!unit.ghost){for(let i=0;i<unit.images;i++){this.paint.save();this.paint.globalAlpha*=.25;const title=this.title;this.title=true;this.actor({...unit,images:0,ghost:true,ghostX:(i?1:-1)*.8,ghostZ:.35},index,time);this.title=title;this.paint.restore();}}if(unit.side==='enemy'&&!unit.hp){const death=this.effects.findLast(e=>e.target===unit.id&&e.type==='damage');if(!death||time<death.at||time-death.at>700)return;this.paint.save();this.paint.globalAlpha*=Math.max(0,1-(time-death.at)/700);dying=true;}const pos=this.positionFor(unit,index),pose=this.poseFor(unit,index,time);const fallen=unit.side==='party'&&!unit.hp&&!unit.summon;let fall=0;if(fallen){if(!this.falls.has(unit.id)){const death=this.effects.findLast(e=>e.target===unit.id&&e.type==='damage'&&time>=e.at);this.falls.set(unit.id,death&&time-death.at<1000?death.at:time-650);}const p=this.reduced?1:Math.max(0,Math.min(1,(time-this.falls.get(unit.id))/650));fall=(1-Math.pow(1-p,3))*Math.PI/2;Object.assign(pose,{y:0,stride:0,gesture:0,swing:0,anim:null});}else this.falls.delete(unit.id);let {x,z,y}=pose;let flash=false;
 const hit=this.effects.find(e=>e.target===unit.id&&e.type==='damage'&&time>=e.at&&time-e.at<360);
 const missed=this.effects.find(e=>e.target===unit.id&&e.type==='miss'&&time>=e.at&&time-e.at<360);if(missed&&!this.reduced){const dodge=Math.sin((time-missed.at)/360*Math.PI)*.35;x+=dodge;z-=dodge*.4;}
 if(hit){flash=time-hit.at<220;if(!this.reduced)x+=Math.sin((time-hit.at)/35)*.045;}
 if(!unit.hp&&!fallen){const death=this.effects.find(e=>e.target===unit.id&&e.type==='damage');y=-.6*(death?Math.max(0,Math.min(1,(time-death.at)/450)):1);}
 this.shadow(x,z,unit.kind==='king'?1:.64,.5,unit.hp?.32:.15);
 if(pose.anim?.style==='magic')this.casting(x,y,z,time,pose.anim);
 const selected=this.selected===unit.id,active=this.state&&DungeonCampaign.active(this.state)?.id===unit.id;
 if(selected||active){const c=this.paint,p=this.project(x,.025,z);c.save();c.translate(p.x,p.y);c.scale(1,.45);c.beginPath();c.ellipse(0,0,this.scale*.7,this.scale*.7,0,0,Math.PI*2);c.strokeStyle=active?'#e1d5a7':'#e0b293';c.lineWidth=active?2:1.5;c.stroke();if(active){c.fillStyle='#e3d5a614';c.fill();}c.restore();}
 // Sort body surfaces together so belts, arms and hair cannot paint over nearer torsos.
 this.fallenTint=fallen;this.actorPolygons=[];this.bodyTransform={x,z,y,fall,angle:this.tavern?(unit.facing||0):pose.facing??(this.camp?Math.atan2(-pos.x,-pos.z):unit.kind==='rat'?0:unit.side==='party'?Math.PI/2:-Math.PI/2)};
 const armLift=pose.swing?0:pose.gesture*(pose.anim?.style==='magic'?.6:.3);
 const look=unit.appearance||{},color=flash?(hit?.style==='cosmic'?'#c078ff':'#ff3d48'):look.clothes||unit.color,skin=look.skin|| (unit.side==='party'?(index===2?'#d2bba3':'#d4bea0'):unit.kind==='skeleton'?'#dfd8bf':'#b29b7d');
 if(this.creature(unit,x,y,z,time,pose,color)){}else if(unit.kind==='slime'){
  this.box(x,y+.02,z,.8,.5,.75,color);this.box(x,y+.52,z,.54,.15,.5,shade(color,1.1));this.box(x-.16,y+.3,z+.39,.09,.08,.02,'#253e2b');this.box(x+.13,y+.3,z+.39,.09,.08,.02,'#253e2b');
 }else if(unit.kind==='rat'){
  this.box(x,y+.04,z,.85,.35,.5,color);this.box(x-.4,y+.23,z,.36,.28,.36,color);this.box(x-.45,y+.5,z-.12,.12,.15,.1,'#c2a4a0');this.box(x-.45,y+.5,z+.12,.12,.15,.1,'#c2a4a0');this.box(x+.58,y+.15,z,.35,.05,.05,'#a98e86');
 }else if(unit.kind==='wisp'){
  const bob=this.reduced?0:Math.sin(time/650+index)*.08;this.box(x,y+.6+bob,z,.5,.6,.5,color);this.box(x,y+.45+bob,z,.25,.15,.25,shade(color,.8));this.box(x-.12,y+.9+bob,z+.26,.07,.08,.02,'#e1f9dc');this.box(x+.12,y+.9+bob,z+.26,.07,.08,.02,'#e1f9dc');
 }else{
  const big=unit.kind==='golem'?1.35:unit.kind==='king'?1.65:1;const Y=h=>y+h*big;
  const armor=look.clothes?color:flash?'#ff3d48':unit.kind==='king'?'#555f56':unit.kind==='skeleton'?'#aaac9b':unit.job==='mage'||unit.kind==='mage'?'#625976':color;
  this.box(x-.16*big,Y(.02+Math.max(0,pose.stride)),z+pose.stride,.26*big,.5*big,.3*big,look.pants||'#303c34');this.box(x+.16*big,Y(.02+Math.max(0,-pose.stride)),z-pose.stride,.26*big,.5*big,.3*big,look.pants||'#303c34');
  this.box(x,Y(.52),z,.62*big,.66*big,.38*big,armor);this.box(x,Y(.51),z,.65*big,.07*big,.42*big,'#887751');
  this.box(x-.44*big,Y(.55),z-pose.stride,.24*big,.61*big,.28*big,armor);this.partTransform=pose.swing?{y:Y(1.08),z,angle:pose.swing}:null;this.box(x+.44*big,Y(.55+armLift),z+pose.stride,.24*big,.61*big,.28*big,armor);this.partTransform=null;
  this.box(x,Y(1.19),z,.48*big,.46*big,.45*big,flash?(hit?.style==='cosmic'?'#dfafff':'#ff5960'):skin);
  if(unit.summon){this.box(x,Y(1.18),z,.54,.5,.5,'#a2b3bf');this.box(x,Y(1.36),z+.26,.4,.09,.025,'#263743');this.box(x,Y(.7),z+.2,.08,.37,.025,'#ead6a0');this.box(x,Y(.85),z+.2,.25,.07,.025,'#ead6a0');}
  const hair=look.hairColor|| (unit.id==='hero'?'#594b3d':unit.id==='rowan'?'#b4ae95':unit.id==='mira'?'#393c3b':unit.kind==='king'?'#454f47':'#514c40');
  if(unit.kind!=='skeleton'&&unit.kind!=='golem'&&look.hair!=='bald'){this.box(x,Y(1.56),z-.025*big,.53*big,.17*big,.48*big,hair);this.box(x-.22*big,Y(1.35),z-.05*big,.1*big,.3*big,.4*big,hair);}
  if(look.hair==='long')this.box(x,Y(.95),z-.17*big,.55*big,.6*big,.22*big,hair);if(look.hair==='spiky')for(let j=-1;j<=1;j++)this.box(x+j*.17,Y(1.68+Math.abs(j)*.06),z,.13,.2,.32,hair);if(look.outfit==='coat')this.box(x,Y(.2),z,.66*big,.35*big,.42*big,armor);if(look.outfit==='tunic')this.box(x,Y(.6),z+.2,.3*big,.5*big,.03,'#d1bd85');
  this.skinMaterial=window.SkinCatalog?.SKINS[look.accessorySkin]?.color||null;for(const id of look.accessories||[]){if(id==='cap'){this.box(x,Y(1.7),z,.65*big,.14*big,.58*big,'#5c8569');this.box(x,Y(1.65),z+.23*big,.65*big,.07*big,.4*big,'#456c51');}else if(id==='crown'){this.box(x,Y(1.68),z,.6*big,.12*big,.55*big,'#e5c36d');for(const dx of [-.22,0,.22])this.box(x+dx*big,Y(1.8),z+.2*big,.1*big,.17*big,.1*big,'#c76c65');}else if(id==='halo'){for(let j=0;j<12;j++){const a=j*Math.PI/6;this.box(x+Math.cos(a)*.4*big,Y(1.98),z+Math.sin(a)*.32*big,.13*big,.06*big,.13*big,'#eee0a2');}}else if(id==='satchel')this.box(x,Y(.65),z-.32*big,.5*big,.6*big,.25*big,'#9a704d');else if(id==='cape'){this.box(x,Y(.28),z-.34*big,.7*big,1*big,.09*big,'#9f4554');this.box(x,Y(.2),z-.4*big,.82*big,.2*big,.12*big,'#bd6470');}else if(id==='wings'){for(const side of [-1,1])for(let j=0;j<3;j++)this.box(x+side*(.4+j*.17)*big,Y(.65+j*.15),z-.26*big,.16*big,(.8-j*.16)*big,.12*big,j%2?'#97d7e4':'#baa7e1');}else if(id==='scarf'){this.box(x,Y(1.13),z,.58*big,.15*big,.5*big,'#d9aa66');this.box(x+.16*big,Y(.72),z+.27*big,.17*big,.5*big,.06*big,'#d9aa66');}else if(id==='pendant'){this.box(x,Y(1),z+.27*big,.04*big,.32*big,.04*big,'#d9d9c7');this.box(x,Y(.83),z+.29*big,.15*big,.17*big,.06*big,'#72d3d0');}}
  this.skinMaterial=null;if(look.face==='smile')this.box(x,Y(1.27),z+.235*big,.15*big,.025*big,.02,'#6f4f42');if(look.face==='fierce')for(const side of [-1,1])this.box(x+side*.1*big,Y(1.46),z+.24*big,.1*big,.03*big,.02,'#47352d');if(look.face==='scar')this.box(x+.13*big,Y(1.31),z+.24*big,.025*big,.21*big,.02,'#ac6457');if(unit.race==='elf')for(const side of [-1,1])this.box(x+side*.29*big,Y(1.4),z,.16,.11,.11,skin);if(unit.race==='dwarf')this.box(x,Y(1.11),z+.24,.38,.23,.13,hair);if(unit.race==='dragonborn')for(const side of [-1,1])this.box(x+side*.2,Y(1.67),z,.09,.25,.1,'#dcc591');
  if(look.face==='drawn'&&look.faceDrawing&&!fallen)this.drawFace(x,y,z,big,look.faceDrawing);else{this.box(x-.11*big,Y(1.39),z+.23*big,.055*big,.045*big,.025*big,'#35372d');this.box(x+.1*big,Y(1.39),z+.23*big,.055*big,.045*big,.025*big,'#35372d');}
  if(unit.kind==='king'){for(let i=-1;i<=1;i++)this.box(x+i*.22*big,Y(1.65),z,.12*big,.24*big,.12*big,'#c5ad68');this.box(x,Y(1.58),z,.56*big,.1*big,.5*big,'#b29b57');}
  this.partTransform=pose.swing?{y:Y(1.08),z,angle:pose.swing}:null;
  const held=unit.side==='party'&&this.state?DungeonCampaign.weaponFor(this.state,unit).style:null;
  this.skinMaterial=window.SkinCatalog?.SKINS[look.weaponSkin]?.color||null;if(held==='magic'||!held&&(unit.job==='mage'||unit.kind==='mage')){this.box(x+.6*big,Y(.02+armLift),z,.07*big,1.35*big,.07*big,'#8e7854');this.box(x+.6*big,Y(1.35+armLift),z,.19*big,.22*big,.19*big,'#c8bc8b');}
  else if(held==='arrow'||!held&&(unit.job==='ranger'||unit.kind==='archer')){this.box(x+.62*big,Y(.45),z,.07*big,.8*big,.1*big,'#b6a273');this.box(x+.56*big,Y(.5),z,.18*big,.06*big,.07*big,'#c6b98b');}
  else {this.box(x+.55*big,Y(.63+armLift),z+.04*big,.08*big,.75*big,.08*big,'#b7c4bd');this.box(x+.55*big,Y(.58+armLift),z,.32*big,.08*big,.1*big,'#b5a16c');this.partTransform=null;if(unit.side==='party')this.box(x-.62*big,Y(.48),z,.12*big,.56*big,.46*big,shade(color,.8));}
 }
 this.skinMaterial=null;const polygons=this.actorPolygons;this.actorPolygons=null;polygons.sort((a,b)=>a.depth-b.depth).forEach(p=>p.draw());this.partTransform=null;this.bodyTransform=null;this.fallenTint=false;
 if(!fallen)this.skinEffects(unit,x,y,z,time,pose);if(window.OceanVisuals?.isOcean(this.biome)&&unit.side==='party'&&!unit.summon&&!fallen){const c=this.paint,p=this.project(x,y+1.43,z);c.save();c.strokeStyle='#bfedee66';c.fillStyle='#c7f8f90a';c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y,this.scale*.36,this.scale*.38,0,0,Math.PI*2);c.fill();c.stroke();c.restore();}
 if(unit.guard&&unit.hp){const c=this.paint,p=this.project(x,1.95,z);c.fillStyle='#b8d4d3';c.font='12px Arial';c.textAlign='center';c.fillText('◇',p.x,p.y);}
 const labelHeight=fallen?.65:unit.kind.startsWith('sky')?(unit.boss?5:2.8):unit.raidOnly?({raidspider:4.4,raiddemon:7,raidkraken:6.5,raidfurnace:8.4,raidmaw:6}[unit.kind]||5.8):{drownedAdmiral:4.6,flower:2.6,bonecolossus:3.1,ironbell:3.7,sunape:2.8,cloudgiant:3,voidentity:3.7,stormheart:4,leviathan:3.8,orrery:4,king:3.1,golem:2.7,stag:3.5,treant:3.2,demon:2.5,gargoyle:2.3,bat:1.9,mushroom:1.4,mimic:1.4,beetle:1,spider:.95,wolf:1.55,boar:1.7,crystal:2,skull:1.65,specter:2.1,slime:.95,rat:.95,wisp:1.5}[unit.kind]||1.95;const point=this.project(x,unit.boss&&unit.kind.startsWith('sea')?5:unit.kind.startsWith('sea')?2.2:labelHeight,z);this.positions.set(unit.id,{x:point.x,y:point.y,worldX:pos.x,worldZ:pos.z,groundY:this.project(x,0,z).y,facing:unit.side==='party'?1:-1});
 if(!this.title){const c=this.paint,w=Math.max(48,this.scale*1.12);c.font='600 '+Math.max(7,Math.min(10,this.scale*.17))+'px Arial';c.textAlign='center';c.shadowColor='#102217';c.shadowBlur=5;c.fillStyle=unit.hp?'#e4e8d3':'#a4a4a4';c.fillText(unit.name+(unit.side==='enemy'?' · '+DungeonCampaign.Elements.label(DungeonCampaign.enemyAffinity(unit).element):'')+(fallen?' · DOWN':''),point.x,point.y);c.shadowBlur=0;c.fillStyle='#142016';c.fillRect(point.x-w/2,point.y+6,w,4);c.fillStyle=unit.side==='party'?'#9fbd7a':'#c87969';c.fillRect(point.x-w/2,point.y+6,w*(unit.hp/unit.maxHp),4);if(active){c.fillStyle='#e1d2a2';c.beginPath();c.moveTo(point.x,point.y-17);c.lineTo(point.x-4,point.y-23);c.lineTo(point.x+4,point.y-23);c.fill();}}
 if(dying)this.paint.restore();
 }
 creature(unit,x,y,z,time,pose,color){
 if(unit.kind==='drownedAdmiral'){
 const sway=this.reduced?0:Math.sin(time/650)*.07,swing=pose.swing||0,box=(dx,dy,dz,w,h,d,col)=>this.box(x+dx,y+dy+sway,z+dz,w,h,d,col);
 // Split keel, corroded admiral's coat, and a broken mast form an asymmetric silhouette.
 box(0,.45,0,1.25,1.7,.85,'#193f49');box(0,.6,.44,.8,1.25,.12,'#285b61');
 for(const side of [-1,1]){box(side*.4,.04,0,.3,.55,.4,'#4e665c');box(side*.68,1.65,0,.5,.3,.7,'#b5995c');for(let i=0;i<3;i++)box(side*(.65+i*.07),1.52-i*.1,.27,.12,.19,.12,'#938659');}
 for(let i=0;i<4;i++){box((i%2?.2:-.2),.8+i*.23,.53,.08,.08,.05,'#d3b77a');box(-.55+i*.35,.25-i%2*.16,-.48,.25,.65,.13,'#274551');}
 box(0,2.12,0,.65,.6,.6,'#a6c2b1');box(0,2.04,.32,.48,.23,.08,'#496b64');box(-.17,2.43,.33,.15,.08,.04,'#8ffff0');box(.17,2.43,.33,.18,.13,.04,'#102c37');box(.17,2.55,0,.07,.08,.7,'#162b32');
 box(0,2.78,0,1.3,.18,.75,'#152831');box(0,2.9,0,.7,.32,.58,'#1c3942');box(0,2.83,.4,1.2,.07,.05,'#baa26b');box(0,3.02,.3,.15,.16,.08,'#9ce9d5');
 // Cannon arm and its glowing muzzle.
 box(-.9,1.1,0,.5,.65,.55,'#416b68');box(-.9,1.27,.43,.55,.48,1,'#35545a');box(-.9,1.3,.97,.4,.3,.06,'#071c28');box(-.9,1.3,1.01,.2,.15,.025,'#70ebda');
 // Anchor arm hangs on real links, with a forked iron fluke.
 box(.93,1.2+swing*.2,0,.35,.65,.4,'#416b68');for(let i=0;i<5;i++)box(1.1,.85-i*.15,.1,.13,.12,.15,i%2?'#99b1a0':'#456866');box(1.1,-.08,.1,.16,.8,.18,'#658b85');box(1.1,-.08,.1,.9,.14,.2,'#658b85');for(const side of [-1,1])box(1.1+side*.38,.02,.1,.16,.3,.2,'#86a59a');
 box(.35,1.2,-.65,.16,2.8,.16,'#655b48');box(.35,3.52,-.65,1.8,.14,.17,'#80735b');for(let i=0;i<6;i++)box(-.35+i*.27,2.9+(i%2)*.12,-.69,.25,.8-(i%3)*.12,.07,i%2?'#488c83':'#65b2a0');
 for(let i=0;i<9;i++){const a=i*2.4;box(Math.cos(a)*.65,.6+(i%4)*.47,Math.sin(a)*.5,.18,.18,.18,i%2?'#b2bca1':'#608c80');}
 for(let i=0;i<5;i++){const a=time/1300+i*1.256;box(Math.cos(a)*1.35,.1+Math.sin(a)*.1,Math.sin(a)*.8,.12,.25,.12,'#69cbb9');}
 return true;
 }
 if(unit.kind==='oregolem'){const swing=pose.swing||0;this.box(x,y+.45,z,1.6,1.5,1.25,'#6f6b63');this.box(x,y+1.95,z,.9,.65,.85,color);for(const side of [-1,1]){this.box(x+side*.5,y,z,.6,.5,.75,'#595d58');this.box(x+side*1.1,y+.65+swing*side*.15,z,.7,1,.8,'#827b69');this.box(x+side*1.2,y+.45,z+.4,.8,.65,.85,'#5c615d');for(let i=0;i<3;i++)this.box(x+side*(.65+i*.2),y+1.6+i*.17,z-.3,.22,.6,.25,i%2?'#a6cbd4':'#bf9cda');}this.box(x,y+1.05,z+.65,.5,.6,.12,'#88ddd5');for(const side of [-1,1])this.box(x+side*.23,y+2.27,z+.45,.16,.09,.04,'#e1c983');for(let i=0;i<5;i++){const a=time/1600+i*1.256;this.box(x+Math.cos(a)*1.8,y+.25+Math.sin(a)*.1,z+Math.sin(a)*1.2,.25,.3,.28,'#8a8677');}return true;}

 if(['flower','bonecolossus','ironbell','sunape','cloudgiant','skyweaver'].includes(unit.kind)){const k=unit.kind,assembly=k==='sunape'&&this.sunAssembly!==undefined?this.sunAssembly:1;let stonePart=0;const box=(dx,dy,dz,w,h,d,col=color)=>{const n=stonePart++,spread=1-assembly,a=n*2.399;this.box(x+dx*assembly+Math.cos(a)*(1.3+n%4*.45)*spread,y+dy*assembly+(n%3)*.12*spread+Math.sin(assembly*Math.PI)*.35,z+dz*assembly+Math.sin(a)*(1+n%3*.5)*spread,w,h,d,col);},pulse=this.reduced?0:Math.sin(time/550)*.1;
 if(k==='flower'){box(0,0,0,.4,1.7,.4,'#527b43');for(let i=0;i<8;i++){const a=i*Math.PI/4,dx=Math.cos(a),dz=Math.sin(a);box(dx*.65,1.6+Math.abs(dx)*.2,dz*.65,.7,.25,.7,color);box(dx*1.05,.08,dz*1.05,.6,.15,.8,'#608b4e');box(dx*1.3,.1+pulse,dz*1.3,.12,.5,.12,'#71945a');}box(0,1.5,0,.85,.45,.85,'#39283d');for(let i=0;i<6;i++){const a=i*Math.PI/3;box(Math.cos(a)*.34,1.92,Math.sin(a)*.34,.1,.3,.1,'#e4d4ba');}box(0,1.97+pulse,0,.25,.14,.25,'#e6ba8b');}
 else if(k==='bonecolossus'){for(const side of [-1,1]){box(side*.4,0,0,.3,.8,.35,'#bcb29b');box(side*.9,.7,0,.25,1.2,.3,'#d8cdb3');for(let i=0;i<5;i++)box(side*.35,.8+i*.22,.12,.65,.1,.8,'#d7c9ad');}box(0,.65,-.2,.15,1.8,.2,'#a39785');box(0,2,0,.85,.65,.7,'#ded0b6');for(const side of [-1,1])box(side*.22,2.3,.37,.22,.2,.03,'#252b2d');box(0,2.05,.35,.15,.17,.05,'#252b2d');}
 else if(k==='ironbell'){for(let i=0;i<6;i++){const width=2-i*.24;box(0,.3+i*.28,0,width,.3,width,'#8e9c97');}box(0,.1,0,2.2,.2,2.2,'#b8b99e');box(0,-.15+pulse,0,.25,.5,.25,'#5a6664');for(const side of [-1,1])for(let i=0;i<5;i++)box(side*.5,2+i*.24,0,.12,.2,.12,'#697873');}
 else if(k==='sunape'){box(0,.6,0,1.1,1.2,.7);box(0,1.6,.2,.75,.6,.65);box(0,1.55,.55,.65,.25,.35,'#ab9b78');for(const side of [-1,1]){box(side*.4,0,0,.4,.65,.5);box(side*.85,.55,-.05,.55,1.1,.55);box(side*.9,.1,.15,.65,.4,.65,'#af9565');box(side*.2,1.98,.55,.12,.09,.04,'#e5df99');}box(0,.95,.38,.65,.5,.08,'#ecd08b');}
 else if(k==='cloudgiant'){for(let i=0;i<9;i++){const a=i*Math.PI*2/9;box(Math.cos(a)*.7,1.1+Math.sin(a)*.4+pulse,Math.sin(a)*.5,.85,.8,.85,color);}box(0,1.6,0,1.1,.7,1,'#e5eaf0');for(const side of [-1,1]){box(side*.28,1.85,.55,.18,.12,.05,'#5e7b98');box(side*.6,.1,0,.1,.8,.1,'#9bc1d8');}}
 else{box(0,1,0,.4,.9,.45);for(const side of [-1,1])for(let i=0;i<5;i++){const dx=side*(.45+i*.26);box(dx,1.4+Math.sin(i)*.25+pulse,-.3+i*.12,.4,.15,1.2-i*.14,i%2?'#e0d3c0':color);box(dx,.3+i*.12,0,.06,.7,.06,color);}box(0,1.9,0,.4,.4,.4,'#e5d5b5');}
 return true;}
 if(unit.kind.startsWith('sky')){const big=unit.boss?2.3:1,hover=this.reduced||['skyram','skytoad','skycrab','skyanvil','skywarden','skytortoise','skyprismwalker','skysunmimic','skyscarab'].includes(unit.kind)?0:Math.sin(time/450)*.15,box=(dx,dy,dz,w,h,d,col=color)=>this.box(x+dx*big,y+(dy+hover)*big,z+dz*big,w*big,h*big,d*big,col),k=unit.kind;
 if(k==='skyram'){box(0,.5,0,.95,.75,1.2,'#e2e3d2');for(let i=0;i<6;i++)box(Math.sin(i*2)*.4,.8+(i%2)*.12,-.45+(i%3)*.4,.5,.4,.5,'#cbd5d0');box(0,.8,.72,.6,.5,.55,color);for(const side of [-1,1]){for(const zz of [-.4,.4])box(side*.31,.06,zz,.18,.5,.2,'#8d9489');box(side*.39,1,.7,.24,.4,.28,'#9eaa9c');box(side*.32,.9,.99,.15,.2,.15,'#ccd5bd');box(side*.17,1.03,1.02,.07,.07,.03,'#3c5a59');}}
 else if(k==='skyjelly'){for(let i=0;i<3;i++)box(0,1.45+i*.18,0,1.05-i*.2,.25,1.05-i*.2,i%2?'#dacbe7':color);box(0,1.3,0,.4,.3,.4,'#fff1bc');for(let i=0;i<7;i++){const a=i*2.399,sw=this.reduced?0:Math.sin(time/380+i)*.12;for(let j=0;j<3;j++)box(Math.cos(a)*.4+sw*j,.95-j*.25,Math.sin(a)*.4,.06,.3,.06,i%2?'#a8dfd3':'#c8b2e2');}}
 else if(k==='skychime'){for(const side of [-1,1])box(side*.55,.7,0,.12,1.4,.12,'#8aa8a0');box(0,1.95,0,1.4,.18,.4,'#587f7d');for(let i=0;i<5;i++){const sway=this.reduced?0:Math.sin(time/400+i)*.1;box((i-2)*.23+sway,1.05-(i%3)*.16,0,.12,.65+(i%3)*.16,.14,'#d6bc7f');box((i-2)*.23+sway,1.72,0,.03,.3,.03,'#b1c5b9');}box(0,.8,.14,.15,.3,.05,'#8ce1d4');}
 else if(k==='skylotus'){box(0,.45,0,.16,.9,.16,'#6d986c');for(let i=0;i<8;i++){const a=i*Math.PI/4+(this.reduced?0:time/9000),bloom=this.reduced?0:Math.sin(time/650+i)*.05;box(Math.cos(a)*.6,.85+bloom,Math.sin(a)*.6,.65,.12,.45,i%2?'#e5d0d6':'#9fbea7');box(Math.cos(a)*.4,.15,Math.sin(a)*.4,.45,.08,.3,'#749b77');}box(0,.95,0,.4,.3,.4,'#eed6a2');}
 else if(k==='skytoad'){box(0,.16,0,1.05,.6,.9);box(0,.35,.45,.85,.4,.55,'#b9c7b4');box(0,.17,.75,.55,.25,.12,'#dec78f');for(const side of [-1,1]){box(side*.6,.02,-.2,.4,.3,.6);box(side*.5,.02,.5,.3,.12,.4,'#6e8195');box(side*.3,.85,.43,.27,.27,.25,'#c5cfb8');box(side*.3,.91,.57,.1,.12,.02,'#ffe4a2');}const throat=this.reduced?0:Math.sin(time/550)*.08;box(0,.18,.6,.65+throat,.28+throat,.3,'#92bfd0');}
 else if(k==='skycrab'){box(0,.25,0,1.05,.5,.85,'#8b8ba7');box(0,.75,0,.75,.2,.65,color);for(const side of [-1,1]){for(let i=0;i<3;i++){box(side*(.6+i*.08),.15,-.35+i*.3,.6,.1,.13,'#a9b3c1');box(side*(.85+i*.08),.02,-.25+i*.3,.12,.22,.12,'#8494aa');}box(side*.8,.55,.7,.35,.3,.5,'#d7c7e1');box(side*.9,.85,.88,.12,.4,.18,'#eee0b5');box(side*.7,.85,.88,.12,.3,.18,'#d2bdde');box(side*.24,.8,.5,.1,.22,.1,'#e9dfab');}box(0,.98,0,.12,.35,.12,'#bce4ee');}
 else if(k==='skyanvil'){box(0,.65,0,1.6,.35,.65,'#6e829a');box(.9,.72,0,.5,.17,.4,'#a5b5c1');box(0,.25,0,.6,.45,.5);box(0,.1,0,1.1,.16,.75,'#a2afbb');for(let i=0;i<3;i++){const a=i*2.094+(this.reduced?0:time/1800);box(Math.cos(a)*1.15,.15+Math.sin(a)*.2,Math.sin(a)*.8,.35,.45,.35,'#b4bfd0');}box(-.2,1.6,0,.2,.7,.2,'#c8b783');box(-.2,2.1,0,.9,.3,.5,'#8191aa');}
 else if(k==='skydynamo'){box(0,1,0,.5,.8,.5,'#f1df9d');box(0,.8,0,.2,1.2,.2,'#d4e6e7');for(let j=0;j<2;j++)for(let i=0;i<10;i++){const a=i*Math.PI/5+(this.reduced?0:time/(j?800:-900));box(Math.cos(a)*.65,1+Math.sin(a)*(.25+j*.4),Math.sin(a)*.45,.15,.12,.18,j?'#adc3cf':'#b7a67b');}for(const side of [-1,1]){box(side*.8,.2,0,.13,.6,.13,'#7f92a3');box(side*.8,.8,0,.3,.16,.3,'#c5d9dc');}}
 else if(k==='skywarden'){box(0,.55,0,.7,1,.45,'#9d986e');box(0,1.5,0,.55,.5,.5,'#d8ca9d');box(0,1.65,.28,.34,.12,.05,'#fff4b9');for(const side of [-1,1]){box(side*.24,.02,0,.2,.55,.25,'#8b948e');box(side*.55,.75,0,.22,.8,.25,color);box(side*.42,1.4,0,.5,.18,.4,'#d5cba0');}box(-.65,.45,.15,.5,.8,.12,'#b8d0c2');box(.72,.02,.2,.06,2.4,.06,'#aa9874');box(.72,2.3,.2,.18,.35,.16,'#fff0bb');box(0,1.12,.26,.3,.42,.04,'#cee2de');}
 else if(k==='skytortoise'){box(0,.15,0,1.2,.6,1.3,'#758e9a');box(0,.75,0,.95,.25,1.05,color);box(0,.98,0,.55,.18,.65,'#c4d4d8');box(0,.3,.85,.5,.35,.5,'#a6c6cb');for(const side of [-1,1]){for(const zz of [-.45,.45])box(side*.48,.02,zz,.25,.3,.35,'#7b9ba5');box(side*.13,.52,1.1,.08,.06,.03,'#f8edbc');}for(let i=0;i<5;i++){const a=i*2.399+(this.reduced?0:time/2000);box(Math.cos(a)*1.05,1.2+Math.sin(a)*.2,Math.sin(a)*.85,.13,.15,.13,'#d1dded');}}
 else if(k==='skyprismwalker'){box(0,.7,0,.6,.55,.7);box(0,.9,.4,.32,.3,.1,'#f8edbc');for(let i=0;i<6;i++){const a=i*Math.PI/3,step=this.reduced?0:Math.sin(time/480+i)*.04;box(Math.cos(a)*.65,.45+step,Math.sin(a)*.65,.55,.1,.12,'#b5a3cb');box(Math.cos(a)*.95,.02,Math.sin(a)*.95,.1,.55+step,.1,'#d5c8df');}box(0,1.35,0,.15,.4,.15,'#c2e2e8');}
 else if(k==='skysunmimic'){box(0,.15,0,1.1,.65,.75,'#9b784c');box(0,.8,0,1.2,.22,.85,color);box(0,.55,.4,.95,.22,.07,'#3d343c');for(let i=0;i<5;i++){box(-.36+i*.18,.62,.45,.09,.14,.08,'#fff0bc');box(-.36+i*.18,.48,.45,.09,.12,.08,'#dcd2a8');}for(const side of [-1,1]){box(side*.5,.15,.4,.1,.65,.09,'#dcc48a');box(side*.3,.02,0,.25,.18,.4,'#7f654e');}box(0,.65,.46,.15,.15,.04,'#ffc477');box(0,1.1,0,.18,.35,.18,'#ffe2a0');}
 else if(k==='skyscarab'){box(0,.3,0,.8,.45,1,'#b29c5d');for(const side of [-1,1]){box(side*.2,.65,0,.36,.15,.85,color);for(let i=0;i<3;i++)box(side*.55,.06,-.35+i*.35,.4,.1,.12,'#8e855a');box(side*.25,.8,.4,.09,.35,.09,'#d9c98e');}box(0,.45,.65,.42,.3,.4,'#a28d54');box(0,.5,.95,.16,.22,.3,'#f4df9a');}
 else if(k==='skywing'){box(0,.9,0,.5,.4,1.2);box(0,1.1,.6,.35,.35,.4);box(0,1,.95,.15,.16,.35,'#e9c99a');for(const side of [-1,1])for(let i=0;i<5;i++)box(side*(.35+i*.22),.9+(this.reduced?0:Math.sin(time/250)*i*.07),-.15-i*.12,.3,.12,.85-i*.08);}
 else if(k==='skyserpent'){for(let i=0;i<12;i++)box(Math.sin(i*.65+time/700)*.4,.6+i*.08,-1.6+i*.28,.35,.35,.4);box(.1,1.6,1.6,.65,.45,.7);for(const side of [-1,1]){box(side*.3,1.9,1.8,.12,.12,.12,'#fff2c6');box(side*.5,1.6,.9,.8,.08,.6,'#ead8ac');}}
 else{for(let i=0;i<7;i++){const a=i*Math.PI*2/7+time/1400;box(Math.cos(a)*.5,1+Math.sin(a)*.25,Math.sin(a)*.5,.5,.45,.5);}box(0,1,0,.6,.6,.6);box(0,1.2,.52,.22,.22,.12,'#fff2b1');for(let i=0;i<3;i++)box((i-1)*.35,.2,0,.08,.55,.08,'#f0d796');}
 return true;}

 if(window.OceanVisuals?.creature(this,unit,x,y,z,time,pose,color))return true;const k=unit.kind,step=pose.stride||0;

 if(unit.raidOnly){const box=(dx,dy,dz,w,h,d,col=color)=>this.box(x+dx,y+dy,z+dz,w,h,d,col),pulse=this.reduced?0:Math.sin(time/450)*.15;this.shadow(x,z,3.2,2,.5);
 if(k==='raidspider'){box(0,1.2,-1.2,2.4,1.8,3,'#354030');box(0,1.3,1,1.8,1.1,1.8);for(const side of [-1,1]){for(let i=0;i<4;i++){const zz=(i-1.5)*.85,walk=this.reduced?0:Math.sin(time/230+i*1.7+side)*.18;box(side*1.5,1.4+walk,zz,1.8,.22,.3,'#6b7e49');box(side*2.5,.2+walk,zz+.3,.28,1.4,.28,'#455431');box(side*2.8,.1,zz+.6,.7,.2,.3,'#a4b66e');}box(side*.5,.6,2,.25,.8,.3,'#e4dfb7');for(let i=0;i<3;i++)box(side*(.25+i*.3),1.8,1.95-i*.15,.2,.18,.12,'#ee6b8c');}for(let i=0;i<5;i++)box((i%2-.5)*.8,2.8,-1.9+i*.5,.35,.15,.3,'#b9d47a');}
 else if(k==='raiddemon'){box(0,1.4,0,2.1,2.8,1.25,'#652c3d');box(0,4.1,0,1.4,1.2,1.2);box(0,2.3,.7,1.4,1.1,.12,'#301c2a');for(const side of [-1,1]){box(side*.65,0,0,.6,1.5,.8,'#30202c');box(side*1.6,1.7,0,.65,2.2,.75);box(side*.8,5.1,-.1,.3,1.5,.4,'#d8c5a0');box(side*.35,4.8,.66,.32,.12,.04,'#fff29a');for(let i=0;i<5;i++)box(side*(1.4+i*.65),3.5-i*.4+pulse,-.7,.8,1.9-i*.23,.18,'#492337');box(side*.5,2.8,.83,.2,.25,.14,'#d9ceaf');}box(2,0,1,.18,4.6,.18,'#af9c82');box(2,4.3,1,1.2,.35,.3,'#c8bba0');}
 else if(k==='raidkraken'){box(0,1.8,-.8,2.4,3.2,2.3,'#245d66');box(0,4.5,-.8,1.7,1.3,1.8);for(let i=0;i<8;i++){const a=i*Math.PI/4;for(let j=0;j<5;j++){const rad=1+j*.55;box(Math.cos(a)*rad,.6+Math.sin(j*.8+time/600+i)*.4,Math.sin(a)*rad,.65-j*.07,.65-j*.07,.8-j*.09,'#448e91');}}for(const side of [-1,1])box(side*.6,4.3,.43,.32,.23,.08,'#dfffb0');for(let i=0;i<6;i++)box((i-2.5)*.24,2.8,.44,.12,.55,.13,'#e9e2bd');}
 else if(k==='raidfurnace'){box(0,.3,0,3.2,1,2.8,'#323139');box(0,1.3,0,2.7,2.8,2.5,'#59515a');box(0,2.1,1.28,1.8,1.5,.08,'#ff9e44');for(let i=0;i<6;i++)box((i-2.5)*.3,2.1,1.4,.1,1.5,.12,'#211c25');for(const side of [-1,1]){box(side*2,1.5,0,1.1,1.8,1.2,'#736b68');box(side*2,3.3,0,.4,1.6,.4,'#b99d73');box(side*1.4,3.9,-.5,.6,2.2,.7,'#302932');for(let j=0;j<4;j++)box(side*1.4,6.1+j*.4+pulse,-.5,.7+j*.2,.35,.7+j*.2,'#4e3d49');}box(0,4,0,1.3,.3,1.3,'#e5a55d');}
 else{for(let i=0;i<18;i++){const a=i*Math.PI/9+time/2200,r=2.1;box(Math.cos(a)*r,2.8+Math.sin(a)*r*.8,0,.5,.6,.7,'#64507c');box(Math.cos(a)*1.6,2.8+Math.sin(a)*1.3,.3,.18,.5,.3,'#f2e5ca');}box(0,2,-.3,2.4,1.8,.6,'#130e23');for(let i=0;i<5;i++)box((i-2)*.5,4.8+Math.sin(time/600+i)*.4,-.6,.24,.24,.24,'#c9a1ff');}
 return true;}
 if(['voidentity','stormheart','leviathan','orrery','raidmaw','raidcathedral','raidfurnace'].includes(k)){
 const giant=unit.raidOnly,scale=giant?2.8:1.5,spin=this.reduced?time/2500:time/1200,hover=Math.sin(time/500)*.1;
 this.shadow(x,z,scale*1.1,scale*.7,.4);this.box(x,y+.7*scale+hover,z,.95*scale,1.1*scale,.9*scale,shade(color,.45));
 // A hollow, many-eyed core surrounded by articulated non-human geometry.
 for(let i=0;i<8;i++){const a=i*Math.PI/4+spin*.4,r=scale*.85;this.box(x+Math.cos(a)*r,y+scale*(.8+.35*Math.sin(a))+hover,z+Math.sin(a)*r,.3*scale,.65*scale,.3*scale,shade(color,.8));}
 this.box(x,y+scale*1.1+hover,z+.5*scale,.55*scale,.25*scale,.06,color);this.box(x,y+scale*1.08+hover,z+.54*scale,.16*scale,.26*scale,.04,'#140a22');
 if(k==='voidentity')for(let i=0;i<3;i++){const a=spin+i*Math.PI*2/3,gx=x+Math.cos(a)*1.6,gz=z+Math.sin(a)*1.6,gy=y+1.8+Math.sin(a*2)*.25;this.box(gx,gy,gz,.32,.5,.32,['#fa6488','#77caff','#b7f387'][i]);this.box(gx,gy+.5,gz,.17,.15,.17,'#fff0dc');}
 if(['leviathan','raidmaw'].includes(k))for(let i=0;i<9;i++){const a=i*Math.PI*2/9,r=scale*(.8+.16*Math.sin(time/400+i));this.box(x+Math.cos(a)*r,y+.2,z+Math.sin(a)*r,.13*scale,1.15*scale,.12*scale,'#e3e4db');}
 if(k==='raidcathedral')for(const d of [-1,1]){this.box(x+d*scale,y,z,.45*scale,3*scale,.45*scale,shade(color,.5));this.box(x+d*scale,y+3*scale,z,.25*scale,.8*scale,.25*scale,color);}
 if(['orrery','stormheart','raidfurnace'].includes(k))for(let i=0;i<12;i++){const a=spin+i*Math.PI/6,r=scale*1.4;this.box(x+Math.cos(a)*r,y+scale*(1.5+.4*Math.sin(a)),z+Math.sin(a)*r,.22*scale,.22*scale,.22*scale,color);}
 return true;
 }

 if(['wolf','boar','stag'].includes(k)){
  const boss=k==='stag',scale=boss?1.55:k==='boar'?1.15:1;
  for(const dx of [-.23,.23])for(const dz of [-.33,.33])this.box(x+dx*scale,y+.03+Math.max(0,step*(dx*dz>0?1:-1)),z+dz*scale,.16*scale,.45*scale,.18*scale,shade(color,.72));
  this.box(x,y+.43*scale,z,.6*scale,.46*scale,1.02*scale,color);this.box(x,y+.73*scale,z+.5*scale,.42*scale,.43*scale,.45*scale,color);this.box(x,y+.75*scale,z+.78*scale,.32*scale,.22*scale,.22*scale,shade(color,.8));
  for(const dx of [-.17,.17]){this.box(x+dx*scale,y+1.1*scale,z+.46*scale,.12*scale,.23*scale,.15*scale,color);this.box(x+dx*scale,y+.98*scale,z+.74*scale,.055*scale,.05*scale,.03*scale,'#1e2820');}
  this.box(x,y+.67*scale,z-.66*scale,.15*scale,.14*scale,.35*scale,color);
  if(k==='boar')for(const dx of [-.22,.22])this.box(x+dx,y+.59,z+.88,.09,.27,.09,'#e6d8b7');
  if(boss)for(const dx of [-.27,.27]){this.box(x+dx*scale,y+1.21*scale,z+.39*scale,.1,.65,.1,'#c5b28b');this.box(x+dx*scale+Math.sign(dx)*.15,y+1.6*scale,z+.39*scale,.4,.09,.1,'#c5b28b');this.box(x+dx*scale+Math.sign(dx)*.3,y+1.62*scale,z+.39*scale,.09,.3,.1,'#c5b28b');}
 }else if(['spider','beetle'].includes(k)){
  for(const side of [-1,1])for(let i=0;i<(k==='spider'?4:3);i++){const dz=(i-1.5)*.2;this.box(x+side*.48,y+.1+Math.max(0,step),z+dz,.65,.07,.08,shade(color,.65));this.box(x+side*.76,y,z+dz,.08,.18,.08,shade(color,.65));}
  this.box(x,y+.18,z,.64,.33,.72,color);this.box(x,y+.36,z-.08,.45,.2,.4,shade(color,1.15));this.box(x,y+.2,z+.4,.4,.24,.25,shade(color,.9));
  for(const dx of [-.11,.11])this.box(x+dx,y+.34,z+.54,.07,.07,.03,'#f3d8ab');
  if(k==='beetle')this.box(x,y+.32,z+.7,.11,.2,.3,'#d0c39b');
 }else if(k==='mushroom'){
  this.box(x,y+.03,z,.3,.66,.3,'#d2c3a0');this.box(x,y+.64,z,1,.25,.85,color);this.box(x,y+.89,z,.65,.2,.55,shade(color,1.12));
  for(const dx of [-.18,.18])this.box(x+dx,y+.9,z+.2,.15,.045,.12,'#e5d8b6');for(const dx of [-.07,.07])this.box(x+dx,y+.4,z+.16,.04,.06,.02,'#343c29');
 }else if(['bat','gargoyle'].includes(k)){
  const big=k==='gargoyle'?1.4:1,bob=this.reduced?0:Math.sin(time/260)*.09,flap=this.reduced?0:Math.sin(time/130)*.17;
  this.box(x,y+.55+bob,z,.35*big,.6*big,.32*big,color);this.box(x,y+1.1+bob,z,.37*big,.28*big,.32*big,color);
  for(const side of [-1,1]){this.box(x+side*.45*big,y+.84+bob+flap,z,.7*big,.11*big,.55*big,shade(color,.8));this.box(x+side*.85*big,y+.74+bob+flap,z,.25*big,.08,.35*big,color);this.box(x+side*.13,y+1.35+bob,z,.12,.27,.1,color);this.box(x+side*.1,y+1.25+bob,z+.17,.05,.05,.02,'#d8dca4');}
 }else if(k==='mimic'){
  this.box(x,y+.03,z,.95,.55,.68,'#856342');this.box(x,y+.46,z,.98,.12,.7,'#b6a16b');this.box(x,y+.59,z,.8,.16,.56,'#291e1b');this.box(x,y+.78+(this.reduced?0:Math.sin(time/500)*.04),z-.1,1,.24,.6,color);
  for(let i=0;i<5;i++){this.box(x-.32+i*.16,y+.55,z+.34,.08,.15,.08,'#e4dfc4');this.box(x-.32+i*.16,y+.76,z+.22,.08,.13,.08,'#e4dfc4');}
 }else if(k==='crystal'){
  for(let i=0;i<6;i++){const width=[.18,.4,.62,.55,.34,.12][i];this.box(x,y+.3+i*.22,z,width,.25,width,color);}this.box(x-.4,y+.15,z+.14,.24,.6,.24,shade(color,.8));
 }else if(k==='skull'){
  const bob=this.reduced?0:Math.sin(time/500)*.08;this.box(x,y+.7+bob,z,.58,.48,.48,color);this.box(x,y+.54+bob,z+.08,.4,.18,.4,color);for(const dx of [-.15,.15])this.box(x+dx,y+.91+bob,z+.25,.12,.13,.02,'#343831');this.box(x,y+.76+bob,z+.25,.07,.07,.02,'#343831');
 }else if(k==='specter'){
  for(let i=0;i<5;i++)this.box(x,y+.22+i*.23,z,.26+i*.07,.25,.24+i*.045,shade(color,.65+i*.08));this.box(x,y+1.4,z,.43,.38,.4,color);for(const dx of [-.1,.1])this.box(x+dx,y+1.6,z+.21,.06,.04,.02,'#c6e1cf');
 }else if(['treant','demon','imp'].includes(k)){
  const big=k==='treant'?1.5:k==='demon'?1.25:.75;this.box(x,y+.38*big,z,.7*big,.88*big,.5*big,color);this.box(x,y+1.25*big,z,.5*big,.43*big,.46*big,color);
  for(const side of [-1,1]){this.box(x+side*.23*big,y+Math.max(0,step*side),z,.25*big,.5*big,.3*big,shade(color,.8));this.box(x+side*.53*big,y+.55*big+pose.gesture*.2,z,.24*big,.7*big,.3*big,color);this.box(x+side*.22*big,y+1.65*big,z,.11*big,.35*big,.12*big,k==='treant'?'#a3ae71':'#d0b18c');this.box(x+side*.12*big,y+1.48*big,z+.24*big,.06*big,.05*big,.02,k==='treant'?'#e6d794':'#e6a97f');}
  if(k==='treant')this.box(x,y+1.8,z,.9,.35,.7,'#708855');
 }else return false;
 return true;
 }
 play(result){
 const now=performance.now(),actor=this.state&&DungeonCampaign.unit(this.state,result.actor);
 const support=['focus','potion','revive'].includes(result.action)||!!(DungeonCampaign.SKILLS[result.skill]?.heal||DungeonCampaign.SKILLS[result.skill]?.summon||DungeonCampaign.SKILLS[result.skill]?.self);
 const style=result.skill==='universe'?'cosmic':result.skill==='strike'&&actor?.side==='party'?DungeonCampaign.weaponFor(this.state,actor).style:(result.skill?DungeonCampaign.skillFor(this.state,actor,result.skill)?.style:null)||(actor?.side==='party'&&this.state&&DungeonCampaign.weaponFor(this.state,actor).skill===result.skill?DungeonCampaign.weaponFor(this.state,actor).style:null)|| (support?(result.action==='focus'?'focus':'heal'):result.skill==='ember'||actor?.kind==='wisp'||actor?.kind==='mage'||actor?.job==='mage'?'magic':result.skill==='volley'||actor?.job==='ranger'||actor?.kind==='archer'?'arrow':result.skill==='sunder'||DungeonCampaign.SKILLS[result.skill]?.ultimate?'heavy':'slash');
 const critical=result.events?.some(e=>e.critical)&&result.skill!=='universe';const duration=result.skill==='universe'?10000:DungeonCampaign.SKILLS[result.skill]?.duration|| (critical?2400:['slash','heavy'].includes(style)?1500:this.reduced?300:1100),impactAt=result.skill==='universe'?9000:DungeonCampaign.SKILLS[result.skill]?.impactAt|| (DungeonCampaign.SKILLS[result.skill]?.cinematic?6000:DungeonCampaign.SKILLS[result.skill]?.duration?1000:critical?1450:['slash','heavy'].includes(style)?885:this.reduced?80:450);
 const primary=result.events?.find(e=>e.type==='damage'&&e.source===result.actor&&e.target!==result.actor)||result.events?.[0];
 const targetUnit=this.state&&DungeonCampaign.unit(this.state,primary?.target),roster=targetUnit?.side==='party'?this.state.party:this.state?.enemies,targetIndex=roster?.findIndex(p=>p.id===primary?.target),destination=targetUnit?this.positionFor(targetUnit,targetIndex):null;
 this.animations.push({actor:result.actor,target:primary?.target,destination:destination?{worldX:destination.x,worldZ:destination.z}:null,style,skill:result.skill||result.action,missed:primary?.type==='miss',critical:result.events?.some(e=>e.critical),ultimate:!!(DungeonCampaign.SKILLS[result.skill]?.cinematic||DungeonCampaign.SKILLS[result.skill]?.ultimate||DungeonCampaign.SKILLS[result.skill]?.raceUltimate),impactAt,at:now,duration});
 for(const event of result.events||[])this.effects.push({...event,style,at:now+impactAt,start:now,duration});
 return {duration,impactAt,style};
 }
 drawDefeats(time){const c=this.paint;for(const e of this.effects){const unit=this.state&&DungeonCampaign.unit(this.state,e.target);if(e.type!=='damage'||!(unit?.side==='enemy'&&unit.hp<=0||e.target?.startsWith('knight-')&&e.defeated))continue;const age=time-e.at;if(age<0||age>1100)continue;const p=this.point(e.target);if(!p)continue;const t=age/1100,purple=e.style==='cosmic';c.save();c.globalAlpha=1-t;for(let i=0;i<36;i++){const angle=i*2.399,x=p.x+Math.cos(angle)*this.scale*(.2+t*.9),y=p.groundY-this.scale*(.25+(i%7)*.16)-t*this.scale*(.5+(i%5)*.1);c.fillStyle=purple?(i%3?'#bb75ff':'#eee1ff'):(i%3?'#aaa2a7':'#e3b280');if(purple&&t<.65){c.beginPath();c.moveTo(x,y-9);c.quadraticCurveTo(x+6,y+5,x,y+7);c.quadraticCurveTo(x-6,y+5,x,y-9);c.fill();}else c.fillRect(x,y,Math.max(1,4*(1-t)),Math.max(1,4*(1-t)));}c.restore();}}
 casting(x,y,z,time,anim){
 const c=this.paint,progress=Math.min(1,(time-anim.at)/anim.duration),ground=this.project(x,.03,z),orb=this.project(x+.6,y+1.85,z);c.save();c.strokeStyle=CombatVFX.profile(anim.skill,anim.style).color;c.fillStyle='#dfe6ff';c.globalAlpha*=Math.sin(progress*Math.PI);c.lineWidth=2;
 c.beginPath();c.ellipse(ground.x,ground.y,this.scale*.8,this.scale*.34,0,0,Math.PI*2);c.stroke();
 for(let i=0;i<6;i++){const a=i*Math.PI/3+(this.reduced?0:time/450),radius=this.scale*(.2+progress*.25),px=orb.x+Math.cos(a)*radius,py=orb.y+Math.sin(a)*radius*.7;c.beginPath();c.moveTo(px-3,py);c.lineTo(px+3,py);c.moveTo(px,py-3);c.lineTo(px,py+3);c.stroke();}
 c.shadowColor='#8fa3ff';c.shadowBlur=20;c.beginPath();c.arc(orb.x,orb.y,Math.max(2,this.scale*.1*Math.sin(progress*Math.PI)),0,Math.PI*2);c.fill();c.restore();
 }
 drawEffects(time){
 const c=this.paint;
 for(const e of this.effects){
  const target=this.positions.get(e.target),source=this.positions.get(e.source);if(!target)continue;
  const elapsed=time-e.at,progress=Math.max(0,Math.min(1,elapsed/580));
  const color=e.critical?'#ffe16b':e.status==='poison'?'#b5d979':e.style==='magic'?'#b6bfff':e.style==='arrow'?'#e2d2a2':e.style==='heal'?'#bfe9a1':e.style==='focus'?'#9dd6e3':'#ffe7c0';
  const tx=target.x,ty=target.y+this.scale*.65;if(e.critical&&elapsed>=0&&elapsed<350){c.save();c.strokeStyle='#ffe26b';c.lineWidth=3;for(let i=0;i<4;i++){const angle=Math.PI/4+i*Math.PI/2;c.beginPath();c.moveTo(tx+Math.cos(angle)*9,ty+Math.sin(angle)*9);c.lineTo(tx+Math.cos(angle)*18,ty+Math.sin(angle)*18);c.stroke();}c.restore();}
  c.save();c.lineCap='round';c.lineJoin='round';
  if(!this.reduced&&source&&['arrow','magic'].includes(e.style)&&elapsed<0){
   const flight=Math.max(0,Math.min(1,(time-e.start-100)/(e.at-e.start-100)));if(flight>0){
    const sx=source.x,sy=source.y+this.scale*.65,dx=tx-sx,dy=ty-sy,x=sx+dx*flight,y=sy+dy*flight-Math.sin(flight*Math.PI)*this.scale*.35;
    c.strokeStyle=color;c.lineWidth=e.style==='arrow'?2:4;c.shadowColor=color;c.shadowBlur=e.style==='magic'?15:0;c.beginPath();c.moveTo(x-dx*.055,y-dy*.055);c.lineTo(x,y);c.stroke();
    if(e.style==='arrow'){const angle=Math.atan2(dy,dx);c.beginPath();c.moveTo(x-Math.cos(angle-.55)*9,y-Math.sin(angle-.55)*9);c.lineTo(x,y);c.lineTo(x-Math.cos(angle+.55)*9,y-Math.sin(angle+.55)*9);c.stroke();}
    else {c.fillStyle='#fff2c9';c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fill();}
   }
  }
  if(elapsed>=0&&elapsed<580){
   c.globalAlpha=1-progress;c.strokeStyle=color;c.fillStyle=color;c.shadowColor=color;c.shadowBlur=this.reduced?0:12;
   if(e.type==='damage'){
    if(!this.reduced){for(let i=0;i<10;i++){const angle=i*Math.PI/5+seeded(i+e.amount)*.5,radius=(8+progress*35)*(.5+seeded(i+4)),x=tx+Math.cos(angle)*radius,y=ty+Math.sin(angle)*radius*.75;c.fillRect(x,y,3*(1-progress)+1,3*(1-progress)+1);}}
    c.lineWidth=e.style==='heavy'?5:3;c.beginPath();
    if(['magic','arrow'].includes(e.style)){c.arc(tx,ty,Math.max(1,8+progress*(e.style==='magic'?40:20)),0,Math.PI*2);}
    else {c.ellipse(tx,ty,Math.max(1,this.scale*.5),Math.max(1,this.scale*.2),-.55,-2.3+progress,1+progress);}
    c.stroke();
   }else{
    c.lineWidth=2;c.beginPath();c.ellipse(tx,target.groundY-4,Math.max(1,this.scale*(.3+progress*.6)),Math.max(1,this.scale*(.13+progress*.22)),0,0,Math.PI*2);c.stroke();
    if(e.style==='focus'){c.beginPath();c.moveTo(tx,ty-23);c.lineTo(tx+15,ty-16);c.lineTo(tx+12,ty+3);c.lineTo(tx,ty+14);c.lineTo(tx-12,ty+3);c.lineTo(tx-15,ty-16);c.closePath();c.stroke();}
    else for(let i=0;i<5;i++){const x=tx+(seeded(i+9)-.5)*this.scale*.9,y=ty+20-progress*45-seeded(i+20)*25;c.fillRect(x-4,y-1,8,2);c.fillRect(x-1,y-4,2,8);}
   }
  }
  c.restore();
 }
 }

 point(id){return this.positions.get(id);}
 frame(time){if(this.title&&this.canvas.id==='world')window.MenuTrailer?.update(this,time);const c=this.ctx;this.paint=c;if(this.dirty)this.background();c.clearRect(0,0,this.width,this.height);c.save();const cinematic=this.animations.find(a=>(a.ultimate||a.critical)&&a.style!=='cosmic'&&time>=a.at&&time-a.at<a.duration);if(cinematic&&!this.reduced){const p=(time-cinematic.at)/cinematic.duration,subject=this.point(p<.4?cinematic.actor:cinematic.target)||{x:this.width/2,y:this.height/2},zoom=1+Math.sin(p*Math.PI)*(cinematic.critical?.18:.1);c.translate(this.width/2,this.height*.45);c.scale(zoom,zoom);c.translate(-this.width/2-(subject.x-this.width/2)*Math.sin(p*Math.PI)*.1,-this.height*.45);}c.drawImage(this.cache,0,0,this.width,this.height);
 window.RaidFX?.domainBackground(this,time);
 let units=this.state?(this.camp?[...this.state.party,...(this.state.summons||[])]:[...this.state.party,...(this.state.summons||[]),...this.state.enemies]):[];
 if(this.title&&!this.menuTrailerActive){units=[{id:'hero',name:'',hp:88,maxHp:88,side:'party',job:'warrior',color:'#baa47a',kind:'humanoid'},{id:'rowan',name:'',hp:70,maxHp:70,side:'party',job:'ranger',color:'#879b73',kind:'humanoid'},{id:'mira',name:'',hp:65,maxHp:65,side:'party',job:'mage',color:'#9a91b1',kind:'humanoid'}];}
 const entries=units.map(u=>{const list=u.side==='party'?(this.state?.party||units):this.state.enemies;const index=list.findIndex(p=>p.id===u.id);const p=this.positionFor(u,index);return {u,index,depth:this.poseFor(u,index,time).x*.27+this.poseFor(u,index,time).z*.47};}).sort((a,b)=>a.depth-b.depth);
 entries.forEach(({u,index})=>this.actor(u,index,time));
 if(this.camp)this.drawCampfire(time);
 const impactFrame=this.animations.find(a=>a.critical&&a.style!=='cosmic'&&time-a.at-a.impactAt>=0&&time-a.at-a.impactAt<65);if(impactFrame&&!this.reduced){c.save();c.globalCompositeOperation='difference';c.fillStyle='#fff7df';c.fillRect(0,0,this.width,this.height);c.restore();}
 window.RaidFX?.arena(this,time);this.drawEffects(time);this.drawDefeats(time);CombatVFX.draw(this,time);window.RaidFX?.attacks(this,time);window.OceanVisuals?.attacks(this,time);window.OceanVisuals?.atmosphere(this,time);c.restore();
 this.effects=this.effects.filter(e=>time-e.at<1200);this.animations=this.animations.filter(a=>time-a.at<a.duration);
 if(!this.reduced){c.fillStyle=this.biome==='forest'?'#d3e2a333':this.biome==='throne'?'#f78c6944':'#ead69e33';for(let i=0;i<18;i++){const x=(seeded(i+10)*this.width+Math.sin(time/5000+i)*18),y=(seeded(i+20)*this.height-time/110*(.2+seeded(i+30)))%this.height;c.fillRect(x,y<0?y+this.height:y,i%3===0?2:1,i%3===0?2:1);}}
 if(this.menuTrailerActive)window.MenuTrailer?.overlay(this,time);
 requestAnimationFrame(this.frame);
 }
}
window.CampaignScene=CampaignScene;
})();
