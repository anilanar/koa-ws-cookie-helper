'use strict';

var Keygrip = require('keygrip');

/**
 *  Get cookie from a WebSocket's upgraded request.
 *  If the cookie is signed, keys must be provided.
 *
 *  @param {WebSocket}  ws
 *  @param {String}     name
 *  @param {Array}      [keys]
 *  @api public
 */
module.exports.get = function (ws, name, keys) {
  var sigName = name + '.sig';
  var cookies = ws.upgradeReq.headers.cookie;
  if(!cookies) return;
  var match = cookies.match(getPattern(name));
  if(!match) return;
  var value = match[1];
  if(!keys) return value;

  var signedCookie = module.exports.get(ws, sigName);
  if(!signedCookie) return;

  var keygrip;
  if(Array.isArray(keys)) {
    for(var i = 0; i < keys.length; i++) {
      if(!(typeof keys[i] == 'string' || keys[i] instanceof String))
        return;
    }
    keygrip = new Keygrip(keys);
  }
  else if(keys.constructor && keys.constructor.name === 'Keygrip')
    keygrip = keys;
  else 
    return; 

  var data = name + "=" + value; 
  var index = keygrip.index(data, signedCookie);
  if(index < 0) return;
  return value;
};

// cache used by cookie pattern matcher
var cache = {};
 
// function used by Cookies
// https://github.com/expressjs/cookies
function getPattern(name) {
  if (cache[name]) return cache[name];

  return cache[name] = new RegExp(
    "(?:^|;) *" +
    name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") +
    "=([^;]*)"
  );
};