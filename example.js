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