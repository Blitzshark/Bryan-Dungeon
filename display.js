(function(){
'use strict';
const media=matchMedia('(prefers-reduced-motion: reduce)');let preference='auto';try{const value=localStorage.getItem('hollow-motion');if(['auto','full','reduced'].includes(value))preference=value;}catch{}
const api={get preference(){return preference;},get reduced(){return preference==='reduced'||preference==='auto'&&media.matches;},set(value){if(!['auto','full','reduced'].includes(value))return;preference=value;try{localStorage.setItem('hollow-motion',value);}catch{}update();}};
function update(){document.documentElement.dataset.motion=api.reduced?'reduced':'full';dispatchEvent(new Event('hollow-motion-change'));}
media.addEventListener?.('change',update);window.GameDisplay=api;update();
})();
