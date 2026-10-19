(function(){
'use strict';
const E=window.DungeonCampaign,$=id=>document.getElementById(id),scene=new CampaignScene($('world')),audio=new BattleAudio(),online=new OnlineParty(),cosmic=new UniverseCutscene($('universe-cutscene'));
const SAVE='bryan-hollow-road-v4',RAID_SAVE='bryan-hollow-road-raid-v1';
let state=null,saved=null,savedRaid=null,lobbyTimer=null,tab='fight',target=null,itemMode=null,busy=false,paused=false,enemyTimer=null,animationTimer=null,toastTimer=null,selectedClass='warrior',soundOn=true,logOpen=true,impactTimer=null,lastOutcome=null,room=null,remoteVersion=0,campTab='loot',campSort='rarity',campSelected=null,campHero='hero',networkErrorAt=0,roomReadyTimer=null;
try{saved=E.restore(localStorage.getItem(SAVE));savedRaid=E.restore(localStorage.getItem(RAID_SAVE));soundOn=localStorage.getItem(SAVE+'-sound')!=='off';}catch{}
scene.setState(null,true);$('continue-game').hidden=!saved;$('continue-raid').hidden=!savedRaid;
function escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function element(tag,attrs={},text){const node=document.createElement(tag);for(const [key,value]of Object.entries(attrs)){if(key==='class')node.className=value;else if(key==='onclick')node.onclick=value;else node.setAttribute(key,value);}if(text!==undefined)node.textContent=text;return node;}
function save(){if(!state)return;if(room){$('save-status').textContent='ROOM '+room.code+' · SYNCED';return;}try{localStorage.setItem(state.mode==='raid'?RAID_SAVE:SAVE,JSON.stringify(state));$('save-status').textContent=state.mode==='raid'?'RAID SAVED':'CAMPAIGN SAVED';}catch{$('save-status').textContent='SAVE UNAVAILABLE';}}
function notify(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3300);}
function tone(kind='menu',impact=false,guarded=false){if(soundOn)audio.play(kind,impact,guarded);}
function updateSound(){$('sound').textContent=soundOn?'♫':'♪';$('sound').setAttribute('aria-label',soundOn?'Mute sound':'Enable sound');$('sound').setAttribute('aria-pressed',String(soundOn));}
$('sound').onclick=()=>{soundOn=!soundOn;try{localStorage.setItem(SAVE+'-sound',soundOn?'on':'off');}catch{}updateSound();if(soundOn)tone();};updateSound();
function toggleDeck(){
 const deck=$('command-deck'),collapsed=deck.classList.toggle('is-collapsed');
 $('deck-toggle').setAttribute('aria-expanded',String(!collapsed));$('deck-toggle').setAttribute('aria-label',collapsed?'Show battle controls':'Hide battle controls');$('deck-toggle').title=(collapsed?'Show':'Hide')+' controls (H)';
}
$('deck-toggle').onclick=toggleDeck;
function showModal(html,locked=false){clearTimeout(enemyTimer);enemyTimer=null;paused=true;$('modal-content').innerHTML=html;$('modal').hidden=false;$('modal-close').hidden=locked;requestAnimationFrame(()=>{$('modal').querySelector('input,button:not([hidden])')?.focus();});}
function closeModal(){if($('modal-close').hidden)return;hideModal();scheduleEnemy();}
function hideModal(){clearTimeout(lobbyTimer);$('modal').hidden=true;paused=false;}
$('modal-close').onclick=closeModal;
let backdropPress=false;
$('modal').addEventListener('pointerdown',event=>{backdropPress=event.target===$('modal');});
$('modal').addEventListener('click',event=>{if(backdropPress&&event.target===$('modal'))closeModal();backdropPress=false;});
$('modal').addEventListener('keydown',event=>{if(event.key!=='Tab')return;const nodes=[...$('modal').querySelectorAll('button:not([hidden]):not(:disabled),input')].filter(n=>n.getClientRects().length);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
function characterScreen(mode='campaign'){
 if(typeof mode!=='string')mode='campaign';
 tone('menu');selectedClass='warrior';
 showModal('<div class="eyebrow">'+(mode==='raid'?'ENDLESS BOSSES · EVER BETTER GEAR':'EVERY CAMPAIGN STARTS WITH SOMEONE')+'</div><h2>Who walks<br>the hollow road?</h2><p>'+(mode==='raid'?'Defeat a boss, return to the fire, equip better gear, and challenge a stronger boss. Your campaign save stays separate.':'Rowan the wayfarer and Mira the arcanist are already waiting. Your choices will decide where this party ends up.')+'</p><label class="field-label" for="hero-name">YOUR ADVENTURER’S NAME</label><input id="hero-name" maxlength="18" autocomplete="nickname" value="Adventurer"><div class="field-label">CHOOSE YOUR STARTING PATH</div><div class="class-grid">'+[['warrior','⚔','Vanguard','High health. Heavy single-target hits.'],['ranger','➶','Wayfarer','Act first. Hit the entire enemy line.'],['mage','✦','Arcanist','More focus. Powerful arcane attacks.']].map(([job,icon,name,desc])=>'<button class="class-option '+(job===selectedClass?'selected':'')+'" data-class="'+job+'" aria-pressed="'+(job===selectedClass)+'"><span>'+icon+'</span><strong>'+name+'</strong><small>'+desc+'</small></button>').join('')+'</div><button class="primary" id="start-campaign">Set out with your party ↗</button><p style="font-size:9px">'+(mode==='raid'?'Starting a new raid replaces your saved raid only.':'Starting a new journey replaces your saved campaign only.')+'</p>');
 document.querySelectorAll('[data-class]').forEach(button=>button.onclick=()=>{selectedClass=button.dataset.class;document.querySelectorAll('[data-class]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});});
 $('start-campaign').onclick=()=>{const name=$('hero-name').value.trim();if(!name){notify('Give your adventurer a name.');$('hero-name').focus();return;}clearTimeout(animationTimer);lastOutcome=null;busy=false;state=E.createRun(name,selectedClass,mode);hideModal();begin();};
 $('hero-name').addEventListener('keydown',event=>{if(event.key==='Enter')$('start-campaign').click();});
}
$('new-game').onclick=()=>characterScreen();
$('continue-raid').onclick=()=>{state=E.restore(savedRaid);if(!state)return notify('Start a new raid.');hideModal();begin();};
$('continue-game').onclick=()=>{state=E.restore(saved);if(!state){notify('That save could not be loaded. Begin a new journey.');return;}hideModal();begin();};
function begin(){clearTimeout(enemyTimer);tab='fight';itemMode=null;target=E.living(state,'enemy')[0]?.id;busy=false;paused=false;$('title-screen').hidden=true;$('game-ui').hidden=false;scene.setState(state,false);save();render();if(state.phase!=='battle')outcome();else scheduleEnemy();}
function canAct(){const actor=state&&E.active(state);return !!(actor&&actor.side==='party'&&!busy&&!paused&&(!room||(online.controls(actor.id)&&online.ready())));}
function setTab(value){if(!state)return;tab=value;itemMode=null;renderActions();}
for(const button of document.querySelectorAll('[data-tab]'))button.onclick=()=>setTab(button.dataset.tab);
function render(){
 if(!state)return;const isCamp=state.phase==='camp'&&!busy;$('camp-screen').hidden=!isCamp;$('game-ui').hidden=isCamp;const chapter=E.encounter(state),actor=E.active(state)||state.party[0],isEnemy=actor.side==='enemy';
 if(!E.living(state,'enemy').some(e=>e.id===target))target=E.living(state,'enemy')[0]?.id||null;
 scene.setState(busy&&state.phase==='camp'?{...state,phase:'battle'}:state,false);scene.selected=target;renderRoomStrip();if(isCamp){renderCamp();return;}
 $('biome-label').textContent=state.mode==='raid'?'ENDLESS RAID / BOSS '+state.raidLevel:E.WORLDS[chapter.world].name.toUpperCase()+' / '+String(chapter.progress).padStart(2,'0')+' OF 10'+(chapter.boss?' · BOSS':'');$('chapter-name').textContent=chapter.name;
 $('chapter-track').hidden=state.mode==='raid';$('chapter-track').setAttribute('aria-label',state.mode==='raid'?'Endless raid':'Campaign progress');
 $('chapter-track').replaceChildren(...E.CHAPTERS.filter(c=>c.world===chapter.world).map(c=>element('i',{class:c.progress<chapter.progress?'done':c.progress===chapter.progress?'current':'',title:c.name})));
 $('round-number').textContent=String(state.round).padStart(2,'0');
 $('turn-list').replaceChildren(...state.order.map((id,i)=>{const u=E.unit(state,id);if(!u)return element('span');const row=element('div',{class:'turn-unit '+(u.side==='enemy'?'enemy ':'')+(i===state.cursor?'active ':'')+(!u.hp?'fallen':'')});row.style.setProperty('--unit-color',u.color);row.append(element('span',{class:'mini-avatar'},u.side==='party'?'◆':'×'));const text=element('div',{class:'turn-unit-text'});text.append(element('div',{class:'turn-unit-name'},u.name));const meter=element('div',{class:'mini-meter'}),fill=element('i');fill.style.width=(u.hp/u.maxHp*100)+'%';meter.append(fill);text.append(meter);row.append(text,element('span',{class:'turn-number'},!u.hp?'−':i===state.cursor?'▶':String(i+1)));return row;}));
 $('enemy-roster').replaceChildren(...state.enemies.map(enemy=>{const b=element('button',{class:'enemy-card '+(enemy.id===target?'selected':''),'aria-label':'Target '+enemy.name,'aria-pressed':String(enemy.id===target),onclick:()=>selectTarget(enemy.id)});b.disabled=!enemy.hp;b.append(element('strong',{},enemy.name));const meter=element('div',{class:'mini-meter'}),fill=element('i');fill.style.width=(enemy.hp/enemy.maxHp*100)+'%';meter.append(fill);b.append(meter,element('small',{},enemy.hp?'HP '+enemy.hp+' / '+enemy.maxHp:'DEFEATED'));return b;}));
 $('actor-name').textContent=actor.name;$('actor-job').textContent=(isEnemy?'ENEMY':E.CLASSES[actor.job].name+' · LEVEL '+actor.level).toUpperCase();$('actor-portrait').style.background=actor.color;$('actor-portrait').textContent=isEnemy?'×':'◆';
 $('turn-indicator').classList.toggle('enemy',isEnemy);$('turn-indicator').innerHTML='<i></i>'+(!state||state.phase!=='battle'?'BATTLE ENDED':busy?'RESOLVING':isEnemy?'ENEMY TURN':room&&!room.members.some(m=>m.heroId===actor.id&&m.online)?'BOT TURN':room&&!online.controls(actor.id)?'PARTY TURN':'YOUR TURN');
 $('hp-label').textContent=actor.hp+' / '+actor.maxHp+(actor.status?.poison?' · POISONED':'');$('hp-fill').style.width=(actor.hp/actor.maxHp*100)+'%';$('mp-label').textContent=isEnemy?'—':actor.mp+' / '+actor.maxMp;$('mp-fill').style.width=(isEnemy?0:actor.mp/actor.maxMp*100)+'%';$('gold-count').textContent=state.gold;
 $('battle-announcement').textContent=state.phase==='battle'?(busy?'ACTION IN PROGRESS':isEnemy?actor.name.toUpperCase()+' IS ACTING':actor.name.toUpperCase()+(room&&!room.members.some(m=>m.heroId===actor.id&&m.online)?' · BOT IS ACTING':room&&!online.controls(actor.id)?' · WAITING FOR TEAMMATE':' · CHOOSE AN ACTION')):state.phase==='defeat'?'THE PARTY HAS FALLEN':'ENCOUNTER COMPLETE';
 $('log-lines').replaceChildren(...state.log.slice(-4).map(text=>element('div',{},text)));$('log-lines').hidden=!logOpen;
 $('scene-caption').innerHTML=escape(chapter.subtitle.toUpperCase())+'<span>THE HOLLOW ROAD / '+(state.mode==='raid'?'ENDLESS RAID':'CAMPAIGN I')+'</span>';
 renderActions();
}
function selectTarget(id){const enemy=E.unit(state,id);if(!enemy||enemy.side!=='enemy'||enemy.hp<=0)return;target=id;scene.selected=id;render();}
function actionButton(title,detail,icon,callback,disabled=false,wide=false){const b=element('button',{class:'skill'+(wide?' wide':''),onclick:callback});b.disabled=disabled;b.append(element('span',{class:'skill-icon'},icon));const copy=element('span');copy.append(element('strong',{},title),element('small',{},detail));b.append(copy);return b;}
function renderActions(){
 if(!state)return;const actor=E.active(state)||state.party[0],enabled=canAct();
 document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===tab);b.setAttribute('aria-pressed',String(b.dataset.tab===tab));});
 const box=$('action-content');box.replaceChildren();
 const enemy=E.unit(state,target);$('target-hint').textContent=tab==='items'?'Items consume your action. Choose an ally.':tab==='focus'?'Recover focus and halve incoming damage.':enemy?'TARGET: '+enemy.name.toUpperCase():'No standing enemies';
 if(tab==='fight'){
  if(actor.side==='enemy'){box.append(element('p',{class:'skill-note'},'The enemy is taking its turn. Your party will be ready shortly.'));box.append(actionButton('Enemy action','You cannot act during another fighter’s turn.','◷',()=>{},true,true));return;}
  const keys=['strike',E.CLASSES[actor.job].skill,...(actor.id==='mira'?['mend']:[])];
  keys.forEach((key,i)=>{const skill=E.SKILLS[key],cd=actor.cooldowns[key]||0;const detail=cd?'Recovering · '+cd+' turn'+(cd===1?'':'s'):skill.cost+' focus · '+(skill.heal?'heal weakest ally':skill.all?'all enemies':key==='strike'?'selected enemy':'heavy strike');const button=actionButton(skill.name+(i===0?' [Q]':i===1?' [W]':' [E]'),detail,skill.heal?'✚':skill.all?'✦':i?'⟐':'⚔',()=>perform({type:'skill',skill:key,target}),!enabled||actor.mp<skill.cost||cd>0);button.title=skill.description;box.append(button);});
  if(actor.name.trim().toLowerCase()==='bryan')box.append(actionButton('Universe cleave','10,000,000 damage · all enemies','✧',()=>perform({type:'skill',skill:'universe'}),!enabled,true));
  box.append(actionButton('Guard & focus','Recover 3 focus · take half damage','◇',()=>perform({type:'focus'}),!enabled));
 }else if(tab==='items'){
  if(itemMode){$('target-hint').textContent=itemMode==='potion'?'HEAL: choose an injured ally · restores '+E.tonicHeal(state)+' HP':'REVIVE: choose a fallen ally · restores half health';
   state.party.forEach(p=>{const invalid=itemMode==='potion'?(p.hp<=0||p.hp===p.maxHp):p.hp>0;box.append(actionButton(p.name,p.hp+' / '+p.maxHp+' health',p.hp?'◆':'✧',()=>perform({type:itemMode,target:p.id}),!enabled||invalid));});
   const back=element('button',{class:'text-button',onclick:()=>{itemMode=null;renderActions();}},'← Back to bag');box.append(back);
  }else{
   box.append(actionButton('Healing tonic ×'+state.potions,'Restore '+E.tonicHeal(state)+' health to one standing ally','✚',()=>{itemMode='potion';renderActions();},!enabled||!state.potions));
   box.append(actionButton('Revival ember ×'+state.embers,'Revive one fallen ally at half health','✧',()=>{itemMode='revive';renderActions();},!enabled||!state.embers));
   box.append(element('p',{class:'skill-note'},'Every encounter won earns another tonic. Item use takes one turn.'));
  }
 }else{
  box.append(actionButton('Take a breath','Recover up to 3 focus. Guard until your next turn.','◇',()=>perform({type:'focus'}),!enabled,true));
  box.append(element('p',{class:'skill-note'},'A careful turn can turn the tide. Guard halves incoming damage; focus fuels your strongest techniques.'));
 }
}
function floatNumbers(result){for(const event of result.events||[]){if(!event.amount)continue;const point=scene.point(event.target);if(!point)continue;const label=element('span',{class:'damage-number '+(result.skill==='universe'?'cosmic-damage ':'')+(event.type==='damage'?'':'heal')},(event.type==='damage'?'−':'+')+(result.skill==='universe'?event.amount.toLocaleString('en-US'):event.amount)+(event.type==='focus'?' FP':event.status==='poison'?' · POISON':event.guarded?' · GUARD':''));label.style.left=point.x+'px';label.style.top=(point.y+20)+'px';$('damage-layer').append(label);setTimeout(()=>label.remove(),1000);}}
function animate(result){
 busy=true;const timing=scene.play(result);if(result.skill==='universe')cosmic.play(scene.reduced);tone(timing.style);render();save();
 clearTimeout(impactTimer);impactTimer=setTimeout(()=>{floatNumbers(result);const damage=result.events.find(e=>e.type==='damage');if(damage)tone(timing.style,true,damage.guarded);},timing.impactAt);
 clearTimeout(animationTimer);animationTimer=setTimeout(()=>{busy=false;render();if(state.phase!=='battle')outcome();else scheduleEnemy();},timing.duration);
}
function perform(command){if(!canAct())return;if(room){sendRoom({type:'act',command});return;}const result=E.act(state,command);if(!result.ok){notify(result.error);return;}itemMode=null;animate(result);}
function scheduleEnemy(){clearTimeout(enemyTimer);enemyTimer=null;if(room)return;if(!state||state.phase!=='battle'||busy||paused||E.active(state)?.side!=='enemy')return;enemyTimer=setTimeout(()=>{if(paused||busy)return;const result=E.enemyAct(state);if(result.ok)animate(result);},scene.reduced?300:900);}
function campChange(command){
 if(room){sendRoom({type:'camp',command});return;}
 const result=E.campAction(state,command);if(!result.ok)return notify(result.error);tone('menu');save();render();
}
function travelCamp(){
 if(room){sendRoom({type:'travel'});return;}
 if(!E.travel(state))return;hideModal();tab='fight';target=null;render();save();if(state.phase!=='battle')outcome();else scheduleEnemy();
}
for(const b of document.querySelectorAll('[data-camp-tab]'))b.onclick=()=>{campTab=b.dataset.campTab;renderCamp();};
function renderCamp(){
 const chapter=E.encounter(state),reward=state.reward||{},isHost=!room||room.yourId===room.hostId;
 $('camp-eyebrow').textContent=state.mode==='raid'?'RAID BOSS '+state.raidLevel+' DEFEATED · GEAR TIER '+state.raidLevel:E.WORLDS[chapter.world].name.toUpperCase()+' · '+chapter.progress+'/10 CLEARED';
 $('camp-summary').textContent=(state.mode==='raid'?'A stronger boss awaits. Equip your new gear. ':chapter.boss?'Boss defeated. A new road is open. ':'Another fight behind you. ')+(reward.gold?'+'+reward.gold+' gold · +'+reward.xp+' XP · New gear recovered.':'Sort your gear before you set out.');
 $('camp-gold').textContent=state.gold;
 $('camp-party-summary').replaceChildren(...state.party.map(p=>{const row=element('div',{class:'camp-party-pill'});row.append(element('span',{},p.name),element('b',{},p.hp+' / '+p.maxHp+' HP'));return row;}));
 document.querySelectorAll('[data-camp-tab]').forEach(b=>b.classList.toggle('active',b.dataset.campTab===campTab));
 const content=$('camp-content'),scroll=content.scrollTop;content.replaceChildren();
 if(campTab==='loot'){
  const toolbar=element('div',{class:'loot-toolbar'});toolbar.append(element('span',{},state.inventory.length+' pieces of gear'));
  const sort=element('select',{'aria-label':'Sort loot'});for(const [value,label]of [['rarity','Rarity'],['slot','Equipment slot'],['value','Sell value']]){const option=element('option',{value},label);option.selected=value===campSort;sort.append(option);}sort.onchange=()=>{campSort=sort.value;renderCamp();};toolbar.append(sort);content.append(toolbar);
  const rank={epic:3,rare:2,common:1},items=[...state.inventory].sort((a,b)=>campSort==='rarity'?rank[b.rarity]-rank[a.rarity]||b.price-a.price:campSort==='slot'?a.slot.localeCompare(b.slot):b.price-a.price);
  if(!items.some(i=>i.id===campSelected))campSelected=items[0]?.id;
  const list=element('div',{class:'loot-list'});
  items.forEach(item=>{const owner=state.party.find(p=>p.id===item.owner),b=element('button',{class:'loot-item '+(item.id===campSelected?'selected':''),onclick:()=>{campSelected=item.id;renderCamp();}});b.style.setProperty('--rarity',E.RARITIES[item.rarity].color);b.append(element('span',{class:'loot-symbol'},item.slot==='weapon'?'⚔':item.slot==='armor'?'◇':'✦'));const copy=element('span');copy.append(element('strong',{},item.name+(item.upgrades?' +'+item.upgrades:'')),element('small',{},E.RARITIES[item.rarity].name+' '+item.slot+(item.tier?' · Tier '+item.tier:'')+(owner?' · '+owner.name:'')));b.append(copy,element('span',{class:'loot-stats'},'+'+item.atk+' ATK / +'+item.def+' ARM'));list.append(b);});content.append(list);
  if(!items.length)content.append(element('p',{class:'skill-note'},'The fire is warm. Gear drops after every victory.'));
  const item=state.inventory.find(i=>i.id===campSelected);
  if(item){
   const details=element('div',{class:'gear-details'}),select=element('select',{'aria-label':'Equip gear on adventurer'});
   state.party.forEach(p=>{const option=element('option',{value:p.id},p.name);option.selected=p.id===campHero;option.disabled=!!room&&!online.controls(p.id);select.append(option);});select.onchange=()=>campHero=select.value;
   if(room&&!online.controls(campHero))campHero=room.heroId;select.value=campHero;
   details.append(select);const equip=element('button',{onclick:()=>campChange({type:'equip',item:item.id,hero:select.value})},'Equip');details.append(equip);
   if(item.owner){const unequip=element('button',{onclick:()=>campChange({type:'unequip',item:item.id})},'Unequip');unequip.disabled=!!room&&!online.controls(item.owner);details.append(unequip);}
   const upgrade=element('button',{onclick:()=>campChange({type:'upgrade',item:item.id})},item.upgrades>=3?'Max upgrade':'Upgrade · '+(25+item.upgrades*20)+' gold');upgrade.disabled=item.upgrades>=3||state.gold<25+item.upgrades*20||!!(room&&item.owner&&!online.controls(item.owner));details.append(upgrade);
   const sell=element('button',{onclick:()=>campChange({type:'sell',item:item.id})},'Sell · '+item.price+' gold');sell.disabled=!!item.owner;details.append(sell);content.append(details);
  }
 }else if(campTab==='party'){
  state.party.forEach(p=>{const stats=E.stats(state,p),card=element('div',{class:'camp-hero'});card.append(element('h3',{},p.name+' · '+E.CLASSES[p.job].name),element('p',{},'Level '+p.level+' · '+p.hp+'/'+p.maxHp+' HP · '+stats.atk+' attack · '+stats.def+' armor'));for(const slot of ['weapon','armor','charm']){const item=state.inventory.find(i=>i.owner===p.id&&i.slot===slot);card.append(element('small',{},slot.toUpperCase()+': '+(item?item.name:'Not equipped')));}content.append(card);});
 }else{
  content.append(element('p',{class:'skill-note'},'Stock up before the next encounter. Your bag is shared by the party.'));
  const tonic=actionButton('Healing tonic · 20 gold',state.potions+' in bag · heals '+E.tonicHeal(state)+' HP','✚',()=>campChange({type:'buy-tonic'}),state.gold<20,true),ember=actionButton('Revival ember · 80 gold',state.embers+' in bag · revive a fallen ally','✧',()=>campChange({type:'buy-ember'}),state.gold<80,true);content.append(tonic,ember);
 }
 content.scrollTop=scroll;
 $('camp-rest').textContent=state.campRested?'Party rested':'Rest · fully heal party';$('camp-rest').disabled=state.campRested;$('camp-rest').onclick=()=>campChange({type:'rest'});
 $('camp-ready').hidden=!room;
 if(room){const me=room.members.find(m=>m.id===room.yourId),allReady=room.members.filter(m=>m.online).every(m=>m.ready);$('camp-ready').textContent=me?.ready?'✓ Ready':'Ready up';$('camp-ready').onclick=()=>sendRoom({type:'ready'});$('camp-continue').disabled=!isHost||!allReady;}
 else $('camp-continue').disabled=false;
 $('camp-continue').textContent=state.mode==='raid'?'Challenge raid boss '+(state.raidLevel+1)+' ↗':state.stage===29?'Finish the campaign ↗':chapter.boss?'Enter '+E.WORLDS[chapter.world+1].name+' ↗':'Next encounter ↗';$('camp-continue').onclick=travelCamp;
 const next=E.CHAPTERS[state.stage+1],raidPower=E.raidBossStats(state.raidLevel+1);$('camp-next').textContent=state.mode==='raid'?'NEXT BOSS: '+raidPower.hp+' HP · '+raidPower.atk+' ATK · Tier '+(state.raidLevel+1)+' gear'+(room?' · Everyone must ready up.':''):room?'Everyone online must ready up. The host leads the party onward.':next?'UP NEXT: '+next.name+' · '+next.progress+'/10 in '+E.WORLDS[next.world].name:'Three worlds cleared. Take a breath before going home.';
}
function renderRoomStrip(){
 const strip=$('room-strip');strip.hidden=!room||room.started;if(!room||room.started)return;
 strip.replaceChildren(element('strong',{},'ROOM '+room.code),element('span',{},room.members.length+'/3 adventurers'));
 const open=element('button',{onclick:()=>roomLobby(false)},'Invite / party');strip.append(open);
}
async function sendRoom(action){
 try{await online.send(action);}catch(error){notify(error.message);}
}
function roomLobby(locked=true){
 if(!room)return;
 showModal('<div class="eyebrow">ONLINE '+(state.mode==='raid'?'RAID':'CAMPAIGN')+' · '+escape(room.code)+'</div><h2>Gather your party.</h2><p>Share this room code with up to two friends. Each person controls one adventurer. Bots automatically play unclaimed companions.</p><div class="room-code">'+escape(room.code)+'</div><div class="room-members">'+room.members.map(m=>'<div><strong>'+escape(m.name)+'</strong><span>'+escape(state.party.find(p=>p.id===m.heroId)?.job||'adventurer')+' · '+(m.id===room.hostId?'HOST · ':'')+(m.online?'ONLINE':'OFFLINE')+'</span></div>').join('')+'</div><div class="modal-buttons"><button id="copy-room">Copy invite link</button>'+(room.started?'<button class="primary" id="room-back">Back to adventure</button>':room.yourId===room.hostId?'<button class="primary" id="room-start">Start adventure ↗</button>':'<span class="skill-note">Waiting for the host to start.</span>')+'<button id="room-leave">Leave room</button></div><p class="room-note">'+(room.storage==='local-memory'?'Local test server: this room is available only through this running development server.':'Closing or refreshing the creator’s tab closes this party. Empty slots are played by bots.')+'</p>',locked&&!room.started);
 $('copy-room').onclick=async()=>{const url=new URL(location.href);url.search='';url.searchParams.set('room',room.code);try{await navigator.clipboard.writeText(url.href);notify('Invite link copied. Send it to your friends.');}catch{notify('Share room code '+room.code+' on this same website.');}};
 if($('room-start'))$('room-start').onclick=()=>sendRoom({type:'start'});
 if($('room-back'))$('room-back').onclick=closeModal;
 $('room-leave').onclick=leaveOnline;
}
async function onlineScreen(createFirst=false){
 if(typeof createFirst!=='boolean')createFirst=false;
 if(room){roomLobby(false);return;}
 clearTimeout(lobbyTimer);const code=new URL(location.href).searchParams.get('room')||'';
 showModal('<div class="eyebrow">ONLINE CO-OP · UP TO THREE PLAYERS</div><h2>'+(createFirst?'Create your room.':'Find your party.')+'</h2><p>Create or join a room right here. Play the campaign or tackle an endless boss raid together.</p><label class="field-label" for="online-name">YOUR NAME</label><input id="online-name" maxlength="18" value="Adventurer"><div class="online-options"><label>Class<select id="online-job"><option value="warrior">Vanguard</option><option value="ranger">Wayfarer</option><option value="mage">Arcanist</option></select></label><label>Game mode<select id="online-mode"><option value="campaign">Campaign</option><option value="raid">Endless raid</option></select></label><label>Visibility<select id="online-visibility"><option value="public">Public lobby</option><option value="private">Invite only</option></select></label></div><div class="modal-buttons"><button class="primary" id="create-room">Create a room</button>'+(online.session?'<button id="resume-room">Rejoin my room</button>':'')+'</div><div class="lobby-heading"><strong>EXISTING LOBBIES</strong><button id="refresh-lobbies">Refresh</button></div><div id="lobby-list" role="status">Connecting…</div><label class="field-label" for="room-code-input">OR JOIN BY CODE</label><div class="join-row"><input id="room-code-input" maxlength="6" placeholder="ABC123" value="'+escape(code)+'"><button id="join-room">Join room</button></div><p id="online-status" role="status">Connecting to the shared room server…</p><button id="retry-connection" class="text-button">Retry connection</button><details class="server-settings"><summary>Use my deployed game server</summary><p>If your game uses a different address, paste its public website link here (for example, your link ending in .vercel.app).</p><label class="field-label" for="room-server-url">PUBLIC GAME LINK</label><input id="room-server-url" type="url" placeholder="https://your-game.vercel.app" value="'+escape(online.serverPreference)+'"><button id="save-room-server">Connect to this server</button><button id="reset-room-server">Use automatic connection</button></details>');
 let joining=false;
 const run=async(kind,joinCode)=>{if(joining)return;const name=$('online-name').value.trim();if(!name)return notify('Enter your adventurer name.');const create=$('create-room'),join=$('join-room');joining=true;create.disabled=join.disabled=true;try{if(kind==='create')await online.create(name,$('online-job').value,$('online-mode').value,$('online-visibility').value==='public');else await online.join(joinCode||$('room-code-input').value,name);}catch(error){notify(error.message);if($('online-status'))$('online-status').textContent=error.message;if(create.isConnected)create.disabled=join.disabled=false;}finally{joining=false;}};
 const list=$('lobby-list');let loading=false;
 const refresh=async()=>{clearTimeout(lobbyTimer);if(!list.isConnected||$('modal').hidden||loading)return;loading=true;try{const data=await online.list();if(!list.isConnected)return;list.replaceChildren();if(!data.rooms.length)list.append(element('p',{class:'skill-note'},'No public parties yet. Create a room to start one.'));
  data.rooms.forEach(r=>{const card=element('div',{class:'lobby-card'}),copy=element('div');copy.append(element('strong',{},r.name),element('small',{},(r.mode==='raid'?'ENDLESS RAID':'CAMPAIGN')+' · '+r.players+'/3 · '+r.status),element('small',{},r.encounter));const join=element('button',{onclick:()=>run('join',r.code)},r.joinable?'Join':'Full / fighting');join.disabled=!r.joinable;card.append(copy,join);list.append(card);});
 }catch(error){if(list.isConnected)list.textContent=error.message;}finally{loading=false;if(list.isConnected&&!$('modal').hidden)lobbyTimer=setTimeout(refresh,4000);}};
 $('create-room').onclick=()=>run('create');$('join-room').onclick=()=>run('join');$('refresh-lobbies').onclick=refresh;if($('resume-room'))$('resume-room').onclick=()=>online.resume().catch(error=>notify(error.message));
 const check=async()=>{if(!list.isConnected)return;$('online-status').textContent='Connecting to the shared room server…';try{await online.status();if(list.isConnected){$('online-status').textContent='Connected. Create a room or join a public party.';await refresh();}}catch(error){if(list.isConnected){$('online-status').textContent=error.message;list.textContent='No lobby list available until the room server connects. You can retry Create a room.';}}};
 $('retry-connection').onclick=()=>{if(!joining){online.server=null;check();}};
 $('save-room-server').onclick=()=>{try{online.setServer($('room-server-url').value);check();}catch(error){$('online-status').textContent=error.message;}};
 $('reset-room-server').onclick=()=>{online.setServer('');$('room-server-url').value='';check();};
 await check();
}
$('online-game').onclick=()=>onlineScreen();$('create-online-room').onclick=()=>onlineScreen(true);
async function leaveOnline(){
 try{if(room)await online.send({type:'leave'});}catch{}online.stop(true);clearTimeout(roomReadyTimer);room=null;remoteVersion=0;state=null;try{saved=E.restore(localStorage.getItem(SAVE));}catch{}returnTitle();renderRoomStrip();
}
online.onUpdate=(data,event,initial)=>{
 const previous=room,previousPhase=state?.phase,changed=initial||data.version!==remoteVersion;
 room=data;if(data.readyAt>data.serverNow){clearTimeout(roomReadyTimer);roomReadyTimer=setTimeout(()=>{if(!busy&&!paused&&room)render();},data.readyAt-data.serverNow+30);}renderRoomStrip();if(!changed){if(!busy&&!paused&&state?.phase==='battle')render();else if(state?.phase==='camp'&&previous?.members.map(m=>m.online).join()!==data.members.map(m=>m.online).join())renderCamp();return;}
 remoteVersion=data.version;state=data.state;$('title-screen').hidden=true;
 if(!data.started){$('game-ui').hidden=true;$('camp-screen').hidden=true;scene.setState(state,false);roomLobby();return;}
 if(initial||!previous?.started){hideModal();begin();return;}
 if(previousPhase!==state.phase&&['battle','camp'].includes(state.phase))hideModal();
 if(event){animate(event);return;}
 render();if(state.phase!=='battle'&&state.phase!=='camp')outcome();
};
online.onError=error=>{if([401,404].includes(error.status)){online.stop(true);room=null;state=null;remoteVersion=0;returnTitle();renderRoomStrip();notify('The party has closed. Create or join a new room.');return;}if(Date.now()-networkErrorAt>9000){notify(error.message);networkErrorAt=Date.now();}};
if(new URL(location.href).searchParams.has('room'))setTimeout(onlineScreen,250);
function outcome(){
 if(!state||busy||state.phase==='battle')return;save();
 const chapter=E.encounter(state);
 const outcomeKey=(state.mode==='raid'?'raid-'+state.raidLevel:state.stage)+':'+state.phase;if(lastOutcome!==outcomeKey&&['camp','complete','defeat'].includes(state.phase)){tone(state.phase==='defeat'?'defeat':'victory');lastOutcome=outcomeKey;}
 if(state.phase==='camp'){render();return;}
 if(state.phase==='complete'){
  showModal('<div class="eyebrow">THREE WORLDS · CAMPAIGN COMPLETE</div><h2>The road is<br>yours again.</h2><p>Thirty encounters behind you. Three bosses defeated. Your party has carried the fire all the way home.</p><div class="reward-grid"><div><strong>'+state.history.length+'</strong><span>ENCOUNTERS</span></div><div><strong>'+state.gold+'</strong><span>GOLD RECOVERED</span></div><div><strong>'+state.party[0].level+'</strong><span>PARTY LEVEL</span></div></div><div class="modal-buttons"><button class="primary" id="travel-next">Return to title</button></div>',true);$('travel-next').onclick=()=>room?leaveOnline():returnTitle();
 }else if(state.phase==='story'){
  const stranger=state.choice==='stranger';
  showModal('<div class="story-layout"><div class="story-art '+(stranger?'':'shrine')+'" aria-hidden="true"></div><div><div class="eyebrow">A MOMENT BETWEEN BATTLES</div><h2>'+(stranger?'The strange<br>traveler.':'An ember<br>in the dark.')+'</h2><p>'+(stranger?'“Hey. Been watching you for a while. You’ve got potential. The sort that gets people into trouble.” The traveler turns a narrow blade in the light. “Want to learn a different way?”':'A small flame burns beneath the Keep. The inscription reads: “Leave your burdens, or carry the light onward.” Mira waits by the steps. The choice is yours.')+'</p><div class="story-options"><button id="story-accept">'+(stranger?'Learn the way of the hidden blade':'Rest at the old shrine')+'<small>'+(stranger?'Your adventurer becomes a Nightblade. +3 attack, higher speed, and Hidden blade.':'Restore the entire party’s health and focus.')+'</small></button><button id="story-decline">'+(stranger?'Keep your path. Share what you learned.':'Take the ember with you')+'<small>'+(stranger?'Keep your class. Every party member gains +8 maximum health.':'+50 gold and one revival ember.')+'</small></button></div></div></div>',true);
  $('story-accept').onclick=()=>storyChoice('accept');$('story-decline').onclick=()=>storyChoice('decline');if(room&&room.yourId!==room.hostId){$('story-accept').disabled=true;$('story-decline').disabled=true;$('modal-content').append(element('p',{},'The party host is choosing the next path.'));}
 }else if(state.phase==='defeat'){
  showModal('<div class="eyebrow">A SETBACK. NOT THE END.</div><h2>The road<br>can wait.</h2><p>Your party falls back to safety. Retry this encounter at full health with at least two healing tonics. Your campaign progress stays with you.</p><div class="modal-buttons"><button class="primary" id="retry-battle">Regroup & try again ↗</button><button id="defeat-title">Return to title</button></div>',true);
  $('retry-battle').onclick=()=>{if(room){sendRoom({type:'retry'});return;}E.retry(state);hideModal();tab='fight';target=null;render();save();scheduleEnemy();};$('defeat-title').onclick=()=>room?leaveOnline():returnTitle();if(room&&room.yourId!==room.hostId)$('retry-battle').disabled=true;
 }
}
function storyChoice(choice){if(room){sendRoom({type:'choice',choice});return;}if(!E.choose(state,choice))return;hideModal();tab='fight';target=null;render();save();scheduleEnemy();}
function returnTitle(){cosmic.stop();clearTimeout(enemyTimer);clearTimeout(animationTimer);clearTimeout(impactTimer);busy=false;save();if(state){if(state.mode==='raid')savedRaid=E.restore(state);else saved=E.restore(state);}hideModal();$('game-ui').hidden=true;$('camp-screen').hidden=true;$('title-screen').hidden=false;$('continue-game').hidden=!saved;$('continue-raid').hidden=!savedRaid;scene.setState(null,true);}
function menu(){if(!state||!$('title-screen').hidden){showModal('<div class="eyebrow">CHOOSE YOUR ADVENTURE</div><h2>The hollow road.</h2><div class="menu-options"><button class="primary" id="menu-campaign">New campaign ↗</button><button id="menu-raid">Endless raid ⚔</button><button id="menu-create-room">Create online room +</button><button id="menu-lobbies">Browse lobbies ↗</button></div>');$('menu-campaign').onclick=()=>characterScreen();$('menu-raid').onclick=()=>characterScreen('raid');$('menu-create-room').onclick=()=>onlineScreen(true);$('menu-lobbies').onclick=()=>onlineScreen();return;}if(state?.phase==='camp'){showModal('<div class="eyebrow">CAMPFIRE MENU</div><h2>A little warmth.</h2><p>Your party can rest, sort equipment, and buy supplies before the next encounter.</p><div class="modal-buttons"><button class="primary" id="camp-back">Back to camp</button><button id="camp-exit">'+(room?'Leave online room':'Save & return to title')+'</button></div>');$('camp-back').onclick=closeModal;$('camp-exit').onclick=()=>room?leaveOnline():returnTitle();return;}if(state.phase!=='battle'){outcome();return;}showModal('<div class="eyebrow">CAMPFIRE MENU</div><h2>Take a moment.</h2><p>Your campaign is saved on this device. There’s no timer and no rush.</p><div class="reward-grid"><div><strong>'+(state.mode==='raid'?'RAID '+state.raidLevel:String(state.stage+1).padStart(2,'0')+'/30')+'</strong><span>ENCOUNTER</span></div><div><strong>'+state.gold+'</strong><span>GOLD</span></div><div><strong>'+state.potions+'</strong><span>TONICS</span></div></div><div class="modal-buttons"><button class="primary" id="resume">Return to battle</button><button id="menu-title">Save & return to title</button></div>');$('resume').onclick=closeModal;$('menu-title').textContent=room?'Leave online room':'Save & return to title';$('menu-title').onclick=()=>room?leaveOnline():returnTitle();}
$('pause').onclick=menu;
$('help').onclick=()=>{showModal('<div class="eyebrow">FIELD GUIDE</div><h2>Think first.<br>Then strike.</h2><p><strong>Strict turns.</strong> The highlighted fighter acts next. In solo mode you control all three adventurers. Online, each friend controls their own character; bots play unclaimed companions. Enemies act automatically, one at a time. Nothing attacks while it is your turn.</p><p><strong>Fight.</strong> Select an enemy card, then a technique. Strike is free. Stronger techniques cost focus and recover over that character’s turns.</p><p><strong>Items.</strong> Select a tonic or ember, then the ally who needs it. Using an item consumes your action.</p><p><strong>Focus.</strong> Recover up to 3 focus and take half damage until your next turn.</p><p><strong>The campaign.</strong> Win ten encounters per world, including a boss at each tenth encounter. Return to the campfire after every fight to rest, sort loot, equip and upgrade gear, or buy supplies. Defeat the Greenwood boss to enter the Ashen Dungeon, then unlock the Hollow Depths. Solo progress saves on this device; online rooms synchronize through the server.</p><p><strong>Endless raid.</strong> Every boss defeated unlocks a stronger one and higher-tier epic gear. Rest and equip at each campfire. Raids have their own solo save and support online co-op.</p><p><strong>Keyboard.</strong> 1 / 2 / 3 change tabs. Q strikes, W uses your class technique, E mends when Mira is active. Left / right arrows change target. Escape opens the menu. H hides or shows the compact controls. Mouse and touch work for every action.</p>');};
$('log-toggle').onclick=()=>{logOpen=!logOpen;$('log-lines').hidden=!logOpen;$('log-toggle').setAttribute('aria-expanded',String(logOpen));$('log-toggle').querySelector('span').textContent=logOpen?'−':'+';};
$('world').addEventListener('click',event=>{if(!state||paused||!$('title-screen').hidden)return;const possible=E.living(state,'enemy').map(u=>{const p=scene.point(u.id);return {id:u.id,distance:p?Math.hypot(p.x-event.clientX,p.y+30-event.clientY):Infinity};}).sort((a,b)=>a.distance-b.distance);if(possible[0]?.distance<65)selectTarget(possible[0].id);});
addEventListener('keydown',event=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;if(event.key==='Escape'){event.preventDefault();if(!$('modal').hidden)closeModal();else menu();return;}if(!state||paused||!$('title-screen').hidden||event.repeat)return;const key=event.key.toLowerCase();if(key==='h'){event.preventDefault();toggleDeck();return;}if(['1','2','3'].includes(key)){event.preventDefault();setTab({1:'fight',2:'items',3:'focus'}[key]);}else if(key==='arrowleft'||key==='arrowright'){event.preventDefault();const enemies=E.living(state,'enemy'),index=enemies.findIndex(e=>e.id===target);if(enemies.length)selectTarget(enemies[(index+(key==='arrowright'?1:-1)+enemies.length)%enemies.length].id);}else if(canAct()&&['q','w','e'].includes(key)){event.preventDefault();const actor=E.active(state),skill=key==='q'?'strike':key==='w'?E.CLASSES[actor.job].skill:actor.id==='mira'?'mend':null;if(skill)perform({type:'skill',skill,target});}});
addEventListener('beforeunload',save);
})();
