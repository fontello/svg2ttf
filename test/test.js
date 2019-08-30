/*global it, describe*/
'use strict';


var assert  = require('assert');
var fs      = require('fs');
var path    = require('path');
var svg2ttf = require('../');


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

    it('should set proper version', function () {
      var options;

      options = { ts: 1457357570703, version: '1.0' };
      assert.deepEqual(new Uint8Array(svg2ttf(src, options).buffer), dst);

      options = { ts: 1457357570703, version: 'Version 1.0' };
      assert.deepEqual(new Uint8Array(svg2ttf(src, options).buffer), dst);

      options = { ts: 1457357570703, version: 'version 1.0' };
      assert.deepEqual(new Uint8Array(svg2ttf(src, options).buffer), dst);

      options = { ts: 1457357570703, version: 'version 2.0' };
      assert.notDeepEqual(new Uint8Array(svg2ttf(src, options).buffer), dst);
    });
  });

  // TODO: update test case
  // describe('designerurl', function () {

  //   it('should throw on bad designerurl value', function () {
  //     assert.throws(function () {
  //       svg2ttf(src, { designerurl: 'fontello.com' });
  //     });
  //     assert.throws(function () {
  //       svg2ttf(src, { designerurl: 'fontello.com' });
  //     });
  //     assert.throws(function () {
  //       svg2ttf(src, { designerurl: 123 });
  //     });
  //     assert.throws(function () {
  //       svg2ttf(src, { designerurl: 'abc' });
  //     });
  //   });

  //   it('should set proper designerurl', function () {
  //     var options;

  //     options = { ts: 1457357570703, designerurl: 'http://fontello.com' };
  //     assert.deepEqual(new Uint8Array(svg2ttf(src, options).buffer), dst2);
  //   });
  // });
});
