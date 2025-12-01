# Minimal Promise-PolyFill for ES5

&nbsp;&nbsp;This Promise polyfill is implemented leveraging the _Object.defineProperty_ API, adhering to ES5 compatibility standards. For insights into the core implementation logic, refer to the source code in _src/lib/PromisePoly.es.js_. Currently, the polyfill provides full support for the core _then()_ and _catch()_ methods with stable functionality. Contributions from developers to expand features, optimize performance, or improve compatibility are highly welcomed and appreciated!

## Why I made it?

&nbsp;&nbsp;In the modern development landscape, we often rely on mature libraries to expedite business logic implementation—while this approach ensures efficiency and reliability, it can inadvertently limit opportunities to delve into the underlying principles of core APIs or explore innovative implementation paradigms independently.

&nbsp;&nbsp;Against this backdrop, this project serves as both a practical example and a starting point: by manually crafting an ES5-compatible Promise polyfill, it aims to encourage a deeper understanding of asynchronous programming fundamentals and inspire developers to rethink conventional implementation approaches. It’s a deliberate effort to move beyond "using tools" and toward "mastering the mechanics"—fostering creative problem-solving and a more profound grasp of JavaScript’s core concepts.


## How to use in earlier browser?

&nbsp;&nbsp;Just include _src/dist/PromisePolyES5.umd.js_ in your script tag as below:

```html
<script src="./src/dist/PromisePolyES5.umd.js"></script>
```

&nbsp;&nbsp;Then write your Promise-alike code as below:

```javascript

var a = new PromisePoly(function (resolve, reject) {
    setTimeout(function () {
        resolve(10)
    }, 1000)
})
a.then(console.log)
.then(console.warn)
```