!function(e){self.webpackChunk=function(n,r){for(var o in r)e[o]=r[o];for(;n.length;)t[n.pop()]=1};var n={},t={2:1},r={};var o={7:function(){return{"./julia_wasm":{__wbindgen_throw:function(e,t){return n[8].exports.__wbindgen_throw(e,t)}}}}};function i(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.e=function(e){var n=[];return n.push(Promise.resolve().then(function(){t[e]||importScripts(({0:"workerCore"}[e]||e)+"."+{0:"f1a9175dea2e982aecbf"}[e]+".js")})),({0:[7]}[e]||[]).forEach(function(e){var t=r[e];if(t)n.push(t);else{var u,a=o[e](),s=fetch(i.p+""+{7:"812fa624c1f796acd705"}[e]+".module.wasm");if(a instanceof Promise&&"function"==typeof WebAssembly.compileStreaming)u=Promise.all([WebAssembly.compileStreaming(s),a]).then(function(e){return WebAssembly.instantiate(e[0],e[1])});else if("function"==typeof WebAssembly.instantiateStreaming)u=WebAssembly.instantiateStreaming(s,a);else{u=s.then(function(e){return e.arrayBuffer()}).then(function(e){return WebAssembly.instantiate(e,a)})}n.push(r[e]=u.then(function(n){return i.w[e]=(n.instance||n).exports}))}}),Promise.all(n)},i.m=e,i.c=n,i.d=function(e,n,t){i.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,n){if(1&n&&(e=i(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(i.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)i.d(t,r,function(n){return e[n]}.bind(null,r));return t},i.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(n,"a",n),n},i.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},i.p="",i.w={},i(i.s=5)}({5:function(e,n,t){var r=this&&this.__awaiter||function(e,n,t,r){return new(t||(t=Promise))(function(o,i){function u(e){try{s(r.next(e))}catch(e){i(e)}}function a(e){try{s(r.throw(e))}catch(e){i(e)}}function s(e){e.done?o(e.value):new t(function(n){n(e.value)}).then(u,a)}s((r=r.apply(e,n||[])).next())})};let o=null,i=[],u=null;const a=new Promise(e=>o=e),s=t.e(0).then(t.bind(null,6));(()=>r(this,void 0,void 0,function*(){const e=(yield s).WorkerCore,n=yield a;u=new e(n),i.forEach(e=>u.onmessage(e)),i=[]}))().catch(e=>{postMessage({type:"startup-failure",err:""+e}),setTimeout(()=>{throw e},0)}),onmessage=(e=>{const n=e.data;"worker-init"===n.type?o&&(o(n),o=null):u?u.onmessage(n):i.push(n)})}});
//# sourceMappingURL=worker.5c4e1de69a3dfedb50a4.js.map