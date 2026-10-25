(function(){
'use strict';
const normal=['music/battletheme1.mp3','music/battletheme2.mp3'],bosses=['music/the-final-confrontation.mp3','music/remix-of-tfc.mp3'];
class BossMusic{
 constructor(){this.audio=this.player();this.ambient=this.player();this.volume=.35;try{const raw=localStorage.getItem('basement-music-volume');if(raw!==null)this.volume=Math.max(0,Math.min(1,Number(raw)||0));}catch{}this.channels=new Map([[this.audio,{gain:0,target:0}],[this.ambient,{gain:0,target:0}]]);this.muted=false;this.active=false;this.track=null;this.ducked=1;this.key=null;this.biome='forest';this.last=Date.now();document.addEventListener('visibilitychange',()=>this.sync());addEventListener('pointerdown',()=>this.sync());addEventListener('keydown',()=>this.sync());}
 player(src){const a=new Audio();a.loop=true;a.preload='none';a.volume=0;if(src){a.src=src;a.load();}return a;}
 update(active,raid=false,boss=true,encounter=0,biome='forest'){const was=this.active;this.active=!!active;this.biome=biome;const key=(raid||boss?'boss:':'normal:')+encounter;if(active&&(!was||this.key!==key)){const pool=raid||boss?bosses:normal,track=pool[Math.floor(Math.random()*pool.length)];this.key=key;if(this.track!==track){this.track=track;this.audio=this.player(track);this.channels.set(this.audio,{gain:0,target:0});}}const mood=['reef','wreck','trench','abyss','ship'].includes(biome)?'water':['crypt','throne','astral','storm','tempest','zenith','geode','aurora','foundry','core'].includes(biome)?'dungeon':'forest',src='music/ambient-'+mood+'.wav';if(this.ambientTrack!==src){this.ambientTrack=src;this.ambient=this.player(src);this.channels.set(this.ambient,{gain:0,target:0});}this.sync();}
 apply(a,c){a.volume=Math.max(0,Math.min(1,this.volume*c.gain*(a===this.ambient?1:this.ducked)));}
 sync(){const silent=this.muted||this.volume===0||document.hidden;for(const [a,c]of this.channels){c.target=silent?0:a===this.audio&&this.active?1:a===this.ambient?(this.active?.08:.4):0;if(silent){c.gain=0;a.volume=0;a.pause();}else if(c.target>0&&a.paused)a.play().catch(()=>{});}if(!this.fadeTimer&&!silent){this.last=Date.now();this.tick();}}
 tick(){this.fadeTimer=null;const now=Date.now(),step=Math.max(.005,Math.min(.1,(now-this.last)/1600));this.last=now;let fading=false;for(const [a,c]of this.channels){const difference=c.target-c.gain;c.gain+=Math.sign(difference)*Math.min(Math.abs(difference),step);this.apply(a,c);if(Math.abs(c.target-c.gain)>.001)fading=true;if(c.gain===0&&c.target===0){a.pause();if(a!==this.audio&&a!==this.ambient)this.channels.delete(a);}}if(fading)this.fadeTimer=setTimeout(()=>this.tick(),30);}
 duck(amount=.55,duration=450){clearTimeout(this.duckTimer);this.ducked=Math.min(this.ducked,amount);for(const [a,c]of this.channels)this.apply(a,c);this.duckTimer=setTimeout(()=>{this.ducked=1;for(const [a,c]of this.channels)this.apply(a,c);},duration);}
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)||0));for(const [a,c]of this.channels)this.apply(a,c);try{localStorage.setItem('basement-music-volume',String(this.volume));}catch{}this.sync();}
 setMuted(value){this.muted=!!value;this.sync();}
 stop(){this.active=false;this.key=null;this.update(false,false,false,0,this.biome);}
}
window.BossMusic=BossMusic;
})();
