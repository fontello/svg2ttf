'use strict';

var utils = require('../utils');

function getUnicodes(font) {
  var result = [];
  _.forEach(font.glyphs, glyph) {
    result.push(glyph.unicode);
  }
}

function fill(buf, font) {
  utils.writeNum(buf, 0, 2); //version
  utils.writeNum(buf, 3, 2); //count

  //add subtable headers
  var subTableOffsetPositions = [];
  for (var i = 0; i < 3; i++) {
    utils.writeNum(buf, 3, 2); //platform, windows standard
    utils.writeNum(buf, 1, 2); //encoding, unicode
    subTableOffsetPositions.push(utils.writeNum(buf, 0, 2)); //offset
  }

  var unicodes = getUnicodes(font);
  var subTableOffsets = [];

  //add subtable format 0
  subTableOffsets.push(utils.getPosition());
  utils.writeNum(buf, 0, 2); //format
  utils.writeNum(buf, 262, 2); //length
  utils.writeNum(buf, 0, 2); //version
  for (var i = 0; i < 256; i++) {
    utils.writeNum(buf, unicodes.indexOf(i) ? i : 0, 2); //unicode in table 0..255
  }

  //write subtable offsets
  var savedPosition = utils.getPosition();
  for (var i = 0; i < 3; i++) {
    utils.setPosition(subTableOffsetPositions[i]);
    utils.writeNum(buf, subTableOffsets[i], 2);
  }
  utils.setPosition(savedPosition);

}

module.exports.fillCMap = fill;