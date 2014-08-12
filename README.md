[![Build Status](https://travis-ci.org/anilanar/koa-ws-cookie-helper.svg?branch=master)](https://travis-ci.org/anilanar/koa-ws-cookie-helper) [![Coverage Status](https://coveralls.io/repos/anilanar/koa-ws-cookie-helper/badge.png?branch=master)](https://coveralls.io/r/anilanar/koa-ws-cookie-helper?branch=master)

#koa-ws-cookie-helper

koa.js + ws.js helper for accessing cookies from a WebSocket connection

## Installation

```js
$ npm install koa-ws-cookie-helper
```

## Example

```js
var koa = require('koa'),
    WebSocketServer = require('ws').Server,
    cookieHelper = require('koa-ws-cookie-helper'),
    app = koa();

var port = 3000;
app.keys = ['secret'];

app.server = app.listen(port);

var wss = new WebSocketServer({server: app.server});
wss.on('connection', function (client) {

  // first argument is of type WebSocket
  
  // tries to get value of cookie named 'foo'
  // e.g. for 'foo=bar', returns 'bar'
  var cookieValue = cookieHelper.get(client, 'foo', app.keys);

  // if you use unsigned cookies or 
  // don't care if the cookie is legit or not
  // omit the keys parameter
  cookieValue = cookieHelper.get(client, 'foo'); 

});
```

## How does it work?
Browsers put any cookies from the same host into initial WebSocket handshake headers. This lets typical HTTP-session mechanisms to work with WebSockets. [koa.js](http://github.com/koajs/koa) makes use of [Cookies](http://github.com/expressjs/cookies) module to handle cookie management. Signed cookies are signed and verified using [Keygrip](http://github.com/expressjs/keygrip). This module combines methods used by them to parse cookies in `ws.upgradeReq.headers.cookie`.

## API
There is only a single public function:

###get(ws, name, [keys])
Returns value of the cookie named `name`, using keyset `keys`. Cookie is searched in `'Cookie'` entry of handshake headers. If no cookie could be found or if the signed cookie does not match with any key in the keyset, returns `undefined`.

## License
MIT