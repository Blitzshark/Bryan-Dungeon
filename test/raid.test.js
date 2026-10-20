const {recoverAtCamp}=require('../test-support/helpers');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {E,playBattle,equipBest}=require('../test-support/helpers');
test('endless raids rotate bosses, grow strictly stronger, and award higher tier gear across 36 legal battles',()=>{
 const s=E.createRun('Raider','warrior','raid'),types=new Set();let hp=0,atk=0;
 for(let wave=1;wave<=36;wave++){
  assert.equal(s.raidLevel,wave);assert.equal(s.phase,'battle');assert.equal(s.enemies.length,1);const boss=s.enemies[0];types.add(boss.enemyType);assert(boss.boss);assert(boss.maxHp>hp);assert(boss.atk>atk);hp=boss.maxHp;atk=boss.atk;
  playBattle(s);assert.equal(s.phase,'camp','wave '+wave+' should be winnable');assert.equal(s.raidBest,wave);assert.equal(s.party[0].level,wave+1);
  const loot=s.inventory.filter(i=>s.reward.loot.includes(i.id));assert.equal(loot.length,2);for(const i of loot){assert.equal(i.rarity,'epic');assert.equal(i.tier,wave);assert(i.name.includes('Raid '+wave));assert(i.atk+i.def>=wave*2);}
  const loaded=E.restore(JSON.stringify(s));assert.deepEqual(loaded,s);equipBest(s);recoverAtCamp(s);while(s.gold>=20&&s.potions<6)E.campAction(s,{type:'buy-tonic'});assert(E.travel(s));
 }
 assert.equal(types.size,3);assert.equal(s.raidLevel,37);assert.equal(s.phase,'battle');
});
test('old campaigns default to campaign mode and invalid raid progression is rejected',()=>{
 const s=E.createRun();delete s.mode;delete s.raidLevel;delete s.raidBest;assert.equal(E.restore(s).mode,'campaign');s.mode='raid';s.raidLevel=-1;assert.equal(E.restore(s),null);
});
test('raid defeat ends the survival run and preserves the defeated-boss score',()=>{
 const s=E.createRun('Raider','mage','raid');playBattle(s);assert.equal(s.phase,'camp');E.travel(s);const loot=JSON.stringify(s.inventory);s.party.forEach(p=>p.hp=0);s.phase='defeat';assert.equal(E.retry(s),false);assert.equal(s.phase,'defeat');assert.equal(s.raidBest,1);assert.equal(s.raidLevel,2);assert.equal(s.enemies[0].maxHp,E.raidBossStats(2).hp);assert.equal(JSON.stringify(s.inventory),loot);
});
