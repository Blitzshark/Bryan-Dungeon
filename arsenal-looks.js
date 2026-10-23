(function(){
'use strict';
function weapon(s,key,x,Y,z,b,lift){const A=window.ArsenalContent;if(!A.WEAPONS[key])return false;const X=x+.6*b,Z=z+.04*b,H=h=>Y(h+lift),box=(dx,h,dz,w,t,d,color)=>s.box(X+dx*b,H(h),Z+dz*b,w*b,t*b,d*b,color);const element=CombatElements.TYPES[A.WEAPONS[key].element].color;
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
