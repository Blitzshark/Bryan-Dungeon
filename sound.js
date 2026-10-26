(function(){
'use strict';
// Synthesized locally: no downloads, audio files, or third-party services.
class BattleAudio{
 constructor(){this.context=null;this.master=null;}
 ready(){
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;
  if(!this.context){this.context=new Audio();this.master=this.context.createGain();this.master.gain.value=.14;if(this.context.createStereoPanner){this.panner=this.context.createStereoPanner();this.master.connect(this.panner);this.panner.connect(this.context.destination);}else this.master.connect(this.context.destination);const echo=this.context.createDelay(.5),wet=this.context.createGain();echo.delayTime.value=.115;wet.gain.value=.16;this.master.connect(echo);echo.connect(wet);wet.connect(this.context.destination);}
  if(this.context.state==='suspended')this.context.resume().catch(()=>{});
  return this.context;
 }
 note(frequency,end,duration,volume=.2,offset=0,type='sine'){
  const c=this.context,t=c.currentTime+offset,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(frequency,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02);
 }
 noise(duration,frequency,volume=.2,offset=0){
  const c=this.context,t=c.currentTime+offset,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,1.5);
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=frequency;gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start(t);source.stop(t+duration+.02);
 }
  pan(value){if(this.panner)this.panner.pan.setTargetAtTime(value,this.context.currentTime,.05);}
 sniper(kind){try{if(!this.ready())return;if(kind==='fire'){this.noise(.045,11000,.42);this.noise(.33,1700,.3);this.note(90,26,.36,.3,0,'triangle');for(let i=0;i<4;i++)this.noise(.15,1500/(1+i*.2),.07/(i+1),.12+i*.13);this.noise(.035,4300,.05,.45);this.note(1500,700,.05,.04,.6,'triangle');this.noise(.05,2400,.045,.8);}else{this.noise(.035,2800,.045);this.note(900,620,.04,.03,0,'triangle');}}catch{}}
 action(result,state,style){if(result.skill==='deadeye'){this.sniper('fire');return;}this.technique(result.skill,style);try{if(!this.context)return;const E=window.DungeonCampaign,actor=E?.unit(state,result.actor),kind=actor?.kind||'',biome=E?.encounter(state).biome;this.pan(actor?.side==='party'?-.25:.25);
  if(['slash','heavy'].includes(style)){for(const at of [.08,.24,.4]){if(['reef','wreck','trench','abyss'].includes(biome)){this.noise(.1,350,.035,at);this.note(180,100,.1,.025,at);}else if(biome==='ship'){this.noise(.035,1100,.035,at);this.note(220,140,.06,.025,at,'triangle');}else this.noise(.035,biome==='forest'||biome==='jungle'?1800:700,.04,at);}}
  if(actor?.side==='enemy'){if(['wolf','boar','rat','leviathan'].includes(kind))this.note(95,48,.3,.08,0,'sawtooth');else if(['golem','skeleton','king','bonecolossus'].includes(kind)){this.noise(.08,1600,.06);this.note(340,120,.12,.04,0,'triangle');}else if(kind.includes('sea')||kind==='slime'){this.note(160,70,.22,.05);this.noise(.13,450,.04);}else if(['wisp','specter','skull'].includes(kind))this.note(430,790,.5,.035);}
 }catch{}}
 impact(result,state,style){try{if(!this.ready())return;const events=result.events||[],hits=events.filter(e=>e.type==='damage'),misses=events.filter(e=>e.type==='miss'),E=window.DungeonCampaign,first=hits[0]||misses[0],target=first&&E?.unit(state,first.target),move=E?.SKILLS[result.skill]||{};this.pan(target?.side==='party'?-.3:.3);
  if(!hits.length){if(misses.length){this.noise(.15,3300,.13);this.note(550,110,.18,.07,0,'triangle');if(misses.some(e=>e.reason==='illusion'))for(let i=0;i<3;i++)this.note(1300+i*300,600+i*100,.16,.04,i*.03);}else if(events.some(e=>e.type==='heal')){this.note(660,880,.25,.06);this.note(990,1320,.3,.04,.08);}return;}
  this.technique(result.skill,style,true,hits.every(e=>e.guarded));if(move.burn){this.noise(.45,1800,.09);this.note(90,40,.3,.05);}else if(move.chill){for(let i=0;i<4;i++)this.note(1200+i*370,800+i*300,.16,.045,i*.025);}else if(move.shock||move.shape==='lightning'){for(let i=0;i<5;i++)this.noise(.025,5000,.065,i*.035);}else if(target?.kind==='slime'||target?.kind?.includes('sea')){this.note(180,50,.2,.06);this.noise(.14,500,.07);}else if(['golem','skeleton','king','knight','bonecolossus'].includes(target?.kind)){this.note(950,500,.16,.07,0,'triangle');this.noise(.06,2900,.05);}
  if(hits.some(e=>e.critical)){this.noise(.12,1600,.16);this.note(65,28,.28,.13,0,'triangle');[1047,1568,2093].forEach((f,i)=>this.note(f,f*.9,.18,.055,i*.035));}if(hits.some(e=>e.defeated)){this.noise(.5,620,.07,.12);this.note(150,30,.4,.05,.15);}if(hits.length>1)this.note(100,40,.25,.04);
 }catch{}}
 voyage(theme,level){try{if(!this.ready())return;const sea=theme==='raid_tide',fire=theme==='raid_furnace',base=(sea?82:fire?55:theme==='raid_spider'?110:theme==='raid_demon'?33:41)*(1+(level%4)*.025);for(let i=0;i<4;i++){this.note(base,base*.8,2.8,.1,i*3,'sine');this.note(base*3,base*2,2.4,.04,i*3,'triangle');}this.noise(.8,sea?350:fire?900:1800,.12);for(let i=0;i<8;i++){const at=3+i*.4;if(theme==='raid_spider'){this.noise(.08,3200,.05,at);this.note(210,90,.2,.04,at,'triangle');}else if(theme==='raid_demon'){this.note(65,33,1,.08,at,'sawtooth');this.noise(.25,240,.04,at);}else if(fire){this.noise(.1,900,.06,at);this.note(120,45,.12,.05,at,'triangle');}else this.note(base*(3+i%3),base*(4+i%3),.5,.05,at,'sine');}for(let i=0;i<3;i++)this.noise(.6,sea?280:fire?1300:700,.1,7+i*.5);for(let i=0;i<4;i++)this.note(base*(2+i),base*(2+i),1.5,.06,10+i*.08,'sine');}catch{}}
 technique(skill,style,impact=false,guarded=false){this.play(style,impact,guarded);try{if(!this.context||!skill)return;const sea=window.OceanContent?.MOVES[skill];if(sea&&!impact){this.note(90,50,.5,.13,0,'sine');this.noise(.3,sea.shock?2200:400,.1);for(let i=0;i<4;i++)this.note(380+i*120,200+i*80,.12,.06,i*.09);if(sea.cinematic){this.note(35,20,3.2,.2);this.noise(2,250,.15);}}const raid=window.GameContent?.MOVES[skill];if(raid?.raid&&!impact){const base=raid.theme==='raid_spider'?130:raid.theme==='raid_demon'?33:raid.theme==='raid_furnace'?55:raid.theme==='raid_tide'?82:40;this.note(base,base*.6,1.2,.2,0,'triangle');this.noise(.8,350,.15);if(raid.cinematic)for(let i=0;i<7;i++){this.note(base*(2+i*.5),base*(3+i*.4),1.2,.09,i*.8,'sine');this.noise(.3,600+i*200,.08,i*.8);}}if(window.GameContent?.CARDS[skill]?.summon&&skill!=='summonKnight'&&!impact){const base=skill==='summonFox'?165:skill==='summonArcher'?330:440;for(let i=0;i<5;i++)this.note(base*(1+i*.25),base*(1.5+i*.25),.5,.06,i*.18);if(skill==='summonFox')this.noise(.5,1400,.09);else if(skill==='summonArcher')this.note(900,300,.25,.05,1.1,'triangle');}
if(skill==='summonKnight'&&!impact){for(let i=0;i<5;i++)this.note(147*(i+1),196*(i+1),.6,.1,i*.09);this.noise(.5,1400,.16);}const pitch=180+[...skill].reduce((n,c)=>n+c.charCodeAt(0),0)%500;if(impact){this.note(pitch,pitch*.45,.18,.12,0,'triangle');if(['frostbite','moonstep','chainshot'].includes(skill))for(let i=0;i<4;i++)this.note(pitch*(i+1),pitch*(i+1)*.8,.16,.05,i*.025);}else{this.note(pitch*.8,pitch*1.3,.25,.07);if(['earthshatter','supernova','ragnarok','dragonbreath'].includes(skill)){this.noise(.6,500,.18);this.note(60,100,.6,.13);}}}catch{}}
 play(kind,impact=false,guarded=false){
  try{if(!this.ready())return;
   if(impact){if(kind==='cosmic'){this.noise(1.2,900,.6);this.note(90,20,1.4,.4,0,'triangle');return;}if(guarded){this.note(880,420,.13,.22);this.noise(.08,2200,.15);}else{this.noise(kind==='heavy'?.2:.11,kind==='magic'?1800:800,.45);this.note(kind==='heavy'?105:175,45,.16,.28,0,'triangle');}return;}
   if(kind==='gate'){this.note(85,35,1.5,.14,0,'sawtooth');for(let i=0;i<8;i++)this.noise(.07,450,.1,.2+i*.28);this.noise(1,240,.08,2.1);return;}
   if(kind==='collapse'){for(let i=0;i<6;i++)this.noise(.2,1100-i*100,.1,.15+i*.13);this.note(130,25,1.6,.2,.85);this.noise(.5,170,.3,2.75);return;}
   if(kind==='surface'){this.noise(1.2,550,.14);this.noise(.5,2200,.16,1.5);for(let i=0;i<4;i++)this.noise(.08,650,.12,1.9+i*.22);return;}
   if(kind==='landfall'){for(let i=0;i<9;i++)this.noise(.06,i<4?650:1800,.09,i*.28);for(let i=0;i<4;i++)this.note(900+i*250,1300+i*100,.14,.04,1.5+i*.28);return;}
   if(kind==='boss'){this.note(58,38,.7,.18);this.noise(.4,650,.14,1.1);this.note(160,80,.4,.1,1.5);return;}
   if(['portal','crossing','sky-rise','storm-flight','sun-stairs'].includes(kind)){this.noise(1.5,900,.2);[110,165,220,330,440,660].forEach((f,i)=>this.note(f,f*1.6,.8,.09,i*.16));return;}
   else if(kind==='travel'){this.noise(.65,1300,.12);for(let i=0;i<6;i++)this.noise(.055,480,.12,i*.14);this.note(196,294,.6,.1);return;}
   else if(kind==='story'){[330,440,554,660].forEach((f,i)=>this.note(f,f,.35,.12,i*.12));this.noise(.2,1000,.05);return;}
   else if(kind==='rest'){this.noise(.8,500,.09);[262,330,392].forEach((f,i)=>this.note(f,f,.6,.1,i*.13));return;}
   else if(kind==='cosmic'){[110,165,220,330,440].forEach((f,i)=>this.note(f,f*1.8,1.8,.12,i*.7,'sine'));this.noise(.65,2600,.2,5.6);}
   else if(kind==='arrow'){this.note(640,210,.13,.25,0,'triangle');this.noise(.14,3600,.19);}
   else if(kind==='magic'){[392,587,784].forEach((f,i)=>this.note(f,f*1.8,.23,.13,i*.045));this.noise(.23,1400,.1);}
   else if(kind==='heal'){[523,659,784,1047].forEach((f,i)=>this.note(f,f,.25,.15,i*.07));}
   else if(kind==='focus'){this.note(220,330,.4,.17);this.note(440,660,.32,.1,.06);}
   else if(kind==='victory'){[392,494,587,784].forEach((f,i)=>this.note(f,f,.4,.18,i*.12,'triangle'));}
   else if(kind==='defeat'){[294,247,196].forEach((f,i)=>this.note(f,f*.8,.45,.16,i*.18));}
   else if(kind==='heavy'){this.noise(.27,600,.28);this.note(160,70,.28,.18,0,'triangle');}
   else if(kind==='menu'){this.note(660,880,.08,.1);}
   else{this.noise(.18,2800,.27);this.note(400,120,.12,.09,0,'triangle');}
   if(['slash','heavy'].includes(kind))for(const offset of [0,.13,.26,.98,1.12])this.noise(.045,420,.07,offset);
  }catch{/* Audio must never prevent a turn from resolving. */}
 }
}
window.BattleAudio=BattleAudio;
})();
