(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RegionalStories=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const REWARDS={supplies:{potions:2,detail:'+2 healing tonics'},medicine:{potions:3,detail:'+3 healing tonics'},ember:{embers:1,detail:'+1 revival ember'},cache:{gold:4,potions:1,detail:'+4 shared gold · +1 healing tonic'},train:{atk:1,detail:'Party gains +1 attack'},fortify:{hp:6,detail:'Party gains +6 maximum health · no healing'},focus:{mp:1,detail:'Party gains +1 maximum focus'},speed:{speed:1,detail:'Party gains +1 initiative'},armor:{def:1,detail:'Party gains +1 armor'}};
// Every region has its own cast, dilemma and physical action; no generic roadside reskins.
const ROWS={
forest:[
 ['The fallen oak','A storm-felled oak blocks a badger family’s burrow. A ranger offers her medical satchel if you help lift it.','Lift the trunk together','supplies','Practice vaulting the fallen branches','speed','oak'],
 ['Lantern-moth crossing','Lantern moths gather over a washed-out stream. Their keeper cannot carry both her lantern and her supply basket.','Escort the keeper across','cache','Follow the moths through the stepping stones','focus','moths'],
 ['The rootkeeper’s garden','An old gardener tends medicinal roots beneath a sleeping treant. Pulling too hard will wake it.','Harvest roots with the gardener','medicine','Study how the roots brace the treant','armor','roots']],
crypt:[
 ['The nameless ossuary','Loose bones roll from unmarked niches. A stone ledger can finally give the forgotten their names.','Return the bones to their niches','ember','Brace the collapsing burial shelves','fortify','ossuary'],
 ['The drowned sluice','A rusted wheel holds back black water. A sealed medicine coffer lies beyond the gate.','Turn the wheel and retrieve the coffer','supplies','Divert the flood through the training hall','train','sluice'],
 ['The jailer’s last watch','A spectral jailer guards an empty cell, still waiting for a relief bell that never rang.','Ring the bell and release the watch','focus','Rebuild the jailer’s broken shield','armor','jailer']],
throne:[
 ['The chain ferry','An ash ferryman hauls a cracked skiff across a river of cinders. One chain has snapped loose.','Haul the ferry to safety','cache','Cross hand-over-hand above the embers','fortify','ferry'],
 ['A star caught in iron','A tiny fallen star struggles inside an infernal cage. Its light bends around the bars.','Break its cage and set it free','ember','Trace the star’s orbit without touching it','focus','starcage'],
 ['The obsidian choir','Voiceless statues beat their chests over a cooling lava vent. One fractured singer cannot keep the rhythm.','Mend the singer with volcanic glass','armor','Match the choir’s impossible rhythm','train','choir']],
reef:[
 ['The manta nursery','A manta calf is caught in a poacher’s net. Its mother holds back the current while you approach.','Cut the net strand by strand','supplies','Guide the calf through the current','speed','manta'],
 ['The coral organ','Water whistles through a reef of hollow coral. A pearl diver has lost the tune that opens her cache.','Play the coral pipes with the diver','ember','Practice holding steady in the resonance','focus','organ'],
 ['The hermit’s moving home','An enormous hermit crab has outgrown its cracked shell. An abandoned diving bell would fit perfectly.','Roll the bell into place','cache','Reinforce the crab’s old shell','armor','hermit']],
ship:[
 ['The runaway cannon','A loaded cannon tears free as the deck pitches. The powder runner is pinned behind its wheels.','Catch and lash the cannon','train','Unload the shot and free the runner','supplies','cannon'],
 ['A sail full of stars','The navigator stitches holes in a sail using a star chart. She needs hands on the ropes before nightfall.','Hoist the repaired constellation sail','speed','Help chart the safest heading','focus','sail'],
 ['The galley truce','Two rival deck crews refuse to share the last cooking pot. The cook proposes a knife-free competition.','Cook a meal for both crews','medicine','Join their barrel-lifting contest','fortify','galley']],
jungle:[
 ['The jade pollinators','A rare orchid closes as its jewel-colored pollinators vanish into sticky sap. The clearing goes silent.','Free the beetles without crushing them','supplies','Carry pollen between the remaining blooms','focus','orchid'],
 ['The rain basin','A broken temple channel spills clean rainwater into mud. A stone tapir statue could redirect it.','Push the statue back onto its plinth','armor','Collect medicinal leaves beside the spill','medicine','basin'],
 ['The drum beneath the roots','A traveling drummer answers calls from the forest. A curious troop of monkeys steals his second drum.','Answer the monkeys with a drum circle','train','Trade fruit to recover the stolen drum','cache','drums']],
cloud:[
 ['The kite shepherd','A shepherd’s cloud-lambs drift away on broken tethers. Their bells vanish one by one into the mist.','Catch the loose kite lines','speed','Weave stronger tethers for the flock','armor','kites'],
 ['The floating orchard','An orchard island has tipped sideways. Its keeper balances on a ladder while fruit rolls toward the sky.','Counterbalance the island together','fortify','Gather the floating medicinal fruit','supplies','orchard'],
 ['A bridge of wind chimes','The missing notes of a wind-chime bridge leave holes in its invisible path. A courier waits on the far side.','Tune the chimes into a crossing','focus','Carry the courier’s parcel across the gaps','cache','chimes']],
tempest:[
 ['The lightning harvest','A storm farmer’s copper rods overload above a broken collector. She needs a grounded chain before the next strike.','Ground the collector through its chain','armor','Bottle the excess charge with the farmer','ember','rods'],
 ['The eye of the storm','A tiny weather station spins inside a pocket of calm. Its engineer is trapped behind a bent vane.','Brace the vane and free the engineer','supplies','Practice moving between the gusts','speed','vane'],
 ['The thunder drum','A cracked storm drum calls lightning toward a drifting village. Its keeper begs you to change the rhythm.','Patch the drumhead with stormcloth','fortify','Beat a counter-rhythm to turn the storm','train','thunderdrum']],
zenith:[
 ['The blind sundial','A sun priest has lost the mirror that guides dawn into the sanctuary. Loose prisms still catch fragments of light.','Align the prisms into a new sunrise','focus','Forge the fragments into sun shields','armor','prisms'],
 ['The phoenix’s cold nest','A young phoenix shivers in an unlit brazier. Its keeper has one warm coal and too many broken steps to climb.','Pass the coal up the broken staircase','ember','Rebuild the steps for the keeper','fortify','phoenixnest'],
 ['The last eclipse garden','Flowers of light close beneath a passing shadow. The gardener needs a moving mirror to keep them alive.','Carry the mirror along the flowerbeds','medicine','Study the eclipse through smoked crystal','train','eclipse']]
};
const STORIES={};for(const [biome,rows]of Object.entries(ROWS))rows.forEach((r,i)=>{const [name,text,accept,a,decline,d,visual]=r;STORIES[biome+'-'+i]={name,text,accept,decline,acceptDetail:REWARDS[a].detail,declineDetail:REWARDS[d].detail,acceptReward:REWARDS[a],declineReward:REWARDS[d],visual,biome,index:i};});
return {STORIES,ROWS,REWARDS};
});
