(function(){
'use strict';
class FaceEditor{
 static paint(canvas,drawing=''){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);if(!/^[0-9a-f]{256}$/.test(drawing))return;for(let i=0;i<256;i++){const n=parseInt(drawing[i],16);if(n){c.fillStyle=HeroOptions.FACE_PALETTE[n];c.fillRect(i%16*canvas.width/16,Math.floor(i/16)*canvas.height/16,canvas.width/16,canvas.height/16);}}}
 constructor(node,drawing,skin,onChange){this.pixels=/^[0-9a-f]{256}$/.test(drawing)?drawing:'0'.repeat(256);this.history=[];this.color='1';this.onChange=onChange;node.innerHTML='<canvas class="face-canvas" width="256" height="256" aria-label="Draw your face on a 16 by 16 pixel canvas"></canvas><div class="face-palette" role="group" aria-label="Drawing colors">'+HeroOptions.FACE_PALETTE.map((color,i)=>'<button type="button" data-ink="'+i.toString(16)+'" style="--ink:'+color+'" aria-label="'+(i?'Color '+color:'Eraser')+'" aria-pressed="'+(i===1)+'">'+(i?'':'⌫')+'</button>').join('')+'</div><div class="face-tools"><button type="button" data-undo>Undo</button><button type="button" data-clear>Clear drawing</button></div>';this.canvas=node.querySelector('canvas');this.setSkin(skin);this.undo=node.querySelector('[data-undo]');const paint=()=>{FaceEditor.paint(this.canvas,this.pixels);this.undo.disabled=!this.history.length;};this.paint=paint;
 node.querySelectorAll('[data-ink]').forEach(button=>button.onclick=()=>{this.color=button.dataset.ink;node.querySelectorAll('[data-ink]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
 this.undo.onclick=()=>{if(this.history.length){this.pixels=this.history.pop();this.changed();}};node.querySelector('[data-clear]').onclick=()=>{this.remember();this.pixels='0'.repeat(256);this.changed();};
 const point=e=>{const r=this.canvas.getBoundingClientRect();return [Math.max(0,Math.min(15,Math.floor((e.clientX-r.left)/r.width*16))),Math.max(0,Math.min(15,Math.floor((e.clientY-r.top)/r.height*16)))];};
 const draw=e=>{const next=point(e),last=this.last||next,steps=Math.max(Math.abs(next[0]-last[0]),Math.abs(next[1]-last[1]),1),pixels=this.pixels.split('');for(let i=0;i<=steps;i++)pixels[Math.round(last[1]+(next[1]-last[1])*i/steps)*16+Math.round(last[0]+(next[0]-last[0])*i/steps)]=this.color;this.pixels=pixels.join('');this.last=next;this.changed();};
 this.canvas.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();this.pointer=e.pointerId;this.canvas.setPointerCapture(e.pointerId);this.remember();this.last=null;draw(e);};this.canvas.onpointermove=e=>{if(this.pointer===e.pointerId)draw(e);};this.canvas.onpointerup=this.canvas.onpointercancel=this.canvas.onlostpointercapture=()=>{this.pointer=null;this.last=null;};paint();
 }
 setSkin(skin){this.canvas.style.backgroundColor=skin;}
 remember(){this.history.push(this.pixels);if(this.history.length>30)this.history.shift();}
 changed(){this.paint();this.onChange(this.pixels);}
}
window.FaceEditor=FaceEditor;
})();
