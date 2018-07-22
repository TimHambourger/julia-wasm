self.webpackChunk([0],[function(e,t,n){"use strict";n.r(t),n.d(t,"MemoryPool",function(){return r});class r{constructor(e){this.byteLength=e,this.stack=[]}push(e){if(e.byteLength<this.byteLength)throw new Error(`Can't absorb buffer. byteLength must be at least ${this.byteLength}`);this.stack.push(e)}pushAll(e){for(let t=0;t<e.length;t++)this.push(e[t])}acquire(){return this.stack.pop()||new ArrayBuffer(this.byteLength)}drain(){const e=this.stack;return this.stack=[],e}}},,,,,,function(e,t,n){"use strict";n.r(t),n.d(t,"WorkerCore",function(){return u});var r=n(0),s=n(8),i=n(7);class u{constructor(e){const{chunkSizePx:{width:t,height:n}}=e.worker,u=t*n,o=s.Buffer.new(u);this.workerConfig=e.worker,this.pool=new r.MemoryPool(2*u),this.output={buffer:o,view:new Uint16Array(i.memory.buffer,o.as_ptr(),u)},this.runner=null,this.dataGen=null,this.resumeTimeout=null,this.pendingMessages=[]}onmessage(e){this.pendingMessages.push(e),this.setAlarm()}setAlarm(){null!==this.resumeTimeout&&clearTimeout(this.resumeTimeout),this.resumeTimeout=setTimeout(()=>{this.processMessages(),this.runJobs()})}processMessages(){this.pendingMessages.sort((e,t)=>t.seqNo-e.seqNo);const e=this.pendingMessages.findIndex(e=>"worker-reset"===e.type),t=e>=0?this.pendingMessages[e]:null,n=e>=0?this.pendingMessages.slice(0,e):this.pendingMessages;if(t){if("worker-reset"!==t.type)throw new Error(`Unexpected reset msg type: ${t.type}`);this.reset(t)}n.reverse(),n.forEach(e=>{if("worker-reset"===e.type)throw new Error(`Unexpected msg type: ${e.type}`);this.addJobs(e)}),this.pendingMessages=[]}reset(e){this.runner&&this.runner.free(),this.runner=s.EscapeTimeRunner.new(s.EscapeTime.new(e.escapeTime.c.re,e.escapeTime.c.im,e.escapeTime.maxIter,e.escapeTime.escapeRadius),s.Canvas.new(this.workerConfig.chunkSizePx.width,this.workerConfig.chunkSizePx.height,e.canvas.chunkDelta.re,e.canvas.chunkDelta.im,e.canvas.origin.re,e.canvas.origin.im)),this.dataGen=e.dataGen}addJobs(e){this.runner&&e.jobs.forEach(e=>{this.runner.push_job(s.CanvasRect.new(e.topLeft.re,e.topLeft.im,e.widthChunks,e.heightChunks))}),e.buffers&&this.pool.pushAll(e.buffers)}runJobs(){if(!this.runner||null===this.dataGen)return;const e=performance.now();let t=!1;for(;!(t=performance.now()-e>=this.workerConfig.pauseInterval)&&this.runner.advance();){this.runner.load(this.output.buffer);const e={re:this.runner.current_re(),im:this.runner.current_im()},t=this.pool.acquire(),n=new Uint16Array(t);for(let e=0;e<n.length&&e<this.output.view.length;e++)n[e]=this.output.view[e];const r={type:"chunk-update",chunkId:e,dataGen:this.dataGen,data:t};postMessage(r,[t])}t&&this.setAlarm()}}},function(e,t,n){"use strict";var r=n.w[e.i];for(var s in n.r(t),r)"__webpack_init__"!=s&&(t[s]=r[s]);n(8);r.__webpack_init__()},function(e,t,n){"use strict";n.r(t),n.d(t,"Buffer",function(){return s}),n.d(t,"EscapeTime",function(){return i}),n.d(t,"EscapeTimeRunner",function(){return u}),n.d(t,"Canvas",function(){return o}),n.d(t,"CanvasRect",function(){return c}),n.d(t,"__wbindgen_object_clone_ref",function(){return l}),n.d(t,"__wbindgen_object_drop_ref",function(){return d}),n.d(t,"__wbindgen_string_new",function(){return y}),n.d(t,"__wbindgen_number_new",function(){return k}),n.d(t,"__wbindgen_number_get",function(){return v}),n.d(t,"__wbindgen_undefined_new",function(){return T}),n.d(t,"__wbindgen_null_new",function(){return C}),n.d(t,"__wbindgen_is_null",function(){return M}),n.d(t,"__wbindgen_is_undefined",function(){return E}),n.d(t,"__wbindgen_boolean_new",function(){return A}),n.d(t,"__wbindgen_boolean_get",function(){return x}),n.d(t,"__wbindgen_symbol_new",function(){return j}),n.d(t,"__wbindgen_is_symbol",function(){return L}),n.d(t,"__wbindgen_string_get",function(){return P}),n.d(t,"__wbindgen_throw",function(){return R});var r=n(7);class s{static __construct(e){return new s(e)}constructor(e){this.ptr=e}free(){const e=this.ptr;this.ptr=0,r.__wbg_buffer_free(e)}static new(e){return s.__construct(r.buffer_new(e))}as_ptr(){return r.buffer_as_ptr(this.ptr)}}class i{static __construct(e){return new i(e)}constructor(e){this.ptr=e}free(){const e=this.ptr;this.ptr=0,r.__wbg_escapetime_free(e)}static new(e,t,n,s){return i.__construct(r.escapetime_new(e,t,n,s))}}class u{static __construct(e){return new u(e)}constructor(e){this.ptr=e}free(){const e=this.ptr;this.ptr=0,r.__wbg_escapetimerunner_free(e)}static new(e,t){const n=e.ptr;e.ptr=0;const s=t.ptr;return t.ptr=0,u.__construct(r.escapetimerunner_new(n,s))}push_job(e){const t=e.ptr;return e.ptr=0,r.escapetimerunner_push_job(this.ptr,t)}advance(){return 0!==r.escapetimerunner_advance(this.ptr)}current_re(){return r.escapetimerunner_current_re(this.ptr)}current_im(){return r.escapetimerunner_current_im(this.ptr)}load(e){return r.escapetimerunner_load(this.ptr,e.ptr)}}class o{static __construct(e){return new o(e)}constructor(e){this.ptr=e}free(){const e=this.ptr;this.ptr=0,r.__wbg_canvas_free(e)}static new(e,t,n,s,i,u){return o.__construct(r.canvas_new(e,t,n,s,i,u))}}class c{static __construct(e){return new c(e)}constructor(e){this.ptr=e}free(){const e=this.ptr;this.ptr=0,r.__wbg_canvasrect_free(e)}static new(e,t,n,s){return c.__construct(r.canvasrect_new(e,t,n,s))}}let a=[],_=0;function f(e){_===a.length&&a.push(a.length+1);const t=_,n=a[t];return _=n,a[t]={obj:e,cnt:1},t<<1}let h=[];function p(e){if(1==(1&e))return h[e>>1];return a[e>>1].obj}function l(e){if(1==(1&e))return f(p(e));return a[e>>1].cnt+=1,e}function d(e){!function(e){let t=a[e>>1];t.cnt-=1,t.cnt>0||(a[e>>1]=_,_=e>>1)}(e)}let w=new TextDecoder("utf-8"),b=null;function g(){return null!==b&&b.buffer===r.memory.buffer||(b=new Uint8Array(r.memory.buffer)),b}function m(e,t){return w.decode(g().subarray(e,e+t))}function y(e,t){return f(m(e,t))}function k(e){return f(e)}function v(e,t){let n=p(e);return"number"==typeof n?n:(g()[t]=1,0)}function T(){return f(void 0)}function C(){return f(null)}function M(e){return null===p(e)?1:0}function E(e){return void 0===p(e)?1:0}function A(e){return f(1===e)}function x(e){let t=p(e);return"boolean"==typeof t?t?1:0:2}function j(e,t){let n;return f(n=0===e?Symbol():Symbol(m(e,t)))}function L(e){return"symbol"==typeof p(e)?1:0}let G=new TextEncoder("utf-8");let U=null;function P(e,t){let n=p(e);if("string"!=typeof n)return 0;const[s,i]=function(e){const t=G.encode(e),n=r.__wbindgen_malloc(t.length);return g().set(t,n),[n,t.length]}(n);return(null!==U&&U.buffer===r.memory.buffer||(U=new Uint32Array(r.memory.buffer)),U)[t/4]=i,s}function R(e,t){throw new Error(m(e,t))}}]);
//# sourceMappingURL=workerCore.f1a9175dea2e982aecbf.js.map