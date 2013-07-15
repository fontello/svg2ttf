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
  return result;
}

function pascalString(str) {
  var bytes = [];
  bytes.push(str.length);
  for (var i = 0; i < str.length; i ++) {
    var char = str.charCodeAt(i);
    bytes.push(char);
  }
  return bytes;
}

function createPostTable(font) {

  var names = _.map(font.glyphs, function (glyph) {
    return pascalString(glyph.name);
  });

  var buf = new jDataView(tableSize(font, names));

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

  return buf;
}

module.exports = createPostTable;
