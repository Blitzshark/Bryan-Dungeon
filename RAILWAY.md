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

Open **Customize → Wear accessories**, or **Menu → Accessories**. Wear one item
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

Raid bosses start at 5,500 HP solo or 8,250 HP in a six-slot party and grow
with every victory. Their large red health bar appears at the top; select it
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
