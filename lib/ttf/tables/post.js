'use strict';

var _ = require('lodash');

function getStringAsByteArray(name) {
  var bytes = [];
  bytes.push(name.length);
  for (var i = 0; i < name.length; i ++) {
    var char = name.charCodeAt(i);
    bytes.push(char);
  }
  return bytes;
}

function fill(buf, font) {
  buf.writeInt32(0x20000); // formatType,  version 2.0
  buf.writeInt32(0); // italicAngle
  buf.writeInt16(0); // underlinePosition
  buf.writeInt16(0); // underlineThickness
  buf.writeUInt32(0); // isFixedPitch
  buf.writeUInt32(0); // minMemType42
  buf.writeUInt32(0); // maxMemType42
  buf.writeUInt32(0); // minMemType1
  buf.writeUInt32(0); // maxMemType1
  buf.writeUInt16(font.glyphs.length); // numberOfGlyphs

  // Array of glyph name indexes
  buf.writeUInt16(0);//First element should be .notDef glyph
  var index = 258; //first index of custom glyph name
  var i;
  for (i = 0; i < font.glyphs.length; i++) {
    buf.writeUInt16(index++);
  }

  // Array of glyph name indexes
  _.forEach(font.glyphs, function (glyph) {
    buf.writeBytes(getStringAsByteArray(glyph.name));
  });

}

module.exports.fillPost = fill;