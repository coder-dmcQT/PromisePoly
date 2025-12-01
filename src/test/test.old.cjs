const PromisePoly = require('../lib/PromisePoly.es5');
const test = require("node:test")
const assert = require("node:assert");

test.describe('use-case-test', {concurrency: 4},function () {
    test('api-call-async', function (_, done) {
        const p = new PromisePoly(function (resolve, reject) {
            fetch('https://www.bing.com').then(function (resp) {
                resolve(resp);
            }).catch(function (err) {
                reject(err);
            })
        });
        p.then(v=>v.text())
            .then(function (resp) {
                assert.ok(resp);
                done()
            })
    })
})

test.describe('Promise-old-Basic-test', {concurrency: 4}, function () {
    test('basic-async-op', function (_, done) {
        const p = new PromisePoly(function (resolve) {
            resolve(5)
        });
        p.then(function (result) {
            assert.strictEqual(5, result)
            done()
        })
    })

    test('timeout-delay', function (_, done) {
        const p = new PromisePoly(function (resolve) {
            setTimeout(function () {
                resolve(5)
            }, 2000)
        })
        p.then(function (result) {
            assert.strictEqual(5, result)
            done()
        })
    })

    test('promise-in-chain', function (_, done) {
        const p = new PromisePoly(function (resolve) {
            setTimeout(function () {
                resolve(5)
            }, 1000)
        })
        p.then(a => a * a)
            .then(function (result) {
                assert.strictEqual(25, result)
                done()
            })
    })

    test('promise-in-resolve', function (_, done) {
        const p = new PromisePoly(function (resolve) {
            resolve(new PromisePoly(function (send) {
                setTimeout(function () {
                    send(5)
                }, 1000)
            }))
        })
        p.then(function (result) {
            return new PromisePoly(function (resolve) {
                setTimeout(function () {
                    resolve(result)
                }, 1000)
            })
        })
            .then(function (result) {
                assert.strictEqual(5, result)
                done()
            })
    })
});