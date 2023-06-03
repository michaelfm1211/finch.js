# finch.js
An unofficial library for the Birdbrain Technologies Finch Robot 1.0 using
the WebHID API and ES6 modules.

Because finch.js uses the WebHID API, finch.js will only run on a
[browser that supports WebHID](https://caniuse.com/webhid). For now, node.js
is also unsupported.

This library is based off of the official Python library for the same robot and
is mostly compatible. However, values in this library are generally from 0-255
rather than 0-1. For exact usages, see the
[finch.js documentation](https://michaelfm1211.github.io/finch.js/). See
[this link](https://learn.birdbraintechnologies.com/finch1/python/install) for
more on the original Python library and a link to the Python library's
documentation.

### Install
Install finch.js through NPM:
```
npm install @michaelfm1211/finch.js
```

### Documentation
You can find the finch.js documentation online
[here](https://michaelfm1211.github.io/finch.js/).

Alternatively, you can build the documentation yourself with `jsdoc`
```
jsdoc . README.md
```

### Quickstart Example
Unless you know what you're doing and have a really good reason to do so, all
your finch.js code should be wrapped in a call to
[`run()`](https://michaelfm1211.github.io/finch.js/global.html#run). `run()` is
a function provided by finch.js that will handle the connecting and
disconnecting steps, allowing you to focus on making the robot actually do
stuff.

Due to browser security requirements, you can only call `run()` in response to
a user gesture. The easiest way to fufill this requirement is to create a
"Start" or "Connect" button on your webpage, then call `run()` from within
the button's `click` event handler.

Here's a quick example to help you get started using finch.js:
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>finch.js test</title>
</head>
<body>
    <button id="connect">Connect</button>
    <script type="module">
        import * as finch from 'https://unpkg.com/@michaelfm1211/finch.js@1.0.2/finch.js';
        document.getElementById('connect').addEventListener('click', function() {
            finch.run(async function() {
                console.log('hi')
            });
        });
    </script>
</body>
</html>
```
To read more about finch.js, explore the
[documentation](https://michaelfm1211.github.io/finch.js/).

### License

finch.js is available under the
[ISC license](https://choosealicense.com/licenses/isc/):
> Copyright 2023 Michael M.
>
> Permission to use, copy, modify, and/or distribute this software for any
> purpose with or without fee is hereby granted, provided that the above
> copyright notice and this permission notice appear in all copies.
>
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
> WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
> MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
> SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
> WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
> OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
> CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
