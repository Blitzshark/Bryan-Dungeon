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

Each living fighter gets one action per round in speed order. Party turns wait
for player input. Enemies take individual server-driven turns in online rooms.
Strike is free; stronger skills cost focus and recover on the owner’s turns.
Focus restores 3 focus and halves incoming damage until the next turn. Poison
lasts two actions; armored enemies guard; healers aid their allies; chargers
telegraph heavy attacks; some enemies drain life or sweep the party.

Melee fighters walk to the target, swing, and retreat. Enemies flash red on
impact and damage counters float above them. Archers draw and release
projectiles; casters raise their staff and cast bolts. Hits, healing, guard,
poison, and campfires have effects. Sounds are synthesized locally. Reduced
motion keeps actions readable without walking or particle movement.

Name inputs support select-all, delete, and replacement. Dragging selected text
outside the input does not dismiss the setup dialog.

An adventurer named **Bryan** (case insensitive) gains **Universe cleave** in
the Fight menu. Its nine-second, text-free cutscene pulls away from Earth into
the galaxy, then the universe, before the cut and explosion. The combat HUD is
hidden throughout; ten-million damage counters appear on return to the battle.
The full action reserves ten seconds on the server. Reduced motion uses fixed
framing rather than a fast zoom.

## Tavern, characters and abilities

- Press **Tavern** in the header or **Menu → Visit the tavern**. Solo combat
  pauses while visiting. Online rooms continue synchronizing; other players may
  need to wait for your character’s turn while you are away.
- **WASD**, arrow keys, clicking the floor, or the touch direction pad move your
  character through the Wandering Ember. The hearth, idle NPCs, tables, rugs,
  and quartermaster are rendered locally. Nearby visitors appear through the
  same shared backend as rooms. An unavailable backend leaves a usable offline
  tavern and shop with a visible connection status.
- Walk to **Alden behind the bar** and press **E** or **Talk to Alden**. Buy and
  equip classes, weapon types, and races. Your profile starts with **150 welcome
  gold**. Victories earn additional tavern gold, separate from the party’s camp
  bag. Reward credit is tracked per run so reloads do not award it twice.
- There are **6 classes**, **5 races**, and **8 weapon types**. Every class and
  race has its own ultimate; every weapon has its own attack. **Arts / 4** shows
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
- `scene.js`: block-world arenas, enemy models, campfire, walking and VFX.
- `game.js`: battle menus, camp UI, room lobby, progression and local saving.
- `multiplayer.js`: authenticated room sessions and synchronized client updates.
- `cosmic.js`: Earth-to-universe cinematic and final explosion.
- `sound.js`: synthesized battle and interaction audio.
- `api/rooms.js`, `lib/rooms.js`, `lib/room-store.js`: authoritative room API,
  ownership, distributed locking, session validation, and persistent storage.
- `scripts/build.js`, `vercel.json`: static output and Vercel function routing.
