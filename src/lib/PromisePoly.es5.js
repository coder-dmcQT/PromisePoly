var PromisePoly = (function () {

    /**
     * Promise Polly-Fill Constructor
     * @param executor Just like Promise constructor in ES6+
     * @constructor
     */
    function PromisePoly(executor) {
        var internalState = {
            result: null,
            status: 'pending',
            reason: null
        }

        var currentStatus = 'pending'

        // Only expose these readonly properties
        Object.defineProperty(this, 'status', {
            get: function () {
                return internalState.status;
            }
        })
        Object.defineProperty(this, 'reason', {
            get: function () {
                return internalState.reason;
            }
        })
        Object.defineProperty(this, 'result', {
            get: function () {
                return internalState.result;
            }
        })

        var currentThis = this;
        this.thenFunc = null
        this.catchFunc = null

        // Using getter and setter traps of internalState
        // Especially setter traps, to notify callers in then function
        Object.defineProperty(internalState, 'status', {
            get: function () {
                return currentStatus
            },
            set: function (value) {
                currentStatus = value
                if (value === 'rejected') {
                    if (typeof currentThis.catchFunc === 'function') {
                        currentThis.catchFunc(currentThis.reason)
                    }
                } else if (value === 'fulfilled') {
                    if (typeof currentThis.thenFunc === 'function') {
                        currentThis.thenFunc(currentThis.result)
                    }
                }
            }
        })

        /**
         * Resolve Function
         * @param value Could be PromisePoly or any legal values
         */
        function resolve(value) {
            // If PromisePoly is passed, assign thenFunc and catchFunc, for the next then or catch call
            if (value instanceof PromisePoly) {
                // In these calls, change the inner data relevantly
                value.thenFunc = function (v) {
                    internalState.result = v;
                    internalState.status = 'fulfilled';
                }
                value.catchFunc = function (v) {
                    internalState.reason = v;
                    internalState.status = 'rejected';
                }
                return;
            }
            // If the status is already changed, no further handles
            if (internalState.status !== 'pending') {
                return
            }
            // Change the status and result
            internalState.result = value;
            internalState.status = 'fulfilled';
        }

        /**
         * Just like logic above
         * @param error Could be PromisePoly or any other values
         */
        function reject(error) {
            if (error instanceof PromisePoly) {
                error.catchFunc = function (v) {
                    internalState.reason = v;
                    internalState.status = 'rejected';
                }
                error.thenFunc = function (v) {
                    internalState.result = v;
                    internalState.status = 'fulfilled';
                }
                return;
            }
            if (internalState.status !== 'pending') {
                return
            }
            internalState.reason = error;
            internalState.status = 'rejected';
            throw new Error(internalState.reason)
        }

        // execute the passing executor functions, capturing in try blocks
        try {
            executor(resolve, reject)
        } catch (e) {
            reject(e.message)
        }
    }

    /**
     * Then Handler
     * @param resolveFunction A function accept resolved value or any legal value that will be seen as resolved value
     * @param rejectFunction A reject function handler, accepting reject reason
     * @returns {PromisePoly} Directly return new promise, not considering current Promise is resolved or rejected
     */
    PromisePoly.prototype.then = function (resolveFunction, rejectFunction) {
        // store current PromisePoly instance
        var currentThis = this;
        // According to the specification, Then-Handler must directly return a new PromisePoly
        return new PromisePoly(function (resolve, reject) {
            // If onResolve is a function
            if (typeof resolveFunction === 'function') {
                // if the previous PromisePoly status is not pending, directly gets value or reason and passing it
                if (currentThis.status !== 'pending') {
                    var isPreviousPromiseResolved = currentThis.status === 'fulfilled';
                    // By the specification, the value is passed to the onReject, the value returned from that will be resolved
                    if (isPreviousPromiseResolved) {
                        resolve(resolveFunction(currentThis.result))
                    } else {
                        // handle the rejection
                        if (typeof rejectFunction === 'function') {
                            // By the rule accordingly
                            resolve(rejectFunction(currentThis.reason))
                        } else {
                            reject(currentThis.reason)
                        }
                    }
                } else {
                    // If the status is still pending, assign thenFunc and catchFunc, waiting for calling in setter traps
                    currentThis.thenFunc = function (resultInPreviousPromise) {
                        resolve(resolveFunction(resultInPreviousPromise));
                    }
                    if (typeof rejectFunction === 'function') {
                        currentThis.catchFunc = function (reasonInPreviousPromise) {
                            reject(rejectFunction(reasonInPreviousPromise))
                        }
                    }
                }
            } else {
                // if it's a simple value, directly return it as it's being resolved
                resolve(resolveFunction)
            }
        })
    }

    /**
     * Catch Handler
     * @param rejectFunction Must be a function for proceeding rejection
     * @returns {PromisePoly}
     */
    PromisePoly.prototype.catch = function (rejectFunction) {
        // type assertion
        if (typeof rejectFunction !== 'function') {
            throw new TypeError('onRejected Parameter must be a function!');
        }
        // Like the handling logic in then functions
        var currentThis = this;
        return new PromisePoly(function (resolve, reject) {
            if (currentThis.status !== 'pending') {
                var isPreviousPromiseResolved = currentThis.status === 'fulfilled';
                if (isPreviousPromiseResolved) {
                    resolve(currentThis.result)
                } else {
                    resolve(rejectFunction(currentThis.reason))
                }
            } else {
                currentThis.thenFunc = function (resultInPreviousPromise) {
                    resolve(resultInPreviousPromise);
                }
                currentThis.catchFunc = function (reasonInPreviousPromise) {
                    reject(rejectFunction(reasonInPreviousPromise))
                }
            }
        })
    }

    return PromisePoly;
})();

module.exports = PromisePoly;