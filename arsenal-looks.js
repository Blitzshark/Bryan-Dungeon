(function(){
'use strict';
function weapon(s,key,x,Y,z,b,lift){const A=window.ArsenalContent;if(!A.WEAPONS[key])return false;const X=x+.6*b,Z=z+.04*b,H=h=>Y(h+lift),box=(dx,h,dz,w,t,d,color)=>s.box(X+dx*b,H(h),Z+dz*b,w*b,t*b,d*b,color);const element=CombatElements.TYPES[A.WEAPONS[key].element].color;
if(key==='blackglass'){const old=s.bodyTransform;if(old)s.bodyTransform={...old,angle:old.angle+Math.PI};window.SniperArts?.firearmModel(s,x-.1,Y(1.45),z-.45,{firearm:'sniper',raise:.25});s.bodyTransform=old;return true;}
if(key==='sunpike'){box(0,.05,0,.06,1.7,.06,'#856f50');box(0,1.67,0,.18,.48,.09,'#ead59b');box(0,1.55,0,.45,.07,.1,'#bda05e');return true;}
if(key==='clockrifle'||key==='tiderepeater'){box(0,.9,.1,.17,.18,.85,'#6e6658');box(0,.94,.68,.075,.075,.6,'#b0b8b0');box(0,.7,-.15,.12,.3,.17,'#655344');for(let i=0;i<4;i++)box(.09,1,.02+i*.12,.04,.07,.055,element);if(key==='clockrifle'){box(0,1.15,.16,.13,.12,.36,'#4e696a');box(.12,.98,.07,.13,.035,.06,'#ccb77a');}else{box(-.12,.87,.3,.1,.19,.5,'#5a8e94');box(.12,.87,.3,.1,.19,.5,'#5a8e94');}return true;}
if(key==='chainwhip'||key==='meteorflail'){box(0,.45,0,.1,.65,.1,'#7b604b');for(let i=0;i<8;i++)box(Math.sin(i*.3)*.3,.9-i*.06,.09+i*.1,.065,.065,.065,'#b8b8ad');if(key==='meteorflail'){box(.25,.35,.85,.37,.35,.37,'#6c5a51');for(let i=0;i<4;i++)box(.12+i*.08,.5,.87,.045,.2,.045,element);}return true;}
if(key==='thornbook'){box(0,.6,0,.55,.68,.18,'#3f6650');box(0,.65,.11,.47,.55,.04,'#e0d7b3');for(let i=0;i<4;i++)box(-.14+i*.09,.8+i%2*.15,.14,.05,.04,.025,element);box(-.26,.61,0,.06,.64,.23,'#9d8660');return true;}
if(key==='moonchakrams'){for(const hand of [0,-1])for(let i=0;i<12;i++){const a=i*Math.PI/6;box(hand*.95+Math.cos(a)*.25,.9+Math.sin(a)*.25,0,.1,.1,.07,i%3?'#c8c9c1':element);}return true;}
if(key==='deepanchor'){box(0,.2,0,.12,1.25,.13,'#667d81');box(0,.9,0,.72,.12,.13,'#9bb0ad');for(const side of [-1,1]){box(side*.3,.18,0,.14,.5,.18,'#70898b');box(side*.2,.2,0,.35,.12,.18,'#9badac');}return true;}
if(key==='glassrapier'){box(0,.45,0,.055,1.3,.055,'#c5d9d6');for(let i=0;i<10;i++){const a=i*Math.PI/5;box(Math.cos(a)*.18,.48+Math.sin(a)*.14,0,.045,.045,.1,'#a39bba');}return true;}
if(key==='bellscepter'){box(0,.05,0,.075,1.25,.075,'#958268');box(0,1.25,0,.25,.35,.25,'#c7ad72');box(0,1.2,0,.4,.09,.38,'#dfc58b');box(0,1.15,0,.08,.12,.08,element);return true;}
if(key==='prismcrossbow'){box(0,.55,0,.13,.75,.16,'#6d5968');box(0,1.05,0,.95,.1,.13,'#c3c2b1');for(const side of [-1,1])box(side*.4,.93,0,.1,.22,.12,element);box(0,.75,.12,.1,.5,.08,element);return true;}
box(0,.08,0,.075,1.5,.075,'#7b6851');
if(key==='coraltrident'){box(0,1.23,0,.7,.09,.1,'#d6bb9a');for(const dx of [-.28,0,.28])box(dx,1.28,0,.09,dx===0?.55:.4,.1,element);}
if(key==='thunderlance'){for(let i=0;i<4;i++)box((i%2?1:-1)*.055,1.2+i*.14,0,.14,.18,.08,element);box(0,1.05,0,.42,.09,.12,'#9c96aa');}
if(key==='gravitonhammer'){box(0,1.15,0,.85,.43,.4,'#756780');box(0,1.2,.22,.28,.3,.04,element);for(const side of [-1,1])box(side*.43,1.1,0,.09,.54,.48,'#c2b991');}
if(key==='venomsickle'){box(.2,1.27,0,.55,.12,.12,element);box(.45,1.02,0,.1,.3,.12,element);box(.12,.98,0,.26,.08,.1,'#ccd5a1');}
if(key==='lanternwand'){box(0,1.24,0,.42,.44,.32,'#b59659');box(0,1.31,.18,.24,.28,.04,element);box(0,1.68,0,.56,.08,.4,'#7a6954');}
if(key==='voidscythe'){for(let i=0;i<4;i++)box(.13+i*.16,1.45-i*i*.045,0,.2,.14,.1,element);box(.65,.98,0,.1,.22,.1,'#aa95c6');}
if(key==='glacierstaff'){for(const dx of [-.17,0,.17])box(dx,1.35,0,.15,dx===0?.5:.3,.15,dx===0?element:'#8db4d2');box(0,1.26,0,.5,.08,.3,'#c1d9d4');}return true;}
function race(s,u,x,Y,z,b,time){const box=(dx,h,dz,w,t,d,c)=>s.box(x+dx*b,Y(h),z+dz*b,w*b,t*b,d*b,c);
if(u.race==='tideborn')for(const side of [-1,1]){box(side*.32,1.36,0,.13,.32,.11,'#73aeb3');for(let i=0;i<3;i++)box(side*.23,1.2+i*.07,.25,.11,.025,.03,'#7cb9b5');}
if(u.race==='gargoyle')for(const side of [-1,1]){box(side*.22,1.7,0,.12,.25,.12,'#7a818a');box(side*.52,.8,-.25,.38,.6,.12,'#737e87');box(side*.7,.7,-.25,.17,.3,.12,'#8d969b');}
if(u.race==='foxkin'){for(const side of [-1,1]){box(side*.23,1.68,0,.2,.3,.2,'#c08b58');box(side*.23,1.73,.11,.11,.16,.03,'#e4c2ab');}box(.2,.42,-.4,.28,.6,.25,'#c08b58');box(.2,.94,-.4,.3,.17,.28,'#eee1c3');}
if(u.race==='clockborn'){box(0,.86,.29,.25,.25,.07,'#c6ae6d');box(0,.91,.34,.1,.14,.03,'#80d5d0');for(const side of [-1,1])box(side*.1,1.39,.245,.07,.04,.03,'#83d3cf');}
if(u.race==='sylph')for(const side of [-1,1])for(let i=0;i<3;i++)box(side*(.4+i*.14),.76+i*.12,-.25,.14,.5-i*.1,.08,i%2?'#9cc9c0':'#ceddcb');
if(u.race==='ashen'){for(const dx of [-.2,0,.2])box(dx,1.66,0,.07,.16+(dx===0?.1:0),.07,'#e5a676');box(.1,1.3,.245,.035,.2,.025,'#edac76');}
}
window.ArsenalLooks={weapon,race};
})();
