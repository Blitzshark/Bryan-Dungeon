(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./boss-sculptures'):root.BossSculptures,typeof module==='object'&&module.exports?require('./campaign-sculptures'):root.CampaignSculptures,typeof module==='object'&&module.exports?require('./creature-polish'):root.CreaturePolish);if(typeof module==='object'&&module.exports)module.exports=api;else root.BossDesigns=api;})(typeof globalThis!=='undefined'?globalThis:this,function(S,C,P){
'use strict';
const heights={jadefang:4.1,raid_tree:6.4,raid_frostwyrm:5.8},shadows={jadefang:1.6,raid_tree:3.2,raid_frostwyrm:3.5},bounds={jadefang:{width:6.6,height:4.4},raid_tree:{width:9,height:7},raid_frostwyrm:{width:11,height:6.2}};
Object.assign(heights,S.heights,C.heights,P.heights);Object.assign(shadows,S.shadows,C.shadows,P.shadows);Object.assign(bounds,S.bounds,C.bounds,P.bounds);
function creature(s,u,x,y,z,time,pose={},color){if(P.creature(s,u,x,y,z,time,pose,color)||C.creature(s,u,x,y,z,time,pose,color)||S.creature(s,u,x,y,z,time,pose,color))return true;const id=u.enemyType||(u.kind==='jadeEmpress'?'jadefang':u.kind==='raidTree'?'raid_tree':u.kind==='raidFrostwyrm'?'raid_frostwyrm':null);if(!heights[id])return false;const originalTransform=s.bodyTransform;if(originalTransform)s.bodyTransform={...originalTransform,angle:originalTransform.angle+(originalTransform.aimed?0:id==='jadefang'?.5:.95)};const size=id==='jadefang'?.9:id==='raid_tree'?.82:.72;const t=s.reduced?0:time,breath=Math.sin(t/900)*.035,g=pose.gesture||0,flash=['#ff3d48','#ff5960','#c078ff'].includes(color),b=(dx,dy,dz,w,h,d,c)=>s.box(x+dx*size,y+(dy+breath)*size,z+(dz+(id==='raid_frostwyrm'?.5:0))*size,w*size,h*size,d*size,flash?color:c),line=(a,d,w,c)=>{const n=Math.max(2,Math.ceil(Math.hypot(...a.map((v,i)=>d[i]-v))*5));for(let i=0;i<=n;i++){const q=i/n;b(a[0]+(d[0]-a[0])*q,a[1]+(d[1]-a[1])*q,a[2]+(d[2]-a[2])*q,w,w,w,c);}},spike=(xx,yy,zz,w,h,c)=>{for(let i=0;i<4;i++)b(xx,yy+i*h/4,zz,w*(1-i*.21),h/4,w*(1-i*.21),c);};
 if(id==='jadefang'){
  // A low, six-legged saber cat, plated in old temple jade: no canine body parts.
  b(0,.85,-.2,1.5,.85,2.7,'#254c40');b(0,1.65,-.1,1.25,.3,2.4,'#39745b');
  for(const side of [-1,1])for(let i=0;i<3;i++){const zz=-1.05+i*.96,step=(pose.stride||0)*(i%2?side:-side);b(side*.7,.5,zz+step,.48,.72,.55,'#34684f');b(side*.78,.12,zz+.15+step,.36,.48,.45,'#183a34');b(side*.8,.06,zz+.36+step,.55,.19,.7,'#77b890');for(let j=0;j<3;j++)b(side*.8+(j-1)*.13,.08,zz+.76+step,.08,.13,.28,'#eadbb0');b(side*.78,1.22,zz,.5,.42,.65,'#83c29a');b(side*.93,1.28,zz+.2,.12,.1,.28,'#d7bd77');}
  b(0,1.18,1.35,1.45,.8,1,'#56936e');b(0,1.2,1.92,1.15,.35,.45,'#1d4438');b(0,1.13-g*.2,2.08,.85,.2,.42,'#20392f');b(0,1.37,2.14,.95,.16,.08,'#071e1b');b(0,1.5,2.23,.28,.16,.1,'#17362d');
  for(const side of [-1,1]){b(side*.38,1.75,1.88,.35,.13,.12,'#ebd47e');b(side*.37,1.78,1.96,.045,.14,.04,'#172c29');b(side*.5,.73-g*.12,2.23,.17,.73,.18,'#eee1b2');b(side*.56,1.75,1.21,.4,.65,.5,'#88b88a');b(side*.6,2.3,1.2,.3,.3,.35,'#224e40');for(let i=0;i<5;i++){b(side*(.78+i*.07),1.5+i*.14,.8-i*.23,.18,.42,.4,i%2?'#a1cc9d':'#d8c180');}}
  for(let i=-2;i<=2;i++){b(i*.24,2.04,1.38,.23,.12,.3,'#dfc57f');spike(i*.24,2.16,1.38,.23,.48+(2-Math.abs(i))*.15,'#96d2ae');}
  for(let i=0;i<7;i++){spike(0,1.82,-1.25+i*.34,.28,.34+(i%3)*.12,'#97cba0');for(const side of [-1,1])b(side*.76,1.31,-1.2+i*.33,.04,.13,.2,i%2?'#d5bc7c':'#102f29');}
  for(let i=0;i<13;i++){const q=i/12,xx=Math.sin(q*3+t/1100)*q*.55,yy=1.1+q*.7,zz=-1.55-q*2;b(xx,yy,zz,.27-q*.12,.24-q*.1,.3,'#3d785b');if(i>9)for(const side of [-1,1])b(xx+side*(i-9)*.12,yy+.05,zz,.16,.14,.28,'#a6d6a6');}
  // Drooping vines and a gold throat gorget make the crown readable in silhouette.
  for(const side of [-1,1]){line([side*.75,1.9,.7],[side*1.1,.8,1.1],.07,'#b6c58b');b(side*.6,1.08,1.8,.28,.32,.12,'#d0b579');}s.bodyTransform=originalTransform;return true;
 }
 if(id==='raid_tree'){
  // The monster is an empty cathedral of bark. The cavity stays physically hollow.
  for(let i=0;i<12;i++){const a=i*Math.PI*2/12,front=Math.cos(a)>.25;if(front&&Math.abs(Math.sin(a))<.8)continue;const xx=Math.sin(a)*1.65,zz=Math.cos(a)*1.1;for(let j=0;j<7;j++)b(xx*(1-j*.035),.25+j*.7,zz,.52,.8,.5,['#494332','#63523b','#7e6746'][i%3]);}
  for(const side of [-1,1]){b(side*1.25,.7,1.05,.45,3.8,.6,'#65503a');line([side*1.25,4.2,1.05],[side*.55,5.3,.8],.4,'#7f6947');line([side*.55,5.3,.8],[0,5.6,.6],.32,'#9d855a');}
  // A second open maw on the camera-facing flank exposes the hollow at battle angle.
  b(-1.73,1.35,.05,.12,2.8,1.6,'#101b17');for(const zz of [-.8,.9])b(-1.75,1.1,zz,.25,3.5,.22,'#94764a');for(let i=0;i<7;i++){const zz=-.68+i*.23;b(-1.9,1.15,zz,.2,.52+(i%2)*.23,.12,'#d9cf9c');b(-1.9,3.7-(i%2)*.13,zz,.2,.45,.13,'#cdc28e');}b(-1.91,4.22,-.38,.08,.18,.42,'#f1d58a');b(-1.91,4.22,.45,.08,.18,.42,'#f1d58a');b(-1.86,2.45,.05,.09,.58,.34,'#bf8c52');
  b(0,.4,-.2,2.4,.35,1.5,'#252f25');b(0,2.1,-.72,1.4,2.2,.16,'#111d19');b(0,2.55,-.6,.42,.6,.1,'#d5b66f');b(0,2.65,-.5,.18,.33,.08,'#f4d69a');
  for(let i=0;i<9;i++){const xx=-1.02+i*.255,curve=Math.sqrt(Math.max(0,1-(xx/1.2)**2));spike(xx,.5,1.36,.16,.35+curve*.65,'#c7bd8d');b(xx,4.3+curve*.4-g*.2,1.36,.17,.55+(i%3)*.1,.18,'#c8bc88');}
  for(const side of [-1,1]){b(side*.82,4.48,1.18,.5,.16,.12,'#dfc981');b(side*.83,4.51,1.28,.2,.1,.05,'#fff0b8');}
  // Crawling root legs, hooked tips and hanging seed coffins replace a humanoid trunk.
  for(let i=0;i<8;i++){const a=i*Math.PI/4,xx=Math.cos(a),zz=Math.sin(a),reach=3.1+Math.sin(t/1000+i)*.12;line([xx,.75,zz*.65],[xx*2.1,.35,zz*1.75],.34,'#64533a');line([xx*2.1,.35,zz*1.75],[xx*reach,.06,zz*2.7],.22,'#82704a');line([xx*reach,.06,zz*2.7],[xx*(reach+.3),.5,zz*2.8],.12,'#b1ae70');}
  for(const side of [-1,1])for(let i=0;i<3;i++){const yy=4.2+i*.65,reach=1.8+i*.35;line([side*.8,yy-.5,-.5],[side*reach,yy,-.6-i*.25],.25,'#776347');line([side*reach,yy,-.6-i*.25],[side*(reach+.65),yy+.65,-.5-i*.3],.15,'#a49c69');if(i%2===0){line([side*reach,yy,-.6],[side*reach,yy-.65,-.6],.045,'#a4a477');b(side*reach,yy-1,-.6,.3,.48,.3,'#89986a');b(side*reach,yy-.87,-.42,.12,.1,.04,'#ded69b');}}
  for(let i=0;i<7;i++){const a=i*2.4;spike(Math.sin(a)*.9,5.1+Math.cos(a)*.3,Math.cos(a)*.6,.27,1.1+i%3*.2,'#78704b');b(Math.sin(a)*1.5,3.8+i%3*.4,Math.cos(a),.7,.12,.5,'#99a574');}s.bodyTransform=originalTransform;return true;
 }
 if(id==='raid_frostwyrm'){
  // A suspended skeletal wyrm: exposed ribs, void skull and crescent comet wings.
  const drift=s.reduced?0:Math.sin(t/1200)*.12;
  for(let i=0;i<13;i++){const q=i/12,zz=-3.4+q*4.4,yy=1.2+Math.sin(q*Math.PI)*1.3+drift,xx=Math.sin(q*4+t/1800)*.28;b(xx,yy,zz,.65,.35,.45,'#c6dce0');b(xx,yy+.3,zz,.17,.4,.2,'#edf0d9');if(i>2&&i<11)for(const side of [-1,1]){line([xx,yy,zz],[side*(.75+Math.sin(q*Math.PI)*.35),yy-.4,zz+.06],.15,'#dce6d9');line([side*(.75+Math.sin(q*Math.PI)*.35),yy-.4,zz+.06],[side*.6,yy-.85,zz+.15],.12,'#a8cbd4');}if(i<5)spike(xx,yy+.45,zz,.2,.45,'#9bcad9');}
  b(0,2.35+drift,1.15,.5,1,.6,'#c3d9dc');b(0,3.1+drift,1.5,1.3,.65,1.35,'#dbe5dc');b(0,3.3+drift,2.2,.88,.35,.7,'#8eacbc');b(0,2.93+drift-g*.18,2.05,1.05,.18,1,'#c6d7d9');b(0,3.11+drift,2.39,.65,.22,.07,'#101f33');b(-.67,3.32+drift,1.56,.08,.32,.68,'#172f44');b(-.73,3.47+drift,1.72,.04,.1,.3,'#b9f4ef');b(-.55,3.2+drift,2.3,.08,.17,.25,'#233c50');
  for(const side of [-1,1]){b(side*.4,3.52+drift,2.04,.36,.16,.12,'#a4e8ee');b(side*.42,3.55+drift,2.12,.16,.08,.05,'#effbdf');for(let i=0;i<4;i++)b(side*.36,2.84+drift-g*.12,1.85+i*.18,.1,.35,.1,'#e8ebd4');line([side*.45,3.7+drift,1.4],[side*.9,4.4+drift,.7],.22,'#bfd6da');line([side*.9,4.4+drift,.7],[side*1.4,4.65+drift,.35],.13,'#e5eddd');}
  b(0,3.8+drift,1.75,.13,.4,.15,'#c6f0ef');
  for(const side of [-1,1])for(let i=0;i<9;i++){const q=i/8,xx=side*(.65+q*3.2),yy=2.6+Math.sin(q*Math.PI*.9)*1.8+drift,zz=-.55-q*.8;line([side*.65,2.6+drift,-.55],[xx,yy,zz],.14,'#d3e3dd');b(xx,yy,zz,.35,.2,.6,'#a3d4df');for(let j=0;j<3;j++)b(xx,yy-.2-j*.3,zz+j*.16,.13,.25,.35,j%2?'#8abacb':'#c2e4e6');if(i>4)spike(xx,yy+.16,zz,.16,.3+q*.3,'#ecf0dc');}
  for(let i=0;i<11;i++){const q=i/10,zz=-3.5-q*1.5,xx=Math.sin(q*4+t/1400)*(.2+q*.4),yy=1.2-q*.8+drift;b(xx,yy,zz,.34-q*.23,.22-q*.12,.35,'#b5d7e0');if(i%2===0)b(xx,yy+.2,zz,.08,.32,.12,'#e7f0df');}
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5+(s.reduced?0:t/5000);b(Math.cos(a)*1.7,4.25+Math.sin(a)*.75, .1,.2,.45,.18,'#a5dde7');b(Math.cos(a)*1.7,4.7+Math.sin(a)*.75,.1,.08,.16,.09,'#ebf3de');}s.bodyTransform=originalTransform;return true;
 }
 return false;
}
function atmosphere(s,time){if(s.title||s.camp)return;S.atmosphere(s,time);for(const u of s.state?.enemies||[]){if(u.hp<=0||!heights[u.enemyType])continue;const p=s.positions.get(u.id);if(!p)continue;const c=s.paint,t=s.reduced?0:time;c.save();for(let i=0;i<16;i++){const q=(t/2400+i/16)%1,a=i*2.399,xx=p.x+Math.cos(a)*s.scale*(u.enemyType==='jadefang'?1.1:2.7),yy=p.groundY-s.scale*(.3+q*(u.enemyType==='raid_tree'?5:4));c.globalAlpha=Math.sin(q*Math.PI)*.55;c.fillStyle=u.enemyType==='raid_frostwyrm'?'#ceeff2':u.enemyType==='raid_tree'?'#c3cd87':u.color||'#b7dc9c';c.fillRect(xx,yy,u.enemyType==='raid_frostwyrm'?2:3,u.enemyType==='raid_frostwyrm'?5:3);}c.restore();}}
return {creature,atmosphere,heights,shadows,bounds};
});
