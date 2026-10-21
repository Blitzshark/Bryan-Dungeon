(function(){
'use strict';
class BossMusic{
 constructor(){this.audio=new Audio();this.audio.loop=true;this.audio.preload='none';this.volume=.35;try{const raw=localStorage.getItem('basement-music-volume');if(raw!==null)this.volume=Math.max(0,Math.min(1,Number(raw)||0));}catch{}this.audio.volume=this.volume;this.muted=false;this.active=false;this.track=null;document.addEventListener('visibilitychange',()=>this.sync());addEventListener('pointerdown',()=>this.sync());addEventListener('keydown',()=>this.sync());}
 update(active,raid=false,boss=true,encounter=0){this.active=!!active;const track=raid?'music/remix-of-tfc.mp3':boss?'music/the-final-confrontation.mp3':encounter%2?'music/battletheme2.mp3':'music/battletheme1.mp3';if(active&&this.track!==track){this.audio.pause();this.track=track;this.audio.src=track;this.audio.load();}this.sync();}
 sync(){if(this.active&&!this.muted&&this.volume>0&&!document.hidden){if(this.audio.paused)this.audio.play().catch(()=>{});}else this.audio.pause();}
 duck(amount=.55,duration=450){clearTimeout(this.duckTimer);this.ducked=Math.min(this.ducked??1,amount);this.audio.volume=this.volume*this.ducked;this.duckTimer=setTimeout(()=>{this.ducked=1;this.audio.volume=this.volume;},duration);}
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)||0));this.audio.volume=this.volume*(this.ducked??1);try{localStorage.setItem('basement-music-volume',String(this.volume));}catch{}this.sync();}
 setMuted(value){this.muted=!!value;this.sync();}
 stop(){clearTimeout(this.duckTimer);this.ducked=1;this.audio.volume=this.volume;this.active=false;this.audio.pause();if(this.track)this.audio.currentTime=0;}
}
window.BossMusic=BossMusic;
})();
