(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BossEntrances=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
function pose(type,time,reduced=false){const t=clamp(time),q=ease(t/.78),p={x:0,z:0,y:0,facing:-Math.PI/2,gesture:0,stride:0,swing:0};
 switch(type){
 case 'frostmammoth':p.x=(1-q)*4;p.stride=reduced?0:Math.sin(t*30)*.15;break;
 case 'rimeelk':p.x=(1-q)*3;p.y=Math.sin(q*Math.PI)*1.4;break;
 case 'whiteworm':p.y=-4*(1-q);break;
 case 'geodeheart':p.y=.5+Math.sin(t*Math.PI)*.7;break;
 case 'prismqueen':p.y=4*(1-q);break;
 case 'crystalhermit':p.y=-2*(1-q);break;
 case 'auroracrown':p.y=4*(1-q);p.gesture=q;break;
 case 'moonjudge':p.y=1.5*(1-q);p.gesture=q*.5;break;
 case 'dawnengine':p.y=-2*(1-q);break;
 case 'briar':p.x=(1-q)*7;p.stride=reduced?0:Math.sin(t*50)*.23;p.y=Math.sin(q*Math.PI)*.15;break;
 case 'alpha':p.x=(1-q)*5;p.z=Math.sin(q*Math.PI)*1.7;p.facing=-Math.PI/2+Math.atan2(-Math.cos(q*Math.PI)*1.7,5)*(1-q);p.stride=reduced?0:Math.sin(t*32)*.16;break;
 case 'jadefang':{const leap=ease((t-.18)/.55);p.x=(1-leap)*4;p.z=-(1-leap)*2;p.y=Math.sin(leap*Math.PI)*2;p.gesture=Math.sin(leap*Math.PI)*.7;break;}
 case 'broodmother':p.y=-2.6*(1-q);break;
 case 'warden':{const drop=ease((t-.1)/.45);p.y=6*(1-drop);p.gesture=Math.sin(drop*Math.PI);break;}
 case 'ossuary':p.y=-2*(1-q);p.gesture=q*.5;break;
 case 'oregolem':p.y=-1.7*(1-q);p.gesture=Math.sin(q*Math.PI)*.5;break;
 case 'mimiclord':p.gesture=t>.4?Math.sin((t-.4)*8)*.8:0;p.y=t>.4?Math.sin((t-.4)*5)*.15:0;break;
 case 'king':p.y=Math.sin(t*Math.PI)*.8;p.gesture=q*.6;break;
 case 'orrery':p.y=.3+Math.sin(t*Math.PI)*1.1;p.facing=-Math.PI/2+(reduced?0:(1-q)*Math.PI);break;
 case 'hellmaw':p.y=-3*(1-q);p.gesture=q*.8;break;
 case 'coralback':p.y=-1.8*(1-q);p.z=(1-q)*2;break;
 case 'devourer':p.y=Math.sin(q*Math.PI)*2.5-(1-q);break;
 case 'leviathan':p.y=.25+Math.sin(t*Math.PI)*.7;p.z=Math.sin(t*7)*(1-q);break;
 case 'keelbreaker':p.y=-3*(1-q);p.gesture=q;break;
 case 'captain':p.y=-4*(1-ease((t-.22)/.46));p.gesture=t>.7?.8:0;break;
 case 'ballast':p.y=7*(1-ease(t/.55));p.gesture=t>.55?Math.sin((t-.55)*7)*.4:0;break;
 case 'orchid':p.y=-1.7*(1-q);p.gesture=q;break;
 case 'sunape':p.gesture=t>.7?Math.sin((t-.7)*Math.PI/.3)*.55:0;break;
 case 'roc':p.x=(1-q)*3;p.y=(1-q)*6;p.gesture=Math.sin(t*20)*(1-q);break;
 case 'cloudtitan':p.y=.4*(1-q);p.gesture=q*.6;break;
 case 'windmother':p.y=.5+Math.sin(t*Math.PI)*.8;p.gesture=Math.sin(t*9)*.4;break;
 case 'thunderhead':p.y=.6+Math.sin(t*Math.PI)*.5;break;
 case 'stormheart':p.y=.3+Math.sin(t*Math.PI)*1.3;break;
 case 'stormphoenix':p.y=4*(1-q);p.gesture=Math.sin(t*15)*(1-q);break;
 case 'seraph':p.y=3*(1-q);p.gesture=q;break;
 case 'sunclock':p.y=.4+Math.sin(t*Math.PI)*.4;break;
 case 'prismlion':p.x=(1-q)*2;p.y=Math.sin(q*Math.PI)*.5;break;
 }return p;
}
function assembly(t){return ease((clamp(t)-.15)/.5);}
function draw(scene,time){const t=clamp(time),b=scene.state.enemies[0],type=b.enemyType;if(type==='captain')return false;const c=scene.paint,s=scene.scale,q=ease(t/.78),fade=Math.sin(t*Math.PI),x=3.3,z=0;
 const box=(dx,y,dz,w,h,d,color=b.color)=>scene.box(x+dx,y,z+dz,w,h,d,color),point=(dx,y,dz)=>scene.project(x+dx,y,z+dz),line=(a,b,color,width=2)=>{const p=point(...a),r=point(...b);c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(r.x,r.y);c.stroke();},ring=(dx,y,dz,r,color,tilt=0)=>{const p=point(dx,y,dz);c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.ellipse(p.x,p.y,Math.max(0,r*s),Math.max(0,r*s*.35),tilt,0,Math.PI*2);c.stroke();},spark=(dx,y,dz,r,color)=>{const p=point(dx,y,dz);c.fillStyle=color;c.shadowColor=color;c.shadowBlur=12;c.beginPath();c.arc(p.x,p.y,Math.max(0,r*s),0,Math.PI*2);c.fill();c.shadowBlur=0;};
 c.save();
 switch(type){
 case 'frostmammoth':for(let i=0;i<7;i++){const a=i*2.399;box(Math.cos(a)*2*(1+q),.05,Math.sin(a)*1.8,.5,.5+fade,.5,'#d9e9e4');}break;
 case 'rimeelk':for(let i=0;i<8;i++){const a=i*Math.PI/4;spark(Math.cos(a)*2,.5+q,Math.sin(a)*2,.06,'#d4f3df');}ring(0,.05,0,q*3,'#b6dbd8');break;
 case 'whiteworm':for(let i=0;i<9;i++){const a=i*2.399;box(Math.cos(a)*(1+q),.05+fade*.4,Math.sin(a)*(1+q),.5,.25,.7,'#d6e4e1');}break;
 case 'geodeheart':for(let i=0;i<12;i++){const a=i*2.399;box(Math.cos(a)*3*(1-q),.2+(i%4)*.4,Math.sin(a)*2*(1-q),.2,.7,.2,i%2?'#b3d7d0':'#c9b1dd');}break;
 case 'prismqueen':for(let i=0;i<8;i++){const a=i*Math.PI/4;line([Math.cos(a)*3,5,Math.sin(a)*2],[0,3*(1-q),0],'#d8c9e6',1);}break;
 case 'crystalhermit':for(let i=0;i<8;i++){const a=i*Math.PI/4;box(Math.cos(a)*(1+q),.1+Math.sin(a)*fade*.3,Math.sin(a)*(1+q),.4,.9,.4,'#b7d2db');}break;
 case 'auroracrown':for(let i=0;i<7;i++){const a=i*Math.PI*2/7;line([Math.cos(a)*2,5,Math.sin(a)*2],[Math.cos(a),1+q,Math.sin(a)],i%2?'#b3ead4':'#c8afe8',4);}break;
 case 'moonjudge':ring(0,3,0,1.3,'#d3dcde');for(let i=0;i<5;i++)box((i-2)*.6,.05,1,.35,.15,.5,'#c0ced4');break;
 case 'dawnengine':for(let i=0;i<10;i++){const a=i*Math.PI/5+t*3;box(Math.cos(a)*(2-q),1+Math.sin(a),Math.sin(a)*(2-q),.3,.2,.3,'#ead7aa');}ring(0,1,0,1.5,'#eff1c6',t);break;
 case 'sunape':{
  // Light enters through the canopy only once the scattered stones have locked together.
  const light=ease((t-.52)/.3),p=point(0,2.2,0),floor=point(0,0,0);c.fillStyle='rgba(255,235,156,'+light*.34+')';c.beginPath();c.moveTo(p.x-s*.5,-s);c.lineTo(p.x+s*.7,-s);c.lineTo(floor.x+s*2.1,floor.y+s*.3);c.lineTo(floor.x-s*1.8,floor.y+s*.3);c.closePath();c.fill();
  const g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,s*3);g.addColorStop(0,'rgba(255,245,179,'+light*.4+')');g.addColorStop(1,'rgba(255,220,120,0)');c.fillStyle=g;c.fillRect(0,0,scene.width,scene.height);
  ring(0,.04,0,.6+light*1.4,'#f5d783');for(let i=0;i<22;i++){const a=i*2.399; spark(Math.cos(a)*(2-assembly(t)*1.5),.1+(i%5)*.3+light*.3,Math.sin(a)*(2-assembly(t)*1.5),.025,'#ffe9a1');}break;}
 case 'oregolem':for(let i=0;i<14;i++){const a=i*2.399,join=ease((t-i*.012)/.6);box(Math.cos(a)*3*(1-join),.1+join*(i%4)*.45,Math.sin(a)*2*(1-join),.3,.35,.3,i%2?'#a2c5cd':'#716d65');}ring(0,.05,0,2*(1-q),'#89dcd6');break;
 case 'ossuary':for(let i=0;i<18;i++){const a=i*2.399,join=ease((t-i*.009)/.65);box(Math.cos(a)*2.8*(1-join),.05+join*(i%6)*.32,Math.sin(a)*2*(1-join),.4,.1,.12,'#d3c8aa');}box(0,.01,0,2.6,.12,1.9,'#4e564b');break;
 case 'briar':for(let i=0;i<8;i++){const a=i*Math.PI/4;line([Math.cos(a)*2,.02,Math.sin(a)*2],[Math.cos(a)*3.6,.15+fade*.45,Math.sin(a)*3.6],'#79935b',4);}for(let i=0;i<10;i++)box(Math.sin(i*3)*2.5,.3+fade*(i%3)*.5,Math.cos(i*3)*2,.15,.08,.2,'#b3b96c');break;
 case 'alpha':for(let i=0;i<5;i++){const px=3-i*.7-(q*3);box(px,.03,1.7-i*.25,.15,.04,.18,'#394b3d');}ring(0,1.4,0,.4+fade*1.2,'#d4dfbf');break;
 case 'broodmother':for(let i=0;i<10;i++){const a=i*Math.PI/5;line([0,.02,0],[Math.cos(a)*3,.1,Math.sin(a)*2.2],'#a8b6a477');box(Math.cos(a)*1.6*(1+fade*.3),.02,Math.sin(a)*1.4,.35,.2,.3,'#5e6650');}break;
 case 'warden':for(const side of [-1,1]){line([side*.8,6,0],[side*.8,1.3+6*(1-ease((t-.1)/.45)),0],'#aaa18d',3);}if(t>.52)for(let i=0;i<7;i++){const a=i*6.28/7;line([0,0,0],[Math.cos(a)*2*ease((t-.52)/.3),.02,Math.sin(a)*2*ease((t-.52)/.3)],'#bdc6ac');}break;
 case 'mimiclord':for(let i=0;i<15;i++){const a=i*2.399,jump=t>.4?Math.sin(clamp((t-.4)/.6)*Math.PI):0;box(Math.cos(a)*(.8+jump*1.5),.05+jump*(i%3)*.45,Math.sin(a)*(.8+jump),.12,.06,.12,'#d7bd73');}break;
 case 'king':for(let i=0;i<3;i++){const a=t*3+i*Math.PI*2/3;ring(Math.cos(a)*1.5,1.3+Math.sin(a),Math.sin(a),.3+fade*.3,['#df8296','#88bff4','#c399ef'][i]);}ring(0,.04,0,2.2*fade,'#b28ae6');break;
 case 'orrery':for(let i=0;i<3;i++){ring(0,2,0,1.3+i*.4,'#d5b9ee',t*2+i);spark(Math.cos(t*8+i)*2,2+Math.sin(t*8+i),Math.sin(t*8+i),.1,'#f4d8ff');}break;
 case 'hellmaw':for(let i=0;i<12;i++){const a=i*2.399;box(Math.cos(a)*1.7,.02,Math.sin(a)*1.3,.5,.15+fade*.7,.3,'#62404d');spark(Math.cos(a)*2,.1+fade*(i%4)*.6,Math.sin(a)*1.5,.05,'#ff9662');}ring(0,.05,0,1.6,'#e8855e');break;
 case 'coralback':for(let i=0;i<8;i++){const a=i*Math.PI/4;box(Math.cos(a)*2,.02,Math.sin(a)*1.4,.15,.4+fade*.6,.15,i%2?'#c69aae':'#7bc1b6');}ring(0,.05,0,2.6*fade,'#9de4dc');break;
 case 'devourer':for(let i=0;i<10;i++){const a=i*6.28/10;line([Math.cos(a),.1,Math.sin(a)],[Math.cos(a)*(1+q*2),fade*1.4,Math.sin(a)*(1+q*2)],'#9edbd6',3);}ring(0,.03,0,3*q,'#72b2be');break;
 case 'leviathan':for(let i=0;i<5;i++)ring(Math.sin(t*5+i)*.3,.2+i*.35,0,1.8-i*.17,'#9edce3',i*.2+t);break;
 case 'keelbreaker':for(let i=0;i<6;i++){const a=i*Math.PI/3;line([Math.cos(a)*2,.03,Math.sin(a)*2],[Math.cos(a)*1.3,fade*2,Math.sin(a)*1.3],'#7aa79b',6);box(Math.cos(a)*2,.1+fade*.2,Math.sin(a)*2,.7,.12,.35,'#7d694e');}break;
 case 'ballast':for(let i=0;i<7;i++){const a=i*2.399;box(Math.cos(a)*(1+t),.03+Math.sin(clamp((t-.5)*2)*Math.PI)*.6,Math.sin(a)*(1+t),.5,.12,.45,'#7e745d');}if(t>.5)ring(0,.03,0,ease((t-.5)/.3)*3,'#c9c8a4');break;
 case 'jadefang':for(let i=0;i<12;i++){const a=i*2.399;box(1+Math.cos(a)*2,.3+fade*(i%4)*.25,-1+Math.sin(a),.3,.08,.15,i%2?'#80ac66':'#c2b874');}break;
 case 'orchid':for(let i=0;i<8;i++){const a=i*Math.PI/4;box(Math.cos(a)*(1+q),.2+Math.sin(q*Math.PI)*.5,Math.sin(a)*(1+q),.65,.1,.65,i%2?'#c394be':'#8c689c');spark(Math.cos(a)*2,.5+q,Math.sin(a)*1.5,.035,'#edd5a4');}break;
 case 'roc':for(let i=0;i<9;i++){const a=i*2.399;box(Math.cos(a)*2,.3+(1-t)*(i%4),Math.sin(a)*1.7,.12,.04,.45,'#b7cddd');}ring(0,.02,0,3*q,'#d0e7e7');break;
 case 'cloudtitan':for(let i=0;i<14;i++){const a=i*2.399;box(Math.cos(a)*3*(1-q),.5+(i%4)*.5,Math.sin(a)*2*(1-q),.8,.45,.7,'#c5dfe2');}break;
 case 'windmother':for(let i=0;i<6;i++)ring(Math.sin(i+t*4)*.5,.2+i*.45,0,2-i*.18,'#b2d9cf',Math.sin(t*5)*.15);break;
 case 'thunderhead':for(let i=0;i<7;i++){box(-2+i*.65,3.5+Math.sin(i)*.25,0,.9,.4,.9,'#586680');if(i%2===0){line([-2+i*.65,3.4,0],[-1.8+i*.65,1+fade,0],'#b9d9ff');}}break;
 case 'stormheart':for(let i=0;i<5;i++){const a=i*6.28/5;line([Math.cos(a)*2,.1,Math.sin(a)*2],[0,1.5+q,0],'#a9eff5',2);box(Math.cos(a)*2,0,Math.sin(a)*2,.2,.7,.2,'#8d9b96');}break;
 case 'stormphoenix':for(let i=0;i<16;i++){const a=i*2.399;spark(Math.cos(a)*2,.2+fade*(i%5)*.45,Math.sin(a)*1.5,.045,i%2?'#e7d9ff':'#a7d9f4');}ring(0,.1,0,2.1*fade,'#d6c4ed');break;
 case 'seraph':{const p=point(0,4,0);c.fillStyle='#1b213955';c.beginPath();c.arc(p.x,p.y,s*(1+q),0,Math.PI*2);c.fill();ring(0,4,0,1+q,'#eddda6');for(const side of [-1,1])for(let i=0;i<5;i++)box(side*(.8+i*.35),2+i*.18,0,.25,.08,.6,'#d9d3bd');break;}
 case 'sunclock':for(let i=0;i<12;i++){const a=i*Math.PI/6;box(Math.cos(a)*2,.05,Math.sin(a)*2,.2,.15,.25,gold());}line([0,.1,0],[Math.cos(t*12)*2,.1,Math.sin(t*12)*2],'#f8e2a7',4);break;
 case 'prismlion':for(let i=0;i<6;i++){const a=i*Math.PI/3;box(Math.cos(a)*2*(1-q),.1+q*(i%3)*.4,Math.sin(a)*1.5*(1-q),.3,.8,.3,['#dfb5e5','#a9e2e2','#efe2b4'][i%3]);}ring(0,.03,0,2*fade,'#f4d8ca');break;
 default:c.restore();return false;
 }c.restore();return true;
}
function gold(){return '#cbb77e';}
function after(scene,time){if(scene.state.enemies[0]?.enemyType!=='sunape')return;const t=clamp(time),light=ease((t-.55)/.25)*(1-ease((t-.88)/.12)),p=scene.project(3.3,1.3,0),c=scene.paint;c.save();const g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,scene.scale*1.6);g.addColorStop(0,'rgba(255,246,175,'+light*.7+')');g.addColorStop(.25,'rgba(255,222,111,'+light*.3+')');g.addColorStop(1,'rgba(255,225,130,0)');c.fillStyle=g;c.fillRect(0,0,scene.width,scene.height);c.restore();}
return {pose,assembly,draw,after};
});
