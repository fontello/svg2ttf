/*global it, describe*/
'use strict';


var assert  = require('assert');
var fs      = require('fs');
var path    = require('path');
var svg2ttf = require('../');
var opentype = require('opentype.js');

// Use opentype paser font
function parseFont(src, options) {
  var buffer = new Uint8Array(svg2ttf(src, options).buffer).buffer;
  return opentype.parse(buffer);
}

describe('svg2ttf', function () {
  var src = fs.readFileSync(path.join(__dirname, 'fixtures/test.svg'), 'utf-8');
  var dst = new Uint8Array(fs.readFileSync(path.join(__dirname, 'fixtures/test.ttf')));


  it('bin compare', function () {
    assert.deepEqual(new Uint8Array(svg2ttf(src, { ts: 1457357570703 }).buffer), dst);
  });


  describe('version', function () {

    it('should throw on bad version value', function () {
      assert.throws(function () {
        svg2ttf(src, { version: 123 });
      });
      assert.throws(function () {
        svg2ttf(src, { version: 'abc' });
      });
    });

    it('[version]should set proper version', function () {
      var options;

      options = { ts: 1457357570703, version: '1.0'};
      assert.equal('Version 1.0', parseFont(src, options).tables.name.version.en);

      options = { ts: 1457357570703, version: 'Version 1.0' };
      assert.equal('Version 1.0', parseFont(src, options).tables.name.version.en);

      options = { ts: 1457357570703, version: 'version 1.0' };
      assert.equal('Version 1.0', parseFont(src, options).tables.name.version.en);

      options = { ts: 1457357570703, version: 'version 2.0' };
      assert.equal('Version 2.0', parseFont(src, options).tables.name.version.en);
    });
  });
});
