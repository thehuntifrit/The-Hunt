(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const Ld="https://icy-resonance-2526.the-hunt-ifrit.workers.dev/",kg=3,Ng=2,Mg=3e3,Lg=60*60*1e3,Dg=10*60*1e3;let Dd=0;function Re(){return Date.now()+Dd}const Od=[];function Og(n){Od.push(n)}let Ko=!1,mu=!1;async function Go(){if(!Ko){Ko=!0;try{let n=null;const e=mu?Ng:kg;for(let t=0;t<e;t++)try{const r=Date.now(),s=await fetch(`${Ld}time?_=${r}`,{cache:"no-store"});if(!s.ok)continue;const i=await s.json(),o=Date.now(),c=o-r;if(typeof i.t!="number"||c>Mg)continue;const l=i.t+c/2-o;(!n||c<n.rtt)&&(n={rtt:c,offset:l})}catch{}n&&(Dd=n.offset,mu=!0,Od.forEach(t=>{try{t()}catch{}}))}finally{Ko=!1}}}let gu=!1;function Vg(){if(gu)return;gu=!0,Go(),setInterval(()=>void Go(),Lg);let n=0;document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){n=Date.now();return}if(!n)return;const e=Date.now()-n;n=0,e>=Dg&&Go()})}const qe=175,Nt=1400,ji=qe*24,ya=ji*32,_u=ji*4,qs=5e3,Vd=20,xd=2917,xg=.6;function Nr(n){if(!n)return null;if(n instanceof Date)return n;if(typeof n=="object"&&typeof n.toDate=="function")return n.toDate();if(typeof n=="object"&&n.seconds!==void 0)return new Date(n.seconds*1e3);const e=new Date(n);return isNaN(e.getTime())?null:e}function Fg(n){n<0&&(n=0);const{h:e,m:t}=Fd(n),r=[];return parseInt(e)>0&&r.push(`${e.trim()}h`),r.push(`${t.trim()}m`),r.join("/")}function Fd(n){n<0&&(n=0);const e=Math.floor(n/3600),t=Math.floor(n%3600/60),r=s=>s.toString();return{d:"0",h:r(e),m:r(t),rawD:0,rawH:e,rawM:t,rawS:n}}function oi(n){n<0&&(n=0);const e=Math.floor(n/3600),t=Math.floor(n%3600/60);return`${String(e).padStart(3," ")}:${String(t).padStart(2,"0")}`}function qi(n,e){let t;return function(...s){clearTimeout(t),t=setTimeout(()=>n(...s),e)}}function Bg(n=new Date){const e=n.getTime(),t=qe*1e3,i=Math.floor(e/t)%24,o=e%t,c=t/60,l=Math.floor(o/c);return{hours:i.toString().padStart(2,"0"),minutes:l.toString().padStart(2,"0")}}function Ug(n){return Math.floor(n/qe)%24}function $g(n){return Math.floor(n/qe)*qe}function Hg(n){return Math.floor(n/Nt)*Nt}function oc(n=new Date){const s=n.getTime()/1e3*20.57142857142857/86400%32+1;let i=null;return s>=32.5||s<4.5?i="新月":s>=16.5&&s<20.5&&(i="満月"),{phase:s,label:i}}function jg(n=new Date){const e=Math.floor(n.getTime()/1e3),t=Math.floor(e/qe),r=Math.floor(t/24);let s=t%24-t%8;s=(s+8)%24;const i=r*100+s,o=i<<11^i;return((o>>>8^o)>>>0)%100}const qg=1e4,Ps=new Map;function Wg(n){const e=Math.floor(n/Nt);let t=Ps.get(e);return t===void 0&&(Ps.size>=qg&&Ps.clear(),t=jg(new Date(e*Nt*1e3)),Ps.set(e,t)),t}function zg(n,e){if(n.weatherSeedRange){const[t,r]=n.weatherSeedRange;return e>=t&&e<=r}return n.weatherSeedRanges?n.weatherSeedRanges.some(([t,r])=>e>=t&&e<=r):!1}function ks(n,e){const t=Ug(e),{start:r,end:s}=n;return r<s?t>=r&&t<s:t>=r||t<s}function yu(n,e){if(n.conditions){const{phase:t}=oc(new Date(e*1e3)),{firstNight:r,otherNights:s}=n.conditions;return r!=null&&r.timeRange&&Kg(t)?ks(r.timeRange,e):s!=null&&s.timeRange&&Gg(t)?ks(s.timeRange,e):!1}return n.timeRange?ks(n.timeRange,e):n.timeRanges?n.timeRanges.some(t=>ks(t,e)):!0}function Kg(n){return n>=32.5||n<1.5}function Gg(n){return n>=1.5&&n<4.5}function Qg(n,e){const t=oc(new Date(n*1e3)).phase;let r=e-t;r<0&&(r+=32);let s=n+r*ji;return s<n&&(s+=ya),s}function*Xg(n,e,t){var l;const r=(((l=n.weatherDuration)==null?void 0:l.minutes)||0)*60;if(!n.weatherSeedRange&&!n.weatherSeedRanges){yield[e,t];return}const s=Vd*24*3600,i=h=>zg(n,Wg(h));let o=0,c=Hg(e);if(i(c)){const h=e-s;for(;;){const d=c-Nt;if(d<h||!i(d))break;c=d}}for(;c<t&&!(o++>qs);){let h=null;for(;c<t&&!(o++>qs);){if(i(c)){h=c;break}if(c+=Nt,c-e>s)break}if(h===null)break;let d=h+Nt;for(;i(d)&&!(o++>qs);)d+=Nt;if(d-h>=r){const p=Math.max(h+r,e),m=Math.min(d,t);p<m&&(yield[p,m])}c=d}}function*Yg(n,e,t){if(!n.timeRange&&!n.timeRanges&&!n.conditions){yield[e,t];return}let r=$g(e),s=0;for(;r<t&&!(s++>qs);)if(yu(n,r)){const i=r;let o=r+qe,c=o;for(;c<t+qe&&yu(n,c);)o+=qe,c+=qe;const l=Math.max(i,e),h=Math.min(o,t);l<h&&(yield[l,h]),r=o}else r+=qe}function Jg(n,e,t,r=0){const s=[];if(!n.moonPhase)s.push([e,t]);else{const i=n.moonPhase==="新月"?32.5:16.5,o=oc(new Date(e*1e3)).phase;if(n.moonPhase==="新月"&&(o>=32.5||o<4.5)||n.moonPhase==="満月"&&o>=16.5&&o<20.5){let l=e-(o-i)*ji;for(;l>e;)l-=ya;const h=l+_u;h>e&&s.push([e,h])}let c=Qg(e,i);for(;c<t;)s.push([c,c+_u]),c+=ya}for(const[i,o]of s){const c=Xg(n,i,o);for(const[l,h]of c){const d=Yg(n,l,h);for(const[p,m]of d){const E=Math.max(p,e),A=m;if(E<A){if(r>0&&A<=r)continue;return{start:E,end:A}}}}}return null}function Eu(n){if(n.isInWindow&&n.windowEndSec!==null&&n.status!=="Maintenance")return n.windowEndSec-n.now;switch(n.status){case"MaxOver":return n.now-n.maxRepop;case"Next":return(n.hasCondition&&n.nextConditionSec!==null&&n.nextConditionSec>n.minRepop?n.nextConditionSec:n.minRepop)-n.now;case"PopWindow":return n.maxRepop-n.now;case"NextCondition":return(n.nextConditionSec??n.maxRepop)-n.now;default:return n.fallbackSec-n.now}}function qr(n,e,t={}){var C;const{skipConditionCalc:r=!1,forceRecalc:s=!1}=t,i=Re()/1e3,o=n.last_kill_time||0,c=e&&e.maintenance?e.maintenance:e;if(!c||!c.start)return Tu("Unknown");const l=Nr(c.start);if(!l)return Tu("Unknown");const{minRepop:h,maxRepop:d,appliedFactor:p}=Bd(n,o,c,i),m=Nr(c.serverUp||c.end),E=m?m.getTime()/1e3:0,A=l.getTime()/1e3,N=new Date(h*1e3);let b="Unknown",O="";const x=null;let F=null,z=null,ne=!1;const Q=!!(n.moonPhase||n.timeRange||n.timeRanges||n.weatherSeedRange||n.weatherSeedRanges||n.conditions);if(!s&&n.repopInfo&&n.repopInfo.nextBoundarySec&&Number.isFinite(n.repopInfo.nextBoundarySec)&&n.repopInfo.minRepop===h&&n.repopInfo.maxRepop===d&&i<n.repopInfo.nextBoundarySec){const _=n.repopInfo;i>=d?_.elapsedPercent=100:i>=h&&d>h?_.elapsedPercent=Math.min(100,Math.floor((i-h)/(d-h)*100)):_.elapsedPercent=0;const ie=_.nextConditionSpawnDate?_.nextConditionSpawnDate.getTime()/1e3:null,Le=_.conditionWindowEnd?_.conditionWindowEnd.getTime()/1e3:null;return _.timeRemaining=oi(Eu({status:String(_.status),now:i,minRepop:h,maxRepop:d,hasCondition:Q,nextConditionSec:ie,windowEndSec:Le,isInWindow:!!_.isInConditionWindow,fallbackSec:_.nextBoundarySec??i})),_}if(Q&&!r){let _=s;if(n._spawnCache?(n._spawnCache.appliedFactor!==p||n._spawnCache.minRepop!==h||i>=n._spawnCache.end)&&(_=!0):_=!0,_){const ie=Math.max(h,i),Le=ie-18e3,Io=ie+Vd*24*3600,or=Jg(n,Le,Io,ie);or?n._spawnCache={appliedFactor:p,minRepop:h,start:or.start,end:or.end}:n._spawnCache=null}if(n._spawnCache){const ie=Math.max(n._spawnCache.start,h),Le=n._spawnCache.end;ie<Le&&(F=new Date(ie*1e3),z=new Date(Le*1e3),ne=i>=ie&&i<Le&&i>=h)}}let w=0;i>=d?(b="MaxOver",w=100):i<h?b="Next":(b="PopWindow",w=d<=h?0:Math.min(100,Math.floor((i-h)/(d-h)*100)),Q&&F&&F.getTime()/1e3>i&&(b="NextCondition")),ne&&i>=h&&b!=="MaxOver"&&(b="ConditionActive"),O=oi(Eu({status:b,now:i,minRepop:h,maxRepop:d,hasCondition:Q,nextConditionSec:F?F.getTime()/1e3:null,windowEndSec:z?z.getTime()/1e3:null,isInWindow:ne,fallbackSec:d}));const y=!!(l&&i>=A+1800&&!(E>A&&i>=E));let T=!1;A&&i<A+1800&&(h>=A||F&&F.getTime()/1e3>=A)&&(T=!0),(y||T)&&(b="Maintenance");let I=[h,d,F?F.getTime()/1e3:null,z?z.getTime()/1e3:null,A,A+1800,E>A?E:null].filter(_=>_!==null&&_>i).reduce((_,ie)=>Math.min(_,ie),1/0);return Q&&!F&&r&&(I=0),{minRepop:h,maxRepop:d,elapsedPercent:w,timeRemaining:O,conditionRemaining:x,status:b,nextMinRepopDate:N,nextConditionSpawnDate:F,conditionWindowEnd:z,isInConditionWindow:ne,isMaintenanceStop:y,isBlockedByMaintenance:T,maintStart:A,maintEnd:E||(((C=Nr(c==null?void 0:c.end))==null?void 0:C.getTime())??0)/1e3,nextBoundarySec:I}}function Wr(n){if(!n)return"--/-- --:--";let e;n instanceof Date?e=n:typeof n=="string"?e=new Date(n):e=new Date(n*1e3);const t=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0"),s=String(e.getHours()).padStart(2,"0"),i=String(e.getMinutes()).padStart(2,"0");return`${t}/${r} ${s}:${i}`}function Tu(n){return{minRepop:null,maxRepop:null,elapsedPercent:0,timeRemaining:"",status:n||"Unknown",nextMinRepopDate:null,nextConditionSpawnDate:null,conditionWindowEnd:null,conditionRemaining:null,isInConditionWindow:!1,isMaintenanceStop:!1,isBlockedByMaintenance:!1,nextBoundarySec:null}}function Bd(n,e,t,r){var d,p;const s=t&&t.maintenance?t.maintenance:t,i=n.repopSeconds,o=n.maxRepopSeconds;if(!s||!s.start)return{minRepop:e+i,maxRepop:e+o,appliedFactor:1};const c=(((d=Nr(s==null?void 0:s.start))==null?void 0:d.getTime())??0)/1e3;if(r&&r>=c&&r<c+1800)return{minRepop:e+i,maxRepop:e+o,appliedFactor:1};const l=n.rank==="F";let h=(((p=Nr((s==null?void 0:s.serverUp)||(s==null?void 0:s.end)))==null?void 0:p.getTime())??0)/1e3;if(r>=c&&h<=c&&(h=c),e===0||e<=h){const m=l?1:xg;return{minRepop:h+i*m,maxRepop:h+o*m,appliedFactor:m}}return{minRepop:e+i,maxRepop:e+o,appliedFactor:1}}const Zg=()=>{};var wu={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ud=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},e_=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},$d={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,l=s+2<n.length,h=l?n[s+2]:0,d=i>>2,p=(i&3)<<4|c>>4;let m=(c&15)<<2|h>>6,E=h&63;l||(E=64,o||(m=64)),r.push(t[d],t[p],t[m],t[E])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Ud(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):e_(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const p=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||p==null)throw new t_;const m=i<<2|c>>4;if(r.push(m),h!==64){const E=c<<4&240|h>>2;if(r.push(E),p!==64){const A=h<<6&192|p;r.push(A)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};let t_=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const n_=function(n){const e=Ud(n);return $d.encodeByteArray(e,!0)},Hd=function(n){return n_(n).replace(/\./g,"")},r_=function(n){try{return $d.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function s_(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const i_=()=>s_().__FIREBASE_DEFAULTS__,o_=()=>{if(typeof process>"u"||typeof wu>"u")return;const n=wu.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},a_=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&r_(n[1]);return e&&JSON.parse(e)},c_=()=>{try{return Zg()||i_()||o_()||a_()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},jd=()=>{var n;return(n=c_())==null?void 0:n.config};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let l_=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}};function u_(){try{return typeof indexedDB=="object"}catch{return!1}}function h_(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const d_="FirebaseError";let ac=class qd extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=d_,Object.setPrototypeOf(this,qd.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Wd.prototype.create)}},Wd=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?f_(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new ac(s,c,r)}};function f_(n,e){return n.replace(p_,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const p_=/\{\$([^}]+)}/g;function Ea(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(Iu(i)&&Iu(o)){if(!Ea(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Iu(n){return n!==null&&typeof n=="object"}let ai=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class m_{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new l_;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(__(e))try{this.getOrInitializeService({instanceIdentifier:rn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=rn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=rn){return this.instances.has(e)}getOptions(e=rn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&o.resolve(s)}return s}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:g_(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=rn){return this.component?this.component.multipleInstances?e:rn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function g_(n){return n===rn?void 0:n}function __(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y_{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new m_(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ae;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(ae||(ae={}));const E_={debug:ae.DEBUG,verbose:ae.VERBOSE,info:ae.INFO,warn:ae.WARN,error:ae.ERROR,silent:ae.SILENT},T_=ae.INFO,w_={[ae.DEBUG]:"log",[ae.VERBOSE]:"log",[ae.INFO]:"info",[ae.WARN]:"warn",[ae.ERROR]:"error"},I_=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=w_[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let v_=class{constructor(e){this.name=e,this._logLevel=T_,this._logHandler=I_,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ae))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?E_[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ae.DEBUG,...e),this._logHandler(this,ae.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ae.VERBOSE,...e),this._logHandler(this,ae.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ae.INFO,...e),this._logHandler(this,ae.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ae.WARN,...e),this._logHandler(this,ae.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ae.ERROR,...e),this._logHandler(this,ae.ERROR,...e)}};const A_=(n,e)=>e.some(t=>n instanceof t);let vu,Au;function S_(){return vu||(vu=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function C_(){return Au||(Au=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const zd=new WeakMap,Ta=new WeakMap,Kd=new WeakMap,Qo=new WeakMap,cc=new WeakMap;function R_(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",i),n.removeEventListener("error",o)},i=()=>{t(Vt(n.result)),s()},o=()=>{r(n.error),s()};n.addEventListener("success",i),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&zd.set(t,n)}).catch(()=>{}),cc.set(e,n),e}function b_(n){if(Ta.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",o),n.removeEventListener("abort",o)},i=()=>{t(),s()},o=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",i),n.addEventListener("error",o),n.addEventListener("abort",o)});Ta.set(n,e)}let wa={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Ta.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Kd.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Vt(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function P_(n){wa=n(wa)}function k_(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(Xo(this),e,...t);return Kd.set(r,e.sort?e.sort():[e]),Vt(r)}:C_().includes(n)?function(...e){return n.apply(Xo(this),e),Vt(zd.get(this))}:function(...e){return Vt(n.apply(Xo(this),e))}}function N_(n){return typeof n=="function"?k_(n):(n instanceof IDBTransaction&&b_(n),A_(n,S_())?new Proxy(n,wa):n)}function Vt(n){if(n instanceof IDBRequest)return R_(n);if(Qo.has(n))return Qo.get(n);const e=N_(n);return e!==n&&(Qo.set(n,e),cc.set(e,n)),e}const Xo=n=>cc.get(n);function M_(n,e,{blocked:t,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(n,e),c=Vt(o);return r&&o.addEventListener("upgradeneeded",l=>{r(Vt(o.result),l.oldVersion,l.newVersion,Vt(o.transaction),l)}),t&&o.addEventListener("blocked",l=>t(l.oldVersion,l.newVersion,l)),c.then(l=>{i&&l.addEventListener("close",()=>i()),s&&l.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),c}const L_=["get","getKey","getAll","getAllKeys","count"],D_=["put","add","delete","clear"],Yo=new Map;function Su(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Yo.get(e))return Yo.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=D_.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||L_.includes(t)))return;const i=async function(o,...c){const l=this.transaction(o,s?"readwrite":"readonly");let h=l.store;return r&&(h=h.index(c.shift())),(await Promise.all([h[t](...c),s&&l.done]))[0]};return Yo.set(e,i),i}P_(n=>({...n,get:(e,t,r)=>Su(e,t)||n.get(e,t,r),has:(e,t)=>!!Su(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O_{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(V_(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function V_(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Ia="@firebase/app",Cu="0.14.4";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mt=new v_("@firebase/app"),x_="@firebase/app-compat",F_="@firebase/analytics-compat",B_="@firebase/analytics",U_="@firebase/app-check-compat",$_="@firebase/app-check",H_="@firebase/auth",j_="@firebase/auth-compat",q_="@firebase/database",W_="@firebase/data-connect",z_="@firebase/database-compat",K_="@firebase/functions",G_="@firebase/functions-compat",Q_="@firebase/installations",X_="@firebase/installations-compat",Y_="@firebase/messaging",J_="@firebase/messaging-compat",Z_="@firebase/performance",ey="@firebase/performance-compat",ty="@firebase/remote-config",ny="@firebase/remote-config-compat",ry="@firebase/storage",sy="@firebase/storage-compat",iy="@firebase/firestore",oy="@firebase/ai",ay="@firebase/firestore-compat",cy="firebase",ly="12.4.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const va="[DEFAULT]",uy={[Ia]:"fire-core",[x_]:"fire-core-compat",[B_]:"fire-analytics",[F_]:"fire-analytics-compat",[$_]:"fire-app-check",[U_]:"fire-app-check-compat",[H_]:"fire-auth",[j_]:"fire-auth-compat",[q_]:"fire-rtdb",[W_]:"fire-data-connect",[z_]:"fire-rtdb-compat",[K_]:"fire-fn",[G_]:"fire-fn-compat",[Q_]:"fire-iid",[X_]:"fire-iid-compat",[Y_]:"fire-fcm",[J_]:"fire-fcm-compat",[Z_]:"fire-perf",[ey]:"fire-perf-compat",[ty]:"fire-rc",[ny]:"fire-rc-compat",[ry]:"fire-gcs",[sy]:"fire-gcs-compat",[iy]:"fire-fst",[ay]:"fire-fst-compat",[oy]:"fire-vertex","fire-js":"fire-js",[cy]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ci=new Map,hy=new Map,Aa=new Map;function Ru(n,e){try{n.container.addComponent(e)}catch(t){mt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function $t(n){const e=n.name;if(Aa.has(e))return mt.debug(`There were multiple attempts to register component ${e}.`),!1;Aa.set(e,n);for(const t of ci.values())Ru(t,n);for(const t of hy.values())Ru(t,n);return!0}function ss(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function We(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dy={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},xt=new Wd("app","Firebase",dy);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fy{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new ai("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw xt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zn=ly;function Gd(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:va,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw xt.create("bad-app-name",{appName:String(s)});if(t||(t=jd()),!t)throw xt.create("no-options");const i=ci.get(s);if(i){if(Ea(t,i.options)&&Ea(r,i.config))return i;throw xt.create("duplicate-app",{appName:s})}const o=new y_(s);for(const l of Aa.values())o.addComponent(l);const c=new fy(t,r,o);return ci.set(s,c),c}function lc(n=va){const e=ci.get(n);if(!e&&n===va&&jd())return Gd();if(!e)throw xt.create("no-app",{appName:n});return e}function dt(n,e,t){let r=uy[n]??n;t&&(r+=`-${t}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${r}" with version "${e}":`];s&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),mt.warn(o.join(" "));return}$t(new ai(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const py="firebase-heartbeat-database",my=1,zr="firebase-heartbeat-store";let Jo=null;function Qd(){return Jo||(Jo=M_(py,my,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(zr)}catch(t){console.warn(t)}}}}).catch(n=>{throw xt.create("idb-open",{originalErrorMessage:n.message})})),Jo}async function gy(n){try{const t=(await Qd()).transaction(zr),r=await t.objectStore(zr).get(Xd(n));return await t.done,r}catch(e){if(e instanceof ac)mt.warn(e.message);else{const t=xt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});mt.warn(t.message)}}}async function bu(n,e){try{const r=(await Qd()).transaction(zr,"readwrite");await r.objectStore(zr).put(e,Xd(n)),await r.done}catch(t){if(t instanceof ac)mt.warn(t.message);else{const r=xt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});mt.warn(r.message)}}}function Xd(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _y=1024,yy=30;class Ey{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new wy(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Pu();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>yy){const o=Iy(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){mt.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Pu(),{heartbeatsToSend:r,unsentEntries:s}=Ty(this._heartbeatsCache.heartbeats),i=Hd(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return mt.warn(t),""}}}function Pu(){return new Date().toISOString().substring(0,10)}function Ty(n,e=_y){const t=[];let r=n.slice();for(const s of n){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),ku(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),ku(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class wy{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return u_()?h_().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await gy(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return bu(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return bu(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function ku(n){return Hd(JSON.stringify({version:2,heartbeats:n})).length}function Iy(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vy(n){$t(new ai("platform-logger",e=>new O_(e),"PRIVATE")),$t(new ai("heartbeat",e=>new Ey(e),"PRIVATE")),dt(Ia,Cu,n),dt(Ia,Cu,"esm2020"),dt("fire-js","")}vy("");var Ay="firebase",Sy="12.4.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */dt(Ay,Sy,"app");const Cy=()=>{};var Nu={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yd=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Ry=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Jd={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,l=s+2<n.length,h=l?n[s+2]:0,d=i>>2,p=(i&3)<<4|c>>4;let m=(c&15)<<2|h>>6,E=h&63;l||(E=64,o||(m=64)),r.push(t[d],t[p],t[m],t[E])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Yd(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Ry(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const p=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||p==null)throw new by;const m=i<<2|c>>4;if(r.push(m),h!==64){const E=c<<4&240|h>>2;if(r.push(E),p!==64){const A=h<<6&192|p;r.push(A)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};let by=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const Py=function(n){const e=Yd(n);return Jd.encodeByteArray(e,!0)},Mu=function(n){return Py(n).replace(/\./g,"")},ky=function(n){try{return Jd.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ny(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const My=()=>Ny().__FIREBASE_DEFAULTS__,Ly=()=>{if(typeof process>"u"||typeof Nu>"u")return;const n=Nu.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Dy=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&ky(n[1]);return e&&JSON.parse(e)},Zd=()=>{try{return Cy()||My()||Ly()||Dy()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Oy=n=>{var e,t;return(t=(e=Zd())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},Vy=n=>{const e=Oy(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uc(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function xy(n){return(await fetch(n,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fy(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Mu(JSON.stringify(t)),Mu(JSON.stringify(o)),""].join(".")}const Mr={};function By(){const n={prod:[],emulator:[]};for(const e of Object.keys(Mr))Mr[e]?n.emulator.push(e):n.prod.push(e);return n}function Uy(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let Lu=!1;function $y(n,e){if(typeof window>"u"||typeof document>"u"||!uc(window.location.host)||Mr[n]===e||Mr[n]||Lu)return;Mr[n]=e;function t(m){return`__firebase__banner__${m}`}const r="__firebase__banner",i=By().prod.length>0;function o(){const m=document.getElementById(r);m&&m.remove()}function c(m){m.style.display="flex",m.style.background="#7faaf0",m.style.position="fixed",m.style.bottom="5px",m.style.left="5px",m.style.padding=".5em",m.style.borderRadius="5px",m.style.alignItems="center"}function l(m,E){m.setAttribute("width","24"),m.setAttribute("id",E),m.setAttribute("height","24"),m.setAttribute("viewBox","0 0 24 24"),m.setAttribute("fill","none"),m.style.marginLeft="-6px"}function h(){const m=document.createElement("span");return m.style.cursor="pointer",m.style.marginLeft="16px",m.style.fontSize="24px",m.innerHTML=" &times;",m.onclick=()=>{Lu=!0,o()},m}function d(m,E){m.setAttribute("id",E),m.innerText="Learn more",m.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",m.setAttribute("target","__blank"),m.style.paddingLeft="5px",m.style.textDecoration="underline"}function p(){const m=Uy(r),E=t("text"),A=document.getElementById(E)||document.createElement("span"),N=t("learnmore"),b=document.getElementById(N)||document.createElement("a"),O=t("preprendIcon"),x=document.getElementById(O)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(m.created){const F=m.element;c(F),d(b,N);const z=h();l(x,O),F.append(x,A,b,z),document.body.appendChild(F)}i?(A.innerText="Preview backend disconnected.",x.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(x.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,A.innerText="Preview backend running in this workspace."),A.setAttribute("id",E)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hy(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function jy(){var e;const n=(e=Zd())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function qy(){return!jy()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wy="FirebaseError";let ef=class tf extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Wy,Object.setPrototypeOf(this,tf.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,zy.prototype.create)}},zy=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?Ky(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new ef(s,c,r)}};function Ky(n,e){return n.replace(Gy,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const Gy=/\{\$([^}]+)}/g;function nf(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(Du(i)&&Du(o)){if(!nf(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Du(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qn(n){return n&&n._delegate?n._delegate:n}let Qy=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Z;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(Z||(Z={}));const Xy={debug:Z.DEBUG,verbose:Z.VERBOSE,info:Z.INFO,warn:Z.WARN,error:Z.ERROR,silent:Z.SILENT},Yy=Z.INFO,Jy={[Z.DEBUG]:"log",[Z.VERBOSE]:"log",[Z.INFO]:"info",[Z.WARN]:"warn",[Z.ERROR]:"error"},Zy=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=Jy[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let eE=class{constructor(e){this.name=e,this._logLevel=Yy,this._logHandler=Zy,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Z))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Xy[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Z.DEBUG,...e),this._logHandler(this,Z.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Z.VERBOSE,...e),this._logHandler(this,Z.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Z.INFO,...e),this._logHandler(this,Z.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Z.WARN,...e),this._logHandler(this,Z.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Z.ERROR,...e),this._logHandler(this,Z.ERROR,...e)}};var Ou=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ft,rf;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(w,y){function T(){}T.prototype=y.prototype,w.F=y.prototype,w.prototype=new T,w.prototype.constructor=w,w.D=function(v,I,C){for(var _=Array(arguments.length-2),ie=2;ie<arguments.length;ie++)_[ie-2]=arguments[ie];return y.prototype[I].apply(v,_)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(w,y,T){T||(T=0);const v=Array(16);if(typeof y=="string")for(var I=0;I<16;++I)v[I]=y.charCodeAt(T++)|y.charCodeAt(T++)<<8|y.charCodeAt(T++)<<16|y.charCodeAt(T++)<<24;else for(I=0;I<16;++I)v[I]=y[T++]|y[T++]<<8|y[T++]<<16|y[T++]<<24;y=w.g[0],T=w.g[1],I=w.g[2];let C=w.g[3],_;_=y+(C^T&(I^C))+v[0]+3614090360&4294967295,y=T+(_<<7&4294967295|_>>>25),_=C+(I^y&(T^I))+v[1]+3905402710&4294967295,C=y+(_<<12&4294967295|_>>>20),_=I+(T^C&(y^T))+v[2]+606105819&4294967295,I=C+(_<<17&4294967295|_>>>15),_=T+(y^I&(C^y))+v[3]+3250441966&4294967295,T=I+(_<<22&4294967295|_>>>10),_=y+(C^T&(I^C))+v[4]+4118548399&4294967295,y=T+(_<<7&4294967295|_>>>25),_=C+(I^y&(T^I))+v[5]+1200080426&4294967295,C=y+(_<<12&4294967295|_>>>20),_=I+(T^C&(y^T))+v[6]+2821735955&4294967295,I=C+(_<<17&4294967295|_>>>15),_=T+(y^I&(C^y))+v[7]+4249261313&4294967295,T=I+(_<<22&4294967295|_>>>10),_=y+(C^T&(I^C))+v[8]+1770035416&4294967295,y=T+(_<<7&4294967295|_>>>25),_=C+(I^y&(T^I))+v[9]+2336552879&4294967295,C=y+(_<<12&4294967295|_>>>20),_=I+(T^C&(y^T))+v[10]+4294925233&4294967295,I=C+(_<<17&4294967295|_>>>15),_=T+(y^I&(C^y))+v[11]+2304563134&4294967295,T=I+(_<<22&4294967295|_>>>10),_=y+(C^T&(I^C))+v[12]+1804603682&4294967295,y=T+(_<<7&4294967295|_>>>25),_=C+(I^y&(T^I))+v[13]+4254626195&4294967295,C=y+(_<<12&4294967295|_>>>20),_=I+(T^C&(y^T))+v[14]+2792965006&4294967295,I=C+(_<<17&4294967295|_>>>15),_=T+(y^I&(C^y))+v[15]+1236535329&4294967295,T=I+(_<<22&4294967295|_>>>10),_=y+(I^C&(T^I))+v[1]+4129170786&4294967295,y=T+(_<<5&4294967295|_>>>27),_=C+(T^I&(y^T))+v[6]+3225465664&4294967295,C=y+(_<<9&4294967295|_>>>23),_=I+(y^T&(C^y))+v[11]+643717713&4294967295,I=C+(_<<14&4294967295|_>>>18),_=T+(C^y&(I^C))+v[0]+3921069994&4294967295,T=I+(_<<20&4294967295|_>>>12),_=y+(I^C&(T^I))+v[5]+3593408605&4294967295,y=T+(_<<5&4294967295|_>>>27),_=C+(T^I&(y^T))+v[10]+38016083&4294967295,C=y+(_<<9&4294967295|_>>>23),_=I+(y^T&(C^y))+v[15]+3634488961&4294967295,I=C+(_<<14&4294967295|_>>>18),_=T+(C^y&(I^C))+v[4]+3889429448&4294967295,T=I+(_<<20&4294967295|_>>>12),_=y+(I^C&(T^I))+v[9]+568446438&4294967295,y=T+(_<<5&4294967295|_>>>27),_=C+(T^I&(y^T))+v[14]+3275163606&4294967295,C=y+(_<<9&4294967295|_>>>23),_=I+(y^T&(C^y))+v[3]+4107603335&4294967295,I=C+(_<<14&4294967295|_>>>18),_=T+(C^y&(I^C))+v[8]+1163531501&4294967295,T=I+(_<<20&4294967295|_>>>12),_=y+(I^C&(T^I))+v[13]+2850285829&4294967295,y=T+(_<<5&4294967295|_>>>27),_=C+(T^I&(y^T))+v[2]+4243563512&4294967295,C=y+(_<<9&4294967295|_>>>23),_=I+(y^T&(C^y))+v[7]+1735328473&4294967295,I=C+(_<<14&4294967295|_>>>18),_=T+(C^y&(I^C))+v[12]+2368359562&4294967295,T=I+(_<<20&4294967295|_>>>12),_=y+(T^I^C)+v[5]+4294588738&4294967295,y=T+(_<<4&4294967295|_>>>28),_=C+(y^T^I)+v[8]+2272392833&4294967295,C=y+(_<<11&4294967295|_>>>21),_=I+(C^y^T)+v[11]+1839030562&4294967295,I=C+(_<<16&4294967295|_>>>16),_=T+(I^C^y)+v[14]+4259657740&4294967295,T=I+(_<<23&4294967295|_>>>9),_=y+(T^I^C)+v[1]+2763975236&4294967295,y=T+(_<<4&4294967295|_>>>28),_=C+(y^T^I)+v[4]+1272893353&4294967295,C=y+(_<<11&4294967295|_>>>21),_=I+(C^y^T)+v[7]+4139469664&4294967295,I=C+(_<<16&4294967295|_>>>16),_=T+(I^C^y)+v[10]+3200236656&4294967295,T=I+(_<<23&4294967295|_>>>9),_=y+(T^I^C)+v[13]+681279174&4294967295,y=T+(_<<4&4294967295|_>>>28),_=C+(y^T^I)+v[0]+3936430074&4294967295,C=y+(_<<11&4294967295|_>>>21),_=I+(C^y^T)+v[3]+3572445317&4294967295,I=C+(_<<16&4294967295|_>>>16),_=T+(I^C^y)+v[6]+76029189&4294967295,T=I+(_<<23&4294967295|_>>>9),_=y+(T^I^C)+v[9]+3654602809&4294967295,y=T+(_<<4&4294967295|_>>>28),_=C+(y^T^I)+v[12]+3873151461&4294967295,C=y+(_<<11&4294967295|_>>>21),_=I+(C^y^T)+v[15]+530742520&4294967295,I=C+(_<<16&4294967295|_>>>16),_=T+(I^C^y)+v[2]+3299628645&4294967295,T=I+(_<<23&4294967295|_>>>9),_=y+(I^(T|~C))+v[0]+4096336452&4294967295,y=T+(_<<6&4294967295|_>>>26),_=C+(T^(y|~I))+v[7]+1126891415&4294967295,C=y+(_<<10&4294967295|_>>>22),_=I+(y^(C|~T))+v[14]+2878612391&4294967295,I=C+(_<<15&4294967295|_>>>17),_=T+(C^(I|~y))+v[5]+4237533241&4294967295,T=I+(_<<21&4294967295|_>>>11),_=y+(I^(T|~C))+v[12]+1700485571&4294967295,y=T+(_<<6&4294967295|_>>>26),_=C+(T^(y|~I))+v[3]+2399980690&4294967295,C=y+(_<<10&4294967295|_>>>22),_=I+(y^(C|~T))+v[10]+4293915773&4294967295,I=C+(_<<15&4294967295|_>>>17),_=T+(C^(I|~y))+v[1]+2240044497&4294967295,T=I+(_<<21&4294967295|_>>>11),_=y+(I^(T|~C))+v[8]+1873313359&4294967295,y=T+(_<<6&4294967295|_>>>26),_=C+(T^(y|~I))+v[15]+4264355552&4294967295,C=y+(_<<10&4294967295|_>>>22),_=I+(y^(C|~T))+v[6]+2734768916&4294967295,I=C+(_<<15&4294967295|_>>>17),_=T+(C^(I|~y))+v[13]+1309151649&4294967295,T=I+(_<<21&4294967295|_>>>11),_=y+(I^(T|~C))+v[4]+4149444226&4294967295,y=T+(_<<6&4294967295|_>>>26),_=C+(T^(y|~I))+v[11]+3174756917&4294967295,C=y+(_<<10&4294967295|_>>>22),_=I+(y^(C|~T))+v[2]+718787259&4294967295,I=C+(_<<15&4294967295|_>>>17),_=T+(C^(I|~y))+v[9]+3951481745&4294967295,w.g[0]=w.g[0]+y&4294967295,w.g[1]=w.g[1]+(I+(_<<21&4294967295|_>>>11))&4294967295,w.g[2]=w.g[2]+I&4294967295,w.g[3]=w.g[3]+C&4294967295}r.prototype.v=function(w,y){y===void 0&&(y=w.length);const T=y-this.blockSize,v=this.C;let I=this.h,C=0;for(;C<y;){if(I==0)for(;C<=T;)s(this,w,C),C+=this.blockSize;if(typeof w=="string"){for(;C<y;)if(v[I++]=w.charCodeAt(C++),I==this.blockSize){s(this,v),I=0;break}}else for(;C<y;)if(v[I++]=w[C++],I==this.blockSize){s(this,v),I=0;break}}this.h=I,this.o+=y},r.prototype.A=function(){var w=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);w[0]=128;for(var y=1;y<w.length-8;++y)w[y]=0;y=this.o*8;for(var T=w.length-8;T<w.length;++T)w[T]=y&255,y/=256;for(this.v(w),w=Array(16),y=0,T=0;T<4;++T)for(let v=0;v<32;v+=8)w[y++]=this.g[T]>>>v&255;return w};function i(w,y){var T=c;return Object.prototype.hasOwnProperty.call(T,w)?T[w]:T[w]=y(w)}function o(w,y){this.h=y;const T=[];let v=!0;for(let I=w.length-1;I>=0;I--){const C=w[I]|0;v&&C==y||(T[I]=C,v=!1)}this.g=T}var c={};function l(w){return-128<=w&&w<128?i(w,function(y){return new o([y|0],y<0?-1:0)}):new o([w|0],w<0?-1:0)}function h(w){if(isNaN(w)||!isFinite(w))return p;if(w<0)return b(h(-w));const y=[];let T=1;for(let v=0;w>=T;v++)y[v]=w/T|0,T*=4294967296;return new o(y,0)}function d(w,y){if(w.length==0)throw Error("number format error: empty string");if(y=y||10,y<2||36<y)throw Error("radix out of range: "+y);if(w.charAt(0)=="-")return b(d(w.substring(1),y));if(w.indexOf("-")>=0)throw Error('number format error: interior "-" character');const T=h(Math.pow(y,8));let v=p;for(let C=0;C<w.length;C+=8){var I=Math.min(8,w.length-C);const _=parseInt(w.substring(C,C+I),y);I<8?(I=h(Math.pow(y,I)),v=v.j(I).add(h(_))):(v=v.j(T),v=v.add(h(_)))}return v}var p=l(0),m=l(1),E=l(16777216);n=o.prototype,n.m=function(){if(N(this))return-b(this).m();let w=0,y=1;for(let T=0;T<this.g.length;T++){const v=this.i(T);w+=(v>=0?v:4294967296+v)*y,y*=4294967296}return w},n.toString=function(w){if(w=w||10,w<2||36<w)throw Error("radix out of range: "+w);if(A(this))return"0";if(N(this))return"-"+b(this).toString(w);const y=h(Math.pow(w,6));var T=this;let v="";for(;;){const I=z(T,y).g;T=O(T,I.j(y));let C=((T.g.length>0?T.g[0]:T.h)>>>0).toString(w);if(T=I,A(T))return C+v;for(;C.length<6;)C="0"+C;v=C+v}},n.i=function(w){return w<0?0:w<this.g.length?this.g[w]:this.h};function A(w){if(w.h!=0)return!1;for(let y=0;y<w.g.length;y++)if(w.g[y]!=0)return!1;return!0}function N(w){return w.h==-1}n.l=function(w){return w=O(this,w),N(w)?-1:A(w)?0:1};function b(w){const y=w.g.length,T=[];for(let v=0;v<y;v++)T[v]=~w.g[v];return new o(T,~w.h).add(m)}n.abs=function(){return N(this)?b(this):this},n.add=function(w){const y=Math.max(this.g.length,w.g.length),T=[];let v=0;for(let I=0;I<=y;I++){let C=v+(this.i(I)&65535)+(w.i(I)&65535),_=(C>>>16)+(this.i(I)>>>16)+(w.i(I)>>>16);v=_>>>16,C&=65535,_&=65535,T[I]=_<<16|C}return new o(T,T[T.length-1]&-2147483648?-1:0)};function O(w,y){return w.add(b(y))}n.j=function(w){if(A(this)||A(w))return p;if(N(this))return N(w)?b(this).j(b(w)):b(b(this).j(w));if(N(w))return b(this.j(b(w)));if(this.l(E)<0&&w.l(E)<0)return h(this.m()*w.m());const y=this.g.length+w.g.length,T=[];for(var v=0;v<2*y;v++)T[v]=0;for(v=0;v<this.g.length;v++)for(let I=0;I<w.g.length;I++){const C=this.i(v)>>>16,_=this.i(v)&65535,ie=w.i(I)>>>16,Le=w.i(I)&65535;T[2*v+2*I]+=_*Le,x(T,2*v+2*I),T[2*v+2*I+1]+=C*Le,x(T,2*v+2*I+1),T[2*v+2*I+1]+=_*ie,x(T,2*v+2*I+1),T[2*v+2*I+2]+=C*ie,x(T,2*v+2*I+2)}for(w=0;w<y;w++)T[w]=T[2*w+1]<<16|T[2*w];for(w=y;w<2*y;w++)T[w]=0;return new o(T,0)};function x(w,y){for(;(w[y]&65535)!=w[y];)w[y+1]+=w[y]>>>16,w[y]&=65535,y++}function F(w,y){this.g=w,this.h=y}function z(w,y){if(A(y))throw Error("division by zero");if(A(w))return new F(p,p);if(N(w))return y=z(b(w),y),new F(b(y.g),b(y.h));if(N(y))return y=z(w,b(y)),new F(b(y.g),y.h);if(w.g.length>30){if(N(w)||N(y))throw Error("slowDivide_ only works with positive integers.");for(var T=m,v=y;v.l(w)<=0;)T=ne(T),v=ne(v);var I=Q(T,1),C=Q(v,1);for(v=Q(v,2),T=Q(T,2);!A(v);){var _=C.add(v);_.l(w)<=0&&(I=I.add(T),C=_),v=Q(v,1),T=Q(T,1)}return y=O(w,I.j(y)),new F(I,y)}for(I=p;w.l(y)>=0;){for(T=Math.max(1,Math.floor(w.m()/y.m())),v=Math.ceil(Math.log(T)/Math.LN2),v=v<=48?1:Math.pow(2,v-48),C=h(T),_=C.j(y);N(_)||_.l(w)>0;)T-=v,C=h(T),_=C.j(y);A(C)&&(C=m),I=I.add(C),w=O(w,_)}return new F(I,w)}n.B=function(w){return z(this,w).h},n.and=function(w){const y=Math.max(this.g.length,w.g.length),T=[];for(let v=0;v<y;v++)T[v]=this.i(v)&w.i(v);return new o(T,this.h&w.h)},n.or=function(w){const y=Math.max(this.g.length,w.g.length),T=[];for(let v=0;v<y;v++)T[v]=this.i(v)|w.i(v);return new o(T,this.h|w.h)},n.xor=function(w){const y=Math.max(this.g.length,w.g.length),T=[];for(let v=0;v<y;v++)T[v]=this.i(v)^w.i(v);return new o(T,this.h^w.h)};function ne(w){const y=w.g.length+1,T=[];for(let v=0;v<y;v++)T[v]=w.i(v)<<1|w.i(v-1)>>>31;return new o(T,w.h)}function Q(w,y){const T=y>>5;y%=32;const v=w.g.length-T,I=[];for(let C=0;C<v;C++)I[C]=y>0?w.i(C+T)>>>y|w.i(C+T+1)<<32-y:w.i(C+T);return new o(I,w.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,rf=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=d,Ft=o}).apply(typeof Ou<"u"?Ou:typeof self<"u"?self:typeof window<"u"?window:{});var Ns=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var sf,vr,of,Ws,Sa,af,cf,lf;(function(){var n,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ns=="object"&&Ns];for(var u=0;u<a.length;++u){var f=a[u];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var r=t(this);function s(a,u){if(u)e:{var f=r;a=a.split(".");for(var g=0;g<a.length-1;g++){var S=a[g];if(!(S in f))break e;f=f[S]}a=a[a.length-1],g=f[a],u=u(g),u!=g&&u!=null&&e(f,a,{configurable:!0,writable:!0,value:u})}}s("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(a){return a||function(u){var f=[],g;for(g in u)Object.prototype.hasOwnProperty.call(u,g)&&f.push([g,u[g]]);return f}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function c(a){var u=typeof a;return u=="object"&&a!=null||u=="function"}function l(a,u,f){return a.call.apply(a.bind,arguments)}function h(a,u,f){return h=l,h.apply(null,arguments)}function d(a,u){var f=Array.prototype.slice.call(arguments,1);return function(){var g=f.slice();return g.push.apply(g,arguments),a.apply(this,g)}}function p(a,u){function f(){}f.prototype=u.prototype,a.Z=u.prototype,a.prototype=new f,a.prototype.constructor=a,a.Ob=function(g,S,R){for(var D=Array(arguments.length-2),K=2;K<arguments.length;K++)D[K-2]=arguments[K];return u.prototype[S].apply(g,D)}}var m=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function E(a){const u=a.length;if(u>0){const f=Array(u);for(let g=0;g<u;g++)f[g]=a[g];return f}return[]}function A(a,u){for(let g=1;g<arguments.length;g++){const S=arguments[g];var f=typeof S;if(f=f!="object"?f:S?Array.isArray(S)?"array":f:"null",f=="array"||f=="object"&&typeof S.length=="number"){f=a.length||0;const R=S.length||0;a.length=f+R;for(let D=0;D<R;D++)a[f+D]=S[D]}else a.push(S)}}class N{constructor(u,f){this.i=u,this.j=f,this.h=0,this.g=null}get(){let u;return this.h>0?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function b(a){o.setTimeout(()=>{throw a},0)}function O(){var a=w;let u=null;return a.g&&(u=a.g,a.g=a.g.next,a.g||(a.h=null),u.next=null),u}class x{constructor(){this.h=this.g=null}add(u,f){const g=F.get();g.set(u,f),this.h?this.h.next=g:this.g=g,this.h=g}}var F=new N(()=>new z,a=>a.reset());class z{constructor(){this.next=this.g=this.h=null}set(u,f){this.h=u,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let ne,Q=!1,w=new x,y=()=>{const a=Promise.resolve(void 0);ne=()=>{a.then(T)}};function T(){for(var a;a=O();){try{a.h.call(a.g)}catch(f){b(f)}var u=F;u.j(a),u.h<100&&(u.h++,a.next=u.g,u.g=a)}Q=!1}function v(){this.u=this.u,this.C=this.C}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function I(a,u){this.type=a,this.g=this.target=u,this.defaultPrevented=!1}I.prototype.h=function(){this.defaultPrevented=!0};var C=function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,u=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const f=()=>{};o.addEventListener("test",f,u),o.removeEventListener("test",f,u)}catch{}return a}();function _(a){return/^[\s\xa0]*$/.test(a)}function ie(a,u){I.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,u)}p(ie,I),ie.prototype.init=function(a,u){const f=this.type=a.type,g=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=u,u=a.relatedTarget,u||(f=="mouseover"?u=a.fromElement:f=="mouseout"&&(u=a.toElement)),this.relatedTarget=u,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&ie.Z.h.call(this)},ie.prototype.h=function(){ie.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Le="closure_listenable_"+(Math.random()*1e6|0),Io=0;function or(a,u,f,g,S){this.listener=a,this.proxy=null,this.src=u,this.type=f,this.capture=!!g,this.ha=S,this.key=++Io,this.da=this.fa=!1}function ps(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function ms(a,u,f){for(const g in a)u.call(f,a[g],g,a)}function eg(a,u){for(const f in a)u.call(void 0,a[f],f,a)}function pl(a){const u={};for(const f in a)u[f]=a[f];return u}const ml="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function gl(a,u){let f,g;for(let S=1;S<arguments.length;S++){g=arguments[S];for(f in g)a[f]=g[f];for(let R=0;R<ml.length;R++)f=ml[R],Object.prototype.hasOwnProperty.call(g,f)&&(a[f]=g[f])}}function gs(a){this.src=a,this.g={},this.h=0}gs.prototype.add=function(a,u,f,g,S){const R=a.toString();a=this.g[R],a||(a=this.g[R]=[],this.h++);const D=Ao(a,u,g,S);return D>-1?(u=a[D],f||(u.fa=!1)):(u=new or(u,this.src,R,!!g,S),u.fa=f,a.push(u)),u};function vo(a,u){const f=u.type;if(f in a.g){var g=a.g[f],S=Array.prototype.indexOf.call(g,u,void 0),R;(R=S>=0)&&Array.prototype.splice.call(g,S,1),R&&(ps(u),a.g[f].length==0&&(delete a.g[f],a.h--))}}function Ao(a,u,f,g){for(let S=0;S<a.length;++S){const R=a[S];if(!R.da&&R.listener==u&&R.capture==!!f&&R.ha==g)return S}return-1}var So="closure_lm_"+(Math.random()*1e6|0),Co={};function _l(a,u,f,g,S){if(Array.isArray(u)){for(let R=0;R<u.length;R++)_l(a,u[R],f,g,S);return null}return f=Tl(f),a&&a[Le]?a.J(u,f,c(g)?!!g.capture:!1,S):tg(a,u,f,!1,g,S)}function tg(a,u,f,g,S,R){if(!u)throw Error("Invalid event type");const D=c(S)?!!S.capture:!!S;let K=bo(a);if(K||(a[So]=K=new gs(a)),f=K.add(u,f,g,D,R),f.proxy)return f;if(g=ng(),f.proxy=g,g.src=a,g.listener=f,a.addEventListener)C||(S=D),S===void 0&&(S=!1),a.addEventListener(u.toString(),g,S);else if(a.attachEvent)a.attachEvent(El(u.toString()),g);else if(a.addListener&&a.removeListener)a.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return f}function ng(){function a(f){return u.call(a.src,a.listener,f)}const u=rg;return a}function yl(a,u,f,g,S){if(Array.isArray(u))for(var R=0;R<u.length;R++)yl(a,u[R],f,g,S);else g=c(g)?!!g.capture:!!g,f=Tl(f),a&&a[Le]?(a=a.i,R=String(u).toString(),R in a.g&&(u=a.g[R],f=Ao(u,f,g,S),f>-1&&(ps(u[f]),Array.prototype.splice.call(u,f,1),u.length==0&&(delete a.g[R],a.h--)))):a&&(a=bo(a))&&(u=a.g[u.toString()],a=-1,u&&(a=Ao(u,f,g,S)),(f=a>-1?u[a]:null)&&Ro(f))}function Ro(a){if(typeof a!="number"&&a&&!a.da){var u=a.src;if(u&&u[Le])vo(u.i,a);else{var f=a.type,g=a.proxy;u.removeEventListener?u.removeEventListener(f,g,a.capture):u.detachEvent?u.detachEvent(El(f),g):u.addListener&&u.removeListener&&u.removeListener(g),(f=bo(u))?(vo(f,a),f.h==0&&(f.src=null,u[So]=null)):ps(a)}}}function El(a){return a in Co?Co[a]:Co[a]="on"+a}function rg(a,u){if(a.da)a=!0;else{u=new ie(u,this);const f=a.listener,g=a.ha||a.src;a.fa&&Ro(a),a=f.call(g,u)}return a}function bo(a){return a=a[So],a instanceof gs?a:null}var Po="__closure_events_fn_"+(Math.random()*1e9>>>0);function Tl(a){return typeof a=="function"?a:(a[Po]||(a[Po]=function(u){return a.handleEvent(u)}),a[Po])}function Pe(){v.call(this),this.i=new gs(this),this.M=this,this.G=null}p(Pe,v),Pe.prototype[Le]=!0,Pe.prototype.removeEventListener=function(a,u,f,g){yl(this,a,u,f,g)};function De(a,u){var f,g=a.G;if(g)for(f=[];g;g=g.G)f.push(g);if(a=a.M,g=u.type||u,typeof u=="string")u=new I(u,a);else if(u instanceof I)u.target=u.target||a;else{var S=u;u=new I(g,a),gl(u,S)}S=!0;let R,D;if(f)for(D=f.length-1;D>=0;D--)R=u.g=f[D],S=_s(R,g,!0,u)&&S;if(R=u.g=a,S=_s(R,g,!0,u)&&S,S=_s(R,g,!1,u)&&S,f)for(D=0;D<f.length;D++)R=u.g=f[D],S=_s(R,g,!1,u)&&S}Pe.prototype.N=function(){if(Pe.Z.N.call(this),this.i){var a=this.i;for(const u in a.g){const f=a.g[u];for(let g=0;g<f.length;g++)ps(f[g]);delete a.g[u],a.h--}}this.G=null},Pe.prototype.J=function(a,u,f,g){return this.i.add(String(a),u,!1,f,g)},Pe.prototype.K=function(a,u,f,g){return this.i.add(String(a),u,!0,f,g)};function _s(a,u,f,g){if(u=a.i.g[String(u)],!u)return!0;u=u.concat();let S=!0;for(let R=0;R<u.length;++R){const D=u[R];if(D&&!D.da&&D.capture==f){const K=D.listener,me=D.ha||D.src;D.fa&&vo(a.i,D),S=K.call(me,g)!==!1&&S}}return S&&!g.defaultPrevented}function sg(a,u){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=h(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(u)>2147483647?-1:o.setTimeout(a,u||0)}function wl(a){a.g=sg(()=>{a.g=null,a.i&&(a.i=!1,wl(a))},a.l);const u=a.h;a.h=null,a.m.apply(null,u)}class ig extends v{constructor(u,f){super(),this.m=u,this.l=f,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:wl(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ar(a){v.call(this),this.h=a,this.g={}}p(ar,v);var Il=[];function vl(a){ms(a.g,function(u,f){this.g.hasOwnProperty(f)&&Ro(u)},a),a.g={}}ar.prototype.N=function(){ar.Z.N.call(this),vl(this)},ar.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ko=o.JSON.stringify,og=o.JSON.parse,ag=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function Al(){}function Sl(){}var cr={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function No(){I.call(this,"d")}p(No,I);function Mo(){I.call(this,"c")}p(Mo,I);var Jt={},Cl=null;function ys(){return Cl=Cl||new Pe}Jt.Ia="serverreachability";function Rl(a){I.call(this,Jt.Ia,a)}p(Rl,I);function lr(a){const u=ys();De(u,new Rl(u))}Jt.STAT_EVENT="statevent";function bl(a,u){I.call(this,Jt.STAT_EVENT,a),this.stat=u}p(bl,I);function Oe(a){const u=ys();De(u,new bl(u,a))}Jt.Ja="timingevent";function Pl(a,u){I.call(this,Jt.Ja,a),this.size=u}p(Pl,I);function ur(a,u){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},u)}function hr(){this.g=!0}hr.prototype.ua=function(){this.g=!1};function cg(a,u,f,g,S,R){a.info(function(){if(a.g)if(R){var D="",K=R.split("&");for(let re=0;re<K.length;re++){var me=K[re].split("=");if(me.length>1){const we=me[0];me=me[1];const Xe=we.split("_");D=Xe.length>=2&&Xe[1]=="type"?D+(we+"="+me+"&"):D+(we+"=redacted&")}}}else D=null;else D=R;return"XMLHTTP REQ ("+g+") [attempt "+S+"]: "+u+`
`+f+`
`+D})}function lg(a,u,f,g,S,R,D){a.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+S+"]: "+u+`
`+f+`
`+R+" "+D})}function wn(a,u,f,g){a.info(function(){return"XMLHTTP TEXT ("+u+"): "+hg(a,f)+(g?" "+g:"")})}function ug(a,u){a.info(function(){return"TIMEOUT: "+u})}hr.prototype.info=function(){};function hg(a,u){if(!a.g)return u;if(!u)return null;try{const R=JSON.parse(u);if(R){for(a=0;a<R.length;a++)if(Array.isArray(R[a])){var f=R[a];if(!(f.length<2)){var g=f[1];if(Array.isArray(g)&&!(g.length<1)){var S=g[0];if(S!="noop"&&S!="stop"&&S!="close")for(let D=1;D<g.length;D++)g[D]=""}}}}return ko(R)}catch{return u}}var Es={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},kl={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Nl;function Lo(){}p(Lo,Al),Lo.prototype.g=function(){return new XMLHttpRequest},Nl=new Lo;function dr(a){return encodeURIComponent(String(a))}function dg(a){var u=1;a=a.split(":");const f=[];for(;u>0&&a.length;)f.push(a.shift()),u--;return a.length&&f.push(a.join(":")),f}function Tt(a,u,f,g){this.j=a,this.i=u,this.l=f,this.S=g||1,this.V=new ar(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Ml}function Ml(){this.i=null,this.g="",this.h=!1}var Ll={},Do={};function Oo(a,u,f){a.M=1,a.A=ws(Qe(u)),a.u=f,a.R=!0,Dl(a,null)}function Dl(a,u){a.F=Date.now(),Ts(a),a.B=Qe(a.A);var f=a.B,g=a.S;Array.isArray(g)||(g=[String(g)]),Kl(f.i,"t",g),a.C=0,f=a.j.L,a.h=new Ml,a.g=hu(a.j,f?u:null,!a.u),a.P>0&&(a.O=new ig(h(a.Y,a,a.g),a.P)),u=a.V,f=a.g,g=a.ba;var S="readystatechange";Array.isArray(S)||(S&&(Il[0]=S.toString()),S=Il);for(let R=0;R<S.length;R++){const D=_l(f,S[R],g||u.handleEvent,!1,u.h||u);if(!D)break;u.g[D.key]=D}u=a.J?pl(a.J):{},a.u?(a.v||(a.v="POST"),u["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,u)):(a.v="GET",a.g.ea(a.B,a.v,null,u)),lr(),cg(a.i,a.v,a.B,a.l,a.S,a.u)}Tt.prototype.ba=function(a){a=a.target;const u=this.O;u&&vt(a)==3?u.j():this.Y(a)},Tt.prototype.Y=function(a){try{if(a==this.g)e:{const K=vt(this.g),me=this.g.ya(),re=this.g.ca();if(!(K<3)&&(K!=3||this.g&&(this.h.h||this.g.la()||eu(this.g)))){this.K||K!=4||me==7||(me==8||re<=0?lr(3):lr(2)),Vo(this);var u=this.g.ca();this.X=u;var f=fg(this);if(this.o=u==200,lg(this.i,this.v,this.B,this.l,this.S,K,u),this.o){if(this.U&&!this.L){t:{if(this.g){var g,S=this.g;if((g=S.g?S.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!_(g)){var R=g;break t}}R=null}if(a=R)wn(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,xo(this,a);else{this.o=!1,this.m=3,Oe(12),Zt(this),fr(this);break e}}if(this.R){a=!0;let we;for(;!this.K&&this.C<f.length;)if(we=pg(this,f),we==Do){K==4&&(this.m=4,Oe(14),a=!1),wn(this.i,this.l,null,"[Incomplete Response]");break}else if(we==Ll){this.m=4,Oe(15),wn(this.i,this.l,f,"[Invalid Chunk]"),a=!1;break}else wn(this.i,this.l,we,null),xo(this,we);if(Ol(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),K!=4||f.length!=0||this.h.h||(this.m=1,Oe(16),a=!1),this.o=this.o&&a,!a)wn(this.i,this.l,f,"[Invalid Chunked Response]"),Zt(this),fr(this);else if(f.length>0&&!this.W){this.W=!0;var D=this.j;D.g==this&&D.aa&&!D.P&&(D.j.info("Great, no buffering proxy detected. Bytes received: "+f.length),Wo(D),D.P=!0,Oe(11))}}else wn(this.i,this.l,f,null),xo(this,f);K==4&&Zt(this),this.o&&!this.K&&(K==4?au(this.j,this):(this.o=!1,Ts(this)))}else bg(this.g),u==400&&f.indexOf("Unknown SID")>0?(this.m=3,Oe(12)):(this.m=0,Oe(13)),Zt(this),fr(this)}}}catch{}finally{}};function fg(a){if(!Ol(a))return a.g.la();const u=eu(a.g);if(u==="")return"";let f="";const g=u.length,S=vt(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return Zt(a),fr(a),"";a.h.i=new o.TextDecoder}for(let R=0;R<g;R++)a.h.h=!0,f+=a.h.i.decode(u[R],{stream:!(S&&R==g-1)});return u.length=0,a.h.g+=f,a.C=0,a.h.g}function Ol(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function pg(a,u){var f=a.C,g=u.indexOf(`
`,f);return g==-1?Do:(f=Number(u.substring(f,g)),isNaN(f)?Ll:(g+=1,g+f>u.length?Do:(u=u.slice(g,g+f),a.C=g+f,u)))}Tt.prototype.cancel=function(){this.K=!0,Zt(this)};function Ts(a){a.T=Date.now()+a.H,Vl(a,a.H)}function Vl(a,u){if(a.D!=null)throw Error("WatchDog timer not null");a.D=ur(h(a.aa,a),u)}function Vo(a){a.D&&(o.clearTimeout(a.D),a.D=null)}Tt.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(ug(this.i,this.B),this.M!=2&&(lr(),Oe(17)),Zt(this),this.m=2,fr(this)):Vl(this,this.T-a)};function fr(a){a.j.I==0||a.K||au(a.j,a)}function Zt(a){Vo(a);var u=a.O;u&&typeof u.dispose=="function"&&u.dispose(),a.O=null,vl(a.V),a.g&&(u=a.g,a.g=null,u.abort(),u.dispose())}function xo(a,u){try{var f=a.j;if(f.I!=0&&(f.g==a||Fo(f.h,a))){if(!a.L&&Fo(f.h,a)&&f.I==3){try{var g=f.Ba.g.parse(u)}catch{g=null}if(Array.isArray(g)&&g.length==3){var S=g;if(S[0]==0){e:if(!f.v){if(f.g)if(f.g.F+3e3<a.F)Cs(f),As(f);else break e;qo(f),Oe(18)}}else f.xa=S[1],0<f.xa-f.K&&S[2]<37500&&f.F&&f.A==0&&!f.C&&(f.C=ur(h(f.Va,f),6e3));Bl(f.h)<=1&&f.ta&&(f.ta=void 0)}else tn(f,11)}else if((a.L||f.g==a)&&Cs(f),!_(u))for(S=f.Ba.g.parse(u),u=0;u<S.length;u++){let re=S[u];const we=re[0];if(!(we<=f.K))if(f.K=we,re=re[1],f.I==2)if(re[0]=="c"){f.M=re[1],f.ba=re[2];const Xe=re[3];Xe!=null&&(f.ka=Xe,f.j.info("VER="+f.ka));const nn=re[4];nn!=null&&(f.za=nn,f.j.info("SVER="+f.za));const At=re[5];At!=null&&typeof At=="number"&&At>0&&(g=1.5*At,f.O=g,f.j.info("backChannelRequestTimeoutMs_="+g)),g=f;const St=a.g;if(St){const bs=St.g?St.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(bs){var R=g.h;R.g||bs.indexOf("spdy")==-1&&bs.indexOf("quic")==-1&&bs.indexOf("h2")==-1||(R.j=R.l,R.g=new Set,R.h&&(Bo(R,R.h),R.h=null))}if(g.G){const zo=St.g?St.g.getResponseHeader("X-HTTP-Session-Id"):null;zo&&(g.wa=zo,oe(g.J,g.G,zo))}}f.I=3,f.l&&f.l.ra(),f.aa&&(f.T=Date.now()-a.F,f.j.info("Handshake RTT: "+f.T+"ms")),g=f;var D=a;if(g.na=uu(g,g.L?g.ba:null,g.W),D.L){Ul(g.h,D);var K=D,me=g.O;me&&(K.H=me),K.D&&(Vo(K),Ts(K)),g.g=D}else iu(g);f.i.length>0&&Ss(f)}else re[0]!="stop"&&re[0]!="close"||tn(f,7);else f.I==3&&(re[0]=="stop"||re[0]=="close"?re[0]=="stop"?tn(f,7):jo(f):re[0]!="noop"&&f.l&&f.l.qa(re),f.A=0)}}lr(4)}catch{}}var mg=class{constructor(a,u){this.g=a,this.map=u}};function xl(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Fl(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Bl(a){return a.h?1:a.g?a.g.size:0}function Fo(a,u){return a.h?a.h==u:a.g?a.g.has(u):!1}function Bo(a,u){a.g?a.g.add(u):a.h=u}function Ul(a,u){a.h&&a.h==u?a.h=null:a.g&&a.g.has(u)&&a.g.delete(u)}xl.prototype.cancel=function(){if(this.i=$l(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function $l(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let u=a.i;for(const f of a.g.values())u=u.concat(f.G);return u}return E(a.i)}var Hl=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function gg(a,u){if(a){a=a.split("&");for(let f=0;f<a.length;f++){const g=a[f].indexOf("=");let S,R=null;g>=0?(S=a[f].substring(0,g),R=a[f].substring(g+1)):S=a[f],u(S,R?decodeURIComponent(R.replace(/\+/g," ")):"")}}}function wt(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let u;a instanceof wt?(this.l=a.l,pr(this,a.j),this.o=a.o,this.g=a.g,mr(this,a.u),this.h=a.h,Uo(this,Gl(a.i)),this.m=a.m):a&&(u=String(a).match(Hl))?(this.l=!1,pr(this,u[1]||"",!0),this.o=gr(u[2]||""),this.g=gr(u[3]||"",!0),mr(this,u[4]),this.h=gr(u[5]||"",!0),Uo(this,u[6]||"",!0),this.m=gr(u[7]||"")):(this.l=!1,this.i=new yr(null,this.l))}wt.prototype.toString=function(){const a=[];var u=this.j;u&&a.push(_r(u,jl,!0),":");var f=this.g;return(f||u=="file")&&(a.push("//"),(u=this.o)&&a.push(_r(u,jl,!0),"@"),a.push(dr(f).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.u,f!=null&&a.push(":",String(f))),(f=this.h)&&(this.g&&f.charAt(0)!="/"&&a.push("/"),a.push(_r(f,f.charAt(0)=="/"?Eg:yg,!0))),(f=this.i.toString())&&a.push("?",f),(f=this.m)&&a.push("#",_r(f,wg)),a.join("")},wt.prototype.resolve=function(a){const u=Qe(this);let f=!!a.j;f?pr(u,a.j):f=!!a.o,f?u.o=a.o:f=!!a.g,f?u.g=a.g:f=a.u!=null;var g=a.h;if(f)mr(u,a.u);else if(f=!!a.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var S=u.h.lastIndexOf("/");S!=-1&&(g=u.h.slice(0,S+1)+g)}if(S=g,S==".."||S==".")g="";else if(S.indexOf("./")!=-1||S.indexOf("/.")!=-1){g=S.lastIndexOf("/",0)==0,S=S.split("/");const R=[];for(let D=0;D<S.length;){const K=S[D++];K=="."?g&&D==S.length&&R.push(""):K==".."?((R.length>1||R.length==1&&R[0]!="")&&R.pop(),g&&D==S.length&&R.push("")):(R.push(K),g=!0)}g=R.join("/")}else g=S}return f?u.h=g:f=a.i.toString()!=="",f?Uo(u,Gl(a.i)):f=!!a.m,f&&(u.m=a.m),u};function Qe(a){return new wt(a)}function pr(a,u,f){a.j=f?gr(u,!0):u,a.j&&(a.j=a.j.replace(/:$/,""))}function mr(a,u){if(u){if(u=Number(u),isNaN(u)||u<0)throw Error("Bad port number "+u);a.u=u}else a.u=null}function Uo(a,u,f){u instanceof yr?(a.i=u,Ig(a.i,a.l)):(f||(u=_r(u,Tg)),a.i=new yr(u,a.l))}function oe(a,u,f){a.i.set(u,f)}function ws(a){return oe(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function gr(a,u){return a?u?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function _r(a,u,f){return typeof a=="string"?(a=encodeURI(a).replace(u,_g),f&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function _g(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var jl=/[#\/\?@]/g,yg=/[#\?:]/g,Eg=/[#\?]/g,Tg=/[#\?@]/g,wg=/#/g;function yr(a,u){this.h=this.g=null,this.i=a||null,this.j=!!u}function en(a){a.g||(a.g=new Map,a.h=0,a.i&&gg(a.i,function(u,f){a.add(decodeURIComponent(u.replace(/\+/g," ")),f)}))}n=yr.prototype,n.add=function(a,u){en(this),this.i=null,a=In(this,a);let f=this.g.get(a);return f||this.g.set(a,f=[]),f.push(u),this.h+=1,this};function ql(a,u){en(a),u=In(a,u),a.g.has(u)&&(a.i=null,a.h-=a.g.get(u).length,a.g.delete(u))}function Wl(a,u){return en(a),u=In(a,u),a.g.has(u)}n.forEach=function(a,u){en(this),this.g.forEach(function(f,g){f.forEach(function(S){a.call(u,S,g,this)},this)},this)};function zl(a,u){en(a);let f=[];if(typeof u=="string")Wl(a,u)&&(f=f.concat(a.g.get(In(a,u))));else for(a=Array.from(a.g.values()),u=0;u<a.length;u++)f=f.concat(a[u]);return f}n.set=function(a,u){return en(this),this.i=null,a=In(this,a),Wl(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[u]),this.h+=1,this},n.get=function(a,u){return a?(a=zl(this,a),a.length>0?String(a[0]):u):u};function Kl(a,u,f){ql(a,u),f.length>0&&(a.i=null,a.g.set(In(a,u),E(f)),a.h+=f.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],u=Array.from(this.g.keys());for(let g=0;g<u.length;g++){var f=u[g];const S=dr(f);f=zl(this,f);for(let R=0;R<f.length;R++){let D=S;f[R]!==""&&(D+="="+dr(f[R])),a.push(D)}}return this.i=a.join("&")};function Gl(a){const u=new yr;return u.i=a.i,a.g&&(u.g=new Map(a.g),u.h=a.h),u}function In(a,u){return u=String(u),a.j&&(u=u.toLowerCase()),u}function Ig(a,u){u&&!a.j&&(en(a),a.i=null,a.g.forEach(function(f,g){const S=g.toLowerCase();g!=S&&(ql(this,g),Kl(this,S,f))},a)),a.j=u}function vg(a,u){const f=new hr;if(o.Image){const g=new Image;g.onload=d(It,f,"TestLoadImage: loaded",!0,u,g),g.onerror=d(It,f,"TestLoadImage: error",!1,u,g),g.onabort=d(It,f,"TestLoadImage: abort",!1,u,g),g.ontimeout=d(It,f,"TestLoadImage: timeout",!1,u,g),o.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=a}else u(!1)}function Ag(a,u){const f=new hr,g=new AbortController,S=setTimeout(()=>{g.abort(),It(f,"TestPingServer: timeout",!1,u)},1e4);fetch(a,{signal:g.signal}).then(R=>{clearTimeout(S),R.ok?It(f,"TestPingServer: ok",!0,u):It(f,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(S),It(f,"TestPingServer: error",!1,u)})}function It(a,u,f,g,S){try{S&&(S.onload=null,S.onerror=null,S.onabort=null,S.ontimeout=null),g(f)}catch{}}function Sg(){this.g=new ag}function $o(a){this.i=a.Sb||null,this.h=a.ab||!1}p($o,Al),$o.prototype.g=function(){return new Is(this.i,this.h)};function Is(a,u){Pe.call(this),this.H=a,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(Is,Pe),n=Is.prototype,n.open=function(a,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=u,this.readyState=1,Tr(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const u={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(u.body=a),(this.H||o).fetch(new Request(this.D,u)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Er(this)),this.readyState=0},n.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,Tr(this)),this.g&&(this.readyState=3,Tr(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Ql(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function Ql(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}n.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var u=a.value?a.value:new Uint8Array(0);(u=this.B.decode(u,{stream:!a.done}))&&(this.response=this.responseText+=u)}a.done?Er(this):Tr(this),this.readyState==3&&Ql(this)}},n.Oa=function(a){this.g&&(this.response=this.responseText=a,Er(this))},n.Na=function(a){this.g&&(this.response=a,Er(this))},n.ga=function(){this.g&&Er(this)};function Er(a){a.readyState=4,a.l=null,a.j=null,a.B=null,Tr(a)}n.setRequestHeader=function(a,u){this.A.append(a,u)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],u=this.h.entries();for(var f=u.next();!f.done;)f=f.value,a.push(f[0]+": "+f[1]),f=u.next();return a.join(`\r
`)};function Tr(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Is.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Xl(a){let u="";return ms(a,function(f,g){u+=g,u+=":",u+=f,u+=`\r
`}),u}function Ho(a,u,f){e:{for(g in f){var g=!1;break e}g=!0}g||(f=Xl(f),typeof a=="string"?f!=null&&dr(f):oe(a,u,f))}function he(a){Pe.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(he,Pe);var Cg=/^https?$/i,Rg=["POST","PUT"];n=he.prototype,n.Fa=function(a){this.H=a},n.ea=function(a,u,f,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);u=u?u.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Nl.g(),this.g.onreadystatechange=m(h(this.Ca,this));try{this.B=!0,this.g.open(u,String(a),!0),this.B=!1}catch(R){Yl(this,R);return}if(a=f||"",f=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var S in g)f.set(S,g[S]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const R of g.keys())f.set(R,g.get(R));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(f.keys()).find(R=>R.toLowerCase()=="content-type"),S=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(Rg,u,void 0)>=0)||g||S||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[R,D]of f)this.g.setRequestHeader(R,D);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(R){Yl(this,R)}};function Yl(a,u){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=u,a.o=5,Jl(a),vs(a)}function Jl(a){a.A||(a.A=!0,De(a,"complete"),De(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,De(this,"complete"),De(this,"abort"),vs(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),vs(this,!0)),he.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?Zl(this):this.Xa())},n.Xa=function(){Zl(this)};function Zl(a){if(a.h&&typeof i<"u"){if(a.v&&vt(a)==4)setTimeout(a.Ca.bind(a),0);else if(De(a,"readystatechange"),vt(a)==4){a.h=!1;try{const R=a.ca();e:switch(R){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var f;if(!(f=u)){var g;if(g=R===0){let D=String(a.D).match(Hl)[1]||null;!D&&o.self&&o.self.location&&(D=o.self.location.protocol.slice(0,-1)),g=!Cg.test(D?D.toLowerCase():"")}f=g}if(f)De(a,"complete"),De(a,"success");else{a.o=6;try{var S=vt(a)>2?a.g.statusText:""}catch{S=""}a.l=S+" ["+a.ca()+"]",Jl(a)}}finally{vs(a)}}}}function vs(a,u){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const f=a.g;a.g=null,u||De(a,"ready");try{f.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function vt(a){return a.g?a.g.readyState:0}n.ca=function(){try{return vt(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(a){if(this.g){var u=this.g.responseText;return a&&u.indexOf(a)==0&&(u=u.substring(a.length)),og(u)}};function eu(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function bg(a){const u={};a=(a.g&&vt(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<a.length;g++){if(_(a[g]))continue;var f=dg(a[g]);const S=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const R=u[S]||[];u[S]=R,R.push(f)}eg(u,function(g){return g.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function wr(a,u,f){return f&&f.internalChannelParams&&f.internalChannelParams[a]||u}function tu(a){this.za=0,this.i=[],this.j=new hr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=wr("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=wr("baseRetryDelayMs",5e3,a),this.Za=wr("retryDelaySeedMs",1e4,a),this.Ta=wr("forwardChannelMaxRetries",2,a),this.va=wr("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new xl(a&&a.concurrentRequestLimit),this.Ba=new Sg,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=tu.prototype,n.ka=8,n.I=1,n.connect=function(a,u,f,g){Oe(0),this.W=a,this.H=u||{},f&&g!==void 0&&(this.H.OSID=f,this.H.OAID=g),this.F=this.X,this.J=uu(this,null,this.W),Ss(this)};function jo(a){if(nu(a),a.I==3){var u=a.V++,f=Qe(a.J);if(oe(f,"SID",a.M),oe(f,"RID",u),oe(f,"TYPE","terminate"),Ir(a,f),u=new Tt(a,a.j,u),u.M=2,u.A=ws(Qe(f)),f=!1,o.navigator&&o.navigator.sendBeacon)try{f=o.navigator.sendBeacon(u.A.toString(),"")}catch{}!f&&o.Image&&(new Image().src=u.A,f=!0),f||(u.g=hu(u.j,null),u.g.ea(u.A)),u.F=Date.now(),Ts(u)}lu(a)}function As(a){a.g&&(Wo(a),a.g.cancel(),a.g=null)}function nu(a){As(a),a.v&&(o.clearTimeout(a.v),a.v=null),Cs(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function Ss(a){if(!Fl(a.h)&&!a.m){a.m=!0;var u=a.Ea;ne||y(),Q||(ne(),Q=!0),w.add(u,a),a.D=0}}function Pg(a,u){return Bl(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=u.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=ur(h(a.Ea,a,u),cu(a,a.D)),a.D++,!0)}n.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const S=new Tt(this,this.j,a);let R=this.o;if(this.U&&(R?(R=pl(R),gl(R,this.U)):R=this.U),this.u!==null||this.R||(S.J=R,R=null),this.S)e:{for(var u=0,f=0;f<this.i.length;f++){t:{var g=this.i[f];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(u+=g,u>4096){u=f;break e}if(u===4096||f===this.i.length-1){u=f+1;break e}}u=1e3}else u=1e3;u=su(this,S,u),f=Qe(this.J),oe(f,"RID",a),oe(f,"CVER",22),this.G&&oe(f,"X-HTTP-Session-Id",this.G),Ir(this,f),R&&(this.R?u="headers="+dr(Xl(R))+"&"+u:this.u&&Ho(f,this.u,R)),Bo(this.h,S),this.Ra&&oe(f,"TYPE","init"),this.S?(oe(f,"$req",u),oe(f,"SID","null"),S.U=!0,Oo(S,f,null)):Oo(S,f,u),this.I=2}}else this.I==3&&(a?ru(this,a):this.i.length==0||Fl(this.h)||ru(this))};function ru(a,u){var f;u?f=u.l:f=a.V++;const g=Qe(a.J);oe(g,"SID",a.M),oe(g,"RID",f),oe(g,"AID",a.K),Ir(a,g),a.u&&a.o&&Ho(g,a.u,a.o),f=new Tt(a,a.j,f,a.D+1),a.u===null&&(f.J=a.o),u&&(a.i=u.G.concat(a.i)),u=su(a,f,1e3),f.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),Bo(a.h,f),Oo(f,g,u)}function Ir(a,u){a.H&&ms(a.H,function(f,g){oe(u,g,f)}),a.l&&ms({},function(f,g){oe(u,g,f)})}function su(a,u,f){f=Math.min(a.i.length,f);const g=a.l?h(a.l.Ka,a.l,a):null;e:{var S=a.i;let K=-1;for(;;){const me=["count="+f];K==-1?f>0?(K=S[0].g,me.push("ofs="+K)):K=0:me.push("ofs="+K);let re=!0;for(let we=0;we<f;we++){var R=S[we].g;const Xe=S[we].map;if(R-=K,R<0)K=Math.max(0,S[we].g-100),re=!1;else try{R="req"+R+"_"||"";try{var D=Xe instanceof Map?Xe:Object.entries(Xe);for(const[nn,At]of D){let St=At;c(At)&&(St=ko(At)),me.push(R+nn+"="+encodeURIComponent(St))}}catch(nn){throw me.push(R+"type="+encodeURIComponent("_badmap")),nn}}catch{g&&g(Xe)}}if(re){D=me.join("&");break e}}D=void 0}return a=a.i.splice(0,f),u.G=a,D}function iu(a){if(!a.g&&!a.v){a.Y=1;var u=a.Da;ne||y(),Q||(ne(),Q=!0),w.add(u,a),a.A=0}}function qo(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=ur(h(a.Da,a),cu(a,a.A)),a.A++,!0)}n.Da=function(){if(this.v=null,ou(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=ur(h(this.Wa,this),a)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Oe(10),As(this),ou(this))};function Wo(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function ou(a){a.g=new Tt(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var u=Qe(a.na);oe(u,"RID","rpc"),oe(u,"SID",a.M),oe(u,"AID",a.K),oe(u,"CI",a.F?"0":"1"),!a.F&&a.ia&&oe(u,"TO",a.ia),oe(u,"TYPE","xmlhttp"),Ir(a,u),a.u&&a.o&&Ho(u,a.u,a.o),a.O&&(a.g.H=a.O);var f=a.g;a=a.ba,f.M=1,f.A=ws(Qe(u)),f.u=null,f.R=!0,Dl(f,a)}n.Va=function(){this.C!=null&&(this.C=null,As(this),qo(this),Oe(19))};function Cs(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function au(a,u){var f=null;if(a.g==u){Cs(a),Wo(a),a.g=null;var g=2}else if(Fo(a.h,u))f=u.G,Ul(a.h,u),g=1;else return;if(a.I!=0){if(u.o)if(g==1){f=u.u?u.u.length:0,u=Date.now()-u.F;var S=a.D;g=ys(),De(g,new Pl(g,f)),Ss(a)}else iu(a);else if(S=u.m,S==3||S==0&&u.X>0||!(g==1&&Pg(a,u)||g==2&&qo(a)))switch(f&&f.length>0&&(u=a.h,u.i=u.i.concat(f)),S){case 1:tn(a,5);break;case 4:tn(a,10);break;case 3:tn(a,6);break;default:tn(a,2)}}}function cu(a,u){let f=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(f*=2),f*u}function tn(a,u){if(a.j.info("Error code "+u),u==2){var f=h(a.bb,a),g=a.Ua;const S=!g;g=new wt(g||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||pr(g,"https"),ws(g),S?vg(g.toString(),f):Ag(g.toString(),f)}else Oe(2);a.I=0,a.l&&a.l.pa(u),lu(a),nu(a)}n.bb=function(a){a?(this.j.info("Successfully pinged google.com"),Oe(2)):(this.j.info("Failed to ping google.com"),Oe(1))};function lu(a){if(a.I=0,a.ja=[],a.l){const u=$l(a.h);(u.length!=0||a.i.length!=0)&&(A(a.ja,u),A(a.ja,a.i),a.h.i.length=0,E(a.i),a.i.length=0),a.l.oa()}}function uu(a,u,f){var g=f instanceof wt?Qe(f):new wt(f);if(g.g!="")u&&(g.g=u+"."+g.g),mr(g,g.u);else{var S=o.location;g=S.protocol,u=u?u+"."+S.hostname:S.hostname,S=+S.port;const R=new wt(null);g&&pr(R,g),u&&(R.g=u),S&&mr(R,S),f&&(R.h=f),g=R}return f=a.G,u=a.wa,f&&u&&oe(g,f,u),oe(g,"VER",a.ka),Ir(a,g),g}function hu(a,u,f){if(u&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return u=a.Aa&&!a.ma?new he(new $o({ab:f})):new he(a.ma),u.Fa(a.L),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function du(){}n=du.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Rs(){}Rs.prototype.g=function(a,u){return new Ue(a,u)};function Ue(a,u){Pe.call(this),this.g=new tu(u),this.l=a,this.h=u&&u.messageUrlParams||null,a=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(a?a["X-WebChannel-Content-Type"]=u.messageContentType:a={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.sa&&(a?a["X-WebChannel-Client-Profile"]=u.sa:a={"X-WebChannel-Client-Profile":u.sa}),this.g.U=a,(a=u&&u.Qb)&&!_(a)&&(this.g.u=a),this.A=u&&u.supportsCrossDomainXhr||!1,this.v=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!_(u)&&(this.g.G=u,a=this.h,a!==null&&u in a&&(a=this.h,u in a&&delete a[u])),this.j=new vn(this)}p(Ue,Pe),Ue.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Ue.prototype.close=function(){jo(this.g)},Ue.prototype.o=function(a){var u=this.g;if(typeof a=="string"){var f={};f.__data__=a,a=f}else this.v&&(f={},f.__data__=ko(a),a=f);u.i.push(new mg(u.Ya++,a)),u.I==3&&Ss(u)},Ue.prototype.N=function(){this.g.l=null,delete this.j,jo(this.g),delete this.g,Ue.Z.N.call(this)};function fu(a){No.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var u=a.__sm__;if(u){e:{for(const f in u){a=f;break e}a=void 0}(this.i=a)&&(a=this.i,u=u!==null&&a in u?u[a]:void 0),this.data=u}else this.data=a}p(fu,No);function pu(){Mo.call(this),this.status=1}p(pu,Mo);function vn(a){this.g=a}p(vn,du),vn.prototype.ra=function(){De(this.g,"a")},vn.prototype.qa=function(a){De(this.g,new fu(a))},vn.prototype.pa=function(a){De(this.g,new pu)},vn.prototype.oa=function(){De(this.g,"b")},Rs.prototype.createWebChannel=Rs.prototype.g,Ue.prototype.send=Ue.prototype.o,Ue.prototype.open=Ue.prototype.m,Ue.prototype.close=Ue.prototype.close,lf=function(){return new Rs},cf=function(){return ys()},af=Jt,Sa={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Es.NO_ERROR=0,Es.TIMEOUT=8,Es.HTTP_ERROR=6,Ws=Es,kl.COMPLETE="complete",of=kl,Sl.EventType=cr,cr.OPEN="a",cr.CLOSE="b",cr.ERROR="c",cr.MESSAGE="d",Pe.prototype.listen=Pe.prototype.J,vr=Sl,he.prototype.listenOnce=he.prototype.K,he.prototype.getLastError=he.prototype.Ha,he.prototype.getLastErrorCode=he.prototype.ya,he.prototype.getStatus=he.prototype.ca,he.prototype.getResponseJson=he.prototype.La,he.prototype.getResponseText=he.prototype.la,he.prototype.send=he.prototype.ea,he.prototype.setWithCredentials=he.prototype.Fa,sf=he}).apply(typeof Ns<"u"?Ns:typeof self<"u"?self:typeof window<"u"?window:{});const Vu="@firebase/firestore",xu="4.9.2";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ne.UNAUTHENTICATED=new Ne(null),Ne.GOOGLE_CREDENTIALS=new Ne("google-credentials-uid"),Ne.FIRST_PARTY=new Ne("first-party-uid"),Ne.MOCK_USER=new Ne("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let er="12.3.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hn=new eE("@firebase/firestore");function Rn(){return hn.logLevel}function V(n,...e){if(hn.logLevel<=Z.DEBUG){const t=e.map(hc);hn.debug(`Firestore (${er}): ${n}`,...t)}}function gt(n,...e){if(hn.logLevel<=Z.ERROR){const t=e.map(hc);hn.error(`Firestore (${er}): ${n}`,...t)}}function Wn(n,...e){if(hn.logLevel<=Z.WARN){const t=e.map(hc);hn.warn(`Firestore (${er}): ${n}`,...t)}}function hc(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,uf(n,r,t)}function uf(n,e,t){let r=`FIRESTORE (${er}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw gt(r),new Error(r)}function ee(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||uf(e,s,r)}function W(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const M={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class B extends ef{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cn{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hf{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class tE{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Ne.UNAUTHENTICATED))}shutdown(){}}class nE{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class rE{constructor(e){this.t=e,this.currentUser=Ne.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){ee(this.o===void 0,42304);let r=this.i;const s=l=>this.i!==r?(r=this.i,t(l)):Promise.resolve();let i=new cn;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new cn,e.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const l=i;e.enqueueRetryable(async()=>{await l.promise,await s(this.currentUser)})},c=l=>{V("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(l=>c(l)),setTimeout(()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?c(l):(V("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new cn)}},0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(V("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(ee(typeof r.accessToken=="string",31837,{l:r}),new hf(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return ee(e===null||typeof e=="string",2055,{h:e}),new Ne(e)}}class sE{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=Ne.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class iE{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new sE(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(Ne.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Fu{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class oE{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,We(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){ee(this.o===void 0,3512);const r=i=>{i.error!=null&&V("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.m;return this.m=i.token,V("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{V("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):V("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Fu(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(ee(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Fu(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aE(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dc{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=aE(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function X(n,e){return n<e?-1:n>e?1:0}function Ca(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),i=e.charAt(r);if(s!==i)return Zo(s)===Zo(i)?X(s,i):Zo(s)?1:-1}return X(n.length,e.length)}const cE=55296,lE=57343;function Zo(n){const e=n.charCodeAt(0);return e>=cE&&e<=lE}function zn(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bu="__name__";class Je{constructor(e,t,r){t===void 0?t=0:t>e.length&&$(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&$(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Je.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Je?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=Je.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return X(e.length,t.length)}static compareSegments(e,t){const r=Je.isNumericId(e),s=Je.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?Je.extractNumericId(e).compare(Je.extractNumericId(t)):Ca(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Ft.fromString(e.substring(4,e.length-2))}}class le extends Je{construct(e,t,r){return new le(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new B(M.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new le(t)}static emptyPath(){return new le([])}}const uE=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Ce extends Je{construct(e,t,r){return new Ce(e,t,r)}static isValidIdentifier(e){return uE.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Ce.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Bu}static keyField(){return new Ce([Bu])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new B(M.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new B(M.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[s+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new B(M.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=l,s+=2}else c==="`"?(o=!o,s++):c!=="."||o?(r+=c,s++):(i(),s++)}if(i(),o)throw new B(M.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Ce(t)}static emptyPath(){return new Ce([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U{constructor(e){this.path=e}static fromPath(e){return new U(le.fromString(e))}static fromName(e){return new U(le.fromString(e).popFirst(5))}static empty(){return new U(le.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&le.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return le.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new U(new le(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function df(n,e,t){if(!t)throw new B(M.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function hE(n,e,t,r){if(e===!0&&r===!0)throw new B(M.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Uu(n){if(!U.isDocumentKey(n))throw new B(M.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function $u(n){if(U.isDocumentKey(n))throw new B(M.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function ff(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function fc(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":$(12329,{type:typeof n})}function xn(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new B(M.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=fc(n);throw new B(M.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pe(n,e){const t={typeString:n};return e&&(t.value=e),t}function is(n,e){if(!ff(n))throw new B(M.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const o=n[r];if(s&&typeof o!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new B(M.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hu=-62135596800,ju=1e6;class te{static now(){return te.fromMillis(Date.now())}static fromDate(e){return te.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*ju);return new te(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new B(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new B(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<Hu)throw new B(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new B(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/ju}_compareTo(e){return this.seconds===e.seconds?X(this.nanoseconds,e.nanoseconds):X(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:te._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(is(e,te._jsonSchema))return new te(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Hu;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}te._jsonSchemaVersion="firestore/timestamp/1.0",te._jsonSchema={type:pe("string",te._jsonSchemaVersion),seconds:pe("number"),nanoseconds:pe("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q{static fromTimestamp(e){return new q(e)}static min(){return new q(new te(0,0))}static max(){return new q(new te(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kr=-1;function dE(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=q.fromTimestamp(r===1e9?new te(t+1,0):new te(t,r));return new Ht(s,U.empty(),e)}function fE(n){return new Ht(n.readTime,n.key,Kr)}class Ht{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new Ht(q.min(),U.empty(),Kr)}static max(){return new Ht(q.max(),U.empty(),Kr)}}function pE(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=U.comparator(n.documentKey,e.documentKey),t!==0?t:X(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mE="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class gE{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tr(n){if(n.code!==M.FAILED_PRECONDITION||n.message!==mE)throw n;V("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class k{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&$(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new k((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof k?t:k.resolve(t)}catch(t){return k.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):k.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):k.reject(t)}static resolve(e){return new k((t,r)=>{t(e)})}static reject(e){return new k((t,r)=>{r(e)})}static waitFor(e){return new k((t,r)=>{let s=0,i=0,o=!1;e.forEach(c=>{++s,c.next(()=>{++i,o&&i===s&&t()},l=>r(l))}),o=!0,i===s&&t()})}static or(e){let t=k.resolve(!1);for(const r of e)t=t.next(s=>s?k.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,i)=>{r.push(t.call(this,s,i))}),this.waitFor(r)}static mapArray(e,t){return new k((r,s)=>{const i=e.length,o=new Array(i);let c=0;for(let l=0;l<i;l++){const h=l;t(e[h]).next(d=>{o[h]=d,++c,c===i&&r(o)},d=>s(d))}})}static doWhile(e,t){return new k((r,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):r()};i()})}}function _E(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function nr(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wi{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>t.writeSequenceNumber(r))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}Wi.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pc=-1;function zi(n){return n==null}function li(n){return n===0&&1/n==-1/0}function yE(n){return typeof n=="number"&&Number.isInteger(n)&&!li(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pf="";function EE(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=qu(e)),e=TE(n.get(t),e);return qu(e)}function TE(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case pf:t+="";break;default:t+=i}}return t}function qu(n){return n+pf+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wu(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function mn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function mf(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ue{constructor(e,t){this.comparator=e,this.root=t||Se.EMPTY}insert(e,t){return new ue(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Se.BLACK,null,null))}remove(e){return new ue(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Se.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ms(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ms(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ms(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ms(this.root,e,this.comparator,!0)}}class Ms{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Se{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Se.RED,this.left=s??Se.EMPTY,this.right=i??Se.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Se(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Se.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Se.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Se.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Se.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw $(43730,{key:this.key,value:this.value});if(this.right.isRed())throw $(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw $(27949);return e+(this.isRed()?0:1)}}Se.EMPTY=null,Se.RED=!0,Se.BLACK=!1;Se.EMPTY=new class{constructor(){this.size=0}get key(){throw $(57766)}get value(){throw $(16141)}get color(){throw $(16727)}get left(){throw $(29726)}get right(){throw $(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new Se(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ye{constructor(e){this.comparator=e,this.data=new ue(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new zu(this.data.getIterator())}getIteratorFrom(e){return new zu(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof ye)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new ye(this.comparator);return t.data=e,t}}class zu{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ze{constructor(e){this.fields=e,e.sort(Ce.comparator)}static empty(){return new ze([])}unionWith(e){let t=new ye(Ce.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new ze(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return zn(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class be{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new gf("Invalid base64 string: "+i):i}}(e);return new be(t)}static fromUint8Array(e){const t=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(e);return new be(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return X(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}be.EMPTY_BYTE_STRING=new be("");const wE=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function jt(n){if(ee(!!n,39018),typeof n=="string"){let e=0;const t=wE.exec(n);if(ee(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:de(n.seconds),nanos:de(n.nanos)}}function de(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function qt(n){return typeof n=="string"?be.fromBase64String(n):be.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _f="server_timestamp",yf="__type__",Ef="__previous_value__",Tf="__local_write_time__";function mc(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[yf])==null?void 0:r.stringValue)===_f}function Ki(n){const e=n.mapValue.fields[Ef];return mc(e)?Ki(e):e}function Gr(n){const e=jt(n.mapValue.fields[Tf].timestampValue);return new te(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class IE{constructor(e,t,r,s,i,o,c,l,h,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=l,this.useFetchStreams=h,this.isUsingEmulator=d}}const ui="(default)";class Qr{constructor(e,t){this.projectId=e,this.database=t||ui}static empty(){return new Qr("","")}get isDefaultDatabase(){return this.database===ui}isEqual(e){return e instanceof Qr&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wf="__type__",vE="__max__",Ls={mapValue:{}},If="__vector__",hi="value";function Wt(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?mc(n)?4:SE(n)?9007199254740991:AE(n)?10:11:$(28295,{value:n})}function ot(n,e){if(n===e)return!0;const t=Wt(n);if(t!==Wt(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Gr(n).isEqual(Gr(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const o=jt(s.timestampValue),c=jt(i.timestampValue);return o.seconds===c.seconds&&o.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,i){return qt(s.bytesValue).isEqual(qt(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,i){return de(s.geoPointValue.latitude)===de(i.geoPointValue.latitude)&&de(s.geoPointValue.longitude)===de(i.geoPointValue.longitude)}(n,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return de(s.integerValue)===de(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const o=de(s.doubleValue),c=de(i.doubleValue);return o===c?li(o)===li(c):isNaN(o)&&isNaN(c)}return!1}(n,e);case 9:return zn(n.arrayValue.values||[],e.arrayValue.values||[],ot);case 10:case 11:return function(s,i){const o=s.mapValue.fields||{},c=i.mapValue.fields||{};if(Wu(o)!==Wu(c))return!1;for(const l in o)if(o.hasOwnProperty(l)&&(c[l]===void 0||!ot(o[l],c[l])))return!1;return!0}(n,e);default:return $(52216,{left:n})}}function Xr(n,e){return(n.values||[]).find(t=>ot(t,e))!==void 0}function Kn(n,e){if(n===e)return 0;const t=Wt(n),r=Wt(e);if(t!==r)return X(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return X(n.booleanValue,e.booleanValue);case 2:return function(i,o){const c=de(i.integerValue||i.doubleValue),l=de(o.integerValue||o.doubleValue);return c<l?-1:c>l?1:c===l?0:isNaN(c)?isNaN(l)?0:-1:1}(n,e);case 3:return Ku(n.timestampValue,e.timestampValue);case 4:return Ku(Gr(n),Gr(e));case 5:return Ca(n.stringValue,e.stringValue);case 6:return function(i,o){const c=qt(i),l=qt(o);return c.compareTo(l)}(n.bytesValue,e.bytesValue);case 7:return function(i,o){const c=i.split("/"),l=o.split("/");for(let h=0;h<c.length&&h<l.length;h++){const d=X(c[h],l[h]);if(d!==0)return d}return X(c.length,l.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,o){const c=X(de(i.latitude),de(o.latitude));return c!==0?c:X(de(i.longitude),de(o.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Gu(n.arrayValue,e.arrayValue);case 10:return function(i,o){var m,E,A,N;const c=i.fields||{},l=o.fields||{},h=(m=c[hi])==null?void 0:m.arrayValue,d=(E=l[hi])==null?void 0:E.arrayValue,p=X(((A=h==null?void 0:h.values)==null?void 0:A.length)||0,((N=d==null?void 0:d.values)==null?void 0:N.length)||0);return p!==0?p:Gu(h,d)}(n.mapValue,e.mapValue);case 11:return function(i,o){if(i===Ls.mapValue&&o===Ls.mapValue)return 0;if(i===Ls.mapValue)return 1;if(o===Ls.mapValue)return-1;const c=i.fields||{},l=Object.keys(c),h=o.fields||{},d=Object.keys(h);l.sort(),d.sort();for(let p=0;p<l.length&&p<d.length;++p){const m=Ca(l[p],d[p]);if(m!==0)return m;const E=Kn(c[l[p]],h[d[p]]);if(E!==0)return E}return X(l.length,d.length)}(n.mapValue,e.mapValue);default:throw $(23264,{he:t})}}function Ku(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return X(n,e);const t=jt(n),r=jt(e),s=X(t.seconds,r.seconds);return s!==0?s:X(t.nanos,r.nanos)}function Gu(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=Kn(t[s],r[s]);if(i)return i}return X(t.length,r.length)}function Gn(n){return Ra(n)}function Ra(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=jt(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return qt(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return U.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=Ra(i);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${Ra(t.fields[o])}`;return s+"}"}(n.mapValue):$(61005,{value:n})}function zs(n){switch(Wt(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Ki(n);return e?16+zs(e):16;case 5:return 2*n.stringValue.length;case 6:return qt(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((s,i)=>s+zs(i),0)}(n.arrayValue);case 10:case 11:return function(r){let s=0;return mn(r.fields,(i,o)=>{s+=i.length+zs(o)}),s}(n.mapValue);default:throw $(13486,{value:n})}}function ba(n){return!!n&&"integerValue"in n}function gc(n){return!!n&&"arrayValue"in n}function Qu(n){return!!n&&"nullValue"in n}function Xu(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Ks(n){return!!n&&"mapValue"in n}function AE(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[wf])==null?void 0:r.stringValue)===If}function Lr(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return mn(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Lr(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Lr(n.arrayValue.values[t]);return e}return{...n}}function SE(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===vE}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $e{constructor(e){this.value=e}static empty(){return new $e({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Ks(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Lr(t)}setAll(e){let t=Ce.emptyPath(),r={},s=[];e.forEach((o,c)=>{if(!t.isImmediateParentOf(c)){const l=this.getFieldsMap(t);this.applyChanges(l,r,s),r={},s=[],t=c.popLast()}o?r[c.lastSegment()]=Lr(o):s.push(c.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());Ks(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return ot(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Ks(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){mn(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new $e(Lr(this.value))}}function vf(n){const e=[];return mn(n.fields,(t,r)=>{const s=new Ce([t]);if(Ks(r)){const i=vf(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)}),new ze(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Me{constructor(e,t,r,s,i,o,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=c}static newInvalidDocument(e){return new Me(e,0,q.min(),q.min(),q.min(),$e.empty(),0)}static newFoundDocument(e,t,r,s){return new Me(e,1,t,q.min(),r,s,0)}static newNoDocument(e,t){return new Me(e,2,t,q.min(),q.min(),$e.empty(),0)}static newUnknownDocument(e,t){return new Me(e,3,t,q.min(),q.min(),$e.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(q.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=$e.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=$e.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=q.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Me&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Me(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class di{constructor(e,t){this.position=e,this.inclusive=t}}function Yu(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],o=n.position[s];if(i.field.isKeyField()?r=U.comparator(U.fromName(o.referenceValue),t.key):r=Kn(o,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function Ju(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!ot(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{constructor(e,t="asc"){this.field=e,this.dir=t}}function CE(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Af{}class ge extends Af{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new bE(e,t,r):t==="array-contains"?new NE(e,r):t==="in"?new ME(e,r):t==="not-in"?new LE(e,r):t==="array-contains-any"?new DE(e,r):new ge(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new PE(e,r):new kE(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Kn(t,this.value)):t!==null&&Wt(this.value)===Wt(t)&&this.matchesComparison(Kn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return $(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class at extends Af{constructor(e,t){super(),this.filters=e,this.op=t,this.Pe=null}static create(e,t){return new at(e,t)}matches(e){return Sf(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function Sf(n){return n.op==="and"}function Cf(n){return RE(n)&&Sf(n)}function RE(n){for(const e of n.filters)if(e instanceof at)return!1;return!0}function Pa(n){if(n instanceof ge)return n.field.canonicalString()+n.op.toString()+Gn(n.value);if(Cf(n))return n.filters.map(e=>Pa(e)).join(",");{const e=n.filters.map(t=>Pa(t)).join(",");return`${n.op}(${e})`}}function Rf(n,e){return n instanceof ge?function(r,s){return s instanceof ge&&r.op===s.op&&r.field.isEqual(s.field)&&ot(r.value,s.value)}(n,e):n instanceof at?function(r,s){return s instanceof at&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,o,c)=>i&&Rf(o,s.filters[c]),!0):!1}(n,e):void $(19439)}function bf(n){return n instanceof ge?function(t){return`${t.field.canonicalString()} ${t.op} ${Gn(t.value)}`}(n):n instanceof at?function(t){return t.op.toString()+" {"+t.getFilters().map(bf).join(" ,")+"}"}(n):"Filter"}class bE extends ge{constructor(e,t,r){super(e,t,r),this.key=U.fromName(r.referenceValue)}matches(e){const t=U.comparator(e.key,this.key);return this.matchesComparison(t)}}class PE extends ge{constructor(e,t){super(e,"in",t),this.keys=Pf("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class kE extends ge{constructor(e,t){super(e,"not-in",t),this.keys=Pf("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Pf(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map(r=>U.fromName(r.referenceValue))}class NE extends ge{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return gc(t)&&Xr(t.arrayValue,this.value)}}class ME extends ge{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Xr(this.value.arrayValue,t)}}class LE extends ge{constructor(e,t){super(e,"not-in",t)}matches(e){if(Xr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Xr(this.value.arrayValue,t)}}class DE extends ge{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!gc(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Xr(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OE{constructor(e,t=null,r=[],s=[],i=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=c,this.Te=null}}function Zu(n,e=null,t=[],r=[],s=null,i=null,o=null){return new OE(n,e,t,r,s,i,o)}function _c(n){const e=W(n);if(e.Te===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Pa(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),zi(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Gn(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Gn(r)).join(",")),e.Te=t}return e.Te}function yc(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!CE(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Rf(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!Ju(n.startAt,e.startAt)&&Ju(n.endAt,e.endAt)}function ka(n){return U.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gi{constructor(e,t=null,r=[],s=[],i=null,o="F",c=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=c,this.endAt=l,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function VE(n,e,t,r,s,i,o,c){return new Gi(n,e,t,r,s,i,o,c)}function Ec(n){return new Gi(n)}function eh(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function xE(n){return n.collectionGroup!==null}function Dr(n){const e=W(n);if(e.Ie===null){e.Ie=[];const t=new Set;for(const i of e.explicitOrderBy)e.Ie.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new ye(Ce.comparator);return o.filters.forEach(l=>{l.getFlattenedFilters().forEach(h=>{h.isInequality()&&(c=c.add(h.field))})}),c})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.Ie.push(new fi(i,r))}),t.has(Ce.keyField().canonicalString())||e.Ie.push(new fi(Ce.keyField(),r))}return e.Ie}function et(n){const e=W(n);return e.Ee||(e.Ee=FE(e,Dr(n))),e.Ee}function FE(n,e){if(n.limitType==="F")return Zu(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new fi(s.field,i)});const t=n.endAt?new di(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new di(n.startAt.position,n.startAt.inclusive):null;return Zu(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Na(n,e,t){return new Gi(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Qi(n,e){return yc(et(n),et(e))&&n.limitType===e.limitType}function kf(n){return`${_c(et(n))}|lt:${n.limitType}`}function bn(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>bf(s)).join(", ")}]`),zi(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>Gn(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>Gn(s)).join(",")),`Target(${r})`}(et(n))}; limitType=${n.limitType})`}function Xi(n,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):U.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(n,e)&&function(r,s){for(const i of Dr(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(o,c,l){const h=Yu(o,c,l);return o.inclusive?h<=0:h<0}(r.startAt,Dr(r),s)||r.endAt&&!function(o,c,l){const h=Yu(o,c,l);return o.inclusive?h>=0:h>0}(r.endAt,Dr(r),s))}(n,e)}function BE(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Nf(n){return(e,t)=>{let r=!1;for(const s of Dr(n)){const i=UE(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function UE(n,e,t){const r=n.field.isKeyField()?U.comparator(e.key,t.key):function(i,o,c){const l=o.data.field(i),h=c.data.field(i);return l!==null&&h!==null?Kn(l,h):$(42886)}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return $(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){mn(this.inner,(t,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return mf(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $E=new ue(U.comparator);function _t(){return $E}const Mf=new ue(U.comparator);function Ar(...n){let e=Mf;for(const t of n)e=e.insert(t.key,t);return e}function Lf(n){let e=Mf;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function on(){return Or()}function Df(){return Or()}function Or(){return new gn(n=>n.toString(),(n,e)=>n.isEqual(e))}const HE=new ue(U.comparator),jE=new ye(U.comparator);function Y(...n){let e=jE;for(const t of n)e=e.add(t);return e}const qE=new ye(X);function WE(){return qE}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tc(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:li(e)?"-0":e}}function Of(n){return{integerValue:""+n}}function zE(n,e){return yE(e)?Of(e):Tc(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yi{constructor(){this._=void 0}}function KE(n,e,t){return n instanceof pi?function(s,i){const o={fields:{[yf]:{stringValue:_f},[Tf]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&mc(i)&&(i=Ki(i)),i&&(o.fields[Ef]=i),{mapValue:o}}(t,e):n instanceof Yr?xf(n,e):n instanceof Jr?Ff(n,e):function(s,i){const o=Vf(s,i),c=th(o)+th(s.Ae);return ba(o)&&ba(s.Ae)?Of(c):Tc(s.serializer,c)}(n,e)}function GE(n,e,t){return n instanceof Yr?xf(n,e):n instanceof Jr?Ff(n,e):t}function Vf(n,e){return n instanceof mi?function(r){return ba(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class pi extends Yi{}class Yr extends Yi{constructor(e){super(),this.elements=e}}function xf(n,e){const t=Bf(e);for(const r of n.elements)t.some(s=>ot(s,r))||t.push(r);return{arrayValue:{values:t}}}class Jr extends Yi{constructor(e){super(),this.elements=e}}function Ff(n,e){let t=Bf(e);for(const r of n.elements)t=t.filter(s=>!ot(s,r));return{arrayValue:{values:t}}}class mi extends Yi{constructor(e,t){super(),this.serializer=e,this.Ae=t}}function th(n){return de(n.integerValue||n.doubleValue)}function Bf(n){return gc(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function QE(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof Yr&&s instanceof Yr||r instanceof Jr&&s instanceof Jr?zn(r.elements,s.elements,ot):r instanceof mi&&s instanceof mi?ot(r.Ae,s.Ae):r instanceof pi&&s instanceof pi}(n.transform,e.transform)}class XE{constructor(e,t){this.version=e,this.transformResults=t}}class ft{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new ft}static exists(e){return new ft(void 0,e)}static updateTime(e){return new ft(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Gs(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Ji{}function Uf(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Hf(n.key,ft.none()):new os(n.key,n.data,ft.none());{const t=n.data,r=$e.empty();let s=new ye(Ce.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new _n(n.key,r,new ze(s.toArray()),ft.none())}}function YE(n,e,t){n instanceof os?function(s,i,o){const c=s.value.clone(),l=rh(s.fieldTransforms,i,o.transformResults);c.setAll(l),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(n,e,t):n instanceof _n?function(s,i,o){if(!Gs(s.precondition,i))return void i.convertToUnknownDocument(o.version);const c=rh(s.fieldTransforms,i,o.transformResults),l=i.data;l.setAll($f(s)),l.setAll(c),i.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(n,e,t):function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function Vr(n,e,t,r){return n instanceof os?function(i,o,c,l){if(!Gs(i.precondition,o))return c;const h=i.value.clone(),d=sh(i.fieldTransforms,l,o);return h.setAll(d),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(n,e,t,r):n instanceof _n?function(i,o,c,l){if(!Gs(i.precondition,o))return c;const h=sh(i.fieldTransforms,l,o),d=o.data;return d.setAll($f(i)),d.setAll(h),o.convertToFoundDocument(o.version,d).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(p=>p.field))}(n,e,t,r):function(i,o,c){return Gs(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c}(n,e,t)}function JE(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=Vf(r.transform,s||null);i!=null&&(t===null&&(t=$e.empty()),t.set(r.field,i))}return t||null}function nh(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&zn(r,s,(i,o)=>QE(i,o))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class os extends Ji{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class _n extends Ji{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function $f(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function rh(n,e,t){const r=new Map;ee(n.length===t.length,32656,{Re:t.length,Ve:n.length});for(let s=0;s<t.length;s++){const i=n[s],o=i.transform,c=e.data.field(i.field);r.set(i.field,GE(o,c,t[s]))}return r}function sh(n,e,t){const r=new Map;for(const s of n){const i=s.transform,o=t.data.field(s.field);r.set(s.field,KE(i,o,e))}return r}class Hf extends Ji{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class ZE extends Ji{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eT{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&YE(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Vr(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Vr(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Df();return this.mutations.forEach(s=>{const i=e.get(s.key),o=i.overlayedDocument;let c=this.applyToLocalView(o,i.mutatedFields);c=t.has(s.key)?null:c;const l=Uf(o,c);l!==null&&r.set(s.key,l),o.isValidDocument()||o.convertToNoDocument(q.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Y())}isEqual(e){return this.batchId===e.batchId&&zn(this.mutations,e.mutations,(t,r)=>nh(t,r))&&zn(this.baseMutations,e.baseMutations,(t,r)=>nh(t,r))}}class wc{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){ee(e.mutations.length===r.length,58842,{me:e.mutations.length,fe:r.length});let s=function(){return HE}();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new wc(e,t,r,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tT{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nT{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var fe,J;function rT(n){switch(n){case M.OK:return $(64938);case M.CANCELLED:case M.UNKNOWN:case M.DEADLINE_EXCEEDED:case M.RESOURCE_EXHAUSTED:case M.INTERNAL:case M.UNAVAILABLE:case M.UNAUTHENTICATED:return!1;case M.INVALID_ARGUMENT:case M.NOT_FOUND:case M.ALREADY_EXISTS:case M.PERMISSION_DENIED:case M.FAILED_PRECONDITION:case M.ABORTED:case M.OUT_OF_RANGE:case M.UNIMPLEMENTED:case M.DATA_LOSS:return!0;default:return $(15467,{code:n})}}function jf(n){if(n===void 0)return gt("GRPC error has no .code"),M.UNKNOWN;switch(n){case fe.OK:return M.OK;case fe.CANCELLED:return M.CANCELLED;case fe.UNKNOWN:return M.UNKNOWN;case fe.DEADLINE_EXCEEDED:return M.DEADLINE_EXCEEDED;case fe.RESOURCE_EXHAUSTED:return M.RESOURCE_EXHAUSTED;case fe.INTERNAL:return M.INTERNAL;case fe.UNAVAILABLE:return M.UNAVAILABLE;case fe.UNAUTHENTICATED:return M.UNAUTHENTICATED;case fe.INVALID_ARGUMENT:return M.INVALID_ARGUMENT;case fe.NOT_FOUND:return M.NOT_FOUND;case fe.ALREADY_EXISTS:return M.ALREADY_EXISTS;case fe.PERMISSION_DENIED:return M.PERMISSION_DENIED;case fe.FAILED_PRECONDITION:return M.FAILED_PRECONDITION;case fe.ABORTED:return M.ABORTED;case fe.OUT_OF_RANGE:return M.OUT_OF_RANGE;case fe.UNIMPLEMENTED:return M.UNIMPLEMENTED;case fe.DATA_LOSS:return M.DATA_LOSS;default:return $(39323,{code:n})}}(J=fe||(fe={}))[J.OK=0]="OK",J[J.CANCELLED=1]="CANCELLED",J[J.UNKNOWN=2]="UNKNOWN",J[J.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",J[J.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",J[J.NOT_FOUND=5]="NOT_FOUND",J[J.ALREADY_EXISTS=6]="ALREADY_EXISTS",J[J.PERMISSION_DENIED=7]="PERMISSION_DENIED",J[J.UNAUTHENTICATED=16]="UNAUTHENTICATED",J[J.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",J[J.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",J[J.ABORTED=10]="ABORTED",J[J.OUT_OF_RANGE=11]="OUT_OF_RANGE",J[J.UNIMPLEMENTED=12]="UNIMPLEMENTED",J[J.INTERNAL=13]="INTERNAL",J[J.UNAVAILABLE=14]="UNAVAILABLE",J[J.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sT(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iT=new Ft([4294967295,4294967295],0);function ih(n){const e=sT().encode(n),t=new rf;return t.update(e),new Uint8Array(t.digest())}function oh(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Ft([t,r],0),new Ft([s,i],0)]}class Ic{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Sr(`Invalid padding: ${t}`);if(r<0)throw new Sr(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Sr(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Sr(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.pe=Ft.fromNumber(this.ge)}ye(e,t,r){let s=e.add(t.multiply(Ft.fromNumber(r)));return s.compare(iT)===1&&(s=new Ft([s.getBits(0),s.getBits(1)],0)),s.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=ih(e),[r,s]=oh(t);for(let i=0;i<this.hashCount;i++){const o=this.ye(r,s,i);if(!this.we(o))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new Ic(i,s,t);return r.forEach(c=>o.insert(c)),o}insert(e){if(this.ge===0)return;const t=ih(e),[r,s]=oh(t);for(let i=0;i<this.hashCount;i++){const o=this.ye(r,s,i);this.Se(o)}}Se(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Sr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zi{constructor(e,t,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,as.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Zi(q.min(),s,new ue(X),_t(),Y())}}class as{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new as(r,t,Y(),Y(),Y())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qs{constructor(e,t,r,s){this.be=e,this.removedTargetIds=t,this.key=r,this.De=s}}class qf{constructor(e,t){this.targetId=e,this.Ce=t}}class Wf{constructor(e,t,r=be.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class ah{constructor(){this.ve=0,this.Fe=ch(),this.Me=be.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Y(),t=Y(),r=Y();return this.Fe.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:$(38017,{changeType:i})}}),new as(this.Me,this.xe,e,t,r)}qe(){this.Oe=!1,this.Fe=ch()}Qe(e,t){this.Oe=!0,this.Fe=this.Fe.insert(e,t)}$e(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}Ue(){this.ve+=1}Ke(){this.ve-=1,ee(this.ve>=0,3241,{ve:this.ve})}We(){this.Oe=!0,this.xe=!0}}class oT{constructor(e){this.Ge=e,this.ze=new Map,this.je=_t(),this.Je=Ds(),this.He=Ds(),this.Ye=new ue(X)}Ze(e){for(const t of e.be)e.De&&e.De.isFoundDocument()?this.Xe(t,e.De):this.et(t,e.key,e.De);for(const t of e.removedTargetIds)this.et(t,e.key,e.De)}tt(e){this.forEachTarget(e,t=>{const r=this.nt(t);switch(e.state){case 0:this.rt(t)&&r.Le(e.resumeToken);break;case 1:r.Ke(),r.Ne||r.qe(),r.Le(e.resumeToken);break;case 2:r.Ke(),r.Ne||this.removeTarget(t);break;case 3:this.rt(t)&&(r.We(),r.Le(e.resumeToken));break;case 4:this.rt(t)&&(this.it(t),r.Le(e.resumeToken));break;default:$(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ze.forEach((r,s)=>{this.rt(s)&&t(s)})}st(e){const t=e.targetId,r=e.Ce.count,s=this.ot(t);if(s){const i=s.target;if(ka(i))if(r===0){const o=new U(i.path);this.et(t,o,Me.newNoDocument(o,q.min()))}else ee(r===1,20013,{expectedCount:r});else{const o=this._t(t);if(o!==r){const c=this.ut(e),l=c?this.ct(c,e,o):1;if(l!==0){this.it(t);const h=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ye=this.Ye.insert(t,h)}}}}}ut(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let o,c;try{o=qt(r).toUint8Array()}catch(l){if(l instanceof gf)return Wn("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{c=new Ic(o,s,i)}catch(l){return Wn(l instanceof Sr?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return c.ge===0?null:c}ct(e,t,r){return t.Ce.count===r-this.Pt(e,t.targetId)?0:2}Pt(e,t){const r=this.Ge.getRemoteKeysForTarget(t);let s=0;return r.forEach(i=>{const o=this.Ge.ht(),c=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.et(t,i,null),s++)}),s}Tt(e){const t=new Map;this.ze.forEach((i,o)=>{const c=this.ot(o);if(c){if(i.current&&ka(c.target)){const l=new U(c.target.path);this.It(l).has(o)||this.Et(o,l)||this.et(o,l,Me.newNoDocument(l,e))}i.Be&&(t.set(o,i.ke()),i.qe())}});let r=Y();this.He.forEach((i,o)=>{let c=!0;o.forEachWhile(l=>{const h=this.ot(l);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(i))}),this.je.forEach((i,o)=>o.setReadTime(e));const s=new Zi(e,t,this.Ye,this.je,r);return this.je=_t(),this.Je=Ds(),this.He=Ds(),this.Ye=new ue(X),s}Xe(e,t){if(!this.rt(e))return;const r=this.Et(e,t.key)?2:0;this.nt(e).Qe(t.key,r),this.je=this.je.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.He=this.He.insert(t.key,this.dt(t.key).add(e))}et(e,t,r){if(!this.rt(e))return;const s=this.nt(e);this.Et(e,t)?s.Qe(t,1):s.$e(t),this.He=this.He.insert(t,this.dt(t).delete(e)),this.He=this.He.insert(t,this.dt(t).add(e)),r&&(this.je=this.je.insert(t,r))}removeTarget(e){this.ze.delete(e)}_t(e){const t=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}Ue(e){this.nt(e).Ue()}nt(e){let t=this.ze.get(e);return t||(t=new ah,this.ze.set(e,t)),t}dt(e){let t=this.He.get(e);return t||(t=new ye(X),this.He=this.He.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new ye(X),this.Je=this.Je.insert(e,t)),t}rt(e){const t=this.ot(e)!==null;return t||V("WatchChangeAggregator","Detected inactive target",e),t}ot(e){const t=this.ze.get(e);return t&&t.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new ah),this.Ge.getRemoteKeysForTarget(e).forEach(t=>{this.et(e,t,null)})}Et(e,t){return this.Ge.getRemoteKeysForTarget(e).has(t)}}function Ds(){return new ue(U.comparator)}function ch(){return new ue(U.comparator)}const aT={asc:"ASCENDING",desc:"DESCENDING"},cT={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},lT={and:"AND",or:"OR"};class uT{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Ma(n,e){return n.useProto3Json||zi(e)?e:{value:e}}function gi(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function zf(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function hT(n,e){return gi(n,e.toTimestamp())}function tt(n){return ee(!!n,49232),q.fromTimestamp(function(t){const r=jt(t);return new te(r.seconds,r.nanos)}(n))}function vc(n,e){return La(n,e).canonicalString()}function La(n,e){const t=function(s){return new le(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function Kf(n){const e=le.fromString(n);return ee(Jf(e),10190,{key:e.toString()}),e}function Da(n,e){return vc(n.databaseId,e.path)}function ea(n,e){const t=Kf(e);if(t.get(1)!==n.databaseId.projectId)throw new B(M.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new B(M.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new U(Qf(t))}function Gf(n,e){return vc(n.databaseId,e)}function dT(n){const e=Kf(n);return e.length===4?le.emptyPath():Qf(e)}function Oa(n){return new le(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function Qf(n){return ee(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function lh(n,e,t){return{name:Da(n,e),fields:t.value.mapValue.fields}}function fT(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:$(39313,{state:h})}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,d){return h.useProto3Json?(ee(d===void 0||typeof d=="string",58123),be.fromBase64String(d||"")):(ee(d===void 0||d instanceof Buffer||d instanceof Uint8Array,16193),be.fromUint8Array(d||new Uint8Array))}(n,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&function(h){const d=h.code===void 0?M.UNKNOWN:jf(h.code);return new B(d,h.message||"")}(o);t=new Wf(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=ea(n,r.document.name),i=tt(r.document.updateTime),o=r.document.createTime?tt(r.document.createTime):q.min(),c=new $e({mapValue:{fields:r.document.fields}}),l=Me.newFoundDocument(s,i,o,c),h=r.targetIds||[],d=r.removedTargetIds||[];t=new Qs(h,d,l.key,l)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=ea(n,r.document),i=r.readTime?tt(r.readTime):q.min(),o=Me.newNoDocument(s,i),c=r.removedTargetIds||[];t=new Qs([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=ea(n,r.document),i=r.removedTargetIds||[];t=new Qs([],i,s,null)}else{if(!("filter"in e))return $(11601,{Rt:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new nT(s,i),c=r.targetId;t=new qf(c,o)}}return t}function pT(n,e){let t;if(e instanceof os)t={update:lh(n,e.key,e.value)};else if(e instanceof Hf)t={delete:Da(n,e.key)};else if(e instanceof _n)t={update:lh(n,e.key,e.data),updateMask:vT(e.fieldMask)};else{if(!(e instanceof ZE))return $(16599,{Vt:e.type});t={verify:Da(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(i,o){const c=o.transform;if(c instanceof pi)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Yr)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof Jr)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof mi)return{fieldPath:o.field.canonicalString(),increment:c.Ae};throw $(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:hT(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:$(27497)}(n,e.precondition)),t}function mT(n,e){return n&&n.length>0?(ee(e!==void 0,14353),n.map(t=>function(s,i){let o=s.updateTime?tt(s.updateTime):tt(i);return o.isEqual(q.min())&&(o=tt(i)),new XE(o,s.transformResults||[])}(t,e))):[]}function gT(n,e){return{documents:[Gf(n,e.path)]}}function _T(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=Gf(n,s);const i=function(h){if(h.length!==0)return Yf(at.create(h,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const o=function(h){if(h.length!==0)return h.map(d=>function(m){return{field:Pn(m.field),direction:TT(m.dir)}}(d))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const c=Ma(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{ft:t,parent:s}}function yT(n){let e=dT(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){ee(r===1,65062);const d=t.from[0];d.allDescendants?s=d.collectionId:e=e.child(d.collectionId)}let i=[];t.where&&(i=function(p){const m=Xf(p);return m instanceof at&&Cf(m)?m.getFilters():[m]}(t.where));let o=[];t.orderBy&&(o=function(p){return p.map(m=>function(A){return new fi(kn(A.field),function(b){switch(b){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(A.direction))}(m))}(t.orderBy));let c=null;t.limit&&(c=function(p){let m;return m=typeof p=="object"?p.value:p,zi(m)?null:m}(t.limit));let l=null;t.startAt&&(l=function(p){const m=!!p.before,E=p.values||[];return new di(E,m)}(t.startAt));let h=null;return t.endAt&&(h=function(p){const m=!p.before,E=p.values||[];return new di(E,m)}(t.endAt)),VE(e,s,o,i,c,"F",l,h)}function ET(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return $(28987,{purpose:s})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Xf(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=kn(t.unaryFilter.field);return ge.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=kn(t.unaryFilter.field);return ge.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=kn(t.unaryFilter.field);return ge.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=kn(t.unaryFilter.field);return ge.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return $(61313);default:return $(60726)}}(n):n.fieldFilter!==void 0?function(t){return ge.create(kn(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return $(58110);default:return $(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return at.create(t.compositeFilter.filters.map(r=>Xf(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return $(1026)}}(t.compositeFilter.op))}(n):$(30097,{filter:n})}function TT(n){return aT[n]}function wT(n){return cT[n]}function IT(n){return lT[n]}function Pn(n){return{fieldPath:n.canonicalString()}}function kn(n){return Ce.fromServerFormat(n.fieldPath)}function Yf(n){return n instanceof ge?function(t){if(t.op==="=="){if(Xu(t.value))return{unaryFilter:{field:Pn(t.field),op:"IS_NAN"}};if(Qu(t.value))return{unaryFilter:{field:Pn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Xu(t.value))return{unaryFilter:{field:Pn(t.field),op:"IS_NOT_NAN"}};if(Qu(t.value))return{unaryFilter:{field:Pn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Pn(t.field),op:wT(t.op),value:t.value}}}(n):n instanceof at?function(t){const r=t.getFilters().map(s=>Yf(s));return r.length===1?r[0]:{compositeFilter:{op:IT(t.op),filters:r}}}(n):$(54877,{filter:n})}function vT(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function Jf(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(e,t,r,s,i=q.min(),o=q.min(),c=be.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=l}withSequenceNumber(e){return new Mt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Mt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Mt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Mt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AT{constructor(e){this.yt=e}}function ST(n){const e=yT({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Na(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CT{constructor(){this.Cn=new RT}addToCollectionParentIndex(e,t){return this.Cn.add(t),k.resolve()}getCollectionParents(e,t){return k.resolve(this.Cn.getEntries(t))}addFieldIndex(e,t){return k.resolve()}deleteFieldIndex(e,t){return k.resolve()}deleteAllFieldIndexes(e){return k.resolve()}createTargetIndexes(e,t){return k.resolve()}getDocumentsMatchingTarget(e,t){return k.resolve(null)}getIndexType(e,t){return k.resolve(0)}getFieldIndexes(e,t){return k.resolve([])}getNextCollectionGroupToUpdate(e){return k.resolve(null)}getMinOffset(e,t){return k.resolve(Ht.min())}getMinOffsetFromCollectionGroup(e,t){return k.resolve(Ht.min())}updateCollectionGroup(e,t,r){return k.resolve()}updateIndexEntries(e,t){return k.resolve()}}class RT{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new ye(le.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new ye(le.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uh={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Zf=41943040;class xe{static withCacheSize(e){return new xe(e,xe.DEFAULT_COLLECTION_PERCENTILE,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */xe.DEFAULT_COLLECTION_PERCENTILE=10,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,xe.DEFAULT=new xe(Zf,xe.DEFAULT_COLLECTION_PERCENTILE,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),xe.DISABLED=new xe(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qn{constructor(e){this.ar=e}next(){return this.ar+=2,this.ar}static ur(){return new Qn(0)}static cr(){return new Qn(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hh="LruGarbageCollector",bT=1048576;function dh([n,e],[t,r]){const s=X(n,t);return s===0?X(e,r):s}class PT{constructor(e){this.Ir=e,this.buffer=new ye(dh),this.Er=0}dr(){return++this.Er}Ar(e){const t=[e,this.dr()];if(this.buffer.size<this.Ir)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();dh(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class kT{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Vr(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Vr(e){V(hh,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){nr(t)?V(hh,"Ignoring IndexedDB error during garbage collection: ",t):await tr(t)}await this.Vr(3e5)})}}class NT{constructor(e,t){this.mr=e,this.params=t}calculateTargetCount(e,t){return this.mr.gr(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return k.resolve(Wi.ce);const r=new PT(t);return this.mr.forEachTarget(e,s=>r.Ar(s.sequenceNumber)).next(()=>this.mr.pr(e,s=>r.Ar(s))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.mr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.mr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(V("LruGarbageCollector","Garbage collection skipped; disabled"),k.resolve(uh)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(V("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),uh):this.yr(e,t))}getCacheSize(e){return this.mr.getCacheSize(e)}yr(e,t){let r,s,i,o,c,l,h;const d=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(V("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),s=this.params.maximumSequenceNumbersToCollect):s=p,o=Date.now(),this.nthSequenceNumber(e,s))).next(p=>(r=p,c=Date.now(),this.removeTargets(e,r,t))).next(p=>(i=p,l=Date.now(),this.removeOrphanedDocuments(e,r))).next(p=>(h=Date.now(),Rn()<=Z.DEBUG&&V("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-d}ms
	Determined least recently used ${s} in `+(c-o)+`ms
	Removed ${i} targets in `+(l-c)+`ms
	Removed ${p} documents in `+(h-l)+`ms
Total Duration: ${h-d}ms`),k.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:p})))}}function MT(n,e){return new NT(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LT{constructor(){this.changes=new gn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Me.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?k.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DT{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OT{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&Vr(r.mutation,s,ze.empty(),te.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,Y()).next(()=>r))}getLocalViewOfDocuments(e,t,r=Y()){const s=on();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(i=>{let o=Ar();return i.forEach((c,l)=>{o=o.insert(c,l.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const r=on();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,Y()))}populateOverlays(e,t,r){const s=[];return r.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((o,c)=>{t.set(o,c)})})}computeViews(e,t,r,s){let i=_t();const o=Or(),c=function(){return Or()}();return t.forEach((l,h)=>{const d=r.get(h.key);s.has(h.key)&&(d===void 0||d.mutation instanceof _n)?i=i.insert(h.key,h):d!==void 0?(o.set(h.key,d.mutation.getFieldMask()),Vr(d.mutation,h,d.mutation.getFieldMask(),te.now())):o.set(h.key,ze.empty())}),this.recalculateAndSaveOverlays(e,i).next(l=>(l.forEach((h,d)=>o.set(h,d)),t.forEach((h,d)=>c.set(h,new DT(d,o.get(h)??null))),c))}recalculateAndSaveOverlays(e,t){const r=Or();let s=new ue((o,c)=>o-c),i=Y();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const c of o)c.keys().forEach(l=>{const h=t.get(l);if(h===null)return;let d=r.get(l)||ze.empty();d=c.applyToLocalView(h,d),r.set(l,d);const p=(s.get(c.batchId)||Y()).add(l);s=s.insert(c.batchId,p)})}).next(()=>{const o=[],c=s.getReverseIterator();for(;c.hasNext();){const l=c.getNext(),h=l.key,d=l.value,p=Df();d.forEach(m=>{if(!i.has(m)){const E=Uf(t.get(m),r.get(m));E!==null&&p.set(m,E),i=i.add(m)}}),o.push(this.documentOverlayCache.saveOverlays(e,h,p))}return k.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(o){return U.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):xE(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):k.resolve(on());let c=Kr,l=i;return o.next(h=>k.forEach(h,(d,p)=>(c<p.largestBatchId&&(c=p.largestBatchId),i.get(d)?k.resolve():this.remoteDocumentCache.getEntry(e,d).next(m=>{l=l.insert(d,m)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,l,h,Y())).next(d=>({batchId:c,changes:Lf(d)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new U(t)).next(r=>{let s=Ar();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let o=Ar();return this.indexManager.getCollectionParents(e,i).next(c=>k.forEach(c,l=>{const h=function(p,m){return new Gi(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(t,l.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next(d=>{d.forEach((p,m)=>{o=o.insert(p,m)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s))).next(o=>{i.forEach((l,h)=>{const d=h.getKey();o.get(d)===null&&(o=o.insert(d,Me.newInvalidDocument(d)))});let c=Ar();return o.forEach((l,h)=>{const d=i.get(l);d!==void 0&&Vr(d.mutation,h,ze.empty(),te.now()),Xi(t,h)&&(c=c.insert(l,h))}),c})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VT{constructor(e){this.serializer=e,this.Lr=new Map,this.kr=new Map}getBundleMetadata(e,t){return k.resolve(this.Lr.get(t))}saveBundleMetadata(e,t){return this.Lr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:tt(s.createTime)}}(t)),k.resolve()}getNamedQuery(e,t){return k.resolve(this.kr.get(t))}saveNamedQuery(e,t){return this.kr.set(t.name,function(s){return{name:s.name,query:ST(s.bundledQuery),readTime:tt(s.readTime)}}(t)),k.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xT{constructor(){this.overlays=new ue(U.comparator),this.qr=new Map}getOverlay(e,t){return k.resolve(this.overlays.get(t))}getOverlays(e,t){const r=on();return k.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,i)=>{this.St(e,t,i)}),k.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.qr.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.qr.delete(r)),k.resolve()}getOverlaysForCollection(e,t,r){const s=on(),i=t.length+1,o=new U(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){const l=c.getNext().value,h=l.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===i&&l.largestBatchId>r&&s.set(l.getKey(),l)}return k.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new ue((h,d)=>h-d);const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>r){let d=i.get(h.largestBatchId);d===null&&(d=on(),i=i.insert(h.largestBatchId,d)),d.set(h.getKey(),h)}}const c=on(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((h,d)=>c.set(h,d)),!(c.size()>=s)););return k.resolve(c)}St(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.qr.get(s.largestBatchId).delete(r.key);this.qr.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new tT(t,r));let i=this.qr.get(t);i===void 0&&(i=Y(),this.qr.set(t,i)),this.qr.set(t,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FT{constructor(){this.sessionToken=be.EMPTY_BYTE_STRING}getSessionToken(e){return k.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,k.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ac{constructor(){this.Qr=new ye(ve.$r),this.Ur=new ye(ve.Kr)}isEmpty(){return this.Qr.isEmpty()}addReference(e,t){const r=new ve(e,t);this.Qr=this.Qr.add(r),this.Ur=this.Ur.add(r)}Wr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Gr(new ve(e,t))}zr(e,t){e.forEach(r=>this.removeReference(r,t))}jr(e){const t=new U(new le([])),r=new ve(t,e),s=new ve(t,e+1),i=[];return this.Ur.forEachInRange([r,s],o=>{this.Gr(o),i.push(o.key)}),i}Jr(){this.Qr.forEach(e=>this.Gr(e))}Gr(e){this.Qr=this.Qr.delete(e),this.Ur=this.Ur.delete(e)}Hr(e){const t=new U(new le([])),r=new ve(t,e),s=new ve(t,e+1);let i=Y();return this.Ur.forEachInRange([r,s],o=>{i=i.add(o.key)}),i}containsKey(e){const t=new ve(e,0),r=this.Qr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class ve{constructor(e,t){this.key=e,this.Yr=t}static $r(e,t){return U.comparator(e.key,t.key)||X(e.Yr,t.Yr)}static Kr(e,t){return X(e.Yr,t.Yr)||U.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BT{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.tr=1,this.Zr=new ye(ve.$r)}checkEmpty(e){return k.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.tr;this.tr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new eT(i,t,r,s);this.mutationQueue.push(o);for(const c of s)this.Zr=this.Zr.add(new ve(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return k.resolve(o)}lookupMutationBatch(e,t){return k.resolve(this.Xr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.ei(r),i=s<0?0:s;return k.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return k.resolve(this.mutationQueue.length===0?pc:this.tr-1)}getAllMutationBatches(e){return k.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new ve(t,0),s=new ve(t,Number.POSITIVE_INFINITY),i=[];return this.Zr.forEachInRange([r,s],o=>{const c=this.Xr(o.Yr);i.push(c)}),k.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ye(X);return t.forEach(s=>{const i=new ve(s,0),o=new ve(s,Number.POSITIVE_INFINITY);this.Zr.forEachInRange([i,o],c=>{r=r.add(c.Yr)})}),k.resolve(this.ti(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;U.isDocumentKey(i)||(i=i.child(""));const o=new ve(new U(i),0);let c=new ye(X);return this.Zr.forEachWhile(l=>{const h=l.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(c=c.add(l.Yr)),!0)},o),k.resolve(this.ti(c))}ti(e){const t=[];return e.forEach(r=>{const s=this.Xr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){ee(this.ni(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Zr;return k.forEach(t.mutations,s=>{const i=new ve(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.Zr=r})}ir(e){}containsKey(e,t){const r=new ve(t,0),s=this.Zr.firstAfterOrEqual(r);return k.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,k.resolve()}ni(e,t){return this.ei(e)}ei(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Xr(e){const t=this.ei(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UT{constructor(e){this.ri=e,this.docs=function(){return new ue(U.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,o=this.ri(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return k.resolve(r?r.document.mutableCopy():Me.newInvalidDocument(t))}getEntries(e,t){let r=_t();return t.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Me.newInvalidDocument(s))}),k.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let i=_t();const o=t.path,c=new U(o.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(c);for(;l.hasNext();){const{key:h,value:{document:d}}=l.getNext();if(!o.isPrefixOf(h.path))break;h.path.length>o.length+1||pE(fE(d),r)<=0||(s.has(d.key)||Xi(t,d))&&(i=i.insert(d.key,d.mutableCopy()))}return k.resolve(i)}getAllFromCollectionGroup(e,t,r,s){$(9500)}ii(e,t){return k.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new $T(this)}getSize(e){return k.resolve(this.size)}}class $T extends LT{constructor(e){super(),this.Nr=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.Nr.addEntry(e,s)):this.Nr.removeEntry(r)}),k.waitFor(t)}getFromCache(e,t){return this.Nr.getEntry(e,t)}getAllFromCache(e,t){return this.Nr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HT{constructor(e){this.persistence=e,this.si=new gn(t=>_c(t),yc),this.lastRemoteSnapshotVersion=q.min(),this.highestTargetId=0,this.oi=0,this._i=new Ac,this.targetCount=0,this.ai=Qn.ur()}forEachTarget(e,t){return this.si.forEach((r,s)=>t(s)),k.resolve()}getLastRemoteSnapshotVersion(e){return k.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return k.resolve(this.oi)}allocateTargetId(e){return this.highestTargetId=this.ai.next(),k.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.oi&&(this.oi=t),k.resolve()}Pr(e){this.si.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.ai=new Qn(t),this.highestTargetId=t),e.sequenceNumber>this.oi&&(this.oi=e.sequenceNumber)}addTargetData(e,t){return this.Pr(t),this.targetCount+=1,k.resolve()}updateTargetData(e,t){return this.Pr(t),k.resolve()}removeTargetData(e,t){return this.si.delete(t.target),this._i.jr(t.targetId),this.targetCount-=1,k.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.si.forEach((o,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.si.delete(o),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)}),k.waitFor(i).next(()=>s)}getTargetCount(e){return k.resolve(this.targetCount)}getTargetData(e,t){const r=this.si.get(t)||null;return k.resolve(r)}addMatchingKeys(e,t,r){return this._i.Wr(t,r),k.resolve()}removeMatchingKeys(e,t,r){this._i.zr(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(o=>{i.push(s.markPotentiallyOrphaned(e,o))}),k.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this._i.jr(t),k.resolve()}getMatchingKeysForTargetId(e,t){const r=this._i.Hr(t);return k.resolve(r)}containsKey(e,t){return k.resolve(this._i.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ep{constructor(e,t){this.ui={},this.overlays={},this.ci=new Wi(0),this.li=!1,this.li=!0,this.hi=new FT,this.referenceDelegate=e(this),this.Pi=new HT(this),this.indexManager=new CT,this.remoteDocumentCache=function(s){return new UT(s)}(r=>this.referenceDelegate.Ti(r)),this.serializer=new AT(t),this.Ii=new VT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.li=!1,Promise.resolve()}get started(){return this.li}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new xT,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.ui[e.toKey()];return r||(r=new BT(t,this.referenceDelegate),this.ui[e.toKey()]=r),r}getGlobalsCache(){return this.hi}getTargetCache(){return this.Pi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ii}runTransaction(e,t,r){V("MemoryPersistence","Starting transaction:",e);const s=new jT(this.ci.next());return this.referenceDelegate.Ei(),r(s).next(i=>this.referenceDelegate.di(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Ai(e,t){return k.or(Object.values(this.ui).map(r=>()=>r.containsKey(e,t)))}}class jT extends gE{constructor(e){super(),this.currentSequenceNumber=e}}class Sc{constructor(e){this.persistence=e,this.Ri=new Ac,this.Vi=null}static mi(e){return new Sc(e)}get fi(){if(this.Vi)return this.Vi;throw $(60996)}addReference(e,t,r){return this.Ri.addReference(r,t),this.fi.delete(r.toString()),k.resolve()}removeReference(e,t,r){return this.Ri.removeReference(r,t),this.fi.add(r.toString()),k.resolve()}markPotentiallyOrphaned(e,t){return this.fi.add(t.toString()),k.resolve()}removeTarget(e,t){this.Ri.jr(t.targetId).forEach(s=>this.fi.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.fi.add(i.toString()))}).next(()=>r.removeTargetData(e,t))}Ei(){this.Vi=new Set}di(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return k.forEach(this.fi,r=>{const s=U.fromPath(r);return this.gi(e,s).next(i=>{i||t.removeEntry(s,q.min())})}).next(()=>(this.Vi=null,t.apply(e)))}updateLimboDocument(e,t){return this.gi(e,t).next(r=>{r?this.fi.delete(t.toString()):this.fi.add(t.toString())})}Ti(e){return 0}gi(e,t){return k.or([()=>k.resolve(this.Ri.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ai(e,t)])}}class _i{constructor(e,t){this.persistence=e,this.pi=new gn(r=>EE(r.path),(r,s)=>r.isEqual(s)),this.garbageCollector=MT(this,t)}static mi(e,t){return new _i(e,t)}Ei(){}di(e){return k.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}gr(e){const t=this.wr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(s=>r+s))}wr(e){let t=0;return this.pr(e,r=>{t++}).next(()=>t)}pr(e,t){return k.forEach(this.pi,(r,s)=>this.br(e,r,s).next(i=>i?k.resolve():t(s)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.ii(e,o=>this.br(e,o,t).next(c=>{c||(r++,i.removeEntry(o,q.min()))})).next(()=>i.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.pi.set(t,e.currentSequenceNumber),k.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.pi.set(r,e.currentSequenceNumber),k.resolve()}removeReference(e,t,r){return this.pi.set(r,e.currentSequenceNumber),k.resolve()}updateLimboDocument(e,t){return this.pi.set(t,e.currentSequenceNumber),k.resolve()}Ti(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=zs(e.data.value)),t}br(e,t,r){return k.or([()=>this.persistence.Ai(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.pi.get(t);return k.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cc{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.Es=r,this.ds=s}static As(e,t){let r=Y(),s=Y();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Cc(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qT{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WT{constructor(){this.Rs=!1,this.Vs=!1,this.fs=100,this.gs=function(){return qy()?8:_E(Hy())>0?6:4}()}initialize(e,t){this.ps=e,this.indexManager=t,this.Rs=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.ys(e,t).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.ws(e,t,s,r).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new qT;return this.Ss(e,t,o).next(c=>{if(i.result=c,this.Vs)return this.bs(e,t,o,c.size)})}).next(()=>i.result)}bs(e,t,r,s){return r.documentReadCount<this.fs?(Rn()<=Z.DEBUG&&V("QueryEngine","SDK will not create cache indexes for query:",bn(t),"since it only creates cache indexes for collection contains","more than or equal to",this.fs,"documents"),k.resolve()):(Rn()<=Z.DEBUG&&V("QueryEngine","Query:",bn(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.gs*s?(Rn()<=Z.DEBUG&&V("QueryEngine","The SDK decides to create cache indexes for query:",bn(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,et(t))):k.resolve())}ys(e,t){if(eh(t))return k.resolve(null);let r=et(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=Na(t,null,"F"),r=et(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const o=Y(...i);return this.ps.getDocuments(e,o).next(c=>this.indexManager.getMinOffset(e,r).next(l=>{const h=this.Ds(t,c);return this.Cs(t,h,o,l.readTime)?this.ys(e,Na(t,null,"F")):this.vs(e,h,t,l)}))})))}ws(e,t,r,s){return eh(t)||s.isEqual(q.min())?k.resolve(null):this.ps.getDocuments(e,r).next(i=>{const o=this.Ds(t,i);return this.Cs(t,o,r,s)?k.resolve(null):(Rn()<=Z.DEBUG&&V("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),bn(t)),this.vs(e,o,t,dE(s,Kr)).next(c=>c))})}Ds(e,t){let r=new ye(Nf(e));return t.forEach((s,i)=>{Xi(e,i)&&(r=r.add(i))}),r}Cs(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Ss(e,t,r){return Rn()<=Z.DEBUG&&V("QueryEngine","Using full collection scan to execute query:",bn(t)),this.ps.getDocumentsMatchingQuery(e,t,Ht.min(),r)}vs(e,t,r,s){return this.ps.getDocumentsMatchingQuery(e,r,s).next(i=>(t.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rc="LocalStore",zT=3e8;class KT{constructor(e,t,r,s){this.persistence=e,this.Fs=t,this.serializer=s,this.Ms=new ue(X),this.xs=new gn(i=>_c(i),yc),this.Os=new Map,this.Ns=e.getRemoteDocumentCache(),this.Pi=e.getTargetCache(),this.Ii=e.getBundleCache(),this.Bs(r)}Bs(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new OT(this.Ns,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Ns.setIndexManager(this.indexManager),this.Fs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Ms))}}function GT(n,e,t,r){return new KT(n,e,t,r)}async function tp(n,e){const t=W(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,t.Bs(e),t.mutationQueue.getAllMutationBatches(r))).next(i=>{const o=[],c=[];let l=Y();for(const h of s){o.push(h.batchId);for(const d of h.mutations)l=l.add(d.key)}for(const h of i){c.push(h.batchId);for(const d of h.mutations)l=l.add(d.key)}return t.localDocuments.getDocuments(r,l).next(h=>({Ls:h,removedBatchIds:o,addedBatchIds:c}))})})}function QT(n,e){const t=W(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=t.Ns.newChangeBuffer({trackRemovals:!0});return function(c,l,h,d){const p=h.batch,m=p.keys();let E=k.resolve();return m.forEach(A=>{E=E.next(()=>d.getEntry(l,A)).next(N=>{const b=h.docVersions.get(A);ee(b!==null,48541),N.version.compareTo(b)<0&&(p.applyToRemoteDocument(N,h),N.isValidDocument()&&(N.setReadTime(h.commitVersion),d.addEntry(N)))})}),E.next(()=>c.mutationQueue.removeMutationBatch(l,p))}(t,r,e,i).next(()=>i.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(c){let l=Y();for(let h=0;h<c.mutationResults.length;++h)c.mutationResults[h].transformResults.length>0&&(l=l.add(c.batch.mutations[h].key));return l}(e))).next(()=>t.localDocuments.getDocuments(r,s))})}function np(n){const e=W(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Pi.getLastRemoteSnapshotVersion(t))}function XT(n,e){const t=W(n),r=e.snapshotVersion;let s=t.Ms;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=t.Ns.newChangeBuffer({trackRemovals:!0});s=t.Ms;const c=[];e.targetChanges.forEach((d,p)=>{const m=s.get(p);if(!m)return;c.push(t.Pi.removeMatchingKeys(i,d.removedDocuments,p).next(()=>t.Pi.addMatchingKeys(i,d.addedDocuments,p)));let E=m.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?E=E.withResumeToken(be.EMPTY_BYTE_STRING,q.min()).withLastLimboFreeSnapshotVersion(q.min()):d.resumeToken.approximateByteSize()>0&&(E=E.withResumeToken(d.resumeToken,r)),s=s.insert(p,E),function(N,b,O){return N.resumeToken.approximateByteSize()===0||b.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=zT?!0:O.addedDocuments.size+O.modifiedDocuments.size+O.removedDocuments.size>0}(m,E,d)&&c.push(t.Pi.updateTargetData(i,E))});let l=_t(),h=Y();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,d))}),c.push(YT(i,o,e.documentUpdates).next(d=>{l=d.ks,h=d.qs})),!r.isEqual(q.min())){const d=t.Pi.getLastRemoteSnapshotVersion(i).next(p=>t.Pi.setTargetsMetadata(i,i.currentSequenceNumber,r));c.push(d)}return k.waitFor(c).next(()=>o.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,l,h)).next(()=>l)}).then(i=>(t.Ms=s,i))}function YT(n,e,t){let r=Y(),s=Y();return t.forEach(i=>r=r.add(i)),e.getEntries(n,r).next(i=>{let o=_t();return t.forEach((c,l)=>{const h=i.get(c);l.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(c)),l.isNoDocument()&&l.version.isEqual(q.min())?(e.removeEntry(c,l.readTime),o=o.insert(c,l)):!h.isValidDocument()||l.version.compareTo(h.version)>0||l.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(l),o=o.insert(c,l)):V(Rc,"Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",l.version)}),{ks:o,qs:s}})}function JT(n,e){const t=W(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=pc),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function ZT(n,e){const t=W(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.Pi.getTargetData(r,e).next(i=>i?(s=i,k.resolve(s)):t.Pi.allocateTargetId(r).next(o=>(s=new Mt(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.Pi.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.Ms.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.Ms=t.Ms.insert(r.targetId,r),t.xs.set(e,r.targetId)),r})}async function Va(n,e,t){const r=W(n),s=r.Ms.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,o=>r.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!nr(o))throw o;V(Rc,`Failed to update sequence numbers for target ${e}: ${o}`)}r.Ms=r.Ms.remove(e),r.xs.delete(s.target)}function fh(n,e,t){const r=W(n);let s=q.min(),i=Y();return r.persistence.runTransaction("Execute query","readwrite",o=>function(l,h,d){const p=W(l),m=p.xs.get(d);return m!==void 0?k.resolve(p.Ms.get(m)):p.Pi.getTargetData(h,d)}(r,o,et(e)).next(c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.Pi.getMatchingKeysForTargetId(o,c.targetId).next(l=>{i=l})}).next(()=>r.Fs.getDocumentsMatchingQuery(o,e,t?s:q.min(),t?i:Y())).next(c=>(ew(r,BE(e),c),{documents:c,Qs:i})))}function ew(n,e,t){let r=n.Os.get(e)||q.min();t.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),n.Os.set(e,r)}class ph{constructor(){this.activeTargetIds=WE()}zs(e){this.activeTargetIds=this.activeTargetIds.add(e)}js(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Gs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class tw{constructor(){this.Mo=new ph,this.xo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.Mo.zs(e),this.xo[e]||"not-current"}updateQueryState(e,t,r){this.xo[e]=t}removeLocalQueryTarget(e){this.Mo.js(e)}isLocalQueryTarget(e){return this.Mo.activeTargetIds.has(e)}clearQueryState(e){delete this.xo[e]}getAllActiveQueryTargets(){return this.Mo.activeTargetIds}isActiveQueryTarget(e){return this.Mo.activeTargetIds.has(e)}start(){return this.Mo=new ph,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nw{Oo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mh="ConnectivityMonitor";class gh{constructor(){this.No=()=>this.Bo(),this.Lo=()=>this.ko(),this.qo=[],this.Qo()}Oo(e){this.qo.push(e)}shutdown(){window.removeEventListener("online",this.No),window.removeEventListener("offline",this.Lo)}Qo(){window.addEventListener("online",this.No),window.addEventListener("offline",this.Lo)}Bo(){V(mh,"Network connectivity changed: AVAILABLE");for(const e of this.qo)e(0)}ko(){V(mh,"Network connectivity changed: UNAVAILABLE");for(const e of this.qo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Os=null;function xa(){return Os===null?Os=function(){return 268435456+Math.round(2147483648*Math.random())}():Os++,"0x"+Os.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ta="RestConnection",rw={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class sw{get $o(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Uo=t+"://"+e.host,this.Ko=`projects/${r}/databases/${s}`,this.Wo=this.databaseId.database===ui?`project_id=${r}`:`project_id=${r}&database_id=${s}`}Go(e,t,r,s,i){const o=xa(),c=this.zo(e,t.toUriEncodedString());V(ta,`Sending RPC '${e}' ${o}:`,c,r);const l={"google-cloud-resource-prefix":this.Ko,"x-goog-request-params":this.Wo};this.jo(l,s,i);const{host:h}=new URL(c),d=uc(h);return this.Jo(e,c,l,r,d).then(p=>(V(ta,`Received RPC '${e}' ${o}: `,p),p),p=>{throw Wn(ta,`RPC '${e}' ${o} failed with error: `,p,"url: ",c,"request:",r),p})}Ho(e,t,r,s,i,o){return this.Go(e,t,r,s,i)}jo(e,t,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+er}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((s,i)=>e[i]=s),r&&r.headers.forEach((s,i)=>e[i]=s)}zo(e,t){const r=rw[e];return`${this.Uo}/v1/${t}:${r}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iw{constructor(e){this.Yo=e.Yo,this.Zo=e.Zo}Xo(e){this.e_=e}t_(e){this.n_=e}r_(e){this.i_=e}onMessage(e){this.s_=e}close(){this.Zo()}send(e){this.Yo(e)}o_(){this.e_()}__(){this.n_()}a_(e){this.i_(e)}u_(e){this.s_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ke="WebChannelConnection";class ow extends sw{constructor(e){super(e),this.c_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Jo(e,t,r,s,i){const o=xa();return new Promise((c,l)=>{const h=new sf;h.setWithCredentials(!0),h.listenOnce(of.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case Ws.NO_ERROR:const p=h.getResponseJson();V(ke,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),c(p);break;case Ws.TIMEOUT:V(ke,`RPC '${e}' ${o} timed out`),l(new B(M.DEADLINE_EXCEEDED,"Request time out"));break;case Ws.HTTP_ERROR:const m=h.getStatus();if(V(ke,`RPC '${e}' ${o} failed with status:`,m,"response text:",h.getResponseText()),m>0){let E=h.getResponseJson();Array.isArray(E)&&(E=E[0]);const A=E==null?void 0:E.error;if(A&&A.status&&A.message){const N=function(O){const x=O.toLowerCase().replace(/_/g,"-");return Object.values(M).indexOf(x)>=0?x:M.UNKNOWN}(A.status);l(new B(N,A.message))}else l(new B(M.UNKNOWN,"Server responded with status "+h.getStatus()))}else l(new B(M.UNAVAILABLE,"Connection failed."));break;default:$(9055,{l_:e,streamId:o,h_:h.getLastErrorCode(),P_:h.getLastError()})}}finally{V(ke,`RPC '${e}' ${o} completed.`)}});const d=JSON.stringify(s);V(ke,`RPC '${e}' ${o} sending request:`,s),h.send(t,"POST",d,r,15)})}T_(e,t,r){const s=xa(),i=[this.Uo,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=lf(),c=cf(),l={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(l.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(l.useFetchStreams=!0),this.jo(l.initMessageHeaders,t,r),l.encodeInitMessageHeaders=!0;const d=i.join("");V(ke,`Creating RPC '${e}' stream ${s}: ${d}`,l);const p=o.createWebChannel(d,l);this.I_(p);let m=!1,E=!1;const A=new iw({Yo:b=>{E?V(ke,`Not sending because RPC '${e}' stream ${s} is closed:`,b):(m||(V(ke,`Opening RPC '${e}' stream ${s} transport.`),p.open(),m=!0),V(ke,`RPC '${e}' stream ${s} sending:`,b),p.send(b))},Zo:()=>p.close()}),N=(b,O,x)=>{b.listen(O,F=>{try{x(F)}catch(z){setTimeout(()=>{throw z},0)}})};return N(p,vr.EventType.OPEN,()=>{E||(V(ke,`RPC '${e}' stream ${s} transport opened.`),A.o_())}),N(p,vr.EventType.CLOSE,()=>{E||(E=!0,V(ke,`RPC '${e}' stream ${s} transport closed`),A.a_(),this.E_(p))}),N(p,vr.EventType.ERROR,b=>{E||(E=!0,Wn(ke,`RPC '${e}' stream ${s} transport errored. Name:`,b.name,"Message:",b.message),A.a_(new B(M.UNAVAILABLE,"The operation could not be completed")))}),N(p,vr.EventType.MESSAGE,b=>{var O;if(!E){const x=b.data[0];ee(!!x,16349);const F=x,z=(F==null?void 0:F.error)||((O=F[0])==null?void 0:O.error);if(z){V(ke,`RPC '${e}' stream ${s} received error:`,z);const ne=z.status;let Q=function(T){const v=fe[T];if(v!==void 0)return jf(v)}(ne),w=z.message;Q===void 0&&(Q=M.INTERNAL,w="Unknown error status: "+ne+" with message "+z.message),E=!0,A.a_(new B(Q,w)),p.close()}else V(ke,`RPC '${e}' stream ${s} received:`,x),A.u_(x)}}),N(c,af.STAT_EVENT,b=>{b.stat===Sa.PROXY?V(ke,`RPC '${e}' stream ${s} detected buffering proxy`):b.stat===Sa.NOPROXY&&V(ke,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{A.__()},0),A}terminate(){this.c_.forEach(e=>e.close()),this.c_=[]}I_(e){this.c_.push(e)}E_(e){this.c_=this.c_.filter(t=>t===e)}}function na(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eo(n){return new uT(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rp{constructor(e,t,r=1e3,s=1.5,i=6e4){this.Mi=e,this.timerId=t,this.d_=r,this.A_=s,this.R_=i,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(e){this.cancel();const t=Math.floor(this.V_+this.y_()),r=Math.max(0,Date.now()-this.f_),s=Math.max(0,t-r);s>0&&V("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.V_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,s,()=>(this.f_=Date.now(),e())),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _h="PersistentStream";class sp{constructor(e,t,r,s,i,o,c,l){this.Mi=e,this.S_=r,this.b_=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new rp(e,t)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Mi.enqueueAfterDelay(this.S_,6e4,()=>this.k_()))}q_(e){this.Q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}Q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.Q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():t&&t.code===M.RESOURCE_EXHAUSTED?(gt(t.toString()),gt("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):t&&t.code===M.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.K_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.r_(t)}K_(){}auth(){this.state=1;const e=this.W_(this.D_),t=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.D_===t&&this.G_(r,s)},r=>{e(()=>{const s=new B(M.UNKNOWN,"Fetching auth token failed: "+r.message);return this.z_(s)})})}G_(e,t){const r=this.W_(this.D_);this.stream=this.j_(e,t),this.stream.Xo(()=>{r(()=>this.listener.Xo())}),this.stream.t_(()=>{r(()=>(this.state=2,this.v_=this.Mi.enqueueAfterDelay(this.b_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.t_()))}),this.stream.r_(s=>{r(()=>this.z_(s))}),this.stream.onMessage(s=>{r(()=>++this.F_==1?this.J_(s):this.onNext(s))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return V(_h,`close with error: ${e}`),this.stream=null,this.close(4,e)}W_(e){return t=>{this.Mi.enqueueAndForget(()=>this.D_===e?t():(V(_h,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class aw extends sp{constructor(e,t,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}j_(e,t){return this.connection.T_("Listen",e,t)}J_(e){return this.onNext(e)}onNext(e){this.M_.reset();const t=fT(this.serializer,e),r=function(i){if(!("targetChange"in i))return q.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?q.min():o.readTime?tt(o.readTime):q.min()}(e);return this.listener.H_(t,r)}Y_(e){const t={};t.database=Oa(this.serializer),t.addTarget=function(i,o){let c;const l=o.target;if(c=ka(l)?{documents:gT(i,l)}:{query:_T(i,l).ft},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=zf(i,o.resumeToken);const h=Ma(i,o.expectedCount);h!==null&&(c.expectedCount=h)}else if(o.snapshotVersion.compareTo(q.min())>0){c.readTime=gi(i,o.snapshotVersion.toTimestamp());const h=Ma(i,o.expectedCount);h!==null&&(c.expectedCount=h)}return c}(this.serializer,e);const r=ET(this.serializer,e);r&&(t.labels=r),this.q_(t)}Z_(e){const t={};t.database=Oa(this.serializer),t.removeTarget=e,this.q_(t)}}class cw extends sp{constructor(e,t,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}get X_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}K_(){this.X_&&this.ea([])}j_(e,t){return this.connection.T_("Write",e,t)}J_(e){return ee(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,ee(!e.writeResults||e.writeResults.length===0,55816),this.listener.ta()}onNext(e){ee(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const t=mT(e.writeResults,e.commitTime),r=tt(e.commitTime);return this.listener.na(r,t)}ra(){const e={};e.database=Oa(this.serializer),this.q_(e)}ea(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>pT(this.serializer,r))};this.q_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lw{}class uw extends lw{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.ia=!1}sa(){if(this.ia)throw new B(M.FAILED_PRECONDITION,"The client has already been terminated.")}Go(e,t,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Go(e,La(t,r),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new B(M.UNKNOWN,i.toString())})}Ho(e,t,r,s,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,c])=>this.connection.Ho(e,La(t,r),s,o,c,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new B(M.UNKNOWN,o.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}class hw{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(gt(t),this.aa=!1):V("OnlineStateTracker",t)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dn="RemoteStore";class dw{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.da=[],this.Aa=i,this.Aa.Oo(o=>{r.enqueueAndForget(async()=>{yn(this)&&(V(dn,"Restarting streams for network reachability change."),await async function(l){const h=W(l);h.Ea.add(4),await cs(h),h.Ra.set("Unknown"),h.Ea.delete(4),await to(h)}(this))})}),this.Ra=new hw(r,s)}}async function to(n){if(yn(n))for(const e of n.da)await e(!0)}async function cs(n){for(const e of n.da)await e(!1)}function ip(n,e){const t=W(n);t.Ia.has(e.targetId)||(t.Ia.set(e.targetId,e),Nc(t)?kc(t):rr(t).O_()&&Pc(t,e))}function bc(n,e){const t=W(n),r=rr(t);t.Ia.delete(e),r.O_()&&op(t,e),t.Ia.size===0&&(r.O_()?r.L_():yn(t)&&t.Ra.set("Unknown"))}function Pc(n,e){if(n.Va.Ue(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(q.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}rr(n).Y_(e)}function op(n,e){n.Va.Ue(e),rr(n).Z_(e)}function kc(n){n.Va=new oT({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),At:e=>n.Ia.get(e)||null,ht:()=>n.datastore.serializer.databaseId}),rr(n).start(),n.Ra.ua()}function Nc(n){return yn(n)&&!rr(n).x_()&&n.Ia.size>0}function yn(n){return W(n).Ea.size===0}function ap(n){n.Va=void 0}async function fw(n){n.Ra.set("Online")}async function pw(n){n.Ia.forEach((e,t)=>{Pc(n,e)})}async function mw(n,e){ap(n),Nc(n)?(n.Ra.ha(e),kc(n)):n.Ra.set("Unknown")}async function gw(n,e,t){if(n.Ra.set("Online"),e instanceof Wf&&e.state===2&&e.cause)try{await async function(s,i){const o=i.cause;for(const c of i.targetIds)s.Ia.has(c)&&(await s.remoteSyncer.rejectListen(c,o),s.Ia.delete(c),s.Va.removeTarget(c))}(n,e)}catch(r){V(dn,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await yi(n,r)}else if(e instanceof Qs?n.Va.Ze(e):e instanceof qf?n.Va.st(e):n.Va.tt(e),!t.isEqual(q.min()))try{const r=await np(n.localStore);t.compareTo(r)>=0&&await function(i,o){const c=i.Va.Tt(o);return c.targetChanges.forEach((l,h)=>{if(l.resumeToken.approximateByteSize()>0){const d=i.Ia.get(h);d&&i.Ia.set(h,d.withResumeToken(l.resumeToken,o))}}),c.targetMismatches.forEach((l,h)=>{const d=i.Ia.get(l);if(!d)return;i.Ia.set(l,d.withResumeToken(be.EMPTY_BYTE_STRING,d.snapshotVersion)),op(i,l);const p=new Mt(d.target,l,h,d.sequenceNumber);Pc(i,p)}),i.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){V(dn,"Failed to raise snapshot:",r),await yi(n,r)}}async function yi(n,e,t){if(!nr(e))throw e;n.Ea.add(1),await cs(n),n.Ra.set("Offline"),t||(t=()=>np(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{V(dn,"Retrying IndexedDB access"),await t(),n.Ea.delete(1),await to(n)})}function cp(n,e){return e().catch(t=>yi(n,t,e))}async function no(n){const e=W(n),t=zt(e);let r=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:pc;for(;_w(e);)try{const s=await JT(e.localStore,r);if(s===null){e.Ta.length===0&&t.L_();break}r=s.batchId,yw(e,s)}catch(s){await yi(e,s)}lp(e)&&up(e)}function _w(n){return yn(n)&&n.Ta.length<10}function yw(n,e){n.Ta.push(e);const t=zt(n);t.O_()&&t.X_&&t.ea(e.mutations)}function lp(n){return yn(n)&&!zt(n).x_()&&n.Ta.length>0}function up(n){zt(n).start()}async function Ew(n){zt(n).ra()}async function Tw(n){const e=zt(n);for(const t of n.Ta)e.ea(t.mutations)}async function ww(n,e,t){const r=n.Ta.shift(),s=wc.from(r,e,t);await cp(n,()=>n.remoteSyncer.applySuccessfulWrite(s)),await no(n)}async function Iw(n,e){e&&zt(n).X_&&await async function(r,s){if(function(o){return rT(o)&&o!==M.ABORTED}(s.code)){const i=r.Ta.shift();zt(r).B_(),await cp(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await no(r)}}(n,e),lp(n)&&up(n)}async function yh(n,e){const t=W(n);t.asyncQueue.verifyOperationInProgress(),V(dn,"RemoteStore received new credentials");const r=yn(t);t.Ea.add(3),await cs(t),r&&t.Ra.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ea.delete(3),await to(t)}async function vw(n,e){const t=W(n);e?(t.Ea.delete(2),await to(t)):e||(t.Ea.add(2),await cs(t),t.Ra.set("Unknown"))}function rr(n){return n.ma||(n.ma=function(t,r,s){const i=W(t);return i.sa(),new aw(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Xo:fw.bind(null,n),t_:pw.bind(null,n),r_:mw.bind(null,n),H_:gw.bind(null,n)}),n.da.push(async e=>{e?(n.ma.B_(),Nc(n)?kc(n):n.Ra.set("Unknown")):(await n.ma.stop(),ap(n))})),n.ma}function zt(n){return n.fa||(n.fa=function(t,r,s){const i=W(t);return i.sa(),new cw(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Xo:()=>Promise.resolve(),t_:Ew.bind(null,n),r_:Iw.bind(null,n),ta:Tw.bind(null,n),na:ww.bind(null,n)}),n.da.push(async e=>{e?(n.fa.B_(),await no(n)):(await n.fa.stop(),n.Ta.length>0&&(V(dn,`Stopping write stream with ${n.Ta.length} pending writes`),n.Ta=[]))})),n.fa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mc{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new cn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const o=Date.now()+r,c=new Mc(e,t,o,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new B(M.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Lc(n,e){if(gt("AsyncQueue",`${e}: ${n}`),nr(n))return new B(M.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fn{static emptySet(e){return new Fn(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||U.comparator(t.key,r.key):(t,r)=>U.comparator(t.key,r.key),this.keyedMap=Ar(),this.sortedSet=new ue(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Fn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Fn;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eh{constructor(){this.ga=new ue(U.comparator)}track(e){const t=e.doc.key,r=this.ga.get(t);r?e.type!==0&&r.type===3?this.ga=this.ga.insert(t,e):e.type===3&&r.type!==1?this.ga=this.ga.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.ga=this.ga.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.ga=this.ga.remove(t):e.type===1&&r.type===2?this.ga=this.ga.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):$(63341,{Rt:e,pa:r}):this.ga=this.ga.insert(t,e)}ya(){const e=[];return this.ga.inorderTraversal((t,r)=>{e.push(r)}),e}}class Xn{constructor(e,t,r,s,i,o,c,l,h){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=l,this.hasCachedResults=h}static fromInitialDocuments(e,t,r,s,i){const o=[];return t.forEach(c=>{o.push({type:0,doc:c})}),new Xn(e,t,Fn.emptySet(t),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Qi(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Aw{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some(e=>e.Da())}}class Sw{constructor(){this.queries=Th(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(t,r){const s=W(t),i=s.queries;s.queries=Th(),i.forEach((o,c)=>{for(const l of c.Sa)l.onError(r)})})(this,new B(M.ABORTED,"Firestore shutting down"))}}function Th(){return new gn(n=>kf(n),Qi)}async function Cw(n,e){const t=W(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.ba()&&e.Da()&&(r=2):(i=new Aw,r=e.Da()?0:1);try{switch(r){case 0:i.wa=await t.onListen(s,!0);break;case 1:i.wa=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const c=Lc(o,`Initialization of query '${bn(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.Sa.push(e),e.va(t.onlineState),i.wa&&e.Fa(i.wa)&&Dc(t)}async function Rw(n,e){const t=W(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const o=i.Sa.indexOf(e);o>=0&&(i.Sa.splice(o,1),i.Sa.length===0?s=e.Da()?0:1:!i.ba()&&e.Da()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function bw(n,e){const t=W(n);let r=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const c of o.Sa)c.Fa(s)&&(r=!0);o.wa=s}}r&&Dc(t)}function Pw(n,e,t){const r=W(n),s=r.queries.get(e);if(s)for(const i of s.Sa)i.onError(t);r.queries.delete(e)}function Dc(n){n.Ca.forEach(e=>{e.next()})}var Fa,wh;(wh=Fa||(Fa={})).Ma="default",wh.Cache="cache";class kw{constructor(e,t,r){this.query=e,this.xa=t,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=r||{}}Fa(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Xn(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),t=!0):this.La(e,this.onlineState)&&(this.ka(e),t=!0),this.Na=e,t}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let t=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),t=!0),t}La(e,t){if(!e.fromCache||!this.Da())return!0;const r=t!=="Offline";return(!this.options.qa||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;const t=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}ka(e){e=Xn.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==Fa.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hp{constructor(e){this.key=e}}class dp{constructor(e){this.key=e}}class Nw{constructor(e,t){this.query=e,this.Ya=t,this.Za=null,this.hasCachedResults=!1,this.current=!1,this.Xa=Y(),this.mutatedKeys=Y(),this.eu=Nf(e),this.tu=new Fn(this.eu)}get nu(){return this.Ya}ru(e,t){const r=t?t.iu:new Eh,s=t?t.tu:this.tu;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,c=!1;const l=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((d,p)=>{const m=s.get(d),E=Xi(this.query,p)?p:null,A=!!m&&this.mutatedKeys.has(m.key),N=!!E&&(E.hasLocalMutations||this.mutatedKeys.has(E.key)&&E.hasCommittedMutations);let b=!1;m&&E?m.data.isEqual(E.data)?A!==N&&(r.track({type:3,doc:E}),b=!0):this.su(m,E)||(r.track({type:2,doc:E}),b=!0,(l&&this.eu(E,l)>0||h&&this.eu(E,h)<0)&&(c=!0)):!m&&E?(r.track({type:0,doc:E}),b=!0):m&&!E&&(r.track({type:1,doc:m}),b=!0,(l||h)&&(c=!0)),b&&(E?(o=o.add(E),i=N?i.add(d):i.delete(d)):(o=o.delete(d),i=i.delete(d)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const d=this.query.limitType==="F"?o.last():o.first();o=o.delete(d.key),i=i.delete(d.key),r.track({type:1,doc:d})}return{tu:o,iu:r,Cs:c,mutatedKeys:i}}su(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;const o=e.iu.ya();o.sort((d,p)=>function(E,A){const N=b=>{switch(b){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return $(20277,{Rt:b})}};return N(E)-N(A)}(d.type,p.type)||this.eu(d.doc,p.doc)),this.ou(r),s=s??!1;const c=t&&!s?this._u():[],l=this.Xa.size===0&&this.current&&!s?1:0,h=l!==this.Za;return this.Za=l,o.length!==0||h?{snapshot:new Xn(this.query,e.tu,i,o,e.mutatedKeys,l===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),au:c}:{au:c}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Eh,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{au:[]}}uu(e){return!this.Ya.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(t=>this.Ya=this.Ya.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ya=this.Ya.delete(t)),this.current=e.current)}_u(){if(!this.current)return[];const e=this.Xa;this.Xa=Y(),this.tu.forEach(r=>{this.uu(r.key)&&(this.Xa=this.Xa.add(r.key))});const t=[];return e.forEach(r=>{this.Xa.has(r)||t.push(new dp(r))}),this.Xa.forEach(r=>{e.has(r)||t.push(new hp(r))}),t}cu(e){this.Ya=e.Qs,this.Xa=Y();const t=this.ru(e.documents);return this.applyChanges(t,!0)}lu(){return Xn.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Za===0,this.hasCachedResults)}}const Oc="SyncEngine";class Mw{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class Lw{constructor(e){this.key=e,this.hu=!1}}class Dw{constructor(e,t,r,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Pu={},this.Tu=new gn(c=>kf(c),Qi),this.Iu=new Map,this.Eu=new Set,this.du=new ue(U.comparator),this.Au=new Map,this.Ru=new Ac,this.Vu={},this.mu=new Map,this.fu=Qn.cr(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function Ow(n,e,t=!0){const r=yp(n);let s;const i=r.Tu.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lu()):s=await fp(r,e,t,!0),s}async function Vw(n,e){const t=yp(n);await fp(t,e,!0,!1)}async function fp(n,e,t,r){const s=await ZT(n.localStore,et(e)),i=s.targetId,o=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await xw(n,e,i,o==="current",s.resumeToken)),n.isPrimaryClient&&t&&ip(n.remoteStore,s),c}async function xw(n,e,t,r,s){n.pu=(p,m,E)=>async function(N,b,O,x){let F=b.view.ru(O);F.Cs&&(F=await fh(N.localStore,b.query,!1).then(({documents:w})=>b.view.ru(w,F)));const z=x&&x.targetChanges.get(b.targetId),ne=x&&x.targetMismatches.get(b.targetId)!=null,Q=b.view.applyChanges(F,N.isPrimaryClient,z,ne);return vh(N,b.targetId,Q.au),Q.snapshot}(n,p,m,E);const i=await fh(n.localStore,e,!0),o=new Nw(e,i.Qs),c=o.ru(i.documents),l=as.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),h=o.applyChanges(c,n.isPrimaryClient,l);vh(n,t,h.au);const d=new Mw(e,t,o);return n.Tu.set(e,d),n.Iu.has(t)?n.Iu.get(t).push(e):n.Iu.set(t,[e]),h.snapshot}async function Fw(n,e,t){const r=W(n),s=r.Tu.get(e),i=r.Iu.get(s.targetId);if(i.length>1)return r.Iu.set(s.targetId,i.filter(o=>!Qi(o,e))),void r.Tu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Va(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&bc(r.remoteStore,s.targetId),Ba(r,s.targetId)}).catch(tr)):(Ba(r,s.targetId),await Va(r.localStore,s.targetId,!0))}async function Bw(n,e){const t=W(n),r=t.Tu.get(e),s=t.Iu.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),bc(t.remoteStore,r.targetId))}async function Uw(n,e,t){const r=Kw(n);try{const s=await function(o,c){const l=W(o),h=te.now(),d=c.reduce((E,A)=>E.add(A.key),Y());let p,m;return l.persistence.runTransaction("Locally write mutations","readwrite",E=>{let A=_t(),N=Y();return l.Ns.getEntries(E,d).next(b=>{A=b,A.forEach((O,x)=>{x.isValidDocument()||(N=N.add(O))})}).next(()=>l.localDocuments.getOverlayedDocuments(E,A)).next(b=>{p=b;const O=[];for(const x of c){const F=JE(x,p.get(x.key).overlayedDocument);F!=null&&O.push(new _n(x.key,F,vf(F.value.mapValue),ft.exists(!0)))}return l.mutationQueue.addMutationBatch(E,h,O,c)}).next(b=>{m=b;const O=b.applyToLocalDocumentSet(p,N);return l.documentOverlayCache.saveOverlays(E,b.batchId,O)})}).then(()=>({batchId:m.batchId,changes:Lf(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(o,c,l){let h=o.Vu[o.currentUser.toKey()];h||(h=new ue(X)),h=h.insert(c,l),o.Vu[o.currentUser.toKey()]=h}(r,s.batchId,t),await ls(r,s.changes),await no(r.remoteStore)}catch(s){const i=Lc(s,"Failed to persist write");t.reject(i)}}async function pp(n,e){const t=W(n);try{const r=await XT(t.localStore,e);e.targetChanges.forEach((s,i)=>{const o=t.Au.get(i);o&&(ee(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.hu=!0:s.modifiedDocuments.size>0?ee(o.hu,14607):s.removedDocuments.size>0&&(ee(o.hu,42227),o.hu=!1))}),await ls(t,r,e)}catch(r){await tr(r)}}function Ih(n,e,t){const r=W(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Tu.forEach((i,o)=>{const c=o.view.va(e);c.snapshot&&s.push(c.snapshot)}),function(o,c){const l=W(o);l.onlineState=c;let h=!1;l.queries.forEach((d,p)=>{for(const m of p.Sa)m.va(c)&&(h=!0)}),h&&Dc(l)}(r.eventManager,e),s.length&&r.Pu.H_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function $w(n,e,t){const r=W(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Au.get(e),i=s&&s.key;if(i){let o=new ue(U.comparator);o=o.insert(i,Me.newNoDocument(i,q.min()));const c=Y().add(i),l=new Zi(q.min(),new Map,new ue(X),o,c);await pp(r,l),r.du=r.du.remove(i),r.Au.delete(e),Vc(r)}else await Va(r.localStore,e,!1).then(()=>Ba(r,e,t)).catch(tr)}async function Hw(n,e){const t=W(n),r=e.batch.batchId;try{const s=await QT(t.localStore,e);gp(t,r,null),mp(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await ls(t,s)}catch(s){await tr(s)}}async function jw(n,e,t){const r=W(n);try{const s=await function(o,c){const l=W(o);return l.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let d;return l.mutationQueue.lookupMutationBatch(h,c).next(p=>(ee(p!==null,37113),d=p.keys(),l.mutationQueue.removeMutationBatch(h,p))).next(()=>l.mutationQueue.performConsistencyCheck(h)).next(()=>l.documentOverlayCache.removeOverlaysForBatchId(h,d,c)).next(()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,d)).next(()=>l.localDocuments.getDocuments(h,d))})}(r.localStore,e);gp(r,e,t),mp(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await ls(r,s)}catch(s){await tr(s)}}function mp(n,e){(n.mu.get(e)||[]).forEach(t=>{t.resolve()}),n.mu.delete(e)}function gp(n,e,t){const r=W(n);let s=r.Vu[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.Vu[r.currentUser.toKey()]=s}}function Ba(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Iu.get(e))n.Tu.delete(r),t&&n.Pu.yu(r,t);n.Iu.delete(e),n.isPrimaryClient&&n.Ru.jr(e).forEach(r=>{n.Ru.containsKey(r)||_p(n,r)})}function _p(n,e){n.Eu.delete(e.path.canonicalString());const t=n.du.get(e);t!==null&&(bc(n.remoteStore,t),n.du=n.du.remove(e),n.Au.delete(t),Vc(n))}function vh(n,e,t){for(const r of t)r instanceof hp?(n.Ru.addReference(r.key,e),qw(n,r)):r instanceof dp?(V(Oc,"Document no longer in limbo: "+r.key),n.Ru.removeReference(r.key,e),n.Ru.containsKey(r.key)||_p(n,r.key)):$(19791,{wu:r})}function qw(n,e){const t=e.key,r=t.path.canonicalString();n.du.get(t)||n.Eu.has(r)||(V(Oc,"New document in limbo: "+t),n.Eu.add(r),Vc(n))}function Vc(n){for(;n.Eu.size>0&&n.du.size<n.maxConcurrentLimboResolutions;){const e=n.Eu.values().next().value;n.Eu.delete(e);const t=new U(le.fromString(e)),r=n.fu.next();n.Au.set(r,new Lw(t)),n.du=n.du.insert(t,r),ip(n.remoteStore,new Mt(et(Ec(t.path)),r,"TargetPurposeLimboResolution",Wi.ce))}}async function ls(n,e,t){const r=W(n),s=[],i=[],o=[];r.Tu.isEmpty()||(r.Tu.forEach((c,l)=>{o.push(r.pu(l,e,t).then(h=>{var d;if((h||t)&&r.isPrimaryClient){const p=h?!h.fromCache:(d=t==null?void 0:t.targetChanges.get(l.targetId))==null?void 0:d.current;r.sharedClientState.updateQueryState(l.targetId,p?"current":"not-current")}if(h){s.push(h);const p=Cc.As(l.targetId,h);i.push(p)}}))}),await Promise.all(o),r.Pu.H_(s),await async function(l,h){const d=W(l);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>k.forEach(h,m=>k.forEach(m.Es,E=>d.persistence.referenceDelegate.addReference(p,m.targetId,E)).next(()=>k.forEach(m.ds,E=>d.persistence.referenceDelegate.removeReference(p,m.targetId,E)))))}catch(p){if(!nr(p))throw p;V(Rc,"Failed to update sequence numbers: "+p)}for(const p of h){const m=p.targetId;if(!p.fromCache){const E=d.Ms.get(m),A=E.snapshotVersion,N=E.withLastLimboFreeSnapshotVersion(A);d.Ms=d.Ms.insert(m,N)}}}(r.localStore,i))}async function Ww(n,e){const t=W(n);if(!t.currentUser.isEqual(e)){V(Oc,"User change. New user:",e.toKey());const r=await tp(t.localStore,e);t.currentUser=e,function(i,o){i.mu.forEach(c=>{c.forEach(l=>{l.reject(new B(M.CANCELLED,o))})}),i.mu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await ls(t,r.Ls)}}function zw(n,e){const t=W(n),r=t.Au.get(e);if(r&&r.hu)return Y().add(r.key);{let s=Y();const i=t.Iu.get(e);if(!i)return s;for(const o of i){const c=t.Tu.get(o);s=s.unionWith(c.view.nu)}return s}}function yp(n){const e=W(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=pp.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=zw.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=$w.bind(null,e),e.Pu.H_=bw.bind(null,e.eventManager),e.Pu.yu=Pw.bind(null,e.eventManager),e}function Kw(n){const e=W(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=Hw.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=jw.bind(null,e),e}class Ei{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=eo(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,t){return null}Mu(e,t){return null}vu(e){return GT(this.persistence,new WT,e.initialUser,this.serializer)}Cu(e){return new ep(Sc.mi,this.serializer)}Du(e){return new tw}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ei.provider={build:()=>new Ei};class Gw extends Ei{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,t){ee(this.persistence.referenceDelegate instanceof _i,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new kT(r,e.asyncQueue,t)}Cu(e){const t=this.cacheSizeBytes!==void 0?xe.withCacheSize(this.cacheSizeBytes):xe.DEFAULT;return new ep(r=>_i.mi(r,t),this.serializer)}}class Ua{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Ih(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=Ww.bind(null,this.syncEngine),await vw(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new Sw}()}createDatastore(e){const t=eo(e.databaseInfo.databaseId),r=function(i){return new ow(i)}(e.databaseInfo);return function(i,o,c,l){return new uw(i,o,c,l)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,i,o,c){return new dw(r,s,i,o,c)}(this.localStore,this.datastore,e.asyncQueue,t=>Ih(this.syncEngine,t,0),function(){return gh.v()?new gh:new nw}())}createSyncEngine(e,t){return function(s,i,o,c,l,h,d){const p=new Dw(s,i,o,c,l,h);return d&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=W(s);V(dn,"RemoteStore shutting down."),i.Ea.add(5),await cs(i),i.Aa.shutdown(),i.Ra.set("Unknown")}(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Ua.provider={build:()=>new Ua};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qw{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):gt("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kt="FirestoreClient";class Xw{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=Ne.UNAUTHENTICATED,this.clientId=dc.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async o=>{V(Kt,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(V(Kt,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new cn;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Lc(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function ra(n,e){n.asyncQueue.verifyOperationInProgress(),V(Kt,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await tp(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Ah(n,e){n.asyncQueue.verifyOperationInProgress();const t=await Yw(n);V(Kt,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>yh(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>yh(e.remoteStore,s)),n._onlineComponents=e}async function Yw(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){V(Kt,"Using user provided OfflineComponentProvider");try{await ra(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===M.FAILED_PRECONDITION||s.code===M.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;Wn("Error using user provided cache. Falling back to memory cache: "+t),await ra(n,new Ei)}}else V(Kt,"Using default OfflineComponentProvider"),await ra(n,new Gw(void 0));return n._offlineComponents}async function Ep(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(V(Kt,"Using user provided OnlineComponentProvider"),await Ah(n,n._uninitializedComponentsProvider._online)):(V(Kt,"Using default OnlineComponentProvider"),await Ah(n,new Ua))),n._onlineComponents}function Jw(n){return Ep(n).then(e=>e.syncEngine)}async function Sh(n){const e=await Ep(n),t=e.eventManager;return t.onListen=Ow.bind(null,e.syncEngine),t.onUnlisten=Fw.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=Vw.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=Bw.bind(null,e.syncEngine),t}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tp(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ch=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wp="firestore.googleapis.com",Rh=!0;class bh{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new B(M.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=wp,this.ssl=Rh}else this.host=e.host,this.ssl=e.ssl??Rh;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=Zf;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<bT)throw new B(M.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}hE("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Tp(e.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new B(M.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new B(M.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new B(M.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class ro{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new bh({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new B(M.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new B(M.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new bh(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new tE;switch(r.type){case"firstParty":return new iE(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new B(M.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=Ch.get(t);r&&(V("ComponentProvider","Removing Datastore"),Ch.delete(t),r.terminate())}(this),Promise.resolve()}}function Zw(n,e,t,r={}){var h;n=xn(n,ro);const s=uc(e),i=n._getSettings(),o={...i,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;s&&(xy(`https://${c}`),$y("Firestore",!0)),i.host!==wp&&i.host!==c&&Wn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const l={...i,host:c,ssl:s,emulatorOptions:r};if(!nf(l,o)&&(n._setSettings(l),r.mockUserToken)){let d,p;if(typeof r.mockUserToken=="string")d=r.mockUserToken,p=Ne.MOCK_USER;else{d=Fy(r.mockUserToken,(h=n._app)==null?void 0:h.options.projectId);const m=r.mockUserToken.sub||r.mockUserToken.user_id;if(!m)throw new B(M.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new Ne(m)}n._authCredentials=new nE(new hf(d,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class so{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new so(this.firestore,e,this._query)}}class _e{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Bt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new _e(this.firestore,e,this._key)}toJSON(){return{type:_e._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(is(t,_e._jsonSchema))return new _e(e,r||null,new U(le.fromString(t.referencePath)))}}_e._jsonSchemaVersion="firestore/documentReference/1.0",_e._jsonSchema={type:pe("string",_e._jsonSchemaVersion),referencePath:pe("string")};class Bt extends so{constructor(e,t,r){super(e,t,Ec(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new _e(this.firestore,null,new U(e))}withConverter(e){return new Bt(this.firestore,e,this._path)}}function eI(n,e,...t){if(n=qn(n),df("collection","path",e),n instanceof ro){const r=le.fromString(e,...t);return $u(r),new Bt(n,null,r)}{if(!(n instanceof _e||n instanceof Bt))throw new B(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(le.fromString(e,...t));return $u(r),new Bt(n.firestore,null,r)}}function sr(n,e,...t){if(n=qn(n),arguments.length===1&&(e=dc.newId()),df("doc","path",e),n instanceof ro){const r=le.fromString(e,...t);return Uu(r),new _e(n,null,new U(r))}{if(!(n instanceof _e||n instanceof Bt))throw new B(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(le.fromString(e,...t));return Uu(r),new _e(n.firestore,n instanceof Bt?n.converter:null,new U(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ph="AsyncQueue";class kh{constructor(e=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new rp(this,"async_queue_retry"),this._c=()=>{const r=na();r&&V(Ph,"Visibility state changed to "+r.visibilityState),this.M_.w_()},this.ac=e;const t=na();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const t=na();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});const t=new cn;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Xu.push(e),this.lc()))}async lc(){if(this.Xu.length!==0){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(e){if(!nr(e))throw e;V(Ph,"Operation failed with retryable error: "+e)}this.Xu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){const t=this.ac.then(()=>(this.rc=!0,e().catch(r=>{throw this.nc=r,this.rc=!1,gt("INTERNAL UNHANDLED ERROR: ",Nh(r)),r}).then(r=>(this.rc=!1,r))));return this.ac=t,t}enqueueAfterDelay(e,t,r){this.uc(),this.oc.indexOf(e)>-1&&(t=0);const s=Mc.createAndSchedule(this,e,t,r,i=>this.hc(i));return this.tc.push(s),s}uc(){this.nc&&$(47125,{Pc:Nh(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(const t of this.tc)if(t.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.tc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Tc()})}dc(e){this.oc.push(e)}hc(e){const t=this.tc.indexOf(e);this.tc.splice(t,1)}}function Nh(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mh(n){return function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1}(n,["next","error","complete"])}class Ti extends ro{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new kh,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new kh(e),this._firestoreClient=void 0,await e}}}function tI(n,e){const t=typeof n=="object"?n:lc(),r=typeof n=="string"?n:ui,s=ss(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=Vy("firestore");i&&Zw(s,...i)}return s}function Ip(n){if(n._terminated)throw new B(M.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||nI(n),n._firestoreClient}function nI(n){var r,s,i;const e=n._freezeSettings(),t=function(c,l,h,d){return new IE(c,l,h,d.host,d.ssl,d.experimentalForceLongPolling,d.experimentalAutoDetectLongPolling,Tp(d.experimentalLongPollingOptions),d.useFetchStreams,d.isUsingEmulator)}(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,e);n._componentsProvider||(s=e.localCache)!=null&&s._offlineComponentProvider&&((i=e.localCache)!=null&&i._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new Xw(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&function(c){const l=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(l),_online:l}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class He{constructor(e){this._byteString=e}static fromBase64String(e){try{return new He(be.fromBase64String(e))}catch(t){throw new B(M.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new He(be.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:He._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(is(e,He._jsonSchema))return He.fromBase64String(e.bytes)}}He._jsonSchemaVersion="firestore/bytes/1.0",He._jsonSchema={type:pe("string",He._jsonSchemaVersion),bytes:pe("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xc{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new B(M.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ce(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vp{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new B(M.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new B(M.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return X(this._lat,e._lat)||X(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:nt._jsonSchemaVersion}}static fromJSON(e){if(is(e,nt._jsonSchema))return new nt(e.latitude,e.longitude)}}nt._jsonSchemaVersion="firestore/geoPoint/1.0",nt._jsonSchema={type:pe("string",nt._jsonSchemaVersion),latitude:pe("number"),longitude:pe("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}toJSON(){return{type:rt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(is(e,rt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new rt(e.vectorValues);throw new B(M.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}rt._jsonSchemaVersion="firestore/vectorValue/1.0",rt._jsonSchema={type:pe("string",rt._jsonSchemaVersion),vectorValues:pe("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rI=/^__.*__$/;class sI{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new _n(e,this.data,this.fieldMask,t,this.fieldTransforms):new os(e,this.data,t,this.fieldTransforms)}}function Ap(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw $(40011,{Ac:n})}}class Fc{constructor(e,t,r,s,i,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.Rc(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ac(){return this.settings.Ac}Vc(e){return new Fc({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}mc(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.Vc({path:t,fc:!1});return r.gc(e),r}yc(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.Vc({path:t,fc:!1});return r.Rc(),r}wc(e){return this.Vc({path:void 0,fc:!0})}Sc(e){return wi(e,this.settings.methodName,this.settings.bc||!1,this.path,this.settings.Dc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Rc(){if(this.path)for(let e=0;e<this.path.length;e++)this.gc(this.path.get(e))}gc(e){if(e.length===0)throw this.Sc("Document fields must not be empty");if(Ap(this.Ac)&&rI.test(e))throw this.Sc('Document fields cannot begin and end with "__"')}}class iI{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||eo(e)}Cc(e,t,r,s=!1){return new Fc({Ac:e,methodName:t,Dc:r,path:Ce.emptyPath(),fc:!1,bc:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function oI(n){const e=n._freezeSettings(),t=eo(n._databaseId);return new iI(n._databaseId,!!e.ignoreUndefinedProperties,t)}function aI(n,e,t,r,s,i={}){const o=n.Cc(i.merge||i.mergeFields?2:0,e,t,s);bp("Data must be an object, but it was:",o,r);const c=Cp(r,o);let l,h;if(i.merge)l=new ze(o.fieldMask),h=o.fieldTransforms;else if(i.mergeFields){const d=[];for(const p of i.mergeFields){const m=cI(e,p,t);if(!o.contains(m))throw new B(M.INVALID_ARGUMENT,`Field '${m}' is specified in your field mask but missing from your input data.`);uI(d,m)||d.push(m)}l=new ze(d),h=o.fieldTransforms.filter(p=>l.covers(p.field))}else l=null,h=o.fieldTransforms;return new sI(new $e(c),l,h)}function Sp(n,e){if(Rp(n=qn(n)))return bp("Unsupported field value:",e,n),Cp(n,e);if(n instanceof vp)return function(r,s){if(!Ap(s.Ac))throw s.Sc(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Sc(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.fc&&e.Ac!==4)throw e.Sc("Nested arrays are not supported");return function(r,s){const i=[];let o=0;for(const c of r){let l=Sp(c,s.wc(o));l==null&&(l={nullValue:"NULL_VALUE"}),i.push(l),o++}return{arrayValue:{values:i}}}(n,e)}return function(r,s){if((r=qn(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return zE(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=te.fromDate(r);return{timestampValue:gi(s.serializer,i)}}if(r instanceof te){const i=new te(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:gi(s.serializer,i)}}if(r instanceof nt)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof He)return{bytesValue:zf(s.serializer,r._byteString)};if(r instanceof _e){const i=s.databaseId,o=r.firestore._databaseId;if(!o.isEqual(i))throw s.Sc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:vc(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof rt)return function(o,c){return{mapValue:{fields:{[wf]:{stringValue:If},[hi]:{arrayValue:{values:o.toArray().map(h=>{if(typeof h!="number")throw c.Sc("VectorValues must only contain numeric values.");return Tc(c.serializer,h)})}}}}}}(r,s);throw s.Sc(`Unsupported field value: ${fc(r)}`)}(n,e)}function Cp(n,e){const t={};return mf(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):mn(n,(r,s)=>{const i=Sp(s,e.mc(r));i!=null&&(t[r]=i)}),{mapValue:{fields:t}}}function Rp(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof te||n instanceof nt||n instanceof He||n instanceof _e||n instanceof vp||n instanceof rt)}function bp(n,e,t){if(!Rp(t)||!ff(t)){const r=fc(t);throw r==="an object"?e.Sc(n+" a custom object"):e.Sc(n+" "+r)}}function cI(n,e,t){if((e=qn(e))instanceof xc)return e._internalPath;if(typeof e=="string")return Pp(n,e);throw wi("Field path arguments must be of type string or ",n,!1,void 0,t)}const lI=new RegExp("[~\\*/\\[\\]]");function Pp(n,e,t){if(e.search(lI)>=0)throw wi(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new xc(...e.split("."))._internalPath}catch{throw wi(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function wi(n,e,t,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let l="";return(i||o)&&(l+=" (found",i&&(l+=` in field ${r}`),o&&(l+=` in document ${s}`),l+=")"),new B(M.INVALID_ARGUMENT,c+n+l)}function uI(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kp{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new _e(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new hI(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Np("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class hI extends kp{data(){return super.data()}}function Np(n,e){return typeof e=="string"?Pp(n,e):e instanceof xc?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dI(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new B(M.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class fI{convertValue(e,t="none"){switch(Wt(e)){case 0:return null;case 1:return e.booleanValue;case 2:return de(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(qt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw $(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return mn(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){var r,s,i;const t=(i=(s=(r=e.fields)==null?void 0:r[hi].arrayValue)==null?void 0:s.values)==null?void 0:i.map(o=>de(o.doubleValue));return new rt(t)}convertGeoPoint(e){return new nt(de(e.latitude),de(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Ki(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Gr(e));default:return null}}convertTimestamp(e){const t=jt(e);return new te(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=le.fromString(e);ee(Jf(r),9688,{name:e});const s=new Qr(r.get(1),r.get(3)),i=new U(r.popFirst(5));return s.isEqual(t)||gt(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pI(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class Cr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class ln extends kp{constructor(e,t,r,s,i,o){super(e,t,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Xs(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Np("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new B(M.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=ln._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}ln._jsonSchemaVersion="firestore/documentSnapshot/1.0",ln._jsonSchema={type:pe("string",ln._jsonSchemaVersion),bundleSource:pe("string","DocumentSnapshot"),bundleName:pe("string"),bundle:pe("string")};class Xs extends ln{data(e={}){return super.data(e)}}class Bn{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Cr(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new Xs(this._firestore,this._userDataWriter,r.key,r,new Cr(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new B(M.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(c=>{const l=new Xs(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Cr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:l,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(c=>i||c.type!==3).map(c=>{const l=new Xs(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Cr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,d=-1;return c.type!==0&&(h=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),d=o.indexOf(c.doc.key)),{type:mI(c.type),doc:l,oldIndex:h,newIndex:d}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new B(M.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Bn._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=dc.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach(i=>{i._document!==null&&(t.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function mI(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return $(61501,{type:n})}}Bn._jsonSchemaVersion="firestore/querySnapshot/1.0",Bn._jsonSchema={type:pe("string",Bn._jsonSchemaVersion),bundleSource:pe("string","QuerySnapshot"),bundleName:pe("string"),bundle:pe("string")};class Mp extends fI{constructor(e){super(),this.firestore=e}convertBytes(e){return new He(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new _e(this.firestore,null,t)}}function Ii(n,e,t){n=xn(n,_e);const r=xn(n.firestore,Ti),s=pI(n.converter,e,t);return gI(r,[aI(oI(r),"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,ft.none())])}function io(n,...e){var l,h,d;n=qn(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||Mh(e[r])||(t=e[r++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(Mh(e[r])){const p=e[r];e[r]=(l=p.next)==null?void 0:l.bind(p),e[r+1]=(h=p.error)==null?void 0:h.bind(p),e[r+2]=(d=p.complete)==null?void 0:d.bind(p)}let i,o,c;if(n instanceof _e)o=xn(n.firestore,Ti),c=Ec(n._key.path),i={next:p=>{e[r]&&e[r](_I(o,n,p))},error:e[r+1],complete:e[r+2]};else{const p=xn(n,so);o=xn(p.firestore,Ti),c=p._query;const m=new Mp(o);i={next:E=>{e[r]&&e[r](new Bn(o,m,p,E))},error:e[r+1],complete:e[r+2]},dI(n._query)}return function(m,E,A,N){const b=new Qw(N),O=new kw(E,b,A);return m.asyncQueue.enqueueAndForget(async()=>Cw(await Sh(m),O)),()=>{b.Nu(),m.asyncQueue.enqueueAndForget(async()=>Rw(await Sh(m),O))}}(Ip(o),c,s,i)}function gI(n,e){return function(r,s){const i=new cn;return r.asyncQueue.enqueueAndForget(async()=>Uw(await Jw(r),s,i)),i.promise}(Ip(n),e)}function _I(n,e,t){const r=t.docs.get(e._key),s=new Mp(n);return new ln(n,s,e._key,r,new Cr(t.hasPendingWrites,t.fromCache),e.converter)}(function(e,t=!0){(function(s){er=s})(Zn),$t(new Qy("firestore",(r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),c=new Ti(new rE(r.getProvider("auth-internal")),new oE(o,r.getProvider("app-check-internal")),function(h,d){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new B(M.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Qr(h.options.projectId,d)}(o,s),o);return i={useFetchStreams:t,...i},c._setSettings(i),c},"PUBLIC").setMultipleInstances(!0)),dt(Vu,xu,e),dt(Vu,xu,"esm2020")})();const yI=()=>{};var Lh={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const EI=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},TI=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},wI={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,l=s+2<n.length,h=l?n[s+2]:0,d=i>>2,p=(i&3)<<4|c>>4;let m=(c&15)<<2|h>>6,E=h&63;l||(E=64,o||(m=64)),r.push(t[d],t[p],t[m],t[E])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(EI(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):TI(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const p=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||p==null)throw new II;const m=i<<2|c>>4;if(r.push(m),h!==64){const E=c<<4&240|h>>2;if(r.push(E),p!==64){const A=h<<6&192|p;r.push(A)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};let II=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const Lp=function(n){try{return wI.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vI(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const AI=()=>vI().__FIREBASE_DEFAULTS__,SI=()=>{if(typeof process>"u"||typeof Lh>"u")return;const n=Lh.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},CI=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Lp(n[1]);return e&&JSON.parse(e)},Dp=()=>{try{return yI()||AI()||SI()||CI()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},RI=n=>{var e,t;return(t=(e=Dp())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},Op=n=>{var e;return(e=Dp())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oo(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function bI(n){return(await fetch(n,{credentials:"include"})).ok}const xr={};function PI(){const n={prod:[],emulator:[]};for(const e of Object.keys(xr))xr[e]?n.emulator.push(e):n.prod.push(e);return n}function kI(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let Dh=!1;function NI(n,e){if(typeof window>"u"||typeof document>"u"||!oo(window.location.host)||xr[n]===e||xr[n]||Dh)return;xr[n]=e;function t(m){return`__firebase__banner__${m}`}const r="__firebase__banner",i=PI().prod.length>0;function o(){const m=document.getElementById(r);m&&m.remove()}function c(m){m.style.display="flex",m.style.background="#7faaf0",m.style.position="fixed",m.style.bottom="5px",m.style.left="5px",m.style.padding=".5em",m.style.borderRadius="5px",m.style.alignItems="center"}function l(m,E){m.setAttribute("width","24"),m.setAttribute("id",E),m.setAttribute("height","24"),m.setAttribute("viewBox","0 0 24 24"),m.setAttribute("fill","none"),m.style.marginLeft="-6px"}function h(){const m=document.createElement("span");return m.style.cursor="pointer",m.style.marginLeft="16px",m.style.fontSize="24px",m.innerHTML=" &times;",m.onclick=()=>{Dh=!0,o()},m}function d(m,E){m.setAttribute("id",E),m.innerText="Learn more",m.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",m.setAttribute("target","__blank"),m.style.paddingLeft="5px",m.style.textDecoration="underline"}function p(){const m=kI(r),E=t("text"),A=document.getElementById(E)||document.createElement("span"),N=t("learnmore"),b=document.getElementById(N)||document.createElement("a"),O=t("preprendIcon"),x=document.getElementById(O)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(m.created){const F=m.element;c(F),d(b,N);const z=h();l(x,O),F.append(x,A,b,z),document.body.appendChild(F)}i?(A.innerText="Preview backend disconnected.",x.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(x.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,A.innerText="Preview backend running in this workspace."),A.setAttribute("id",E)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ve(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function MI(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ve())}function LI(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function DI(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function OI(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function VI(){const n=Ve();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xI="FirebaseError";let ao=class Vp extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=xI,Object.setPrototypeOf(this,Vp.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,co.prototype.create)}},co=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?FI(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new ao(s,c,r)}};function FI(n,e){return n.replace(BI,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const BI=/\{\$([^}]+)}/g;function UI(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function vi(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(Oh(i)&&Oh(o)){if(!vi(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Oh(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function us(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function $I(n,e){const t=new HI(n,e);return t.subscribe.bind(t)}class HI{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");jI(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=sa),s.error===void 0&&(s.error=sa),s.complete===void 0&&(s.complete=sa);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function jI(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function sa(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function En(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var se;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(se||(se={}));const qI={debug:se.DEBUG,verbose:se.VERBOSE,info:se.INFO,warn:se.WARN,error:se.ERROR,silent:se.SILENT},WI=se.INFO,zI={[se.DEBUG]:"log",[se.VERBOSE]:"log",[se.INFO]:"info",[se.WARN]:"warn",[se.ERROR]:"error"},KI=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=zI[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let GI=class{constructor(e){this.name=e,this._logLevel=WI,this._logHandler=KI,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in se))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?qI[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,se.DEBUG,...e),this._logHandler(this,se.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,se.VERBOSE,...e),this._logHandler(this,se.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,se.INFO,...e),this._logHandler(this,se.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,se.WARN,...e),this._logHandler(this,se.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,se.ERROR,...e),this._logHandler(this,se.ERROR,...e)}},Vh=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};function xp(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const QI=xp,Fp=new co("auth","Firebase",xp());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ai=new GI("@firebase/auth");function XI(n,...e){Ai.logLevel<=se.WARN&&Ai.warn(`Auth (${Zn}): ${n}`,...e)}function Ys(n,...e){Ai.logLevel<=se.ERROR&&Ai.error(`Auth (${Zn}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yt(n,...e){throw Bc(n,...e)}function st(n,...e){return Bc(n,...e)}function Bp(n,e,t){const r={...QI(),[e]:t};return new co("auth","Firebase",r).create(e,{appName:n.name})}function Ut(n){return Bp(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Bc(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Fp.create(n,...e)}function j(n,e,...t){if(!n)throw Bc(e,...t)}function ut(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Ys(e),new Error(e)}function Et(n,e){n||ut(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $a(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function YI(){return xh()==="http:"||xh()==="https:"}function xh(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function JI(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(YI()||DI()||"connection"in navigator)?navigator.onLine:!0}function ZI(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hs{constructor(e,t){this.shortDelay=e,this.longDelay=t,Et(t>e,"Short delay should be less than long delay!"),this.isMobile=MI()||OI()}get(){return JI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uc(n,e){Et(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Up{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;ut("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;ut("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;ut("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ev={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tv=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],nv=new hs(3e4,6e4);function lo(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function ir(n,e,t,r,s={}){return $p(n,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const c=us({key:n.config.apiKey,...o}).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const h={method:e,headers:l,...i};return LI()||(h.referrerPolicy="no-referrer"),n.emulatorConfig&&oo(n.emulatorConfig.host)&&(h.credentials="include"),Up.fetch()(await jp(n,n.config.apiHost,t,c),h)})}async function $p(n,e,t){n._canInitEmulator=!1;const r={...ev,...e};try{const s=new rv(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Vs(n,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const c=i.ok?o.errorMessage:o.error.message,[l,h]=c.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw Vs(n,"credential-already-in-use",o);if(l==="EMAIL_EXISTS")throw Vs(n,"email-already-in-use",o);if(l==="USER_DISABLED")throw Vs(n,"user-disabled",o);const d=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw Bp(n,d,h);yt(n,d)}}catch(s){if(s instanceof ao)throw s;yt(n,"network-request-failed",{message:String(s)})}}async function Hp(n,e,t,r,s={}){const i=await ir(n,e,t,r,s);return"mfaPendingCredential"in i&&yt(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function jp(n,e,t,r){const s=`${e}${t}?${r}`,i=n,o=i.config.emulator?Uc(n.config,s):`${n.config.apiScheme}://${s}`;return tv.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}class rv{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(st(this.auth,"network-request-failed")),nv.get())})}}function Vs(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=st(n,e,r);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function sv(n,e){return ir(n,"POST","/v1/accounts:delete",e)}async function Si(n,e){return ir(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fr(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function iv(n,e=!1){const t=En(n),r=await t.getIdToken(e),s=$c(r);j(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Fr(ia(s.auth_time)),issuedAtTime:Fr(ia(s.iat)),expirationTime:Fr(ia(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function ia(n){return Number(n)*1e3}function $c(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Ys("JWT malformed, contained fewer than 3 sections"),null;try{const s=Lp(t);return s?JSON.parse(s):(Ys("Failed to decode base64 JWT payload"),null)}catch(s){return Ys("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Fh(n){const e=$c(n);return j(e,"internal-error"),j(typeof e.exp<"u","internal-error"),j(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof ao&&ov(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function ov({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class av{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ha{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Fr(this.lastLoginAt),this.creationTime=Fr(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ci(n){var p;const e=n.auth,t=await n.getIdToken(),r=await Zr(n,Si(e,{idToken:t}));j(r==null?void 0:r.users.length,e,"internal-error");const s=r.users[0];n._notifyReloadListener(s);const i=(p=s.providerUserInfo)!=null&&p.length?qp(s.providerUserInfo):[],o=lv(n.providerData,i),c=n.isAnonymous,l=!(n.email&&s.passwordHash)&&!(o!=null&&o.length),h=c?l:!1,d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new Ha(s.createdAt,s.lastLoginAt),isAnonymous:h};Object.assign(n,d)}async function cv(n){const e=En(n);await Ci(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function lv(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function qp(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function uv(n,e){const t=await $p(n,{},async()=>{const r=us({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,o=await jp(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:c,body:r};return n.emulatorConfig&&oo(n.emulatorConfig.host)&&(l.credentials="include"),Up.fetch()(o,l)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function hv(n,e){return ir(n,"POST","/v2/accounts:revokeToken",lo(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Un{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){j(e.idToken,"internal-error"),j(typeof e.idToken<"u","internal-error"),j(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Fh(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){j(e.length!==0,"internal-error");const t=Fh(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(j(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await uv(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,o=new Un;return r&&(j(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(j(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(j(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Un,this.toJSON())}_performRefresh(){return ut("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ct(n,e){j(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Ke{constructor({uid:e,auth:t,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new av(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Ha(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await Zr(this,this.stsTokenManager.getToken(this.auth,e));return j(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return iv(this,e)}reload(){return cv(this)}_assign(e){this!==e&&(j(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ke({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){j(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await Ci(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(We(this.auth.app))return Promise.reject(Ut(this.auth));const e=await this.getIdToken();return await Zr(this,sv(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,c=t.tenantId??void 0,l=t._redirectEventId??void 0,h=t.createdAt??void 0,d=t.lastLoginAt??void 0,{uid:p,emailVerified:m,isAnonymous:E,providerData:A,stsTokenManager:N}=t;j(p&&N,e,"internal-error");const b=Un.fromJSON(this.name,N);j(typeof p=="string",e,"internal-error"),Ct(r,e.name),Ct(s,e.name),j(typeof m=="boolean",e,"internal-error"),j(typeof E=="boolean",e,"internal-error"),Ct(i,e.name),Ct(o,e.name),Ct(c,e.name),Ct(l,e.name),Ct(h,e.name),Ct(d,e.name);const O=new Ke({uid:p,auth:e,email:s,emailVerified:m,displayName:r,isAnonymous:E,photoURL:o,phoneNumber:i,tenantId:c,stsTokenManager:b,createdAt:h,lastLoginAt:d});return A&&Array.isArray(A)&&(O.providerData=A.map(x=>({...x}))),l&&(O._redirectEventId=l),O}static async _fromIdTokenResponse(e,t,r=!1){const s=new Un;s.updateFromServerResponse(t);const i=new Ke({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await Ci(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];j(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?qp(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new Un;c.updateFromIdToken(r);const l=new Ke({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:o}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Ha(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,h),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bh=new Map;function ht(n){Et(n instanceof Function,"Expected a class definition");let e=Bh.get(n);return e?(Et(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Bh.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wp{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Wp.type="NONE";const Uh=Wp;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Js(n,e,t){return`firebase:${n}:${e}:${t}`}class $n{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Js(this.userKey,s.apiKey,i),this.fullPersistenceKey=Js("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Si(this.auth,{idToken:e}).catch(()=>{});return t?Ke._fromGetAccountInfoResponse(this.auth,t,e):null}return Ke._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new $n(ht(Uh),e,r);const s=(await Promise.all(t.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||ht(Uh);const o=Js(r,e.config.apiKey,e.name);let c=null;for(const h of t)try{const d=await h._get(o);if(d){let p;if(typeof d=="string"){const m=await Si(e,{idToken:d}).catch(()=>{});if(!m)break;p=await Ke._fromGetAccountInfoResponse(e,m,d)}else p=Ke._fromJSON(e,d);h!==i&&(c=p),i=h;break}}catch{}const l=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new $n(i,e,r):(i=l[0],c&&await i._set(o,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==i)try{await h._remove(o)}catch{}})),new $n(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $h(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Qp(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(zp(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Yp(e))return"Blackberry";if(Jp(e))return"Webos";if(Kp(e))return"Safari";if((e.includes("chrome/")||Gp(e))&&!e.includes("edge/"))return"Chrome";if(Xp(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function zp(n=Ve()){return/firefox\//i.test(n)}function Kp(n=Ve()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Gp(n=Ve()){return/crios\//i.test(n)}function Qp(n=Ve()){return/iemobile/i.test(n)}function Xp(n=Ve()){return/android/i.test(n)}function Yp(n=Ve()){return/blackberry/i.test(n)}function Jp(n=Ve()){return/webos/i.test(n)}function Hc(n=Ve()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function dv(n=Ve()){var e;return Hc(n)&&!!((e=window.navigator)!=null&&e.standalone)}function fv(){return VI()&&document.documentMode===10}function Zp(n=Ve()){return Hc(n)||Xp(n)||Jp(n)||Yp(n)||/windows phone/i.test(n)||Qp(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function em(n,e=[]){let t;switch(n){case"Browser":t=$h(Ve());break;case"Worker":t=`${$h(Ve())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Zn}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pv{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((o,c)=>{try{const l=e(i);o(l)}catch(l){c(l)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mv(n,e={}){return ir(n,"GET","/v2/passwordPolicy",lo(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gv=6;class _v{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??gv,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yv{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Hh(this),this.idTokenSubscription=new Hh(this),this.beforeStateQueue=new pv(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Fp,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=ht(t)),this._initializationPromise=this.queue(async()=>{var r,s,i;if(!this._deleted&&(this.persistenceManager=await $n.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Si(this,{idToken:e}),r=await Ke._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(We(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,c=r==null?void 0:r._redirectEventId,l=await this.tryRedirectSignIn(e);(!o||o===c)&&(l!=null&&l.user)&&(r=l.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return j(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Ci(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=ZI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(We(this.app))return Promise.reject(Ut(this));const t=e?En(e):null;return t&&j(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&j(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return We(this.app)?Promise.reject(Ut(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return We(this.app)?Promise.reject(Ut(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ht(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await mv(this),t=new _v(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new co("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await hv(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&ht(e)||this._popupRedirectResolver;j(t,this,"argument-error"),this.redirectPersistenceManager=await $n.create(this,[ht(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(j(c,this,"internal-error"),c.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const l=e.addObserver(t,r,s);return()=>{o=!0,l()}}else{const l=e.addObserver(t);return()=>{o=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return j(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=em(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(We(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&XI(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function uo(n){return En(n)}class Hh{constructor(e){this.auth=e,this.observer=null,this.addObserver=$I(t=>this.observer=t)}get next(){return j(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let jc={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Ev(n){jc=n}function Tv(n){return jc.loadJS(n)}function wv(){return jc.gapiScript}function Iv(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vv(n,e){const t=ss(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(vi(i,e??{}))return s;yt(s,"already-initialized")}return t.initialize({options:e})}function Av(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(ht);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Sv(n,e,t){const r=uo(n);j(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=tm(e),{host:o,port:c}=Cv(e),l=c===null?"":`:${c}`,h={url:`${i}//${o}${l}/`},d=Object.freeze({host:o,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){j(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),j(vi(h,r.config.emulator)&&vi(d,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=h,r.emulatorConfig=d,r.settings.appVerificationDisabledForTesting=!0,oo(o)?(bI(`${i}//${o}${l}`),NI("Auth",!0)):Rv()}function tm(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function Cv(n){const e=tm(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:jh(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:jh(o)}}}function jh(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Rv(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nm{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return ut("not implemented")}_getIdTokenResponse(e){return ut("not implemented")}_linkToIdToken(e,t){return ut("not implemented")}_getReauthenticationResolver(e){return ut("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hn(n,e){return Hp(n,"POST","/v1/accounts:signInWithIdp",lo(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bv="http://localhost";class fn extends nm{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new fn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):yt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...i}=t;if(!r||!s)return null;const o=new fn(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Hn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Hn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Hn(e,t)}buildRequest(){const e={requestUri:bv,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=us(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rm{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds extends rm{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt extends ds{constructor(){super("facebook.com")}static credential(e){return fn._fromParams({providerId:Rt.PROVIDER_ID,signInMethod:Rt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Rt.credentialFromTaggedObject(e)}static credentialFromError(e){return Rt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Rt.credential(e.oauthAccessToken)}catch{return null}}}Rt.FACEBOOK_SIGN_IN_METHOD="facebook.com";Rt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt extends ds{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return fn._fromParams({providerId:bt.PROVIDER_ID,signInMethod:bt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return bt.credentialFromTaggedObject(e)}static credentialFromError(e){return bt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return bt.credential(t,r)}catch{return null}}}bt.GOOGLE_SIGN_IN_METHOD="google.com";bt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt extends ds{constructor(){super("github.com")}static credential(e){return fn._fromParams({providerId:Pt.PROVIDER_ID,signInMethod:Pt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Pt.credentialFromTaggedObject(e)}static credentialFromError(e){return Pt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Pt.credential(e.oauthAccessToken)}catch{return null}}}Pt.GITHUB_SIGN_IN_METHOD="github.com";Pt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kt extends ds{constructor(){super("twitter.com")}static credential(e,t){return fn._fromParams({providerId:kt.PROVIDER_ID,signInMethod:kt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return kt.credentialFromTaggedObject(e)}static credentialFromError(e){return kt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return kt.credential(t,r)}catch{return null}}}kt.TWITTER_SIGN_IN_METHOD="twitter.com";kt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pv(n,e){return Hp(n,"POST","/v1/accounts:signUp",lo(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await Ke._fromIdTokenResponse(e,r,s),o=qh(r);return new Gt({user:i,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=qh(r);return new Gt({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function qh(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function kv(n){var s;if(We(n.app))return Promise.reject(Ut(n));const e=uo(n);if(await e._initializationPromise,(s=e.currentUser)!=null&&s.isAnonymous)return new Gt({user:e.currentUser,providerId:null,operationType:"signIn"});const t=await Pv(e,{returnSecureToken:!0}),r=await Gt._fromIdTokenResponse(e,"signIn",t,!0);return await e._updateCurrentUser(r.user),r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ri extends ao{constructor(e,t,r,s){super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Ri.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new Ri(e,t,r,s)}}function sm(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Ri._fromErrorAndOperation(n,i,e,r):i})}async function Nv(n,e,t=!1){const r=await Zr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Gt._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Mv(n,e,t=!1){const{auth:r}=n;if(We(r.app))return Promise.reject(Ut(r));const s="reauthenticate";try{const i=await Zr(n,sm(r,s,e,n),t);j(i.idToken,r,"internal-error");const o=$c(i.idToken);j(o,r,"internal-error");const{sub:c}=o;return j(n.uid===c,r,"user-mismatch"),Gt._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&yt(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Lv(n,e,t=!1){if(We(n.app))return Promise.reject(Ut(n));const r="signIn",s=await sm(n,r,e),i=await Gt._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}function Dv(n,e,t,r){return En(n).onIdTokenChanged(e,t,r)}function Ov(n,e,t){return En(n).beforeAuthStateChanged(e,t)}function Vv(n,e,t,r){return En(n).onAuthStateChanged(e,t,r)}const bi="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class im{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(bi,"1"),this.storage.removeItem(bi),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xv=1e3,Fv=10;class om extends im{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Zp(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,l)=>{this.notifyListeners(o,l)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);fv()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,Fv):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},xv)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}om.type="LOCAL";const Bv=om;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class am extends im{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}am.type="SESSION";const cm=am;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uv(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ho{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new ho(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(o).map(async h=>h(t.origin,i)),l=await Uv(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ho.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qc(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $v{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((c,l)=>{const h=qc("",20);s.port1.start();const d=setTimeout(()=>{l(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(p){const m=p;if(m.data.eventId===h)switch(m.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(m.data.response);break;default:clearTimeout(d),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function it(){return window}function Hv(n){it().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lm(){return typeof it().WorkerGlobalScope<"u"&&typeof it().importScripts=="function"}async function jv(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function qv(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function Wv(){return lm()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const um="firebaseLocalStorageDb",zv=1,Pi="firebaseLocalStorage",hm="fbase_key";class fs{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function fo(n,e){return n.transaction([Pi],e?"readwrite":"readonly").objectStore(Pi)}function Kv(){const n=indexedDB.deleteDatabase(um);return new fs(n).toPromise()}function ja(){const n=indexedDB.open(um,zv);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Pi,{keyPath:hm})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Pi)?e(r):(r.close(),await Kv(),e(await ja()))})})}async function Wh(n,e,t){const r=fo(n,!0).put({[hm]:e,value:t});return new fs(r).toPromise()}async function Gv(n,e){const t=fo(n,!1).get(e),r=await new fs(t).toPromise();return r===void 0?null:r.value}function zh(n,e){const t=fo(n,!0).delete(e);return new fs(t).toPromise()}const Qv=800,Xv=3;class dm{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await ja(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>Xv)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return lm()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ho._getInstance(Wv()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await jv(),!this.activeServiceWorker)return;this.sender=new $v(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||qv()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await ja();return await Wh(e,bi,"1"),await zh(e,bi),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Wh(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>Gv(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>zh(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=fo(s,!1).getAll();return new fs(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Qv)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}dm.type="LOCAL";const Yv=dm;new hs(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jv(n,e){return e?ht(e):(j(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wc extends nm{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Hn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Hn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Hn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function Zv(n){return Lv(n.auth,new Wc(n),n.bypassAuthState)}function eA(n){const{auth:e,user:t}=n;return j(t,e,"internal-error"),Mv(t,new Wc(n),n.bypassAuthState)}async function tA(n){const{auth:e,user:t}=n;return j(t,e,"internal-error"),Nv(t,new Wc(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fm{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:o,type:c}=e;if(o){this.reject(o);return}const l={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(l))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Zv;case"linkViaPopup":case"linkViaRedirect":return tA;case"reauthViaPopup":case"reauthViaRedirect":return eA;default:yt(this.auth,"internal-error")}}resolve(e){Et(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Et(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nA=new hs(2e3,1e4);class Mn extends fm{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Mn.currentPopupAction&&Mn.currentPopupAction.cancel(),Mn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return j(e,this.auth,"internal-error"),e}async onExecution(){Et(this.filter.length===1,"Popup operations only handle one event");const e=qc();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(st(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(st(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Mn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(st(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,nA.get())};e()}}Mn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rA="pendingRedirect",Zs=new Map;class sA extends fm{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Zs.get(this.auth._key());if(!e){try{const r=await iA(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Zs.set(this.auth._key(),e)}return this.bypassAuthState||Zs.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function iA(n,e){const t=cA(e),r=aA(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function oA(n,e){Zs.set(n._key(),e)}function aA(n){return ht(n._redirectPersistence)}function cA(n){return Js(rA,n.config.apiKey,n.name)}async function lA(n,e,t=!1){if(We(n.app))return Promise.reject(Ut(n));const r=uo(n),s=Jv(r,e),o=await new sA(r,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uA=10*60*1e3;class hA{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!dA(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!pm(e)){const s=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(st(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=uA&&this.cachedEventUids.clear(),this.cachedEventUids.has(Kh(e))}saveEventToCache(e){this.cachedEventUids.add(Kh(e)),this.lastProcessedEventTime=Date.now()}}function Kh(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function pm({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function dA(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return pm(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fA(n,e={}){return ir(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pA=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,mA=/^https?/;async function gA(n){if(n.config.emulator)return;const{authorizedDomains:e}=await fA(n);for(const t of e)try{if(_A(t))return}catch{}yt(n,"unauthorized-domain")}function _A(n){const e=$a(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!mA.test(t))return!1;if(pA.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yA=new hs(3e4,6e4);function Gh(){const n=it().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function EA(n){return new Promise((e,t)=>{var s,i,o;function r(){Gh(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Gh(),t(st(n,"network-request-failed"))},timeout:yA.get()})}if((i=(s=it().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=it().gapi)!=null&&o.load)r();else{const c=Iv("iframefcb");return it()[c]=()=>{gapi.load?r():t(st(n,"network-request-failed"))},Tv(`${wv()}?onload=${c}`).catch(l=>t(l))}}).catch(e=>{throw ei=null,e})}let ei=null;function TA(n){return ei=ei||EA(n),ei}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wA=new hs(5e3,15e3),IA="__/auth/iframe",vA="emulator/auth/iframe",AA={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},SA=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function CA(n){const e=n.config;j(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Uc(e,vA):`https://${n.config.authDomain}/${IA}`,r={apiKey:e.apiKey,appName:n.name,v:Zn},s=SA.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${us(r).slice(1)}`}async function RA(n){const e=await TA(n),t=it().gapi;return j(t,n,"internal-error"),e.open({where:document.body,url:CA(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:AA,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=st(n,"network-request-failed"),c=it().setTimeout(()=>{i(o)},wA.get());function l(){it().clearTimeout(c),s(r)}r.ping(l).then(l,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bA={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},PA=500,kA=600,NA="_blank",MA="http://localhost";class Qh{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function LA(n,e,t,r=PA,s=kA){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const l={...bA,width:r.toString(),height:s.toString(),top:i,left:o},h=Ve().toLowerCase();t&&(c=Gp(h)?NA:t),zp(h)&&(e=e||MA,l.scrollbars="yes");const d=Object.entries(l).reduce((m,[E,A])=>`${m}${E}=${A},`,"");if(dv(h)&&c!=="_self")return DA(e||"",c),new Qh(null);const p=window.open(e||"",c,d);j(p,n,"popup-blocked");try{p.focus()}catch{}return new Qh(p)}function DA(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const OA="__/auth/handler",VA="emulator/auth/handler",xA=encodeURIComponent("fac");async function Xh(n,e,t,r,s,i){j(n.config.authDomain,n,"auth-domain-config-required"),j(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Zn,eventId:s};if(e instanceof rm){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",UI(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries({}))o[d]=p}if(e instanceof ds){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(o.scopes=d.join(","))}n.tenantId&&(o.tid=n.tenantId);const c=o;for(const d of Object.keys(c))c[d]===void 0&&delete c[d];const l=await n._getAppCheckToken(),h=l?`#${xA}=${encodeURIComponent(l)}`:"";return`${FA(n)}?${us(c).slice(1)}${h}`}function FA({config:n}){return n.emulator?Uc(n,VA):`https://${n.authDomain}/${OA}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oa="webStorageSupport";class BA{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=cm,this._completeRedirectFn=lA,this._overrideRedirectResult=oA}async _openPopup(e,t,r,s){var o;Et((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await Xh(e,t,r,$a(),s);return LA(e,i,qc())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await Xh(e,t,r,$a(),s);return Hv(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Et(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await RA(e),r=new hA(e);return t.register("authEvent",s=>(j(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(oa,{type:oa},s=>{var o;const i=(o=s==null?void 0:s[0])==null?void 0:o[oa];i!==void 0&&t(!!i),yt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=gA(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Zp()||Kp()||Hc()}}const UA=BA;var Yh="@firebase/auth",Jh="1.11.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $A{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){j(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function HA(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function jA(n){$t(new Vh("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=r.options;j(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:o,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:em(n)},h=new yv(r,s,i,l);return Av(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),$t(new Vh("auth-internal",e=>{const t=uo(e.getProvider("auth").getImmediate());return(r=>new $A(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),dt(Yh,Jh,HA(n)),dt(Yh,Jh,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qA=5*60,WA=Op("authIdTokenMaxAge")||qA;let Zh=null;const zA=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>WA)return;const s=t==null?void 0:t.token;Zh!==s&&(Zh=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function KA(n=lc()){const e=ss(n,"auth");if(e.isInitialized())return e.getImmediate();const t=vv(n,{popupRedirectResolver:UA,persistence:[Yv,Bv,cm]}),r=Op("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=zA(i.toString());Ov(t,o,()=>o(t.currentUser)),Dv(t,c=>o(c))}}const s=RI("auth");return s&&Sv(t,`http://${s}`),t}function GA(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}Ev({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=st("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",GA().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});jA("Browser");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const QA=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},XA=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},YA={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,l=s+2<n.length,h=l?n[s+2]:0,d=i>>2,p=(i&3)<<4|c>>4;let m=(c&15)<<2|h>>6,E=h&63;l||(E=64,o||(m=64)),r.push(t[d],t[p],t[m],t[E])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(QA(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):XA(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const p=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||p==null)throw new JA;const m=i<<2|c>>4;if(r.push(m),h!==64){const E=c<<4&240|h>>2;if(r.push(E),p!==64){const A=h<<6&192|p;r.push(A)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class JA extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ZA(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ki{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}function mm(){try{return typeof indexedDB=="object"}catch{return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eS="FirebaseError";class zc extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=eS,Object.setPrototypeOf(this,zc.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,gm.prototype.create)}}class gm{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?tS(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new zc(s,c,r)}}function tS(n,e){return n.replace(nS,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const nS=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rS=1e3,sS=2,iS=4*60*60*1e3,oS=.5;function aS(n,e=rS,t=sS){const r=e*Math.pow(t,n),s=Math.round(oS*r*(Math.random()-.5)*2);return Math.min(iS,r+s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cS(n){return n&&n._delegate?n._delegate:n}class ed{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ce;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(ce||(ce={}));const lS={debug:ce.DEBUG,verbose:ce.VERBOSE,info:ce.INFO,warn:ce.WARN,error:ce.ERROR,silent:ce.SILENT},uS=ce.INFO,hS={[ce.DEBUG]:"log",[ce.VERBOSE]:"log",[ce.INFO]:"info",[ce.WARN]:"warn",[ce.ERROR]:"error"},dS=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=hS[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class fS{constructor(e){this.name=e,this._logLevel=uS,this._logHandler=dS,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ce))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?lS[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ce.DEBUG,...e),this._logHandler(this,ce.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ce.VERBOSE,...e),this._logHandler(this,ce.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ce.INFO,...e),this._logHandler(this,ce.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ce.WARN,...e),this._logHandler(this,ce.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ce.ERROR,...e),this._logHandler(this,ce.ERROR,...e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qa=new Map,_m={activated:!1,tokenObservers:[]},pS={initialized:!1,enabled:!1};function Ee(n){return qa.get(n)||{..._m}}function mS(n,e){return qa.set(n,e),qa.get(n)}function po(){return pS}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ym="https://content-firebaseappcheck.googleapis.com/v1",gS="exchangeRecaptchaEnterpriseToken",_S="exchangeDebugToken",td={RETRIAL_MIN_WAIT:30*1e3,RETRIAL_MAX_WAIT:16*60*1e3},yS=24*60*60*1e3;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ES{constructor(e,t,r,s,i){if(this.operation=e,this.retryPolicy=t,this.getWaitDuration=r,this.lowerBound=s,this.upperBound=i,this.pending=null,this.nextErrorWaitInterval=s,s>i)throw new Error("Proactive refresh lower bound greater than upper bound!")}start(){this.nextErrorWaitInterval=this.lowerBound,this.process(!0).catch(()=>{})}stop(){this.pending&&(this.pending.reject("cancelled"),this.pending=null)}isRunning(){return!!this.pending}async process(e){this.stop();try{this.pending=new ki,this.pending.promise.catch(t=>{}),await TS(this.getNextRun(e)),this.pending.resolve(),await this.pending.promise,this.pending=new ki,this.pending.promise.catch(t=>{}),await this.operation(),this.pending.resolve(),await this.pending.promise,this.process(!0).catch(()=>{})}catch(t){this.retryPolicy(t)?this.process(!1).catch(()=>{}):this.stop()}}getNextRun(e){if(e)return this.nextErrorWaitInterval=this.lowerBound,this.getWaitDuration();{const t=this.nextErrorWaitInterval;return this.nextErrorWaitInterval*=2,this.nextErrorWaitInterval>this.upperBound&&(this.nextErrorWaitInterval=this.upperBound),t}}}function TS(n){return new Promise(e=>{setTimeout(e,n)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wS={"already-initialized":"You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.","use-before-activation":"App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.","fetch-network-error":"Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.","fetch-parse-error":"Fetch client could not parse response. Original error: {$originalErrorMessage}.","fetch-status-error":"Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.","storage-open":"Error thrown when opening storage. Original error: {$originalErrorMessage}.","storage-get":"Error thrown when reading from storage. Original error: {$originalErrorMessage}.","storage-set":"Error thrown when writing to storage. Original error: {$originalErrorMessage}.","recaptcha-error":"ReCAPTCHA error.","initial-throttle":"{$httpStatus} error. Attempts allowed again after {$time}",throttled:"Requests throttled due to previous {$httpStatus} error. Attempts allowed again after {$time}"},Be=new gm("appCheck","AppCheck",wS);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nd(n=!1){var e;return n?(e=self.grecaptcha)==null?void 0:e.enterprise:self.grecaptcha}function Kc(n){if(!Ee(n).activated)throw Be.create("use-before-activation",{appName:n.name})}function Em(n){const e=Math.round(n/1e3),t=Math.floor(e/(3600*24)),r=Math.floor((e-t*3600*24)/3600),s=Math.floor((e-t*3600*24-r*3600)/60),i=e-t*3600*24-r*3600-s*60;let o="";return t&&(o+=xs(t)+"d:"),r&&(o+=xs(r)+"h:"),o+=xs(s)+"m:"+xs(i)+"s",o}function xs(n){return n===0?"00":n>=10?n.toString():"0"+n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Gc({url:n,body:e},t){const r={"Content-Type":"application/json"},s=t.getImmediate({optional:!0});if(s){const p=await s.getHeartbeatsHeader();p&&(r["X-Firebase-Client"]=p)}const i={method:"POST",body:JSON.stringify(e),headers:r};let o;try{o=await fetch(n,i)}catch(p){throw Be.create("fetch-network-error",{originalErrorMessage:p==null?void 0:p.message})}if(o.status!==200)throw Be.create("fetch-status-error",{httpStatus:o.status});let c;try{c=await o.json()}catch(p){throw Be.create("fetch-parse-error",{originalErrorMessage:p==null?void 0:p.message})}const l=c.ttl.match(/^([\d.]+)(s)$/);if(!l||!l[2]||isNaN(Number(l[1])))throw Be.create("fetch-parse-error",{originalErrorMessage:`ttl field (timeToLive) is not in standard Protobuf Duration format: ${c.ttl}`});const h=Number(l[1])*1e3,d=Date.now();return{token:c.token,expireTimeMillis:d+h,issuedAtTimeMillis:d}}function IS(n,e){const{projectId:t,appId:r,apiKey:s}=n.options;return{url:`${ym}/projects/${t}/apps/${r}:${gS}?key=${s}`,body:{recaptcha_enterprise_token:e}}}function Tm(n,e){const{projectId:t,appId:r,apiKey:s}=n.options;return{url:`${ym}/projects/${t}/apps/${r}:${_S}?key=${s}`,body:{debug_token:e}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vS="firebase-app-check-database",AS=1,es="firebase-app-check-store",wm="debug-token";let Fs=null;function Im(){return Fs||(Fs=new Promise((n,e)=>{try{const t=indexedDB.open(vS,AS);t.onsuccess=r=>{n(r.target.result)},t.onerror=r=>{var s;e(Be.create("storage-open",{originalErrorMessage:(s=r.target.error)==null?void 0:s.message}))},t.onupgradeneeded=r=>{const s=r.target.result;switch(r.oldVersion){case 0:s.createObjectStore(es,{keyPath:"compositeKey"})}}}catch(t){e(Be.create("storage-open",{originalErrorMessage:t==null?void 0:t.message}))}}),Fs)}function SS(n){return Am(Sm(n))}function CS(n,e){return vm(Sm(n),e)}function RS(n){return vm(wm,n)}function bS(){return Am(wm)}async function vm(n,e){const r=(await Im()).transaction(es,"readwrite"),i=r.objectStore(es).put({compositeKey:n,value:e});return new Promise((o,c)=>{i.onsuccess=l=>{o()},r.onerror=l=>{var h;c(Be.create("storage-set",{originalErrorMessage:(h=l.target.error)==null?void 0:h.message}))}})}async function Am(n){const t=(await Im()).transaction(es,"readonly"),s=t.objectStore(es).get(n);return new Promise((i,o)=>{s.onsuccess=c=>{const l=c.target.result;i(l?l.value:void 0)},t.onerror=c=>{var l;o(Be.create("storage-get",{originalErrorMessage:(l=c.target.error)==null?void 0:l.message}))}})}function Sm(n){return`${n.options.appId}-${n.name}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lt=new fS("@firebase/app-check");/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function PS(n){if(mm()){let e;try{e=await SS(n)}catch(t){Lt.warn(`Failed to read token from IndexedDB. Error: ${t}`)}return e}}function aa(n,e){return mm()?CS(n,e).catch(t=>{Lt.warn(`Failed to write token to IndexedDB. Error: ${t}`)}):Promise.resolve()}async function kS(){let n;try{n=await bS()}catch{}if(n)return n;{const e=crypto.randomUUID();return RS(e).catch(t=>Lt.warn(`Failed to persist debug token to IndexedDB. Error: ${t}`)),e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qc(){return po().enabled}async function Xc(){const n=po();if(n.enabled&&n.token)return n.token.promise;throw Error(`
            Can't get debug token in production mode.
        `)}function NS(){const n=ZA(),e=po();if(e.initialized=!0,typeof n.FIREBASE_APPCHECK_DEBUG_TOKEN!="string"&&n.FIREBASE_APPCHECK_DEBUG_TOKEN!==!0)return;e.enabled=!0;const t=new ki;e.token=t,typeof n.FIREBASE_APPCHECK_DEBUG_TOKEN=="string"?t.resolve(n.FIREBASE_APPCHECK_DEBUG_TOKEN):t.resolve(kS())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const MS={error:"UNKNOWN_ERROR"};function LS(n){return YA.encodeString(JSON.stringify(n),!1)}async function Ni(n,e=!1,t=!1){const r=n.app;Kc(r);const s=Ee(r);let i=s.token,o;if(i&&!Ln(i)&&(s.token=void 0,i=void 0),!i){const h=await s.cachedTokenPromise;h&&(Ln(h)?i=h:await aa(r,void 0))}if(!e&&i&&Ln(i))return{token:i.token};let c=!1;if(Qc())try{s.exchangeTokenPromise||(s.exchangeTokenPromise=Gc(Tm(r,await Xc()),n.heartbeatServiceProvider).finally(()=>{s.exchangeTokenPromise=void 0}),c=!0);const h=await s.exchangeTokenPromise;return await aa(r,h),s.token=h,{token:h.token}}catch(h){return h.code==="appCheck/throttled"||h.code==="appCheck/initial-throttle"?Lt.warn(h.message):t&&Lt.error(h),ca(h)}try{s.exchangeTokenPromise||(s.exchangeTokenPromise=s.provider.getToken().finally(()=>{s.exchangeTokenPromise=void 0}),c=!0),i=await Ee(r).exchangeTokenPromise}catch(h){h.code==="appCheck/throttled"||h.code==="appCheck/initial-throttle"?Lt.warn(h.message):t&&Lt.error(h),o=h}let l;return i?o?Ln(i)?l={token:i.token,internalError:o}:l=ca(o):(l={token:i.token},s.token=i,await aa(r,i)):l=ca(o),c&&bm(r,l),l}async function DS(n){const e=n.app;Kc(e);const{provider:t}=Ee(e);if(Qc()){const r=await Xc(),{token:s}=await Gc(Tm(e,r),n.heartbeatServiceProvider);return{token:s}}else{const{token:r}=await t.getToken();return{token:r}}}function Cm(n,e,t,r){const{app:s}=n,i=Ee(s),o={next:t,error:r,type:e};if(i.tokenObservers=[...i.tokenObservers,o],i.token&&Ln(i.token)){const c=i.token;Promise.resolve().then(()=>{t({token:c.token}),rd(n)}).catch(()=>{})}i.cachedTokenPromise.then(()=>rd(n))}function Rm(n,e){const t=Ee(n),r=t.tokenObservers.filter(s=>s.next!==e);r.length===0&&t.tokenRefresher&&t.tokenRefresher.isRunning()&&t.tokenRefresher.stop(),t.tokenObservers=r}function rd(n){const{app:e}=n,t=Ee(e);let r=t.tokenRefresher;r||(r=OS(n),t.tokenRefresher=r),!r.isRunning()&&t.isTokenAutoRefreshEnabled&&r.start()}function OS(n){const{app:e}=n;return new ES(async()=>{const t=Ee(e);let r;if(t.token?r=await Ni(n,!0):r=await Ni(n),r.error)throw r.error;if(r.internalError)throw r.internalError},()=>!0,()=>{const t=Ee(e);if(t.token){let r=t.token.issuedAtTimeMillis+(t.token.expireTimeMillis-t.token.issuedAtTimeMillis)*.5+3e5;const s=t.token.expireTimeMillis-5*60*1e3;return r=Math.min(r,s),Math.max(0,r-Date.now())}else return 0},td.RETRIAL_MIN_WAIT,td.RETRIAL_MAX_WAIT)}function bm(n,e){const t=Ee(n).tokenObservers;for(const r of t)try{r.type==="EXTERNAL"&&e.error!=null?r.error(e.error):r.next(e)}catch{}}function Ln(n){return n.expireTimeMillis-Date.now()>0}function ca(n){return{token:LS(MS),error:n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VS{constructor(e,t){this.app=e,this.heartbeatServiceProvider=t}_delete(){const{tokenObservers:e}=Ee(this.app);for(const t of e)Rm(this.app,t.next);return Promise.resolve()}}function xS(n,e){return new VS(n,e)}function FS(n){return{getToken:e=>Ni(n,e),getLimitedUseToken:()=>DS(n),addTokenListener:e=>Cm(n,"INTERNAL",e),removeTokenListener:e=>Rm(n.app,e)}}const BS="@firebase/app-check",US="0.11.0",$S="https://www.google.com/recaptcha/enterprise.js";function HS(n,e){const t=new ki,r=Ee(n);r.reCAPTCHAState={initialized:t};const s=jS(n),i=nd(!0);return i?sd(n,e,i,s,t):zS(()=>{const o=nd(!0);if(!o)throw new Error("no recaptcha");sd(n,e,o,s,t)}),t.promise}function sd(n,e,t,r,s){t.ready(()=>{WS(n,e,t,r),s.resolve(t)})}function jS(n){const e=`fire_app_check_${n.name}`,t=document.createElement("div");return t.id=e,t.style.display="none",document.body.appendChild(t),e}async function qS(n){Kc(n);const t=await Ee(n).reCAPTCHAState.initialized.promise;return new Promise((r,s)=>{const i=Ee(n).reCAPTCHAState;t.ready(()=>{r(t.execute(i.widgetId,{action:"fire_app_check"}))})})}function WS(n,e,t,r){const s=t.render(r,{sitekey:e,size:"invisible",callback:()=>{Ee(n).reCAPTCHAState.succeeded=!0},"error-callback":()=>{Ee(n).reCAPTCHAState.succeeded=!1}}),i=Ee(n);i.reCAPTCHAState={...i.reCAPTCHAState,widgetId:s}}function zS(n){const e=document.createElement("script");e.src=$S,e.onload=n,document.head.appendChild(e)}class Yc{constructor(e){this._siteKey=e,this._throttleData=null}async getToken(){var r,s,i;GS(this._throttleData);const e=await qS(this._app).catch(o=>{throw Be.create("recaptcha-error")});if(!((r=Ee(this._app).reCAPTCHAState)!=null&&r.succeeded))throw Be.create("recaptcha-error");let t;try{t=await Gc(IS(this._app,e),this._heartbeatServiceProvider)}catch(o){throw(s=o.code)!=null&&s.includes("fetch-status-error")?(this._throttleData=KS(Number((i=o.customData)==null?void 0:i.httpStatus),this._throttleData),Be.create("initial-throttle",{time:Em(this._throttleData.allowRequestsAfter-Date.now()),httpStatus:this._throttleData.httpStatus})):o}return this._throttleData=null,t}initialize(e){this._app=e,this._heartbeatServiceProvider=ss(e,"heartbeat"),HS(e,this._siteKey).catch(()=>{})}isEqual(e){return e instanceof Yc?this._siteKey===e._siteKey:!1}}function KS(n,e){if(n===404||n===403)return{backoffCount:1,allowRequestsAfter:Date.now()+yS,httpStatus:n};{const t=e?e.backoffCount:0,r=aS(t,1e3,2);return{backoffCount:t+1,allowRequestsAfter:Date.now()+r,httpStatus:n}}}function GS(n){if(n&&Date.now()-n.allowRequestsAfter<=0)throw Be.create("throttled",{time:Em(n.allowRequestsAfter-Date.now()),httpStatus:n.httpStatus})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QS(n=lc(),e){n=cS(n);const t=ss(n,"app-check");if(po().initialized||NS(),Qc()&&Xc().then(s=>console.log(`App Check debug token: ${s}. You will need to add it to your app's App Check settings in the Firebase console for it to work.`)),t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(i.isTokenAutoRefreshEnabled===e.isTokenAutoRefreshEnabled&&i.provider.isEqual(e.provider))return s;throw Be.create("already-initialized",{appName:n.name})}const r=t.initialize({options:e});return XS(n,e.provider,e.isTokenAutoRefreshEnabled),Ee(n).isTokenAutoRefreshEnabled&&Cm(r,"INTERNAL",()=>{}),r}function XS(n,e,t=!1){const r=mS(n,{..._m});r.activated=!0,r.provider=e,r.cachedTokenPromise=PS(n).then(s=>(s&&Ln(s)&&(r.token=s,bm(n,{token:s.token})),s)),r.isTokenAutoRefreshEnabled=t&&n.automaticDataCollectionEnabled,!n.automaticDataCollectionEnabled&&t&&Lt.warn("`isTokenAutoRefreshEnabled` is true but `automaticDataCollectionEnabled` was set to false during `initializeApp()`. This blocks automatic token refresh."),r.provider.initialize(n)}async function YS(n,e){const t=await Ni(n,e);if(t.error)throw t.error;if(t.internalError)throw t.internalError;return{token:t.token}}const JS="app-check",id="app-check-internal";function ZS(){$t(new ed(JS,n=>{const e=n.getProvider("app").getImmediate(),t=n.getProvider("heartbeat");return xS(e,t)},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((n,e,t)=>{n.getProvider(id).initialize()})),$t(new ed(id,n=>{const e=n.getProvider("app-check").getImmediate();return FS(e)},"PUBLIC").setInstantiationMode("EXPLICIT")),dt(BS,US)}ZS();function An(n,e,t={},r={}){const s=n.querySelector(e);if(s){Object.assign(s,t);for(const[i,o]of Object.entries(r))s.dataset[i]=o}}function Yt(n){const e=document.getElementById(n);return e?e.content.cloneNode(!0).firstElementChild:null}const an=n=>n?Wr(n):"--/-- --:--",eC={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function Pm(n){return typeof n!="string"?n:n.replace(/[&<>"']/g,function(e){return eC[e]})}function km(n){return Pm(n).replace(/\/\//g,"<br>")}function Jc(n,e){if(!n)return;const t=e.match(/^([1-9])_(.+)/);n.innerHTML="";const r=document.createElement("span");if(r.className="name-text",t){const s=t[1],i=t[2],o=document.createElement("span");o.className="instance-badge",o.textContent=s,n.appendChild(o),r.textContent=i}else r.textContent=e;n.appendChild(r)}const Nm="mapRatioCache_v1",Br=(()=>{try{return JSON.parse(localStorage.getItem(Nm)||"{}")||{}}catch{return{}}})();function Wa(n,e,t){const r=`${e} / ${t}`;if(Br[n]!==r){Br[n]=r;try{localStorage.setItem(Nm,JSON.stringify(Br))}catch{}}return r}function tC(n){if(!Array.isArray(n)||n.length===0)return;const e=new Set;n.forEach(r=>{r.mapImage&&r.rank!=="F"&&r.rank!==H.F&&e.add(r.mapImage)});const t=()=>{e.forEach(r=>{const s=new Image;s.src=`./maps/${r}`,s.onload=()=>{s.naturalWidth&&s.naturalHeight&&Wa(r,s.naturalWidth,s.naturalHeight)},typeof s.decode=="function"&&s.decode().catch(()=>{})})};"requestIdleCallback"in window?window.requestIdleCallback(t,{timeout:2e3}):setTimeout(t,300)}function nC(){if(window.magnifierInitialized)return;window.magnifierInitialized=!0;const n=P.globalMagnifier,e=n==null?void 0:n.querySelector(".magnifier-content-wrapper");if(!n||!e)return;let t=null,r=null,s=null,i=null;const o=()=>{n.classList.add("hidden"),P.body.classList.remove("magnifier-active"),t=null,r=null,s=null,e.innerHTML="",window.removeEventListener("mousemove",h)},c=d=>{if(!t||!r||!s)return;const p=d.clientX-s.left,m=d.clientY-s.top;if(p<0||m<0||p>s.width||m>s.height){o();return}i||(i=n.getBoundingClientRect());const E=i.width/2,A=i.height/2,N=E-p*Te.MAP_ZOOM_SCALE,b=A-m*Te.MAP_ZOOM_SCALE;n.style.transform=`translate3d(${d.clientX}px, ${d.clientY}px, 0) translate(-50%, -50%)`,e.style.transform=`translate3d(${N}px, ${b}px, 0) scale(${Te.MAP_ZOOM_SCALE})`};let l=null;const h=d=>{l&&cancelAnimationFrame(l);const p=d.clientX,m=d.clientY;l=requestAnimationFrame(()=>{c({clientX:p,clientY:m})})};document.addEventListener("mousedown",d=>{if(d.button!==2)return;const m=d.target.closest(".map-container");if(!m)return;const E=m.querySelector(".mob-map-img");if(!E)return;d.preventDefault();const A=m.getBoundingClientRect(),N=m.offsetWidth,b=m.offsetHeight;r=m,t=E,s=A,e.innerHTML="";const O=m.cloneNode(!0);O.classList.remove("w-full","u-w-full","pc-map-box","cursor-crosshair","!cursor-crosshair"),O.classList.add("magnifier-clone"),O.style.setProperty("--map-w",`${N}px`),O.style.setProperty("--map-h",`${b}px`),e.appendChild(O),n.classList.remove("hidden"),P.body.classList.add("magnifier-active"),window.addEventListener("mousemove",h),c(d)},{capture:!0}),window.addEventListener("mouseup",d=>{d.button===2&&t&&o()}),document.addEventListener("contextmenu",d=>{d.target.closest(".map-container")&&d.preventDefault()})}function rC(n){var r;const e=(r=n.memo_text)==null?void 0:r.trim(),t=(n.memo_updated_at||0)>=(n.last_kill_time||0);return!!(e&&(t||!n.last_kill_time))}function mo(n){const e=n.repopInfo||{},t=Re()/1e3;if(!e.status)return{label:"",timeValue:"--/-- --:--",isSpecialCondition:!1,isTimeOver:!1,isTimedMob:!1,dhm:null,isInWindow:!1};const r=!!e.maxRepop&&t>=e.maxRepop,s=!!e.isInConditionWindow,i=!s&&!!e.nextConditionSpawnDate&&t<e.nextConditionSpawnDate.getTime()/1e3,o=!!(e.isInConditionWindow||e.nextConditionSpawnDate),c=o&&n.rank===H.S&&e.status!=="PopWindow";let l=e.status;o&&(s?l="ConditionActive":(i||e.nextConditionSpawnDate)&&(l="NextCondition"));const h=LC(l,n.rank),d=e.nextConditionSpawnDate?e.nextConditionSpawnDate.getTime()/1e3:null,p=e.conditionWindowEnd?e.conditionWindowEnd.getTime()/1e3:null;let m;s&&p!==null?m=p:d!==null&&d>t?m=d:e.minRepop&&t<e.minRepop?m=e.minRepop:m=e.maxRepop||0;const E=r&&!s&&!i;E&&e.maxRepop&&(m=e.maxRepop);const A=Math.max(0,E?t-m:m-t),N=Fd(A),b=Fg(A);return{label:h,labelStatus:l,timeValue:b,isSpecialCondition:c,isTimeOver:E,isTimedMob:o,dhm:N,isInWindow:s}}function sC(n,e,t,r){if(!e){n.innerHTML="--/-- --:--",n.className="mobcard-timer";return}if(n.innerHTML.includes("--/-- --:--")||n.innerHTML===""){const c=Yt("timer-rich-template");c&&(n.innerHTML=c.innerHTML)}n.className="mobcard-timer",t&&n.classList.add("label-next"),r&&n.classList.add("time-over");const{h:s,m:i}=e,o=(c,l,h)=>{if(!c)return;const d=c.querySelector(".mobcard-timer-num"),p=h==="h"&&(Number(l)===0||!l);if(c.classList.toggle("hidden",p),!p&&d){const m=String(l||0).padStart(2,"0").replace(/^0/,"&nbsp;");d.innerHTML!==m&&(d.innerHTML=m)}};o(n.querySelector(".h-part"),s,"h"),o(n.querySelector(".m-part"),i,"m")}function Mm(n){var h,d,p;const e=G(),t=n.No%10,r=`${n.area}_${t}`,i=((h=e.mobLocations)==null?void 0:h[r])||n.spawn_cull_status||{},o=iC(n,i),c=o.length;let l=null;return c===1?l={type:"single",value:parseInt(((p=(d=o[0])==null?void 0:d.id)==null?void 0:p.slice(-2))||"0",10),unit:"番"}:c>1&&(l={type:"multiple",value:c,unit:""}),{countInfo:l,remainingCount:c,spawnCullStatus:i,validSpawnPoints:o}}function iC(n,e){return(n.locations??[]).filter(t=>{if(!t.mob_ranks.some(i=>i===H.S||i===H.A))return!1;const s=e==null?void 0:e[t.id];return!ol(s,n.No,n)})}const oC=35,aC=15;function cC(n,e,t,r,s){const i=Yt("spawn-point-template");if(!i)return null;const o=e==null?void 0:e[n.id],c=ol(o,t),l=n.mob_ranks.some(b=>b===H.S||b===H.A),h=n.mob_ranks.every(b=>b.startsWith("B"));let d="",p="false";if(s)d="color-lastone",p="false";else if(l){const b=n.mob_ranks.find(O=>O.startsWith("B"));c?d=b==="B1"?"color-b1-culled":"color-b2-culled":d=b==="B1"?"color-b1":"color-b2",p="true"}else h&&(d=n.mob_ranks[0]==="B1"?"color-b1-only":"color-b2-only",p="false");i.className=`spawn-point ${d}`,i.style.setProperty("--point-x",`${n.x}%`),i.style.setProperty("--point-y",`${n.y}%`);const m=parseInt(n.id.slice(-2),10),E=G().lodestoneId,A=!!E&&String((o==null?void 0:o.reporter_id)??"")===E,N=s?"(確)":c?A?"(自分済)":"(済)":"";return i.dataset.tooltip=`${m} ${N}`,Number(n.x)<oC&&(i.dataset.tipX="right"),Number(n.y)<aC&&(i.dataset.tipY="down"),Object.assign(i.dataset,{locationId:n.id,mobNo:String(t),rank:r,isCulled:String(c),isLastone:s?"true":"false",isInteractive:p}),i}function lC(n,e=!1){return e?uC(n):Lm(n)}function uC(n){const e=P.cardTemplate;if(!e)return document.createElement("div");const r=e.content.cloneNode(!0).querySelector(".mobcard-card"),s=n.rank,{nextConditionSpawnDate:i,minRepop:o,maxRepop:c}=n.repopInfo||{};r.dataset.mobNo=String(n.No),r.dataset.rank=s;const l=r.querySelector(".mobcard-name");l&&(Jc(l,n.name),l.dataset.rank=s),An(r,".mobcard-rank",{textContent:s},{rank:s}),An(r,"[data-min-repop]",{textContent:an(o)}),An(r,"[data-max-repop]",{textContent:an(c)}),An(r,"[data-next-possible]",{textContent:i?an(i):"--/-- --:--"}),An(r,"[data-last-kill]",{textContent:an(n.last_kill_time)}),An(r,".condition-text",{innerHTML:km(n.condition||"特別な出現条件はありません。")});const h=r.querySelector(".mobcard-memo-input");h&&(document.activeElement!==h&&(h.value=n.memo_text||""),h.dataset.mobNo=String(n.No),setTimeout(()=>nl(h),0));const d=r.querySelector(".map-section");return d&&(n.rank!==H.F&&n.rank!=="F"&&n.mapImage?(d.classList.remove("hidden"),Vm(r,n)):d.classList.add("hidden")),r.querySelectorAll(".moblist-report-btn").forEach(p=>{const m=p;m.dataset.reportType=s===H.A?"instant":"modal",m.dataset.mobNo=String(n.No)}),dC(r,n),hC(r,n),r}function Lm(n){const e=Yt("moblist-item-template");if(!e)return document.createElement("div");e.classList.add(`rank-${n.rank.toLowerCase()}`),e.dataset.mobNo=String(n.No),e.dataset.rank=n.rank;const t=e.querySelector(".moblist-rank-badge");t&&(t.textContent=n.rank,t.dataset.rank=n.rank);const r=e.querySelector(".moblist-name");r&&(Jc(r,n.name),r.dataset.rank=n.rank);const s=e.querySelector(".moblist-area");s&&(s.textContent=n.area||"");const i=e.querySelector(".moblist-report-btn");return i&&(i.dataset.mobNo=String(n.No),i.dataset.reportType=n.rank==="A"?"instant":"modal"),xm(e,n),e}function hC(n,e){const t=mo(e);Zc(n,e,t),el(n,e,t),Dm(n,e),tl(n,e)}function Zc(n,e,t=null){const{labelStatus:r}=t||mo(e),{elapsedPercent:s,status:i}=e.repopInfo||{},o=n.querySelector(".percent, .moblist-percent");if(o){let c=Math.max(0,Math.min(100,Math.floor(s||0)));i==="MaxOver"&&(c=100),(r==="Next"||r==="Maintenance")&&(c=0);const l=String(c/100);o.style.getPropertyValue("--prog-percent")!==l&&o.style.setProperty("--prog-percent",l)}if(n.classList.contains("moblist-item")&&e.repopInfo){const c=!!e.repopInfo.isInConditionWindow&&!e.repopInfo.isMaintenanceStop&&!e.repopInfo.isBlockedByMaintenance;n.classList.contains("moblist-highlight-white")!==c&&n.classList.toggle("moblist-highlight-white",c)}}function el(n,e,t=null){var A,N,b;const{status:r}=e.repopInfo||{},s=t||mo(e),{label:i,labelStatus:o,dhm:c,isSpecialCondition:l,isTimeOver:h,isTimedMob:d}=s,p=!!((A=e.repopInfo)!=null&&A.isBlockedByMaintenance||(N=e.repopInfo)!=null&&N.isMaintenanceStop||((b=e.repopInfo)==null?void 0:b.status)==="Maintenance"),m=n.querySelector(".moblist-time"),E=n.querySelector(".percent, .moblist-percent");if(m&&n.classList.contains("moblist-item")){let O=m.querySelector(".timer-inner-grid");if(!O){m.innerHTML="",O=document.createElement("div"),O.className="timer-inner-grid";const Q=document.createElement("span");Q.className="timer-label timer-label-base";const w=document.createElement("span");w.className="mobcard-timer",O.appendChild(Q),O.appendChild(w),m.appendChild(O)}sC(O.querySelector(".mobcard-timer"),c,l,h);const x=d&&(o==="ConditionActive"||o==="NextCondition"),F=O.querySelector(".timer-label-base"),z=`timer-label timer-label-base ${x?"status-"+o.toLowerCase()+" is-timed-badge":""} ${l?"is-special":""}`;F.className!==z&&(F.className=z);const ne=x?i:"";F.textContent!==ne&&(F.textContent=ne)}if(E){const{elapsedPercent:O}=e.repopInfo||{},x=Math.max(0,Math.min(100,O||0)),F=r==="MaxOver"?"100":String(Math.floor(x));E.textContent!==F&&(E.textContent=F),E.dataset.digits=String(F.length),E.classList.toggle("max-over",r==="MaxOver"),E.classList.toggle("pct-0",(r==="Next"||x===0)&&r!=="MaxOver");let z="blue";x>=80?z="orange":x>=60?z="yellow":x>=30&&(z="green"),E.dataset.pctTier!==z&&(E.dataset.pctTier=z)}n.classList.toggle("is-pre-repop",r==="Next"||r==="Maintenance"),n.classList.toggle("maintenance-gray-out",p)}function Ye(n,e,t){if(n._cache||(n._cache={}),n._cache[t])return n._cache[t];const r=n.querySelector(e);return r&&(n._cache[t]=r),r}function Dm(n,e){const{minRepop:t,maxRepop:r}=e.repopInfo||{},s=Ye(n,"[data-min-repop]","minRepop"),i=Ye(n,"[data-max-repop]","maxRepop"),o=Ye(n,"[data-next-possible]","nextPossible"),c=Ye(n,"[data-last-kill]","lastKill");if(s&&(s.textContent=an(t)),i&&(i.textContent=an(r)),o&&e.repopInfo)if(e.repopInfo.nextConditionSpawnDate){const d=Wr(e.repopInfo.nextConditionSpawnDate);o.textContent!==d&&(o.textContent=d),o.classList.add("text-yellow"),o.classList.remove("text-secondary")}else o.textContent!=="--/-- --:--"&&(o.textContent="--/-- --:--"),o.classList.remove("text-yellow"),o.classList.add("text-secondary");if(c){const d=an(e.last_kill_time);c.textContent!==d&&(c.textContent=d)}[s,i,o,c].forEach(d=>{d&&d.classList.toggle("is-empty",d.textContent==="--/-- --:--")});const l=Ye(n,".mobcard-memo-input","memoInput");if(l&&(l.dataset.mobNo!==String(e.No)&&(l.dataset.mobNo=String(e.No)),document.activeElement!==l)){const d=e.memo_text||"";l.value!==d&&(l.value=d,nl(l))}const h=Ye(n,".condition-text","conditionText");if(h){const d=e.condition?km(e.condition):"特別な出現条件はありません。";h.innerHTML!==d&&(h.innerHTML=d);const p=n.classList.contains("mobcard-card");[h.closest(".mobcard-section"),Ye(n,".memo-section","memoSection"),Ye(n,".map-section","mapSection")].filter(Boolean).forEach(E=>{p&&e.condition?E.classList.add("condition-section-neon"):E.classList.remove("condition-section-neon")})}}function Om(n,e){const t=Ye(n,".memo-icon-container","memoIconContainer");if(!t)return;const r=rC(e),s=(e.memo_text||"").trim();if(!(t._lastShow===r&&t._lastText===s))if(t._lastShow=r,t._lastText=s,t.innerHTML="",r){t.classList.remove("hidden");const i=Yt("memo-icon-template");if(i){const o=i.querySelector(".memo-tooltip");o&&(o.textContent=s),i.setAttribute("title",s),t.appendChild(i)}}else t.classList.add("hidden")}function tl(n,e){const t=Ye(n,".moblist-count","mobCount");if(!t)return;const{countInfo:r}=Mm(e);if(!r||e.rank==="F"){t.innerHTML!==""&&(t.innerHTML="");return}const s=`${r.type}-${r.value}`;if(t._lastCacheKey===s)return;t._lastCacheKey=s;const i=Yt("spawn-count-template");if(i){i.classList.add(r.type==="single"?"is-single":"is-multiple"),i.title=r.type==="single"?`${r.value}番`:`残り${r.value}か所`;const o=i.querySelector(".count-num");o&&(o.textContent=String(r.value)),t.innerHTML="",t.appendChild(i)}}function dC(n,e){const t=e.area||"--",r=e.Expansion||"--",s=e.rank||H.A;n.querySelectorAll(".mob-rank-badge, .mobcard-rank").forEach(i=>{i.textContent=s,i.dataset.rank=s}),n.querySelectorAll(".detail-area").forEach(i=>i.textContent=t),n.querySelectorAll(".detail-expansion").forEach(i=>i.textContent=`| ${r}`)}function nl(n){if(!n||n.tagName!=="TEXTAREA")return;const e=n;e.style.setProperty("--memo-h",e.scrollHeight+"px")}function Vm(n,e){const t=n.classList.contains("mobcard-card"),r=n.querySelector(".map-container");if(!r)return;const s=r.closest(".map-section");if(e.rank==="F"||e.rank===H.F){r.classList.add("hidden"),s&&s.classList.add("hidden");const c=r.querySelector(".map-overlay");c&&(c.innerHTML="",delete c._lastPointsHash);return}if(!e.mapImage){r.classList.add("hidden"),s&&s.classList.add("hidden");return}const i=r.querySelector(".mob-map-img"),o=r.querySelector(".map-overlay");if(o){if(!t){o.innerHTML!==""&&(o.innerHTML="",delete o._lastPointsHash);return}if(i&&e.mapImage&&i.dataset.mobMap!==e.mapImage){const c=e.mapImage;i.decoding!=="async"&&(i.decoding="async"),i.loading="eager",i.classList.remove("is-loaded"),Br[c]?r.style.setProperty("--map-ratio",Br[c]):r.style.removeProperty("--map-ratio"),i.onload=()=>{i.naturalWidth&&i.naturalHeight&&r.style.setProperty("--map-ratio",Wa(c,i.naturalWidth,i.naturalHeight)),i.classList.add("is-loaded")},i.src=`./maps/${c}`,i.complete&&i.naturalWidth&&(r.style.setProperty("--map-ratio",Wa(c,i.naturalWidth,i.naturalHeight)),i.classList.add("is-loaded")),i.alt=`${e.area} Map`,i.dataset.mobMap=e.mapImage,r.classList.remove("hidden"),delete r.dataset.locationLoading}if(!r.classList.contains("hidden")&&e.mapImage&&e.locations){const{spawnCullStatus:c,validSpawnPoints:l}=Mm(e),h=((l==null?void 0:l.length)||0)===1,d=n.querySelector(".map-update-time");if(d){let E=0;c&&Object.values(c).forEach(A=>{A.culled_at&&A.culled_at.seconds&&(E=Math.max(E,A.culled_at.seconds)),A.uncull_at&&A.uncull_at.seconds&&(E=Math.max(E,A.uncull_at.seconds))}),d.textContent=E>0?`更新: ${Wr(E)}`:"更新: --/-- --:--"}const p=G().lodestoneId||"",m=(e.locations??[]).map(E=>{const A=c==null?void 0:c[E.id],N=!!p&&String((A==null?void 0:A.reporter_id)??"")===p;return`${E.id}-${ol(A,e.No)}-${N?1:0}`}).join("|")+`|${h}`;if(o._lastPointsHash!==m){o.innerHTML="";const E=document.createDocumentFragment();(e.locations??[]).forEach(A=>{var O;const N=h&&A.id===((O=l[0])==null?void 0:O.id),b=cC(A,c,e.No,A.mob_ranks.includes("B2")?"B2":A.mob_ranks.includes("B1")?"B1":A.mob_ranks[0],N);b&&E.appendChild(b)}),o.appendChild(E),o._lastPointsHash=m}}}}function xm(n,e){const t=mo(e);Zc(n,e,t),el(n,e,t),tl(n,e),Om(n,e)}async function Fm(n){const e=G().mobs.find(s=>s.No===n);if(!e)return;const t=new Date(Re()),r=new Date(t.getTime()-t.getTimezoneOffset()*6e4).toISOString().slice(0,16);P.reportForm&&(P.reportForm.dataset.mobNo=String(n)),P.modalMobName&&Jc(P.modalMobName,e.name),P.modalTimeInput&&(P.modalTimeInput.value=r),P.reportModal&&P.reportModal.classList.remove("hidden")}function Ur(){P.reportModal&&P.reportModal.classList.add("hidden"),P.modalTimeInput&&(P.modalTimeInput.value=""),P.modalStatus&&(P.modalStatus.textContent=""),P.modalForceSubmit&&(P.modalForceSubmit.checked=!1)}let rl="";function go(){rl="",P.authVCode&&(P.authVCode.textContent="取得中..."),P.authStatus&&(P.authStatus.textContent="",P.authStatus.classList.remove("text-error","text-success")),P.authModal&&P.authModal.classList.remove("hidden"),fC()}async function fC(){const n=await RC();n?(rl=n,P.authVCode&&(P.authVCode.textContent=n)):P.authStatus&&(P.authStatus.textContent="認証コードを取得できませんでした。ページを再読み込みしてください。",P.authStatus.classList.add("text-error"))}function la(){P.authModal&&P.authModal.classList.add("hidden")}function pC(){if(document.querySelectorAll(".modal-content-base").forEach(n=>{n.querySelector(".ff-corner")||["tl","tr","bl","br"].forEach(e=>{const t=document.createElement("i");t.className=`ff-corner ${e}`,n.appendChild(t)})}),P.cancelReportBtn&&P.cancelReportBtn.addEventListener("click",Ur),P.reportModal&&P.reportModal.addEventListener("click",n=>{n.target===P.reportModal&&Ur()}),P.modalTimeInput){const n=P.modalTimeInput;n.setAttribute("lang","en"),n.setAttribute("inputmode","numeric"),n.setAttribute("autocomplete","off"),n.addEventListener("focus",()=>{n.setAttribute("lang","en")}),n.addEventListener("paste",e=>{var i;const t=((i=e.clipboardData)==null?void 0:i.getData("text"))||"";if(!t)return;const s=t.replace(/[０-９]/g,o=>String.fromCharCode(o.charCodeAt(0)-65248)).replace(/[／]/g,"-").replace(/[：]/g,":").trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{2})/);if(s){e.preventDefault();const[o,c,l,h,d,p]=s,m=`${c}-${l.padStart(2,"0")}-${h.padStart(2,"0")}T${d.padStart(2,"0")}:${p.padStart(2,"0")}`;n.value=m}})}P.authCancelBtn&&P.authCancelBtn.addEventListener("click",la),P.authCopyCodeBtn&&P.authCopyCodeBtn.addEventListener("click",()=>{navigator.clipboard.writeText(rl);const n=P.authCopyCodeBtn.textContent;P.authCopyCodeBtn.textContent="Done!",setTimeout(()=>{P.authCopyCodeBtn&&(P.authCopyCodeBtn.textContent=n)},2e3)}),P.authVerifyBtn&&P.authVerifyBtn.addEventListener("click",async()=>{if(!P.authLodestoneId||!P.authStatus||!P.authVerifyBtn)return;const n=P.authLodestoneId.value.trim(),e=DC(n);if(!e){P.authStatus.textContent="正しいロードストーンのIDまたはURLを入力してください。",P.authStatus.classList.add("text-error");return}P.authStatus.textContent="検証中...",P.authStatus.classList.add("text-success"),P.authVerifyBtn.disabled=!0;try{const t=await PC(e);if(t.success&&t.characterName)P.authStatus.textContent=`検証成功！ようこそ、${t.characterName}さん。`,P.authStatus.classList.add("text-success"),ti(e),ni(t.characterName),Rr(!0),setTimeout(()=>{la(),P.authVerifyBtn&&(P.authVerifyBtn.disabled=!1)},1500);else{const r=t.error||"検証に失敗しました";P.authStatus.textContent=r,P.authStatus.classList.add("text-error"),console.error("認証失敗:",r),P.authVerifyBtn.disabled=!1}}catch(t){Ae(t,"認証プロセス異常"),P.authVerifyBtn.disabled=!1}}),document.addEventListener("keydown",n=>{n.key==="Escape"&&(P.reportModal&&!P.reportModal.classList.contains("hidden")&&Ur(),P.authModal&&!P.authModal.classList.contains("hidden")&&la())})}function mC(n){const e=Math.floor(n/10)%10;return e<=2?"S":e<=5?"A":"F"}const gC={apiKey:"AIzaSyBikwjGsjL_PVFhx3Vj-OeJCocKA_hQOgU",authDomain:"the-hunt-ifrit.firebaseapp.com",projectId:"the-hunt-ifrit",storageBucket:"the-hunt-ifrit.firebasestorage.app",messagingSenderId:"285578581189",appId:"1:285578581189:web:4d9826ee3f988a7519ccac"},sl=Gd(gC),Tn=tI(sl),Dt=KA(sl);(location.hostname==="localhost"||location.hostname==="127.0.0.1")&&(self.FIREBASE_APPCHECK_DEBUG_TOKEN=!0);const _C=QS(sl,{provider:new Yc("6LeFtbYsAAAAAJETFxeUWd2IOe92slrZcYcZFHeT"),isTokenAutoRefreshEnabled:!0});async function Bm(){return new Promise(n=>{const e=Vv(Dt,t=>{t?(e(),n(t.uid)):kv(Dt).catch(r=>{console.error("Anonymous sign-in failed:",r),e(),n(null)})});setTimeout(()=>{e(),n(Dt.currentUser?Dt.currentUser.uid:null)},Te.AUTH_TIMEOUT)})}async function yC(n){try{const e=Dt.currentUser;if(!e||e.uid!==n)return null;const r=(await e.getIdTokenResult()).claims;if(r.verified===!0&&r.lid)return{lodestone_id:String(r.lid),character_name:r.cname?String(r.cname):""}}catch(e){Ae(e,"ユーザーデータ取得失敗",!1)}return null}function _o(n){let e=!1,t=0,r=null,s=null;const i=8,o=()=>{e||(s=n(()=>{t=0},c=>{if(s){try{s()}catch{}s=null}if(e)return;if(t++,t>i){Ae(c,"サーバー接続に失敗しました。ページを再読み込みしてください",!0);return}const l=(c==null?void 0:c.code)==="resource-exhausted"?6e4:1e3,h=Math.min(3e5,l*2**(t-1))*(.5+Math.random());r=setTimeout(o,h)}))};return o(),()=>{e=!0,clearTimeout(r),s&&s()}}function EC(n){const e=["s_latest","a_latest","f_latest"],t={},r=new Set,s=e.map(i=>_o((o,c)=>io(sr(Tn,"mob_status",i),l=>{o(),r.add(i);const h=l.data();h&&(t[i]=h),n(t,r.size===e.length)},c)));return()=>s.forEach(i=>i())}function TC(n){const e=sr(Tn,"shared_data","memo");return _o((t,r)=>io(e,s=>{t(),n(s.data()||{})},r))}function wC(n){const e=sr(Tn,"shared_data","maintenance");return _o((t,r)=>io(e,s=>{t(),n(s.data()||null)},s=>{n(null),r(s)}))}function IC(n){return _o((e,t)=>io(eI(Tn,"mob_locations"),r=>{e();const s={};r.forEach(i=>{s[i.id]=vC(i.data())}),n(s)},t))}function vC(n){const e={};for(const[t,r]of Object.entries(n))if(t.startsWith("points.")){const[,s,i]=t.split(".");e[s]||(e[s]={}),e[s][i]=r}else if(t==="points"&&typeof r=="object"&&r!==null)for(const[s,i]of Object.entries(r))e[s]||(e[s]={}),Object.assign(e[s],i);return e}function il(){const{isVerified:n,lodestoneId:e,userId:t,mobs:r}=G();return!n||!e||!t?null:{lodestoneId:e,userId:t,mobs:r}}const Um=async(n,e)=>{const t=il();if(!t)return{success:!1,error:"認証エラー"};const{lodestoneId:r,mobs:s}=t,i=s.find(p=>p.No===n);if(!i)return{success:!1,error:"Mobデータが見つかりません"};let o;e?(o=new Date(e),isNaN(o.getTime())&&(o=new Date(Re()))):o=new Date(Re());const c=P.modalStatus,l=P.modalForceSubmit,h=l?l.checked:!1,d=Re();if(o.getTime()>d+Te.REPORT_FUTURE_THRESHOLD)return c&&(c.textContent="現在時刻より10分以上未来の時刻は報告できません。",c.classList.add("text-error")),{success:!1,error:"現在時刻より10分以上未来の時刻は報告できません。"};if(!h&&i.last_kill_time){let p=G().maintenance;p&&p.maintenance&&(p=p.maintenance);const{minRepop:m}=Bd(i,i.last_kill_time||0,p,d/1e3),A=m*1e3-Te.REPORT_EARLY_THRESHOLD;if(o.getTime()<A){const b=new Date(A).toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"});return c&&(c.textContent=`まだ湧き時間になっていません。
最短でも ${b} 以降である必要があります。
(強制送信する場合はチェックを入れてください)`,c.classList.add("text-error","whitespace-pre-wrap")),{success:!1,error:`最短でも ${b} 以降の時刻で報告してください。`}}}Ur();try{const p=mC(i.No);let m="s_latest";p==="A"?m="a_latest":p==="F"&&(m="f_latest");const E=sr(Tn,"mob_status",m),A=i.last_kill_time||0,N=A>0?te.fromMillis(A*1e3):null,b={[n]:{last_kill_time:te.fromDate(o),prev_kill_time:N,reporter_id:r}};return await Ii(E,b,{merge:!0}),{success:!0}}catch(p){return Ae(p,"報告送信失敗"),{success:!1,error:p.message||"通信失敗",code:p.code||(p.message.includes("permission")?"permission-denied":"unknown")}}},AC=async(n,e)=>{const t=il();if(!t)return{success:!1,error:"認証エラー"};const{lodestoneId:r,mobs:s}=t;if(!s.find(c=>c.No===n))return{success:!1,error:"Mobデータエラー"};const o=e?e.replace(/[\r\n]/g,"").trim():"";if(o&&o.length>Te.MEMO_MAX_LENGTH)return{success:!1,error:"メモは30文字以内で入力してください"};try{const c=sr(Tn,"shared_data","memo");if(!o)return await Ii(c,{[n]:[]},{merge:!0}),{success:!0};const l={memo_text:o,created_at:te.fromMillis(Re()),reporter_id:r};return await Ii(c,{[n]:[l]},{merge:!0}),{success:!0}}catch(c){return Ae(c,"メモ保存失敗"),{success:!1,error:c.message||"通信または認証に失敗しました。"}}},SC=async(n,e,t,r)=>{const s=il();if(!s)return{success:!1};const{lodestoneId:i}=s;if(!e)return{success:!1};try{const o=n%10,c=sr(Tn,"mob_locations",`${e}_${o}`),d={[`points.${t}.${r?"culled_at":"uncull_at"}`]:te.fromMillis(Re()),[`points.${t}.reporter_id`]:i};return await Ii(c,d,{merge:!0}),{success:!0}}catch(o){return Ae(o,"スポーン状態更新失敗",!1),{success:!1}}},CC=Ld;async function $m(n,e={}){let t=Dt.currentUser;if(t||(await Bm(),t=Dt.currentUser),!t)throw new Error("Firebase Auth user could not be initialized.");const r={...e.headers,Authorization:`Bearer ${await t.getIdToken()}`};try{const s=await YS(_C,!1);r["X-Firebase-AppCheck"]=s.token}catch(s){console.warn("App Check token unavailable:",s)}return fetch(`${CC}${n}`,{...e,headers:r})}async function RC(){try{const n=await $m("code");if(!n.ok)return null;const e=await n.json();return typeof(e==null?void 0:e.code)=="string"?e.code:null}catch(n){return Ae(n,"認証コード取得失敗",!1),null}}const bC={invalid_id:"ロードストーンのIDが正しくありません。",unauthorized:"認証エラーが発生しました。ページを再読み込みして試してください。",forbidden:"アクセスが拒否されました。",region:"アクセスが拒否されました。日本国外からのアクセス、またはプロキシ利用は制限されています。",appcheck:"アプリの正当性を確認できませんでした。ページを再読み込みして試してください。",not_found:"キャラクターが見つかりませんでした。",code_not_found:"検証コードが自己紹介文に見つかりませんでした。保存から反映まで最大5分程度かかる場合があります。また、言語設定が日本語(JP)であることを確認してください。",rate_limited:"試行回数が多すぎます。しばらく待ってからやり直してください。",upstream:"ロードストーンに接続できませんでした。しばらくしてからやり直してください。",parse_failed:"ロードストーンのページを解析できませんでした。管理者に連絡してください。",claims_failed:"認証情報の登録に失敗しました。しばらくしてからやり直してください。",server_config:"サーバーの設定に問題があります。管理者に連絡してください。"};async function PC(n){try{const e=await $m("verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lodestoneId:n})});let t=null;try{t=await e.json()}catch{}if(e.ok&&(t!=null&&t.success)){const s=Dt.currentUser;if(!s)throw new Error("Firebase Auth user is missing.");return await s.getIdToken(!0),(await s.getIdTokenResult()).claims.verified!==!0?{success:!1,error:"認証情報の反映に失敗しました。ページを再読み込みして試してください。"}:{success:!0,characterName:t.characterName}}return{success:!1,error:bC[t==null?void 0:t.reason]||`認証に失敗しました。(${e.status})`}}catch(e){return Ae(e,"Lodestone認証失敗"),{success:!1,error:`認証に失敗しました。(${e.message||"Unknown Error"})`}}}const yo={1:"新生",2:"蒼天",3:"紅蓮",4:"漆黒",5:"暁月",6:"黄金"},H={S:"S",A:"A",F:"F",ALL:"ALL",S_RANK:"S rank",A_RANK:"A rank",FATE:"FATE",FATE_FULL:"F.A.T.E."},kC="./json/mob_data.json",NC="./json/mob_locations.json",MC="./json/maintenance.json",Te={APP_LOAD_TIMEOUT:6e3,TIER_B_UPDATE_INTERVAL:6e4,TOAST_DURATION:4e3,CLICK_THRESHOLD:1e3,DEBOUNCE_DELAY:100,BREAKPOINT_PC:1024,NOTIFICATION_OFFSET_MS:12e4,MAINTENANCE_SHOW_BEFORE_MS:6048e5,MAINTENANCE_SHOW_AFTER_MS:3456e5,MAP_ZOOM_SCALE:2,AUTH_TIMEOUT:1e4,REPORT_FUTURE_THRESHOLD:6e5,REPORT_EARLY_THRESHOLD:3e5,MEMO_MAX_LENGTH:30,FIRESTORE_LOAD_TIMEOUT:8e3},od={Maintenance:"停止",MaxOver:"超過",ConditionActive:"‼️",PopWindow:"残り",Next:{S:"次回",others:"残り"},NextCondition:"⏳",Unknown:"未定"},P={pcLeftList:document.getElementById("moblist-container"),pcRightDetail:document.getElementById("mobcard-detail"),reportModal:document.getElementById("report-modal"),reportForm:document.getElementById("report-form"),modalMobName:document.getElementById("modal-mob-name"),modalStatus:document.getElementById("modal-status"),modalTimeInput:document.getElementById("report-datetime"),modalForceSubmit:document.getElementById("report-force-submit"),authModal:document.getElementById("auth-modal"),authVCode:document.getElementById("auth-v-code"),authStatus:document.getElementById("auth-modal-status"),authLodestoneId:document.getElementById("auth-lodestone-id"),loadingOverlay:document.getElementById("loading-overlay"),appNav:document.getElementById("appnav"),manualModal:document.getElementById("manual-modal"),readmeContainer:document.getElementById("readme-container"),body:document.body,filterAccordion:document.getElementById("sidebar-filter-accordion"),appNavPanelItems:document.querySelectorAll(".appnav-panel .js-appnav-panel-item"),cardTemplate:document.getElementById("mobcard-card-template"),globalMagnifier:document.getElementById("global-magnifier"),authCopyCodeBtn:document.getElementById("auth-copy-code"),authVerifyBtn:document.getElementById("auth-verify"),closeManualModalBtn:document.getElementById("close-manual-modal"),notificationToggle:document.getElementById("appnav-notification-toggle"),notifyPopup:document.querySelector(".js-notify-popup"),volumeSlider:document.getElementById("notify-volume-slider"),cancelReportBtn:document.getElementById("cancel-report"),authCancelBtn:document.getElementById("auth-cancel")};function LC(n,e){const t=od[n]||od.Unknown;return typeof t=="object"?e==="S"?t.S:t.others:t}function Hm(n,e=null){if(!n)return e;try{return JSON.parse(n)}catch{return e}}function DC(n){if(!n)return null;const e=n.trim(),t=e.match(/character\/(\d+)/),r=t?t[1]:e.match(/^\d+$/)?e:null;return!r||r.length>20?null:r}function Ae(n,e="エラーが発生しました",t=!0){const r=n.message||String(n);console.error(`[${e}]`,n),t&&window.dispatchEvent(new CustomEvent("appNotify",{detail:{message:`${e}: ${r}`,type:"error"}}))}const L={userId:localStorage.getItem("user_uuid")||null,lodestoneId:localStorage.getItem("lodestone_id")||null,characterName:localStorage.getItem("character_name")||null,isVerified:localStorage.getItem("is_verified")==="true",mobs:[],maintenance:null,initialLoadComplete:!1,filter:(()=>{const n=localStorage.getItem("huntFilterState"),e=Hm(n,null),t=Array.from(new Set(Object.values(yo))),r=[H.S,H.A,H.F];if(!e)return{rank:H.ALL,clickStep:2,areaSets:{S:new Set(t),A:new Set(t),F:new Set(t),ALL:new Set(t)},allRankSet:new Set(r)};const s=e.clickStep!==void 0?e.clickStep:2,i=e.areaSets,c=!i||(!i.S||i.S.length===0)&&(!i.A||i.A.length===0)&&(!i.F||i.F.length===0)?{S:new Set(t),A:new Set(t),F:new Set(t),ALL:new Set(t)}:{S:new Set(Array.isArray(i==null?void 0:i.S)?i.S:t),A:new Set(Array.isArray(i==null?void 0:i.A)?i.A:t),F:new Set(Array.isArray(i==null?void 0:i.F)?i.F:t),ALL:new Set(Array.isArray(i==null?void 0:i.ALL)?i.ALL:t)},l=new Set(Array.isArray(e.allRankSet)&&e.allRankSet.length>0?e.allRankSet:r);return{rank:e.rank||H.ALL,clickStep:s,areaSets:c,allRankSet:l}})(),openMobCardNo:null,notificationEnabled:localStorage.getItem("huntNotificationEnabled")==="true",notificationVolume:parseInt(localStorage.getItem("huntNotificationVolume")??"80",10),pendingStatusMap:null,pendingMaintenanceData:null,pendingLocationsMap:null,pendingMemoData:null,_filterVersion:0,sMobMap:new Map,mobsMap:new Map,hasUnreadTelop:!1,mobLocations:{}};function G(){return L}function ad(n){L.userId=n,n?localStorage.setItem("user_uuid",n):localStorage.removeItem("user_uuid")}function ti(n){L.lodestoneId=n,n?localStorage.setItem("lodestone_id",n):localStorage.removeItem("lodestone_id")}function ni(n){L.characterName=n,n?localStorage.setItem("character_name",n):localStorage.removeItem("character_name"),window.dispatchEvent(new CustomEvent("characterNameSet"))}function Rr(n){L.isVerified=n,localStorage.setItem("is_verified",n?"true":"false")}function OC(n){L.mobs=n,L.mobsMap.clear(),n.forEach(e=>L.mobsMap.set(String(e.No),e)),VC()}function VC(){L.sMobMap.clear(),L.mobs.forEach(n=>{if(n.rank==="S"){const e=n.No%10;L.sMobMap.set(`${n.area}_${e}`,n)}})}function Mi(n){L.filter={...L.filter,...n},L._filterVersion++;const e={...L.filter,areaSets:Object.keys(L.filter.areaSets).reduce((t,r)=>{const s=L.filter.areaSets[r];return t[r]=s instanceof Set?Array.from(s):s,t},{}),allRankSet:Array.from(L.filter.allRankSet||[])};localStorage.setItem("huntFilterState",JSON.stringify(e)),window.dispatchEvent(new CustomEvent("filterChanged"))}function ts(n){L.openMobCardNo=n}function xC(n){L.notificationEnabled=n,localStorage.setItem("huntNotificationEnabled",n?"true":"false"),window.dispatchEvent(new CustomEvent("notificationSettingChanged",{detail:{enabled:n}}))}function FC(n){L.notificationVolume=Math.max(0,Math.min(100,n)),localStorage.setItem("huntNotificationVolume",String(L.notificationVolume))}const jm="huntLastSeenTelopMessage";function $r(n){const e=n||"";if(e.trim()===""){L.hasUnreadTelop=!1;return}const t=localStorage.getItem(jm)||"";L.hasUnreadTelop=e!==t}function BC(){const n=L.maintenance&&L.maintenance.message?L.maintenance.message:"";localStorage.setItem(jm,n),L.hasUnreadTelop=!1,window.dispatchEvent(new CustomEvent("maintenanceUpdated",{detail:{maintenance:L.maintenance}}))}const sn=new Map;function Li(n,e){sn.has(n)&&(clearTimeout(sn.get(n)),sn.delete(n));const t=e.nextBoundarySec;if(!t||t===1/0)return;const r=Re()/1e3,s=(t-r)*1e3;if(s<=0||s>7*24*3600*1e3)return;const i=setTimeout(()=>{sn.delete(n);const o=L.mobsMap.get(String(n));o&&qm(o,L.maintenance,{forceRecalc:!0})},s);sn.set(n,i)}function qm(n,e,t={}){try{n.repopInfo=qr(n,e,t),Li(n.No,n.repopInfo),window.dispatchEvent(new CustomEvent("mobUpdated",{detail:{mobNo:n.No,mob:n}}))}catch(r){Ae(r,`時間計算失敗 (Mob ${n.No})`,!1)}}const cd=new Map,UC=15e3;function $C(n,e){const t=n.repopInfo;if(!t||t.status==="Maintenance"||t.status==="MaxOver")return;const r=t.nextBoundarySec||t.maxRepop||0;if(!r||r>e)return;const s=Date.now();s-(cd.get(n.No)||0)<UC||(cd.set(n.No,s),qm(n,L.maintenance,{forceRecalc:!0}))}function HC(n,e){return Object.entries(n.mobs).map(([t,r])=>{const s=r.a,i=e==null?void 0:e[s],o={...r,No:parseInt(t,10),rank:r.r,name:r.n,area:s,repopSeconds:r.min,maxRepopSeconds:r.max,condition:r.cond||"",Expansion:yo[Math.floor(parseInt(t,10)/1e4)]||"Unknown",ExpansionId:Math.floor(parseInt(t,10)/1e4),mapImage:(i==null?void 0:i.mapImage)||"",locations:(i==null?void 0:i.locations)||[],last_kill_time:0,prev_kill_time:0,spawn_cull_status:{},memo_text:"",memo_updated_at:0};return delete o.r,delete o.n,delete o.a,delete o.min,delete o.max,delete o.cond,o})}async function ua(){var n;try{const e=await fetch(MC);if(!e.ok)throw new Error("Maintenance data failed to load.");const t=await e.json();return L.maintenance=t&&t.maintenance?t.maintenance:t,$r((n=L.maintenance)==null?void 0:n.message),L.maintenance}catch(e){return Ae(e,"メンテ情報読み込み失敗",!1),null}}async function jC(){try{const[n,e]=await Promise.all([fetch(kC),fetch(NC).catch(()=>null)]);if(!n.ok)throw new Error("Mob data failed to load.");const t=await n.json();let r=null;e&&e.ok?r=await e.json():Ae(new Error("Location data failed to load."),"位置データ読み込み失敗",!1);const s=HC(t,r);OC(s),r&&window.dispatchEvent(new CustomEvent("locationDataReady")),L.mobs.length>0&&qC()}catch(n){Ae(n,"基礎データ読み込み失敗"),console.error("データの読み込みに失敗しました。"),window.dispatchEvent(new CustomEvent("criticalDataLoadError",{detail:{message:`基礎データの読み込みに失敗しました。
アプリをファイルから直接開いている場合は、VS CodeのLive Serverなどを使って開いてください。`}}))}}const Ie={status:!1,location:!1,memo:!1,maintenance:!1};let za=!1,Ka=!1,jn=null,Sn=[];function qC(){const n=L.mobs;if(za&&(L.pendingMaintenanceData&&(L.maintenance=L.pendingMaintenanceData,$r(L.pendingMaintenanceData.message)),Ie.maintenance=!0,za=!1),L.pendingStatusMap){const e=new Map;Object.values(L.pendingStatusMap).forEach(t=>{Object.entries(t).forEach(([r,s])=>{var o,c;const i=parseInt(r,10);e.set(i,{last_kill_time:((o=s.last_kill_time)==null?void 0:o.seconds)||0,prev_kill_time:((c=s.prev_kill_time)==null?void 0:c.seconds)||0})})}),n.forEach(t=>{const r=e.get(t.No);r&&(t.last_kill_time=r.last_kill_time,t.prev_kill_time=r.prev_kill_time)}),Ka&&(Ie.status=!0,Ka=!1),L.pendingStatusMap=null}if(L.pendingLocationsMap&&(L.mobLocations=L.pendingLocationsMap,n.forEach(e=>{const t=e.No%10,r=`${e.area}_${t}`,s=L.pendingLocationsMap[r];e.spawn_cull_status=s||{}}),Ie.location=!0,L.pendingLocationsMap=null),L.pendingMemoData){const e=L.pendingMemoData;n.forEach(t=>{var i;const s=(e[t.No]||[])[0];s?(t.memo_text=s.memo_text,t.memo_updated_at=((i=s.created_at)==null?void 0:i.seconds)||0):t.memo_text=""}),Ie.memo=!0,L.pendingMemoData=null}Nn()}function Nn(){if(!(L.mobs.length===0||L.initialLoadComplete)&&Ie.status&&Ie.maintenance){L.initialLoadComplete=!0,jn&&(clearTimeout(jn),jn=null);const n=L.mobs,e=L.maintenance;n.forEach(t=>{t.repopInfo=qr(t,e),Li(t.No,t.repopInfo)}),window.dispatchEvent(new CustomEvent("initialDataLoaded"))}}const ld=new Map;function WC(n){var t,r;let e="";for(const s in n){const i=n[s];e+=`${s}:${((t=i==null?void 0:i.culled_at)==null?void 0:t.seconds)||0},${((r=i==null?void 0:i.uncull_at)==null?void 0:r.seconds)||0},${(i==null?void 0:i.reporter_id)||""};`}return e}function Wm(n={}){const{resume:e=!1}=n;Sn.forEach(o=>o&&o()),Sn=[],e||(sn.forEach(o=>clearTimeout(o)),sn.clear(),L.initialLoadComplete=!1,Ie.status=!1,Ie.location=!1,Ie.memo=!1,Ie.maintenance=!1,jn&&clearTimeout(jn),jn=setTimeout(()=>{L.initialLoadComplete||(console.warn("Firestore initial load timed out. Forcing completion with available data."),Ie.status||(Ie.status=!0),Ie.maintenance||(Ie.maintenance=!0,L.maintenance||ua().then(o=>{o&&(L.maintenance=o)})),Nn())},Te.FIRESTORE_LOAD_TIMEOUT));const t=EC((o,c)=>{if(L.mobs.length===0){L.pendingStatusMap=o,Ka=c;return}const l=L.mobsMap;let h=!1;const d=new Set;Object.values(o).forEach(p=>{Object.entries(p).forEach(([m,E])=>{var O,x;const A=l.get(m);if(!A)return;const N=((O=E.last_kill_time)==null?void 0:O.seconds)||0,b=((x=E.prev_kill_time)==null?void 0:x.seconds)||0;(A.last_kill_time!==N||A.prev_kill_time!==b)&&(A.last_kill_time=N,A.prev_kill_time=b,L.initialLoadComplete&&(A.repopInfo=qr(A,L.maintenance,{forceRecalc:!0}),Li(A.No,A.repopInfo)),h=!0,d.add(parseInt(m,10)))})}),L.initialLoadComplete||c&&(Ie.status=!0,Nn()),h&&L.initialLoadComplete&&(window.dispatchEvent(new CustomEvent("mobsBatchUpdated",{detail:{mobNos:Array.from(d),updateType:"status"}})),window.dispatchEvent(new CustomEvent("mobsUpdated")))});Sn.push(t);const r=IC(o=>{if(L.mobs.length===0){L.pendingLocationsMap=o;return}L.mobLocations=o;const c=[],l=new Set;for(const d of Object.keys(o)){const p=WC(o[d]);ld.get(d)!==p&&(ld.set(d,p),l.add(d))}const h=new Set(Object.keys(o).map(d=>d.split("_")[0]));L.mobs.forEach(d=>{if(h.has(d.area)){const p=d.No%10,m=`${d.area}_${p}`,E=o[m];E&&(d.spawn_cull_status=E,L.initialLoadComplete&&l.has(m)&&c.push(d.No))}}),L.initialLoadComplete?l.size>0&&(c.length>0&&window.dispatchEvent(new CustomEvent("mobsBatchUpdated",{detail:{mobNos:c,updateType:"location"}})),window.dispatchEvent(new CustomEvent("locationsUpdated",{detail:{locationsMap:o}}))):(Ie.location=!0,Nn())});Sn.push(r);const s=TC(o=>{if(L.mobs.length===0){L.pendingMemoData=o;return}const c=Object.keys(o),l=[];c.forEach(h=>{var N;const d=L.mobsMap.get(h);if(!d)return;const p=parseInt(h,10),E=(o[h]||[])[0],A=d.memo_text;E?(d.memo_text=E.memo_text,d.memo_updated_at=((N=E.created_at)==null?void 0:N.seconds)||0):(d.memo_text="",d.memo_updated_at=0),L.initialLoadComplete&&A!==d.memo_text&&l.push(p)}),L.initialLoadComplete?(l.length>0&&window.dispatchEvent(new CustomEvent("mobsBatchUpdated",{detail:{mobNos:l,updateType:"memo"}})),window.dispatchEvent(new CustomEvent("mobsUpdated"))):(Ie.memo=!0,Nn())});Sn.push(s);const i=wC(async o=>{const c=o&&o.maintenance?o.maintenance:o;if(L.mobs.length===0){if(za=!0,L.pendingMaintenanceData=c,!c){const l=await ua();l&&(L.pendingMaintenanceData=l)}return}if(L.initialLoadComplete){if(!c)return;L.maintenance=c,$r(c.message),L.mobs.forEach(h=>{h.repopInfo=qr(h,c),Li(h.No,h.repopInfo)}),window.dispatchEvent(new CustomEvent("filterChanged")),window.dispatchEvent(new CustomEvent("mobsUpdated")),window.dispatchEvent(new CustomEvent("maintenanceUpdated"))}else{if(c)L.maintenance=c,$r(c.message);else{const l=await ua();l&&(L.maintenance=l,$r(l.message))}Ie.maintenance=!0,Nn()}});Sn.push(i)}function ol(n,e,t=null){var N,b,O;const r=G();if(t||(t=r.mobsMap.get(String(e))||null),!t)return!1;const s=t.No%10,i=r.sMobMap.get(`${t.area}_${s}`),o=i?i.last_kill_time||0:t.last_kill_time||0,c=(N=r.maintenance)!=null&&N.serverUp?new Date(r.maintenance.serverUp).getTime():0,l=n!=null&&n.culled_at&&typeof n.culled_at.toMillis=="function"?n.culled_at.toMillis():(b=n==null?void 0:n.culled_at)!=null&&b.seconds?(n==null?void 0:n.culled_at).seconds*1e3:0,h=n!=null&&n.uncull_at&&typeof n.uncull_at.toMillis=="function"?n.uncull_at.toMillis():(O=n==null?void 0:n.uncull_at)!=null&&O.seconds?(n==null?void 0:n.uncull_at).seconds*1e3:0,d=typeof o=="number"?o*1e3:0,p=l>c?l:0,m=h>c?h:0;if(p===0&&m===0)return!1;const E=p>d,A=m>d;return E&&(!A||p>=m)?!0:(A&&(!E||m>=p),!1)}const zC=10*60*1e3;let Bs=0;document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){Bs=Date.now();return}if(!Bs)return;const n=Date.now()-Bs;Bs=0,!(n<zC)&&L.mobs.length!==0&&Wm({resume:!0})});const KC=`<!-- markdownlint-disable MD041 -->\r
本サイトは『FINAL FANTASY XIV』のコンテンツ「モブハント」の報告・情報共有を行うためのツールです。\r
ユーザー間でのリアルタイムな情報共有により、効率的な探索を支援することを目的としています。\r
\r
---\r
\r
## 💮 キャラクター連携の必要性\r
\r
本サイトでは、不適切な投稿を抑制し、情報の信頼性を担保するために「**Lodestone認証**」を必須としています。\r
\r
- **情報の信頼性**: 報告者の識別を可能にすることで、データの正確性を維持します。\r
- **コミュニティの保護**: 悪意のあるユーザーによるデータの改ざんや荒らし行為を防止します。\r
\r
※連携手順は、「**ユーザー認証フォーム**」の案内に従ってください。\r
※討伐報告やマップ座標報告をする初回に認証フォームが表示されます。1度認証を行えば、次回から表示されません。\r
※サーバーで管理されているのは、キャラクターID（LodestoneのURL末尾の数字）のみです。**キャラクター名やパスワードなどは管理していません。**\r
\r
---\r
\r
## 🧭 アプリナビ：主要機能と通知\r
\r
画面のアイコンより、各パネルの表示・操作が可能です。\r
\r
- **📊(RANK)**  \r
  モブのランク（S/A/F）や拡張パッケージ別のフィルタリングを行います。  \r
  1度目でランク間を切り替え、同ランクボタンを2度押すと拡張ボタンが表示されます。再度押すとボタンを閉じます。  \r
  初期状態はすべてのモブが「**ON**」になっています。不要なものはOFFにしてください。\r
- **📢(告知)**  \r
  管理者からのお知らせを表示します。\r
- **🛠️(メンテ)**  \r
  FF14内のサーバーメンテナンス予定日時をお知らせします。\r
- **⚠️(エラー)**  \r
  システムエラーの詳細を確認できます。\r
- **🔔(通知)**  \r
  音声通知やブラウザ通知の有効・無効を切り替えます。\r
\r
  - **タイミング**: 出現条件合致の「2分前」および「開始直後」。\r
  - **環境**: パソコン（デスクトップ通知）、スマホ（ブラウザ起動中のリンクシェル音）。\r
\r
---\r
\r
## 📑 モブリスト：各表記と進行度\r
\r
各項目には、現在の出現状況を示す各種情報が表示されます。\r
\r
- **時間とステータス表示**\r
  - **Cooldown**: 最短POP時刻までの残り時間\r
  - **Open**: POP最大時間までの残り時間\r
  - **Over**: POP最大時間を経過してからの超過時間\r
  - **経過％**: リポップの進行度\r
- **特殊な出現条件のSモブ**  \r
  - **🔜 (次回まで)**: 次回の出現条件(天候・月齢・ETなど)を満たすまでの残り時間。\r
  - **‼️ (条件合致中)**: 出現条件を満たし**現在、出現する可能性がある状態**で、その残り時間です（行が白光・ハイライトされます）。\r
- **REPORTボタン (⚔)**  \r
  討伐報告用ボタン。認証済みユーザーのみ操作可能。\r
- **プログレスバー(%)**  \r
  最短時刻を経過するとバーが進行し、最大時刻に向かってゲージが伸びていきます。\r
- **座標番号**  \r
  未確認の候補地の残数が「@3」のようにカウントされます。  \r
  残り1箇所に特定されると「📍14」のように確定した地点番号が表示されます。\r
\r
---\r
\r
## 🪪 モブカード：情報の補足と座標埋め\r
\r
モブリストを選択した際に表示される詳細パネル（モブカード）の機能です。\r
\r
- **共有メモ (memo)**  \r
  モブごとに最大30文字の投稿ができ、全ユーザーに即時同期されます。\r
- **出現候補地の調査（座標埋め）**  \r
  Sモブの出現候補地を調査した結果を記録・共有できます。  \r
  **操作方法**  \r
  - **パソコン**: マップ上のスポーン地点を**左クリック1回**でチェック切り替え（**右クリック**で拡大鏡が使えます）。  \r
  - **スマホ**: スポーン地点を**1秒以内に素早く2回タップ(ダブルタップ)で**チェック切り替え。  \r
  ※パソコン（マウスホバー）やスマホ（1タップ）で地点番号と状態を確認できます。  \r
  　自分が埋めた記録は **(自分済)**、他ユーザーの記録は **(済)**、残り1箇所で確定した地点は **(確)** として表示されます。  \r
  　※サーバーに登録された情報をもとにしているため、他ユーザーの操作により上書きされることがあります。\r
\r
---\r
\r
## 🕒 討伐報告のルールと仕様\r
\r
REPORT(⚔)から行える報告機能の仕様です。サーバータイム同期により、端末の時計のズレに関わらず正確な時刻で管理されます。\r
\r
[**報告の方法**]  \r
\r
- **Aランク**  \r
  サーバー現在時刻で**即時報告**されます。\r
- **S/Fランク**  \r
  報告フォームが開きます。正確な討伐時刻を入力してください（初期値はサーバー現在時刻）。  \r
  \r
[**報告の制限と修正**]  \r
\r
- **時間の整合性**  \r
  最短日時より**5分以上早い**、または現在時刻より**10分以上未来の**時刻は通常報告できません。\r
- **修正**  \r
  誤った報告を修正する場合は、報告フォームを開き、正しい日時を入力して「**修正する**」に**チェック**を入れて送信してください。\r
\r
---\r
\r
最終更新: 2026-11-16\r
`;let ud=!1;const hd=async()=>{const n=P.manualModal,e=P.readmeContainer;if(!(!n||!e)&&(n.classList.remove("hidden"),n.classList.add("flex"),document.body.classList.add("overflow-hidden"),!ud))try{const t=KC;if(typeof marked<"u"&&typeof DOMPurify<"u"){marked.setOptions({breaks:!0,gfm:!0});const r=marked.parse(t);e.innerHTML=DOMPurify.sanitize(r)}else e.textContent=t;ud=!0}catch(t){console.error(t);const r=Yt("ui-message-template");r&&(r.className="u-text-red-400 u-text-center",r.textContent="マニュアルの読み込みに失敗しました。",e.innerHTML="",e.appendChild(r))}},Di=()=>{const n=document.getElementById("manual-modal");n&&(n.classList.add("hidden"),n.classList.remove("flex"),document.body.classList.remove("overflow-hidden"))};document.addEventListener("DOMContentLoaded",()=>{const n=P.manualModal,e=P.closeManualModalBtn,t=()=>{Di(),document.querySelector(".appnav-btn[data-nav-id='manual'].appnav-active")&&pt("home")};e==null||e.addEventListener("click",t),n==null||n.addEventListener("click",r=>{const s=r.target;(s===n||s.classList.contains("app-backdrop"))&&t()}),document.addEventListener("keydown",r=>{r.key==="Escape"&&n&&!n.classList.contains("hidden")&&t()})});const GC="./sound/01 FFXIV_Linkshell_Transmission.mp3";let je=null,Ga=null,Oi=!1;const lt=new Set;let ct=null;window.errorLog=window.errorLog||[];const ha=50,al=new Set(["telop","maintenance","error"]),Qt=window.matchMedia("(min-width: 900px)");let Ze=null,dd=!1,Fe=!1;function Eo(){var n;return document.getElementById("appnav-panel")||((n=P.appNav)==null?void 0:n.querySelector(".appnav-panel"))}function To(){return document.getElementById("appnav-rank-panel")}function fd(n,e){if(!n||n.dataset.chromeAttached==="1")return;n.dataset.chromeAttached="1",["tl","tr","bl","br"].forEach(r=>{const s=document.createElement("i");s.className=`ff-corner ${r}`,n.appendChild(s)});const t=document.createElement("button");t.type="button",t.className="appnav-popup-close",t.setAttribute("aria-label","閉じる"),t.textContent="✕",t.addEventListener("click",e),n.appendChild(t)}function zm(n){const e=n.getBoundingClientRect();return{x:Math.round((window.innerWidth-e.width)/2),y:Math.round(window.innerHeight-e.height-58)}}function Qa(n,e,t){const r=t.getBoundingClientRect(),s=8,i=Math.max(s,window.innerWidth-r.width-s),o=Math.max(s,window.innerHeight-r.height-s);return{x:Math.min(Math.max(s,Math.round(n)),i),y:Math.min(Math.max(s,Math.round(e)),o)}}function Vi(n){if(!n.classList.contains("is-floating"))return;const t=ul().rankWindowPos,r=t&&typeof t.x=="number"&&typeof t.y=="number"?t:zm(n),s=Qa(r.x,r.y,n);n.style.left=`${s.x}px`,n.style.top=`${s.y}px`}function cl(){var s,i;const n=To();if(!n)return;const e=Fe&&Qt.matches,t=Fe&&!Qt.matches;n.classList.toggle("expanded",Fe),n.classList.toggle("is-floating",e),n.classList.toggle("is-docked",t),e?(Vi(n),requestAnimationFrame(()=>Vi(n))):(n.style.left="",n.style.top="");const r=document.getElementById("sidebar-panel-rank");r==null||r.classList.toggle("hidden",!Fe),Fe&&wo(),t?((s=P.appNav)==null||s.classList.add("expanded"),P.body.classList.add("sidebar-expanded")):(!ct||al.has(ct))&&((i=P.appNav)==null||i.classList.remove("expanded"),P.body.classList.remove("sidebar-expanded"))}function Km(){Fe=!0,Xt("rankOpen",!0),cl(),pt(ct||"home")}function xi(){Fe=!1,Xt("rankOpen",!1),cl(),pt(ct||"home")}function QC(){if(dd)return;const n=To(),e=document.querySelector("#sidebar-panel-rank .appnav-section-header");!n||!e||(dd=!0,e.addEventListener("pointerdown",t=>{if(t.button!==0||!n.classList.contains("is-floating")||t.target.closest(".appnav-popup-close"))return;t.preventDefault();const r=n.getBoundingClientRect(),s=t.clientX-r.left,i=t.clientY-r.top;n.classList.add("is-dragging");const o=l=>{const h=Qa(l.clientX-s,l.clientY-i,n);n.style.left=`${h.x}px`,n.style.top=`${h.y}px`},c=()=>{window.removeEventListener("pointermove",o),window.removeEventListener("pointerup",c),window.removeEventListener("pointercancel",c),n.classList.remove("is-dragging");const l=parseFloat(n.style.left),h=parseFloat(n.style.top);!Number.isNaN(l)&&!Number.isNaN(h)&&Xt("rankWindowPos",{x:l,y:h})};window.addEventListener("pointermove",o),window.addEventListener("pointerup",c),window.addEventListener("pointercancel",c)}),e.addEventListener("dblclick",()=>{if(!n.classList.contains("is-floating"))return;Xt("rankWindowPos",null);const t=zm(n),r=Qa(t.x,t.y,n);n.style.left=`${r.x}px`,n.style.top=`${r.y}px`}),Qt.addEventListener("change",()=>{Fe&&(!Qt.matches&&ct&&Ge(),cl())}),window.addEventListener("resize",()=>{n.classList.contains("is-floating")&&Vi(n)}))}function XC(){const n=Eo(),e=To();!n||Ze||(Ze=document.createElement("div"),Ze.className="appnav-backdrop",Ze.addEventListener("click",Ge),Ze.addEventListener("wheel",t=>t.preventDefault(),{passive:!1}),document.body.appendChild(Ze),fd(n,Ge),fd(e,xi),document.addEventListener("keydown",t=>{t.key==="Escape"&&ct&&al.has(ct)&&Ge()}))}function Gm(n){const e=P.appNav,t=Eo(),r=!!n&&al.has(n);t==null||t.classList.toggle("is-popup",r),t==null||t.classList.toggle("is-docked",!!n&&!r),t&&(r?(t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true")):(t.removeAttribute("role"),t.removeAttribute("aria-modal"))),Ze==null||Ze.classList.toggle("is-open",r),r&&P.body.classList.remove("sidebar-expanded"),Array.from(document.body.children).forEach(s=>{s===Ze||s.tagName==="SCRIPT"||e&&s.contains(e)||s.toggleAttribute("inert",r)})}let un=null;async function YC(){try{je=new AudioContext,un=je.createGain(),un.gain.value=G().notificationVolume/100,un.connect(je.destination);const e=await(await fetch(GC)).arrayBuffer();Ga=await je.decodeAudioData(e)}catch(n){Ae(n,"通知音の読み込み失敗",!1)}}function pd(){return je&&je.state==="suspended"?je.resume().then(()=>{Oi=je.state==="running"}).catch(n=>{Ae(n,"音声の有効化失敗",!1)}):(Oi=!0,Promise.resolve())}function md(){var n;(n=P.notifyPopup)==null||n.classList.add("is-open")}function Dn(){var n;(n=P.notifyPopup)==null||n.classList.remove("is-open")}function JC(){YC();const n=P.notificationToggle;if(!n)return;const e=P.notifyPopup,t=P.volumeSlider,r=G().notificationEnabled;n.checked=r;const s=n.closest(".appnav-btn");s&&s.classList.toggle("is-disabled",!r);const i=G().notificationVolume;if(t){t.value=String(i);const m=e==null?void 0:e.querySelector(".js-volume-value");m&&(m.textContent=String(i))}const o=()=>{pd().then(()=>{Oi&&(document.removeEventListener("click",o),document.removeEventListener("touchend",o))})};document.addEventListener("click",o),document.addEventListener("touchend",o),window.addEventListener("notificationSettingChanged",m=>{const E=m.detail;E&&typeof E.enabled=="boolean"&&(n.checked=E.enabled,s&&s.classList.toggle("is-disabled",!E.enabled))}),n.addEventListener("change",()=>{const m=n.checked;if(s&&s.classList.toggle("is-disabled",!m),xC(m),m){ZC();const E=pd();md(),E.then(()=>Xa())}else Dn()});let c=null,l=!1;const h=()=>{l=!1,c=setTimeout(()=>{l=!0,G().notificationEnabled&&(e!=null&&e.classList.contains("is-open")?Dn():md())},500)},d=()=>{c&&(clearTimeout(c),c=null)};s==null||s.addEventListener("touchstart",h,{passive:!0}),s==null||s.addEventListener("touchend",d),s==null||s.addEventListener("touchmove",d),s==null||s.addEventListener("mousedown",h),s==null||s.addEventListener("mouseup",d),s==null||s.addEventListener("mouseleave",d),s==null||s.addEventListener("click",m=>{if(e!=null&&e.classList.contains("is-open")&&G().notificationEnabled){m.preventDefault(),m.stopPropagation(),l=!1;return}l&&(m.preventDefault(),m.stopPropagation(),l=!1)}),t==null||t.addEventListener("input",()=>{const m=parseInt(t.value,10),E=e==null?void 0:e.querySelector(".js-volume-value");E&&(E.textContent=String(m)),FC(m),un&&(un.gain.value=m/100)}),t==null||t.addEventListener("change",()=>{Xa()});const p=m=>{if(!(e!=null&&e.classList.contains("is-open")))return;const E=m.target;E&&(e.contains(E)||s&&s.contains(E)||Dn())};document.addEventListener("pointerdown",p,!0),document.addEventListener("touchstart",p,!0),document.addEventListener("click",p,!0),window.addEventListener("scroll",()=>{e!=null&&e.classList.contains("is-open")&&Dn()},{passive:!0})}async function ZC(){"Notification"in window&&Notification.permission!=="granted"&&Notification.permission!=="denied"&&await Notification.requestPermission()}function Xa(){if(!je||!Ga||!un||!Oi)return;const n=()=>{const e=je.createBufferSource();e.buffer=Ga,e.connect(un),e.start(0)};je.state==="suspended"?je.resume().then(n).catch(e=>{Ae(e,"通知音の再生失敗",!1)}):n()}async function eR(n,e){if(!G().notificationEnabled||!("Notification"in window)||Notification.permission!=="granted")return;const t={body:e,icon:"./icon/The_Hunt.png"};try{"serviceWorker"in navigator&&navigator.serviceWorker.controller?await(await navigator.serviceWorker.ready).showNotification(n,t):new Notification(n,t)}catch(r){Ae(r,"システム通知の表示失敗",!1)}}const da=new Map,tR=10*60*1e3,nR=30;function gd(n,e,t){if(t>tR||da.has(e)||lt.has(e))return;const r=setTimeout(()=>{da.delete(e);const s=G().mobsMap.get(String(n));s&&Fi(s)},t+nR);da.set(e,r)}function _d(n,e){const t=e==="before"?"まもなく（2分前）":"時間なう！";window.innerWidth>=1024?eR(`【POP info】 ${n.name}`,t):Xa()}function Fi(n){if(!G().notificationEnabled)return;const t=n.repopInfo;if(!t||!t.nextConditionSpawnDate||!t.conditionWindowEnd)return;const r=Re(),s=t.nextConditionSpawnDate.getTime(),i=t.conditionWindowEnd.getTime(),o=s-Te.NOTIFICATION_OFFSET_MS,c=`${n.No}-${s}`,l=`${c}-before`,h=`${c}-at`;r>=o&&r<s&&!lt.has(l)&&(_d(n,"before"),lt.add(l)),r>=s&&r<=i&&!lt.has(h)&&(_d(n,"at"),lt.add(h)),r>i&&(lt.has(l)&&lt.delete(l),lt.has(h)&&lt.delete(h)),r<o&&gd(n.No,l,o-r),r<s&&gd(n.No,h,s-r)}function ll(n){return n===H.S_RANK||n===H.S?H.S:n===H.A_RANK||n===H.A?H.A:n===H.FATE||n===H.FATE_FULL||n===H.F?H.F:n}const rR=()=>Array.from(new Set(Object.values(yo))),Ya=(n=null)=>{const e=G(),t=ll(e.filter.rank);let r=[],s=new Set;e.filter.rank===H.ALL?(r=[H.S,H.A,H.F],s=e.filter.allRankSet instanceof Set?e.filter.allRankSet:new Set):(r=Object.entries(yo).sort((c,l)=>Number(l[0])-Number(c[0])).map(c=>c[1]),s=e.filter.areaSets[t]instanceof Set?e.filter.areaSets[t]:new Set);const i=n||document.querySelector("#sidebar-panel-rank .area-grid-container");i&&(i.innerHTML="",r.forEach(o=>{const c=s.has(o),l=document.createElement("button");l.type="button",l.className=`area-filter-btn ${c?"is-selected":""}`,l.textContent=e.filter.rank===H.FATE&&o===H.F?"FATE":e.filter.rank===H.ALL?o===H.F?"FATE":`${o} rank`:o,l.dataset.value=o,i.appendChild(l)}),Ja())},sR=n=>{if(!n)return;const e=G();if(e.filter.rank===n){const r=e.filter.clickStep===2?1:2;Mi({clickStep:r})}else Mi({rank:n,clickStep:1,areaSets:e.filter.areaSets});Jn()};function iR(n){const t=n.target.closest(".area-filter-btn");if(!t)return;const r=t.closest(".area-grid-container"),s=G(),i=s.filter.rank;if(i==="ALL"){const d=s.filter.allRankSet instanceof Set?s.filter.allRankSet:new Set,p=new Set(d),m=t.dataset.value;m&&(p.has(m)?p.delete(m):p.add(m)),Mi({rank:i,allRankSet:p}),Jn(),Ya(r);return}const o=ll(i),c=s.filter.areaSets[o]instanceof Set?s.filter.areaSets[o]:new Set,l={...s.filter.areaSets},h=t.dataset.value||t.dataset.area;if(h){const d=h,p=new Set(c);p.has(d)?p.delete(d):p.add(d),l[o]=p}Mi({rank:i,areaSets:l}),Jn(),Ya(r)}function oR(n){const e=G().filter,t=e.rank,r=e.areaSets,s=e.allRankSet,i=rR().length,o=c=>c===H.S||c===H.A?c:c===H.F?H.F:c.startsWith("B")?H.A:null;return n.filter(c=>{const l=c.rank,h=c.Expansion,d=o(l);if(!d||!h)return!1;const p=d;if(t==="ALL"){if(p!=="S"&&p!=="A"&&p!=="F"||s&&s.size<3&&!s.has(p))return!1;const m=(r==null?void 0:r[p])instanceof Set?r[p]:new Set;return m.size===0?!1:m.size===i?!0:m.has(h)}else{const m=ll(t);if(!(m==="S"&&l==="S"||m==="A"&&(l==="A"||l.startsWith("B"))||m==="F"&&l==="F"))return!1;const A=(r==null?void 0:r[p])instanceof Set?r[p]:new Set;return A.size===0?!1:A.size===i?!0:A.has(h)}})}function ul(){return Hm(localStorage.getItem("sidebarState"),{})}function Xt(n,e){const t=ul();t[n]=e,localStorage.setItem("sidebarState",JSON.stringify(t))}function aR(){const n=P.appNav;if(!n)return;hR(),XC(),QC();const e=ul(),t=e.rankOpen===!0||e.panel==="rank";e.panel==="rank"&&(Xt("panel",null),Xt("rankOpen",!0)),t?Km():pt("home"),JC(),n.addEventListener("click",r=>{const i=r.target.closest(".appnav-rank-tab, .appnav-rank-header");i&&(r.preventDefault(),r.stopPropagation(),sR(i.dataset.rank||""))}),Fe||wo()}function pt(n){document.querySelectorAll(".appnav-btn[data-nav-id]").forEach(e=>{const t=e,r=t.dataset.navId,s=r===n||r==="rank"&&Fe;t.classList.toggle("appnav-active",s)})}async function cR(n){if(Dn(),n==="rank"){const t=Fe;Qt.matches||Ge(),t?xi():Km();return}if(!Qt.matches&&Fe&&xi(),n==="manual"){const t=P.manualModal;t&&!t.classList.contains("hidden")?(Di(),pt("home")):(Ge(),typeof hd=="function"&&await hd(),pt("manual"));return}Di();const e=P.appNav;if(e){if(ct===n){Ge();return}e.classList.add("expanded"),document.body.classList.add("sidebar-expanded"),lR(n),ct=n,n==="telop"&&BC(),pt(n),Xt("panel",n)}}function Ge(){Dn(),Di(),!Qt.matches&&Fe&&xi();const n=P.appNav;if(!n)return;(!Fe||Qt.matches)&&(n.classList.remove("expanded"),P.body.classList.remove("sidebar-expanded")),Gm(null);const e=Eo();e&&(e.classList.remove("expanded"),e.querySelectorAll(".js-appnav-panel-item").forEach(t=>t.classList.add("hidden"))),ct=null,pt("home"),Xt("panel",null)}function lR(n){if(!P.appNav)return;const t=Eo();t==null||t.querySelectorAll(".js-appnav-panel-item").forEach(s=>s.classList.add("hidden"));const r=document.getElementById(`sidebar-panel-${n}`);r&&(r.classList.remove("hidden"),uR(n)),Gm(n),t&&t.classList.add("expanded")}function uR(n){n==="rank"?wo():n==="error"?Hr():(n==="telop"||n==="maintenance")&&typeof window.renderMaintenanceStatus=="function"&&window.renderMaintenanceStatus()}function hR(){const n=console.error;console.error=(...e)=>{n.apply(console,e);const t=e.map(s=>typeof s=="object"?JSON.stringify(s,null,2):String(s)).join(" "),r=new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit",second:"2-digit"});window.errorLog.unshift({time:r,msg:t}),window.errorLog.length>ha&&window.errorLog.pop(),Hr(),fa()},window.addEventListener("error",e=>{const t=new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit",second:"2-digit"});window.errorLog.unshift({time:t,msg:e.message||"Unknown error"}),window.errorLog.length>ha&&window.errorLog.pop(),Hr(),fa()}),window.addEventListener("unhandledrejection",e=>{const t=new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit",second:"2-digit"});window.errorLog.unshift({time:t,msg:String(e.reason)}),window.errorLog.length>ha&&window.errorLog.pop(),Hr(),fa()})}function Hr(){const n=document.querySelectorAll(".js-error-content");if(n.length===0)return;const e=document.createDocumentFragment();if(!window.errorLog||window.errorLog.length===0){const t=document.createElement("div");t.className="text-center u-text-sm text-gray-500 mt-10",t.textContent="現在エラーはありません",e.appendChild(t)}else window.errorLog.forEach(t=>{const r=Yt("appnav-error-item-template");if(r){const s=r.querySelector(".appnav-error-time"),i=r.querySelector(".error-msg");s&&(s.textContent=t.time),i&&(i.textContent=t.msg),e.appendChild(r)}});n.forEach(t=>{t&&(t.innerHTML="",t.appendChild(e.cloneNode(!0)))})}function fa(){typeof window.renderMaintenanceStatus=="function"&&window.renderMaintenanceStatus()}function Ja(){const n=document.querySelector("#sidebar-panel-rank .appnav-area-carousel");if(!n)return;const e=document.querySelector("#sidebar-panel-rank .carousel-arrow-prev"),t=document.querySelector("#sidebar-panel-rank .carousel-arrow-next");if(!e||!t)return;const r=n.scrollLeft>2,s=n.scrollLeft+n.clientWidth<n.scrollWidth-2;n.scrollWidth>n.clientWidth+4?(e.classList.toggle("hidden",!r),t.classList.toggle("hidden",!s)):(e.classList.add("hidden"),t.classList.add("hidden"))}function wo(){const n=P.filterAccordion;if(!n)return;const e=G(),t=e.filter.rank||H.ALL;let r=n.querySelector(".appnav-filter-wrapper");if(!r){const p=Yt("rank-filter-panel-template");p&&(n.innerHTML="",n.appendChild(p),r=n.querySelector(".appnav-filter-wrapper"))}if(!r)return;r.querySelectorAll(".appnav-rank-tab").forEach(p=>{const E=p.dataset.rank===t;p.classList.toggle("is-active",E)});const i=e.filter.clickStep===2,o=r.querySelector(".appnav-area-carousel-wrapper");o&&o.classList.toggle("hidden",!i);const c=r.querySelector(".area-grid-container");c&&i&&Ya(c);const l=r.querySelector(".appnav-area-carousel");l&&!l._hasScrollBound&&(l._hasScrollBound=!0,l.addEventListener("scroll",()=>{Ja()},{passive:!0}));const h=r.querySelector(".carousel-arrow-prev");h&&!h._hasClickBound&&(h._hasClickBound=!0,h.addEventListener("click",p=>{p.stopPropagation(),l&&l.scrollBy({left:-l.clientWidth*.8,behavior:"smooth"})}));const d=r.querySelector(".carousel-arrow-next");d&&!d._hasClickBound&&(d._hasClickBound=!0,d.addEventListener("click",p=>{p.stopPropagation(),l&&l.scrollBy({left:l.clientWidth*.8,behavior:"smooth"})})),requestAnimationFrame(()=>{Ja();const p=To();p!=null&&p.classList.contains("is-floating")&&Vi(p)})}window.addEventListener("filterChanged",()=>{wo()});const pa=new Map;function br(n){const e=n.repopInfo||{isMaintenanceStop:!1,isBlockedByMaintenance:!1,status:"Unknown"};return e.isMaintenanceStop||e.isBlockedByMaintenance?"MAINTENANCE":e.status==="MaxOver"?"MAX_OVER":e.status==="PopWindow"||e.status==="ConditionActive"||e.status==="NextCondition"?"WINDOW":"NEXT"}const dR={MAX_OVER:"Over",WINDOW:"Open",NEXT:"Cooldown",MAINTENANCE:"Maintenance"};let Za=-1,ec=null,Pr=null,On=null,ns=!1;const tc=new Map;function Qm(n){const e=n.repopInfo;return[(e==null?void 0:e.status)??"Unknown",!!(e!=null&&e.isMaintenanceStop),!!(e!=null&&e.isBlockedByMaintenance),!!(e!=null&&e.isInConditionWindow),Math.floor((e==null?void 0:e.elapsedPercent)||0),(e==null?void 0:e.minRepop)||0,(e==null?void 0:e.maxRepop)||0,n.rank,n.ExpansionId??"",n.No].join("|")}function Bi(n){const e=Qm(n),t=tc.get(n.No);return t===void 0?(tc.set(n.No,e),!1):t!==e}function fR(n){for(const e of n)tc.set(e.No,Qm(e))}function Xm(){const n=G(),e=n._filterVersion||0;return Za===e&&ec===n.mobs&&Pr||(Za=e,ec=n.mobs,Pr=oR(n.mobs),ns=!1),Pr}function pR(){return ns&&On||(On=Xm().slice().sort(mR),ns=!0),On}function yd(){Za=-1,ec=null,Pr=null,On=null,ns=!1}function nc(){ns=!1,On=null}function Us(n){switch(n){case H.S:return 0;case H.A:return 1;case H.F:return 2;default:return 99}}function Cn(n){if(pa.has(n))return pa.get(n);const e=String(n).padStart(5,"0"),t={mobNo:parseInt(e.slice(1,4),10),instance:parseInt(e[4],10)};return pa.set(n,t),t}function $s(n){return Math.floor(n.elapsedPercent||0)}function mR(n,e){const t=n.repopInfo||{status:"Unknown",isInConditionWindow:!1,maxRepop:0,minRepop:0,elapsedPercent:0,isMaintenanceStop:!1,isBlockedByMaintenance:!1},r=e.repopInfo||{status:"Unknown",isInConditionWindow:!1,maxRepop:0,minRepop:0,elapsedPercent:0,isMaintenanceStop:!1,isBlockedByMaintenance:!1},s=t.status,i=r.status,o=t.isMaintenanceStop||t.isBlockedByMaintenance,c=r.isMaintenanceStop||r.isBlockedByMaintenance;if(o&&!c)return 1;if(!o&&c)return-1;const l=s==="MaxOver",h=i==="MaxOver";if(l&&!h)return-1;if(!l&&h)return 1;if(l&&h){const x=t.isInConditionWindow,F=r.isInConditionWindow;if(n.rank!==H.A&&e.rank!==H.A){if(x&&!F)return-1;if(!x&&F)return 1;const y=t.maxRepop||0,T=r.maxRepop||0;if(y!==T)return y-T}const z=y=>y===H.S?0:y===H.F?1:y===H.A?2:99,ne=z(n.rank)-z(e.rank);if(ne!==0)return ne;if(n.ExpansionId!==e.ExpansionId&&n.ExpansionId!==void 0&&e.ExpansionId!==void 0)return e.ExpansionId-n.ExpansionId;const Q=Cn(n.No),w=Cn(e.No);return Q.instance!==w.instance?Q.instance-w.instance:Q.mobNo-w.mobNo}const d=!!t.isInConditionWindow,p=!!r.isInConditionWindow;if(d&&!p)return-1;if(!d&&p)return 1;const m=br(n);if((m==="NEXT"||m==="MAINTENANCE")&&m===br(e)){const x=t.minRepop||1/0,F=r.minRepop||1/0;if(x!==F)return x-F}if(br(n)==="WINDOW"&&br(e)==="WINDOW"){const x=$s(t),F=$s(r);if(x!==F)return F-x;const z=Us(n.rank)-Us(e.rank);if(z!==0)return z;if(n.ExpansionId!==e.ExpansionId&&n.ExpansionId!==void 0&&e.ExpansionId!==void 0)return e.ExpansionId-n.ExpansionId;const ne=Cn(n.No),Q=Cn(e.No);return ne.instance!==Q.instance?ne.instance-Q.instance:ne.mobNo-Q.mobNo}const E=$s(t),A=$s(r);if(E!==A)return A-E;const N=Us(n.rank)-Us(e.rank);if(N!==0)return N;if(n.ExpansionId!==e.ExpansionId&&n.ExpansionId!==void 0&&e.ExpansionId!==void 0)return e.ExpansionId-n.ExpansionId;const b=Cn(n.No),O=Cn(e.No);return b.instance!==O.instance?b.instance-O.instance:b.mobNo-O.mobNo}const pn=new Map,ri=new Set,gR={"color-b1":"color-b1-culled","color-b2":"color-b2-culled"},_R={"color-b1-culled":"color-b1","color-b2-culled":"color-b2"};let ma=0,ga=null,Ed=!1,kr=null;function Td(){const n=document.createElement("div");n.style.cssText="position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;scrollbar-width:thin;",document.body.appendChild(n);const e=n.offsetWidth-n.clientWidth;n.remove(),document.documentElement.style.setProperty("--sbw",`${e}px`)}let wd=!1;async function Id(){var n;if(!(wd||window.__theHuntInitialized)){wd=!0,window.__theHuntInitialized=!0;try{Td(),window.addEventListener("resize",qi(Td,200)),CR(),RR(),nC(),Og(()=>{rs(),rc()}),Vg(),jC().then(()=>{tC(G().mobs)}),Bm().then(async e=>{if(e){ad(e);const t=await yC(e);t&&t.lodestone_id?(ti(t.lodestone_id),t.character_name&&ni(t.character_name),Rr(!0)):(Rr(!1),ti(null),ni(null))}else Rr(!1),ad(null),ti(null),ni(null)}).catch(e=>{Ae(e,"Auth初期化失敗"),Rr(!1),window.dispatchEvent(new CustomEvent("initialDataLoaded"))}),Wm(),ts(null),pC(),rs(),rc(),aR(),AR(),SR(),window.renderMaintenanceStatus=si,kr=setTimeout(()=>{const e=P.loadingOverlay;e&&!e.classList.contains("hidden")&&(console.warn("Loading timeout: Forcing UI display."),G().initialLoadComplete||window.dispatchEvent(new CustomEvent("initialDataLoaded")),e.classList.add("hidden"),jr("データ同期がタイムアウトしました。既存のデータで表示します。","info"))},Te.APP_LOAD_TIMEOUT)}catch(e){Ae(e,"アプリ初期化致命的エラー"),(n=P.loadingOverlay)==null||n.classList.add("hidden")}}}function yR(){const e=G().maintenance;if(!e||!e.start||!e.end)return{is_active:!1,scheduled:!1,message:e?e.message:""};const t=new Date(Re()),r=new Date(e.start),s=new Date(e.end),i=new Date(r.getTime()-Te.MAINTENANCE_SHOW_BEFORE_MS),o=new Date(s.getTime()+Te.MAINTENANCE_SHOW_AFTER_MS),c=t>=i&&t<=o,l={is_active:!1,scheduled:!1,start_time:e.start,end_time:e.end,message:e.message||""};return c&&(t>=r&&t<=s?l.is_active=!0:t<r&&(l.scheduled=!0)),l}function si(){const n=G(),e=yR(),t=document.querySelectorAll(".js-maintenance-content"),r=document.querySelectorAll(".js-telop-content");let s=!1;e&&(e.is_active||e.scheduled)&&(s=!0),t.forEach(d=>{if(d.innerHTML="",!s){d.textContent="現在予定されているメンテナンスはありません";return}const p=Wr(e.start_time),m=e.end_time?Wr(e.end_time):"";d.textContent=m?`${p} ～ ${m}`:`${p} ～`});const i=e&&e.message&&e.message.trim()!==""?e.message:"",o=n.isVerified&&n.characterName?n.characterName:"名無しさん",c=document.getElementById("sidebar-welcome-area");if(c){c.textContent="";const d=document.createElement("div");d.className="sidebar-welcome-msg";const p=document.createElement("span");p.className="sidebar-welcome-name",p.textContent=o,d.appendChild(p),c.appendChild(d)}r.forEach(d=>{d.textContent="";const p=document.createElement("span");if(i){const m=Pm(i).split(/\/\/|<br>/i);m.forEach((E,A)=>{p.appendChild(document.createTextNode(E)),A<m.length-1&&p.appendChild(document.createElement("br"))})}else p.textContent="メッセージはありません。";d.appendChild(p)}),document.querySelectorAll('.appnav-btn[data-nav-id="maintenance"]').forEach(d=>d.classList.toggle("has-alert",s)),document.querySelectorAll('.appnav-btn[data-nav-id="telop"]').forEach(d=>d.classList.toggle("has-alert",n.hasUnreadTelop));const h=(window.errorLog?window.errorLog.length:0)>0;document.querySelectorAll('.appnav-btn[data-nav-id="error"]').forEach(d=>d.classList.toggle("has-alert",h)),document.querySelectorAll('.appnav-btn[data-nav-id="rank"]').forEach(d=>d.classList.remove("has-alert"))}let Hs=null,vd="",Ad="";const Sd=175e3/60;let _a=null;function rc(){_a!==null&&clearTimeout(_a);const n=Re(),e=6e4-n%6e4,t=Sd-n%Sd,r=Math.min(e,t)+5;_a=setTimeout(()=>{rs(),rc()},r)}function rs(){if(document.visibilityState==="hidden")return;const n=new Date(Re()),e=Bg(n),t=`${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`,r=`${e.hours}:${e.minutes}`;t===vd&&r===Ad||(vd=t,Ad=r,Hs||(Hs={lt:Array.from(document.querySelectorAll(".js-lt-clock")),et:Array.from(document.querySelectorAll(".js-et-clock"))}),Hs.lt.forEach(s=>{s.textContent!==t&&(s.textContent=t)}),Hs.et.forEach(s=>{s.textContent!==r&&(s.textContent=r)}))}function Ot(){return G().mobsMap}function Ym(n=!0){const e=document.getElementById("moblist-container");if(!e)return;const t=window.innerHeight,r=Array.from(e.querySelectorAll(".moblist-item")),s=Ot(),i=r.map(l=>l.getBoundingClientRect()),o=new Set(ri);ri.clear();const c=[];r.forEach((l,h)=>{const d=i[h];if(d.bottom>-100&&d.top<t+100){const p=l.dataset.mobNo;if(ri.add(p),dl(l),!o.has(p)){const m=s.get(p);m&&c.push([l,m])}}}),n&&c.forEach(([l,h])=>Yn(l,h))}const hl=qi(()=>Ym(),80);window.addEventListener("scroll",hl,{passive:!0});window.addEventListener("resize",hl,{passive:!0});const Cd=document.getElementById("moblist-container");Cd&&Cd.addEventListener("scroll",hl,{passive:!0});const Rd=new WeakMap;document.addEventListener("scroll",n=>{const e=n.target;e instanceof HTMLElement&&e.matches("#moblist-container, .mobcard-content")&&(e.classList.contains("is-scrolling")||e.classList.add("is-scrolling"),window.clearTimeout(Rd.get(e)),Rd.set(e,window.setTimeout(()=>e.classList.remove("is-scrolling"),120)))},{capture:!0,passive:!0});function ER(){const n=document.querySelector(".main-content-area");if(!n||n.__moblistBgWheelAttached)return;n.__moblistBgWheelAttached=!0;const e=.18;let t=0,r=0,s=null,i=0;const o=()=>{s!==null&&(cancelAnimationFrame(s),s=null)},c=h=>{const d=document.getElementById("moblist-container");if(!d){s=null;return}const p=i?Math.min(h-i,50):16.67;i=h;const m=r-t;if(Math.abs(m)<.5){t=r,d.scrollTop=t,s=null,i=0;return}t+=m*(1-Math.pow(1-e,p/16.67)),d.scrollTop=t,s=requestAnimationFrame(c)},l=document.getElementById("moblist-container");l&&(l.addEventListener("wheel",o,{passive:!0}),l.addEventListener("pointerdown",o,{passive:!0})),n.addEventListener("wheel",h=>{const d=h;if(d.defaultPrevented||d.deltaY===0||d.ctrlKey)return;const p=d.target instanceof Element?d.target:null;if(!p||p.closest("#manual-modal:not(.hidden), #report-modal:not(.hidden), #auth-modal:not(.hidden)"))return;const m=document.getElementById("moblist-container");if(!m||m.scrollHeight<=m.clientHeight||p.closest("#moblist-container")||p.closest(".mobcard-card"))return;const E=document.getElementById("mobcard-pane");if(E&&E.classList.contains("is-active")&&window.innerWidth<900&&p.closest("#mobcard-pane"))return;let A=d.deltaY;d.deltaMode===1?A*=16:d.deltaMode===2&&(A*=m.clientHeight),s===null&&(t=m.scrollTop,r=t);const N=m.scrollHeight-m.clientHeight;r=Math.max(0,Math.min(N,r+A)),s===null&&(i=0,s=requestAnimationFrame(c))},{passive:!0})}ER();function dl(n){if(n&&n.dataset.mobNo){const e=n.dataset.mobNo;let t=pn.get(e);t||(t=new Set,pn.set(e,t)),t.add(n)}}function Yn(n,e){var l,h;const t=e.repopInfo||{};let r="";if(e.spawn_cull_status)for(const d in e.spawn_cull_status){const p=e.spawn_cull_status[d],m=((l=p.culled_at)==null?void 0:l.seconds)||0,E=((h=p.uncull_at)==null?void 0:h.seconds)||0,A=p.reporter_id||"";r+=`${d}:${m},${E},${A};`}const s=`${e.memo_updated_at||0}:${e.memo_text||""}`,i=`${t.status}|${t.timeRemaining}|${t.elapsedPercent}|${t.isInConditionWindow}|${r}|${s}|${G().lodestoneId||""}`;if(n._lastStateHash===i)return;n._lastStateHash=i;const o=n.classList.contains("mobcard-card"),c=n.classList.contains("moblist-item");o?(el(n,e),Zc(n,e),tl(n,e),Vm(n,e),Dm(n,e),Om(n,e)):c&&xm(n,e)}const Ui=function(){const n=Ot();for(const e of ri){const t=pn.get(e),r=n.get(e);t&&r&&t.forEach(s=>Yn(s,r))}Vn(n)};function Vn(n){const e=P.pcRightDetail||document.getElementById("mobcard-detail");if(!(!e||e.offsetParent===null)&&e.dataset.renderedMobNo&&e.dataset.renderedMobNo!=="none"){const t=e.firstElementChild,r=n.get(e.dataset.renderedMobNo);t&&r&&Yn(t,r)}}const TR=qi(()=>{$i({immediate:!0})},200),$i=(n={})=>{const{immediate:e=!1}=n;e?Jn():TR()},js=new Set,fl=function(){if(!P.pcLeftList)return;const n=pR(),e={MAX_OVER:[],WINDOW:[],NEXT:[],MAINTENANCE:[]};n.forEach(o=>{e[br(o)].push(o)});const t=[],r=Array.from(P.pcLeftList.children),s=new Map;r.forEach(o=>{o.dataset.mobNo?s.set(`mob-${o.dataset.mobNo}`,o):o.dataset.groupKey&&s.set(`header-${o.dataset.groupKey}`,o)}),["MAX_OVER","WINDOW","NEXT","MAINTENANCE"].forEach(o=>{const c=e[o];if(o==="MAINTENANCE"&&c.length===0)return;const l=dR[o],h=`header-${o}`;let d=s.get(h);const p=js.has(o);if(!d){d=document.createElement("div"),d.className="moblist-group-header status-group-separator",d.dataset.groupKey=o,d.setAttribute("role","button"),d.setAttribute("tabindex","0"),d.title="クリックで折りたたみ / 展開";const E=document.createElement("span");E.className="status-group-label",E.textContent=l,d.appendChild(E);const A=document.createElement("span");A.className="status-group-count",d.appendChild(A);const N=document.createElement("span");N.className="status-group-toggle-icon",N.textContent="▼",d.appendChild(N);const b=()=>{js.has(o)?js.delete(o):js.add(o),fl()};d.addEventListener("click",b),d.addEventListener("keydown",O=>{(O.key==="Enter"||O.key===" ")&&(O.preventDefault(),b())})}d.classList.toggle("is-collapsed",p);const m=d.querySelector(".status-group-count");m&&(m.textContent=String(c.length)),t.push(d),p||c.forEach(E=>{const A=`mob-${E.No}`;let N=s.get(A);N||(N=Lm(E)),N.dataset.groupKey=o,t.push(N)})});for(let o=0;o<t.length;o++){const c=t[o],l=P.pcLeftList.children[o];l!==c&&P.pcLeftList.insertBefore(c,l||null),c.dataset.mobNo&&dl(c)}for(;P.pcLeftList.children.length>t.length;)P.pcLeftList.removeChild(P.pcLeftList.lastChild);fR(n)};function Jm(){const n=document.getElementById("mobcard-detail"),e=document.getElementById("mobcard-pane");if(!n||!e)return;const t=G().openMobCardNo;if(t){let r=null;if(n.dataset.renderedMobNo!==String(t)){const s=G().mobs.find(i=>i.No===t);if(s){n.innerHTML="";const i=lC(s,!0);n.appendChild(i),dl(i),n.dataset.renderedMobNo=String(t),r=i}}else r=n.querySelector(".mobcard-card");r&&r.classList.add("is-open"),e.classList.add("is-active"),window.innerWidth<1024&&document.body.classList.add("body-lock")}else{const r=n.querySelector(".mobcard-card");r&&r.classList.remove("is-open"),n.dataset.renderedMobNo!=="none"&&(n.innerHTML=window.innerWidth>=1024?'<div class="text-center text-gray-500 mt-20 text-sm">モブを選択すると詳細が表示されます</div>':"",n.dataset.renderedMobNo="none"),e.classList.remove("is-active"),document.body.classList.remove("body-lock")}}function sc(){G().initialLoadComplete&&(Jm(),Vn(Ot()))}function Jn(n={}){const{isInitialLoad:e=!1}=n;if(!G().initialLoadComplete&&!e)return;const r=document.activeElement;let s=null,i=null,o=null,c=null;if(r&&r.closest(".mobcard-card, .moblist-item")&&(s=r.closest(".mobcard-card, .moblist-item").dataset.mobNo||null,(r.tagName==="INPUT"||r.tagName==="TEXTAREA")&&(i=r.dataset.action||null,o=r.selectionStart,c=r.selectionEnd)),P.pcLeftList&&fl(),Jm(),e){const l=document.getElementById("loading-overlay");l&&l.classList.add("hidden")}if(Ym(!1),Ui(),s){const l=pn.get(String(s));if(l&&i)for(const h of l){const d=h.querySelector(`input[data-action="${i}"], textarea[data-action="${i}"]`);if(d){if(d.focus(),o!==null&&c!==null)try{d.setSelectionRange(o,c)}catch{}break}}}}let ic=0,ii=0;const wR=125,bd=100,Hi=function(n=!1){if(document.visibilityState==="hidden"&&!n)return;const e=G(),t=Date.now(),r=Re()/1e3,s=n||t-ic>=Te.TIER_B_UPDATE_INTERVAL-bd,i=n||t-ii>=xd-bd;if(!s&&!i)return;const o=Xm();let c=!1;s?(o.forEach(l=>{const h=l.repopInfo;!h||h.status==="Maintenance"||(Pd(l,r,e),Bi(l)&&(c=!0),Fi(l))}),ic=t,ii=t):(o.forEach(l=>{const h=l.repopInfo;if(!h||h.status==="Maintenance")return;const d=h.nextBoundarySec||h.maxRepop||0;d&&d-r<=wR&&(Pd(l,r,e),Bi(l)&&(c=!0),Fi(l))}),ii=t),c&&(nc(),fl()),document.visibilityState==="visible"&&Ui()},Pd=function(n,e,t){const r=n.repopInfo;if(!r)return!1;let s=!1;const i=r.status;if(r.nextBoundarySec&&e>=r.nextBoundarySec||r.maxRepop&&e>=r.maxRepop&&r.status!=="MaxOver"||r.minRepop&&e>=r.minRepop&&r.status==="Next")n.repopInfo=qr(n,t.maintenance),s=!0;else if(r.maxRepop&&e>=r.maxRepop)r.status="MaxOver",r.elapsedPercent=100,r.timeRemaining=oi(e-r.maxRepop);else{const c=r.nextBoundarySec||r.maxRepop||0;if(r.timeRemaining=oi(Math.max(0,c-e)),r.minRepop&&r.maxRepop){const l=r.maxRepop-r.minRepop;r.elapsedPercent=l<=0||e<r.minRepop?0:Math.min(100,(e-r.minRepop)/l*100)}}return i!==n.repopInfo.status&&(s=!0),$C(n,e),s};function jr(n,e="error"){e==="error"&&console.error(n);let t=document.getElementById("toast-container");t||(t=document.createElement("div"),t.id="toast-container",t.className="toast-container-wrapper",document.body.appendChild(t));const r=document.createElement("div"),s=e==="error"?"toast-error":e==="success"?"toast-success":"toast-info";r.className=`toast-item-base ${s} opacity-0 translate-x-full whitespace-pre-wrap`,r.textContent=n,t.appendChild(r),requestAnimationFrame(()=>{requestAnimationFrame(()=>{r.classList.remove("translate-x-full","opacity-0")})}),setTimeout(()=>{r.classList.add("translate-x-full","opacity-0");const i=()=>{r.parentElement&&r.remove()};r.addEventListener("transitionend",i,{once:!0}),setTimeout(i,500)},Te.TOAST_DURATION)}function Zm(n){n.success?jr("討伐報告を送信しました","success"):n.code==="permission-denied"||n.error&&n.error.includes("permission")?(jr(`アクセス権限エラーが発生しました。
再度認証を行ってください。`,"error"),go()):jr("報告エラー: "+(n.error||"不明なエラー"),"error")}async function IR(n){const e=await Um(n,new Date(Re()).toISOString());Zm(e)}async function vR(n){n.preventDefault();const e=n.target,t=parseInt(e.dataset.mobNo,10),r=e.elements.namedItem("kill-time").value,s=await Um(t,r);Zm(s),s.success&&Ur()}function kd(n,e){if(n.dataset.isCulled=String(e),e){for(const[t,r]of Object.entries(gR))if(n.classList.contains(t)){n.classList.replace(t,r);break}}else for(const[t,r]of Object.entries(_R))if(n.classList.contains(t)){n.classList.replace(t,r);break}}function Nd(n,e,t,r){const s=G(),i=n%10,o=`${e}_${i}`;s.mobLocations||(s.mobLocations={}),s.mobLocations[o]||(s.mobLocations[o]={}),s.mobLocations[o][t]||(s.mobLocations[o][t]={});const c=Re(),l={toMillis:()=>c,seconds:Math.floor(c/1e3)};r?s.mobLocations[o][t].culled_at=l:s.mobLocations[o][t].uncull_at=l,s.mobLocations[o][t].reporter_id=s.lodestoneId,s.mobs.forEach(h=>{h.area===e&&h.No%10===i&&(h.spawn_cull_status=s.mobLocations[o])}),window.dispatchEvent(new CustomEvent("locationsUpdated",{detail:{locationsMap:s.mobLocations}}))}function Md(n){const e=n.target,t=e.closest(".spawn-point");if(!t)return;const r=G();if(!r.isVerified){go();return}if(t.dataset.isInteractive!=="true"||t.dataset.isLastone==="true")return;const s=e.closest(".mobcard-card");if(!s)return;n.preventDefault(),n.stopPropagation();const i=parseInt(s.dataset.mobNo,10),o=r.mobs.find(m=>m.No===i);if(!o)return;const c=t.dataset.locationId,l=o.area;if(window.matchMedia("(hover: none)").matches){const m=Date.now(),E=m-ma;if(c===ga&&E<Te.CLICK_THRESHOLD)ma=0,ga=null;else{ma=m,ga=c;return}}const p=!(t.dataset.isCulled==="true");kd(t,p),Nd(i,l,c,p),SC(i,l,c,p).then(m=>{m!=null&&m.success||(kd(t,!p),Nd(i,l,c,!p))})}function AR(){if(Ed)return;const n=document.getElementById("moblist-container");n&&n.addEventListener("click",Md);const e=document.getElementById("mobcard-detail");e&&e.addEventListener("click",Md),Ed=!0}function SR(){let n=window.innerWidth;window.addEventListener("resize",qi(()=>{const t=window.innerWidth;n>=Te.BREAKPOINT_PC!=t>=Te.BREAKPOINT_PC&&(n=t,$i())},Te.DEBOUNCE_DELAY)),document.body.addEventListener("click",t=>{const r=t.target,s=r.closest(".appnav-btn[data-nav-id]");if(s){const o=s.dataset.navId;if(o==="notify")return;if(t.preventDefault(),t.stopPropagation(),o==="home"){Ge();const c=document.getElementById("moblist-container");c&&c.scrollTo({top:0,behavior:"smooth"}),pt("home")}else cR(o);return}if(r.closest(".area-filter-btn")){t.stopPropagation(),iR(t);return}if(r.closest(".appnav-logo")){window.location.reload();return}}),P.reportForm&&P.reportForm.addEventListener("submit",vR),document.body.addEventListener("input",t=>{const r=t.target;(r.classList.contains("mobcard-memo-input")||r.matches("[data-action='save-memo']"))&&nl(r)}),document.body.addEventListener("change",async t=>{const r=t.target;if(r.classList.contains("mobcard-memo-input")||r.matches("[data-action='save-memo']")){const s=parseInt(r.dataset.mobNo,10),i=r.value.replace(/[\r\n]/g,"").trim();if(!isNaN(s)){if(!G().isVerified){r.value="",go();return}const o=Ot(),c=o==null?void 0:o.get(String(s));if(c){c.memo_text=i,c.memo_updated_at=Math.floor(Re()/1e3);const l=pn.get(String(s));l&&l.forEach(h=>Yn(h,c))}await AC(s,i)}}}),document.body.addEventListener("keydown",t=>{const r=t.target;(r.classList.contains("mobcard-memo-input")||r.matches("[data-action='save-memo']"))&&t.key==="Enter"&&!t.isComposing&&r.blur()});let e=0;document.body.addEventListener("touchstart",t=>{t.target.closest(".report-side-bar")&&(e=t.changedTouches[0].screenX)},{passive:!0}),document.body.addEventListener("touchend",t=>{const s=t.target.closest(".report-side-bar");if(s&&t.changedTouches[0].screenX-e>30){const o=parseInt(s.dataset.mobNo,10);s.dataset.reportType==="modal"?Fm(o):s.click()}},{passive:!0})}function CR(){window.addEventListener("maintenanceUpdated",()=>si()),window.addEventListener("pageshow",n=>{n.persisted&&(ts(null),document.querySelectorAll(".appnav-rank-item.appnav-active").forEach(e=>e.classList.remove("appnav-active")))}),window.addEventListener("initialDataLoaded",()=>{var n;kr&&clearTimeout(kr);try{si(),Hr(),rs(),Jn({isInitialLoad:!0}),ic=0,ii=0,Hi(),!localStorage.getItem("has_visited")&&(localStorage.setItem("has_visited","true"),window.openUserManual&&window.openUserManual())}catch(e){console.error("初期ロード処理失敗:",e),(n=P.loadingOverlay)==null||n.classList.add("hidden")}},{once:!0}),window.addEventListener("criticalDataLoadError",n=>{kr&&clearTimeout(kr);const e=P.loadingOverlay;if(e){const t=e.querySelector(".loading-spinner");t&&t.classList.add("u-hidden");const r=e.querySelector(".loading-text");r&&(r.classList.add("u-pre-wrap","u-text-error"),r.textContent=n.detail.message)}},{once:!0}),window.addEventListener("characterNameSet",()=>si()),window.addEventListener("mobsBatchUpdated",n=>{const{mobNos:e}=n.detail,t=Ot();if(!t)return;let r=!1;e.forEach(s=>{const i=t.get(String(s));if(!i)return;Fi(i);const o=pn.get(String(s));o&&o.forEach(c=>Yn(c,i)),Bi(i)&&(r=!0)}),Vn(t),r&&(nc(),$i())}),window.addEventListener("mobUpdated",n=>{const{mobNo:e,mob:t}=n.detail,r=Ot();if(!r)return;const s=pn.get(String(e));s&&s.forEach(i=>Yn(i,t)),Vn(r),Bi(t)&&(nc(),$i())}),window.addEventListener("filterChanged",()=>{yd(),Jn()}),window.addEventListener("mobsUpdated",()=>Hi()),window.addEventListener("locationDataReady",()=>{Ui();const n=Ot();n&&Vn(n)}),window.addEventListener("locationsUpdated",()=>{yd(),Ui();const n=Ot();n&&Vn(n)}),window.addEventListener("appNotify",n=>{const{message:e,type:t}=n.detail;jr(e,t)})}function RR(){[document.getElementById("moblist-container"),document.getElementById("mobcard-detail")].filter(Boolean).forEach(t=>t.addEventListener("click",bR));const e=document.getElementById("mobcard-pane");e&&e.addEventListener("click",t=>{Ge(),t.target===e&&window.innerWidth<Te.BREAKPOINT_PC&&(ts(null),sc())})}function bR(n){const e=n.target,t=e.closest(".moblist-item, .mobcard-card");if(!t)return;const r=parseInt(t.dataset.mobNo,10),s=G().mobs.find(o=>o.No===r);if(!s)return;const i=e.closest(".moblist-report-btn");if(i){if(n.preventDefault(),n.stopPropagation(),!G().isVerified){go();return}(i.dataset.reportType||(s.rank==="A"?"instant":"modal"))==="modal"?Fm(r):IR(r);return}if(e.closest('[data-action="close-card"]')){n.stopPropagation(),Ge(),ts(null),sc();return}if(e.closest(".moblist-item")||e.classList.contains("mobcard-card")){Ge();const o=G().openMobCardNo;ts(o===r?null:r),sc()}}window.appInterval&&clearInterval(window.appInterval);window.appInterval=setInterval(()=>{document.visibilityState!=="hidden"&&Hi()},xd);document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(rs(),Hi(!0))});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Id):queueMicrotask(Id);
//# sourceMappingURL=index-DaBQf6Fd.js.map
