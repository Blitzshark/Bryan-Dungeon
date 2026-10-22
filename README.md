# Bryan’s Basement

Bryan’s Basement is a turn-based, block-world adventure for solo play or up to six online players in two rows of three. Choose any of three campaigns in Begin your journey or Create room. Each has three fixed ten-encounter sections: Greenwood, Hollow Depths, Void & Hell, Ocean, Corsair Ship, Jade Jungle, Cloud Gardens, Thunderhead Reach and Sunspire Zenith. Enemies, loot, bosses, choice encounters and occasional individual buffs or weaknesses vary. Every tenth encounter is a boss; each fight ends at camp. Routes persist on reload and are shared by online party members. The right-side directory shows currently connected players on the same server.

## Playing

- Begin a solo journey, choose **Create room**, or **Browse lobbies** inside the game.
- Browse existing public lobbies, or create a campaign/raid room. Choose public
  visibility to appear in the browser, or invite-only for a private party.
- Create a room, copy the invite link, and send it to up to two friends.
- Each player controls their adventurer. Bots automatically take turns for empty
  character slots, using attacks, healing, revives and focus. The host starts
  the campaign. The invite strip is hidden during matches.
- Every encounter ends at a campfire. Rest, sort loot, equip or upgrade gear,
  sell unequipped items, and buy healing tonics or revival embers.
- In online rooms, everyone online must ready up before the host travels onward.
- Closing or navigating away from the creator’s tab deletes the party. Other
  players return to the title. Guest departures free a slot for a bot. The
  browser sends a version-independent authenticated keepalive/beacon; if that
  request is lost, the party expires after the creator misses 45 seconds of
  heartbeats. Refreshing the creator’s page also closes the party. Offline
  characters receive bot turns after 15 seconds while the party is still alive.
- Storage has a 24-hour cleanup TTL, but creator leases prevent closed parties
  from being rejoined. Solo saves are local to this
  browser. The earlier eight-encounter saves migrate without erasing progress.

## Vercel hosting

`vercel.json` explicitly builds static game files into `public/` and publishes the
serverless `/api/rooms` function. This avoids serving the old Express health
message as the homepage. The existing Git integration can deploy pushes to main.

Online rooms require shared Redis storage because Vercel function instances do
not share process memory. In the Vercel project:

1. Open **Storage → Create Database → Upstash Redis**.
2. Connect it to **Production** and **Preview**, keeping credentials sensitive.
3. Keep the integration’s default environment variable names.
4. Deploy the latest commit, then click **Visit** on the newest deployment.

The server reads `KV_REST_API_URL` and `KV_REST_API_TOKEN`, or the equivalent
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. These are server-only
variables; do not add them to browser JavaScript. See `.env.example` for names.
If Redis is missing, online room creation returns a clear setup message. Solo
play still works. Vercel does **not** fall back to unreliable process memory.

GitHub Pages hosts both solo modes and connects to the shared room backend
inside the game. The client tries a same-origin API first, then the project's
Vercel branch domain. Players never need to open a hosting dashboard. The API
allows cross-origin JSON requests with bearer tokens; credentials stay on the
server. Public listings show only party names, mode, occupancy and progress.
Inactive parties disappear from listings after 30 seconds; invite-only rooms
are never listed. Listings refresh every four seconds.

Any Node/Express host can run `npm start` for shared rooms without Vercel. Local
development uses memory; Vercel requires the Redis REST variables above. Railway supports native `REDIS_URL` and a single-server memory fallback; see [RAILWAY.md](RAILWAY.md).
To use another backend for a static frontend, define `window.HOLLOW_ROAD_SERVER`
before `multiplayer.js`, or use **Use my deployed game server** in the room
screen and paste the public HTTPS game link. The saved server choice applies
to this browser; all players must use the same backend. The Create Room button
can retry after a failed connection, with a separate Retry connection action.
A deployment alone does not configure shared storage; a missing Redis binding
or protected deployment is reported on the room screen. Shared online
play always requires a reachable server; static files alone cannot share rooms.

## Endless raid

Open the **☰ menu → Endless raid** for solo, or select it when creating an online room.
Each victory goes to camp and unlocks the next boss. Three exclusive giant entities are drawn in shuffled bags
without consecutive repeats, each with 55 attacks; boss health and attack strictly increase each wave.
Every boss drops two epic items whose base stats and tier grow with raid level.
Party levels, healing tonics and gold rewards also scale. Equip, upgrade, sell,
and buy supplies at every campfire. A party wipe ends the survival run; there is no final raid wave.
Solo raids and campaigns use separate saves; starting one does not replace the
other. Online raids use the same turn ownership and ready checks as campaigns.

## Development and checks

Use Node.js 24:

```sh
npm install --package-lock=false
npm start
npm test
npm run build
```

The local server defaults to port 8080 (`PORT` can override it). Root and `/play`
serve the game. `/api/rooms?status=1` reports online-room readiness. Development
uses a clearly identified in-memory room store, shared by browsers connected to
that local server. Restarting the development server clears local online rooms.
Set Redis variables if you need persistent shared rooms in development. The game
has no external frontend libraries, assets, sound downloads, or font requests.

The tests cover generated ninety-encounter routes across many seeds, randomized bosses, campfires, equipment,
status effects, save migration, multiplayer ownership, concurrent enemy ticks,
ready checks, reconnect handling, and the Redis REST/lock protocol. Browser
validation additionally uses three isolated player sessions, actual shared
battles, campfire interactions, mobile layouts, and every creature mesh.

## Combat and controls

Each living fighter gets one action per round in speed order. Human players
have 20 seconds to choose; AI companions act automatically. Enemies take individual server-driven turns in online rooms.
Strike is free; stronger skills cost focus and recover on the owner’s turns.
Focus restores 3 focus and halves incoming damage until the next turn. Poison
lasts two actions; armored enemies guard; healers aid their allies; chargers
telegraph heavy attacks; some enemies drain life or sweep the party.

Melee fighters walk to the target, swing, and retreat. Enemies flash red on
impact and damage counters float above them. Melee swings rotate the weapon
and striking arm, including a wind-up, follow-through, and return to formation.
Each class has its own named, animated basic attack; purchased weapons provide separate Arts. Archers draw and release
projectiles; casters raise their staff and cast bolts. Hits, healing, guard,
poison, and campfires have effects. Sounds are synthesized locally. Reduced
motion reduces bobbing and camera movement while retaining readable melee approaches.

Name inputs support select-all, delete, and replacement. Dragging selected text
outside the input does not dismiss the setup dialog.

An adventurer named **Bryan** (case insensitive) gains **Universe cleave** in
the Fight menu. Its nine-second, text-free cutscene pulls away from Earth into
the galaxy, then the universe, before the cut and explosion. The combat HUD is
hidden throughout; ten-million damage counters appear on return to the battle.
The full action reserves ten seconds on the server. Reduced motion uses fixed
framing rather than a fast zoom.

## Tavern, characters and abilities

- Press **Tavern** from the title screen or at camp. Tavern visits are blocked
  during combat. Visitors exchange movement directly over WebRTC data channels at 30 Hz after authenticated HTTP signaling. STUN helps establish peer connections; no TURN relay is configured. Networks or browser policies that block direct traffic fall back to HTTP snapshots with smooth interpolation. Real network latency still applies.
- **WASD**, arrow keys, clicking the floor, or the touch direction pad move your
  character through the Wandering Ember. The hearth, idle NPCs, tables, rugs,
  and quartermaster are rendered locally. Nearby visitors appear through the
  same shared backend as rooms. Other players are slightly translucent (86%
  opacity); local characters and NPCs stay opaque. Timestamped movement samples
  are interpolated with a short buffer, smooth facing, and bounded prediction
  during missing updates. An unavailable backend leaves a usable offline
  tavern and shop with a visible connection status. Visits reconnect automatically
  after expiry; rejected movement resynchronizes to the shared position.
- Walk to **Alden behind the bar** and press **E** or **Talk to Alden**. Buy and
  equip classes, weapon types, and races. Your profile starts with **150 welcome
  gold**. Victories earn additional tavern gold, separate from the party’s camp
  bag. Reward credit is tracked per run so reloads do not award it twice.
- There are **6 classes**, **5 races**, and **8 weapon types**. Every class and
  race has its own ultimate; every weapon has its own attack. **Arts / 2** shows
  them. Ultimates require 100 charge: actions grant 25 and incoming hits grant
  15. Weapon techniques use focus and turn-based cooldowns. Loot weapons retain
  the technique of their weapon type.
- Humans earn 10% extra tavern gold; elves regain focus each turn; dwarves take
  2 less damage per hit; revenants heal for 15% of attack damage; dragonborn gain
  3 attack. Ultimates include party healing/guarding, single-target executions,
  area attacks, and burning damage. Special weapons can burn, chill, guard, or
  siphon health.
- **Menu → Customize character**, or the tavern’s **Customize** button, edits
  name, starting clothes, skin, trousers, hair color/style, face, and outfit.
  Choose **Draw your own face** for a touch-friendly 16×16 pixel editor with
  colors, eraser, undo and clear. Choose **Default** to keep the original face.
  Drawings are saved locally and shared with other tavern visitors.
  The preview updates immediately. Appearances are visible in the tavern and
  combat. Changes apply to a current run at camp, or to a new run; mid-battle
  purchases apply when the build is next loaded at camp or in a new journey.
- NPC companions now receive generated names, classes, faces, hair, and clothing
  when a party is created or an empty slot receives a new companion. IDs stay
  stable for equipment ownership. Multiplayer friends use their own profiles.
- Profiles and unlocks persist in this browser without an account. They are
  imported on a tavern visit; purchase deductions and equipment ownership are
  validated within the shared visit. This is a cooperative game with local save
  files, not a server-held competitive economy or cross-device account system.

Mouse/touch supports every action. Keyboard: 1 / 2 / 3 switch Fight / Arts / Items; Q strikes; W uses
the active character’s technique; E mends with a spellcaster; arrows select targets; H
folds the bottom controls; Escape opens the menu. The music-note button mutes.

## Main files

- `campaign.js`: seeded combat, randomized companions, abilities, worlds and loot.
- `hero-options.js`: profiles, appearance validation, classes/races/weapons and shop.
- `tavern.js`, `lib/tavern.js`: walkable inn, shop, shared visitor presence.
- `motion.js`: buffered remote-player interpolation and smooth turns.
- `scene.js`: block-world arenas, enemy models, campfire, walking and VFX.
- `game.js`: battle menus, camp UI, room lobby, progression and local saving.
- `multiplayer.js`: authenticated room sessions and synchronized client updates.
- `cosmic.js`: Earth-to-universe cinematic and final explosion.
- `sound.js`: synthesized battle and interaction audio.
- `api/rooms.js`, `lib/rooms.js`, `lib/room-store.js`: authoritative room API,
  ownership, distributed locking, session validation, and persistent storage.
- `scripts/build.js`, `vercel.json`: static output and Vercel function routing.

### Combat and camp update

- Regular campaign enemies have 65% more health and 25% more attack. World
  bosses fight alone with larger health pools; the Hollow King has over 1,400 HP.
  Raid bosses keep their separate endless scaling.
- Chance decisions appear at generated positions between fights; their number and content vary by run.
- Melee attacks walk into contact, wind up, hit, and return. The attack keeps
  its target location even when position history is unavailable, and walking
  remains visible with reduced motion (without foot bobbing).
- At camp, choose a character and press **Equip best gear**, or directly equip
  an item with its stat comparison visible. Upgrade and sell are under each
  item's expandable controls. Traveling preserves health. Resting consumes one ordinary stage and fully
  heals; it cannot skip a boss. Healing items can also be used at camp.
  Online players can only equip characters they control.

### Timed turns and attack presentation

- You control your own adventurer; solo AI companions choose and perform their
  actions automatically. Online friends retain control of their characters.
- Player turns and story choices have a visible 20-second countdown. Expiry
  chooses a random legal action or path. Online deadlines are stored and
  resolved once by the shared server, including when a late command arrives.
- Health bars and defeated poses update at impact instead of when an attack
  is selected. Gameplay state remains authoritative during the visual wind-up.
- `combat-fx.js` defines attack-specific motion, palette and effects: crescents,
  spinning cleaves, piercing arrows, lightning, ice shards, flame plumes and
  magic charge circles. Charged class/race ultimates add brief cinematic camera
  movement and framing. Universe Cleave keeps its separate cosmic cutscene.

### Rest, story scenes, transitions and sound

- Victories and level-ups never heal or revive the party. Story stat rewards
  increase maximum health without restoring current health. Shrine medicine
  grants consumable tonics. Camp tonics and embers consume the same inventory
  as battle items; continuing gives no healing.
- A camp rest heals everyone and spends the next ordinary campaign stage,
  earning no battle rewards for that stage. It is unavailable immediately
  before a mandatory boss, at the final camp, and in endless raids (use items).
  Only the online party host can commit this shared progression cost.
- The Focus category is removed; Fight, Arts and Items use keys 1, 2 and 3.
  Guard & focus remains a technique in Fight.
- Story decisions play a short group scene showing supplies or practice.
  Entry and victory get marching scenes; world changes pass through a gate
  as the scenery changes. Online room timing reserves the transition before
  enemies or the next player decision can begin.
- Synthesized audio includes footsteps, portal swells, story chimes, campfire
  rest tones, attack-specific accents and a subtle echo. The sound button
  controls these effects as well as combat audio.

### Loot, confirmations and hit feedback

- **Sell junk** sells every unequipped item for its listed price and preserves
  all equipped gear. In online rooms only the host sells the shared bag.
- Gear displays Common, Rare or Epic rarity, enchantments and its linked weapon
  technique. Keen adds critical chance, Precise improves accuracy, Mighty adds
  attack and Sturdy adds armor.
- Humans choose equipment first and press **Confirm equipment**. After every
  online human confirms, bots equip the strongest remaining gear and confirm.
  Solo confirmation does the same for both companions. Camp changes revoke
  confirmation; the party host leads travel once everyone is ready.
- Player and enemy hits have an 8% miss chance and 3% critical chance before
  equipment modifiers. Crits multiply raw damage by 1.6 and show a yellow marker.
  Damage/healing numbers can be toggled with **Settings (⚙)** and are remembered
  on the device. Miss labels and the yellow impact mark remain visible.
- Defeated enemies dissolve into ash. Universe Cleave burns them in purple fire
  before the dust disperses; its cosmic cutscene and guaranteed damage remain.
- The third world blends void and hell: obsidian stone, violet rifts and floating
  fragments, glowing lava fissures, and ember particles.

### Underwater areas

Coral Reef, Shipwrecks and Deep Sea are three of the biomes that can appear anywhere in a generated route after the moss opening. Seventeen marine species have their own geometry. Their possible bosses include the Coralback Matriarch (a giant reef crab), Keelbreaker (a wreck-armored kraken), and Hadal Devourer (a giant deep-sea anglerfish), drawn in varying order. Bright coral beds, broken ship hulls, and hydrothermal vents have seeded scenery variation.

Marine combat introduces Soaked (electric damage +30%), Ink (22% miss chance), and Pressure (1 focus lost after acting). Guard & focus clears ink and pressure. Nine underwater rescue, salvage and beacon choices replace caravan/training events. Marine weapon loot grants Brine Impaler, Stormline Harpoon, Inkveil Riposte or Bathyal Toll. Camps use an air-filled diving bell with a heater. Existing saves keep the current encounter, party, equipment and living summons while acquiring a random future route.

### Ability cards, warp, and raid entities

**Menu → Ability cards** and the tavern's **Ability cards** button open the collection. Buy cards using personal tavern gold and equip up to three. They appear under Fight. Builds apply at camp or on the next journey. Summon: Knight costs 3 focus, creates a medium-health armored companion with Taunt, and begins its four-turn recovery only when the knight dies. The knight acts automatically and persists between fights without free healing. Other cards provide a shield, burning lance, ice bloom, life siphon and meteor.

Bryan can **Warp jump** from the battle bar to either campaign and any of its 30 encounters, with no rewards or healing. Online authorization uses the authenticated member's actual name.

Endless Raid uses the Star-Eating Maw, Abyssal Cathedral, and World Furnace, which never appear in campaign rosters. Their 55-move repertoires cycle without repetition and mix direct hits, creature summons, three-round arena domains, hallucinations, and 7.4-second themed annihilation films. Inferno burns after actions, undertow drains focus, and gravity weakens party attacks. The status inspector explains effects and lists every enemy's repertoire. Reduced motion avoids flashing and rapid cinematic movement.

Story choices use six distinct action sequences: the blade lesson, formation
drill, wagon supply handoff, paired sparring, shrine medicine gathering and
ember procession. Each has its own movement, staging and props.

Critical attacks now receive cinematic framing, a brief camera push and one
short contrast impact beat. Reduced motion omits the contrast beat and camera
movement. Bryan now uses the same accuracy and critical-hit rolls as other characters;
there is no name-based guarantee. False images can still absorb a hit. Universe Cleave remains exactly 10,000,000 damage per enemy.

### Critical close-ups, clear counters and scarce shared gold

- Critical hits use a dedicated 2.4-second close-up: wind-up, giant strike,
  contrast impact frames and large yellow **CRITICAL HIT** beside the victim.
  Numbers appear above the cinematic at the actual hit. The old hidden-number
  preference resets to visible once; Settings can still disable numbers.
- Misses show a large **MISS — NO DAMAGE** banner and the target dodges.
  Categories now read **Fight / Arts / Items**, bound to **1 / 2 / 3**.
- The first thirty encounters have a total shared-gold minting budget of 200 across
  victories, offerings and gear sales, even if all rewards are hoarded. Normal
  victories award 4, bosses 12, and ordinary loot sells for 2–4. First-campaign
  tonics cost 1, revival embers 6, and upgrades start at 5. Spending does not
  refill that minting budget. Personal tavern funds remain separate.
  Later encounters and raids keep their own economies. Old first-campaign gold and
  gear sale values migrate to the lower scale on save load.

### Versions and device animation preferences

Every build now derives a deterministic release ID from the game assets and
server code. The ID appears in the bottom-left version button and Settings.
The HTML and every asset use that same ID; building identical source twice
keeps the same ID. `version.json` is checked without caching at startup, when
the tab becomes visible, and once a minute. Updates show a badge rather than
interrupting play. Vercel and the development server revalidate cached files.

**Settings → Save & reload latest version** saves progress and reloads with
a fresh page URL; it preserves local saves and appearance. Reloading closes
an online party. Saves are specific to the website, so compare the website
and build shown in Settings when two devices differ. Immutable old Vercel
deployment links remain old deployments; use the current connected game URL.

**Settings → Animations** supports device preference, full animations and
reduced motion. Changes apply immediately to every scene and persist locally.
Fire moves gently even in reduced mode, and enabled damage numbers stay
visible; full mode enables camera motion and impact frames regardless of
the operating-system preference.

### Hit fades and Bryan’s encounter skip

Damage, healing and miss text stays readable briefly, then fades out over
550 ms before removal. The fade works with full and reduced motion alike.
Base critical chance is now 3% for both sides; Bryan has no accuracy or
critical bonus. Universe Cleave retains its separate cosmic attack behavior.

An adventurer named **Bryan** (case-insensitive) sees **Skip this encounter**
during battle. It advances directly without gold, loot, XP, healing or a
victory entry. This optional shortcut can skip bosses and finish the final
stage, including later areas and raids. In online rooms the server checks
the authenticated character’s actual name; it cannot be forged by sending
another character ID. Skip waits until the current animation finishes.

### Compact controls and Knight arrival

Full animations are the default for a new browser; explicit saved motion preferences still apply. The decision countdown sits beside turn order, and fighter details open by clicking an initiative entry. The permanent name/race strip and action-deck footer are removed. Miss labels are compact and fade normally. Base critical chance is 3%, with Keen adding four percentage points.

Summon: Knight reserves a synchronized 3.6-second arrival cutscene: a portal opens, the knight rises beneath a shield emblem, and every standing enemy displays a temporary exclamation mark and turns toward it. The most recently summoned living knight draws enemy attacks; when it dies, another living knight can take over Taunt.

### Persistent summons

Living Oathbound Knights are rendered at camp and in every travel/story transition, and retain their identity and current HP across battles and reloads. The camp summary shows their health and a tonic button, authorized to their summoner online. Paid stage-consuming rest also heals living summons. They scale with their owner's level without free healing; only death removes them and starts the card cooldown.

### Random routes and persistence

`routes.js` uses a separate seeded generator for area order, enemy groups, boss draws, variant stats, scene layouts and chance events. Combat and loot rolls do not consume the route generator. The opening moss encounter remains identical across seeds. Enemy stats scale by progression rather than their original campaign, so deep-sea creatures can appear early without late-game damage. Swift groups gain speed; armored groups gain health. Marine regions draw their own creatures and marine story cards. Raid-only entities never enter expedition rosters.

The route is stored on the run and server-held online room. Continuing after the thirty-encounter checkpoint follows the same generated route through the remaining areas. Bryan's warp selector lists encounters 1–30 and 31–60 from that route. Existing saves pin their current encounter and randomize the future; malformed routes are rejected. New runs get new routes, while retries, saves, reloads and reconnects retain the existing draws.

## Party choices, chat and unequipping

Story encounters use one vote per connected player. Players can change their vote
until everyone votes or the 20-second deadline. The highest count wins; ties and
empty ballots are random. Bots follow the result. Simultaneous votes count even
when players have slightly different room versions.

Press `/` or tap **Chat /** to open chat, **Enter** to send, and **Escape** to close.
Inside a party, messages stay within that authenticated room. Outside a party,
public chat is shared by people connected to the same game server. Chat does not
pause battle or voting timers. Messages are limited to 240 characters.

At camp, equipped item cards have a direct **Unequip** button. Removed gear stays
in the shared bag until it is equipped again, claimed by a companion, or sold.

## Guilds and chat history

Open **Guilds** from the menu to create a guild, choose a banner, request to join
another guild, inspect members' equipment, or browse the top 100. Guild leaders
approve requests, rename the guild, change its banner, remove members and transfer
leadership. Each account belongs to one guild, with up to 50 members. A leader must
transfer leadership before leaving unless they are the last member.

Guilds use the existing persistent account store. Rankings start from verified
online victories earned after this update: 100 points per raid boss, 25 per
campaign boss, 10 per highest completed stage in each of the three campaigns,
and 20 per highest raid level. Shared victories count once per guild, and
repeated reward requests cannot add points. Using Warp, Skip or Universe cleave
makes that room's run unranked. Equipment views show the member's last verified
online loadout and currently equipped cosmetic skins. Solo saves do not award
leaderboard points.

Chat opens at the newest message. Public and party histories retain at most 40
messages for up to 20 minutes; polling removes expired messages from storage.

Trade selection and review screens show rendered skin thumbnails and an enlarged
character preview. Returning from a preview preserves the trade draft. The
currency is called **Shards**. The authenticated Bryan owner account has an
unlimited shard wallet, enforced on the server for purchases and trades; the UI
shows ∞. A guest or ordinary account named Bryan receives no currency privileges.

Campaign selection starts with Campaign 1. Defeating its final guardian normally
unlocks Campaign 2; clearing Campaign 2 unlocks Campaign 3. Locked journeys are
shown but disabled in solo and room selectors, and locked lobbies cannot be
joined. Unlocks persist in the local profile; verified online victories also save
access on the signed-in account. Existing saves retain earned access when their
history records all three campaign guardians. Warp, Skip and Universe cleave do
not earn new campaign unlocks, and do not remove access earned previously.

The authenticated Bryan owner is exempt from campaign locks and automatically
unlocks every class, race, weapon, card, accessory and almanac entry. Every
cosmetic skin is granted once, including newly added catalog skins on future
syncs. Disabling special combat powers does not disable these unlocks or the
unlimited shard wallet. Other accounts still earn campaign access normally.
