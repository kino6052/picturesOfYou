(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=e=>e*Math.PI/180,t=e(-2.5),n=e(-32),r=e(52),i=16,a=1.1,o=7,s=90,c=2.5,l=e(1.2),u=.14,d=e(62),f=e(50),p=e(100),m=(e,t,n)=>Math.min(n,Math.max(t,e)),h=(e,t)=>1-Math.exp(-e*t);function g(e){let g=0,_=t,v=g,y=_,b=0,x=0,S=!1,C=0,w=0,T=0,E=0,D=0,O={yaw:g,pitch:_,eyeX:0,eyeY:0,eyeZ:0,fov:f,aspect:1,keyX:0,keyY:0,radiansPerPixel:e=>O.fov/e,startDrag(){S=!0,b=x=0},drag(e,t,i){g+=e,_=m(_+t,n,r);let a=Math.max(i-C,1)/1e3;b+=(e/a-b)*.4,x+=(t/a-x)*.4,C=i},endDrag(e){S=!1,e-C>s&&(b=x=0)},hover(e,t){w=e,T=t},update(t,s,C){let k=e.matches;O.aspect=s/C;let A=2*Math.atan(Math.tan(d/2)/O.aspect);if(O.fov=m(A,f,p),k)b=x=0,g-=O.keyX*a*t,_+=O.keyY*a*t;else if(!S){if(O.keyX!==0||O.keyY!==0)b+=(-O.keyX*a-b)*h(o,t),x+=(O.keyY*a-x)*h(o,t);else{let e=Math.exp(-3*t);b*=e,x*=e}g+=b*t,_+=x*t}(_<n||_>r)&&(_=m(_,n,r),x=0);let j=k?1:h(i,t);v+=(g-v)*j,y+=(_-y)*j;let M=h(c,t);E+=((k||S?0:w)-E)*M,D+=((k||S?0:T)-D)*M,O.yaw=v-E*l,O.pitch=y+D*l,O.eyeX=E*u*Math.cos(O.yaw),O.eyeY=D*u,O.eyeZ=-E*u*Math.sin(O.yaw)},ray(e,t,n){let r=Math.tan(O.fov/2),i=e*r*O.aspect,a=t*r,o=Math.sin(O.pitch),s=Math.cos(O.pitch),c=Math.sin(O.yaw),l=Math.cos(O.yaw),u=a*s+o,d=a*o-s,f=i*l+d*c,p=-i*c+d*l,m=Math.hypot(f,u,p);n[0]=O.eyeX,n[1]=O.eyeY,n[2]=O.eyeZ,n[3]=f/m,n[4]=u/m,n[5]=p/m}};return O}var _=[{label:`Fog`,amount:.28,on:!0},{label:`Motion echo`,amount:.5},{label:`Wave`,amount:.5},{label:`Blur`,amount:.3},{label:`Black and white`,amount:1},{label:`Film grain`,amount:.4},{label:`Chromatic aberration`,amount:.4},{label:`Bloom`,amount:.5},{label:`Vignette`,amount:.6},{label:`CRT scanlines`,amount:.5},{label:`VHS tracking`,amount:.5},{label:`Kaleidoscope`,amount:.4},{label:`Audio pulse`,amount:.6}],v=_.length-1,y={lightDirection:[0,-1,-1],lightDiffuse:1,materialDiffuse:[.5,.5,.5],effects:new Float32Array(_.length),pulse:0},b=3e3,x=e=>document.getElementById(e),S=e=>{let t=Math.floor(e||0);return`${Math.floor(t/60)}:${String(t%60).padStart(2,`0`)}`};function C(e){let[t,n]=[Number(e.min),Number(e.max)];e.style.setProperty(`--fill`,`${(e.valueAsNumber-t)/(n-t||1)*100}%`)}function w(e,t){let n=x(e),r=n.previousElementSibling,i=()=>{t(n.valueAsNumber),r.value=n.valueAsNumber.toFixed(2),C(n)};n.addEventListener(`input`,i),i()}function T(){[`light-x`,`light-y`,`light-z`].forEach((e,t)=>w(e,e=>y.lightDirection[t]=e)),w(`light-diffuse`,e=>y.lightDiffuse=e),x(`material`).addEventListener(`input`,e=>{let t=e.target.value;y.materialDiffuse=[1,3,5].map(e=>parseInt(t.slice(e,e+2),16)/255)})}function E(e){let t=x(`effects`);_.forEach((n,r)=>{let{label:i,amount:a}=n,o=document.createElement(`div`);o.className=`effect`,o.innerHTML=`
      <label><input type="checkbox" role="switch" /><span>${i}</span></label>
      <input type="range" min="0" max="1" step="0.01" value="${a}" aria-label="${i} amount" disabled />`,t.append(o);let s=o.querySelector(`[role=switch]`),c=o.querySelector(`[type=range]`);s.checked=`on`in n;let l=()=>{y.effects[r]=s.checked?c.valueAsNumber:0,c.disabled=!s.checked,C(c)};s.addEventListener(`change`,()=>{r===v&&s.checked&&e.enable(),l()}),c.addEventListener(`input`,l),l()})}function D(e,t){let n=x(`play`),r=x(`mute`),i=x(`seek`),a=x(`volume`),o=x(`elapsed`),s=x(`duration`),c=()=>{i.value=String(e.currentTime),i.setAttribute(`aria-valuetext`,S(e.currentTime)),o.textContent=S(e.currentTime),C(i)},l=()=>{n.classList.toggle(`on`,!e.paused),n.setAttribute(`aria-label`,e.paused?`Play`:`Pause`)},u=()=>{let t=e.muted||e.volume===0;r.classList.toggle(`on`,t),r.setAttribute(`aria-label`,t?`Unmute`:`Mute`),a.value=String(e.muted?0:e.volume),C(a)};e.addEventListener(`durationchange`,()=>{i.max=String(e.duration),s.textContent=S(e.duration)}),e.addEventListener(`timeupdate`,c),e.addEventListener(`play`,l),e.addEventListener(`pause`,l),e.addEventListener(`volumechange`,u),e.addEventListener(`progress`,()=>{let{buffered:t}=e,n=t.length?t.end(t.length-1):0;i.style.setProperty(`--buffered`,`${n/(e.duration||1)*100}%`)}),n.addEventListener(`click`,t.toggle),r.addEventListener(`click`,()=>{e.muted=!e.muted,!e.muted&&e.volume===0&&(e.volume=1)}),i.addEventListener(`input`,()=>{e.currentTime=i.valueAsNumber,c()}),a.addEventListener(`input`,()=>{e.volume=a.valueAsNumber,e.muted=e.volume===0}),u()}function O(e,t){let{body:n}=document,r=window.matchMedia(`(hover: hover)`),i=0,a=()=>{e.paused||t.querySelector(`:focus-visible`)||r.matches&&t.querySelector(`:hover`)?o():n.classList.add(`idle`)},o=()=>{n.classList.remove(`idle`),clearTimeout(i),i=window.setTimeout(a,b)};for(let e of[`pointermove`,`pointerdown`,`keydown`,`focusin`])window.addEventListener(e,o);e.addEventListener(`pause`,o),o()}function k(e,t,n,r){let i=x(`hud`),a=x(`panel`);T(),E(n),D(e,t),O(e,i),e.addEventListener(`playing`,()=>{document.body.classList.add(`started`),i.hidden=!1,r.focus({preventScroll:!0})},{once:!0}),window.addEventListener(`keydown`,n=>{let r=n.target instanceof HTMLElement&&n.target.closest(`button, input, summary`);n.key===`Escape`&&(a.open=!1),r||i.hidden||n.ctrlKey||n.metaKey||n.altKey||(n.key===` `?(n.preventDefault(),t.toggle()):n.key===`m`&&(e.muted=!e.muted))})}var A={x:0,y:0,active:!1},j={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};function M(e,t){let n=null,r=0,i=0,a=t=>{A.x=t.clientX/e.clientWidth*2-1,A.y=1-t.clientY/e.clientHeight*2,A.active=!0};e.addEventListener(`pointerdown`,o=>{n===null&&(n=o.pointerId,e.setPointerCapture(n),[r,i]=[o.clientX,o.clientY],a(o),t.startDrag())}),e.addEventListener(`pointermove`,o=>{if(o.pointerId===n){let n=t.radiansPerPixel(e.clientHeight);t.drag((o.clientX-r)*n,(o.clientY-i)*n,o.timeStamp),[r,i]=[o.clientX,o.clientY],a(o)}else n===null&&o.pointerType===`mouse`&&(a(o),t.hover(A.x,A.y))});let o=e=>{e.pointerId===n&&(n=null,t.endDrag(e.timeStamp),e.pointerType!==`mouse`&&(A.active=!1))};e.addEventListener(`pointerup`,o),e.addEventListener(`pointercancel`,o),e.addEventListener(`pointerleave`,()=>{n===null&&(A.active=!1)});let s=new Set,c=()=>{t.keyX=t.keyY=0;for(let e of s)t.keyX+=j[e][0],t.keyY+=j[e][1]};window.addEventListener(`keydown`,e=>{!(e.key in j)||e.target instanceof HTMLInputElement||(e.preventDefault(),s.add(e.key),c())}),window.addEventListener(`keyup`,e=>{s.delete(e.key),c()}),window.addEventListener(`blur`,()=>{s.clear(),c()})}async function N(e){let t=await fetch(e);if(!t.ok)throw Error(`${e}: HTTP ${t.status}`);let n=await t.arrayBuffer(),[r,i]=new Uint32Array(n,0,2),a=new Float32Array(n,8,r),o=new Uint16Array(n,8+r*4,i);return{vertices:a,indices:o,normals:P(a,o)}}function P(e,t){let n=new Float64Array(e.length);for(let r=0;r<t.length;r+=3){let[i,a,o]=[t[r]*3,t[r+1]*3,t[r+2]*3],[s,c,l]=[e[a]-e[i],e[a+1]-e[i+1],e[a+2]-e[i+2]],[u,d,f]=[e[o]-e[a],e[o+1]-e[a+1],e[o+2]-e[a+2]],p=[c*f-l*d,l*u-s*f,s*d-c*u];for(let e of[i,a,o])n[e]+=p[0],n[e+1]+=p[1],n[e+2]+=p[2]}for(let e=0;e<n.length;e+=3){let t=Math.hypot(n[e],n[e+1],n[e+2])||1;n[e]/=t,n[e+1]/=t,n[e+2]/=t}return Float32Array.from(n)}function ee(e,t,n,r){let i=!1,a=()=>{let{buffered:t,duration:n}=e;return t.length&&n?Math.round(t.end(t.length-1)/n*100):0};e.addEventListener(`progress`,()=>{e.readyState<e.HAVE_FUTURE_DATA&&r(`Loading video… ${a()}%`,!0)}),e.addEventListener(`canplay`,()=>r(null)),e.addEventListener(`waiting`,()=>r(`Loading video…`,!0)),e.addEventListener(`playing`,()=>{n.hidden=!0,r(null)}),e.addEventListener(`error`,()=>{n.hidden=!0,r(`The video could not be loaded. Reload the page to try again.`)});let o=()=>{e.play().catch(t=>{t.name!==`AbortError`&&!e.error&&(n.hidden=!1,r(null))})};return n.addEventListener(`click`,()=>{n.hidden=!0,e.readyState<e.HAVE_FUTURE_DATA&&r(`Loading video…`,!0),o()}),{load(){r(`Loading video…`,!0),n.hidden=!1,e.src=t,e.preload=`auto`,e.load()},play:o,toggle:()=>e.paused?o():e.pause(),suspend(){i=!e.paused,e.pause()},resume(){i&&o()}}}var F=5,I=.5,te=2.8;function L(e){let t,n,r=new Uint8Array,i=0;return{enable(){t??=new AudioContext,n||(n=t.createAnalyser(),n.fftSize=256,n.smoothingTimeConstant=.5,r=new Uint8Array(n.frequencyBinCount),t.createMediaElementSource(e).connect(n),n.connect(t.destination)),t.resume()},read(e){if(!n)return 0;n.getByteFrequencyData(r);let t=0;for(let e=0;e<F;e++)t+=r[e];let a=Math.max(t/1275-I,0)/.5;return i=Math.max(a,i-te*e),i}}}var ne=26,re=-1.6,ie=1.6,ae=4.4,oe=.42,se=.06,ce=.24,le=.62,ue=.3,de=1.05,fe=.7,pe=.32,me=.6,he=.9,ge=2.3,_e=.28,ve=.17,ye=15,be=7,R=(e,t)=>e+Math.random()*(t-e);function xe(e){let[t,n,r]=[new Float32Array(e),new Float32Array(e),new Float32Array(e)],[i,a,o]=[new Float32Array(e),new Float32Array(e),new Float32Array(e)],[s,c,l]=[new Float32Array(e),new Float32Array(e),new Float32Array(e)],[u,d,f]=[new Float32Array(e),new Float32Array(e),new Float32Array(e)],[p,m]=[new Float32Array(e),new Float32Array(e)],[h,g,_]=[new Float32Array(e),new Float32Array(e),new Float32Array(e)],v=new Float32Array(e*6),y=new Float32Array(e*2),b=0,x=0;function S(e){for(;;){let n=ie+13.4*Math.random()**1.45,i=R(-Math.PI,Math.PI);if(!(n<ae&&Math.abs(i)<oe&&Math.random()>se)){t[e]=Math.sin(i)*n,r[e]=-Math.cos(i)*n;return}}}for(let t=0;t<e;t++)S(t),n[t]=R(re,8),s[t]=R(0,Math.PI*2),c[t]=R(0,Math.PI*2),l[t]=R(0,Math.PI*2),u[t]=R(-.7,fe),d[t]=R(-.7,fe),f[t]=R(-.7,fe)*.5,h[t]=R(ue,de),g[t]=R(0,Math.PI*2),_[t]=R(he,ge),y[t*2]=t%ne,y[t*2+1]=R(ce,le);return{count:e,instances:v,looks:y,update(y,C,w,T){let E=y*C;b+=E,x+=(+!!T-x)*(1-Math.exp(-7*y));let D=w[0],O=w[1],k=w[2],A=w[3],j=w[4],M=w[5],N=Math.exp(-2.4*y),P=Math.exp(-1.5*y),ee=ye*x*y;for(let w=0;w<e;w++){let e=b*_[w]+g[w],T=Math.sin(e),F=Math.cos(e);n[w]-=h[w]*(.75+.5*T*T)*E,s[w]+=(u[w]*C+p[w])*y,c[w]+=d[w]*E,l[w]+=(f[w]*C+m[w])*y;let I=t[w]+pe*T,te=r[w]+pe*.6*F;if(x>.001){let e=I-D,t=n[w]-O,r=te-k,s=e*A+t*j+r*M,c=e-s*A,l=t-s*j,u=r-s*M,d=c*c+l*l+u*u,f=_e+s*ve;if(s>0&&d<f*f){let e=Math.sqrt(d)||.001,t=1-d/(f*f),n=ee*f*t*t;i[w]+=c/e*n,a[w]+=l/e*n,o[w]+=u/e*n,p[w]+=l/e*n*be,m[w]-=c/e*n*be}}t[w]+=i[w]*y,n[w]+=a[w]*y,r[w]+=o[w]*y,i[w]*=N,a[w]*=N,o[w]*=N,p[w]*=P,m[w]*=P,n[w]<-1.6&&(S(w),n[w]=8,i[w]=a[w]=o[w]=p[w]=m[w]=0);let L=w*6;v[L]=I,v[L+1]=n[w],v[L+2]=te,v[L+3]=s[w]+me*T,v[L+4]=c[w],v[L+5]=l[w]+me*.5*F}}}}var Se=typeof Float32Array<`u`?Float32Array:Array;function z(){var e=new Se(16);return Se!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function Ce(e,t){if(e===t){var n=t[1],r=t[2],i=t[3],a=t[6],o=t[7],s=t[11];e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=n,e[6]=t[9],e[7]=t[13],e[8]=r,e[9]=a,e[11]=t[14],e[12]=i,e[13]=o,e[14]=s}else e[0]=t[0],e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=t[1],e[5]=t[5],e[6]=t[9],e[7]=t[13],e[8]=t[2],e[9]=t[6],e[10]=t[10],e[11]=t[14],e[12]=t[3],e[13]=t[7],e[14]=t[11],e[15]=t[15];return e}function we(e,t){var n=t[0],r=t[1],i=t[2],a=t[3],o=t[4],s=t[5],c=t[6],l=t[7],u=t[8],d=t[9],f=t[10],p=t[11],m=t[12],h=t[13],g=t[14],_=t[15],v=n*s-r*o,y=n*c-i*o,b=n*l-a*o,x=r*c-i*s,S=r*l-a*s,C=i*l-a*c,w=u*h-d*m,T=u*g-f*m,E=u*_-p*m,D=d*g-f*h,O=d*_-p*h,k=f*_-p*g,A=v*k-y*O+b*D+x*E-S*T+C*w;return A?(A=1/A,e[0]=(s*k-c*O+l*D)*A,e[1]=(i*O-r*k-a*D)*A,e[2]=(h*C-g*S+_*x)*A,e[3]=(f*S-d*C-p*x)*A,e[4]=(c*E-o*k-l*T)*A,e[5]=(n*k-i*E+a*T)*A,e[6]=(g*b-m*C-_*y)*A,e[7]=(u*C-f*b+p*y)*A,e[8]=(o*O-s*E+l*w)*A,e[9]=(r*E-n*O-a*w)*A,e[10]=(m*S-h*b+_*v)*A,e[11]=(d*b-u*S-p*v)*A,e[12]=(s*T-o*D-c*w)*A,e[13]=(n*D-r*T+i*w)*A,e[14]=(h*y-m*x-g*v)*A,e[15]=(u*x-d*y+f*v)*A,e):null}function B(e,t,n){var r=t[0],i=t[1],a=t[2],o=t[3],s=t[4],c=t[5],l=t[6],u=t[7],d=t[8],f=t[9],p=t[10],m=t[11],h=t[12],g=t[13],_=t[14],v=t[15],y=n[0],b=n[1],x=n[2],S=n[3];return e[0]=y*r+b*s+x*d+S*h,e[1]=y*i+b*c+x*f+S*g,e[2]=y*a+b*l+x*p+S*_,e[3]=y*o+b*u+x*m+S*v,y=n[4],b=n[5],x=n[6],S=n[7],e[4]=y*r+b*s+x*d+S*h,e[5]=y*i+b*c+x*f+S*g,e[6]=y*a+b*l+x*p+S*_,e[7]=y*o+b*u+x*m+S*v,y=n[8],b=n[9],x=n[10],S=n[11],e[8]=y*r+b*s+x*d+S*h,e[9]=y*i+b*c+x*f+S*g,e[10]=y*a+b*l+x*p+S*_,e[11]=y*o+b*u+x*m+S*v,y=n[12],b=n[13],x=n[14],S=n[15],e[12]=y*r+b*s+x*d+S*h,e[13]=y*i+b*c+x*f+S*g,e[14]=y*a+b*l+x*p+S*_,e[15]=y*o+b*u+x*m+S*v,e}function Te(e,t,n){var r=n[0],i=n[1],a=n[2],o,s,c,l,u,d,f,p,m,h,g,_;return t===e?(e[12]=t[0]*r+t[4]*i+t[8]*a+t[12],e[13]=t[1]*r+t[5]*i+t[9]*a+t[13],e[14]=t[2]*r+t[6]*i+t[10]*a+t[14],e[15]=t[3]*r+t[7]*i+t[11]*a+t[15]):(o=t[0],s=t[1],c=t[2],l=t[3],u=t[4],d=t[5],f=t[6],p=t[7],m=t[8],h=t[9],g=t[10],_=t[11],e[0]=o,e[1]=s,e[2]=c,e[3]=l,e[4]=u,e[5]=d,e[6]=f,e[7]=p,e[8]=m,e[9]=h,e[10]=g,e[11]=_,e[12]=o*r+u*i+m*a+t[12],e[13]=s*r+d*i+h*a+t[13],e[14]=c*r+f*i+g*a+t[14],e[15]=l*r+p*i+_*a+t[15]),e}function Ee(e,t,n){var r=n[0],i=n[1],a=n[2];return e[0]=t[0]*r,e[1]=t[1]*r,e[2]=t[2]*r,e[3]=t[3]*r,e[4]=t[4]*i,e[5]=t[5]*i,e[6]=t[6]*i,e[7]=t[7]*i,e[8]=t[8]*a,e[9]=t[9]*a,e[10]=t[10]*a,e[11]=t[11]*a,e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e}function De(e,t,n){var r=Math.sin(n),i=Math.cos(n),a=t[0],o=t[1],s=t[2],c=t[3],l=t[8],u=t[9],d=t[10],f=t[11];return t!==e&&(e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=a*i-l*r,e[1]=o*i-u*r,e[2]=s*i-d*r,e[3]=c*i-f*r,e[8]=a*r+l*i,e[9]=o*r+u*i,e[10]=s*r+d*i,e[11]=c*r+f*i,e}function Oe(e,t){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=t[0],e[13]=t[1],e[14]=t[2],e[15]=1,e}function ke(e,t){var n=Math.sin(t),r=Math.cos(t);return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=r,e[6]=n,e[7]=0,e[8]=0,e[9]=-n,e[10]=r,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function Ae(e,t,n,r,i){var a=1/Math.tan(t/2);if(e[0]=a/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,i!=null&&i!==1/0){var o=1/(r-i);e[10]=(i+r)*o,e[14]=2*i*r*o}else e[10]=-1,e[14]=-2*r;return e}var je=Ae,Me=`/*
 * Distance fog, put in front of each scene fragment shader. Its colors are measured from the
 * sky: the band just above the horizon, and higher up.
 */
#ifdef GL_ES
precision highp float;
#endif

uniform float uFogDensity;

const vec3 FOG_HORIZON = vec3(0.38, 0.52, 0.64);
const vec3 FOG_HIGH = vec3(0.56, 0.65, 0.74);

vec3 fogColor(vec3 direction) {
  return mix(FOG_HORIZON, FOG_HIGH, clamp(direction.y * 1.6, 0.0, 1.0));
}

float fogAmount(float distance) {
  float depth = distance * uFogDensity;
  return 1.0 - exp(-depth * depth);
}
`,Ne=`/*
 * Vertex shader implementing Gouraud shading with Lambert lighting
 */

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec3 uLightDirection;
uniform vec4 uLightDiffuse;
uniform vec4 uMaterialDiffuse;

varying vec2 vTextureCoord;
varying vec4 vFinalColor;
varying float vDistance;

void main(void) {
  // World space, so turning the camera doesn't move the light
  vec3 N = normalize(vec3(uNMatrix * vec4(aVertexNormal, 1.0)));
  vec3 L = normalize(uLightDirection);

  // Lambert term: dot product of the normal and the light direction
  float lambertTerm = dot(N, -L);

  vFinalColor = uMaterialDiffuse * uLightDiffuse * lambertTerm;
  vFinalColor.a = 1.0;
  vTextureCoord = aTextureCoord;

  vec4 fromEye = uMVMatrix * vec4(aVertexPosition, 1.0);
  vDistance = length(fromEye.xyz);
  gl_Position = uPMatrix * fromEye;
}
`,Pe=`/*
 * Primary fragment shader: a texture, or the lit color from the vertex shader
 */

uniform sampler2D uSampler;
uniform bool uIsTextureEnabled;

varying vec2 vTextureCoord;
varying vec4 vFinalColor;
varying float vDistance;

void main(void) {
  vec4 color = uIsTextureEnabled ? texture2D(uSampler, vTextureCoord) : vFinalColor;
  gl_FragColor = vec4(mix(color.rgb, FOG_HORIZON, fogAmount(vDistance)), 1.0);
}
`,Fe=`/*
 * Polaroid vertex shader. Every picture is one instance of the same quad:
 * its position and turn change each frame, its tile and size never do.
 */

attribute vec3 aVertexPosition;
attribute vec3 aInstancePosition;
attribute vec3 aInstanceTurn;
attribute vec2 aInstanceLook;

uniform mat4 uViewProjection;
uniform vec3 uEye;
uniform vec3 uLightDirection;
uniform float uLightDiffuse;
uniform vec2 uAtlasGrid;
uniform vec2 uFallRange;

varying vec2 vTextureCoord;
varying float vShade;
varying vec3 vFromEye;

mat3 turnMatrix(vec3 turn) {
  vec3 s = sin(turn);
  vec3 c = cos(turn);
  return mat3(
    c.y * c.z, c.x * s.z + s.x * s.y * c.z, s.x * s.z - c.x * s.y * c.z,
    -c.y * s.z, c.x * c.z - s.x * s.y * s.z, s.x * c.z + c.x * s.y * s.z,
    s.y, -s.x * c.y, c.x * c.y
  );
}

void main(void) {
  mat3 turn = turnMatrix(aInstanceTurn);

  // Pictures shrink away at the ground and grow in at the top, rather than pop.
  float y = aInstancePosition.y;
  float size = aInstanceLook.y * smoothstep(uFallRange.x, uFallRange.x + 0.35, y)
    * smoothstep(uFallRange.y, uFallRange.y - 0.9, y);

  // A polaroid is a little taller than it is wide.
  vec3 corner = vec3(aVertexPosition.xy * vec2(0.8333, 1.0) * size, 0.0);
  vec3 world = aInstancePosition + turn * corner;

  float tile = aInstanceLook.x;
  vec2 cell = vec2(mod(tile, uAtlasGrid.x), floor(tile / uAtlasGrid.x));
  vTextureCoord = (cell + vec2(aVertexPosition.x + 0.5, 0.5 - aVertexPosition.y)) / uAtlasGrid;

  // Paper catches the light as it turns, whichever side faces up.
  float facing = abs(dot(turn[2], normalize(uLightDirection)));
  vShade = (0.62 + 0.5 * facing) * uLightDiffuse;
  vFromEye = world - uEye;

  gl_Position = uViewProjection * vec4(world, 1.0);
}
`,Ie=`/*
 * Polaroid fragment shader. The photo shows on both sides: blank backs read as litter.
 */

uniform sampler2D uAtlas;

varying vec2 vTextureCoord;
varying float vShade;
varying vec3 vFromEye;

void main(void) {
  // The bias keeps small photos crisp.
  vec3 color = texture2D(uAtlas, vTextureCoord, -0.5).rgb * vShade;
  float distance = length(vFromEye);
  gl_FragColor = vec4(mix(color, fogColor(vFromEye / distance), fogAmount(distance)), 1.0);
}
`,Le=`/*
 * Skybox vertex shader: a full-screen quad on the far plane. Each corner works out
 * which way it looks, so the sky turns with the camera and never gets closer.
 */

attribute vec3 aVertexPosition;

uniform mat4 uInverseViewProjection;

varying vec3 vDirection;

void main(void) {
  vec4 corner = vec4(aVertexPosition.xy * 2.0, 1.0, 1.0);
  vDirection = (uInverseViewProjection * corner).xyz;
  gl_Position = corner;
}
`,Re=`/*
 * Skybox fragment shader. The ground in the cube map gets the same fog as everything else, as
 * if it were a plane under the viewer. It reaches full fog at the horizon, and the sky starts
 * from full fog there and clears with height, so the two meet with no line between them.
 */

uniform samplerCube uSky;
uniform float uFogHeight;

varying vec3 vDirection;

const float EYE_HEIGHT = 1.6;

void main(void) {
  vec3 direction = normalize(vDirection);
  float fog = direction.y < 0.0
    ? fogAmount(EYE_HEIGHT / max(-direction.y, 0.001))
    : exp(-direction.y * uFogHeight);
  if (uFogDensity <= 0.0) fog = 0.0;
  gl_FragColor = vec4(mix(textureCube(uSky, direction).rgb, fogColor(direction), fog), 1.0);
}
`,ze=`/*
 * Post-processing vertex shader: the quad covers the viewport exactly, one texel per pixel
 */

attribute vec3 aVertexPosition;

varying vec2 vTextureCoord;

void main(void) {
  vTextureCoord = aVertexPosition.xy + 0.5;
  gl_Position = vec4(aVertexPosition.xy * 2.0, 0.0, 1.0);
}
`,Be=`/*
 * Post-processing fragment shader: every effect in one pass.
 * An effect at 0 is skipped, and all of them start at 0, so by default this is a single
 * texture read. uEffects follows EFFECTS in src/settings.ts; fog and motion echo work earlier on.
 */
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;

uniform float uEffects[13];
uniform float uPulse;
uniform float uTime;
uniform float uPixelRatio;
uniform vec2 uRoundness; // turns screen coordinates into ones where circles are round

#define WAVE uEffects[2]
#define BLUR uEffects[3]
#define MONO uEffects[4]
#define GRAIN uEffects[5]
#define ABERRATION uEffects[6]
#define BLOOM uEffects[7]
#define VIGNETTE uEffects[8]
#define SCANLINES uEffects[9]
#define VHS uEffects[10]
#define KALEIDOSCOPE uEffects[11]

const float TAU = 6.2831853;

varying vec2 vTextureCoord;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

// Mirrors at the edges, so anything that moves the picture has something to show there.
vec2 mirrored(vec2 coord) {
  return 1.0 - abs(1.0 - mod(coord, 2.0));
}

// Blur grows with the distance from the center. The center sample counts double;
// the ring samples all sit on the radius, so each one weighs exp(-1).
vec3 blurred(vec2 coord, float radius) {
  const int SAMPLES = 16;
  const float RING_WEIGHT = 0.36787944;
  vec3 sum = texture2D(uSampler, coord).rgb * 2.0;
  for (int i = 0; i < SAMPLES; i++) {
    float a = float(i) * TAU / float(SAMPLES);
    sum += texture2D(uSampler, coord + vec2(cos(a), sin(a)) * radius / uRoundness).rgb * RING_WEIGHT;
  }
  return sum / (2.0 + float(SAMPLES) * RING_WEIGHT);
}

vec3 picture(vec2 coord, float radius) {
  return radius > 0.0 ? blurred(coord, radius) : texture2D(uSampler, coord).rgb;
}

// What's bright enough to glow, gathered from two rings around a point.
vec3 glow(vec2 coord) {
  vec3 sum = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * TAU / 8.0;
    vec2 direction = vec2(cos(a), sin(a)) / uRoundness;
    sum += max(texture2D(uSampler, coord + direction * 0.009).rgb - 0.6, 0.0);
    sum += max(texture2D(uSampler, coord + direction * 0.022).rgb - 0.6, 0.0) * 0.7;
  }
  return sum / 8.0;
}

void main(void) {
  vec2 center = vec2(0.5, 0.5);
  vec2 coord = vTextureCoord;

  // The beat pushes the whole picture towards the viewer.
  coord = center + (coord - center) * (1.0 - 0.05 * uPulse);

  if (KALEIDOSCOPE > 0.0) {
    vec2 round = (coord - center) * uRoundness;
    float segment = TAU / (2.0 * floor(mix(2.0, 7.0, KALEIDOSCOPE)));
    float angle = mod(atan(round.y, round.x) + uTime * 0.04, segment);
    angle = abs(angle - segment * 0.5);
    coord = mirrored(center + length(round) * vec2(cos(angle), sin(angle)) / uRoundness);
  }

  // Tracking errors: a shaky picture, and a torn band rolling up it.
  float band = 0.0;
  if (VHS > 0.0) {
    float line = floor(vTextureCoord.y * 260.0);
    float beat = floor(uTime * 7.0);
    band = smoothstep(0.07, 0.0, abs(vTextureCoord.y - fract(uTime * 0.05 + 0.2)));
    coord.x += (rand(vec2(line, beat)) - 0.5) * 0.007 * VHS;
    coord.x += band * sin(vTextureCoord.y * 120.0 + uTime * 11.0) * 0.04 * VHS;
    coord = mirrored(coord);
  }

  vec2 toCenter = coord - center;
  float dist = length(toCenter * uRoundness);

  // Radial wave distortion: expanding circles around the center of the screen
  if (WAVE > 0.0) {
    float wave = sin(dist * 20.0 - uTime * 2.0) * 0.03 * WAVE;
    coord = mirrored(center + toCenter * (1.0 + wave));
  }

  float blurRadius = dist * BLUR * 0.06;
  vec3 color = picture(coord, blurRadius);

  // Red and blue drift apart towards the edges, or sideways on a worn tape.
  if (ABERRATION > 0.0 || VHS > 0.0) {
    vec2 split = toCenter * ABERRATION * 0.035 + vec2(0.0035 * VHS, 0.0);
    color.r = picture(mirrored(coord + split), blurRadius).r;
    color.b = picture(mirrored(coord - split), blurRadius).b;
  }

  float glowAmount = BLOOM + uPulse * 0.5;
  if (glowAmount > 0.0) {
    color += glow(coord) * glowAmount * 1.6;
  }

  color *= 1.0 + uPulse * 0.14;

  if (MONO > 0.0) {
    color = mix(color, vec3(color.r), MONO);
  }

  if (VHS > 0.0) {
    color += band * VHS * rand(vec2(gl_FragCoord.y, uTime)) * 0.3;
  }

  if (SCANLINES > 0.0) {
    float scan = sin(gl_FragCoord.y * 3.14159 / (1.5 * uPixelRatio));
    color *= 1.0 - SCANLINES * 0.55 * scan * scan;
  }

  if (VIGNETTE > 0.0) {
    color *= 1.0 - VIGNETTE * 0.9 * smoothstep(0.2, 0.72, length((vTextureCoord - center) * uRoundness));
  }

  if (GRAIN > 0.0) {
    color += (rand(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * GRAIN * 0.28;
  }

  gl_FragColor = vec4(color, 1.0);
}
`,Ve=`/*
 * Motion echo: this frame over what's left of the frames before it. The result is the next
 * frame's history, so anything that moves leaves a trail fading away behind it.
 */
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uCurrent;
uniform sampler2D uHistory;
uniform float uPersistence;

varying vec2 vTextureCoord;

void main(void) {
  vec3 now = texture2D(uCurrent, vTextureCoord).rgb;
  vec3 before = texture2D(uHistory, vTextureCoord).rgb;
  gl_FragColor = vec4(mix(now, before, uPersistence), 1.0);
}
`,V=0,He=1,Ue=2,H=3,U=4,We=5,Ge={aVertexPosition:V,aVertexNormal:He,aTextureCoord:Ue,aInstancePosition:H,aInstanceTurn:U,aInstanceLook:We},Ke=[-.5,-.5,0,.5,-.5,0,-.5,.5,0,.5,.5,0],qe=[0,1,1,1,0,0,1,0],W=[0,2,1,1,2,3],Je=[0,re,-4.4],Ye=[1.25,1.25,1.25],Xe=-.16,Ze=[.6,.6,.6],Qe=[-.245,.65,.424],$e=[1.4,.95,0],et=.16,tt=2.5,nt=.02,rt=1.6,it=.92,at=.1,ot=200,st=4,ct=[WebGL2RenderingContext.DEPTH_ATTACHMENT];function G(e,t,n,r){let i=e.createProgram();for(let[r,a]of[[e.VERTEX_SHADER,t],[e.FRAGMENT_SHADER,n]]){let t=e.createShader(r);if(e.shaderSource(t,a),e.compileShader(t),e.attachShader(i,t),!e.getShaderParameter(t,e.COMPILE_STATUS)&&!e.isContextLost())throw Error(`Shader error: ${e.getShaderInfoLog(t)}`)}for(let[t,n]of Object.entries(Ge))e.bindAttribLocation(i,n,t);if(e.linkProgram(i),!e.getProgramParameter(i,e.LINK_STATUS)&&!e.isContextLost())throw Error(`Program error: ${e.getProgramInfoLog(i)}`);return{program:i,uniforms:Object.fromEntries(r.map(t=>[t,e.getUniformLocation(i,t)]))}}function K(e,t,n){let r=e.createBuffer();return e.bindBuffer(t,r),e.bufferData(t,n,e.STATIC_DRAW),r}function q(e,t,n,r){e.bindBuffer(e.ARRAY_BUFFER,r),e.vertexAttribPointer(t,n,e.FLOAT,!1,0,0),e.enableVertexAttribArray(t)}function J(e,t=e.TEXTURE_2D){let n=e.createTexture();return e.bindTexture(t,n),e.texParameteri(t,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(t,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.LINEAR),n}function lt(e,t){let n=J(e);e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR);let r=e.getExtension(`EXT_texture_filter_anisotropic`);return r&&e.texParameterf(e.TEXTURE_2D,r.TEXTURE_MAX_ANISOTROPY_EXT,8),n}function ut(e,t){let n=J(e,e.TEXTURE_CUBE_MAP);return t.forEach((t,n)=>e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t)),n}function dt(e,t,n){let r=Math.min(st,e.getParameter(e.MAX_SAMPLES)),i=e.createRenderbuffer();e.bindRenderbuffer(e.RENDERBUFFER,i),e.renderbufferStorageMultisample(e.RENDERBUFFER,r,e.RGBA8,t,n);let a=e.createRenderbuffer();e.bindRenderbuffer(e.RENDERBUFFER,a),e.renderbufferStorageMultisample(e.RENDERBUFFER,r,e.DEPTH_COMPONENT24,t,n);let o=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,i),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,a);let s=J(e);e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,n,0,e.RGBA,e.UNSIGNED_BYTE,null);let c=e.createFramebuffer();if(e.bindFramebuffer(e.FRAMEBUFFER,c),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,s,0),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE&&!e.isContextLost())throw Error(`Could not create the offscreen framebuffer`);return{width:t,height:n,color:i,depth:a,scene:o,texture:s,resolved:c}}function ft(e,t,n){let r=e.getExtension(`EXT_color_buffer_float`)!==null;return{float:r,buffers:[0,1].map(()=>{let i=J(e);r?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,t,n,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,n,0,e.RGBA,e.UNSIGNED_BYTE,null);let a=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,a),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0),{texture:i,framebuffer:a}}),latest:0}}function pt(e,{model:t,sky:n,atlas:r},i){let a=G(e,Ne,Me+Pe,[`uFogDensity`,`uPMatrix`,`uMVMatrix`,`uNMatrix`,`uMaterialDiffuse`,`uLightDiffuse`,`uLightDirection`,`uIsTextureEnabled`]),o=G(e,Fe,Me+Ie,[`uFogDensity`,`uViewProjection`,`uEye`,`uLightDirection`,`uLightDiffuse`,`uAtlasGrid`,`uFallRange`]),s=G(e,Le,Me+Re,[`uFogDensity`,`uFogHeight`,`uInverseViewProjection`]),c=G(e,ze,Ve,[`uCurrent`,`uHistory`,`uPersistence`]),l=G(e,ze,Be,[`uEffects`,`uPulse`,`uTime`,`uPixelRatio`,`uRoundness`]),u=e.createVertexArray();e.bindVertexArray(u);let d=K(e,e.ARRAY_BUFFER,new Float32Array(Ke));q(e,V,3,d),q(e,Ue,2,K(e,e.ARRAY_BUFFER,new Float32Array(qe)));let f=K(e,e.ELEMENT_ARRAY_BUFFER,new Uint16Array(W)),p=e.createVertexArray();e.bindVertexArray(p),q(e,V,3,d),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,f);let m=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,m),e.bufferData(e.ARRAY_BUFFER,i.instances.byteLength,e.DYNAMIC_DRAW),e.vertexAttribPointer(H,3,e.FLOAT,!1,24,0),e.vertexAttribPointer(U,3,e.FLOAT,!1,24,12),e.enableVertexAttribArray(H),e.enableVertexAttribArray(U),q(e,We,2,K(e,e.ARRAY_BUFFER,i.looks));for(let t of[H,U,We])e.vertexAttribDivisor(t,1);let h=e.createVertexArray();e.bindVertexArray(h),q(e,V,3,K(e,e.ARRAY_BUFFER,t.vertices)),q(e,He,3,K(e,e.ARRAY_BUFFER,t.normals)),K(e,e.ELEMENT_ARRAY_BUFFER,t.indices),e.bindVertexArray(null);let g=ut(e,n),_=lt(e,r),v=J(e);e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));let y=-1,b=dt(e,e.drawingBufferWidth,e.drawingBufferHeight),x,S=!0;e.useProgram(c.program),e.uniform1i(c.uniforms.uCurrent,0),e.uniform1i(c.uniforms.uHistory,1);let C=z(),w=z(),T=z(),E=z(),D=z(),O=z(),k=z(),A=z(),j=z(),M=[0,0,0];Oe(O,Je),De(O,O,Xe),Ee(O,O,Ye),e.clearColor(0,0,0,1),e.enable(e.DEPTH_TEST),e.depthFunc(e.LEQUAL);let N=()=>{let t=e.drawingBufferWidth,n=e.drawingBufferHeight;if(t===b.width&&n===b.height)return!1;e.deleteTexture(b.texture),e.deleteRenderbuffer(b.color),e.deleteRenderbuffer(b.depth),e.deleteFramebuffer(b.scene),e.deleteFramebuffer(b.resolved),b=dt(e,t,n);for(let t of x?.buffers??[])e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer);return x=void 0,!0},P=(n,r,i)=>{let{uniforms:o}=a,s=r.lightDiffuse,c=r.materialDiffuse;e.useProgram(a.program),e.uniform1f(o.uFogDensity,i),e.uniformMatrix4fv(o.uPMatrix,!1,C),e.uniform3fv(o.uLightDirection,r.lightDirection),e.uniform4f(o.uLightDiffuse,s,s,s,1),e.uniform4f(o.uMaterialDiffuse,c[0],c[1],c[2],1),e.bindTexture(e.TEXTURE_2D,v),n.readyState>=n.HAVE_CURRENT_DATA&&n.currentTime!==y&&(e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n),y=n.currentTime),Te(A,O,Qe),Ee(A,A,$e),B(A,T,A),e.uniformMatrix4fv(o.uMVMatrix,!1,A),e.uniform1i(o.uIsTextureEnabled,1),e.bindVertexArray(u),e.drawElements(e.TRIANGLES,W.length,e.UNSIGNED_SHORT,0),Ee(k,O,Ze),we(j,k),Ce(j,j),B(A,T,k),e.uniformMatrix4fv(o.uMVMatrix,!1,A),e.uniformMatrix4fv(o.uNMatrix,!1,j),e.uniform1i(o.uIsTextureEnabled,0),e.bindVertexArray(h),e.drawElements(e.TRIANGLES,t.indices.length,e.UNSIGNED_SHORT,0)},ee=(t,n,r)=>{let{uniforms:a}=o;e.useProgram(o.program),e.uniform1f(a.uFogDensity,r),B(E,C,T),e.uniformMatrix4fv(a.uViewProjection,!1,E),e.uniform3f(a.uEye,t.eyeX,t.eyeY,t.eyeZ),e.uniform3fv(a.uLightDirection,n.lightDirection),e.uniform1f(a.uLightDiffuse,Math.max(n.lightDiffuse,0)),e.uniform2f(a.uAtlasGrid,6,5),e.uniform2f(a.uFallRange,re,8),e.bindBuffer(e.ARRAY_BUFFER,m),e.bufferSubData(e.ARRAY_BUFFER,0,i.instances),e.bindTexture(e.TEXTURE_2D,_),e.bindVertexArray(p),e.drawElementsInstanced(e.TRIANGLES,W.length,e.UNSIGNED_SHORT,0,i.count)},F=(t,n)=>{e.useProgram(s.program),e.uniform1f(s.uniforms.uFogDensity,t),e.uniform1f(s.uniforms.uFogHeight,tt/Math.max(n,.01)),B(D,C,w),we(D,D),e.uniformMatrix4fv(s.uniforms.uInverseViewProjection,!1,D),e.bindTexture(e.TEXTURE_CUBE_MAP,g),e.bindVertexArray(u),e.drawElements(e.TRIANGLES,W.length,e.UNSIGNED_SHORT,0)},I=(t,n)=>{x??=ft(e,b.width,b.height);let r=x.buffers[x.latest];x.latest=1-x.latest;let i=x.buffers[x.latest],a=nt*(rt/nt)**t,o=Math.exp(-n/a),s=x.float?1:it;return e.bindFramebuffer(e.FRAMEBUFFER,i.framebuffer),e.viewport(0,0,b.width,b.height),e.useProgram(c.program),e.uniform1f(c.uniforms.uPersistence,S?0:Math.min(o,s)),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,r.texture),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,b.texture),e.bindVertexArray(u),e.drawElements(e.TRIANGLES,W.length,e.UNSIGNED_SHORT,0),S=!1,i.texture};return function({camera:t,seconds:n,time:r,pixelRatio:i,video:a,settings:o}){N()&&(S=!0);let s=o.effects[0],c=s*et;je(C,t.fov,t.aspect,at,ot),ke(w,-t.pitch),De(w,w,-t.yaw),M[0]=-t.eyeX,M[1]=-t.eyeY,M[2]=-t.eyeZ,Te(T,w,M),e.bindFramebuffer(e.FRAMEBUFFER,b.scene),e.viewport(0,0,b.width,b.height),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),P(a,o,c),ee(t,o,c),F(c,s),e.bindFramebuffer(e.READ_FRAMEBUFFER,b.scene),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,b.resolved),e.blitFramebuffer(0,0,b.width,b.height,0,0,b.width,b.height,e.COLOR_BUFFER_BIT,e.NEAREST),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,ct);let d=o.effects[1],f=d>0?I(d,n):b.texture;S||=d===0,e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,b.width,b.height),e.useProgram(l.program);let p=Math.hypot(t.aspect,1)/Math.SQRT2;e.uniform2f(l.uniforms.uRoundness,t.aspect/p,1/p),e.uniform1fv(l.uniforms.uEffects,o.effects),e.uniform1f(l.uniforms.uPulse,o.pulse),e.uniform1f(l.uniforms.uTime,r),e.uniform1f(l.uniforms.uPixelRatio,i),e.bindTexture(e.TEXTURE_2D,f),e.bindVertexArray(u),e.drawElements(e.TRIANGLES,W.length,e.UNSIGNED_SHORT,0)}}var mt=new URL(`atlas-Cq9ZmvIQ.jpg`,import.meta.url).href,ht=new URL(`px-CLdXHJKY.jpg`,import.meta.url).href,gt=new URL(`nx-Iy1dw4O_.jpg`,import.meta.url).href,_t=new URL(`py-BG51vgdv.jpg`,import.meta.url).href,vt=new URL(`ny-CQlz2Ypn.jpg`,import.meta.url).href,yt=new URL(`pz-6Zgw1v1f.jpg`,import.meta.url).href,bt=new URL(`nz-rpXU11Ra.jpg`,import.meta.url).href,xt=new URL(`tv-DTP7p8tE.bin`,import.meta.url).href,St=new URL(`pictures-Iy35KWxb.mp4`,import.meta.url).href,Ct=[ht,gt,_t,vt,yt,bt],wt=window.matchMedia(`(pointer: coarse), (max-width: 700px)`).matches,Tt=wt?320:900,Et=2,Dt=wt?13e5:26e5,Ot=.1,kt=3,At=.1,Y=document.getElementById(`canvas`),X=document.getElementById(`video`),jt=document.getElementById(`start`),Mt=document.getElementById(`status`),Nt=window.matchMedia(`(prefers-reduced-motion: reduce)`);function Pt(e,t=!1){Mt.hidden=e===null,Mt.textContent=e,Mt.classList.toggle(`busy`,t)}function Ft(e){Kt(),jt.hidden=!0,Pt(e)}function It(e){let t=new Image;return t.src=e,t.decode().then(()=>t)}async function Lt(){let[e,t,n]=await Promise.all([N(xt),Promise.all(Ct.map(It)),It(mt)]);return{model:e,sky:t,atlas:n}}var Z=g(Nt),Rt=xe(Tt),zt=new Float32Array(6),Bt=L(X),Vt={camera:Z,seconds:0,time:0,pixelRatio:1,video:X,settings:y},Q,Ht=0,$=0;function Ut(){let e=Y.clientWidth,t=Y.clientHeight,n=Math.sqrt(Dt/Math.max(e*t,1)),r=Math.min(window.devicePixelRatio,Et,n);Vt.pixelRatio=r;let i=Math.round(e*r),a=Math.round(t*r);(Y.width!==i||Y.height!==a)&&(Y.width=i,Y.height=a)}function Wt(e){$=requestAnimationFrame(Wt);let t=Math.min(Math.max(e-Ht,0)/1e3,At);Ht=e,Vt.seconds=t,Ut(),Z.update(t,Y.width,Y.height),Z.ray(A.x,A.y,zt);let n=Nt.matches?Ot:1;Rt.update(t,n,zt,A.active),Vt.time+=kt*t*n,y.pulse=y.effects[v]*Bt.read(t),Q?.(Vt)}function Gt(){!$&&Q&&(Ht=performance.now(),$=requestAnimationFrame(Wt))}function Kt(){cancelAnimationFrame($),$=0}async function qt(){let e=Y.getContext(`webgl2`,{alpha:!1,antialias:!1,depth:!1});if(!e){Ft(`This visualization needs WebGL 2, which this browser or device doesn't provide. Try a current version of Chrome, Firefox, Safari or Edge with hardware acceleration turned on.`);return}let t=ee(X,St,jt,Pt);k(X,t,Bt,Y),M(Y,Z),document.addEventListener(`visibilitychange`,()=>{document.hidden?(Kt(),t.suspend()):(Gt(),t.resume())});let n=await Lt();Y.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),Kt(),Q=void 0}),Y.addEventListener(`webglcontextrestored`,()=>{Q=pt(e,n,Rt),document.hidden||Gt()}),Ut(),Q=pt(e,n,Rt),document.hidden||Gt(),Pt(null),t.load()}qt().catch(e=>{console.error(e),Ft(`The visualization could not start. Reload the page to try again.`)});