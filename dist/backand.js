/*********************************************************
 * @backand/vanilla-sdk - Backand SDK for JavaScript
 * @version v1.1.2
 * @link https://github.com/backand/vanilla-sdk#readme
 * @copyright Copyright (c) 2017 Backand https://www.backand.com/
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 * @Compiled At: 2017-02-14
  *********************************************************/
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.backand = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.0.5
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  return typeof x === 'function' || typeof x === 'object' && x !== null;
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = require;
    var vertx = r('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  _resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
  try {
    then.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        _resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      _reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      _reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    _reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return _resolve(promise, value);
    }, function (reason) {
      return _reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$) {
  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$ === GET_THEN_ERROR) {
      _reject(promise, GET_THEN_ERROR.error);
    } else if (then$$ === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$)) {
      handleForeignThenable(promise, maybeThenable, then$$);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function _resolve(promise, value) {
  if (promise === value) {
    _reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function _reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      _reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      _resolve(promise, value);
    } else if (failed) {
      _reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      _reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      _resolve(promise, value);
    }, function rejectPromise(reason) {
      _reject(promise, reason);
    });
  } catch (e) {
    _reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this._input = input;
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate();
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    _reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._enumerate = function () {
  var length = this.length;
  var _input = this._input;

  for (var i = 0; this._state === PENDING && i < length; i++) {
    this._eachEntry(_input[i], i);
  }
};

Enumerator.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$ = c.resolve;

  if (resolve$$ === resolve) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$) {
        return resolve$$(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$(entry), i);
  }
};

Enumerator.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      _reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  _reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
  }
}

Promise.all = all;
Promise.race = race;
Promise.resolve = resolve;
Promise.reject = reject;
Promise._setScheduler = setScheduler;
Promise._setAsap = setAsap;
Promise._asap = asap;

Promise.prototype = {
  constructor: Promise,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

function polyfill() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise;
}

// Strange compat..
Promise.polyfill = polyfill;
Promise.Promise = Promise;

return Promise;

})));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var EVENTS = exports.EVENTS = {
  SIGNIN: 'SIGNIN',
  SIGNOUT: 'SIGNOUT',
  SIGNUP: 'SIGNUP'
};

var URLS = exports.URLS = {
  token: 'token',
  signup: '1/user/signup',
  requestResetPassword: '1/user/requestResetPassword',
  resetPassword: '1/user/resetPassword',
  changePassword: '1/user/changePassword',
  // socialLoginWithCode: '1/user/PROVIDER/code',
  socialSigninWithToken: '1/user/PROVIDER/token',
  // socialSingupWithCode: '1/user/PROVIDER/signupCode',
  signout: '1/user/signout',
  profile: 'api/account/profile',
  objects: '1/objects',
  objectsAction: '1/objects/action',
  query: '1/query/data',
  socialProviders: '1/user/socialProviders'
};

var SOCIAL_PROVIDERS = exports.SOCIAL_PROVIDERS = {
  github: { name: 'github', label: 'Github', url: 'www.github.com', css: { backgroundColor: '#444' }, id: 1 },
  google: { name: 'google', label: 'Google', url: 'www.google.com', css: { backgroundColor: '#dd4b39' }, id: 2 },
  facebook: { name: 'facebook', label: 'Facebook', url: 'www.facebook.com', css: { backgroundColor: '#3b5998' }, id: 3 },
  twitter: { name: 'twitter', label: 'Twitter', url: 'www.twitter.com', css: { backgroundColor: '#55acee' }, id: 4 }
};

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  appName: null,
  anonymousToken: null,
  useAnonymousTokenByDefault: true,
  signUpToken: null,
  apiUrl: 'https://api.backand.com',
  storage: {},
  storagePrefix: 'BACKAND_',
  manageRefreshToken: true,
  runSigninAfterSignup: true,
  runSocket: false,
  socketUrl: 'https://socket.backand.com',
  exportUtils: false,
  isMobile: false,
  mobilePlatform: 'ionic'
};

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var filter = exports.filter = {
  create: function create(fieldName, operator, value) {
    return {
      fieldName: fieldName,
      operator: operator,
      value: value
    };
  },
  operators: {
    numeric: { equals: "equals", notEquals: "notEquals", greaterThan: "greaterThan", greaterThanOrEqualsTo: "greaterThanOrEqualsTo", lessThan: "lessThan", lessThanOrEqualsTo: "lessThanOrEqualsTo", empty: "empty", notEmpty: "notEmpty" },
    date: { equals: "equals", notEquals: "notEquals", greaterThan: "greaterThan", greaterThanOrEqualsTo: "greaterThanOrEqualsTo", lessThan: "lessThan", lessThanOrEqualsTo: "lessThanOrEqualsTo", empty: "empty", notEmpty: "notEmpty" },
    text: { equals: "equals", notEquals: "notEquals", startsWith: "startsWith", endsWith: "endsWith", contains: "contains", notContains: "notContains", empty: "empty", notEmpty: "notEmpty" },
    boolean: { equals: "equals" },
    relation: { in: "in" }
  }
};

var sort = exports.sort = {
  create: function create(fieldName, order) {
    return {
      fieldName: fieldName,
      order: order
    };
  },
  orders: { asc: "asc", desc: "desc" }
};

var exclude = exports.exclude = {
  options: { metadata: "metadata", totalRows: "totalRows", all: "metadata,totalRows" }
};

var StorageAbstract = exports.StorageAbstract = function () {
  function StorageAbstract() {
    _classCallCheck(this, StorageAbstract);

    if (this.constructor === StorageAbstract) {
      throw new TypeError("Can not construct abstract class.");
    }
    if (this.setItem === undefined || this.setItem === StorageAbstract.prototype.setItem) {
      throw new TypeError("Must override setItem method.");
    }
    if (this.getItem === undefined || this.getItem === StorageAbstract.prototype.getItem) {
      throw new TypeError("Must override getItem method.");
    }
    if (this.removeItem === undefined || this.removeItem === StorageAbstract.prototype.removeItem) {
      throw new TypeError("Must override removeItem method.");
    }
    if (this.clear === undefined || this.clear === StorageAbstract.prototype.clear) {
      throw new TypeError("Must override clear method.");
    }
    // this.data = {};
  }

  _createClass(StorageAbstract, [{
    key: "setItem",
    value: function setItem(id, val) {
      throw new TypeError("Do not call abstract method setItem from child.");
      // return this.data[id] = String(val);
    }
  }, {
    key: "getItem",
    value: function getItem(id) {
      throw new TypeError("Do not call abstract method getItem from child.");
      // return this.data.hasOwnProperty(id) ? this._data[id] : null;
    }
  }, {
    key: "removeItem",
    value: function removeItem(id) {
      throw new TypeError("Do not call abstract method removeItem from child.");
      // delete this.data[id];
      // return null;
    }
  }, {
    key: "clear",
    value: function clear() {
      throw new TypeError("Do not call abstract method clear from child.");
      // return this.data = {};
    }
  }]);

  return StorageAbstract;
}();

var MemoryStorage = exports.MemoryStorage = function (_StorageAbstract) {
  _inherits(MemoryStorage, _StorageAbstract);

  function MemoryStorage() {
    _classCallCheck(this, MemoryStorage);

    var _this = _possibleConstructorReturn(this, (MemoryStorage.__proto__ || Object.getPrototypeOf(MemoryStorage)).call(this));

    _this.data = {};
    return _this;
  }

  _createClass(MemoryStorage, [{
    key: "setItem",
    value: function setItem(id, val) {
      return this.data[id] = String(val);
    }
  }, {
    key: "getItem",
    value: function getItem(id) {
      return this.data.hasOwnProperty(id) ? this.data[id] : null;
    }
  }, {
    key: "removeItem",
    value: function removeItem(id) {
      delete this.data[id];
      return null;
    }
  }, {
    key: "clear",
    value: function clear() {
      return this.data = {};
    }
  }]);

  return MemoryStorage;
}(StorageAbstract);

},{}],6:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Task: Polyfills


var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _constants = require('./constants');

var constants = _interopRequireWildcard(_constants);

var _helpers = require('./helpers');

var helpers = _interopRequireWildcard(_helpers);

var _utils = require('./utils/utils');

var _utils2 = _interopRequireDefault(_utils);

var _storage = require('./utils/storage');

var _storage2 = _interopRequireDefault(_storage);

var _http = require('./utils/http');

var _http2 = _interopRequireDefault(_http);

var _interceptors = require('./utils/interceptors');

var _interceptors2 = _interopRequireDefault(_interceptors);

var _socket = require('./utils/socket');

var _socket2 = _interopRequireDefault(_socket);

var _detector = require('./utils/detector');

var _detector2 = _interopRequireDefault(_detector);

var _auth = require('./services/auth');

var _auth2 = _interopRequireDefault(_auth);

var _object = require('./services/object');

var _object2 = _interopRequireDefault(_object);

var _file = require('./services/file');

var _file2 = _interopRequireDefault(_file);

var _query = require('./services/query');

var _query2 = _interopRequireDefault(_query);

var _user = require('./services/user');

var _user2 = _interopRequireDefault(_user);

var _es6Promise = require('es6-promise');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function (local) {
  if (local.Promise) {
    return;
  }
  local.Promise = _es6Promise.Promise;
})(typeof self !== 'undefined' ? self : new Function('return this')());

// TASK: run tests to identify the runtime environment
var detector = (0, _detector2.default)();

// TASK: set first defaults base on detector results
_defaults2.default["storage"] = detector.env === 'browser' ? window.localStorage : new helpers.MemoryStorage();
_defaults2.default["isMobile"] = detector.device === 'mobile' || detector.device === 'tablet';

// TASK: get data from url in social sign-in popup
if (detector.env !== 'node' && detector.env !== 'react-native' && window.location) {
  var dataMatch = /(data|error)=(.+)/.exec(window.location.href);
  if (dataMatch && dataMatch[1] && dataMatch[2]) {
    var data = {
      data: JSON.parse(decodeURIComponent(dataMatch[2].replace(/#.*/, '')))
    };
    data.status = dataMatch[1] === 'data' ? 200 : 0;
    if (detector.type !== 'Internet Explorer') {
      window.opener.postMessage(JSON.stringify(data), location.origin);
    } else {
      localStorage.setItem('SOCIAL_DATA', JSON.stringify(data));
    }
  }
}

var backand = {
  constants: constants,
  helpers: helpers
};
backand.init = function () {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


  // TASK: combine defaults with user config
  _extends(_defaults2.default, config);
  // console.log(defaults);

  // TASK: verify new defaults
  if (!_defaults2.default.appName) throw new Error('appName is missing');
  if (!_defaults2.default.anonymousToken) _defaults2.default.useAnonymousTokenByDefault = false;

  // TASK: init utils
  _extends(_utils2.default, {
    storage: new _storage2.default(_defaults2.default.storage, _defaults2.default.storagePrefix),
    http: _http2.default.create({
      baseURL: _defaults2.default.apiUrl
    }),
    detector: detector
  });
  if (_defaults2.default.runSocket) {
    _extends(_utils2.default, {
      socket: new _socket2.default(_defaults2.default.socketUrl)
    });
  }

  // TASK: sets http interceptors for authorization header & refresh tokens
  _utils2.default.http.config.interceptors = {
    request: _interceptors2.default.requestInterceptor,
    response: _interceptors2.default.responseInterceptor,
    responseError: _interceptors2.default.responseErrorInterceptor
  };

  // TASK: clean cache if needed
  var storeUser = _utils2.default.storage.get('user');
  if (storeUser && storeUser.token["AnonymousToken"] && (storeUser.token["AnonymousToken"] !== _defaults2.default.anonymousToken || !_defaults2.default.useAnonymousTokenByDefault)) {
    _utils2.default.storage.remove('user');
  }

  // TASK: expose backand namespace to window
  delete backand.init;
  _extends(backand, _auth2.default, {
    defaults: _defaults2.default,
    object: _object2.default,
    file: _file2.default,
    query: _query2.default,
    user: _user2.default
  });
  if (_defaults2.default.runSocket) {
    storeUser = _utils2.default.storage.get('user');
    storeUser && _utils2.default.socket.connect(storeUser.token.Authorization || null, _defaults2.default.anonymousToken, _defaults2.default.appName);
    _extends(backand, {
      on: _socket2.default.prototype.on.bind(_utils2.default.socket)
    });
  }
  if (_defaults2.default.exportUtils) {
    _extends(backand, { utils: _utils2.default });
  }
};

module.exports = backand;

},{"./constants":3,"./defaults":4,"./helpers":5,"./services/auth":7,"./services/file":8,"./services/object":9,"./services/query":10,"./services/user":11,"./utils/detector":12,"./utils/http":14,"./utils/interceptors":15,"./utils/socket":16,"./utils/storage":17,"./utils/utils":18,"es6-promise":1}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _constants = require('./../constants');

var _defaults = require('./../defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _utils = require('./../utils/utils');

var _utils2 = _interopRequireDefault(_utils);

var _fns = require('./../utils/fns');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  __handleRefreshToken__: __handleRefreshToken__,
  useAnonymousAuth: useAnonymousAuth,
  signin: signin,
  signup: signup,
  socialSignin: socialSignin,
  socialSigninWithToken: socialSigninWithToken,
  socialSignup: socialSignup,
  requestResetPassword: requestResetPassword,
  resetPassword: resetPassword,
  changePassword: changePassword,
  signout: signout,
  getSocialProviders: getSocialProviders
};


function __dispatchEvent__(name) {
  var event = void 0;
  if (_defaults2.default.isMobile || _utils2.default.detector.env === 'node') return;
  if (document.createEvent) {
    event = document.createEvent('Event');
    event.initEvent(name, true, true);
    event.eventName = name;
    window.dispatchEvent(event);
  } else if (document.createEventObject) {
    event = document.createEventObject();
    event.eventType = name;
    event.eventName = name;
    window.fireEvent('on' + event.eventType, event);
  }
}
function __authorize__(tokenData) {
  var data = [];
  Object.keys(tokenData).forEach(function (key) {
    data.push(encodeURIComponent(key) + '=' + encodeURIComponent(tokenData[key]));
  });
  data = data.join("&");

  return _utils2.default.http({
    url: _constants.URLS.token,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data + '&appName=' + _defaults2.default.appName + '&grant_type=password'
  }).then(function (response) {
    _utils2.default.storage.set('user', {
      token: {
        Authorization: 'Bearer ' + response.data.access_token
      },
      details: response.data
    });
    __dispatchEvent__(_constants.EVENTS.SIGNIN);
    if (_defaults2.default.runSocket) {
      _utils2.default.socket.connect(_utils2.default.storage.get('user').token.Authorization, _defaults2.default.anonymousToken, _defaults2.default.appName);
    }
    return response;
  });
}
function __handleRefreshToken__() {
  return new Promise(function (resolve, reject) {
    var user = _utils2.default.storage.get('user');
    if (!user || !user.details.refresh_token) {
      reject((0, _fns.__generateFakeResponse__)(0, '', {}, 'No cached user or refreshToken found. authentication is required.', {}));
    } else {
      resolve(__authorize__({
        username: user.details.username,
        refreshToken: user.details.refresh_token
      }));
    }
  });
}
function useAnonymousAuth() {
  return new Promise(function (resolve, reject) {
    if (!_defaults2.default.anonymousToken) {
      reject((0, _fns.__generateFakeResponse__)(0, '', {}, 'anonymousToken is missing', {}));
    } else {
      var details = {
        // "access_token": defaults.anonymousToken,
        "token_type": "AnonymousToken",
        "expires_in": 0,
        "appName": _defaults2.default.appName,
        "username": "Guest",
        "role": "User",
        "firstName": "anonymous",
        "lastName": "anonymous",
        "fullName": "",
        "regId": 0,
        "userId": null
      };
      _utils2.default.storage.set('user', {
        token: {
          AnonymousToken: _defaults2.default.anonymousToken
        },
        details: details
      });
      // __dispatchEvent__(EVENTS.SIGNIN);
      if (_defaults2.default.runSocket) {
        _utils2.default.socket.connect(null, _defaults2.default.anonymousToken, _defaults2.default.appName);
      }
      resolve((0, _fns.__generateFakeResponse__)(200, 'OK', {}, details, {}));
    }
  });
}
function signin(username, password) {
  return __authorize__({
    username: username,
    password: password
  });
}
function signup(firstName, lastName, email, password, confirmPassword) {
  var parameters = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  return _utils2.default.http({
    url: _constants.URLS.signup,
    method: 'POST',
    headers: {
      'SignUpToken': _defaults2.default.signUpToken
    },
    data: {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      parameters: parameters
    }
  }).then(function (response) {
    __dispatchEvent__(_constants.EVENTS.SIGNUP);
    if (_defaults2.default.runSigninAfterSignup) {
      return signin(response.data.username, password);
    } else {
      return response;
    }
  });
}
function __getSocialUrl__(providerName, isSignup, isAutoSignUp) {
  var provider = _constants.SOCIAL_PROVIDERS[providerName];
  var action = isSignup ? 'up' : 'in';
  var autoSignUpParam = '&signupIfNotSignedIn=' + (!isSignup && isAutoSignUp ? 'true' : 'false');
  return '/user/socialSign' + action + '?provider=' + provider.label + autoSignUpParam + '&response_type=token&client_id=self&redirect_uri=' + provider.url + '&state=';
}
function __socialAuth__(provider, isSignUp, spec, email) {
  return new Promise(function (resolve, reject) {
    if (!_constants.SOCIAL_PROVIDERS[provider]) {
      reject((0, _fns.__generateFakeResponse__)(0, '', {}, 'Unknown Social Provider', {}));
    }
    var url = _defaults2.default.apiUrl + '/1/' + __getSocialUrl__(provider, isSignUp, true) + '&appname=' + _defaults2.default.appName + (email ? '&email=' + email : '') + '&returnAddress='; // ${location.href}
    var popup = null;
    if (_defaults2.default.isMobile) {
      if (_defaults2.default.mobilePlatform === 'ionic') {
        (function () {
          var dummyReturnAddress = 'http://www.backandblabla.bla';
          url += dummyReturnAddress;
          var handler = function handler(e) {
            if (e.url.indexOf(dummyReturnAddress) === 0) {
              var dataMatch = /(data|error)=(.+)/.exec(e.url);
              var res = {};
              if (dataMatch && dataMatch[1] && dataMatch[2]) {
                res.data = JSON.parse(decodeURIComponent(dataMatch[2].replace(/#.*/, '')));
                res.status = dataMatch[1] === 'data' ? 200 : 0;
              }
              popup.removeEventListener('loadstart', handler, false);
              if (popup && popup.close) {
                popup.close();
              }
              if (res.status != 200) {
                reject(res);
              } else {
                resolve(res);
              }
            }
          };
          popup = cordova.InAppBrowser.open(url, '_blank');
          popup.addEventListener('loadstart', handler, false);
        })();
      } else if (_defaults2.default.mobilePlatform === 'react-native') {
        reject((0, _fns.__generateFakeResponse__)(0, '', {}, 'react-native is not supported yet for socials', {}));
      } else {
        reject((0, _fns.__generateFakeResponse__)(0, '', {}, 'isMobile is true but mobilePlatform is not supported.\n          \'try contact us in request to add support for this platform', {}));
      }
    } else if (_utils2.default.detector.env === 'browser') {
      (function () {
        var handler = function handler(e) {
          var url = e.type === 'message' ? e.origin : e.url;
          // ie-location-origin-polyfill
          if (!window.location.origin) {
            window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
          }
          if (url.indexOf(window.location.origin) === -1) {
            reject((0, _fns.__generateFakeResponse__)(0, '', {}, 'Unknown Origin Message', {}));
          }

          var res = e.type === 'message' ? JSON.parse(e.data) : JSON.parse(e.newValue);
          window.removeEventListener('message', handler, false);
          window.removeEventListener('storage', handler, false);
          if (popup && popup.close) {
            popup.close();
          }
          e.type === 'storage' && localStorage.removeItem(e.key);

          if (res.status != 200) {
            reject(res);
          } else {
            resolve(res);
          }
        };
        if (_utils2.default.detector.type !== 'Internet Explorer') {
          popup = window.open(url, 'socialpopup', spec);
          window.addEventListener('message', handler, false);
        } else {
          popup = window.open('', '', spec);
          popup.location = url;
          window.addEventListener('storage', handler, false);
        }
      })();
    } else if (_utils2.default.detector.env === 'node') {
      reject((0, _fns.__generateFakeResponse__)(0, '', {}, 'socials are not supported in a nodejs environment', {}));
    }

    if (popup && popup.focus) {
      popup.focus();
    }
  });
}
function socialSignin(provider) {
  var spec = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'left=1, top=1, width=500, height=560';

  return __socialAuth__(provider, false, spec, '').then(function (response) {
    __dispatchEvent__(_constants.EVENTS.SIGNUP);
    return __authorize__({
      accessToken: response.data.access_token
    });
  });
}
function socialSigninWithToken(provider, token) {
  return _utils2.default.http({
    url: _constants.URLS.socialSigninWithToken.replace('PROVIDER', provider),
    method: 'GET',
    params: {
      accessToken: token,
      appName: _defaults2.default.appName,
      signupIfNotSignedIn: true
    }
  }).then(function (response) {
    _utils2.default.storage.set('user', {
      token: {
        Authorization: 'Bearer ' + response.data.access_token
      },
      details: response.data
    });
    __dispatchEvent__(_constants.EVENTS.SIGNIN);
    if (_defaults2.default.runSocket) {
      _utils2.default.socket.connect(_utils2.default.storage.get('user').token.Authorization, _defaults2.default.anonymousToken, _defaults2.default.appName);
    }
    // PATCH
    return _utils2.default.http({
      url: _constants.URLS.objects + '/users',
      method: 'GET',
      params: {
        filter: [{
          "fieldName": "email",
          "operator": "equals",
          "value": response.data.username
        }]
      }
    }).then(function (patch) {
      var _patch$data$data$ = patch.data.data[0],
          id = _patch$data$data$.id,
          firstName = _patch$data$data$.firstName,
          lastName = _patch$data$data$.lastName;

      var user = _utils2.default.storage.get('user');
      var newDetails = { userId: id.toString(), firstName: firstName, lastName: lastName };
      _utils2.default.storage.set('user', {
        token: user.token,
        details: _extends({}, user.details, newDetails)
      });
      user = _utils2.default.storage.get('user');
      return (0, _fns.__generateFakeResponse__)(response.status, response.statusText, response.headers, user.details);
    });
    // EOP
  });
}
function socialSignup(provider, email) {
  var spec = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'left=1, top=1, width=500, height=560';

  return __socialAuth__(provider, true, spec, email).then(function (response) {
    __dispatchEvent__(_constants.EVENTS.SIGNUP);
    if (_defaults2.default.runSigninAfterSignup) {
      return __authorize__({
        accessToken: response.data.access_token
      });
    } else {
      return response;
    }
  });
}
function requestResetPassword(username) {
  return _utils2.default.http({
    url: _constants.URLS.requestResetPassword,
    method: 'POST',
    data: {
      appName: _defaults2.default.appName,
      username: username
    }
  });
}
function resetPassword(newPassword, resetToken) {
  return _utils2.default.http({
    url: _constants.URLS.resetPassword,
    method: 'POST',
    data: {
      newPassword: newPassword,
      resetToken: resetToken
    }
  });
}
function changePassword(oldPassword, newPassword) {
  return _utils2.default.http({
    url: _constants.URLS.changePassword,
    method: 'POST',
    data: {
      oldPassword: oldPassword,
      newPassword: newPassword
    }
  });
}
function __signoutBody__() {
  return new Promise(function (resolve, reject) {
    _utils2.default.storage.remove('user');
    if (_defaults2.default.runSocket) {
      _utils2.default.socket.disconnect();
    }
    __dispatchEvent__(_constants.EVENTS.SIGNOUT);
    resolve((0, _fns.__generateFakeResponse__)(200, 'OK', {}, _utils2.default.storage.get('user'), {}));
  });
}
function signout() {
  var storeUser = _utils2.default.storage.get('user');
  if (storeUser) {
    if (!storeUser.token["Authorization"]) {
      return __signoutBody__();
    } else {
      return _utils2.default.http({
        url: _constants.URLS.signout,
        method: 'GET'
      }).then(function (res) {
        return __signoutBody__();
      }).catch(function (res) {
        return __signoutBody__();
      });
    }
  } else {
    return Promise.reject((0, _fns.__generateFakeResponse__)(0, '', {}, 'No cached user found. cannot signout.', {}));
  }
}
function getSocialProviders() {
  return _utils2.default.http({
    url: _constants.URLS.socialProviders,
    method: 'GET',
    params: {
      appName: _defaults2.default.appName
    }
  });
}

},{"./../constants":3,"./../defaults":4,"./../utils/fns":13,"./../utils/utils":18}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('./../constants');

var _utils = require('./../utils/utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  upload: upload,
  remove: remove
};


function upload(object, fileAction, filename, filedata) {
  return _utils2.default.http({
    url: _constants.URLS.objectsAction + '/' + object + '?name=' + fileAction,
    method: 'POST',
    data: {
      filename: filename,
      filedata: filedata.substr(filedata.indexOf(',') + 1, filedata.length)
    }
  });
}
function remove(object, fileAction, filename) {
  return _utils2.default.http({
    url: _constants.URLS.objectsAction + '/' + object + '?name=' + fileAction,
    method: 'DELETE',
    data: {
      filename: filename
    }
  });
}

},{"./../constants":3,"./../utils/utils":18}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('./../constants');

var _utils = require('./../utils/utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  getList: getList,
  create: create,
  getOne: getOne,
  update: update,
  remove: remove,
  action: {
    get: get,
    post: post
  }
};


function __allowedParams__(allowedParams, params) {
  var newParams = {};
  for (var param in params) {
    if (allowedParams.indexOf(param) != -1) {
      newParams[param] = params[param];
    }
  }
  return newParams;
}
function getList(object) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var allowedParams = ['pageSize', 'pageNumber', 'filter', 'sort', 'search', 'exclude', 'deep', 'relatedObjects'];
  return _utils2.default.http({
    url: _constants.URLS.objects + '/' + object,
    method: 'GET',
    params: __allowedParams__(allowedParams, params)
  }).then(function (response) {
    if (response.data['relatedObjects']) {
      response.relatedObjects = response.data['relatedObjects'];
    }
    response.totalRows = response.data['totalRows'];
    response.data = response.data['data'];
    return response;
  });
}
function create(object, data) {
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var allowedParams = ['returnObject', 'deep'];
  return _utils2.default.http({
    url: _constants.URLS.objects + '/' + object,
    method: 'POST',
    data: data,
    params: __allowedParams__(allowedParams, params)
  });
}
function getOne(object, id) {
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var allowedParams = ['deep', 'exclude', 'level'];
  return _utils2.default.http({
    url: _constants.URLS.objects + '/' + object + '/' + id,
    method: 'GET',
    params: __allowedParams__(allowedParams, params)
  });
}
function update(object, id, data) {
  var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var allowedParams = ['returnObject', 'deep'];
  return _utils2.default.http({
    url: _constants.URLS.objects + '/' + object + '/' + id,
    method: 'PUT',
    data: data,
    params: __allowedParams__(allowedParams, params)
  });
}
function remove(object, id) {
  return _utils2.default.http({
    url: _constants.URLS.objects + '/' + object + '/' + id,
    method: 'DELETE'
  });
}

function get(object, action) {
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return _utils2.default.http({
    url: _constants.URLS.objectsAction + '/' + object + '?name=' + action,
    method: 'GET',
    params: params
  });
}
function post(object, action, data) {
  var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  return _utils2.default.http({
    url: _constants.URLS.objectsAction + '/' + object + '?name=' + action,
    method: 'POST',
    data: data,
    params: params
  });
}

},{"./../constants":3,"./../utils/utils":18}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('./../constants');

var _utils = require('./../utils/utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  get: get,
  post: post
};


function get(name) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return _utils2.default.http({
    url: _constants.URLS.query + '/' + name,
    method: 'GET',
    params: params
  });
}
function post(name, data) {
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return _utils2.default.http({
    url: _constants.URLS.query + '/' + name,
    method: 'POST',
    data: data,
    params: params
  });
}

},{"./../constants":3,"./../utils/utils":18}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _constants = require('./../constants');

var _utils = require('./../utils/utils');

var _utils2 = _interopRequireDefault(_utils);

var _fns = require('./../utils/fns');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  getUserDetails: getUserDetails,
  getUsername: getUsername,
  getUserRole: getUserRole,
  getToken: getToken,
  getRefreshToken: getRefreshToken
};


function __getUserDetailsFromStorage__() {
  return new Promise(function (resolve, reject) {
    var user = _utils2.default.storage.get('user');
    if (!user) {
      resolve((0, _fns.__generateFakeResponse__)(0, '', {}, null, {}));
      // reject(__generateFakeResponse__(0, '', {}, 'No cached user found. authentication is required.', {}));
    } else {
      resolve((0, _fns.__generateFakeResponse__)(200, 'OK', {}, user.details, {}));
    }
  });
}
function getUserDetails() {
  var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  if (!force) {
    return __getUserDetailsFromStorage__();
  } else {
    return _utils2.default.http({
      url: _constants.URLS.profile,
      method: 'GET'
    }).then(function (response) {
      var user = _utils2.default.storage.get('user');
      var newDetails = response.data;
      _utils2.default.storage.set('user', {
        token: user.token,
        details: _extends({}, user.details, newDetails)
      });
      return __getUserDetailsFromStorage__();
    });
  }
}
function getUsername() {
  return __getUserDetailsFromStorage__().then(function (response) {
    response.data = response.data['username'];
    return response;
  });
}
function getUserRole() {
  return __getUserDetailsFromStorage__().then(function (response) {
    response.data = response.data['role'];
    return response;
  });
}
function getToken() {
  return __getUserDetailsFromStorage__().then(function (response) {
    response.data = response.data['access_token'];
    return response;
  });
}
function getRefreshToken() {
  return __getUserDetailsFromStorage__().then(function (response) {
    response.data = response.data['refresh_token'];
    return response;
  });
}

},{"./../constants":3,"./../utils/fns":13,"./../utils/utils":18}],12:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = detect;
function detect() {
  var result = { device: '', os: '', env: '', type: '' };

  if (new Function("try {return this===global;}catch(e){return false;}")()) {
    result.device = 'pc';
    switch (global.process.platform) {
      case 'darwin':
        result.os = 'mac';
        break;
      case 'win32':
        result.os = 'windows';
        break;
      case 'linux':
        result.os = 'linux';
        break;
      case 'freebsd':
        result.os = 'freebsd';
        break;
      case 'sunos':
        result.os = 'sunos';
        break;
    }
    result.env = 'node';
    result.type = 'node';
  } else if (window.navigator.userAgent) {
    var ua = window.navigator.userAgent;
    result.env = 'browser';

    if (/opera/i.test(ua)) {
      result.type = 'Opera';
    } else if (/opr|opios/i.test(ua)) {
      result.type = 'Opera';
    } else if (/SamsungBrowser/i.test(ua)) {
      result.type = 'Samsung Internet for Android';
    } else if (/coast/i.test(ua)) {
      result.type = 'Opera';
    } else if (/msie|trident/i.test(ua)) {
      result.type = 'Internet Explorer';
    } else if (/chrome.+? edge/i.test(ua)) {
      result.type = 'Microsoft Edge';
    } else if (/firefox|iceweasel|fxios/i.test(ua)) {
      result.type = 'Firefox';
    } else if (/silk/i.test(ua)) {
      result.type = 'Amazon Silk';
    } else if (/phantom/i.test(ua)) {
      result.type = 'PhantomJS';
    } else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
      result.type = 'BlackBerry';
    } else if (/tizen/i.test(ua)) {
      result.type = 'Tizen';
    } else if (/chromium/i.test(ua)) {
      result.type = 'Chromium';
    } else if (/chrome|crios|crmo/i.test(ua)) {
      result.type = 'Chrome';
    } else if (/safari|applewebkit/i.test(ua)) {
      result.type = 'Safari';
    } else {
      result.type = 'unknown';
    }

    var windowsphone = /windows phone/i.test(ua),
        msedge = result.type === 'Microsoft Edge',
        silk = /silk/i.test(ua),
        mac = !/(ipod|iphone|ipad)/i.test(ua) && !silk && /macintosh/i.test(ua),
        likeAndroid = /like android/i.test(ua),
        android = !likeAndroid && /android/i.test(ua);

    if (!windowsphone && !msedge && (android || silk)) {
      result.os = 'android';
    } else if (!windowsphone && !msedge && /(ipod|iphone|ipad)/i.test(ua)) {
      result.os = 'ios';
    } else if (mac) {
      result.os = 'mac';
    } else if (!windowsphone && /windows/i.test(ua)) {
      result.os = 'windows';
    } else if (/linux|X11/i.test(ua)) {
      result.os = 'linux';
    } else {
      result.os = 'unknown';
    }

    var tablet = /tablet/i.test(ua),
        mobile = !tablet && /[^-]mobi/i.test(ua),
        nexusMobile = /nexus\s*[0-6]\s*/i.test(ua),
        nexusTablet = !nexusMobile && /nexus\s*[0-9]+/i.test(ua);

    if (tablet || nexusTablet || /(ipad)/i.test(ua) || result.silk) {
      result.device = 'tablet';
    } else if (mobile || /(ipod|iphone)/i.test(ua) || android || nexusMobile || result.type === 'BlackBerry') {
      result.device = 'mobile';
    } else {
      result.device = 'pc';
    }
  } else if (window.navigator) {
    if (window.navigator.product === 'ReactNative') {
      result.device = 'mobile';
      result.os = 'unknown';
      result.env = 'react-native';
      result.type = 'react-native';
    }
  } else {
    result.device = 'unknown';
    result.os = 'unknown';
    result.env = 'unknown';
    result.type = 'unknown';
  }

  result.device !== 'unknown' && console.info('Running on ' + result.device + ' with a ' + result.os + ' os and ' + result.env + ' ' + (result.env !== result.type ? '(' + result.type + ')' : '') + ' environment ...');
  return result;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.__generateFakeResponse__ = __generateFakeResponse__;
exports.bind = bind;
function __generateFakeResponse__() {
  var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var statusText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var data = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  var config = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  return {
    status: status,
    statusText: statusText,
    headers: headers,
    data: data,
    config: config
  };
}

function bind(obj, scope) {
  Object.keys(obj).forEach(function (key) {
    if (_typeof(obj[key]) === 'object') {
      bind(obj[key]);
    } else if (typeof obj[key] === 'function') {
      obj[key] = obj[key].bind(scope);
    }
  });
  return obj;
}

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Http = function () {
  function Http() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Http);

    if (!XMLHttpRequest) throw new Error('XMLHttpRequest is not supported by this platform');

    this.defaults = _extends({
      // url: '/',
      method: 'GET',
      headers: {},
      params: {},
      interceptors: {},
      withCredentials: false,
      responseType: 'json',
      timeout: 4000,
      auth: {
        username: null,
        password: null
      }
    }, config);
  }

  _createClass(Http, [{
    key: '_getHeaders',
    value: function _getHeaders(headers) {
      return headers.split('\r\n').filter(function (header) {
        return header;
      }).map(function (header) {
        var jheader = {};
        var parts = header.split(':');
        jheader[parts[0]] = parts[1];
        return jheader;
      });
    }
  }, {
    key: '_getData',
    value: function _getData(type, data) {
      if (!type) {
        return data;
      } else if (type.indexOf('json') === -1) {
        return data;
      } else {
        return JSON.parse(data);
      }
    }
  }, {
    key: '_createResponse',
    value: function _createResponse(req, config) {
      return {
        status: req.status,
        statusText: req.statusText,
        headers: this._getHeaders(req.getAllResponseHeaders()),
        config: config,
        data: this._getData(req.getResponseHeader("Content-Type"), req.responseText)
      };
    }
  }, {
    key: '_handleError',
    value: function _handleError(data, config) {
      return {
        status: 0,
        statusText: 'ERROR',
        headers: [],
        config: config,
        data: data
      };
    }
  }, {
    key: '_encodeParams',
    value: function _encodeParams(params) {
      var paramsArr = [];
      for (var param in params) {
        var val = params[param];
        if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
          val = JSON.stringify(val);
        }
        paramsArr.push(param + '=' + encodeURIComponent(val));
      }
      return paramsArr.join('&');
    }
  }, {
    key: '_setHeaders',
    value: function _setHeaders(req, headers) {
      for (var header in headers) {
        req.setRequestHeader(header, headers[header]);
      }
    }
  }, {
    key: '_setData',
    value: function _setData(req, data) {
      if (!data) {
        req.send();
      } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) != 'object') {
        req.send(data);
      } else {
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.send(JSON.stringify(data));
      }
    }
  }, {
    key: 'request',
    value: function request() {
      var _this = this;

      var cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return new Promise(function (resolve) {
        var config = _extends({}, _this.defaults, cfg);
        if (config.interceptors.request) {
          resolve(config.interceptors.request(config));
        } else {
          resolve(config);
        }
      }).then(function (config) {
        return new Promise(function (resolve, reject) {
          if (!config.url || typeof config.url !== 'string' || config.url.length === 0) {
            reject(_this._handleError('url parameter is missing', config));
          }
          var req = new XMLHttpRequest();
          req.withCredentials = config.withCredentials || false;
          req.timeout = config.timeout || 0;
          var params = _this._encodeParams(config.params);
          req.open(config.method, '' + (config.baseURL ? config.baseURL + '/' : '') + config.url + (params ? '?' + params : ''), true, config.auth.username, config.auth.password);
          req.ontimeout = function () {
            reject(_this._handleError('timeout', config));
          };
          req.onabort = function () {
            reject(_this._handleError('abort', config));
          };
          req.onreadystatechange = function () {
            var _DONE = XMLHttpRequest.DONE || 4;
            if (req.readyState == _DONE) {
              var res = _this._createResponse(req, config);
              if (res.status === 200) {
                if (config.interceptors.response) {
                  resolve(config.interceptors.response(res));
                } else {
                  resolve(res);
                }
              } else {
                if (config.interceptors.responseError) {
                  resolve(config.interceptors.responseError(res));
                } else {
                  reject(res);
                }
              }
            }
          };
          _this._setHeaders(req, config.headers);
          _this._setData(req, config.data);
        });
      });
    }
  }]);

  return Http;
}();

function createInstance() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var context = new Http(config);
  var instance = function instance() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return Http.prototype.request.apply(context, args);
  };
  instance.config = context.defaults;
  return instance;
}

var http = createInstance();
http.create = function (config) {
  return createInstance(config);
};

exports.default = http;

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.requestInterceptor = requestInterceptor;
exports.requestErrorInterceptor = requestErrorInterceptor;
exports.responseInterceptor = responseInterceptor;
exports.responseErrorInterceptor = responseErrorInterceptor;

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _defaults = require('./../defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _constants = require('./../constants');

var constants = _interopRequireWildcard(_constants);

var _auth = require('./../services/auth');

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  requestInterceptor: requestInterceptor,
  requestErrorInterceptor: requestErrorInterceptor,
  responseInterceptor: responseInterceptor,
  responseErrorInterceptor: responseErrorInterceptor
};
function requestInterceptor(config) {
  if (config.url.indexOf(constants.URLS.token) === -1) {
    var user = _utils2.default.storage.get('user');
    if (_defaults2.default.useAnonymousTokenByDefault && !user) {
      return _auth2.default.useAnonymousAuth().then(function (response) {
        config.headers = _extends({}, config.headers, _utils2.default.storage.get('user').token);
        return config;
      });
    } else if (user) {
      config.headers = _extends({}, config.headers, user.token);
      return config;
    } else {
      return config;
    }
  } else {
    return config;
  }
}

function requestErrorInterceptor(error) {
  return Promise.reject(error);
}

function responseInterceptor(response) {
  return response;
}

function responseErrorInterceptor(error) {
  if (error.config.url.indexOf(constants.URLS.token) === -1 && _defaults2.default.manageRefreshToken && error.status === 401 && error.data && error.data.Message === 'invalid or expired token') {
    return _auth2.default.__handleRefreshToken__().then(function (response) {
      return _utils2.default.http(error.config);
    }).catch(function (error) {
      return Promise.reject(error);
    });
  } else {
    return Promise.reject(error);
  }
}

},{"./../constants":3,"./../defaults":4,"./../services/auth":7,"./utils":18}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Socket = function () {
  function Socket(url) {
    var _this = this;

    _classCallCheck(this, Socket);

    if (!window.io) throw new Error('runSocket is true but socketio-client is not included');
    this.url = url;
    this.socket = io.connect(this.url, { 'forceNew': true });

    this.socket.on('connect', function () {});
    this.socket.on('authorized', function () {
      console.info('socket connected');
    });
    this.socket.on('notAuthorized', function () {
      setTimeout(function () {
        return _this.disconnect();
      }, 1111);
    });
    this.socket.on('disconnect', function () {
      console.info('socket disconnect');
    });
    this.socket.on('reconnecting', function () {
      console.info('socket reconnecting');
    });
    this.socket.on('error', function (error) {
      console.warn('error: ' + error);
    });
  }

  _createClass(Socket, [{
    key: 'on',
    value: function on(eventName, callback) {
      var _this2 = this;

      this.socket.on(eventName, function (data) {
        callback.call(_this2, data);
      });
      return Promise.resolve({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: 'listener for ' + eventName + ' has been set. pending for a broadcast from the server',
        config: {}
      });
    }
  }, {
    key: 'connect',
    value: function connect(token, anonymousToken, appName) {
      this.socket.connect();
      this.socket.emit("login", token, anonymousToken, appName);
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.socket.disconnect();
    }
  }]);

  return Socket;
}();

exports.default = Socket;

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Storage = function () {
  function Storage(storage) {
    var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    _classCallCheck(this, Storage);

    if (!storage) throw new Error('The provided Storage is not supported by this platform');
    if (!storage.setItem || !storage.getItem || !storage.removeItem || !storage.clear) throw new Error('The provided Storage not implement the necessary functions');
    this.storage = storage;
    this.prefix = prefix;
    this.delimiter = '__________';
  }

  _createClass(Storage, [{
    key: 'get',
    value: function get(key) {
      var item = this.storage.getItem('' + this.prefix + key);
      if (!item) {
        return item;
      } else {
        var _item$split = item.split(this.delimiter),
            _item$split2 = _slicedToArray(_item$split, 2),
            type = _item$split2[0],
            val = _item$split2[1];

        if (type != 'JSON') {
          return val;
        } else {
          return JSON.parse(val);
        }
      }
    }
  }, {
    key: 'set',
    value: function set(key, val) {
      if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) != 'object') {
        this.storage.setItem('' + this.prefix + key, 'STRING' + this.delimiter + val);
      } else {
        this.storage.setItem('' + this.prefix + key, 'JSON' + this.delimiter + JSON.stringify(val));
      }
    }
  }, {
    key: 'remove',
    value: function remove(key) {
      this.storage.removeItem('' + this.prefix + key);
    }
  }, {
    key: 'clear',
    value: function clear() {
      for (var i = 0; i < this.storage.length; i++) {
        if (this.storage.getItem(this.storage.key(i)).indexOf(this.prefix) != -1) this.remove(this.storage.key(i));
      }
    }
  }]);

  return Storage;
}();

exports.default = Storage;

},{}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {};

},{}]},{},[6])(6)
});