(function(){
'use strict';
const SHOTS=[
 {biome:'forest',act:1,enemies:['wolf','treant'],spell:'ember'},
 {biome:'crypt',act:1,enemies:['skeleton','gargoyle'],spell:'radiance'},
 {biome:'throne',act:1,enemies:['crystal','demon'],spell:'starfall'},
 {biome:'reef',act:2,enemies:['reefcrab','moonbell'],spell:'spark'},
 {biome:'ship',act:2,enemies:['nautilus','sawshark'],spell:'frostbite'},
 {biome:'jungle',act:2,enemies:['spider','treant'],spell:'wildfire'},
 {biome:'cloud',act:3,enemies:['brasswing','conductor'],spell:'chainshot'}
];
const SHOT_MS=10000;
function update(scene,time){
 const E=window.DungeonCampaign;if(!E)return;
 scene.menuTrailerActive=true;
 if(!scene.trailer)scene.trailer={started:time,shot:-1,action:0,next:time+700};
 const movie=scene.trailer,elapsed=time-movie.started,index=Math.floor(elapsed/SHOT_MS)%SHOTS.length,shot=SHOTS[index];
 if(movie.shot!==index||!scene.state){
  movie.shot=index;movie.action=0;movie.next=time+700;
  const party=['warrior','ranger','mage'].map((job,i)=>Object.assign(E.hero('trailer-'+job,'',job),{status:{},appearance:HeroOptions.appearance({clothes:['#bba177','#789d8c','#9b83bf'][i],hair:['short','long','short'][i],hairColor:['#76543d','#a78a64','#ded6bc'][i]})}));
  const enemies=shot.enemies.map((type,i)=>({...E.ENEMIES[type],id:'trailer-enemy-'+i,enemyType:type,side:'enemy',maxHp:E.ENEMIES[type].hp,status:{},cooldowns:{}}));
  scene.state={mode:'campaign',phase:'battle',party,enemies,summons:[],inventory:[],order:[...party,...enemies].map(u=>u.id),cursor:0,act:shot.act,stage:0};
  scene.biome=shot.biome;scene.layoutSeed=1741+index*103;scene.effects=[];scene.animations=[];scene.positions.clear();scene.enemyFacing?.clear();scene.dirty=true;
 }
 // Slow tracking shots keep the battle readable behind menu buttons.
 if(scene.width<650)scene.scale=Math.min(scene.width/17,scene.height/13);
 scene.cx=scene.width*(scene.width<650?.58:.67)+(scene.reduced?0:Math.sin(elapsed/6500)*scene.width*.025);
 scene.cy=scene.height*(scene.width<650?.65:.57)+(scene.reduced?0:Math.sin(elapsed/8500)*8);
 if(!document.hidden&&time>=movie.next){
  const s=scene.state,beat=movie.action++%6,enemyTurn=beat===1||beat===4,actor=enemyTurn?s.enemies[beat===1?0:1]:s.party[beat===0?0:beat===2?1:2],target=enemyTurn?s.party[beat===1?0:2]:s.enemies[beat%2];
  const enemySkill=(E.C.ENEMY_MOVES[actor.enemyType]||[]).find(key=>{const m=E.SKILLS[key];return m.mult&&!m.cinematic&&!m.summonEnemy&&!m.heal&&!m.shell;});
  const skill=enemyTurn?enemySkill||'strike':beat===0?'basic_warrior':beat===2?'volley':shot.spell;
  const victims=E.SKILLS[skill]?.all?(enemyTurn?s.party:s.enemies):[target];
  s.cursor=s.order.indexOf(actor.id);scene.play({ok:true,actor:actor.id,action:'skill',skill,events:victims.map(u=>({type:'damage',source:actor.id,target:u.id,amount:12,element:E.SKILLS[skill]?.element||'physical'}))});
  movie.next=time+(scene.reduced?3000:1700);
 }
}
function overlay(scene,time){const age=(time-scene.trailer.started)%SHOT_MS,fade=Math.max(0,1-age/650,(age-(SHOT_MS-650))/650);if(fade>0){const c=scene.ctx;c.save();c.globalAlpha=Math.min(1,fade);c.fillStyle='#101b19';c.fillRect(0,0,scene.width,scene.height);c.restore();}}
window.MenuTrailer={update,overlay,SHOTS,SHOT_MS};
})();
