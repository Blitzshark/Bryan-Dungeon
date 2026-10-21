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
