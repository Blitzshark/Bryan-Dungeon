const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../test-support/fixture-engine');
function fight(size,campaign,stage){const s=E.createRun('Bryan','warrior','campaign',{seed:15,partySize:6,campaign});s.party=s.party.slice(0,size);assert(E.warp(s,'hero',campaign,stage));return s;}
test('campaign enemy health grows by 25% per adventurer above the default three, including opening and boss encounters',()=>{
 for(const campaign of [1,2,3])for(const stage of [0,5,9,19,29]){
  const base=fight(3,campaign,stage);
  for(const size of [3,4,5,6]){
   const s=fight(size,campaign,stage);assert.equal(s.enemies.length,base.enemies.length);
   s.enemies.forEach((enemy,i)=>{assert.equal(enemy.maxHp,Math.round(base.enemies[i].maxHp*(1+(size-3)*.25)));assert.equal(enemy.hp,enemy.maxHp);});
  }
 }
});
test('raid boss health is unchanged by party size',()=>{
 for(const size of [3,6]){const s=E.createRun('Tester','warrior','raid',{seed:15,partySize:size});assert.equal(s.enemies[0].maxHp,E.raidBossStats(1,s.enemies[0].enemyType).hp);}
});
