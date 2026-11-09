import{c as s,aE as a}from"./index-CKxXmFVE.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]],f=s("Briefcase",c),y="/why-orbit",r="orbit.storyReturn",i=1e3*60*60*6;function u(){try{const t=sessionStorage.getItem(r);if(!t)return null;const e=JSON.parse(t);return typeof(e==null?void 0:e.path)!="string"||typeof e.scrollY!="number"||Date.now()-(e.at??0)>i?null:e}catch{return null}}function o(t){try{t?sessionStorage.setItem(r,JSON.stringify(t)):sessionStorage.removeItem(r)}catch{}}const h=a(t=>({ret:u(),save:e=>{const n={...e,at:Date.now()};o(n),t({ret:n})},clear:()=>{o(null),t({ret:null})}}));export{f as B,y as S,h as u};
