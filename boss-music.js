(function(){
'use strict';
class BossMusic{
 constructor(){this.audio=new Audio();this.audio.loop=true;this.audio.preload='none';this.volume=.35;try{const raw=localStorage.getItem('basement-music-volume');if(raw!==null)this.volume=Math.max(0,Math.min(1,Number(raw)||0));}catch{}this.audio.volume=this.volume;this.muted=false;this.active=false;this.track=null;document.addEventListener('visibilitychange',()=>this.sync());addEventListener('pointerdown',()=>this.sync());addEventListener('keydown',()=>this.sync());}
 update(active,raid=false){this.active=!!active;const track=raid?'music/remix-of-tfc.mp3':'music/the-final-confrontation.mp3';if(active&&this.track!==track){this.audio.pause();this.track=track;this.audio.src=track;this.audio.load();}this.sync();}
 sync(){if(this.active&&!this.muted&&this.volume>0&&!document.hidden){if(this.audio.paused)this.audio.play().catch(()=>{});}else this.audio.pause();}
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)||0));this.audio.volume=this.volume;try{localStorage.setItem('basement-music-volume',String(this.volume));}catch{}this.sync();}
 setMuted(value){this.muted=!!value;this.sync();}
 stop(){this.active=false;this.audio.pause();if(this.track)this.audio.currentTime=0;}
}
window.BossMusic=BossMusic;
})();
