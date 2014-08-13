'use strict';

var koa = require('koa'),
    WebSocketServer = require('ws').Server,
    WebSocket = require('ws'),
    Keygrip = require('keygrip'),
    should = require('chai').should(),
    cookies = require('./');

var port = 8000;
var cookieName = 'foo';
var cookieValue = 'bar';
var keysAsArray = ['secret'];
var keygrip = Keygrip(keysAsArray);

var cookie = new Cookie('foo', 'bar');
var signedCookie = new Cookie('foo.sig', keygrip.sign(cookie.toString()));
var cookieWithFaultySig = new Cookie('foo2', 'bar2');
var signedCookieForCookieWithFaultySig = new Cookie('foo2.sig', 'faultybar2');
var cookieWithoutSig = new Cookie('foo3', 'bar3');
var cookieNotInHeader = new Cookie('foo4', 'bar4');



var cookieHeader = {
  headers: {
    'Cookie': [cookie, signedCookie, cookieWithFaultySig, signedCookieForCookieWithFaultySig, cookieWithoutSig].join('; ')
  }
}


describe('koa-ws-cookie-helper', function () {
  var app = koa();
  app.server = app.listen(port);
  var wss = new WebSocketServer({server: app.server});

  describe('when there are no cookies set', function () {
    it('should return undefined', function (done) {
      onConnection(wss, function (client){
        var res = cookies.get(client, cookie.name);
        should.not.exist(res);
      }, done);
      createConnection();
    });
  });

  describe('when there are cookies set', function () {
    describe('when cookie with the name does not exist', function () {
      it('should return undefined', function (done) {
        onConnection(wss, function (client) {
          var res = cookies.get(client, cookieNotInHeader.name) // looking for 'foofoo'
          should.not.exist(res);
        }, done);
        createConnection(cookieHeader);
      });
    });

    describe('when cookie with the name exists', function () {
      describe('when no keys provided', function () {
        it('should return cookie value', function (done) {
          onConnection(wss, function (client) {
            var res = cookies.get(client, cookie.name);
            res.should.be.eql(cookieValue);
          }, done);
          createConnection(cookieHeader);
        });
      });

      describe('when provided keys object is neither array nor keygrip object', function () {
        it('should return undefined', function (done) {
          onConnection(wss, function (client) {
            var res = cookies.get(client, cookie.name, {});
            should.not.exist(res);
          }, done);
          createConnection(cookieHeader);  
        });
      });

      describe('when provided keys object is not array of strings', function () {
        it('should return undefined', function (done) {
          onConnection(wss, function (client) {
            var res = cookies.get(client, cookie.name, [1, function () {}]);
            should.not.exist(res);
          }, done);
          createConnection(cookieHeader);
        });
      });

      describe('when keys object is array', function () {
        testAfterAllConditionsAreMet(wss, keysAsArray);
      });

      describe('when keys object is Keygrip object', function () {
        testAfterAllConditionsAreMet(wss, keygrip);
      });
    });
  });

  wss.close();
});

function testAfterAllConditionsAreMet (wss, keys) {
  describe('when signed cookie does not exist', function () {
    it('should return undefined', function (done) {
      onConnection(wss, function (client) {
        var res = cookies.get(client, cookieWithoutSig.name, keys);
        should.not.exist(res);
      }, done);
      createConnection(cookieHeader);
    });
  });

  describe('when signed cookie does not match', function () {
    it('should return undefined', function (done) {
      onConnection(wss, function (client) {
        var res = cookies.get(client, cookieWithFaultySig.name, keys);
        should.not.exist(res);
      }, done);
      createConnection(cookieHeader);
    });
  });

  describe('when signed cookie exists and matches', function () {
    it('should return cookie value', function (done) {
      onConnection(wss, function (client) {
        var res = cookies.get(client, cookie.name, keys);
        res.should.be.eql(cookie.val);
      }, done);
      createConnection(cookieHeader);
    });
  });
}

function createConnection(cookie) {
  var host = 'ws://localhost:' + port;

  if(cookie) 
    new WebSocket(host, cookie);
  else 
    new WebSocket(host);
}

function onConnection(wss, callback, done) {
  wss.on('connection', function fn(client) {
    callback(client);
    wss.removeListener('connection', fn);
    client.close();
    done();
  });
};

function Cookie(name, val) {
  this.name = name;
  this.val = val;

  this.toString = function () {
    return this.name + '=' + this.val;
  };
};




