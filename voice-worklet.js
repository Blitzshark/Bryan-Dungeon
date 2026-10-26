/* Live mono speech frames. The output stays silent so the microphone never feeds back locally. */
class BasementVoiceSend extends AudioWorkletProcessor{
 constructor(){super();this.frame=new Int16Array(1280);this.index=0;this.phase=0;this.sum=0;this.count=0;this.energy=0;this.hangover=0;}
 process(inputs,outputs){for(const output of outputs)for(const channel of output)channel.fill(0);const input=inputs[0]?.[0];if(!input)return true;for(const sample of input){this.sum+=sample;this.count++;this.phase+=16000/sampleRate;if(this.phase>=1){const value=Math.max(-1,Math.min(1,this.sum/this.count));this.frame[this.index++]=Math.round(value*32767);this.energy+=value*value;this.phase-=1;this.sum=this.count=0;if(this.index===this.frame.length){const speaking=Math.sqrt(this.energy/this.frame.length)>.006;if(speaking)this.hangover=8;if(speaking||this.hangover>0)this.port.postMessage(this.frame.buffer,[this.frame.buffer]);if(this.hangover>0)this.hangover--;this.frame=new Int16Array(1280);this.index=0;this.energy=0;}}}return true;}
}
registerProcessor('basement-voice-send',BasementVoiceSend);
