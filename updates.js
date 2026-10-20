(function(){
'use strict';
const build=document.querySelector('meta[name=game-build]').content;let latest=build;
window.GameUpdates={build,get latest(){return latest;},async check(){try{const response=await fetch(new URL('version.json?check='+Date.now(),document.baseURI),{cache:'no-store',signal:AbortSignal.timeout(5000)});if(!response.ok)return false;const value=await response.json();if(typeof value.build!=='string'||!/^r[a-z0-9]+$/.test(value.build))return false;latest=value.build;const badge=document.getElementById('build-status');badge.textContent=latest===build?'Build '+build:'Update '+latest+' available';badge.classList.toggle('update-available',latest!==build);return latest!==build;}catch{return false;}},reload(){const url=new URL(location.href);url.searchParams.set('_update',latest+'-'+Date.now());location.replace(url.href);}};
addEventListener('DOMContentLoaded',()=>GameUpdates.check());document.addEventListener('visibilitychange',()=>{if(!document.hidden)GameUpdates.check();});setInterval(()=>GameUpdates.check(),60000);
})();
