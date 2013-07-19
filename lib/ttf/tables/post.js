'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/post.htm

var _ = require('lodash');
var jDataView = require('jDataView');

function tableSize(font, names) {
  var result = 36; // table header
  result += font.glyphs.length * 2; // name declarations
  _.forEach(names, function(name) {
    result += name.length;
  });
  result += (4 - result % 4) % 4; // length of a table must be a multiple of four bytes
  return result;
}

function pascalString(str) {
  var bytes = [];
  var len = str.length < 256 ? str.length : 255; //length in Pascal string is limited with 255
  bytes.push(len);
  for (var i = 0; i < len; i ++) {
    var char = str.charCodeAt(i);
    bytes.push(char < 128 ? char : 95); //non-ASCII characters are substituted with '_'
  }
  return bytes;
}

function createPostTable(font) {

  var names = _.map(font.glyphs, function (glyph) {
    return pascalString(glyph.name);
  });

  var bufSize = tableSize(font, names);
  var buf = new jDataView(bufSize);

  buf.writeInt32(0x20000); // formatType,  version 2.0
  buf.writeInt32(font.italicAngle); // italicAngle
  buf.writeInt16(font.underlinePosition); // underlinePosition
  buf.writeInt16(font.underlineThickness); // underlineThickness
  buf.writeUint32(font.isFixedPitch); // isFixedPitch
  buf.writeUint32(0); // minMemType42
  buf.writeUint32(0); // maxMemType42
  buf.writeUint32(0); // minMemType1
  buf.writeUint32(0); // maxMemType1
  buf.writeUint16(font.glyphs.length); // numberOfGlyphs

  // Array of glyph name indexes
  buf.writeUint16(0);//First element should be .notDef glyph
  var index = 259; //first index of custom glyph name
  var i;
  for (i = 1; i < font.glyphs.length; i++) {
    buf.writeUint16(index++);
  }

  // Array of glyph name indexes
  _.forEach(names, function (name) {
    buf.writeBytes(name);
  });

  // Fill left space with zeros
  while (buf.tell() < bufSize) {
    buf.writeUint8(0);
  }

  return buf;
}

module.exports = createPostTable;
