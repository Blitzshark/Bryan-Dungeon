(function(){
'use strict';
// Synthesized locally: no downloads, audio files, or third-party services.
class BattleAudio{
 constructor(){this.context=null;this.master=null;}
 ready(){
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;
  if(!this.context){this.context=new Audio();this.master=this.context.createGain();this.master.gain.value=.14;this.master.connect(this.context.destination);}
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
 play(kind,impact=false,guarded=false){
  try{if(!this.ready())return;
   if(impact){if(guarded){this.note(880,420,.13,.22);this.noise(.08,2200,.15);}else{this.noise(kind==='heavy'?.2:.11,kind==='magic'?1800:800,.45);this.note(kind==='heavy'?105:175,45,.16,.28,0,'triangle');}return;}
   if(kind==='arrow'){this.note(640,210,.13,.25,0,'triangle');this.noise(.14,3600,.19);}
   else if(kind==='magic'){[392,587,784].forEach((f,i)=>this.note(f,f*1.8,.23,.13,i*.045));this.noise(.23,1400,.1);}
   else if(kind==='heal'){[523,659,784,1047].forEach((f,i)=>this.note(f,f,.25,.15,i*.07));}
   else if(kind==='focus'){this.note(220,330,.4,.17);this.note(440,660,.32,.1,.06);}
   else if(kind==='victory'){[392,494,587,784].forEach((f,i)=>this.note(f,f,.4,.18,i*.12,'triangle'));}
   else if(kind==='defeat'){[294,247,196].forEach((f,i)=>this.note(f,f*.8,.45,.16,i*.18));}
   else if(kind==='heavy'){this.noise(.27,600,.28);this.note(160,70,.28,.18,0,'triangle');}
   else if(kind==='menu'){this.note(660,880,.08,.1);}
   else{this.noise(.18,2800,.27);this.note(400,120,.12,.09,0,'triangle');}
  }catch{/* Audio must never prevent a turn from resolving. */}
 }
}
window.BattleAudio=BattleAudio;
})();
