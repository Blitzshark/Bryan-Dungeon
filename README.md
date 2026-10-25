# Bryan’s Basement

Bryan’s Basement is a turn-based, block-world adventure for solo play or up to six online players in two rows of three. Choose from five campaigns, unlocked through normal progression, in Begin your journey or Create room. Each has three fixed ten-encounter sections: Greenwood, Hollow Depths, Void & Hell, Ocean, Corsair Ship, Jade Jungle, Scorchglass Desert, Fulgur Canyon, the Buried Sun Temple, Frostwake Wilderness, the Singing Depths, Aurora Bastion, Lanternfen, Gearhaven and the Heartforge. Enemies, loot, bosses, choice encounters and occasional individual buffs or weaknesses vary. Every tenth encounter is a boss; each fight ends at camp. Routes persist on reload and are shared by online party members. The right-side directory shows currently connected players on the same server while in the menu.

## Playing

- Begin a solo journey, choose **Create room**, or **Browse lobbies** inside the game.
- Browse existing public lobbies, or create a campaign/raid room. Choose public
  visibility to appear in the browser, or invite-only for a private party.
- Create a room, copy the invite link, and send it to up to five friends, depending on the selected room size.
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
  human confirms, the party may depart. Bots equip the strongest remaining gear only on departure. Bot-worn gear remains available for players to reclaim at camp, and disconnected human slots retain protected ownership.
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

Marine combat introduces Soaked (electric damage +30%), Ink (22% miss chance), and Pressure (1 focus lost after acting). Guard & focus clears ink and pressure. Nine underwater rescue, salvage and beacon choices replace caravan/training events. Marine weapon loot grants Brine Impaler, Stormline Harpoon, Inkveil Riposte or Bathyal Toll. Camps use an air-filled diving bell with a heater. Existing saves keep the current encounter, party, equipment while acquiring a random future route.

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

### Encounter summons

Summoned allies last only until they die or the current encounter ends. They do
not appear at camp or carry through travel, retries, world changes or raid bosses.
A battle save retains living summons for that same encounter. Death starts that
card’s cooldown during battle; a new encounter resets ability cooldowns. Older
camp saves are cleaned up automatically.

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

Basic attacks follow the equipped weapon, including weapons equipped from loot:
staffs cast magic, bows fire projectiles, and melee weapons use swings. Their
class-specific ability IDs and saved keybinds stay unchanged; names and elemental
feedback match the weapon. Basic attacks remain free. Ranged critical-hit films
also retain casting or shooting rather than running up for a melee strike.

Stats & builds is available from the title, tavern, settings and camp. Each
adventurer starts with 12 spendable points and earns 2 per level (110 at level 50).
Twelve attributes support weapon damage, survivability, focus, healing, items,
ultimate charge and summons. Individual attributes cap at 20; Discipline caps at
16. Respecs are free and apply at camp or to the next journey, never during an
active fight. Raising maximum health or focus does not restore either resource.

Copy build code exports a `BB1` code containing stats, class, race, starter weapon
and up to three ability cards. Preview import reviews a build before applying it.
Codes grant no unlocks, loot, levels or currency. Higher-level plans activate only
the point budget earned by the receiving adventurer, growing as they level up.
Equipped loot still overrides the starter weapon. Summon bonuses do not extend a
summon's single-encounter lifetime.

Campaign room creators can choose 3, 4, 5 or 6 total adventurer slots. Unclaimed
slots are controlled by bots; joining players replace those bots without expanding
the selected capacity. Existing rooms default to their saved roster size. Summons
use distinct party formation positions, filling separate lanes before extra rows,
rather than gathering around the summoner; arrival effects use the same positions.

Each of the nine campaign maps now has its own three voting encounters (27 total),
with distinct dilemmas, reward pairs and animated props/actions for both choices.
Story pools shuffle without repeating until all three have appeared. Existing
saves upgrade future generic encounters while keeping an active vote unchanged.
Maximum-health rewards never heal. Jungle combat takes place on a continuous dirt
and grass clearing, with trees, vines and ruins around its perimeter.

Campaign guardians use themed entrance choreography and physical reveal effects.
Moving bosses face their approach direction and finish facing the party. The
Sunstone Colossus begins as scattered stone, assembles its actual body pieces,
then awakens beneath a bright canopy sunbeam. Its entrance and the Admiral's
wreck reveal reserve three seconds on both clients and the multiplayer server;
other campaign entrances remain short, and raid journeys keep their own timing.

Critical hits apply to melee, ranged and magic damage without changing critical
chance. Critical attack films use the move's effect profile, element, attack
motion and projectile pattern: ranged fighters stay at range, while melee moves
use their own rush, leap, spin or thrust. Each technique has a deterministic
camera/effect recipe. Critical hits inside existing guardian, ocean and raid
signature films keep that film and add the impact frames and yellow label.
Health and floating damage still update at impact; reduced motion keeps the
critical label without flashing impact frames or camera movement.

Campaigns three and four now use grounded landscapes: desert → storm canyon → buried sun temple, then snowy wilderness → underground crystal caves → a walled aurora fortress. Their active pools contain 36 ordinary creatures and 24 campaign-only bosses, each with a distinct model and native-element attack kit (three moves per creature, eight per boss). Six region mechanics appear in a compact expandable battle label:

- Desert heat costs up to eight HP after attacking; guarding avoids it.
- Canyon static discharges every third action; guarding grounds the charge.
- Temple sunlight boosts Light attacks on odd rounds and Shadow attacks on even rounds.
- Winter cold drains focus every third action; guarding resets exposure.
- Crystal resonance punishes repeating the same damaging ability consecutively.
- Bastion wards reduce the first elemental hit each round; physical attacks break them.

Campaigns one and two, camps and raid mode have no ambient region hazards. Saved runs migrate upcoming later regions without resetting party health, gear, gold or completed encounters. Regional choices, travel scenes, boss reveals, atmosphere and loot names follow the new themes.

Regular campaign enemies gain additional durability to keep pace with equipment:
campaign one ramps to +35% HP and +10% attack, campaign two from +65% to +100% HP
and +15% to +25% attack, and campaign three from +130% to +180% HP and +30% to
+45% attack. This grows smoothly over each campaign before party-size HP scaling.
Mutations retain their effects. The moss tutorial, campaign bosses and raids keep
their separate balance. Existing fights retain their saved HP and attack values.

The almanac derives its catalog from current campaign regions, campaign bosses,
raid bosses and raid-summoned species. Retired enemies kept for legacy save
compatibility do not create entries or completion requirements. Old discovery and
completion lists are pruned on load; owner unlocks include only the active catalog.

Almanac attacks describe their actual targets, percentage of enemy Attack,
resolved element, on-hit status durations and consequences, focus loss, guarding,
life drain, reinforcement limits and five-round domain hazards. Fighting habits
explain behavior-dependent charging, sweeps, healing and guards. Descriptions use
the combat data rather than generic attack flavor text; undiscovered entries keep
these details hidden until the species is encountered.


The Pale Frontier is campaign four: Frostwake Expanse → the Singing Geodes →
Aurora Citadel, with thirty encounters, twelve ordinary species, nine possible
campaign guardians, regional choice events, themed equipment and three new maps.
It unlocks after a legitimate sky completion; the authenticated Bryan owner has
immediate access. Existing three-campaign saves append the new route without
replacing previous encounters or healing the current party.

Raids now include thirteen species. Added bosses are the Immortal Snail,
Salt-Crowned Hydra, Obsidian Empress, Lantern Matriarch, Walking Cathedral,
Root of All Hunger, Iron Millipede and Pale Comet. Each has a distinct body and
journey; the seven non-snail additions have full themed raid repertoires and
domains. The special snail has 31 attacks, including:

- Roll: party-wide shell impact; each successful hit has a 10% chance to Daze.
  Daze consumes exactly the affected unit's next turn.
- Saw: a heavy single-target teeth strike.
- Goopy Slime: small party damage plus 25% less outgoing damage and armor for
  two actions. A visible green coating follows the status.
- Shell ricochets, radula sweeps, acid spit, mucus veils, guarded shell strikes,
  draining bites, focus-draining suction, and sticky moss attacks.
- Garden of Ages transforms the arena into a slime garden for five rounds;
  acting adventurers receive the two-action goo debuff.
- Immortal Spiral and Shellfall are signature cinematic attacks, spaced by
  ordinary attacks using the standard raid cinematic cooldown.

Summon Taras is retired. Old saves discard its queued move and summoned Taras
minions while preserving adventurer health and the current turn.

The snail remains defeatable despite its title. Taunt still redirects enemy
attacks, including its party-wide moves, to the active knight. Raid progression,
loot scaling and existing cinematic spacing remain in place.

### Encounter variety

Ordinary campaign fights now draw from a seeded, non-repeating regional bag of six conditions: Crossfire, Wild Magic, Last Stand, Focus Well, Ambush, and Champion Pack. Regions retain their fixed scenery. The opening moss fight and boss fights keep their existing rules. Existing saved fights remain unchanged; conditions begin when entering the next fight.

Optional objectives reward fast victories, conserving healing items, or finishing with everyone standing. Success grants one extra equipment drop and a tonic; champion packs grant the same bonus even if the objective is missed (the rewards do not stack). Neither objectives nor conditions grant automatic healing or extra gold. The compact battle-rules button explains the condition and objective on desktop and mobile, and camp confirms bonus loot. Conditions and item-use progress persist in multiplayer state and saves.

### Lantern Exchange refresh

The trading hub is a lantern-lit market over a canal, with striped stalls, labeled shopkeepers, flower boxes, benches, and an animated fountain. WASD and the touch pad use smooth acceleration and turning; fountain and stall collision prevent walking through the central structures. NPC interaction remains E or the nearby talk button.

Hub visitors now reuse TavernLive peer movement and TavernMotion snapshot interpolation. Authenticated, recipient-only hub signaling establishes movement channels; when a direct connection is unavailable, bounded snapshot interpolation uses 200 ms polling. Established peer connections use one-second membership heartbeats instead. Leaving closes peers and clears interpolation buffers. Reduced-motion settings suppress idle motion and particles. The new renderer is included in both Railway and Vercel builds.

### Permanent equipment

Permanent gear is a separate collection from temporary campaign loot. Buy the 36 named pieces with shards in **Permanent gear → Shop permanent gear**, or earn them from verified online raid boss victories. Later raids can award higher rarities; duplicate permanent drops award 10 extra shards. Bryan automatically owns every piece.

Equip one weapon, armor, and charm before departure. Their bonuses remain active alongside temporary run equipment; run loot and camp upgrades never become permanent items. Permanent upgrades are purchased separately with shards, up to three times per piece. The collection holds up to 120 pieces and signed-in account storage verifies ownership, purchases, upgrades, and raid claims. Loadout changes apply to the next run or an unstarted room. Permanent weapon arts remain available when a temporary weapon is equipped.

Previously copied campaign gear is preserved in a legacy backup, separate from the active permanent collection. Existing runs keep their equipment. Permanent gear is also separate from tradable cosmetic skins.

### Simple builds

The build screen has four stats: Power, Toughness, Speed, and Focus. Choose Balanced, Damage, Tank, or Support to distribute points automatically, or use the four plus/minus controls. Press **Save build** to apply. Changing class, race, weapon, and cards, plus sharing/importing codes, are collapsed by default. Existing BB1 build codes still work; imported allocations fit the current level's point budget. Adding maximum health does not heal an active adventurer. There is no future-level planner: applying or restoring a build trims both stored and active allocations to the adventurer’s actual level budget. Excess points from old plans or imported codes are discarded; leveling creates unspent points for manual allocation.

### Custom heraldry and arsenal expansion

Guild leaders can choose any six-digit base, pattern, and symbol color, 12 patterns, 4 banner silhouettes, and 18 symbols (or none). The Custom pattern opens a 16×16 pixel editor with palette, eraser, undo, clear, and live banner preview. Drawings, colors, and shapes persist with the guild and render in its profile and leaderboard. The server validates the color strings, pixel data, and pattern/shape choices; legacy banners continue to display.

The quartermaster now offers 6 more classes (Glassblade Duelist, Stoneweaver, Stormcaller, Field Alchemist, Grave Reaper, Hourglass Keeper), 6 more races (Tideborn, Gargoyle, Foxkin, Clockborn, Sylph, Ashen), and 8 merchant-exclusive weapons. Totals are 12 classes, 11 races, and 16 weapons. Each class has a named free basic, signature ability, and ultimate; each race has a combat passive and ultimate; each weapon has its own model, element, and special attack. New racial traits affect actual armor, speed, evasion, focus recovery, or matching damage. Weapon-held basics continue to follow the equipped weapon.

Bryan's authenticated account automatically unlocks the complete current catalogs in both the menu and tavern; existing Bryan profiles require no purchase or reset. Other players buy the additions from Alden. Permanent gear supports the new weapon identities and abilities.

### Raid cinematic skip votes

Only raid boss entrance journeys show **Ready to skip** with a party readiness count. Every connected human player must agree; empty slots and disconnected companions count as automatically ready bots. Solo players can skip immediately. Votes are scoped to a single entrance, accept concurrent player requests, and expire when it ends. Boss attack cinematics always play in full and never offer a skip vote. Skipping advances presentation and the server's animation wait without undoing or repeating combat damage, spending resources again, or advancing the raid. Normal combat decision timers restart after a successful skip. The server retains the skipped cutscene key so a slower client can catch up after the next action starts.

### Campaign bestiary and entrances

Each of the twelve active campaign areas gains two regular species and one campaign-only guardian: 24 ordinary enemies, 12 bosses, and 144 named moves in total. Every addition has a nonhumanoid model, native element, combat role, habitat, almanac lore, and described attacks. Ordinary species have three moves; the new bosses have six, ending in a brief signature film.

| Area | Added regular enemies | Added boss |
| --- | --- | --- |
| Greenwood | Reed Toad, Thorn Mantis | The Lily Crown |
| Hollow Depths | Candle Crawler, Coffin Mite | The Mourning Bell |
| Void & Hell | Cinder Leech, Rift Urchin | The Ashen Procession |
| Ocean | Pearl Snipper, Kelp Dragon | The Spiral Abbey |
| Corsair Ship | Powder Rat, Rope Weaver | The Powder King |
| Jade Jungle | Fang Bromeliad, Jade Pangolin | The Threefold Root |

The later six areas use the replacement roster described above; retired sky and polar species no longer appear in the active almanac. The first two campaigns retain their expanded creatures, fixed opening moss encounter and ten-encounter regional maps. Ordinary intros vary their approach choreography, and campaign boss reveals are short; raid journey boss reveals remain removed.

### Camera faces and party conflict recovery

In **Customize → Take a photo for your face**, open the device camera, adjust the center-square zoom, take or retake a photo, then choose **Use photo → Save appearance**. **Download PNG** saves a local copy. Image upload also works when a camera is unavailable or permission is declined. Camera access starts only on request and its tracks stop after capture, on closing customization, or on leaving the page. Photos are resized to bounded 32×32 PNGs and saved with the character appearance, including shared party and tavern profiles. Default and drawn faces remain available.

Lobby and camp commands recover from stale party versions by fetching the latest snapshot and retrying the same request identifier, only while the run, encounter, and phase remain unchanged. Combat commands do not rebase onto a different turn. Brief shared-store lock conflicts retry the identical request with bounded backoff. Camp confirmation sends an explicit ready value instead of a toggle, avoiding accidental reversal on retries.

Chat mode pauses movement and E interaction in both the tavern and trading hub. Opening chat clears held movement and walk-to targets; closing it requires a fresh movement keypress. Trading-hub messages include a server-verified trader ID and overhead bubbles track the rendered local or interpolated remote character. Client-supplied trader IDs are ignored.

Battle introductions now settle onto the actual combat formation, with short eased approaches, gait that stops before the handoff, and gentle camera motion applied to both scenery and characters. Letterboxing retracts into battle instead of flashing to black. Unique boss reveals settle into their combat positions, and raid journey walking phases join continuously. Starting another journey cancels the previous timer so an older animation cannot interrupt the new one.

With Bryan abilities enabled, the authenticated owner starts campaigns and raids at level 80, the highest campaign level, with unlimited stat points available to allocate. Hosting and joining online lobbies apply the same grant. Existing owner characters can be promoted once without healing an active run or stacking level bonuses; already higher raid levels remain intact. A guest display name or client-supplied profile cannot grant owner levels.

Raid reinforcements occupy three distinct positions in front of and beside their boss. Spawned minions receive stable formation slots, reused when a minion dies, so surviving minions do not jump positions. Legacy minions without saved slots use a deterministic fallback. Boss positions and battlefield camera settings remain unchanged.

Guild leaders can also select **Guild icon → Draw my own icon** while creating or editing a guild. The transparent 16×16 pixel icon has its own paint, eraser and undo controls, separate from the banner pattern. The live preview, guild overview and leaderboard all show the saved custom icon. Switching back to a symbol preserves the drawing for later use.

### Owner stat allocation

The authenticated Bryan owner with owner abilities enabled has an unlimited stat budget in campaigns and raids. Build rows accept typed totals for Power, Toughness, Speed and Focus; points distribute across the underlying attributes. Normal players retain level budgets and attribute limits. High-point owner builds persist through profile saving, room loadouts, save restoration and build-code sharing; ordinary imports and combat application retain ordinary limits. Changing maximum health does not heal the adventurer.


### Rustwild, Rift Rush and menu changelog

**Changelog · New** on the title screen and pause menu lists recent player-facing updates. Bonus challenges, challenge objectives and challenge-specific rewards have been removed, including from older saved fights. Battle conditions (such as Crossfire) remain inspectable. Ordinary campaign encounters after the opening fight now drop two regular equipment pieces so progression no longer depends on optional objectives.

Campaign 5, **The Rustwild**, unlocks by clearing campaign 4 normally; Bryan owns it immediately. Its three fixed ten-encounter regions are Lanternfen (a glowing wetland), Gearhaven (an abandoned machine city) and the Heartforge (a volcanic industrial chamber). The regions add 18 regular creatures, 12 exclusive guardians, nine unique choices, custom models, travel scenes and native-element attack kits. Spore bloom amplifies Nature/Water; Gearhaven builds steam pressure unless you guard; the Heartforge alternates Frost-favored rounds with every-third-round Fire pulses. Existing routes append the 30 encounters without replacing saved fights or gear.

**Rift Rush** is a separate, seeded 12-wave survival mode available from the menu or online room creation. Each run selects three regions with a campaign guardian on waves 4, 8 and 12. Waves 3, 6, 9 and 12 open equipment and supply stops. Between those stops, the party only confirms passage through the next rift; it cannot use the camp shop or change equipment. Health and focus persist, resting and defeat retries are disabled, summons last one encounter, and all human players must confirm advancement. Rush uses its own local save and does not unlock campaigns or count as campaign/raid guild progression. Two through six adventurer slots work online; bots fill empty slots.


### Battle sidebar and selective environmental rules

The encounter heading, turn-order panel and expandable region-effect label form a single vertical sidebar. Environmental rules are active only in Scorchglass Desert (heat), Fulgur Canyon (static), Frostwake Wilderness (cold), the Singing Depths (repeated-attack resonance) and the Heartforge (furnace pulses). The other ten campaign areas have no ambient modifier. Earlier temple alignment, fortress wards, marsh bloom and city steam rules no longer apply. Desert rest stops use a shade canopy and water station, without flame or firewood. Enemy elemental affinity resists its listed contrasting strength only; attacks of the enemy's own element deal neutral elemental damage, including after older saves are restored.


### Creature attack choreography

Creature attacks now use body-specific movement before impact instead of the humanoid walk-and-swing fallback. Beak and talon attacks make birds climb, fold their wings and pitch into a dive, then return to formation; feather volleys and wing gusts stay ranged. Frog/toad tongues extend from the mouth to the target and retract while the creature stays in place. Croaks send throat pulses and hops launch the body. Other supported families include bat swoops, serpent lunges/spit, spider scuttles/webs, beast charges, shell rolls, slime hops, pincers, plant vines, insect strikes and mechanical recoil. Generic spell projectiles are suppressed during these creature windups; elemental impacts, critical effects, hit flashes and damage-number timing remain synchronized to the original attack impact. Reduced motion keeps actors in formation and avoids dives and body rotations. Existing signature films and player-weapon animations retain their own systems.


Ordinary healing moves and healing ultimates affect living allies only. Single-target healing directed at a fallen ally is rejected before focus, cooldowns or the action are consumed. Healing tonics also require a standing ally; Revival embers are explicit revival items in battle and at camp.


### Carrying fallen party members

During encounter entrances, travel, camp departures and raid journeys, living adventurers carry fallen party members across their shoulders and lay them in their usual formation positions. Assignment follows the shared party order and ignores summons. If there are more fallen teammates than survivors, carriers make separate trips instead of stacking bodies. Characters remain gray, at zero HP, and out of combat turn order until explicitly revived. Carrying never changes health or inventory. The server extends entry/transition waits for the same deterministic number of trips, so multiplayer cannot begin combat before placement finishes. Healthy parties retain their existing timings.


### Jadefang, Root of All Hunger and Pale Comet

These bosses use dedicated models rather than the generic wolf, tree or dragon primitives. Jadefang is a six-legged jade saber cat with a mineral crown, ivory fangs, armored shoulders, claws and a split tail; its short entrance pushes through foliage into a pounce and roar. Root of All Hunger has a physically hollow bark cage, toothed maws, crawling roots and hanging seed coffins. Pale Comet is a floating skeletal frost wyrm with an exposed spine and ribs, crescent wings, a split jaw, orbiting ice shards and a trailing segmented tail. Battle, attack-film and almanac renderers share the new models; previews fit their silhouettes without changing battle FOV. Existing saved boss identities show the new designs immediately, hit flashes still recolor the full model, and reduced motion stops idle movement.


### Menu sizing

The title menu uses normal flowing layout with a second collection column on wider windows and vertical scrolling when needed. It no longer uses an absolute vertical-center offset that clips added buttons. Room dialogs stay within the viewport, use compact responsive form columns and reset their scroll position whenever opened. Small-screen online presence appears beneath the menu rather than covering menu controls. Browser checks cover 1366×650, 1280×620, 1024×600, 844×430, 390×700 and 320×568, including successful room creation.
