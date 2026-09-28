'use strict';
const $=s=>document.querySelector(s),acts=[...document.querySelectorAll('.act')],chapterLinks=[...document.querySelectorAll('.journey-nav nav a')];
const journeyEnd=14.5,stops=[0,2.6,4.95,6.7,9.15,11.35,13.65],names=['THE UNFINISHED','THE MARGINS','THE BEAUTIFUL MESS','NO BORDERS','THE FEST TEE','THE NEXT PAGE','STAY CONNECTED'];
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
// Give the illustrated-world section 12% more physical scroll distance.
const worldStart=2.6,worldEnd=4.5,worldStretch=1.12,extraScroll=(worldEnd-worldStart)*(worldStretch-1);
const scrollPosition=progress=>progress+clamp(progress-worldStart,0,worldEnd-worldStart)*(worldStretch-1);
const sceneProgress=position=>position<worldStart?position:position<worldEnd+extraScroll?worldStart+(position-worldStart)/worldStretch:position-extraScroll;
let scrollVelocity=0,burstOrigin=[.5,.5];
function burstFrom(event,element=event?.currentTarget){
 if(reduced)return;
 const box=element?.getBoundingClientRect();
 const pointer=event&&typeof event.clientX==='number'&&event.detail!==0;
 const x=pointer?event.clientX:box?box.left+box.width/2:w/2;
 const y=pointer?event.clientY:box?box.top+box.height/2:h/2;
 const bounds=canvas.getBoundingClientRect();
 burstOrigin=[clamp((x-bounds.left)/(bounds.width||w)),1-clamp((y-bounds.top)/(bounds.height||h))];
 burstAt=performance.now()/1000;
}
let w=innerWidth,h=innerHeight,p=0,prior=0,speed=0,mouse=[.5,.5],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,burstAt=-10,experiments=0,activeIndex=0;
const portal=$('.portal-art'),welcome=$('.welcome-copy'),panorama=$('.panorama'),captions=[...document.querySelectorAll('.world-caption')],machine=$('.machine-art'),canvas=$('#ink-field');
let gl=null,un={},panoramaTravel=0,lastInkFrame=0;
function resize(){w=innerWidth;h=document.querySelector('#stage').clientHeight||innerHeight;panoramaTravel=Math.max(0,panorama.offsetWidth-w);if(gl){canvas.width=Math.round(w*Math.min(devicePixelRatio,1.5));canvas.height=Math.round(h*Math.min(devicePixelRatio,1.5));gl.viewport(0,0,canvas.width,canvas.height)}}
function maxScroll(){return Math.max(1,document.documentElement.scrollHeight-h)}
function go(id){let i=acts.findIndex(a=>a.id===id);if(i<0)return;if(reduced){acts[i].scrollIntoView({behavior:'instant'})}else{window.scrollTo({top:scrollPosition(stops[i])/(journeyEnd+extraScroll)*maxScroll(),behavior:'smooth'})}}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go(a.hash.slice(1))}));
function setMotion(on){reduced=!on;document.body.classList.toggle('quiet',reduced);if(reduced){document.body.classList.remove('lens-passing');window.resetType?.();machine.style.transform='';$('.workshop h2').style.transform='';$('.workshop-top .hand').style.transform='';}$('#motion').innerHTML=`Motion ${on?'on':'off'} <span>${on?'◉':'○'}</span>`;$('#motion').setAttribute('aria-pressed',String(!on));acts.forEach(a=>{a.inert=false;a.removeAttribute('aria-hidden')});resize()}
$('#motion').addEventListener('click',()=>{const i=activeIndex;setMotion(reduced);go(acts[i].id)});
window.addEventListener('resize',resize,{passive:true});window.addEventListener('pointermove',e=>{mouse=[e.clientX/w,1-e.clientY/h];$('#cursor').style.transform=`translate(${e.clientX-7}px,${e.clientY-7}px)`},{passive:true});
const departments={cs:['hello_world','Turn a blank terminal into something that works.'],ai:['train. test. imagine.','Explore what machines can learn — and what you can teach them.'],mechanical:['ideas_in_motion','From the first gear to the next working prototype.'],civil:['build_beyond','Find the structure behind a bigger possibility.'],eee:['circuit_closed','Connect a little energy to a very big idea.']};
document.querySelectorAll('.discipline').forEach(b=>b.addEventListener('click',e=>{document.querySelectorAll('.discipline').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b))});const d=departments[b.dataset.dept];$('#lab-title').textContent=b.querySelector('.full-name').textContent;$('#lab-art').src='assets/'+b.dataset.dept+'.png';$('#lab-art').style.setProperty('--art-scale',b.dataset.dept==='cs'?'1.9':'1.15');$('#lab-art').alt=b.querySelector('.full-name').textContent+' pencil illustration';$('#lab-number').textContent=String([...document.querySelectorAll('.discipline')].indexOf(b)+1).padStart(2,'0');if(!reduced)$('#lab-art').animate([{opacity:0,transform:'translateY(15px) rotate(-8deg) scale(.8)'},{opacity:1,transform:'translateY(0) rotate(0) scale(1)'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'});$('#dept-command').replaceChildren(document.createTextNode('> '+d[0]));const blink=document.createElement('span');blink.className='blink';blink.textContent='_';$('#dept-command').append(blink);$('#dept-description').textContent=d[1];burstFrom(e,b)}));
try{gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false});if(gl){const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';const fs=`precision mediump float;uniform vec2 res;uniform vec2 mouse;uniform vec2 burstOrigin;uniform float time;uniform float speed;uniform float burst;uniform float dark;float hash(float n){return fract(sin(n*127.1)*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/res;vec2 aspect=vec2(res.x/res.y,1.);vec2 pos=uv*aspect;vec2 m=mouse*aspect;float ink=0.;for(int i=0;i<35;i++){float f=float(i)+1.;vec2 q=vec2(hash(f),hash(f+30.))*aspect;q.y=mod(q.y+time*(.006+hash(f+12.)*.01),1.);q.x+=sin(time*.5+f)*.015;vec2 delta=q-m;float push=exp(-length(delta)*10.);q+=normalize(delta+vec2(.001))*push*.08;vec2 d=pos-q;float line=(1.-smoothstep(.0008,.002,abs(d.x+d.y*.5)))*(1.-smoothstep(.003+speed*.04,.005+speed*.04,abs(d.y)));ink+=line*(.12+dark*.2+speed*.3);}float age=clamp(burst,0.,2.5);float envelope=1.-smoothstep(.2,2.4,age);if(burst>=0.&&burst<2.5){for(int j=0;j<32;j++){float f=float(j);float angle=f*6.28318/32.;vec2 q=vec2(cos(angle),sin(angle))*age*(.08+hash(f+5.)*.15);vec2 d=pos-(burstOrigin*aspect+q);float ray=(1.-smoothstep(.001,.003,abs(d.x*cos(angle+1.5708)+d.y*sin(angle+1.5708))))*(1.-smoothstep(.006,.018,abs(d.x*cos(angle)+d.y*sin(angle))));ink+=ray*envelope;}}gl_FragColor=vec4(1.,.42,.1,clamp(ink,0.,.85));}`;function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader could not link');gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);['res','mouse','burstOrigin','time','speed','burst','dark'].forEach(k=>un[k]=gl.getUniformLocation(program,k));}}catch(e){gl=null;canvas.hidden=true;console.warn('Energy overlay unavailable; artwork remains active.')}
function present(i,visible,opacity=1,transform='none',interactive=false){const a=acts[i];a.style.visibility=visible?'visible':'hidden';a.style.opacity=opacity;a.style.transform=transform;a.style.pointerEvents=interactive?'auto':'none';a.inert=!interactive;a.setAttribute('aria-hidden',String(!interactive))}
function frame(now){requestAnimationFrame(frame);if(document.hidden||document.querySelector('#arcade')?.open)return;let dt=Math.min((now-last)/16.67,3)||1;last=now;const physical=clamp(scrollY/maxScroll()),raw=sceneProgress(physical*(journeyEnd+extraScroll));if(reduced){p=raw;scrollVelocity=0;}else{const seconds=dt/60,omega=8,error=p-raw,decay=Math.exp(-omega*seconds),term=(scrollVelocity+omega*error)*seconds;let next=raw+(error+term)*decay;scrollVelocity=(scrollVelocity-omega*term)*decay;const maxStep=seconds*(p<2.65?1.35:2.2);if(Math.abs(next-p)>maxStep){next=p+Math.sign(next-p)*maxStep;scrollVelocity=Math.sign(next-p)*maxStep/seconds;}p=next;if(Math.abs(raw-p)<.00005&&Math.abs(scrollVelocity)<.001){p=raw;scrollVelocity=0;}}speed+=(Math.abs(p-prior)*45-speed)*.12;prior=p;
if(reduced){activeIndex=acts.reduce((best,act,i)=>Math.abs(act.getBoundingClientRect().top)<Math.abs(acts[best].getBoundingClientRect().top)?i:best,0);acts.forEach(a=>{a.inert=false;a.removeAttribute('aria-hidden');a.style.pointerEvents='auto'});}else{
activeIndex=p<2.24?0:p<4.5?1:p<6.2?2:p<8.7?3:p<10.85?4:p<12.95?5:6;
const lens=window.typeTransition(p,w,h);
present(0,!lens.complete,1,'none',activeIndex===0);
portal.style.transform=lens.artTransform;welcome.style.transform='none';welcome.style.opacity=1;
$('.entrance-scout').style.visibility='inherit';$('.entrance-scout').style.transform='rotate(-12deg)';
document.body.classList.toggle('lens-passing',p>.2&&p<2.6);
const exit=ease((p-4.24)/.54);present(1,p>.04&&p<4.85,1-exit,`${p<2.6?lens.worldTransform:''} translateY(${-exit*38}vh) rotate(${exit*-5}deg) scale(${1+exit*.16})`,activeIndex===1);
$('.world-sky').style.transform=`translateY(${lens.revealOffset*-35}px)`;
const travel=clamp((p-2.6)/1.7);const width=panoramaTravel;panorama.style.transform=`translateX(${-travel*width}px)`;$('.world-scale i').style.left=travel*100+'%';$('#world-distance').textContent=String(Math.round(travel*999)).padStart(3,'0')+' m';$('.world-scout').style.opacity=1;$('.world-scout').style.transform=`translate(${Math.sin(travel*Math.PI*2)*w*(w<760?.035:.09)}px,${Math.sin(now*.0015)*9-travel*35}px) rotate(${-8+Math.sin(travel*6)*8}deg)`;
const captionIndex=Math.min(2,Math.floor(travel*3));captions.forEach((c,i)=>{c.style.display=i===captionIndex?'block':'none';c.setAttribute('aria-hidden',String(i!==captionIndex));});
const wen=ease((p-4.25)/.55),wout=ease((p-6.02)/.65);present(2,p>4.23&&p<6.76,wen,`translate(${(1-wen)*55-wout*12}vw,${(1-wen)*24+wout*8}vh) rotate(${(1-wen)*10-wout*8}deg)`,activeIndex===2);const workshopTravel=ease((p-4.72)/1.4);
 machine.style.transform=`translate(${mix(-1.8,1.8,workshopTravel)}%,${mix(12,-18,workshopTravel)+Math.sin(now*.001)*3}px) scale(${mix(1,1.12,workshopTravel)}) rotate(${mix(-.6,.6,workshopTravel)}deg)`;
 $('.workshop h2').style.transform=`translate(${workshopTravel*-1.4}vw,${workshopTravel*-18}px) rotate(-3deg)`;
 $('.workshop-top .hand').style.transform=`translateY(${workshopTravel*24}px) rotate(${5-workshopTravel*4}deg)`;
const den=ease((p-6.03)/.67),cut=ease((p-8.18)/.92);
present(3,p>6.02&&p<9.14,1,`translateX(${-cut*8}vw) scale(${1-cut*.055})`,activeIndex===3);acts[3].style.clipPath=`circle(${den*150}% at 78% 68%)`;
// A slanted drafting-paper edge travels across the dark laboratory.
const turn=ease((p-10.12)/1.05),wear=ease((p-8.95)/1.18);
present(4,p>8.18&&p<11.19,1,`perspective(${w*1.6}px) translateX(${-turn*110}%) rotateY(${-turn*45}deg)`,activeIndex===4);
const edge=112-cut*128;
acts[4].style.clipPath=`polygon(${edge}% 0,100% 0,100% 100%,${edge-8}% 100%,${edge-5}% 76%,${edge-7}% 51%,${edge-2}% 25%)`;
$('.pattern-edge').style.left=edge+'%';$('.pattern-edge').style.opacity=cut<.99?'1':'0';
$('.merch-copy').style.transform=`translate(${(1-cut)*40-wear*8}px,${wear*-12}px)`;
$('.merch-atelier').style.transform=`translateX(${wear*-2}%) scale(${1+wear*.035})`;
$('#fest-shirt').style.transform=`translateY(${(1-cut)*-h*.20+wear*-15}px) rotate(${mix(-7,5,wear)}deg) scale(${mix(.92,1.04,wear)})`;
document.querySelectorAll('.shirt-echo').forEach((el,i)=>{const offset=(i+1)*(1-ease((p-8.6)/.65));el.style.opacity=offset*.12;el.style.transform=`translate(${offset*-45}px,${offset*22}px) rotate(${-7-offset*9}deg) scale(${.92+offset*.12})`;});
const closeIn=ease((p-12.2)/1.18);
present(5,p>10.08&&p<13.42,1,`translateY(${-closeIn*12}vh) scale(${1-closeIn*.07})`,activeIndex===5);
$('.finale-scout').style.transform=`translateY(${Math.sin(now*.001)*10}px) rotate(${-10+Math.sin(now*.0008)*3}deg)`;$('.finale-world').style.transform=`translateX(${-clamp((p-11)/1.2)*4}vw)`;
// The last sheet opens upward from a folded diagonal seam.
present(6,p>12.2,1,'none',activeIndex===6);
const seam=112-closeIn*128;
acts[6].style.clipPath=`polygon(0 ${seam-9}%,25% ${seam-5}%,51% ${seam+1}%,76% ${seam-3}%,100% ${seam+5}%,100% 100%,0 100%)`;
$('.closing-copy').style.transform=`translateY(${(1-closeIn)*h*.28}px) rotate(${(1-closeIn)*-4}deg)`;
$('.closing-observatory').style.transform=`translateY(${(1-closeIn)*h*.14}px) scale(${1+(1-closeIn)*.18+clamp((p-13.4)/1.1)*.025})`;

}
document.body.classList.toggle('dark',activeIndex===3);document.body.classList.toggle('orange-scene',activeIndex===5);$('#chapter-number').textContent=String(activeIndex).padStart(2,'0');$('#chapter-name').textContent=names[activeIndex];chapterLinks.forEach((a,i)=>{a.classList.toggle('current',i===activeIndex);if(i===activeIndex)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});document.querySelectorAll('.floating-gear').forEach(el=>{el.style.animationPlayState=el.closest('.act')===acts[activeIndex]&&!reduced?'running':'paused'});const pc=Math.round(physical*100);$('#journey-percent').textContent=String(pc).padStart(2,'0')+'%';$('#progress').style.width=pc+'%';if(gl&&!reduced&&now-lastInkFrame>33){lastInkFrame=now;gl.uniform2f(un.res,canvas.width,canvas.height);gl.uniform2f(un.mouse,...mouse);gl.uniform2f(un.burstOrigin,...burstOrigin);gl.uniform1f(un.time,now/1000);gl.uniform1f(un.speed,clamp(speed));gl.uniform1f(un.burst,now/1000-burstAt);gl.uniform1f(un.dark,activeIndex===3?1:0);gl.drawArrays(gl.TRIANGLES,0,6)}}
let toastTimer;function discover(message){$('#discovery').textContent=message;$('#discovery').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#discovery').classList.remove('show'),4200)}
document.querySelectorAll('.discipline').forEach(b=>b.setAttribute('aria-label',b.querySelector('.full-name').textContent));const foundSparks=new Set();document.querySelectorAll('[data-spark]').forEach(button=>button.addEventListener('click',e=>{foundSparks.add(button.dataset.spark);button.classList.add('found');burstFrom(e,button);if(foundSparks.size===3){$('#gravity').hidden=false;discover('All 3 sparks found. You unlocked the gravity switch.')}else discover(`Lost spark ${foundSparks.size}/3 found. Keep looking in the margins.`)}));
$('#gravity').addEventListener('click',e=>{const off=document.body.classList.toggle('gravity-off');$('#gravity').textContent='Gravity: '+(off?'off':'on');$('#gravity').setAttribute('aria-pressed',String(off));burstFrom(e);discover(off?'Gravity has left the sketchbook.':'Back on solid paper.')});
let mascotTaps=0;document.querySelectorAll('.scout').forEach(img=>{img.setAttribute('role','button');img.tabIndex=0;img.setAttribute('aria-label','Play with the paper-plane mascot');const interact=e=>{mascotTaps++;burstFrom(e,img);if(!reduced){const start=img.style.transform||'none';img.animate([{transform:start},{transform:'rotate(-28deg) translateY(-35px)'},{transform:start}],{duration:650,easing:'ease-in-out'})}if(mascotTaps===3){$('#gravity').hidden=false;discover('Three taps. One secret. Gravity switch unlocked.')}else discover(mascotTaps===1?'Psst. I know a few tricks.':'One more nudge?')};img.addEventListener('click',interact);img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();interact(e)}})});
let secret='';addEventListener('keydown',e=>{if($('#arcade').open||e.ctrlKey||e.metaKey)return;secret=(secret+e.key.toLowerCase()).slice(-6);if(secret==='doodle'){$('#gravity').hidden=false;discover('Doodle club confirmed. Gravity switch unlocked.');burstFrom(null,$('#gravity'))}});

const festival=window.festivalContent;
if(festival.shirt.src){$('#fest-shirt').src=festival.shirt.src;$('#fest-shirt').alt=festival.shirt.alt;}
document.querySelectorAll('[data-social]').forEach(link=>{const url=festival.socials[link.dataset.social];if(url&&/^https:\/\//.test(url)){link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.removeAttribute('aria-disabled');link.setAttribute('aria-label',link.textContent.trim());}});
document.querySelectorAll('[data-fest-panel]').forEach(button=>button.addEventListener('click',()=>{
 const wasOpen=!button.closest('header')&&button.getAttribute('aria-expanded')==='true';document.querySelectorAll('[data-fest-panel]').forEach(b=>b.setAttribute('aria-expanded','false'));
 const area=$('#festival-details');area.replaceChildren();const text=document.createElement('p');
 if(wasOpen){text.textContent='Good things travel. Stay in the loop.';}else{document.querySelectorAll('[data-fest-panel]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.festPanel===button.dataset.festPanel)));const label=document.createElement('strong');label.textContent=button.dataset.festPanel==='competitions'?'COMPETITIONS / COMING SOON':'SCHEDULE / COMING SOON';area.append(label);text.textContent=festival[button.dataset.festPanel];}area.append(text);
 if(!reduced)area.animate([{transform:'translateY(8px)',opacity:.4},{transform:'translateY(0)',opacity:1}],{duration:300,easing:'ease-out'});
}));

setMotion(!reduced);resize();requestAnimationFrame(frame);
