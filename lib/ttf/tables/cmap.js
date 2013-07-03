'use strict';

var _ = require('lodash');

function getUnicodes(font) {
  var result = [];
  _.forEach(font.glyphs, function(glyph) {
    result.push(glyph.unicode);
  });
}

function getSegments(font) {
  // just a stub for now
  console.log(font);
}

function fill(buf, font) {
  buf.writeUInt16(0); // version
  buf.writeUInt16(3); // count

  // add subtable headers
  var subTableOffsetPositions = [];
  var i;
  for (i = 0; i < 3; i++) {
    buf.writeUInt16(3); // platform, windows standard
    buf.writeUInt16(1); // encoding, unicode
    subTableOffsetPositions.push(buf.tell()); //save table offset position
    buf.writeUInt16(0); // offset, just a zero value, it will be filled later
  }

  var subTableOffsets = [];

  // add subtable format 0
  var unicodes = getUnicodes(font);
  subTableOffsets.push(utils.getPosition());
  buf.writeUInt16(0); // format
  buf.writeUInt16(262); // length
  utils.writeNum(buf, 0, 2); // version
  for (i = 0; i < 256; i++) {
    buf.writeUInt16(unicodes.indexOf(i) ? i : 0); // existing char in table 0..255
  }

  // add subtable format 4
  var segments = getSegments(font);
  console.log(segments);

  // TODO: write code for subtables 4 and 12

  // write subtable offsets
  var savedPosition = buf.tell(); //save position to restore it later
  for (i = 0; i < 3; i++) {
    buf.seek(subTableOffsetPositions[i]);
    buf.writeUInt16(subTableOffsets[i]);
  }
  buf.seek(savedPosition); //restore previously saved position

}

module.exports.fillCMap = fill;