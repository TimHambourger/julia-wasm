/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main/index.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/classnames/index.js":
/*!******************************************!*\
  !*** ./node_modules/classnames/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return classNames;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}());


/***/ }),

/***/ "./node_modules/s-js/dist/es/S.js":
/*!****************************************!*\
  !*** ./node_modules/s-js/dist/es/S.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// Public interface
var S = function S(fn, value) {
    var owner = Owner, running = RunningNode;
    if (owner === null)
        console.warn("computations created without a root or parent will never be disposed");
    var node = new ComputationNode(fn, value);
    Owner = RunningNode = node;
    if (RunningClock === null) {
        toplevelComputation(node);
    }
    else {
        node.value = node.fn(node.value);
    }
    if (owner && owner !== UNOWNED) {
        if (owner.owned === null)
            owner.owned = [node];
        else
            owner.owned.push(node);
    }
    Owner = owner;
    RunningNode = running;
    return function computation() {
        if (RunningNode !== null) {
            if (node.age === RootClock.time) {
                if (node.state === RUNNING)
                    throw new Error("circular dependency");
                else
                    updateNode(node); // checks for state === STALE internally, so don't need to check here
            }
            logComputationRead(node, RunningNode);
        }
        return node.value;
    };
};
// compatibility with commonjs systems that expect default export to be at require('s.js').default rather than just require('s-js')
Object.defineProperty(S, 'default', { value: S });
/* harmony default export */ __webpack_exports__["default"] = (S);
S.root = function root(fn) {
    var owner = Owner, root = fn.length === 0 ? UNOWNED : new ComputationNode(null, null), result = undefined, disposer = fn.length === 0 ? null : function _dispose() {
        if (RunningClock !== null) {
            RootClock.disposes.add(root);
        }
        else {
            dispose(root);
        }
    };
    Owner = root;
    if (RunningClock === null) {
        result = topLevelRoot(fn, disposer, owner);
    }
    else {
        result = disposer === null ? fn() : fn(disposer);
        Owner = owner;
    }
    return result;
};
function topLevelRoot(fn, disposer, owner) {
    try {
        return disposer === null ? fn() : fn(disposer);
    }
    finally {
        Owner = owner;
    }
}
S.on = function on(ev, fn, seed, onchanges) {
    if (Array.isArray(ev))
        ev = callAll(ev);
    onchanges = !!onchanges;
    return S(on, seed);
    function on(value) {
        var running = RunningNode;
        ev();
        if (onchanges)
            onchanges = false;
        else {
            RunningNode = null;
            value = fn(value);
            RunningNode = running;
        }
        return value;
    }
};
function callAll(ss) {
    return function all() {
        for (var i = 0; i < ss.length; i++)
            ss[i]();
    };
}
S.data = function data(value) {
    var node = new DataNode(value);
    return function data(value) {
        if (arguments.length > 0) {
            if (RunningClock !== null) {
                if (node.pending !== NOTPENDING) {
                    if (value !== node.pending) {
                        throw new Error("conflicting changes: " + value + " !== " + node.pending);
                    }
                }
                else {
                    node.pending = value;
                    RootClock.changes.add(node);
                }
            }
            else {
                if (node.log !== null) {
                    node.pending = value;
                    RootClock.changes.add(node);
                    event();
                }
                else {
                    node.value = value;
                }
            }
            return value;
        }
        else {
            if (RunningNode !== null) {
                logDataRead(node, RunningNode);
            }
            return node.value;
        }
    };
};
S.value = function value(current, eq) {
    var data = S.data(current), age = -1;
    return function value(update) {
        if (arguments.length === 0) {
            return data();
        }
        else {
            var same = eq ? eq(current, update) : current === update;
            if (!same) {
                var time = RootClock.time;
                if (age === time)
                    throw new Error("conflicting values: " + update + " is not the same as " + current);
                age = time;
                current = update;
                data(update);
            }
            return update;
        }
    };
};
S.freeze = function freeze(fn) {
    var result = undefined;
    if (RunningClock !== null) {
        result = fn();
    }
    else {
        RunningClock = RootClock;
        RunningClock.changes.reset();
        try {
            result = fn();
            event();
        }
        finally {
            RunningClock = null;
        }
    }
    return result;
};
S.sample = function sample(fn) {
    var result, running = RunningNode;
    if (running !== null) {
        RunningNode = null;
        result = fn();
        RunningNode = running;
    }
    else {
        result = fn();
    }
    return result;
};
S.cleanup = function cleanup(fn) {
    if (Owner !== null) {
        if (Owner.cleanups === null)
            Owner.cleanups = [fn];
        else
            Owner.cleanups.push(fn);
    }
    else {
        console.warn("cleanups created without a root or parent will never be run");
    }
};
// Internal implementation
/// Graph classes and operations
var Clock = /** @class */ (function () {
    function Clock() {
        this.time = 0;
        this.changes = new Queue(); // batched changes to data nodes
        this.updates = new Queue(); // computations to update
        this.disposes = new Queue(); // disposals to run after current batch of updates finishes
    }
    return Clock;
}());
var DataNode = /** @class */ (function () {
    function DataNode(value) {
        this.value = value;
        this.pending = NOTPENDING;
        this.log = null;
    }
    return DataNode;
}());
var ComputationNode = /** @class */ (function () {
    function ComputationNode(fn, value) {
        this.fn = fn;
        this.value = value;
        this.state = CURRENT;
        this.source1 = null;
        this.source1slot = 0;
        this.sources = null;
        this.sourceslots = null;
        this.log = null;
        this.owned = null;
        this.cleanups = null;
        this.age = RootClock.time;
    }
    return ComputationNode;
}());
var Log = /** @class */ (function () {
    function Log() {
        this.node1 = null;
        this.node1slot = 0;
        this.nodes = null;
        this.nodeslots = null;
    }
    return Log;
}());
var Queue = /** @class */ (function () {
    function Queue() {
        this.items = [];
        this.count = 0;
    }
    Queue.prototype.reset = function () {
        this.count = 0;
    };
    Queue.prototype.add = function (item) {
        this.items[this.count++] = item;
    };
    Queue.prototype.run = function (fn) {
        var items = this.items;
        for (var i = 0; i < this.count; i++) {
            fn(items[i]);
            items[i] = null;
        }
        this.count = 0;
    };
    return Queue;
}());
// Constants
var NOTPENDING = {}, CURRENT = 0, STALE = 1, RUNNING = 2;
// "Globals" used to keep track of current system state
var RootClock = new Clock(), RunningClock = null, // currently running clock 
RunningNode = null, // currently running computation
Owner = null, // owner for new computations
UNOWNED = new ComputationNode(null, null);
// Functions
function logRead(from, to) {
    var fromslot, toslot = to.source1 === null ? -1 : to.sources === null ? 0 : to.sources.length;
    if (from.node1 === null) {
        from.node1 = to;
        from.node1slot = toslot;
        fromslot = -1;
    }
    else if (from.nodes === null) {
        from.nodes = [to];
        from.nodeslots = [toslot];
        fromslot = 0;
    }
    else {
        fromslot = from.nodes.length;
        from.nodes.push(to);
        from.nodeslots.push(toslot);
    }
    if (to.source1 === null) {
        to.source1 = from;
        to.source1slot = fromslot;
    }
    else if (to.sources === null) {
        to.sources = [from];
        to.sourceslots = [fromslot];
    }
    else {
        to.sources.push(from);
        to.sourceslots.push(fromslot);
    }
}
function logDataRead(data, to) {
    if (data.log === null)
        data.log = new Log();
    logRead(data.log, to);
}
function logComputationRead(node, to) {
    if (node.log === null)
        node.log = new Log();
    logRead(node.log, to);
}
function event() {
    // b/c we might be under a top level S.root(), have to preserve current root
    var owner = Owner;
    RootClock.updates.reset();
    RootClock.time++;
    try {
        run(RootClock);
    }
    finally {
        RunningClock = RunningNode = null;
        Owner = owner;
    }
}
function toplevelComputation(node) {
    RunningClock = RootClock;
    RootClock.changes.reset();
    RootClock.updates.reset();
    try {
        node.value = node.fn(node.value);
        if (RootClock.changes.count > 0 || RootClock.updates.count > 0) {
            RootClock.time++;
            run(RootClock);
        }
    }
    finally {
        RunningClock = Owner = RunningNode = null;
    }
}
function run(clock) {
    var running = RunningClock, count = 0;
    RunningClock = clock;
    clock.disposes.reset();
    // for each batch ...
    while (clock.changes.count !== 0 || clock.updates.count !== 0 || clock.disposes.count !== 0) {
        if (count > 0)
            clock.time++;
        clock.changes.run(applyDataChange);
        clock.updates.run(updateNode);
        clock.disposes.run(dispose);
        // if there are still changes after excessive batches, assume runaway            
        if (count++ > 1e5) {
            throw new Error("Runaway clock detected");
        }
    }
    RunningClock = running;
}
function applyDataChange(data) {
    data.value = data.pending;
    data.pending = NOTPENDING;
    if (data.log)
        markComputationsStale(data.log);
}
function markComputationsStale(log) {
    var node1 = log.node1, nodes = log.nodes;
    // mark all downstream nodes stale which haven't been already
    if (node1 !== null)
        markNodeStale(node1);
    if (nodes !== null) {
        for (var i = 0, len = nodes.length; i < len; i++) {
            markNodeStale(nodes[i]);
        }
    }
}
function markNodeStale(node) {
    var time = RootClock.time;
    if (node.age < time) {
        node.age = time;
        node.state = STALE;
        RootClock.updates.add(node);
        if (node.owned !== null)
            markOwnedNodesForDisposal(node.owned);
        if (node.log !== null)
            markComputationsStale(node.log);
    }
}
function markOwnedNodesForDisposal(owned) {
    for (var i = 0; i < owned.length; i++) {
        var child = owned[i];
        child.age = RootClock.time;
        child.state = CURRENT;
        if (child.owned !== null)
            markOwnedNodesForDisposal(child.owned);
    }
}
function updateNode(node) {
    if (node.state === STALE) {
        var owner = Owner, running = RunningNode;
        Owner = RunningNode = node;
        node.state = RUNNING;
        cleanup(node, false);
        node.value = node.fn(node.value);
        node.state = CURRENT;
        Owner = owner;
        RunningNode = running;
    }
}
function cleanup(node, final) {
    var source1 = node.source1, sources = node.sources, sourceslots = node.sourceslots, cleanups = node.cleanups, owned = node.owned, i, len;
    if (cleanups !== null) {
        for (i = 0; i < cleanups.length; i++) {
            cleanups[i](final);
        }
        node.cleanups = null;
    }
    if (owned !== null) {
        for (i = 0; i < owned.length; i++) {
            dispose(owned[i]);
        }
        node.owned = null;
    }
    if (source1 !== null) {
        cleanupSource(source1, node.source1slot);
        node.source1 = null;
    }
    if (sources !== null) {
        for (i = 0, len = sources.length; i < len; i++) {
            cleanupSource(sources.pop(), sourceslots.pop());
        }
    }
}
function cleanupSource(source, slot) {
    var nodes = source.nodes, nodeslots = source.nodeslots, last, lastslot;
    if (slot === -1) {
        source.node1 = null;
    }
    else {
        last = nodes.pop();
        lastslot = nodeslots.pop();
        if (slot !== nodes.length) {
            nodes[slot] = last;
            nodeslots[slot] = lastslot;
            if (lastslot === -1) {
                last.source1slot = slot;
            }
            else {
                last.sourceslots[lastslot] = slot;
            }
        }
    }
}
function dispose(node) {
    node.fn = null;
    node.log = null;
    cleanup(node, true);
}


/***/ }),

/***/ "./node_modules/surplus/es/content.js":
/*!********************************************!*\
  !*** ./node_modules/surplus/es/content.js ***!
  \********************************************/
/*! exports provided: content */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "content", function() { return content; });
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index */ "./node_modules/surplus/es/index.js");

function content(parent, value, current) {
    var t = typeof value;
    if (current === value) {
        // nothing to do
    }
    else if (t === 'string') {
        // if a Text node already exists, it's faster to set its .data than set the parent.textContent
        if (current !== "" && typeof current === 'string') {
            current = parent.firstChild.data = value;
        }
        else {
            current = parent.textContent = value;
        }
    }
    else if (t === 'number') {
        value = value.toString();
        if (current !== "" && typeof current === 'string') {
            current = parent.firstChild.data = value;
        }
        else {
            current = parent.textContent = value;
        }
    }
    else if (value == null || t === 'boolean') {
        clear(parent);
        current = "";
    }
    else if (t === 'function') {
        Object(_index__WEBPACK_IMPORTED_MODULE_0__["S"])(function () {
            current = content(parent, value(), current);
        });
    }
    else if (value instanceof Node) {
        if (Array.isArray(current)) {
            if (current.length === 0) {
                parent.appendChild(value);
            }
            else if (current.length === 1) {
                parent.replaceChild(value, current[0]);
            }
            else {
                clear(parent);
                parent.appendChild(value);
            }
        }
        else if (current === "") {
            parent.appendChild(value);
        }
        else {
            parent.replaceChild(value, parent.firstChild);
        }
        current = value;
    }
    else if (Array.isArray(value)) {
        var array = normalizeIncomingArray([], value);
        if (array.length === 0) {
            clear(parent);
        }
        else {
            if (Array.isArray(current)) {
                if (current.length === 0) {
                    appendNodes(parent, array, 0, array.length);
                }
                else {
                    reconcileArrays(parent, current, array);
                }
            }
            else if (current === "") {
                appendNodes(parent, array, 0, array.length);
            }
            else {
                reconcileArrays(parent, [parent.firstChild], array);
            }
        }
        current = array;
    }
    else {
        throw new Error("content must be Node, stringable, or array of same");
    }
    return current;
}
var NOMATCH = -1, NOINSERT = -2;
var RECONCILE_ARRAY_BATCH = 0;
var RECONCILE_ARRAY_BITS = 16, RECONCILE_ARRAY_INC = 1 << RECONCILE_ARRAY_BITS, RECONCILE_ARRAY_MASK = RECONCILE_ARRAY_INC - 1;
// reconcile the content of parent from ns to us
// see ivi's excellent writeup of diffing arrays in a vdom library: 
// https://github.com/ivijs/ivi/blob/2c81ead934b9128e092cc2a5ef2d3cabc73cb5dd/packages/ivi/src/vdom/implementation.ts#L1187
// this code isn't identical, since we're diffing real dom nodes to nodes-or-strings, 
// but the core methodology of trimming ends and reversals, matching nodes, then using
// the longest increasing subsequence to minimize DOM ops is inspired by ivi.
function reconcileArrays(parent, ns, us) {
    var ulen = us.length, 
    // n = nodes, u = updates
    // ranges defined by min and max indices
    nmin = 0, nmax = ns.length - 1, umin = 0, umax = ulen - 1, 
    // start nodes of ranges
    n = ns[nmin], u = us[umin], 
    // end nodes of ranges
    nx = ns[nmax], ux = us[umax], 
    // node, if any, just after ux, used for doing .insertBefore() to put nodes at end
    ul = nx.nextSibling, i, j, k, loop = true;
    // scan over common prefixes, suffixes, and simple reversals
    fixes: while (loop) {
        loop = false;
        // common prefix, u === n
        while (equable(u, n, umin, us)) {
            umin++;
            nmin++;
            if (umin > umax || nmin > nmax)
                break fixes;
            u = us[umin];
            n = ns[nmin];
        }
        // common suffix, ux === nx
        while (equable(ux, nx, umax, us)) {
            ul = nx;
            umax--;
            nmax--;
            if (umin > umax || nmin > nmax)
                break fixes;
            ux = us[umax];
            nx = ns[nmax];
        }
        // reversal u === nx, have to swap node forward
        while (equable(u, nx, umin, us)) {
            loop = true;
            parent.insertBefore(nx, n);
            umin++;
            nmax--;
            if (umin > umax || nmin > nmax)
                break fixes;
            u = us[umin];
            nx = ns[nmax];
        }
        // reversal ux === n, have to swap node back
        while (equable(ux, n, umax, us)) {
            loop = true;
            if (ul === null)
                parent.appendChild(n);
            else
                parent.insertBefore(n, ul);
            ul = n;
            umax--;
            nmin++;
            if (umin > umax || nmin > nmax)
                break fixes;
            ux = us[umax];
            n = ns[nmin];
        }
    }
    // if that covered all updates, just need to remove any remaining nodes and we're done
    if (umin > umax) {
        // remove any remaining nodes
        while (nmin <= nmax) {
            parent.removeChild(ns[nmax]);
            nmax--;
        }
        return;
    }
    // if that covered all current nodes, just need to insert any remaining updates and we're done
    if (nmin > nmax) {
        // insert any remaining nodes
        while (umin <= umax) {
            insertOrAppend(parent, us[umin], ul, umin, us);
            umin++;
        }
        return;
    }
    // simple cases don't apply, have to actually match up nodes and figure out minimum DOM ops
    // loop through nodes and mark them with a special property indicating their order
    // we'll then go through the updates and look for those properties
    // in case any of the updates have order properties left over from earlier runs, we 
    // use the low bits of the order prop to record a batch identifier.
    // I'd much rather use a Map than a special property, but Maps of objects are really
    // slow currently, like only 100k get/set ops / second
    // for Text nodes, all that matters is their order, as they're easily, interchangeable
    // so we record their positions in ntext[]
    var ntext = [];
    // update global batch identifer
    RECONCILE_ARRAY_BATCH = (RECONCILE_ARRAY_BATCH + 1) % RECONCILE_ARRAY_INC;
    for (i = nmin, j = (nmin << RECONCILE_ARRAY_BITS) + RECONCILE_ARRAY_BATCH; i <= nmax; i++, j += RECONCILE_ARRAY_INC) {
        n = ns[i];
        // add or update special order property
        if (n.__surplus_order === undefined) {
            Object.defineProperty(n, '__surplus_order', { value: j, writable: true });
        }
        else {
            n.__surplus_order = j;
        }
        if (n instanceof Text) {
            ntext.push(i);
        }
    }
    // now loop through us, looking for the order property, otherwise recording NOMATCH
    var src = new Array(umax - umin + 1), utext = [], preserved = 0;
    for (i = umin; i <= umax; i++) {
        u = us[i];
        if (typeof u === 'string') {
            utext.push(i);
            src[i - umin] = NOMATCH;
        }
        else if ((j = u.__surplus_order) !== undefined && (j & RECONCILE_ARRAY_MASK) === RECONCILE_ARRAY_BATCH) {
            j >>= RECONCILE_ARRAY_BITS;
            src[i - umin] = j;
            ns[j] = null;
            preserved++;
        }
        else {
            src[i - umin] = NOMATCH;
        }
    }
    if (preserved === 0 && nmin === 0 && nmax === ns.length - 1) {
        // no nodes preserved, use fast clear and append
        clear(parent);
        while (umin <= umax) {
            insertOrAppend(parent, us[umin], null, umin, us);
            umin++;
        }
        return;
    }
    // find longest common sequence between ns and us, represented as the indices 
    // of the longest increasing subsequence in src
    var lcs = longestPositiveIncreasingSubsequence(src);
    // we know we can preserve their order, so march them as NOINSERT
    for (i = 0; i < lcs.length; i++) {
        src[lcs[i]] = NOINSERT;
    }
    /*
              0   1   2   3   4   5   6   7
    ns    = [ n,  n,  t,  n,  n,  n,  t,  n ]
                  |          /   /       /
                  |        /   /       /
                  +------/---/-------/----+
                       /   /       /      |
    us    = [ n,  s,  n,  n,  s,  n,  s,  n ]
    src   = [-1, -1,  4,  5, -1,  7, -1,  1 ]
    lis   = [         2,  3,      5]
                      j
    utext = [     1,          4,      6 ]
                  i
    ntext = [         2,              6 ]
                      k
    */
    // replace strings in us with Text nodes, reusing Text nodes from ns when we can do so without moving them
    var utexti = 0, lcsj = 0, ntextk = 0;
    for (i = 0, j = 0, k = 0; i < utext.length; i++) {
        utexti = utext[i];
        // need to answer qeustion "if utext[i] falls between two lcs nodes, is there an ntext between them which we can reuse?"
        // first, find j such that lcs[j] is the first lcs node *after* utext[i]
        while (j < lcs.length && (lcsj = lcs[j]) < utexti - umin)
            j++;
        // now, find k such that ntext[k] is the first ntext *after* lcs[j-1] (or after start, if j === 0)
        while (k < ntext.length && (ntextk = ntext[k], j !== 0) && ntextk < src[lcs[j - 1]])
            k++;
        // if ntext[k] < lcs[j], then we know ntext[k] falls between lcs[j-1] (or start) and lcs[j] (or end)
        // that means we can re-use it without moving it
        if (k < ntext.length && (j === lcs.length || ntextk < src[lcsj])) {
            n = ns[ntextk];
            u = us[utexti];
            if (n.data !== u)
                n.data = u;
            ns[ntextk] = null;
            us[utexti] = n;
            src[utexti] = NOINSERT;
            k++;
        }
        else {
            // if we didn't find one to re-use, make a new Text node
            us[utexti] = document.createTextNode(us[utexti]);
        }
    }
    // remove stale nodes in ns
    while (nmin <= nmax) {
        n = ns[nmin];
        if (n !== null) {
            parent.removeChild(n);
        }
        nmin++;
    }
    // insert new nodes
    while (umin <= umax) {
        ux = us[umax];
        if (src[umax - umin] !== NOINSERT) {
            if (ul === null)
                parent.appendChild(ux);
            else
                parent.insertBefore(ux, ul);
        }
        ul = ux;
        umax--;
    }
}
// two nodes are "equable" if they are identical (===) or if we can make them the same, i.e. they're 
// Text nodes, which we can reuse with the new text
function equable(u, n, i, us) {
    if (u === n) {
        return true;
    }
    else if (typeof u === 'string' && n instanceof Text) {
        if (n.data !== u)
            n.data = u;
        us[i] = n;
        return true;
    }
    else {
        return false;
    }
}
function appendNodes(parent, array, i, end) {
    var node;
    for (; i < end; i++) {
        node = array[i];
        if (node instanceof Node) {
            parent.appendChild(node);
        }
        else {
            node = array[i] = document.createTextNode(node);
            parent.appendChild(node);
        }
    }
}
function insertOrAppend(parent, node, marker, i, us) {
    if (typeof node === 'string') {
        node = us[i] = document.createTextNode(node);
    }
    if (marker === null)
        parent.appendChild(node);
    else
        parent.insertBefore(node, marker);
}
function normalizeIncomingArray(normalized, array) {
    for (var i = 0, len = array.length; i < len; i++) {
        var item = array[i];
        if (item instanceof Node) {
            normalized.push(item);
        }
        else if (item == null || item === true || item === false) {
            // skip
        }
        else if (Array.isArray(item)) {
            normalizeIncomingArray(normalized, item);
        }
        else if (typeof item === 'string') {
            normalized.push(item);
        }
        else {
            normalized.push(item.toString());
        }
    }
    return normalized;
}
function clear(node) {
    node.textContent = "";
}
// return an array of the indices of ns that comprise the longest increasing subsequence within ns
function longestPositiveIncreasingSubsequence(ns) {
    var seq = [], is = [], l = -1, pre = new Array(ns.length);
    for (var i = 0, len = ns.length; i < len; i++) {
        var n = ns[i];
        if (n < 0)
            continue;
        var j = findGreatestIndexLEQ(seq, n);
        if (j !== -1)
            pre[i] = is[j];
        if (j === l) {
            l++;
            seq[l] = n;
            is[l] = i;
        }
        else if (n < seq[j + 1]) {
            seq[j + 1] = n;
            is[j + 1] = i;
        }
    }
    for (i = is[l]; l >= 0; i = pre[i], l--) {
        seq[l] = i;
    }
    return seq;
}
function findGreatestIndexLEQ(seq, n) {
    // invariant: lo is guaranteed to be index of a value <= n, hi to be >
    // therefore, they actually start out of range: (-1, last + 1)
    var lo = -1, hi = seq.length;
    // fast path for simple increasing sequences
    if (hi > 0 && seq[hi - 1] <= n)
        return hi - 1;
    while (hi - lo > 1) {
        var mid = Math.floor((lo + hi) / 2);
        if (seq[mid] > n) {
            hi = mid;
        }
        else {
            lo = mid;
        }
    }
    return lo;
}


/***/ }),

/***/ "./node_modules/surplus/es/dom.js":
/*!****************************************!*\
  !*** ./node_modules/surplus/es/dom.js ***!
  \****************************************/
/*! exports provided: createElement, createSvgElement, createComment, createTextNode, setAttribute, setAttributeNS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createElement", function() { return createElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createSvgElement", function() { return createSvgElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createComment", function() { return createComment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createTextNode", function() { return createTextNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setAttribute", function() { return setAttribute; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setAttributeNS", function() { return setAttributeNS; });
var svgNS = "http://www.w3.org/2000/svg";
function createElement(tag, className, parent) {
    var el = document.createElement(tag);
    if (className)
        el.className = className;
    if (parent)
        parent.appendChild(el);
    return el;
}
function createSvgElement(tag, className, parent) {
    var el = document.createElementNS(svgNS, tag);
    if (className)
        el.setAttribute("class", className);
    if (parent)
        parent.appendChild(el);
    return el;
}
function createComment(text, parent) {
    var comment = document.createComment(text);
    parent.appendChild(comment);
    return comment;
}
function createTextNode(text, parent) {
    var node = document.createTextNode(text);
    parent.appendChild(node);
    return node;
}
function setAttribute(node, name, value) {
    if (value === false || value === null || value === undefined)
        node.removeAttribute(name);
    else
        node.setAttribute(name, value);
}
function setAttributeNS(node, namespace, name, value) {
    if (value === false || value === null || value === undefined)
        node.removeAttributeNS(namespace, name);
    else
        node.setAttributeNS(namespace, name, value);
}


/***/ }),

/***/ "./node_modules/surplus/es/fieldData.js":
/*!**********************************************!*\
  !*** ./node_modules/surplus/es/fieldData.js ***!
  \**********************************************/
/*! exports provided: getFieldData */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFieldData", function() { return getFieldData; });
var 
// pre-seed the caches with a few special cases, so we don't need to check for them in the common cases
htmlFieldCache = {
    // special props
    style: ['style', null, 3 /* Assign */],
    ref: ['ref', null, 2 /* Ignore */],
    fn: ['fn', null, 2 /* Ignore */],
    // attr compat
    class: ['className', null, 0 /* Property */],
    for: ['htmlFor', null, 0 /* Property */],
    "accept-charset": ['acceptCharset', null, 0 /* Property */],
    "http-equiv": ['httpEquiv', null, 0 /* Property */],
    // a few React oddities, mostly disagreeing about casing
    onDoubleClick: ['ondblclick', null, 0 /* Property */],
    spellCheck: ['spellcheck', null, 0 /* Property */],
    allowFullScreen: ['allowFullscreen', null, 0 /* Property */],
    autoCapitalize: ['autocapitalize', null, 0 /* Property */],
    autoFocus: ['autofocus', null, 0 /* Property */],
    autoPlay: ['autoplay', null, 0 /* Property */],
    // other
    // role is part of the ARIA spec but not caught by the aria- attr filter
    role: ['role', null, 1 /* Attribute */]
}, svgFieldCache = {
    // special props
    style: ['style', null, 3 /* Assign */],
    ref: ['ref', null, 2 /* Ignore */],
    fn: ['fn', null, 2 /* Ignore */],
    // property compat
    className: ['class', null, 1 /* Attribute */],
    htmlFor: ['for', null, 1 /* Attribute */],
    tabIndex: ['tabindex', null, 1 /* Attribute */],
    // React compat
    onDoubleClick: ['ondblclick', null, 0 /* Property */],
    // attributes with eccentric casing - some SVG attrs are snake-cased, some camelCased
    allowReorder: ['allowReorder', null, 1 /* Attribute */],
    attributeName: ['attributeName', null, 1 /* Attribute */],
    attributeType: ['attributeType', null, 1 /* Attribute */],
    autoReverse: ['autoReverse', null, 1 /* Attribute */],
    baseFrequency: ['baseFrequency', null, 1 /* Attribute */],
    calcMode: ['calcMode', null, 1 /* Attribute */],
    clipPathUnits: ['clipPathUnits', null, 1 /* Attribute */],
    contentScriptType: ['contentScriptType', null, 1 /* Attribute */],
    contentStyleType: ['contentStyleType', null, 1 /* Attribute */],
    diffuseConstant: ['diffuseConstant', null, 1 /* Attribute */],
    edgeMode: ['edgeMode', null, 1 /* Attribute */],
    externalResourcesRequired: ['externalResourcesRequired', null, 1 /* Attribute */],
    filterRes: ['filterRes', null, 1 /* Attribute */],
    filterUnits: ['filterUnits', null, 1 /* Attribute */],
    gradientTransform: ['gradientTransform', null, 1 /* Attribute */],
    gradientUnits: ['gradientUnits', null, 1 /* Attribute */],
    kernelMatrix: ['kernelMatrix', null, 1 /* Attribute */],
    kernelUnitLength: ['kernelUnitLength', null, 1 /* Attribute */],
    keyPoints: ['keyPoints', null, 1 /* Attribute */],
    keySplines: ['keySplines', null, 1 /* Attribute */],
    keyTimes: ['keyTimes', null, 1 /* Attribute */],
    lengthAdjust: ['lengthAdjust', null, 1 /* Attribute */],
    limitingConeAngle: ['limitingConeAngle', null, 1 /* Attribute */],
    markerHeight: ['markerHeight', null, 1 /* Attribute */],
    markerUnits: ['markerUnits', null, 1 /* Attribute */],
    maskContentUnits: ['maskContentUnits', null, 1 /* Attribute */],
    maskUnits: ['maskUnits', null, 1 /* Attribute */],
    numOctaves: ['numOctaves', null, 1 /* Attribute */],
    pathLength: ['pathLength', null, 1 /* Attribute */],
    patternContentUnits: ['patternContentUnits', null, 1 /* Attribute */],
    patternTransform: ['patternTransform', null, 1 /* Attribute */],
    patternUnits: ['patternUnits', null, 1 /* Attribute */],
    pointsAtX: ['pointsAtX', null, 1 /* Attribute */],
    pointsAtY: ['pointsAtY', null, 1 /* Attribute */],
    pointsAtZ: ['pointsAtZ', null, 1 /* Attribute */],
    preserveAlpha: ['preserveAlpha', null, 1 /* Attribute */],
    preserveAspectRatio: ['preserveAspectRatio', null, 1 /* Attribute */],
    primitiveUnits: ['primitiveUnits', null, 1 /* Attribute */],
    refX: ['refX', null, 1 /* Attribute */],
    refY: ['refY', null, 1 /* Attribute */],
    repeatCount: ['repeatCount', null, 1 /* Attribute */],
    repeatDur: ['repeatDur', null, 1 /* Attribute */],
    requiredExtensions: ['requiredExtensions', null, 1 /* Attribute */],
    requiredFeatures: ['requiredFeatures', null, 1 /* Attribute */],
    specularConstant: ['specularConstant', null, 1 /* Attribute */],
    specularExponent: ['specularExponent', null, 1 /* Attribute */],
    spreadMethod: ['spreadMethod', null, 1 /* Attribute */],
    startOffset: ['startOffset', null, 1 /* Attribute */],
    stdDeviation: ['stdDeviation', null, 1 /* Attribute */],
    stitchTiles: ['stitchTiles', null, 1 /* Attribute */],
    surfaceScale: ['surfaceScale', null, 1 /* Attribute */],
    systemLanguage: ['systemLanguage', null, 1 /* Attribute */],
    tableValues: ['tableValues', null, 1 /* Attribute */],
    targetX: ['targetX', null, 1 /* Attribute */],
    targetY: ['targetY', null, 1 /* Attribute */],
    textLength: ['textLength', null, 1 /* Attribute */],
    viewBox: ['viewBox', null, 1 /* Attribute */],
    viewTarget: ['viewTarget', null, 1 /* Attribute */],
    xChannelSelector: ['xChannelSelector', null, 1 /* Attribute */],
    yChannelSelector: ['yChannelSelector', null, 1 /* Attribute */],
    zoomAndPan: ['zoomAndPan', null, 1 /* Attribute */],
};
var attributeOnlyRx = /-/, deepAttrRx = /^style-/, isAttrOnlyField = function (field) { return attributeOnlyRx.test(field) && !deepAttrRx.test(field); }, propOnlyRx = /^(on|style)/, isPropOnlyField = function (field) { return propOnlyRx.test(field); }, propPartRx = /[a-z][A-Z]/g, getAttrName = function (field) { return field.replace(propPartRx, function (m) { return m[0] + '-' + m[1]; }).toLowerCase(); }, jsxEventPropRx = /^on[A-Z]/, attrPartRx = /\-(?:[a-z]|$)/g, getPropName = function (field) {
    var prop = field.replace(attrPartRx, function (m) { return m.length === 1 ? '' : m[1].toUpperCase(); });
    return jsxEventPropRx.test(prop) ? prop.toLowerCase() : prop;
}, deepPropRx = /^(style)([A-Z])/, buildPropData = function (prop) {
    var m = deepPropRx.exec(prop);
    return m ? [m[2].toLowerCase() + prop.substr(m[0].length), m[1], 0 /* Property */] : [prop, null, 0 /* Property */];
}, attrNamespaces = {
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
}, attrNamespaceRx = new RegExp("^(" + Object.keys(attrNamespaces).join('|') + ")-(.*)"), buildAttrData = function (attr) {
    var m = attrNamespaceRx.exec(attr);
    return m ? [m[2], attrNamespaces[m[1]], 1 /* Attribute */] : [attr, null, 1 /* Attribute */];
};
var getFieldData = function (field, svg) {
    var cache = svg ? svgFieldCache : htmlFieldCache, cached = cache[field];
    if (cached)
        return cached;
    var attr = svg && !isPropOnlyField(field)
        || !svg && isAttrOnlyField(field), name = attr ? getAttrName(field) : getPropName(field);
    if (name !== field && (cached = cache[name]))
        return cached;
    var data = attr ? buildAttrData(name) : buildPropData(name);
    return cache[field] = data;
};


/***/ }),

/***/ "./node_modules/surplus/es/index.js":
/*!******************************************!*\
  !*** ./node_modules/surplus/es/index.js ***!
  \******************************************/
/*! exports provided: insert, content, spread, assign, S, createElement, createSvgElement, createComment, createTextNode, setAttribute, setAttributeNS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _insert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./insert */ "./node_modules/surplus/es/insert.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "insert", function() { return _insert__WEBPACK_IMPORTED_MODULE_0__["insert"]; });

/* harmony import */ var _content__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./content */ "./node_modules/surplus/es/content.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "content", function() { return _content__WEBPACK_IMPORTED_MODULE_1__["content"]; });

/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dom */ "./node_modules/surplus/es/dom.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createElement", function() { return _dom__WEBPACK_IMPORTED_MODULE_2__["createElement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createSvgElement", function() { return _dom__WEBPACK_IMPORTED_MODULE_2__["createSvgElement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createComment", function() { return _dom__WEBPACK_IMPORTED_MODULE_2__["createComment"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createTextNode", function() { return _dom__WEBPACK_IMPORTED_MODULE_2__["createTextNode"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setAttribute", function() { return _dom__WEBPACK_IMPORTED_MODULE_2__["setAttribute"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setAttributeNS", function() { return _dom__WEBPACK_IMPORTED_MODULE_2__["setAttributeNS"]; });

/* harmony import */ var _spread__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./spread */ "./node_modules/surplus/es/spread.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "spread", function() { return _spread__WEBPACK_IMPORTED_MODULE_3__["spread"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "assign", function() { return _spread__WEBPACK_IMPORTED_MODULE_3__["assign"]; });

/* harmony import */ var s_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! s-js */ "./node_modules/s-js/dist/es/S.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "S", function() { return s_js__WEBPACK_IMPORTED_MODULE_4__["default"]; });








/***/ }),

/***/ "./node_modules/surplus/es/insert.js":
/*!*******************************************!*\
  !*** ./node_modules/surplus/es/insert.js ***!
  \*******************************************/
/*! exports provided: insert */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "insert", function() { return insert; });
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index */ "./node_modules/surplus/es/index.js");

var DOCUMENT_FRAGMENT_NODE = 11, TEXT_NODE = 3;
function insert(range, value) {
    var parent = range.start.parentNode, test = range.start, good = null, t = typeof value;
    //if (parent === null) {
    //    throw new Error("Surplus.insert() can only be used on a node that has a parent node. \n"
    //        + "Node ``" + range.start + "'' is currently unattached to a parent.");
    //}
    //if (range.end.parentNode !== parent) {
    //    throw new Error("Surplus.insert() requires that the inserted nodes remain sibilings \n"
    //        + "of the original node.  The DOM has been modified such that this is \n"
    //        + "no longer the case.");
    //}
    if (t === 'string' || t === 'number') {
        value = value.toString();
        if (test.nodeType === TEXT_NODE) {
            test.data = value;
            good = test;
        }
        else {
            value = document.createTextNode(value);
            parent.replaceChild(value, test);
            if (range.end === test)
                range.end = value;
            range.start = good = value;
        }
    }
    else if (value instanceof Node) {
        if (test !== value) {
            parent.replaceChild(value, test);
            if (range.end === test)
                range.end = value;
            range.start = value;
        }
        good = value;
    }
    else if (Array.isArray(value)) {
        insertArray(value);
    }
    else if (value instanceof Function) {
        Object(_index__WEBPACK_IMPORTED_MODULE_0__["S"])(function () {
            insert(range, value());
        });
        good = range.end;
    }
    else if (value !== null && value !== undefined && value !== true && value !== false) {
        value = value.toString();
        if (test.nodeType === TEXT_NODE) {
            test.data = value;
            good = test;
        }
        else {
            value = document.createTextNode(value);
            parent.replaceChild(value, test);
            if (range.end === test)
                range.end = value;
            range.start = good = value;
        }
    }
    if (good === null) {
        if (range.start === parent.firstChild && range.end === parent.lastChild && range.start !== range.end) {
            // fast delete entire contents
            parent.textContent = "";
            value = document.createTextNode("");
            parent.appendChild(value);
            good = range.start = range.end = value;
        }
        else if (test.nodeType === TEXT_NODE) {
            test.data = "";
            good = test;
        }
        else {
            value = document.createTextNode("");
            parent.replaceChild(value, test);
            if (range.end === test)
                range.end = value;
            range.start = good = value;
        }
    }
    // remove anything left after the good cursor from the insert range
    while (good !== range.end) {
        test = range.end;
        range.end = test.previousSibling;
        parent.removeChild(test);
    }
    return range;
    function insertArray(array) {
        for (var i = 0, len = array.length; i < len; i++) {
            var value = array[i];
            if (good === range.end) {
                if (value instanceof Node) {
                    good = range.end = (good.nextSibling ? parent.insertBefore(value, good.nextSibling) : parent.appendChild(value));
                }
                else if (value instanceof Array) {
                    insertArray(value);
                }
                else if (value !== null && value !== undefined && value !== false && value !== true) {
                    value = document.createTextNode(value.toString());
                    good = range.end = (good.nextSibling ? parent.insertBefore(value, good.nextSibling) : parent.appendChild(value));
                }
            }
            else {
                if (value instanceof Node) {
                    if (test !== value) {
                        if (good === null) {
                            if (range.end === value)
                                range.end = value.previousSibling;
                            parent.replaceChild(value, test);
                            range.start = value;
                            if (range.end === test)
                                range.end = value;
                            test = value.nextSibling;
                        }
                        else {
                            if (test.nextSibling === value && test !== value.nextSibling && test !== range.end) {
                                parent.removeChild(test);
                                test = value.nextSibling;
                            }
                            else {
                                if (range.end === value)
                                    range.end = value.previousSibling;
                                parent.insertBefore(value, test);
                            }
                        }
                    }
                    else {
                        test = test.nextSibling;
                    }
                    good = value;
                }
                else if (value instanceof Array) {
                    insertArray(value);
                }
                else if (value !== null && value !== undefined && value !== true && value !== false) {
                    value = value.toString();
                    if (test.nodeType === TEXT_NODE) {
                        test.data = value;
                        if (good === null)
                            range.start = test;
                        good = test, test = good.nextSibling;
                    }
                    else {
                        value = document.createTextNode(value);
                        parent.insertBefore(value, test);
                        if (good === null)
                            range.start = value;
                        good = value;
                    }
                }
            }
        }
    }
}


/***/ }),

/***/ "./node_modules/surplus/es/spread.js":
/*!*******************************************!*\
  !*** ./node_modules/surplus/es/spread.js ***!
  \*******************************************/
/*! exports provided: assign, spread */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "assign", function() { return assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "spread", function() { return spread; });
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dom */ "./node_modules/surplus/es/dom.js");
/* harmony import */ var _fieldData__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fieldData */ "./node_modules/surplus/es/fieldData.js");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index */ "./node_modules/surplus/es/index.js");



function assign(a, b) {
    var props = Object.keys(b);
    for (var i = 0, len = props.length; i < len; i++) {
        var name = props[i];
        a[name] = b[name];
    }
}
function spread(node, obj, svg) {
    var props = Object.keys(obj);
    for (var i = 0, len = props.length; i < len; i++) {
        var name = props[i];
        setField(node, name, obj[name], svg);
    }
}
function setField(node, field, value, svg) {
    var _a = Object(_fieldData__WEBPACK_IMPORTED_MODULE_1__["getFieldData"])(field, svg), name = _a[0], namespace = _a[1], flags = _a[2], type = flags & 3 /* Type */;
    if (type === 0 /* Property */) {
        if (namespace)
            node = node[namespace];
        node[name] = value;
    }
    else if (type === 1 /* Attribute */) {
        if (namespace)
            Object(_index__WEBPACK_IMPORTED_MODULE_2__["setAttributeNS"])(node, namespace, name, value);
        else
            Object(_dom__WEBPACK_IMPORTED_MODULE_0__["setAttribute"])(node, name, value);
    }
    else if (type === 3 /* Assign */) {
        if (value && typeof value === 'object')
            assign(node.style, value);
    }
}


/***/ }),

/***/ "./src/main/app.ts":
/*!*************************!*\
  !*** ./src/main/app.ts ***!
  \*************************/
/*! exports provided: App */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "App", function() { return App; });
/* harmony import */ var s_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! s-js */ "./node_modules/s-js/dist/es/S.js");
/* harmony import */ var _canvasMgr__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./canvasMgr */ "./src/main/canvasMgr.ts");
/* harmony import */ var _runner__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./runner */ "./src/main/runner.ts");
/* harmony import */ var _imager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./imager */ "./src/main/imager.ts");
/* harmony import */ var _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./colorHandling/rgb */ "./src/main/colorHandling/rgb.ts");
/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./settings */ "./src/main/settings.ts");






const CANVAS_DEFAULTS = {
    center: {
        re: 0,
        im: 0
    },
    zoom: 150,
    resolution: 1.25
};
const ESCAPE_TIME_DEFAULTS = {
    c: {
        re: 0,
        im: 0.8
    },
    maxIter: 50,
    escapeRadius: 2
};
const IMAGER_DEFAULTS = {
    includedColor: new _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_4__["RGB"](255, 0, 0),
    excludedColor: new _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_4__["RGB"](0, 0, 0)
};
function applyDefaults(opts) {
    const canvasOpts = opts.canvas || {}, centerOpts = canvasOpts.center || {}, escapeTimeOpts = opts.escapeTime || {}, cOpts = escapeTimeOpts.c || {}, imagerOpts = opts.imager || {}, includedColorOpts = imagerOpts.includedColor || {}, excludedColorOpts = imagerOpts.excludedColor || {};
    return {
        canvas: {
            center: {
                re: centerOpts.re !== undefined ? centerOpts.re : CANVAS_DEFAULTS.center.re,
                im: centerOpts.im !== undefined ? centerOpts.im : CANVAS_DEFAULTS.center.im
            },
            zoom: canvasOpts.zoom !== undefined ? canvasOpts.zoom : CANVAS_DEFAULTS.zoom,
            resolution: canvasOpts.resolution !== undefined ? canvasOpts.resolution : CANVAS_DEFAULTS.resolution
        },
        escapeTime: {
            c: {
                re: cOpts.re !== undefined ? cOpts.re : ESCAPE_TIME_DEFAULTS.c.re,
                im: cOpts.im !== undefined ? cOpts.im : ESCAPE_TIME_DEFAULTS.c.im
            },
            maxIter: escapeTimeOpts.maxIter !== undefined ? escapeTimeOpts.maxIter : ESCAPE_TIME_DEFAULTS.maxIter,
            escapeRadius: escapeTimeOpts.escapeRadius !== undefined ? escapeTimeOpts.escapeRadius : ESCAPE_TIME_DEFAULTS.escapeRadius
        },
        imager: {
            includedColor: new _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_4__["RGB"](includedColorOpts.r !== undefined ? includedColorOpts.r : IMAGER_DEFAULTS.includedColor.r, includedColorOpts.g !== undefined ? includedColorOpts.g : IMAGER_DEFAULTS.includedColor.g, includedColorOpts.b !== undefined ? includedColorOpts.b : IMAGER_DEFAULTS.includedColor.b),
            excludedColor: new _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_4__["RGB"](excludedColorOpts.r !== undefined ? excludedColorOpts.r : IMAGER_DEFAULTS.excludedColor.r, excludedColorOpts.g !== undefined ? excludedColorOpts.g : IMAGER_DEFAULTS.excludedColor.g, excludedColorOpts.b !== undefined ? excludedColorOpts.b : IMAGER_DEFAULTS.excludedColor.b)
        }
    };
}
function App(workerUrl, opts) {
    const { canvas: canvasMgrOpts, escapeTime: escapeTimeOpts, imager: imagerOpts } = applyDefaults(opts), canvasMgr = Object(_canvasMgr__WEBPACK_IMPORTED_MODULE_1__["CanvasMgr"])(canvasMgrOpts), runner = Object(_runner__WEBPACK_IMPORTED_MODULE_2__["EscapeTimeRunner"])(canvasMgr, workerUrl, escapeTimeOpts), imager = Object(_imager__WEBPACK_IMPORTED_MODULE_3__["Imager"])(runner, imagerOpts), settings = Object(_settings__WEBPACK_IMPORTED_MODULE_5__["Settings"])(canvasMgr, runner, imager);
    return {
        canvasMgr,
        runner,
        imager,
        settings,
        currentOpts,
        updateOpts
    };
    function currentOpts() {
        return {
            canvas: canvasMgr.currentOpts(),
            escapeTime: runner.currentOpts(),
            imager: imager.currentOpts()
        };
    }
    function updateOpts(opts) {
        const effective = applyDefaults(opts);
        s_js__WEBPACK_IMPORTED_MODULE_0__["default"].freeze(() => {
            canvasMgr.updateOpts(effective.canvas);
            runner.updateOpts(effective.escapeTime);
            imager.updateOpts(effective.imager);
        });
    }
}


/***/ }),

/***/ "./src/main/appView.tsx":
/*!******************************!*\
  !*** ./src/main/appView.tsx ***!
  \******************************/
/*! exports provided: AppView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppView", function() { return AppView; });
/* harmony import */ var surplus__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! surplus */ "./node_modules/surplus/es/index.js");
/* harmony import */ var _settingsView__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./settingsView */ "./src/main/settingsView.tsx");
/* harmony import */ var _canvasView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./canvasView */ "./src/main/canvasView.tsx");



const AppView = ({ app, mounted }) => (function () {
    var __, __insert1, __insert2;
    __ = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", "app", null);
    __insert1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createTextNode"]('', __)
    __insert2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createTextNode"]('', __)
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function (__range) { return surplus__WEBPACK_IMPORTED_MODULE_0__["insert"](__range, Object(_settingsView__WEBPACK_IMPORTED_MODULE_1__["SettingsView"])({
    "app": app
})); }, { start: __insert1, end: __insert1 });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function (__range) { return surplus__WEBPACK_IMPORTED_MODULE_0__["insert"](__range, Object(_canvasView__WEBPACK_IMPORTED_MODULE_2__["CanvasView"])({
    "app": app,
    "mounted": mounted
})); }, { start: __insert2, end: __insert2 });
    return __;
})();


/***/ }),

/***/ "./src/main/canvasMgr.ts":
/*!*******************************!*\
  !*** ./src/main/canvasMgr.ts ***!
  \*******************************/
/*! exports provided: ChunkSizePx, CanvasMgr, RectCalculations */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChunkSizePx", function() { return ChunkSizePx; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CanvasMgr", function() { return CanvasMgr; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RectCalculations", function() { return RectCalculations; });
/* harmony import */ var s_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! s-js */ "./node_modules/s-js/dist/es/S.js");

/**
 * The size of a data chunk in logical pixels.
 * Influences the size of the data buffers that get shuttled back and forth
 * to the worker thread and populated via WASM.
 */
const ChunkSizePx = {
    height: 1 << 5,
    width: 1 << 5
};
function CanvasMgr(opts) {
    const 
    // Size of canvas in browser px
    canvasSizeBrowserPx = {
        width: s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(null),
        height: s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(null)
    }, 
    // Number of browser px per change of 1 in complex coordinates
    zoom = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(opts.zoom), 
    // Ratio of logical px to browser px. Higher means more logical px per browser px.
    resolution = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(opts.resolution), 
    // Center of the displayed canvas in complex coordinates
    center = {
        re: s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(opts.center.re),
        im: s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(opts.center.im)
    }, 
    // Initialize origin to match center, then reset to center whenever zoom or resolution change
    originTrigger = () => {
        zoom();
        resolution();
    }, 
    // Origin in the sense of WASM's Canvas struct.
    // Not necessarily the center of the displayed canvas.
    // Instead, the complex coordinates that correspond to ChunkId 0 + 0i.
    origin = {
        re: s_js__WEBPACK_IMPORTED_MODULE_0__["default"].on(originTrigger, () => center.re()),
        im: s_js__WEBPACK_IMPORTED_MODULE_0__["default"].on(originTrigger, () => center.im())
    }, 
    // Bottom right - top left in complex coordinates for any given chunk
    chunkDelta = {
        // Conventional orientation -- real axis increases from left to right, imaginary axis decreases from top to bottom
        re: () => ChunkSizePx.width / zoom() / resolution(),
        im: () => -ChunkSizePx.height / zoom() / resolution()
    }, canvasConfig = Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => ({
        chunkDelta: {
            re: chunkDelta.re(),
            im: chunkDelta.im()
        },
        origin: {
            re: origin.re(),
            im: origin.im()
        }
    })), rect = RectCalculations({
        canvasSizeBrowserPx,
        resolution,
        center,
        origin,
        chunkDelta
    });
    return {
        canvasSizeBrowserPx,
        resolution,
        zoom,
        center,
        origin,
        chunkDelta,
        canvasConfig,
        rect,
        currentOpts,
        updateOpts
    };
    function currentOpts() {
        return {
            center: {
                re: center.re(),
                im: center.im()
            },
            zoom: zoom(),
            resolution: resolution()
        };
    }
    function updateOpts(opts) {
        s_js__WEBPACK_IMPORTED_MODULE_0__["default"].freeze(() => s_js__WEBPACK_IMPORTED_MODULE_0__["default"].sample(() => {
            center.re(opts.center.re);
            center.im(opts.center.im);
            zoom(opts.zoom);
            resolution(opts.resolution);
        }));
    }
}
function RectCalculations({ canvasSizeBrowserPx, resolution, center, origin, chunkDelta }) {
    const 
    // Size of canvas in (possibly fractional) logical px
    canvasSizeLogicalPx = {
        width: () => canvasSizeBrowserPx.width() === null ? null : canvasSizeBrowserPx.width() * resolution(),
        height: () => canvasSizeBrowserPx.height() === null ? null : canvasSizeBrowserPx.height() * resolution()
    }, 
    // center - origin in (possibly fractional) chunks
    centerFromOriginChunks = {
        re: () => (center.re() - origin.re()) / chunkDelta.re(),
        im: () => (center.im() - origin.im()) / chunkDelta.im()
    }, 
    // origin - top left of canvas in (possibly fractional) logical px
    originOffsetPx = {
        x: () => canvasSizeLogicalPx.width() === null ? null : -centerFromOriginChunks.re() * ChunkSizePx.width + canvasSizeLogicalPx.width() / 2,
        y: () => canvasSizeLogicalPx.height() === null ? null : -centerFromOriginChunks.im() * ChunkSizePx.height + canvasSizeLogicalPx.height() / 2
    }, 
    // top left of displayed canvas, specified in chunks from the origin
    topLeftChunks = {
        re: () => originOffsetPx.x() === null ? null : -originOffsetPx.x() / ChunkSizePx.width,
        im: () => originOffsetPx.y() === null ? null : -originOffsetPx.y() / ChunkSizePx.height
    }, 
    // bottom right of displayed canvas, specified in chunks from the origin
    bottomRightChunks = {
        re: () => topLeftChunks.re() === null || canvasSizeLogicalPx.width() === null ? null :
            topLeftChunks.re() + canvasSizeLogicalPx.width() / ChunkSizePx.width,
        im: () => topLeftChunks.im() === null || canvasSizeLogicalPx.height() === null ? null :
            topLeftChunks.im() + canvasSizeLogicalPx.height() / ChunkSizePx.height
    }, 
    // Current canvas rect, specified in chunks.
    // Essentially, round up the size of the canvas in browser px to the nearest whole chunk.
    canvasRect = Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => {
        if (topLeftChunks.re() === null || topLeftChunks.im() === null || bottomRightChunks.re() === null || bottomRightChunks.im() === null)
            return null;
        const topLeft = {
            re: Math.floor(topLeftChunks.re()),
            im: Math.floor(topLeftChunks.im())
        };
        return {
            topLeft,
            widthChunks: Math.ceil(bottomRightChunks.re()) - topLeft.re,
            heightChunks: Math.ceil(bottomRightChunks.im()) - topLeft.im
        };
    });
    return {
        canvasSizeLogicalPx,
        originOffsetPx,
        canvasRect
    };
}


/***/ }),

/***/ "./src/main/canvasView.tsx":
/*!*********************************!*\
  !*** ./src/main/canvasView.tsx ***!
  \*********************************/
/*! exports provided: CanvasView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CanvasView", function() { return CanvasView; });
/* harmony import */ var s_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! s-js */ "./node_modules/s-js/dist/es/S.js");
/* harmony import */ var surplus__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! surplus */ "./node_modules/surplus/es/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _lib_draftSignal__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./lib/draftSignal */ "./src/main/lib/draftSignal.ts");
/* harmony import */ var _canvasMgr__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./canvasMgr */ "./src/main/canvasMgr.ts");





const CanvasView = ({ app, mounted }) => {
    const drafts = CanvasDrafts(app), panning = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(false);
    return ((function () {
    var __;
    __ = surplus__WEBPACK_IMPORTED_MODULE_1__["createElement"]("canvas", null, null);
    surplus__WEBPACK_IMPORTED_MODULE_1__["S"](function () { __.className = classnames__WEBPACK_IMPORTED_MODULE_2__('julia-canvas', { panning: panning() }); });
    surplus__WEBPACK_IMPORTED_MODULE_1__["S"](function (__state) { return (reportsSizing(app, drafts, mounted))(__, __state); });
    surplus__WEBPACK_IMPORTED_MODULE_1__["S"](function (__state) { return (rendersJuliaImage(app, drafts))(__, __state); });
    surplus__WEBPACK_IMPORTED_MODULE_1__["S"](function (__state) { return (rendersOnZoomOut(app, drafts))(__, __state); });
    surplus__WEBPACK_IMPORTED_MODULE_1__["S"](function (__state) { return (isDraggable(app, drafts, panning))(__, __state); });
    surplus__WEBPACK_IMPORTED_MODULE_1__["S"](function (__state) { return (isZoomable(drafts))(__, __state); });
    return __;
})());
};
const CanvasDrafts = (app) => {
    const canvasSizeBrowserPx = {
        width: Object(_lib_draftSignal__WEBPACK_IMPORTED_MODULE_3__["draftSignal"])(app.canvasMgr.canvasSizeBrowserPx.width),
        height: Object(_lib_draftSignal__WEBPACK_IMPORTED_MODULE_3__["draftSignal"])(app.canvasMgr.canvasSizeBrowserPx.height)
    }, zoom = Object(_lib_draftSignal__WEBPACK_IMPORTED_MODULE_3__["draftSignal"])(app.canvasMgr.zoom), center = {
        re: Object(_lib_draftSignal__WEBPACK_IMPORTED_MODULE_3__["draftSignal"])(app.canvasMgr.center.re),
        im: Object(_lib_draftSignal__WEBPACK_IMPORTED_MODULE_3__["draftSignal"])(app.canvasMgr.center.im)
    }, 
    // Treat resolution as a function of our draft zoom and the model's chunkDelta.
    // NOTE: We'd expect to get the same answer if we instead used ChunkSizePx.height together with chunkDelta.im.
    // Also NOTE: We constrain the resolution to be no higher than the model layer's resolution. This is part of our
    // perf fix for the zoom out case. See rendersOnZoomOut.
    resolution = () => Math.min(Math.abs(_canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].width / zoom() / app.canvasMgr.chunkDelta.re()), app.canvasMgr.resolution()), rect = Object(_canvasMgr__WEBPACK_IMPORTED_MODULE_4__["RectCalculations"])({
        origin: app.canvasMgr.origin,
        chunkDelta: app.canvasMgr.chunkDelta,
        canvasSizeBrowserPx,
        resolution,
        center
    });
    return {
        canvasSizeBrowserPx,
        zoom,
        center,
        resolution,
        rect
    };
};
const reportsSizing = (app, drafts, mounted) => (canvas) => {
    if (mounted()) {
        // On intial load, update model values directly
        updateCanvasMgrSizing(app.canvasMgr.canvasSizeBrowserPx);
        let timeout;
        const onResize = () => {
            // On resize, update draft values, then schedule an async commit
            updateCanvasMgrSizing(drafts.canvasSizeBrowserPx);
            if (timeout !== undefined)
                clearTimeout(timeout);
            timeout = setTimeout(commit, 50);
        };
        window.addEventListener('resize', onResize);
        s_js__WEBPACK_IMPORTED_MODULE_0__["default"].cleanup(() => window.removeEventListener('resize', onResize));
    }
    function updateCanvasMgrSizing({ width, height }) {
        const rect = canvas.getBoundingClientRect();
        width(rect.width);
        height(rect.height);
    }
    function commit() {
        drafts.canvasSizeBrowserPx.width.commit();
        drafts.canvasSizeBrowserPx.height.commit();
    }
};
// Default render method for all cases except while zooming out.
// Zooming out gets its own specialized render method for performance reasons. See below.
const rendersJuliaImage = (app, drafts) => (canvas) => {
    if (drafts.zoom() < app.canvasMgr.zoom())
        return;
    const { rect } = drafts, canvasSizeLogicalPx = rect.canvasSizeLogicalPx.width() === null || rect.canvasSizeLogicalPx.height() === null ? null : {
        width: rect.canvasSizeLogicalPx.width(),
        height: rect.canvasSizeLogicalPx.height()
    };
    if (!canvasSizeLogicalPx)
        return;
    // Setting a canvas's width or height properties clears the canvas.
    // So we need to redraw the Julia image after any change to the canvas's logical size.
    // That's why we set width and height imperatively here, rather than using width and
    // height attributes in the <canvas ... /> jsx element above. The surplus-generated computations
    // for attributes don't give the needed control over timing, and lead to the canvas getting cleared
    // occasionally during resizing.
    canvas.width = canvasSizeLogicalPx.width;
    canvas.height = canvasSizeLogicalPx.height;
    const ctx = canvas.getContext('2d');
    Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => {
        const originOffsetPx = rect.originOffsetPx.x() === null || rect.originOffsetPx.y() === null ? null : {
            x: rect.originOffsetPx.x(),
            y: rect.originOffsetPx.y()
        }, canvasRect = rect.canvasRect();
        if (!originOffsetPx || !canvasRect)
            return;
        for (let row = 0; row < canvasRect.widthChunks; row++) {
            for (let col = 0; col < canvasRect.heightChunks; col++) {
                const chunkId = {
                    re: canvasRect.topLeft.re + row,
                    im: canvasRect.topLeft.im + col
                }, topLeftCanvasCoords = {
                    x: chunkId.re * _canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].width + originOffsetPx.x,
                    y: chunkId.im * _canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].height + originOffsetPx.y
                };
                // Each canvas chunk gets its own computation that renders that chunk
                Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => {
                    const imageData = app.imager.imageData().get(chunkId)();
                    if (imageData)
                        ctx.putImageData(imageData, topLeftCanvasCoords.x, topLeftCanvasCoords.y);
                    else
                        ctx.clearRect(topLeftCanvasCoords.x, topLeftCanvasCoords.y, _canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].width, _canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].height);
                });
            }
        }
    });
};
// Specialized render method just for zooming out.
//
// This overcomes the perf limitations of renderAllChunks for this case.
// The simpler approach would be to let CanvasDrafts's resolution move freely, w/o being constrained by app.canvasMgr.resolution,
// and use renderAllChunks in all cases including zoom out.
// That'd work functionally, but it'd have poor perf on zoom out.
// The problem is that as you zoomed out, the resolution would get higher and higher, meaning we'd need more chunks to fill the canvas,
// and thus renderAllChunks would do more and more work on each zoom frame.
// What's worse, more and more of the canvas would be empty, so we'd be spending most of that time computing data for a blank canvas.
// This is the polar opposite of the zoom in case, where the more you zoom in, the lower the resolution gets and thus the less work needed
// to renderAllChunks.
//
// So instead, we cap the resolution. Then, to be able to use the model layer's existing imageData during zoom out,
// this implementation down samples from that imageData to fill the shrinking populated
// area of the canvas. This means the amount of work decreases the more you zoom out.
const rendersOnZoomOut = (app, drafts) => (canvas, prevBuffer) => {
    if (drafts.zoom() >= app.canvasMgr.zoom())
        return;
    const { rect } = drafts, canvasSizeLogicalPx = rect.canvasSizeLogicalPx.width() === null || rect.canvasSizeLogicalPx.height() === null ? null : {
        width: rect.canvasSizeLogicalPx.width(),
        height: rect.canvasSizeLogicalPx.height()
    }, originOffsetPx = rect.originOffsetPx.x() === null || rect.originOffsetPx.y() === null ? null : {
        x: rect.originOffsetPx.x(),
        y: rect.originOffsetPx.y()
    };
    if (!canvasSizeLogicalPx || !originOffsetPx)
        return;
    // Ditto rendersJuliaImage about setting canvas width and height
    canvas.width = canvasSizeLogicalPx.width;
    canvas.height = canvasSizeLogicalPx.height;
    const ctx = canvas.getContext('2d');
    const 
    // We'll shrink the entire canvasRect into a smaller target based on draft zoom
    // Ratio of full zoom to draft zoom, which we're assuming to be smaller.
    fullToDraftZoom = app.canvasMgr.zoom() / drafts.zoom(), targetSizePx = {
        width: Math.floor(canvasSizeLogicalPx.width / fullToDraftZoom),
        height: Math.floor(canvasSizeLogicalPx.height / fullToDraftZoom)
    }, targetCoords = {
        x: Math.round((canvasSizeLogicalPx.width - targetSizePx.width) / 2),
        y: Math.round((canvasSizeLogicalPx.height - targetSizePx.height) / 2)
    }, 
    // Image data is 4 bytes per pixel
    byteLength = targetSizePx.width * targetSizePx.height * 4, 
    // Re-use cached buffer if we have one
    buffer = prevBuffer && prevBuffer.byteLength >= byteLength ? prevBuffer : new ArrayBuffer(byteLength), targetImage = new ImageData(new Uint8ClampedArray(buffer, 0, byteLength), targetSizePx.width, targetSizePx.height);
    // Avoid subscribing to the image data. We expect zoom out to be short-lived,
    // and sampling avoids double renders in case you zoom out while the worker is still computing data.
    s_js__WEBPACK_IMPORTED_MODULE_0__["default"].sample(() => {
        // Populate target image by down-sampling from chunk images
        const chunkId = { re: 0, im: 0 }, lastChunkId = { re: undefined, im: undefined };
        // Cache fetched chunkImage and re-use as long as lastChunkId matches new chunkId.
        // This is a crucial perf optimization, otherwise we get very bogged down looking up chunks in our DataBundle.
        // The intuition is that we expect frequent runs of pixels that map to the same chunk.
        let chunkImage = null;
        // Iterate target pixels. This means amount of work decreases as draft zoom decreases.
        for (let i = 0; i < targetSizePx.width * targetSizePx.height; i++) {
            const 
            // Add half a pixel so we're computing from the center of each pixel
            rowPx = Math.floor(i / targetSizePx.width) + 0.5, colPx = i % targetSizePx.width + 0.5, 
            // Identify the best source pixel for the given target pixel.
            // source{Row|Col}Px -- coords of the source pixel relative to the origin
            sourceRowPx = Math.round(fullToDraftZoom * (rowPx - targetSizePx.height / 2) + canvasSizeLogicalPx.height / 2 - originOffsetPx.y), sourceColPx = Math.round(fullToDraftZoom * (colPx - targetSizePx.width / 2) + canvasSizeLogicalPx.width / 2 - originOffsetPx.x);
            chunkId.re = Math.floor(sourceColPx / _canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].width);
            chunkId.im = Math.floor(sourceRowPx / _canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].height);
            chunkImage = chunkId.re === lastChunkId.re && chunkId.im === lastChunkId.im ? chunkImage : app.imager.imageData().get(chunkId)();
            lastChunkId.re = chunkId.re;
            lastChunkId.im = chunkId.im;
            if (chunkImage) {
                const rowOffset = sourceRowPx - chunkId.im * _canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].height, colOffset = sourceColPx - chunkId.re * _canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].width, bufferOffset = 4 * (rowOffset * _canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].width + colOffset);
                targetImage.data[4 * i] = chunkImage.data[bufferOffset];
                targetImage.data[4 * i + 1] = chunkImage.data[bufferOffset + 1];
                targetImage.data[4 * i + 2] = chunkImage.data[bufferOffset + 2];
                targetImage.data[4 * i + 3] = chunkImage.data[bufferOffset + 3];
            }
            else {
                // Set alpha to 0 to clear this pixel. Don't care about r,g, or b.
                targetImage.data[4 * i + 3] = 0;
            }
        }
    });
    ctx.clearRect(0, 0, canvasSizeLogicalPx.width, canvasSizeLogicalPx.height);
    ctx.putImageData(targetImage, targetCoords.x, targetCoords.y);
    // Return buffer to cache for next zoom frame.
    return buffer;
};
const isDraggable = (app, drafts, panning) => (canvas) => {
    let lastClientX = 0, lastClientY = 0, timeout;
    const mouseDown = (e) => {
        // Avoid triggering on right click, ctrl-click, or any other modified click
        if (e.button === 0 /* Main button */ && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            panning(true);
            lastClientX = e.clientX;
            lastClientY = e.clientY;
        }
    }, mouseMove = (e) => {
        if (panning()) {
            // Note reversed directions. Moving mouse to the left moves center real coord to the RIGHT, ditto for imaginary coord.
            const deltaX = lastClientX - e.clientX, deltaY = lastClientY - e.clientY;
            lastClientX = e.clientX;
            lastClientY = e.clientY;
            s_js__WEBPACK_IMPORTED_MODULE_0__["default"].freeze(() => s_js__WEBPACK_IMPORTED_MODULE_0__["default"].sample(() => {
                drafts.center.re(drafts.center.re() + deltaX * drafts.resolution() / _canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].width * app.canvasMgr.chunkDelta.re());
                drafts.center.im(drafts.center.im() + deltaY * drafts.resolution() / _canvasMgr__WEBPACK_IMPORTED_MODULE_4__["ChunkSizePx"].height * app.canvasMgr.chunkDelta.im());
            }));
            if (timeout === undefined)
                timeout = setTimeout(commit, 50);
        }
    }, mouseUp = () => panning(false), commit = () => {
        timeout = undefined;
        s_js__WEBPACK_IMPORTED_MODULE_0__["default"].freeze(() => {
            drafts.center.re.commit();
            drafts.center.im.commit();
        });
    };
    canvas.addEventListener('mousedown', mouseDown);
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
    s_js__WEBPACK_IMPORTED_MODULE_0__["default"].cleanup(() => {
        canvas.removeEventListener('mousedown', mouseDown);
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
    });
};
// Constants and isZoomable logic below adapted from mapbox-gl-js, Copyright (c) 2016, Mapbox
// See https://github.com/mapbox/mapbox-gl-js/blob/0de15ab814dcd754d8923f0c1b4e7304a6b088a4/src/ui/handler/scroll_zoom.js
const 
// For converting btwn DOM_DELTA_LINE and DOM_DELTA_PIXEL
PX_PER_DOM_DELTA_LINE = 40, 
// Linear scale factor for sensitivity. Higher means wheel gestures are more sensitive across the board.
ZOOM_SENSITIVITY = 1 / 450, 
// Exponent to apply to sensitivity. Set to a number btwn 0 and 1 to fine-tune how sensitivity varies by gesture speed.
ZOOM_SENSITIVITY_EXP = 0.8, 
// Threshold speed to count a gesture as intentional. We'll ignore below this.
MIN_DELTA_PER_MS = 0.5, 
// Duration of a zoom frame
ZOOM_FRAME_RATE_MS = 10, 
// Period of quiet before we commit zoom changes to the model layer.
// This MUST be larger than ZOOM_FRAME_RATE_MS.
ZOOM_UPDATE_DELAY_MS = 100;
const isZoomable = (drafts) => (canvas) => {
    let delta = 0, frameTimeout, commitTimeout;
    const onMouseWheel = (e) => {
        // Default is to zoom the entire browser window
        e.preventDefault();
        // DOM_DELTA_LINE occurs on FF using true mouse wheel (as opposed to trackpad).
        // TODO: DOM_DELTA_PAGE? Sounds like this is Windows only and depends on mouse settings.
        delta += e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * PX_PER_DOM_DELTA_LINE : e.deltaY;
        // Chunking wheel events into discrete "frames" helps smooth over timing differences btwn platforms/browsers/devices,
        // and also gives us more chance to distinguish intentional zooms from accidental "blips".
        if (frameTimeout === undefined)
            frameTimeout = setTimeout(onZoomFrame, ZOOM_FRAME_RATE_MS);
        if (commitTimeout !== undefined)
            clearTimeout(commitTimeout);
        commitTimeout = setTimeout(() => drafts.zoom.commit(), ZOOM_UPDATE_DELAY_MS);
    }, onZoomFrame = () => {
        const _delta = delta;
        delta = 0;
        frameTimeout = undefined;
        // Zooming causes a repaint of the canvas. So enforce a min delta to avoid repaints due to
        // accidental "blips".
        if (Math.abs(_delta / ZOOM_FRAME_RATE_MS) >= MIN_DELTA_PER_MS) {
            const 
            // Use modified sigmoid to calculate scale factor. Idea of using sigmoid comes from Mapbox.
            // Adding an extra ZOOM_SENSITIVITY_EXP lets us compress the sensitivity range slightly by
            // making fast wheel gestures slightly more sensitive and slow wheel gestures slightly less sensitive.
            // In the extreme, if ZOOM_SENSITIVITY_EXP is set to 0, then the scale factor is constant across gesture speeds.
            exp = Math.pow(Math.abs(ZOOM_SENSITIVITY * _delta), ZOOM_SENSITIVITY_EXP), scale = Math.pow(2 / (1 + Math.exp(-exp)), _delta <= 0 ? 1 : -1);
            drafts.zoom(drafts.zoom() * scale);
        }
    };
    canvas.addEventListener('wheel', onMouseWheel);
    s_js__WEBPACK_IMPORTED_MODULE_0__["default"].cleanup(() => canvas.removeEventListener('wheel', onMouseWheel));
};


/***/ }),

/***/ "./src/main/colorHandling/colorizers.ts":
/*!**********************************************!*\
  !*** ./src/main/colorHandling/colorizers.ts ***!
  \**********************************************/
/*! exports provided: linearFade */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linearFade", function() { return linearFade; });
/**
 * Color Julia set by linearly interpolating the provided colors.
 * @param included The color to use for points belonging to the Julia set
 * @param excluded The color to use for points maximally far from the Julia set.
 * In theory, this color will never actually be reached, just approached asymptotically.
 */
function linearFade(included, excluded) {
    return {
        r: m => Math.round(m * included.r + (1 - m) * excluded.r),
        g: m => Math.round(m * included.g + (1 - m) * excluded.g),
        b: m => Math.round(m * included.b + (1 - m) * excluded.b)
    };
}


/***/ }),

/***/ "./src/main/colorHandling/rgb.ts":
/*!***************************************!*\
  !*** ./src/main/colorHandling/rgb.ts ***!
  \***************************************/
/*! exports provided: RGB */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RGB", function() { return RGB; });
const RGBColor = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i, RRGGBBColor = /^#?([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])$/i;
class RGB {
    // All numbers from 0 to 255
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    isValid() {
        return 0 <= this.r && this.r <= 255 && 0 <= this.g && this.g <= 255 && 0 <= this.b && this.b <= 255;
    }
    toString(opts = {}) {
        return this.isValid() ?
            (opts.hideHash ? '' : '#') + (toHex(this.r) + toHex(this.g) + toHex(this.b)).toLowerCase() :
            'INVALID';
    }
    /**
     * Parse a string in #RGB or #RRGGBB format into an RGB color.
     * If input is invalid, returns null.
     * @param str A string in #RGB or #RRGGBB format.
     */
    static parse(str) {
        const RGBMatch = str.match(RGBColor);
        if (RGBMatch) {
            return new RGB(
            // Concatenate each character with itself
            parseHex(RGBMatch[1] + RGBMatch[1]), parseHex(RGBMatch[2] + RGBMatch[2]), parseHex(RGBMatch[3] + RGBMatch[3]));
        }
        const RRGGBBMatch = str.match(RRGGBBColor);
        if (RRGGBBMatch) {
            return new RGB(parseHex(RRGGBBMatch[1]), parseHex(RRGGBBMatch[2]), parseHex(RRGGBBMatch[3]));
        }
        return null;
    }
    static eq(rgb1, rgb2) {
        return rgb1.r === rgb2.r && rgb1.g === rgb2.g && rgb1.b === rgb2.b;
    }
    static invalid() {
        return new RGB(NaN, NaN, NaN);
    }
}
function parseHex(str) {
    return parseInt(str, 16);
}
function toHex(num) {
    return ('00' + num.toString(16)).substr(-2);
}


/***/ }),

/***/ "./src/main/imager.ts":
/*!****************************!*\
  !*** ./src/main/imager.ts ***!
  \****************************/
/*! exports provided: Imager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Imager", function() { return Imager; });
/* harmony import */ var s_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! s-js */ "./node_modules/s-js/dist/es/S.js");
/* harmony import */ var _shared_memoryPool__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/memoryPool */ "./src/shared/memoryPool.ts");
/* harmony import */ var _canvasMgr__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./canvasMgr */ "./src/main/canvasMgr.ts");
/* harmony import */ var _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./colorHandling/rgb */ "./src/main/colorHandling/rgb.ts");
/* harmony import */ var _colorHandling_colorizers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./colorHandling/colorizers */ "./src/main/colorHandling/colorizers.ts");





function Imager(runner, opts) {
    const includedColor = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(opts.includedColor, _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_3__["RGB"].eq), excludedColor = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(opts.excludedColor, _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_3__["RGB"].eq), 
    // TODO: Support other color functions, say from an enum?
    colorizer = Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => Object(_colorHandling_colorizers__WEBPACK_IMPORTED_MODULE_4__["linearFade"])(includedColor(), excludedColor())), 
    // ImageData is 4 bytes per logical pixel
    pool = new _shared_memoryPool__WEBPACK_IMPORTED_MODULE_1__["MemoryPool"](_canvasMgr__WEBPACK_IMPORTED_MODULE_2__["ChunkSizePx"].width * _canvasMgr__WEBPACK_IMPORTED_MODULE_2__["ChunkSizePx"].height * 4), imageData = Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => {
        const data = runner.resultData().map((chunk, chunkId, prevImage) => {
            if (!chunk) {
                // Recycle previous image if chunk is being set to null
                if (prevImage)
                    pool.push(prevImage.data.buffer);
                return null;
            }
            const _colorizer = colorizer(), maxIter = runner.maxIter(), 
            // Modify previous image in place if we have one, otherwise acquire one from the pool
            imageChunk = prevImage ? prevImage.data : new Uint8ClampedArray(pool.acquire());
            for (let i = 0; i / 4 < chunk.length && i < imageChunk.length; i += 4) {
                const magnitude = chunk[i / 4] / maxIter;
                imageChunk[i] = _colorizer.r(magnitude);
                imageChunk[i + 1] = _colorizer.g(magnitude);
                imageChunk[i + 2] = _colorizer.b(magnitude);
                imageChunk[i + 3] = 255;
            }
            return new ImageData(imageChunk, _canvasMgr__WEBPACK_IMPORTED_MODULE_2__["ChunkSizePx"].width, _canvasMgr__WEBPACK_IMPORTED_MODULE_2__["ChunkSizePx"].height);
        }, () => null);
        // Recycle buffers when constructing a new mapped bundle
        s_js__WEBPACK_IMPORTED_MODULE_0__["default"].cleanup(() => data.crack().forEach(chunk => {
            chunk && pool.push(chunk.data.buffer);
        }));
        return data;
    });
    return {
        includedColor,
        excludedColor,
        imageData,
        currentOpts,
        updateOpts
    };
    function currentOpts() {
        return {
            includedColor: includedColor(),
            excludedColor: excludedColor()
        };
    }
    function updateOpts(opts) {
        s_js__WEBPACK_IMPORTED_MODULE_0__["default"].freeze(() => {
            includedColor(opts.includedColor);
            excludedColor(opts.excludedColor);
        });
    }
}


/***/ }),

/***/ "./src/main/index.tsx":
/*!****************************!*\
  !*** ./src/main/index.tsx ***!
  \****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var s_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! s-js */ "./node_modules/s-js/dist/es/S.js");
/* harmony import */ var surplus__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! surplus */ "./node_modules/surplus/es/index.js");
/* harmony import */ var _lib_hashSignal__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/hashSignal */ "./src/main/lib/hashSignal.ts");
/* harmony import */ var _queryHandler__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./queryHandler */ "./src/main/queryHandler.ts");
/* harmony import */ var _app__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./app */ "./src/main/app.ts");
/* harmony import */ var _appView__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./appView */ "./src/main/appView.tsx");






const mounted = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].data(false), view = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].root(() => {
    const hash = Object(_lib_hashSignal__WEBPACK_IMPORTED_MODULE_2__["HashSignal"])(), query = Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => {
        // NOTE: Referencing hash.change instead of hash to prevent
        // cycle with two-way binding below. Same trick used in surplus-realword by Adam Haile:
        // https://github.com/adamhaile/surplus-realworld/blob/master/src/main.tsx
        const idx = hash.change().indexOf('?');
        return idx >= 0 ? hash.change().slice(idx + 1) : '';
    }), opts = Object(_queryHandler__WEBPACK_IMPORTED_MODULE_3__["parseQueryString"])(s_js__WEBPACK_IMPORTED_MODULE_0__["default"].sample(query)), app = Object(_app__WEBPACK_IMPORTED_MODULE_4__["App"])(window.WORKER_URL, opts);
    // Two-way binding btwn URL hash and App options
    Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => hash('#?' + Object(_queryHandler__WEBPACK_IMPORTED_MODULE_3__["formatQueryString"])(app.currentOpts())));
    s_js__WEBPACK_IMPORTED_MODULE_0__["default"].on(query, () => app.updateOpts(Object(_queryHandler__WEBPACK_IMPORTED_MODULE_3__["parseQueryString"])(query())));
    return Object(_appView__WEBPACK_IMPORTED_MODULE_5__["AppView"])({
    "app": app,
    "mounted": mounted
});
});
document.querySelector('#app').appendChild(view);
mounted(true);


/***/ }),

/***/ "./src/main/lib/dataBundle.ts":
/*!************************************!*\
  !*** ./src/main/lib/dataBundle.ts ***!
  \************************************/
/*! exports provided: DataBundle, MappedBundle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DataBundle", function() { return DataBundle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MappedBundle", function() { return MappedBundle; });
/* harmony import */ var s_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! s-js */ "./node_modules/s-js/dist/es/S.js");

class Bundle {
    map(fn, seedFactory) {
        if (seedFactory === undefined)
            return new MappedBundle(this, fn);
        return new MappedBundle(this, fn, seedFactory);
    }
    crack() {
        return this.currentSlots().map(slot => s_js__WEBPACK_IMPORTED_MODULE_0__["default"].sample(slot));
    }
}
class DataBundle extends Bundle {
    constructor() {
        super();
        this.chunks = new Map();
    }
    get(chunkId) {
        const key = chunkIdKey(chunkId), chunk = this.chunks.get(key) || s_js__WEBPACK_IMPORTED_MODULE_0__["default"].data(null);
        this.chunks.set(key, chunk);
        return chunk;
    }
    currentSlots() {
        const slots = [];
        this.chunks.forEach(c => slots.push(c));
        return slots;
    }
}
class MappedBundle extends Bundle {
    constructor(original, mapFn, seedFactory) {
        super();
        this.original = original;
        this.mapFn = mapFn;
        this.seedFactory = seedFactory;
        this.chunks = new Map();
        // All computations created by get below become "adoptive" children of whatever
        // computation/root constructed this MappedBundle.
        s_js__WEBPACK_IMPORTED_MODULE_0__["default"].cleanup(() => {
            this.chunks.forEach(({ dispose }) => dispose());
        });
    }
    get(chunkId) {
        const key = chunkIdKey(chunkId);
        let chunk = this.chunks.get(key);
        if (!chunk) {
            let dispose;
            const upstream = this.original.get(chunkId), value = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].root(_dispose => {
                dispose = _dispose;
                return this.seedFactory ?
                    Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(prev => this.mapFn(upstream(), chunkId, prev), this.seedFactory(chunkId)) :
                    Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => this.mapFn(upstream(), chunkId));
            });
            chunk = { dispose, value };
            this.chunks.set(key, chunk);
        }
        return chunk.value;
    }
    currentSlots() {
        const slots = [];
        this.chunks.forEach(c => slots.push(c.value));
        return slots;
    }
}
function chunkIdKey(chunkId) {
    return `${chunkId.re}+${chunkId.im}i`;
}


/***/ }),

/***/ "./src/main/lib/draftSignal.ts":
/*!*************************************!*\
  !*** ./src/main/lib/draftSignal.ts ***!
  \*************************************/
/*! exports provided: draftSignal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "draftSignal", function() { return draftSignal; });
/* harmony import */ var s_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! s-js */ "./node_modules/s-js/dist/es/S.js");

function draftSignal(original, eq) {
    const effectiveEq = eq || ((t1, t2) => t1 === t2), dirty = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].data(false), 
    // We'll enforce the invariant that whenever we set dirty to true,
    // we also set written to a non-null value.
    written = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].data(null), curr = () => dirty() ? written() : original(), draft = ((val) => {
        if (val === undefined)
            return curr();
        const _curr = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].sample(curr);
        if (!effectiveEq(val, _curr)) {
            return s_js__WEBPACK_IMPORTED_MODULE_0__["default"].freeze(() => {
                dirty(true);
                return written(val);
            });
        }
        else {
            return _curr;
        }
    });
    draft.commit = () => {
        s_js__WEBPACK_IMPORTED_MODULE_0__["default"].sample(() => {
            if (dirty()) {
                s_js__WEBPACK_IMPORTED_MODULE_0__["default"].freeze(() => {
                    original(written());
                    dirty(false);
                });
            }
        });
    };
    draft.revert = () => {
        s_js__WEBPACK_IMPORTED_MODULE_0__["default"].freeze(() => {
            dirty(false);
            written(null); // To free for GC
        });
    };
    return draft;
}


/***/ }),

/***/ "./src/main/lib/hashSignal.ts":
/*!************************************!*\
  !*** ./src/main/lib/hashSignal.ts ***!
  \************************************/
/*! exports provided: HashSignal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HashSignal", function() { return HashSignal; });
/* harmony import */ var s_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! s-js */ "./node_modules/s-js/dist/es/S.js");
/**
 * hashSignal.ts by Adam Haile. From surplus-realword:
 * https://github.com/adamhaile/surplus-realworld/blob/master/src/app/hashSignal.ts
 */

const HashSignal = () => {
    const 
    // we need to detect sets to the data signals so that we can also change the 
    // window location, so we make underlying data signals and wrap them
    _hash = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].data(window.location.hash), _change = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].data(window.location.hash), 
    // setting hash also replaces current location in browser
    hash = ((loc) => loc === undefined ? _hash() : set(loc, false)), 
    // setting change also sets hash and assigns a new location in browser
    change = ((loc) => loc === undefined ? _change() : set(loc, true)), set = (loc, isChange) => s_js__WEBPACK_IMPORTED_MODULE_0__["default"].freeze(() => {
        _hash(loc);
        if (isChange)
            _change(loc);
        window.location[isChange ? 'assign' : 'replace'](loc);
        return loc;
    });
    hash.change = change;
    // change from the other direction: set signals when a hashchange event occurs
    const onHashChange = () => s_js__WEBPACK_IMPORTED_MODULE_0__["default"].freeze(() => {
        if ((window.location.hash || '#') !== _hash())
            _hash(_change(window.location.hash));
    });
    window.addEventListener('hashchange', onHashChange);
    s_js__WEBPACK_IMPORTED_MODULE_0__["default"].cleanup(() => window.removeEventListener('hashchange', onHashChange));
    return hash;
};


/***/ }),

/***/ "./src/main/queryHandler.ts":
/*!**********************************!*\
  !*** ./src/main/queryHandler.ts ***!
  \**********************************/
/*! exports provided: parseQueryString, formatQueryString */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseQueryString", function() { return parseQueryString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatQueryString", function() { return formatQueryString; });
/* harmony import */ var _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./colorHandling/rgb */ "./src/main/colorHandling/rgb.ts");

/**
 * Parse query string into App options
 * @param query The query string, with or without leading '?'
 */
function parseQueryString(query) {
    const params = new URLSearchParams(query), cRe = params.get('c_re') ? +params.get('c_re') : null, cIm = params.get('c_im') ? +params.get('c_im') : null, ctrRe = params.get('ctr_re') ? +params.get('ctr_re') : null, ctrIm = params.get('ctr_im') ? +params.get('ctr_im') : null, zoom = params.get('zoom') ? +params.get('zoom') : null, colorIn = params.get('color_in') ? _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_0__["RGB"].parse(params.get('color_in')) : null, colorOut = params.get('color_out') ? _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_0__["RGB"].parse(params.get('color_out')) : null, res = params.get('res') ? +params.get('res') : null, iter = params.get('iter') ? +params.get('iter') : null, rad = params.get('rad') ? +params.get('rad') : null;
    return {
        canvas: {
            center: {
                re: ctrRe !== null ? ctrRe : undefined,
                im: ctrIm !== null ? ctrIm : undefined
            },
            zoom: zoom !== null && zoom > 0 ? zoom : undefined,
            resolution: res !== null && res > 0 ? res : undefined
        },
        escapeTime: {
            c: {
                re: cRe !== null ? cRe : undefined,
                im: cIm !== null ? cIm : undefined
            },
            maxIter: iter !== null && iter > 0 ? iter : undefined,
            escapeRadius: rad !== null && rad > 0 ? rad : undefined
        },
        imager: {
            includedColor: colorIn || undefined,
            excludedColor: colorOut || undefined
        }
    };
}
/**
 * Format the query string for the given App options
 * @returns The formatted query string without leading '?'
 */
function formatQueryString(opts) {
    const params = new URLSearchParams();
    params.set('c_re', '' + opts.escapeTime.c.re);
    params.set('c_im', '' + opts.escapeTime.c.im);
    params.set('ctr_re', '' + opts.canvas.center.re);
    params.set('ctr_im', '' + opts.canvas.center.im);
    params.set('zoom', '' + opts.canvas.zoom);
    params.set('color_in', opts.imager.includedColor.toString({ hideHash: true }));
    params.set('color_out', opts.imager.excludedColor.toString({ hideHash: true }));
    params.set('res', '' + opts.canvas.resolution);
    params.set('iter', '' + opts.escapeTime.maxIter);
    params.set('rad', '' + opts.escapeTime.escapeRadius);
    return params.toString();
}


/***/ }),

/***/ "./src/main/runner.ts":
/*!****************************!*\
  !*** ./src/main/runner.ts ***!
  \****************************/
/*! exports provided: EscapeTimeRunner */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EscapeTimeRunner", function() { return EscapeTimeRunner; });
/* harmony import */ var s_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! s-js */ "./node_modules/s-js/dist/es/S.js");
/* harmony import */ var _shared_memoryPool__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/memoryPool */ "./src/shared/memoryPool.ts");
/* harmony import */ var _lib_dataBundle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/dataBundle */ "./src/main/lib/dataBundle.ts");
/* harmony import */ var _canvasMgr__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./canvasMgr */ "./src/main/canvasMgr.ts");




function EscapeTimeRunner(canvasMgr, workerUrl, opts) {
    const c = {
        re: s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(opts.c.re),
        im: s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(opts.c.im)
    }, maxIter = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(opts.maxIter), escapeRadius = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(opts.escapeRadius), 
    // EscapeTime data is 2 bytes per logical pixel
    pool = new _shared_memoryPool__WEBPACK_IMPORTED_MODULE_1__["MemoryPool"](_canvasMgr__WEBPACK_IMPORTED_MODULE_3__["ChunkSizePx"].width * _canvasMgr__WEBPACK_IMPORTED_MODULE_3__["ChunkSizePx"].height * 2), resetMsgData = Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => ({
        escapeTime: {
            c: {
                re: c.re(),
                im: c.im()
            },
            maxIter: maxIter(),
            escapeRadius: escapeRadius()
        },
        canvas: canvasMgr.canvasConfig()
    })), dataGen = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].on(resetMsgData, count => count + 1, -1), resultData = Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => {
        resetMsgData();
        const data = new _lib_dataBundle__WEBPACK_IMPORTED_MODULE_2__["DataBundle"]();
        // Recycle buffers when constructing a new data bundle
        s_js__WEBPACK_IMPORTED_MODULE_0__["default"].cleanup(() => data.crack().forEach(chunk => {
            chunk && pool.push(chunk.buffer);
        }));
        // Also recycle buffers if a chunk is updated with a new buffer or set to null
        data.map((curr, chunkId, prev) => {
            if (prev && curr !== prev)
                pool.push(prev.buffer);
            return curr;
        }, () => null);
        return data;
    });
    const worker = new Worker(workerUrl);
    worker.onmessage = ev => {
        const msg = ev.data;
        if (msg.type === 'startup-failure') {
            throw new Error(msg.err);
        }
        else if (msg.type === 'chunk-update') {
            // Before we commit data to the model, make sure the message's dataGen matches our current
            if (msg.dataGen === dataGen()) {
                resultData().get(msg.chunkId)(new Uint16Array(msg.data));
            }
        }
    };
    const workerInit = {
        type: 'worker-init',
        worker: {
            chunkSizePx: _canvasMgr__WEBPACK_IMPORTED_MODULE_3__["ChunkSizePx"],
            pauseInterval: 250
        }
    };
    worker.postMessage(workerInit);
    let instructionSeqNo = 0;
    Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(() => {
        // Send worker a reset msg whenever our reset msg data changes...
        const resetMsg = {
            type: 'worker-reset',
            escapeTime: resetMsgData().escapeTime,
            canvas: resetMsgData().canvas,
            dataGen: dataGen(),
            seqNo: instructionSeqNo++
        };
        worker.postMessage(resetMsg);
        // After that, send an add jobs msg whenever the canvas rect changes
        Object(s_js__WEBPACK_IMPORTED_MODULE_0__["default"])(prev => {
            const 
            // Recycle buffers back to the worker
            returningBuffers = pool.drain(), canvasRect = canvasMgr.rect.canvasRect(), jobs = canvasRect ?
                prev ?
                    excludedRects(canvasRect, prev) :
                    [canvasRect] :
                [], addJobsMsg = {
                type: 'add-jobs',
                jobs,
                seqNo: instructionSeqNo++,
                buffers: returningBuffers
            };
            worker.postMessage(addJobsMsg, returningBuffers);
            return canvasRect;
        }, null);
    });
    return {
        c,
        maxIter,
        escapeRadius,
        // Expose resultData as read-only
        resultData: resultData,
        currentOpts,
        updateOpts
    };
    function currentOpts() {
        return {
            c: {
                re: c.re(),
                im: c.im()
            },
            maxIter: maxIter(),
            escapeRadius: escapeRadius()
        };
    }
    function updateOpts(opts) {
        s_js__WEBPACK_IMPORTED_MODULE_0__["default"].freeze(() => {
            c.re(opts.c.re);
            c.im(opts.c.im);
            maxIter(opts.maxIter);
            escapeRadius(opts.escapeRadius);
        });
    }
}
/**
 * Get those portions of rect1 that are excluded by rect2, represented as a list of sub-rects.
 * In set notation, returns rect1 - rect2.
 */
function excludedRects(rect1, rect2) {
    const results = [], rectAbove = {
        topLeft: rect1.topLeft,
        widthChunks: rect1.widthChunks,
        heightChunks: Math.max(Math.min(rect2.topLeft.im - rect1.topLeft.im, rect1.heightChunks), 0)
    };
    if (rectAbove.widthChunks * rectAbove.heightChunks > 0)
        results.push(rectAbove);
    const rect1Bottom = rect1.topLeft.im + rect1.heightChunks, rect2Bottom = rect2.topLeft.im + rect2.heightChunks, rectBelowHeight = Math.max(Math.min(rect1Bottom - rect2Bottom, rect1.heightChunks), 0), rectBelow = {
        topLeft: {
            re: rect1.topLeft.re,
            im: rect1Bottom - rectBelowHeight
        },
        widthChunks: rect1.widthChunks,
        heightChunks: rectBelowHeight
    };
    if (rectBelow.widthChunks * rectBelow.heightChunks > 0)
        results.push(rectBelow);
    const rectAboveBottom = rectAbove.topLeft.im + rectAbove.heightChunks, 
    // We'll give rectAbove/rectBelow priority over rectLeft/rectRight so the returned rects are all disjoint.
    // This gives the height available btwn the bottom of rectAbove and the top of rectBelow.
    sideRectsHeight = Math.max(rectBelow.topLeft.im - rectAboveBottom, 0), rectLeft = {
        topLeft: {
            re: rect1.topLeft.re,
            im: rectAboveBottom
        },
        widthChunks: Math.max(Math.min(rect2.topLeft.re - rect1.topLeft.re, rect1.widthChunks), 0),
        heightChunks: sideRectsHeight
    };
    if (rectLeft.widthChunks * rectLeft.heightChunks > 0)
        results.push(rectLeft);
    const rect1Right = rect1.topLeft.re + rect1.widthChunks, rect2Right = rect2.topLeft.re + rect2.widthChunks, rectRightWidth = Math.max(Math.min(rect1Right - rect2Right, rect1.widthChunks), 0), rectRight = {
        topLeft: {
            re: rect1Right - rectRightWidth,
            im: rectAboveBottom
        },
        widthChunks: rectRightWidth,
        heightChunks: sideRectsHeight
    };
    if (rectRight.widthChunks * rectRight.heightChunks > 0)
        results.push(rectRight);
    return results;
}


/***/ }),

/***/ "./src/main/settings.ts":
/*!******************************!*\
  !*** ./src/main/settings.ts ***!
  \******************************/
/*! exports provided: Settings, ColorThemes, ColorSettings */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Settings", function() { return Settings; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColorThemes", function() { return ColorThemes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColorSettings", function() { return ColorSettings; });
/* harmony import */ var s_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! s-js */ "./node_modules/s-js/dist/es/S.js");
/* harmony import */ var _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./colorHandling/rgb */ "./src/main/colorHandling/rgb.ts");


function Settings(canvasMgr, runner, imager) {
    const color = ColorSettings(imager);
    return {
        color
    };
}
const ColorThemes = [{
        name: 'Dark',
        includedColor: _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].parse('#f00'),
        excludedColor: _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].parse('#000')
    }, {
        name: 'Light',
        includedColor: _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].parse('#0df'),
        excludedColor: _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].parse('#fff')
    }, {
        name: 'High Contrast',
        includedColor: _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].parse('#f9ffff'),
        excludedColor: _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].parse('#000007')
    }];
function ColorSettings(imager) {
    const theme = s_js__WEBPACK_IMPORTED_MODULE_0__["default"].value(s_js__WEBPACK_IMPORTED_MODULE_0__["default"].sample(() => ColorThemes.find(t => _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].eq(t.includedColor, imager.includedColor()) &&
        _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].eq(t.excludedColor, imager.excludedColor())) || null));
    s_js__WEBPACK_IMPORTED_MODULE_0__["default"].on(theme, () => {
        if (theme()) {
            imager.includedColor(theme().includedColor);
            imager.excludedColor(theme().excludedColor);
        }
    }, undefined, true);
    return {
        theme
    };
}


/***/ }),

/***/ "./src/main/settingsView.tsx":
/*!***********************************!*\
  !*** ./src/main/settingsView.tsx ***!
  \***********************************/
/*! exports provided: SettingsView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SettingsView", function() { return SettingsView; });
/* harmony import */ var surplus__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! surplus */ "./node_modules/surplus/es/index.js");
/* harmony import */ var _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./colorHandling/rgb */ "./src/main/colorHandling/rgb.ts");
/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./settings */ "./src/main/settings.ts");



const SettingsView = ({ app }) => (function () {
    var __, __div1, __div1_label1, __div1_input2, __div1_insert3, __div1_input4, __div1_insert5, __div2, __div2_label1, __div2_input2, __div3, __div3_label1, __div3_input2, __insert4, __insert5;
    __ = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", "settings", null);
    __div1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", "setting setting-c", __);
    __div1_label1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("label", "setting-label", __div1);
    __div1_label1.textContent = "c";
    __div1_input2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", null, __div1);
    __div1_insert3 = surplus__WEBPACK_IMPORTED_MODULE_0__["createTextNode"]('', __div1)
    __div1_input4 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", null, __div1);
    __div1_insert5 = surplus__WEBPACK_IMPORTED_MODULE_0__["createTextNode"]('', __div1)
    __div2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", "setting setting-max-iter", __);
    __div2_label1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("label", "setting-label", __div2);
    __div2_label1.textContent = "Max. iter.";
    __div2_input2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", null, __div2);
    __div3 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", "setting setting-escape-radius", __);
    __div3_label1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("label", "setting-label", __div3);
    __div3_label1.textContent = "Escape Radius";
    __div3_input2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", null, __div3);
    __insert4 = surplus__WEBPACK_IMPORTED_MODULE_0__["createTextNode"]('', __)
    __insert5 = surplus__WEBPACK_IMPORTED_MODULE_0__["createTextNode"]('', __)
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function () {
        __div1_input2.value = app.runner.c.re();
        __div1_input2.onchange = e => app.runner.c.re(+e.currentTarget.value);
    });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function (__range) { return surplus__WEBPACK_IMPORTED_MODULE_0__["insert"](__range, ' + '); }, { start: __div1_insert3, end: __div1_insert3 });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function () {
        __div1_input4.value = app.runner.c.im();
        __div1_input4.onchange = e => app.runner.c.im(+e.currentTarget.value);
    });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function (__range) { return surplus__WEBPACK_IMPORTED_MODULE_0__["insert"](__range, ' i'); }, { start: __div1_insert5, end: __div1_insert5 });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function () {
        __div2_input2.value = app.runner.maxIter();
        __div2_input2.onchange = e => app.runner.maxIter(+e.currentTarget.value);
    });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function () {
        __div3_input2.value = app.runner.escapeRadius();
        __div3_input2.onchange = e => app.runner.escapeRadius(+e.currentTarget.value);
    });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function (__range) { return surplus__WEBPACK_IMPORTED_MODULE_0__["insert"](__range, ColorSelector({
    "app": app
})); }, { start: __insert4, end: __insert4 });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function (__range) { return surplus__WEBPACK_IMPORTED_MODULE_0__["insert"](__range, ZoomButtons({
    "app": app
})); }, { start: __insert5, end: __insert5 });
    return __;
})();
const ZoomButtons = ({ app }) => (function () {
    var __, __span1, __span2;
    __ = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", "zoom-buttons", null);
    __span1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("span", "zoom-btn", __);
    __span2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("span", "zoom-btn", __);
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function () {
        __span1.onclick = () => app.canvasMgr.zoom(app.canvasMgr.zoom() * 1.1);
        __span1.textContent = "+";
    });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function () {
        __span2.onclick = () => app.canvasMgr.zoom(app.canvasMgr.zoom() * 0.9);
        __span2.textContent = "-";
    });
    return __;
})();
const ColorSelector = ({ app }) => (function () {
    var __, __div1, __div1_label1, __div1_select2, __div1_select2_insert1, __div1_select2_option2, __insert2;
    __ = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", "color-selector", null);
    __div1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", "setting", __);
    __div1_label1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("label", "setting-label", __div1);
    __div1_label1.textContent = "Theme";
    __div1_select2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("select", "color-dropdown", __div1);
    __div1_select2_insert1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createTextNode"]('', __div1_select2)
    __div1_select2_option2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("option", null, __div1_select2);
    __div1_select2_option2.value = -1;
    __div1_select2_option2.textContent = "Custom";
    __insert2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createTextNode"]('', __)
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function (__range) { return surplus__WEBPACK_IMPORTED_MODULE_0__["insert"](__range, _settings__WEBPACK_IMPORTED_MODULE_2__["ColorThemes"].map((t, idx) => (function () {
    var __;
    __ = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("option", null, null);
    __.value = idx;
    surplus__WEBPACK_IMPORTED_MODULE_0__["content"](__, t.name, "");
    return __;
})())); }, { start: __div1_select2_insert1, end: __div1_select2_insert1 });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function () {
        __div1_select2.value = app.settings.color.theme() ? _settings__WEBPACK_IMPORTED_MODULE_2__["ColorThemes"].indexOf(app.settings.color.theme()) : -1;
        __div1_select2.onchange = e => app.settings.color.theme(_settings__WEBPACK_IMPORTED_MODULE_2__["ColorThemes"][+e.currentTarget.value] || null);
    });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function (__range) { return surplus__WEBPACK_IMPORTED_MODULE_0__["insert"](__range, !app.settings.color.theme() &&
    (function () {
    var __, __div1, __div1_label1, __div1_input2, __div2, __div2_label1, __div2_input2;
    __ = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", "color-custom", null);
    __div1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", "setting", __);
    __div1_label1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("label", "setting-label", __div1);
    __div1_label1.textContent = "Color In";
    __div1_input2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", null, __div1);
    __div2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", "setting", __);
    __div2_label1 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("label", "setting-label", __div2);
    __div2_label1.textContent = "Color Out";
    __div2_input2 = surplus__WEBPACK_IMPORTED_MODULE_0__["createElement"]("input", null, __div2);
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function () {
        __div1_input2.value = app.imager.includedColor().toString();
        __div1_input2.onchange = e => app.imager.includedColor(_colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].parse(e.currentTarget.value) || _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].invalid());
    });
    surplus__WEBPACK_IMPORTED_MODULE_0__["S"](function () {
        __div2_input2.value = app.imager.excludedColor().toString();
        __div2_input2.onchange = e => app.imager.excludedColor(_colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].parse(e.currentTarget.value) || _colorHandling_rgb__WEBPACK_IMPORTED_MODULE_1__["RGB"].invalid());
    });
    return __;
})()); }, { start: __insert2, end: __insert2 });
    return __;
})();


/***/ }),

/***/ "./src/shared/memoryPool.ts":
/*!**********************************!*\
  !*** ./src/shared/memoryPool.ts ***!
  \**********************************/
/*! exports provided: MemoryPool */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MemoryPool", function() { return MemoryPool; });
class MemoryPool {
    // TODO: Allow specifying a limit on the number of buffers to keep.
    // To allow memory usage to drop if needs reduce.
    constructor(
    // Size in bytes
    byteLength) {
        this.byteLength = byteLength;
        this.stack = [];
    }
    /**
     * Push a buffer back into the pool for later reuse.
     * Throws if buffer is not at least `this.byteLength` bytes.
     */
    push(buffer) {
        if (buffer.byteLength < this.byteLength) {
            throw new Error(`Can't absorb buffer. byteLength must be at least ${this.byteLength}`);
        }
        this.stack.push(buffer);
    }
    /**
     * Push multiple buffers back into the pool.
     * Throws if any buffer is less than `this.requiredSize()` bytes.
     */
    pushAll(buffers) {
        for (let i = 0; i < buffers.length; i++) {
            this.push(buffers[i]);
        }
    }
    /**
     * Acquire a buffer from the pool, if one's available, otherwise constructs a new one
     * with the min byte length.
     */
    acquire() {
        return this.stack.pop() || new ArrayBuffer(this.byteLength);
    }
    /**
     * Empty the pool and return the former contents.
     */
    drain() {
        const stack = this.stack;
        this.stack = [];
        return stack;
    }
}


/***/ })

/******/ });