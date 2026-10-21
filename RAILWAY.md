# Railway hosting

Connect this GitHub repository and deploy `main`. `railway.json` sets the build,
start command, health check, restart policy, and one replica. The Node server
binds `0.0.0.0` on Railway's `PORT` (8080 is supported). Use the public
`https://bryan-dungeon.up.railway.app` address, not the Railway dashboard URL.

Solo, online rooms, lobby browsing, and tavern presence work on one Railway
instance without adding a database. These rooms live in the running process
and reset on redeployment or restart. Saved solo games stay in the browser.

For rooms that persist across restarts, add Railway Redis and add a service
variable `REDIS_URL` referencing that Redis service's `REDIS_URL`. Existing
Upstash REST URL/token variables also work and take priority. Never put
credentials in game URLs or browser code. Redis is required for multiple
replicas; the default configuration deliberately runs one replica.

Vercel still requires shared Redis because its functions do not share memory.

Health check: `/health`. Room readiness: `/api/rooms?status=1`.

## Accounts and Bryan abilities

Accounts require persistent storage: connect Redis as above **or** attach a
Railway volume (Railway supplies `RAILWAY_VOLUME_MOUNT_PATH`). Without either,
guest play still works, but account creation is disabled to prevent lost logins
when the service restarts. Back up your Redis database or volume.

To claim the reserved **Bryan** account:

1. In Railway → your game service → Variables, set `BRYAN_ADMIN_CLAIM_CODE` to a
   private random code of at least 16 characters, then redeploy.
2. Open the game → **Sign in → Create an account**. Choose `Bryan`, choose your
   password, and enter that private claim code in the owner field.
3. Use **Settings → Enable Bryan abilities** to toggle Warp, Skip, and Universe
   cleave. Once claimed, you can remove the claim-code variable; later logins
   only need the username and password. Never share passwords or claim codes.

Other players can register their own unique usernames normally. A guest merely
named Bryan receives no admin permissions. Passwords are hashed with scrypt;
sessions use HttpOnly cookies. Standard sign-in forms allow the browser to offer
to save passwords; the prompt depends on the browser's password-manager settings.
Accounts identify players across devices, but game progress and customization
remain saved in each browser, separately for each signed-in account.

On Vercel, use the connected Upstash/Redis storage and the same private
`BRYAN_ADMIN_CLAIM_CODE` variable. Local development stores accounts in ignored
`.data/accounts`; do not commit or serve account storage publicly.

## Tavern raid queues

Open the tavern's **Raid boss queues** board and choose **Sit & queue**. The
character walks to the selected table; up to six players can sit together.
The table departs after 20 seconds, when full, or when every seated player
presses **Ready to depart**. Unclaimed party slots become AI companions.
**Stand up** cancels a seat before departure. Visitors can watch groups walk
through the raid door. Each raid boss room has a 12-second journey, and server
combat timers reserve the journey before allowing actions. Queues use the same
room storage and work on the single Railway instance or shared Redis.

## Almanac, accessories and boss music

The enemy almanac renders each enemy in its home region. Encountering reveals
notes; defeating completes the entry and reveals the full model. Earlier
almanac saves keep their discoveries. The verified Bryan account receives all
completed entries and catalog unlocks, including accessories, even when its
combat admin abilities are disabled.

Open **Customize → Wear accessories**, or **Menu → Customize character → Wear accessories**. Wear one item
per head, back and neck slot. Extra accessories are sold by Alden; cosmetics
are shared with other tavern visitors and carried into battles and cutscenes.

Battle music randomly chooses `battletheme1.mp3` or `battletheme2.mp3` once
per regular encounter. Campaign and raid bosses both randomly choose **The
Final Confrontation** or **Remix of TFC**. Re-rendering a menu or health bar does
not reroll or restart the current track. Music fades over about 1.6 seconds,
with forest, dungeon and water ambient loops between fights. Settings volume
and the sound toggle apply to ambient and combat music. Muting or hiding the
tab pauses playback immediately.

## Deployment stops and shutdown logs

Railway starts Node directly with `node server.js`. On `SIGTERM` or `SIGINT`,
the server stops accepting connections, finishes active requests, closes idle
connections, and exits successfully. An eight-second deadline prevents stuck
requests from blocking container replacement. A normal deployment stop logs
`Received SIGTERM; finishing active requests.` followed by `Server stopped
cleanly.`. `SIGTERM` from an old container during deployment is a lifecycle
event, not by itself evidence of a JavaScript crash. The old npm production
configuration warning is unrelated to game logic; the runtime start command
no longer invokes npm.

## Additional dungeon guardian and ability cards

New runs can roll the Ore Golem among the four dungeon guardians. Other
sections retain their existing boss pools. Its twelve ore and crystal moves
include shell defense, magnetic weakening and a party-wide mountain breaker.
Existing saved routes remain intact.

Nine additional cards include Ember Fox, Astral Archer and Grove Wisp summons,
plus Riftstep Cut, Storm Conduit, Spring of Renewal, Stonebreaker, Viper Needle
and Second Wind. Maintain up to two different summons per adventurer. Each
summon has its own automatic move kit and its card cooldown starts only on its
death; living allies persist through camp and travel without free healing.
Class and race ultimates deal 40% more damage or heal 50% more. Normal actions
build 30 charge, up from 25. The Greenwood dungeon doors now open toward the
approaching party, with everyone walking through the opening into darkness.

## Raid boss health and domains

Most raid bosses have 5,500–5,900 HP, with extra vitality for the demon and
furnace species. Party size does not multiply boss HP. Attacks grow stronger
with progression. Their compact red health bar appears at the top; select it
to target the boss. Minions retain their individual target cards. Health
updates at attack impact. Older raid saves migrate without restoring lost HP.

Each raid boss has 110 themed techniques, including stronger party-wide
attacks and cinematics lasting up to ten seconds. Sovereign Domain techniques
replace the full battlefield for five rounds: cosmic gravity, an underwater
cathedral, a volcanic forge, a webbed nest, or a necropolis. Their
arena effects remain active and the boss bar shows the remaining duration.
Screen distortion and hallucination effects have been removed.

Raid draws now use a shuffled five-species bag, avoiding consecutive repeats.
The Widow of Worlds uses venom, web snares and spider hatchlings. Malgrave
raises undead and steals health. The Abyssal Leviathan uses ink, pressure
and tentacle assaults; the World Furnace uses armor and burning machinery;
the Star-eating Maw consumes focus and controls gravity. Each has its own
model, attack effects and 110 named techniques. Older raids keep their current
boss and health while future draws gain the new species.

Twelve-second journeys choose among twenty themed routes: open-water swimming,
webbed ravines, cemetery marches, cosmic crossings and furnace transport.
Only one furnace route uses a chain elevator. Attack cinematics show each
species rather than recoloring the same boss silhouette.

Raid battles use the same camera scale and framing as regular battles. The
short, thin health bar adapts to mobile layouts without changing the FOV,
even when a domain label appears. Accessories are reached through Customize
rather than a separate main-menu entry.

## Friends, skins and the Ember Exchange

Sign in, then open **Friends** from the header or the party lobby. Add an
account username; the recipient accepts before either side can send instant
party invites. An invite creates a friends-only campaign or raid when you do
not have a party. **Friends only** is also a room visibility option. The server
filters these rooms and checks the host's friendship again on code-based joins;
guest players and non-friends cannot bypass this with a shared code. Public
raid tables remain available in the tavern.

Open **Trading hub** from the menu, tavern, or party lobby between battles.
WASD and touch arrows move through the exchange; nearby online traders appear
in the visitor list. Open a trader's offer form from this list or the Friends
panel. The hub uses the existing account storage: Railway's persistent volume
or shared Redis on Railway/Vercel. Friends, skins, wallets and trades persist
across deployments. Guest play does not create an unsaved trading wallet.

There are eighteen weapon/accessory skins and five rarities: Common, Rare,
Epic, Legendary and Mythic. Legendary and Mythic skins animate with flame,
water or astral effects on the model and attack trails. Preview them in the
shop; equip owned skins in **Customize → Weapon & accessory skins** or the
collection. Actual accessories remain in **Customize → Wear accessories**.
Skins affect appearance and effects, without increasing combat statistics.

Ember shards are separate from tavern gold. Each account begins with 250
shards and two starter skins. The daily gift grants 50 shards and one random
skin once every 24 hours. A cache costs 100 shards. Both use these skin odds:
Common 60%, Rare 25%, Epic 11%, Legendary 3.5%, Mythic 0.5%. Direct purchases
are available at catalog prices. Salvage returns 35% of the listed guide
value; guide values are references rather than a player market price.

Server-verified online victories award 5 shards; online bosses award 25 shards
and a skin. Ordinary online victories have a 15% skin chance. A server-issued
battle reward ID prevents claiming again after resting, rejoining or refreshing.
Offline solo saves do not mint trade currency from client-reported victories.

Trade offers specify up to six skins and a shard amount on each side. The
sender reserves their items and shards immediately. The recipient reviews the
fixed offer before accepting. A single persistent ledger update moves both
sides' ownership and currency together. Acceptance verifies current ownership
and balance; offers cannot be accepted twice. Cancelling, declining, or a
24-hour expiry refunds escrow. Seven days of completed/closed offer history
are retained, while pending offers are never pruned. Skin IDs and prices are
validated on the server; client appearance data cannot unlock trade inventory.

Chat history scrolls after 220 pixels or 28% of the viewport height. Recent
messages also appear above their speaker in the tavern, battles and camp,
follow movement and fade after eight seconds. Only the latest message per
speaker is shown overhead; the full message remains in chat history. Party
hero IDs and tavern visitor IDs are verified by the server, and polling
does not extend or replay expired bubbles.
