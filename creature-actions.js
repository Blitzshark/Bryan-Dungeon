(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CreatureActions=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);},mix=(a,b,t)=>a+(b-a)*t;
function recipe(unit,skill={}){if((unit?.side!=='enemy'&&!unit?.controlledMonster)||skill.cinematic||skill.guardian||skill.heal||skill.summon||skill.self)return null;const body=[unit.enemyType,unit.kind,unit.form].join(' ').toLowerCase(),name=(skill.name||'').toLowerCase();if(skill.shell)return {kind:'brace',family:'armored',height:.7};
 if(/toad|frog|bognewt/.test(body))return {family:'toad',kind:/tongue/.test(name)?'tongue':/hop|flop|quake|leap/.test(name)?'frog-hop':'croak',height:/crownedtoad|eldertoad/.test(body)?1.5:.8};
 if(/macaw|vulture|snowowl|bellcrane|skywing|skyphoenix|\broc\b|harrier|zephyr/.test(body))return {family:'bird',kind:/feather.*lance|quill|plume/.test(name)?'feather':/wing|draft|flash|gust/.test(name)?'wing-gust':'bird-dive',height:1.2};
 if(/bat|dreammoth|rootbat/.test(body))return {family:'bat',kind:'swoop',height:1.2};
 if(/serpent|viper|cobra|adder|lamprey|wyrm/.test(body))return {family:'serpent',kind:/breath|spit|venom|poison|rain/.test(name)?'spit':'serpent-lunge',height:.7};
 if(/spider|widow|mantis/.test(body))return {family:'hunter',kind:/web|snare|thread/.test(name)?'web-cast':'scuttle',height:.6};
 if(/jadefang|jadeempress|boar|bison|glacierox|wolf|hound|jackal|jaguar|hare|ram\b|siegegoat/.test(body))return {family:'beast',kind:/howl|roar|breath/.test(name)?'roar':'ram',height:.8};
 if(/snail|tortoise|armadillo/.test(body))return {family:'shell',kind:/roll|ram|crash|skid/.test(name)?'shell-roll':/slime|goop|spit/.test(name)?'spit':'shell-bash',height:.65};
 if(/slime|jelly|medusa/.test(body))return {family:'gel',kind:/spray|spit|goop|bolt/.test(name)?'spit':'splash-hop',height:.6};
 if(/crab|pincer|scorpion/.test(body))return {family:'claw',kind:/shot|shard|hail|venom/.test(name)?'spit':'pincer',height:.7};
 if(/raid_tree|raidtree|treant|root|lotus|mandrake|bromeliad|orchid|sporebasket/.test(body))return {family:'plant',kind:/cry|bloom|pollen|spore/.test(name)?'croak':'vine',height:1};
 if(/wasp|bee|skater|urchin/.test(body))return {family:'insect',kind:'sting',height:.9};
 if(/piston|press|automaton|railmaw|gear|boiler|windmill/.test(body))return {family:'machine',kind:'piston',height:1};return null;
}
function envelope(a,time){const hit=a.impactAt/a.duration,t=clamp((time-a.at)/a.duration),pre=clamp(t/Math.max(.01,hit)),post=clamp((t-hit)/Math.max(.01,1-hit));return {t,pre,post,hit,land:t>=hit};}
function pose(unit,base,target,a,time,reduced){const r=a.creatureMotion;if(!r||!target)return null;const e=envelope(a,time),dx=target.worldX-base.x,dz=target.worldZ-base.z,distance=Math.max(.01,Math.hypot(dx,dz)),facing=Math.atan2(dx,dz),p={x:base.x,z:base.z,y:0,gesture:0,stride:0,swing:0,facing,pitch:0,wingFold:0},contact=Math.max(0,1-.65/distance),attack=e.land?1-ease(e.post):ease(e.pre),pulse=Math.sin(e.t*Math.PI);if(reduced){p.gesture=pulse*.25;return p;}
 const move=q=>{p.x+=dx*q*contact;p.z+=dz*q*contact;};
 switch(r.kind){
 case 'bird-dive':{const charge=e.pre<.35?-.07*ease(e.pre/.35):ease((e.pre-.35)/.65);move(e.land?1-ease(e.post):charge);p.y=e.land?Math.sin(e.post*Math.PI)*1.5:e.pre<.35?ease(e.pre/.35)*2.5:2.5*(1-ease((e.pre-.35)/.65));p.pitch=e.land?1.05*(1-ease(e.post/.25))-.55*Math.sin(e.post*Math.PI):Math.sin(clamp((e.pre-.28)/.72)*Math.PI/2)*1.05;p.wingFold=e.land?1-ease(e.post):ease((e.pre-.35)/.65);p.gesture=Math.sin(e.t*30)*.25;break;}
 case 'swoop':move(attack);p.y=Math.sin(e.t*Math.PI)*1.4;p.x+=Math.sin(e.t*Math.PI*2)*.35;p.pitch=Math.sin(e.t*Math.PI*2)*.4;p.gesture=Math.sin(e.t*35)*.4;break;
 case 'tongue':p.x-=dx/distance*pulse*.16;p.z-=dz/distance*pulse*.16;p.gesture=e.land?(1-e.post)*.8:e.pre*.8;break;
 case 'croak':case 'roar':p.y=pulse*.09;p.gesture=pulse;p.pitch=-pulse*.17;break;
 case 'wing-gust':case 'feather':p.y=pulse*.5;p.gesture=Math.sin(e.t*32)*.65;p.pitch=-pulse*.16;break;
 case 'frog-hop':case 'splash-hop':move(attack);p.y=e.land?Math.sin(e.post*Math.PI)*.55:Math.sin(e.pre*Math.PI)*1.2;p.gesture=e.land?1-e.post:e.pre;break;
 case 'scuttle':move(attack);p.x+=Math.sin(e.t*30)*.12*pulse;p.stride=Math.sin(e.t*60)*.18;p.gesture=pulse;p.y=.04;break;
 case 'serpent-lunge':move(attack);p.x+=Math.sin(e.t*22)*.18*pulse;p.y=Math.sin(e.pre*Math.PI)*.25;p.pitch=pulse*.3;break;
 case 'ram':move(attack);p.stride=Math.sin(e.t*55)*.16;p.y=Math.abs(p.stride)*.2;p.pitch=pulse*.25;p.gesture=pulse;break;
 case 'shell-roll':move(attack);p.pitch=e.t*Math.PI*4;p.y=(.12+Math.abs(Math.sin(e.t*20))*.12)*pulse;break;
 case 'shell-bash':case 'pincer':case 'sting':move(attack*(r.kind==='sting'?1:.8));p.swing=Math.sin(e.t*12)*.6;p.y=r.kind==='sting'?pulse*.45:0;p.gesture=pulse;break;
 case 'piston':move(attack*.6);p.pitch=-pulse*.2;p.gesture=e.land?1-ease(e.post):ease(e.pre);break;
 case 'vine':case 'web-cast':case 'spit':p.gesture=pulse;p.pitch=-pulse*.22;p.x-=dx/distance*pulse*.12;p.z-=dz/distance*pulse*.12;break;
 case 'brace':p.y=-pulse*.12;p.pitch=pulse*.12;p.gesture=pulse;break;
 }
 if(e.t===1)Object.assign(p,{x:base.x,z:base.z,y:0,pitch:0,wingFold:0,stride:0,swing:0,gesture:0});return p;
}
function draw(scene,time){const c=scene.paint;for(const a of scene.animations){const r=a.creatureMotion;if(!r)continue;const actor=scene.state&&globalThis.DungeonCampaign?.unit(scene.state,a.actor);if(!actor)continue;const e=envelope(a,time);if(time<a.at||time>a.at+a.duration)continue;const origin=scene.point(a.actor),target=scene.point(a.target);if(!origin||!target)continue;const s=scene.scale,dx=target.worldX-origin.worldX,dz=target.worldZ-origin.worldZ,distance=Math.max(.01,Math.hypot(dx,dz)),from=Number.isFinite(distance)&&scene.project?scene.project(origin.worldX+dx/distance*.6,r.height,origin.worldZ+dz/distance*.6):{x:origin.x,y:origin.groundY-r.height*s},to={x:target.x,y:target.groundY-s*.8},color=globalThis.CombatElements?.TYPES[a.element]?.color||'#d9d0a6';c.save();c.lineCap='round';c.lineJoin='round';
 if(['tongue','vine','web-cast'].includes(r.kind)){const start=.2,extend=e.land?1-ease(e.post/.45):ease((e.pre-start)/(1-start)),end={x:mix(from.x,to.x,extend),y:mix(from.y,to.y,extend)},bend=(r.kind==='tongue'?8:20)*Math.sin(e.t*Math.PI);if(extend>0){c.strokeStyle=r.kind==='tongue'?'#834350':r.kind==='vine'?'#547c45':'#c7d7c4';c.lineWidth=r.kind==='tongue'?Math.max(4,s*.09):3;c.beginPath();c.moveTo(from.x,from.y);c.quadraticCurveTo((from.x+end.x)/2,(from.y+end.y)/2+bend,end.x,end.y);c.stroke();c.strokeStyle=r.kind==='tongue'?'#ef9da2':r.kind==='vine'?'#a8c778':'#e5e6d5';c.lineWidth=r.kind==='tongue'?Math.max(2,s*.04):1;c.stroke();c.fillStyle=c.strokeStyle;c.beginPath();c.ellipse(end.x,end.y,r.kind==='tongue'?5:3,r.kind==='tongue'?3:3,Math.atan2(to.y-from.y,to.x-from.x),0,Math.PI*2);c.fill();}}
 else if(['croak','roar','wing-gust'].includes(r.kind)){for(let i=0;i<4;i++){const q=(e.t*2+i*.22)%1;c.globalAlpha=(1-q)*Math.sin(e.t*Math.PI);c.strokeStyle=r.kind==='croak'?'#c7de9b':color;c.lineWidth=2;c.beginPath();if(r.kind==='wing-gust'){const xx=mix(from.x,to.x,q);c.ellipse(xx,mix(from.y,to.y,q),s*.2,s*(.2+q*.5),Math.atan2(to.y-from.y,to.x-from.x),-.9, .9);}else c.ellipse(from.x,from.y,s*(.15+q*1.6),s*(.1+q*.65),0,0,Math.PI*2);c.stroke();}}
 else if(['feather','spit'].includes(r.kind)&&!e.land){const q=ease((e.pre-.2)/.8);for(let i=0;i<(r.kind==='feather'?5:3);i++){const spread=(i-(r.kind==='feather'?2:1))*s*.12*q;c.globalAlpha=q>0?1:0;c.strokeStyle=r.kind==='feather'?'#ece2bd':color;c.lineWidth=r.kind==='feather'?3:5;const x=mix(from.x,to.x,q),y=mix(from.y,to.y,q)+spread-Math.sin(q*Math.PI)*s*.3;c.beginPath();c.moveTo(x-8,y-3);c.lineTo(x+6,y+2);c.stroke();}}
 else if(['bird-dive','swoop','ram','shell-roll','scuttle','sting'].includes(r.kind)&&!scene.reduced){c.strokeStyle=color;c.lineWidth=2;c.globalAlpha=Math.sin(e.t*Math.PI)*.45;for(let i=0;i<4;i++){const q=.03+i*.035;c.beginPath();c.moveTo(origin.x-(to.x-from.x)*q,origin.y+s*.5+i*3);c.lineTo(origin.x-(to.x-from.x)*(q+.1),origin.y+s*.5+i*3);c.stroke();}}
 if(r.family==='toad'&&['tongue','croak'].includes(r.kind)&&!scene.reduced){c.fillStyle='#bcc98d';c.globalAlpha=pulse(e.t)*.65;c.beginPath();c.ellipse(from.x,from.y+3,s*.16*(1+e.pre*.4),s*.1*(1+e.pre*.4),0,0,Math.PI*2);c.fill();}c.restore();}}
function pulse(t){return Math.sin(clamp(t)*Math.PI);}
return {recipe,envelope,pose,draw};
});
