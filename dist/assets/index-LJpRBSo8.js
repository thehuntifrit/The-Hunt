(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const qd="https://icy-resonance-2526.the-hunt-ifrit.workers.dev/",Gg=3,Qg=2,Xg=3e3,Yg=60*60*1e3,Jg=10*60*1e3;let pc=0;function be(){return Date.now()+pc}function Zg(){return pc}const Wd=[];function e_(n){Wd.push(n)}let na=!1,bu=!1;async function ra(){if(!na){na=!0;try{let n=null;const e=bu?Qg:Gg;for(let t=0;t<e;t++)try{const r=Date.now(),s=await fetch(`${qd}time?_=${r}`,{cache:"no-store"});if(!s.ok)continue;const i=await s.json(),o=Date.now(),c=o-r;if(typeof i.t!="number"||c>Xg)continue;const l=i.t+c/2-o;(!n||c<n.rtt)&&(n={rtt:c,offset:l})}catch{}n&&(pc=n.offset,bu=!0,Wd.forEach(t=>{try{t()}catch{}}))}finally{na=!1}}}let Ru=!1;function t_(){if(Ru)return;Ru=!0,ra(),setInterval(()=>void ra(),Yg);let n=0;document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){n=Date.now();return}if(!n)return;const e=Date.now()-n;n=0,e>=Jg&&ra()})}const We=175,Mt=1400,Qi=We*24,Ra=Qi*32,Pu=Qi*4,Qs=5e3,zd=20,Kd=2917,n_=.6;function Dr(n){if(!n)return null;if(n instanceof Date)return n;if(typeof n=="object"&&typeof n.toDate=="function")return n.toDate();if(typeof n=="object"&&n.seconds!==void 0)return new Date(n.seconds*1e3);const e=new Date(n);return isNaN(e.getTime())?null:e}function r_(n){n<0&&(n=0);const{h:e,m:t}=Gd(n),r=[];return parseInt(e)>0&&r.push(`${e.trim()}h`),r.push(`${t.trim()}m`),r.join("/")}function Gd(n){n<0&&(n=0);const e=Math.floor(n/3600),t=Math.floor(n%3600/60),r=s=>s.toString();return{d:"0",h:r(e),m:r(t),rawD:0,rawH:e,rawM:t,rawS:n}}function ci(n){n<0&&(n=0);const e=Math.floor(n/3600),t=Math.floor(n%3600/60);return`${String(e).padStart(3," ")}:${String(t).padStart(2,"0")}`}function Xi(n,e){let t;return function(...s){clearTimeout(t),t=setTimeout(()=>n(...s),e)}}function s_(n=new Date){const e=n.getTime(),t=We*1e3,i=Math.floor(e/t)%24,o=e%t,c=t/60,l=Math.floor(o/c);return{hours:i.toString().padStart(2,"0"),minutes:l.toString().padStart(2,"0")}}function i_(n){return Math.floor(n/We)%24}function o_(n){return Math.floor(n/We)*We}function a_(n){return Math.floor(n/Mt)*Mt}function mc(n=new Date){const s=n.getTime()/1e3*20.57142857142857/86400%32+1;let i=null;return s>=32.5||s<4.5?i="新月":s>=16.5&&s<20.5&&(i="満月"),{phase:s,label:i}}function c_(n=new Date){const e=Math.floor(n.getTime()/1e3),t=Math.floor(e/We),r=Math.floor(t/24);let s=t%24-t%8;s=(s+8)%24;const i=r*100+s,o=i<<11^i;return((o>>>8^o)>>>0)%100}const l_=1e4,Ls=new Map;function u_(n){const e=Math.floor(n/Mt);let t=Ls.get(e);return t===void 0&&(Ls.size>=l_&&Ls.clear(),t=c_(new Date(e*Mt*1e3)),Ls.set(e,t)),t}function h_(n,e){if(n.weatherSeedRange){const[t,r]=n.weatherSeedRange;return e>=t&&e<=r}return n.weatherSeedRanges?n.weatherSeedRanges.some(([t,r])=>e>=t&&e<=r):!1}function Ds(n,e){const t=i_(e),{start:r,end:s}=n;return r<s?t>=r&&t<s:t>=r||t<s}function ku(n,e){if(n.conditions){const{phase:t}=mc(new Date(e*1e3)),{firstNight:r,otherNights:s}=n.conditions;return r!=null&&r.timeRange&&d_(t)?Ds(r.timeRange,e):s!=null&&s.timeRange&&f_(t)?Ds(s.timeRange,e):!1}return n.timeRange?Ds(n.timeRange,e):n.timeRanges?n.timeRanges.some(t=>Ds(t,e)):!0}function d_(n){return n>=32.5||n<1.5}function f_(n){return n>=1.5&&n<4.5}function p_(n,e){const t=mc(new Date(n*1e3)).phase;let r=e-t;r<0&&(r+=32);let s=n+r*Qi;return s<n&&(s+=Ra),s}function*m_(n,e,t){var l;const r=(((l=n.weatherDuration)==null?void 0:l.minutes)||0)*60;if(!n.weatherSeedRange&&!n.weatherSeedRanges){yield[e,t];return}const s=zd*24*3600,i=h=>h_(n,u_(h));let o=0,c=a_(e);if(i(c)){const h=e-s;for(;;){const d=c-Mt;if(d<h||!i(d))break;c=d}}for(;c<t&&!(o++>Qs);){let h=null;for(;c<t&&!(o++>Qs);){if(i(c)){h=c;break}if(c+=Mt,c-e>s)break}if(h===null)break;let d=h+Mt;for(;i(d)&&!(o++>Qs);)d+=Mt;if(d-h>=r){const p=Math.max(h+r,e),m=Math.min(d,t);p<m&&(yield[p,m])}c=d}}function*g_(n,e,t){if(!n.timeRange&&!n.timeRanges&&!n.conditions){yield[e,t];return}let r=o_(e),s=0;for(;r<t&&!(s++>Qs);)if(ku(n,r)){const i=r;let o=r+We,c=o;for(;c<t+We&&ku(n,c);)o+=We,c+=We;const l=Math.max(i,e),h=Math.min(o,t);l<h&&(yield[l,h]),r=o}else r+=We}function __(n,e,t,r=0){const s=[];if(!n.moonPhase)s.push([e,t]);else{const i=n.moonPhase==="新月"?32.5:16.5,o=mc(new Date(e*1e3)).phase;if(n.moonPhase==="新月"&&(o>=32.5||o<4.5)||n.moonPhase==="満月"&&o>=16.5&&o<20.5){let l=e-(o-i)*Qi;for(;l>e;)l-=Ra;const h=l+Pu;h>e&&s.push([e,h])}let c=p_(e,i);for(;c<t;)s.push([c,c+Pu]),c+=Ra}for(const[i,o]of s){const c=m_(n,i,o);for(const[l,h]of c){const d=g_(n,l,h);for(const[p,m]of d){const E=Math.max(p,e),A=m;if(E<A){if(r>0&&A<=r)continue;return{start:E,end:A}}}}}return null}function Nu(n){if(n.isInWindow&&n.windowEndSec!==null&&n.status!=="Maintenance")return n.windowEndSec-n.now;switch(n.status){case"MaxOver":return n.now-n.maxRepop;case"Next":return(n.hasCondition&&n.nextConditionSec!==null&&n.nextConditionSec>n.minRepop?n.nextConditionSec:n.minRepop)-n.now;case"PopWindow":return n.maxRepop-n.now;case"NextCondition":return(n.nextConditionSec??n.maxRepop)-n.now;default:return n.fallbackSec-n.now}}function Yi(n,e,t={}){var C;const{skipConditionCalc:r=!1,forceRecalc:s=!1}=t,i=be()/1e3,o=n.last_kill_time||0,c=e&&e.maintenance?e.maintenance:e;if(!c||!c.start)return Mu("Unknown");const l=Dr(c.start);if(!l)return Mu("Unknown");const{minRepop:h,maxRepop:d,appliedFactor:p}=Qd(n,o,c,i),m=Dr(c.serverUp||c.end),E=m?m.getTime()/1e3:0,A=l.getTime()/1e3,N=new Date(h*1e3);let R="Unknown",O="";const x=null;let F=null,z=null,ne=!1;const Q=!!(n.moonPhase||n.timeRange||n.timeRanges||n.weatherSeedRange||n.weatherSeedRanges||n.conditions);if(!s&&n.repopInfo&&n.repopInfo.nextBoundarySec&&Number.isFinite(n.repopInfo.nextBoundarySec)&&n.repopInfo.minRepop===h&&n.repopInfo.maxRepop===d&&i<n.repopInfo.nextBoundarySec){const _=n.repopInfo;i>=d?_.elapsedPercent=100:i>=h&&d>h?_.elapsedPercent=Math.min(100,Math.floor((i-h)/(d-h)*100)):_.elapsedPercent=0;const ie=_.nextConditionSpawnDate?_.nextConditionSpawnDate.getTime()/1e3:null,Le=_.conditionWindowEnd?_.conditionWindowEnd.getTime()/1e3:null;return _.timeRemaining=ci(Nu({status:String(_.status),now:i,minRepop:h,maxRepop:d,hasCondition:Q,nextConditionSec:ie,windowEndSec:Le,isInWindow:!!_.isInConditionWindow,fallbackSec:_.nextBoundarySec??i})),_}if(Q&&!r){let _=s;if(n._spawnCache?(n._spawnCache.appliedFactor!==p||n._spawnCache.minRepop!==h||i>=n._spawnCache.end)&&(_=!0):_=!0,_){const ie=Math.max(h,i),Le=ie-18e3,No=ie+zd*24*3600,ur=__(n,Le,No,ie);ur?n._spawnCache={appliedFactor:p,minRepop:h,start:ur.start,end:ur.end}:n._spawnCache=null}if(n._spawnCache){const ie=Math.max(n._spawnCache.start,h),Le=n._spawnCache.end;ie<Le&&(F=new Date(ie*1e3),z=new Date(Le*1e3),ne=i>=ie&&i<Le&&i>=h)}}let w=0;i>=d?(R="MaxOver",w=100):i<h?R="Next":(R="PopWindow",w=d<=h?0:Math.min(100,Math.floor((i-h)/(d-h)*100)),Q&&F&&F.getTime()/1e3>i&&(R="NextCondition")),ne&&i>=h&&R!=="MaxOver"&&(R="ConditionActive"),O=ci(Nu({status:R,now:i,minRepop:h,maxRepop:d,hasCondition:Q,nextConditionSec:F?F.getTime()/1e3:null,windowEndSec:z?z.getTime()/1e3:null,isInWindow:ne,fallbackSec:d}));const y=!!(l&&i>=A+1800&&!(E>A&&i>=E));let T=!1;A&&i<A+1800&&(h>=A||F&&F.getTime()/1e3>=A)&&(T=!0),(y||T)&&(R="Maintenance");let v=[h,d,F?F.getTime()/1e3:null,z?z.getTime()/1e3:null,A,A+1800,E>A?E:null].filter(_=>_!==null&&_>i).reduce((_,ie)=>Math.min(_,ie),1/0);return Q&&!F&&r&&(v=0),{minRepop:h,maxRepop:d,elapsedPercent:w,timeRemaining:O,conditionRemaining:x,status:R,nextMinRepopDate:N,nextConditionSpawnDate:F,conditionWindowEnd:z,isInConditionWindow:ne,isMaintenanceStop:y,isBlockedByMaintenance:T,maintStart:A,maintEnd:E||(((C=Dr(c==null?void 0:c.end))==null?void 0:C.getTime())??0)/1e3,nextBoundarySec:v}}function Qr(n){if(!n)return"--/-- --:--";let e;n instanceof Date?e=n:typeof n=="string"?e=new Date(n):e=new Date(n*1e3);const t=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0"),s=String(e.getHours()).padStart(2,"0"),i=String(e.getMinutes()).padStart(2,"0");return`${t}/${r} ${s}:${i}`}function Mu(n){return{minRepop:null,maxRepop:null,elapsedPercent:0,timeRemaining:"",status:n||"Unknown",nextMinRepopDate:null,nextConditionSpawnDate:null,conditionWindowEnd:null,conditionRemaining:null,isInConditionWindow:!1,isMaintenanceStop:!1,isBlockedByMaintenance:!1,nextBoundarySec:null}}function Qd(n,e,t,r){var d,p;const s=t&&t.maintenance?t.maintenance:t,i=n.repopSeconds,o=n.maxRepopSeconds;if(!s||!s.start)return{minRepop:e+i,maxRepop:e+o,appliedFactor:1};const c=(((d=Dr(s==null?void 0:s.start))==null?void 0:d.getTime())??0)/1e3;if(r&&r>=c&&r<c+1800)return{minRepop:e+i,maxRepop:e+o,appliedFactor:1};const l=n.rank==="F";let h=(((p=Dr((s==null?void 0:s.serverUp)||(s==null?void 0:s.end)))==null?void 0:p.getTime())??0)/1e3;if(r>=c&&h<=c&&(h=c),e===0||e<=h){const m=l?1:n_;return{minRepop:h+i*m,maxRepop:h+o*m,appliedFactor:m}}return{minRepop:e+i,maxRepop:e+o,appliedFactor:1}}const y_=()=>{};var Lu={};/**
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
 */const Xd=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},E_=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Yd={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,l=s+2<n.length,h=l?n[s+2]:0,d=i>>2,p=(i&3)<<4|c>>4;let m=(c&15)<<2|h>>6,E=h&63;l||(E=64,o||(m=64)),r.push(t[d],t[p],t[m],t[E])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Xd(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):E_(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const p=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||p==null)throw new T_;const m=i<<2|c>>4;if(r.push(m),h!==64){const E=c<<4&240|h>>2;if(r.push(E),p!==64){const A=h<<6&192|p;r.push(A)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};let T_=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const w_=function(n){const e=Xd(n);return Yd.encodeByteArray(e,!0)},Jd=function(n){return w_(n).replace(/\./g,"")},v_=function(n){try{return Yd.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function I_(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const A_=()=>I_().__FIREBASE_DEFAULTS__,S_=()=>{if(typeof process>"u"||typeof Lu>"u")return;const n=Lu.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},C_=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&v_(n[1]);return e&&JSON.parse(e)},b_=()=>{try{return y_()||A_()||S_()||C_()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Zd=()=>{var n;return(n=b_())==null?void 0:n.config};/**
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
 */let R_=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}};function P_(){try{return typeof indexedDB=="object"}catch{return!1}}function k_(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
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
 */const N_="FirebaseError";let gc=class ef extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=N_,Object.setPrototypeOf(this,ef.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,tf.prototype.create)}},tf=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?M_(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new gc(s,c,r)}};function M_(n,e){return n.replace(L_,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const L_=/\{\$([^}]+)}/g;function Pa(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(Du(i)&&Du(o)){if(!Pa(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Du(n){return n!==null&&typeof n=="object"}let li=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
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
 */class D_{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new R_;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(V_(e))try{this.getOrInitializeService({instanceIdentifier:rn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=rn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=rn){return this.instances.has(e)}getOptions(e=rn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&o.resolve(s)}return s}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:O_(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=rn){return this.component?this.component.multipleInstances?e:rn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function O_(n){return n===rn?void 0:n}function V_(n){return n.instantiationMode==="EAGER"}/**
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
 */class x_{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new D_(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var ae;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(ae||(ae={}));const F_={debug:ae.DEBUG,verbose:ae.VERBOSE,info:ae.INFO,warn:ae.WARN,error:ae.ERROR,silent:ae.SILENT},B_=ae.INFO,U_={[ae.DEBUG]:"log",[ae.VERBOSE]:"log",[ae.INFO]:"info",[ae.WARN]:"warn",[ae.ERROR]:"error"},$_=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=U_[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let H_=class{constructor(e){this.name=e,this._logLevel=B_,this._logHandler=$_,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ae))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?F_[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ae.DEBUG,...e),this._logHandler(this,ae.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ae.VERBOSE,...e),this._logHandler(this,ae.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ae.INFO,...e),this._logHandler(this,ae.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ae.WARN,...e),this._logHandler(this,ae.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ae.ERROR,...e),this._logHandler(this,ae.ERROR,...e)}};const j_=(n,e)=>e.some(t=>n instanceof t);let Ou,Vu;function q_(){return Ou||(Ou=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function W_(){return Vu||(Vu=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const nf=new WeakMap,ka=new WeakMap,rf=new WeakMap,sa=new WeakMap,_c=new WeakMap;function z_(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",i),n.removeEventListener("error",o)},i=()=>{t(xt(n.result)),s()},o=()=>{r(n.error),s()};n.addEventListener("success",i),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&nf.set(t,n)}).catch(()=>{}),_c.set(e,n),e}function K_(n){if(ka.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",o),n.removeEventListener("abort",o)},i=()=>{t(),s()},o=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",i),n.addEventListener("error",o),n.addEventListener("abort",o)});ka.set(n,e)}let Na={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return ka.get(n);if(e==="objectStoreNames")return n.objectStoreNames||rf.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return xt(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function G_(n){Na=n(Na)}function Q_(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(ia(this),e,...t);return rf.set(r,e.sort?e.sort():[e]),xt(r)}:W_().includes(n)?function(...e){return n.apply(ia(this),e),xt(nf.get(this))}:function(...e){return xt(n.apply(ia(this),e))}}function X_(n){return typeof n=="function"?Q_(n):(n instanceof IDBTransaction&&K_(n),j_(n,q_())?new Proxy(n,Na):n)}function xt(n){if(n instanceof IDBRequest)return z_(n);if(sa.has(n))return sa.get(n);const e=X_(n);return e!==n&&(sa.set(n,e),_c.set(e,n)),e}const ia=n=>_c.get(n);function Y_(n,e,{blocked:t,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(n,e),c=xt(o);return r&&o.addEventListener("upgradeneeded",l=>{r(xt(o.result),l.oldVersion,l.newVersion,xt(o.transaction),l)}),t&&o.addEventListener("blocked",l=>t(l.oldVersion,l.newVersion,l)),c.then(l=>{i&&l.addEventListener("close",()=>i()),s&&l.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),c}const J_=["get","getKey","getAll","getAllKeys","count"],Z_=["put","add","delete","clear"],oa=new Map;function xu(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(oa.get(e))return oa.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=Z_.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||J_.includes(t)))return;const i=async function(o,...c){const l=this.transaction(o,s?"readwrite":"readonly");let h=l.store;return r&&(h=h.index(c.shift())),(await Promise.all([h[t](...c),s&&l.done]))[0]};return oa.set(e,i),i}G_(n=>({...n,get:(e,t,r)=>xu(e,t)||n.get(e,t,r),has:(e,t)=>!!xu(e,t)||n.has(e,t)}));/**
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
 */class ey{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(ty(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function ty(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Ma="@firebase/app",Fu="0.14.4";/**
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
 */const gt=new H_("@firebase/app"),ny="@firebase/app-compat",ry="@firebase/analytics-compat",sy="@firebase/analytics",iy="@firebase/app-check-compat",oy="@firebase/app-check",ay="@firebase/auth",cy="@firebase/auth-compat",ly="@firebase/database",uy="@firebase/data-connect",hy="@firebase/database-compat",dy="@firebase/functions",fy="@firebase/functions-compat",py="@firebase/installations",my="@firebase/installations-compat",gy="@firebase/messaging",_y="@firebase/messaging-compat",yy="@firebase/performance",Ey="@firebase/performance-compat",Ty="@firebase/remote-config",wy="@firebase/remote-config-compat",vy="@firebase/storage",Iy="@firebase/storage-compat",Ay="@firebase/firestore",Sy="@firebase/ai",Cy="@firebase/firestore-compat",by="firebase",Ry="12.4.0";/**
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
 */const La="[DEFAULT]",Py={[Ma]:"fire-core",[ny]:"fire-core-compat",[sy]:"fire-analytics",[ry]:"fire-analytics-compat",[oy]:"fire-app-check",[iy]:"fire-app-check-compat",[ay]:"fire-auth",[cy]:"fire-auth-compat",[ly]:"fire-rtdb",[uy]:"fire-data-connect",[hy]:"fire-rtdb-compat",[dy]:"fire-fn",[fy]:"fire-fn-compat",[py]:"fire-iid",[my]:"fire-iid-compat",[gy]:"fire-fcm",[_y]:"fire-fcm-compat",[yy]:"fire-perf",[Ey]:"fire-perf-compat",[Ty]:"fire-rc",[wy]:"fire-rc-compat",[vy]:"fire-gcs",[Iy]:"fire-gcs-compat",[Ay]:"fire-fst",[Cy]:"fire-fst-compat",[Sy]:"fire-vertex","fire-js":"fire-js",[by]:"fire-js-all"};/**
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
 */const ui=new Map,ky=new Map,Da=new Map;function Bu(n,e){try{n.container.addComponent(e)}catch(t){gt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Ht(n){const e=n.name;if(Da.has(e))return gt.debug(`There were multiple attempts to register component ${e}.`),!1;Da.set(e,n);for(const t of ui.values())Bu(t,n);for(const t of ky.values())Bu(t,n);return!0}function cs(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function ze(n){return n==null?!1:n.settings!==void 0}/**
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
 */const Ny={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Ft=new tf("app","Firebase",Ny);/**
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
 */class My{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new li("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Ft.create("app-deleted",{appName:this._name})}}/**
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
 */const rr=Ry;function sf(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:La,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw Ft.create("bad-app-name",{appName:String(s)});if(t||(t=Zd()),!t)throw Ft.create("no-options");const i=ui.get(s);if(i){if(Pa(t,i.options)&&Pa(r,i.config))return i;throw Ft.create("duplicate-app",{appName:s})}const o=new x_(s);for(const l of Da.values())o.addComponent(l);const c=new My(t,r,o);return ui.set(s,c),c}function yc(n=La){const e=ui.get(n);if(!e&&n===La&&Zd())return sf();if(!e)throw Ft.create("no-app",{appName:n});return e}function ft(n,e,t){let r=Py[n]??n;t&&(r+=`-${t}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${r}" with version "${e}":`];s&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),gt.warn(o.join(" "));return}Ht(new li(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
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
 */const Ly="firebase-heartbeat-database",Dy=1,Xr="firebase-heartbeat-store";let aa=null;function of(){return aa||(aa=Y_(Ly,Dy,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Xr)}catch(t){console.warn(t)}}}}).catch(n=>{throw Ft.create("idb-open",{originalErrorMessage:n.message})})),aa}async function Oy(n){try{const t=(await of()).transaction(Xr),r=await t.objectStore(Xr).get(af(n));return await t.done,r}catch(e){if(e instanceof gc)gt.warn(e.message);else{const t=Ft.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});gt.warn(t.message)}}}async function Uu(n,e){try{const r=(await of()).transaction(Xr,"readwrite");await r.objectStore(Xr).put(e,af(n)),await r.done}catch(t){if(t instanceof gc)gt.warn(t.message);else{const r=Ft.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});gt.warn(r.message)}}}function af(n){return`${n.name}!${n.options.appId}`}/**
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
 */const Vy=1024,xy=30;class Fy{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Uy(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=$u();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>xy){const o=$y(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){gt.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=$u(),{heartbeatsToSend:r,unsentEntries:s}=By(this._heartbeatsCache.heartbeats),i=Jd(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return gt.warn(t),""}}}function $u(){return new Date().toISOString().substring(0,10)}function By(n,e=Vy){const t=[];let r=n.slice();for(const s of n){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),Hu(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Hu(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class Uy{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return P_()?k_().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Oy(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Uu(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Uu(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Hu(n){return Jd(JSON.stringify({version:2,heartbeats:n})).length}function $y(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
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
 */function Hy(n){Ht(new li("platform-logger",e=>new ey(e),"PRIVATE")),Ht(new li("heartbeat",e=>new Fy(e),"PRIVATE")),ft(Ma,Fu,n),ft(Ma,Fu,"esm2020"),ft("fire-js","")}Hy("");var jy="firebase",qy="12.4.0";/**
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
 */ft(jy,qy,"app");const Wy=()=>{};var ju={};/**
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
 */const cf=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},zy=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},lf={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,l=s+2<n.length,h=l?n[s+2]:0,d=i>>2,p=(i&3)<<4|c>>4;let m=(c&15)<<2|h>>6,E=h&63;l||(E=64,o||(m=64)),r.push(t[d],t[p],t[m],t[E])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(cf(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):zy(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const p=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||p==null)throw new Ky;const m=i<<2|c>>4;if(r.push(m),h!==64){const E=c<<4&240|h>>2;if(r.push(E),p!==64){const A=h<<6&192|p;r.push(A)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};let Ky=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const Gy=function(n){const e=cf(n);return lf.encodeByteArray(e,!0)},qu=function(n){return Gy(n).replace(/\./g,"")},Qy=function(n){try{return lf.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Xy(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Yy=()=>Xy().__FIREBASE_DEFAULTS__,Jy=()=>{if(typeof process>"u"||typeof ju>"u")return;const n=ju.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Zy=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Qy(n[1]);return e&&JSON.parse(e)},uf=()=>{try{return Wy()||Yy()||Jy()||Zy()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},eE=n=>{var e,t;return(t=(e=uf())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},tE=n=>{const e=eE(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]};/**
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
 */function Ec(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function nE(n){return(await fetch(n,{credentials:"include"})).ok}/**
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
 */function rE(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...n};return[qu(JSON.stringify(t)),qu(JSON.stringify(o)),""].join(".")}const Or={};function sE(){const n={prod:[],emulator:[]};for(const e of Object.keys(Or))Or[e]?n.emulator.push(e):n.prod.push(e);return n}function iE(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let Wu=!1;function oE(n,e){if(typeof window>"u"||typeof document>"u"||!Ec(window.location.host)||Or[n]===e||Or[n]||Wu)return;Or[n]=e;function t(m){return`__firebase__banner__${m}`}const r="__firebase__banner",i=sE().prod.length>0;function o(){const m=document.getElementById(r);m&&m.remove()}function c(m){m.style.display="flex",m.style.background="#7faaf0",m.style.position="fixed",m.style.bottom="5px",m.style.left="5px",m.style.padding=".5em",m.style.borderRadius="5px",m.style.alignItems="center"}function l(m,E){m.setAttribute("width","24"),m.setAttribute("id",E),m.setAttribute("height","24"),m.setAttribute("viewBox","0 0 24 24"),m.setAttribute("fill","none"),m.style.marginLeft="-6px"}function h(){const m=document.createElement("span");return m.style.cursor="pointer",m.style.marginLeft="16px",m.style.fontSize="24px",m.innerHTML=" &times;",m.onclick=()=>{Wu=!0,o()},m}function d(m,E){m.setAttribute("id",E),m.innerText="Learn more",m.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",m.setAttribute("target","__blank"),m.style.paddingLeft="5px",m.style.textDecoration="underline"}function p(){const m=iE(r),E=t("text"),A=document.getElementById(E)||document.createElement("span"),N=t("learnmore"),R=document.getElementById(N)||document.createElement("a"),O=t("preprendIcon"),x=document.getElementById(O)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(m.created){const F=m.element;c(F),d(R,N);const z=h();l(x,O),F.append(x,A,R,z),document.body.appendChild(F)}i?(A.innerText="Preview backend disconnected.",x.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
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
 */function aE(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function cE(){var e;const n=(e=uf())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function lE(){return!cE()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}/**
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
 */const uE="FirebaseError";let hf=class df extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=uE,Object.setPrototypeOf(this,df.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,hE.prototype.create)}},hE=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?dE(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new hf(s,c,r)}};function dE(n,e){return n.replace(fE,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const fE=/\{\$([^}]+)}/g;function ff(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(zu(i)&&zu(o)){if(!ff(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function zu(n){return n!==null&&typeof n=="object"}/**
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
 */function Gn(n){return n&&n._delegate?n._delegate:n}let pE=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
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
 */var Z;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(Z||(Z={}));const mE={debug:Z.DEBUG,verbose:Z.VERBOSE,info:Z.INFO,warn:Z.WARN,error:Z.ERROR,silent:Z.SILENT},gE=Z.INFO,_E={[Z.DEBUG]:"log",[Z.VERBOSE]:"log",[Z.INFO]:"info",[Z.WARN]:"warn",[Z.ERROR]:"error"},yE=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=_E[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let EE=class{constructor(e){this.name=e,this._logLevel=gE,this._logHandler=yE,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Z))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?mE[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Z.DEBUG,...e),this._logHandler(this,Z.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Z.VERBOSE,...e),this._logHandler(this,Z.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Z.INFO,...e),this._logHandler(this,Z.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Z.WARN,...e),this._logHandler(this,Z.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Z.ERROR,...e),this._logHandler(this,Z.ERROR,...e)}};var Ku=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Bt,pf;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(w,y){function T(){}T.prototype=y.prototype,w.F=y.prototype,w.prototype=new T,w.prototype.constructor=w,w.D=function(I,v,C){for(var _=Array(arguments.length-2),ie=2;ie<arguments.length;ie++)_[ie-2]=arguments[ie];return y.prototype[v].apply(I,_)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(w,y,T){T||(T=0);const I=Array(16);if(typeof y=="string")for(var v=0;v<16;++v)I[v]=y.charCodeAt(T++)|y.charCodeAt(T++)<<8|y.charCodeAt(T++)<<16|y.charCodeAt(T++)<<24;else for(v=0;v<16;++v)I[v]=y[T++]|y[T++]<<8|y[T++]<<16|y[T++]<<24;y=w.g[0],T=w.g[1],v=w.g[2];let C=w.g[3],_;_=y+(C^T&(v^C))+I[0]+3614090360&4294967295,y=T+(_<<7&4294967295|_>>>25),_=C+(v^y&(T^v))+I[1]+3905402710&4294967295,C=y+(_<<12&4294967295|_>>>20),_=v+(T^C&(y^T))+I[2]+606105819&4294967295,v=C+(_<<17&4294967295|_>>>15),_=T+(y^v&(C^y))+I[3]+3250441966&4294967295,T=v+(_<<22&4294967295|_>>>10),_=y+(C^T&(v^C))+I[4]+4118548399&4294967295,y=T+(_<<7&4294967295|_>>>25),_=C+(v^y&(T^v))+I[5]+1200080426&4294967295,C=y+(_<<12&4294967295|_>>>20),_=v+(T^C&(y^T))+I[6]+2821735955&4294967295,v=C+(_<<17&4294967295|_>>>15),_=T+(y^v&(C^y))+I[7]+4249261313&4294967295,T=v+(_<<22&4294967295|_>>>10),_=y+(C^T&(v^C))+I[8]+1770035416&4294967295,y=T+(_<<7&4294967295|_>>>25),_=C+(v^y&(T^v))+I[9]+2336552879&4294967295,C=y+(_<<12&4294967295|_>>>20),_=v+(T^C&(y^T))+I[10]+4294925233&4294967295,v=C+(_<<17&4294967295|_>>>15),_=T+(y^v&(C^y))+I[11]+2304563134&4294967295,T=v+(_<<22&4294967295|_>>>10),_=y+(C^T&(v^C))+I[12]+1804603682&4294967295,y=T+(_<<7&4294967295|_>>>25),_=C+(v^y&(T^v))+I[13]+4254626195&4294967295,C=y+(_<<12&4294967295|_>>>20),_=v+(T^C&(y^T))+I[14]+2792965006&4294967295,v=C+(_<<17&4294967295|_>>>15),_=T+(y^v&(C^y))+I[15]+1236535329&4294967295,T=v+(_<<22&4294967295|_>>>10),_=y+(v^C&(T^v))+I[1]+4129170786&4294967295,y=T+(_<<5&4294967295|_>>>27),_=C+(T^v&(y^T))+I[6]+3225465664&4294967295,C=y+(_<<9&4294967295|_>>>23),_=v+(y^T&(C^y))+I[11]+643717713&4294967295,v=C+(_<<14&4294967295|_>>>18),_=T+(C^y&(v^C))+I[0]+3921069994&4294967295,T=v+(_<<20&4294967295|_>>>12),_=y+(v^C&(T^v))+I[5]+3593408605&4294967295,y=T+(_<<5&4294967295|_>>>27),_=C+(T^v&(y^T))+I[10]+38016083&4294967295,C=y+(_<<9&4294967295|_>>>23),_=v+(y^T&(C^y))+I[15]+3634488961&4294967295,v=C+(_<<14&4294967295|_>>>18),_=T+(C^y&(v^C))+I[4]+3889429448&4294967295,T=v+(_<<20&4294967295|_>>>12),_=y+(v^C&(T^v))+I[9]+568446438&4294967295,y=T+(_<<5&4294967295|_>>>27),_=C+(T^v&(y^T))+I[14]+3275163606&4294967295,C=y+(_<<9&4294967295|_>>>23),_=v+(y^T&(C^y))+I[3]+4107603335&4294967295,v=C+(_<<14&4294967295|_>>>18),_=T+(C^y&(v^C))+I[8]+1163531501&4294967295,T=v+(_<<20&4294967295|_>>>12),_=y+(v^C&(T^v))+I[13]+2850285829&4294967295,y=T+(_<<5&4294967295|_>>>27),_=C+(T^v&(y^T))+I[2]+4243563512&4294967295,C=y+(_<<9&4294967295|_>>>23),_=v+(y^T&(C^y))+I[7]+1735328473&4294967295,v=C+(_<<14&4294967295|_>>>18),_=T+(C^y&(v^C))+I[12]+2368359562&4294967295,T=v+(_<<20&4294967295|_>>>12),_=y+(T^v^C)+I[5]+4294588738&4294967295,y=T+(_<<4&4294967295|_>>>28),_=C+(y^T^v)+I[8]+2272392833&4294967295,C=y+(_<<11&4294967295|_>>>21),_=v+(C^y^T)+I[11]+1839030562&4294967295,v=C+(_<<16&4294967295|_>>>16),_=T+(v^C^y)+I[14]+4259657740&4294967295,T=v+(_<<23&4294967295|_>>>9),_=y+(T^v^C)+I[1]+2763975236&4294967295,y=T+(_<<4&4294967295|_>>>28),_=C+(y^T^v)+I[4]+1272893353&4294967295,C=y+(_<<11&4294967295|_>>>21),_=v+(C^y^T)+I[7]+4139469664&4294967295,v=C+(_<<16&4294967295|_>>>16),_=T+(v^C^y)+I[10]+3200236656&4294967295,T=v+(_<<23&4294967295|_>>>9),_=y+(T^v^C)+I[13]+681279174&4294967295,y=T+(_<<4&4294967295|_>>>28),_=C+(y^T^v)+I[0]+3936430074&4294967295,C=y+(_<<11&4294967295|_>>>21),_=v+(C^y^T)+I[3]+3572445317&4294967295,v=C+(_<<16&4294967295|_>>>16),_=T+(v^C^y)+I[6]+76029189&4294967295,T=v+(_<<23&4294967295|_>>>9),_=y+(T^v^C)+I[9]+3654602809&4294967295,y=T+(_<<4&4294967295|_>>>28),_=C+(y^T^v)+I[12]+3873151461&4294967295,C=y+(_<<11&4294967295|_>>>21),_=v+(C^y^T)+I[15]+530742520&4294967295,v=C+(_<<16&4294967295|_>>>16),_=T+(v^C^y)+I[2]+3299628645&4294967295,T=v+(_<<23&4294967295|_>>>9),_=y+(v^(T|~C))+I[0]+4096336452&4294967295,y=T+(_<<6&4294967295|_>>>26),_=C+(T^(y|~v))+I[7]+1126891415&4294967295,C=y+(_<<10&4294967295|_>>>22),_=v+(y^(C|~T))+I[14]+2878612391&4294967295,v=C+(_<<15&4294967295|_>>>17),_=T+(C^(v|~y))+I[5]+4237533241&4294967295,T=v+(_<<21&4294967295|_>>>11),_=y+(v^(T|~C))+I[12]+1700485571&4294967295,y=T+(_<<6&4294967295|_>>>26),_=C+(T^(y|~v))+I[3]+2399980690&4294967295,C=y+(_<<10&4294967295|_>>>22),_=v+(y^(C|~T))+I[10]+4293915773&4294967295,v=C+(_<<15&4294967295|_>>>17),_=T+(C^(v|~y))+I[1]+2240044497&4294967295,T=v+(_<<21&4294967295|_>>>11),_=y+(v^(T|~C))+I[8]+1873313359&4294967295,y=T+(_<<6&4294967295|_>>>26),_=C+(T^(y|~v))+I[15]+4264355552&4294967295,C=y+(_<<10&4294967295|_>>>22),_=v+(y^(C|~T))+I[6]+2734768916&4294967295,v=C+(_<<15&4294967295|_>>>17),_=T+(C^(v|~y))+I[13]+1309151649&4294967295,T=v+(_<<21&4294967295|_>>>11),_=y+(v^(T|~C))+I[4]+4149444226&4294967295,y=T+(_<<6&4294967295|_>>>26),_=C+(T^(y|~v))+I[11]+3174756917&4294967295,C=y+(_<<10&4294967295|_>>>22),_=v+(y^(C|~T))+I[2]+718787259&4294967295,v=C+(_<<15&4294967295|_>>>17),_=T+(C^(v|~y))+I[9]+3951481745&4294967295,w.g[0]=w.g[0]+y&4294967295,w.g[1]=w.g[1]+(v+(_<<21&4294967295|_>>>11))&4294967295,w.g[2]=w.g[2]+v&4294967295,w.g[3]=w.g[3]+C&4294967295}r.prototype.v=function(w,y){y===void 0&&(y=w.length);const T=y-this.blockSize,I=this.C;let v=this.h,C=0;for(;C<y;){if(v==0)for(;C<=T;)s(this,w,C),C+=this.blockSize;if(typeof w=="string"){for(;C<y;)if(I[v++]=w.charCodeAt(C++),v==this.blockSize){s(this,I),v=0;break}}else for(;C<y;)if(I[v++]=w[C++],v==this.blockSize){s(this,I),v=0;break}}this.h=v,this.o+=y},r.prototype.A=function(){var w=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);w[0]=128;for(var y=1;y<w.length-8;++y)w[y]=0;y=this.o*8;for(var T=w.length-8;T<w.length;++T)w[T]=y&255,y/=256;for(this.v(w),w=Array(16),y=0,T=0;T<4;++T)for(let I=0;I<32;I+=8)w[y++]=this.g[T]>>>I&255;return w};function i(w,y){var T=c;return Object.prototype.hasOwnProperty.call(T,w)?T[w]:T[w]=y(w)}function o(w,y){this.h=y;const T=[];let I=!0;for(let v=w.length-1;v>=0;v--){const C=w[v]|0;I&&C==y||(T[v]=C,I=!1)}this.g=T}var c={};function l(w){return-128<=w&&w<128?i(w,function(y){return new o([y|0],y<0?-1:0)}):new o([w|0],w<0?-1:0)}function h(w){if(isNaN(w)||!isFinite(w))return p;if(w<0)return R(h(-w));const y=[];let T=1;for(let I=0;w>=T;I++)y[I]=w/T|0,T*=4294967296;return new o(y,0)}function d(w,y){if(w.length==0)throw Error("number format error: empty string");if(y=y||10,y<2||36<y)throw Error("radix out of range: "+y);if(w.charAt(0)=="-")return R(d(w.substring(1),y));if(w.indexOf("-")>=0)throw Error('number format error: interior "-" character');const T=h(Math.pow(y,8));let I=p;for(let C=0;C<w.length;C+=8){var v=Math.min(8,w.length-C);const _=parseInt(w.substring(C,C+v),y);v<8?(v=h(Math.pow(y,v)),I=I.j(v).add(h(_))):(I=I.j(T),I=I.add(h(_)))}return I}var p=l(0),m=l(1),E=l(16777216);n=o.prototype,n.m=function(){if(N(this))return-R(this).m();let w=0,y=1;for(let T=0;T<this.g.length;T++){const I=this.i(T);w+=(I>=0?I:4294967296+I)*y,y*=4294967296}return w},n.toString=function(w){if(w=w||10,w<2||36<w)throw Error("radix out of range: "+w);if(A(this))return"0";if(N(this))return"-"+R(this).toString(w);const y=h(Math.pow(w,6));var T=this;let I="";for(;;){const v=z(T,y).g;T=O(T,v.j(y));let C=((T.g.length>0?T.g[0]:T.h)>>>0).toString(w);if(T=v,A(T))return C+I;for(;C.length<6;)C="0"+C;I=C+I}},n.i=function(w){return w<0?0:w<this.g.length?this.g[w]:this.h};function A(w){if(w.h!=0)return!1;for(let y=0;y<w.g.length;y++)if(w.g[y]!=0)return!1;return!0}function N(w){return w.h==-1}n.l=function(w){return w=O(this,w),N(w)?-1:A(w)?0:1};function R(w){const y=w.g.length,T=[];for(let I=0;I<y;I++)T[I]=~w.g[I];return new o(T,~w.h).add(m)}n.abs=function(){return N(this)?R(this):this},n.add=function(w){const y=Math.max(this.g.length,w.g.length),T=[];let I=0;for(let v=0;v<=y;v++){let C=I+(this.i(v)&65535)+(w.i(v)&65535),_=(C>>>16)+(this.i(v)>>>16)+(w.i(v)>>>16);I=_>>>16,C&=65535,_&=65535,T[v]=_<<16|C}return new o(T,T[T.length-1]&-2147483648?-1:0)};function O(w,y){return w.add(R(y))}n.j=function(w){if(A(this)||A(w))return p;if(N(this))return N(w)?R(this).j(R(w)):R(R(this).j(w));if(N(w))return R(this.j(R(w)));if(this.l(E)<0&&w.l(E)<0)return h(this.m()*w.m());const y=this.g.length+w.g.length,T=[];for(var I=0;I<2*y;I++)T[I]=0;for(I=0;I<this.g.length;I++)for(let v=0;v<w.g.length;v++){const C=this.i(I)>>>16,_=this.i(I)&65535,ie=w.i(v)>>>16,Le=w.i(v)&65535;T[2*I+2*v]+=_*Le,x(T,2*I+2*v),T[2*I+2*v+1]+=C*Le,x(T,2*I+2*v+1),T[2*I+2*v+1]+=_*ie,x(T,2*I+2*v+1),T[2*I+2*v+2]+=C*ie,x(T,2*I+2*v+2)}for(w=0;w<y;w++)T[w]=T[2*w+1]<<16|T[2*w];for(w=y;w<2*y;w++)T[w]=0;return new o(T,0)};function x(w,y){for(;(w[y]&65535)!=w[y];)w[y+1]+=w[y]>>>16,w[y]&=65535,y++}function F(w,y){this.g=w,this.h=y}function z(w,y){if(A(y))throw Error("division by zero");if(A(w))return new F(p,p);if(N(w))return y=z(R(w),y),new F(R(y.g),R(y.h));if(N(y))return y=z(w,R(y)),new F(R(y.g),y.h);if(w.g.length>30){if(N(w)||N(y))throw Error("slowDivide_ only works with positive integers.");for(var T=m,I=y;I.l(w)<=0;)T=ne(T),I=ne(I);var v=Q(T,1),C=Q(I,1);for(I=Q(I,2),T=Q(T,2);!A(I);){var _=C.add(I);_.l(w)<=0&&(v=v.add(T),C=_),I=Q(I,1),T=Q(T,1)}return y=O(w,v.j(y)),new F(v,y)}for(v=p;w.l(y)>=0;){for(T=Math.max(1,Math.floor(w.m()/y.m())),I=Math.ceil(Math.log(T)/Math.LN2),I=I<=48?1:Math.pow(2,I-48),C=h(T),_=C.j(y);N(_)||_.l(w)>0;)T-=I,C=h(T),_=C.j(y);A(C)&&(C=m),v=v.add(C),w=O(w,_)}return new F(v,w)}n.B=function(w){return z(this,w).h},n.and=function(w){const y=Math.max(this.g.length,w.g.length),T=[];for(let I=0;I<y;I++)T[I]=this.i(I)&w.i(I);return new o(T,this.h&w.h)},n.or=function(w){const y=Math.max(this.g.length,w.g.length),T=[];for(let I=0;I<y;I++)T[I]=this.i(I)|w.i(I);return new o(T,this.h|w.h)},n.xor=function(w){const y=Math.max(this.g.length,w.g.length),T=[];for(let I=0;I<y;I++)T[I]=this.i(I)^w.i(I);return new o(T,this.h^w.h)};function ne(w){const y=w.g.length+1,T=[];for(let I=0;I<y;I++)T[I]=w.i(I)<<1|w.i(I-1)>>>31;return new o(T,w.h)}function Q(w,y){const T=y>>5;y%=32;const I=w.g.length-T,v=[];for(let C=0;C<I;C++)v[C]=y>0?w.i(C+T)>>>y|w.i(C+T+1)<<32-y:w.i(C+T);return new o(v,w.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,pf=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=d,Bt=o}).apply(typeof Ku<"u"?Ku:typeof self<"u"?self:typeof window<"u"?window:{});var Os=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var mf,br,gf,Xs,Oa,_f,yf,Ef;(function(){var n,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Os=="object"&&Os];for(var u=0;u<a.length;++u){var f=a[u];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var r=t(this);function s(a,u){if(u)e:{var f=r;a=a.split(".");for(var g=0;g<a.length-1;g++){var S=a[g];if(!(S in f))break e;f=f[S]}a=a[a.length-1],g=f[a],u=u(g),u!=g&&u!=null&&e(f,a,{configurable:!0,writable:!0,value:u})}}s("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(a){return a||function(u){var f=[],g;for(g in u)Object.prototype.hasOwnProperty.call(u,g)&&f.push([g,u[g]]);return f}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function c(a){var u=typeof a;return u=="object"&&a!=null||u=="function"}function l(a,u,f){return a.call.apply(a.bind,arguments)}function h(a,u,f){return h=l,h.apply(null,arguments)}function d(a,u){var f=Array.prototype.slice.call(arguments,1);return function(){var g=f.slice();return g.push.apply(g,arguments),a.apply(this,g)}}function p(a,u){function f(){}f.prototype=u.prototype,a.Z=u.prototype,a.prototype=new f,a.prototype.constructor=a,a.Ob=function(g,S,b){for(var D=Array(arguments.length-2),K=2;K<arguments.length;K++)D[K-2]=arguments[K];return u.prototype[S].apply(g,D)}}var m=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function E(a){const u=a.length;if(u>0){const f=Array(u);for(let g=0;g<u;g++)f[g]=a[g];return f}return[]}function A(a,u){for(let g=1;g<arguments.length;g++){const S=arguments[g];var f=typeof S;if(f=f!="object"?f:S?Array.isArray(S)?"array":f:"null",f=="array"||f=="object"&&typeof S.length=="number"){f=a.length||0;const b=S.length||0;a.length=f+b;for(let D=0;D<b;D++)a[f+D]=S[D]}else a.push(S)}}class N{constructor(u,f){this.i=u,this.j=f,this.h=0,this.g=null}get(){let u;return this.h>0?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function R(a){o.setTimeout(()=>{throw a},0)}function O(){var a=w;let u=null;return a.g&&(u=a.g,a.g=a.g.next,a.g||(a.h=null),u.next=null),u}class x{constructor(){this.h=this.g=null}add(u,f){const g=F.get();g.set(u,f),this.h?this.h.next=g:this.g=g,this.h=g}}var F=new N(()=>new z,a=>a.reset());class z{constructor(){this.next=this.g=this.h=null}set(u,f){this.h=u,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let ne,Q=!1,w=new x,y=()=>{const a=Promise.resolve(void 0);ne=()=>{a.then(T)}};function T(){for(var a;a=O();){try{a.h.call(a.g)}catch(f){R(f)}var u=F;u.j(a),u.h<100&&(u.h++,a.next=u.g,u.g=a)}Q=!1}function I(){this.u=this.u,this.C=this.C}I.prototype.u=!1,I.prototype.dispose=function(){this.u||(this.u=!0,this.N())},I.prototype[Symbol.dispose]=function(){this.dispose()},I.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function v(a,u){this.type=a,this.g=this.target=u,this.defaultPrevented=!1}v.prototype.h=function(){this.defaultPrevented=!0};var C=function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,u=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const f=()=>{};o.addEventListener("test",f,u),o.removeEventListener("test",f,u)}catch{}return a}();function _(a){return/^[\s\xa0]*$/.test(a)}function ie(a,u){v.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,u)}p(ie,v),ie.prototype.init=function(a,u){const f=this.type=a.type,g=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=u,u=a.relatedTarget,u||(f=="mouseover"?u=a.fromElement:f=="mouseout"&&(u=a.toElement)),this.relatedTarget=u,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&ie.Z.h.call(this)},ie.prototype.h=function(){ie.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Le="closure_listenable_"+(Math.random()*1e6|0),No=0;function ur(a,u,f,g,S){this.listener=a,this.proxy=null,this.src=u,this.type=f,this.capture=!!g,this.ha=S,this.key=++No,this.da=this.fa=!1}function ys(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function Es(a,u,f){for(const g in a)u.call(f,a[g],g,a)}function yg(a,u){for(const f in a)u.call(void 0,a[f],f,a)}function Cl(a){const u={};for(const f in a)u[f]=a[f];return u}const bl="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Rl(a,u){let f,g;for(let S=1;S<arguments.length;S++){g=arguments[S];for(f in g)a[f]=g[f];for(let b=0;b<bl.length;b++)f=bl[b],Object.prototype.hasOwnProperty.call(g,f)&&(a[f]=g[f])}}function Ts(a){this.src=a,this.g={},this.h=0}Ts.prototype.add=function(a,u,f,g,S){const b=a.toString();a=this.g[b],a||(a=this.g[b]=[],this.h++);const D=Lo(a,u,g,S);return D>-1?(u=a[D],f||(u.fa=!1)):(u=new ur(u,this.src,b,!!g,S),u.fa=f,a.push(u)),u};function Mo(a,u){const f=u.type;if(f in a.g){var g=a.g[f],S=Array.prototype.indexOf.call(g,u,void 0),b;(b=S>=0)&&Array.prototype.splice.call(g,S,1),b&&(ys(u),a.g[f].length==0&&(delete a.g[f],a.h--))}}function Lo(a,u,f,g){for(let S=0;S<a.length;++S){const b=a[S];if(!b.da&&b.listener==u&&b.capture==!!f&&b.ha==g)return S}return-1}var Do="closure_lm_"+(Math.random()*1e6|0),Oo={};function Pl(a,u,f,g,S){if(Array.isArray(u)){for(let b=0;b<u.length;b++)Pl(a,u[b],f,g,S);return null}return f=Ml(f),a&&a[Le]?a.J(u,f,c(g)?!!g.capture:!1,S):Eg(a,u,f,!1,g,S)}function Eg(a,u,f,g,S,b){if(!u)throw Error("Invalid event type");const D=c(S)?!!S.capture:!!S;let K=xo(a);if(K||(a[Do]=K=new Ts(a)),f=K.add(u,f,g,D,b),f.proxy)return f;if(g=Tg(),f.proxy=g,g.src=a,g.listener=f,a.addEventListener)C||(S=D),S===void 0&&(S=!1),a.addEventListener(u.toString(),g,S);else if(a.attachEvent)a.attachEvent(Nl(u.toString()),g);else if(a.addListener&&a.removeListener)a.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return f}function Tg(){function a(f){return u.call(a.src,a.listener,f)}const u=wg;return a}function kl(a,u,f,g,S){if(Array.isArray(u))for(var b=0;b<u.length;b++)kl(a,u[b],f,g,S);else g=c(g)?!!g.capture:!!g,f=Ml(f),a&&a[Le]?(a=a.i,b=String(u).toString(),b in a.g&&(u=a.g[b],f=Lo(u,f,g,S),f>-1&&(ys(u[f]),Array.prototype.splice.call(u,f,1),u.length==0&&(delete a.g[b],a.h--)))):a&&(a=xo(a))&&(u=a.g[u.toString()],a=-1,u&&(a=Lo(u,f,g,S)),(f=a>-1?u[a]:null)&&Vo(f))}function Vo(a){if(typeof a!="number"&&a&&!a.da){var u=a.src;if(u&&u[Le])Mo(u.i,a);else{var f=a.type,g=a.proxy;u.removeEventListener?u.removeEventListener(f,g,a.capture):u.detachEvent?u.detachEvent(Nl(f),g):u.addListener&&u.removeListener&&u.removeListener(g),(f=xo(u))?(Mo(f,a),f.h==0&&(f.src=null,u[Do]=null)):ys(a)}}}function Nl(a){return a in Oo?Oo[a]:Oo[a]="on"+a}function wg(a,u){if(a.da)a=!0;else{u=new ie(u,this);const f=a.listener,g=a.ha||a.src;a.fa&&Vo(a),a=f.call(g,u)}return a}function xo(a){return a=a[Do],a instanceof Ts?a:null}var Fo="__closure_events_fn_"+(Math.random()*1e9>>>0);function Ml(a){return typeof a=="function"?a:(a[Fo]||(a[Fo]=function(u){return a.handleEvent(u)}),a[Fo])}function Pe(){I.call(this),this.i=new Ts(this),this.M=this,this.G=null}p(Pe,I),Pe.prototype[Le]=!0,Pe.prototype.removeEventListener=function(a,u,f,g){kl(this,a,u,f,g)};function De(a,u){var f,g=a.G;if(g)for(f=[];g;g=g.G)f.push(g);if(a=a.M,g=u.type||u,typeof u=="string")u=new v(u,a);else if(u instanceof v)u.target=u.target||a;else{var S=u;u=new v(g,a),Rl(u,S)}S=!0;let b,D;if(f)for(D=f.length-1;D>=0;D--)b=u.g=f[D],S=ws(b,g,!0,u)&&S;if(b=u.g=a,S=ws(b,g,!0,u)&&S,S=ws(b,g,!1,u)&&S,f)for(D=0;D<f.length;D++)b=u.g=f[D],S=ws(b,g,!1,u)&&S}Pe.prototype.N=function(){if(Pe.Z.N.call(this),this.i){var a=this.i;for(const u in a.g){const f=a.g[u];for(let g=0;g<f.length;g++)ys(f[g]);delete a.g[u],a.h--}}this.G=null},Pe.prototype.J=function(a,u,f,g){return this.i.add(String(a),u,!1,f,g)},Pe.prototype.K=function(a,u,f,g){return this.i.add(String(a),u,!0,f,g)};function ws(a,u,f,g){if(u=a.i.g[String(u)],!u)return!0;u=u.concat();let S=!0;for(let b=0;b<u.length;++b){const D=u[b];if(D&&!D.da&&D.capture==f){const K=D.listener,me=D.ha||D.src;D.fa&&Mo(a.i,D),S=K.call(me,g)!==!1&&S}}return S&&!g.defaultPrevented}function vg(a,u){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=h(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(u)>2147483647?-1:o.setTimeout(a,u||0)}function Ll(a){a.g=vg(()=>{a.g=null,a.i&&(a.i=!1,Ll(a))},a.l);const u=a.h;a.h=null,a.m.apply(null,u)}class Ig extends I{constructor(u,f){super(),this.m=u,this.l=f,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:Ll(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function hr(a){I.call(this),this.h=a,this.g={}}p(hr,I);var Dl=[];function Ol(a){Es(a.g,function(u,f){this.g.hasOwnProperty(f)&&Vo(u)},a),a.g={}}hr.prototype.N=function(){hr.Z.N.call(this),Ol(this)},hr.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Bo=o.JSON.stringify,Ag=o.JSON.parse,Sg=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function Vl(){}function xl(){}var dr={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Uo(){v.call(this,"d")}p(Uo,v);function $o(){v.call(this,"c")}p($o,v);var Jt={},Fl=null;function vs(){return Fl=Fl||new Pe}Jt.Ia="serverreachability";function Bl(a){v.call(this,Jt.Ia,a)}p(Bl,v);function fr(a){const u=vs();De(u,new Bl(u))}Jt.STAT_EVENT="statevent";function Ul(a,u){v.call(this,Jt.STAT_EVENT,a),this.stat=u}p(Ul,v);function Oe(a){const u=vs();De(u,new Ul(u,a))}Jt.Ja="timingevent";function $l(a,u){v.call(this,Jt.Ja,a),this.size=u}p($l,v);function pr(a,u){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},u)}function mr(){this.g=!0}mr.prototype.ua=function(){this.g=!1};function Cg(a,u,f,g,S,b){a.info(function(){if(a.g)if(b){var D="",K=b.split("&");for(let re=0;re<K.length;re++){var me=K[re].split("=");if(me.length>1){const ve=me[0];me=me[1];const Xe=ve.split("_");D=Xe.length>=2&&Xe[1]=="type"?D+(ve+"="+me+"&"):D+(ve+"=redacted&")}}}else D=null;else D=b;return"XMLHTTP REQ ("+g+") [attempt "+S+"]: "+u+`
`+f+`
`+D})}function bg(a,u,f,g,S,b,D){a.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+S+"]: "+u+`
`+f+`
`+b+" "+D})}function In(a,u,f,g){a.info(function(){return"XMLHTTP TEXT ("+u+"): "+Pg(a,f)+(g?" "+g:"")})}function Rg(a,u){a.info(function(){return"TIMEOUT: "+u})}mr.prototype.info=function(){};function Pg(a,u){if(!a.g)return u;if(!u)return null;try{const b=JSON.parse(u);if(b){for(a=0;a<b.length;a++)if(Array.isArray(b[a])){var f=b[a];if(!(f.length<2)){var g=f[1];if(Array.isArray(g)&&!(g.length<1)){var S=g[0];if(S!="noop"&&S!="stop"&&S!="close")for(let D=1;D<g.length;D++)g[D]=""}}}}return Bo(b)}catch{return u}}var Is={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Hl={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},jl;function Ho(){}p(Ho,Vl),Ho.prototype.g=function(){return new XMLHttpRequest},jl=new Ho;function gr(a){return encodeURIComponent(String(a))}function kg(a){var u=1;a=a.split(":");const f=[];for(;u>0&&a.length;)f.push(a.shift()),u--;return a.length&&f.push(a.join(":")),f}function wt(a,u,f,g){this.j=a,this.i=u,this.l=f,this.S=g||1,this.V=new hr(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new ql}function ql(){this.i=null,this.g="",this.h=!1}var Wl={},jo={};function qo(a,u,f){a.M=1,a.A=Ss(Qe(u)),a.u=f,a.R=!0,zl(a,null)}function zl(a,u){a.F=Date.now(),As(a),a.B=Qe(a.A);var f=a.B,g=a.S;Array.isArray(g)||(g=[String(g)]),iu(f.i,"t",g),a.C=0,f=a.j.L,a.h=new ql,a.g=Iu(a.j,f?u:null,!a.u),a.P>0&&(a.O=new Ig(h(a.Y,a,a.g),a.P)),u=a.V,f=a.g,g=a.ba;var S="readystatechange";Array.isArray(S)||(S&&(Dl[0]=S.toString()),S=Dl);for(let b=0;b<S.length;b++){const D=Pl(f,S[b],g||u.handleEvent,!1,u.h||u);if(!D)break;u.g[D.key]=D}u=a.J?Cl(a.J):{},a.u?(a.v||(a.v="POST"),u["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,u)):(a.v="GET",a.g.ea(a.B,a.v,null,u)),fr(),Cg(a.i,a.v,a.B,a.l,a.S,a.u)}wt.prototype.ba=function(a){a=a.target;const u=this.O;u&&At(a)==3?u.j():this.Y(a)},wt.prototype.Y=function(a){try{if(a==this.g)e:{const K=At(this.g),me=this.g.ya(),re=this.g.ca();if(!(K<3)&&(K!=3||this.g&&(this.h.h||this.g.la()||du(this.g)))){this.K||K!=4||me==7||(me==8||re<=0?fr(3):fr(2)),Wo(this);var u=this.g.ca();this.X=u;var f=Ng(this);if(this.o=u==200,bg(this.i,this.v,this.B,this.l,this.S,K,u),this.o){if(this.U&&!this.L){t:{if(this.g){var g,S=this.g;if((g=S.g?S.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!_(g)){var b=g;break t}}b=null}if(a=b)In(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,zo(this,a);else{this.o=!1,this.m=3,Oe(12),Zt(this),_r(this);break e}}if(this.R){a=!0;let ve;for(;!this.K&&this.C<f.length;)if(ve=Mg(this,f),ve==jo){K==4&&(this.m=4,Oe(14),a=!1),In(this.i,this.l,null,"[Incomplete Response]");break}else if(ve==Wl){this.m=4,Oe(15),In(this.i,this.l,f,"[Invalid Chunk]"),a=!1;break}else In(this.i,this.l,ve,null),zo(this,ve);if(Kl(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),K!=4||f.length!=0||this.h.h||(this.m=1,Oe(16),a=!1),this.o=this.o&&a,!a)In(this.i,this.l,f,"[Invalid Chunked Response]"),Zt(this),_r(this);else if(f.length>0&&!this.W){this.W=!0;var D=this.j;D.g==this&&D.aa&&!D.P&&(D.j.info("Great, no buffering proxy detected. Bytes received: "+f.length),ea(D),D.P=!0,Oe(11))}}else In(this.i,this.l,f,null),zo(this,f);K==4&&Zt(this),this.o&&!this.K&&(K==4?Eu(this.j,this):(this.o=!1,As(this)))}else zg(this.g),u==400&&f.indexOf("Unknown SID")>0?(this.m=3,Oe(12)):(this.m=0,Oe(13)),Zt(this),_r(this)}}}catch{}finally{}};function Ng(a){if(!Kl(a))return a.g.la();const u=du(a.g);if(u==="")return"";let f="";const g=u.length,S=At(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return Zt(a),_r(a),"";a.h.i=new o.TextDecoder}for(let b=0;b<g;b++)a.h.h=!0,f+=a.h.i.decode(u[b],{stream:!(S&&b==g-1)});return u.length=0,a.h.g+=f,a.C=0,a.h.g}function Kl(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function Mg(a,u){var f=a.C,g=u.indexOf(`
`,f);return g==-1?jo:(f=Number(u.substring(f,g)),isNaN(f)?Wl:(g+=1,g+f>u.length?jo:(u=u.slice(g,g+f),a.C=g+f,u)))}wt.prototype.cancel=function(){this.K=!0,Zt(this)};function As(a){a.T=Date.now()+a.H,Gl(a,a.H)}function Gl(a,u){if(a.D!=null)throw Error("WatchDog timer not null");a.D=pr(h(a.aa,a),u)}function Wo(a){a.D&&(o.clearTimeout(a.D),a.D=null)}wt.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(Rg(this.i,this.B),this.M!=2&&(fr(),Oe(17)),Zt(this),this.m=2,_r(this)):Gl(this,this.T-a)};function _r(a){a.j.I==0||a.K||Eu(a.j,a)}function Zt(a){Wo(a);var u=a.O;u&&typeof u.dispose=="function"&&u.dispose(),a.O=null,Ol(a.V),a.g&&(u=a.g,a.g=null,u.abort(),u.dispose())}function zo(a,u){try{var f=a.j;if(f.I!=0&&(f.g==a||Ko(f.h,a))){if(!a.L&&Ko(f.h,a)&&f.I==3){try{var g=f.Ba.g.parse(u)}catch{g=null}if(Array.isArray(g)&&g.length==3){var S=g;if(S[0]==0){e:if(!f.v){if(f.g)if(f.g.F+3e3<a.F)ks(f),Rs(f);else break e;Zo(f),Oe(18)}}else f.xa=S[1],0<f.xa-f.K&&S[2]<37500&&f.F&&f.A==0&&!f.C&&(f.C=pr(h(f.Va,f),6e3));Yl(f.h)<=1&&f.ta&&(f.ta=void 0)}else tn(f,11)}else if((a.L||f.g==a)&&ks(f),!_(u))for(S=f.Ba.g.parse(u),u=0;u<S.length;u++){let re=S[u];const ve=re[0];if(!(ve<=f.K))if(f.K=ve,re=re[1],f.I==2)if(re[0]=="c"){f.M=re[1],f.ba=re[2];const Xe=re[3];Xe!=null&&(f.ka=Xe,f.j.info("VER="+f.ka));const nn=re[4];nn!=null&&(f.za=nn,f.j.info("SVER="+f.za));const St=re[5];St!=null&&typeof St=="number"&&St>0&&(g=1.5*St,f.O=g,f.j.info("backChannelRequestTimeoutMs_="+g)),g=f;const Ct=a.g;if(Ct){const Ms=Ct.g?Ct.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ms){var b=g.h;b.g||Ms.indexOf("spdy")==-1&&Ms.indexOf("quic")==-1&&Ms.indexOf("h2")==-1||(b.j=b.l,b.g=new Set,b.h&&(Go(b,b.h),b.h=null))}if(g.G){const ta=Ct.g?Ct.g.getResponseHeader("X-HTTP-Session-Id"):null;ta&&(g.wa=ta,oe(g.J,g.G,ta))}}f.I=3,f.l&&f.l.ra(),f.aa&&(f.T=Date.now()-a.F,f.j.info("Handshake RTT: "+f.T+"ms")),g=f;var D=a;if(g.na=vu(g,g.L?g.ba:null,g.W),D.L){Jl(g.h,D);var K=D,me=g.O;me&&(K.H=me),K.D&&(Wo(K),As(K)),g.g=D}else _u(g);f.i.length>0&&Ps(f)}else re[0]!="stop"&&re[0]!="close"||tn(f,7);else f.I==3&&(re[0]=="stop"||re[0]=="close"?re[0]=="stop"?tn(f,7):Jo(f):re[0]!="noop"&&f.l&&f.l.qa(re),f.A=0)}}fr(4)}catch{}}var Lg=class{constructor(a,u){this.g=a,this.map=u}};function Ql(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Xl(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Yl(a){return a.h?1:a.g?a.g.size:0}function Ko(a,u){return a.h?a.h==u:a.g?a.g.has(u):!1}function Go(a,u){a.g?a.g.add(u):a.h=u}function Jl(a,u){a.h&&a.h==u?a.h=null:a.g&&a.g.has(u)&&a.g.delete(u)}Ql.prototype.cancel=function(){if(this.i=Zl(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function Zl(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let u=a.i;for(const f of a.g.values())u=u.concat(f.G);return u}return E(a.i)}var eu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Dg(a,u){if(a){a=a.split("&");for(let f=0;f<a.length;f++){const g=a[f].indexOf("=");let S,b=null;g>=0?(S=a[f].substring(0,g),b=a[f].substring(g+1)):S=a[f],u(S,b?decodeURIComponent(b.replace(/\+/g," ")):"")}}}function vt(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let u;a instanceof vt?(this.l=a.l,yr(this,a.j),this.o=a.o,this.g=a.g,Er(this,a.u),this.h=a.h,Qo(this,ou(a.i)),this.m=a.m):a&&(u=String(a).match(eu))?(this.l=!1,yr(this,u[1]||"",!0),this.o=Tr(u[2]||""),this.g=Tr(u[3]||"",!0),Er(this,u[4]),this.h=Tr(u[5]||"",!0),Qo(this,u[6]||"",!0),this.m=Tr(u[7]||"")):(this.l=!1,this.i=new vr(null,this.l))}vt.prototype.toString=function(){const a=[];var u=this.j;u&&a.push(wr(u,tu,!0),":");var f=this.g;return(f||u=="file")&&(a.push("//"),(u=this.o)&&a.push(wr(u,tu,!0),"@"),a.push(gr(f).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.u,f!=null&&a.push(":",String(f))),(f=this.h)&&(this.g&&f.charAt(0)!="/"&&a.push("/"),a.push(wr(f,f.charAt(0)=="/"?xg:Vg,!0))),(f=this.i.toString())&&a.push("?",f),(f=this.m)&&a.push("#",wr(f,Bg)),a.join("")},vt.prototype.resolve=function(a){const u=Qe(this);let f=!!a.j;f?yr(u,a.j):f=!!a.o,f?u.o=a.o:f=!!a.g,f?u.g=a.g:f=a.u!=null;var g=a.h;if(f)Er(u,a.u);else if(f=!!a.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var S=u.h.lastIndexOf("/");S!=-1&&(g=u.h.slice(0,S+1)+g)}if(S=g,S==".."||S==".")g="";else if(S.indexOf("./")!=-1||S.indexOf("/.")!=-1){g=S.lastIndexOf("/",0)==0,S=S.split("/");const b=[];for(let D=0;D<S.length;){const K=S[D++];K=="."?g&&D==S.length&&b.push(""):K==".."?((b.length>1||b.length==1&&b[0]!="")&&b.pop(),g&&D==S.length&&b.push("")):(b.push(K),g=!0)}g=b.join("/")}else g=S}return f?u.h=g:f=a.i.toString()!=="",f?Qo(u,ou(a.i)):f=!!a.m,f&&(u.m=a.m),u};function Qe(a){return new vt(a)}function yr(a,u,f){a.j=f?Tr(u,!0):u,a.j&&(a.j=a.j.replace(/:$/,""))}function Er(a,u){if(u){if(u=Number(u),isNaN(u)||u<0)throw Error("Bad port number "+u);a.u=u}else a.u=null}function Qo(a,u,f){u instanceof vr?(a.i=u,Ug(a.i,a.l)):(f||(u=wr(u,Fg)),a.i=new vr(u,a.l))}function oe(a,u,f){a.i.set(u,f)}function Ss(a){return oe(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function Tr(a,u){return a?u?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function wr(a,u,f){return typeof a=="string"?(a=encodeURI(a).replace(u,Og),f&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Og(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var tu=/[#\/\?@]/g,Vg=/[#\?:]/g,xg=/[#\?]/g,Fg=/[#\?@]/g,Bg=/#/g;function vr(a,u){this.h=this.g=null,this.i=a||null,this.j=!!u}function en(a){a.g||(a.g=new Map,a.h=0,a.i&&Dg(a.i,function(u,f){a.add(decodeURIComponent(u.replace(/\+/g," ")),f)}))}n=vr.prototype,n.add=function(a,u){en(this),this.i=null,a=An(this,a);let f=this.g.get(a);return f||this.g.set(a,f=[]),f.push(u),this.h+=1,this};function nu(a,u){en(a),u=An(a,u),a.g.has(u)&&(a.i=null,a.h-=a.g.get(u).length,a.g.delete(u))}function ru(a,u){return en(a),u=An(a,u),a.g.has(u)}n.forEach=function(a,u){en(this),this.g.forEach(function(f,g){f.forEach(function(S){a.call(u,S,g,this)},this)},this)};function su(a,u){en(a);let f=[];if(typeof u=="string")ru(a,u)&&(f=f.concat(a.g.get(An(a,u))));else for(a=Array.from(a.g.values()),u=0;u<a.length;u++)f=f.concat(a[u]);return f}n.set=function(a,u){return en(this),this.i=null,a=An(this,a),ru(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[u]),this.h+=1,this},n.get=function(a,u){return a?(a=su(this,a),a.length>0?String(a[0]):u):u};function iu(a,u,f){nu(a,u),f.length>0&&(a.i=null,a.g.set(An(a,u),E(f)),a.h+=f.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],u=Array.from(this.g.keys());for(let g=0;g<u.length;g++){var f=u[g];const S=gr(f);f=su(this,f);for(let b=0;b<f.length;b++){let D=S;f[b]!==""&&(D+="="+gr(f[b])),a.push(D)}}return this.i=a.join("&")};function ou(a){const u=new vr;return u.i=a.i,a.g&&(u.g=new Map(a.g),u.h=a.h),u}function An(a,u){return u=String(u),a.j&&(u=u.toLowerCase()),u}function Ug(a,u){u&&!a.j&&(en(a),a.i=null,a.g.forEach(function(f,g){const S=g.toLowerCase();g!=S&&(nu(this,g),iu(this,S,f))},a)),a.j=u}function $g(a,u){const f=new mr;if(o.Image){const g=new Image;g.onload=d(It,f,"TestLoadImage: loaded",!0,u,g),g.onerror=d(It,f,"TestLoadImage: error",!1,u,g),g.onabort=d(It,f,"TestLoadImage: abort",!1,u,g),g.ontimeout=d(It,f,"TestLoadImage: timeout",!1,u,g),o.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=a}else u(!1)}function Hg(a,u){const f=new mr,g=new AbortController,S=setTimeout(()=>{g.abort(),It(f,"TestPingServer: timeout",!1,u)},1e4);fetch(a,{signal:g.signal}).then(b=>{clearTimeout(S),b.ok?It(f,"TestPingServer: ok",!0,u):It(f,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(S),It(f,"TestPingServer: error",!1,u)})}function It(a,u,f,g,S){try{S&&(S.onload=null,S.onerror=null,S.onabort=null,S.ontimeout=null),g(f)}catch{}}function jg(){this.g=new Sg}function Xo(a){this.i=a.Sb||null,this.h=a.ab||!1}p(Xo,Vl),Xo.prototype.g=function(){return new Cs(this.i,this.h)};function Cs(a,u){Pe.call(this),this.H=a,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(Cs,Pe),n=Cs.prototype,n.open=function(a,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=u,this.readyState=1,Ar(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const u={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(u.body=a),(this.H||o).fetch(new Request(this.D,u)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Ir(this)),this.readyState=0},n.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,Ar(this)),this.g&&(this.readyState=3,Ar(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;au(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function au(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}n.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var u=a.value?a.value:new Uint8Array(0);(u=this.B.decode(u,{stream:!a.done}))&&(this.response=this.responseText+=u)}a.done?Ir(this):Ar(this),this.readyState==3&&au(this)}},n.Oa=function(a){this.g&&(this.response=this.responseText=a,Ir(this))},n.Na=function(a){this.g&&(this.response=a,Ir(this))},n.ga=function(){this.g&&Ir(this)};function Ir(a){a.readyState=4,a.l=null,a.j=null,a.B=null,Ar(a)}n.setRequestHeader=function(a,u){this.A.append(a,u)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],u=this.h.entries();for(var f=u.next();!f.done;)f=f.value,a.push(f[0]+": "+f[1]),f=u.next();return a.join(`\r
`)};function Ar(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Cs.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function cu(a){let u="";return Es(a,function(f,g){u+=g,u+=":",u+=f,u+=`\r
`}),u}function Yo(a,u,f){e:{for(g in f){var g=!1;break e}g=!0}g||(f=cu(f),typeof a=="string"?f!=null&&gr(f):oe(a,u,f))}function he(a){Pe.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(he,Pe);var qg=/^https?$/i,Wg=["POST","PUT"];n=he.prototype,n.Fa=function(a){this.H=a},n.ea=function(a,u,f,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);u=u?u.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():jl.g(),this.g.onreadystatechange=m(h(this.Ca,this));try{this.B=!0,this.g.open(u,String(a),!0),this.B=!1}catch(b){lu(this,b);return}if(a=f||"",f=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var S in g)f.set(S,g[S]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const b of g.keys())f.set(b,g.get(b));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(f.keys()).find(b=>b.toLowerCase()=="content-type"),S=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(Wg,u,void 0)>=0)||g||S||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[b,D]of f)this.g.setRequestHeader(b,D);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(b){lu(this,b)}};function lu(a,u){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=u,a.o=5,uu(a),bs(a)}function uu(a){a.A||(a.A=!0,De(a,"complete"),De(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,De(this,"complete"),De(this,"abort"),bs(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),bs(this,!0)),he.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?hu(this):this.Xa())},n.Xa=function(){hu(this)};function hu(a){if(a.h&&typeof i<"u"){if(a.v&&At(a)==4)setTimeout(a.Ca.bind(a),0);else if(De(a,"readystatechange"),At(a)==4){a.h=!1;try{const b=a.ca();e:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var f;if(!(f=u)){var g;if(g=b===0){let D=String(a.D).match(eu)[1]||null;!D&&o.self&&o.self.location&&(D=o.self.location.protocol.slice(0,-1)),g=!qg.test(D?D.toLowerCase():"")}f=g}if(f)De(a,"complete"),De(a,"success");else{a.o=6;try{var S=At(a)>2?a.g.statusText:""}catch{S=""}a.l=S+" ["+a.ca()+"]",uu(a)}}finally{bs(a)}}}}function bs(a,u){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const f=a.g;a.g=null,u||De(a,"ready");try{f.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function At(a){return a.g?a.g.readyState:0}n.ca=function(){try{return At(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(a){if(this.g){var u=this.g.responseText;return a&&u.indexOf(a)==0&&(u=u.substring(a.length)),Ag(u)}};function du(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function zg(a){const u={};a=(a.g&&At(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<a.length;g++){if(_(a[g]))continue;var f=kg(a[g]);const S=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const b=u[S]||[];u[S]=b,b.push(f)}yg(u,function(g){return g.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Sr(a,u,f){return f&&f.internalChannelParams&&f.internalChannelParams[a]||u}function fu(a){this.za=0,this.i=[],this.j=new mr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Sr("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Sr("baseRetryDelayMs",5e3,a),this.Za=Sr("retryDelaySeedMs",1e4,a),this.Ta=Sr("forwardChannelMaxRetries",2,a),this.va=Sr("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new Ql(a&&a.concurrentRequestLimit),this.Ba=new jg,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=fu.prototype,n.ka=8,n.I=1,n.connect=function(a,u,f,g){Oe(0),this.W=a,this.H=u||{},f&&g!==void 0&&(this.H.OSID=f,this.H.OAID=g),this.F=this.X,this.J=vu(this,null,this.W),Ps(this)};function Jo(a){if(pu(a),a.I==3){var u=a.V++,f=Qe(a.J);if(oe(f,"SID",a.M),oe(f,"RID",u),oe(f,"TYPE","terminate"),Cr(a,f),u=new wt(a,a.j,u),u.M=2,u.A=Ss(Qe(f)),f=!1,o.navigator&&o.navigator.sendBeacon)try{f=o.navigator.sendBeacon(u.A.toString(),"")}catch{}!f&&o.Image&&(new Image().src=u.A,f=!0),f||(u.g=Iu(u.j,null),u.g.ea(u.A)),u.F=Date.now(),As(u)}wu(a)}function Rs(a){a.g&&(ea(a),a.g.cancel(),a.g=null)}function pu(a){Rs(a),a.v&&(o.clearTimeout(a.v),a.v=null),ks(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function Ps(a){if(!Xl(a.h)&&!a.m){a.m=!0;var u=a.Ea;ne||y(),Q||(ne(),Q=!0),w.add(u,a),a.D=0}}function Kg(a,u){return Yl(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=u.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=pr(h(a.Ea,a,u),Tu(a,a.D)),a.D++,!0)}n.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const S=new wt(this,this.j,a);let b=this.o;if(this.U&&(b?(b=Cl(b),Rl(b,this.U)):b=this.U),this.u!==null||this.R||(S.J=b,b=null),this.S)e:{for(var u=0,f=0;f<this.i.length;f++){t:{var g=this.i[f];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(u+=g,u>4096){u=f;break e}if(u===4096||f===this.i.length-1){u=f+1;break e}}u=1e3}else u=1e3;u=gu(this,S,u),f=Qe(this.J),oe(f,"RID",a),oe(f,"CVER",22),this.G&&oe(f,"X-HTTP-Session-Id",this.G),Cr(this,f),b&&(this.R?u="headers="+gr(cu(b))+"&"+u:this.u&&Yo(f,this.u,b)),Go(this.h,S),this.Ra&&oe(f,"TYPE","init"),this.S?(oe(f,"$req",u),oe(f,"SID","null"),S.U=!0,qo(S,f,null)):qo(S,f,u),this.I=2}}else this.I==3&&(a?mu(this,a):this.i.length==0||Xl(this.h)||mu(this))};function mu(a,u){var f;u?f=u.l:f=a.V++;const g=Qe(a.J);oe(g,"SID",a.M),oe(g,"RID",f),oe(g,"AID",a.K),Cr(a,g),a.u&&a.o&&Yo(g,a.u,a.o),f=new wt(a,a.j,f,a.D+1),a.u===null&&(f.J=a.o),u&&(a.i=u.G.concat(a.i)),u=gu(a,f,1e3),f.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),Go(a.h,f),qo(f,g,u)}function Cr(a,u){a.H&&Es(a.H,function(f,g){oe(u,g,f)}),a.l&&Es({},function(f,g){oe(u,g,f)})}function gu(a,u,f){f=Math.min(a.i.length,f);const g=a.l?h(a.l.Ka,a.l,a):null;e:{var S=a.i;let K=-1;for(;;){const me=["count="+f];K==-1?f>0?(K=S[0].g,me.push("ofs="+K)):K=0:me.push("ofs="+K);let re=!0;for(let ve=0;ve<f;ve++){var b=S[ve].g;const Xe=S[ve].map;if(b-=K,b<0)K=Math.max(0,S[ve].g-100),re=!1;else try{b="req"+b+"_"||"";try{var D=Xe instanceof Map?Xe:Object.entries(Xe);for(const[nn,St]of D){let Ct=St;c(St)&&(Ct=Bo(St)),me.push(b+nn+"="+encodeURIComponent(Ct))}}catch(nn){throw me.push(b+"type="+encodeURIComponent("_badmap")),nn}}catch{g&&g(Xe)}}if(re){D=me.join("&");break e}}D=void 0}return a=a.i.splice(0,f),u.G=a,D}function _u(a){if(!a.g&&!a.v){a.Y=1;var u=a.Da;ne||y(),Q||(ne(),Q=!0),w.add(u,a),a.A=0}}function Zo(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=pr(h(a.Da,a),Tu(a,a.A)),a.A++,!0)}n.Da=function(){if(this.v=null,yu(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=pr(h(this.Wa,this),a)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Oe(10),Rs(this),yu(this))};function ea(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function yu(a){a.g=new wt(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var u=Qe(a.na);oe(u,"RID","rpc"),oe(u,"SID",a.M),oe(u,"AID",a.K),oe(u,"CI",a.F?"0":"1"),!a.F&&a.ia&&oe(u,"TO",a.ia),oe(u,"TYPE","xmlhttp"),Cr(a,u),a.u&&a.o&&Yo(u,a.u,a.o),a.O&&(a.g.H=a.O);var f=a.g;a=a.ba,f.M=1,f.A=Ss(Qe(u)),f.u=null,f.R=!0,zl(f,a)}n.Va=function(){this.C!=null&&(this.C=null,Rs(this),Zo(this),Oe(19))};function ks(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function Eu(a,u){var f=null;if(a.g==u){ks(a),ea(a),a.g=null;var g=2}else if(Ko(a.h,u))f=u.G,Jl(a.h,u),g=1;else return;if(a.I!=0){if(u.o)if(g==1){f=u.u?u.u.length:0,u=Date.now()-u.F;var S=a.D;g=vs(),De(g,new $l(g,f)),Ps(a)}else _u(a);else if(S=u.m,S==3||S==0&&u.X>0||!(g==1&&Kg(a,u)||g==2&&Zo(a)))switch(f&&f.length>0&&(u=a.h,u.i=u.i.concat(f)),S){case 1:tn(a,5);break;case 4:tn(a,10);break;case 3:tn(a,6);break;default:tn(a,2)}}}function Tu(a,u){let f=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(f*=2),f*u}function tn(a,u){if(a.j.info("Error code "+u),u==2){var f=h(a.bb,a),g=a.Ua;const S=!g;g=new vt(g||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||yr(g,"https"),Ss(g),S?$g(g.toString(),f):Hg(g.toString(),f)}else Oe(2);a.I=0,a.l&&a.l.pa(u),wu(a),pu(a)}n.bb=function(a){a?(this.j.info("Successfully pinged google.com"),Oe(2)):(this.j.info("Failed to ping google.com"),Oe(1))};function wu(a){if(a.I=0,a.ja=[],a.l){const u=Zl(a.h);(u.length!=0||a.i.length!=0)&&(A(a.ja,u),A(a.ja,a.i),a.h.i.length=0,E(a.i),a.i.length=0),a.l.oa()}}function vu(a,u,f){var g=f instanceof vt?Qe(f):new vt(f);if(g.g!="")u&&(g.g=u+"."+g.g),Er(g,g.u);else{var S=o.location;g=S.protocol,u=u?u+"."+S.hostname:S.hostname,S=+S.port;const b=new vt(null);g&&yr(b,g),u&&(b.g=u),S&&Er(b,S),f&&(b.h=f),g=b}return f=a.G,u=a.wa,f&&u&&oe(g,f,u),oe(g,"VER",a.ka),Cr(a,g),g}function Iu(a,u,f){if(u&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return u=a.Aa&&!a.ma?new he(new Xo({ab:f})):new he(a.ma),u.Fa(a.L),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Au(){}n=Au.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Ns(){}Ns.prototype.g=function(a,u){return new Ue(a,u)};function Ue(a,u){Pe.call(this),this.g=new fu(u),this.l=a,this.h=u&&u.messageUrlParams||null,a=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(a?a["X-WebChannel-Content-Type"]=u.messageContentType:a={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.sa&&(a?a["X-WebChannel-Client-Profile"]=u.sa:a={"X-WebChannel-Client-Profile":u.sa}),this.g.U=a,(a=u&&u.Qb)&&!_(a)&&(this.g.u=a),this.A=u&&u.supportsCrossDomainXhr||!1,this.v=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!_(u)&&(this.g.G=u,a=this.h,a!==null&&u in a&&(a=this.h,u in a&&delete a[u])),this.j=new Sn(this)}p(Ue,Pe),Ue.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Ue.prototype.close=function(){Jo(this.g)},Ue.prototype.o=function(a){var u=this.g;if(typeof a=="string"){var f={};f.__data__=a,a=f}else this.v&&(f={},f.__data__=Bo(a),a=f);u.i.push(new Lg(u.Ya++,a)),u.I==3&&Ps(u)},Ue.prototype.N=function(){this.g.l=null,delete this.j,Jo(this.g),delete this.g,Ue.Z.N.call(this)};function Su(a){Uo.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var u=a.__sm__;if(u){e:{for(const f in u){a=f;break e}a=void 0}(this.i=a)&&(a=this.i,u=u!==null&&a in u?u[a]:void 0),this.data=u}else this.data=a}p(Su,Uo);function Cu(){$o.call(this),this.status=1}p(Cu,$o);function Sn(a){this.g=a}p(Sn,Au),Sn.prototype.ra=function(){De(this.g,"a")},Sn.prototype.qa=function(a){De(this.g,new Su(a))},Sn.prototype.pa=function(a){De(this.g,new Cu)},Sn.prototype.oa=function(){De(this.g,"b")},Ns.prototype.createWebChannel=Ns.prototype.g,Ue.prototype.send=Ue.prototype.o,Ue.prototype.open=Ue.prototype.m,Ue.prototype.close=Ue.prototype.close,Ef=function(){return new Ns},yf=function(){return vs()},_f=Jt,Oa={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Is.NO_ERROR=0,Is.TIMEOUT=8,Is.HTTP_ERROR=6,Xs=Is,Hl.COMPLETE="complete",gf=Hl,xl.EventType=dr,dr.OPEN="a",dr.CLOSE="b",dr.ERROR="c",dr.MESSAGE="d",Pe.prototype.listen=Pe.prototype.J,br=xl,he.prototype.listenOnce=he.prototype.K,he.prototype.getLastError=he.prototype.Ha,he.prototype.getLastErrorCode=he.prototype.ya,he.prototype.getStatus=he.prototype.ca,he.prototype.getResponseJson=he.prototype.La,he.prototype.getResponseText=he.prototype.la,he.prototype.send=he.prototype.ea,he.prototype.setWithCredentials=he.prototype.Fa,mf=he}).apply(typeof Os<"u"?Os:typeof self<"u"?self:typeof window<"u"?window:{});const Gu="@firebase/firestore",Qu="4.9.2";/**
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
 */let sr="12.3.0";/**
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
 */const dn=new EE("@firebase/firestore");function Pn(){return dn.logLevel}function V(n,...e){if(dn.logLevel<=Z.DEBUG){const t=e.map(Tc);dn.debug(`Firestore (${sr}): ${n}`,...t)}}function _t(n,...e){if(dn.logLevel<=Z.ERROR){const t=e.map(Tc);dn.error(`Firestore (${sr}): ${n}`,...t)}}function Qn(n,...e){if(dn.logLevel<=Z.WARN){const t=e.map(Tc);dn.warn(`Firestore (${sr}): ${n}`,...t)}}function Tc(n){if(typeof n=="string")return n;try{/**
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
 */function $(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Tf(n,r,t)}function Tf(n,e,t){let r=`FIRESTORE (${sr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw _t(r),new Error(r)}function ee(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||Tf(e,s,r)}function W(n,e){return n}/**
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
 */const L={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class B extends hf{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class wf{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class TE{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Ne.UNAUTHENTICATED))}shutdown(){}}class wE{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class vE{constructor(e){this.t=e,this.currentUser=Ne.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){ee(this.o===void 0,42304);let r=this.i;const s=l=>this.i!==r?(r=this.i,t(l)):Promise.resolve();let i=new cn;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new cn,e.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const l=i;e.enqueueRetryable(async()=>{await l.promise,await s(this.currentUser)})},c=l=>{V("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(l=>c(l)),setTimeout(()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?c(l):(V("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new cn)}},0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(V("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(ee(typeof r.accessToken=="string",31837,{l:r}),new wf(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return ee(e===null||typeof e=="string",2055,{h:e}),new Ne(e)}}class IE{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=Ne.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class AE{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new IE(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(Ne.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Xu{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class SE{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,ze(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){ee(this.o===void 0,3512);const r=i=>{i.error!=null&&V("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.m;return this.m=i.token,V("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{V("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):V("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Xu(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(ee(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Xu(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function CE(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
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
 */class wc{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=CE(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function X(n,e){return n<e?-1:n>e?1:0}function Va(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),i=e.charAt(r);if(s!==i)return ca(s)===ca(i)?X(s,i):ca(s)?1:-1}return X(n.length,e.length)}const bE=55296,RE=57343;function ca(n){const e=n.charCodeAt(0);return e>=bE&&e<=RE}function Xn(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}/**
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
 */const Yu="__name__";class Je{constructor(e,t,r){t===void 0?t=0:t>e.length&&$(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&$(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Je.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Je?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=Je.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return X(e.length,t.length)}static compareSegments(e,t){const r=Je.isNumericId(e),s=Je.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?Je.extractNumericId(e).compare(Je.extractNumericId(t)):Va(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Bt.fromString(e.substring(4,e.length-2))}}class le extends Je{construct(e,t,r){return new le(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new B(L.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new le(t)}static emptyPath(){return new le([])}}const PE=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Ce extends Je{construct(e,t,r){return new Ce(e,t,r)}static isValidIdentifier(e){return PE.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Ce.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Yu}static keyField(){return new Ce([Yu])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new B(L.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new B(L.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[s+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new B(L.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=l,s+=2}else c==="`"?(o=!o,s++):c!=="."||o?(r+=c,s++):(i(),s++)}if(i(),o)throw new B(L.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Ce(t)}static emptyPath(){return new Ce([])}}/**
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
 */function vf(n,e,t){if(!t)throw new B(L.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function kE(n,e,t,r){if(e===!0&&r===!0)throw new B(L.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Ju(n){if(!U.isDocumentKey(n))throw new B(L.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Zu(n){if(U.isDocumentKey(n))throw new B(L.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function If(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function vc(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":$(12329,{type:typeof n})}function Un(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new B(L.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=vc(n);throw new B(L.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
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
 */function pe(n,e){const t={typeString:n};return e&&(t.value=e),t}function ls(n,e){if(!If(n))throw new B(L.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const o=n[r];if(s&&typeof o!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new B(L.INVALID_ARGUMENT,t);return!0}/**
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
 */const eh=-62135596800,th=1e6;class te{static now(){return te.fromMillis(Date.now())}static fromDate(e){return te.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*th);return new te(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new B(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new B(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<eh)throw new B(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new B(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/th}_compareTo(e){return this.seconds===e.seconds?X(this.nanoseconds,e.nanoseconds):X(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:te._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(ls(e,te._jsonSchema))return new te(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-eh;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}te._jsonSchemaVersion="firestore/timestamp/1.0",te._jsonSchema={type:pe("string",te._jsonSchemaVersion),seconds:pe("number"),nanoseconds:pe("number")};/**
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
 */const Yr=-1;function NE(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=q.fromTimestamp(r===1e9?new te(t+1,0):new te(t,r));return new jt(s,U.empty(),e)}function ME(n){return new jt(n.readTime,n.key,Yr)}class jt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new jt(q.min(),U.empty(),Yr)}static max(){return new jt(q.max(),U.empty(),Yr)}}function LE(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=U.comparator(n.documentKey,e.documentKey),t!==0?t:X(n.largestBatchId,e.largestBatchId))}/**
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
 */const DE="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class OE{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
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
 */async function ir(n){if(n.code!==L.FAILED_PRECONDITION||n.message!==DE)throw n;V("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class k{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&$(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new k((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof k?t:k.resolve(t)}catch(t){return k.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):k.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):k.reject(t)}static resolve(e){return new k((t,r)=>{t(e)})}static reject(e){return new k((t,r)=>{r(e)})}static waitFor(e){return new k((t,r)=>{let s=0,i=0,o=!1;e.forEach(c=>{++s,c.next(()=>{++i,o&&i===s&&t()},l=>r(l))}),o=!0,i===s&&t()})}static or(e){let t=k.resolve(!1);for(const r of e)t=t.next(s=>s?k.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,i)=>{r.push(t.call(this,s,i))}),this.waitFor(r)}static mapArray(e,t){return new k((r,s)=>{const i=e.length,o=new Array(i);let c=0;for(let l=0;l<i;l++){const h=l;t(e[h]).next(d=>{o[h]=d,++c,c===i&&r(o)},d=>s(d))}})}static doWhile(e,t){return new k((r,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):r()};i()})}}function VE(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function or(n){return n.name==="IndexedDbTransactionError"}/**
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
 */class Ji{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>t.writeSequenceNumber(r))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}Ji.ce=-1;/**
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
 */const Ic=-1;function Zi(n){return n==null}function hi(n){return n===0&&1/n==-1/0}function xE(n){return typeof n=="number"&&Number.isInteger(n)&&!hi(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
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
 */const Af="";function FE(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=nh(e)),e=BE(n.get(t),e);return nh(e)}function BE(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case Af:t+="";break;default:t+=i}}return t}function nh(n){return n+Af+""}/**
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
 */function rh(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function _n(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function Sf(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
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
 */class ue{constructor(e,t){this.comparator=e,this.root=t||Se.EMPTY}insert(e,t){return new ue(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Se.BLACK,null,null))}remove(e){return new ue(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Se.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Vs(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Vs(this.root,e,this.comparator,!1)}getReverseIterator(){return new Vs(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Vs(this.root,e,this.comparator,!0)}}class Vs{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Se{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Se.RED,this.left=s??Se.EMPTY,this.right=i??Se.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Se(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Se.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Se.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Se.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Se.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw $(43730,{key:this.key,value:this.value});if(this.right.isRed())throw $(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw $(27949);return e+(this.isRed()?0:1)}}Se.EMPTY=null,Se.RED=!0,Se.BLACK=!1;Se.EMPTY=new class{constructor(){this.size=0}get key(){throw $(57766)}get value(){throw $(16141)}get color(){throw $(16727)}get left(){throw $(29726)}get right(){throw $(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new Se(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class ye{constructor(e){this.comparator=e,this.data=new ue(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new sh(this.data.getIterator())}getIteratorFrom(e){return new sh(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof ye)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new ye(this.comparator);return t.data=e,t}}class sh{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class Ke{constructor(e){this.fields=e,e.sort(Ce.comparator)}static empty(){return new Ke([])}unionWith(e){let t=new ye(Ce.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Ke(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Xn(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
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
 */class Cf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class Re{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Cf("Invalid base64 string: "+i):i}}(e);return new Re(t)}static fromUint8Array(e){const t=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(e);return new Re(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return X(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Re.EMPTY_BYTE_STRING=new Re("");const UE=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function qt(n){if(ee(!!n,39018),typeof n=="string"){let e=0;const t=UE.exec(n);if(ee(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:de(n.seconds),nanos:de(n.nanos)}}function de(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Wt(n){return typeof n=="string"?Re.fromBase64String(n):Re.fromUint8Array(n)}/**
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
 */const bf="server_timestamp",Rf="__type__",Pf="__previous_value__",kf="__local_write_time__";function Ac(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Rf])==null?void 0:r.stringValue)===bf}function eo(n){const e=n.mapValue.fields[Pf];return Ac(e)?eo(e):e}function Jr(n){const e=qt(n.mapValue.fields[kf].timestampValue);return new te(e.seconds,e.nanos)}/**
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
 */class $E{constructor(e,t,r,s,i,o,c,l,h,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=l,this.useFetchStreams=h,this.isUsingEmulator=d}}const di="(default)";class Zr{constructor(e,t){this.projectId=e,this.database=t||di}static empty(){return new Zr("","")}get isDefaultDatabase(){return this.database===di}isEqual(e){return e instanceof Zr&&e.projectId===this.projectId&&e.database===this.database}}/**
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
 */const Nf="__type__",HE="__max__",xs={mapValue:{}},Mf="__vector__",fi="value";function zt(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Ac(n)?4:qE(n)?9007199254740991:jE(n)?10:11:$(28295,{value:n})}function ot(n,e){if(n===e)return!0;const t=zt(n);if(t!==zt(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Jr(n).isEqual(Jr(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const o=qt(s.timestampValue),c=qt(i.timestampValue);return o.seconds===c.seconds&&o.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,i){return Wt(s.bytesValue).isEqual(Wt(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,i){return de(s.geoPointValue.latitude)===de(i.geoPointValue.latitude)&&de(s.geoPointValue.longitude)===de(i.geoPointValue.longitude)}(n,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return de(s.integerValue)===de(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const o=de(s.doubleValue),c=de(i.doubleValue);return o===c?hi(o)===hi(c):isNaN(o)&&isNaN(c)}return!1}(n,e);case 9:return Xn(n.arrayValue.values||[],e.arrayValue.values||[],ot);case 10:case 11:return function(s,i){const o=s.mapValue.fields||{},c=i.mapValue.fields||{};if(rh(o)!==rh(c))return!1;for(const l in o)if(o.hasOwnProperty(l)&&(c[l]===void 0||!ot(o[l],c[l])))return!1;return!0}(n,e);default:return $(52216,{left:n})}}function es(n,e){return(n.values||[]).find(t=>ot(t,e))!==void 0}function Yn(n,e){if(n===e)return 0;const t=zt(n),r=zt(e);if(t!==r)return X(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return X(n.booleanValue,e.booleanValue);case 2:return function(i,o){const c=de(i.integerValue||i.doubleValue),l=de(o.integerValue||o.doubleValue);return c<l?-1:c>l?1:c===l?0:isNaN(c)?isNaN(l)?0:-1:1}(n,e);case 3:return ih(n.timestampValue,e.timestampValue);case 4:return ih(Jr(n),Jr(e));case 5:return Va(n.stringValue,e.stringValue);case 6:return function(i,o){const c=Wt(i),l=Wt(o);return c.compareTo(l)}(n.bytesValue,e.bytesValue);case 7:return function(i,o){const c=i.split("/"),l=o.split("/");for(let h=0;h<c.length&&h<l.length;h++){const d=X(c[h],l[h]);if(d!==0)return d}return X(c.length,l.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,o){const c=X(de(i.latitude),de(o.latitude));return c!==0?c:X(de(i.longitude),de(o.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return oh(n.arrayValue,e.arrayValue);case 10:return function(i,o){var m,E,A,N;const c=i.fields||{},l=o.fields||{},h=(m=c[fi])==null?void 0:m.arrayValue,d=(E=l[fi])==null?void 0:E.arrayValue,p=X(((A=h==null?void 0:h.values)==null?void 0:A.length)||0,((N=d==null?void 0:d.values)==null?void 0:N.length)||0);return p!==0?p:oh(h,d)}(n.mapValue,e.mapValue);case 11:return function(i,o){if(i===xs.mapValue&&o===xs.mapValue)return 0;if(i===xs.mapValue)return 1;if(o===xs.mapValue)return-1;const c=i.fields||{},l=Object.keys(c),h=o.fields||{},d=Object.keys(h);l.sort(),d.sort();for(let p=0;p<l.length&&p<d.length;++p){const m=Va(l[p],d[p]);if(m!==0)return m;const E=Yn(c[l[p]],h[d[p]]);if(E!==0)return E}return X(l.length,d.length)}(n.mapValue,e.mapValue);default:throw $(23264,{he:t})}}function ih(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return X(n,e);const t=qt(n),r=qt(e),s=X(t.seconds,r.seconds);return s!==0?s:X(t.nanos,r.nanos)}function oh(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=Yn(t[s],r[s]);if(i)return i}return X(t.length,r.length)}function Jn(n){return xa(n)}function xa(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=qt(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Wt(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return U.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=xa(i);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${xa(t.fields[o])}`;return s+"}"}(n.mapValue):$(61005,{value:n})}function Ys(n){switch(zt(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=eo(n);return e?16+Ys(e):16;case 5:return 2*n.stringValue.length;case 6:return Wt(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((s,i)=>s+Ys(i),0)}(n.arrayValue);case 10:case 11:return function(r){let s=0;return _n(r.fields,(i,o)=>{s+=i.length+Ys(o)}),s}(n.mapValue);default:throw $(13486,{value:n})}}function Fa(n){return!!n&&"integerValue"in n}function Sc(n){return!!n&&"arrayValue"in n}function ah(n){return!!n&&"nullValue"in n}function ch(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Js(n){return!!n&&"mapValue"in n}function jE(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Nf])==null?void 0:r.stringValue)===Mf}function Vr(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return _n(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Vr(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Vr(n.arrayValue.values[t]);return e}return{...n}}function qE(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===HE}/**
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
 */class $e{constructor(e){this.value=e}static empty(){return new $e({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Js(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Vr(t)}setAll(e){let t=Ce.emptyPath(),r={},s=[];e.forEach((o,c)=>{if(!t.isImmediateParentOf(c)){const l=this.getFieldsMap(t);this.applyChanges(l,r,s),r={},s=[],t=c.popLast()}o?r[c.lastSegment()]=Vr(o):s.push(c.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());Js(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return ot(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Js(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){_n(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new $e(Vr(this.value))}}function Lf(n){const e=[];return _n(n.fields,(t,r)=>{const s=new Ce([t]);if(Js(r)){const i=Lf(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)}),new Ke(e)}/**
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
 */class pi{constructor(e,t){this.position=e,this.inclusive=t}}function lh(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],o=n.position[s];if(i.field.isKeyField()?r=U.comparator(U.fromName(o.referenceValue),t.key):r=Yn(o,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function uh(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!ot(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class mi{constructor(e,t="asc"){this.field=e,this.dir=t}}function WE(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class Df{}class ge extends Df{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new KE(e,t,r):t==="array-contains"?new XE(e,r):t==="in"?new YE(e,r):t==="not-in"?new JE(e,r):t==="array-contains-any"?new ZE(e,r):new ge(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new GE(e,r):new QE(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Yn(t,this.value)):t!==null&&zt(this.value)===zt(t)&&this.matchesComparison(Yn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return $(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class at extends Df{constructor(e,t){super(),this.filters=e,this.op=t,this.Pe=null}static create(e,t){return new at(e,t)}matches(e){return Of(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function Of(n){return n.op==="and"}function Vf(n){return zE(n)&&Of(n)}function zE(n){for(const e of n.filters)if(e instanceof at)return!1;return!0}function Ba(n){if(n instanceof ge)return n.field.canonicalString()+n.op.toString()+Jn(n.value);if(Vf(n))return n.filters.map(e=>Ba(e)).join(",");{const e=n.filters.map(t=>Ba(t)).join(",");return`${n.op}(${e})`}}function xf(n,e){return n instanceof ge?function(r,s){return s instanceof ge&&r.op===s.op&&r.field.isEqual(s.field)&&ot(r.value,s.value)}(n,e):n instanceof at?function(r,s){return s instanceof at&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,o,c)=>i&&xf(o,s.filters[c]),!0):!1}(n,e):void $(19439)}function Ff(n){return n instanceof ge?function(t){return`${t.field.canonicalString()} ${t.op} ${Jn(t.value)}`}(n):n instanceof at?function(t){return t.op.toString()+" {"+t.getFilters().map(Ff).join(" ,")+"}"}(n):"Filter"}class KE extends ge{constructor(e,t,r){super(e,t,r),this.key=U.fromName(r.referenceValue)}matches(e){const t=U.comparator(e.key,this.key);return this.matchesComparison(t)}}class GE extends ge{constructor(e,t){super(e,"in",t),this.keys=Bf("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class QE extends ge{constructor(e,t){super(e,"not-in",t),this.keys=Bf("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Bf(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map(r=>U.fromName(r.referenceValue))}class XE extends ge{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Sc(t)&&es(t.arrayValue,this.value)}}class YE extends ge{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&es(this.value.arrayValue,t)}}class JE extends ge{constructor(e,t){super(e,"not-in",t)}matches(e){if(es(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!es(this.value.arrayValue,t)}}class ZE extends ge{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Sc(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>es(this.value.arrayValue,r))}}/**
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
 */class eT{constructor(e,t=null,r=[],s=[],i=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=c,this.Te=null}}function hh(n,e=null,t=[],r=[],s=null,i=null,o=null){return new eT(n,e,t,r,s,i,o)}function Cc(n){const e=W(n);if(e.Te===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Ba(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),Zi(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Jn(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Jn(r)).join(",")),e.Te=t}return e.Te}function bc(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!WE(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!xf(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!uh(n.startAt,e.startAt)&&uh(n.endAt,e.endAt)}function Ua(n){return U.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
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
 */class to{constructor(e,t=null,r=[],s=[],i=null,o="F",c=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=c,this.endAt=l,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function tT(n,e,t,r,s,i,o,c){return new to(n,e,t,r,s,i,o,c)}function Rc(n){return new to(n)}function dh(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function nT(n){return n.collectionGroup!==null}function xr(n){const e=W(n);if(e.Ie===null){e.Ie=[];const t=new Set;for(const i of e.explicitOrderBy)e.Ie.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new ye(Ce.comparator);return o.filters.forEach(l=>{l.getFlattenedFilters().forEach(h=>{h.isInequality()&&(c=c.add(h.field))})}),c})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.Ie.push(new mi(i,r))}),t.has(Ce.keyField().canonicalString())||e.Ie.push(new mi(Ce.keyField(),r))}return e.Ie}function et(n){const e=W(n);return e.Ee||(e.Ee=rT(e,xr(n))),e.Ee}function rT(n,e){if(n.limitType==="F")return hh(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new mi(s.field,i)});const t=n.endAt?new pi(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new pi(n.startAt.position,n.startAt.inclusive):null;return hh(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function $a(n,e,t){return new to(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function no(n,e){return bc(et(n),et(e))&&n.limitType===e.limitType}function Uf(n){return`${Cc(et(n))}|lt:${n.limitType}`}function kn(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>Ff(s)).join(", ")}]`),Zi(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>Jn(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>Jn(s)).join(",")),`Target(${r})`}(et(n))}; limitType=${n.limitType})`}function ro(n,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):U.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(n,e)&&function(r,s){for(const i of xr(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(o,c,l){const h=lh(o,c,l);return o.inclusive?h<=0:h<0}(r.startAt,xr(r),s)||r.endAt&&!function(o,c,l){const h=lh(o,c,l);return o.inclusive?h>=0:h>0}(r.endAt,xr(r),s))}(n,e)}function sT(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function $f(n){return(e,t)=>{let r=!1;for(const s of xr(n)){const i=iT(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function iT(n,e,t){const r=n.field.isKeyField()?U.comparator(e.key,t.key):function(i,o,c){const l=o.data.field(i),h=c.data.field(i);return l!==null&&h!==null?Yn(l,h):$(42886)}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return $(19790,{direction:n.dir})}}/**
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
 */class yn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){_n(this.inner,(t,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return Sf(this.inner)}size(){return this.innerSize}}/**
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
 */const oT=new ue(U.comparator);function yt(){return oT}const Hf=new ue(U.comparator);function Rr(...n){let e=Hf;for(const t of n)e=e.insert(t.key,t);return e}function jf(n){let e=Hf;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function on(){return Fr()}function qf(){return Fr()}function Fr(){return new yn(n=>n.toString(),(n,e)=>n.isEqual(e))}const aT=new ue(U.comparator),cT=new ye(U.comparator);function Y(...n){let e=cT;for(const t of n)e=e.add(t);return e}const lT=new ye(X);function uT(){return lT}/**
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
 */function Pc(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:hi(e)?"-0":e}}function Wf(n){return{integerValue:""+n}}function hT(n,e){return xE(e)?Wf(e):Pc(n,e)}/**
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
 */class so{constructor(){this._=void 0}}function dT(n,e,t){return n instanceof gi?function(s,i){const o={fields:{[Rf]:{stringValue:bf},[kf]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Ac(i)&&(i=eo(i)),i&&(o.fields[Pf]=i),{mapValue:o}}(t,e):n instanceof ts?Kf(n,e):n instanceof ns?Gf(n,e):function(s,i){const o=zf(s,i),c=fh(o)+fh(s.Ae);return Fa(o)&&Fa(s.Ae)?Wf(c):Pc(s.serializer,c)}(n,e)}function fT(n,e,t){return n instanceof ts?Kf(n,e):n instanceof ns?Gf(n,e):t}function zf(n,e){return n instanceof _i?function(r){return Fa(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class gi extends so{}class ts extends so{constructor(e){super(),this.elements=e}}function Kf(n,e){const t=Qf(e);for(const r of n.elements)t.some(s=>ot(s,r))||t.push(r);return{arrayValue:{values:t}}}class ns extends so{constructor(e){super(),this.elements=e}}function Gf(n,e){let t=Qf(e);for(const r of n.elements)t=t.filter(s=>!ot(s,r));return{arrayValue:{values:t}}}class _i extends so{constructor(e,t){super(),this.serializer=e,this.Ae=t}}function fh(n){return de(n.integerValue||n.doubleValue)}function Qf(n){return Sc(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function pT(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof ts&&s instanceof ts||r instanceof ns&&s instanceof ns?Xn(r.elements,s.elements,ot):r instanceof _i&&s instanceof _i?ot(r.Ae,s.Ae):r instanceof gi&&s instanceof gi}(n.transform,e.transform)}class mT{constructor(e,t){this.version=e,this.transformResults=t}}class pt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new pt}static exists(e){return new pt(void 0,e)}static updateTime(e){return new pt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Zs(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class io{}function Xf(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Jf(n.key,pt.none()):new us(n.key,n.data,pt.none());{const t=n.data,r=$e.empty();let s=new ye(Ce.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new En(n.key,r,new Ke(s.toArray()),pt.none())}}function gT(n,e,t){n instanceof us?function(s,i,o){const c=s.value.clone(),l=mh(s.fieldTransforms,i,o.transformResults);c.setAll(l),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(n,e,t):n instanceof En?function(s,i,o){if(!Zs(s.precondition,i))return void i.convertToUnknownDocument(o.version);const c=mh(s.fieldTransforms,i,o.transformResults),l=i.data;l.setAll(Yf(s)),l.setAll(c),i.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(n,e,t):function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function Br(n,e,t,r){return n instanceof us?function(i,o,c,l){if(!Zs(i.precondition,o))return c;const h=i.value.clone(),d=gh(i.fieldTransforms,l,o);return h.setAll(d),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(n,e,t,r):n instanceof En?function(i,o,c,l){if(!Zs(i.precondition,o))return c;const h=gh(i.fieldTransforms,l,o),d=o.data;return d.setAll(Yf(i)),d.setAll(h),o.convertToFoundDocument(o.version,d).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(p=>p.field))}(n,e,t,r):function(i,o,c){return Zs(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c}(n,e,t)}function _T(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=zf(r.transform,s||null);i!=null&&(t===null&&(t=$e.empty()),t.set(r.field,i))}return t||null}function ph(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Xn(r,s,(i,o)=>pT(i,o))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class us extends io{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class En extends io{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Yf(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function mh(n,e,t){const r=new Map;ee(n.length===t.length,32656,{Re:t.length,Ve:n.length});for(let s=0;s<t.length;s++){const i=n[s],o=i.transform,c=e.data.field(i.field);r.set(i.field,fT(o,c,t[s]))}return r}function gh(n,e,t){const r=new Map;for(const s of n){const i=s.transform,o=t.data.field(s.field);r.set(s.field,dT(i,o,e))}return r}class Jf extends io{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class yT extends io{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class ET{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&gT(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Br(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Br(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=qf();return this.mutations.forEach(s=>{const i=e.get(s.key),o=i.overlayedDocument;let c=this.applyToLocalView(o,i.mutatedFields);c=t.has(s.key)?null:c;const l=Xf(o,c);l!==null&&r.set(s.key,l),o.isValidDocument()||o.convertToNoDocument(q.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Y())}isEqual(e){return this.batchId===e.batchId&&Xn(this.mutations,e.mutations,(t,r)=>ph(t,r))&&Xn(this.baseMutations,e.baseMutations,(t,r)=>ph(t,r))}}class kc{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){ee(e.mutations.length===r.length,58842,{me:e.mutations.length,fe:r.length});let s=function(){return aT}();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new kc(e,t,r,s)}}/**
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
 */class TT{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class wT{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var fe,J;function vT(n){switch(n){case L.OK:return $(64938);case L.CANCELLED:case L.UNKNOWN:case L.DEADLINE_EXCEEDED:case L.RESOURCE_EXHAUSTED:case L.INTERNAL:case L.UNAVAILABLE:case L.UNAUTHENTICATED:return!1;case L.INVALID_ARGUMENT:case L.NOT_FOUND:case L.ALREADY_EXISTS:case L.PERMISSION_DENIED:case L.FAILED_PRECONDITION:case L.ABORTED:case L.OUT_OF_RANGE:case L.UNIMPLEMENTED:case L.DATA_LOSS:return!0;default:return $(15467,{code:n})}}function Zf(n){if(n===void 0)return _t("GRPC error has no .code"),L.UNKNOWN;switch(n){case fe.OK:return L.OK;case fe.CANCELLED:return L.CANCELLED;case fe.UNKNOWN:return L.UNKNOWN;case fe.DEADLINE_EXCEEDED:return L.DEADLINE_EXCEEDED;case fe.RESOURCE_EXHAUSTED:return L.RESOURCE_EXHAUSTED;case fe.INTERNAL:return L.INTERNAL;case fe.UNAVAILABLE:return L.UNAVAILABLE;case fe.UNAUTHENTICATED:return L.UNAUTHENTICATED;case fe.INVALID_ARGUMENT:return L.INVALID_ARGUMENT;case fe.NOT_FOUND:return L.NOT_FOUND;case fe.ALREADY_EXISTS:return L.ALREADY_EXISTS;case fe.PERMISSION_DENIED:return L.PERMISSION_DENIED;case fe.FAILED_PRECONDITION:return L.FAILED_PRECONDITION;case fe.ABORTED:return L.ABORTED;case fe.OUT_OF_RANGE:return L.OUT_OF_RANGE;case fe.UNIMPLEMENTED:return L.UNIMPLEMENTED;case fe.DATA_LOSS:return L.DATA_LOSS;default:return $(39323,{code:n})}}(J=fe||(fe={}))[J.OK=0]="OK",J[J.CANCELLED=1]="CANCELLED",J[J.UNKNOWN=2]="UNKNOWN",J[J.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",J[J.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",J[J.NOT_FOUND=5]="NOT_FOUND",J[J.ALREADY_EXISTS=6]="ALREADY_EXISTS",J[J.PERMISSION_DENIED=7]="PERMISSION_DENIED",J[J.UNAUTHENTICATED=16]="UNAUTHENTICATED",J[J.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",J[J.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",J[J.ABORTED=10]="ABORTED",J[J.OUT_OF_RANGE=11]="OUT_OF_RANGE",J[J.UNIMPLEMENTED=12]="UNIMPLEMENTED",J[J.INTERNAL=13]="INTERNAL",J[J.UNAVAILABLE=14]="UNAVAILABLE",J[J.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function IT(){return new TextEncoder}/**
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
 */const AT=new Bt([4294967295,4294967295],0);function _h(n){const e=IT().encode(n),t=new pf;return t.update(e),new Uint8Array(t.digest())}function yh(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Bt([t,r],0),new Bt([s,i],0)]}class Nc{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Pr(`Invalid padding: ${t}`);if(r<0)throw new Pr(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Pr(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Pr(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.pe=Bt.fromNumber(this.ge)}ye(e,t,r){let s=e.add(t.multiply(Bt.fromNumber(r)));return s.compare(AT)===1&&(s=new Bt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=_h(e),[r,s]=yh(t);for(let i=0;i<this.hashCount;i++){const o=this.ye(r,s,i);if(!this.we(o))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new Nc(i,s,t);return r.forEach(c=>o.insert(c)),o}insert(e){if(this.ge===0)return;const t=_h(e),[r,s]=yh(t);for(let i=0;i<this.hashCount;i++){const o=this.ye(r,s,i);this.Se(o)}}Se(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Pr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class oo{constructor(e,t,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,hs.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new oo(q.min(),s,new ue(X),yt(),Y())}}class hs{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new hs(r,t,Y(),Y(),Y())}}/**
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
 */class ei{constructor(e,t,r,s){this.be=e,this.removedTargetIds=t,this.key=r,this.De=s}}class ep{constructor(e,t){this.targetId=e,this.Ce=t}}class tp{constructor(e,t,r=Re.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class Eh{constructor(){this.ve=0,this.Fe=Th(),this.Me=Re.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Y(),t=Y(),r=Y();return this.Fe.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:$(38017,{changeType:i})}}),new hs(this.Me,this.xe,e,t,r)}qe(){this.Oe=!1,this.Fe=Th()}Qe(e,t){this.Oe=!0,this.Fe=this.Fe.insert(e,t)}$e(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}Ue(){this.ve+=1}Ke(){this.ve-=1,ee(this.ve>=0,3241,{ve:this.ve})}We(){this.Oe=!0,this.xe=!0}}class ST{constructor(e){this.Ge=e,this.ze=new Map,this.je=yt(),this.Je=Fs(),this.He=Fs(),this.Ye=new ue(X)}Ze(e){for(const t of e.be)e.De&&e.De.isFoundDocument()?this.Xe(t,e.De):this.et(t,e.key,e.De);for(const t of e.removedTargetIds)this.et(t,e.key,e.De)}tt(e){this.forEachTarget(e,t=>{const r=this.nt(t);switch(e.state){case 0:this.rt(t)&&r.Le(e.resumeToken);break;case 1:r.Ke(),r.Ne||r.qe(),r.Le(e.resumeToken);break;case 2:r.Ke(),r.Ne||this.removeTarget(t);break;case 3:this.rt(t)&&(r.We(),r.Le(e.resumeToken));break;case 4:this.rt(t)&&(this.it(t),r.Le(e.resumeToken));break;default:$(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ze.forEach((r,s)=>{this.rt(s)&&t(s)})}st(e){const t=e.targetId,r=e.Ce.count,s=this.ot(t);if(s){const i=s.target;if(Ua(i))if(r===0){const o=new U(i.path);this.et(t,o,Me.newNoDocument(o,q.min()))}else ee(r===1,20013,{expectedCount:r});else{const o=this._t(t);if(o!==r){const c=this.ut(e),l=c?this.ct(c,e,o):1;if(l!==0){this.it(t);const h=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ye=this.Ye.insert(t,h)}}}}}ut(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let o,c;try{o=Wt(r).toUint8Array()}catch(l){if(l instanceof Cf)return Qn("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{c=new Nc(o,s,i)}catch(l){return Qn(l instanceof Pr?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return c.ge===0?null:c}ct(e,t,r){return t.Ce.count===r-this.Pt(e,t.targetId)?0:2}Pt(e,t){const r=this.Ge.getRemoteKeysForTarget(t);let s=0;return r.forEach(i=>{const o=this.Ge.ht(),c=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.et(t,i,null),s++)}),s}Tt(e){const t=new Map;this.ze.forEach((i,o)=>{const c=this.ot(o);if(c){if(i.current&&Ua(c.target)){const l=new U(c.target.path);this.It(l).has(o)||this.Et(o,l)||this.et(o,l,Me.newNoDocument(l,e))}i.Be&&(t.set(o,i.ke()),i.qe())}});let r=Y();this.He.forEach((i,o)=>{let c=!0;o.forEachWhile(l=>{const h=this.ot(l);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(i))}),this.je.forEach((i,o)=>o.setReadTime(e));const s=new oo(e,t,this.Ye,this.je,r);return this.je=yt(),this.Je=Fs(),this.He=Fs(),this.Ye=new ue(X),s}Xe(e,t){if(!this.rt(e))return;const r=this.Et(e,t.key)?2:0;this.nt(e).Qe(t.key,r),this.je=this.je.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.He=this.He.insert(t.key,this.dt(t.key).add(e))}et(e,t,r){if(!this.rt(e))return;const s=this.nt(e);this.Et(e,t)?s.Qe(t,1):s.$e(t),this.He=this.He.insert(t,this.dt(t).delete(e)),this.He=this.He.insert(t,this.dt(t).add(e)),r&&(this.je=this.je.insert(t,r))}removeTarget(e){this.ze.delete(e)}_t(e){const t=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}Ue(e){this.nt(e).Ue()}nt(e){let t=this.ze.get(e);return t||(t=new Eh,this.ze.set(e,t)),t}dt(e){let t=this.He.get(e);return t||(t=new ye(X),this.He=this.He.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new ye(X),this.Je=this.Je.insert(e,t)),t}rt(e){const t=this.ot(e)!==null;return t||V("WatchChangeAggregator","Detected inactive target",e),t}ot(e){const t=this.ze.get(e);return t&&t.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new Eh),this.Ge.getRemoteKeysForTarget(e).forEach(t=>{this.et(e,t,null)})}Et(e,t){return this.Ge.getRemoteKeysForTarget(e).has(t)}}function Fs(){return new ue(U.comparator)}function Th(){return new ue(U.comparator)}const CT={asc:"ASCENDING",desc:"DESCENDING"},bT={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},RT={and:"AND",or:"OR"};class PT{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Ha(n,e){return n.useProto3Json||Zi(e)?e:{value:e}}function yi(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function np(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function kT(n,e){return yi(n,e.toTimestamp())}function tt(n){return ee(!!n,49232),q.fromTimestamp(function(t){const r=qt(t);return new te(r.seconds,r.nanos)}(n))}function Mc(n,e){return ja(n,e).canonicalString()}function ja(n,e){const t=function(s){return new le(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function rp(n){const e=le.fromString(n);return ee(cp(e),10190,{key:e.toString()}),e}function qa(n,e){return Mc(n.databaseId,e.path)}function la(n,e){const t=rp(e);if(t.get(1)!==n.databaseId.projectId)throw new B(L.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new B(L.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new U(ip(t))}function sp(n,e){return Mc(n.databaseId,e)}function NT(n){const e=rp(n);return e.length===4?le.emptyPath():ip(e)}function Wa(n){return new le(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function ip(n){return ee(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function wh(n,e,t){return{name:qa(n,e),fields:t.value.mapValue.fields}}function MT(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:$(39313,{state:h})}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,d){return h.useProto3Json?(ee(d===void 0||typeof d=="string",58123),Re.fromBase64String(d||"")):(ee(d===void 0||d instanceof Buffer||d instanceof Uint8Array,16193),Re.fromUint8Array(d||new Uint8Array))}(n,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&function(h){const d=h.code===void 0?L.UNKNOWN:Zf(h.code);return new B(d,h.message||"")}(o);t=new tp(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=la(n,r.document.name),i=tt(r.document.updateTime),o=r.document.createTime?tt(r.document.createTime):q.min(),c=new $e({mapValue:{fields:r.document.fields}}),l=Me.newFoundDocument(s,i,o,c),h=r.targetIds||[],d=r.removedTargetIds||[];t=new ei(h,d,l.key,l)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=la(n,r.document),i=r.readTime?tt(r.readTime):q.min(),o=Me.newNoDocument(s,i),c=r.removedTargetIds||[];t=new ei([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=la(n,r.document),i=r.removedTargetIds||[];t=new ei([],i,s,null)}else{if(!("filter"in e))return $(11601,{Rt:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new wT(s,i),c=r.targetId;t=new ep(c,o)}}return t}function LT(n,e){let t;if(e instanceof us)t={update:wh(n,e.key,e.value)};else if(e instanceof Jf)t={delete:qa(n,e.key)};else if(e instanceof En)t={update:wh(n,e.key,e.data),updateMask:HT(e.fieldMask)};else{if(!(e instanceof yT))return $(16599,{Vt:e.type});t={verify:qa(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(i,o){const c=o.transform;if(c instanceof gi)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof ts)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof ns)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof _i)return{fieldPath:o.field.canonicalString(),increment:c.Ae};throw $(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:kT(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:$(27497)}(n,e.precondition)),t}function DT(n,e){return n&&n.length>0?(ee(e!==void 0,14353),n.map(t=>function(s,i){let o=s.updateTime?tt(s.updateTime):tt(i);return o.isEqual(q.min())&&(o=tt(i)),new mT(o,s.transformResults||[])}(t,e))):[]}function OT(n,e){return{documents:[sp(n,e.path)]}}function VT(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=sp(n,s);const i=function(h){if(h.length!==0)return ap(at.create(h,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const o=function(h){if(h.length!==0)return h.map(d=>function(m){return{field:Nn(m.field),direction:BT(m.dir)}}(d))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const c=Ha(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{ft:t,parent:s}}function xT(n){let e=NT(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){ee(r===1,65062);const d=t.from[0];d.allDescendants?s=d.collectionId:e=e.child(d.collectionId)}let i=[];t.where&&(i=function(p){const m=op(p);return m instanceof at&&Vf(m)?m.getFilters():[m]}(t.where));let o=[];t.orderBy&&(o=function(p){return p.map(m=>function(A){return new mi(Mn(A.field),function(R){switch(R){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(A.direction))}(m))}(t.orderBy));let c=null;t.limit&&(c=function(p){let m;return m=typeof p=="object"?p.value:p,Zi(m)?null:m}(t.limit));let l=null;t.startAt&&(l=function(p){const m=!!p.before,E=p.values||[];return new pi(E,m)}(t.startAt));let h=null;return t.endAt&&(h=function(p){const m=!p.before,E=p.values||[];return new pi(E,m)}(t.endAt)),tT(e,s,o,i,c,"F",l,h)}function FT(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return $(28987,{purpose:s})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function op(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Mn(t.unaryFilter.field);return ge.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Mn(t.unaryFilter.field);return ge.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Mn(t.unaryFilter.field);return ge.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Mn(t.unaryFilter.field);return ge.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return $(61313);default:return $(60726)}}(n):n.fieldFilter!==void 0?function(t){return ge.create(Mn(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return $(58110);default:return $(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return at.create(t.compositeFilter.filters.map(r=>op(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return $(1026)}}(t.compositeFilter.op))}(n):$(30097,{filter:n})}function BT(n){return CT[n]}function UT(n){return bT[n]}function $T(n){return RT[n]}function Nn(n){return{fieldPath:n.canonicalString()}}function Mn(n){return Ce.fromServerFormat(n.fieldPath)}function ap(n){return n instanceof ge?function(t){if(t.op==="=="){if(ch(t.value))return{unaryFilter:{field:Nn(t.field),op:"IS_NAN"}};if(ah(t.value))return{unaryFilter:{field:Nn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(ch(t.value))return{unaryFilter:{field:Nn(t.field),op:"IS_NOT_NAN"}};if(ah(t.value))return{unaryFilter:{field:Nn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Nn(t.field),op:UT(t.op),value:t.value}}}(n):n instanceof at?function(t){const r=t.getFilters().map(s=>ap(s));return r.length===1?r[0]:{compositeFilter:{op:$T(t.op),filters:r}}}(n):$(54877,{filter:n})}function HT(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function cp(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
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
 */class Lt{constructor(e,t,r,s,i=q.min(),o=q.min(),c=Re.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=l}withSequenceNumber(e){return new Lt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Lt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Lt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Lt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class jT{constructor(e){this.yt=e}}function qT(n){const e=xT({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?$a(e,e.limit,"L"):e}/**
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
 */class WT{constructor(){this.Cn=new zT}addToCollectionParentIndex(e,t){return this.Cn.add(t),k.resolve()}getCollectionParents(e,t){return k.resolve(this.Cn.getEntries(t))}addFieldIndex(e,t){return k.resolve()}deleteFieldIndex(e,t){return k.resolve()}deleteAllFieldIndexes(e){return k.resolve()}createTargetIndexes(e,t){return k.resolve()}getDocumentsMatchingTarget(e,t){return k.resolve(null)}getIndexType(e,t){return k.resolve(0)}getFieldIndexes(e,t){return k.resolve([])}getNextCollectionGroupToUpdate(e){return k.resolve(null)}getMinOffset(e,t){return k.resolve(jt.min())}getMinOffsetFromCollectionGroup(e,t){return k.resolve(jt.min())}updateCollectionGroup(e,t,r){return k.resolve()}updateIndexEntries(e,t){return k.resolve()}}class zT{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new ye(le.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new ye(le.comparator)).toArray()}}/**
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
 */const vh={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},lp=41943040;class xe{static withCacheSize(e){return new xe(e,xe.DEFAULT_COLLECTION_PERCENTILE,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}/**
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
 */xe.DEFAULT_COLLECTION_PERCENTILE=10,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,xe.DEFAULT=new xe(lp,xe.DEFAULT_COLLECTION_PERCENTILE,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),xe.DISABLED=new xe(-1,0,0);/**
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
 */class Zn{constructor(e){this.ar=e}next(){return this.ar+=2,this.ar}static ur(){return new Zn(0)}static cr(){return new Zn(-1)}}/**
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
 */const Ih="LruGarbageCollector",KT=1048576;function Ah([n,e],[t,r]){const s=X(n,t);return s===0?X(e,r):s}class GT{constructor(e){this.Ir=e,this.buffer=new ye(Ah),this.Er=0}dr(){return++this.Er}Ar(e){const t=[e,this.dr()];if(this.buffer.size<this.Ir)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Ah(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class QT{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Vr(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Vr(e){V(Ih,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){or(t)?V(Ih,"Ignoring IndexedDB error during garbage collection: ",t):await ir(t)}await this.Vr(3e5)})}}class XT{constructor(e,t){this.mr=e,this.params=t}calculateTargetCount(e,t){return this.mr.gr(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return k.resolve(Ji.ce);const r=new GT(t);return this.mr.forEachTarget(e,s=>r.Ar(s.sequenceNumber)).next(()=>this.mr.pr(e,s=>r.Ar(s))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.mr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.mr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(V("LruGarbageCollector","Garbage collection skipped; disabled"),k.resolve(vh)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(V("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),vh):this.yr(e,t))}getCacheSize(e){return this.mr.getCacheSize(e)}yr(e,t){let r,s,i,o,c,l,h;const d=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(V("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),s=this.params.maximumSequenceNumbersToCollect):s=p,o=Date.now(),this.nthSequenceNumber(e,s))).next(p=>(r=p,c=Date.now(),this.removeTargets(e,r,t))).next(p=>(i=p,l=Date.now(),this.removeOrphanedDocuments(e,r))).next(p=>(h=Date.now(),Pn()<=Z.DEBUG&&V("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-d}ms
	Determined least recently used ${s} in `+(c-o)+`ms
	Removed ${i} targets in `+(l-c)+`ms
	Removed ${p} documents in `+(h-l)+`ms
Total Duration: ${h-d}ms`),k.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:p})))}}function YT(n,e){return new XT(n,e)}/**
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
 */class JT{constructor(){this.changes=new yn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Me.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?k.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class ZT{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class ew{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&Br(r.mutation,s,Ke.empty(),te.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,Y()).next(()=>r))}getLocalViewOfDocuments(e,t,r=Y()){const s=on();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(i=>{let o=Rr();return i.forEach((c,l)=>{o=o.insert(c,l.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const r=on();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,Y()))}populateOverlays(e,t,r){const s=[];return r.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((o,c)=>{t.set(o,c)})})}computeViews(e,t,r,s){let i=yt();const o=Fr(),c=function(){return Fr()}();return t.forEach((l,h)=>{const d=r.get(h.key);s.has(h.key)&&(d===void 0||d.mutation instanceof En)?i=i.insert(h.key,h):d!==void 0?(o.set(h.key,d.mutation.getFieldMask()),Br(d.mutation,h,d.mutation.getFieldMask(),te.now())):o.set(h.key,Ke.empty())}),this.recalculateAndSaveOverlays(e,i).next(l=>(l.forEach((h,d)=>o.set(h,d)),t.forEach((h,d)=>c.set(h,new ZT(d,o.get(h)??null))),c))}recalculateAndSaveOverlays(e,t){const r=Fr();let s=new ue((o,c)=>o-c),i=Y();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const c of o)c.keys().forEach(l=>{const h=t.get(l);if(h===null)return;let d=r.get(l)||Ke.empty();d=c.applyToLocalView(h,d),r.set(l,d);const p=(s.get(c.batchId)||Y()).add(l);s=s.insert(c.batchId,p)})}).next(()=>{const o=[],c=s.getReverseIterator();for(;c.hasNext();){const l=c.getNext(),h=l.key,d=l.value,p=qf();d.forEach(m=>{if(!i.has(m)){const E=Xf(t.get(m),r.get(m));E!==null&&p.set(m,E),i=i.add(m)}}),o.push(this.documentOverlayCache.saveOverlays(e,h,p))}return k.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(o){return U.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):nT(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):k.resolve(on());let c=Yr,l=i;return o.next(h=>k.forEach(h,(d,p)=>(c<p.largestBatchId&&(c=p.largestBatchId),i.get(d)?k.resolve():this.remoteDocumentCache.getEntry(e,d).next(m=>{l=l.insert(d,m)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,l,h,Y())).next(d=>({batchId:c,changes:jf(d)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new U(t)).next(r=>{let s=Rr();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let o=Rr();return this.indexManager.getCollectionParents(e,i).next(c=>k.forEach(c,l=>{const h=function(p,m){return new to(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(t,l.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next(d=>{d.forEach((p,m)=>{o=o.insert(p,m)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s))).next(o=>{i.forEach((l,h)=>{const d=h.getKey();o.get(d)===null&&(o=o.insert(d,Me.newInvalidDocument(d)))});let c=Rr();return o.forEach((l,h)=>{const d=i.get(l);d!==void 0&&Br(d.mutation,h,Ke.empty(),te.now()),ro(t,h)&&(c=c.insert(l,h))}),c})}}/**
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
 */class tw{constructor(e){this.serializer=e,this.Lr=new Map,this.kr=new Map}getBundleMetadata(e,t){return k.resolve(this.Lr.get(t))}saveBundleMetadata(e,t){return this.Lr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:tt(s.createTime)}}(t)),k.resolve()}getNamedQuery(e,t){return k.resolve(this.kr.get(t))}saveNamedQuery(e,t){return this.kr.set(t.name,function(s){return{name:s.name,query:qT(s.bundledQuery),readTime:tt(s.readTime)}}(t)),k.resolve()}}/**
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
 */class nw{constructor(){this.overlays=new ue(U.comparator),this.qr=new Map}getOverlay(e,t){return k.resolve(this.overlays.get(t))}getOverlays(e,t){const r=on();return k.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,i)=>{this.St(e,t,i)}),k.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.qr.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.qr.delete(r)),k.resolve()}getOverlaysForCollection(e,t,r){const s=on(),i=t.length+1,o=new U(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){const l=c.getNext().value,h=l.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===i&&l.largestBatchId>r&&s.set(l.getKey(),l)}return k.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new ue((h,d)=>h-d);const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>r){let d=i.get(h.largestBatchId);d===null&&(d=on(),i=i.insert(h.largestBatchId,d)),d.set(h.getKey(),h)}}const c=on(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((h,d)=>c.set(h,d)),!(c.size()>=s)););return k.resolve(c)}St(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.qr.get(s.largestBatchId).delete(r.key);this.qr.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new TT(t,r));let i=this.qr.get(t);i===void 0&&(i=Y(),this.qr.set(t,i)),this.qr.set(t,i.add(r.key))}}/**
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
 */class rw{constructor(){this.sessionToken=Re.EMPTY_BYTE_STRING}getSessionToken(e){return k.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,k.resolve()}}/**
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
 */class Lc{constructor(){this.Qr=new ye(Ae.$r),this.Ur=new ye(Ae.Kr)}isEmpty(){return this.Qr.isEmpty()}addReference(e,t){const r=new Ae(e,t);this.Qr=this.Qr.add(r),this.Ur=this.Ur.add(r)}Wr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Gr(new Ae(e,t))}zr(e,t){e.forEach(r=>this.removeReference(r,t))}jr(e){const t=new U(new le([])),r=new Ae(t,e),s=new Ae(t,e+1),i=[];return this.Ur.forEachInRange([r,s],o=>{this.Gr(o),i.push(o.key)}),i}Jr(){this.Qr.forEach(e=>this.Gr(e))}Gr(e){this.Qr=this.Qr.delete(e),this.Ur=this.Ur.delete(e)}Hr(e){const t=new U(new le([])),r=new Ae(t,e),s=new Ae(t,e+1);let i=Y();return this.Ur.forEachInRange([r,s],o=>{i=i.add(o.key)}),i}containsKey(e){const t=new Ae(e,0),r=this.Qr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Ae{constructor(e,t){this.key=e,this.Yr=t}static $r(e,t){return U.comparator(e.key,t.key)||X(e.Yr,t.Yr)}static Kr(e,t){return X(e.Yr,t.Yr)||U.comparator(e.key,t.key)}}/**
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
 */class sw{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.tr=1,this.Zr=new ye(Ae.$r)}checkEmpty(e){return k.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.tr;this.tr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new ET(i,t,r,s);this.mutationQueue.push(o);for(const c of s)this.Zr=this.Zr.add(new Ae(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return k.resolve(o)}lookupMutationBatch(e,t){return k.resolve(this.Xr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.ei(r),i=s<0?0:s;return k.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return k.resolve(this.mutationQueue.length===0?Ic:this.tr-1)}getAllMutationBatches(e){return k.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Ae(t,0),s=new Ae(t,Number.POSITIVE_INFINITY),i=[];return this.Zr.forEachInRange([r,s],o=>{const c=this.Xr(o.Yr);i.push(c)}),k.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ye(X);return t.forEach(s=>{const i=new Ae(s,0),o=new Ae(s,Number.POSITIVE_INFINITY);this.Zr.forEachInRange([i,o],c=>{r=r.add(c.Yr)})}),k.resolve(this.ti(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;U.isDocumentKey(i)||(i=i.child(""));const o=new Ae(new U(i),0);let c=new ye(X);return this.Zr.forEachWhile(l=>{const h=l.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(c=c.add(l.Yr)),!0)},o),k.resolve(this.ti(c))}ti(e){const t=[];return e.forEach(r=>{const s=this.Xr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){ee(this.ni(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Zr;return k.forEach(t.mutations,s=>{const i=new Ae(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.Zr=r})}ir(e){}containsKey(e,t){const r=new Ae(t,0),s=this.Zr.firstAfterOrEqual(r);return k.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,k.resolve()}ni(e,t){return this.ei(e)}ei(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Xr(e){const t=this.ei(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class iw{constructor(e){this.ri=e,this.docs=function(){return new ue(U.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,o=this.ri(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return k.resolve(r?r.document.mutableCopy():Me.newInvalidDocument(t))}getEntries(e,t){let r=yt();return t.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Me.newInvalidDocument(s))}),k.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let i=yt();const o=t.path,c=new U(o.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(c);for(;l.hasNext();){const{key:h,value:{document:d}}=l.getNext();if(!o.isPrefixOf(h.path))break;h.path.length>o.length+1||LE(ME(d),r)<=0||(s.has(d.key)||ro(t,d))&&(i=i.insert(d.key,d.mutableCopy()))}return k.resolve(i)}getAllFromCollectionGroup(e,t,r,s){$(9500)}ii(e,t){return k.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new ow(this)}getSize(e){return k.resolve(this.size)}}class ow extends JT{constructor(e){super(),this.Nr=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.Nr.addEntry(e,s)):this.Nr.removeEntry(r)}),k.waitFor(t)}getFromCache(e,t){return this.Nr.getEntry(e,t)}getAllFromCache(e,t){return this.Nr.getEntries(e,t)}}/**
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
 */class aw{constructor(e){this.persistence=e,this.si=new yn(t=>Cc(t),bc),this.lastRemoteSnapshotVersion=q.min(),this.highestTargetId=0,this.oi=0,this._i=new Lc,this.targetCount=0,this.ai=Zn.ur()}forEachTarget(e,t){return this.si.forEach((r,s)=>t(s)),k.resolve()}getLastRemoteSnapshotVersion(e){return k.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return k.resolve(this.oi)}allocateTargetId(e){return this.highestTargetId=this.ai.next(),k.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.oi&&(this.oi=t),k.resolve()}Pr(e){this.si.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.ai=new Zn(t),this.highestTargetId=t),e.sequenceNumber>this.oi&&(this.oi=e.sequenceNumber)}addTargetData(e,t){return this.Pr(t),this.targetCount+=1,k.resolve()}updateTargetData(e,t){return this.Pr(t),k.resolve()}removeTargetData(e,t){return this.si.delete(t.target),this._i.jr(t.targetId),this.targetCount-=1,k.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.si.forEach((o,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.si.delete(o),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)}),k.waitFor(i).next(()=>s)}getTargetCount(e){return k.resolve(this.targetCount)}getTargetData(e,t){const r=this.si.get(t)||null;return k.resolve(r)}addMatchingKeys(e,t,r){return this._i.Wr(t,r),k.resolve()}removeMatchingKeys(e,t,r){this._i.zr(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(o=>{i.push(s.markPotentiallyOrphaned(e,o))}),k.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this._i.jr(t),k.resolve()}getMatchingKeysForTargetId(e,t){const r=this._i.Hr(t);return k.resolve(r)}containsKey(e,t){return k.resolve(this._i.containsKey(t))}}/**
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
 */class up{constructor(e,t){this.ui={},this.overlays={},this.ci=new Ji(0),this.li=!1,this.li=!0,this.hi=new rw,this.referenceDelegate=e(this),this.Pi=new aw(this),this.indexManager=new WT,this.remoteDocumentCache=function(s){return new iw(s)}(r=>this.referenceDelegate.Ti(r)),this.serializer=new jT(t),this.Ii=new tw(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.li=!1,Promise.resolve()}get started(){return this.li}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new nw,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.ui[e.toKey()];return r||(r=new sw(t,this.referenceDelegate),this.ui[e.toKey()]=r),r}getGlobalsCache(){return this.hi}getTargetCache(){return this.Pi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ii}runTransaction(e,t,r){V("MemoryPersistence","Starting transaction:",e);const s=new cw(this.ci.next());return this.referenceDelegate.Ei(),r(s).next(i=>this.referenceDelegate.di(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Ai(e,t){return k.or(Object.values(this.ui).map(r=>()=>r.containsKey(e,t)))}}class cw extends OE{constructor(e){super(),this.currentSequenceNumber=e}}class Dc{constructor(e){this.persistence=e,this.Ri=new Lc,this.Vi=null}static mi(e){return new Dc(e)}get fi(){if(this.Vi)return this.Vi;throw $(60996)}addReference(e,t,r){return this.Ri.addReference(r,t),this.fi.delete(r.toString()),k.resolve()}removeReference(e,t,r){return this.Ri.removeReference(r,t),this.fi.add(r.toString()),k.resolve()}markPotentiallyOrphaned(e,t){return this.fi.add(t.toString()),k.resolve()}removeTarget(e,t){this.Ri.jr(t.targetId).forEach(s=>this.fi.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.fi.add(i.toString()))}).next(()=>r.removeTargetData(e,t))}Ei(){this.Vi=new Set}di(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return k.forEach(this.fi,r=>{const s=U.fromPath(r);return this.gi(e,s).next(i=>{i||t.removeEntry(s,q.min())})}).next(()=>(this.Vi=null,t.apply(e)))}updateLimboDocument(e,t){return this.gi(e,t).next(r=>{r?this.fi.delete(t.toString()):this.fi.add(t.toString())})}Ti(e){return 0}gi(e,t){return k.or([()=>k.resolve(this.Ri.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ai(e,t)])}}class Ei{constructor(e,t){this.persistence=e,this.pi=new yn(r=>FE(r.path),(r,s)=>r.isEqual(s)),this.garbageCollector=YT(this,t)}static mi(e,t){return new Ei(e,t)}Ei(){}di(e){return k.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}gr(e){const t=this.wr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(s=>r+s))}wr(e){let t=0;return this.pr(e,r=>{t++}).next(()=>t)}pr(e,t){return k.forEach(this.pi,(r,s)=>this.br(e,r,s).next(i=>i?k.resolve():t(s)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.ii(e,o=>this.br(e,o,t).next(c=>{c||(r++,i.removeEntry(o,q.min()))})).next(()=>i.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.pi.set(t,e.currentSequenceNumber),k.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.pi.set(r,e.currentSequenceNumber),k.resolve()}removeReference(e,t,r){return this.pi.set(r,e.currentSequenceNumber),k.resolve()}updateLimboDocument(e,t){return this.pi.set(t,e.currentSequenceNumber),k.resolve()}Ti(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Ys(e.data.value)),t}br(e,t,r){return k.or([()=>this.persistence.Ai(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.pi.get(t);return k.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class Oc{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.Es=r,this.ds=s}static As(e,t){let r=Y(),s=Y();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Oc(e,t.fromCache,r,s)}}/**
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
 */class lw{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class uw{constructor(){this.Rs=!1,this.Vs=!1,this.fs=100,this.gs=function(){return lE()?8:VE(aE())>0?6:4}()}initialize(e,t){this.ps=e,this.indexManager=t,this.Rs=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.ys(e,t).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.ws(e,t,s,r).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new lw;return this.Ss(e,t,o).next(c=>{if(i.result=c,this.Vs)return this.bs(e,t,o,c.size)})}).next(()=>i.result)}bs(e,t,r,s){return r.documentReadCount<this.fs?(Pn()<=Z.DEBUG&&V("QueryEngine","SDK will not create cache indexes for query:",kn(t),"since it only creates cache indexes for collection contains","more than or equal to",this.fs,"documents"),k.resolve()):(Pn()<=Z.DEBUG&&V("QueryEngine","Query:",kn(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.gs*s?(Pn()<=Z.DEBUG&&V("QueryEngine","The SDK decides to create cache indexes for query:",kn(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,et(t))):k.resolve())}ys(e,t){if(dh(t))return k.resolve(null);let r=et(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=$a(t,null,"F"),r=et(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const o=Y(...i);return this.ps.getDocuments(e,o).next(c=>this.indexManager.getMinOffset(e,r).next(l=>{const h=this.Ds(t,c);return this.Cs(t,h,o,l.readTime)?this.ys(e,$a(t,null,"F")):this.vs(e,h,t,l)}))})))}ws(e,t,r,s){return dh(t)||s.isEqual(q.min())?k.resolve(null):this.ps.getDocuments(e,r).next(i=>{const o=this.Ds(t,i);return this.Cs(t,o,r,s)?k.resolve(null):(Pn()<=Z.DEBUG&&V("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),kn(t)),this.vs(e,o,t,NE(s,Yr)).next(c=>c))})}Ds(e,t){let r=new ye($f(e));return t.forEach((s,i)=>{ro(e,i)&&(r=r.add(i))}),r}Cs(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Ss(e,t,r){return Pn()<=Z.DEBUG&&V("QueryEngine","Using full collection scan to execute query:",kn(t)),this.ps.getDocumentsMatchingQuery(e,t,jt.min(),r)}vs(e,t,r,s){return this.ps.getDocumentsMatchingQuery(e,r,s).next(i=>(t.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
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
 */const Vc="LocalStore",hw=3e8;class dw{constructor(e,t,r,s){this.persistence=e,this.Fs=t,this.serializer=s,this.Ms=new ue(X),this.xs=new yn(i=>Cc(i),bc),this.Os=new Map,this.Ns=e.getRemoteDocumentCache(),this.Pi=e.getTargetCache(),this.Ii=e.getBundleCache(),this.Bs(r)}Bs(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new ew(this.Ns,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Ns.setIndexManager(this.indexManager),this.Fs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Ms))}}function fw(n,e,t,r){return new dw(n,e,t,r)}async function hp(n,e){const t=W(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,t.Bs(e),t.mutationQueue.getAllMutationBatches(r))).next(i=>{const o=[],c=[];let l=Y();for(const h of s){o.push(h.batchId);for(const d of h.mutations)l=l.add(d.key)}for(const h of i){c.push(h.batchId);for(const d of h.mutations)l=l.add(d.key)}return t.localDocuments.getDocuments(r,l).next(h=>({Ls:h,removedBatchIds:o,addedBatchIds:c}))})})}function pw(n,e){const t=W(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=t.Ns.newChangeBuffer({trackRemovals:!0});return function(c,l,h,d){const p=h.batch,m=p.keys();let E=k.resolve();return m.forEach(A=>{E=E.next(()=>d.getEntry(l,A)).next(N=>{const R=h.docVersions.get(A);ee(R!==null,48541),N.version.compareTo(R)<0&&(p.applyToRemoteDocument(N,h),N.isValidDocument()&&(N.setReadTime(h.commitVersion),d.addEntry(N)))})}),E.next(()=>c.mutationQueue.removeMutationBatch(l,p))}(t,r,e,i).next(()=>i.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(c){let l=Y();for(let h=0;h<c.mutationResults.length;++h)c.mutationResults[h].transformResults.length>0&&(l=l.add(c.batch.mutations[h].key));return l}(e))).next(()=>t.localDocuments.getDocuments(r,s))})}function dp(n){const e=W(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Pi.getLastRemoteSnapshotVersion(t))}function mw(n,e){const t=W(n),r=e.snapshotVersion;let s=t.Ms;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=t.Ns.newChangeBuffer({trackRemovals:!0});s=t.Ms;const c=[];e.targetChanges.forEach((d,p)=>{const m=s.get(p);if(!m)return;c.push(t.Pi.removeMatchingKeys(i,d.removedDocuments,p).next(()=>t.Pi.addMatchingKeys(i,d.addedDocuments,p)));let E=m.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?E=E.withResumeToken(Re.EMPTY_BYTE_STRING,q.min()).withLastLimboFreeSnapshotVersion(q.min()):d.resumeToken.approximateByteSize()>0&&(E=E.withResumeToken(d.resumeToken,r)),s=s.insert(p,E),function(N,R,O){return N.resumeToken.approximateByteSize()===0||R.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=hw?!0:O.addedDocuments.size+O.modifiedDocuments.size+O.removedDocuments.size>0}(m,E,d)&&c.push(t.Pi.updateTargetData(i,E))});let l=yt(),h=Y();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,d))}),c.push(gw(i,o,e.documentUpdates).next(d=>{l=d.ks,h=d.qs})),!r.isEqual(q.min())){const d=t.Pi.getLastRemoteSnapshotVersion(i).next(p=>t.Pi.setTargetsMetadata(i,i.currentSequenceNumber,r));c.push(d)}return k.waitFor(c).next(()=>o.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,l,h)).next(()=>l)}).then(i=>(t.Ms=s,i))}function gw(n,e,t){let r=Y(),s=Y();return t.forEach(i=>r=r.add(i)),e.getEntries(n,r).next(i=>{let o=yt();return t.forEach((c,l)=>{const h=i.get(c);l.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(c)),l.isNoDocument()&&l.version.isEqual(q.min())?(e.removeEntry(c,l.readTime),o=o.insert(c,l)):!h.isValidDocument()||l.version.compareTo(h.version)>0||l.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(l),o=o.insert(c,l)):V(Vc,"Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",l.version)}),{ks:o,qs:s}})}function _w(n,e){const t=W(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=Ic),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function yw(n,e){const t=W(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.Pi.getTargetData(r,e).next(i=>i?(s=i,k.resolve(s)):t.Pi.allocateTargetId(r).next(o=>(s=new Lt(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.Pi.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.Ms.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.Ms=t.Ms.insert(r.targetId,r),t.xs.set(e,r.targetId)),r})}async function za(n,e,t){const r=W(n),s=r.Ms.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,o=>r.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!or(o))throw o;V(Vc,`Failed to update sequence numbers for target ${e}: ${o}`)}r.Ms=r.Ms.remove(e),r.xs.delete(s.target)}function Sh(n,e,t){const r=W(n);let s=q.min(),i=Y();return r.persistence.runTransaction("Execute query","readwrite",o=>function(l,h,d){const p=W(l),m=p.xs.get(d);return m!==void 0?k.resolve(p.Ms.get(m)):p.Pi.getTargetData(h,d)}(r,o,et(e)).next(c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.Pi.getMatchingKeysForTargetId(o,c.targetId).next(l=>{i=l})}).next(()=>r.Fs.getDocumentsMatchingQuery(o,e,t?s:q.min(),t?i:Y())).next(c=>(Ew(r,sT(e),c),{documents:c,Qs:i})))}function Ew(n,e,t){let r=n.Os.get(e)||q.min();t.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),n.Os.set(e,r)}class Ch{constructor(){this.activeTargetIds=uT()}zs(e){this.activeTargetIds=this.activeTargetIds.add(e)}js(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Gs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Tw{constructor(){this.Mo=new Ch,this.xo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.Mo.zs(e),this.xo[e]||"not-current"}updateQueryState(e,t,r){this.xo[e]=t}removeLocalQueryTarget(e){this.Mo.js(e)}isLocalQueryTarget(e){return this.Mo.activeTargetIds.has(e)}clearQueryState(e){delete this.xo[e]}getAllActiveQueryTargets(){return this.Mo.activeTargetIds}isActiveQueryTarget(e){return this.Mo.activeTargetIds.has(e)}start(){return this.Mo=new Ch,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class ww{Oo(e){}shutdown(){}}/**
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
 */const bh="ConnectivityMonitor";class Rh{constructor(){this.No=()=>this.Bo(),this.Lo=()=>this.ko(),this.qo=[],this.Qo()}Oo(e){this.qo.push(e)}shutdown(){window.removeEventListener("online",this.No),window.removeEventListener("offline",this.Lo)}Qo(){window.addEventListener("online",this.No),window.addEventListener("offline",this.Lo)}Bo(){V(bh,"Network connectivity changed: AVAILABLE");for(const e of this.qo)e(0)}ko(){V(bh,"Network connectivity changed: UNAVAILABLE");for(const e of this.qo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let Bs=null;function Ka(){return Bs===null?Bs=function(){return 268435456+Math.round(2147483648*Math.random())}():Bs++,"0x"+Bs.toString(16)}/**
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
 */const ua="RestConnection",vw={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class Iw{get $o(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Uo=t+"://"+e.host,this.Ko=`projects/${r}/databases/${s}`,this.Wo=this.databaseId.database===di?`project_id=${r}`:`project_id=${r}&database_id=${s}`}Go(e,t,r,s,i){const o=Ka(),c=this.zo(e,t.toUriEncodedString());V(ua,`Sending RPC '${e}' ${o}:`,c,r);const l={"google-cloud-resource-prefix":this.Ko,"x-goog-request-params":this.Wo};this.jo(l,s,i);const{host:h}=new URL(c),d=Ec(h);return this.Jo(e,c,l,r,d).then(p=>(V(ua,`Received RPC '${e}' ${o}: `,p),p),p=>{throw Qn(ua,`RPC '${e}' ${o} failed with error: `,p,"url: ",c,"request:",r),p})}Ho(e,t,r,s,i,o){return this.Go(e,t,r,s,i)}jo(e,t,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+sr}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((s,i)=>e[i]=s),r&&r.headers.forEach((s,i)=>e[i]=s)}zo(e,t){const r=vw[e];return`${this.Uo}/v1/${t}:${r}`}terminate(){}}/**
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
 */class Aw{constructor(e){this.Yo=e.Yo,this.Zo=e.Zo}Xo(e){this.e_=e}t_(e){this.n_=e}r_(e){this.i_=e}onMessage(e){this.s_=e}close(){this.Zo()}send(e){this.Yo(e)}o_(){this.e_()}__(){this.n_()}a_(e){this.i_(e)}u_(e){this.s_(e)}}/**
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
 */const ke="WebChannelConnection";class Sw extends Iw{constructor(e){super(e),this.c_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Jo(e,t,r,s,i){const o=Ka();return new Promise((c,l)=>{const h=new mf;h.setWithCredentials(!0),h.listenOnce(gf.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case Xs.NO_ERROR:const p=h.getResponseJson();V(ke,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),c(p);break;case Xs.TIMEOUT:V(ke,`RPC '${e}' ${o} timed out`),l(new B(L.DEADLINE_EXCEEDED,"Request time out"));break;case Xs.HTTP_ERROR:const m=h.getStatus();if(V(ke,`RPC '${e}' ${o} failed with status:`,m,"response text:",h.getResponseText()),m>0){let E=h.getResponseJson();Array.isArray(E)&&(E=E[0]);const A=E==null?void 0:E.error;if(A&&A.status&&A.message){const N=function(O){const x=O.toLowerCase().replace(/_/g,"-");return Object.values(L).indexOf(x)>=0?x:L.UNKNOWN}(A.status);l(new B(N,A.message))}else l(new B(L.UNKNOWN,"Server responded with status "+h.getStatus()))}else l(new B(L.UNAVAILABLE,"Connection failed."));break;default:$(9055,{l_:e,streamId:o,h_:h.getLastErrorCode(),P_:h.getLastError()})}}finally{V(ke,`RPC '${e}' ${o} completed.`)}});const d=JSON.stringify(s);V(ke,`RPC '${e}' ${o} sending request:`,s),h.send(t,"POST",d,r,15)})}T_(e,t,r){const s=Ka(),i=[this.Uo,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=Ef(),c=yf(),l={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(l.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(l.useFetchStreams=!0),this.jo(l.initMessageHeaders,t,r),l.encodeInitMessageHeaders=!0;const d=i.join("");V(ke,`Creating RPC '${e}' stream ${s}: ${d}`,l);const p=o.createWebChannel(d,l);this.I_(p);let m=!1,E=!1;const A=new Aw({Yo:R=>{E?V(ke,`Not sending because RPC '${e}' stream ${s} is closed:`,R):(m||(V(ke,`Opening RPC '${e}' stream ${s} transport.`),p.open(),m=!0),V(ke,`RPC '${e}' stream ${s} sending:`,R),p.send(R))},Zo:()=>p.close()}),N=(R,O,x)=>{R.listen(O,F=>{try{x(F)}catch(z){setTimeout(()=>{throw z},0)}})};return N(p,br.EventType.OPEN,()=>{E||(V(ke,`RPC '${e}' stream ${s} transport opened.`),A.o_())}),N(p,br.EventType.CLOSE,()=>{E||(E=!0,V(ke,`RPC '${e}' stream ${s} transport closed`),A.a_(),this.E_(p))}),N(p,br.EventType.ERROR,R=>{E||(E=!0,Qn(ke,`RPC '${e}' stream ${s} transport errored. Name:`,R.name,"Message:",R.message),A.a_(new B(L.UNAVAILABLE,"The operation could not be completed")))}),N(p,br.EventType.MESSAGE,R=>{var O;if(!E){const x=R.data[0];ee(!!x,16349);const F=x,z=(F==null?void 0:F.error)||((O=F[0])==null?void 0:O.error);if(z){V(ke,`RPC '${e}' stream ${s} received error:`,z);const ne=z.status;let Q=function(T){const I=fe[T];if(I!==void 0)return Zf(I)}(ne),w=z.message;Q===void 0&&(Q=L.INTERNAL,w="Unknown error status: "+ne+" with message "+z.message),E=!0,A.a_(new B(Q,w)),p.close()}else V(ke,`RPC '${e}' stream ${s} received:`,x),A.u_(x)}}),N(c,_f.STAT_EVENT,R=>{R.stat===Oa.PROXY?V(ke,`RPC '${e}' stream ${s} detected buffering proxy`):R.stat===Oa.NOPROXY&&V(ke,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{A.__()},0),A}terminate(){this.c_.forEach(e=>e.close()),this.c_=[]}I_(e){this.c_.push(e)}E_(e){this.c_=this.c_.filter(t=>t===e)}}function ha(){return typeof document<"u"?document:null}/**
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
 */function ao(n){return new PT(n,!0)}/**
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
 */class fp{constructor(e,t,r=1e3,s=1.5,i=6e4){this.Mi=e,this.timerId=t,this.d_=r,this.A_=s,this.R_=i,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(e){this.cancel();const t=Math.floor(this.V_+this.y_()),r=Math.max(0,Date.now()-this.f_),s=Math.max(0,t-r);s>0&&V("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.V_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,s,()=>(this.f_=Date.now(),e())),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}/**
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
 */const Ph="PersistentStream";class pp{constructor(e,t,r,s,i,o,c,l){this.Mi=e,this.S_=r,this.b_=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new fp(e,t)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Mi.enqueueAfterDelay(this.S_,6e4,()=>this.k_()))}q_(e){this.Q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}Q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.Q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():t&&t.code===L.RESOURCE_EXHAUSTED?(_t(t.toString()),_t("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):t&&t.code===L.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.K_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.r_(t)}K_(){}auth(){this.state=1;const e=this.W_(this.D_),t=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.D_===t&&this.G_(r,s)},r=>{e(()=>{const s=new B(L.UNKNOWN,"Fetching auth token failed: "+r.message);return this.z_(s)})})}G_(e,t){const r=this.W_(this.D_);this.stream=this.j_(e,t),this.stream.Xo(()=>{r(()=>this.listener.Xo())}),this.stream.t_(()=>{r(()=>(this.state=2,this.v_=this.Mi.enqueueAfterDelay(this.b_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.t_()))}),this.stream.r_(s=>{r(()=>this.z_(s))}),this.stream.onMessage(s=>{r(()=>++this.F_==1?this.J_(s):this.onNext(s))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return V(Ph,`close with error: ${e}`),this.stream=null,this.close(4,e)}W_(e){return t=>{this.Mi.enqueueAndForget(()=>this.D_===e?t():(V(Ph,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Cw extends pp{constructor(e,t,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}j_(e,t){return this.connection.T_("Listen",e,t)}J_(e){return this.onNext(e)}onNext(e){this.M_.reset();const t=MT(this.serializer,e),r=function(i){if(!("targetChange"in i))return q.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?q.min():o.readTime?tt(o.readTime):q.min()}(e);return this.listener.H_(t,r)}Y_(e){const t={};t.database=Wa(this.serializer),t.addTarget=function(i,o){let c;const l=o.target;if(c=Ua(l)?{documents:OT(i,l)}:{query:VT(i,l).ft},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=np(i,o.resumeToken);const h=Ha(i,o.expectedCount);h!==null&&(c.expectedCount=h)}else if(o.snapshotVersion.compareTo(q.min())>0){c.readTime=yi(i,o.snapshotVersion.toTimestamp());const h=Ha(i,o.expectedCount);h!==null&&(c.expectedCount=h)}return c}(this.serializer,e);const r=FT(this.serializer,e);r&&(t.labels=r),this.q_(t)}Z_(e){const t={};t.database=Wa(this.serializer),t.removeTarget=e,this.q_(t)}}class bw extends pp{constructor(e,t,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}get X_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}K_(){this.X_&&this.ea([])}j_(e,t){return this.connection.T_("Write",e,t)}J_(e){return ee(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,ee(!e.writeResults||e.writeResults.length===0,55816),this.listener.ta()}onNext(e){ee(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const t=DT(e.writeResults,e.commitTime),r=tt(e.commitTime);return this.listener.na(r,t)}ra(){const e={};e.database=Wa(this.serializer),this.q_(e)}ea(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>LT(this.serializer,r))};this.q_(t)}}/**
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
 */class Rw{}class Pw extends Rw{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.ia=!1}sa(){if(this.ia)throw new B(L.FAILED_PRECONDITION,"The client has already been terminated.")}Go(e,t,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Go(e,ja(t,r),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new B(L.UNKNOWN,i.toString())})}Ho(e,t,r,s,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,c])=>this.connection.Ho(e,ja(t,r),s,o,c,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new B(L.UNKNOWN,o.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}class kw{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(_t(t),this.aa=!1):V("OnlineStateTracker",t)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
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
 */const fn="RemoteStore";class Nw{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.da=[],this.Aa=i,this.Aa.Oo(o=>{r.enqueueAndForget(async()=>{Tn(this)&&(V(fn,"Restarting streams for network reachability change."),await async function(l){const h=W(l);h.Ea.add(4),await ds(h),h.Ra.set("Unknown"),h.Ea.delete(4),await co(h)}(this))})}),this.Ra=new kw(r,s)}}async function co(n){if(Tn(n))for(const e of n.da)await e(!0)}async function ds(n){for(const e of n.da)await e(!1)}function mp(n,e){const t=W(n);t.Ia.has(e.targetId)||(t.Ia.set(e.targetId,e),Uc(t)?Bc(t):ar(t).O_()&&Fc(t,e))}function xc(n,e){const t=W(n),r=ar(t);t.Ia.delete(e),r.O_()&&gp(t,e),t.Ia.size===0&&(r.O_()?r.L_():Tn(t)&&t.Ra.set("Unknown"))}function Fc(n,e){if(n.Va.Ue(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(q.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}ar(n).Y_(e)}function gp(n,e){n.Va.Ue(e),ar(n).Z_(e)}function Bc(n){n.Va=new ST({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),At:e=>n.Ia.get(e)||null,ht:()=>n.datastore.serializer.databaseId}),ar(n).start(),n.Ra.ua()}function Uc(n){return Tn(n)&&!ar(n).x_()&&n.Ia.size>0}function Tn(n){return W(n).Ea.size===0}function _p(n){n.Va=void 0}async function Mw(n){n.Ra.set("Online")}async function Lw(n){n.Ia.forEach((e,t)=>{Fc(n,e)})}async function Dw(n,e){_p(n),Uc(n)?(n.Ra.ha(e),Bc(n)):n.Ra.set("Unknown")}async function Ow(n,e,t){if(n.Ra.set("Online"),e instanceof tp&&e.state===2&&e.cause)try{await async function(s,i){const o=i.cause;for(const c of i.targetIds)s.Ia.has(c)&&(await s.remoteSyncer.rejectListen(c,o),s.Ia.delete(c),s.Va.removeTarget(c))}(n,e)}catch(r){V(fn,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Ti(n,r)}else if(e instanceof ei?n.Va.Ze(e):e instanceof ep?n.Va.st(e):n.Va.tt(e),!t.isEqual(q.min()))try{const r=await dp(n.localStore);t.compareTo(r)>=0&&await function(i,o){const c=i.Va.Tt(o);return c.targetChanges.forEach((l,h)=>{if(l.resumeToken.approximateByteSize()>0){const d=i.Ia.get(h);d&&i.Ia.set(h,d.withResumeToken(l.resumeToken,o))}}),c.targetMismatches.forEach((l,h)=>{const d=i.Ia.get(l);if(!d)return;i.Ia.set(l,d.withResumeToken(Re.EMPTY_BYTE_STRING,d.snapshotVersion)),gp(i,l);const p=new Lt(d.target,l,h,d.sequenceNumber);Fc(i,p)}),i.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){V(fn,"Failed to raise snapshot:",r),await Ti(n,r)}}async function Ti(n,e,t){if(!or(e))throw e;n.Ea.add(1),await ds(n),n.Ra.set("Offline"),t||(t=()=>dp(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{V(fn,"Retrying IndexedDB access"),await t(),n.Ea.delete(1),await co(n)})}function yp(n,e){return e().catch(t=>Ti(n,t,e))}async function lo(n){const e=W(n),t=Kt(e);let r=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:Ic;for(;Vw(e);)try{const s=await _w(e.localStore,r);if(s===null){e.Ta.length===0&&t.L_();break}r=s.batchId,xw(e,s)}catch(s){await Ti(e,s)}Ep(e)&&Tp(e)}function Vw(n){return Tn(n)&&n.Ta.length<10}function xw(n,e){n.Ta.push(e);const t=Kt(n);t.O_()&&t.X_&&t.ea(e.mutations)}function Ep(n){return Tn(n)&&!Kt(n).x_()&&n.Ta.length>0}function Tp(n){Kt(n).start()}async function Fw(n){Kt(n).ra()}async function Bw(n){const e=Kt(n);for(const t of n.Ta)e.ea(t.mutations)}async function Uw(n,e,t){const r=n.Ta.shift(),s=kc.from(r,e,t);await yp(n,()=>n.remoteSyncer.applySuccessfulWrite(s)),await lo(n)}async function $w(n,e){e&&Kt(n).X_&&await async function(r,s){if(function(o){return vT(o)&&o!==L.ABORTED}(s.code)){const i=r.Ta.shift();Kt(r).B_(),await yp(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await lo(r)}}(n,e),Ep(n)&&Tp(n)}async function kh(n,e){const t=W(n);t.asyncQueue.verifyOperationInProgress(),V(fn,"RemoteStore received new credentials");const r=Tn(t);t.Ea.add(3),await ds(t),r&&t.Ra.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ea.delete(3),await co(t)}async function Hw(n,e){const t=W(n);e?(t.Ea.delete(2),await co(t)):e||(t.Ea.add(2),await ds(t),t.Ra.set("Unknown"))}function ar(n){return n.ma||(n.ma=function(t,r,s){const i=W(t);return i.sa(),new Cw(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Xo:Mw.bind(null,n),t_:Lw.bind(null,n),r_:Dw.bind(null,n),H_:Ow.bind(null,n)}),n.da.push(async e=>{e?(n.ma.B_(),Uc(n)?Bc(n):n.Ra.set("Unknown")):(await n.ma.stop(),_p(n))})),n.ma}function Kt(n){return n.fa||(n.fa=function(t,r,s){const i=W(t);return i.sa(),new bw(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Xo:()=>Promise.resolve(),t_:Fw.bind(null,n),r_:$w.bind(null,n),ta:Bw.bind(null,n),na:Uw.bind(null,n)}),n.da.push(async e=>{e?(n.fa.B_(),await lo(n)):(await n.fa.stop(),n.Ta.length>0&&(V(fn,`Stopping write stream with ${n.Ta.length} pending writes`),n.Ta=[]))})),n.fa}/**
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
 */class $c{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new cn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const o=Date.now()+r,c=new $c(e,t,o,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new B(L.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Hc(n,e){if(_t("AsyncQueue",`${e}: ${n}`),or(n))return new B(L.UNAVAILABLE,`${e}: ${n}`);throw n}/**
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
 */class $n{static emptySet(e){return new $n(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||U.comparator(t.key,r.key):(t,r)=>U.comparator(t.key,r.key),this.keyedMap=Rr(),this.sortedSet=new ue(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof $n)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new $n;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
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
 */class Nh{constructor(){this.ga=new ue(U.comparator)}track(e){const t=e.doc.key,r=this.ga.get(t);r?e.type!==0&&r.type===3?this.ga=this.ga.insert(t,e):e.type===3&&r.type!==1?this.ga=this.ga.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.ga=this.ga.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.ga=this.ga.remove(t):e.type===1&&r.type===2?this.ga=this.ga.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):$(63341,{Rt:e,pa:r}):this.ga=this.ga.insert(t,e)}ya(){const e=[];return this.ga.inorderTraversal((t,r)=>{e.push(r)}),e}}class er{constructor(e,t,r,s,i,o,c,l,h){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=l,this.hasCachedResults=h}static fromInitialDocuments(e,t,r,s,i){const o=[];return t.forEach(c=>{o.push({type:0,doc:c})}),new er(e,t,$n.emptySet(t),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&no(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
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
 */class jw{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some(e=>e.Da())}}class qw{constructor(){this.queries=Mh(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(t,r){const s=W(t),i=s.queries;s.queries=Mh(),i.forEach((o,c)=>{for(const l of c.Sa)l.onError(r)})})(this,new B(L.ABORTED,"Firestore shutting down"))}}function Mh(){return new yn(n=>Uf(n),no)}async function Ww(n,e){const t=W(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.ba()&&e.Da()&&(r=2):(i=new jw,r=e.Da()?0:1);try{switch(r){case 0:i.wa=await t.onListen(s,!0);break;case 1:i.wa=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const c=Hc(o,`Initialization of query '${kn(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.Sa.push(e),e.va(t.onlineState),i.wa&&e.Fa(i.wa)&&jc(t)}async function zw(n,e){const t=W(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const o=i.Sa.indexOf(e);o>=0&&(i.Sa.splice(o,1),i.Sa.length===0?s=e.Da()?0:1:!i.ba()&&e.Da()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function Kw(n,e){const t=W(n);let r=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const c of o.Sa)c.Fa(s)&&(r=!0);o.wa=s}}r&&jc(t)}function Gw(n,e,t){const r=W(n),s=r.queries.get(e);if(s)for(const i of s.Sa)i.onError(t);r.queries.delete(e)}function jc(n){n.Ca.forEach(e=>{e.next()})}var Ga,Lh;(Lh=Ga||(Ga={})).Ma="default",Lh.Cache="cache";class Qw{constructor(e,t,r){this.query=e,this.xa=t,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=r||{}}Fa(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new er(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),t=!0):this.La(e,this.onlineState)&&(this.ka(e),t=!0),this.Na=e,t}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let t=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),t=!0),t}La(e,t){if(!e.fromCache||!this.Da())return!0;const r=t!=="Offline";return(!this.options.qa||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;const t=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}ka(e){e=er.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==Ga.Cache}}/**
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
 */class wp{constructor(e){this.key=e}}class vp{constructor(e){this.key=e}}class Xw{constructor(e,t){this.query=e,this.Ya=t,this.Za=null,this.hasCachedResults=!1,this.current=!1,this.Xa=Y(),this.mutatedKeys=Y(),this.eu=$f(e),this.tu=new $n(this.eu)}get nu(){return this.Ya}ru(e,t){const r=t?t.iu:new Nh,s=t?t.tu:this.tu;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,c=!1;const l=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((d,p)=>{const m=s.get(d),E=ro(this.query,p)?p:null,A=!!m&&this.mutatedKeys.has(m.key),N=!!E&&(E.hasLocalMutations||this.mutatedKeys.has(E.key)&&E.hasCommittedMutations);let R=!1;m&&E?m.data.isEqual(E.data)?A!==N&&(r.track({type:3,doc:E}),R=!0):this.su(m,E)||(r.track({type:2,doc:E}),R=!0,(l&&this.eu(E,l)>0||h&&this.eu(E,h)<0)&&(c=!0)):!m&&E?(r.track({type:0,doc:E}),R=!0):m&&!E&&(r.track({type:1,doc:m}),R=!0,(l||h)&&(c=!0)),R&&(E?(o=o.add(E),i=N?i.add(d):i.delete(d)):(o=o.delete(d),i=i.delete(d)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const d=this.query.limitType==="F"?o.last():o.first();o=o.delete(d.key),i=i.delete(d.key),r.track({type:1,doc:d})}return{tu:o,iu:r,Cs:c,mutatedKeys:i}}su(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;const o=e.iu.ya();o.sort((d,p)=>function(E,A){const N=R=>{switch(R){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return $(20277,{Rt:R})}};return N(E)-N(A)}(d.type,p.type)||this.eu(d.doc,p.doc)),this.ou(r),s=s??!1;const c=t&&!s?this._u():[],l=this.Xa.size===0&&this.current&&!s?1:0,h=l!==this.Za;return this.Za=l,o.length!==0||h?{snapshot:new er(this.query,e.tu,i,o,e.mutatedKeys,l===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),au:c}:{au:c}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Nh,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{au:[]}}uu(e){return!this.Ya.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(t=>this.Ya=this.Ya.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ya=this.Ya.delete(t)),this.current=e.current)}_u(){if(!this.current)return[];const e=this.Xa;this.Xa=Y(),this.tu.forEach(r=>{this.uu(r.key)&&(this.Xa=this.Xa.add(r.key))});const t=[];return e.forEach(r=>{this.Xa.has(r)||t.push(new vp(r))}),this.Xa.forEach(r=>{e.has(r)||t.push(new wp(r))}),t}cu(e){this.Ya=e.Qs,this.Xa=Y();const t=this.ru(e.documents);return this.applyChanges(t,!0)}lu(){return er.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Za===0,this.hasCachedResults)}}const qc="SyncEngine";class Yw{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class Jw{constructor(e){this.key=e,this.hu=!1}}class Zw{constructor(e,t,r,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Pu={},this.Tu=new yn(c=>Uf(c),no),this.Iu=new Map,this.Eu=new Set,this.du=new ue(U.comparator),this.Au=new Map,this.Ru=new Lc,this.Vu={},this.mu=new Map,this.fu=Zn.cr(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function ev(n,e,t=!0){const r=Rp(n);let s;const i=r.Tu.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lu()):s=await Ip(r,e,t,!0),s}async function tv(n,e){const t=Rp(n);await Ip(t,e,!0,!1)}async function Ip(n,e,t,r){const s=await yw(n.localStore,et(e)),i=s.targetId,o=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await nv(n,e,i,o==="current",s.resumeToken)),n.isPrimaryClient&&t&&mp(n.remoteStore,s),c}async function nv(n,e,t,r,s){n.pu=(p,m,E)=>async function(N,R,O,x){let F=R.view.ru(O);F.Cs&&(F=await Sh(N.localStore,R.query,!1).then(({documents:w})=>R.view.ru(w,F)));const z=x&&x.targetChanges.get(R.targetId),ne=x&&x.targetMismatches.get(R.targetId)!=null,Q=R.view.applyChanges(F,N.isPrimaryClient,z,ne);return Oh(N,R.targetId,Q.au),Q.snapshot}(n,p,m,E);const i=await Sh(n.localStore,e,!0),o=new Xw(e,i.Qs),c=o.ru(i.documents),l=hs.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),h=o.applyChanges(c,n.isPrimaryClient,l);Oh(n,t,h.au);const d=new Yw(e,t,o);return n.Tu.set(e,d),n.Iu.has(t)?n.Iu.get(t).push(e):n.Iu.set(t,[e]),h.snapshot}async function rv(n,e,t){const r=W(n),s=r.Tu.get(e),i=r.Iu.get(s.targetId);if(i.length>1)return r.Iu.set(s.targetId,i.filter(o=>!no(o,e))),void r.Tu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await za(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&xc(r.remoteStore,s.targetId),Qa(r,s.targetId)}).catch(ir)):(Qa(r,s.targetId),await za(r.localStore,s.targetId,!0))}async function sv(n,e){const t=W(n),r=t.Tu.get(e),s=t.Iu.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),xc(t.remoteStore,r.targetId))}async function iv(n,e,t){const r=dv(n);try{const s=await function(o,c){const l=W(o),h=te.now(),d=c.reduce((E,A)=>E.add(A.key),Y());let p,m;return l.persistence.runTransaction("Locally write mutations","readwrite",E=>{let A=yt(),N=Y();return l.Ns.getEntries(E,d).next(R=>{A=R,A.forEach((O,x)=>{x.isValidDocument()||(N=N.add(O))})}).next(()=>l.localDocuments.getOverlayedDocuments(E,A)).next(R=>{p=R;const O=[];for(const x of c){const F=_T(x,p.get(x.key).overlayedDocument);F!=null&&O.push(new En(x.key,F,Lf(F.value.mapValue),pt.exists(!0)))}return l.mutationQueue.addMutationBatch(E,h,O,c)}).next(R=>{m=R;const O=R.applyToLocalDocumentSet(p,N);return l.documentOverlayCache.saveOverlays(E,R.batchId,O)})}).then(()=>({batchId:m.batchId,changes:jf(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(o,c,l){let h=o.Vu[o.currentUser.toKey()];h||(h=new ue(X)),h=h.insert(c,l),o.Vu[o.currentUser.toKey()]=h}(r,s.batchId,t),await fs(r,s.changes),await lo(r.remoteStore)}catch(s){const i=Hc(s,"Failed to persist write");t.reject(i)}}async function Ap(n,e){const t=W(n);try{const r=await mw(t.localStore,e);e.targetChanges.forEach((s,i)=>{const o=t.Au.get(i);o&&(ee(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.hu=!0:s.modifiedDocuments.size>0?ee(o.hu,14607):s.removedDocuments.size>0&&(ee(o.hu,42227),o.hu=!1))}),await fs(t,r,e)}catch(r){await ir(r)}}function Dh(n,e,t){const r=W(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Tu.forEach((i,o)=>{const c=o.view.va(e);c.snapshot&&s.push(c.snapshot)}),function(o,c){const l=W(o);l.onlineState=c;let h=!1;l.queries.forEach((d,p)=>{for(const m of p.Sa)m.va(c)&&(h=!0)}),h&&jc(l)}(r.eventManager,e),s.length&&r.Pu.H_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function ov(n,e,t){const r=W(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Au.get(e),i=s&&s.key;if(i){let o=new ue(U.comparator);o=o.insert(i,Me.newNoDocument(i,q.min()));const c=Y().add(i),l=new oo(q.min(),new Map,new ue(X),o,c);await Ap(r,l),r.du=r.du.remove(i),r.Au.delete(e),Wc(r)}else await za(r.localStore,e,!1).then(()=>Qa(r,e,t)).catch(ir)}async function av(n,e){const t=W(n),r=e.batch.batchId;try{const s=await pw(t.localStore,e);Cp(t,r,null),Sp(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await fs(t,s)}catch(s){await ir(s)}}async function cv(n,e,t){const r=W(n);try{const s=await function(o,c){const l=W(o);return l.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let d;return l.mutationQueue.lookupMutationBatch(h,c).next(p=>(ee(p!==null,37113),d=p.keys(),l.mutationQueue.removeMutationBatch(h,p))).next(()=>l.mutationQueue.performConsistencyCheck(h)).next(()=>l.documentOverlayCache.removeOverlaysForBatchId(h,d,c)).next(()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,d)).next(()=>l.localDocuments.getDocuments(h,d))})}(r.localStore,e);Cp(r,e,t),Sp(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await fs(r,s)}catch(s){await ir(s)}}function Sp(n,e){(n.mu.get(e)||[]).forEach(t=>{t.resolve()}),n.mu.delete(e)}function Cp(n,e,t){const r=W(n);let s=r.Vu[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.Vu[r.currentUser.toKey()]=s}}function Qa(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Iu.get(e))n.Tu.delete(r),t&&n.Pu.yu(r,t);n.Iu.delete(e),n.isPrimaryClient&&n.Ru.jr(e).forEach(r=>{n.Ru.containsKey(r)||bp(n,r)})}function bp(n,e){n.Eu.delete(e.path.canonicalString());const t=n.du.get(e);t!==null&&(xc(n.remoteStore,t),n.du=n.du.remove(e),n.Au.delete(t),Wc(n))}function Oh(n,e,t){for(const r of t)r instanceof wp?(n.Ru.addReference(r.key,e),lv(n,r)):r instanceof vp?(V(qc,"Document no longer in limbo: "+r.key),n.Ru.removeReference(r.key,e),n.Ru.containsKey(r.key)||bp(n,r.key)):$(19791,{wu:r})}function lv(n,e){const t=e.key,r=t.path.canonicalString();n.du.get(t)||n.Eu.has(r)||(V(qc,"New document in limbo: "+t),n.Eu.add(r),Wc(n))}function Wc(n){for(;n.Eu.size>0&&n.du.size<n.maxConcurrentLimboResolutions;){const e=n.Eu.values().next().value;n.Eu.delete(e);const t=new U(le.fromString(e)),r=n.fu.next();n.Au.set(r,new Jw(t)),n.du=n.du.insert(t,r),mp(n.remoteStore,new Lt(et(Rc(t.path)),r,"TargetPurposeLimboResolution",Ji.ce))}}async function fs(n,e,t){const r=W(n),s=[],i=[],o=[];r.Tu.isEmpty()||(r.Tu.forEach((c,l)=>{o.push(r.pu(l,e,t).then(h=>{var d;if((h||t)&&r.isPrimaryClient){const p=h?!h.fromCache:(d=t==null?void 0:t.targetChanges.get(l.targetId))==null?void 0:d.current;r.sharedClientState.updateQueryState(l.targetId,p?"current":"not-current")}if(h){s.push(h);const p=Oc.As(l.targetId,h);i.push(p)}}))}),await Promise.all(o),r.Pu.H_(s),await async function(l,h){const d=W(l);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>k.forEach(h,m=>k.forEach(m.Es,E=>d.persistence.referenceDelegate.addReference(p,m.targetId,E)).next(()=>k.forEach(m.ds,E=>d.persistence.referenceDelegate.removeReference(p,m.targetId,E)))))}catch(p){if(!or(p))throw p;V(Vc,"Failed to update sequence numbers: "+p)}for(const p of h){const m=p.targetId;if(!p.fromCache){const E=d.Ms.get(m),A=E.snapshotVersion,N=E.withLastLimboFreeSnapshotVersion(A);d.Ms=d.Ms.insert(m,N)}}}(r.localStore,i))}async function uv(n,e){const t=W(n);if(!t.currentUser.isEqual(e)){V(qc,"User change. New user:",e.toKey());const r=await hp(t.localStore,e);t.currentUser=e,function(i,o){i.mu.forEach(c=>{c.forEach(l=>{l.reject(new B(L.CANCELLED,o))})}),i.mu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await fs(t,r.Ls)}}function hv(n,e){const t=W(n),r=t.Au.get(e);if(r&&r.hu)return Y().add(r.key);{let s=Y();const i=t.Iu.get(e);if(!i)return s;for(const o of i){const c=t.Tu.get(o);s=s.unionWith(c.view.nu)}return s}}function Rp(n){const e=W(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Ap.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=hv.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=ov.bind(null,e),e.Pu.H_=Kw.bind(null,e.eventManager),e.Pu.yu=Gw.bind(null,e.eventManager),e}function dv(n){const e=W(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=av.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=cv.bind(null,e),e}class wi{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=ao(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,t){return null}Mu(e,t){return null}vu(e){return fw(this.persistence,new uw,e.initialUser,this.serializer)}Cu(e){return new up(Dc.mi,this.serializer)}Du(e){return new Tw}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}wi.provider={build:()=>new wi};class fv extends wi{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,t){ee(this.persistence.referenceDelegate instanceof Ei,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new QT(r,e.asyncQueue,t)}Cu(e){const t=this.cacheSizeBytes!==void 0?xe.withCacheSize(this.cacheSizeBytes):xe.DEFAULT;return new up(r=>Ei.mi(r,t),this.serializer)}}class Xa{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Dh(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=uv.bind(null,this.syncEngine),await Hw(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new qw}()}createDatastore(e){const t=ao(e.databaseInfo.databaseId),r=function(i){return new Sw(i)}(e.databaseInfo);return function(i,o,c,l){return new Pw(i,o,c,l)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,i,o,c){return new Nw(r,s,i,o,c)}(this.localStore,this.datastore,e.asyncQueue,t=>Dh(this.syncEngine,t,0),function(){return Rh.v()?new Rh:new ww}())}createSyncEngine(e,t){return function(s,i,o,c,l,h,d){const p=new Zw(s,i,o,c,l,h);return d&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=W(s);V(fn,"RemoteStore shutting down."),i.Ea.add(5),await ds(i),i.Aa.shutdown(),i.Ra.set("Unknown")}(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Xa.provider={build:()=>new Xa};/**
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
 */class pv{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):_t("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
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
 */const Gt="FirestoreClient";class mv{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=Ne.UNAUTHENTICATED,this.clientId=wc.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async o=>{V(Gt,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(V(Gt,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new cn;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Hc(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function da(n,e){n.asyncQueue.verifyOperationInProgress(),V(Gt,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await hp(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Vh(n,e){n.asyncQueue.verifyOperationInProgress();const t=await gv(n);V(Gt,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>kh(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>kh(e.remoteStore,s)),n._onlineComponents=e}async function gv(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){V(Gt,"Using user provided OfflineComponentProvider");try{await da(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===L.FAILED_PRECONDITION||s.code===L.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;Qn("Error using user provided cache. Falling back to memory cache: "+t),await da(n,new wi)}}else V(Gt,"Using default OfflineComponentProvider"),await da(n,new fv(void 0));return n._offlineComponents}async function Pp(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(V(Gt,"Using user provided OnlineComponentProvider"),await Vh(n,n._uninitializedComponentsProvider._online)):(V(Gt,"Using default OnlineComponentProvider"),await Vh(n,new Xa))),n._onlineComponents}function _v(n){return Pp(n).then(e=>e.syncEngine)}async function xh(n){const e=await Pp(n),t=e.eventManager;return t.onListen=ev.bind(null,e.syncEngine),t.onUnlisten=rv.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=tv.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=sv.bind(null,e.syncEngine),t}/**
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
 */function kp(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */const Fh=new Map;/**
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
 */const Np="firestore.googleapis.com",Bh=!0;class Uh{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new B(L.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Np,this.ssl=Bh}else this.host=e.host,this.ssl=e.ssl??Bh;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=lp;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<KT)throw new B(L.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}kE("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=kp(e.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new B(L.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new B(L.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new B(L.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class uo{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Uh({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new B(L.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new B(L.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Uh(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new TE;switch(r.type){case"firstParty":return new AE(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new B(L.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=Fh.get(t);r&&(V("ComponentProvider","Removing Datastore"),Fh.delete(t),r.terminate())}(this),Promise.resolve()}}function yv(n,e,t,r={}){var h;n=Un(n,uo);const s=Ec(e),i=n._getSettings(),o={...i,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;s&&(nE(`https://${c}`),oE("Firestore",!0)),i.host!==Np&&i.host!==c&&Qn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const l={...i,host:c,ssl:s,emulatorOptions:r};if(!ff(l,o)&&(n._setSettings(l),r.mockUserToken)){let d,p;if(typeof r.mockUserToken=="string")d=r.mockUserToken,p=Ne.MOCK_USER;else{d=rE(r.mockUserToken,(h=n._app)==null?void 0:h.options.projectId);const m=r.mockUserToken.sub||r.mockUserToken.user_id;if(!m)throw new B(L.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new Ne(m)}n._authCredentials=new wE(new wf(d,p))}}/**
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
 */class ho{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new ho(this.firestore,e,this._query)}}class _e{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ut(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new _e(this.firestore,e,this._key)}toJSON(){return{type:_e._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(ls(t,_e._jsonSchema))return new _e(e,r||null,new U(le.fromString(t.referencePath)))}}_e._jsonSchemaVersion="firestore/documentReference/1.0",_e._jsonSchema={type:pe("string",_e._jsonSchemaVersion),referencePath:pe("string")};class Ut extends ho{constructor(e,t,r){super(e,t,Rc(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new _e(this.firestore,null,new U(e))}withConverter(e){return new Ut(this.firestore,e,this._path)}}function Ev(n,e,...t){if(n=Gn(n),vf("collection","path",e),n instanceof uo){const r=le.fromString(e,...t);return Zu(r),new Ut(n,null,r)}{if(!(n instanceof _e||n instanceof Ut))throw new B(L.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(le.fromString(e,...t));return Zu(r),new Ut(n.firestore,null,r)}}function cr(n,e,...t){if(n=Gn(n),arguments.length===1&&(e=wc.newId()),vf("doc","path",e),n instanceof uo){const r=le.fromString(e,...t);return Ju(r),new _e(n,null,new U(r))}{if(!(n instanceof _e||n instanceof Ut))throw new B(L.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(le.fromString(e,...t));return Ju(r),new _e(n.firestore,n instanceof Ut?n.converter:null,new U(r))}}/**
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
 */const $h="AsyncQueue";class Hh{constructor(e=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new fp(this,"async_queue_retry"),this._c=()=>{const r=ha();r&&V($h,"Visibility state changed to "+r.visibilityState),this.M_.w_()},this.ac=e;const t=ha();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const t=ha();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});const t=new cn;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Xu.push(e),this.lc()))}async lc(){if(this.Xu.length!==0){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(e){if(!or(e))throw e;V($h,"Operation failed with retryable error: "+e)}this.Xu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){const t=this.ac.then(()=>(this.rc=!0,e().catch(r=>{throw this.nc=r,this.rc=!1,_t("INTERNAL UNHANDLED ERROR: ",jh(r)),r}).then(r=>(this.rc=!1,r))));return this.ac=t,t}enqueueAfterDelay(e,t,r){this.uc(),this.oc.indexOf(e)>-1&&(t=0);const s=$c.createAndSchedule(this,e,t,r,i=>this.hc(i));return this.tc.push(s),s}uc(){this.nc&&$(47125,{Pc:jh(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(const t of this.tc)if(t.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.tc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Tc()})}dc(e){this.oc.push(e)}hc(e){const t=this.tc.indexOf(e);this.tc.splice(t,1)}}function jh(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
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
 */function qh(n){return function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1}(n,["next","error","complete"])}class vi extends uo{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new Hh,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Hh(e),this._firestoreClient=void 0,await e}}}function Tv(n,e){const t=typeof n=="object"?n:yc(),r=typeof n=="string"?n:di,s=cs(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=tE("firestore");i&&yv(s,...i)}return s}function Mp(n){if(n._terminated)throw new B(L.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||wv(n),n._firestoreClient}function wv(n){var r,s,i;const e=n._freezeSettings(),t=function(c,l,h,d){return new $E(c,l,h,d.host,d.ssl,d.experimentalForceLongPolling,d.experimentalAutoDetectLongPolling,kp(d.experimentalLongPollingOptions),d.useFetchStreams,d.isUsingEmulator)}(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,e);n._componentsProvider||(s=e.localCache)!=null&&s._offlineComponentProvider&&((i=e.localCache)!=null&&i._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new mv(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&function(c){const l=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(l),_online:l}}(n._componentsProvider))}/**
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
 */class He{constructor(e){this._byteString=e}static fromBase64String(e){try{return new He(Re.fromBase64String(e))}catch(t){throw new B(L.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new He(Re.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:He._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(ls(e,He._jsonSchema))return He.fromBase64String(e.bytes)}}He._jsonSchemaVersion="firestore/bytes/1.0",He._jsonSchema={type:pe("string",He._jsonSchemaVersion),bytes:pe("string")};/**
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
 */class zc{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new B(L.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ce(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class Lp{constructor(e){this._methodName=e}}/**
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
 */class nt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new B(L.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new B(L.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return X(this._lat,e._lat)||X(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:nt._jsonSchemaVersion}}static fromJSON(e){if(ls(e,nt._jsonSchema))return new nt(e.latitude,e.longitude)}}nt._jsonSchemaVersion="firestore/geoPoint/1.0",nt._jsonSchema={type:pe("string",nt._jsonSchemaVersion),latitude:pe("number"),longitude:pe("number")};/**
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
 */class rt{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}toJSON(){return{type:rt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(ls(e,rt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new rt(e.vectorValues);throw new B(L.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}rt._jsonSchemaVersion="firestore/vectorValue/1.0",rt._jsonSchema={type:pe("string",rt._jsonSchemaVersion),vectorValues:pe("object")};/**
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
 */const vv=/^__.*__$/;class Iv{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new En(e,this.data,this.fieldMask,t,this.fieldTransforms):new us(e,this.data,t,this.fieldTransforms)}}function Dp(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw $(40011,{Ac:n})}}class Kc{constructor(e,t,r,s,i,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.Rc(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ac(){return this.settings.Ac}Vc(e){return new Kc({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}mc(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.Vc({path:t,fc:!1});return r.gc(e),r}yc(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.Vc({path:t,fc:!1});return r.Rc(),r}wc(e){return this.Vc({path:void 0,fc:!0})}Sc(e){return Ii(e,this.settings.methodName,this.settings.bc||!1,this.path,this.settings.Dc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Rc(){if(this.path)for(let e=0;e<this.path.length;e++)this.gc(this.path.get(e))}gc(e){if(e.length===0)throw this.Sc("Document fields must not be empty");if(Dp(this.Ac)&&vv.test(e))throw this.Sc('Document fields cannot begin and end with "__"')}}class Av{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||ao(e)}Cc(e,t,r,s=!1){return new Kc({Ac:e,methodName:t,Dc:r,path:Ce.emptyPath(),fc:!1,bc:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Sv(n){const e=n._freezeSettings(),t=ao(n._databaseId);return new Av(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Cv(n,e,t,r,s,i={}){const o=n.Cc(i.merge||i.mergeFields?2:0,e,t,s);Fp("Data must be an object, but it was:",o,r);const c=Vp(r,o);let l,h;if(i.merge)l=new Ke(o.fieldMask),h=o.fieldTransforms;else if(i.mergeFields){const d=[];for(const p of i.mergeFields){const m=bv(e,p,t);if(!o.contains(m))throw new B(L.INVALID_ARGUMENT,`Field '${m}' is specified in your field mask but missing from your input data.`);Pv(d,m)||d.push(m)}l=new Ke(d),h=o.fieldTransforms.filter(p=>l.covers(p.field))}else l=null,h=o.fieldTransforms;return new Iv(new $e(c),l,h)}function Op(n,e){if(xp(n=Gn(n)))return Fp("Unsupported field value:",e,n),Vp(n,e);if(n instanceof Lp)return function(r,s){if(!Dp(s.Ac))throw s.Sc(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Sc(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.fc&&e.Ac!==4)throw e.Sc("Nested arrays are not supported");return function(r,s){const i=[];let o=0;for(const c of r){let l=Op(c,s.wc(o));l==null&&(l={nullValue:"NULL_VALUE"}),i.push(l),o++}return{arrayValue:{values:i}}}(n,e)}return function(r,s){if((r=Gn(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return hT(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=te.fromDate(r);return{timestampValue:yi(s.serializer,i)}}if(r instanceof te){const i=new te(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:yi(s.serializer,i)}}if(r instanceof nt)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof He)return{bytesValue:np(s.serializer,r._byteString)};if(r instanceof _e){const i=s.databaseId,o=r.firestore._databaseId;if(!o.isEqual(i))throw s.Sc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:Mc(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof rt)return function(o,c){return{mapValue:{fields:{[Nf]:{stringValue:Mf},[fi]:{arrayValue:{values:o.toArray().map(h=>{if(typeof h!="number")throw c.Sc("VectorValues must only contain numeric values.");return Pc(c.serializer,h)})}}}}}}(r,s);throw s.Sc(`Unsupported field value: ${vc(r)}`)}(n,e)}function Vp(n,e){const t={};return Sf(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):_n(n,(r,s)=>{const i=Op(s,e.mc(r));i!=null&&(t[r]=i)}),{mapValue:{fields:t}}}function xp(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof te||n instanceof nt||n instanceof He||n instanceof _e||n instanceof Lp||n instanceof rt)}function Fp(n,e,t){if(!xp(t)||!If(t)){const r=vc(t);throw r==="an object"?e.Sc(n+" a custom object"):e.Sc(n+" "+r)}}function bv(n,e,t){if((e=Gn(e))instanceof zc)return e._internalPath;if(typeof e=="string")return Bp(n,e);throw Ii("Field path arguments must be of type string or ",n,!1,void 0,t)}const Rv=new RegExp("[~\\*/\\[\\]]");function Bp(n,e,t){if(e.search(Rv)>=0)throw Ii(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new zc(...e.split("."))._internalPath}catch{throw Ii(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Ii(n,e,t,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let l="";return(i||o)&&(l+=" (found",i&&(l+=` in field ${r}`),o&&(l+=` in document ${s}`),l+=")"),new B(L.INVALID_ARGUMENT,c+n+l)}function Pv(n,e){return n.some(t=>t.isEqual(e))}/**
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
 */class Up{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new _e(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new kv(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field($p("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class kv extends Up{data(){return super.data()}}function $p(n,e){return typeof e=="string"?Bp(n,e):e instanceof zc?e._internalPath:e._delegate._internalPath}/**
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
 */function Nv(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new B(L.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Mv{convertValue(e,t="none"){switch(zt(e)){case 0:return null;case 1:return e.booleanValue;case 2:return de(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Wt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw $(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return _n(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){var r,s,i;const t=(i=(s=(r=e.fields)==null?void 0:r[fi].arrayValue)==null?void 0:s.values)==null?void 0:i.map(o=>de(o.doubleValue));return new rt(t)}convertGeoPoint(e){return new nt(de(e.latitude),de(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=eo(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Jr(e));default:return null}}convertTimestamp(e){const t=qt(e);return new te(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=le.fromString(e);ee(cp(r),9688,{name:e});const s=new Zr(r.get(1),r.get(3)),i=new U(r.popFirst(5));return s.isEqual(t)||_t(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
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
 */function Lv(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class kr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class ln extends Up{constructor(e,t,r,s,i,o){super(e,t,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new ti(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field($p("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new B(L.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=ln._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}ln._jsonSchemaVersion="firestore/documentSnapshot/1.0",ln._jsonSchema={type:pe("string",ln._jsonSchemaVersion),bundleSource:pe("string","DocumentSnapshot"),bundleName:pe("string"),bundle:pe("string")};class ti extends ln{data(e={}){return super.data(e)}}class Hn{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new kr(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new ti(this._firestore,this._userDataWriter,r.key,r,new kr(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new B(L.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(c=>{const l=new ti(s._firestore,s._userDataWriter,c.doc.key,c.doc,new kr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:l,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(c=>i||c.type!==3).map(c=>{const l=new ti(s._firestore,s._userDataWriter,c.doc.key,c.doc,new kr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,d=-1;return c.type!==0&&(h=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),d=o.indexOf(c.doc.key)),{type:Dv(c.type),doc:l,oldIndex:h,newIndex:d}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new B(L.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Hn._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=wc.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach(i=>{i._document!==null&&(t.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Dv(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return $(61501,{type:n})}}Hn._jsonSchemaVersion="firestore/querySnapshot/1.0",Hn._jsonSchema={type:pe("string",Hn._jsonSchemaVersion),bundleSource:pe("string","QuerySnapshot"),bundleName:pe("string"),bundle:pe("string")};class Hp extends Mv{constructor(e){super(),this.firestore=e}convertBytes(e){return new He(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new _e(this.firestore,null,t)}}function Ai(n,e,t){n=Un(n,_e);const r=Un(n.firestore,vi),s=Lv(n.converter,e,t);return Ov(r,[Cv(Sv(r),"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,pt.none())])}function fo(n,...e){var l,h,d;n=Gn(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||qh(e[r])||(t=e[r++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(qh(e[r])){const p=e[r];e[r]=(l=p.next)==null?void 0:l.bind(p),e[r+1]=(h=p.error)==null?void 0:h.bind(p),e[r+2]=(d=p.complete)==null?void 0:d.bind(p)}let i,o,c;if(n instanceof _e)o=Un(n.firestore,vi),c=Rc(n._key.path),i={next:p=>{e[r]&&e[r](Vv(o,n,p))},error:e[r+1],complete:e[r+2]};else{const p=Un(n,ho);o=Un(p.firestore,vi),c=p._query;const m=new Hp(o);i={next:E=>{e[r]&&e[r](new Hn(o,m,p,E))},error:e[r+1],complete:e[r+2]},Nv(n._query)}return function(m,E,A,N){const R=new pv(N),O=new Qw(E,R,A);return m.asyncQueue.enqueueAndForget(async()=>Ww(await xh(m),O)),()=>{R.Nu(),m.asyncQueue.enqueueAndForget(async()=>zw(await xh(m),O))}}(Mp(o),c,s,i)}function Ov(n,e){return function(r,s){const i=new cn;return r.asyncQueue.enqueueAndForget(async()=>iv(await _v(r),s,i)),i.promise}(Mp(n),e)}function Vv(n,e,t){const r=t.docs.get(e._key),s=new Hp(n);return new ln(n,s,e._key,r,new kr(t.hasPendingWrites,t.fromCache),e.converter)}(function(e,t=!0){(function(s){sr=s})(rr),Ht(new pE("firestore",(r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),c=new vi(new vE(r.getProvider("auth-internal")),new SE(o,r.getProvider("app-check-internal")),function(h,d){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new B(L.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Zr(h.options.projectId,d)}(o,s),o);return i={useFetchStreams:t,...i},c._setSettings(i),c},"PUBLIC").setMultipleInstances(!0)),ft(Gu,Qu,e),ft(Gu,Qu,"esm2020")})();const xv=()=>{};var Wh={};/**
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
 */const Fv=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Bv=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Uv={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,l=s+2<n.length,h=l?n[s+2]:0,d=i>>2,p=(i&3)<<4|c>>4;let m=(c&15)<<2|h>>6,E=h&63;l||(E=64,o||(m=64)),r.push(t[d],t[p],t[m],t[E])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Fv(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Bv(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const p=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||p==null)throw new $v;const m=i<<2|c>>4;if(r.push(m),h!==64){const E=c<<4&240|h>>2;if(r.push(E),p!==64){const A=h<<6&192|p;r.push(A)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};let $v=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const jp=function(n){try{return Uv.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Hv(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const jv=()=>Hv().__FIREBASE_DEFAULTS__,qv=()=>{if(typeof process>"u"||typeof Wh>"u")return;const n=Wh.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Wv=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&jp(n[1]);return e&&JSON.parse(e)},qp=()=>{try{return xv()||jv()||qv()||Wv()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},zv=n=>{var e,t;return(t=(e=qp())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},Wp=n=>{var e;return(e=qp())==null?void 0:e[`_${n}`]};/**
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
 */function po(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Kv(n){return(await fetch(n,{credentials:"include"})).ok}const Ur={};function Gv(){const n={prod:[],emulator:[]};for(const e of Object.keys(Ur))Ur[e]?n.emulator.push(e):n.prod.push(e);return n}function Qv(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let zh=!1;function Xv(n,e){if(typeof window>"u"||typeof document>"u"||!po(window.location.host)||Ur[n]===e||Ur[n]||zh)return;Ur[n]=e;function t(m){return`__firebase__banner__${m}`}const r="__firebase__banner",i=Gv().prod.length>0;function o(){const m=document.getElementById(r);m&&m.remove()}function c(m){m.style.display="flex",m.style.background="#7faaf0",m.style.position="fixed",m.style.bottom="5px",m.style.left="5px",m.style.padding=".5em",m.style.borderRadius="5px",m.style.alignItems="center"}function l(m,E){m.setAttribute("width","24"),m.setAttribute("id",E),m.setAttribute("height","24"),m.setAttribute("viewBox","0 0 24 24"),m.setAttribute("fill","none"),m.style.marginLeft="-6px"}function h(){const m=document.createElement("span");return m.style.cursor="pointer",m.style.marginLeft="16px",m.style.fontSize="24px",m.innerHTML=" &times;",m.onclick=()=>{zh=!0,o()},m}function d(m,E){m.setAttribute("id",E),m.innerText="Learn more",m.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",m.setAttribute("target","__blank"),m.style.paddingLeft="5px",m.style.textDecoration="underline"}function p(){const m=Qv(r),E=t("text"),A=document.getElementById(E)||document.createElement("span"),N=t("learnmore"),R=document.getElementById(N)||document.createElement("a"),O=t("preprendIcon"),x=document.getElementById(O)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(m.created){const F=m.element;c(F),d(R,N);const z=h();l(x,O),F.append(x,A,R,z),document.body.appendChild(F)}i?(A.innerText="Preview backend disconnected.",x.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
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
 */function Ve(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Yv(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ve())}function Jv(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Zv(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function eI(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function tI(){const n=Ve();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}/**
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
 */const nI="FirebaseError";let mo=class zp extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=nI,Object.setPrototypeOf(this,zp.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,go.prototype.create)}},go=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?rI(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new mo(s,c,r)}};function rI(n,e){return n.replace(sI,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const sI=/\{\$([^}]+)}/g;function iI(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function Si(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(Kh(i)&&Kh(o)){if(!Si(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Kh(n){return n!==null&&typeof n=="object"}/**
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
 */function ps(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function oI(n,e){const t=new aI(n,e);return t.subscribe.bind(t)}class aI{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");cI(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=fa),s.error===void 0&&(s.error=fa),s.complete===void 0&&(s.complete=fa);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function cI(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function fa(){}/**
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
 */function wn(n){return n&&n._delegate?n._delegate:n}/**
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
 */var se;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(se||(se={}));const lI={debug:se.DEBUG,verbose:se.VERBOSE,info:se.INFO,warn:se.WARN,error:se.ERROR,silent:se.SILENT},uI=se.INFO,hI={[se.DEBUG]:"log",[se.VERBOSE]:"log",[se.INFO]:"info",[se.WARN]:"warn",[se.ERROR]:"error"},dI=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=hI[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let fI=class{constructor(e){this.name=e,this._logLevel=uI,this._logHandler=dI,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in se))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?lI[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,se.DEBUG,...e),this._logHandler(this,se.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,se.VERBOSE,...e),this._logHandler(this,se.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,se.INFO,...e),this._logHandler(this,se.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,se.WARN,...e),this._logHandler(this,se.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,se.ERROR,...e),this._logHandler(this,se.ERROR,...e)}},Gh=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};function Kp(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const pI=Kp,Gp=new go("auth","Firebase",Kp());/**
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
 */const Ci=new fI("@firebase/auth");function mI(n,...e){Ci.logLevel<=se.WARN&&Ci.warn(`Auth (${rr}): ${n}`,...e)}function ni(n,...e){Ci.logLevel<=se.ERROR&&Ci.error(`Auth (${rr}): ${n}`,...e)}/**
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
 */function Et(n,...e){throw Gc(n,...e)}function st(n,...e){return Gc(n,...e)}function Qp(n,e,t){const r={...pI(),[e]:t};return new go("auth","Firebase",r).create(e,{appName:n.name})}function $t(n){return Qp(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Gc(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Gp.create(n,...e)}function j(n,e,...t){if(!n)throw Gc(e,...t)}function ht(n){const e="INTERNAL ASSERTION FAILED: "+n;throw ni(e),new Error(e)}function Tt(n,e){n||ht(e)}/**
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
 */function Ya(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function gI(){return Qh()==="http:"||Qh()==="https:"}function Qh(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
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
 */function _I(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(gI()||Zv()||"connection"in navigator)?navigator.onLine:!0}function yI(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class ms{constructor(e,t){this.shortDelay=e,this.longDelay=t,Tt(t>e,"Short delay should be less than long delay!"),this.isMobile=Yv()||eI()}get(){return _I()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Qc(n,e){Tt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class Xp{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;ht("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;ht("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;ht("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const EI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const TI=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],wI=new ms(3e4,6e4);function _o(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function lr(n,e,t,r,s={}){return Yp(n,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const c=ps({key:n.config.apiKey,...o}).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const h={method:e,headers:l,...i};return Jv()||(h.referrerPolicy="no-referrer"),n.emulatorConfig&&po(n.emulatorConfig.host)&&(h.credentials="include"),Xp.fetch()(await Zp(n,n.config.apiHost,t,c),h)})}async function Yp(n,e,t){n._canInitEmulator=!1;const r={...EI,...e};try{const s=new vI(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Us(n,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const c=i.ok?o.errorMessage:o.error.message,[l,h]=c.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw Us(n,"credential-already-in-use",o);if(l==="EMAIL_EXISTS")throw Us(n,"email-already-in-use",o);if(l==="USER_DISABLED")throw Us(n,"user-disabled",o);const d=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw Qp(n,d,h);Et(n,d)}}catch(s){if(s instanceof mo)throw s;Et(n,"network-request-failed",{message:String(s)})}}async function Jp(n,e,t,r,s={}){const i=await lr(n,e,t,r,s);return"mfaPendingCredential"in i&&Et(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function Zp(n,e,t,r){const s=`${e}${t}?${r}`,i=n,o=i.config.emulator?Qc(n.config,s):`${n.config.apiScheme}://${s}`;return TI.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}class vI{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(st(this.auth,"network-request-failed")),wI.get())})}}function Us(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=st(n,e,r);return s.customData._tokenResponse=t,s}/**
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
 */async function II(n,e){return lr(n,"POST","/v1/accounts:delete",e)}async function bi(n,e){return lr(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function $r(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function AI(n,e=!1){const t=wn(n),r=await t.getIdToken(e),s=Xc(r);j(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:$r(pa(s.auth_time)),issuedAtTime:$r(pa(s.iat)),expirationTime:$r(pa(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function pa(n){return Number(n)*1e3}function Xc(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return ni("JWT malformed, contained fewer than 3 sections"),null;try{const s=jp(t);return s?JSON.parse(s):(ni("Failed to decode base64 JWT payload"),null)}catch(s){return ni("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Xh(n){const e=Xc(n);return j(e,"internal-error"),j(typeof e.exp<"u","internal-error"),j(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function rs(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof mo&&SI(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function SI({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class CI{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Ja{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=$r(this.lastLoginAt),this.creationTime=$r(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Ri(n){var p;const e=n.auth,t=await n.getIdToken(),r=await rs(n,bi(e,{idToken:t}));j(r==null?void 0:r.users.length,e,"internal-error");const s=r.users[0];n._notifyReloadListener(s);const i=(p=s.providerUserInfo)!=null&&p.length?em(s.providerUserInfo):[],o=RI(n.providerData,i),c=n.isAnonymous,l=!(n.email&&s.passwordHash)&&!(o!=null&&o.length),h=c?l:!1,d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new Ja(s.createdAt,s.lastLoginAt),isAnonymous:h};Object.assign(n,d)}async function bI(n){const e=wn(n);await Ri(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function RI(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function em(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
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
 */async function PI(n,e){const t=await Yp(n,{},async()=>{const r=ps({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,o=await Zp(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:c,body:r};return n.emulatorConfig&&po(n.emulatorConfig.host)&&(l.credentials="include"),Xp.fetch()(o,l)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function kI(n,e){return lr(n,"POST","/v2/accounts:revokeToken",_o(n,e))}/**
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
 */class jn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){j(e.idToken,"internal-error"),j(typeof e.idToken<"u","internal-error"),j(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Xh(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){j(e.length!==0,"internal-error");const t=Xh(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(j(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await PI(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,o=new jn;return r&&(j(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(j(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(j(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new jn,this.toJSON())}_performRefresh(){return ht("not implemented")}}/**
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
 */function bt(n,e){j(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Ge{constructor({uid:e,auth:t,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new CI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Ja(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await rs(this,this.stsTokenManager.getToken(this.auth,e));return j(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return AI(this,e)}reload(){return bI(this)}_assign(e){this!==e&&(j(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ge({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){j(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await Ri(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(ze(this.auth.app))return Promise.reject($t(this.auth));const e=await this.getIdToken();return await rs(this,II(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,c=t.tenantId??void 0,l=t._redirectEventId??void 0,h=t.createdAt??void 0,d=t.lastLoginAt??void 0,{uid:p,emailVerified:m,isAnonymous:E,providerData:A,stsTokenManager:N}=t;j(p&&N,e,"internal-error");const R=jn.fromJSON(this.name,N);j(typeof p=="string",e,"internal-error"),bt(r,e.name),bt(s,e.name),j(typeof m=="boolean",e,"internal-error"),j(typeof E=="boolean",e,"internal-error"),bt(i,e.name),bt(o,e.name),bt(c,e.name),bt(l,e.name),bt(h,e.name),bt(d,e.name);const O=new Ge({uid:p,auth:e,email:s,emailVerified:m,displayName:r,isAnonymous:E,photoURL:o,phoneNumber:i,tenantId:c,stsTokenManager:R,createdAt:h,lastLoginAt:d});return A&&Array.isArray(A)&&(O.providerData=A.map(x=>({...x}))),l&&(O._redirectEventId=l),O}static async _fromIdTokenResponse(e,t,r=!1){const s=new jn;s.updateFromServerResponse(t);const i=new Ge({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await Ri(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];j(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?em(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new jn;c.updateFromIdToken(r);const l=new Ge({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:o}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Ja(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,h),l}}/**
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
 */const Yh=new Map;function dt(n){Tt(n instanceof Function,"Expected a class definition");let e=Yh.get(n);return e?(Tt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Yh.set(n,e),e)}/**
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
 */class tm{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}tm.type="NONE";const Jh=tm;/**
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
 */function ri(n,e,t){return`firebase:${n}:${e}:${t}`}class qn{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=ri(this.userKey,s.apiKey,i),this.fullPersistenceKey=ri("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await bi(this.auth,{idToken:e}).catch(()=>{});return t?Ge._fromGetAccountInfoResponse(this.auth,t,e):null}return Ge._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new qn(dt(Jh),e,r);const s=(await Promise.all(t.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||dt(Jh);const o=ri(r,e.config.apiKey,e.name);let c=null;for(const h of t)try{const d=await h._get(o);if(d){let p;if(typeof d=="string"){const m=await bi(e,{idToken:d}).catch(()=>{});if(!m)break;p=await Ge._fromGetAccountInfoResponse(e,m,d)}else p=Ge._fromJSON(e,d);h!==i&&(c=p),i=h;break}}catch{}const l=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new qn(i,e,r):(i=l[0],c&&await i._set(o,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==i)try{await h._remove(o)}catch{}})),new qn(i,e,r))}}/**
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
 */function Zh(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(im(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(nm(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(am(e))return"Blackberry";if(cm(e))return"Webos";if(rm(e))return"Safari";if((e.includes("chrome/")||sm(e))&&!e.includes("edge/"))return"Chrome";if(om(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function nm(n=Ve()){return/firefox\//i.test(n)}function rm(n=Ve()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function sm(n=Ve()){return/crios\//i.test(n)}function im(n=Ve()){return/iemobile/i.test(n)}function om(n=Ve()){return/android/i.test(n)}function am(n=Ve()){return/blackberry/i.test(n)}function cm(n=Ve()){return/webos/i.test(n)}function Yc(n=Ve()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function NI(n=Ve()){var e;return Yc(n)&&!!((e=window.navigator)!=null&&e.standalone)}function MI(){return tI()&&document.documentMode===10}function lm(n=Ve()){return Yc(n)||om(n)||cm(n)||am(n)||/windows phone/i.test(n)||im(n)}/**
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
 */function um(n,e=[]){let t;switch(n){case"Browser":t=Zh(Ve());break;case"Worker":t=`${Zh(Ve())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${rr}/${r}`}/**
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
 */class LI{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((o,c)=>{try{const l=e(i);o(l)}catch(l){c(l)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function DI(n,e={}){return lr(n,"GET","/v2/passwordPolicy",_o(n,e))}/**
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
 */const OI=6;class VI{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??OI,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class xI{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new ed(this),this.idTokenSubscription=new ed(this),this.beforeStateQueue=new LI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Gp,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=dt(t)),this._initializationPromise=this.queue(async()=>{var r,s,i;if(!this._deleted&&(this.persistenceManager=await qn.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await bi(this,{idToken:e}),r=await Ge._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(ze(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,c=r==null?void 0:r._redirectEventId,l=await this.tryRedirectSignIn(e);(!o||o===c)&&(l!=null&&l.user)&&(r=l.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return j(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Ri(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=yI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(ze(this.app))return Promise.reject($t(this));const t=e?wn(e):null;return t&&j(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&j(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return ze(this.app)?Promise.reject($t(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return ze(this.app)?Promise.reject($t(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(dt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await DI(this),t=new VI(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new go("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await kI(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&dt(e)||this._popupRedirectResolver;j(t,this,"argument-error"),this.redirectPersistenceManager=await qn.create(this,[dt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(j(c,this,"internal-error"),c.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const l=e.addObserver(t,r,s);return()=>{o=!0,l()}}else{const l=e.addObserver(t);return()=>{o=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return j(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=um(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(ze(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&mI(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function yo(n){return wn(n)}class ed{constructor(e){this.auth=e,this.observer=null,this.addObserver=oI(t=>this.observer=t)}get next(){return j(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let Jc={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function FI(n){Jc=n}function BI(n){return Jc.loadJS(n)}function UI(){return Jc.gapiScript}function $I(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
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
 */function HI(n,e){const t=cs(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(Si(i,e??{}))return s;Et(s,"already-initialized")}return t.initialize({options:e})}function jI(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(dt);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function qI(n,e,t){const r=yo(n);j(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=hm(e),{host:o,port:c}=WI(e),l=c===null?"":`:${c}`,h={url:`${i}//${o}${l}/`},d=Object.freeze({host:o,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){j(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),j(Si(h,r.config.emulator)&&Si(d,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=h,r.emulatorConfig=d,r.settings.appVerificationDisabledForTesting=!0,po(o)?(Kv(`${i}//${o}${l}`),Xv("Auth",!0)):zI()}function hm(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function WI(n){const e=hm(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:td(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:td(o)}}}function td(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function zI(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class dm{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return ht("not implemented")}_getIdTokenResponse(e){return ht("not implemented")}_linkToIdToken(e,t){return ht("not implemented")}_getReauthenticationResolver(e){return ht("not implemented")}}/**
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
 */async function Wn(n,e){return Jp(n,"POST","/v1/accounts:signInWithIdp",_o(n,e))}/**
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
 */const KI="http://localhost";class pn extends dm{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new pn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Et("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...i}=t;if(!r||!s)return null;const o=new pn(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Wn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Wn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Wn(e,t)}buildRequest(){const e={requestUri:KI,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=ps(t)}return e}}/**
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
 */class fm{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class gs extends fm{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class Rt extends gs{constructor(){super("facebook.com")}static credential(e){return pn._fromParams({providerId:Rt.PROVIDER_ID,signInMethod:Rt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Rt.credentialFromTaggedObject(e)}static credentialFromError(e){return Rt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Rt.credential(e.oauthAccessToken)}catch{return null}}}Rt.FACEBOOK_SIGN_IN_METHOD="facebook.com";Rt.PROVIDER_ID="facebook.com";/**
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
 */class Pt extends gs{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return pn._fromParams({providerId:Pt.PROVIDER_ID,signInMethod:Pt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Pt.credentialFromTaggedObject(e)}static credentialFromError(e){return Pt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Pt.credential(t,r)}catch{return null}}}Pt.GOOGLE_SIGN_IN_METHOD="google.com";Pt.PROVIDER_ID="google.com";/**
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
 */class kt extends gs{constructor(){super("github.com")}static credential(e){return pn._fromParams({providerId:kt.PROVIDER_ID,signInMethod:kt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return kt.credentialFromTaggedObject(e)}static credentialFromError(e){return kt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return kt.credential(e.oauthAccessToken)}catch{return null}}}kt.GITHUB_SIGN_IN_METHOD="github.com";kt.PROVIDER_ID="github.com";/**
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
 */class Nt extends gs{constructor(){super("twitter.com")}static credential(e,t){return pn._fromParams({providerId:Nt.PROVIDER_ID,signInMethod:Nt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Nt.credentialFromTaggedObject(e)}static credentialFromError(e){return Nt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return Nt.credential(t,r)}catch{return null}}}Nt.TWITTER_SIGN_IN_METHOD="twitter.com";Nt.PROVIDER_ID="twitter.com";/**
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
 */async function GI(n,e){return Jp(n,"POST","/v1/accounts:signUp",_o(n,e))}/**
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
 */class Qt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await Ge._fromIdTokenResponse(e,r,s),o=nd(r);return new Qt({user:i,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=nd(r);return new Qt({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function nd(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */async function QI(n){var s;if(ze(n.app))return Promise.reject($t(n));const e=yo(n);if(await e._initializationPromise,(s=e.currentUser)!=null&&s.isAnonymous)return new Qt({user:e.currentUser,providerId:null,operationType:"signIn"});const t=await GI(e,{returnSecureToken:!0}),r=await Qt._fromIdTokenResponse(e,"signIn",t,!0);return await e._updateCurrentUser(r.user),r}/**
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
 */class Pi extends mo{constructor(e,t,r,s){super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Pi.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new Pi(e,t,r,s)}}function pm(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Pi._fromErrorAndOperation(n,i,e,r):i})}async function XI(n,e,t=!1){const r=await rs(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Qt._forOperation(n,"link",r)}/**
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
 */async function YI(n,e,t=!1){const{auth:r}=n;if(ze(r.app))return Promise.reject($t(r));const s="reauthenticate";try{const i=await rs(n,pm(r,s,e,n),t);j(i.idToken,r,"internal-error");const o=Xc(i.idToken);j(o,r,"internal-error");const{sub:c}=o;return j(n.uid===c,r,"user-mismatch"),Qt._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Et(r,"user-mismatch"),i}}/**
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
 */async function JI(n,e,t=!1){if(ze(n.app))return Promise.reject($t(n));const r="signIn",s=await pm(n,r,e),i=await Qt._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}function ZI(n,e,t,r){return wn(n).onIdTokenChanged(e,t,r)}function eA(n,e,t){return wn(n).beforeAuthStateChanged(e,t)}function tA(n,e,t,r){return wn(n).onAuthStateChanged(e,t,r)}const ki="__sak";/**
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
 */class mm{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(ki,"1"),this.storage.removeItem(ki),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const nA=1e3,rA=10;class gm extends mm{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=lm(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,l)=>{this.notifyListeners(o,l)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);MI()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,rA):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},nA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}gm.type="LOCAL";const sA=gm;/**
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
 */class _m extends mm{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}_m.type="SESSION";const ym=_m;/**
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
 */function iA(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class Eo{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Eo(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(o).map(async h=>h(t.origin,i)),l=await iA(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Eo.receivers=[];/**
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
 */function Zc(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class oA{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((c,l)=>{const h=Zc("",20);s.port1.start();const d=setTimeout(()=>{l(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(p){const m=p;if(m.data.eventId===h)switch(m.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(m.data.response);break;default:clearTimeout(d),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function it(){return window}function aA(n){it().location.href=n}/**
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
 */function Em(){return typeof it().WorkerGlobalScope<"u"&&typeof it().importScripts=="function"}async function cA(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function lA(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function uA(){return Em()?self:null}/**
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
 */const Tm="firebaseLocalStorageDb",hA=1,Ni="firebaseLocalStorage",wm="fbase_key";class _s{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function To(n,e){return n.transaction([Ni],e?"readwrite":"readonly").objectStore(Ni)}function dA(){const n=indexedDB.deleteDatabase(Tm);return new _s(n).toPromise()}function Za(){const n=indexedDB.open(Tm,hA);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Ni,{keyPath:wm})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Ni)?e(r):(r.close(),await dA(),e(await Za()))})})}async function rd(n,e,t){const r=To(n,!0).put({[wm]:e,value:t});return new _s(r).toPromise()}async function fA(n,e){const t=To(n,!1).get(e),r=await new _s(t).toPromise();return r===void 0?null:r.value}function sd(n,e){const t=To(n,!0).delete(e);return new _s(t).toPromise()}const pA=800,mA=3;class vm{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Za(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>mA)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Em()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Eo._getInstance(uA()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await cA(),!this.activeServiceWorker)return;this.sender=new oA(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||lA()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Za();return await rd(e,ki,"1"),await sd(e,ki),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>rd(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>fA(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>sd(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=To(s,!1).getAll();return new _s(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),pA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}vm.type="LOCAL";const gA=vm;new ms(3e4,6e4);/**
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
 */function _A(n,e){return e?dt(e):(j(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class el extends dm{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Wn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Wn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Wn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function yA(n){return JI(n.auth,new el(n),n.bypassAuthState)}function EA(n){const{auth:e,user:t}=n;return j(t,e,"internal-error"),YI(t,new el(n),n.bypassAuthState)}async function TA(n){const{auth:e,user:t}=n;return j(t,e,"internal-error"),XI(t,new el(n),n.bypassAuthState)}/**
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
 */class Im{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:o,type:c}=e;if(o){this.reject(o);return}const l={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(l))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return yA;case"linkViaPopup":case"linkViaRedirect":return TA;case"reauthViaPopup":case"reauthViaRedirect":return EA;default:Et(this.auth,"internal-error")}}resolve(e){Tt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Tt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const wA=new ms(2e3,1e4);class Dn extends Im{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Dn.currentPopupAction&&Dn.currentPopupAction.cancel(),Dn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return j(e,this.auth,"internal-error"),e}async onExecution(){Tt(this.filter.length===1,"Popup operations only handle one event");const e=Zc();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(st(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(st(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Dn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(st(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,wA.get())};e()}}Dn.currentPopupAction=null;/**
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
 */const vA="pendingRedirect",si=new Map;class IA extends Im{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=si.get(this.auth._key());if(!e){try{const r=await AA(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}si.set(this.auth._key(),e)}return this.bypassAuthState||si.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function AA(n,e){const t=bA(e),r=CA(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function SA(n,e){si.set(n._key(),e)}function CA(n){return dt(n._redirectPersistence)}function bA(n){return ri(vA,n.config.apiKey,n.name)}async function RA(n,e,t=!1){if(ze(n.app))return Promise.reject($t(n));const r=yo(n),s=_A(r,e),o=await new IA(r,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
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
 */const PA=10*60*1e3;class kA{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!NA(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Am(e)){const s=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(st(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=PA&&this.cachedEventUids.clear(),this.cachedEventUids.has(id(e))}saveEventToCache(e){this.cachedEventUids.add(id(e)),this.lastProcessedEventTime=Date.now()}}function id(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Am({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function NA(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Am(n);default:return!1}}/**
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
 */async function MA(n,e={}){return lr(n,"GET","/v1/projects",e)}/**
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
 */const LA=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,DA=/^https?/;async function OA(n){if(n.config.emulator)return;const{authorizedDomains:e}=await MA(n);for(const t of e)try{if(VA(t))return}catch{}Et(n,"unauthorized-domain")}function VA(n){const e=Ya(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!DA.test(t))return!1;if(LA.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const xA=new ms(3e4,6e4);function od(){const n=it().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function FA(n){return new Promise((e,t)=>{var s,i,o;function r(){od(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{od(),t(st(n,"network-request-failed"))},timeout:xA.get()})}if((i=(s=it().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=it().gapi)!=null&&o.load)r();else{const c=$I("iframefcb");return it()[c]=()=>{gapi.load?r():t(st(n,"network-request-failed"))},BI(`${UI()}?onload=${c}`).catch(l=>t(l))}}).catch(e=>{throw ii=null,e})}let ii=null;function BA(n){return ii=ii||FA(n),ii}/**
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
 */const UA=new ms(5e3,15e3),$A="__/auth/iframe",HA="emulator/auth/iframe",jA={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},qA=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function WA(n){const e=n.config;j(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Qc(e,HA):`https://${n.config.authDomain}/${$A}`,r={apiKey:e.apiKey,appName:n.name,v:rr},s=qA.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${ps(r).slice(1)}`}async function zA(n){const e=await BA(n),t=it().gapi;return j(t,n,"internal-error"),e.open({where:document.body,url:WA(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:jA,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=st(n,"network-request-failed"),c=it().setTimeout(()=>{i(o)},UA.get());function l(){it().clearTimeout(c),s(r)}r.ping(l).then(l,()=>{i(o)})}))}/**
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
 */const KA={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},GA=500,QA=600,XA="_blank",YA="http://localhost";class ad{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function JA(n,e,t,r=GA,s=QA){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const l={...KA,width:r.toString(),height:s.toString(),top:i,left:o},h=Ve().toLowerCase();t&&(c=sm(h)?XA:t),nm(h)&&(e=e||YA,l.scrollbars="yes");const d=Object.entries(l).reduce((m,[E,A])=>`${m}${E}=${A},`,"");if(NI(h)&&c!=="_self")return ZA(e||"",c),new ad(null);const p=window.open(e||"",c,d);j(p,n,"popup-blocked");try{p.focus()}catch{}return new ad(p)}function ZA(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const eS="__/auth/handler",tS="emulator/auth/handler",nS=encodeURIComponent("fac");async function cd(n,e,t,r,s,i){j(n.config.authDomain,n,"auth-domain-config-required"),j(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:rr,eventId:s};if(e instanceof fm){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",iI(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries({}))o[d]=p}if(e instanceof gs){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(o.scopes=d.join(","))}n.tenantId&&(o.tid=n.tenantId);const c=o;for(const d of Object.keys(c))c[d]===void 0&&delete c[d];const l=await n._getAppCheckToken(),h=l?`#${nS}=${encodeURIComponent(l)}`:"";return`${rS(n)}?${ps(c).slice(1)}${h}`}function rS({config:n}){return n.emulator?Qc(n,tS):`https://${n.authDomain}/${eS}`}/**
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
 */const ma="webStorageSupport";class sS{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=ym,this._completeRedirectFn=RA,this._overrideRedirectResult=SA}async _openPopup(e,t,r,s){var o;Tt((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await cd(e,t,r,Ya(),s);return JA(e,i,Zc())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await cd(e,t,r,Ya(),s);return aA(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Tt(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await zA(e),r=new kA(e);return t.register("authEvent",s=>(j(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(ma,{type:ma},s=>{var o;const i=(o=s==null?void 0:s[0])==null?void 0:o[ma];i!==void 0&&t(!!i),Et(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=OA(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return lm()||rm()||Yc()}}const iS=sS;var ld="@firebase/auth",ud="1.11.0";/**
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
 */class oS{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){j(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function aS(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function cS(n){Ht(new Gh("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=r.options;j(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:o,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:um(n)},h=new xI(r,s,i,l);return jI(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Ht(new Gh("auth-internal",e=>{const t=yo(e.getProvider("auth").getImmediate());return(r=>new oS(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),ft(ld,ud,aS(n)),ft(ld,ud,"esm2020")}/**
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
 */const lS=5*60,uS=Wp("authIdTokenMaxAge")||lS;let hd=null;const hS=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>uS)return;const s=t==null?void 0:t.token;hd!==s&&(hd=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function dS(n=yc()){const e=cs(n,"auth");if(e.isInitialized())return e.getImmediate();const t=HI(n,{popupRedirectResolver:iS,persistence:[gA,sA,ym]}),r=Wp("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=hS(i.toString());eA(t,o,()=>o(t.currentUser)),ZI(t,c=>o(c))}}const s=zv("auth");return s&&qI(t,`http://${s}`),t}function fS(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}FI({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=st("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",fS().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});cS("Browser");/**
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
 */const pS=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},mS=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},gS={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,l=s+2<n.length,h=l?n[s+2]:0,d=i>>2,p=(i&3)<<4|c>>4;let m=(c&15)<<2|h>>6,E=h&63;l||(E=64,o||(m=64)),r.push(t[d],t[p],t[m],t[E])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(pS(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):mS(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const p=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||p==null)throw new _S;const m=i<<2|c>>4;if(r.push(m),h!==64){const E=c<<4&240|h>>2;if(r.push(E),p!==64){const A=h<<6&192|p;r.push(A)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class _S extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}/**
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
 */function yS(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */class Mi{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}function Sm(){try{return typeof indexedDB=="object"}catch{return!1}}/**
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
 */const ES="FirebaseError";class tl extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=ES,Object.setPrototypeOf(this,tl.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Cm.prototype.create)}}class Cm{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?TS(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new tl(s,c,r)}}function TS(n,e){return n.replace(wS,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const wS=/\{\$([^}]+)}/g;/**
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
 */const vS=1e3,IS=2,AS=4*60*60*1e3,SS=.5;function CS(n,e=vS,t=IS){const r=e*Math.pow(t,n),s=Math.round(SS*r*(Math.random()-.5)*2);return Math.min(AS,r+s)}/**
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
 */function bS(n){return n&&n._delegate?n._delegate:n}class dd{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */var ce;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(ce||(ce={}));const RS={debug:ce.DEBUG,verbose:ce.VERBOSE,info:ce.INFO,warn:ce.WARN,error:ce.ERROR,silent:ce.SILENT},PS=ce.INFO,kS={[ce.DEBUG]:"log",[ce.VERBOSE]:"log",[ce.INFO]:"info",[ce.WARN]:"warn",[ce.ERROR]:"error"},NS=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=kS[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class MS{constructor(e){this.name=e,this._logLevel=PS,this._logHandler=NS,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ce))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?RS[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ce.DEBUG,...e),this._logHandler(this,ce.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ce.VERBOSE,...e),this._logHandler(this,ce.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ce.INFO,...e),this._logHandler(this,ce.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ce.WARN,...e),this._logHandler(this,ce.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ce.ERROR,...e),this._logHandler(this,ce.ERROR,...e)}}/**
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
 */const ec=new Map,bm={activated:!1,tokenObservers:[]},LS={initialized:!1,enabled:!1};function Ee(n){return ec.get(n)||{...bm}}function DS(n,e){return ec.set(n,e),ec.get(n)}function wo(){return LS}/**
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
 */const Rm="https://content-firebaseappcheck.googleapis.com/v1",OS="exchangeRecaptchaEnterpriseToken",VS="exchangeDebugToken",fd={RETRIAL_MIN_WAIT:30*1e3,RETRIAL_MAX_WAIT:16*60*1e3},xS=24*60*60*1e3;/**
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
 */class FS{constructor(e,t,r,s,i){if(this.operation=e,this.retryPolicy=t,this.getWaitDuration=r,this.lowerBound=s,this.upperBound=i,this.pending=null,this.nextErrorWaitInterval=s,s>i)throw new Error("Proactive refresh lower bound greater than upper bound!")}start(){this.nextErrorWaitInterval=this.lowerBound,this.process(!0).catch(()=>{})}stop(){this.pending&&(this.pending.reject("cancelled"),this.pending=null)}isRunning(){return!!this.pending}async process(e){this.stop();try{this.pending=new Mi,this.pending.promise.catch(t=>{}),await BS(this.getNextRun(e)),this.pending.resolve(),await this.pending.promise,this.pending=new Mi,this.pending.promise.catch(t=>{}),await this.operation(),this.pending.resolve(),await this.pending.promise,this.process(!0).catch(()=>{})}catch(t){this.retryPolicy(t)?this.process(!1).catch(()=>{}):this.stop()}}getNextRun(e){if(e)return this.nextErrorWaitInterval=this.lowerBound,this.getWaitDuration();{const t=this.nextErrorWaitInterval;return this.nextErrorWaitInterval*=2,this.nextErrorWaitInterval>this.upperBound&&(this.nextErrorWaitInterval=this.upperBound),t}}}function BS(n){return new Promise(e=>{setTimeout(e,n)})}/**
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
 */const US={"already-initialized":"You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.","use-before-activation":"App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.","fetch-network-error":"Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.","fetch-parse-error":"Fetch client could not parse response. Original error: {$originalErrorMessage}.","fetch-status-error":"Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.","storage-open":"Error thrown when opening storage. Original error: {$originalErrorMessage}.","storage-get":"Error thrown when reading from storage. Original error: {$originalErrorMessage}.","storage-set":"Error thrown when writing to storage. Original error: {$originalErrorMessage}.","recaptcha-error":"ReCAPTCHA error.","initial-throttle":"{$httpStatus} error. Attempts allowed again after {$time}",throttled:"Requests throttled due to previous {$httpStatus} error. Attempts allowed again after {$time}"},Be=new Cm("appCheck","AppCheck",US);/**
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
 */function pd(n=!1){var e;return n?(e=self.grecaptcha)==null?void 0:e.enterprise:self.grecaptcha}function nl(n){if(!Ee(n).activated)throw Be.create("use-before-activation",{appName:n.name})}function Pm(n){const e=Math.round(n/1e3),t=Math.floor(e/(3600*24)),r=Math.floor((e-t*3600*24)/3600),s=Math.floor((e-t*3600*24-r*3600)/60),i=e-t*3600*24-r*3600-s*60;let o="";return t&&(o+=$s(t)+"d:"),r&&(o+=$s(r)+"h:"),o+=$s(s)+"m:"+$s(i)+"s",o}function $s(n){return n===0?"00":n>=10?n.toString():"0"+n}/**
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
 */async function rl({url:n,body:e},t){const r={"Content-Type":"application/json"},s=t.getImmediate({optional:!0});if(s){const p=await s.getHeartbeatsHeader();p&&(r["X-Firebase-Client"]=p)}const i={method:"POST",body:JSON.stringify(e),headers:r};let o;try{o=await fetch(n,i)}catch(p){throw Be.create("fetch-network-error",{originalErrorMessage:p==null?void 0:p.message})}if(o.status!==200)throw Be.create("fetch-status-error",{httpStatus:o.status});let c;try{c=await o.json()}catch(p){throw Be.create("fetch-parse-error",{originalErrorMessage:p==null?void 0:p.message})}const l=c.ttl.match(/^([\d.]+)(s)$/);if(!l||!l[2]||isNaN(Number(l[1])))throw Be.create("fetch-parse-error",{originalErrorMessage:`ttl field (timeToLive) is not in standard Protobuf Duration format: ${c.ttl}`});const h=Number(l[1])*1e3,d=Date.now();return{token:c.token,expireTimeMillis:d+h,issuedAtTimeMillis:d}}function $S(n,e){const{projectId:t,appId:r,apiKey:s}=n.options;return{url:`${Rm}/projects/${t}/apps/${r}:${OS}?key=${s}`,body:{recaptcha_enterprise_token:e}}}function km(n,e){const{projectId:t,appId:r,apiKey:s}=n.options;return{url:`${Rm}/projects/${t}/apps/${r}:${VS}?key=${s}`,body:{debug_token:e}}}/**
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
 */const HS="firebase-app-check-database",jS=1,ss="firebase-app-check-store",Nm="debug-token";let Hs=null;function Mm(){return Hs||(Hs=new Promise((n,e)=>{try{const t=indexedDB.open(HS,jS);t.onsuccess=r=>{n(r.target.result)},t.onerror=r=>{var s;e(Be.create("storage-open",{originalErrorMessage:(s=r.target.error)==null?void 0:s.message}))},t.onupgradeneeded=r=>{const s=r.target.result;switch(r.oldVersion){case 0:s.createObjectStore(ss,{keyPath:"compositeKey"})}}}catch(t){e(Be.create("storage-open",{originalErrorMessage:t==null?void 0:t.message}))}}),Hs)}function qS(n){return Dm(Om(n))}function WS(n,e){return Lm(Om(n),e)}function zS(n){return Lm(Nm,n)}function KS(){return Dm(Nm)}async function Lm(n,e){const r=(await Mm()).transaction(ss,"readwrite"),i=r.objectStore(ss).put({compositeKey:n,value:e});return new Promise((o,c)=>{i.onsuccess=l=>{o()},r.onerror=l=>{var h;c(Be.create("storage-set",{originalErrorMessage:(h=l.target.error)==null?void 0:h.message}))}})}async function Dm(n){const t=(await Mm()).transaction(ss,"readonly"),s=t.objectStore(ss).get(n);return new Promise((i,o)=>{s.onsuccess=c=>{const l=c.target.result;i(l?l.value:void 0)},t.onerror=c=>{var l;o(Be.create("storage-get",{originalErrorMessage:(l=c.target.error)==null?void 0:l.message}))}})}function Om(n){return`${n.options.appId}-${n.name}`}/**
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
 */const Dt=new MS("@firebase/app-check");/**
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
 */async function GS(n){if(Sm()){let e;try{e=await qS(n)}catch(t){Dt.warn(`Failed to read token from IndexedDB. Error: ${t}`)}return e}}function ga(n,e){return Sm()?WS(n,e).catch(t=>{Dt.warn(`Failed to write token to IndexedDB. Error: ${t}`)}):Promise.resolve()}async function QS(){let n;try{n=await KS()}catch{}if(n)return n;{const e=crypto.randomUUID();return zS(e).catch(t=>Dt.warn(`Failed to persist debug token to IndexedDB. Error: ${t}`)),e}}/**
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
 */function sl(){return wo().enabled}async function il(){const n=wo();if(n.enabled&&n.token)return n.token.promise;throw Error(`
            Can't get debug token in production mode.
        `)}function XS(){const n=yS(),e=wo();if(e.initialized=!0,typeof n.FIREBASE_APPCHECK_DEBUG_TOKEN!="string"&&n.FIREBASE_APPCHECK_DEBUG_TOKEN!==!0)return;e.enabled=!0;const t=new Mi;e.token=t,typeof n.FIREBASE_APPCHECK_DEBUG_TOKEN=="string"?t.resolve(n.FIREBASE_APPCHECK_DEBUG_TOKEN):t.resolve(QS())}/**
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
 */const YS={error:"UNKNOWN_ERROR"};function JS(n){return gS.encodeString(JSON.stringify(n),!1)}async function Li(n,e=!1,t=!1){const r=n.app;nl(r);const s=Ee(r);let i=s.token,o;if(i&&!On(i)&&(s.token=void 0,i=void 0),!i){const h=await s.cachedTokenPromise;h&&(On(h)?i=h:await ga(r,void 0))}if(!e&&i&&On(i))return{token:i.token};let c=!1;if(sl())try{s.exchangeTokenPromise||(s.exchangeTokenPromise=rl(km(r,await il()),n.heartbeatServiceProvider).finally(()=>{s.exchangeTokenPromise=void 0}),c=!0);const h=await s.exchangeTokenPromise;return await ga(r,h),s.token=h,{token:h.token}}catch(h){return h.code==="appCheck/throttled"||h.code==="appCheck/initial-throttle"?Dt.warn(h.message):t&&Dt.error(h),_a(h)}try{s.exchangeTokenPromise||(s.exchangeTokenPromise=s.provider.getToken().finally(()=>{s.exchangeTokenPromise=void 0}),c=!0),i=await Ee(r).exchangeTokenPromise}catch(h){h.code==="appCheck/throttled"||h.code==="appCheck/initial-throttle"?Dt.warn(h.message):t&&Dt.error(h),o=h}let l;return i?o?On(i)?l={token:i.token,internalError:o}:l=_a(o):(l={token:i.token},s.token=i,await ga(r,i)):l=_a(o),c&&Fm(r,l),l}async function ZS(n){const e=n.app;nl(e);const{provider:t}=Ee(e);if(sl()){const r=await il(),{token:s}=await rl(km(e,r),n.heartbeatServiceProvider);return{token:s}}else{const{token:r}=await t.getToken();return{token:r}}}function Vm(n,e,t,r){const{app:s}=n,i=Ee(s),o={next:t,error:r,type:e};if(i.tokenObservers=[...i.tokenObservers,o],i.token&&On(i.token)){const c=i.token;Promise.resolve().then(()=>{t({token:c.token}),md(n)}).catch(()=>{})}i.cachedTokenPromise.then(()=>md(n))}function xm(n,e){const t=Ee(n),r=t.tokenObservers.filter(s=>s.next!==e);r.length===0&&t.tokenRefresher&&t.tokenRefresher.isRunning()&&t.tokenRefresher.stop(),t.tokenObservers=r}function md(n){const{app:e}=n,t=Ee(e);let r=t.tokenRefresher;r||(r=eC(n),t.tokenRefresher=r),!r.isRunning()&&t.isTokenAutoRefreshEnabled&&r.start()}function eC(n){const{app:e}=n;return new FS(async()=>{const t=Ee(e);let r;if(t.token?r=await Li(n,!0):r=await Li(n),r.error)throw r.error;if(r.internalError)throw r.internalError},()=>!0,()=>{const t=Ee(e);if(t.token){let r=t.token.issuedAtTimeMillis+(t.token.expireTimeMillis-t.token.issuedAtTimeMillis)*.5+3e5;const s=t.token.expireTimeMillis-5*60*1e3;return r=Math.min(r,s),Math.max(0,r-Date.now())}else return 0},fd.RETRIAL_MIN_WAIT,fd.RETRIAL_MAX_WAIT)}function Fm(n,e){const t=Ee(n).tokenObservers;for(const r of t)try{r.type==="EXTERNAL"&&e.error!=null?r.error(e.error):r.next(e)}catch{}}function On(n){return n.expireTimeMillis-Date.now()>0}function _a(n){return{token:JS(YS),error:n}}/**
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
 */class tC{constructor(e,t){this.app=e,this.heartbeatServiceProvider=t}_delete(){const{tokenObservers:e}=Ee(this.app);for(const t of e)xm(this.app,t.next);return Promise.resolve()}}function nC(n,e){return new tC(n,e)}function rC(n){return{getToken:e=>Li(n,e),getLimitedUseToken:()=>ZS(n),addTokenListener:e=>Vm(n,"INTERNAL",e),removeTokenListener:e=>xm(n.app,e)}}const sC="@firebase/app-check",iC="0.11.0",oC="https://www.google.com/recaptcha/enterprise.js";function aC(n,e){const t=new Mi,r=Ee(n);r.reCAPTCHAState={initialized:t};const s=cC(n),i=pd(!0);return i?gd(n,e,i,s,t):hC(()=>{const o=pd(!0);if(!o)throw new Error("no recaptcha");gd(n,e,o,s,t)}),t.promise}function gd(n,e,t,r,s){t.ready(()=>{uC(n,e,t,r),s.resolve(t)})}function cC(n){const e=`fire_app_check_${n.name}`,t=document.createElement("div");return t.id=e,t.style.display="none",document.body.appendChild(t),e}async function lC(n){nl(n);const t=await Ee(n).reCAPTCHAState.initialized.promise;return new Promise((r,s)=>{const i=Ee(n).reCAPTCHAState;t.ready(()=>{r(t.execute(i.widgetId,{action:"fire_app_check"}))})})}function uC(n,e,t,r){const s=t.render(r,{sitekey:e,size:"invisible",callback:()=>{Ee(n).reCAPTCHAState.succeeded=!0},"error-callback":()=>{Ee(n).reCAPTCHAState.succeeded=!1}}),i=Ee(n);i.reCAPTCHAState={...i.reCAPTCHAState,widgetId:s}}function hC(n){const e=document.createElement("script");e.src=oC,e.onload=n,document.head.appendChild(e)}class ol{constructor(e){this._siteKey=e,this._throttleData=null}async getToken(){var r,s,i;fC(this._throttleData);const e=await lC(this._app).catch(o=>{throw Be.create("recaptcha-error")});if(!((r=Ee(this._app).reCAPTCHAState)!=null&&r.succeeded))throw Be.create("recaptcha-error");let t;try{t=await rl($S(this._app,e),this._heartbeatServiceProvider)}catch(o){throw(s=o.code)!=null&&s.includes("fetch-status-error")?(this._throttleData=dC(Number((i=o.customData)==null?void 0:i.httpStatus),this._throttleData),Be.create("initial-throttle",{time:Pm(this._throttleData.allowRequestsAfter-Date.now()),httpStatus:this._throttleData.httpStatus})):o}return this._throttleData=null,t}initialize(e){this._app=e,this._heartbeatServiceProvider=cs(e,"heartbeat"),aC(e,this._siteKey).catch(()=>{})}isEqual(e){return e instanceof ol?this._siteKey===e._siteKey:!1}}function dC(n,e){if(n===404||n===403)return{backoffCount:1,allowRequestsAfter:Date.now()+xS,httpStatus:n};{const t=e?e.backoffCount:0,r=CS(t,1e3,2);return{backoffCount:t+1,allowRequestsAfter:Date.now()+r,httpStatus:n}}}function fC(n){if(n&&Date.now()-n.allowRequestsAfter<=0)throw Be.create("throttled",{time:Pm(n.allowRequestsAfter-Date.now()),httpStatus:n.httpStatus})}/**
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
 */function pC(n=yc(),e){n=bS(n);const t=cs(n,"app-check");if(wo().initialized||XS(),sl()&&il().then(s=>console.log(`App Check debug token: ${s}. You will need to add it to your app's App Check settings in the Firebase console for it to work.`)),t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(i.isTokenAutoRefreshEnabled===e.isTokenAutoRefreshEnabled&&i.provider.isEqual(e.provider))return s;throw Be.create("already-initialized",{appName:n.name})}const r=t.initialize({options:e});return mC(n,e.provider,e.isTokenAutoRefreshEnabled),Ee(n).isTokenAutoRefreshEnabled&&Vm(r,"INTERNAL",()=>{}),r}function mC(n,e,t=!1){const r=DS(n,{...bm});r.activated=!0,r.provider=e,r.cachedTokenPromise=GS(n).then(s=>(s&&On(s)&&(r.token=s,Fm(n,{token:s.token})),s)),r.isTokenAutoRefreshEnabled=t&&n.automaticDataCollectionEnabled,!n.automaticDataCollectionEnabled&&t&&Dt.warn("`isTokenAutoRefreshEnabled` is true but `automaticDataCollectionEnabled` was set to false during `initializeApp()`. This blocks automatic token refresh."),r.provider.initialize(n)}async function gC(n,e){const t=await Li(n,e);if(t.error)throw t.error;if(t.internalError)throw t.internalError;return{token:t.token}}const _C="app-check",_d="app-check-internal";function yC(){Ht(new dd(_C,n=>{const e=n.getProvider("app").getImmediate(),t=n.getProvider("heartbeat");return nC(e,t)},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((n,e,t)=>{n.getProvider(_d).initialize()})),Ht(new dd(_d,n=>{const e=n.getProvider("app-check").getImmediate();return rC(e)},"PUBLIC").setInstantiationMode("EXPLICIT")),ft(sC,iC)}yC();function Cn(n,e,t={},r={}){const s=n.querySelector(e);if(s){Object.assign(s,t);for(const[i,o]of Object.entries(r))s.dataset[i]=o}}function ct(n){const e=document.getElementById(n);return e?e.content.cloneNode(!0).firstElementChild:null}const an=n=>n?Qr(n):"--/-- --:--",EC={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function Bm(n){return typeof n!="string"?n:n.replace(/[&<>"']/g,function(e){return EC[e]})}function Um(n){return Bm(n).replace(/\/\//g,"<br>")}function al(n,e){if(!n)return;const t=e.match(/^([1-9])_(.+)/);n.innerHTML="";const r=document.createElement("span");if(r.className="name-text",t){const s=t[1],i=t[2],o=document.createElement("span");o.className="instance-badge",o.textContent=s,n.appendChild(o),r.textContent=i}else r.textContent=e;n.appendChild(r)}const $m="mapRatioCache_v1",Hr=(()=>{try{return JSON.parse(localStorage.getItem($m)||"{}")||{}}catch{return{}}})();function tc(n,e,t){const r=`${e} / ${t}`;if(Hr[n]!==r){Hr[n]=r;try{localStorage.setItem($m,JSON.stringify(Hr))}catch{}}return r}function TC(n){if(!Array.isArray(n)||n.length===0)return;const e=new Set;n.forEach(r=>{r.mapImage&&r.rank!=="F"&&r.rank!==H.F&&e.add(r.mapImage)});const t=()=>{e.forEach(r=>{const s=new Image;s.src=`./maps/${r}`,s.onload=()=>{s.naturalWidth&&s.naturalHeight&&tc(r,s.naturalWidth,s.naturalHeight)},typeof s.decode=="function"&&s.decode().catch(()=>{})})};"requestIdleCallback"in window?window.requestIdleCallback(t,{timeout:2e3}):setTimeout(t,300)}function wC(){if(window.magnifierInitialized)return;window.magnifierInitialized=!0;const n=P.globalMagnifier,e=n==null?void 0:n.querySelector(".magnifier-content-wrapper");if(!n||!e)return;let t=null,r=null,s=null,i=null;const o=()=>{n.classList.add("hidden"),P.body.classList.remove("magnifier-active"),t=null,r=null,s=null,e.innerHTML="",window.removeEventListener("mousemove",h)},c=d=>{if(!t||!r||!s)return;const p=d.clientX-s.left,m=d.clientY-s.top;if(p<0||m<0||p>s.width||m>s.height){o();return}i||(i=n.getBoundingClientRect());const E=i.width/2,A=i.height/2,N=E-p*Te.MAP_ZOOM_SCALE,R=A-m*Te.MAP_ZOOM_SCALE;n.style.transform=`translate3d(${d.clientX}px, ${d.clientY}px, 0) translate(-50%, -50%)`,e.style.transform=`translate3d(${N}px, ${R}px, 0) scale(${Te.MAP_ZOOM_SCALE})`};let l=null;const h=d=>{l&&cancelAnimationFrame(l);const p=d.clientX,m=d.clientY;l=requestAnimationFrame(()=>{c({clientX:p,clientY:m})})};document.addEventListener("mousedown",d=>{if(d.button!==2)return;const m=d.target.closest(".map-container");if(!m)return;const E=m.querySelector(".mob-map-img");if(!E)return;d.preventDefault();const A=m.getBoundingClientRect(),N=m.offsetWidth,R=m.offsetHeight;r=m,t=E,s=A,e.innerHTML="";const O=m.cloneNode(!0);O.classList.remove("w-full","u-w-full","pc-map-box","cursor-crosshair","!cursor-crosshair"),O.classList.add("magnifier-clone"),O.style.setProperty("--map-w",`${N}px`),O.style.setProperty("--map-h",`${R}px`),e.appendChild(O),n.classList.remove("hidden"),P.body.classList.add("magnifier-active"),window.addEventListener("mousemove",h),c(d)},{capture:!0}),window.addEventListener("mouseup",d=>{d.button===2&&t&&o()}),document.addEventListener("contextmenu",d=>{d.target.closest(".map-container")&&d.preventDefault()})}function vC(n){var r;const e=(r=n.memo_text)==null?void 0:r.trim(),t=(n.memo_updated_at||0)>=(n.last_kill_time||0);return!!(e&&(t||!n.last_kill_time))}function vo(n){const e=n.repopInfo||{},t=be()/1e3;if(!e.status)return{label:"",timeValue:"--/-- --:--",isSpecialCondition:!1,isTimeOver:!1,isTimedMob:!1,dhm:null,isInWindow:!1};const r=!!e.maxRepop&&t>=e.maxRepop,s=!!e.isInConditionWindow,i=!s&&!!e.nextConditionSpawnDate&&t<e.nextConditionSpawnDate.getTime()/1e3,o=!!(e.isInConditionWindow||e.nextConditionSpawnDate),c=o&&n.rank===H.S&&e.status!=="PopWindow";let l=e.status;o&&(s?l="ConditionActive":(i||e.nextConditionSpawnDate)&&(l="NextCondition"));const h=YC(l,n.rank),d=e.nextConditionSpawnDate?e.nextConditionSpawnDate.getTime()/1e3:null,p=e.conditionWindowEnd?e.conditionWindowEnd.getTime()/1e3:null;let m;s&&p!==null?m=p:d!==null&&d>t?m=d:e.minRepop&&t<e.minRepop?m=e.minRepop:m=e.maxRepop||0;const E=r&&!s&&!i;E&&e.maxRepop&&(m=e.maxRepop);const A=Math.max(0,E?t-m:m-t),N=Gd(A),R=r_(A);return{label:h,labelStatus:l,timeValue:R,isSpecialCondition:c,isTimeOver:E,isTimedMob:o,dhm:N,isInWindow:s}}function IC(n,e,t,r){if(!e){n.innerHTML="--/-- --:--",n.className="mobcard-timer";return}if(n.innerHTML.includes("--/-- --:--")||n.innerHTML===""){const c=ct("timer-rich-template");c&&(n.innerHTML=c.innerHTML)}n.className="mobcard-timer",t&&n.classList.add("label-next"),r&&n.classList.add("time-over");const{h:s,m:i}=e,o=(c,l,h)=>{if(!c)return;const d=c.querySelector(".mobcard-timer-num"),p=h==="h"&&(Number(l)===0||!l);if(c.classList.toggle("hidden",p),!p&&d){const m=String(l||0).padStart(2,"0").replace(/^0/,"&nbsp;");d.innerHTML!==m&&(d.innerHTML=m)}};o(n.querySelector(".h-part"),s,"h"),o(n.querySelector(".m-part"),i,"m")}function Hm(n){var h,d,p;const e=G(),t=n.No%10,r=`${n.area}_${t}`,i=((h=e.mobLocations)==null?void 0:h[r])||n.spawn_cull_status||{},o=AC(n,i),c=o.length;let l=null;return c===1?l={type:"single",value:parseInt(((p=(d=o[0])==null?void 0:d.id)==null?void 0:p.slice(-2))||"0",10),unit:"番"}:c>1&&(l={type:"multiple",value:c,unit:""}),{countInfo:l,remainingCount:c,spawnCullStatus:i,validSpawnPoints:o}}function AC(n,e){return(n.locations??[]).filter(t=>{if(!t.mob_ranks.some(i=>i===H.S||i===H.A))return!1;const s=e==null?void 0:e[t.id];return!_l(s,n.No,n)})}const SC=35,CC=15;function bC(n,e,t,r,s){const i=ct("spawn-point-template");if(!i)return null;const o=e==null?void 0:e[n.id],c=_l(o,t),l=n.mob_ranks.some(R=>R===H.S||R===H.A),h=n.mob_ranks.every(R=>R.startsWith("B"));let d="",p="false";if(s)d="color-lastone",p="false";else if(l){const R=n.mob_ranks.find(O=>O.startsWith("B"));c?d=R==="B1"?"color-b1-culled":"color-b2-culled":d=R==="B1"?"color-b1":"color-b2",p="true"}else h&&(d=n.mob_ranks[0]==="B1"?"color-b1-only":"color-b2-only",p="false");i.className=`spawn-point ${d}`,i.style.setProperty("--point-x",`${n.x}%`),i.style.setProperty("--point-y",`${n.y}%`);const m=parseInt(n.id.slice(-2),10),E=G().lodestoneId,A=!!E&&String((o==null?void 0:o.reporter_id)??"")===E,N=s?"(確)":c?A?"(自分済)":"(済)":"";return i.dataset.tooltip=`${m} ${N}`,Number(n.x)<SC&&(i.dataset.tipX="right"),Number(n.y)<CC&&(i.dataset.tipY="down"),Object.assign(i.dataset,{locationId:n.id,mobNo:String(t),rank:r,isCulled:String(c),isLastone:s?"true":"false",isInteractive:p}),i}function RC(n,e=!1){return e?PC(n):jm(n)}function PC(n){const e=P.cardTemplate;if(!e)return document.createElement("div");const r=e.content.cloneNode(!0).querySelector(".mobcard-card"),s=n.rank,{nextConditionSpawnDate:i,minRepop:o,maxRepop:c}=n.repopInfo||{};r.dataset.mobNo=String(n.No),r.dataset.rank=s;const l=r.querySelector(".mobcard-name");l&&(al(l,n.name),l.dataset.rank=s),Cn(r,".mobcard-rank",{textContent:s},{rank:s}),Cn(r,"[data-min-repop]",{textContent:an(o)}),Cn(r,"[data-max-repop]",{textContent:an(c)}),Cn(r,"[data-next-possible]",{textContent:i?an(i):"--/-- --:--"}),Cn(r,"[data-last-kill]",{textContent:an(n.last_kill_time)}),Cn(r,".condition-text",{innerHTML:Um(n.condition||"特別な出現条件はありません。")});const h=r.querySelector(".mobcard-memo-input");h&&(document.activeElement!==h&&(h.value=n.memo_text||""),h.dataset.mobNo=String(n.No),setTimeout(()=>hl(h),0));const d=r.querySelector(".map-section");return d&&(n.rank!==H.F&&n.rank!=="F"&&n.mapImage?(d.classList.remove("hidden"),zm(r,n)):d.classList.add("hidden")),r.querySelectorAll(".moblist-report-btn").forEach(p=>{const m=p;m.dataset.reportType=s===H.A?"instant":"modal",m.dataset.mobNo=String(n.No)}),NC(r,n),kC(r,n),r}function jm(n){const e=ct("moblist-item-template");if(!e)return document.createElement("div");e.classList.add(`rank-${n.rank.toLowerCase()}`),e.dataset.mobNo=String(n.No),e.dataset.rank=n.rank;const t=e.querySelector(".moblist-rank-badge");t&&(t.textContent=n.rank,t.dataset.rank=n.rank);const r=e.querySelector(".moblist-name");r&&(al(r,n.name),r.dataset.rank=n.rank);const s=e.querySelector(".moblist-area");s&&(s.textContent=n.area||"");const i=e.querySelector(".moblist-report-btn");return i&&(i.dataset.mobNo=String(n.No),i.dataset.reportType=n.rank==="A"?"instant":"modal"),Km(e,n),e}function kC(n,e){const t=vo(e);cl(n,e,t),ll(n,e,t),qm(n,e),ul(n,e)}function cl(n,e,t=null){const{labelStatus:r}=t||vo(e),{elapsedPercent:s,status:i}=e.repopInfo||{},o=n.querySelector(".percent, .moblist-percent");if(o){let c=Math.max(0,Math.min(100,Math.floor(s||0)));i==="MaxOver"&&(c=100),(r==="Next"||r==="Maintenance")&&(c=0);const l=String(c/100);o.style.getPropertyValue("--prog-percent")!==l&&o.style.setProperty("--prog-percent",l)}if(n.classList.contains("moblist-item")&&e.repopInfo){const c=!!e.repopInfo.isInConditionWindow&&!e.repopInfo.isMaintenanceStop&&!e.repopInfo.isBlockedByMaintenance;n.classList.contains("moblist-highlight-white")!==c&&n.classList.toggle("moblist-highlight-white",c)}}function ll(n,e,t=null){var A,N,R;const{status:r}=e.repopInfo||{},s=t||vo(e),{label:i,labelStatus:o,dhm:c,isSpecialCondition:l,isTimeOver:h,isTimedMob:d}=s,p=!!((A=e.repopInfo)!=null&&A.isBlockedByMaintenance||(N=e.repopInfo)!=null&&N.isMaintenanceStop||((R=e.repopInfo)==null?void 0:R.status)==="Maintenance"),m=n.querySelector(".moblist-time"),E=n.querySelector(".percent, .moblist-percent");if(m&&n.classList.contains("moblist-item")){let O=m.querySelector(".timer-inner-grid");if(!O){m.innerHTML="",O=document.createElement("div"),O.className="timer-inner-grid";const Q=document.createElement("span");Q.className="timer-label timer-label-base";const w=document.createElement("span");w.className="mobcard-timer",O.appendChild(Q),O.appendChild(w),m.appendChild(O)}IC(O.querySelector(".mobcard-timer"),c,l,h);const x=d&&(o==="ConditionActive"||o==="NextCondition"),F=O.querySelector(".timer-label-base"),z=`timer-label timer-label-base ${x?"status-"+o.toLowerCase()+" is-timed-badge":""} ${l?"is-special":""}`;F.className!==z&&(F.className=z);const ne=x?i:"";F.textContent!==ne&&(F.textContent=ne)}if(E){const{elapsedPercent:O}=e.repopInfo||{},x=Math.max(0,Math.min(100,O||0)),F=r==="MaxOver"?"100":String(Math.floor(x));E.textContent!==F&&(E.textContent=F),E.dataset.digits=String(F.length),E.classList.toggle("max-over",r==="MaxOver"),E.classList.toggle("pct-0",(r==="Next"||x===0)&&r!=="MaxOver");let z="blue";x>=80?z="orange":x>=60?z="yellow":x>=30&&(z="green"),E.dataset.pctTier!==z&&(E.dataset.pctTier=z)}n.classList.toggle("is-pre-repop",r==="Next"||r==="Maintenance"),n.classList.toggle("maintenance-gray-out",p)}function Ye(n,e,t){if(n._cache||(n._cache={}),n._cache[t])return n._cache[t];const r=n.querySelector(e);return r&&(n._cache[t]=r),r}function qm(n,e){const{minRepop:t,maxRepop:r}=e.repopInfo||{},s=Ye(n,"[data-min-repop]","minRepop"),i=Ye(n,"[data-max-repop]","maxRepop"),o=Ye(n,"[data-next-possible]","nextPossible"),c=Ye(n,"[data-last-kill]","lastKill");if(s&&(s.textContent=an(t)),i&&(i.textContent=an(r)),o&&e.repopInfo)if(e.repopInfo.nextConditionSpawnDate){const d=Qr(e.repopInfo.nextConditionSpawnDate);o.textContent!==d&&(o.textContent=d),o.classList.add("text-yellow"),o.classList.remove("text-secondary")}else o.textContent!=="--/-- --:--"&&(o.textContent="--/-- --:--"),o.classList.remove("text-yellow"),o.classList.add("text-secondary");if(c){const d=an(e.last_kill_time);c.textContent!==d&&(c.textContent=d)}[s,i,o,c].forEach(d=>{d&&d.classList.toggle("is-empty",d.textContent==="--/-- --:--")});const l=Ye(n,".mobcard-memo-input","memoInput");if(l&&(l.dataset.mobNo!==String(e.No)&&(l.dataset.mobNo=String(e.No)),document.activeElement!==l)){const d=e.memo_text||"";l.value!==d&&(l.value=d,hl(l))}const h=Ye(n,".condition-text","conditionText");if(h){const d=e.condition?Um(e.condition):"特別な出現条件はありません。";h.innerHTML!==d&&(h.innerHTML=d);const p=n.classList.contains("mobcard-card");[h.closest(".mobcard-section"),Ye(n,".memo-section","memoSection"),Ye(n,".map-section","mapSection")].filter(Boolean).forEach(E=>{p&&e.condition?E.classList.add("condition-section-neon"):E.classList.remove("condition-section-neon")})}}function Wm(n,e){const t=Ye(n,".memo-icon-container","memoIconContainer");if(!t)return;const r=vC(e),s=(e.memo_text||"").trim();if(!(t._lastShow===r&&t._lastText===s))if(t._lastShow=r,t._lastText=s,t.innerHTML="",r){t.classList.remove("hidden");const i=ct("memo-icon-template");if(i){const o=i.querySelector(".memo-tooltip");o&&(o.textContent=s),i.setAttribute("title",s),t.appendChild(i)}}else t.classList.add("hidden")}function ul(n,e){const t=Ye(n,".moblist-count","mobCount");if(!t)return;const{countInfo:r}=Hm(e);if(!r||e.rank==="F"){t.innerHTML!==""&&(t.innerHTML="");return}const s=`${r.type}-${r.value}`;if(t._lastCacheKey===s)return;t._lastCacheKey=s;const i=ct("spawn-count-template");if(i){i.classList.add(r.type==="single"?"is-single":"is-multiple"),i.title=r.type==="single"?`${r.value}番`:`残り${r.value}か所`;const o=i.querySelector(".count-num");o&&(o.textContent=String(r.value)),t.innerHTML="",t.appendChild(i)}}function NC(n,e){const t=e.area||"--",r=e.Expansion||"--",s=e.rank||H.A;n.querySelectorAll(".mob-rank-badge, .mobcard-rank").forEach(i=>{i.textContent=s,i.dataset.rank=s}),n.querySelectorAll(".detail-area").forEach(i=>i.textContent=t),n.querySelectorAll(".detail-expansion").forEach(i=>i.textContent=`| ${r}`)}function hl(n){if(!n||n.tagName!=="TEXTAREA")return;const e=n;e.style.setProperty("--memo-h",e.scrollHeight+"px")}function zm(n,e){const t=n.classList.contains("mobcard-card"),r=n.querySelector(".map-container");if(!r)return;const s=r.closest(".map-section");if(e.rank==="F"||e.rank===H.F){r.classList.add("hidden"),s&&s.classList.add("hidden");const c=r.querySelector(".map-overlay");c&&(c.innerHTML="",delete c._lastPointsHash);return}if(!e.mapImage){r.classList.add("hidden"),s&&s.classList.add("hidden");return}const i=r.querySelector(".mob-map-img"),o=r.querySelector(".map-overlay");if(o){if(!t){o.innerHTML!==""&&(o.innerHTML="",delete o._lastPointsHash);return}if(i&&e.mapImage&&i.dataset.mobMap!==e.mapImage){const c=e.mapImage;i.decoding!=="async"&&(i.decoding="async"),i.loading="eager",i.classList.remove("is-loaded"),Hr[c]?r.style.setProperty("--map-ratio",Hr[c]):r.style.removeProperty("--map-ratio"),i.onload=()=>{i.naturalWidth&&i.naturalHeight&&r.style.setProperty("--map-ratio",tc(c,i.naturalWidth,i.naturalHeight)),i.classList.add("is-loaded")},i.src=`./maps/${c}`,i.complete&&i.naturalWidth&&(r.style.setProperty("--map-ratio",tc(c,i.naturalWidth,i.naturalHeight)),i.classList.add("is-loaded")),i.alt=`${e.area} Map`,i.dataset.mobMap=e.mapImage,r.classList.remove("hidden"),delete r.dataset.locationLoading}if(!r.classList.contains("hidden")&&e.mapImage&&e.locations){const{spawnCullStatus:c,validSpawnPoints:l}=Hm(e),h=((l==null?void 0:l.length)||0)===1,d=n.querySelector(".map-update-time");if(d){let E=0;c&&Object.values(c).forEach(A=>{A.culled_at&&A.culled_at.seconds&&(E=Math.max(E,A.culled_at.seconds)),A.uncull_at&&A.uncull_at.seconds&&(E=Math.max(E,A.uncull_at.seconds))}),d.textContent=E>0?`更新: ${Qr(E)}`:"更新: --/-- --:--"}const p=G().lodestoneId||"",m=(e.locations??[]).map(E=>{const A=c==null?void 0:c[E.id],N=!!p&&String((A==null?void 0:A.reporter_id)??"")===p;return`${E.id}-${_l(A,e.No)}-${N?1:0}`}).join("|")+`|${h}`;if(o._lastPointsHash!==m){o.innerHTML="";const E=document.createDocumentFragment();(e.locations??[]).forEach(A=>{var O;const N=h&&A.id===((O=l[0])==null?void 0:O.id),R=bC(A,c,e.No,A.mob_ranks.includes("B2")?"B2":A.mob_ranks.includes("B1")?"B1":A.mob_ranks[0],N);R&&E.appendChild(R)}),o.appendChild(E),o._lastPointsHash=m}}}}function Km(n,e){const t=vo(e);cl(n,e,t),ll(n,e,t),ul(n,e),Wm(n,e)}async function Gm(n){const e=G().mobs.find(s=>s.No===n);if(!e)return;const t=new Date(be()),r=new Date(t.getTime()-t.getTimezoneOffset()*6e4).toISOString().slice(0,16);P.reportForm&&(P.reportForm.dataset.mobNo=String(n)),P.modalMobName&&al(P.modalMobName,e.name),P.modalTimeInput&&(P.modalTimeInput.value=r),P.reportModal&&P.reportModal.classList.remove("hidden")}function jr(){P.reportModal&&P.reportModal.classList.add("hidden"),P.modalTimeInput&&(P.modalTimeInput.value=""),P.modalStatus&&(P.modalStatus.textContent=""),P.modalForceSubmit&&(P.modalForceSubmit.checked=!1)}let dl="";function Io(){dl="",P.authVCode&&(P.authVCode.textContent="取得中..."),P.authStatus&&(P.authStatus.textContent="",P.authStatus.classList.remove("text-error","text-success")),P.authModal&&P.authModal.classList.remove("hidden"),MC()}async function MC(){const n=await zC();n?(dl=n,P.authVCode&&(P.authVCode.textContent=n)):P.authStatus&&(P.authStatus.textContent="認証コードを取得できませんでした。ページを再読み込みしてください。",P.authStatus.classList.add("text-error"))}function ya(){P.authModal&&P.authModal.classList.add("hidden")}function LC(){if(document.querySelectorAll(".modal-content-base").forEach(n=>{n.querySelector(".ff-corner")||["tl","tr","bl","br"].forEach(e=>{const t=document.createElement("i");t.className=`ff-corner ${e}`,n.appendChild(t)})}),P.cancelReportBtn&&P.cancelReportBtn.addEventListener("click",jr),P.reportModal&&P.reportModal.addEventListener("click",n=>{n.target===P.reportModal&&jr()}),P.modalTimeInput){const n=P.modalTimeInput;n.setAttribute("lang","en"),n.setAttribute("inputmode","numeric"),n.setAttribute("autocomplete","off"),n.addEventListener("focus",()=>{n.setAttribute("lang","en")}),n.addEventListener("paste",e=>{var i;const t=((i=e.clipboardData)==null?void 0:i.getData("text"))||"";if(!t)return;const s=t.replace(/[０-９]/g,o=>String.fromCharCode(o.charCodeAt(0)-65248)).replace(/[／]/g,"-").replace(/[：]/g,":").trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{2})/);if(s){e.preventDefault();const[o,c,l,h,d,p]=s,m=`${c}-${l.padStart(2,"0")}-${h.padStart(2,"0")}T${d.padStart(2,"0")}:${p.padStart(2,"0")}`;n.value=m}})}P.authCancelBtn&&P.authCancelBtn.addEventListener("click",ya),P.authCopyCodeBtn&&P.authCopyCodeBtn.addEventListener("click",()=>{navigator.clipboard.writeText(dl);const n=P.authCopyCodeBtn.textContent;P.authCopyCodeBtn.textContent="Done!",setTimeout(()=>{P.authCopyCodeBtn&&(P.authCopyCodeBtn.textContent=n)},2e3)}),P.authVerifyBtn&&P.authVerifyBtn.addEventListener("click",async()=>{if(!P.authLodestoneId||!P.authStatus||!P.authVerifyBtn)return;const n=P.authLodestoneId.value.trim(),e=eg(n);if(!e){P.authStatus.textContent="正しいロードストーンのIDまたはURLを入力してください。",P.authStatus.classList.add("text-error");return}P.authStatus.textContent="検証中...",P.authStatus.classList.add("text-success"),P.authVerifyBtn.disabled=!0;try{const t=await Jm(e);if(t.success&&t.characterName)P.authStatus.textContent=`検証成功！ようこそ、${t.characterName}さん。`,P.authStatus.classList.add("text-success"),qr(e),Wr(t.characterName),Vn(!0),setTimeout(()=>{ya(),P.authVerifyBtn&&(P.authVerifyBtn.disabled=!1)},1500);else{const r=t.error||"検証に失敗しました";P.authStatus.textContent=r,P.authStatus.classList.add("text-error"),console.error("認証失敗:",r),P.authVerifyBtn.disabled=!1}}catch(t){we(t,"認証プロセス異常"),P.authVerifyBtn.disabled=!1}}),document.addEventListener("keydown",n=>{n.key==="Escape"&&(P.reportModal&&!P.reportModal.classList.contains("hidden")&&jr(),P.authModal&&!P.authModal.classList.contains("hidden")&&ya())})}function DC(n){const e=Math.floor(n/10)%10;return e<=2?"S":e<=5?"A":"F"}const OC={apiKey:"AIzaSyBikwjGsjL_PVFhx3Vj-OeJCocKA_hQOgU",authDomain:"the-hunt-ifrit.firebaseapp.com",projectId:"the-hunt-ifrit",storageBucket:"the-hunt-ifrit.firebasestorage.app",messagingSenderId:"285578581189",appId:"1:285578581189:web:4d9826ee3f988a7519ccac"},fl=sf(OC),vn=Tv(fl),Ot=dS(fl);(location.hostname==="localhost"||location.hostname==="127.0.0.1")&&(self.FIREBASE_APPCHECK_DEBUG_TOKEN=!0);const VC=pC(fl,{provider:new ol("6LeFtbYsAAAAAJETFxeUWd2IOe92slrZcYcZFHeT"),isTokenAutoRefreshEnabled:!0});async function Qm(){return new Promise(n=>{const e=tA(Ot,t=>{t?(e(),n(t.uid)):QI(Ot).catch(r=>{console.error("Anonymous sign-in failed:",r),e(),n(null)})});setTimeout(()=>{e(),n(Ot.currentUser?Ot.currentUser.uid:null)},Te.AUTH_TIMEOUT)})}async function xC(n){try{const e=Ot.currentUser;if(!e||e.uid!==n)return null;const r=(await e.getIdTokenResult()).claims;if(r.verified===!0&&r.lid)return{lodestone_id:String(r.lid),character_name:r.cname?String(r.cname):""}}catch(e){we(e,"ユーザーデータ取得失敗",!1)}return null}function Ao(n){let e=!1,t=0,r=null,s=null;const i=8,o=()=>{e||(s=n(()=>{t=0},c=>{if(s){try{s()}catch{}s=null}if(e)return;if(t++,t>i){we(c,"サーバー接続に失敗しました。ページを再読み込みしてください",!0);return}const l=(c==null?void 0:c.code)==="resource-exhausted"?6e4:1e3,h=Math.min(3e5,l*2**(t-1))*(.5+Math.random());r=setTimeout(o,h)}))};return o(),()=>{e=!0,clearTimeout(r),s&&s()}}function FC(n){const e=["s_latest","a_latest","f_latest"],t={},r=new Set,s=e.map(i=>Ao((o,c)=>fo(cr(vn,"mob_status",i),l=>{o(),r.add(i);const h=l.data();h&&(t[i]=h),n(t,r.size===e.length)},c)));return()=>s.forEach(i=>i())}function BC(n){const e=cr(vn,"shared_data","memo");return Ao((t,r)=>fo(e,s=>{t(),n(s.data()||{})},r))}function UC(n){const e=cr(vn,"shared_data","maintenance");return Ao((t,r)=>fo(e,s=>{t(),n(s.data()||null)},s=>{n(null),r(s)}))}function $C(n){return Ao((e,t)=>fo(Ev(vn,"mob_locations"),r=>{e();const s={};r.forEach(i=>{s[i.id]=HC(i.data())}),n(s)},t))}function HC(n){const e={};for(const[t,r]of Object.entries(n))if(t.startsWith("points.")){const[,s,i]=t.split(".");e[s]||(e[s]={}),e[s][i]=r}else if(t==="points"&&typeof r=="object"&&r!==null)for(const[s,i]of Object.entries(r))e[s]||(e[s]={}),Object.assign(e[s],i);return e}function pl(){const{isVerified:n,lodestoneId:e,userId:t,mobs:r}=G();return!n||!e||!t?null:{lodestoneId:e,userId:t,mobs:r}}const Xm=async(n,e)=>{const t=pl();if(!t)return{success:!1,error:"認証エラー"};const{lodestoneId:r,mobs:s}=t,i=s.find(p=>p.No===n);if(!i)return{success:!1,error:"Mobデータが見つかりません"};let o;e?(o=new Date(e),isNaN(o.getTime())&&(o=new Date(be()))):o=new Date(be());const c=P.modalStatus,l=P.modalForceSubmit,h=l?l.checked:!1,d=be();if(o.getTime()>d+Te.REPORT_FUTURE_THRESHOLD)return c&&(c.textContent="現在時刻より10分以上未来の時刻は報告できません。",c.classList.add("text-error")),{success:!1,error:"現在時刻より10分以上未来の時刻は報告できません。"};if(!h&&i.last_kill_time){let p=G().maintenance;p&&p.maintenance&&(p=p.maintenance);const{minRepop:m}=Qd(i,i.last_kill_time||0,p,d/1e3),A=m*1e3-Te.REPORT_EARLY_THRESHOLD;if(o.getTime()<A){const R=new Date(A).toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"});return c&&(c.textContent=`まだ湧き時間になっていません。
最短でも ${R} 以降である必要があります。
(強制送信する場合はチェックを入れてください)`,c.classList.add("text-error","whitespace-pre-wrap")),{success:!1,error:`最短でも ${R} 以降の時刻で報告してください。`}}}jr();try{const p=DC(i.No);let m="s_latest";p==="A"?m="a_latest":p==="F"&&(m="f_latest");const E=cr(vn,"mob_status",m),A=i.last_kill_time||0,N=A>0?te.fromMillis(A*1e3):null,R={[n]:{last_kill_time:te.fromDate(o),prev_kill_time:N,reporter_id:r}};return await Ai(E,R,{merge:!0}),{success:!0}}catch(p){return we(p,"報告送信失敗"),{success:!1,error:p.message||"通信失敗",code:p.code||(p.message.includes("permission")?"permission-denied":"unknown")}}},jC=async(n,e)=>{const t=pl();if(!t)return{success:!1,error:"認証エラー"};const{lodestoneId:r,mobs:s}=t;if(!s.find(c=>c.No===n))return{success:!1,error:"Mobデータエラー"};const o=e?e.replace(/[\r\n]/g,"").trim():"";if(o&&o.length>Te.MEMO_MAX_LENGTH)return{success:!1,error:"メモは30文字以内で入力してください"};try{const c=cr(vn,"shared_data","memo");if(!o)return await Ai(c,{[n]:[]},{merge:!0}),{success:!0};const l={memo_text:o,created_at:te.fromMillis(be()),reporter_id:r};return await Ai(c,{[n]:[l]},{merge:!0}),{success:!0}}catch(c){return we(c,"メモ保存失敗"),{success:!1,error:c.message||"通信または認証に失敗しました。"}}},qC=async(n,e,t,r)=>{const s=pl();if(!s)return{success:!1};const{lodestoneId:i}=s;if(!e)return{success:!1};try{const o=n%10,c=cr(vn,"mob_locations",`${e}_${o}`),d={[`points.${t}.${r?"culled_at":"uncull_at"}`]:te.fromMillis(be()),[`points.${t}.reporter_id`]:i};return await Ai(c,d,{merge:!0}),{success:!0}}catch(o){return we(o,"スポーン状態更新失敗",!1),{success:!1}}},WC=qd;async function Ym(n,e={}){let t=Ot.currentUser;if(t||(await Qm(),t=Ot.currentUser),!t)throw new Error("Firebase Auth user could not be initialized.");const r={...e.headers,Authorization:`Bearer ${await t.getIdToken()}`};try{const s=await gC(VC,!1);r["X-Firebase-AppCheck"]=s.token}catch(s){console.warn("App Check token unavailable:",s)}return fetch(`${WC}${n}`,{...e,headers:r})}async function zC(){try{const n=await Ym("code");if(!n.ok)return null;const e=await n.json();return typeof(e==null?void 0:e.code)=="string"?e.code:null}catch(n){return we(n,"認証コード取得失敗",!1),null}}const KC={invalid_id:"ロードストーンのIDが正しくありません。",unauthorized:"認証エラーが発生しました。ページを再読み込みして試してください。",forbidden:"アクセスが拒否されました。",region:"アクセスが拒否されました。日本国外からのアクセス、またはプロキシ利用は制限されています。",appcheck:"アプリの正当性を確認できませんでした。ページを再読み込みして試してください。",not_found:"キャラクターが見つかりませんでした。",code_not_found:"検証コードが自己紹介文に見つかりませんでした。保存から反映まで最大5分程度かかる場合があります。また、言語設定が日本語(JP)であることを確認してください。",rate_limited:"試行回数が多すぎます。しばらく待ってからやり直してください。",upstream:"ロードストーンに接続できませんでした。しばらくしてからやり直してください。",parse_failed:"ロードストーンのページを解析できませんでした。管理者に連絡してください。",claims_failed:"認証情報の登録に失敗しました。しばらくしてからやり直してください。",server_config:"サーバーの設定に問題があります。管理者に連絡してください。"};async function Jm(n){try{const e=await Ym("verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lodestoneId:n})});let t=null;try{t=await e.json()}catch{}if(e.ok&&(t!=null&&t.success)){const s=Ot.currentUser;if(!s)throw new Error("Firebase Auth user is missing.");return await s.getIdToken(!0),(await s.getIdTokenResult()).claims.verified!==!0?{success:!1,error:"認証情報の反映に失敗しました。ページを再読み込みして試してください。"}:{success:!0,characterName:t.characterName}}return{success:!1,error:KC[t==null?void 0:t.reason]||`認証に失敗しました。(${e.status})`}}catch(e){return we(e,"Lodestone認証失敗"),{success:!1,error:`認証に失敗しました。(${e.message||"Unknown Error"})`}}}const So={1:"新生",2:"蒼天",3:"紅蓮",4:"漆黒",5:"暁月",6:"黄金"},H={S:"S",A:"A",F:"F",ALL:"ALL",S_RANK:"S rank",A_RANK:"A rank",FATE:"FATE",FATE_FULL:"F.A.T.E."},nc={CALCULATE:"CALCULATE",RESULT:"RESULT",ERROR:"ERROR"},GC="./json/mob_data.json",QC="./json/mob_locations.json",XC="./json/maintenance.json",Te={APP_LOAD_TIMEOUT:6e3,TIER_B_UPDATE_INTERVAL:6e4,TOAST_DURATION:4e3,CLICK_THRESHOLD:1e3,DEBOUNCE_DELAY:100,BREAKPOINT_PC:1024,NOTIFICATION_OFFSET_MS:12e4,MAINTENANCE_SHOW_BEFORE_MS:6048e5,MAINTENANCE_SHOW_AFTER_MS:3456e5,MAP_ZOOM_SCALE:2,AUTH_TIMEOUT:1e4,REPORT_FUTURE_THRESHOLD:6e5,REPORT_EARLY_THRESHOLD:3e5,MEMO_MAX_LENGTH:30,FIRESTORE_LOAD_TIMEOUT:8e3},yd={Maintenance:"停止",MaxOver:"超過",ConditionActive:"‼️",PopWindow:"残り",Next:{S:"次回",others:"残り"},NextCondition:"⏳",Unknown:"未定"},P={colContainer:document.getElementById("column-container"),pcLeftList:document.getElementById("moblist-container"),pcRightDetail:document.getElementById("mobcard-detail"),mobileDetailOverlay:document.getElementById("mobcard-overlay"),cardOverlayBackdrop:document.getElementById("mobcard-overlay-backdrop"),reportModal:document.getElementById("report-modal"),reportForm:document.getElementById("report-form"),modalMobName:document.getElementById("modal-mob-name"),modalStatus:document.getElementById("modal-status"),modalTimeInput:document.getElementById("report-datetime"),modalForceSubmit:document.getElementById("report-force-submit"),authModal:document.getElementById("auth-modal"),authVCode:document.getElementById("auth-v-code"),authStatus:document.getElementById("auth-modal-status"),authLodestoneId:document.getElementById("auth-lodestone-id"),loadingOverlay:document.getElementById("loading-overlay"),appNav:document.getElementById("appnav"),manualModal:document.getElementById("manual-modal"),readmeContainer:document.getElementById("readme-container"),body:document.body,filterAccordion:document.getElementById("sidebar-filter-accordion"),appNavPanelItems:document.querySelectorAll(".appnav-panel .js-appnav-panel-item"),cardTemplate:document.getElementById("mobcard-card-template"),globalMagnifier:document.getElementById("global-magnifier"),authCopyCodeBtn:document.getElementById("auth-copy-code"),authVerifyBtn:document.getElementById("auth-verify"),readmeAuthSession:document.getElementById("readme-auth-session"),closeManualModalBtn:document.getElementById("close-manual-modal"),notificationToggle:document.getElementById("appnav-notification-toggle"),notifyPopup:document.querySelector(".js-notify-popup"),volumeSlider:document.getElementById("notify-volume-slider"),cancelReportBtn:document.getElementById("cancel-report"),authCancelBtn:document.getElementById("auth-cancel")};function YC(n,e){const t=yd[n]||yd.Unknown;return typeof t=="object"?e==="S"?t.S:t.others:t}function Zm(n,e=null){if(!n)return e;try{return JSON.parse(n)}catch{return e}}function eg(n){if(!n)return null;const e=n.trim(),t=e.match(/character\/(\d+)/),r=t?t[1]:e.match(/^\d+$/)?e:null;return!r||r.length>20?null:r}function we(n,e="エラーが発生しました",t=!0){const r=n.message||String(n);console.error(`[${e}]`,n),t&&window.dispatchEvent(new CustomEvent("appNotify",{detail:{message:`${e}: ${r}`,type:"error"}}))}const M={userId:localStorage.getItem("user_uuid")||null,lodestoneId:localStorage.getItem("lodestone_id")||null,characterName:localStorage.getItem("character_name")||null,isVerified:localStorage.getItem("is_verified")==="true",baseMobData:[],mobs:[],maintenance:null,initialLoadComplete:!1,worker:null,filter:(()=>{const n=localStorage.getItem("huntFilterState"),e=Zm(n,null),t=Array.from(new Set(Object.values(So))),r=[H.S,H.A,H.F];if(!e)return{rank:H.ALL,clickStep:2,areaSets:{S:new Set(t),A:new Set(t),F:new Set(t),ALL:new Set(t)},allRankSet:new Set(r)};const s=e.clickStep!==void 0?e.clickStep:2,i=e.areaSets,c=!i||(!i.S||i.S.length===0)&&(!i.A||i.A.length===0)&&(!i.F||i.F.length===0)?{S:new Set(t),A:new Set(t),F:new Set(t),ALL:new Set(t)}:{S:new Set(Array.isArray(i==null?void 0:i.S)?i.S:t),A:new Set(Array.isArray(i==null?void 0:i.A)?i.A:t),F:new Set(Array.isArray(i==null?void 0:i.F)?i.F:t),ALL:new Set(Array.isArray(i==null?void 0:i.ALL)?i.ALL:t)},l=new Set(Array.isArray(e.allRankSet)&&e.allRankSet.length>0?e.allRankSet:r);return{rank:e.rank||H.ALL,clickStep:s,areaSets:c,allRankSet:l}})(),openMobCardNo:null,notificationEnabled:localStorage.getItem("huntNotificationEnabled")==="true",notificationVolume:parseInt(localStorage.getItem("huntNotificationVolume")??"80",10),pendingCalculationMobs:new Set,pendingStatusMap:null,pendingMaintenanceData:null,pendingLocationsMap:null,pendingMemoData:null,_filterVersion:0,sMobMap:new Map,mobsMap:new Map,hasUnreadTelop:!1,mobLocations:{}};function G(){return M}function Ed(n){M.userId=n,n?localStorage.setItem("user_uuid",n):localStorage.removeItem("user_uuid")}function qr(n){M.lodestoneId=n,n?localStorage.setItem("lodestone_id",n):localStorage.removeItem("lodestone_id")}function Wr(n){M.characterName=n,n?localStorage.setItem("character_name",n):localStorage.removeItem("character_name"),window.dispatchEvent(new CustomEvent("characterNameSet"))}function Vn(n){M.isVerified=n,localStorage.setItem("is_verified",n?"true":"false")}function Co(n){M.mobs=n,M.mobsMap.clear(),n.forEach(e=>M.mobsMap.set(String(e.No),e)),JC()}function JC(){M.sMobMap.clear(),M.mobs.forEach(n=>{if(n.rank==="S"){const e=n.No%10;M.sMobMap.set(`${n.area}_${e}`,n)}})}function Di(n){M.filter={...M.filter,...n},M._filterVersion++;const e={...M.filter,areaSets:Object.keys(M.filter.areaSets).reduce((t,r)=>{const s=M.filter.areaSets[r];return t[r]=s instanceof Set?Array.from(s):s,t},{}),allRankSet:Array.from(M.filter.allRankSet||[])};localStorage.setItem("huntFilterState",JSON.stringify(e)),window.dispatchEvent(new CustomEvent("filterChanged"))}function tr(n){M.openMobCardNo=n}function ZC(n){M.notificationEnabled=n,localStorage.setItem("huntNotificationEnabled",n?"true":"false"),window.dispatchEvent(new CustomEvent("notificationSettingChanged",{detail:{enabled:n}}))}function eb(n){M.notificationVolume=Math.max(0,Math.min(100,n)),localStorage.setItem("huntNotificationVolume",String(M.notificationVolume))}const tg="huntLastSeenTelopMessage";function zr(n){const e=n||"";if(e.trim()===""){M.hasUnreadTelop=!1;return}const t=localStorage.getItem(tg)||"";M.hasUnreadTelop=e!==t}function tb(){const n=M.maintenance&&M.maintenance.message?M.maintenance.message:"";localStorage.setItem(tg,n),M.hasUnreadTelop=!1,window.dispatchEvent(new CustomEvent("maintenanceUpdated",{detail:{maintenance:M.maintenance}}))}const sn=new Map;function ml(n,e){sn.has(n)&&(clearTimeout(sn.get(n)),sn.delete(n));const t=e.nextBoundarySec;if(!t||t===1/0)return;const r=be()/1e3,s=(t-r)*1e3;if(s<=0||s>7*24*3600*1e3)return;const i=setTimeout(()=>{sn.delete(n);const o=M.mobsMap.get(String(n));o&&bo(o,M.maintenance,{forceRecalc:!0})},s);sn.set(n,i)}const nb=1e4,un=new Map,gl=new Set;function rb(){M.worker||(M.worker=new Worker(new URL(""+new URL("calWorker-BuuDa8Vg.js",import.meta.url).href,import.meta.url),{type:"module"}),M.worker.onmessage=n=>{const{type:e,mobNo:t,repopInfo:r,spawnCache:s,error:i}=n.data;if(e===nc.RESULT){const o=M.mobs,c=o.findIndex(l=>l.No===t);M.pendingCalculationMobs.delete(t),un.delete(t),c!==-1&&(r.nextMinRepopDate&&(r.nextMinRepopDate=new Date(r.nextMinRepopDate)),r.nextConditionSpawnDate&&(r.nextConditionSpawnDate=new Date(r.nextConditionSpawnDate)),r.conditionWindowEnd&&(r.conditionWindowEnd=new Date(r.conditionWindowEnd)),o[c].repopInfo=r,s&&(o[c]._spawnCache=s),ml(t,r),window.dispatchEvent(new CustomEvent("mobUpdated",{detail:{mobNo:t,mob:o[c]}})))}else e===nc.ERROR&&(M.pendingCalculationMobs.delete(t),un.delete(t),console.error(`時間計算エラー (Mob ${t}):`,i));if(t!==void 0&&gl.delete(t)){const o=M.mobsMap.get(String(t));o&&bo(o,M.maintenance,{forceRecalc:!0})}})}function bo(n,e,t={}){if(M.pendingCalculationMobs.has(n.No)){const i=un.get(n.No)||0;if(Date.now()-i<nb){t.forceRecalc&&gl.add(n.No);return}}M.worker||rb(),M.pendingCalculationMobs.add(n.No),un.set(n.No,Date.now());const{spawn_cull_status:r,...s}=n;try{M.worker.postMessage({type:nc.CALCULATE,mob:s,maintenance:e,options:t,timeOffset:Zg()})}catch(i){M.pendingCalculationMobs.delete(n.No),un.delete(n.No),we(i,`計算要求の送信失敗 (Mob ${n.No})`,!1);try{n.repopInfo=Yi(n,e,t),window.dispatchEvent(new CustomEvent("mobUpdated",{detail:{mobNo:n.No,mob:n}}))}catch(o){we(o,`メインスレッド計算失敗 (Mob ${n.No})`,!1)}}}const Td=new Map,sb=15e3;function ib(n,e){const t=n.repopInfo;if(!t||t.status==="Maintenance"||t.status==="MaxOver")return;const r=t.nextBoundarySec||t.maxRepop||0;if(!r||r>e)return;const s=Date.now();s-(Td.get(n.No)||0)<sb||(Td.set(n.No,s),bo(n,M.maintenance,{forceRecalc:!0}))}function ob(n,e){return Object.entries(n.mobs).map(([t,r])=>{const s=r.a,i=e==null?void 0:e[s],o={...r,No:parseInt(t,10),rank:r.r,name:r.n,area:s,repopSeconds:r.min,maxRepopSeconds:r.max,condition:r.cond||"",Expansion:So[Math.floor(parseInt(t,10)/1e4)]||"Unknown",ExpansionId:Math.floor(parseInt(t,10)/1e4),mapImage:(i==null?void 0:i.mapImage)||"",locations:(i==null?void 0:i.locations)||[],last_kill_time:0,prev_kill_time:0,spawn_cull_status:{},memo_text:"",memo_updated_at:0};return delete o.r,delete o.n,delete o.a,delete o.min,delete o.max,delete o.cond,o})}async function Ea(){var n;try{const e=await fetch(XC);if(!e.ok)throw new Error("Maintenance data failed to load.");const t=await e.json();return M.maintenance=t&&t.maintenance?t.maintenance:t,zr((n=M.maintenance)==null?void 0:n.message),M.maintenance}catch(e){return we(e,"メンテ情報読み込み失敗",!1),null}}async function ab(){try{const[n,e]=await Promise.all([fetch(GC),fetch(QC).catch(()=>null)]);if(!n.ok)throw new Error("Mob data failed to load.");const t=await n.json();let r=null;e&&e.ok?r=await e.json():we(new Error("Location data failed to load."),"位置データ読み込み失敗",!1);const s=ob(t,r);M.baseMobData=s,Co([...s]),r&&window.dispatchEvent(new CustomEvent("locationDataReady")),M.baseMobData.length>0&&cb()}catch(n){we(n,"基礎データ読み込み失敗"),console.error("データの読み込みに失敗しました。"),window.dispatchEvent(new CustomEvent("criticalDataLoadError",{detail:{message:`基礎データの読み込みに失敗しました。
アプリをファイルから直接開いている場合は、VS CodeのLive Serverなどを使って開いてください。`}}))}}const Ie={status:!1,location:!1,memo:!1,maintenance:!1};let rc=!1,sc=!1,zn=null,bn=[];function cb(){const n=M.mobs;if(rc&&(M.pendingMaintenanceData&&(M.maintenance=M.pendingMaintenanceData,zr(M.pendingMaintenanceData.message)),Ie.maintenance=!0,rc=!1),M.pendingStatusMap){const e=new Map;Object.values(M.pendingStatusMap).forEach(t=>{Object.entries(t).forEach(([r,s])=>{var o,c;const i=parseInt(r,10);e.set(i,{last_kill_time:((o=s.last_kill_time)==null?void 0:o.seconds)||0,prev_kill_time:((c=s.prev_kill_time)==null?void 0:c.seconds)||0})})}),n.forEach(t=>{const r=e.get(t.No);r&&(t.last_kill_time=r.last_kill_time,t.prev_kill_time=r.prev_kill_time)}),sc&&(Ie.status=!0,sc=!1),M.pendingStatusMap=null}if(M.pendingLocationsMap&&(M.mobLocations=M.pendingLocationsMap,n.forEach(e=>{const t=e.No%10,r=`${e.area}_${t}`,s=M.pendingLocationsMap[r];e.spawn_cull_status=s||{}}),Ie.location=!0,M.pendingLocationsMap=null),M.pendingMemoData){const e=M.pendingMemoData;n.forEach(t=>{var i;const s=(e[t.No]||[])[0];s?(t.memo_text=s.memo_text,t.memo_updated_at=((i=s.created_at)==null?void 0:i.seconds)||0):t.memo_text=""}),Ie.memo=!0,M.pendingMemoData=null}Co([...n]),Ln()}function Ln(){if(!(M.mobs.length===0||M.initialLoadComplete)&&Ie.status&&Ie.maintenance){M.initialLoadComplete=!0,zn&&(clearTimeout(zn),zn=null);const n=M.mobs,e=M.maintenance;n.forEach(t=>{t.repopInfo=Yi(t,e),ml(t.No,t.repopInfo)}),Co([...n]),window.dispatchEvent(new CustomEvent("initialDataLoaded"))}}const wd=new Map;function lb(n){var t,r;let e="";for(const s in n){const i=n[s];e+=`${s}:${((t=i==null?void 0:i.culled_at)==null?void 0:t.seconds)||0},${((r=i==null?void 0:i.uncull_at)==null?void 0:r.seconds)||0},${(i==null?void 0:i.reporter_id)||""};`}return e}function ng(n={}){const{resume:e=!1}=n;bn.forEach(o=>o&&o()),bn=[],e||(sn.forEach(o=>clearTimeout(o)),sn.clear(),M.initialLoadComplete=!1,Ie.status=!1,Ie.location=!1,Ie.memo=!1,Ie.maintenance=!1,zn&&clearTimeout(zn),zn=setTimeout(()=>{M.initialLoadComplete||(console.warn("Firestore initial load timed out. Forcing completion with available data."),Ie.status||(Ie.status=!0),Ie.maintenance||(Ie.maintenance=!0,M.maintenance||Ea().then(o=>{o&&(M.maintenance=o)})),M.pendingCalculationMobs.clear(),un.clear(),Ln())},Te.FIRESTORE_LOAD_TIMEOUT));const t=FC((o,c)=>{if(M.mobs.length===0){M.pendingStatusMap=o,sc=c;return}const l=M.mobsMap;let h=!1;const d=new Set;Object.values(o).forEach(p=>{Object.entries(p).forEach(([m,E])=>{var O,x;const A=l.get(m);if(!A)return;const N=((O=E.last_kill_time)==null?void 0:O.seconds)||0,R=((x=E.prev_kill_time)==null?void 0:x.seconds)||0;(A.last_kill_time!==N||A.prev_kill_time!==R)&&(A.last_kill_time=N,A.prev_kill_time=R,M.initialLoadComplete&&(A.repopInfo=Yi(A,M.maintenance,{forceRecalc:!0}),ml(A.No,A.repopInfo)),h=!0,d.add(parseInt(m,10)))})}),M.initialLoadComplete||c&&(Ie.status=!0,Ln()),h&&M.initialLoadComplete&&(window.dispatchEvent(new CustomEvent("mobsBatchUpdated",{detail:{mobNos:Array.from(d),updateType:"status"}})),window.dispatchEvent(new CustomEvent("mobsUpdated")))});bn.push(t);const r=$C(o=>{if(M.mobs.length===0){M.pendingLocationsMap=o;return}M.mobLocations=o;const c=[],l=new Set;for(const d of Object.keys(o)){const p=lb(o[d]);wd.get(d)!==p&&(wd.set(d,p),l.add(d))}const h=new Set(Object.keys(o).map(d=>d.split("_")[0]));M.mobs.forEach(d=>{if(h.has(d.area)){const p=d.No%10,m=`${d.area}_${p}`,E=o[m];E&&(d.spawn_cull_status=E,M.initialLoadComplete&&l.has(m)&&c.push(d.No))}}),M.initialLoadComplete?l.size>0&&(c.length>0&&window.dispatchEvent(new CustomEvent("mobsBatchUpdated",{detail:{mobNos:c,updateType:"location"}})),window.dispatchEvent(new CustomEvent("locationsUpdated",{detail:{locationsMap:o}}))):(Ie.location=!0,Ln())});bn.push(r);const s=BC(o=>{if(M.mobs.length===0){M.pendingMemoData=o;return}const c=Object.keys(o),l=[];c.forEach(h=>{var N;const d=M.mobsMap.get(h);if(!d)return;const p=parseInt(h,10),E=(o[h]||[])[0],A=d.memo_text;E?(d.memo_text=E.memo_text,d.memo_updated_at=((N=E.created_at)==null?void 0:N.seconds)||0):(d.memo_text="",d.memo_updated_at=0),M.initialLoadComplete&&A!==d.memo_text&&l.push(p)}),M.initialLoadComplete?(l.length>0&&window.dispatchEvent(new CustomEvent("mobsBatchUpdated",{detail:{mobNos:l,updateType:"memo"}})),window.dispatchEvent(new CustomEvent("mobsUpdated"))):(Ie.memo=!0,Ln())});bn.push(s);const i=UC(async o=>{const c=o&&o.maintenance?o.maintenance:o;if(M.mobs.length===0){if(rc=!0,M.pendingMaintenanceData=c,!c){const l=await Ea();l&&(M.pendingMaintenanceData=l)}return}if(M.initialLoadComplete){if(!c)return;M.maintenance=c,zr(c.message);const l=M.mobs;l.forEach(h=>{bo(h,c)}),Co([...l]),window.dispatchEvent(new CustomEvent("filterChanged")),window.dispatchEvent(new CustomEvent("mobsUpdated")),window.dispatchEvent(new CustomEvent("maintenanceUpdated"))}else{if(c)M.maintenance=c,zr(c.message);else{const l=await Ea();l&&(M.maintenance=l,zr(l.message))}Ie.maintenance=!0,Ln()}});bn.push(i)}function _l(n,e,t=null){var N,R,O;const r=G();if(t||(t=r.mobsMap.get(String(e))||null),!t)return!1;const s=t.No%10,i=r.sMobMap.get(`${t.area}_${s}`),o=i?i.last_kill_time||0:t.last_kill_time||0,c=(N=r.maintenance)!=null&&N.serverUp?new Date(r.maintenance.serverUp).getTime():0,l=n!=null&&n.culled_at&&typeof n.culled_at.toMillis=="function"?n.culled_at.toMillis():(R=n==null?void 0:n.culled_at)!=null&&R.seconds?(n==null?void 0:n.culled_at).seconds*1e3:0,h=n!=null&&n.uncull_at&&typeof n.uncull_at.toMillis=="function"?n.uncull_at.toMillis():(O=n==null?void 0:n.uncull_at)!=null&&O.seconds?(n==null?void 0:n.uncull_at).seconds*1e3:0,d=typeof o=="number"?o*1e3:0,p=l>c?l:0,m=h>c?h:0;if(p===0&&m===0)return!1;const E=p>d,A=m>d;return E&&(!A||p>=m)?!0:(A&&(!E||m>=p),!1)}const ub=10*60*1e3;let js=0;document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){js=Date.now();return}if(!js)return;const n=Date.now()-js;js=0,!(n<ub)&&M.mobs.length!==0&&(M.pendingCalculationMobs.clear(),un.clear(),gl.clear(),ng({resume:!0}))});const hb="modulepreload",db=function(n,e){return new URL(n,e).href},vd={},fb=function(e,t,r){let s=Promise.resolve();if(t&&t.length>0){const o=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),l=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));s=Promise.allSettled(t.map(h=>{if(h=db(h,r),h in vd)return;vd[h]=!0;const d=h.endsWith(".css"),p=d?'[rel="stylesheet"]':"";if(!!r)for(let A=o.length-1;A>=0;A--){const N=o[A];if(N.href===h&&(!d||N.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${h}"]${p}`))return;const E=document.createElement("link");if(E.rel=d?"stylesheet":hb,d||(E.as="script"),E.crossOrigin="",E.href=h,l&&E.setAttribute("nonce",l),document.head.appendChild(E),d)return new Promise((A,N)=>{E.addEventListener("load",A),E.addEventListener("error",()=>N(new Error(`Unable to preload CSS for ${h}`)))})}))}function i(o){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=o,window.dispatchEvent(c),!c.defaultPrevented)throw o}return s.then(o=>{for(const c of o||[])c.status==="rejected"&&i(c.reason);return e().catch(i)})},pb=`<!-- markdownlint-disable MD041 -->\r
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
`;let ic=!1,qs="";const Id=async()=>{const n=P.manualModal,e=P.readmeContainer;if(!(!n||!e)&&(n.classList.remove("hidden"),n.classList.add("flex"),document.body.classList.add("overflow-hidden"),!ic))try{const t=pb;if(typeof marked<"u"&&typeof DOMPurify<"u"){marked.setOptions({breaks:!0,gfm:!0});const r=marked.parse(t);e.innerHTML=DOMPurify.sanitize(r)}else e.textContent=t;ic=!0,yl()}catch(t){console.error(t);const r=ct("ui-message-template");r&&(r.className="u-text-red-400 u-text-center",r.textContent="マニュアルの読み込みに失敗しました。",e.innerHTML="",e.appendChild(r))}},Oi=()=>{const n=document.getElementById("manual-modal");n&&(n.classList.add("hidden"),n.classList.remove("flex"),document.body.classList.remove("overflow-hidden"))};document.addEventListener("DOMContentLoaded",()=>{const n=P.manualModal,e=P.closeManualModalBtn,t=()=>{Oi(),document.querySelector(".appnav-btn[data-nav-id='manual'].appnav-active")&&fb(()=>Promise.resolve().then(()=>Cb),void 0,import.meta.url).then(s=>s.setActiveNavItem("home"))};e==null||e.addEventListener("click",t),n==null||n.addEventListener("click",r=>{const s=r.target;(s===n||s.classList.contains("app-backdrop"))&&t()}),document.addEventListener("keydown",r=>{r.key==="Escape"&&n&&!n.classList.contains("hidden")&&t()})});window.addEventListener("characterNameSet",()=>{ic&&yl()});async function yl(){const n=P.readmeAuthSession;if(!n)return;const e=G();if(n.innerHTML="",e.isVerified){const l=ct("auth-verified-template");l&&n.appendChild(l);return}if(!qs){const l=new Uint8Array(6);crypto.getRandomValues(l),qs="HUNT-"+Array.from(l).map(d=>d.toString(36).toUpperCase()).join("").substring(0,8)}const t=ct("auth-form-template");if(!t)return;const r=t.querySelector(".auth-vcode-display"),s=t.querySelector(".auth-copy-btn"),i=t.querySelector(".auth-verify-btn"),o=t.querySelector(".auth-id-input"),c=t.querySelector(".auth-status-msg");r&&(r.textContent=qs),s==null||s.addEventListener("click",()=>{navigator.clipboard.writeText(qs);const l=s.textContent;s.textContent="Done!",setTimeout(()=>{s&&(s.textContent=l)},2e3)}),i==null||i.addEventListener("click",async()=>{if(!o||!c||!i)return;const l=o.value.trim(),h=eg(l);if(!h){c.textContent="正しいIDまたはURLを入力してください",c.className="text-xs text-red-400";return}c.textContent="検証中...",c.className="text-xs text-cyan-400 auth-status-msg",i.disabled=!0;try{const d=await Jm(h);i.disabled=!1,d.success&&d.characterName?(c.textContent="検証成功！登録しています...",qr(h),Wr(d.characterName),Vn(!0),yl()):(c.textContent=d.error||"検証失敗",c.className="text-xs text-red-400 auth-status-msg",i.disabled=!1)}catch(d){c.textContent=`エラー: ${d.message||"通信失敗"}`,c.className="text-xs text-red-400 auth-status-msg",i.disabled=!1}}),n.appendChild(t)}const mb="./sound/01 FFXIV_Linkshell_Transmission.mp3";let je=null,oc=null,Vi=!1;const ut=new Set;let lt=null;window.errorLog=window.errorLog||[];const Ta=50,El=new Set(["telop","maintenance","error"]),Xt=window.matchMedia("(min-width: 900px)");let Ze=null,Ad=!1,Fe=!1;function Ro(){var n;return document.getElementById("appnav-panel")||((n=P.appNav)==null?void 0:n.querySelector(".appnav-panel"))}function Po(){return document.getElementById("appnav-rank-panel")}function Sd(n,e){if(!n||n.dataset.chromeAttached==="1")return;n.dataset.chromeAttached="1",["tl","tr","bl","br"].forEach(r=>{const s=document.createElement("i");s.className=`ff-corner ${r}`,n.appendChild(s)});const t=document.createElement("button");t.type="button",t.className="appnav-popup-close",t.setAttribute("aria-label","閉じる"),t.textContent="✕",t.addEventListener("click",e),n.appendChild(t)}function rg(n){const e=n.getBoundingClientRect();return{x:Math.round((window.innerWidth-e.width)/2),y:Math.round(window.innerHeight-e.height-58)}}function ac(n,e,t){const r=t.getBoundingClientRect(),s=8,i=Math.max(s,window.innerWidth-r.width-s),o=Math.max(s,window.innerHeight-r.height-s);return{x:Math.min(Math.max(s,Math.round(n)),i),y:Math.min(Math.max(s,Math.round(e)),o)}}function xi(n){if(!n.classList.contains("is-floating"))return;const t=vl().rankWindowPos,r=t&&typeof t.x=="number"&&typeof t.y=="number"?t:rg(n),s=ac(r.x,r.y,n);n.style.left=`${s.x}px`,n.style.top=`${s.y}px`}function Tl(){var s,i;const n=Po();if(!n)return;const e=Fe&&Xt.matches,t=Fe&&!Xt.matches;n.classList.toggle("expanded",Fe),n.classList.toggle("is-floating",e),n.classList.toggle("is-docked",t),e?(xi(n),requestAnimationFrame(()=>xi(n))):(n.style.left="",n.style.top="");const r=document.getElementById("sidebar-panel-rank");r==null||r.classList.toggle("hidden",!Fe),Fe&&ko(),t?((s=P.appNav)==null||s.classList.add("expanded"),P.body.classList.add("sidebar-expanded")):(!lt||El.has(lt))&&((i=P.appNav)==null||i.classList.remove("expanded"),P.body.classList.remove("sidebar-expanded"))}function sg(){Fe=!0,Yt("rankOpen",!0),Tl(),mt(lt||"home")}function Fi(){Fe=!1,Yt("rankOpen",!1),Tl(),mt(lt||"home")}function gb(){if(Ad)return;const n=Po(),e=document.querySelector("#sidebar-panel-rank .appnav-section-header");!n||!e||(Ad=!0,e.addEventListener("pointerdown",t=>{if(t.button!==0||!n.classList.contains("is-floating")||t.target.closest(".appnav-popup-close"))return;t.preventDefault();const r=n.getBoundingClientRect(),s=t.clientX-r.left,i=t.clientY-r.top;n.classList.add("is-dragging");const o=l=>{const h=ac(l.clientX-s,l.clientY-i,n);n.style.left=`${h.x}px`,n.style.top=`${h.y}px`},c=()=>{window.removeEventListener("pointermove",o),window.removeEventListener("pointerup",c),window.removeEventListener("pointercancel",c),n.classList.remove("is-dragging");const l=parseFloat(n.style.left),h=parseFloat(n.style.top);!Number.isNaN(l)&&!Number.isNaN(h)&&Yt("rankWindowPos",{x:l,y:h})};window.addEventListener("pointermove",o),window.addEventListener("pointerup",c),window.addEventListener("pointercancel",c)}),e.addEventListener("dblclick",()=>{if(!n.classList.contains("is-floating"))return;Yt("rankWindowPos",null);const t=rg(n),r=ac(t.x,t.y,n);n.style.left=`${r.x}px`,n.style.top=`${r.y}px`}),Xt.addEventListener("change",()=>{Fe&&(!Xt.matches&&lt&&qe(),Tl())}),window.addEventListener("resize",()=>{n.classList.contains("is-floating")&&xi(n)}))}function _b(){const n=Ro(),e=Po();!n||Ze||(Ze=document.createElement("div"),Ze.className="appnav-backdrop",Ze.addEventListener("click",qe),Ze.addEventListener("wheel",t=>t.preventDefault(),{passive:!1}),document.body.appendChild(Ze),Sd(n,qe),Sd(e,Fi),document.addEventListener("keydown",t=>{t.key==="Escape"&&lt&&El.has(lt)&&qe()}))}function ig(n){const e=P.appNav,t=Ro(),r=!!n&&El.has(n);t==null||t.classList.toggle("is-popup",r),t==null||t.classList.toggle("is-docked",!!n&&!r),t&&(r?(t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true")):(t.removeAttribute("role"),t.removeAttribute("aria-modal"))),Ze==null||Ze.classList.toggle("is-open",r),r&&P.body.classList.remove("sidebar-expanded"),Array.from(document.body.children).forEach(s=>{s===Ze||s.tagName==="SCRIPT"||e&&s.contains(e)||s.toggleAttribute("inert",r)})}let hn=null;async function yb(){try{je=new AudioContext,hn=je.createGain(),hn.gain.value=G().notificationVolume/100,hn.connect(je.destination);const e=await(await fetch(mb)).arrayBuffer();oc=await je.decodeAudioData(e)}catch(n){we(n,"通知音の読み込み失敗",!1)}}function Cd(){return je&&je.state==="suspended"?je.resume().then(()=>{Vi=je.state==="running"}).catch(n=>{we(n,"音声の有効化失敗",!1)}):(Vi=!0,Promise.resolve())}function bd(){var n;(n=P.notifyPopup)==null||n.classList.add("is-open")}function xn(){var n;(n=P.notifyPopup)==null||n.classList.remove("is-open")}function og(){yb();const n=P.notificationToggle;if(!n)return;const e=P.notifyPopup,t=P.volumeSlider,r=G().notificationEnabled;n.checked=r;const s=n.closest(".appnav-btn");s&&s.classList.toggle("is-disabled",!r);const i=G().notificationVolume;if(t){t.value=String(i);const m=e==null?void 0:e.querySelector(".js-volume-value");m&&(m.textContent=String(i))}const o=()=>{Cd().then(()=>{Vi&&(document.removeEventListener("click",o),document.removeEventListener("touchend",o))})};document.addEventListener("click",o),document.addEventListener("touchend",o),window.addEventListener("notificationSettingChanged",m=>{const E=m.detail;E&&typeof E.enabled=="boolean"&&(n.checked=E.enabled,s&&s.classList.toggle("is-disabled",!E.enabled))}),n.addEventListener("change",()=>{const m=n.checked;if(s&&s.classList.toggle("is-disabled",!m),ZC(m),m){Eb();const E=Cd();bd(),E.then(()=>Bi())}else xn()});let c=null,l=!1;const h=()=>{l=!1,c=setTimeout(()=>{l=!0,G().notificationEnabled&&(e!=null&&e.classList.contains("is-open")?xn():bd())},500)},d=()=>{c&&(clearTimeout(c),c=null)};s==null||s.addEventListener("touchstart",h,{passive:!0}),s==null||s.addEventListener("touchend",d),s==null||s.addEventListener("touchmove",d),s==null||s.addEventListener("mousedown",h),s==null||s.addEventListener("mouseup",d),s==null||s.addEventListener("mouseleave",d),s==null||s.addEventListener("click",m=>{if(e!=null&&e.classList.contains("is-open")&&G().notificationEnabled){m.preventDefault(),m.stopPropagation(),l=!1;return}l&&(m.preventDefault(),m.stopPropagation(),l=!1)}),t==null||t.addEventListener("input",()=>{const m=parseInt(t.value,10),E=e==null?void 0:e.querySelector(".js-volume-value");E&&(E.textContent=String(m)),eb(m),hn&&(hn.gain.value=m/100)}),t==null||t.addEventListener("change",()=>{Bi()});const p=m=>{if(!(e!=null&&e.classList.contains("is-open")))return;const E=m.target;E&&(e.contains(E)||s&&s.contains(E)||xn())};document.addEventListener("pointerdown",p,!0),document.addEventListener("touchstart",p,!0),document.addEventListener("click",p,!0),window.addEventListener("scroll",()=>{e!=null&&e.classList.contains("is-open")&&xn()},{passive:!0})}async function Eb(){"Notification"in window&&Notification.permission!=="granted"&&Notification.permission!=="denied"&&await Notification.requestPermission()}function Bi(){if(!je||!oc||!hn||!Vi)return;const n=()=>{const e=je.createBufferSource();e.buffer=oc,e.connect(hn),e.start(0)};je.state==="suspended"?je.resume().then(n).catch(e=>{we(e,"通知音の再生失敗",!1)}):n()}async function ag(n,e){if(!G().notificationEnabled||!("Notification"in window)||Notification.permission!=="granted")return;const t={body:e,icon:"./icon/The_Hunt.png"};try{"serviceWorker"in navigator&&navigator.serviceWorker.controller?await(await navigator.serviceWorker.ready).showNotification(n,t):new Notification(n,t)}catch(r){we(r,"システム通知の表示失敗",!1)}}const wa=new Map,Tb=10*60*1e3,wb=30;function Rd(n,e,t){if(t>Tb||wa.has(e)||ut.has(e))return;const r=setTimeout(()=>{wa.delete(e);const s=G().mobsMap.get(String(n));s&&is(s)},t+wb);wa.set(e,r)}function Pd(n,e){const t=e==="before"?"まもなく（2分前）":"時間なう！";window.innerWidth>=1024?ag(`【POP info】 ${n.name}`,t):Bi()}function is(n){if(!G().notificationEnabled)return;const t=n.repopInfo;if(!t||!t.nextConditionSpawnDate||!t.conditionWindowEnd)return;const r=be(),s=t.nextConditionSpawnDate.getTime(),i=t.conditionWindowEnd.getTime(),o=s-Te.NOTIFICATION_OFFSET_MS,c=`${n.No}-${s}`,l=`${c}-before`,h=`${c}-at`;r>=o&&r<s&&!ut.has(l)&&(Pd(n,"before"),ut.add(l)),r>=s&&r<=i&&!ut.has(h)&&(Pd(n,"at"),ut.add(h)),r>i&&(ut.has(l)&&ut.delete(l),ut.has(h)&&ut.delete(h)),r<o&&Rd(n.No,l,o-r),r<s&&Rd(n.No,h,s-r)}function wl(n){return n===H.S_RANK||n===H.S?H.S:n===H.A_RANK||n===H.A?H.A:n===H.FATE||n===H.FATE_FULL||n===H.F?H.F:n}const vb=()=>Array.from(new Set(Object.values(So))),Ui=(n=null)=>{const e=G(),t=wl(e.filter.rank);let r=[],s=new Set;e.filter.rank===H.ALL?(r=[H.S,H.A,H.F],s=e.filter.allRankSet instanceof Set?e.filter.allRankSet:new Set):(r=Object.entries(So).sort((c,l)=>Number(l[0])-Number(c[0])).map(c=>c[1]),s=e.filter.areaSets[t]instanceof Set?e.filter.areaSets[t]:new Set);const i=n||document.querySelector("#sidebar-panel-rank .area-grid-container");i&&(i.innerHTML="",r.forEach(o=>{const c=s.has(o),l=document.createElement("button");l.type="button",l.className=`area-filter-btn ${c?"is-selected":""}`,l.textContent=e.filter.rank===H.FATE&&o===H.F?"FATE":e.filter.rank===H.ALL?o===H.F?"FATE":`${o} rank`:o,l.dataset.value=o,i.appendChild(l)}),$i())},cg=n=>{if(!n)return;const e=G();if(e.filter.rank===n){const r=e.filter.clickStep===2?1:2;Di({clickStep:r})}else Di({rank:n,clickStep:1,areaSets:e.filter.areaSets});nr()};function lg(n){const t=n.target.closest(".area-filter-btn");if(!t)return;const r=t.closest(".area-grid-container"),s=G(),i=s.filter.rank;if(i==="ALL"){const d=s.filter.allRankSet instanceof Set?s.filter.allRankSet:new Set,p=new Set(d),m=t.dataset.value;m&&(p.has(m)?p.delete(m):p.add(m)),Di({rank:i,allRankSet:p}),nr(),Ui(r);return}const o=wl(i),c=s.filter.areaSets[o]instanceof Set?s.filter.areaSets[o]:new Set,l={...s.filter.areaSets},h=t.dataset.value||t.dataset.area;if(h){const d=h,p=new Set(c);p.has(d)?p.delete(d):p.add(d),l[o]=p}Di({rank:i,areaSets:l}),nr(),Ui(r)}function ug(n){const e=G().filter,t=e.rank,r=e.areaSets,s=e.allRankSet,i=vb().length,o=c=>c===H.S||c===H.A?c:c===H.F?H.F:c.startsWith("B")?H.A:null;return n.filter(c=>{const l=c.rank,h=c.Expansion,d=o(l);if(!d||!h)return!1;const p=d;if(t==="ALL"){if(p!=="S"&&p!=="A"&&p!=="F"||s&&s.size<3&&!s.has(p))return!1;const m=(r==null?void 0:r[p])instanceof Set?r[p]:new Set;return m.size===0?!1:m.size===i?!0:m.has(h)}else{const m=wl(t);if(!(m==="S"&&l==="S"||m==="A"&&(l==="A"||l.startsWith("B"))||m==="F"&&l==="F"))return!1;const A=(r==null?void 0:r[p])instanceof Set?r[p]:new Set;return A.size===0?!1:A.size===i?!0:A.has(h)}})}function vl(){return Zm(localStorage.getItem("sidebarState"),{})}function Yt(n,e){const t=vl();t[n]=e,localStorage.setItem("sidebarState",JSON.stringify(t))}function hg(){const n=P.appNav;if(!n)return;Sb(),_b(),gb();const e=vl(),t=e.rankOpen===!0||e.panel==="rank";e.panel==="rank"&&(Yt("panel",null),Yt("rankOpen",!0)),t?sg():mt("home"),og(),n.addEventListener("click",r=>{const i=r.target.closest(".appnav-rank-tab, .appnav-rank-header");i&&(r.preventDefault(),r.stopPropagation(),cg(i.dataset.rank||""))}),Fe||ko()}function mt(n){document.querySelectorAll(".appnav-btn[data-nav-id]").forEach(e=>{const t=e,r=t.dataset.navId,s=r===n||r==="rank"&&Fe;t.classList.toggle("appnav-active",s)})}async function dg(n){if(xn(),n==="rank"){const t=Fe;Xt.matches||qe(),t?Fi():sg();return}if(!Xt.matches&&Fe&&Fi(),n==="manual"){const t=P.manualModal;t&&!t.classList.contains("hidden")?(Oi(),mt("home")):(qe(),typeof Id=="function"&&await Id(),mt("manual"));return}Oi();const e=P.appNav;if(e){if(lt===n){qe();return}e.classList.add("expanded"),document.body.classList.add("sidebar-expanded"),Ib(n),lt=n,n==="telop"&&tb(),mt(n),Yt("panel",n)}}function qe(){xn(),Oi(),!Xt.matches&&Fe&&Fi();const n=P.appNav;if(!n)return;(!Fe||Xt.matches)&&(n.classList.remove("expanded"),P.body.classList.remove("sidebar-expanded")),ig(null);const e=Ro();e&&(e.classList.remove("expanded"),e.querySelectorAll(".js-appnav-panel-item").forEach(t=>t.classList.add("hidden"))),lt=null,mt("home"),Yt("panel",null)}function Ib(n){if(!P.appNav)return;const t=Ro();t==null||t.querySelectorAll(".js-appnav-panel-item").forEach(s=>s.classList.add("hidden"));const r=document.getElementById(`sidebar-panel-${n}`);r&&(r.classList.remove("hidden"),Ab(n)),ig(n),t&&t.classList.add("expanded")}async function Ab(n){n==="rank"?ko():n==="error"?Kn():(n==="telop"||n==="maintenance")&&typeof window.renderMaintenanceStatus=="function"&&window.renderMaintenanceStatus()}function Sb(){const n=console.error;console.error=(...e)=>{n.apply(console,e);const t=e.map(s=>typeof s=="object"?JSON.stringify(s,null,2):String(s)).join(" "),r=new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit",second:"2-digit"});window.errorLog.unshift({time:r,msg:t}),window.errorLog.length>Ta&&window.errorLog.pop(),Kn(),va()},window.addEventListener("error",e=>{const t=new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit",second:"2-digit"});window.errorLog.unshift({time:t,msg:e.message||"Unknown error"}),window.errorLog.length>Ta&&window.errorLog.pop(),Kn(),va()}),window.addEventListener("unhandledrejection",e=>{const t=new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit",second:"2-digit"});window.errorLog.unshift({time:t,msg:String(e.reason)}),window.errorLog.length>Ta&&window.errorLog.pop(),Kn(),va()})}function Kn(){const n=document.querySelectorAll(".js-error-content");if(n.length===0)return;const e=document.createDocumentFragment();if(!window.errorLog||window.errorLog.length===0){const t=document.createElement("div");t.className="text-center u-text-sm text-gray-500 mt-10",t.textContent="現在エラーはありません",e.appendChild(t)}else window.errorLog.forEach(t=>{const r=ct("appnav-error-item-template");if(r){const s=r.querySelector(".appnav-error-time"),i=r.querySelector(".error-msg");s&&(s.textContent=t.time),i&&(i.textContent=t.msg),e.appendChild(r)}});n.forEach(t=>{t&&(t.innerHTML="",t.appendChild(e.cloneNode(!0)))})}function va(){typeof window.renderMaintenanceStatus=="function"&&window.renderMaintenanceStatus()}function $i(){const n=document.querySelector("#sidebar-panel-rank .appnav-area-carousel");if(!n)return;const e=document.querySelector("#sidebar-panel-rank .carousel-arrow-prev"),t=document.querySelector("#sidebar-panel-rank .carousel-arrow-next");if(!e||!t)return;const r=n.scrollLeft>2,s=n.scrollLeft+n.clientWidth<n.scrollWidth-2;n.scrollWidth>n.clientWidth+4?(e.classList.toggle("hidden",!r),t.classList.toggle("hidden",!s)):(e.classList.add("hidden"),t.classList.add("hidden"))}function ko(){const n=P.filterAccordion;if(!n)return;const e=G(),t=e.filter.rank||H.ALL;let r=n.querySelector(".appnav-filter-wrapper");if(!r){const p=ct("rank-filter-panel-template");p&&(n.innerHTML="",n.appendChild(p),r=n.querySelector(".appnav-filter-wrapper"))}if(!r)return;r.querySelectorAll(".appnav-rank-tab").forEach(p=>{const E=p.dataset.rank===t;p.classList.toggle("is-active",E)});const i=e.filter.clickStep===2,o=r.querySelector(".appnav-area-carousel-wrapper");o&&o.classList.toggle("hidden",!i);const c=r.querySelector(".area-grid-container");c&&i&&Ui(c);const l=r.querySelector(".appnav-area-carousel");l&&!l._hasScrollBound&&(l._hasScrollBound=!0,l.addEventListener("scroll",()=>{$i()},{passive:!0}));const h=r.querySelector(".carousel-arrow-prev");h&&!h._hasClickBound&&(h._hasClickBound=!0,h.addEventListener("click",p=>{p.stopPropagation(),l&&l.scrollBy({left:-l.clientWidth*.8,behavior:"smooth"})}));const d=r.querySelector(".carousel-arrow-next");d&&!d._hasClickBound&&(d._hasClickBound=!0,d.addEventListener("click",p=>{p.stopPropagation(),l&&l.scrollBy({left:l.clientWidth*.8,behavior:"smooth"})})),requestAnimationFrame(()=>{$i();const p=Po();p!=null&&p.classList.contains("is-floating")&&xi(p)})}window.addEventListener("filterChanged",()=>{ko()});const Cb=Object.freeze(Object.defineProperty({__proto__:null,checkAndNotify:is,closePanel:qe,filterMobsByRankAndArea:ug,handleAreaFilterClick:lg,handleRankTabClick:cg,initAppNav:hg,initNotification:og,playNotificationSound:Bi,renderAreaFilterPanel:Ui,sendBrowserNotification:ag,setActiveNavItem:mt,togglePanel:dg,updateCarouselArrows:$i,updateErrorPanel:Kn},Symbol.toStringTag,{value:"Module"})),Ia=new Map;function Nr(n){const e=n.repopInfo||{isMaintenanceStop:!1,isBlockedByMaintenance:!1,status:"Unknown"};return e.isMaintenanceStop||e.isBlockedByMaintenance?"MAINTENANCE":e.status==="MaxOver"?"MAX_OVER":e.status==="PopWindow"||e.status==="ConditionActive"||e.status==="NextCondition"?"WINDOW":"NEXT"}const bb={MAX_OVER:"Over",WINDOW:"Open",NEXT:"Cooldown",MAINTENANCE:"Maintenance"};let cc=-1,lc=null,Mr=null,Fn=null,os=!1;const uc=new Map;function fg(n){const e=n.repopInfo;return[(e==null?void 0:e.status)??"Unknown",!!(e!=null&&e.isMaintenanceStop),!!(e!=null&&e.isBlockedByMaintenance),!!(e!=null&&e.isInConditionWindow),Math.floor((e==null?void 0:e.elapsedPercent)||0),(e==null?void 0:e.minRepop)||0,(e==null?void 0:e.maxRepop)||0,n.rank,n.ExpansionId??"",n.No].join("|")}function Hi(n){const e=fg(n),t=uc.get(n.No);return t===void 0?(uc.set(n.No,e),!1):t!==e}function Rb(n){for(const e of n)uc.set(e.No,fg(e))}function pg(){const n=G(),e=n._filterVersion||0;return cc===e&&lc===n.mobs&&Mr||(cc=e,lc=n.mobs,Mr=ug(n.mobs),os=!1),Mr}function Pb(){return os&&Fn||(Fn=pg().slice().sort(kb),os=!0),Fn}function kd(){cc=-1,lc=null,Mr=null,Fn=null,os=!1}function hc(){os=!1,Fn=null}function Ws(n){switch(n){case H.S:return 0;case H.A:return 1;case H.F:return 2;default:return 99}}function Rn(n){if(Ia.has(n))return Ia.get(n);const e=String(n).padStart(5,"0"),t={mobNo:parseInt(e.slice(1,4),10),instance:parseInt(e[4],10)};return Ia.set(n,t),t}function zs(n){return Math.floor(n.elapsedPercent||0)}function kb(n,e){const t=n.repopInfo||{status:"Unknown",isInConditionWindow:!1,maxRepop:0,minRepop:0,elapsedPercent:0,isMaintenanceStop:!1,isBlockedByMaintenance:!1},r=e.repopInfo||{status:"Unknown",isInConditionWindow:!1,maxRepop:0,minRepop:0,elapsedPercent:0,isMaintenanceStop:!1,isBlockedByMaintenance:!1},s=t.status,i=r.status,o=t.isMaintenanceStop||t.isBlockedByMaintenance,c=r.isMaintenanceStop||r.isBlockedByMaintenance;if(o&&!c)return 1;if(!o&&c)return-1;const l=s==="MaxOver",h=i==="MaxOver";if(l&&!h)return-1;if(!l&&h)return 1;if(l&&h){const x=t.isInConditionWindow,F=r.isInConditionWindow;if(n.rank!==H.A&&e.rank!==H.A){if(x&&!F)return-1;if(!x&&F)return 1;const y=t.maxRepop||0,T=r.maxRepop||0;if(y!==T)return y-T}const z=y=>y===H.S?0:y===H.F?1:y===H.A?2:99,ne=z(n.rank)-z(e.rank);if(ne!==0)return ne;if(n.ExpansionId!==e.ExpansionId&&n.ExpansionId!==void 0&&e.ExpansionId!==void 0)return e.ExpansionId-n.ExpansionId;const Q=Rn(n.No),w=Rn(e.No);return Q.instance!==w.instance?Q.instance-w.instance:Q.mobNo-w.mobNo}const d=!!t.isInConditionWindow,p=!!r.isInConditionWindow;if(d&&!p)return-1;if(!d&&p)return 1;const m=Nr(n);if((m==="NEXT"||m==="MAINTENANCE")&&m===Nr(e)){const x=t.minRepop||1/0,F=r.minRepop||1/0;if(x!==F)return x-F}if(Nr(n)==="WINDOW"&&Nr(e)==="WINDOW"){const x=zs(t),F=zs(r);if(x!==F)return F-x;const z=Ws(n.rank)-Ws(e.rank);if(z!==0)return z;if(n.ExpansionId!==e.ExpansionId&&n.ExpansionId!==void 0&&e.ExpansionId!==void 0)return e.ExpansionId-n.ExpansionId;const ne=Rn(n.No),Q=Rn(e.No);return ne.instance!==Q.instance?ne.instance-Q.instance:ne.mobNo-Q.mobNo}const E=zs(t),A=zs(r);if(E!==A)return A-E;const N=Ws(n.rank)-Ws(e.rank);if(N!==0)return N;if(n.ExpansionId!==e.ExpansionId&&n.ExpansionId!==void 0&&e.ExpansionId!==void 0)return e.ExpansionId-n.ExpansionId;const R=Rn(n.No),O=Rn(e.No);return R.instance!==O.instance?R.instance-O.instance:R.mobNo-O.mobNo}const mn=new Map,oi=new Set,Nb={"color-b1":"color-b1-culled","color-b2":"color-b2-culled"},Mb={"color-b1-culled":"color-b1","color-b2-culled":"color-b2"};let ji=!1,Aa=0,Sa=null,Nd=!1,Lr=null;function Md(){const n=document.createElement("div");n.style.cssText="position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;scrollbar-width:thin;",document.body.appendChild(n);const e=n.offsetWidth-n.clientWidth;n.remove(),document.documentElement.style.setProperty("--sbw",`${e}px`)}let Ld=!1;async function Dd(){if(!(Ld||window.__theHuntInitialized)){Ld=!0,window.__theHuntInitialized=!0;try{Md(),window.addEventListener("resize",Xi(Md,200)),$b(),Hb(),wC(),e_(()=>{as(),dc()}),t_(),ab().then(()=>{TC(G().mobs)}),Qm().then(async n=>{if(n){Ed(n);const e=await xC(n);e&&e.lodestone_id?(qr(e.lodestone_id),e.character_name&&Wr(e.character_name),Vn(!0)):(Vn(!1),qr(null),Wr(null))}else Vn(!1),Ed(null),qr(null),Wr(null)}).catch(n=>{we(n,"Auth初期化失敗"),Vn(!1),window.dispatchEvent(new CustomEvent("initialDataLoaded"))}),ng(),tr(null),LC(),Kr(),as(),dc(),hg(),Bb(),Ub(),window.renderMaintenanceStatus=Kr,Lr=setTimeout(()=>{const n=P.loadingOverlay;n&&!n.classList.contains("hidden")&&(console.warn("Loading timeout: Forcing UI display."),G().initialLoadComplete||window.dispatchEvent(new CustomEvent("initialDataLoaded")),qi(),n.classList.add("hidden"),Gr("データ同期がタイムアウトしました。既存のデータで表示します。","info"))},Te.APP_LOAD_TIMEOUT)}catch(n){we(n,"アプリ初期化致命的エラー"),qi()}}}function qi(){P.colContainer&&requestAnimationFrame(()=>{P.colContainer.classList.add("is-ready"),requestAnimationFrame(()=>{const n=document.getElementById("loading-overlay");n&&n.classList.add("hidden")})})}async function Lb(){const e=G().maintenance;if(!e||!e.start||!e.end)return{is_active:!1,scheduled:!1,message:e?e.message:""};const t=new Date(be()),r=new Date(e.start),s=new Date(e.end),i=new Date(r.getTime()-Te.MAINTENANCE_SHOW_BEFORE_MS),o=new Date(s.getTime()+Te.MAINTENANCE_SHOW_AFTER_MS),c=t>=i&&t<=o,l={is_active:!1,scheduled:!1,start_time:e.start,end_time:e.end,message:e.message||""};return c&&(t>=r&&t<=s?l.is_active=!0:t<r&&(l.scheduled=!0)),l}async function Kr(){const n=G(),e=await Lb(),t=document.querySelectorAll(".js-maintenance-content"),r=document.querySelectorAll(".js-telop-content");let s=!1;e&&(e.is_active||e.scheduled)&&(s=!0),t.forEach(d=>{if(d.innerHTML="",!s){d.textContent="現在予定されているメンテナンスはありません";return}const p=Qr(e.start_time),m=e.end_time?Qr(e.end_time):"";d.textContent=m?`${p} ～ ${m}`:`${p} ～`});const i=e&&e.message&&e.message.trim()!==""?e.message:"",o=n.isVerified&&n.characterName?n.characterName:"名無しさん",c=document.getElementById("sidebar-welcome-area");if(c){c.textContent="";const d=document.createElement("div");d.className="sidebar-welcome-msg";const p=document.createElement("span");p.className="sidebar-welcome-name",p.textContent=o,d.appendChild(p),c.appendChild(d)}r.forEach(d=>{d.textContent="";const p=document.createElement("span");if(i){const m=Bm(i).split(/\/\/|<br>/i);m.forEach((E,A)=>{p.appendChild(document.createTextNode(E)),A<m.length-1&&p.appendChild(document.createElement("br"))})}else p.textContent="メッセージはありません。";d.appendChild(p)}),document.querySelectorAll('.appnav-btn[data-nav-id="maintenance"]').forEach(d=>d.classList.toggle("has-alert",s)),document.querySelectorAll('.appnav-btn[data-nav-id="telop"]').forEach(d=>d.classList.toggle("has-alert",n.hasUnreadTelop));const h=(window.errorLog?window.errorLog.length:0)>0;document.querySelectorAll('.appnav-btn[data-nav-id="error"]').forEach(d=>d.classList.toggle("has-alert",h)),document.querySelectorAll('.appnav-btn[data-nav-id="rank"]').forEach(d=>d.classList.remove("has-alert"))}let Ks=null,Od="",Vd="";const xd=175e3/60;let Ca=null;function dc(){Ca!==null&&clearTimeout(Ca);const n=be(),e=6e4-n%6e4,t=xd-n%xd,r=Math.min(e,t)+5;Ca=setTimeout(()=>{as(),dc()},r)}function as(){if(document.visibilityState==="hidden")return;const n=new Date(be()),e=s_(n),t=`${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`,r=`${e.hours}:${e.minutes}`;t===Od&&r===Vd||(Od=t,Vd=r,Ks||(Ks={lt:Array.from(document.querySelectorAll(".js-lt-clock")),et:Array.from(document.querySelectorAll(".js-et-clock"))}),Ks.lt.forEach(s=>{s.textContent!==t&&(s.textContent=t)}),Ks.et.forEach(s=>{s.textContent!==r&&(s.textContent=r)}))}function Vt(){return G().mobsMap}function mg(n=!0){const e=document.getElementById("moblist-container");if(!e)return;const t=window.innerHeight,r=Array.from(e.querySelectorAll(".moblist-item")),s=Vt(),i=r.map(l=>l.getBoundingClientRect()),o=new Set(oi);oi.clear();const c=[];r.forEach((l,h)=>{const d=i[h];if(d.bottom>-100&&d.top<t+100){const p=l.dataset.mobNo;if(oi.add(p),Al(l),!o.has(p)){const m=s.get(p);m&&c.push([l,m])}}}),n&&c.forEach(([l,h])=>gn(l,h))}const Il=Xi(()=>mg(),80);window.addEventListener("scroll",Il,{passive:!0});window.addEventListener("resize",Il,{passive:!0});const Fd=document.getElementById("moblist-container");Fd&&Fd.addEventListener("scroll",Il,{passive:!0});const Bd=new WeakMap;document.addEventListener("scroll",n=>{const e=n.target;e instanceof HTMLElement&&e.matches("#moblist-container, .mobcard-content")&&(e.classList.contains("is-scrolling")||e.classList.add("is-scrolling"),window.clearTimeout(Bd.get(e)),Bd.set(e,window.setTimeout(()=>e.classList.remove("is-scrolling"),120)))},{capture:!0,passive:!0});function Db(){const n=document.querySelector(".main-content-area");if(!n||n.__moblistBgWheelAttached)return;n.__moblistBgWheelAttached=!0;const e=.18;let t=0,r=0,s=null,i=0;const o=()=>{s!==null&&(cancelAnimationFrame(s),s=null)},c=h=>{const d=document.getElementById("moblist-container");if(!d){s=null;return}const p=i?Math.min(h-i,50):16.67;i=h;const m=r-t;if(Math.abs(m)<.5){t=r,d.scrollTop=t,s=null,i=0;return}t+=m*(1-Math.pow(1-e,p/16.67)),d.scrollTop=t,s=requestAnimationFrame(c)},l=document.getElementById("moblist-container");l&&(l.addEventListener("wheel",o,{passive:!0}),l.addEventListener("pointerdown",o,{passive:!0})),n.addEventListener("wheel",h=>{const d=h;if(d.defaultPrevented||d.deltaY===0||d.ctrlKey)return;const p=d.target instanceof Element?d.target:null;if(!p||p.closest("#manual-modal:not(.hidden), #report-modal:not(.hidden), #auth-modal:not(.hidden)"))return;const m=document.getElementById("moblist-container");if(!m||m.scrollHeight<=m.clientHeight||p.closest("#moblist-container")||p.closest(".mobcard-card"))return;const E=document.getElementById("mobcard-pane");if(E&&E.classList.contains("is-active")&&window.innerWidth<900&&p.closest("#mobcard-pane"))return;let A=d.deltaY;d.deltaMode===1?A*=16:d.deltaMode===2&&(A*=m.clientHeight),s===null&&(t=m.scrollTop,r=t);const N=m.scrollHeight-m.clientHeight;r=Math.max(0,Math.min(N,r+A)),s===null&&(i=0,s=requestAnimationFrame(c))},{passive:!0})}Db();function Al(n){if(n&&n.dataset.mobNo){const e=n.dataset.mobNo;let t=mn.get(e);t||(t=new Set,mn.set(e,t)),t.add(n)}}function gn(n,e){var l,h;const t=e.repopInfo||{};let r="";if(e.spawn_cull_status)for(const d in e.spawn_cull_status){const p=e.spawn_cull_status[d],m=((l=p.culled_at)==null?void 0:l.seconds)||0,E=((h=p.uncull_at)==null?void 0:h.seconds)||0,A=p.reporter_id||"";r+=`${d}:${m},${E},${A};`}const s=`${e.memo_updated_at||0}:${e.memo_text||""}`,i=`${t.status}|${t.timeRemaining}|${t.elapsedPercent}|${t.isInConditionWindow}|${r}|${s}|${G().lodestoneId||""}`;if(n._lastStateHash===i)return;n._lastStateHash=i;const o=n.classList.contains("mobcard-card"),c=n.classList.contains("moblist-item");o?(ll(n,e),cl(n,e),ul(n,e),zm(n,e),qm(n,e),Wm(n,e)):c&&Km(n,e)}const Wi=function(){const n=Vt();for(const e of oi){const t=mn.get(e),r=n.get(e);t&&r&&t.forEach(s=>gn(s,r))}Bn(n)};function Bn(n){const e=P.pcRightDetail||document.getElementById("mobcard-detail");if(!e||e.offsetParent===null)return;if(e.dataset.renderedMobNo&&e.dataset.renderedMobNo!=="none"){const r=e.firstElementChild,s=n.get(e.dataset.renderedMobNo);r&&s&&gn(r,s)}const t=P.mobileDetailOverlay||document.getElementById("mobcard-overlay");if(t&&t.offsetParent!==null&&t.dataset.renderedMobNo&&t.dataset.renderedMobNo!=="none"){const r=t.querySelector(".mobcard-card"),s=n.get(t.dataset.renderedMobNo);r&&s&&gn(r,s)}}const Ob=Xi(()=>{zi({immediate:!0})},200),zi=(n={})=>{const{immediate:e=!1}=n;e?(()=>{nr(),ji&&(ji=!1,requestAnimationFrame(()=>{requestAnimationFrame(()=>{window.dispatchEvent(new CustomEvent("initialSortComplete"))})}))})():Ob()},Gs=new Set,Sl=function(){if(!P.pcLeftList)return;const n=Pb(),e={MAX_OVER:[],WINDOW:[],NEXT:[],MAINTENANCE:[]};n.forEach(o=>{e[Nr(o)].push(o)});const t=[],r=Array.from(P.pcLeftList.children),s=new Map;r.forEach(o=>{o.dataset.mobNo?s.set(`mob-${o.dataset.mobNo}`,o):o.dataset.groupKey&&s.set(`header-${o.dataset.groupKey}`,o)}),["MAX_OVER","WINDOW","NEXT","MAINTENANCE"].forEach(o=>{const c=e[o];if(o==="MAINTENANCE"&&c.length===0)return;const l=bb[o],h=`header-${o}`;let d=s.get(h);const p=Gs.has(o);if(!d){d=document.createElement("div"),d.className="moblist-group-header status-group-separator",d.dataset.groupKey=o,d.setAttribute("role","button"),d.setAttribute("tabindex","0"),d.title="クリックで折りたたみ / 展開";const E=document.createElement("span");E.className="status-group-label",E.textContent=l,d.appendChild(E);const A=document.createElement("span");A.className="status-group-count",d.appendChild(A);const N=document.createElement("span");N.className="status-group-toggle-icon",N.textContent="▼",d.appendChild(N);const R=()=>{Gs.has(o)?Gs.delete(o):Gs.add(o),Sl()};d.addEventListener("click",R),d.addEventListener("keydown",O=>{(O.key==="Enter"||O.key===" ")&&(O.preventDefault(),R())})}d.classList.toggle("is-collapsed",p);const m=d.querySelector(".status-group-count");m&&(m.textContent=String(c.length)),t.push(d),p||c.forEach(E=>{const A=`mob-${E.No}`;let N=s.get(A);N||(N=jm(E)),N.dataset.groupKey=o,t.push(N)})});for(let o=0;o<t.length;o++){const c=t[o],l=P.pcLeftList.children[o];l!==c&&P.pcLeftList.insertBefore(c,l||null),c.dataset.mobNo&&Al(c)}for(;P.pcLeftList.children.length>t.length;)P.pcLeftList.removeChild(P.pcLeftList.lastChild);Rb(n)};function gg(){const n=document.getElementById("mobcard-detail"),e=document.getElementById("mobcard-pane");if(!n||!e)return;const t=G().openMobCardNo;if(t){let r=null;if(n.dataset.renderedMobNo!==String(t)){const s=G().mobs.find(i=>i.No===t);if(s){n.innerHTML="";const i=RC(s,!0);n.appendChild(i),Al(i),n.dataset.renderedMobNo=String(t),r=i}}else r=n.querySelector(".mobcard-card");r&&r.classList.add("is-open"),e.classList.add("is-active"),window.innerWidth<1024&&document.body.classList.add("body-lock")}else{const r=n.querySelector(".mobcard-card");r&&r.classList.remove("is-open"),n.dataset.renderedMobNo!=="none"&&(n.innerHTML=window.innerWidth>=1024?'<div class="text-center text-gray-500 mt-20 text-sm">モブを選択すると詳細が表示されます</div>':"",n.dataset.renderedMobNo="none"),e.classList.remove("is-active"),document.body.classList.remove("body-lock")}}function Ki(){G().initialLoadComplete&&(gg(),Bn(Vt()))}function nr(n={}){const{isInitialLoad:e=!1}=n;if(!G().initialLoadComplete&&!e)return;e&&(ji=!0);const r=document.activeElement;let s=null,i=null,o=null,c=null;if(r&&r.closest(".mobcard-card, .moblist-item")&&(s=r.closest(".mobcard-card, .moblist-item").dataset.mobNo||null,(r.tagName==="INPUT"||r.tagName==="TEXTAREA")&&(i=r.dataset.action||null,o=r.selectionStart,c=r.selectionEnd)),P.pcLeftList&&Sl(),gg(),e){ji=!1;const l=document.getElementById("loading-overlay");l&&l.classList.add("hidden")}if(mg(!1),Wi(),s){const l=mn.get(String(s));if(l&&i)for(const h of l){const d=h.querySelector(`input[data-action="${i}"], textarea[data-action="${i}"]`);if(d){if(d.focus(),o!==null&&c!==null)try{d.setSelectionRange(o,c)}catch{}break}}}}let fc=0,ai=0;const Vb=125,Ud=100,Gi=function(n=!1){if(document.visibilityState==="hidden"&&!n)return;const e=G(),t=Date.now(),r=be()/1e3,s=n||t-fc>=Te.TIER_B_UPDATE_INTERVAL-Ud,i=n||t-ai>=Kd-Ud;if(!s&&!i)return;const o=pg();let c=!1;s?(o.forEach(l=>{const h=l.repopInfo;!h||h.status==="Maintenance"||($d(l,r,e),Hi(l)&&(c=!0),is(l))}),fc=t,ai=t):(o.forEach(l=>{const h=l.repopInfo;if(!h||h.status==="Maintenance")return;const d=h.nextBoundarySec||h.maxRepop||0;d&&d-r<=Vb&&($d(l,r,e),Hi(l)&&(c=!0),is(l))}),ai=t),c&&(hc(),Sl()),document.visibilityState==="visible"&&Wi()},$d=function(n,e,t){const r=n.repopInfo;if(!r)return!1;let s=!1;const i=r.status;if(r.nextBoundarySec&&e>=r.nextBoundarySec||r.maxRepop&&e>=r.maxRepop&&r.status!=="MaxOver"||r.minRepop&&e>=r.minRepop&&r.status==="Next")n.repopInfo=Yi(n,t.maintenance),s=!0;else if(r.maxRepop&&e>=r.maxRepop)r.status="MaxOver",r.elapsedPercent=100,r.timeRemaining=ci(e-r.maxRepop);else{const c=r.nextBoundarySec||r.maxRepop||0;if(r.timeRemaining=ci(Math.max(0,c-e)),r.minRepop&&r.maxRepop){const l=r.maxRepop-r.minRepop;r.elapsedPercent=l<=0||e<r.minRepop?0:Math.min(100,(e-r.minRepop)/l*100)}}return i!==n.repopInfo.status&&(s=!0),ib(n,e),s};function Gr(n,e="error"){e==="error"&&console.error(n);let t=document.getElementById("toast-container");t||(t=document.createElement("div"),t.id="toast-container",t.className="toast-container-wrapper",document.body.appendChild(t));const r=document.createElement("div"),s=e==="error"?"toast-error":e==="success"?"toast-success":"toast-info";r.className=`toast-item-base ${s} opacity-0 translate-x-full whitespace-pre-wrap`,r.textContent=n,t.appendChild(r),requestAnimationFrame(()=>{requestAnimationFrame(()=>{r.classList.remove("translate-x-full","opacity-0")})}),setTimeout(()=>{r.classList.add("translate-x-full","opacity-0");const i=()=>{r.parentElement&&r.remove()};r.addEventListener("transitionend",i,{once:!0}),setTimeout(i,500)},Te.TOAST_DURATION)}function _g(n){n.success?Gr("討伐報告を送信しました","success"):n.code==="permission-denied"||n.error&&n.error.includes("permission")?(Gr(`アクセス権限エラーが発生しました。
再度認証を行ってください。`,"error"),Io()):Gr("報告エラー: "+(n.error||"不明なエラー"),"error")}async function xb(n){const e=await Xm(n,new Date(be()).toISOString());_g(e)}async function Fb(n){n.preventDefault();const e=n.target,t=parseInt(e.dataset.mobNo,10),r=e.elements.namedItem("kill-time").value,s=await Xm(t,r);_g(s),s.success&&jr()}function Hd(n,e){if(n.dataset.isCulled=String(e),e){for(const[t,r]of Object.entries(Nb))if(n.classList.contains(t)){n.classList.replace(t,r);break}}else for(const[t,r]of Object.entries(Mb))if(n.classList.contains(t)){n.classList.replace(t,r);break}}function jd(n,e,t,r){const s=G(),i=n%10,o=`${e}_${i}`;s.mobLocations||(s.mobLocations={}),s.mobLocations[o]||(s.mobLocations[o]={}),s.mobLocations[o][t]||(s.mobLocations[o][t]={});const c=be(),l={toMillis:()=>c,seconds:Math.floor(c/1e3)};r?s.mobLocations[o][t].culled_at=l:s.mobLocations[o][t].uncull_at=l,s.mobLocations[o][t].reporter_id=s.lodestoneId,s.mobs.forEach(h=>{h.area===e&&h.No%10===i&&(h.spawn_cull_status=s.mobLocations[o])}),window.dispatchEvent(new CustomEvent("locationsUpdated",{detail:{locationsMap:s.mobLocations}}))}function ba(n){const e=n.target,t=e.closest(".spawn-point");if(!t)return;const r=G();if(!r.isVerified){Io();return}if(t.dataset.isInteractive!=="true"||t.dataset.isLastone==="true")return;const s=e.closest(".mobcard-card");if(!s)return;n.preventDefault(),n.stopPropagation();const i=parseInt(s.dataset.mobNo,10),o=r.mobs.find(m=>m.No===i);if(!o)return;const c=t.dataset.locationId,l=o.area;if(window.matchMedia("(hover: none)").matches){const m=Date.now(),E=m-Aa;if(c===Sa&&E<Te.CLICK_THRESHOLD)Aa=0,Sa=null;else{Aa=m,Sa=c;return}}const p=!(t.dataset.isCulled==="true");Hd(t,p),jd(i,l,c,p),qC(i,l,c,p).then(m=>{m!=null&&m.success||(Hd(t,!p),jd(i,l,c,!p))})}function Bb(){if(Nd)return;const n=document.getElementById("moblist-container");n&&n.addEventListener("click",ba);const e=document.getElementById("mobcard-detail");e&&e.addEventListener("click",ba);const t=document.getElementById("mobcard-overlay");t&&t.addEventListener("click",ba),Nd=!0}function Ub(){let n=window.innerWidth;window.addEventListener("resize",Xi(()=>{const t=window.innerWidth;n>=Te.BREAKPOINT_PC!=t>=Te.BREAKPOINT_PC&&(n=t,zi())},Te.DEBOUNCE_DELAY)),document.body.addEventListener("click",t=>{const r=t.target,s=r.closest(".appnav-btn[data-nav-id]");if(s){const o=s.dataset.navId;if(o==="notify")return;if(t.preventDefault(),t.stopPropagation(),o==="home"){qe();const c=document.getElementById("moblist-container");c&&c.scrollTo({top:0,behavior:"smooth"}),mt("home")}else dg(o);return}if(r.closest(".area-filter-btn")){t.stopPropagation(),lg(t);return}if(r.closest(".appnav-logo")){window.location.reload();return}r===P.cardOverlayBackdrop&&(tr(null),Ki())}),P.reportForm&&P.reportForm.addEventListener("submit",Fb),document.body.addEventListener("input",t=>{const r=t.target;(r.classList.contains("mobcard-memo-input")||r.matches("[data-action='save-memo']"))&&hl(r)}),document.body.addEventListener("change",async t=>{const r=t.target;if(r.classList.contains("mobcard-memo-input")||r.matches("[data-action='save-memo']")){const s=parseInt(r.dataset.mobNo,10),i=r.value.replace(/[\r\n]/g,"").trim();if(!isNaN(s)){if(!G().isVerified){r.value="",Io();return}const o=Vt(),c=o==null?void 0:o.get(String(s));if(c){c.memo_text=i,c.memo_updated_at=Math.floor(be()/1e3);const l=mn.get(String(s));l&&l.forEach(h=>gn(h,c))}await jC(s,i)}}}),document.body.addEventListener("keydown",t=>{const r=t.target;(r.classList.contains("mobcard-memo-input")||r.matches("[data-action='save-memo']"))&&t.key==="Enter"&&!t.isComposing&&r.blur()});let e=0;document.body.addEventListener("touchstart",t=>{t.target.closest(".report-side-bar")&&(e=t.changedTouches[0].screenX)},{passive:!0}),document.body.addEventListener("touchend",t=>{const s=t.target.closest(".report-side-bar");if(s&&t.changedTouches[0].screenX-e>30){const o=parseInt(s.dataset.mobNo,10);s.dataset.reportType==="modal"?Gm(o):s.click()}},{passive:!0})}function $b(){window.addEventListener("maintenanceUpdated",()=>Kr()),window.addEventListener("pageshow",n=>{n.persisted&&(tr(null),document.querySelectorAll(".appnav-rank-item.appnav-active").forEach(e=>e.classList.remove("appnav-active")))}),window.addEventListener("initialDataLoaded",()=>{Lr&&clearTimeout(Lr);try{Kr(),Kn(),as(),nr({isInitialLoad:!0}),fc=0,ai=0,Gi(),qi(),!localStorage.getItem("has_visited")&&(localStorage.setItem("has_visited","true"),window.openUserManual&&window.openUserManual())}catch(n){console.error("初期ロード処理失敗:",n),qi()}},{once:!0}),window.addEventListener("criticalDataLoadError",n=>{Lr&&clearTimeout(Lr);const e=P.loadingOverlay;if(e){const t=e.querySelector(".loading-spinner");t&&t.classList.add("u-hidden");const r=e.querySelector(".loading-text");r&&(r.classList.add("u-pre-wrap","u-text-error"),r.textContent=n.detail.message)}},{once:!0}),window.addEventListener("characterNameSet",()=>Kr()),window.addEventListener("mobsBatchUpdated",n=>{const{mobNos:e}=n.detail,t=Vt();if(!t)return;let r=!1;e.forEach(s=>{const i=t.get(String(s));if(!i)return;is(i);const o=mn.get(String(s));o&&o.forEach(c=>gn(c,i)),Hi(i)&&(r=!0)}),Bn(t),r&&(hc(),zi())}),window.addEventListener("mobUpdated",n=>{const{mobNo:e,mob:t}=n.detail,r=Vt();if(!r)return;const s=mn.get(String(e));s&&s.forEach(i=>gn(i,t)),Bn(r),Hi(t)&&(hc(),zi())}),window.addEventListener("filterChanged",()=>{kd(),nr()}),window.addEventListener("mobsUpdated",()=>Gi()),window.addEventListener("locationDataReady",()=>{Wi();const n=Vt();n&&Bn(n)}),window.addEventListener("locationsUpdated",()=>{kd(),Wi();const n=Vt();n&&Bn(n)}),window.addEventListener("appNotify",n=>{const{message:e,type:t}=n.detail;Gr(e,t)})}function Hb(){[document.getElementById("moblist-container"),document.getElementById("mobcard-detail")].filter(Boolean).forEach(t=>t.addEventListener("click",jb));const e=document.getElementById("mobcard-pane");e&&e.addEventListener("click",t=>{qe(),t.target===e&&window.innerWidth<Te.BREAKPOINT_PC&&(tr(null),Ki())})}function jb(n){const e=n.target,t=e.closest(".moblist-item, .mobcard-card");if(!t)return;const r=parseInt(t.dataset.mobNo,10),s=G().mobs.find(o=>o.No===r);if(!s)return;const i=e.closest(".moblist-report-btn");if(i){if(n.preventDefault(),n.stopPropagation(),!G().isVerified){Io();return}(i.dataset.reportType||(s.rank==="A"?"instant":"modal"))==="modal"?Gm(r):xb(r);return}if(e.closest('[data-action="close-card"]')){n.stopPropagation(),qe(),tr(null),Ki();return}if(e.closest(".moblist-item")||e.classList.contains("mobcard-card")){qe();const o=G().openMobCardNo;tr(o===r?null:r),Ki()}}window.appInterval&&clearInterval(window.appInterval);window.appInterval=setInterval(()=>{document.visibilityState!=="hidden"&&Gi()},Kd);document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(as(),Gi(!0))});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Dd):queueMicrotask(Dd);
//# sourceMappingURL=index-LJpRBSo8.js.map
