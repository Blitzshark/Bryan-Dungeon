# Bryan’s Dungeon: The Hollow Road

A turn-based, block-world campaign for solo play or a party of up to three online
players. Three worlds contain ten encounters each. The tenth encounter in every
world is a boss: the Briar Sovereign, the Iron Warden, and the Hollow King.
Defeating the forest boss opens the Ashen Dungeon; the second boss opens the
Hollow Depths. There are 35 enemy types with distinct silhouettes and behaviors.

## Playing

- Begin a solo journey, or choose **Play with friends** inside the game.
- Browse existing public lobbies, or create a campaign/raid room. Choose public
  visibility to appear in the browser, or invite-only for a private party.
- Create a room, copy the invite link, and send it to up to two friends.
- The host controls their adventurer and any unclaimed companions. Friends own
  their assigned adventurer’s turns. The host starts the campaign.
- Every encounter ends at a campfire. Rest, sort loot, equip or upgrade gear,
  sell unequipped items, and buy healing tonics or revival embers.
- In online rooms, everyone online must ready up before the host travels onward.
- Disconnected characters can be controlled by the host after 15 seconds. If the
  host disconnects, an active member can become host after 30 seconds. Reloading
  the same browser tab lets a player rejoin their authenticated room session.
- Room data expires after 24 hours without updates. Solo saves are local to this
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
before `multiplayer.js`. All players must use the same backend. Shared online
play always requires a reachable server; static files alone cannot share rooms.

## Endless raid

Choose **Endless raid** for solo, or select it when creating an online room.
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

Melee fighters walk to the target, swing, and retreat. Archers draw and release
projectiles; casters raise their staff and cast bolts. Hits, healing, guard,
poison, and campfires have effects. Sounds are synthesized locally. Reduced
motion keeps actions readable without walking or particle movement.

Mouse/touch supports every action. Keyboard: 1–3 switch tabs; Q strikes; W uses
the active character’s technique; E mends with Mira; arrows select targets; H
folds the bottom controls; Escape opens the menu. The music-note button mutes.

## Main files

- `campaign.js`: deterministic combat, worlds, loot, gear, campfires, migration.
- `scene.js`: block-world arenas, enemy models, campfire, walking and VFX.
- `game.js`: battle menus, camp UI, room lobby, progression and local saving.
- `multiplayer.js`: authenticated room sessions and synchronized client updates.
- `sound.js`: synthesized battle and interaction audio.
- `api/rooms.js`, `lib/rooms.js`, `lib/room-store.js`: authoritative room API,
  ownership, distributed locking, session validation, and persistent storage.
- `scripts/build.js`, `vercel.json`: static output and Vercel function routing.
