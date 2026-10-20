# Bryan’s Dungeon: The Hollow Road

A turn-based, block-world campaign for solo play or a party of up to three online
players. Three worlds contain ten encounters each. The tenth encounter in every
world is a boss: the Briar Sovereign, the Iron Warden, and the Hollow King.
Defeating the forest boss opens the Ashen Dungeon; the second boss opens the
Hollow Depths. There are 35 enemy types with distinct silhouettes and behaviors.

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
development uses memory; production requires the Redis REST variables above.
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
Each victory goes to camp and unlocks the next boss. Six boss forms rotate
through three arenas; boss health and attack strictly increase each wave.
Every boss drops two epic items whose base stats and tier grow with raid level.
Party levels, healing tonics and gold rewards also scale. Equip, upgrade, sell,
rest and buy supplies at every campfire. There is no final raid wave.
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

The local server defaults to port 3000 (`PORT` can override it). Root and `/play`
serve the game. `/api/rooms?status=1` reports online-room readiness. Development
uses a clearly identified in-memory room store, shared by browsers connected to
that local server. Restarting the development server clears local online rooms.
Set Redis variables if you need persistent shared rooms in development. The game
has no external frontend libraries, assets, sound downloads, or font requests.

The tests cover all thirty legal encounters, world bosses, campfires, equipment,
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
Basic strikes follow the equipped weapon, including for spellcaster classes. Archers draw and release
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
  during combat. Visitors exchange movement updates about every 200 ms, with
  a short adaptive interpolation buffer; network/database latency still applies.
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
  race has its own ultimate; every weapon has its own attack. **Arts / 3** shows
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

Mouse/touch supports every action. Keyboard: 1–4 switch tabs (4 = Arts); Q strikes; W uses
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
- Eight optional decisions appear between fights across the 30-stage campaign.
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
- The Focus category is removed; Fight, Items and Arts use keys 1, 2 and 3.
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
- Player and enemy hits have an 8% miss chance and 15% critical chance before
  equipment modifiers. Crits multiply raw damage by 1.6 and show a yellow marker.
  Damage/healing numbers can be toggled with **Settings (⚙)** and are remembered
  on the device. Miss labels and the yellow impact mark remain visible.
- Defeated enemies dissolve into ash. Universe Cleave burns them in purple fire
  before the dust disperses; its cosmic cutscene and guaranteed damage remain.
- The third world blends void and hell: obsidian stone, violet rifts and floating
  fragments, glowing lava fissures, and ember particles.

### Campaign II: The Lying Greenwood

Complete the Greenwood, Ashen Dungeon and Hollow Depths, then choose
**Enter the Lying Greenwood** on the completion screen. Existing completed
saves can unlock it through **Continue**. Your party, health, equipment, gold
and supplies carry forward; entering does not grant free healing.

The sequel contains ten new stages, three story stops, higher-tier gear and
six new enemy types: Mirror Pilgrims, Briar Jesters, False Lanterns, Dream
Moths, Hollow Marionettes and the solo Masked Sovereign boss. Illusion casters
create translucent false images that absorb hits. **Guard & focus** exposes
all images without relying on accuracy. Tricksters renew their images every
third action, so revealing and timing attacks matters.

The sequel uses the campaign save slot, supports online parties, and requires
the host to open the shared continuation. Raids and the original 30-stage
campaign retain their separate progression rules.

Story choices use six distinct action sequences: the blade lesson, formation
drill, wagon supply handoff, paired sparring, shrine medicine gathering and
ember procession. Each has its own movement, staging and props.

Critical attacks now receive cinematic framing, a brief camera push and one
short contrast impact beat. Reduced motion omits the contrast beat and camera
movement. An adventurer named **Bryan** (case-insensitive) always critically
hits and never suffers a normal accuracy miss; false images can still absorb
a hit. Universe Cleave remains exactly 10,000,000 damage per enemy.

### Critical close-ups, clear counters and scarce shared gold

- Critical hits use a dedicated 2.4-second close-up: wind-up, giant strike,
  contrast impact frames and large yellow **CRITICAL HIT** beside the victim.
  Numbers appear above the cinematic at the actual hit. The old hidden-number
  preference resets to visible once; Settings can still disable numbers.
- Misses show a large **MISS — NO DAMAGE** banner and the target dodges.
  Categories now read **Fight / Arts / Items**, bound to **1 / 2 / 3**.
- The first campaign has a total shared-gold minting budget of 200 across
  victories, offerings and gear sales, even if all rewards are hoarded. Normal
  victories award 4, bosses 12, and ordinary loot sells for 2–4. First-campaign
  tonics cost 1, revival embers 6, and upgrades start at 5. Spending does not
  refill that minting budget. Personal tavern funds remain separate.
  The sequel and raids keep their own economies. Old first-campaign gold and
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
