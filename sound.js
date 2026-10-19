(function(){
'use strict';
// Synthesized locally: no downloads, audio files, or third-party services.
class BattleAudio{
 constructor(){this.context=null;this.master=null;}
 ready(){
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;
  if(!this.context){this.context=new Audio();this.master=this.context.createGain();this.master.gain.value=.14;this.master.connect(this.context.destination);const echo=this.context.createDelay(.5),wet=this.context.createGain();echo.delayTime.value=.115;wet.gain.value=.16;this.master.connect(echo);echo.connect(wet);wet.connect(this.context.destination);}
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
 technique(skill,style,impact=false,guarded=false){this.play(style,impact,guarded);try{if(!this.context||!skill)return;const pitch=180+[...skill].reduce((n,c)=>n+c.charCodeAt(0),0)%500;if(impact){this.note(pitch,pitch*.45,.18,.12,0,'triangle');if(['frostbite','moonstep','chainshot'].includes(skill))for(let i=0;i<4;i++)this.note(pitch*(i+1),pitch*(i+1)*.8,.16,.05,i*.025);}else{this.note(pitch*.8,pitch*1.3,.25,.07);if(['earthshatter','supernova','ragnarok','dragonbreath'].includes(skill)){this.noise(.6,500,.18);this.note(60,100,.6,.13);}}}catch{}}
 play(kind,impact=false,guarded=false){
  try{if(!this.ready())return;
   if(impact){if(kind==='cosmic'){this.noise(1.2,900,.6);this.note(90,20,1.4,.4,0,'triangle');return;}if(guarded){this.note(880,420,.13,.22);this.noise(.08,2200,.15);}else{this.noise(kind==='heavy'?.2:.11,kind==='magic'?1800:800,.45);this.note(kind==='heavy'?105:175,45,.16,.28,0,'triangle');}return;}
   if(kind==='portal'){this.noise(1.5,900,.2);[110,165,220,330,440,660].forEach((f,i)=>this.note(f,f*1.6,.8,.09,i*.16));return;}
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
