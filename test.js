/*global it*/
'use strict';


var assert  = require('assert');
var fs      = require('fs');
var svg2ttf = require('.');


it('bin compare', function () {
  var src = fs.readFileSync('./fixtures/test.svg', 'utf-8');
  var dst = new Uint8Array(fs.readFileSync('./fixtures/test.ttf'));

  assert.deepEqual(new Uint8Array(svg2ttf(src, { ts: 1457357570703 }).buffer), dst);
});
