/* One vector source drives both the extruded title and its portal. */
(()=>{
const root=document.querySelector('#entrance'),title=root.querySelector('h1'),stage=root.parentElement;
const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
svg.classList.add('type-flight');svg.setAttribute('aria-hidden','true');stage.append(svg);
const layers=[];for(let i=24;i>=0;i--){const group=document.createElementNS(ns,'g');svg.append(group);const paths=[0,1].map(()=>{const p=document.createElementNS(ns,'path');group.append(p);return p});layers.push({i,group,paths});}
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
let size='',g;
const transform=(commands,fn)=>commands.map(([op,...v])=>[op,...v.reduce((a,_,i)=>i%2?a:[...a,...fn(v[i],v[i+1])],[])]);
const path=commands=>commands.map(([op,...v])=>op+v.map(n=>Number(n.toFixed(3))).join(' ')).join('');
function measure(w,h){
 title.style.visibility='';const spans=[...title.children],font=parseFloat(getComputedStyle(title).fontSize),data=window.tantraOutlines[w<=760?44:96],lines=[];let hole;
 spans.forEach((span,lineIndex)=>{
  const old=span.style.transform;span.style.transform='none';const box=span.getBoundingClientRect(),style=getComputedStyle(span),spacing=parseFloat(style.letterSpacing)||0;
  const probe=document.createElement('i');probe.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';span.append(probe);const baseline=probe.getBoundingClientRect().top;probe.remove();
  const text=span.textContent,scale=font/1000,width=[...text].reduce((sum,ch)=>sum+data[ch].advance*scale+spacing,0);let x=box.left+(box.width-width)/2;
  const angle=(lineIndex?1:-3)*Math.PI/180,co=Math.cos(angle),si=Math.sin(angle),ox=box.left+box.width/2,oy=box.top+box.height/2;
  const all=[];for(const [charIndex,ch] of [...text].entries()){const range=document.createRange();range.setStart(span.firstChild,charIndex);range.setEnd(span.firstChild,charIndex+1);x=range.getBoundingClientRect().left;const glyph=data[ch],fn=(px,py)=>{const X=x+px*scale-ox,Y=baseline-py*scale-oy;return[ox+X*co-Y*si,oy+X*si+Y*co]};
   glyph.contours.forEach((c,index)=>{const mapped=transform(c,fn);all.push(...mapped);if(ch==='6'&&index===1)hole=mapped;});x+=glyph.advance*scale+spacing;
  }lines.push(all);span.style.transform=old;
 });
 const coords=hole.flatMap(([, ...v])=>v.reduce((a,_,i)=>i%2?a:[...a,[v[i],v[i+1]]],[]));const xs=coords.map(p=>p[0]),ys=coords.map(p=>p[1]),ax=(Math.min(...xs)+Math.max(...xs))/2,ay=(Math.min(...ys)+Math.max(...ys))/2;
 g={font,ax,ay,hole,rx:(Math.max(...xs)-Math.min(...xs))/2,ry:(Math.max(...ys)-Math.min(...ys))/2};
 layers.forEach(({paths})=>paths.forEach((p,i)=>p.setAttribute('d',path(lines[i]))));svg.setAttribute('viewBox',`0 0 ${w} ${h}`);size=`${w}:${h}`;
}
window.resetType=()=>{title.style.visibility='';svg.style.visibility='hidden';root.style.clipPath='none';root.querySelectorAll('.edition,.opening-note,.welcome-copy p').forEach(el=>el.style.transform='');size='';};
document.fonts.ready.then(()=>size='');
window.typeTransition=(p,w,h)=>{
 if(size!==`${w}:${h}`)measure(w,h);
 const move=smooth((p-.02)/.65),aim=smooth((p-.03)/.72),dive=smooth((p-.42)/1.85),face=smooth((p-.85)/.65);
 const zoom=Math.exp(Math.log(Math.max(w/g.rx,h/g.ry)*2.4)*dive),cx=g.ax+(w/2-g.ax)*aim,cy=g.ay+(h/2-g.ay)*aim;
 const rx=10*Math.PI/180*move*(1-face),ry=-20*Math.PI/180*move*(1-face),depth=g.font*.115*move;
 // Orthographic projection gives the title and cutout an identical affine map.
 // The camera is square to the opening before the close approach begins.
 const a=Math.cos(ry)*zoom,b=Math.sin(rx)*Math.sin(ry)*zoom,c=0,d=Math.cos(rx)*zoom;
 const tx=cx-a*g.ax-c*g.ay,ty=cy-b*g.ax-d*g.ay;
 layers.forEach(({i,group,paths})=>{const z=-depth*i/24,ex=tx+Math.sin(ry)*z*zoom,ey=ty-Math.sin(rx)*Math.cos(ry)*z*zoom;group.setAttribute('transform',`matrix(${a} ${b} ${c} ${d} ${ex} ${ey})`);paths[0].setAttribute('fill',i?`rgb(${80-i*.85},${80-i*.85},${77-i*.85})`:'#252522');paths[1].setAttribute('fill',i?`rgb(${174-i},${70-i*.5},17)`:'#ff6b1a');});
 const z=-depth,ex=tx+Math.sin(ry)*z*zoom,ey=ty-Math.sin(rx)*Math.cos(ry)*z*zoom;
 const hole=transform(g.hole,(x,y)=>[a*x+c*y+ex,b*x+d*y+ey]);
 root.style.clipPath=p>.002?`path(evenodd, 'M0 0H${w}V${h}H0Z ${path(hole)}')`:'none';
 // Beyond this size every viewport corner is comfortably within the bowl.
 const complete=dive>.98;svg.style.visibility=p>.002&&!complete?'visible':'hidden';title.style.visibility=p>.002?'hidden':'';
 root.querySelectorAll('.edition,.opening-note').forEach(el=>el.style.transform=`translateY(${-move*h*.38}px)`);root.querySelector('.welcome-copy p').style.transform=`translateY(${move*h*.65}px)`;
 root.dataset.portalComplete=String(complete);root.dataset.portalZoom=zoom.toFixed(2);
 return{complete,artTransform:'none',worldTransform:`scale(${.82+.18*smooth((p-.25)/1.5)})`,revealOffset:0};
};
})();
