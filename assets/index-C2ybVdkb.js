(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={lightDirection:[0,-1,-1],lightDiffuse:1,materialDiffuse:[.5,.5,.5],wave:1,blur:1,blackAndWhite:!1},t=e=>document.getElementById(e);function n(e,n){let r=t(e),i=r.previousElementSibling,a=()=>{n(r.valueAsNumber),i.value=r.valueAsNumber.toFixed(2)};r.addEventListener(`input`,a),a()}function r(r){[`light-x`,`light-y`,`light-z`].forEach((t,r)=>n(t,t=>e.lightDirection[r]=t)),n(`light-diffuse`,t=>e.lightDiffuse=t),n(`wave`,t=>e.wave=t),n(`blur`,t=>e.blur=t),t(`material`).addEventListener(`input`,t=>{let n=t.target.value;e.materialDiffuse=[1,3,5].map(e=>parseInt(n.slice(e,e+2),16)/255)}),t(`black-and-white`).addEventListener(`change`,t=>{e.blackAndWhite=t.target.checked}),t(`play`).addEventListener(`click`,()=>r.play()),t(`pause`).addEventListener(`click`,()=>r.pause())}async function i(e){let t=await fetch(e);if(!t.ok)throw Error(`${e}: HTTP ${t.status}`);let n=await t.arrayBuffer(),[r,i]=new Uint32Array(n,0,2),o=new Float32Array(n,8,r),s=new Uint16Array(n,8+r*4,i);return{vertices:o,indices:s,normals:a(o,s)}}function a(e,t){let n=new Float64Array(e.length);for(let r=0;r<t.length;r+=3){let[i,a,o]=[t[r]*3,t[r+1]*3,t[r+2]*3],[s,c,l]=[e[a]-e[i],e[a+1]-e[i+1],e[a+2]-e[i+2]],[u,d,f]=[e[o]-e[a],e[o+1]-e[a+1],e[o+2]-e[a+2]],p=[c*f-l*d,l*u-s*f,s*d-c*u];for(let e of[i,a,o])n[e]+=p[0],n[e+1]+=p[1],n[e+2]+=p[2]}for(let e=0;e<n.length;e+=3){let t=Math.hypot(n[e],n[e+1],n[e+2])||1;n[e]/=t,n[e+1]/=t,n[e+2]/=t}return Float32Array.from(n)}function o(e,t,n,r){let i=!1,a=()=>{let{buffered:t,duration:n}=e;return t.length&&n?Math.round(t.end(t.length-1)/n*100):0};e.addEventListener(`progress`,()=>{e.readyState<e.HAVE_FUTURE_DATA&&r(`Loading video… ${a()}%`,!0)}),e.addEventListener(`canplay`,()=>r(null)),e.addEventListener(`waiting`,()=>r(`Loading video…`,!0)),e.addEventListener(`playing`,()=>{n.hidden=!0,r(null)}),e.addEventListener(`error`,()=>{n.hidden=!0,r(`The video could not be loaded. Reload the page to try again.`)});let o=()=>{e.play().catch(t=>{t.name!==`AbortError`&&!e.error&&(n.hidden=!1,r(null))})};return n.addEventListener(`click`,()=>{n.hidden=!0,e.readyState<e.HAVE_FUTURE_DATA&&r(`Loading video…`,!0),o()}),{load(){r(`Loading video…`,!0),n.hidden=!1,e.src=t,e.preload=`auto`,e.load()},play:o,pause:()=>e.pause(),suspend(){i=!e.paused,e.pause()},resume(){i&&o()}}}var s=3,c=.01,l=.01,u=-5,d=5,f=(e,t)=>Math.random()*(t-e)+e,p=()=>f(0,360),m=()=>f(-3/2,s/2),h=e=>Array.from({length:e},()=>({rotation:[p(),p(),p()],position:[m(),f(0,10),m()]}));function g(e,t){for(let{rotation:n,position:r}of e)n[1]-=l*t,r[1]-=c*t,r[1]<u&&(r[1]=d)}var _=typeof Float32Array<`u`?Float32Array:Array;function v(){var e=new _(16);return _!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function y(e,t){if(e===t){var n=t[1],r=t[2],i=t[3],a=t[6],o=t[7],s=t[11];e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=n,e[6]=t[9],e[7]=t[13],e[8]=r,e[9]=a,e[11]=t[14],e[12]=i,e[13]=o,e[14]=s}else e[0]=t[0],e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=t[1],e[5]=t[5],e[6]=t[9],e[7]=t[13],e[8]=t[2],e[9]=t[6],e[10]=t[10],e[11]=t[14],e[12]=t[3],e[13]=t[7],e[14]=t[11],e[15]=t[15];return e}function b(e,t){var n=t[0],r=t[1],i=t[2],a=t[3],o=t[4],s=t[5],c=t[6],l=t[7],u=t[8],d=t[9],f=t[10],p=t[11],m=t[12],h=t[13],g=t[14],_=t[15],v=n*s-r*o,y=n*c-i*o,b=n*l-a*o,x=r*c-i*s,S=r*l-a*s,C=i*l-a*c,w=u*h-d*m,T=u*g-f*m,E=u*_-p*m,D=d*g-f*h,O=d*_-p*h,k=f*_-p*g,A=v*k-y*O+b*D+x*E-S*T+C*w;return A?(A=1/A,e[0]=(s*k-c*O+l*D)*A,e[1]=(i*O-r*k-a*D)*A,e[2]=(h*C-g*S+_*x)*A,e[3]=(f*S-d*C-p*x)*A,e[4]=(c*E-o*k-l*T)*A,e[5]=(n*k-i*E+a*T)*A,e[6]=(g*b-m*C-_*y)*A,e[7]=(u*C-f*b+p*y)*A,e[8]=(o*O-s*E+l*w)*A,e[9]=(r*E-n*O-a*w)*A,e[10]=(m*S-h*b+_*v)*A,e[11]=(d*b-u*S-p*v)*A,e[12]=(s*T-o*D-c*w)*A,e[13]=(n*D-r*T+i*w)*A,e[14]=(h*y-m*x-g*v)*A,e[15]=(u*x-d*y+f*v)*A,e):null}function x(e,t,n){var r=n[0],i=n[1],a=n[2],o,s,c,l,u,d,f,p,m,h,g,_;return t===e?(e[12]=t[0]*r+t[4]*i+t[8]*a+t[12],e[13]=t[1]*r+t[5]*i+t[9]*a+t[13],e[14]=t[2]*r+t[6]*i+t[10]*a+t[14],e[15]=t[3]*r+t[7]*i+t[11]*a+t[15]):(o=t[0],s=t[1],c=t[2],l=t[3],u=t[4],d=t[5],f=t[6],p=t[7],m=t[8],h=t[9],g=t[10],_=t[11],e[0]=o,e[1]=s,e[2]=c,e[3]=l,e[4]=u,e[5]=d,e[6]=f,e[7]=p,e[8]=m,e[9]=h,e[10]=g,e[11]=_,e[12]=o*r+u*i+m*a+t[12],e[13]=s*r+d*i+h*a+t[13],e[14]=c*r+f*i+g*a+t[14],e[15]=l*r+p*i+_*a+t[15]),e}function S(e,t,n){var r=n[0],i=n[1],a=n[2];return e[0]=t[0]*r,e[1]=t[1]*r,e[2]=t[2]*r,e[3]=t[3]*r,e[4]=t[4]*i,e[5]=t[5]*i,e[6]=t[6]*i,e[7]=t[7]*i,e[8]=t[8]*a,e[9]=t[9]*a,e[10]=t[10]*a,e[11]=t[11]*a,e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e}function C(e,t,n,r){var i=r[0],a=r[1],o=r[2],s=Math.sqrt(i*i+a*a+o*o),c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;return s<1e-6?null:(s=1/s,i*=s,a*=s,o*=s,c=Math.sin(n),l=Math.cos(n),u=1-l,d=t[0],f=t[1],p=t[2],m=t[3],h=t[4],g=t[5],_=t[6],v=t[7],y=t[8],b=t[9],x=t[10],S=t[11],C=i*i*u+l,w=a*i*u+o*c,T=o*i*u-a*c,E=i*a*u-o*c,D=a*a*u+l,O=o*a*u+i*c,k=i*o*u+a*c,A=a*o*u-i*c,j=o*o*u+l,e[0]=d*C+h*w+y*T,e[1]=f*C+g*w+b*T,e[2]=p*C+_*w+x*T,e[3]=m*C+v*w+S*T,e[4]=d*E+h*D+y*O,e[5]=f*E+g*D+b*O,e[6]=p*E+_*D+x*O,e[7]=m*E+v*D+S*O,e[8]=d*k+h*A+y*j,e[9]=f*k+g*A+b*j,e[10]=p*k+_*A+x*j,e[11]=m*k+v*A+S*j,t!==e&&(e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e)}function w(e,t){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=t[0],e[13]=t[1],e[14]=t[2],e[15]=1,e}function T(e,t,n,r,i){var a=1/Math.tan(t/2);if(e[0]=a/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,i!=null&&i!==1/0){var o=1/(r-i);e[10]=(i+r)*o,e[14]=2*i*r*o}else e[10]=-1,e[14]=-2*r;return e}var E=T,D=`/*
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

void main(void) {
  vec3 N = normalize(vec3(uNMatrix * vec4(aVertexNormal, 1.0)));
  vec3 L = normalize(uLightDirection);

  // Lambert term: dot product of the normal and the light direction
  float lambertTerm = dot(N, -L);

  vFinalColor = uMaterialDiffuse * uLightDiffuse * lambertTerm;
  vFinalColor.a = 1.0;
  vTextureCoord = aTextureCoord;

  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`,O=`/*
 * Primary fragment shader: a texture, or the lit color from the vertex shader
 */
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
uniform bool uIsTextureEnabled;

varying vec2 vTextureCoord;
varying vec4 vFinalColor;

void main(void) {
  gl_FragColor = uIsTextureEnabled ? texture2D(uSampler, vTextureCoord) : vFinalColor;
}
`,k=`/*
 * Post-processing vertex shader: stretches the unit quad over the whole viewport
 */

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;

void main(void) {
  vTextureCoord = aTextureCoord;
  gl_Position = vec4(-aVertexPosition * 2.1, 1.0);
}
`,A=`/*
 * Post-processing fragment shader
 * Applies wave distortion, blur, and the black and white effect
 */
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;

uniform float uBlurAmount;
uniform float uWaveAmount;
uniform float uTime;
uniform bool uBW;

varying vec2 vTextureCoord;

void main(void) {
  // Radial wave distortion: expanding circles around the center of the screen
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = vTextureCoord - center;
  float dist = length(toCenter);
  float wave = sin(dist * 20.0 * uWaveAmount - uTime * 2.0) * 0.02;
  vec2 texcoord = center + toCenter * (1.0 + wave);

  // Blur grows with the distance from the center. The center sample counts double;
  // the ring samples all sit on blurRadius, so each one weighs exp(-1).
  const int SAMPLES = 16;
  const float RING_WEIGHT = 0.36787944;
  float blurRadius = dist * uBlurAmount * 0.02;
  vec4 blurredColor = texture2D(uSampler, texcoord) * 2.0;

  for (int i = 0; i < SAMPLES; i++) {
    float a = float(i) * (2.0 * 3.14159) / float(SAMPLES);
    vec2 offset = vec2(cos(a), sin(a)) * blurRadius;
    blurredColor += texture2D(uSampler, texcoord + offset) * RING_WEIGHT;
  }

  vec4 fragment = blurredColor / (2.0 + float(SAMPLES) * RING_WEIGHT);
  gl_FragColor = uBW ? vec4(fragment.rrr, 1.0) : fragment;
}
`,j=0,M=1,N=2,P={aVertexPosition:j,aVertexNormal:M,aTextureCoord:N},ee=[-.5,-.5,0,.5,-.5,0,-.5,.5,0,.5,.5,0],te=[0,1,1,1,0,0,1,0],F=[0,2,1,1,2,3],ne=2048,re=512,I=e=>3.14*e/180;function ie(e,t,n,r){let i=e.createProgram();for(let[r,a]of[[e.VERTEX_SHADER,t],[e.FRAGMENT_SHADER,n]]){let t=e.createShader(r);if(e.shaderSource(t,a),e.compileShader(t),e.attachShader(i,t),!e.getShaderParameter(t,e.COMPILE_STATUS)&&!e.isContextLost())throw Error(`Shader error: ${e.getShaderInfoLog(t)}`)}for(let[t,n]of Object.entries(P))e.bindAttribLocation(i,n,t);if(e.linkProgram(i),!e.getProgramParameter(i,e.LINK_STATUS)&&!e.isContextLost())throw Error(`Program error: ${e.getProgramInfoLog(i)}`);return{program:i,uniforms:Object.fromEntries(r.map(t=>[t,e.getUniformLocation(i,t)]))}}function L(e,t,n){let r=e.createBuffer();return e.bindBuffer(t,r),e.bufferData(t,n,e.STATIC_DRAW),r}function R(e,t,n=e.LINEAR){let r=e.createTexture();return e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,n),r}function z(e,t,n){let r=R(e,n?e.LINEAR_MIPMAP_NEAREST:e.LINEAR);return e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),n&&e.generateMipmap(e.TEXTURE_2D),r}function B(e,t){let n=R(e,e.NEAREST,e.NEAREST);e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,t,0,e.RGBA,e.UNSIGNED_BYTE,null);let r=e.createRenderbuffer();e.bindRenderbuffer(e.RENDERBUFFER,r),e.renderbufferStorage(e.RENDERBUFFER,e.DEPTH_COMPONENT16,t,t);let i=e.createFramebuffer();if(e.bindFramebuffer(e.FRAMEBUFFER,i),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,n,0),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,r),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE&&!e.isContextLost())throw Error(`Could not create the offscreen framebuffer`);return{size:t,texture:n,depth:r,framebuffer:i}}function V(e,{model:t,background:n,polaroids:r}){let i=ie(e,D,O,[`uPMatrix`,`uMVMatrix`,`uNMatrix`,`uMaterialDiffuse`,`uLightDiffuse`,`uLightDirection`,`uIsTextureEnabled`]),a=ie(e,k,A,[`uWaveAmount`,`uBlurAmount`,`uTime`,`uBW`]),o={vertices:L(e,e.ARRAY_BUFFER,new Float32Array(ee)),textureCoords:L(e,e.ARRAY_BUFFER,new Float32Array(te)),indices:L(e,e.ELEMENT_ARRAY_BUFFER,new Uint16Array(F))},s={vertices:L(e,e.ARRAY_BUFFER,t.vertices),normals:L(e,e.ARRAY_BUFFER,t.normals),indices:L(e,e.ELEMENT_ARRAY_BUFFER,t.indices)},c=z(e,n,!1),l=r.map(t=>z(e,t,!0)),u=R(e,e.LINEAR);e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));let d=-1,f=Math.min(ne,e.getParameter(e.MAX_TEXTURE_SIZE)),p=()=>{let t=Math.max(e.drawingBufferWidth,e.drawingBufferHeight);return Math.min(f,Math.max(re,2**Math.ceil(Math.log2(t))))},m=B(e,p()),h=E(v(),45*Math.PI/180,1,.1,1e4),g=v(),_=v(),T=v();e.clearColor(0,0,0,1),e.enable(e.DEPTH_TEST),e.depthFunc(e.LEQUAL),e.useProgram(i.program),e.uniformMatrix4fv(i.uniforms.uPMatrix,!1,h);let P=()=>{e.bindBuffer(e.ARRAY_BUFFER,o.vertices),e.vertexAttribPointer(j,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(j),e.bindBuffer(e.ARRAY_BUFFER,o.textureCoords),e.vertexAttribPointer(N,2,e.FLOAT,!1,0,0),e.enableVertexAttribArray(N),e.disableVertexAttribArray(M),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,o.indices)},V=()=>{e.bindBuffer(e.ARRAY_BUFFER,s.vertices),e.vertexAttribPointer(j,3,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,s.normals),e.vertexAttribPointer(M,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(M),e.disableVertexAttribArray(N),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,s.indices)},H=()=>{e.uniformMatrix4fv(i.uniforms.uMVMatrix,!1,_),e.drawElements(e.TRIANGLES,F.length,e.UNSIGNED_SHORT,0)},U=t=>{e.bindTexture(e.TEXTURE_2D,u),t.readyState>=t.HAVE_CURRENT_DATA&&t.currentTime!==d&&(e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),d=t.currentTime),x(_,g,[0,.65,.49]),C(_,_,I(30),[0,1,0]),S(_,_,[1.4,.95,0]),H()},ae=()=>{e.bindTexture(e.TEXTURE_2D,c),x(_,g,[0,4,-4]),C(_,_,I(29),[1,0,0]),S(_,_,[20,10,10]),H()},oe=t=>{let n=t.length/l.length;t.forEach(({rotation:t,position:r},i)=>{i%n===0&&e.bindTexture(e.TEXTURE_2D,l[i/n]),x(_,g,r),C(_,_,t[0],[1,0,0]),C(_,_,t[1],[0,1,0]),C(_,_,t[2],[0,0,1]),S(_,_,[.3,.3,.3]),H()})},se=()=>{C(_,g,I(30),[0,1,0]),S(_,_,[.6,.6,.6]),b(T,_),y(T,T),e.uniformMatrix4fv(i.uniforms.uMVMatrix,!1,_),e.uniformMatrix4fv(i.uniforms.uNMatrix,!1,T),e.uniform1i(i.uniforms.uIsTextureEnabled,0),e.drawElements(e.TRIANGLES,t.indices.length,e.UNSIGNED_SHORT,0)},ce=()=>{let t=p();t!==m.size&&(e.deleteTexture(m.texture),e.deleteRenderbuffer(m.depth),e.deleteFramebuffer(m.framebuffer),m=B(e,t))};return function({pointer:t,time:n,droplets:r,video:o,settings:s}){ce(),e.bindFramebuffer(e.FRAMEBUFFER,m.framebuffer),e.viewport(0,0,m.size,m.size),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.useProgram(i.program),e.uniform3fv(i.uniforms.uLightDirection,s.lightDirection),e.uniform4f(i.uniforms.uLightDiffuse,s.lightDiffuse,s.lightDiffuse,s.lightDiffuse,1),e.uniform4f(i.uniforms.uMaterialDiffuse,...s.materialDiffuse,1),e.uniform1i(i.uniforms.uIsTextureEnabled,1),w(g,[0,-1.3,-3]),C(g,g,I(-15)-t.y/2e3,[1,0,0]),C(g,g,(-500+t.x)/1e3,[0,1,0]),P(),U(o),ae(),oe(r),V(),se(),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,e.drawingBufferWidth,e.drawingBufferHeight),e.useProgram(a.program),e.uniform1f(a.uniforms.uWaveAmount,s.wave),e.uniform1f(a.uniforms.uBlurAmount,s.blur),e.uniform1f(a.uniforms.uTime,n),e.uniform1i(a.uniforms.uBW,+!!s.blackAndWhite),P(),e.bindTexture(e.TEXTURE_2D,m.texture),e.drawElements(e.TRIANGLES,F.length,e.UNSIGNED_SHORT,0)}}var H=new URL(`bg-D5Yg5cNa.jpg`,import.meta.url).href,U=new URL(`polaroid04-Cn3O93tT.jpg`,import.meta.url).href,ae=new URL(`polaroid-BKxcx1eN.jpg`,import.meta.url).href,oe=new URL(`tv-DTP7p8tE.bin`,import.meta.url).href,se=new URL(`pictures-Iy35KWxb.mp4`,import.meta.url).href,ce=50,le=2,ue=1e3/60,de=6,fe=.05,pe={left:24,top:105,width:800,height:450,screenHeight:1080},W=document.getElementById(`canvas`),me=document.getElementById(`video`),he=document.getElementById(`start`),G=document.getElementById(`status`),ge=document.getElementById(`controls`);function K(e,t=!1){G.hidden=e===null,G.textContent=e,G.classList.toggle(`busy`,t)}function _e(e){$(),he.hidden=!0,ge.hidden=!0,K(e)}function q(e){let t=new Image;return t.src=e,t.decode().then(()=>t)}async function ve(){let[e,t,...n]=await Promise.all([i(oe),q(H),q(U),q(ae)]);return{model:e,background:t,polaroids:n}}var ye=h(ce),J={x:0,y:0},Y,be=0,X=0,Z=0;function xe(){let e=Math.min(window.devicePixelRatio,le),t=Math.round(W.clientWidth*e),n=Math.round(W.clientHeight*e);(W.width!==t||W.height!==n)&&(W.width=t,W.height=n)}function Se(t){Z=requestAnimationFrame(Se);let n=Math.min(Math.max(t-X,0)/ue,de);X=t,be+=fe*n,g(ye,n),xe(),Y?.({pointer:J,time:be,droplets:ye,video:me,settings:e})}function Q(){!Z&&Y&&(X=performance.now(),Z=requestAnimationFrame(Se))}function $(){cancelAnimationFrame(Z),Z=0}async function Ce(){let e=W.getContext(`webgl`,{alpha:!1,antialias:!1,depth:!1});if(!e){_e(`This visualization needs WebGL, which this browser or device doesn't provide. Try a current version of Chrome, Firefox, Safari or Edge with hardware acceleration turned on.`);return}let t=o(me,se,he,K);r(t),W.addEventListener(`pointermove`,e=>{let t=W.getBoundingClientRect(),{left:n,top:r,width:i,height:a,screenHeight:o}=pe;J.x=n+(e.clientX-t.left)/t.width*i,J.y=o-(r+(e.clientY-t.top)/t.height*a)}),document.addEventListener(`visibilitychange`,()=>{document.hidden?($(),t.suspend()):(Q(),t.resume())});let n=await ve();W.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),$(),Y=void 0}),W.addEventListener(`webglcontextrestored`,()=>{Y=V(e,n),document.hidden||Q()}),xe(),Y=V(e,n),document.hidden||Q(),K(null),t.load()}Ce().catch(e=>{console.error(e),_e(`The visualization could not start. Reload the page to try again.`)});