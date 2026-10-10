(function(root){
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const active=(l,t)=>l.visible && t>=l.start && t<l.start+l.duration;
 function rings(l,t){
  const count=clamp(Math.round(l.rings||1),1,30),spacing=Math.max(1,l.spacing),reach=Math.max(l.radius,l.reach),elapsed=Math.max(0,t-l.start),speed=Math.max(1,l.speed),delay=Math.max(0,l.delay);
  return Array.from({length:count},(_,i)=>{
   const begin=l.radius+i*spacing;
   if(begin>reach||elapsed<i*delay)return null;
   const travel=reach-begin,cycle=Math.max(.01,travel/speed),age=elapsed-i*delay;
   if(!l.loop&&age>cycle)return null;
   const phase=l.loop ? age%cycle : age;
   return {radius:begin+phase*speed,opacity:l.fade?1-phase/cycle:1,width:l.lineWidth};
  }).filter(Boolean);
 }
 function cameraAt(keys,t,fallback){
  if(!keys?.length)return fallback;
  const sorted=[...keys].sort((a,b)=>a.time-b.time);
  if(t<=sorted[0].time)return sorted[0];
  for(let i=1;i<sorted.length;i++)if(t<=sorted[i].time){
   const a=sorted[i-1],b=sorted[i],p=clamp((t-a.time)/Math.max(.001,b.time-a.time),0,1),e=p*p*(3-2*p);
   let d=b.lng-a.lng;if(d>180)d-=360;if(d< -180)d+=360;
   return {lng:a.lng+d*e,lat:a.lat+(b.lat-a.lat)*e,zoom:a.zoom+(b.zoom-a.zoom)*e,bearing:(a.bearing||0)+((b.bearing||0)-(a.bearing||0))*e,pitch:(a.pitch||0)+((b.pitch||0)-(a.pitch||0))*e};
  }
  return sorted.at(-1);
 }
 function layer(type,name,extra={}){return {id:globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2),type,name,start:0,duration:12,x:80,y:100,w:1100,h:130,opacity:1,visible:true,locked:false,group:'',animation:'fade',color:'#f4f7fc',fontSize:52,text:name,volume:1,offset:0,...extra};}
 function validate(p){
  if(!p||p.version!==1||!Array.isArray(p.layers)||p.layers.length>1000||!Number.isFinite(p.duration)||p.duration<=0||p.duration>3600)throw Error('Invalid project file');
  const ids=new Set(),types=new Set(['text','caption','logo','audio','video','image','map','geometry','rings','shape','marker']);
  for(const l of p.layers){if(!l||typeof l.id!=='string'||ids.has(l.id)||!types.has(l.type))throw Error('Invalid or duplicate layer');ids.add(l.id);for(const k of ['start','duration','x','y','w','h','opacity'])if(!Number.isFinite(l[k]))throw Error('Invalid layer timing or position');if(l.start<0||l.duration<=0||l.opacity<0||l.opacity>1)throw Error('Invalid layer values');}
  return p;
 }
 function sourceCrop(sw,sh,l){
  const left=clamp(Number(l.cropLeft)||0,0,95)/100,top=clamp(Number(l.cropTop)||0,0,95)/100;
  const right=clamp(Number(l.cropRight)||0,0,Math.max(0,95-left*100))/100,bottom=clamp(Number(l.cropBottom)||0,0,Math.max(0,95-top*100))/100;
  return {x:sw*left,y:sh*top,w:sw*(1-left-right),h:sh*(1-top-bottom)};
 }
 function layoutRects(kind,w,h){const gap=16;
  if(kind==='inset')return [{x:0,y:0,w,h},{x:w*.68,y:h*.62,w:w*.29,h:h*.29}];
  if(kind==='side')return [{x:0,y:0,w:(w-gap)/2,h},{x:(w+gap)/2,y:0,w:(w-gap)/2,h}];
  if(kind==='stack')return [{x:0,y:0,w,h:(h-gap)/2},{x:0,y:(h+gap)/2,w,h:(h-gap)/2}];
  if(kind==='two-main')return [{x:0,y:0,w:w*.67-gap,h},{x:w*.67,y:0,w:w*.33,h:(h-gap)/2},{x:w*.67,y:(h+gap)/2,w:w*.33,h:(h-gap)/2}];
  if(kind==='four')return [0,1,2,3].map(i=>({x:(i%2)*(w+gap)/2,y:Math.floor(i/2)*(h+gap)/2,w:(w-gap)/2,h:(h-gap)/2}));
  if(kind==='details')return [{x:0,y:0,w:w*.67-gap,h},{x:w*.67,y:0,w:w*.33,h}];
  return [{x:0,y:0,w,h}];
 }
 function captionsFromChunks(chunks,l,total){return chunks.filter(c=>c.text?.trim()&&Number.isFinite(c.timestamp?.[0])).map(c=>{
  const start=Math.max(0,c.timestamp[0]),end=Math.min(total,Number.isFinite(c.timestamp[1])?c.timestamp[1]:total);
  return {start:l.start+start,duration:Math.max(.03,end-start),text:c.text.trim()};
 }).filter(c=>c.start<l.start+total);}
 function geographyVisible(l,layers,t){if(!l.mapId)return true;const i=layers.findIndex(p=>p.id===l.mapId&&p.type==='map'),parent=layers[i];if(!parent||!active(parent,t))return false;return !layers.slice(0,i).some(p=>p.type==='map'&&active(p,t)&&p.opacity>=.999&&p.animation!=='fade'&&p.x<=parent.x&&p.y<=parent.y&&p.x+p.w>=parent.x+parent.w&&p.y+p.h>=parent.y+parent.h);}
 const api={geographyVisible,clamp,active,rings,cameraAt,layer,validate,sourceCrop,layoutRects,captionsFromChunks};if(typeof module!=='undefined')module.exports=api;else root.StudioModel=api;
})(globalThis);
